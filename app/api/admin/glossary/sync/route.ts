import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware-auth';
import { db } from '@/lib/db';
import { modules, glossary } from '@/lib/schema';
import { eq, ilike, and } from 'drizzle-orm';
import type { Modul } from '@/lib/module-types';

export const runtime = 'nodejs';

/**
 * POST /api/admin/glossary/sync — Extract & sync glossary items from contentJson of all modules into 'glossary' DB table
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const allModules = await db.select().from(modules);
    let totalExtracted = 0;
    let totalInserted = 0;

    for (const mod of allModules) {
      if (!mod.contentJson) continue;

      const content = mod.contentJson as Modul;
      const termsToInsert: {
        moduleId: string;
        moduleSlug: string;
        kata: string;
        definisi: string;
        penjelasanSederhana?: string;
        contoh?: string;
      }[] = [];

      // 1. Extract from modul.glosarium
      if (content.modul?.glosarium && Array.isArray(content.modul.glosarium)) {
        for (const item of content.modul.glosarium) {
          if (item.kata && item.definisi) {
            termsToInsert.push({
              moduleId: mod.id,
              moduleSlug: mod.slug,
              kata: item.kata.trim(),
              definisi: item.definisi.trim(),
              penjelasanSederhana: item.penjelasan_sederhana?.trim(),
              contoh: (item as any).contoh?.trim(),
            });
          }
        }
      }

      // 2. Extract from modul.bagian[].istilah
      if (content.modul?.bagian && Array.isArray(content.modul.bagian)) {
        for (const b of content.modul.bagian) {
          if (b.istilah && Array.isArray(b.istilah)) {
            for (const ist of b.istilah) {
              if (ist.kata && ist.definisi) {
                // Check duplicate within same module list
                const existsInBatch = termsToInsert.some(
                  (t) => t.kata.toLowerCase() === ist.kata.trim().toLowerCase()
                );
                if (!existsInBatch) {
                  termsToInsert.push({
                    moduleId: mod.id,
                    moduleSlug: mod.slug,
                    kata: ist.kata.trim(),
                    definisi: ist.definisi.trim(),
                    penjelasanSederhana: undefined,
                    contoh: ist.contoh?.trim(),
                  });
                }
              }
            }
          }
        }
      }

      totalExtracted += termsToInsert.length;

      // Insert terms into DB if not existing
      for (const t of termsToInsert) {
        const [existing] = await db
          .select()
          .from(glossary)
          .where(
            and(
              eq(glossary.moduleSlug, t.moduleSlug),
              ilike(glossary.kata, t.kata)
            )
          )
          .limit(1);

        if (!existing) {
          await db.insert(glossary).values({
            moduleId: t.moduleId,
            moduleSlug: t.moduleSlug,
            kata: t.kata,
            definisi: t.definisi,
            penjelasanSederhana: t.penjelasanSederhana || null,
            contoh: t.contoh || null,
          });
          totalInserted++;
        }
      }
    }

    const totalInDb = await db.select().from(glossary);

    return NextResponse.json({
      ok: true,
      message: `Berhasil mengekstrak ${totalExtracted} istilah dari ${allModules.length} modul. ${totalInserted} istilah baru ditambahkan ke database!`,
      totalExtracted,
      totalInserted,
      totalInDb: totalInDb.length,
    });
  } catch (err: any) {
    console.error('Error syncing glossary:', err);
    return NextResponse.json({ error: 'Gagal sinkronisasi glosarium: ' + err.message }, { status: 500 });
  }
}
