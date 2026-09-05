import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { modules, moduleSectionsProgress } from '@/lib/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { getModuleFromFile, findModuleJsonByKode, restoreModulesFromDbToDisk } from '@/lib/module-file-manager';
import type { Modul } from '@/lib/module-types';

export const runtime = 'nodejs';

// GET /api/belajar/[slug] — get module content from DB or disk file + user progress (public/guest allowed)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Ensure disk files are backed up from DB if missing
  await restoreModulesFromDbToDisk().catch(console.error);

  const user = await getCurrentUser(req);
  const { slug } = await params;

  // Find module by slug in DB
  const [modul] = await db
    .select()
    .from(modules)
    .where(eq(modules.slug, slug))
    .limit(1);

  // Fallback if not in DB, check disk file
  const fileMatch = findModuleJsonByKode('', slug);
  const fileContent = getModuleFromFile(slug) ?? fileMatch?.modul;

  if (!modul && !fileContent) {
    return NextResponse.json(
      { error: 'Modul tidak ditemukan atau belum tersedia.' },
      { status: 404 }
    );
  }

  // Virtual modul fallback
  const activeModul = modul ?? {
    id: `mod-${fileMatch?.modul?.modul?.kode || 'BRVT-AB-01'}`,
    slug,
    title: fileContent?.modul?.judul || 'Ketentuan Umum Perpajakan (KUP)',
    code: fileContent?.modul?.kode || 'BRVT-AB-01',
    category: fileContent?.modul?.kategori || 'Dasar',
    difficulty: fileContent?.modul?.tingkat_kesulitan || 'pemula',
    estimatedMinutes: fileContent?.modul?.estimasi_menit || 120,
    contentJson: fileContent as unknown as Record<string, unknown>,
    status: 'tayang',
  };

  // Get user progress (if authenticated)
  const progressRows = user
    ? await db
        .select()
        .from(moduleSectionsProgress)
        .where(
          and(
            eq(moduleSectionsProgress.userId, user.id),
            eq(moduleSectionsProgress.moduleId, activeModul.id)
          )
        )
    : [];

  // Build completion map: { sectionId -> bool }
  const completionMap: Record<string, boolean> = {};
  for (const row of progressRows) {
    completionMap[row.sectionId] = row.completed ?? false;
  }

  // Primary source of truth is DB contentJson, fallback to disk file
  const dbContent = activeModul.contentJson as Modul | null;
  const content = dbContent ?? fileContent;

  const totalBagian = content?.modul?.bagian?.length ?? 0;
  const completedBagian = Object.values(completionMap).filter(Boolean).length;

  return NextResponse.json({
    modul: {
      id: activeModul.id,
      slug: activeModul.slug,
      title: activeModul.title,
      code: activeModul.code,
      category: activeModul.category,
      difficulty: activeModul.difficulty,
      estimatedMinutes: activeModul.estimatedMinutes,
    },
    content,
    progress: {
      completionMap,
      totalBagian,
      completedBagian,
      persen: totalBagian > 0 ? Math.round((completedBagian / totalBagian) * 100) : 0,
    },
  });
}
