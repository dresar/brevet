# 📘 DOKUMENTASI RESMI: BREVET AB HUB
> **Aplikasi Pembelajaran & Pelatihan Perpajakan Terintegrasi Artificial Intelligence (AI Tutor & AI Evaluator)**

---

## 🎯 1. Ringkasan Eksekutif & Konsep Desain

**Brevet AB Hub** adalah platform edtech perpajakan modern yang dirancang khusus untuk pembelajaran Brevet Pajak AB (Perpajakan Orang Pribadi & Badan). Platform ini menggabungkan kedalaman materi perpajakan Indonesia dengan kecerdasan buatan (*Artificial Intelligence*) serta desain antarmuka mutakhir bergaya **Linear App, Vercel Dashboard, dan Raycast**.

### 🎨 Karakteristik & Estetika Visual:
- **Tema Gelap Elegan (*High-Contrast Dark Mode*):** Menggunakan palet warna terkurasi:
  - **Background Utama:** `#0B1220` (Linear Deep Slate Black)
  - **Kartu & Surface:** `#111827` (Card Surface)
  - **Batas Border:** `#1F2937` (Thin Crisp Outline)
  - **Warna Utama (Primary):** `#3B82F6` (Linear Blue)
  - **Hover Accent:** `#2563EB`
  - **Teks Utama:** `#FFFFFF` & `#E2E8F0`
  - **Teks Sekunder:** `#94A3B8` & `#64748B`
- **Whitespace Melimpah & Typografi Inter:** Tampilan bersih tanpa ornamen berlebihan, bayangan (*shadow*) minimal, dan penggunaan font **Inter**.
- **Pembersihan Judul Otomatis (`cleanTitle`):** Seluruh judul bagian dan modul dijamin rapi (maksimal 4–6 kata) dan **100% bebas dari emoji/ikon unicode** demi estetika profesional.

---

## 🚀 2. Fitur-Fitur Unggulan Sistem

### 🤖 2.1 AI Tutor Pajak Terintegrasi (Google Gemini 2.0 Flash)
- **Akses Konteks 100% Seluruh Modul:**
  AI Chat backend (`/api/ai/chat`) secara otomatis membaca seluruh teks materi, paragraf, poin penting, contoh kasus, dan glosarium istilah dari database PostgreSQL dan menyuntikkannya ke dalam *System Prompt*.
- **`✨ Tanya AI` per Paragraf:**
  Mengarahkan kursor ke paragraf mana pun pada materi akan memunculkan tombol *Tanya AI* untuk mendiskusikan bagian spesifik tersebut secara langsung.
- **Ukuran Modal Fleksibel & Mode Layar Penuh (`⛶`):**
  Modal AI Tutor berukuran lapang (`600px × 750px`) dan dilengkapi tombol *Maximize* untuk mode layar penuh.
- **Eksekusi Sekali Klik (*Single-Click Trigger*):**
  Sistem pelacakan *useRef* mencegah pengiriman ganda pada React Strict Mode.

---

### ✍️ 2.2 Sistem Kuis & Evaluator Jawaban Esai AI (`/api/ai/evaluate-essay`)
- **Tipe Soal Kuis Lengkap:**
  Mendukung *Pilihan Ganda*, *Benar/Salah*, dan **Soal Esai AI**.
- **Reset Soal & Reset Kuis:**
  Pengguna dapat mengosongkan jawaban pada soal tertentu (`🔄 Reset Soal Ini`) atau mengulang seluruh kuis (`🔄 Reset Kuis`).
- **Analisis Jawaban Esai Real-Time:**
  - Siswa menjawab soal esai menggunakan **kalimat/bahasa mereka sendiri**.
  - Engine AI membandingkan jawaban siswa secara *real-time* dengan **Kunci Jawaban Referensi di Database**.
  - **Hasil Keluaran AI:**
    - Vonis Status & Skor (0–100): 🟢 *Tepat & Sesuai*, 🟡 *Cukup / Mendekati*, 🔴 *Kurang Tepat*.
    - Poin Apresiasi (Bagian yang sudah benar).
    - Poin Perbaikan (Hal yang perlu dilengkapi).
    - Penjelasan Detail Aturan Perpajakan Resmi.
    - Tombol Toggle `🔑 Lihat Kunci Jawaban Referensi Database`.

---

### 📊 2.3 Viewer Diagram Mermaid Interaktif & Lightbox Zoom
- **Mermaid Block & Action Bar:**
  Setiap diagram dilengkapi bilah aksi cepat: `Kode` (tampil/sembunyi teks kode), `Salin` (copy sintaks), `Unduh SVG` (download gambar vektor), dan `Perbesar`.
- **Modal Lightbox Layar Penuh (`MermaidLightboxModal`):**
  - Zoom In (`+`) & Zoom Out (`-`) hingga 400%.
  - Klik & Geser (*Pan / Drag*) menggunakan mouse.
  - Reset Ukuran (`100%`), Unduh SVG, dan Mode Layar Penuh.

---

### 🎨 2.4 Prompt AI Image Card & CDN Lightbox
- **Prompt Gambar Ultra-Detail (80–200 Kata):**
  Deskripsi visual yang kaya, mendetail, dan profesional dalam Bahasa Inggris.
- **Instruksi Negatif Bebas Teks (*Strict Negative Prompt*):**
  Diwajibkan mencantumkan `"NO TEXT, NO LETTERS, NO NUMBERS, NO WORDS, NO WATERMARKS, NO SIGNS, NO TYPOGRAPHY, NO WRITING"` agar hasil visual gambar tidak mengandung teks acak/rusak.
