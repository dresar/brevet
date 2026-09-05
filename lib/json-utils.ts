import { modulSchema } from './validators';
import { validateModulJSON } from './templates/super-prompts';
import type { ParseResult, ParseSyntaxError, ParseSchemaError, ParseSuccess } from './module-types';

// ============================================================
// parseWithLineError — Parse JSON dengan informasi baris/kolom error
// ============================================================
export function parseWithLineError(text: string): 
  | { ok: true; data: unknown }
  | ParseSyntaxError {
  try {
    const data = JSON.parse(text);
    return { ok: true, data };
  } catch (e) {
    if (e instanceof SyntaxError) {
      const msg = e.message;

      // Try to extract position from error message
      let line: number | undefined;
      let column: number | undefined;

      const posMatch = msg.match(/position\s+(\d+)/i);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const before = text.slice(0, pos);
        const lines = before.split('\n');
        line = lines.length;
        column = (lines[lines.length - 1]?.length ?? 0) + 1;
      } else {
        const lineColMatch = msg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
        if (lineColMatch) {
          line = parseInt(lineColMatch[1], 10);
          column = parseInt(lineColMatch[2], 10);
        }
      }

      return {
        ok: false,
        kind: 'syntax',
        line,
        column,
        message: msg,
      };
    }
    return {
      ok: false,
      kind: 'syntax',
      message: String(e),
    };
  }
}

// ============================================================
// validateModuleJson — Validasi lengkap: syntax + schema Zod + Quality Checklist
// ============================================================
export function validateModuleJson(text: string): ParseResult {
  // Step 1: Syntax check
  const parseResult = parseWithLineError(text);
  if (!parseResult.ok) {
    return parseResult as ParseSyntaxError;
  }

  // Step 2: Schema check via Zod
  const zodResult = modulSchema.safeParse(parseResult.data);
  if (!zodResult.success) {
    const issues = zodResult.error.issues.map((issue) => ({
      path: issue.path.join('.') || '(root)',
      message: issue.message,
    }));
    return {
      ok: false,
      kind: 'schema',
      issues,
    } satisfies ParseSchemaError;
  }

  // Step 3: Strict Quality Checklist check via super-prompts validator
  const qualityCheck = validateModulJSON(parseResult.data);
  if (!qualityCheck.valid) {
    const issues = qualityCheck.errors.map((err) => ({
      path: 'Quality Checklist',
      message: err,
    }));
    return {
      ok: false,
      kind: 'schema',
      issues,
    } satisfies ParseSchemaError;
  }

  return {
    ok: true,
    data: zodResult.data,
  } satisfies ParseSuccess;
}

