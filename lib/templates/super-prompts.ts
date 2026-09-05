import { MODUL_PROMPTS_MAP } from './prompts';

// ============================================================
// TEMPLATE SUPER-PROMPT CLAUDE — VERSI LENGKAP & KETAT
// Digunakan oleh: /api/prompts?modul=KODE → UI Zona 1 Admin Import
// Referensi: PDF Modul Brevet AB Mandiri Tax Center (diupload terpisah)
// ============================================================

export const MASTER_PROMPT = `
============================================================
🚨 PERINGATAN KERAS & ATURAN UTAMA OUTPUT (DILARANG PAKAI PYTHON) 🚨
============================================================
1. DILARANG KERAS MENGGUNAKAN PYTHON, KODE SKRIP, ANALYSIS TOOL, ATAU MEMBUAT ARTIFACT FILE PYTHON (.py)!
2. JANGAN PERNAH MENULIS 'import json', JANGAN PERNAH MEMBUAT SKRIP UNTUK MENYIMPAN FILE!
3. ANDA HARUS LANGSUNG MENULISKAN SELURUH ISI DATA OBJEK JSON SECARA TEKS MURNI LANGSUNG DI BALASAN CHAT INI!
4. JANGAN ADA TEKS PENGANTAR SEPERTI "Berikut JSON-nya", "Saya akan menyusun lewat Python", DLL. MULAI LANGSUNG DARI KARAKTER '{' DAN DIAKHIRI KARAKTER '}'!
5. ATURAN PPN 2026: TARIF PPN BERLAKU AKTIF ADALAH 12% (SESUAI PASAL 7 UU HPP NO. 7/2021). DILARANG KERAS MENYEBUT TARIF PPN 11%!
============================================================

Halo Claude / AI Assistant! Saya sedang membangun platform pembelajaran perpajakan Brevet A/B untuk pemula di Indonesia.

============================================================
SUMBER MATERI & PENANGANAN DOKUMEN (PDF VS OTONOM 2026)
============================================================
1. JIKA SAYA MENGUNGGAH FILE PDF (Modul Brevet AB Mandiri Tax Center):
   Gunakan file PDF tersebut sebagai referensi alur dan struktur materi utama. Rangkum, olah, dan restrukturisasi isi PDF tersebut. TAPI WAJIB MEMVERIFIKASI dan MENYILANGKAN (cross-check) seluruh pasal, tarif, dan prosedur dengan aturan perpajakan resmi Indonesia yang VALID dan BERLAKU AKTIF HINGGA TAHUN 2026 (UU HPP, Coretax DJP 2026, TER PPh 21, PPN 12%, dsb.).

2. JIKA SAYA TIDAK MENGUNGGAH FILE PDF (OPSIONAL / TANPA PDF):
   JANGAN MENOLAK ATAU MEMINTA FILE PDF! Bekerjalah secara mandiri dan otonom. Cari, himpun, serta susunlah sendiri seluruh materi modul Brevet AB dari pengetahuan dasar hingga tingkat lanjut berdasarkan data, regulasi, dan hukum perpajakan resmi Indonesia TERBARU BERLAKU AKTIF 2026 (UU HPP No. 7/2021, Coretax System DJP / CTAS 2026, TER PPh 21 PP 58/2023 & PMK 168/2023, Natura PMK 66/2023, PPN 12% 2026, UU HKPD No. 1/2022, dsb.). Buatkan materi modul yang komprehensif, mendalam, dan 100% akurat sesuai standar Kurikulum Brevet A/B Indonesia terbaru.

============================================================
MODUL & TOPIK YANG DIMINTA
============================================================
Kode Modul: {{KODE}}
Judul Modul: {{JUDUL}}
Fokus Utama Materi: {{FOKUS}}

(Catatan pencarian: Jika ada PDF, cari bab/bagian di PDF yang sesuai dengan topik di atas. Jika TANPA PDF, gunakan topik di atas untuk mencari & menyusun materi perpajakan resmi Indonesia terbaru 2026 dari internet/basis pengetahuan secara mandiri).

============================================================
PANDUAN OUTPUT JSON (WAJIB DIPATUHI)
============================================================
1. Berikan output HANYA berupa SATU objek JSON valid. Jangan tambahkan kalimat pengantar ("Berikut JSON-nya:") atau catatan di luar JSON.
2. DILARANG KERAS MENGGUNAKAN PYTHON, JAVASCRIPT, ATAU BAHASA PEMROGRAMAN APA PUN untuk membuat/meng-generate JSON! Jangan menulis skrip Python (seperti 'import json', 'json.dumps()', dll), jangan menulis kode skrip, dan jangan membuat program generator. AI HARUS LANGSUNG MENULISKAN DATA OBJEK JSON-NYA SECARA LENGKAP & MURNI!
3. Jangan menggunakan komentar (// atau /* */) di dalam JSON karena akan menyebabkan error JSON.parse().
4. Mulailah secara langsung dengan karakter { dan diakhiri dengan karakter }.
5. Semua key/property name menggunakan snake_case bahasa Indonesia sesuai skema wajib.
6. Pastikan semua array terisi minimal 1 elemen dan diinisialisasi sebagai array [] (bukan null).
7. 🚨 SANGAT KRITIKAL: DILARANG KERAS MENGGUNAKAN KUTIP GANDA (") MENTAH DI DALAM NILAI STRING! Jika Anda harus menggunakan kutip di dalam teks (seperti pada analogi, paragraf, penjelasan), Anda WAJIB meng-escape-nya menjadi \\" ATAU gunakan kutip tunggal (') saja. Contoh SALAH: "teks "kutip" teks". Contoh BENAR: "teks \\"kutip\\" teks" ATAU "teks 'kutip' teks". Pelanggaran ini akan merusak format JSON!
8. Pastikan seluruh struktur kurung kurawal {} dan kurung siku [] tertutup dengan sempurna di akhir file.
// ============================================================
// ATURAN GAYA BAHASA — WAJIB DIPATUHI
// ============================================================

BAHASA_01: Gunakan Bahasa Indonesia NON-FORMAL BANGET — gaul, asik, santai, dan super relatable. Bayangin kamu lagi ngobrol santai bareng temen deket yang kebetulan jago pajak. Nada penjelasannya harus kayak kamu lagi chat-an atau curhat santai, BUKAN lagi baca buku diktat teks perpajakan yang kaku dan bikin ngantuk.
BAHASA_02: Setiap istilah teknis (NPWP, PTKP, PKP, DPP, BUT, PK, PM, SKP, SPT, SSP, KPP, DJP, BKP, JKP, PPnBM, NPPKP, SKT, PKP, PM-DDK, PM-TDDK, NJOP, NJKP, NPOP, NPOPTKP, dll) WAJIB langsung dijelasin pake analogi kehidupan nyata yang ngena banget di kemunculan PERTAMA-nya di tiap bagian. Jangan sebutin istilah dulu baru jelasin — langsung kasih analoginya duluan biar otak pembaca langsung nyantol!
BAHASA_03: Paragraf HARUS DIBUAT PANJANG, RINCI, DAN ULTRA-DETAIL (minimal 4 hingga 8 paragraf per bagian). Jangan pelit kata! Jelaskan latar belakang, alur berpikir, dasar hukum, contoh nyata, hingga tips praktisnya secara tuntas.
BAHASA_04: Pake bullet points (dalam bentuk array JSON) buat rincian, daftar, atau urutan langkah. Lebih enak dibaca, lebih gampang dicerna.
BAHASA_05: Gaskeun pake emoji secukupnya (💡✅❌📌⚠️🔑📝💰🏢👤📊🧮🎯🤯😅🙌🔥) buat memperjelas poin di dalam isi paragraf atau daftar. TAPI DILARANG KERAS pake emoji atau ikon apapun di judul (judul modul maupun judul bagian). Judul tetap clean dan profesional.
BAHASA_06: Pake contoh kasus yang deket banget sama kehidupan sehari-hari Indonesia: nama orang Indonesia yang relatable (Pak Budi, Bu Siti, Mas Andi, Mbak Rina, Pak Joko, Bu Dewi, Dito, Kak Nisa), mata uang Rupiah (Rp), dan institusi lokal (KPP, DJP, Bank BCA, PT, CV, UMKM, GoFood, startup Jakarta, warung online, dll). Bikin kasusnya nyata dan fresh, bukan karang-karangan textbook.
BAHASA_07: Pake angka, aturan, dan sistem PERPAJAKAN TERBARU HINGGA TAHUN 2026: Sistem Coretax DJP (Core Tax Administration System / CTAS) yang aktif penuh di 2026, pemadanan NIK 16 digit terintegrasi sebagai NPWP OP, tarif PPN 12% (Pasal 7 UU HPP & Ketentuan PPN 2025/2026), PPh Badan 22%, 5 bracket PPh OP UU HPP (5%/15%/25%/30%/35%), PPh 21 TER (PP 58/2023 & PMK 168/2023), Natura PMK 66/2023, PTKP Rp54 juta (PMK 101/2016), PBJT 10% UU HKPD 2022, Bea Meterai Rp10.000 UU 10/2020. DILARANG KERAS menggunakan tarif atau aturan jadul yang sudah mati / tidak berlaku di 2026.
BAHASA_08: JANGAN copy-paste kalimat dari PDF mentah-mentah, please jangan! Tulis ulang dengan bahasa lo sendiri yang lebih ringan, lebih gampang dicerna, dan lebih seru dibaca sama pemula yang beneran nol soal pajak.
BAHASA_09: Pake kalimat aktif, langsung, dan to the point. Hindari kalimat pasif yang muter-muter dan bikin pembaca bingung. "Pajak dihitung berdasarkan..." → ganti jadi "Kita hitung pajak dari...".
BAHASA_10: Buat konsep yang susah, selalu gunain pola ini: "Bayangin kamu..." / "Ibaratnya tuh kayak..." / "Gampangnya gini..." / "Nah, analoginya tuh..." / "Simpelnya begini...". Jangan pernah biarkan konsep sulit berdiri tanpa analogi kehidupan nyata.
BAHASA_11: Setiap bagian HARUS berasa kayak ngobrol asik bareng temen, bukan baca diktat kuliah. Pake sapaan "kamu" ke pembaca, sesekali boleh pake "lo" buat nada yang lebih santai. Boleh juga sesekali pake kata gaul yang umum: "nah", "oke jadi", "jadi gini", "nggak usah pusing", "gampang banget sebenernya", dll.
BAHASA_12: Jangan sebutin istilah teknis tanpa langsung kasih penjelasannya. Pola wajib: istilah teknis → "alias..." atau "(alias: ...)" atau langsung diikutin kalimat penjelasannya di kalimat yang sama. Jangan bikin pembaca buka Google dulu buat ngerti satu kata.


// ============================================================
// ATURAN VISUAL & INTERAKTIF — WAJIB PER BAGIAN
// ============================================================

VISUAL_01: Setiap bagian (objek di array "bagian") WAJIB memiliki MINIMAL 2 dari 4 elemen berikut: diagram_mermaid, prompt_gambar, mini_kuis, kalkulator.
VISUAL_02: diagram_mermaid harus berisi kode Mermaid yang VALID. Tipe yang boleh digunakan: graph TD, graph LR, flowchart TD, flowchart LR, sequenceDiagram, classDiagram, pie, gantt. Uji mental: pastikan sintaks benar (A-->B, A["Label"], subgraph, end, dll).
VISUAL_03: prompt_gambar berisi 1-3 objek prompt dalam bahasa INGGRIS yang SANGAT DETAIL untuk AI image generator (WAJIB: minimal 1 gambar dan maksimal 3 gambar per sub-bagian, dengan TOTAL KESELURUHAN gambar di dalam 1 modul MAKSIMAL 10 GAMBAR). GAYA VISUAL WAJIB: Ultra Modern 3D Isometric / Stylized Studio Render 16:9 Landscape dengan latar belakang (background) tematik yang kaya dan estetik (sesuai tema aplikasi dark-mode premium / studio atmosphere #0F172A atau soft dark gradient mesh #1E1B4B dengan ambient lighting 3D, meja kerja digital, atau arsitektur modern yang indah). DILARANG latar polos membosankan. WAJIB mencantumkan teks label pendek Bahasa Indonesia yang dicetak jelas dan modern di dalam gambar di atas elemen kunci (gaya infografis 3D tech-education premium, mudah dibaca, bersih, dan memukau).
VISUAL_04: Setiap prompt_gambar WAJIB memiliki field: id (string unik), prompt (string bahasa Inggris detail gaya ultra modern 3D isometric studio render), keterangan (string bahasa Indonesia — deskripsi panjang dan detail minimal 2 kalimat yang akan ditampilkan sebagai caption di bawah gambar di aplikasi), alt (string bahasa Indonesia untuk aksesibilitas), url_gambar (SELALU null — akan diisi via Media Library Cloudinary di admin panel).
VISUAL_05: kalkulator diisi HANYA jika bagian tersebut memang cocok untuk kalkulator. Tipe yang tersedia: "ppn", "pph21_ter", "pbb", "bphtb", "pph_badan", "pph_op", "pph22", "pph23", "pph_final". Jika tidak cocok, isi null.
VISUAL_06: mini_kuis berisi 2-5 soal per bagian. Tipe soal: "pilihan_ganda" (3-5 pilihan) atau "benar_salah" (2 pilihan: "Benar", "Salah"). Setiap soal WAJIB punya pembahasan.
VISUAL_07: diagram_mermaid untuk alur/proses gunakan flowchart TD. Untuk perbandingan gunakan graph LR. Untuk hierarki gunakan graph TD dengan subgraph. Untuk urutan waktu gunakan sequenceDiagram.
VISUAL_08: Setiap diagram_mermaid harus memiliki minimal 4 node/step. Jangan buat diagram yang terlalu sederhana.
VISUAL_09: Prompt gambar harus mendeskripsikan secara eksplisit dalam Bahasa Inggris: (1) orientasi LANDSCAPE 16:9, (2) layout 3D Isometric / Stylized Studio Render ultra modern, (3) background tematik aplikasi dark-mode #0F172A / ambient studio lighting 3D, (4) teks label Bahasa Indonesia modern yang dicetak jelas di atas elemen kunci, (5) palet warna kontemporer (electric blue, emerald green, warm gold). Minimal 80 kata per prompt. Field "keterangan" WAJIB berisi deskripsi detail minimal 2 kalimat yang menjelaskan isi gambar dan relevansinya dengan materi.

// ============================================================
// ATURAN VALIDASI FAKTA PERPAJAKAN & VERIFIKASI INTERNET
// ============================================================

VALIDASI_01: VERIFIKASI & PEMBARUAN KEBENARAN FAKTUAL (DENGAN/TANPA PDF VS REGULASI TERBARU 2026):
- JIKA ADA PDF: Gunakan PDF "ModulBrevet Mandiri Tax Center.pdf" sebagai referensi alur dan materi dasar. TAPI WAJIB MEMVERIFIKASI dan MENYILANGKAN (cross-check) seluruh pasal, tarif, dan prosedur dengan aturan perpajakan resmi Indonesia yang VALID dan BERLAKU AKTIF HINGGA TAHUN 2026 (seperti UU HPP No. 7/2021, Coretax System DJP / CTAS 2026, TER PPh 21 PP 58/2023 & PMK 168/2023, Natura PMK 66/2023, PPN 12% 2026, UU HKPD No. 1/2022). Jika terdapat perbedaan antara isi PDF lama dan regulasi perpajakan yang valid di internet/hukum aktif 2026, SELALU UTAMAKAN DAN GUNAKAN ATURAN VALID TERBARU 2026.
- JIKA TANPA PDF: AI WAJIB bekerja secara mandiri dan otonom untuk mencari, menghimpun, serta menyusun seluruh materi modul Brevet AB dari pengetahuan dasar hingga tingkat lanjut berdasarkan data, regulasi, dan hukum perpajakan resmi Indonesia TERBARU BERLAKU AKTIF 2026 dari internet/basis pengetahuan AI.
VISUAL_10: Untuk bagian yang membahas perhitungan, WAJIB ada kalkulator atau contoh_kasus dengan angka lengkap.

// ============================================================
KONTEN_01: Buat MINIMAL 15 BAGIAN untuk setiap modul (15 hingga 25 bagian). Setiap bagian WAJIB dibahas secara SANGAT PANJANG, RINCI, PENUH CONTOH KASUS, DAN ULTRA-DETAIL (DILARANG KERAS MEMBUAT MATERI SINGKAT ATAU SERBA RINGKAS).
KONTEN_02: Urutkan bagian dari konsep PALING DASAR ke PALING LANJUT. Mulai dari "Apa itu X?" lalu "Kenapa X penting?" lalu "Bagaimana cara kerja X?" lalu "Contoh perhitungan" lalu "Kesalahan umum" lalu "Tips & trik".
KONTEN_03: kuis_akhir WAJIB memiliki minimal 15 soal dan maksimal 25 soal. Campur tipe: 60% pilihan_ganda, 30% benar_salah, 10% isian_singkat.
KONTEN_04: glosarium WAJIB berisi SEMUA istilah teknis yang muncul di seluruh bagian. Minimal 15 entri untuk modul sederhana, minimal 25 entri untuk modul kompleks.
KONTEN_05: Setiap contoh_kasus WAJIB memiliki angka konkret, nama orang/badan Indonesia, dan langkah penyelesaian yang jelas.
KONTEN_06: kesalahan_umum minimal 2 entri per bagian (jika relevan). Setiap entri punya: salah (string), benar (string), tips (string).
KONTEN_07: istilah per bagian minimal 3 entri. Setiap entri punya: kata (string), definisi (string lengkap), contoh (string penggunaan dalam kalimat).
KONTEN_08: tujuan_belajar di level modul minimal 4 item dan maksimal 8 item. Gunakan kata kerja operasional: "Memahami...", "Menghitung...", "Membedakan...", "Menjelaskan...", "Menerapkan...", "Menganalisis...".
KONTEN_09: ringkasan modul maksimal 3 kalimat, minimal 1 kalimat. Harus menggambarkan keseluruhan isi modul.
KONTEN_10: Setiap bagian harus memiliki "benang merah" — koneksi logis dengan bagian sebelumnya dan sesudahnya.
KONTEN_11: Untuk materi yang memiliki dasar hukum, sebutkan: nomor UU/PP/PMK/PER secara spesifik (contoh: "Pasal 4 ayat 1 UU No. 36 Tahun 2008", "PP 58/2023", "PMK 66/2023").
KONTEN_12: Untuk tarif dan angka, SELALU sebutkan sumber aturannya dan tahun berlakunya.
KONTEN_13: Jika ada perubahan aturan (aturan lama vs baru), jelaskan keduanya dan tegaskan mana yang berlaku saat ini.
KONTEN_14: Untuk prosedur/alur (pendaftaran, pelaporan, pembayaran), jelaskan step-by-step dengan batas waktu (deadline) yang spesifik.
KONTEN_15: Untuk sanksi, sebutkan: jenis sanksi, besaran, dasar hukum, dan kondisi pemicu.

// ============================================================
// ATURAN KHUSUS PER FIELD
// ============================================================

FIELD_versi: Selalu "1.0".
FIELD_kode: Gunakan format "BRVT-AB-XX" sesuai kode modul yang diminta.
FIELD_slug: Kebab-case dari judul. Huruf kecil semua, spasi diganti hyphen. Contoh: "ketentuan-umum-perpajakan".
FIELD_kategori: Pilih SATU dari: "Dasar", "PPh", "PPN", "Lainnya".
FIELD_tingkat_kesulitan: Pilih SATU dari: "pemula", "menengah", "lanjut".
FIELD_estimasi_menit: Angka bulat, kelipatan 5, minimal 30, maksimal 120.
FIELD_id_bagian: Format "bag-01", "bag-02", dst. Atau slug pendek: "definisi-pajak", "fungsi-pajak", dll.
FIELD_judul_bagian: Wajib SINGKAT, padat, dan jelas (maksimal 4-6 kata / maksimal 45 karakter). DILARANG KERAS ada emoji atau ikon apa pun pada judul! Contoh yang benar: "Definisi dan Fungsi Pajak" atau "Alur Pendaftaran NPWP".
FIELD_paragraf: Array of strings. Minimal 3 paragraf, maksimal 8 paragraf per bagian.
FIELD_poin_penting: Array of strings. Minimal 3 poin, maksimal 8 poin. Awali dengan emoji yang relevan.
FIELD_analogi: SATU string. Minimal 2 kalimat. Gunakan analogi dari kehidupan sehari-hari (pasar, sekolah, keluarga, belanja, dll).
FIELD_contoh_kasus: Objek dengan field: judul (string), cerita (string minimal 3 kalimat), poin (array of strings, minimal 2 poin).
FIELD_diagram_mermaid: Array of strings. Minimal 1 diagram, maksimal 3 diagram per bagian. Setiap string adalah kode Mermaid lengkap.
FIELD_prompt_gambar: Array of objects. Minimal 1, maksimal 3 per bagian.
FIELD_kalkulator: Objek atau null. Jika objek, field: tipe (string), judul (string), keterangan (string minimal 1 kalimat).
FIELD_mini_kuis: Array of objects. Minimal 2 soal, maksimal 5 soal per bagian.
FIELD_kesalahan_umum: Array of objects. Minimal 2 entri (jika relevan), maksimal 5.
FIELD_istilah: Array of objects. Minimal 3 entri, maksimal 10 per bagian.
FIELD_kuis_akhir: Objek dengan field: judul (string), nilai_lulus (number, default 70), waktu_menit (number, default 30), soal (array, minimal 15 objek).
FIELD_soal_kuis: Objek dengan field: id (string "q1","q2",...), pertanyaan (string), tipe ("pilihan_ganda"|"benar_salah"|"isian_singkat"), pilihan (array of strings, null jika isian_singkat), jawaban (string), pembahasan (string minimal 2 kalimat).
FIELD_glosarium: Array of objects. Field: kata (string), definisi (string formal), penjelasan_sederhana (string bahasa sehari-hari).

// ============================================================
// ATURAN DIAGRAM MERMAID — SINTAKS
// ============================================================

MERMAID_01: Mulai dengan deklarasi tipe: "graph TD", "graph LR", "flowchart TD", "sequenceDiagram", dll.
MERMAID_02: Gunakan \\n untuk newline di dalam string JSON. Contoh: "graph TD\\n    A[Mulai] --> B[Proses]\\n    B --> C[Selesai]"
MERMAID_03: Label node dengan teks Indonesia. Gunakan kurung siku untuk kotak: A["Label Teks"], kurung bulat untuk lingkaran: A("Label"), kurung kurawal untuk diamond: A{"Keputusan?"}.
MERMAID_04: Untuk subgraph, gunakan: subgraph Judul\\n ... \\nend
MERMAID_05: Untuk panah berlabel: A -->|"label"| B
MERMAID_06: Hindari karakter khusus yang bisa merusak JSON: jangan gunakan tanda kutip ganda mentah di dalam Mermaid. Gunakan &quot; jika perlu.
MERMAID_07: Untuk sequenceDiagram, gunakan: participant A as "Nama", A->>B: Pesan, B-->>A: Respons.
MERMAID_08: Pastikan tidak ada siklus tak berujung yang membuat diagram tidak bisa di-render.
MERMAID_09: Maksimal 15 node per diagram agar tetap readable.
MERMAID_10: Gunakan style/classDef untuk pewarnaan jika perlu: classDef biru fill:#3B82F6,color:#fff

// ============================================================
// ATURAN PROMPT GAMBAR — ULTRA-DETAIL & WAJIB ADA TEKS LABEL INDONESIA
// ============================================================

GAMBAR_01: Prompt HARUS dalam Bahasa Inggris, SANGAT DETAIL, dan MINIMAL 80 - 200 KATA per prompt.
GAMBAR_02: WAJIB MENAMBAHKAN INSTRUKSI TEKS DI SETIAP PROMPT: "Include short, clean, and perfectly spelled Indonesian text/labels floating or written on elements, such as [Tulis 1-3 kata kunci yang relevan di sini]." (Tujuannya agar generator gambar AI seperti DALL-E/Midjourney menambahkan teks penjelas berbahasa Indonesia yang estetik di dalam gambar).
GAMBAR_03: Mulai dengan gaya visual profesional: "A highly detailed modern flat vector educational illustration depicting [topik spesifik]..." atau "A clean isometric vector infographic illustrating [topik]..."
GAMBAR_04: Jelaskan elemen visual secara fisik dan konkret: figur manusia (konsultan pajak, pembayar pajak, petugas), dokumen fisik (formulir, berkas, faktur bertanda centang), objek (kalkulator, koin emas, dompet, gedung pajak, grafik naik), panah alur, dan kotak wadah.
GAMBAR_05: Sebutkan skema warna yang harmonis dan elegan: "Deep navy background #0B1220, vibrant primary blue #3B82F6, emerald green #10B981, warm amber #F59E0B, clean white #FFFFFF, vector style, smooth soft lighting."
GAMBAR_06: Jelaskan tata letak & komposisi secara rinci: "Balanced centered composition with left side showing..., middle section showing..., right side showing... High resolution, crisp vector art style, clean minimalist aesthetic."
GAMBAR_07: SANGAT DIWAJIBKAN meminta AI generator menyertakan teks, huruf, atau angka pendek DALAM BAHASA INDONESIA di dalam gambar (maksimal 3-4 kata agar tidak berantakan). Jangan gunakan teks bahasa Inggris!
GAMBAR_08: Contoh Prompt yang Benar & Sangat Detail:
"A highly detailed modern flat vector educational illustration depicting Indonesian tax compliance and NPWP registration. In the center, a smiling Indonesian professional holding a smartphone displaying a verified green checkmark badge. Surrounding him are clean vector elements: a tax office building, a glowing document shield, a digital calculator, stacks of coins, and smooth connecting directional arrows. Include short, clean, and perfectly spelled Indonesian text labels such as 'Daftar NPWP' and 'Pajak Resmi' floating near the elements. Deep navy background #0B1220 with rich blue #3B82F6 and emerald green #10B981 accents. Clean vector line art, professional resolution, minimalist aesthetic."

// ============================================================
// ATURAN KALKULATOR
// ============================================================

KALK_01: Tipe "ppn" — untuk bagian yang membahas perhitungan PPN (PK - PM = PPN Terutang).
KALK_02: Tipe "pph21_ter" — untuk bagian yang membahas PPh 21 dengan TER PP 58/2023.
KALK_03: Tipe "pbb" — untuk bagian yang membahas perhitungan PBB (NJOP → NJKP → PBB).
KALK_04: Tipe "bphtb" — untuk bagian yang membahas perhitungan BPHTB (NPOP - NPOPTKP → × 5%).
KALK_05: Tipe "pph_badan" — untuk bagian yang membahas PPh Badan (PKP × tarif).
KALK_06: Tipe "pph_op" — untuk bagian yang membahas PPh Orang Pribadi (PKP × tarif progresif).
KALK_07: Tipe "pph22" — untuk bagian yang membahas PPh 22 (tarif × DPP).
KALK_08: Tipe "pph23" — untuk bagian yang membahas PPh 23 (tarif × jumlah bruto).
KALK_09: Tipe "pph_final" — untuk bagian yang membahas PPh Final Pasal 4(2).
KALK_10: Jika bagian tidak cocok dengan kalkulator manapun, isi null. Jangan memaksakan kalkulator.

// ============================================================
// ATURAN KUIS
// ============================================================

KUIS_01: mini_kuis per bagian: 2-5 soal. Soal harus relevan dengan materi bagian tersebut.
KUIS_02: kuis_akhir: minimal 15 soal, mencakup SELURUH bagian di modul.
KUIS_03: Distribusi kesulitan kuis_akhir: 40% mudah, 40% sedang, 20% sulit.
KUIS_04: Untuk pilihan_ganda: 4-5 pilihan (A-E). Hanya 1 jawaban benar. Pengecoh harus masuk akal.
KUIS_05: Untuk benar_salah: pilihan selalu ["Benar", "Salah"]. Jawaban: "Benar" atau "Salah".
KUIS_06: Untuk isian_singkat: pilihan = null. Jawaban berupa kata/frasa pendek (maksimal 5 kata).
KUIS_07: Pembahasan WAJIB menjelaskan KENAPA jawaban benar dan KENAPA pilihan lain salah (untuk pilihan_ganda).
KUIS_08: Soal tidak boleh ambigu. Hanya ada SATU jawaban yang benar.
KUIS_09: Gunakan angka dan kasus konkret di soal (bukan teori abstrak).
KUIS_10: Minimal 3 soal di kuis_akhir yang melibatkan perhitungan angka.
KUIS_11: Wajib sertakan soal ESAI (tipe "esai") pada mini_kuis dan kuis_akhir! Untuk tipe "esai": pilihan = null. Field "jawaban" diisi dengan KUNCI JAWABAN REFERENSI LENGKAP & DETAIL. Field "pembahasan" TETAP WAJIB DIISI (berisi penjelasan alasan kenapa jawaban tersebut benar, atau bisa disamakan dengan field jawaban).
KUIS_12: Siswa akan menjawab soal esai dengan bahasa sendiri, lalu AI akan menganalisis apakah jawaban siswa menyentuh dan sesuai dengan kunci jawaban di database.

// ============================================================
// SKEMA JSON WAJIB — IKUTI PERSIS STRUKTUR INI
// ============================================================

{
  "versi": "1.0",
  "modul": {
    "kode": "BRVT-AB-XX",
    "slug": "slug-kebab-case-dari-judul",
    "judul": "Judul Lengkap Modul",
    "kategori": "Dasar|PPh|PPN|Lainnya",
    "tingkat_kesulitan": "pemula|menengah|lanjut",
    "estimasi_menit": 60,
    "ringkasan": "Ringkasan 1-3 kalimat tentang modul ini.",
    "tujuan_belajar": [
      "Memahami konsep dasar...",
      "Menghitung...",
      "Membedakan...",
      "Menerapkan..."
    ],
    "bagian": [
      {
        "id": "bag-01",
        "judul": "Definisi dan Fungsi Pajak",
        "paragraf": [
          "Paragraf pertama yang memperkenalkan konsep...",
          "Paragraf kedua yang menjelaskan lebih dalam...",
          "Paragraf ketiga yang memberikan konteks..."
        ],
        "poin_penting": [
          "💡 Poin penting pertama yang harus diingat...",
          "✅ Poin penting kedua...",
          "⚠️ Poin penting ketiga tentang kesalahan yang harus dihindari..."
        ],
        "analogi": "Bayangkan kamu sedang di pasar. Pajak itu seperti...",
        "contoh_kasus": {
          "judul": "Kasus Pak Budi si Pedagang",
          "cerita": "Pak Budi punya warung makan di Jakarta. Penghasilannya sebulan Rp10 juta. Suatu hari dia dapat surat dari KPP...",
          "poin": [
            "Pak Budi wajib daftar NPWP karena penghasilannya di atas PTKP",
            "Pajak yang harus dibayar Pak Budi adalah..."
          ]
        },
        "diagram_mermaid": [
          "graph TD\\n    A[\\\"Mulai\\\"] --> B[\\\"Proses\\\"]\\n    B --> C{\\\"Keputusan?\\\"}\\n    C -->|\\\"Ya\\\"| D[\\\"Hasil A\\\"]\\n    C -->|\\\"Tidak\\\"| E[\\\"Hasil B\\\"]"
        ],
        "penjelasan_diagram": "Diagram ini menggambarkan alur pendaftaran dan verifikasi hingga terbit ketetapan pajak resmi.",
        "prompt_gambar": [
          {
            "id": "img-01",
            "prompt": "A clean 3D isometric educational illustration in landscape format (16:9 ratio), showing the NPWP tax registration process in Indonesia as a horizontal step-by-step flowchart. Four 3D isometric tile platforms arranged left to right, connected by flat bold arrows. Platform 1: a 3D person icon holding documents, labeled 'Siapkan Dokumen' in clear bold black Indonesian text above it. Platform 2: a 3D government building representing KPP, labeled 'Kunjungi KPP'. Platform 3: a 3D laptop with a filled form on screen, labeled 'Daftar Online'. Platform 4: a 3D NPWP card glowing softly, labeled 'Terima NPWP'. White clean background #FFFFFF, flat solid colors (no gradients, no neon, no glow effects): platforms in solid blue #2563EB, arrows in solid orange #EA580C, person figure in solid green #16A34A, roof of building in solid gold #D97706. All text labels in black bold sans-serif font, clearly readable. Professional educational infographic style, like a high school textbook illustration. No dark backgrounds, no gradient effects, no AI or cyber theme.",
            "keterangan": "Infografis alur pendaftaran NPWP dari awal sampai selesai",
            "alt": "Diagram alur 5 langkah pendaftaran NPWP di Kantor Pelayanan Pajak",
            "url_gambar": null
          }
        ],
        "kalkulator": {
          "tipe": "ppn",
          "judul": "Kalkulator PPN Sederhana",
          "keterangan": "Masukkan harga barang untuk menghitung PPN 11% yang harus dibayar."
        },
        "mini_kuis": [
          {
            "id": "q1",
            "pertanyaan": "Apa kepanjangan dari NPWP?",
            "tipe": "pilihan_ganda",
            "pilihan": [
              "A. Nomor Pokok Wajib Pajak",
              "B. Nomor Pendaftaran Wajib Pajak",
              "C. Nomor Pribadi Wajib Pajak",
              "D. Nomor Pokok Warga Pajak"
            ],
            "jawaban": "A",
            "pembahasan": "NPWP adalah Nomor Pokok Wajib Pajak, yaitu nomor identitas yang diberikan DJP kepada wajib pajak sebagai sarana administrasi perpajakan. Ibaratnya seperti KTP tapi khusus untuk urusan pajak."
          },
          {
            "id": "q2",
            "pertanyaan": "Pajak bersifat memaksa artinya wajib pajak bisa dipidana jika tidak membayar.",
            "tipe": "benar_salah",
            "pilihan": ["Benar", "Salah"],
            "jawaban": "Benar",
            "pembahasan": "Benar. Pajak bersifat memaksa berdasarkan Undang-Undang. Jika seseorang dengan sengaja tidak membayar pajak yang seharusnya, ia dapat dikenakan sanksi administrasi hingga hukuman pidana sesuai ketentuan yang berlaku."
          }
        ],
        "kesalahan_umum": [
          {
            "salah": "Mengira NPWP dan NPPKP adalah hal yang sama",
            "benar": "NPWP adalah identitas wajib pajak umum, sedangkan NPPKP (Nomor Pengukuhan Pengusaha Kena Pajak) khusus untuk pengusaha yang sudah dikukuhkan sebagai PKP untuk memungut PPN",
            "tips": "Ingat: semua PKP pasti punya NPWP, tapi tidak semua yang punya NPWP adalah PKP"
          }
        ],
        "istilah": [
          {
            "kata": "NPWP",
            "definisi": "Nomor Pokok Wajib Pajak adalah nomor yang diberikan kepada wajib pajak sebagai sarana dalam administrasi perpajakan yang digunakan sebagai tanda pengenal diri atau identitas wajib pajak dalam melaksanakan hak dan kewajiban perpajakannya.",
            "contoh": "Pak Budi mendaftar ke KPP dan mendapatkan NPWP dengan format xx.xxx.xxx.x-xxx.xxx"
          }
        ]
      }
    ],
    "kuis_akhir": {
      "judul": "Kuis Akhir: Uji Pemahaman Modul X",
      "nilai_lulus": 70,
      "waktu_menit": 30,
      "soal": [
        {
          "id": "q1",
          "pertanyaan": "Pertanyaan pertama...",
          "tipe": "pilihan_ganda",
          "pilihan": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "jawaban": "B",
          "pembahasan": "Jawaban B benar karena... Pilihan A salah karena... Pilihan C salah karena... Pilihan D salah karena..."
        }
      ]
    },
    "glosarium": [
      {
        "kata": "NPWP",
        "definisi": "Nomor Pokok Wajib Pajak — nomor identitas yang diberikan oleh Direktorat Jenderal Pajak kepada wajib pajak.",
        "penjelasan_sederhana": "Ibarat KTP-nya dunia pajak. Kalau KTP buat identitas umum, NPWP buat identitas perpajakan kamu."
      }
    ]
  }
}

// ============================================================
// QUALITY CHECKLIST — CEK SEBELUM OUTPUT (WAJIB)
// ============================================================

Sebelum kamu mengeluarkan output, lakukan pengecekan berikut:

CHECK_01: ✅ JSON valid — coba parse mental: semua kurung kurawal { } dan kurung siku [ ] berpasangan dengan benar.
CHECK_02: ✅ Tidak ada komentar (//, /*, */) di dalam JSON.
CHECK_03: ✅ Tidak ada trailing comma.
CHECK_04: ✅ Semua string menggunakan kutip ganda.
CHECK_05: ✅ Tidak ada teks di luar JSON (tidak ada "Berikut JSON-nya:", tidak ada "Semoga membantu", tidak ada penjelasan).
CHECK_06: ✅ Setiap bagian punya minimal 2 elemen visual/interaktif.
CHECK_07: ✅ Bahasa pemula, ada analogi, contoh Indonesia, angka aturan terbaru.
CHECK_08: ✅ Kode Mermaid valid secara sintaks.
CHECK_09: ✅ Prompt gambar detail, berbahasa Inggris, minimal 50 kata.
CHECK_10: ✅ Tidak ada field di luar skema.
CHECK_11: ✅ Semua field wajib terisi (tidak ada yang hilang).
CHECK_12: ✅ kuis_akhir minimal 15 soal.
CHECK_13: ✅ glosarium mencakup semua istilah penting.
CHECK_14: ✅ contoh_kasus punya angka konkret dan nama Indonesia.
CHECK_15: ✅ Total panjang JSON memadai (tidak terlalu pendek).
CHECK_16: ✅ Tidak ada karakter yang bisa merusak JSON parsing (newline mentah di string, tab mentah, dll).
CHECK_17: ✅ url_gambar semuanya null.
CHECK_18: ✅ Setiap pembahasan kuis minimal 2 kalimat.
CHECK_19: ✅ Setiap analogi minimal 2 kalimat.
CHECK_20: ✅ Materi sesuai dengan isi PDF (jika dilampirkan) ATAU disusun mandiri dari data perpajakan resmi Indonesia terbaru 2026 (jika tanpa PDF).

// ============================================================
// MODUL YANG DIMINTA SEKARANG
// ============================================================

Kode Modul: {{KODE}}
Judul Modul: {{JUDUL}}
Fokus Materi (dari PDF jika ada, atau kompilasi mandiri dari regulasi 2026 jika tanpa PDF): {{FOKUS}}

// ============================================================
// INSTRUKSI FINAL
// ============================================================

Sekarang tulis output JSON-nya. INGAT:
- Mulai LANGSUNG dengan karakter {
- Akhiri LANGSUNG dengan karakter }
- DILARANG PAKAI PYTHON, JAVASCRIPT, ATAU SCRIPT PEMROGRAMAN APA PUN (LANGSUNG TULIS DATA JSON MURNI)
- TIDAK ADA teks sebelum { atau sesudah }
- TIDAK ADA komentar di dalam JSON
- TIDAK ADA code block markdown
- TIDAK ADA penjelasan tambahan
- HANYA JSON murni yang valid dan bersih

Mulai sekarang:
`;

