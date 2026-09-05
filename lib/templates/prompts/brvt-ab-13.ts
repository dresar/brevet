import { ModulPromptConfig } from './types';

export const BRVT_AB_13: ModulPromptConfig = {
  judul: 'PPN & PPnBM',
  kategori: 'PPN',
  kesulitan: 'menengah',
  menit: 120,
  fokus: `Dari PDF Modul Brevet Mandiri Tax Center bagian "PPN & PPnBM" halaman 138-158 yang DITERAPKAN SESUAI UPDATE PERPAJAKAN HINGGA TAHUN 2026 (Tarif PPN 12% Berlaku Aktif, e-Faktur Coretax System DJP, PMK 71/2022 Besaran Tertentu 1,2%), buatlah materi pembelajaran perpajakan yang SANGAT PANJANG, ULTRA DETAIL, KOMPREHENSIF, dan SANGAT MUDAH DIPAHAMI PEMULA dengan BAHASA INDONESIA NON-FORMAL (gaul, santai, asik, relatable). Wajib mencakup seluruh minimal 15 pokok bahasan berikut secara mendalam:

1. DEFINISI & 8 KARAKTERISTIK PAJAK PERTAMBAHAN NILAI (PPN):
   - Pengertian PPN sebagai pajak konsumsi bertingkat di Daerah Pabean.
   - 8 Karakteristik: Pajak Tidak Langsung, Objektif, Multi-Stage, Kredit Pajak, Konsumsi DN, Netral, Tarif 12%.

2. LANDASAN HUKUM PPN & TARIF PPN 12% ERA 2026:
   - Dasar Hukum UU PPN No. 8/1983 s.t.d. UU HPP No. 7/2021.
   - Pemberlakuan resmi tarif PPN 12% di tahun 2026 sesuai Pasal 7 UU HPP.

3. 10 OBJEK PPN (PASAL 4 AYAT 1 & PASAL 16D UU PPN):
   - Penyerahan BKP/JKP di Daerah Pabean, Impor BKP, Ekspor BKP/JKP (0%), KMS (16C), & Aktiva (16D).

4. CONCEPT BARANG KENA PAJAK (BKP) VS JASA KENA PAJAK (JKP):
   - Pengertian BKP Berwujud/Tidak Berwujud & JKP.
   - Daftar barang/jasa yang dibebaskan/tidak dipungut PPN UU HPP.

5. SYARAT WAJIB PENGUSAHA KENA PAJAK (PKP) CORETAX 2026:
   - Batas omzet pengukuhan PKP Rp4,8 Miliar per tahun.
   - Kewajiban PKP: Memungut PPN 12%, membuat e-Faktur Coretax NIK 16 digit, & lapor SPT Masa PPN.

6. PPN BESARAN TERTENTU / NILAI LAIN 1,2% (PMK 71/2022 DISESUAIKAN 2026):
   - Skema kemudahan PPN 1,2% untuk pengiriman paket, agen perjalanan, mobil bekas, & perhiasan emas.

7. MEKANISME KREDIT PAJAK PPN (PK VS PM):
   - Formula PPN Terutang = Pajak Keluaran (PK) - Pajak Masukan (PM).
   - Kondisi PPN Kurang Bayar (PK > PM) vs PPN Lebih Bayar (PM > PK).

8. PAJAK MASUKAN YANG TIDAK DAPAT DIKREDITKAN (PASAL 9 AYAT 8):
   - BKP/JKP sebelum PKP, tidak ada kaitan 3M usaha, sedan/station wagon, Faktur Pajak Cacat.

9. FAKTUR PAJAK ELEKTRONIK CORETAX 2026 & NIK 16 DIGIT:
   - Kewajiban penggunaan e-Faktur Coretax DJP & pencantuman NIK 16 digit pembeli OP.
   - Batas waktu upload & approval e-Faktur tanggal 15 bulan berikutnya.

10. KODE TRANSAKSI FAKTUR PAJAK 01 S.D. 09 (PER-03/PJ/2022 CORETAX):
    - Kode 01 (Umum), 02 (Bendahara), 03 (BUMN), 04 (Nilai Lain), 05 (Besaran Tertentu 1,2%), 07 (Tidak Dipungut), 08 (Dibebaskan), 09 (Pasal 16D).

11. 25 DOKUMEN TERTENTU DIPERSAMAKAN FAKTUR PAJAK:
    - Dokumen PEB, PIB, Struk Listrik PLN, Struk Air PDAM, Airway Bill, Tiket Pesawat, Tagihan Telkom.

12. PPN KEGIATAN MEMBANGUN SENDIRI / KMS (PASAL 16C UU PPN):
    - Bangun gedung sendiri luas ≥ 200m² oleh non-PKP (Tarif Efektif 20% × 12% = 2,4% biaya di 2026).

13. PPN PENYERAHAN AKTIVA PASAL 16D:
    - Penjualan mobil dinas, mesin pabrik, atau aset operasional PKP.

14. PAJAK PENJUALAN ATAS BARANG MEWAH (PPnBM):
    - Karakteristik PPnBM: Dipungut 1 kali di tingkat pabrikan/impor (Tarif 10% s.d. 200%).

15. RESTITUSI, KOMPENSASI, & SPT MASA PPN UNIFIKASI CORETAX:
    - Hak restitusi PKP Ekspor/Kawasan Berikat, kompensasi ke masa berikutnya, & lapor SPT Masa PPN akhir bulan.

WAJIB SERTAKAN DI DALAM JSON:
- Cross-check & Validasi Kebenaran: Silangkan isi PDF dengan hukum/regulasi perpajakan resmi Indonesia yang valid dan berlaku aktif di tahun 2026 (Coretax DJP 2026, UU HPP, NIK NPWP 16 digit, PPN 12%). Jika terdapat perbedaan dengan PDF lama, WAJIB gunakan aturan valid terbaru 2026.
- Minimal 3 Diagram Mermaid valid (Flowchart Alur Pengkreditan PK vs PM PPN, Matrix Kode Transaksi e-Faktur 01-09 Coretax, & Flowchart Perhitungan PPN KMS 2,4%).
- Minimal 3 Prompt Gambar Ultra Modern 3D Stylized Studio Render (Landscape 16:9, background tematik dark-mode studio #0F172A / gradient mesh #1E1B4B yang kaya & estetik sesuai tema aplikasi, serta teks label Bahasa Indonesia modern yang dicetak jelas di dalam gambar di atas elemen kunci).
- Contoh kasus perhitungan PPN 12% Jual Beli Komputer Rp100 Juta (PK vs PM), PPN Besaran Tertentu Forwarding Rp50 Juta (1,2%), & PPN KMS Bangun Ruko Rp500 Juta.
- Kuis Akhir minimal 15 soal lengkap dengan pembahasan 2 kalimat per soal.
- Glosarium komprehensif berisi minimal 20 istilah PPN & PPnBM.`,
};
