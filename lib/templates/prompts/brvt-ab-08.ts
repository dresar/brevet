import { ModulPromptConfig } from './types';

export const BRVT_AB_08: ModulPromptConfig = {
  judul: 'PPh Pasal 22',
  kategori: 'PPh',
  kesulitan: 'menengah',
  menit: 60,
  fokus: `Dari PDF Modul Brevet Mandiri Tax Center bagian "PPh Pasal 22" halaman 115-120, buatlah materi pembelajaran perpajakan yang SANGAT PANJANG, ULTRA DETAIL, KOMPREHENSIF, dan SANGAT MUDAH DIPAHAMI PEMULA dengan BAHASA INDONESIA NON-FORMAL (gaul, santai, asik, relatable). Wajib mencakup seluruh minimal 15 pokok bahasan berikut secara mendalam:

1. DEFINISI & DASAR HUKUM PPh PASAL 22:
   - Pengertian PPh 22 sebagai pemungutan pajak sehubungan penyerahan barang, impor, atau penjualan industri tertentu.
   - Landasan Hukum: Pasal 22 UU PPh No. 7/1983 s.t.d. UU HPP No. 7/2021, PMK 34/PMK.03/2017, PMK 41/PMK.03/2022.

2. FILOSOFI & MEKANISME PEMUNUTAN PAJAK DIBAYAR DI MUKA:
   - Mengapa pihak penjual/pemungut memotong pajak di awal transaksi untuk uang muka PPh akhir tahun.

3. DAFTAR LENGKAP SUBJEK PEMUNGUT PPh PASAL 22:
   - Bank Devisa/DJBC, Bendahara Pemerintah, BUMN, Industri Tertentu, Importir Otomotif, Produsen BBM, Pedagang Pengumpul.

4. PPh 22 IMPOR BARANG OLEH DJBC / BANK DEVISA:
   - Tarif dengan API (Angka Pengenal Impor): 2,5% × Nilai Impor.
   - Tarif Non-API: 7,5% × Nilai Impor.
   - Impor Kedelai/Gandum/Tepung Terigu (dengan API): 0,5% × Nilai Impor.

5. RUMUS PERHITUNGAN NILAI IMPOR:
   - Rumus Nilai Impor = CIF (Cost, Insurance, Freight) + Bea Masuk + Pungutan Pabean Sah Lainnya.

6. PPh 22 PEMBELIAN BARANG OLEH BENDAHARA / INSTANSI PEMERINTAH:
   - Tarif 1,5% × Harga Pembelian (Tidak Termasuk PPN/PPnBM).
   - Dipotong saat pembayaran pencairan dana APBN/APBD.

7. PPh 22 OLEH BUMN & BADAN USAHA TERTENTU:
   - Pemungutan 1,5% oleh BUMN (Telkom, PLN, Pertamina, Bank BUMN) atas pengadaan barang.

8. PPh 22 PENJUALAN HASIL PRODUKSI INDUSTRI TERTENTU:
   - Industri Kertas (0,1%), Semen (0,25%), Baja (0,3%), Otomotif (0,45%), Farmasi (0,3%) dari DPP PPN.

9. PPh 22 HASIL PRODUKSI BBM, GAS, & PELUMAS:
   - Penjualan ke Penyalur/Agen SPBU Resmi: Tarif 0,25% - 0,3% bersifat FINAL.
   - Penjualan ke Konsumen Industri: Tarif 0,25% - 0,3% bersifat TIDAK FINAL.

10. PPh 22 PEMBELIAN BAHAN INDUSTRI DARI PEDAGANG PENGUMPUL:
    - Tarif 0,25% × Harga Pembelian dari pedagang pengumpul sektor kehutanan, perkebunan, pertanian, perikanan.

11. PPh 22 PENJUALAN BARANG SANGAT MEWAH (PMK 92/2019):
    - Tarif 5% dari harga jual: Pesawat pribadi > Rp20M, Yacht > Rp10M, Rumah/Apartemen > Rp10M, Kendaraan 4 roda > Rp5M / 3.000cc.

12. KRITERIA & SURAT KETERANGAN BEBAS (SKB PPh 22):
    - Syarat pengajuan SKB PPh 22 untuk barang yang dibebaskan dari pemungutan.

13. BATAS MINIMAL TRANSAKSI BEBAS PPh 22:
    - Pembelian barang oleh Bendahara ≤ Rp2.000.000 (tidak dipecah-pecah) bebas PPh 22.
    - Pembelian BBM, Gas, Listrik, Air PDAM, Benda Pos bebas PPh 22.

14. PENGKREDITAN PPh PASAL 22 DALAM SPT TAHUNAN:
    - Bukti Pemungutan PPh 22 dapat dikreditkan mengurangi PPh terutang di akhir tahun pajak.

15. KODE AKUN PAJAK, SANKSI TANPA NPWP (+100%), & e-BUPOT CORETAX:
    - KAP 411122 & KAP 411123 (Impor).
    - Sanksi tanpa NPWP dinaikkan 100% (menjadi 2x lipat tarif standar).
    - Pelaporan via e-Bupot Unifikasi Coretax DJP 2026.

WAJIB SERTAKAN DI DALAM JSON:
- Cross-check & Validasi Kebenaran: Silangkan isi PDF dengan hukum/regulasi perpajakan resmi Indonesia yang valid dan berlaku aktif di tahun 2026 (Coretax DJP 2026, UU HPP, NIK NPWP 16 digit, PPN 12%). Jika terdapat perbedaan dengan PDF lama, WAJIB gunakan aturan valid terbaru 2026.
- Minimal 2 Diagram Mermaid valid (Flowchart Pemungutan PPh 22 Impor Barang Nilai CIF & Matrix Tarif PPh 22 Sektor Industri).
- Minimal 2 Prompt Gambar Ultra Modern 3D Stylized Studio Render (Landscape 16:9, background tematik dark-mode studio #0F172A / gradient mesh #1E1B4B yang kaya & estetik sesuai tema aplikasi, serta teks label Bahasa Indonesia modern yang dicetak jelas di dalam gambar di atas elemen kunci).
- Contoh kasus perhitungan PPh 22 Impor Mesin Pabrik CIF USD 100.000 (Kurs Rp15.500 API vs Non-API) & Pemungutan PPh 22 Bendahara Komputer Rp50 Juta.
- Kuis Akhir minimal 15 soal lengkap dengan pembahasan 2 kalimat per soal.
- Glosarium komprehensif berisi minimal 18 istilah PPh Pasal 22.`,
};