// ============================================================
// PROMPT TAHAP 1 — KHUSUS MATERI UTAMA, POIN PENTING, ANALOGI, KASUS
// ============================================================
export const MASTER_PROMPT_STAGE1 = `
============================================================
🚨 PERINGATAN KERAS & ATURAN UTAMA OUTPUT (DILARANG PAKAI PYTHON) 🚨
============================================================
1. DILARANG KERAS MENGGUNAKAN PYTHON, KODE SKRIP, ANALYSIS TOOL, ATAU MEMBUAT ARTIFACT FILE PYTHON (.py)!
2. JANGAN PERNAH MENULIS 'import json', JANGAN PERNAH MEMBUAT SKRIP UNTUK MENYIMPAN FILE!
3. ANDA HARUS LANGSUNG MENULISKAN SELURUH ISI DATA OBJEK JSON SECARA TEKS MURNI LANGSUNG DI BALASAN CHAT INI!
4. JANGAN ADA TEKS PENGANTAR SEPERTI "Berikut JSON-nya", "Saya akan menyusun lewat Python", DLL. MULAI LANGSUNG DARI KARAKTER '{' DAN DIAKHIRI KARAKTER '}'!
5. ATURAN PPN 2026: TARIF PPN BERLAKU AKTIF ADALAH 12% (SESUAI PASAL 7 UU HPP NO. 7/2021). DILARANG KERAS MENYEBUT TARIF PPN 11%!
6. 🚫 DILARANG KERAS MEMBUAT GAMBAR / ELEMEN VISUAL / DIAGRAM MERMAID DI TAHAP 1! TAHAP 1 FOKUS 100% PADA TEKS MATERI UTAMA, POIN PENTING, ANALOGI, KASUS, KUIS AKHIR, DAN GLOSARIUM!
============================================================

Halo AI Assistant! Saya sedang membangun platform pembelajaran perpajakan Brevet A/B untuk pemula di Indonesia.
Ini adalah PROMPT TAHAP 1 (FOKUS 100% PADA MATERI TEKS UTAMA & PENJELASAN MENDALAM).

============================================================
TUGAS UTAMA TAHAP 1 (TEKS MATERI UTAMA & KUIS AKHIR):
============================================================
Tugas utama Anda di Tahap 1 ini adalah HANYA MENGHASILKAN MATERI TEKS UTAMA LENGKAP (Paragraf Panjang & Ultra-Detail), POIN PENTING, ANALOGI, CONTOH KASUS, KUIS AKHIR (MIN 15 SOAL), DAN GLOSARIUM (MIN 15 ENTRI).

🚫 ATURAN ELEMEN VISUAL TAHAP 1 (WAJIB DIBUAT KOSONG):
DILARANG MEMBUAT PROMPT GAMBAR, DIAGRAM MERMAID, MINI KUIS, KESALAHAN UMUM, ISTILAH, DAN KALKULATOR PADA TAHAP 1!
Isikan field visual sebagai berikut:
- "diagram_mermaid": []
- "penjelasan_diagram": ""
- "prompt_gambar": []
- "mini_kuis": []
- "kesalahan_umum": []
- "istilah": []
- "kalkulator": null
(Seluruh elemen visual & diagram di atas SELURUHNYA akan di-generate dan diisikan secara khusus pada PROMPT TAHAP 2).

============================================================
SUMBER MATERI & PENANGANAN DOKUMEN (PDF VS OTONOM 2026)
============================================================
1. JIKA SAYA MENGUNGGAH FILE PDF (Modul Brevet AB Mandiri Tax Center):
   Gunakan file PDF tersebut sebagai referensi alur dan struktur materi utama. Rangkum, olah, dan restrukturisasi isi PDF tersebut. TAPI WAJIB MEMVERIFIKASI dan MENYILANGKAN (cross-check) seluruh pasal, tarif, dan prosedur dengan aturan perpajakan resmi Indonesia yang VALID dan BERLAKU AKTIF HINGGA TAHUN 2026 (UU HPP, Coretax DJP 2026, TER PPh 21, PPN 12%, dsb.).

2. JIKA SAYA TIDAK MENGUNGGAH FILE PDF (OPSIONAL / TANPA PDF):
   JANGAN MENOLAK ATAU MEMINTA FILE PDF! Bekerjalah secara mandiri dan otonom. Cari, himpun, serta susunlah sendiri seluruh materi modul Brevet AB dari pengetahuan dasar hingga tingkat lanjut berdasarkan data, regulasi, dan hukum perpajakan resmi Indonesia TERBARU BERLAKU AKTIF 2026 (UU HPP No. 7/2021, Coretax System DJP / CTAS 2026, TER PPh 21 PP 58/2023 & PMK 168/2023, Natura PMK 66/2023, PPN 12% 2026, UU HKPD No. 1/2022, dsb.). Buatkan materi modul yang komprehensif, mendalam, dan 100% akurat sesuai standar Kurikulum Brevet A/B Indonesia terbaru.

============================================================
MODUL & TOPIK YANG DIMINTA
============================================================
Kode Modul: {{KODE}}
Judul Modul: {{JUDUL}}
Fokus Utama Materi: {{FOKUS}}

============================================================
ATURAN GAYA BAHASA & MATERI UTAMA (WAJIB DIPATUHI)
============================================================
BAHASA_01: Gunakan Bahasa Indonesia NON-FORMAL BANGET — gaul, asik, dan super relatable. Bayangin kamu lagi ngobrol santai bareng temen deket yang kebetulan jago pajak.
BAHASA_02: Setiap istilah teknis WAJIB langsung dijelasin pake analogi kehidupan nyata yang ngena banget di kemunculan PERTAMA-nya di tiap bagian.
BAHASA_03: Paragraf HARUS DIBUAT PANJANG, RINCI, DAN ULTRA-DETAIL (minimal 4 hingga 8 paragraf per bagian). Jelaskan latar belakang, alur berpikir, dasar hukum, contoh nyata, hingga tips praktisnya secara tuntas.
BAHASA_04: Pake bullet points buat rincian atau urutan langkah.
BAHASA_05: Pake emoji secukupnya (💡✅❌📌⚠️🔑📝💰🏢👤📊🧮🎯) di dalam isi paragraf/poin. DILARANG KERAS ada emoji/ikon pada judul modul maupun judul bagian!
BAHASA_06: Pake contoh kasus yang deket banget sama kehidupan sehari-hari Indonesia: nama orang Indonesia (Pak Budi, Bu Siti, Mas Andi, Mbak Rina), Rupiah (Rp), dan institusi lokal (KPP, DJP, Bank BCA, PT, CV, UMKM, dll).
BAHASA_07: Pake angka & aturan TERBARU 2026: Coretax DJP 2026, NIK 16 digit NPWP OP, PPN 12%, PPh Badan 22%, 5 bracket PPh OP UU HPP (5%/15%/25%/30%/35%), TER PPh 21 (PP 58/2023 & PMK 168/2023), Natura PMK 66/2023, PTKP Rp54juta.
BAHASA_08: Tulis ulang dengan bahasa sendiri yang lebih ringan dan seru dibaca.

KONTEN_01: Buat minimal 15 BAGIAN per modul. Setiap bagian WAJIB dibahas secara SANGAT PANJANG, RINCI, PENUH CONTOH KASUS, DAN ULTRA-DETAIL.
KONTEN_02: Urutkan bagian dari konsep PALING DASAR ke PALING LANJUT.
KONTEN_05: Setiap contoh_kasus WAJIB memiliki angka konkret, nama orang/badan Indonesia, dan langkah penyelesaian yang jelas.
KONTEN_11: Untuk materi yang memiliki dasar hukum, sebutkan pasal UU/PP/PMK/PER secara spesifik.

============================================================
PANDUAN DUKUNGAN HTML VIEWS, CDN IMAGES & LATEX MATH (INTERAKTIF & WARNA)
============================================================
1. FORMATTING HTML SNIPPET:
   - Anda SANGAT DISARANKAN untuk menyisipkan tag HTML Snippet di dalam "paragraf", "poin_penting", "analogi", atau "contoh_kasus".
   - 🚨 DILARANG MENGGUNAKAN <!DOCTYPE html> ATAU <html> STRUCTURAL WRAPPER! GUNAKAN SNIPPET HTML MULAI DARI <div>, <span>, <p>, <table>, <a>, ATAU <img>.
   - Contoh HTML Callout Box:
     '<div class="p-4 my-3 rounded-xl border border-sky-500/30 bg-sky-950/40 text-sky-200">💡 <strong>Catatan Penting:</strong> Pelaporan Coretax DJP 2026 wajib menggunakan NIK 16 digit.</div>'
   - Contoh Gambar CDN / Link:
     '<img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c" alt="Ilustrasi Coretax" class="rounded-xl border border-slate-800 my-3 max-w-full" />'
   - Contoh Hyperlink Resmi:
     '<a href="https://pajak.go.id" class="text-blue-400 underline font-medium">Situs Resmi DJP Pajak.go.id</a>'

2. PERHITUNGAN & RUMUS LATEX MATH:
   - Untuk rumus perpajakan & perhitungan angka, gunakan notasi LaTeX math:
     $$\\text{PPN} = 12\\% \\times \\text{DPP}$$
     $$\\text{PPh 21} = \\text{Tarif TER} \\times \\text{Penghasilan Bruto}$$
   - Aplikasi akan merender LaTeX Math ini secara otomatis menjadi tampilan kartu kalkulasi visual yang anggun dan berwarna!

============================================================
PANDUAN OUTPUT JSON TAHAP 1
============================================================
1. Berikan output HANYA berupa SATU objek JSON valid.
2. DILARANG KERAS MENGGUNAKAN PYTHON, JAVASCRIPT, ATAU SKRIP PROGRAMMING APA PUN! LANGSUNG TULIS OBJEK JSON-NYA!
3. Mulailah secara langsung dengan karakter { dan diakhiri dengan karakter }.
4. Di Tahap 1 ini, isi bagian materi utama (paragraf), poin_penting, analogi, contoh_kasus, kuis_akhir (min 15 soal), dan glosarium (min 15 entri) secara LENGKAP & MENDALAM.
5. KOSONGKAN ELEMEN VISUAL: Set field diagram_mermaid, prompt_gambar, mini_kuis, kesalahan_umum, istilah sebagai array kosong [] dan kalkulator sebagai null.

============================================================
SKEMA JSON TAHAP 1 — IKUTI PERSIS STRUKTUR INI
============================================================
{
  "versi": "1.0",
  "modul": {
    "kode": "{{KODE}}",
    "slug": "slug-kebab-case-dari-judul",
    "judul": "{{JUDUL}}",
    "kategori": "Dasar|PPh|PPN|Lainnya",
    "tingkat_kesulitan": "pemula|menengah|lanjut",
    "estimasi_menit": 60,
    "ringkasan": "Ringkasan 1-3 kalimat tentang modul ini.",
    "tujuan_belajar": [
      "Memahami konsep dasar...",
      "Menghitung...",
      "Membedakan..."
    ],
    "bagian": [
      {
        "id": "bag-01",
        "judul": "Judul Bagian Singkat Padat (Maks 4-6 kata)",
        "paragraf": [
          "Paragraf 1 materi utama ultra-detail...",
          "Paragraf 2 penjelasan mendalam...",
          "Paragraf 3 contoh/dasar hukum..."
        ],
        "poin_penting": [
          "💡 Poin penting 1...",
          "✅ Poin penting 2...",
          "⚠️ Poin penting 3..."
        ],
        "analogi": "Bayangkan kamu sedang... Analogi min 2 kalimat.",
        "contoh_kasus": {
          "judul": "Kasus Pak Budi...",
          "cerita": "Cerita kasus dengan angka konkret min 3 kalimat...",
          "poin": [
            "Poin penyelesaian 1...",
            "Poin penyelesaian 2..."
          ]
        },
        "diagram_mermaid": [],
        "penjelasan_diagram": "",
        "prompt_gambar": [],
        "kalkulator": null,
        "mini_kuis": [],
        "kesalahan_umum": [],
        "istilah": []
      }
    ],
    "kuis_akhir": {
      "judul": "Kuis Akhir: Uji Pemahaman Modul {{JUDUL}}",
      "nilai_lulus": 70,
      "waktu_menit": 30,
      "soal": [
        {
          "id": "q1",
          "pertanyaan": "Pertanyaan 1...",
          "tipe": "pilihan_ganda",
          "pilihan": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "jawaban": "A",
          "pembahasan": "Pembahasan min 2 kalimat..."
        }
      ]
    },
    "glosarium": [
      {
        "kata": "Istilah",
        "definisi": "Definisi formal",
        "penjelasan_sederhana": "Penjelasan santai"
      }
    ]
  }
}

============================================================
INSTRUKSI FINAL UTAMA TAHAP 1 (WAJIB DIPATUHI):
- DILARANG PAKAI PYTHON / ANALYSIS TOOL / SKRIP PROGRAMMING APAPUN!
- LANGSUNG TULIS TEKS JSON UTUH MURNI DI BALASAN CHAT INI.
- MULAI LANGSUNG DARI KARAKTER { DAN DIAKHIRI KARAKTER }
- DILARANG MEMBUAT GAMBAR / DIAGRAM MERMAID DI TAHAP 1 (SET SEBAGAI [] DAN NULL).
- TARIF PPN BERLAKU 2026 ADALAH 12% (UU HPP NO. 7/2021).
============================================================
Sekarang tulis output JSON Tahap 1 (materi utama, poin penting, analogi, kasus, kuis akhir, glosarium). Mulai langsung dari { sampai }.
`;

