import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware-auth';
import { buildPrompt, buildPromptStage1, buildPromptStage2, buildPromptFull, listAllModul, getModulMeta } from '@/lib/templates/super-prompts';
import { findModuleJsonByKode } from '@/lib/module-file-manager';

export const runtime = 'nodejs';

async function handlePromptResponse(kode: string, stage: '1' | '2' | 'full', stage1Output?: string) {
  const modulInfo = getModulMeta(kode);
  let effectiveStage1Output = stage1Output;
  let autoLoadedFileName: string | undefined;

  // If stage 2 and no stage1Output provided, attempt auto-load from data/modules or root .json
  if (!effectiveStage1Output || effectiveStage1Output.trim().length === 0) {
    const savedMatch = findModuleJsonByKode(kode);
    if (savedMatch) {
      effectiveStage1Output = savedMatch.jsonString;
      autoLoadedFileName = savedMatch.fileName;
    }
  }

  const teksStage1 = buildPromptStage1(kode);
  const teksStage2 = buildPromptStage2(kode, effectiveStage1Output);
  const teksFull = buildPromptFull(kode);
  const teks = buildPrompt(kode, stage, effectiveStage1Output);

  return {
    teks,
    teksStage1,
    teksStage2,
    teksFull,
    stage,
    kode: kode || 'BRVT-AB-XX',
    judul: modulInfo?.judul ?? 'Materi Brevet AB',
    kategori: modulInfo?.kategori ?? 'Dasar',
    kesulitan: modulInfo?.kesulitan ?? 'pemula',
    menit: modulInfo?.menit ?? 60,
    daftarModul: listAllModul(),
    autoLoadedJson: effectiveStage1Output,
    autoLoadedFileName,
  };
}

// GET /api/prompts?modul=KODE&stage=1|2|full&stage1Output=...
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const kode = req.nextUrl.searchParams.get('modul') ?? '';
  const stage = (req.nextUrl.searchParams.get('stage') ?? '1') as '1' | '2' | 'full';
  const stage1Output = req.nextUrl.searchParams.get('stage1Output') ?? undefined;

  const data = await handlePromptResponse(kode, stage, stage1Output);
  return NextResponse.json(data);
}

// POST /api/prompts — support large stage1Output JSON payloads
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const kode = body.modul ?? '';
    const stage = (body.stage ?? '1') as '1' | '2' | 'full';
    const stage1Output = body.stage1Output ?? undefined;

    const data = await handlePromptResponse(kode, stage, stage1Output);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 });
  }
}
