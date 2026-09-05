import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { modules } from '@/lib/schema';
import { requireAdmin } from '@/lib/middleware-auth';
import { eq, or } from 'drizzle-orm';
import type { Modul } from '@/lib/module-types';
import { saveModuleToFile } from '@/lib/module-file-manager';

export const runtime = 'nodejs';

// POST /api/modules/update-image — Update / Save / Remove section image URL in database
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { moduleSlug, moduleId, sectionId, imageId, urlGambar } = body;

    if ((!moduleSlug && !moduleId) || !sectionId) {
      return NextResponse.json(
        { error: 'moduleSlug/moduleId dan sectionId wajib diisi.' },
        { status: 400 }
      );
    }

    // Find target module
    const conditions = [];
    if (moduleId) conditions.push(eq(modules.id, moduleId));
    if (moduleSlug) conditions.push(eq(modules.slug, moduleSlug));

    const [targetModul] = await db
      .select()
      .from(modules)
      .where(or(...conditions))
      .limit(1);

    if (!targetModul) {
      return NextResponse.json(
        { error: 'Modul tidak ditemukan.' },
        { status: 404 }
      );
    }

    const content = targetModul.contentJson as Modul;
    if (!content?.modul?.bagian) {
      return NextResponse.json(
        { error: 'Struktur modul tidak valid.' },
        { status: 400 }
      );
    }

    // Locate section and update prompt_gambar
    let updated = false;
    content.modul.bagian = content.modul.bagian.map((bagian) => {
      if (bagian.id === sectionId) {
        if (!bagian.prompt_gambar || bagian.prompt_gambar.length === 0) {
          // If prompt_gambar array doesn't exist, initialize
          bagian.prompt_gambar = [
            {
              id: imageId || `img-${Date.now()}`,
              prompt: 'Custom illustration',
              keterangan: 'Gambar ilustrasi modul',
              alt: 'Gambar modul',
              url_gambar: urlGambar ?? null,
            },
          ];
          updated = true;
        } else {
          bagian.prompt_gambar = bagian.prompt_gambar.map((img, index) => {
            // Match specific imageId or update first image if imageId not matched
            if (img.id === imageId || (!imageId && index === 0)) {
              updated = true;
              return {
                ...img,
                url_gambar: urlGambar ? String(urlGambar).trim() : null,
              };
            }
            return img;
          });
        }
      }
      return bagian;
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Bagian atau gambar tidak ditemukan di modul.' },
        { status: 404 }
      );
    }

    // Save back to DB
    await db
      .update(modules)
      .set({
        contentJson: content,
        updatedAt: new Date(),
      })
      .where(eq(modules.id, targetModul.id));

    // Also sync to data/modules/[slug].json on disk so disk file stays up to date
    if (targetModul.slug) {
      try {
        saveModuleToFile(targetModul.slug, content);
      } catch (fileErr) {
        console.warn(`[UpdateImage] Failed to sync file data/modules/${targetModul.slug}.json:`, fileErr);
      }
    }

    return NextResponse.json({
      success: true,
      urlGambar: urlGambar ?? null,
      message: urlGambar
        ? 'Gambar berhasil disimpan ke database!'
        : 'Gambar berhasil dihapus dari database.',
    });
  } catch (err: unknown) {
    console.error('Error updating module image:', err);
    return NextResponse.json(
      { error: 'Gagal memperbarui gambar modul: ' + String(err) },
      { status: 500 }
    );
  }
}
