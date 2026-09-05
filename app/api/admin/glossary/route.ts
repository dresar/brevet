import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/middleware-auth';
import { db } from '@/lib/db';
import { modules, glossary } from '@/lib/schema';
import { eq, ilike, and, inArray, desc } from 'drizzle-orm';
import { saveModuleToFile } from '@/lib/module-file-manager';
import type { Modul } from '@/lib/module-types';

export const runtime = 'nodejs';

export interface GlossaryItemInput {
  kata: string;
  definisi: string;
  penjelasanSederhana?: string;
  contoh?: string;
}

// Helper to sync updated glossary array into modules.contentJson
async function syncGlossaryToModuleContent(moduleSlug: string) {
  try {
    const [mod] = await db.select().from(modules).where(eq(modules.slug, moduleSlug)).limit(1);
    if (!mod || !mod.contentJson) return;

    const allTerms = await db
      .select()
      .from(glossary)
      .where(eq(glossary.moduleSlug, moduleSlug));

    const contentJson = structuredClone(mod.contentJson) as Modul;
    if (contentJson.modul) {
      contentJson.modul.glosarium = allTerms.map((t) => ({
        kata: t.kata,
        definisi: t.definisi,
        penjelasan_sederhana: t.penjelasanSederhana || undefined,
        contoh: t.contoh || undefined,
      }));

      await db
        .update(modules)
        .set({
          contentJson: contentJson as unknown as Record<string, unknown>,
          updatedAt: new Date(),
        })
        .where(eq(modules.id, mod.id));

      saveModuleToFile(moduleSlug, contentJson);
    }
  } catch (err) {
    console.error(`Error syncing module content json for ${moduleSlug}:`, err);
  }
}

// GET /api/admin/glossary — List terms with optional search & module filter
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const url = req.nextUrl;
    const moduleId = url.searchParams.get('moduleId');
    const moduleSlug = url.searchParams.get('moduleSlug');
    const q = url.searchParams.get('q');

    const conditions = [];
    if (moduleId) conditions.push(eq(glossary.moduleId, moduleId));
    if (moduleSlug) conditions.push(eq(glossary.moduleSlug, moduleSlug));
    if (q) conditions.push(ilike(glossary.kata, `%${q}%`));

    const rows = await db
      .select()
      .from(glossary)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(glossary.kata);

    const allMods = await db
      .select({ id: modules.id, code: modules.code, title: modules.title, slug: modules.slug })
      .from(modules)
      .orderBy(modules.orderIndex);

    return NextResponse.json({
      glossary: rows,
      total: rows.length,
      modules: allMods,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal mengambil glosarium: ' + err.message }, { status: 500 });
  }
}