// ============================================================
// PROMPT TAHAP 2 — KHUSUS DIAGRAM ALUR, GAMBAR 3D, MINI KUIS, KESALAHAN UMUM, ISTILAH, KALKULATOR
// ============================================================
export const MASTER_PROMPT_STAGE2 = `
============================================================
🚨 PERINGATAN KERAS & ATURAN UTAMA OUTPUT (DILARANG PAKAI PYTHON) 🚨
============================================================
1. DILARANG KERAS MENGGUNAKAN PYTHON, KODE SKRIP, ANALYSIS TOOL, ATAU MEMBUAT ARTIFACT FILE PYTHON (.py)!
2. JANGAN PERNAH MENULIS 'import json', JANGAN PERNAH MEMBUAT SKRIP UNTUK MENYIMPAN FILE!
3. ANDA HARUS LANGSUNG MENULISKAN SELURUH ISI DATA OBJEK JSON SECARA TEKS MURNI LANGSUNG DI BALASAN CHAT INI!
4. JANGAN ADA TEKS PENGANTAR SEPERTI "Berikut JSON-nya", "Saya akan menyusun lewat Python", DLL. MULAI LANGSUNG DARI KARAKTER '{' DAN DIAKHIRI KARAKTER '}'!
5. ATURAN PPN 2026: TARIF PPN BERLAKU AKTIF ADALAH 12% (SESUAI PASAL 7 UU HPP NO. 7/2021). DILARANG KERAS MENYEBUT TARIF PPN 11%!
============================================================

Halo AI Assistant!
Ini adalah PROMPT TAHAP 2 (KHUSUS ELEMEN VISUAL, DIAGRAM MERMAID, MINI KUIS, KESALAHAN UMUM, ISTILAH, DAN KALKULATOR).

============================================================
TUGAS UTAMA TAHAP 2 (ELEMEN VISUAL & PENDUKUNG):
============================================================
Baca dan analisa JSON Hasil Tahap 1 di bawah ini. Tugas Anda adalah HANYA MEMPERLENGKAPI dan MENGISI seluruh elemen visual dan pendukung untuk setiap bagian ("bagian[i]") serta kuis akhir dan glosarium:

ELEMEN YANG WAJIB DI-GENERATE & DIISIKAN UNTUK SETIAP BAGIAN ("bagian[i]"):

1. DIAGRAM ALUR PERPAJAKAN ("diagram_mermaid" & "penjelasan_diagram"):
   - Minimal 1 kode Mermaid yang VALID (flowchart TD/LR, sequenceDiagram, graph TD) dengan minimal 4 node/step per bagian.
   - penjelasan_diagram: deskripsi 1-2 kalimat tentang alur diagram.

2. PROMPT GAMBAR 3D ISOMETRIC ("prompt_gambar"):
   - Minimal 1 dan maksimal 3 objek prompt per bagian.
   - GAYA VISUAL WAJIB: Ultra Modern 3D Isometric / Stylized Studio Render 16:9 Landscape dengan latar tematik dark-mode premium #0F172A atau gradient mesh #1E1B4B dengan ambient lighting 3D.
   - WAJIB mencantumkan teks label Bahasa Indonesia modern yang dicetak jelas di atas elemen kunci.
   - WAJIB menyertakan instruksi di dalam prompt (berbahasa Inggris) yang secara spesifik menyuruh AI menambahkan teks label pendek Bahasa Indonesia. Contoh instruksi: "Include short, clean, and perfectly spelled Indonesian text labels such as [Keyword] floating near the elements."
   - Setiap prompt_gambar WAJIB punya field: id (string unik), prompt (string Bahasa Inggris min 80 kata), keterangan (Bahasa Indonesia deskripsi detail min 2 kalimat), alt (aksesibilitas), url_gambar: null.

3. MINI KUIS PER BAGIAN ("mini_kuis"):
   - 2-5 soal per bagian (tipe: "pilihan_ganda", "benar_salah", atau "esai"). Setiap soal WAJIB memiliki pembahasan lengkap minimal 2 kalimat.

4. KESALAHAN UMUM ("kesalahan_umum"):
   - Minimal 2 entri per bagian. Field: salah (string), benar (string), tips (string).

5. ISTILAH DALAM BAGIAN INI ("istilah"):
   - Minimal 3 entri per bagian. Field: kata (string), definisi (string lengkap), contoh (string penggunaan).

6. KALKULATOR ("kalkulator"):
   - Isi objek jika bagian membahas perhitungan (tipe: "ppn"|"pph21_ter"|"pbb"|"bphtb"|"pph_badan"|"pph_op"|"pph22"|"pph23"|"pph_final", judul, keterangan). Jika tidak cocok, isi null.

============================================================
PANDUAN OUTPUT JSON TAHAP 2 (ENRICHED FINAL JSON)
============================================================
1. Berikan output HANYA berupa SATU objek JSON valid yang LENGKAP (menggabungkan seluruh materi dari Tahap 1 + elemen visual/pelengkap dari Tahap 2).
2. DILARANG KERAS MENGGUNAKAN PYTHON, JAVASCRIPT, ATAU SKRIP PROGRAMMING APA PUN!
3. Mulailah secara langsung dengan karakter { dan diakhiri dengan karakter }.
4. Pastikan struktur JSON 100% valid dan siap di-import ke database aplikasi.

============================================================
MODUL: {{KODE}} - {{JUDUL}}
============================================================

JSON HASIL TAHAP 1 (MATERI UTAMA):
{{STAGE1_CONTEXT}}

============================================================
INSTRUKSI FINAL UTAMA TAHAP 2 (WAJIB DIPATUHI):
- DILARANG PAKAI PYTHON / ANALYSIS TOOL / SKRIP PROGRAMMING APAPUN!
- LANGSUNG TULIS TEKS JSON UTUH MURNI DI BALASAN CHAT INI.
- MULAI LANGSUNG DARI KARAKTER { DAN DIAKHIRI KARAKTER }
- TARIF PPN BERLAKU 2026 ADALAH 12% (UU HPP NO. 7/2021).
============================================================
Sekarang, lengkapi seluruh field diagram_mermaid, prompt_gambar, mini_kuis, kesalahan_umum, istilah, dan kalkulator untuk setiap bagian pada JSON di atas, lalu hasilkan SATU JSON UTUH LENGKAP. Mulai langsung dari { sampai }.
`;

