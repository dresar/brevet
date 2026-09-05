import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware-auth';
import { callGemini } from '@/lib/gemini';
import type { EssayAIAnalysis } from '@/lib/djp-types';

import { evaluateEssaySchema } from '@/lib/validations/djp';

export const runtime = 'nodejs';
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = evaluateEssaySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Data esai tidak valid.', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      judulKasus,
      skenario,
      pertanyaan,
      jawabanKunci,
      rubrikPoinPenting,
      jawabanUser,
      landasanHukum,
    } = parsed.data;

    const systemPrompt = `
Kamu adalah Penguji & Evaluator Ujian Seleksi Ahli Pajak / Fungsional Pemeriksa DJP Kementerian Keuangan RI yang SANGAT KOMPETEN, OBJEKTIF, KRITIS, namun MEMBANGUN.
Tugasmu adalah memeriksa dan menilai jawaban studi kasus esai perpajakan dari calon pegawai DJP.

DATA KASUS & SOAL:
- Judul Kasus: "${judulKasus || 'Studi Kasus Pajak'}"
- Skenario Kasus: "${skenario || '-'}"
- Pertanyaan Ujian: "${pertanyaan}"
- Landasan Hukum Utama: "${landasanHukum || '-'}"
- Kunci Jawaban Referensi: "${jawabanKunci}"
- Rubrik Poin Penting yang Harus Disentuh: ${JSON.stringify(rubrikPoinPenting || [])}
- Jawaban Peserta Ujian: "${jawabanUser}"

KRITERIA PENILAIAN SELEKSI DJP:
1. Pemahaman Konsep & Logika Fiskal (Bobot 40%): Ketepatan analisis, akurasi perhitungan angka/tarif, identifikasi objek/subjek pajak.
2. Landasan Hukum & Regulasi (Bobot 30%): Ketepatan penyebutan undang-undang (UU KUP, UU PPh, UU PPN, UU HPP, PMK, PP) dan prinsip hukum (misal: Arm's Length Principle, Substance Over Form, dll).
3. Ketajaman Argumen & Rekomendasi Solusi (Bobot 30%): Sistematika berpikir aparatur DJP, ketegasan penegakan aturan, kejelasan rekomendasi tindakan fiskus.

SKORING:
- Skor 85 - 100 ("sesuai"): Jawaban sangat tajam, menyentuh seluruh poin penting rubrik, landasan hukum tepat, perhitungan akurat.
- Skor 60 - 84 ("cukup"): Jawaban menyentuh sebagian besar konsep inti namun kurang detail pada dasar hukum atau ada perhitungan yang kurang presisi.
- Skor 0 - 59 ("kurang"): Salah konsep, tidak menyentuh rubrik inti, atau salah dalam penafsiran hukum perpajakan.

FORMAT OUTPUT WAJIB BERUPA JSON MURNI TANPA MARKDOWN CODEBLOCK:
{
  "skor": 88,
  "status": "sesuai",
  "verdictText": "🟢 Analisis Kasus Tajam & Tepat Sasaran",
  "apresiasi": "Peserta berhasil mengidentifikasi koreksi fiskal positif...",
  "perbaikan": "Akan lebih sempurna bila menambahkan referensi PMK nomor...",
  "penjelasanDetail": "Secara yuridis berdasarkan UU PPh jo. UU HPP...",
  "analisisPoinHukum": [
    "✅ Poin 1: Koreksi fiskal diidentifikasi dengan benar",
    "⚠️ Poin 2: Dasar hukum PMK belum disebutkan secara eksplisit"
  ]
}
`;

    const result = await callGemini({
      systemPrompt,
      messages: [{ role: 'user', parts: [{ text: 'Silakan berikan evaluasi mendalam atas jawaban esai studi kasus seleksi DJP ini.' }] }],
      maxOutputTokens: 2500,
      temperature: 0.2,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: 'Gagal melakukan analisis AI: ' + result.pesan },
        { status: 500 }
      );
    }

    let parsedResult: EssayAIAnalysis;
    try {
      const cleanJson = result.teks.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    } catch {
      parsedResult = {
        skor: 75,
        status: 'cukup',
        verdictText: '🟡 Hasil Analisis AI Penguji DJP',
        apresiasi: 'Jawaban Anda telah dianalisis.',
        perbaikan: 'Periksa pembahasan resmi dan rubrik hukum terkait.',
        penjelasanDetail: result.teks,
        analisisPoinHukum: ['Evaluasi jawaban tercatat dalam sistem.'],
      };
    }

    return NextResponse.json({
      ok: true,
      result: parsedResult,
    });
  } catch (err: unknown) {
    console.error('[DJP Essay AI] Error evaluating essay:', err);
    return NextResponse.json(
      { error: 'Gagal mengevaluasi jawaban esai: ' + String(err) },
      { status: 500 }
    );
  }
}
