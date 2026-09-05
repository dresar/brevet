import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { moduleSectionsProgress, modules } from '@/lib/schema';
import { requireAuth } from '@/lib/middleware-auth';
import { toggleProgressSchema } from '@/lib/validators';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';

// POST /api/belajar/progress — upsert section progress
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = toggleProgressSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Data tidak valid', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { moduleId, sectionId, completed } = parsed.data;

  // Verify module exists
  const [modul] = await db
    .select({ id: modules.id })
    .from(modules)
    .where(eq(modules.id, moduleId))
    .limit(1);

  if (!modul) {
    return NextResponse.json({ error: 'Modul tidak ditemukan.' }, { status: 404 });
  }

  // Upsert progress
  await db
    .insert(moduleSectionsProgress)
    .values({
      userId: auth.id,
      moduleId,
      sectionId,
      completed,
    })
    .onConflictDoUpdate({
      target: [moduleSectionsProgress.userId, moduleSectionsProgress.moduleId, moduleSectionsProgress.sectionId],
      set: { completed, updatedAt: new Date() },
    });

  return NextResponse.json({ ok: true, sectionId, completed });
}
