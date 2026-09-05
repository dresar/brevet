import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userQuizAttempts, modules } from '@/lib/schema';
import { requireAuth } from '@/lib/middleware-auth';
import { quizAttemptSchema } from '@/lib/validations/quiz';
import { eq, desc, and } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/user/quiz-attempts?moduleId=...
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const moduleId = req.nextUrl.searchParams.get('moduleId');

    let query = db
      .select({
        id: userQuizAttempts.id,
        moduleId: userQuizAttempts.moduleId,
        moduleTitle: modules.title,
        moduleSlug: modules.slug,
        pgScore: userQuizAttempts.pgScore,
        essayScore: userQuizAttempts.essayScore,
        finalScore: userQuizAttempts.finalScore,
        createdAt: userQuizAttempts.createdAt,
      })
      .from(userQuizAttempts)
      .leftJoin(modules, eq(userQuizAttempts.moduleId, modules.id))
      .where(
        moduleId
          ? and(
              eq(userQuizAttempts.userId, auth.id),
              eq(userQuizAttempts.moduleId, moduleId)
            )
          : eq(userQuizAttempts.userId, auth.id)
      )
      .orderBy(desc(userQuizAttempts.createdAt));

    const attempts = await query;
    const highestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.finalScore)) : null;

    return NextResponse.json({ ok: true, attempts, highestScore });
  } catch (err: any) {
    console.error('Error fetching quiz attempts:', err);
    return NextResponse.json({ error: 'Gagal memuat riwayat kuis.' }, { status: 500 });
  }
}

// POST /api/user/quiz-attempts
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = quizAttemptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Data kuis tidak valid.' },
        { status: 400 }
      );
    }

    const { moduleId, pgScore, essayScore, finalScore, answersJson, essayAnalysisJson } = parsed.data;

    const [savedAttempt] = await db
      .insert(userQuizAttempts)
      .values({
        userId: auth.id,
        moduleId,
        pgScore,
        essayScore: essayScore || 0,
        finalScore,
        answersJson,
        essayAnalysisJson: essayAnalysisJson || {},
      })
      .returning();

    return NextResponse.json({
      ok: true,
      message: 'Hasil kuis berhasil disimpan ke riwayat akun!',
      attemptId: savedAttempt.id,
      finalScore: savedAttempt.finalScore,
    });
  } catch (err: any) {
    console.error('Error saving quiz attempt:', err);
    return NextResponse.json({ error: 'Gagal menyimpan hasil kuis.' }, { status: 500 });
  }
}
