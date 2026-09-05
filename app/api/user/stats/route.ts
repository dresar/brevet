import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, modules, moduleSectionsProgress, userQuizAttempts, djpExamAttempts } from '@/lib/schema';
import { requireAuth } from '@/lib/middleware-auth';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    // 1. Total modules in system
    const allModules = await db
      .select({
        id: modules.id,
        slug: modules.slug,
        title: modules.title,
        code: modules.code,
        category: modules.category,
        contentJson: modules.contentJson,
      })
      .from(modules)
      .where(eq(modules.status, 'tayang'));

    let totalSectionsCount = 0;
    allModules.forEach((m) => {
      const content = m.contentJson as any;
      const bagian = content?.modul?.bagian || [];
      totalSectionsCount += Array.isArray(bagian) ? bagian.length : 0;
    });
    if (totalSectionsCount === 0) totalSectionsCount = 50;

    // 2. User completed sections
    const userProgressList = await db
      .select()
      .from(moduleSectionsProgress)
      .where(
        and(
          eq(moduleSectionsProgress.userId, auth.id),
          eq(moduleSectionsProgress.completed, true)
        )
      );

    // 3. User Quiz Attempts
    const quizList = await db
      .select()
      .from(userQuizAttempts)
      .where(eq(userQuizAttempts.userId, auth.id));

    // 4. User DJP Exam Attempts
    const djpList = await db
      .select()
      .from(djpExamAttempts)
      .where(eq(djpExamAttempts.userId, auth.id));

    const totalCompletedSections = userProgressList.length;
    const totalQuizTaken = quizList.length;
    const avgQuizScore = quizList.length > 0
      ? Math.round(quizList.reduce((acc, q) => acc + q.finalScore, 0) / quizList.length)
      : 0;

    const quizPassedCount = quizList.filter((q) => q.finalScore >= 70).length;
    const quizPassRate = quizList.length > 0
      ? Math.round((quizPassedCount / quizList.length) * 100)
      : 0;

    const highestDjpScore = djpList.length > 0
      ? Math.max(...djpList.map((d) => d.finalScore))
      : 0;

    const djpPassedCount = djpList.filter((d) => d.finalScore >= 75 || d.isPassed).length;
    const djpPassRate = djpList.length > 0
      ? Math.round((djpPassedCount / djpList.length) * 100)
      : 0;

    // 5. Calculate Study Streak
    const allActivityTimestamps: string[] = [
      ...userProgressList.map((p) => p.updatedAt?.toISOString()).filter(Boolean) as string[],
      ...quizList.map((q) => q.createdAt?.toISOString()).filter(Boolean) as string[],
      ...djpList.map((d) => d.createdAt?.toISOString()).filter(Boolean) as string[],
    ];

    const uniqueDates = Array.from(
      new Set(
        allActivityTimestamps
          .map((d) => {
            const date = new Date(d);
            return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
          })
          .filter(Boolean) as string[]
      )
    ).sort().reverse();

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const latestDate = uniqueDates[0];
    const isActiveToday = latestDate === todayStr;

    let streakDays = 0;
    if (latestDate === todayStr || latestDate === yesterdayStr) {
      let expectedDate = new Date(latestDate);
      for (const dStr of uniqueDates) {
        const currDate = new Date(dStr);
        const diffDays = Math.round((expectedDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 0) {
          streakDays++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 6. Generate 30-day activity map
    const activityMap: { date: string; count: number; active: boolean }[] = [];
    const dateCounts: Record<string, number> = {};
    allActivityTimestamps.forEach((ts) => {
      const d = ts.split('T')[0];
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    });

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const count = dateCounts[dStr] || 0;
      activityMap.push({
        date: dStr,
        count,
        active: count > 0,
      });
    }

    // 7. Domain Category Proficiency (KUP, PPh OP, PPh Badan, Potput, PPN, Coretax)
    // Compute dynamic scores based on quiz scores & completed sections
    const defaultBaseline = totalCompletedSections > 0 ? Math.min(60, 20 + totalCompletedSections * 5) : 0;
    const categoryProficiency = {
      kup: Math.min(100, Math.max(avgQuizScore > 0 ? avgQuizScore : defaultBaseline, defaultBaseline)),
      pph_op: Math.min(100, Math.max(avgQuizScore > 0 ? Math.round(avgQuizScore * 0.95) : defaultBaseline, defaultBaseline)),
      pph_badan: Math.min(100, Math.max(avgQuizScore > 0 ? Math.round(avgQuizScore * 0.9) : defaultBaseline, defaultBaseline)),
      potput: Math.min(100, Math.max(avgQuizScore > 0 ? Math.round(avgQuizScore * 1.0) : defaultBaseline, defaultBaseline)),
      ppn: Math.min(100, Math.max(avgQuizScore > 0 ? Math.round(avgQuizScore * 0.92) : defaultBaseline, defaultBaseline)),
      coretax: Math.min(100, Math.max(highestDjpScore > 0 ? highestDjpScore : defaultBaseline, defaultBaseline)),
    };

    return NextResponse.json({
      ok: true,
      user: {
        id: auth.id,
        email: auth.email,
        fullName: auth.fullName,
        role: auth.role,
      },
      stats: {
        totalModules: allModules.length,
        totalSections: totalSectionsCount,
        totalCompletedSections,
        totalQuizTaken,
        avgQuizScore,
        quizPassRate,
        quizPassedCount,
        totalDjpExams: djpList.length,
        highestDjpScore,
        djpPassRate,
        djpPassedCount,
        streakDays,
        isActiveToday,
        categoryProficiency,
        activityHistory: activityMap,
      },
      recentQuiz: quizList.slice(0, 5),
      recentDjp: djpList.slice(0, 5),
    });
  } catch (err: any) {
    console.error('Error fetching user stats:', err);
    return NextResponse.json({ error: 'Gagal memuat data analitik pengguna.' }, { status: 500 });
  }
}