// ============================================================
// beautify — Pretty-print JSON
// ============================================================
export function beautify(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

// ============================================================
// repairJsonSyntax — Auto-repair broken JSON syntax
// ============================================================
export function repairJsonSyntax(rawText: string): { ok: boolean; fixed: string; fixes: string[]; error?: string } {
  const fixes: string[] = [];
  let text = rawText.trim();

  // 1. Strip Markdown Codeblocks (```json ... ``` or ``` ...)
  if (text.includes('```')) {
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      text = codeBlockMatch[1].trim();
      fixes.push('Menghapus wrapper markdown (```json ... ```)');
    } else {
      text = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      fixes.push('Menghapus simbol markdown backtick');
    }
  }

  // 2. Extract JSON object bounds ({ ... }) if wrapped in conversational preamble
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace > 0 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1).trim();
    fixes.push('Mengekstrak struktur JSON dari teks sekitarnya');
  }

  // 3. Normalize Smart Quotes & Special Invisible Unicode Quotes
  const textWithNormalizedQuotes = text
    .replace(/[“”‟]/g, '"')
    .replace(/[‘’]/g, "'");
  if (textWithNormalizedQuotes !== text) {
    text = textWithNormalizedQuotes;
    fixes.push('Mengubah petik dua/satu kurva (“”) menjadi petik standar (")');
  }

  // 4. Clean up corrupted copy-paste duplicate key patterns
  const cleanedDuplicates = text
    .replace(/"([a-zA-Z0-9_]+)"\s*\{\s*"[a-zA-Z0-9_]+"\s*:/g, '"$1":')
    .replace(/"([a-zA-Z0-9_]+)"\s*:\s*"[a-zA-Z0-9_]+"\s*:/g, '"$1":')
    .replace(/"([a-zA-Z0-9_]+)"\s*:\s*"\1"\s*:/g, '"$1":')
    .replace(/"([a-zA-Z0-9_]+)"\s*:\s*([a-zA-Z0-9_]+)"\s*:/g, '"$1":');

  if (cleanedDuplicates !== text) {
    text = cleanedDuplicates;
    fixes.push('Membersihkan duplikasi kunci properti yang terdistorsi');
  }

  // 5. Remove junk isolated strings/commas
  const cleanedJunk = text
    .replace(/,\s*""\s*,/g, ',')
    .replace(/,\s*"\."\s*,/g, ',')
    .replace(/,\s*"[a-zA-Z0-9_]+\."\s*,/g, ',');
  if (cleanedJunk !== text) {
    text = cleanedJunk;
    fixes.push('Membuang elemen string sampah berulang');
  }

  // 6. Fix Trailing Commas (, } or , ])
  const cleanedTrailingCommas = text
    .replace(/,\s*([}\]])/g, '$1');
  if (cleanedTrailingCommas !== text) {
    text = cleanedTrailingCommas;
    fixes.push('Menghapus koma berlebih di akhir object/array (trailing commas)');
  }

  // 6.5. Fix unescaped double quotes inside key-value string lines ("key": "val "quote" val")
  const splitLines = text.split('\n');
  let innerQuoteFixes = 0;
  const fixedLines = splitLines.map((line) => {
    const match = line.match(/^(\s*"[a-zA-Z0-9_]+"\s*:\s*)"([\s\S]*)"(\s*,?\s*)$/);
    if (match) {
      const prefix = match[1];
      const val = match[2];
      const suffix = match[3];
      const cleanVal = val.replace(/(?<!\\)"/g, "'");
      if (cleanVal !== val) {
        innerQuoteFixes++;
        return `${prefix}"${cleanVal}"${suffix}`;
      }
    }
    return line;
  });
  if (innerQuoteFixes > 0) {
    text = fixedLines.join('\n');
    fixes.push('Mengganti tanda kutip ganda internal di dalam string dengan tanda kutip tunggal (\')');
  }

  // Try parsing now
  try {
    const parsed = JSON.parse(text);
    return {
      ok: true,
      fixed: JSON.stringify(parsed, null, 2),
      fixes,
    };
  } catch {
    // Continue to advanced repair
  }

  // 7. Fix Unclosed Quotes and Auto-Balance Braces / Brackets
  let inString = false;
  let isEscaped = false;
  const stack: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (char === '\\') {
      isEscaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}') {
        if (stack.length && stack[stack.length - 1] === '{') stack.pop();
      } else if (char === ']') {
        if (stack.length && stack[stack.length - 1] === '[') stack.pop();
      }
    }
  }

  let repairedText = text;
  if (inString) {
    repairedText += '"';
    fixes.push('Menutup string petik dua yang menggantung');
  }

  repairedText = repairedText.replace(/,\s*$/, '');

  while (stack.length > 0) {
    const last = stack.pop();
    if (last === '{') {
      repairedText += '\n}';
      fixes.push('Menambah kurung kurawal penutup (}) yang kurang');
    } else if (last === '[') {
      repairedText += '\n]';
      fixes.push('Menambah kurung siku penutup (]) yang kurang');
    }
  }

  try {
    const parsed = JSON.parse(repairedText);
    return {
      ok: true,
      fixed: JSON.stringify(parsed, null, 2),
      fixes,
    };
  } catch (err2) {
    return {
      ok: false,
      fixed: repairedText,
      fixes,
      error: err2 instanceof Error ? err2.message : String(err2),
    };
  }
}

// ============================================================
// autoFixModuleJson — Complete Auto-fix for Schema, Visual Elements & Quality Checklist
// ============================================================
const ARRAY_FIELDS_TO_FIX = [
  'prompt_gambar',
  'diagram_mermaid',
  'paragraf',
  'poin_penting',
  'tujuan_belajar',
  'mini_kuis',
  'kesalahan_umum',
  'istilah',
  'pilihan',
  'poin',
] as const;

function fixNullArraysDeep(obj: unknown, fixCount: { n: number }): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => fixNullArraysDeep(item, fixCount));
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      if (
        (ARRAY_FIELDS_TO_FIX as readonly string[]).includes(key) &&
        val === null
      ) {
        result[key] = [];
        fixCount.n++;
      } else {
        result[key] = fixNullArraysDeep(val, fixCount);
      }
    }
    return result;
  }
  return obj;
}