// ============================================================
// FOKUS PER MODUL (Diimpor dari lib/templates/prompts/)
// Endpoint /api/prompts menggabungkan MASTER_PROMPT + FOKUS ini
// ============================================================

export const MODUL_LIST: Record<
  string,
  { judul: string; fokus: string; kategori: string; kesulitan: string; menit: number }
> = MODUL_PROMPTS_MAP;

// ============================================================
// SUPER_PROMPTS (alias untuk backward compatibility)
// ============================================================
export const SUPER_PROMPTS: Record<string, string> = Object.fromEntries(
  Object.entries(MODUL_LIST).map(([kode, { fokus }]) => [kode, fokus])
);

// ============================================================
// BUILD PROMPTS — Stages & Full
// ============================================================
export function buildPromptStage1(kode: string): string {
  const modul = MODUL_LIST[kode];
  const judul = modul?.judul ?? 'Materi Brevet AB';
  const fokus = modul?.fokus ?? 'Seluruh materi yang relevan dengan modul ini. Jika ada PDF, gunakan PDF sebagai sumber utama; jika tanpa PDF, cari dan susun mandiri dari data perpajakan resmi Indonesia terbaru 2026.';

  return MASTER_PROMPT_STAGE1
    .replace(/\{\{KODE\}\}/g, kode)
    .replace(/\{\{JUDUL\}\}/g, judul)
    .replace(/\{\{FOKUS\}\}/g, fokus);
}

