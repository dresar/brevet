import { ModulPromptConfig } from './types';

export const BRVT_AB_05: ModulPromptConfig = {
  judul: 'PPh Orang Pribadi',
  kategori: 'PPh',
  kesulitan: 'pemula',
  menit: 90,
  fokus: `Dari PDF Modul Brevet Mandiri Tax Center bagian "PPh Orang Pribadi" halaman 56-66, buatlah materi pembelajaran perpajakan yang SANGAT PANJANG, ULTRA DETAIL, KOMPREHENSIF, dan SANGAT MUDAH DIPAHAMI PEMULA dengan BAHASA INDONESIA NON-FORMAL (gaul, santai, asik, relatable). Wajib mencakup seluruh minimal 15 pokok bahasan berikut secara mendalam:

1. DEFINISI & FILOSOFI PPh ORANG PRIBADI:
   - Pengertian PPh OP sebagai pajak atas tambahan kemampuan ekonomis yang diterima Orang Pribadi.
   - Prinsip kemampuan membayar (Ability to Pay Principle) dalam pemajakan individu.

2. KRITERIA SUBJEK PAJAK SPDN VS SPLN & NON-SUBJEK:
   - Syarat SPDN: Bertempat tinggal di Indonesia, berada di Indonesia > 183 hari dalam 12 bulan, atau punya niat tinggal.
   - Syarat SPLN: Berada di Indonesia ≤ 183 hari yang menerima penghasilan dari sumber Indonesia.
   - Dikecualikan dari Subjek Pajak: Pejabat diplomatik & organisasi internasional.

3. OBJEK PAJAK PPh OP TARIF UMUM (PASAL 4 AYAT 1):
   - Penghasilan dari Pekerjaan: Gaji, upah, tunjangan, honorarium, bonus, THR.
   - Penghasilan dari Usaha & Jasa Bebas: Laba toko/warung, dokter, pengacara, konsultan.
   - Penghasilan dari Modal: Bunga, dividen non-investasi, royalti, sewa non-tanah/bangunan.

4. OBJEK PAJAK FINAL & NON-OBJEK (PASAL 4 AYAT 2 & AYAT 3):
   - Objek Final: Bunga deposito, sewa tanah/bangunan, pengalihan tanah/bangunan, UMKM.
   - Non-Objek: Zakat/hibah keluarga 1 derajat, warisan, klaim asuransi kesehatan, beasiswa.

5. 3 MEKANISME PERHITUNGAN PPh ORANG PRIBADI:
   - (1) Mekanisme Pembukuan (Wajib omzet > Rp4,8 Miliar/tahun).
   - (2) Mekanisme NPPN (Pekerjaan bebas/omzet < Rp4,8 Miliar).
   - (3) Mekanisme PPh Final PP 55/2022 (Tarif 0,5% UMKM).

6. SYARAT & PROSEDUR PENGGUNAAN NPPN (PER-17/PJ/2015):
   - Wajib menyampaikan pemberitahuan ke DJP dalam 3 bulan pertama tahun pajak.
   - Rumus: Penghasilan Neto = Omzet Bruto × % Tarif Norma KBLI daerah.

7. SKEMA PPh FINAL 0,5% PP 55/2022 & OMZET BEBAS PAJAK RP500JT OP UMKM:
   - Fasilitas bebas PPh Final 0,5% untuk omzet s.d. Rp500 Juta per tahun bagi OP UMKM.
   - Cara menghitung PPh 0,5% saat omzet sudah melampaui Rp500 Juta.

8. RINCIAN BESARAN PTKP TERBARU (PMK 101/2016):
   - WP Sendiri: Rp54.000.000 / tahun.
   - Tambahan Status Kawin: Rp4.500.000 / tahun.
   - Tambahan per Tanggungan (Maks 3 orang): Rp4.500.000 / tanggungan.

9. MATRIKS KODE STATUS PTKP LENGKAP:
   - Kode TK/0, TK/1, TK/2, TK/3.
   - Kode K/0, K/1, K/2, K/3.
   - Kode K/I/0 s.d. K/I/3 (Status Istri Digabung Rp112,5jt s.d. Rp126jt).

10. 5 LAPIS TARIF PROGRESIF PPh OP PASAL 17 UU HPP:
    - 5% (s.d. Rp60jt), 15% (> Rp60jt - Rp250jt), 25% (> Rp250jt - Rp500jt), 30% (> Rp500jt - Rp5M), 35% (> Rp5M).

11. SANKSI KENAIKAN TARIF TANPA NPWP NIK 16 DIGIT:
    - Sanksi tarif 20% lebih tinggi untuk pemotongan PPh 21/23 jika tidak punya NPWP.

12. PENGGABUNGAN PENGHASILAN SUAMI-ISTRI & KESATUAN EKONOMIS:
    - Konsep 1 NPWP Suami untuk seluruh keluarga sebagai satu kesatuan ekonomi.
    - Perlakuan penghasilan istri dari 1 pemberi kerja (bersifat final di SPT Suami).

13. 4 STATUS PERPAJAKAN KELUARGA (KK, HB, PH, MT):
    - KK (Kepala Keluarga 1 NPWP), HB (Hidup Berpisah cerai), PH (Pisah Harta perjanjian), MT (Memilih Terpisah).
    - Perhitungan PPh proporsional untuk status PH dan MT.

14. FORMULIR SPT TAHUNAN PPh OP & DEADLINE CORETAX 2026:
    - Formulir 1770 SS (bruto ≤ Rp60jt 1 pemberi kerja), 1770 S (bruto > Rp60jt / >1 kerja), 1770 (usaha/bebas).
    - Batas waktu pelaporan 31 Maret & sanksi denda Rp100.000.

15. KREDIT PAJAK PPh OP & PERHITUNGAN PPh PASAL 29/28A:
    - Pengkreditan PPh 21, 22, 23, 24, & Angsuran PPh 25.
    - Menghitung PPh Kurang Bayar (Pasal 29) atau Lebih Bayar (Pasal 28A).

WAJIB SERTAKAN DI DALAM JSON:
- Cross-check & Validasi Kebenaran: Silangkan isi PDF dengan hukum/regulasi perpajakan resmi Indonesia yang valid dan berlaku aktif di tahun 2026 (Coretax DJP 2026, UU HPP, NIK NPWP 16 digit, PPN 12%). Jika terdapat perbedaan dengan PDF lama, WAJIB gunakan aturan valid terbaru 2026.
- Minimal 3 Diagram Mermaid valid (Flowchart Alur Penentuan Mekanisme Pembukuan vs NPPN vs PP 55, Diagram Matriks PTKP, & Flowchart Perhitungan PPh Progresif OP).
- Minimal 3 Prompt Gambar Ultra Modern 3D Stylized Studio Render (Landscape 16:9, background tematik dark-mode studio #0F172A / gradient mesh #1E1B4B yang kaya & estetik sesuai tema aplikasi, serta teks label Bahasa Indonesia modern yang dicetak jelas di dalam gambar di atas elemen kunci).
- Contoh kasus perhitungan PPh OP Pembukuan, NPPN Dokter Rp800jt, & PPh OP Pegawai Gaji Rp25jt/bln.
- Kuis Akhir minimal 15 soal lengkap dengan pembahasan 2 kalimat per soal.
- Glosarium komprehensif berisi minimal 20 istilah PPh Orang Pribadi.`,
};
