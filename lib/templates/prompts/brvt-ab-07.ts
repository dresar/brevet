import { ModulPromptConfig } from './types';

export const BRVT_AB_07: ModulPromptConfig = {
  judul: 'PPh Pasal 21',
  kategori: 'PPh',
  kesulitan: 'menengah',
  menit: 105,
  fokus: `Dari PDF Modul Brevet Mandiri Tax Center bagian "PPh Pasal 21" halaman 97-114, buatlah materi pembelajaran perpajakan yang SANGAT PANJANG, ULTRA DETAIL, KOMPREHENSIF, dan SANGAT MUDAH DIPAHAMI PEMULA dengan BAHASA INDONESIA NON-FORMAL (gaul, santai, asik, relatable). Wajib mencakup seluruh minimal 15 pokok bahasan berikut secara mendalam:

1. DEFINISI & DASAR HUKUM PPh PASAL 21 TERBARU:
   - Pengertian PPh 21 atas penghasilan sehubungan dengan pekerjaan, jasa, atau kegiatan OP.
   - Dasar Hukum Terbaru: UU HPP No. 7/2021, PP No. 58/2023 (TER), PMK 168/PMK.03/2023, PMK 66/2023 (Natura).

2. SUBJEK PEMOTONG PPh PASAL 21:
   - Pemberi Kerja OP/Badan, Bendahara Pemerintah, Dana Pensiun/BPJS, Penyelenggara Kegiatan (EO).

3. 5 KATEGORI PENERIMA PENGHASILAN DIPOTONG PPh 21:
   - (1) Pegawai Tetap, (2) Pegawai Tidak Tetap/Lepas, (3) Bukan Pegawai (Jasa Bebas), (4) Penerima Pensiun, (5) Peserta Kegiatan.

4. OBJEK PPh PASAL 21 & PEMBAGIAN JENIS PENGHASILAN:
   - Gaji pokok, tunjangan jabatan, lembur, bonus, THR, gratifikasi, honorarium, pesangon, natura/kenikmatan.

5. NON-OBJEK PPh PASAL 21 (DIKECUALIKAN):
   - Santunan asuransi kesehatan/jiwa, iuran pensiun dibayar pemberi kerja ke dana pensiun resmi, zakat resmi, natura dikecualikan.

6. PERLAKUAN NATURA & KENIKMATAN KANTOR (PMK 66/2023):
   - Pengertian Natura (barang) vs Kenikmatan (fasilitas).
   - Batasan natura bebas PPh 21 (makanan kantor, seragam, bingkisan hari raya, fasilitas olahraga Rp1,5jt/thn).

7. FILOSOFI & RUANG LINGKUP TARIF EFEKTIF RATA-RATA (TER) PP 58/2023:
   - Mengapa sistem TER diberlakukan (penyederhanaan pemotongan bulanan tanpa hitung Biaya Jabatan & PTKP rumit tiap bulan).

8. MATRIKS 3 KATEGORI TER BULANAN PEGAWAI TETAP:
   - TER Kategori A (TK/0, TK/1, K/0).
   - TER Kategori B (TK/2, TK/3, K/1, K/2).
   - TER Kategori C (K/3).

9. CARA MENGHITUNG PPh 21 BULANAN (MASA JANUARI S.D. NOVEMBER):
   - Rumus sederhana: PPh 21 Terutang Bulanan = Penghasilan Bruto Bulanan × % TER (A/B/C) sesuai tabel.

10. CARA MENGHITUNG PPh 21 MASA DESEMBER (AKHIR TAHUN):
    - Penghasilan Neto Setahun (Bruto - Biaya Jabatan 5% maks Rp6jt - Iuran Pensiun) - PTKP = PKP × Tarif Progresif Psl 17 UU HPP dikurangi Total TER Jan-Nov.

11. SKEMA TER HARIAN UNTUK PEGAWAI TIDAK TETAP / HARIAN LEPAS:
    - Bruto harian ≤ Rp450.000 (Tarif TER 0%).
    - Bruto harian > Rp450.000 s.d. Rp2.500.000 (Tarif TER 0,5%).
    - Bruto harian > Rp2.500.000 (Tarif Progresif Pasal 17 UU HPP).

12. PEMOTONGAN PPh 21 BUKAN PEGAWAI (JASA BEBAS):
    - DPP PPh 21 Bukan Pegawai = 50% × Penghasilan Bruto.
    - PPh 21 Terutang = (50% × Penghasilan Bruto) × Tarif Progresif Pasal 17 UU HPP.

13. PERHITUNGAN PPh 21 ATAS BONUS, THR, & JASA PRODUKSI:
    - Penggabungan variabel bonus/THR dengan bruto bulanan pada bulan pembayaran menggunakan tarif TER bulanan.

14. PEMOTONGAN PPh 21 ATAS PESANGON & MANFAAT PENSIUN SEKALIGUS (FINAL):
    - Tarif PPh 21 Final atas Pesangon: Rp0 s.d. Rp50jt (0%), > Rp50jt - Rp100jt (5%), > Rp100jt - Rp500jt (15%), > Rp500jt (25%).

15. SANKSI TANPA NPWP (+20%) & e-BUPOT 21/26 CORETAX DJP:
    - Penerima tanpa NPWP dikenai pemotongan 20% lebih tinggi.
    - Kewajiban pembuatan Bukti Potong Form 1721-A1 & e-Bupot 21/26 Coretax.

WAJIB SERTAKAN DI DALAM JSON:
- Cross-check & Validasi Kebenaran: Silangkan isi PDF dengan hukum/regulasi perpajakan resmi Indonesia yang valid dan berlaku aktif di tahun 2026 (Coretax DJP 2026, UU HPP, NIK NPWP 16 digit, PPN 12%). Jika terdapat perbedaan dengan PDF lama, WAJIB gunakan aturan valid terbaru 2026.
- Minimal 3 Diagram Mermaid valid (Flowchart Alur Perhitungan PPh 21 TER Masa Jan-Nov vs Des, Matriks Kategori TER A/B/C, & Flowchart Pemotongan PPh 21 Bukan Pegawai 50%).
- Minimal 3 Prompt Gambar Ultra Modern 3D Stylized Studio Render (Landscape 16:9, background tematik dark-mode studio #0F172A / gradient mesh #1E1B4B yang kaya & estetik sesuai tema aplikasi, serta teks label Bahasa Indonesia modern yang dicetak jelas di dalam gambar di atas elemen kunci).
- Contoh kasus perhitungan PPh 21 Pegawai Tetap Gaji Rp12jt/bln status K/1 (Jan-Nov TER & Des Psl 17), Harian Lepas Rp600rb/hari, & Jasa Dokter Rp50jt.
- Kuis Akhir minimal 15 soal lengkap dengan pembahasan 2 kalimat per soal.
- Glosarium komprehensif berisi minimal 20 istilah PPh Pasal 21.`,
};