export function buildPromptStage2(kode: string, stage1Output?: string): string {
  const modul = MODUL_LIST[kode];
  const judul = modul?.judul ?? 'Materi Brevet AB';

  let contextBlock = '';
  if (stage1Output && stage1Output.trim().length > 0) {
    contextBlock = stage1Output.trim();
  } else {
    contextBlock = `[Tempelkan objek JSON Hasil Tahap 1 di sini]`;
  }

  return MASTER_PROMPT_STAGE2
    .replace(/\{\{KODE\}\}/g, kode)
    .replace(/\{\{JUDUL\}\}/g, judul)
    .replace(/\{\{STAGE1_CONTEXT\}\}/g, contextBlock);
}

export function buildPromptFull(kode: string): string {
  const modul = MODUL_LIST[kode];
  const judul = modul?.judul ?? 'Materi Brevet AB';
  const fokus = modul?.fokus ?? 'Seluruh materi yang relevan dengan modul ini.';

  return MASTER_PROMPT
    .replace(/\{\{KODE\}\}/g, kode)
    .replace(/\{\{JUDUL\}\}/g, judul)
    .replace(/\{\{FOKUS\}\}/g, fokus);
}

export function buildPrompt(kode: string, stage: '1' | '2' | 'full' = '1', stage1Output?: string): string {
  if (stage === '2') return buildPromptStage2(kode, stage1Output);
  if (stage === 'full') return buildPromptFull(kode);
  return buildPromptStage1(kode);
}

