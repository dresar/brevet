import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/middleware-auth';
import { db } from '@/lib/db';
import { modules } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { saveModuleToFile } from '@/lib/module-file-manager';
import type { Modul, KuisSoal } from '@/lib/module-types';

export const runtime = 'nodejs';

// GET /api/modules/[id]/quiz-perhitungan — Fetch calculation quiz questions for a module
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    const [mod] = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
    if (!mod) {
      return NextResponse.json({ error: 'Modul tidak ditemukan.' }, { status: 404 });
    }

    const content = mod.contentJson as Modul;
    const kuis = content?.modul?.kuis_perhitungan || {
      judul: `Latihan Perhitungan Pajak - ${mod.title}`,
      soal: [],
    };

    return NextResponse.json({
      moduleId: mod.id,
      moduleTitle: mod.title,
      moduleSlug: mod.slug,
      kuis,
      soal: kuis.soal || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal mengambil data kuis perhitungan: ' + err.message }, { status: 500 });
  }
}

// PUT /api/modules/[id]/quiz-perhitungan — Save calculation quiz questions for a module directly to DB & Disk
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await req.json();

    const soal: KuisSoal[] = body.soal || body.questions;
    const mode: 'replace' | 'append' = body.mode || 'replace';

    if (!Array.isArray(soal)) {
      return NextResponse.json({ error: 'Data "soal" harus berupa array JSON.' }, { status: 400 });
    }

    const [mod] = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
    if (!mod) {
      return NextResponse.json({ error: 'Modul tidak ditemukan.' }, { status: 404 });
    }

    const contentJson = structuredClone(mod.contentJson) as Modul;
    if (!contentJson.modul) {
      contentJson.modul = {
        kode: mod.code,
        slug: mod.slug,
        judul: mod.title,
        ringkasan: '',
        tujuan_belajar: [],
        url_audio: null,
        bagian: [],
        kuis_perhitungan: {
          judul: `Latihan Perhitungan Pajak - ${mod.title}`,
          soal: [],
        },
      };
    }

    if (!contentJson.modul.kuis_perhitungan) {
      contentJson.modul.kuis_perhitungan = {
        judul: `Latihan Perhitungan Pajak - ${mod.title}`,
        soal: [],
      };
    }

    let finalSoal: KuisSoal[] = [];
    if (mode === 'append') {
      finalSoal = [...(contentJson.modul.kuis_perhitungan.soal || []), ...soal];
    } else {
      finalSoal = soal;
    }

    contentJson.modul.kuis_perhitungan.soal = finalSoal;

    // 1. Update Neon Postgres Database
    await db
      .update(modules)
      .set({
        contentJson: contentJson as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(modules.id, id));

    // 2. Save to local disk JSON file data/modules/[slug].json
    saveModuleToFile(mod.slug, contentJson);

    return NextResponse.json({
      ok: true,
      message: `Berhasil menyimpan ${finalSoal.length} soal kuis perhitungan ke database!`,
      totalQuestions: finalSoal.length,
      moduleTitle: mod.title,
    });
  } catch (err: any) {
    console.error('Error updating quiz perhitungan endpoint:', err);
    return NextResponse.json({ error: 'Gagal menyimpan data kuis perhitungan: ' + err.message }, { status: 500 });
  }
}
