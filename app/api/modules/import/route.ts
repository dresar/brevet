import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { modules } from '@/lib/schema';
import { requireAdmin } from '@/lib/middleware-auth';
import { importModuleSchema } from '@/lib/validators';
import { validateModuleJson } from '@/lib/json-utils';
import { saveModuleToFile } from '@/lib/module-file-manager';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// POST /api/modules/import — validate JSON then save to file + DB
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = importModuleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parameter tidak valid', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { jsonText, mode, targetId } = parsed.data;

  // Step 1: Validate JSON
  const validation = validateModuleJson(jsonText);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: 'JSON tidak valid',
        kind: validation.kind,
        ...(validation.kind === 'syntax'
          ? { line: validation.line, column: validation.column, message: validation.message }
          : { issues: validation.issues }),
      },
      { status: 400 }
    );
  }

  // Step 2: Extract data from validated JSON
  const { modul } = validation.data;

  // Save to file system inside data/modules/[slug].json
  try {
    saveModuleToFile(modul.slug, validation.data);
  } catch (err) {
    console.error('[Import API] Warning: Failed to write module file to disk:', err);
  }

  // Step 3: Save to Database
  if (mode === 'baru') {
    // Check for duplicate code/slug
    const [existing] = await db
      .select({ id: modules.id })
      .from(modules)
      .where(eq(modules.code, modul.kode))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        {
          error: `Modul dengan kode "${modul.kode}" sudah ada. Gunakan mode "timpa" untuk menggantinya.`,
          existingId: existing.id,
        },
        { status: 409 }
      );
    }

    const [newModule] = await db
      .insert(modules)
      .values({
        code: modul.kode,
        slug: modul.slug,
        title: modul.judul,
        category: modul.kategori,
        difficulty: modul.tingkat_kesulitan ?? 'pemula',
        estimatedMinutes: modul.estimasi_menit,
        status: 'draft',
        contentJson: validation.data,
        orderIndex: 0,
      })
      .returning({ id: modules.id });

    return NextResponse.json({ ok: true, id: newModule.id, mode: 'baru' });

  } else {
    // mode === 'timpa'
    if (!targetId) {
      return NextResponse.json(
        { error: 'targetId diperlukan untuk mode timpa.' },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(modules)
      .set({
        code: modul.kode,
        slug: modul.slug,
        title: modul.judul,
        category: modul.kategori,
        difficulty: modul.tingkat_kesulitan ?? 'pemula',
        estimatedMinutes: modul.estimasi_menit,
        contentJson: validation.data,
        updatedAt: new Date(),
      })
      .where(eq(modules.id, targetId))
      .returning({ id: modules.id });

    if (!updated) {
      return NextResponse.json(
        { error: 'Modul target tidak ditemukan untuk ditimpa.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, id: updated.id, mode: 'timpa' });
  }
}
