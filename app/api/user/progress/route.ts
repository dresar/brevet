import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { moduleSectionsProgress } from '@/lib/schema';
import { requireAuth } from '@/lib/middleware-auth';
import { sectionProgressSchema, batchProgressSchema } from '@/lib/validations/progress';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/user/progress?moduleId=...
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const moduleId = req.nextUrl.searchParams.get('moduleId');

    if (moduleId) {
      const progress = await db
        .select()
        .from(moduleSectionsProgress)
        .where(
          and(
            eq(moduleSectionsProgress.userId, auth.id),
            eq(moduleSectionsProgress.moduleId, moduleId)
          )
        );

      const completedMap: Record<string, boolean> = {};
      progress.forEach((p) => {
        if (p.completed) completedMap[p.sectionId] = true;
      });

      return NextResponse.json({ ok: true, completedSections: completedMap });
    }

    // Get all user progress
    const allProgress = await db
      .select({
        moduleId: moduleSectionsProgress.moduleId,
        sectionId: moduleSectionsProgress.sectionId,
        completed: moduleSectionsProgress.completed,
      })
      .from(moduleSectionsProgress)
      .where(eq(moduleSectionsProgress.userId, auth.id));

    return NextResponse.json({ ok: true, progress: allProgress });
  } catch (err: any) {
    console.error('Error fetching user progress:', err);
    return NextResponse.json({ error: 'Gagal memuat progres pengguna.' }, { status: 500 });
  }
}

// POST /api/user/progress — toggle single section or batch with atomic upsert
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    // 1. Check single section schema
    const parsedSingle = sectionProgressSchema.safeParse(body);
    if (parsedSingle.success) {
      const { moduleId, sectionId, completed } = parsedSingle.data;

      await db
        .insert(moduleSectionsProgress)
        .values({
          userId: auth.id,
          moduleId,
          sectionId,
          completed,
        })
        .onConflictDoUpdate({
          target: [
            moduleSectionsProgress.userId,
            moduleSectionsProgress.moduleId,
            moduleSectionsProgress.sectionId,
          ],
          set: { completed, updatedAt: new Date() },
        });

      return NextResponse.json({ ok: true, sectionId, completed });
    }

    // 2. Check batch progress schema
    const parsedBatch = batchProgressSchema.safeParse(body);
    if (parsedBatch.success) {
      const { moduleId, completedSectionIds } = parsedBatch.data;

      for (const sectionId of completedSectionIds) {
        await db
          .insert(moduleSectionsProgress)
          .values({
            userId: auth.id,
            moduleId,
            sectionId,
            completed: true,
          })
          .onConflictDoUpdate({
            target: [
              moduleSectionsProgress.userId,
              moduleSectionsProgress.moduleId,
              moduleSectionsProgress.sectionId,
            ],
            set: { completed: true, updatedAt: new Date() },
          });
      }

      return NextResponse.json({ ok: true, moduleId, count: completedSectionIds.length });
    }

    const firstIssue = parsedSingle.error?.issues[0] || parsedBatch.error?.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message || 'Payload progres tidak valid.' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Error saving user progress:', err);
    return NextResponse.json({ error: 'Gagal menyimpan progres.' }, { status: 500 });
  }
}