- **Manajemen Gambar & Lightbox:**
  - Tab URL CDN & Upload Berkas Lokal.
  - Tombol hapus cepat (`✕`) di sudut kanan atas gambar untuk memperbarui database PostgreSQL.
  - Modal Lightbox Zoom dengan fitur perbesar, geser, reset, dan unduh gambar.

---

### 🧮 2.5 Kalkulator Perpajakan Interaktif + AI Checker (`AiCalculatorChecker`)
Tersedia 4 jenis kalkulator terintegrasi:
1. **Kalkulator PPN:** Perhitungan DPP & PPN (11%, 0%, 12%).
2. **Kalkulator PPh 21 TER:** Berdasarkan PP 58/2023 (Kategori TER A, B, C) & Tarif Progresif Pasal 17 UU HPP (Desember).
3. **Kalkulator PBB:** Perhitungan NJOP Bumi/Bangunan, NJOPTKP, NJKP (20%/40%), & PBB (0,5%).
4. **Kalkulator BPHTB:** Perhitungan NPOP, NPOPTKP, Jenis Perolehan (Jual Beli vs Waris/Hibah Wasiat 50%).
- **Tombol `✨ Cek Kebenaran & Analisis Perhitungan AI`:**
  Memeriksa keakuratan matematika dan memberikan analisis dasar hukum UU/PP perpajakan secara otomatis.

---

### 📈 2.6 Sistem Tracking Progres Belajar Real-Time
- **Formula Presisi Tinggi:**
  $$\text{Progres (\%)} = \text{Math.round}\left(\frac{\text{Bagian Selesai}}{\text{Total Bagian di JSON Modul}}\right) \times 100$$
- **Daftar Isi Scrollable:**
  Sidebar Daftar Isi desktop menggunakan layout *sticky scrollable* (`max-h-[calc(100vh-6rem)]`) dengan *custom scrollbar* yang halus.
- **Sinkronisasi Real-Time:**
  Memperbarui persentase dan statistik progres di memori browser secara instan serta menyingkronkan halaman katalog `/belajar`.

---

## 🏗️ 3. Arsitektur Teknologi (Tech Stack)

| Komponen | Teknologi yang Digunakan |
| :--- | :--- |
| **Framework Frontend & Backend** | Next.js 16 (App Router, Turbopack, React 19) |
| **Bahasa Pemrograman** | TypeScript 5 (Strict Mode) |
| **Database & ORM** | PostgreSQL + Drizzle ORM |
| **AI Model Provider** | Google Gemini 2.0 Flash API (`@google/genai`) |
| **Styling & Theme** | Tailwind CSS v4 + Vanilla CSS Variables (Linear Dark Aesthetic) |
| **State Management & Query** | TanStack React Query v5 |
| **Diagram Engine** | Mermaid.js |
| **Ikon & Komponen UI** | Lucide React + Framer Motion + Sonner Toast |

---

## 🛠️ 4. Struktur Database & Skema Utama (`lib/schema.ts`)

```typescript
// Tabel Utama Sistem Brevet AB Hub

// 1. Modul Pembelajaran
export const modules = pgTable('modules', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  category: text('category'),
  difficulty: text('difficulty'),
  estimatedMinutes: integer('estimated_minutes'),
  status: text('status').default('draft'), // draft | tayang | diarsip
  contentJson: jsonb('content_json').notNull(), // Struktur Modul
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. Progres Belajar Pengguna per Bagian
export const moduleSectionsProgress = pgTable('module_sections_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  moduleId: uuid('module_id').notNull(),
  sectionId: text('section_id').notNull(),
  completed: boolean('completed').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. Rotasi Kunci API Gemini AI
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  keyValue: text('key_value').notNull(),
  status: text('status').default('active'), // active | error | disabled
  orderIndex: integer('order_index').default(0),
  errorCount: integer('error_count').default(0),
  lastError: text('last_error'),
  lastUsedAt: timestamp('last_used_at'),
});
```

---

## 🚦 5. Panduan Penggunaan Singkat

### Bagi Siswa / Pembajar:
1. **Navigasi Modul:** Buka halaman `/belajar` dan pilih modul perpajakan yang ingin dipelajari.
2. **Membaca & Diskusi AI:** Tandai bagian yang telah dipelajari dengan tombol centang `✓`. Jika ada kalimat/paragraf yang membingungkan, klik tombol `✨ Tanya AI`.
3. **Mencoba Kuis & Esai:** Jawab kuis di akhir bagian. Pada **Soal Esai**, tulis jawaban Anda sendiri lalu klik `🚀 Analisis Jawaban Saya dengan AI`.
4. **Menggunakan Kalkulator:** Gunakan fitur simulasi pajak dan verifikasi kebenarannya dengan tombol `✨ Cek Kebenaran AI`.

### Bagi Administrator:
1. **Manajemen Kunci API Gemini (`/admin/keys`):** Tambahkan kunci API Gemini gratis Anda. Sistem akan melakukan rotasi dan penanganan error secara otomatis jika ada kunci yang kedaluwarsa.
2. **Import Modul AI (`/admin/import`):** Salin Super-Prompt Claude dari sistem untuk menggenerate modul pajak baru berbasis JSON murni, lalu paste pada zona import.

---

*Dokumentasi Resmi Brevet AB Hub — Versi 2.0 (2026)*
