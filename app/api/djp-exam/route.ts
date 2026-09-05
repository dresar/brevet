import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { DJPExamBank, DJPSoal } from '@/lib/djp-types';

export const runtime = 'nodejs';

function loadExamData(): DJPExamBank {
  const filePath = path.join(process.cwd(), 'data', 'ujian-djp', 'simulasi-seleksi-djp-100.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

// GET /api/djp-exam?mode=all-100|tkb-50|esai-25|wawancara-25
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const mode = url.searchParams.get('mode') || 'all-100';
    const examData = loadExamData();

    let filteredSoal: DJPSoal[] = examData.soal;

    if (mode === 'tkb-50') {
      filteredSoal = examData.soal.filter(s => s.tipe === 'pilihan_ganda');
    } else if (mode === 'esai-25') {
      filteredSoal = examData.soal.filter(s => s.tipe === 'esai_kasus');
    } else if (mode === 'wawancara-25') {
      filteredSoal = examData.soal.filter(s => s.tipe === 'wawancara');
    }

    return NextResponse.json({
      ok: true,
      judul: examData.judul,
      deskripsi: examData.deskripsi,
      versi: examData.versi,
      totalSoal: filteredSoal.length,
      mode,
      breakdown: examData.breakdown,
      passingGrade: examData.passingGrade,
      soal: filteredSoal,
    });
  } catch (err: unknown) {
    console.error('[DJP Exam API] Error reading exam questions:', err);
    return NextResponse.json(
      { error: 'Gagal memuat bank soal ujian DJP: ' + String(err) },
      { status: 500 }
    );
  }
}
