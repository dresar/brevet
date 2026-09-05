import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tiktokPrompts } from '@/lib/schema';
import { requireAuth, requireAdmin } from '@/lib/middleware-auth';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/ai/tiktok-prompts/db?slug=...
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const slug = req.nextUrl.searchParams.get('slug');

  try {
    if (slug) {
      const [row] = await db
        .select()
        .from(tiktokPrompts)
        .where(eq(tiktokPrompts.moduleSlug, slug))
        .limit(1);

      return NextResponse.json({
        found: !!row,
        prompt: row || null,
      });
    }

    const rows = await db
      .select()
      .from(tiktokPrompts)
      .orderBy(tiktokPrompts.updatedAt);

    return NextResponse.json({
      prompts: rows,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengambil data database' }, { status: 500 });
  }
}

// POST /api/ai/tiktok-prompts/db — save or upsert prompt suite
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { moduleSlug, moduleTitle, promptsJson } = body;

    if (!moduleSlug || !promptsJson) {
      return NextResponse.json({ error: 'moduleSlug dan promptsJson wajib diisi' }, { status: 400 });
    }

    const [saved] = await db
      .insert(tiktokPrompts)
      .values({
        moduleSlug,
        moduleTitle: moduleTitle || 'Modul Perpajakan',
        promptsJson,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: tiktokPrompts.moduleSlug,
        set: {
          moduleTitle: moduleTitle || 'Modul Perpajakan',
          promptsJson,
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json({ success: true, saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menyimpan ke database' }, { status: 500 });
  }
}

// DELETE /api/ai/tiktok-prompts/db?slug=...
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const slug = req.nextUrl.searchParams.get('slug');

  try {
    if (slug === 'all') {
      await db.delete(tiktokPrompts);
      return NextResponse.json({ success: true, message: 'Semua data tiktok_prompts berhasil direset dari database' });
    }

    if (!slug) {
      return NextResponse.json({ error: 'Param slug wajib diisi' }, { status: 400 });
    }

    await db.delete(tiktokPrompts).where(eq(tiktokPrompts.moduleSlug, slug));
    return NextResponse.json({ success: true, message: `Data tiktok_prompts untuk ${slug} berhasil dihapus dari database` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menghapus dari database' }, { status: 500 });
  }
}
