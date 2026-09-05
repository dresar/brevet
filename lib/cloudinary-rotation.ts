import { v2 as cloudinary, UploadApiOptions, ResourceOptions, ConfigOptions } from 'cloudinary';
import { db } from './db';
import { apiKeys } from './schema';
import { eq, and, asc, sql } from 'drizzle-orm';

const MAX_FAILOVER_ATTEMPTS = 5;

interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

/**
 * Gets the active Cloudinary keys from the database, falling back to process.env if none exist.
 */
export async function getCloudinaryKeys(): Promise<(CloudinaryConfig & { id?: string })[]> {
  const activeKeys = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.status, 'active'), eq(apiKeys.provider, 'cloudinary')))
    .orderBy(asc(apiKeys.orderIndex));

  if (activeKeys.length > 0) {
    return activeKeys.map(k => {
      try {
        const parsed = JSON.parse(k.keyValue);
        return { ...parsed, id: k.id };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  }

  // Fallback to env
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    return [{
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    }];
  }

  throw new Error('Tidak ada akun Cloudinary yang dikonfigurasi (DB atau ENV).');
}

/**
 * Execute a cloudinary operation with automatic rotation/failover.
 * The operation function receives the specific config object to pass to Cloudinary methods.
 */
/**
 * Execute a cloudinary operation with automatic rotation/failover.
 * The operation function receives the specific config object to pass to Cloudinary methods.
 */
export async function withCloudinaryRotation<T>(
  operation: (config: ConfigOptions) => Promise<T>,
  specificKeyId?: string
): Promise<T> {
  const keys = await getCloudinaryKeys();
  const testedKeys = new Set<string>();
  
  if (specificKeyId) {
    const candidate = keys.find(k => k.id === specificKeyId);
    if (candidate) {
      try {
        return await operation({
          cloud_name: candidate.cloud_name,
          api_key: candidate.api_key,
          api_secret: candidate.api_secret,
        });
      } catch (error: any) {
        throw new Error(`Upload gagal dengan akun yang dipilih: ${error.message}`);
      }
    } else {
      throw new Error('Akun Cloudinary yang dipilih tidak ditemukan atau tidak valid.');
    }
  }

  for (let i = 0; i < MAX_FAILOVER_ATTEMPTS; i++) {
    const candidate = keys.find(k => k.id ? !testedKeys.has(k.id) : true) || keys[0];
    if (candidate.id) testedKeys.add(candidate.id);

    try {
      const result = await operation({
        cloud_name: candidate.cloud_name,
        api_key: candidate.api_key,
        api_secret: candidate.api_secret,
      });
      return result;
    } catch (error: any) {
      console.warn(`[Cloudinary Failover] Gagal dengan akun ${candidate.cloud_name}: ${error.message || 'Unknown error'}`);
      
      // If it's the env fallback, just throw immediately since there's no failover
      if (!candidate.id) throw error;

      // Mark as error in DB
      try {
        const [maxResult] = await db
          .select({ maxOrder: sql<number>`COALESCE(MAX(${apiKeys.orderIndex}), -1)` })
          .from(apiKeys);
          
        await db.update(apiKeys).set({
          status: 'error',
          lastError: error.message || 'Upload gagal',
          orderIndex: 9999 + i, // move to back
          errorCount: 1, // simplify error counting
          updatedAt: new Date()
        }).where(eq(apiKeys.id, candidate.id));
      } catch (e) {
        // ignore db error
      }
    }
  }

  throw new Error('Semua akun Cloudinary (termasuk failover) gagal dieksekusi.');
}

/**
 * Helper to upload a buffer to Cloudinary using rotation.
 */
export async function uploadToCloudinaryBuffer(
  buffer: Buffer,
  options: { folder: string; resource_type: 'image' | 'video' | 'auto'; use_filename?: boolean; unique_filename?: boolean },
  specificKeyId?: string
) {
  return withCloudinaryRotation(async (config) => {
    return new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { ...options, ...config },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
  }, specificKeyId);
}
