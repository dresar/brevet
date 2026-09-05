import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { djpExamAttempts } from '@/lib/schema';
import { requireAuth } from '@/lib/middleware-auth';
import { djpAttemptSchema } from '@/lib/validations/djp';
import { eq, desc } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/user/djp-attempts
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const attempts = await db
      .select()
      .from(djpExamAttempts)
      .where(eq(djpExamAttempts.userId, auth.id))
      .orderBy(desc(djpExamAttempts.createdAt));

    return NextResponse.json({ ok: true, attempts });
  } catch (err: any) {
    console.error('Error fetching DJP attempts:', err);
    return NextResponse.json({ error: 'Gagal memuat riwayat ujian DJP.' }, { status: 500 });
  }
}

// POST /api/user/djp-attempts
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = djpAttemptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Data simulasi DJP tidak valid.' },
        { status: 400 }
      );
    }

    const {
      mode,
      tkbScore,
      essayScore,
      interviewScore,
      finalScore,
      isPassed,
      answersJson,
      essayAnalysisJson,
      interviewAnalysisJson,
    } = parsed.data;

    const [saved] = await db
      .insert(djpExamAttempts)
      .values({
        userId: auth.id,
        mode,
        tkbScore,
        essayScore,
        interviewScore,
        finalScore,
        isPassed,
        answersJson,
        essayAnalysisJson: essayAnalysisJson || {},
        interviewAnalysisJson: interviewAnalysisJson || {},
      })
      .returning();

    return NextResponse.json({
      ok: true,
      message: 'Hasil simulasi ujian DJP berhasil disimpan!',
      attemptId: saved.id,
      finalScore: saved.finalScore,
      isPassed: saved.isPassed,
    });
  } catch (err: any) {
    console.error('Error saving DJP attempt:', err);
    return NextResponse.json({ error: 'Gagal menyimpan riwayat ujian DJP.' }, { status: 500 });
  }
}
