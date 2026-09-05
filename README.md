# 🎓 Brevet AB Hub — Platform Belajar Pajak Interaktif & AI Tutor

**Brevet AB Hub** adalah aplikasi web modern bergaya *dark-mode exclusive* yang dirancang khusus untuk pembelajaran perpajakan Indonesia (Brevet A & B) secara interaktif, mendalam, dan dilengkapi dengan asisten kecerdasan buatan (AI Tutor) berbasis Google Gemini.

---

## ✨ Fitur Unggulan

### 1. 🤖 AI Tutor & Rotasi Kunci API Gemini Otomatis
- **Asisten Pintar**: AI yang disesuaikan secara khusus dengan konteks modul dan bagian yang sedang dipelajari. Menggunakan gaya bahasa santai, mudah dipahami, dan analogi sehari-hari.
- **Rotasi Kunci API (Zero SDK)**: Menggunakan REST API langsung (`fetch`) tanpa dependensi SDK berat, dengan mekanisme failover otomatis. Jika satu kunci mengalami *rate-limit* (HTTP 429) atau error, sistem otomatis mencatat `error_count`, memindahkan kunci ke urutan paling belakang, dan menggunakan kunci aktif berikutnya.
- **Manajemen Kunci**: Halaman khusus admin untuk menambahkan, menguji (ping & latency check), menonaktifkan, serta mereset kunci API Gemini.

### 2. 📥 Importer Modul & Pustaka Prompt Claude
- **Pustaka Prompt (Zone 1)**: Menyediakan 17 prompt terstruktur yang siap disalin ke Claude AI untuk menghasilkan materi pajak berkualitas tinggi dalam format JSON yang valid.
- **JSON Importer (Zone 2)**: Editor code interaktif berpemindai sintaks (`CodeMirror`) dengan deteksi posisi error JSON otomatis menggunakan pemindaian regex presisi dan validasi skema `Zod`.
- **Rak Modul (Zone 3)**: Manajemen daftar modul belajar dengan filter status (*Draft* / *Tayang*), duplikasi, ekspor JSON, dan pemantauan progres belajar.

### 3. 📚 Ruang Belajar Interaktif & Offline-Ready
- **Daftar Isi Dinamis & Scroll Tracking**: Pemantauan pembacaan bagian modul secara *real-time* dan indikator progres otomatis.
- **Diagram Alur Visual (`Mermaid.js`)**: Render otomatis diagram alur perpajakan dalam tema gelap yang tajam.
- **Mini Kuis Interaktif**: Evaluasi pemahaman di akhir bagian dengan feedback pembahasan instan untuk soal Pilihan Ganda maupun Benar/Salah.
- **AI Image Prompting**: Panduan visual untuk setiap materi lengkap dengan tombol salin prompt untuk Midjourney atau DALL-E.

### 4. 🧮 4 Kalkulator Pajak Terintegrasi
- **Kalkulator PPN (PP 44/2022)**: Perhitungan instan Dasar Pengenaan Pajak (DPP) dengan tarif umum 11%, ekspor 0%, dan barang mewah 12%.
- **Kalkulator PPh 21 TER (PP 58/2023 & UU HPP)**: Mendukung mode Tarif Efektif Rata-rata (TER Kategori A, B, C) bulanan dan perhitungan progresif Pasal 17 untuk masa pajak Desember.
- **Kalkulator PBB**: Perhitungan Pajak Bumi dan Bangunan berjenjang dengan NJKP 20% / 40% dan penyesuaian NJOPTKP.
- **Kalkulator BPHTB**: Perhitungan Nilai Perolehan Objek Pajak Kena Pajak (NPOPKP) dengan tarif normal 5% serta diskon khusus 50% untuk waris/hibah wasiat.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Serverless Route Handlers) |
| **Bahasa** | TypeScript (Strict Type Safety) |
| **Database & ORM** | Neon PostgreSQL (Serverless) + Drizzle ORM |
| **Styling & UI** | Vanilla CSS Design System, Tailwind CSS, Lucide Icons |
| **Validasi & Parse** | Zod, CodeMirror 6, Regex Error Locator |
| **Autentikasi** | Custom JWT / Session (jose + bcryptjs) |

---

## 🚀 Panduan Instalasi & Menjalankan secara Lokal

### 1. Prasyarat
Pastikan Anda telah menginstal **Node.js (v18+)** dan memiliki akun **Neon PostgreSQL**.

### 2. Kloning & Instalasi Dependensi
```bash
git clone https://github.com/dresar/brevet.git
cd brevet
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env` dan sesuaikan nilainya:
```bash
cp .env.example .env
```
Isi variabel di dalam file `.env`:
```env
# Koneksi Database Neon PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Rahasia untuk penandatanganan sesi Autentikasi
AUTH_SECRET=rahasia-super-aman-untuk-jwt-brevet-ab
```

### 4. Migrasi Database & Seeding
Push skema ke database dan masukkan data awal (admin default & placeholder kunci API):
```bash
npx drizzle-kit push
npm run db:seed
```
> **Akun Admin Default:**
> - **Email:** `admin@brevet.local`
> - **Password:** `admin123456`

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 📦 Struktur Folder Proyek

```
brevet/
├── app/
│   ├── admin/             # Halaman Admin (Dashboard, Kunci API, Impor Modul, Profil, Pengaturan)
│   ├── api/               # Serverless API Routes (Auth, Keys, Modules, Belajar, AI Chat)
│   ├── belajar/           # Ruang Belajar (Daftar Modul & Halaman Baca Interaktif)
│   ├── login/             # Halaman Autentikasi
│   ├── globals.css        # Design System (Dark Mode Tokens, Glassmorphism, Utilities)
│   └── layout.tsx         # Root Layout & Providers
├── components/
│   ├── admin/             # Komponen Khusus Admin (Sidebar, Topbar, Import Shelf)
│   ├── belajar/           # Komponen Belajar (SectionRenderer, Kalkulator, Quiz, AI Chat)
│   └── ui/                # Shared UI Components (Button, Input, Modal, Tabs, Skeleton)
├── db/                    # Skema Database (Drizzle ORM) & Seeding Script
└── lib/                   # Utility (Auth, Gemini REST, Zod Validators, JSON Helpers)
```

---

## 🔒 Kebijakan Keamanan & Performa
- **Serverless Optimized**: Semua route API dipaksa `runtime: 'nodejs'` dengan pembatasan durasi maksimum (`maxDuration = 30s`).
- **Input Validation**: Semua request tubuh dipindai secara ketat menggunakan Zod di sisi klien maupun server.
- **Secure Password Storage**: Password pengguna di-hash menggunakan algoritma `bcryptjs` dengan salt factor 10.
- **CORS & Headers**: Dilengkapi dengan konfigurasi *security headers* modern di `vercel.json` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).

---

*Dikembangkan dengan ❤️ untuk kemudahan dan keunggulan pembelajaran pajak Brevet AB.*
