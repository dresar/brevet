import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { modules, moduleSectionsProgress } from '@/lib/schema';
import { requireAuth } from '@/lib/middleware-auth';
import { eq, ilike, and, sql } from 'drizzle-orm';
import type { Modul } from '@/lib/module-types';
import { restoreModulesFromDbToDisk } from '@/lib/module-file-manager';

export const runtime = 'nodejs';

// GET /api/modules — list modules with optional filters + progress
export async function GET(req: NextRequest) {
  // Trigger backup restore in background (non-blocking for fast response)
  restoreModulesFromDbToDisk().catch(console.error);

  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const url = req.nextUrl;
  const status = url.searchParams.get('status');
  const q = url.searchParams.get('q');
  const kategori = url.searchParams.get('kategori');
  const simple = url.searchParams.get('simple');

  // Fast path for simple dropdown/list queries (<5ms)
  if (simple === 'true') {
    const simpleRows = await db
      .select({
        id: modules.id,
        code: modules.code,
        slug: modules.slug,
        title: modules.title,
        category: modules.category,
      })
      .from(modules)
      .orderBy(modules.orderIndex, modules.createdAt);

    return NextResponse.json({
      modules: simpleRows.map((r) => ({
        ...r,
        progressPercent: 0,
        completedCount: 0,
        totalCount: 0,
      })),
    });
  }

  // Build where conditions
  const conditions = [];
  if (status) conditions.push(eq(modules.status, status));
  if (kategori) conditions.push(eq(modules.category, kategori));
  if (q) conditions.push(ilike(modules.title, `%${q}%`));

  const rows = await db
    .select({
      id: modules.id,
      code: modules.code,
      slug: modules.slug,
      title: modules.title,
      category: modules.category,
      difficulty: modules.difficulty,
      estimatedMinutes: modules.estimatedMinutes,
      status: modules.status,
      orderIndex: modules.orderIndex,
      contentJson: modules.contentJson,
      createdAt: modules.createdAt,
      updatedAt: modules.updatedAt,
    })
    .from(modules)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(modules.orderIndex, modules.createdAt);

  // Calculate progress for each module against actual total sections in contentJson
  const userId = auth.id;
  const progressData = await db
    .select({
      moduleId: moduleSectionsProgress.moduleId,
      completedCount: sql<number>`COUNT(CASE WHEN ${moduleSectionsProgress.completed} THEN 1 END)`,
    })
    .from(moduleSectionsProgress)
    .where(eq(moduleSectionsProgress.userId, userId))
    .groupBy(moduleSectionsProgress.moduleId);

  const completedMap = new Map(
    progressData.map((p) => [p.moduleId, Number(p.completedCount)])
  );

  const result = rows.map((m) => {
    let totalCount = 0;
    if (m.contentJson) {
      const parsed = m.contentJson as Modul;
      totalCount = parsed.modul?.bagian?.length ?? 0;
    }

    const completedCount = completedMap.get(m.id) ?? 0;
    const progressPercent = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

    return {
      ...m,
      progressPercent,
      completedCount,
      totalCount,
    };
  });

  return NextResponse.json({ modules: result });
}
