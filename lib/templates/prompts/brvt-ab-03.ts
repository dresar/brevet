import { ModulPromptConfig } from './types';

export const BRVT_AB_03: ModulPromptConfig = {
  judul: 'UU HPP (Harmonisasi Peraturan Perpajakan)',
  kategori: 'Dasar',
  kesulitan: 'menengah',
  menit: 75,
  fokus: `Dari PDF Modul Brevet Mandiri Tax Center bagian "Undang-Undang Harmonisasi Peraturan Perpajakan (HPP)" halaman 42-48 yang DITERAPKAN SESUAI UPDATE PERPAJAKAN HINGGA TAHUN 2026 (PPN 12% Aktif, Coretax System DJP, TER PPh 21 PP 58/2023, Natura PMK 66/2023), buatlah materi pembelajaran perpajakan yang SANGAT PANJANG, ULTRA DETAIL, KOMPREHENSIF, dan SANGAT MUDAH DIPAHAMI PEMULA dengan BAHASA INDONESIA NON-FORMAL (gaul, santai, asik, relatable). Wajib mencakup seluruh minimal 15 pokok bahasan berikut secara mendalam:

1. LATAR BELAKANG, ASAS, DAN TUJUAN UU HPP NO. 7 TAHUN 2021:
   - Pengesahan UU HPP & dampaknya terhadap masa depan perpajakan Indonesia.
   - 6 Asas Utama: Keadilan, Kesederhanaan, Efisiensi, Kepastian Hukum, Kemanfaatan, & Kepentingan Nasional.

2. RUANG LINGKUP 7 BAB UTAMA UU HPP & ROADMAP 2026:
   - Pembagian Bab KUP, PPh, PPN, PPS, Pajak Karbon, & Cukai.
   - Urutan waktu pemberlakuan aturan dari 2021 hingga implementasi penuh Coretax 2026.

3. KLASTER KUP - INTEGRASI NIK 16 DIGIT MENJADI NPWP OP:
   - Landasan penggunaan NIK kependudukan sebagai identitas tunggal perpajakan Orang Pribadi.
   - Manfaat integrasi data bagi simplifikasi administrasi & pengawasan DJP.

4. RASIONALISASI SANKSI ADMINISTRASI BUNGA BERBASIS KMK:
   - Perubahan sanksi bunga dari flat 2% menjadi dinamis mengikuti suku bunga pasar Menkeu.
   - Rumus suku bunga acuan KMK + uplift margin (0%, 5%, 10%, 15%, 20%).

5. PENYESUAIAN SANKSI SETELAH UPAYA HUKUM PERPAJAKAN:
   - Denda Keberatan diturunkan dari 50% menjadi 30%.
   - Denda Banding diturunkan dari 100% menjadi 60%.
   - Penetapan sanksi Peninjauan Kembali (PK) sebesar 60%.

6. KERJASAMA PERPAJAKAN INTERNASIONAL & BANTUAN PENAGIHAN:
   - Mutual Assistance in Tax Collection & Mutual Agreement Procedure (MAP).
   - Konsensus pemajakan global & pertukaran data AEOI.

7. KUASA WAJIB PAJAK & PENEGAKAN HUKUM PIDANA (ULTIMUM REMEDIUM):
   - Aturan kompetensi kuasa WP dan pengecualian untuk keluarga dekat.
   - Hukum pidana pajak sebagai upaya terakhir & pelunasan kerugian negara.

8. KLASTER PPh - PEMAJAKAN NATURA & KENIKMATAN (PMK 66/2023):
   - Perubahan konsep: Dari Non-Deductible/Non-Taxable menjadi Deductible/Taxable.
   - Dampak perlakuan kenikmatan kantor terhadap porsi PPh 21 karyawan & PPh Badan.

9. 5 JENIS NATURA YANG DIKECUALIKAN DARI OBJEK PPh:
   - Makanan/minuman bagi seluruh pegawai.
   - Natura di daerah tertentu & keharusan pelaksanaan pekerjaan (seragam keselamatan).
   - Natura yang dibiayai APBN/APBD & batasan jenis tertentu (bingkisan hari raya, fasilitas olahraga).

10. PENYESUAIAN 5 BRACKET TARIF PROGRESIF PPh OP (PASAL 17 UU HPP):
    - Bracket 1: Rp0 s.d. Rp60 Juta → 5%.
    - Bracket 2: > Rp60 Juta s.d. Rp250 Juta → 15%.
    - Bracket 3: > Rp250 Juta s.d. Rp500 Juta → 25%.
    - Bracket 4: > Rp500 Juta s.d. Rp5 Miliar → 30%.
    - Bracket 5 (Lapis Baru): > Rp5 Miliar → 35%.

11. FASILITAS PEREDARAN BRUTO OP UMKM (PTKP UMKM PP 55/2022):
    - Wajib Pajak OP UMKM dengan omzet s.d. Rp500 Juta per tahun BEBAS PAJAK (0%).
    - Perhitungan PPh Final 0,5% hanya atas omzet di atas Rp500 Juta.

12. PENETAPAN TARIF PPh BADAN 22% BERKELANJUTAN:
    - Kepastian tarif PPh Badan tetap 22% untuk mendukung daya saing industri nasional.

13. KLASTER PPN - PEMBERLAKUAN TARIF PPN 12% ERA 2026:
    - Dasar hukum Pasal 7 UU HPP pemberlakuan tarif PPN 12% aktif 2026.
    - Dampak PPN 12% terhadap daya beli & penerimaan APBN.

14. REFORMASI FASILITAS PPN DIBEBASKAN & PPN BESARAN TERTENTU 1,2%:
    - Perubahan status kebutuhan pokok & jasa kesehatan/pendidikan menjadi BKP/JKP Dibebaskan PPN.
    - Penerapan PPN Besaran Tertentu 1,2% (PMK 71/2022) untuk simplifikasi bisnis.

15. PROGRAM PENGUNGKAPAN SUKARELA (PPS) & PAJAK KARBON:
    - Evaluasi pelaksanaan PPS Kebijakan I & II.
    - Pengenalan Pajak Karbon Rp30/kg CO2e untuk mendukung transisi energi hijau.

WAJIB SERTAKAN DI DALAM JSON:
- Cross-check & Validasi Kebenaran: Silangkan isi PDF dengan hukum/regulasi perpajakan resmi Indonesia yang valid dan berlaku aktif di tahun 2026 (Coretax DJP 2026, UU HPP, NIK NPWP 16 digit, PPN 12%). Jika terdapat perbedaan dengan PDF lama, WAJIB gunakan aturan valid terbaru 2026.
- Minimal 3 Diagram Mermaid valid (Flowchart Perbandingan Tarif PPh OP Lama vs UU HPP, Diagram Pohon Perlakuan Natura PMK 66/2023, & Timeline Pemberlakuan PPN 12% UU HPP).
- Minimal 3 Prompt Gambar Ultra Modern 3D Stylized Studio Render (Landscape 16:9, background tematik dark-mode studio #0F172A / gradient mesh #1E1B4B yang kaya & estetik sesuai tema aplikasi, serta teks label Bahasa Indonesia modern yang dicetak jelas di dalam gambar di atas elemen kunci).
- Contoh kasus perhitungan PPh OP UU HPP (gaji Rp15jt/bln) & Perhitungan PPN 12% atas Pembelian Laptop Rp15 Juta di Tahun 2026.
- Kuis Akhir minimal 15 soal lengkap mengenai pembahasan 2 kalimat per soal.
- Glosarium komprehensif berisi minimal 20 istilah UU HPP 2026.`,
};
