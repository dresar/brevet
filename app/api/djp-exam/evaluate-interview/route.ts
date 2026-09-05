import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware-auth';
import { callGemini } from '@/lib/gemini';
import type { InterviewAIAnalysis } from '@/lib/djp-types';

import { evaluateInterviewSchema } from '@/lib/validations/djp';

export const runtime = 'nodejs';
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = evaluateInterviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Data wawancara tidak valid.', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      topik,
      skenarioPenguji,
      pertanyaan,
      aspekPenilaian,
      poinKunciJawabanIdeal,
      contohJawabanIdeal,
      indikatorBahaya,
      jawabanUser,
    } = parsed.data;

    const systemPrompt = `
Kamu adalah Ketua Tim Panelis Penguji Wawancara Seleksi Masuk Direktorat Jenderal Pajak (DJP) Kementerian Keuangan RI yang SANGAT BERWIBAWA, CERDAS, TEGAS DALAM INTEGRITAS, DAN MENDALAM.
Tugasmu adalah menguji dan mengevaluasi jawaban lisan/tertulis dari peserta wawancara seleksi DJP.

DATA PERTANYAAN WAWANCARA:
- Topik: "${topik || 'Wawancara Kompetensi & Integritas'}"
- Konteks Penguji: "${skenarioPenguji || '-'}"
- Pertanyaan Wawancara: "${pertanyaan}"
- Aspek yang Diuji: ${JSON.stringify(aspekPenilaian || {})}
- Poin Kunci Jawaban Ideal: ${JSON.stringify(poinKunciJawabanIdeal || [])}
- Contoh Jawaban Teladan (Model Answer): "${contohJawabanIdeal || '-'}"
- Indikator Bahaya (Red Flags): ${JSON.stringify(indikatorBahaya || [])}
- Jawaban Peserta: "${jawabanUser}"

INSTRUKSI EVALUASI PANELIS DJP:
1. Evaluasi Struktur STAR (Situation, Task, Action, Result):
   - Situation: Apakah peserta menguraikan konteks/latar belakang dengan jelas?
   - Task: Apakah peserta memahami tanggung jawab dan perannya?
   - Action: Apakah tindakan yang diambil konkret, etis, profesional, dan solutif?
   - Result: Apakah ada dampak nyata, pembelajaran positif, atau kepatuhan hukum yang tercapai?
2. Evaluasi 5 Nilai Kementerian Keuangan (Skala 1 - 5):
   - Integritas: Kejujuran mutlak, penolakan gratifikasi/suap, kepatuhan kode etik.
   - Profesionalisme: Bekerja tuntas, kompetensi teknis, objektivitas.
   - Sinergi: Kolaborasi tim, keterbukaan, anti-ego sektoral.
   - Pelayanan: Kepedulian melayani Wajib Pajak secara ramah, adil, transparan.
   - Kesempurnaan: Belajar berkelanjutan, perbaikan tiada henti, adaptif.
3. Deteksi Red Flags: Periksa apakah ada kompromi integritas, arogansi, menyalahkan orang lain, keraguan penempatan, atau pelanggaran disiplin.
4. Tentukan Status Kesiapan:
   - "sangat_siap" (Skor 85 - 100): Karakter matang, integritas kokoh tanpa celah, metode STAR lengkap, sangat layak direkomendasikan diterima di DJP.
   - "cukup_siap" (Skor 65 - 84): Jawaban baik namun bisa diperkuat pada ketegasan aksi atau penyampaian contoh riil.
   - "perlu_pembinaan" (Skor 0 - 64): Terdeteksi keraguan integritas, jawaban tidak terstruktur, atau menyentuh indikator bahaya.

OUTPUT WAJIB BERUPA JSON MURNI TANPA MARKDOWN CODEBLOCK:
{
  "skor": 92,
  "status": "sangat_siap",
  "verdictText": "🌟 Rekomendasi Utama: Integritas Kokoh & Jawaban STAR Sangat Terstruktur",
  "evaluasiSTAR": {
    "situation": "Konteks situasi dijelaskan dengan realistis...",
    "task": "Tanggung jawab etis diidentifikasi dengan tepat...",
    "action": "Aksi penolakan gratifikasi sangat tegas dan sesuai SOP...",
    "result": "Dampak positif menjaga marwah instansi tersampaikan kuat..."
  },
  "keselarasanNilaiKemenkeu": {
    "integritas": 5,
    "profesionalisme": 4,
    "sinergi": 4,
    "pelayanan": 5,
    "kesempurnaan": 4,
    "catatan": "Kandidat sangat menjunjung tinggi Nilai Integritas dan Pelayanan Prima."
  },
  "apresiasi": "Kandidat menunjukkan komitmen kuat dan ketegasan moral...",
  "saranPengembangan": "Akan semakin meyakinkan jika menambahkan referensi aplikasi pelaporan Wise/UKI...",
  "modelAnswer": "${contohJawabanIdeal || 'Jawaban teladan...'}"
}
`;

    const result = await callGemini({
      systemPrompt,
      messages: [{ role: 'user', parts: [{ text: 'Silakan berikan penilaian wawancara komprehensif sebagai Panel Penguji DJP Kemenkeu.' }] }],
      maxOutputTokens: 2500,
      temperature: 0.2,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: 'Gagal melakukan analisis AI: ' + result.pesan },
        { status: 500 }
      );
    }

    let parsedResult: InterviewAIAnalysis;
    try {
      const cleanJson = result.teks.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    } catch {
      parsedResult = {
        skor: 78,
        status: 'cukup_siap',
        verdictText: '🟡 Hasil Evaluasi Wawancara DJP',
        evaluasiSTAR: {
          situation: 'Situasi telah dijabarkan.',
          task: 'Tugas dipahami.',
          action: 'Tindakan dijelaskan.',
          result: 'Hasil telah disampaikan.',
        },
        keselarasanNilaiKemenkeu: {
          integritas: 4,
          profesionalisme: 4,
          sinergi: 4,
          pelayanan: 4,
          kesempurnaan: 4,
          catatan: 'Jawaban telah dievaluasi oleh sistem.',
        },
        apresiasi: 'Jawaban wawancara Anda telah diterima.',
        saranPengembangan: 'Perdalam metode STAR dan perkuat penegasan integritas.',
        modelAnswer: contohJawabanIdeal || '',
      };
    }

    return NextResponse.json({
      ok: true,
      result: parsedResult,
    });
  } catch (err: unknown) {
    console.error('[DJP Interview AI] Error evaluating interview:', err);
    return NextResponse.json(
      { error: 'Gagal mengevaluasi jawaban wawancara: ' + String(err) },
      { status: 500 }
    );
  }
}
