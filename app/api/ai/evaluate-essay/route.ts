import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware-auth';
import { callGemini } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST /api/ai/evaluate-essay — AI evaluation of student essay answers against database key answers
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { pertanyaan, jawabanKunci, jawabanUser, pembahasan } = body;

    if (!pertanyaan || !jawabanKunci || !jawabanUser) {
      return NextResponse.json(
        { error: 'pertanyaan, jawabanKunci, dan jawabanUser wajib diisi.' },
        { status: 400 }
      );
    }

    const systemPrompt = `
Kamu adalah Penguji & Evaluator Brevet Pajak Indonesia yang SANGAT ADIL, CERDAS, dan RAMAH.
Tugasmu adalah menganalisis dan menilai jawaban esai dari siswa yang dijawab MENGGUNAKAN BAHASA MEREKA SENDIRI.

DATA EVALUASI:
- Pertanyaan Soal: "${pertanyaan}"
- Kunci Jawaban Referensi (Dari Database): "${jawabanKunci}"
- Pembahasan Tambahan: "${pembahasan || '-'}"
- Jawaban Siswa (Bahasa Sendiri): "${jawabanUser}"

INSTRUKSI EVALUASI:
1. Pahami bahwa siswa menjawab dengan kalimat/bahasa mereka sendiri. Tidak harus sama persis kata demi kata dengan database!
2. Periksa apakah jawaban siswa MENYENTUH & SESUAI dengan konsep inti, kata kunci, serta logika hukum/aturan perpajakan yang ada di Kunci Jawaban Database.
3. Tentukan Vonis Status:
   - "sesuai": Jawaban siswa benar, menyentuh konsep inti dengan tepat (skor 80 - 100).
   - "cukup": Jawaban siswa mendekati/sebagian benar tetapi ada poin penting yang terlewat (skor 50 - 79).
   - "kurang": Jawaban siswa kurang tepat, salah konsep, atau tidak menjawab inti pertanyaan (skor 0 - 49).
4. Berikan Analisis & Penjelasan Sangat Detail:
   - Jelaskan apa yang SUDAH BENAR & TEPAT dari jawaban siswa.
   - Jelaskan bagian apa yang PERLU DIPERBAIKI atau DILENGKAPI.
   - Jelaskan KONSEP & ATURAN RESMI secara ramah dan mudah dipahami.

Output WAJIB berupa JSON murni tanpa format markdown codeblock:
{
  "status": "sesuai",
  "skor": 90,
  "verdictText": "🟢 Tepat & Sesuai Konsep!",
  "apresiasi": "Jawaban Anda sudah dengan baik menjelaskan...",
  "perbaikan": "Akan lebih sempurna jika menambahkan poin tentang...",
  "penjelasanDetail": "Secara aturan perpajakan Indonesia..."
}
`;

    const result = await callGemini({
      systemPrompt,
      messages: [{ role: 'user', parts: [{ text: 'Silakan evaluasi jawaban esai saya.' }] }],
      maxOutputTokens: 2048,
      temperature: 0.2,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: 'Gagal melakukan analisis AI: ' + result.pesan },
        { status: 500 }
      );
    }

    // Try parsing JSON output
    let parsedResult;
    try {
      const cleanJson = result.teks.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    } catch {
      parsedResult = {
        status: 'cukup',
        skor: 75,
        verdictText: '🟡 Hasil Analisis AI',
        apresiasi: 'Jawaban Anda telah kami terima.',
        perbaikan: 'Periksa pembahasan resmi untuk detail lebih lengkap.',
        penjelasanDetail: result.teks,
      };
    }

    return NextResponse.json({
      ok: true,
      result: parsedResult,
    });
  } catch (err: unknown) {
    console.error('Error evaluating essay answer:', err);
    return NextResponse.json(
      { error: 'Gagal menganalisis jawaban esai: ' + String(err) },
      { status: 500 }
    );
  }
}
