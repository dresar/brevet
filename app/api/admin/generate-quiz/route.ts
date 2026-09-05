import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware-auth';
import { db } from '@/lib/db';
import { modules } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { callGemini } from '@/lib/gemini';
import type { Modul } from '@/lib/module-types';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60s for AI generation

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { moduleId, type, batchIndex } = await req.json();

    if (!moduleId || !type || typeof batchIndex !== 'number') {
      return NextResponse.json({ error: 'moduleId, type, dan batchIndex wajib diisi.' }, { status: 400 });
    }

    if (type !== 'pilihan_ganda' && type !== 'esai') {
      return NextResponse.json({ error: 'Tipe soal hanya boleh pilihan_ganda atau esai.' }, { status: 400 });
    }

    // Retrieve module content
    const [mod] = await db.select().from(modules).where(eq(modules.id, moduleId)).limit(1);
    if (!mod) {
      return NextResponse.json({ error: 'Modul tidak ditemukan.' }, { status: 404 });
    }

    const content = mod.contentJson as Modul;
    const partsText = content.modul.bagian.map((b) => {
      return `Bagian: ${b.judul}\n${b.paragraf.join('\n')}\n${b.poin_penting?.join('\n') || ''}`;
    }).join('\n\n');

    const totalQuestionsRequested = 20;
    const startNum = batchIndex * 20 + 1;

    let promptInstructions = '';
    if (type === 'pilihan_ganda') {
      promptInstructions = `
Buatlah tepat ${totalQuestionsRequested} soal pilihan ganda perpajakan Indonesia berdasarkan materi modul di atas.
Ini adalah kumpulan soal batch ke-${batchIndex + 1} (Soal nomor ${startNum} sampai ${startNum + 19}).

Aturan Soal Pilihan Ganda:
1. "id": Harus berupa string unik (misal: "q-pg-${batchIndex}-${startNum + 0}", "q-pg-${batchIndex}-${startNum + 1}", dst).
2. "pertanyaan": Tulis pertanyaan yang menantang, mendalam, dan relevan dengan materi modul.
3. "tipe": Harus bernilai "pilihan_ganda".
4. "pilihan": Harus berupa array string dengan tepat 4 pilihan (A, B, C, D) yang terformat rapi. Contoh: ["A. Pilihan satu", "B. Pilihan dua", "C. Pilihan tiga", "D. Pilihan empat"].
5. "jawaban": Harus berupa string satu huruf kapital penanda kunci jawaban yang benar (misal: "A", "B", "C", atau "D").
6. "pembahasan": Tulis pembahasan yang mendalam, ramah, edukatif, dan menjelaskan mengapa jawaban tersebut benar serta mengapa pilihan lainnya salah.
`;
    } else {
      promptInstructions = `
Buatlah tepat ${totalQuestionsRequested} soal esai (essay) perpajakan Indonesia berdasarkan materi modul di atas.
Ini adalah kumpulan soal batch ke-${batchIndex + 1} (Soal nomor ${startNum} sampai ${startNum + 19}).

Aturan Soal Esai:
1. "id": Harus berupa string unik (misal: "q-essay-${batchIndex}-${startNum + 0}", dst).
2. "pertanyaan": Tulis pertanyaan terbuka/analitis yang membutuhkan penjelasan konsep, perhitungan, atau analisis aturan perpajakan resmi Indonesia.
3. "tipe": Harus bernilai "esai".
4. "pilihan": Harus bernilai null.
5. "jawaban": Tulis kunci jawaban referensi yang SANGAT DETAIL, LENGKAP, DAN AKURAT sebagai panduan penilaian.
6. "pembahasan": Tulis pembahasan tambahan atau tips praktis terkait konsep/peraturan resmi perpajakan tersebut.
`;
    }

    const systemPrompt = `
Kamu adalah Pakar & Evaluator Pajak Indonesia sekaligus pembuat soal ujian sertifikasi Brevet Pajak profesional.
Tugasmu adalah menghasilkan soal-soal berkualitas tinggi, bebas kesalahan konsep, dan mendalam.

Konteks Modul Pembelajaran:
Judul: ${mod.title}
Kode: ${mod.code}

Materi Modul:
${partsText.slice(0, 15000)} // Safe limit context length

${promptInstructions}

PENTING:
- Output WAJIB berupa JSON array murni berisi tepat ${totalQuestionsRequested} objek soal, tanpa tambahan teks pengantar atau format markdown codeblock.
- Semua kunci JSON harus berupa: "id", "pertanyaan", "tipe", "pilihan", "jawaban", "pembahasan".
- JANGAN GUNAKAN KUTIP GANDA MENTAH DI DALAM NILAI STRING. Gunakan single quote (') atau escape menjadi \\" jika harus memakai kutip ganda di dalam teks.
- Pastikan valid JSON parseable.
`;

    const result = await callGemini({
      systemPrompt,
      messages: [{ role: 'user', parts: [{ text: `Tolong buatkan 20 soal ${type} untuk modul ${mod.title}` }] }],
      maxOutputTokens: 8192,
      temperature: 0.5,
    });

    if (!result.ok) {
      return NextResponse.json({ error: 'Gagal generate soal dari Gemini: ' + result.pesan }, { status: 500 });
    }

    let rawText = result.teks.trim();
    // Clean up codeblocks if any
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    rawText = rawText.trim();

    let questions;
    try {
      questions = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse JSON from Gemini:', rawText, parseErr);
      return NextResponse.json({ 
        error: 'Output AI bukan JSON valid. Silakan coba generate ulang.',
        raw: rawText
      }, { status: 500 });
    }

    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: 'Output AI harus berupa array JSON.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, questions });
  } catch (err: any) {
    console.error('Error generating quiz:', err);
    return NextResponse.json({ error: 'Gagal membuat soal: ' + err.message }, { status: 500 });
  }
}