export function autoFixModuleJson(text: string): { fixed: string; count: number; fixes: string[] } | null {
  let rawJsonToParse = text;
  const appliedFixes: string[] = [];

  const syntaxRepair = repairJsonSyntax(text);
  if (syntaxRepair.fixed) {
    rawJsonToParse = syntaxRepair.fixed;
    appliedFixes.push(...syntaxRepair.fixes);
  }

  try {
    const parsed = JSON.parse(rawJsonToParse);
    const fixCount = { n: 0 };
    let fixed = fixNullArraysDeep(parsed, fixCount);

    if (fixed && typeof fixed === 'object') {
      const obj = fixed as Record<string, unknown>;

      // Ensure versi 1.0
      if (obj.versi !== '1.0') {
        obj.versi = '1.0';
        fixCount.n++;
        appliedFixes.push('Menyetel versi JSON ke "1.0"');
      }

      // If missing top-level "modul" wrapper, wrap it
      if (!obj.modul || typeof obj.modul !== 'object') {
        if ('kode' in obj || 'judul' in obj || 'bagian' in obj) {
          fixed = { versi: '1.0', modul: obj };
          appliedFixes.push('Membungkus struktur ke dalam objek "modul"');
        }
      }

      const m = (fixed as { modul?: Record<string, unknown> }).modul;
      if (m && typeof m === 'object') {
        // Ensure required metadata
        if (!m.kode || typeof m.kode !== 'string') {
          m.kode = 'BRVT-AB-01';
          appliedFixes.push('Menyetel kode modul default "BRVT-AB-01"');
        }
        if (!m.slug || typeof m.slug !== 'string') {
          m.slug = typeof m.judul === 'string' ? m.judul.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'modul-brevet';
          appliedFixes.push('Menyusun slug modul otomatis');
        }
        if (!['Dasar', 'PPh', 'PPN', 'Lainnya'].includes(m.kategori as string)) {
          m.kategori = 'Dasar';
          appliedFixes.push('Menyetel kategori modul ke "Dasar"');
        }
        if (!['pemula', 'menengah', 'lanjut'].includes(m.tingkat_kesulitan as string)) {
          m.tingkat_kesulitan = 'pemula';
          appliedFixes.push('Menyetel tingkat_kesulitan ke "pemula"');
        }
        if (typeof m.estimasi_menit !== 'number') {
          m.estimasi_menit = 60;
          appliedFixes.push('Menyetel estimasi_menit ke 60');
        }
        if (!Array.isArray(m.tujuan_belajar) || m.tujuan_belajar.length === 0) {
          m.tujuan_belajar = [
            'Memahami konsep dasar dan regulasi perpajakan yang berlaku.',
            'Mampu menerapkan mekanisme perhitungan perpajakan secara akurat.',
            'Menguasai alur hak dan kewajiban perpajakan di era Coretax DJP.'
          ];
          appliedFixes.push('Menambahkan daftar tujuan_belajar default');
        }

        // Counters for concise summary
        let visualFixedSectionsCount = 0;
        let titleFixedCount = 0;
        let paragraphFixedCount = 0;

        // Auto-fix bagian (sections)
        if (Array.isArray(m.bagian)) {
          m.bagian.forEach((b: Record<string, unknown>, i: number) => {
            const sectionTitle = typeof b.judul === 'string' ? b.judul : `Bagian ${i + 1}`;

            // Clean title emojis & truncate > 65 chars
            if (typeof b.judul === 'string') {
              let cleanJudul = b.judul.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}/gu, '').trim();
              if (cleanJudul.length > 65) {
                cleanJudul = cleanJudul.slice(0, 60).trim();
              }
              if (cleanJudul !== b.judul) {
                b.judul = cleanJudul || `Bagian ${i + 1}`;
                fixCount.n++;
                titleFixedCount++;
              }
            } else {
              b.judul = `Bagian ${i + 1}`;
            }

            // Ensure paragraf & poin_penting
            if (!Array.isArray(b.paragraf) || b.paragraf.length === 0) {
              b.paragraf = [
                `Materi bagian ini membahas mengenai ${b.judul} dalam sistem perpajakan Indonesia secara komprehensif.`,
                `Pemahaman atas ${b.judul} sangat penting untuk memastikan kepatuhan perpajakan di era Coretax DJP 2026.`,
                `Setiap Wajib Pajak perlu memperhatikan ketentuan pasal dan regulasi terkait agar tidak dikenai sanksi administratif.`
              ];
              fixCount.n++;
              paragraphFixedCount++;
            }

            if (!Array.isArray(b.poin_penting) || b.poin_penting.length === 0) {
              b.poin_penting = [
                `💡 Poin utama mengenai ${b.judul}.`,
                `✅ Pemenuhan kewajiban sesuai regulasi yang berlaku.`,
                `⚠️ Hindari kesalahan administrasi dalam pelaporan.`
              ];
              fixCount.n++;
            }

            if (!b.analogi || typeof b.analogi !== 'string') {
              b.analogi = `Bayangkan ${b.judul} seperti aturan permainan di mana semua peserta wajib mengikuti prosedur agar pertandingan berjalan adil dan tertib.`;
              fixCount.n++;
            }

            if (!b.contoh_kasus || typeof b.contoh_kasus !== 'object') {
              b.contoh_kasus = {
                judul: `Kasus ${b.judul}`,
                cerita: `Pak Budi menjalankan aktivitas usaha dan berhadapan dengan ketentuan ${b.judul}. Beliau berkonsultasi dengan KPP setempat.`,
                poin: [
                  `Pak Budi wajib memahami aturan ${b.judul}.`,
                  `Pelaksanaan transaksi dilakukan sesuai ketentuan tarif dan waktu yang berlaku.`
                ]
              };
              fixCount.n++;
            }

            // Ensure Kesalahan umum & Istilah
            if (!Array.isArray(b.kesalahan_umum)) b.kesalahan_umum = [];
            if (!Array.isArray(b.istilah)) b.istilah = [];

            // ============================================================
            // ENSURE VISUAL ELEMENTS (Minimum 2 required per section)
            // ============================================================
            let hasMermaid = Array.isArray(b.diagram_mermaid) && b.diagram_mermaid.length > 0;
            let hasPrompt = Array.isArray(b.prompt_gambar) && b.prompt_gambar.length > 0;
            let hasKuis = Array.isArray(b.mini_kuis) && b.mini_kuis.length > 0;
            let hasKalk = b.kalkulator !== null && typeof b.kalkulator === 'object';

            let countVisual = [hasMermaid, hasPrompt, hasKuis, hasKalk].filter(Boolean).length;
            let sectionVisualFixed = false;

            if (countVisual < 2) {
              // Inject prompt_gambar if missing
              if (!hasPrompt) {
                b.prompt_gambar = [
                  {
                    id: `img-bag-${i + 1}`,
                    prompt: `A highly detailed modern flat 3D isometric educational illustration in landscape 16:9 format depicting ${sectionTitle} in Indonesian tax environment. Studio render style with deep navy background #0F172A, electric blue #3B82F6, emerald green #10B981, clean lighting. Crisp vector graphics. Clean bold text label in Indonesian printed on top of key elements. NO TEXT, NO LETTERS, NO NUMBERS, NO WORDS, NO WATERMARKS.`,
                    keterangan: `Infografis 3D ilustrasi visual mengenai ${sectionTitle}`,
                    alt: `Diagram ilustrasi ${sectionTitle}`,
                    url_gambar: null
                  }
                ];
                hasPrompt = true;
                countVisual++;
                fixCount.n++;
                sectionVisualFixed = true;
              }

              // Inject mini_kuis if still < 2
              if (countVisual < 2 && !hasKuis) {
                b.mini_kuis = [
                  {
                    id: `q-bag-${i + 1}-1`,
                    pertanyaan: `Apakah materi ${sectionTitle} berlaku resmi dalam sistem perpajakan Indonesia?`,
                    tipe: 'benar_salah',
                    pilihan: ['Benar', 'Salah'],
                    jawaban: 'Benar',
                    pembahasan: `Benar. Ketentuan mengenai ${sectionTitle} diatur secara jelas dalam regulasi perpajakan resmi Indonesia.`
                  },
                  {
                    id: `q-bag-${i + 1}-2`,
                    pertanyaan: `Manakah langkah yang paling tepat terkait pelaksanaan ${sectionTitle}?`,
                    tipe: 'pilihan_ganda',
                    pilihan: [
                      `A. Melaksanakan kewajiban ${sectionTitle} sesuai regulasi yang berlaku`,
                      'B. Membiarkan kewajiban perpajakan menumpuk',
                      'C. Mengabaikan ketentuan Coretax DJP',
                      'D. Menghindari pendaftaran NPWP'
                    ],
                    jawaban: 'A',
                    pembahasan: `Wajib Pajak hendaknya selalu mematuhi aturan ${sectionTitle} agar terhindar dari sanksi denda administrasi.`
                  }
                ];
                hasKuis = true;
                countVisual++;
                fixCount.n++;
                sectionVisualFixed = true;
              }

              // Inject diagram_mermaid if still < 2
              if (countVisual < 2 && !hasMermaid) {
                b.diagram_mermaid = [
                  `graph TD\n    A["Mulai ${sectionTitle}"] --> B["Identifikasi Objek & Subjek"]\n    B --> C["Perhitungan & Penyetoran"]\n    C --> D["Pelaporan Coretax DJP"]`
                ];
                if (!b.penjelasan_diagram) {
                  b.penjelasan_diagram = `Diagram alur pelaksanaan ${sectionTitle}`;
                }
                hasMermaid = true;
                countVisual++;
                fixCount.n++;
                sectionVisualFixed = true;
              }

              if (sectionVisualFixed) {
                visualFixedSectionsCount++;
              }
            }
          });
        }

        if (visualFixedSectionsCount > 0) {
          appliedFixes.push(`Melengkapi elemen visual (prompt gambar & kuis) pada ${visualFixedSectionsCount} bagian`);
        }
        if (titleFixedCount > 0) {
          appliedFixes.push(`Merapikan ${titleFixedCount} judul bagian agar <= 65 karakter`);
        }
        if (paragraphFixedCount > 0) {
          appliedFixes.push(`Menambahkan paragraf materi default pada ${paragraphFixedCount} bagian`);
        }

        // Auto-fix kuis_akhir (minimum 15 soal)
        if (!m.kuis_akhir || typeof m.kuis_akhir !== 'object') {
          m.kuis_akhir = {
            judul: `Kuis Akhir ${m.judul || 'Modul Perpajakan'}`,
            nilai_lulus: 70,
            waktu_menit: 30,
            soal: []
          };
        }
        const kuisObj = m.kuis_akhir as { soal?: unknown[] };
        if (!Array.isArray(kuisObj.soal)) {
          kuisObj.soal = [];
        }
        const soalArray = kuisObj.soal;

        if (soalArray.length < 15) {
          const needed = 15 - soalArray.length;
          for (let k = 0; k < needed; k++) {
            const idx = soalArray.length + 1;
            soalArray.push({
              id: `q-final-${idx}`,
              pertanyaan: `Soal Evaluasi ${idx}: Manakah pernyataan yang paling tepat mengenai ketentuan perpajakan dalam modul ini?`,
              tipe: 'pilihan_ganda',
              pilihan: [
                'A. Seluruh hak dan kewajiban perpajakan wajib dilaksanakan sesuai regulasi UU yang berlaku.',
                'B. Sanksi pajak tidak perlu dibayar apabila Wajib Pajak lupa lapor SPT.',
                'C. Penggunaan NIK 16 digit tidak berlaku di era Coretax DJP 2026.',
                'D. Tarif PPN yang berlaku aktif tahun 2026 adalah 10%.'
              ],
              jawaban: 'A',
              pembahasan: 'Dalam hukum perpajakan Indonesia, kepatuhan sukarela dan pelaksanaan sesuai undang-undang yang berlaku aktif (termasuk Coretax & PPN 12%) adalah wajib.'
            });
          }
          fixCount.n += needed;
          appliedFixes.push(`Menambahkan ${needed} soal evaluasi pada kuis_akhir`);
        }

        // Auto-fix glosarium (minimum 15 entri)
        if (!Array.isArray(m.glosarium)) {
          m.glosarium = [];
        }
        const glosariumArray = m.glosarium as Array<{ kata?: string }>;
        if (glosariumArray.length < 15) {
          const defaultGlossary = [
            { kata: 'DJP', definisi: 'Direktorat Jenderal Pajak, unit Eselon I di bawah Kementerian Keuangan Indonesia.', penjelasan_sederhana: 'Instansi pemerintah yang mengurus pelaporan dan pengumpulan pajak negara.' },
            { kata: 'Coretax DJP', definisi: 'Core Tax Administration System (CTAS), sistem teknologi informasi administrasi perpajakan terpadu DJP.', penjelasan_sederhana: 'Sistem portal perpajakan super modern 2026 tempat lapor dan bayar pajak.' },
            { kata: 'NPWP', definisi: 'Nomor Pokok Wajib Pajak, identitas administrasi perpajakan Wajib Pajak.', penjelasan_sederhana: 'KTP khusus buat urusan pajak.' },
            { kata: 'NIK 16 Digit', definisi: 'Nomor Induk Kependudukan 16 digit yang diintegrasikan menjadi NPWP Orang Pribadi.', penjelasan_sederhana: 'Nomor KTP kamu yang sekarang langsung otomatis jadi NPWP.' },
            { kata: 'SPT', definisi: 'Surat Pemberitahuan yang digunakan Wajib Pajak untuk melaporkan penghasilan dan pajak.', penjelasan_sederhana: 'Formulir laporan tahunan/bulanan pajak kamu.' },
            { kata: 'SSP', definisi: 'Surat Setoran Pajak atau bukti pembayaran/penyetoran pajak ke kas negara.', penjelasan_sederhana: 'Struk bukti bayar pajak.' },
            { kata: 'PKP', definisi: 'Pengusaha Kena Pajak yang dikukuhkan untuk memungut dan mengkreditkan PPN.', penjelasan_sederhana: 'Bisnis/usaha yang udah berhak narik PPN dari pembeli.' },
            { kata: 'BKP', definisi: 'Barang Kena Pajak yang dikenai Pajak Pertambahan Nilai.', penjelasan_sederhana: 'Barang yang ada pajak PPN-nya.' },
            { kata: 'JKP', definisi: 'Jasa Kena Pajak yang dikenai Pajak Pertambahan Nilai.', penjelasan_sederhana: 'Jasa pelayanan yang ada PPN-nya.' },
            { kata: 'Pajak Masukan', definisi: 'PPN yang dibayar oleh PKP atas perolehan Barang/Jasa Kena Pajak.', penjelasan_sederhana: 'PPN yang kamu bayar pas modalin/belanja buat usahamu.' },
            { kata: 'Pajak Keluaran', definisi: 'PPN yang dipungut oleh PKP saat menjual Barang/Jasa Kena Pajak.', penjelasan_sederhana: 'PPN yang kamu tarik dari pembeli.' },
            { kata: 'SKP', definisi: 'Surat Ketetapan Pajak yang menerbitkan jumlah utang atau kelebihan pajak.', penjelasan_sederhana: 'Surat tagihan atau penetapan resmi dari kantor pajak.' },
            { kata: 'PTKP', definisi: 'Penghasilan Tidak Kena Pajak, batasan penghasilan OP yang tidak dikenai PPh.', penjelasan_sederhana: 'Batas gaji yang bebas dari potongan pajak.' },
            { kata: 'UU HPP', definisi: 'Undang-Undang Nomor 7 Tahun 2021 tentang Harmonisasi Peraturan Perpajakan.', penjelasan_sederhana: 'UU reformasi pajak terbaru di Indonesia.' },
            { kata: 'Tarif Progresif', definisi: 'Tarif pemajakan yang persentasenya semakin tinggi seiring besarnya penghasilan.', penjelasan_sederhana: 'Makin gede gajimu, makin tinggi persentase pajaknya.' }
          ];

          let addedGlossary = 0;
          for (const item of defaultGlossary) {
            if (glosariumArray.length >= 15) break;
            const exists = glosariumArray.some(g => g.kata?.toLowerCase() === item.kata.toLowerCase());
            if (!exists) {
              glosariumArray.push(item);
              fixCount.n++;
              addedGlossary++;
            }
          }
          if (addedGlossary > 0) {
            appliedFixes.push(`Melengkapi glosarium (+${addedGlossary} istilah)`);
          }
        }
      }
    }

    return {
      fixed: JSON.stringify(fixed, null, 2),
      count: fixCount.n + appliedFixes.length,
      fixes: appliedFixes,
    };
  } catch {
    return null;
  }
}

// ============================================================
// extractModuleSummary — Get stats from validated JSON for display
// ============================================================
export function extractModuleSummary(data: ReturnType<typeof modulSchema.parse>) {
  const { modul } = data;
  const totalBagian = modul.bagian.length;
  const totalSoalKuis = modul.kuis_akhir?.soal.length ?? 0;
  const totalMiniKuis = modul.bagian.reduce(
    (acc, b) => acc + (b.mini_kuis?.length ?? 0),
    0
  );
  const totalGlosarium = modul.glosarium?.length ?? 0;

  return {
    totalBagian,
    totalSoalKuis,
    totalMiniKuis,
    totalGlosarium,
    judul: modul.judul,
    kode: modul.kode,
    slug: modul.slug,
  };
}
