import { type NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/middleware-auth';
import { uploadToCloudinaryBuffer } from '@/lib/cloudinary-rotation';

export const runtime = 'nodejs';

// POST /api/cloudinary/upload
// Body: FormData with field "file" (File) and optional "folder" (string)
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;



  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || '';
    const keyId = (formData.get('keyId') as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamic resource_type
    let resource_type: 'image' | 'video' | 'auto' = 'auto';
    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      resource_type = 'video';
    } else if (file.type.startsWith('image/')) {
      resource_type = 'image';
    }

    const result = await uploadToCloudinaryBuffer(buffer, {
      folder,
      resource_type,
      use_filename: true,
      unique_filename: true,
    }, keyId);

    return NextResponse.json({
      ok: true,
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    });
  } catch (err: any) {
    console.error('[Cloudinary Upload]', err);
    return NextResponse.json({ error: err.message || 'Gagal upload ke Cloudinary.' }, { status: 500 });
  }
}
