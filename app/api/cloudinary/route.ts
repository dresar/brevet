import { type NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/middleware-auth';

export const runtime = 'nodejs';

// GET /api/cloudinary?type=image|video|all&folder=&next_cursor=&search=
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'all'; // 'image' | 'video' | 'all'
  const folder = searchParams.get('folder') ?? '';
  const nextCursor = searchParams.get('next_cursor') ?? undefined;
  const search = searchParams.get('search') ?? '';

  try {
    const { db } = await import('@/lib/db');
    const { apiKeys } = await import('@/lib/schema');
    const { eq } = await import('drizzle-orm');
    
    const keyId = searchParams.get('keyId');
    let cloudinaryConfig: any = null;

    if (keyId) {
      const specificKey = await db.query.apiKeys.findFirst({
        where: eq(apiKeys.id, keyId)
      });
      if (specificKey && specificKey.provider === 'cloudinary') {
        try {
          cloudinaryConfig = JSON.parse(specificKey.keyValue);
        } catch (e) {
          throw new Error('Kredensial Cloudinary untuk akun ini rusak. Silakan perbarui di menu Manajemen Kunci API.');
        }
      }
    }

    if (!cloudinaryConfig) {
      const { getCloudinaryKeys } = await import('@/lib/cloudinary-rotation');
      const keys = await getCloudinaryKeys();
      cloudinaryConfig = keys[0];
    }
    
    cloudinary.config(cloudinaryConfig);
    
    // Build Cloudinary search expression
    let expression = '';
    if (type === 'image') expression += 'resource_type:image';
    else if (type === 'video') expression += 'resource_type:video';
    else expression += '(resource_type:image OR resource_type:video)';

    if (folder) expression += ` AND folder=${folder}`;
    if (search) expression += ` AND filename:*${search}*`;

    // Instead of using the global SDK which can have race conditions or caching issues,
    // we use standard fetch to the Cloudinary Admin API for search.
    const searchUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/resources/search`;
    
    const searchBody = {
      expression,
      sort_by: [{ created_at: 'desc' }],
      max_results: 30,
      next_cursor: nextCursor ?? undefined,
      with_field: ['tags', 'context'],
    };

    const authHeader = 'Basic ' + Buffer.from(`${cloudinaryConfig.api_key}:${cloudinaryConfig.api_secret}`).toString('base64');

    const cloudinaryRes = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(searchBody),
    });

    if (!cloudinaryRes.ok) {
      const errData = await cloudinaryRes.text();
      throw new Error(`Cloudinary API Error: ${errData}`);
    }

    const result = await cloudinaryRes.json();

    const resources = result.resources.map((r: any) => ({
      ...r,
      // Shorten CDN URL by removing the /v123456789/ version segment
      secure_url: r.secure_url.replace(/\/v\d+\//, '/')
    }));

    return NextResponse.json({
      resources,
      next_cursor: result.next_cursor ?? null,
      total_count: result.total_count,
      active_cloud: cloudinaryConfig.cloud_name,
    });
  } catch (err: any) {
    console.error('[Cloudinary GET]', err);
    return NextResponse.json(
      { error: err.message || 'Gagal mengambil data dari Cloudinary.' },
      { status: 500 }
    );
  }
}

// DELETE /api/cloudinary?public_id=xxx&resource_type=image|video
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const publicId = searchParams.get('public_id');
  const resourceType = (searchParams.get('resource_type') ?? 'image') as 'image' | 'video';
  const deleteAll = searchParams.get('delete_all') === 'true';

  try {
    const { db } = await import('@/lib/db');
    const { apiKeys } = await import('@/lib/schema');
    const { eq } = await import('drizzle-orm');
    
    const keyId = searchParams.get('keyId');
    let cloudinaryConfig: any = null;

    if (keyId) {
      const specificKey = await db.query.apiKeys.findFirst({
        where: eq(apiKeys.id, keyId)
      });
      if (specificKey && specificKey.provider === 'cloudinary') {
        try {
          cloudinaryConfig = JSON.parse(specificKey.keyValue);
        } catch (e) {
          throw new Error('Kredensial Cloudinary untuk akun ini rusak. Silakan perbarui di menu Manajemen Kunci API.');
        }
      }
    }

    if (!cloudinaryConfig) {
      const { getCloudinaryKeys } = await import('@/lib/cloudinary-rotation');
      const keys = await getCloudinaryKeys();
      cloudinaryConfig = keys[0];
    }
    
    cloudinary.config(cloudinaryConfig);
    
    if (deleteAll) {
      await cloudinary.api.delete_all_resources({ resource_type: 'image', ...cloudinaryConfig });
      await cloudinary.api.delete_all_resources({ resource_type: 'video', ...cloudinaryConfig });
      return NextResponse.json({ ok: true, message: 'Semua media berhasil dihapus.' });
    }

    if (!publicId) {
      return NextResponse.json({ error: 'public_id wajib diisi.' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      ...cloudinaryConfig,
    });

    if (result.result !== 'ok') {
      return NextResponse.json({ error: `Cloudinary: ${result.result}` }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Cloudinary DELETE]', err);
    return NextResponse.json({ error: err.message || 'Gagal menghapus aset.' }, { status: 500 });
  }
}
