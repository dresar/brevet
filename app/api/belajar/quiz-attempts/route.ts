import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userQuizAttempts, modules } from '@/lib/schema';
import { requireAuth } from '@/lib/middleware-auth';
import { quizAttemptSchema } from '@/lib/validations/quiz';
import { eq, and, desc } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/belajar/quiz-attempts — Get highest score for module
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const url = req.nextUrl;
  const moduleId = url.searchParams.get('moduleId');

  if (!moduleId) {
    return NextResponse.json({ error: 'moduleId wajib diisi.' }, { status: 400 });
  }

  try {
    const attempts = await db
      .select()
      .from(userQuizAttempts)
      .where(
        and(
          eq(userQuizAttempts.userId, auth.id),
          eq(userQuizAttempts.moduleId, moduleId)
        )
      )
      .orderBy(desc(userQuizAttempts.finalScore))
      .limit(1);

    return NextResponse.json({
      highestScore: attempts.length > 0 ? attempts[0].finalScore : null,
      lastAttempt: attempts.length > 0 ? attempts[0] : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memuat skor kuis: ' + err.message }, { status: 500 });
  }
}

// POST /api/belajar/quiz-attempts — Save a quiz attempt
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = quizAttemptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Data attempt kuis tidak valid.', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { moduleId, pgScore, essayScore, finalScore, answersJson, essayAnalysisJson } = parsed.data;

    const [inserted] = await db
      .insert(userQuizAttempts)
      .values({
        userId: auth.id,
        moduleId,
        pgScore,
        essayScore: essayScore || 0,
        finalScore,
        answersJson,
        essayAnalysisJson: essayAnalysisJson || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ ok: true, attempt: inserted });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal menyimpan hasil kuis: ' + err.message }, { status: 500 });
  }
}

// DELETE /api/belajar/quiz-attempts — Reset attempts for module
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const url = req.nextUrl;
  const moduleId = url.searchParams.get('moduleId');

  if (!moduleId) {
    return NextResponse.json({ error: 'moduleId wajib diisi.' }, { status: 400 });
  }

  try {
    await db
      .delete(userQuizAttempts)
      .where(
        and(
          eq(userQuizAttempts.userId, auth.id),
          eq(userQuizAttempts.moduleId, moduleId)
        )
      );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal mereset hasil kuis: ' + err.message }, { status: 500 });
  }
}
