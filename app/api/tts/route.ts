import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware-auth';
import { fetchTtsWithRotation } from '@/lib/elevenlabs';

export const runtime = 'nodejs';
export const maxDuration = 60; // TTS might take a while

// POST /api/tts — Generate speech from text
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Teks tidak boleh kosong.' }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: 'Teks terlalu panjang (maksimal 5000 karakter).' }, { status: 400 });
    }

    const crypto = await import('crypto');
    const textHash = crypto.createHash('sha256').update(text).digest('hex');

    const { db } = await import('@/lib/db');
    const { ttsCache } = await import('@/lib/schema');
    const { eq } = await import('drizzle-orm');

    // 1. Cek di cache database
    const existing = await db
      .select()
      .from(ttsCache)
      .where(eq(ttsCache.textHash, textHash))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ audioUrl: existing[0].audioUrl });
    }

    // 2. Jika tidak ada, panggil ElevenLabs (menggunakan rotasi API Keys)
    const { audioBuffer } = await fetchTtsWithRotation(text);

    // 3. Upload buffer tersebut ke Cloudinary
    const { uploadToCloudinaryBuffer } = await import('@/lib/cloudinary-rotation');
    
    // Convert arraybuffer to buffer for upload
    const nodeBuffer = Buffer.from(audioBuffer);
    
    const result = await uploadToCloudinaryBuffer(nodeBuffer, {
      folder: 'brevet/tts',
      resource_type: 'video', // Audio uses video resource_type in Cloudinary
    });

    const secureUrl = result.secure_url;

    // 4. Simpan ke database
    await db.insert(ttsCache).values({
      textHash,
      audioUrl: secureUrl,
    });

    return NextResponse.json({ audioUrl: secureUrl });
  } catch (error: any) {
    console.error('[TTS API Error]', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memproses TTS.' },
      { status: 500 }
    );
  }
}
