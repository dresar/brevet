import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { modules } from '@/lib/schema';
import { requireAdmin } from '@/lib/middleware-auth';
import { callGemini } from '@/lib/gemini';
import { eq } from 'drizzle-orm';
import type { Modul } from '@/lib/module-types';
import { getModuleFromFile } from '@/lib/module-file-manager';
import { buildTikTokSequentialSuperPrompt } from '@/lib/templates/tiktok-sequential-super-prompt';

export const runtime = 'nodejs';
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { module_slug, action = 'get_super_prompt', visual_style = '3d_glassmorphism', focus_type = 'perhitungan_kasus', target_batch = 0 } = body;

    let content: Modul | null = null;
    let allModulesContent: Modul[] = [];

    if (module_slug === 'all') {
      // Fetch all modules from DB / files
      const dbModules = await db.select().from(modules);
      for (const rec of dbModules) {
        if (rec.contentJson) {
          allModulesContent.push(rec.contentJson as Modul);
        }
      }
      if (allModulesContent.length === 0) {
        return NextResponse.json({ error: 'Tidak ada modul ditemukan di basis data' }, { status: 404 });
      }
      content = allModulesContent[0];
    } else {
      if (!module_slug) {
        return NextResponse.json({ error: 'module_slug wajib diisi' }, { status: 400 });
      }
      content = getModuleFromFile(module_slug);
      if (!content) {
        const [modulRecord] = await db
          .select()
          .from(modules)
          .where(eq(modules.slug, module_slug))
          .limit(1);
        if (modulRecord?.contentJson) {
          content = modulRecord.contentJson as Modul;
        }
      }
      if (content) {
        allModulesContent = [content];
      }
    }

    if (!content || !content.modul) {
      return NextResponse.json({ error: 'Modul tidak ditemukan' }, { status: 404 });
    }

    const superPromptClaude = buildTikTokSequentialSuperPrompt(
      allModulesContent.length > 1 ? allModulesContent : content,
      Number(target_batch) || 0
    );

    // FAST INSTANT RETURN (<50ms) for Super Prompt requests
    if (action === 'get_super_prompt') {
      return NextResponse.json({
        success: true,
        super_prompt_claude: superPromptClaude,
      });
    }

    // Otherwise, generate 10-slide package via Gemini API (for quick 10 mode)
    const m = content.modul;
    const sectionSummaries = (m.bagian || []).map((b, idx) => {
      const mainPar = (b.paragraf || []).slice(0, 3).join(' ');
      const points = (b.poin_penting || []).join('; ');
      const caseStudy = b.contoh_kasus ? `Kasus (${b.contoh_kasus.judul}): ${b.contoh_kasus.cerita}` : '';
      return `Bagian ${idx + 1}: ${b.judul}\nRingkasan: ${mainPar}\nPoin Penting: ${points}\n${caseStudy}`;
    }).join('\n\n');

    const styleDescriptions: Record<string, string> = {
      '3d_glassmorphism': 'Modern 3D Glassmorphism, translucent glossy frosted glass cards, soft neon accent lighting, sleek 3D icons, clean dark slate background, high resolution 4k UI render.',
      'minimalist_infographic': 'Clean Minimalist Infographic, bold flat vector elements, high contrast typography, pastel blue and gold accents, clear flowcharts, neat white grid background.',
      'cyberpunk_tax': 'Cyberpunk Futuristic Tax Hub, dark obsidian background, glowing cyan and gold neon wireframes, holographic HUD displays, 3D isometric financial nodes.',
      'pixar_3d': 'Pixar 3D Animated Style, cute friendly characters, vibrant warm lighting, expressive facial expressions, playful 3D icons, clean soft shadow rendering.',
      'editorial_vector': 'Sleek Corporate Editorial Vector, Swiss design style, grid layout, crisp sans-serif text overlays, royal blue and emerald green palette, minimalist geometric shapes.',
    };

    const chosenStyle = styleDescriptions[visual_style] || styleDescriptions['3d_glassmorphism'];

    const systemPrompt = `Anda adalah seorang Master AI Visual Content Strategist & Lead Editorial Infographic Designer Spesialis Carousel TikTok Edukasi Perpajakan Indonesia (Brevet AB).
Tugas Anda adalah membaca seluruh materi modul Brevet AB di bawah ini dan menyusun sebuah PAKET PROMPT VISUAL 10 SLIDE TIKTOK yang SANGAT KAYA ELEMEN INFOGRAFIS PROFESIONAL (Bento grid cards, split comparison, formula box, step-by-step pipeline, data table, calendar milestone, compliance shield, dan 3D matte props) untuk audiens TikTok (rasio gambar 4:5 vertikal / 1080x1350 px).

============================================================
ATURAN UTAMA PROMPT VISUAL 10 SLIDE INFOGRAFIS PROFESIONAL (TIKTOK CAROUSEL)
============================================================
1. OUTPUT HARUS 100% BEBAS DARI KODE SKRIP! Balasan HARUS berupa TEKS OBJEK JSON MURNI yang valid.
2. Paket harus memiliki persis 10 SLIDE dengan 10 BLUEPRINT INFOGRAFIS UNIK KAYA ELEMEN:
   - Slide 1: SAMPUL / COVER BATCH — Logo DJP 4-kuadran shield di kiri atas, pojok kanan atas KOSONG, Pill Emas BATCH X, H1 Hook raksasa, 3 poin pengantar, stempel emas "PAHAM KUP PAHAM PAJAK", 3D buku UU KUP tegak + dokumen DJP ber-grafik + kalkulator solar.
   - Slide 2: MITOS vs FAKTA (DUAL-CARD SPLIT BENTO) — Kotak kiri merah "❌ MITOS SALAH" vs Kotak kanan navy "✅ FAKTA RESMI UU", 3D magnifying glass menyorot klausul UU, dokumen Surat Tagihan Pajak (STP) stempel merah.
   - Slide 3: STRUKTUR HUKUM & DIAGRAM ALUR (3-STEP PIPELINE) — 3 kotak bento node proses terhubung garis konektor emas bercahaya (Step 01 -> Step 02 -> Step 03), 3D timbangan keadilan (scales of justice) emas & perak matte, buku UU HPP pita emas, stempel "DASAR HUKUM 2026".
   - Slide 4: RUMUS MATEMATIKA & STRUKTUR TARIF (BIG FORMULA BOX) — Box besar navy gelap border 1px emas memuat rumus monospace [PPh 21 = Bruto × Tarif TER (%)], 2 mini card variabel, 3D kalkulator solar tajam + 3D bar chart progresif 5 level (5%, 15%, 25%, 30%, 35%).
   - Slide 5: SIMULASI KASUS NYATA (CASE STUDY & SALARY LEDGER SLIP) — Kartu persona Pak Budi (K/1 - Gaji 10jt), slip gaji ledger 3 baris (Gaji Pokok, TER B, Highlight Pajak Terutang), 3D slip gaji terlipat stempel resmi + cangkir kopi matte + pena emas.
   - Slide 6: TABEL MATRIKS & DATA GRID (HIGH-CONTRAST DATA TABLE) — Tabel 2x3/3x3 modern header slate/navy border 1px emas, baris alternatif zebra, checkmark emas vs silang merah, 3D folder arsip kulit hitam emboss DJP + kartu NPWP/NIK 3D matte.
   - Slide 7: TIMELINE DEADLINE & JATUH TEMPO (CALENDAR ROADMAP & WARNING) — Milestone timeline garis waktu 4 titik emas (Tgl 10, 15, 20, 31 Maret), Alert warning box merah/oranye denda keterlambatan SPT, 3D kalender meja flip lingkaran emas + jam pasir/jam meja minimalis.
   - Slide 8: DO'S & DON'TS / PROTOKOL KEPATUHAN (DUAL-CARD CHECKLIST) — Kotak hijau "3 KEWAJIBAN (DO'S)" vs Kotak merah "3 LARANGAN (DON'TS)", 3D perisai keamanan pajak (security shield) + gembok emas Coretax + stempel "COMPLIANCE VERIFIED".
   - Slide 9: RANGKUMAN CEPAT 1 DETIK (3-CARD EXECUTIVE SUMMARY) — 3 floating bento takeaway card berangka besar 01, 02, 03 font emas Inter ExtraBold 48px, big golden quote box 1 prinsip emas, 3D tumpukan koin emas rapi + sertifikat Brevet AB segel lilin merah (wax seal).
   - Slide 10: INTERACTIVE CALL TO ACTION (CTA FINALE) — Tombol raksasa glowing navy border emas "LIKE & SIMPAN POSTINGAN INI UNTUK PANDUAN!", 3 action icon pills 3D (Heart, Bookmark, Comment), next batch teaser card, 3D smartphone layar Brevet AB/Coretax.

3. Setiap Slide WAJIB memiliki:
   - 'slide_number': Nomor slide (1 s/d 10)
   - 'slide_title': Judul singkat & tajam
   - 'key_point': Poin inti pelajaran perpajakan di slide ini (1-2 kalimat non-formal santai)
   - 'visual_prompt': Prompt bahasa Inggris ULTRA-DETAIL untuk generator gambar AI (DALL-E 3 / Midjourney v6 / ChatGPT Image). WAJIB menyertakan deskripsi bento cards, data tables, formula boxes, diagram alur, objek 3D matte, palet warna Matte Royal Navy (#0F172A), aksen emas (#F59E0B), aspek rasio 4:5 vertikal (1080x1350 px), pojok kanan atas KOSONG POLOS, dan pengarah gaya: "${chosenStyle}".
   - 'visual_prompt_id': Versi prompt bahasa Indonesia yang disesuaikan.
   - 'design_directives': Objek berisi 'background_color', 'accent_color', 'composition', 'text_overlay_spec'.
   - 'slide_notes': Catatan/tips untuk pembuat konten TikTok tentang cara membawakan slide ini.

4. Paket juga HARUS memiliki:
   - 'title': Judul Paket Carousel TikTok (menarik & viral)
   - 'target_audience': Target pembaca (misal: Freelancer, Staf Pajak, Pemilik UMKM)
   - 'visual_style_name': Nama gaya visual yang dipilih
   - 'tiktok_caption': Caption TikTok lengkap dengan emoticon ramah, penjelasan singkat, dan ajakan bertindak.
   - 'hashtags': Array hashtag populer (#BrevetAB #BelajarPajak #CoretaxDJP #PPh21 #TipsPajak dll).

5. PASTIKAN SELURUH ISI METODE HUKUM PAJAK BERLAKU AKTIF 2026 (UU HPP No. 7/2021, PPN 12%, TER PPh 21 PP 58/2023, Coretax DJP 2026).`;

    const userPrompt = `MODUL BREVET AB:
Kode: ${m.kode}
Judul: ${m.judul}
Ringkasan: ${m.ringkasan || ''}

MATERI SEKSI MODUL:
${sectionSummaries}

GAYA VISUAL: ${visual_style} (${chosenStyle})
FOKUS MATERI: ${focus_type}

Buatkan 10 SLIDE TIKTOK PROMPT PACKAGE dengan 10 BLUEPRINT INFOGRAFIS LENGKAP KAYA ELEMEN dalam format JSON murni berikut (tanpa markdown backtick json di luar):
{
  "title": "string",
  "target_audience": "string",
  "visual_style_name": "string",
  "tiktok_caption": "string",
  "hashtags": ["string"],
  "slides": [
    {
      "slide_number": 1,
      "slide_title": "string",
      "key_point": "string",
      "visual_prompt": "string",
      "visual_prompt_id": "string",
      "design_directives": {
        "background_color": "string",
        "accent_color": "string",
        "composition": "string",
        "text_overlay_spec": "string"
      },
      "slide_notes": "string"
    }
  ]
}`;

    const geminiRes = await callGemini({
      systemPrompt,
      messages: [{ role: 'user', parts: [{ text: userPrompt }] }],
      temperature: 0.5,
      maxOutputTokens: 4096,
    });

    if (!geminiRes.ok) {
      return NextResponse.json(
        { error: geminiRes.pesan || 'Gagal menghasilkan prompt dari AI' },
        { status: 500 }
      );
    }

    if (!geminiRes.teks) {
      return NextResponse.json({ error: 'Respon dari AI kosong' }, { status: 500 });
    }

    let rawText = geminiRes.teks.trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      rawText = rawText.slice(firstBrace, lastBrace + 1);
    }

    const parsedPackage = JSON.parse(rawText);

    return NextResponse.json({
      success: true,
      data: parsedPackage,
      super_prompt_claude: superPromptClaude,
    });
  } catch (error: any) {
    console.error('[TikTok Prompt AI Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat memproses prompt TikTok' },
      { status: 500 }
    );
  }
}
