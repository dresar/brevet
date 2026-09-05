import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { modules } from '@/lib/schema';
import { requireAdmin } from '@/lib/middleware-auth';
import { eq } from 'drizzle-orm';
import type { Modul } from '@/lib/module-types';

export const runtime = 'nodejs';

// POST /api/modules/[id]/duplicate — duplicate module
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const [original] = await db
    .select()
    .from(modules)
    .where(eq(modules.id, id))
    .limit(1);

  if (!original) {
    return NextResponse.json({ error: 'Modul tidak ditemukan.' }, { status: 404 });
  }

  // Create a deep copy of the content JSON with modified code/slug
  const originalContent = original.contentJson as Modul;
  const newCode = `${originalContent.modul.kode}-copy`;
  const newSlug = `${originalContent.modul.slug}-copy`;

  const newContent: Modul = {
    ...originalContent,
    modul: {
      ...originalContent.modul,
      kode: newCode,
      slug: newSlug,
      judul: `${originalContent.modul.judul} (Salinan)`,
    },
  };

  const [newModule] = await db
    .insert(modules)
    .values({
      code: newCode,
      slug: newSlug,
      title: `${original.title} (Salinan)`,
      category: original.category,
      difficulty: original.difficulty,
      estimatedMinutes: original.estimatedMinutes,
      status: 'draft', // always draft
      contentJson: newContent,
      orderIndex: original.orderIndex,
    })
    .returning({ id: modules.id });

  return NextResponse.json({ ok: true, id: newModule.id });
}
