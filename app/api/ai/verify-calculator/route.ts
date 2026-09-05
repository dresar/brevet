import { type NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { namaKalkulator, inputData, hasilData, rumus } = body;

    if (!namaKalkulator || !inputData || !hasilData) {
      return NextResponse.json(
        { ok: false, pesan: 'Data kalkulator tidak lengkap.' },
        { status: 400 }
      );
    }

    const inputListStr = Object.entries(inputData)
      .map(([k, v]) => `• ${k}: ${v}`)
      .join('\n');

    const hasilListStr = Object.entries(hasilData)
      .map(([k, v]) => `• ${k}: ${v}`)
      .join('\n');

    const promptUser = `
Halo Kak AI! Tolong verifikasi dan bedah secara mendalam perhitungan pajak ini ya:

📌 NAMA KALKULATOR: ${namaKalkulator}

📥 DATA INPUT YANG DIMASUKKAN:
${inputListStr}

📊 HASIL PERHITUNGAN SAAT INI:
${hasilListStr}

${rumus ? `📐 RUMUS YANG DIGUNAKAN:\n${rumus}\n` : ''}

TUGAS UTAMA KAMU:
1. Periksa apakah matematika perkalian, pengurangan, dan tarifnya 100% tepat.
2. Buatkan penjelasan yang WAJIB PANJANG, SANGAT RINCI dan STEP-BY-STEP.
3. Gunakan bahasa SUPER NON-FORMAL, SANTAI, ASYIK, dengan gaya penjelasan ala ANAK SD / PEMULA TOTAL (pakai analogi sehari-hari seperti uang jajan, beli permen di warung, patungan kas kelas, dsb).
4. Berikan landasan hukum resmi perpajakan Indonesia (UU HPP, PMK, PP terkait).
5. Berikan tips praktis yang bermanfaat.
`;

    const systemPrompt = `
Kamu adalah "Kak AI Pajak" — sahabat pintar belajar pajak Brevet AB yang super seru, asyik, gaul, dan jago banget menjelaskan hal rumit jadi segampang anak SD belajar uang jajan!

INSTRUKSI PENTING:
1. GAYA BAHASA:
   - Wajib super santai, akrab, non-formal, menyenangkan, dan ramah pemula (pakai panggilan seperti "Halo Sobat Pajak!", "Yuk kita bedah bareng!", "Gini lho logikanya...").
   - Wajib pakai ANALOGI ANAK SD / SEHARI-HARI (misalnya: perumpamaan uang jajan, beli permen/bakso di warung, patungan beli bola, celengan kelas, dsb).

2. KEDALAMAN PENJELASAN (WAJIB PANJANG & RINCI):
   - Jangan singkat-singkat! Uraikan langkah per langkah secara mendalam dan jelas.
   - Tunjukkan dari mana setiap angka berasal, bagaimana perkaliannya dihitung, kenapa tarif tersebut yang dipakai, dan apa arti hasil akhirnya bagi wajib pajak.

3. FORMAT OUTPUT (WAJIB HTML BERSIH SIAP RENDER):
   - Gunakan tag HTML semantik: <div class="space-y-4">, <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700">, <p class="text-slate-200 leading-relaxed">, <h4 class="font-bold text-emerald-400">, <strong>, <span class="text-amber-300 font-mono">, <ul>, <li>.
   - JANGAN PERNAH memakai inline style warna gelap seperti style="color:#333" atau style="color:#000" karena website menggunakan DARK THEME! Semua teks harus terbaca terang dan kontras (putih, slate-200, emerald-400, amber-300, cyan-400).
   - JANGAN sertakan tag <!DOCTYPE html>, <html>, atau <body>.

STRUKTUR JAWABAN HTML YANG WAJIB ADA:
1. <div class="status-box"> -> Status Verifikasi: 🟢 100% AKURAT & SESUAI ATURAN atau 🔴 PERLU KOREKSI MATEMATIKA / TARIF.
2. <div class="analogi-box"> -> 🍭 Analogi Simpel ala Anak SD (Cerita perumpamaan yang mudah dibayangkan).
3. <div class="matematika-box"> -> 🧮 Bedah Perhitungan Matematika Langkah demi Langkah (Langkah 1, Langkah 2, Langkah 3, Langkah Total).
4. <div class="hukum-box"> -> 📜 Landasan Hukum Resmi Indonesia (UU HPP No. 7/2021, PP 58/2023, PMK 168/2023, UU PPh/PPN).
5. <div class="tips-box"> -> 💡 Tips Praktis untuk Wajib Pajak (Pencatatan, pembuatan faktur/bupot, dan pelaporan SPT).
`;

    const geminiResult = await callGemini({
      systemPrompt,
      messages: [
        {
          role: 'user',
          parts: [{ text: promptUser }],
        },
      ],
      maxOutputTokens: 1200,
      temperature: 0.5,
    });

    if (!geminiResult.ok || !geminiResult.teks) {
      const errMsg = !geminiResult.ok ? (geminiResult as any).error : 'Gagal memproses analisis AI';
      return NextResponse.json(
        { ok: false, pesan: errMsg || 'Gagal memproses analisis AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      teks: geminiResult.teks,
      model: 'gemini-3.6-flash',
    });
  } catch (error: any) {
    console.error('[Verify Calculator AI] Error:', error);
    return NextResponse.json(
      { ok: false, pesan: error.message || 'Terjadi kesalahan pada server AI' },
      { status: 500 }
    );
  }
}
