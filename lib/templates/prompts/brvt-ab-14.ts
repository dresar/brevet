import { ModulPromptConfig } from './types';

export const BRVT_AB_14: ModulPromptConfig = {
  judul: 'Akuntansi Pajak',
  kategori: 'Lainnya',
  kesulitan: 'lanjut',
  menit: 120,
  fokus: `Dari PDF Modul Brevet Mandiri Tax Center bagian "Akuntansi Pajak" halaman 159-222, buatlah materi pembelajaran perpajakan yang SANGAT PANJANG, ULTRA DETAIL, KOMPREHENSIF, dan SANGAT MUDAH DIPAHAMI PEMULA dengan BAHASA INDONESIA NON-FORMAL (gaul, santai, asik, relatable). Wajib mencakup seluruh minimal 15 pokok bahasan berikut secara mendalam:

1. DEFINISI & KEDUDUKAN AKUNTANSI PAJAK:
   - Pengertian Akuntansi Pajak sebagai penyelarasan Laporan Keuangan SAK dengan UU Perpajakan.
   - Tidak ada pembukuan ganda: Pembukuan komersial disesuaikan via Rekonsiliasi Fiskal.

2. KEWAJIBAN PEMBUKUAN (PASAL 28 UU KUP):
   - Wajib bagi WP Badan & OP omzet > Rp4,8 Molar/tahun.
   - Dokumen & buku akuntansi wajib disimpan selama 10 tahun di Indonesia.

3. PRINSIP STELSEL AKRUAL, KAS, & TAAT ASAS:
   - Pengutamaan Stelsel Akrual untuk pengakuan penghasilan & biaya.
   - Larangan berganti-ganti metode akuntansi tanpa persetujuan tertulis DJP.

4. VALUASI PERSEDIAAN FISKAL (PASAL 10 AYAT 6 UU PPh):
   - Penilaian persediaan HANYA berdasarkan Harga Perolehan.
   - Metode penilaian persediaan Wajib FIFO atau Rata-Rata (Average). METODE LIFO DILARANG KERAS.

5. AYAT JURNAL PPN (PAJAK MASUKAN VS PAJAK KELUARAN):
   - Jurnal pembelian BKP (Debet PM), penjualan BKP (Kredit PK), & pengkreditan akhir masa PPN.

6. AYAT JURNAL IMPOR BARANG (PIB, PPN IMPOR, PPh 22 IMPOR):
   - Jurnal pengakuan Persediaan (CIF + Bea Masuk), PM 12%, PPh 22 Dibayar di Muka 2,5%.

7. AYAT JURNAL PPh PASAL 21 / PAYROLL PERUSAHAAN:
   - Jurnal pemotongan PPh 21 atas beban gaji pegawai & penyetoran utang PPh 21 ke Kas Negara.

8. AYAT JURNAL PPh PASAL 23 & PASAL 26:
   - Jurnal pembeli (Debet Biaya, Kredit Utang PPh 23) vs Jurnal vendor (Debet PPh 23 Dibayar di Muka).

9. AYAT JURNAL PPh PASAL 22:
   - Jurnal pihak pemungut (Kredit Utang PPh 22) vs pihak dipungut (Debet Uang Muka PPh 22).

10. AYAT JURNAL PPh PASAL 4 AYAT 2 (FINAL):
    - Jurnal transaksi sewa gedung & jasa konstruksi (Beban PPh Final / Utang PPh Final).

11. AKUNTANSI PENYUSUTAN FISKAL ASET TETAP (PASAL 11 UU PPh):
    - Metode Garis Lurus vs Saldo Menurun.
    - Matriks Kelompok Masa Manfaat Fiskal: Kelompok 1 (4 thn), Kel 2 (8 thn), Kel 3 (16 thn), Kel 4 (20 thn), Bangunan (20 thn/10 thn).

12. AKUNTANSI AMORTISASI HARTA TAK BERWUJUD (PASAL 11A UU PPh):
    - Amortisasi hak cipta, lisensi software, paten, & franchise sesuai kelompok masa manfaat.

13. AKUNTANSI ANGSURAN PPh PASAL 25 & PPh PASAL 29 AKHIR TAHUN:
    - Jurnal pembayaran angsuran bulanan PPh 25 & penyesuaian PPh Kurang Bayar Pasal 29 di akhir tahun.

14. AKUNTANSI PAJAK TANGGUHAN (DEFERRED TAX ASSETS / LIABILITIES):
    - Pengenalan Aset Pajak Tangguhan & Liabilitas Pajak Tangguhan akibat beda waktu rekonsiliasi.

15. KERTAS KERJA REKONSILIASI FISKAL & LAPORAN KEUTUHAN SPT 1771:
    - Teknik menyusun Kertas Kerja Rekonsiliasi Fiskal dari Laba Komersial ke Penghasilan Neto Fiskal.

WAJIB SERTAKAN DI DALAM JSON:
- Cross-check & Validasi Kebenaran: Silangkan isi PDF dengan hukum/regulasi perpajakan resmi Indonesia yang valid dan berlaku aktif di tahun 2026 (Coretax DJP 2026, UU HPP, NIK NPWP 16 digit, PPN 12%). Jika terdapat perbedaan dengan PDF lama, WAJIB gunakan aturan valid terbaru 2026.
- Minimal 3 Diagram Mermaid valid (Flowchart Alur Jurnal PPN Pembelian-Penjualan-Pelunasan, Matriks Kelompok Masa Manfaat Penyusutan Fiskal, & Flowchart Kertas Kerja Rekonsiliasi Fiskal).
- Minimal 3 Prompt Gambar Ultra Modern 3D Stylized Studio Render (Landscape 16:9, background tematik dark-mode studio #0F172A / gradient mesh #1E1B4B yang kaya & estetik sesuai tema aplikasi, serta teks label Bahasa Indonesia modern yang dicetak jelas di dalam gambar di atas elemen kunci).
- Contoh kasus jurnal lengkap Pembelian Mesin Rp200jt + PPN 12% + PPh 22 Impor, Jurnal Payroll Gaji Rp100jt, & Perhitungan Penyusutan Fiskal Garis Lurus vs Saldo Menurun Mobil Operasional.
- Kuis Akhir minimal 15 soal lengkap dengan pembahasan 2 kalimat per soal.
- Glosarium komprehensif berisi minimal 20 istilah Akuntansi Pajak.`,
};