// POST /api/admin/glossary — Create term or Batch import JSON
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    // Case 1: Batch import JSON for a module
    if (body.items || body.glosarium) {
      const targetModuleId = body.moduleId;
      const targetModuleSlug = body.moduleSlug;
      const mode: 'replace' | 'append' = body.mode || 'replace';
      const rawItems: any[] = body.items || body.glosarium;

      if (!targetModuleSlug) {
        return NextResponse.json({ error: 'moduleSlug wajib diisi untuk import batch.' }, { status: 400 });
      }

      if (!Array.isArray(rawItems)) {
        return NextResponse.json({ error: 'Property "glosarium" / "items" harus berupa array JSON.' }, { status: 400 });
      }

      // Find module ID if missing
      let modId = targetModuleId;
      if (!modId) {
        const [found] = await db.select().from(modules).where(eq(modules.slug, targetModuleSlug)).limit(1);
        if (found) modId = found.id;
      }

      // If mode === 'replace', clear existing glossary for this module
      if (mode === 'replace') {
        await db.delete(glossary).where(eq(glossary.moduleSlug, targetModuleSlug));
      }

      let insertedCount = 0;
      for (const item of rawItems) {
        const kata = item.kata || item.term;
        const definisi = item.definisi || item.definition;
        const penjelasanSederhana = item.penjelasan_sederhana || item.penjelasanSederhana || item.simple;
        const contoh = item.contoh || item.example;

        if (kata && definisi) {
          await db.insert(glossary).values({
            moduleId: modId || null,
            moduleSlug: targetModuleSlug,
            kata: String(kata).trim(),
            definisi: String(definisi).trim(),
            penjelasanSederhana: penjelasanSederhana ? String(penjelasanSederhana).trim() : null,
            contoh: contoh ? String(contoh).trim() : null,
          });
          insertedCount++;
        }
      }

      // Sync back to module contentJson
      await syncGlossaryToModuleContent(targetModuleSlug);

      return NextResponse.json({
        ok: true,
        message: `Berhasil mengimpor ${insertedCount} istilah glosarium ke database!`,
        count: insertedCount,
      });
    }

    // Case 2: Single item creation
    const { moduleId, moduleSlug, kata, definisi, penjelasanSederhana, contoh } = body;
    if (!moduleSlug || !kata || !definisi) {
      return NextResponse.json({ error: 'moduleSlug, kata, dan definisi wajib diisi.' }, { status: 400 });
    }

    const [created] = await db
      .insert(glossary)
      .values({
        moduleId: moduleId || null,
        moduleSlug,
        kata: kata.trim(),
        definisi: definisi.trim(),
        penjelasanSederhana: penjelasanSederhana ? penjelasanSederhana.trim() : null,
        contoh: contoh ? contoh.trim() : null,
      })
      .returning();

    await syncGlossaryToModuleContent(moduleSlug);

    return NextResponse.json({ ok: true, item: created });
  } catch (err: any) {
    console.error('Error in POST /api/admin/glossary:', err);
    return NextResponse.json({ error: 'Gagal membuat istilah glosarium: ' + err.message }, { status: 500 });
  }
}

// PUT /api/admin/glossary — Edit existing item
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id, kata, definisi, penjelasanSederhana, contoh } = await req.json();

    if (!id || !kata || !definisi) {
      return NextResponse.json({ error: 'id, kata, dan definisi wajib diisi.' }, { status: 400 });
    }

    const [updated] = await db
      .update(glossary)
      .set({
        kata: kata.trim(),
        definisi: definisi.trim(),
        penjelasanSederhana: penjelasanSederhana ? penjelasanSederhana.trim() : null,
        contoh: contoh ? contoh.trim() : null,
        updatedAt: new Date(),
      })
      .where(eq(glossary.id, id))
      .returning();

    if (updated?.moduleSlug) {
      await syncGlossaryToModuleContent(updated.moduleSlug);
    }

    return NextResponse.json({ ok: true, item: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal mengubah istilah glosarium: ' + err.message }, { status: 500 });
  }
}

// DELETE /api/admin/glossary — Delete single item or bulk items
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const url = req.nextUrl;
    const id = url.searchParams.get('id');
    const body = req.headers.get('content-type')?.includes('application/json')
      ? await req.json().catch(() => ({}))
      : {};

    const ids: string[] = body.ids || (id ? [id] : []);

    if (!ids.length) {
      return NextResponse.json({ error: 'ID istilah yang akan dihapus wajib ditentukan.' }, { status: 400 });
    }

    // Get moduleSlug before deletion for sync
    const targetItems = await db.select().from(glossary).where(inArray(glossary.id, ids));
    const slugsToSync = new Set(targetItems.map((t) => t.moduleSlug));

    await db.delete(glossary).where(inArray(glossary.id, ids));

    for (const slug of slugsToSync) {
      await syncGlossaryToModuleContent(slug);
    }

    return NextResponse.json({ ok: true, message: `Berhasil menghapus ${ids.length} istilah glosarium.` });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal menghapus glosarium: ' + err.message }, { status: 500 });
  }
}
