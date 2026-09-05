import { ModulPromptConfig } from './types';

export const BRVT_AB_06: ModulPromptConfig = {
  judul: 'PPh Badan',
  kategori: 'PPh',
  kesulitan: 'menengah',
  menit: 105,
  fokus: `Dari PDF Modul Brevet Mandiri Tax Center bagian "PPh Badan" halaman 67-95, buatlah materi pembelajaran perpajakan yang SANGAT PANJANG, ULTRA DETAIL, KOMPREHENSIF, dan SANGAT MUDAH DIPAHAMI PEMULA dengan BAHASA INDONESIA NON-FORMAL (gaul, santai, asik, relatable). Wajib mencakup seluruh minimal 15 pokok bahasan berikut secara mendalam:

1. DEFINISI & KATEGORI SUBJEK PAJAK BADAN:
   - Pengertian PPh Badan sebagai pajak atas penghasilan perseroan dan badan hukum/non-hukum.
   - Jenis Badan: PT, CV, Firma, BUMN, BUMD, BUMDes, Koperasi, Yayasan, Perkumpulan, KIK, BUT.

2. BENTUK USAHA TETAP (BUT) & KRITERIA KEHADIRAN FISIK/JASA WPLN:
   - Pengertian BUT sebagai perwakilan bisnis WPLN di Indonesia.
   - 15 Bentuk BUT: Cabang perusahaan, pabrik, proyek konstruksi > 120 hari, jasa > 60 hari.

3. OBJEK PAJAK PPh BADAN & PENGECUALIANNYA:
   - Objek Umum: Laba usaha, bunga, royalti, sewa harta, keuntungan selisih kurs.
   - Pengecualian Objek: Dividen dalam negeri yang diterima PT/CV/Koperasi, sisa lebih yayasan pendidikan (ditanamkan min 4 tahun), SHU Koperasi.

4. REKONSILIASI FISKAL KOMERSIAL VS FISKAL:
   - Mengubah Laporan Keuangan Komersial (SAK) menjadi Laporan Keuangan Fiskal UU PPh.
   - Mengapa terdapat perbedaan pengakuan laba antara versi Akuntansi dan versi Kantor Pajak.

5. BEDA TETAP VS BEDA WAKTU DALAM AKUNTANSI PAJAK:
   - Beda Tetap (Permanent Differences): Perbedaan biaya/penghasilan yang tidak akan pernah pulih.
   - Beda Waktu (Timing Differences): Perbedaan masa manfaat (penyusutan, amortisasi, cadangan).

6. KOREKSI FISKAL POSITIF VS KOREKSI FISKAL NEGATIF:
   - Koreksi Positif: Menambah Laba Fiskal (menaikkan pajak) karena biaya dilarang (Non-Deductible).
   - Koreksi Negatif: Mengurangi Laba Fiskal (menurunkan pajak) karena penghasilan bersifat final/non-objek.

7. BIAYA DEDUCTIBLE EXPENSES (PASAL 6 AYAT 1 UU PPh):
   - Biaya yang boleh dikurangkan: Gaji pegawai, bunga pinjaman, sewa, promosi, penyusutan.
   - Syarat kaitan langsung dengan kegiatan untuk 3M (Mendapatkan, Menagih, Memelihara penghasilan).

8. SYARAT PIUTANG TAK TERTAGIH & DAFTAR NOMINATIF PROMOSI:
   - Ketentuan penghapusan piutang macet secara fiskal (serahkan daftar ke DJP & jalur hukum).
   - Wajib melampirkan Daftar Nominatif Biaya Promosi (PMK 02/2010).

9. BIAYA NON-DEDUCTIBLE EXPENSES (PASAL 9 AYAT 1 UU PPh):
   - Biaya yang dilarang dikurangkan: Dividen/SHU, kepentingan pribadi pemilik, natura non-standar, PPh, sanksi denda/bunga pajak, gaji anggota CV modal tidak terbagi atas saham.

10. KOMPENSASI KERUGIAN FISKAL HINGGA 5 TAHUN (PASAL 6 AYAT 2):
    - Cara memperhitungkan rugi fiskal tahun sebelumnya untuk mengurangi laba fiskal tahun berjalan.

11. TARIF UMUM PPh BADAN 22% & SKEMA SKALA OMZET:
    - Tarif flat 22% PPh Badan berlaku aktif.
    - Pembagian 3 skema perhitungan berdasarkan skala peredaran bruto (omzet).

12. FASILITAS DISKON TARIF PASAL 31E UU PPh (OMZET S.D. RP4,8 MILIAR):
    - Diskon tarif 50% (menjadi 11%) bagi WP Badan dengan omzet s.d. Rp4,8 Miliar per tahun.

13. PERHITUNGAN PASAL 31E PROPORSIONAL (OMZET > RP4,8M S.D. RP50M):
    - Rumus memisahkan bagian PKP yang mendapat fasilitas 11% dan PKP tanpa fasilitas 22%.

14. PERHITUNGAN PPh BADAN OMZET > RP50 MILIAR:
    - Pengenaan tarif penuh 22% × PKP tanpa diskon fasilitas.

15. FORMULIR SPT TAHUNAN 1771, ANGSURAN PPh 25, & DEADLINE CORETAX:
    - Struktur Formulir 1771 & Lampiran I s.d. VI.
    - Perhitungan Angsuran PPh Pasal 25 bulanan tahun berjalan & deadline lapor 30 April.

WAJIB SERTAKAN DI DALAM JSON:
- Cross-check & Validasi Kebenaran: Silangkan isi PDF dengan hukum/regulasi perpajakan resmi Indonesia yang valid dan berlaku aktif di tahun 2026 (Coretax DJP 2026, UU HPP, NIK NPWP 16 digit, PPN 12%). Jika terdapat perbedaan dengan PDF lama, WAJIB gunakan aturan valid terbaru 2026.
- Minimal 3 Diagram Mermaid valid (Flowchart Alur Rekonsiliasi Fiskal Komersial ke Fiskal, Matrix Deductible vs Non-Deductible, & Flowchart Perhitungan Fasilitas Pasal 31E).
- Minimal 3 Prompt Gambar Ultra Modern 3D Stylized Studio Render (Landscape 16:9, background tematik dark-mode studio #0F172A / gradient mesh #1E1B4B yang kaya & estetik sesuai tema aplikasi, serta teks label Bahasa Indonesia modern yang dicetak jelas di dalam gambar di atas elemen kunci).
- Contoh kasus perhitungan Rekonsiliasi Fiskal Laporan Raba-Rugi PT Jaya Bersama (Laba Komersial Rp2M → Laba Fiskal Rp2,5M) & Perhitungan PPh 31E Proporsional Omzet Rp15 Miliar.
- Kuis Akhir minimal 15 soal lengkap dengan pembahasan 2 kalimat per soal.
- Glosarium komprehensif berisi minimal 20 istilah PPh Badan.`,
};