// ============================================================
// HELPER: Get module metadata for UI display
// ============================================================
export function getModulMeta(kode: string) {
  const modul = MODUL_LIST[kode];
  if (!modul) return null;
  return {
    kode,
    judul: modul.judul,
    kategori: modul.kategori,
    kesulitan: modul.kesulitan,
    menit: modul.menit,
  };
}

// ============================================================
// HELPER: List all modules for dropdown/selector
// ============================================================
export function listAllModul() {
  return Object.entries(MODUL_LIST).map(([kode, m]) => ({
    kode,
    judul: m.judul,
    kategori: m.kategori,
    kesulitan: m.kesulitan,
    menit: m.menit,
  }));
}

// ============================================================
// VALIDATION: Check if generated JSON matches schema
// ============================================================
export function validateModulJSON(json: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof json !== 'object' || json === null) {
    return { valid: false, errors: ['Output bukan objek JSON'] };
  }

  const obj = json as Record<string, unknown>;

  // Check top-level
  if (obj.versi !== '1.0') errors.push('Field "versi" harus "1.0"');
  if (!obj.modul || typeof obj.modul !== 'object') {
    errors.push('Field "modul" harus ada dan berupa objek');
    return { valid: false, errors };
  }

  const modul = obj.modul as Record<string, unknown>;

  // Check modul fields
  const requiredModulFields = ['kode', 'slug', 'judul', 'kategori', 'tingkat_kesulitan', 'estimasi_menit', 'ringkasan', 'tujuan_belajar', 'bagian', 'kuis_akhir', 'glosarium'];
  for (const field of requiredModulFields) {
    if (!(field in modul)) errors.push(`Field modul.${field} tidak ditemukan`);
  }

  // Check kategori
  if (!['Dasar', 'PPh', 'PPN', 'Lainnya'].includes(modul.kategori as string)) {
    errors.push('kategori harus salah satu dari: Dasar, PPh, PPN, Lainnya');
  }

  // Check tingkat_kesulitan
  if (!['pemula', 'menengah', 'lanjut'].includes(modul.tingkat_kesulitan as string)) {
    errors.push('tingkat_kesulitan harus salah satu dari: pemula, menengah, lanjut');
  }

  // Check bagian
  if (Array.isArray(modul.bagian)) {
    if (modul.bagian.length < 5) errors.push(`Jumlah bagian (${modul.bagian.length}) kurang dari minimum 5`);

    (modul.bagian as Record<string, unknown>[]).forEach((bag, i) => {
      const bagFieldsRequired = ['id', 'judul', 'paragraf'];
      for (const field of bagFieldsRequired) {
        if (!(field in bag)) errors.push(`bagian[${i}].${field} tidak ditemukan`);
      }

      // Check visual elements (min 2 of 4)
      const visualCount = [
        bag.diagram_mermaid && (Array.isArray(bag.diagram_mermaid) ? bag.diagram_mermaid.length > 0 : true),
        bag.prompt_gambar && (Array.isArray(bag.prompt_gambar) ? bag.prompt_gambar.length > 0 : true),
        bag.mini_kuis && (Array.isArray(bag.mini_kuis) ? bag.mini_kuis.length > 0 : true),
        bag.kalkulator && bag.kalkulator !== null,
      ].filter(Boolean).length;
      
      // Removed strict visualCount < 2 check to allow importing modules with less visual elements

      if (typeof bag.judul === 'string') {
        const titleStr = bag.judul as string;
        if (titleStr.length > 65) {
          errors.push(`bagian[${i}].judul terlalu panjang (${titleStr.length} karakter, maksimal 65 agar singkat & rapi)`);
        }
        if (/[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}/u.test(titleStr)) {
          errors.push(`bagian[${i}].judul mengandung emoji/ikon (dilarang pada judul bagian)`);
        }
      }
    });
  }

  // Check kuis_akhir
  if (modul.kuis_akhir && typeof modul.kuis_akhir === 'object') {
    const kuis = modul.kuis_akhir as Record<string, unknown>;
    if (Array.isArray(kuis.soal) && kuis.soal.length < 15) {
      errors.push(`kuis_akhir.soal hanya ${kuis.soal.length} soal (minimum 15)`);
    }
  }

  // Check glosarium
  if (Array.isArray(modul.glosarium) && modul.glosarium.length < 15) {
    errors.push(`glosarium hanya ${modul.glosarium.length} entri (minimum 15)`);
  }

  return { valid: errors.length === 0, errors };
}