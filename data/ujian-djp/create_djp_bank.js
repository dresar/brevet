const fs = require('fs');
const path = require('path');

const soalList = [];

// =========================================================================
// 1. 50 SOAL TKB CAT PILIHAN GANDA (Nomor 1 - 50)
// =========================================================================

const pgData = [
  // 1-10: KUP, UU HPP, NIK-NPWP, SPT, Ketetapan, Sanksi
  {
    nomor: 1,
    kategori: "KUP & Reformasi UU HPP",
    pertanyaan: "Berdasarkan Undang-Undang Nomor 7 Tahun 2021 tentang Harmonisasi Peraturan Perpajakan (UU HPP), Nomor Induk Kependudukan (NIK) diintegrasikan menjadi Nomor Pokok Wajib Pajak (NPWP) bagi Wajib Pajak Orang Pribadi. Apa konsekuensi hukum utama dari ketentuan ini?",
    pilihan: [
      "A. Setiap warga negara yang memiliki NIK otomatis wajib membayar PPh tanpa melihat batas PTKP.",
      "B. NIK berfungsi sebagai NPWP, namun kewajiban membayar dan melapor pajak hanya timbul apabila telah memenuhi syarat subjektif dan objektif (penghasilan melebihi PTKP).",
      "C. Wajib Pajak Badan dapat menggunakan NIK milik Direktur Utama sebagai pengganti NPWP Badan.",
      "D. Seluruh transaksi perbankan warga negara langsung dipotong PPh Final 20% secara otomatis."
    ],
    jawabanKunci: "B",
    pembahasan: "Pasal 2 ayat (1a) UU KUP jo. UU HPP menegaskan bahwa bagi Wajib Pajak Orang Pribadi yang merupakan penduduk Indonesia, NIK digunakan sebagai NPWP. Namun aktivasi kewajiban perpajakan tetap mengacu pada terpenuhinya syarat subjektif (tinggal di Indonesia) dan objektif (memiliki penghasilan di atas PTKP).",
    landasanHukum: "Pasal 2 ayat (1a) UU No. 6/1983 jo. UU No. 7/2021 (UU HPP)",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 2,
    kategori: "KUP & Reformasi UU HPP",
    pertanyaan: "Wajib Pajak Orang Pribadi terlambat menyampaikan Surat Pemberitahuan (SPT) Tahunan PPh yang seharusnya disampaikan paling lambat akhir bulan ketiga setelah akhir Tahun Pajak. Berapakah denda administrasi yang dikenakan berdasarkan UU KUP?",
    pilihan: [
      "A. Rp100.000,00",
      "B. Rp500.000,00",
      "C. Rp1.000.000,00",
      "D. 2% per bulan dari jumlah pajak terutang"
    ],
    jawabanKunci: "A",
    pembahasan: "Berdasarkan Pasal 7 ayat (1) UU KUP, sanksi administrasi keterlambatan pelaporan SPT adalah: Rp100.000 untuk SPT Tahunan PPh Orang Pribadi, Rp1.000.000 untuk SPT Tahunan PPh Badan, Rp500.000 untuk SPT Masa PPN, dan Rp100.000 untuk SPT Masa lainnya.",
    landasanHukum: "Pasal 7 ayat (1) UU KUP jo. UU HPP",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 3,
    kategori: "KUP & Reformasi UU HPP",
    pertanyaan: "Dalam UU HPP, penghitungan sanksi bunga administrasi perpajakan (misalnya atas pembetulan SPT atau penerbitan SKPKB) tidak lagi menggunakan tarif flat 2% per bulan, melainkan menggunakan formulasi suku bunga acuan. Rumus penetapan tarif sanksi bunga bulanan tersebut adalah...",
    pilihan: [
      "A. (Suku Bunga Acuan BI + Uplift Factor) / 12",
      "B. (Suku Bunga Acuan Menteri Keuangan + Uplift Factor) / 12",
      "C. Tarif Flat 1.5% per bulan tanpa pembagi",
      "D. Suku Bunga Deposito Bank BUMN dikalikan 2"
    ],
    jawabanKunci: "B",
    pembahasan: "Berdasarkan reformasi UU Cipta Kerja & UU HPP pada Pasal 8, 9, 13, 14 UU KUP, tarif bunga per bulan dihitung berdasarkan suku bunga acuan yang ditetapkan Menteri Keuangan ditambah persentase uplift (sesuai jenis pelanggaran: 5%, 10%, 15%, dll.) dibagi 12, dan berlaku maksimal 24 bulan.",
    landasanHukum: "Pasal 8 & Pasal 13 UU KUP jo. UU HPP No. 7/2021",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 4,
    kategori: "KUP & Reformasi UU HPP",
    pertanyaan: "Jangka waktu penerbitan Surat Ketetapan Pajak Kurang Bayar (SKPKB) oleh Direktur Jenderal Pajak memiliki daluwarsa penetapan. Berapakah batas daluwarsa penetapan pajak tersebut?",
    pilihan: [
      "A. 3 (tiga) tahun setelah saat terutangnya pajak atau berakhirnya Masa/Tahun Pajak",
      "B. 5 (lima) tahun setelah saat terutangnya pajak atau berakhirnya Masa/Tahun Pajak",
      "C. 10 (sepuluh) tahun setelah saat terutangnya pajak atau berakhirnya Masa/Tahun Pajak",
      "D. Tidak ada daluwarsa untuk seluruh jenis tindak perpajakan"
    ],
    jawabanKunci: "B",
    pembahasan: "Pasal 13 ayat (1) UU KUP menetapkan bahwa jangka waktu penerbitan SKPKB adalah dalam jangka waktu 5 (lima) tahun setelah saat terutangnya pajak atau berakhirnya Masa Pajak, bagian Tahun Pajak, atau Tahun Pajak.",
    landasanHukum: "Pasal 13 ayat (1) UU KUP",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 5,
    kategori: "KUP & Reformasi UU HPP",
    pertanyaan: "Wajib Pajak yang tidak menyetujui isi Surat Ketetapan Pajak (SKPKB) dapat mengajukan upaya hukum Keberatan kepada Direktur Jenderal Pajak. Syarat pengajuan keberatan tersebut adalah diajukan dalam jangka waktu paling lama...",
    pilihan: [
      "A. 1 (satu) bulan sejak tanggal pengiriman SKP",
      "B. 3 (tiga) bulan sejak tanggal dikirimnya surat ketetapan pajak, kecuali ada keadaan di luar kekuasaan WP",
      "C. 6 (enam) bulan sejak tanggal pembayaran SKP",
      "D. 30 (tiga puluh) hari kalender sejak SKP diterima oleh WP"
    ],
    jawabanKunci: "B",
    pembahasan: "Pasal 25 ayat (3) UU KUP menyatakan surat keberatan harus disampaikan dalam jangka waktu 3 (tiga) bulan sejak tanggal dikirim surat ketetapan pajak atau sejak tanggal pemotongan/pemungutan pajak, kecuali Wajib Pajak dapat menunjukkan bahwa jangka waktu itu tidak dapat dipenuhi karena keadaan di luar kekuasaannya (force majeure).",
    landasanHukum: "Pasal 25 ayat (3) UU KUP",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 6,
    kategori: "KUP & Reformasi UU HPP",
    pertanyaan: "Apabila permohonan Keberatan Wajib Pajak ditolak atau dikabulkan sebagian, dan Wajib Pajak TIDAK mengajukan permohonan banding ke Pengadilan Pajak, maka sanksi denda yang dikenakan adalah sebesar...",
    pilihan: [
      "A. 25% dari jumlah pajak berdasarkan keputusan keberatan dikurangi pajak yang telah dibayar sebelum mengajukan keberatan",
      "B. 30% dari jumlah pajak berdasarkan keputusan keberatan dikurangi pajak yang telah dibayar sebelum mengajukan keberatan",
      "C. 50% dari jumlah pajak berdasarkan keputusan keberatan dikurangi pajak yang telah dibayar sebelum mengajukan keberatan",
      "D. 100% dari jumlah pajak yang masih harus dibayar"
    ],
    jawabanKunci: "B",
    pembahasan: "Berdasarkan UU HPP Pasal 25 ayat (9), sanksi administrasi denda atas keberatan yang ditolak atau dikabulkan sebagian diturunkan dari semula 50% menjadi 30% dari jumlah pajak berdasarkan keputusan keberatan dikurangi dengan pajak yang telah dibayar sebelum mengajukan keberatan.",
    landasanHukum: "Pasal 25 ayat (9) UU KUP jo. UU HPP No. 7/2021",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 7,
    kategori: "KUP & Reformasi UU HPP",
    pertanyaan: "Apabila Wajib Pajak mengajukan Permohonan Banding ke Pengadilan Pajak dan Putusan Banding menyatakan menolak atau mengabulkan sebagian, berapakah sanksi denda yang dikenakan sesuai UU HPP?",
    pilihan: [
      "A. 100% dari jumlah pajak berdasarkan putusan banding dikurangi pembayaran sebelum keberatan",
      "B. 60% dari jumlah pajak berdasarkan putusan banding dikurangi pembayaran sebelum keberatan",
      "C. 50% dari jumlah pajak terutang",
      "D. 30% dari jumlah pajak terutang"
    ],
    jawabanKunci: "B",
    pembahasan: "Berdasarkan Pasal 27 ayat (5d) UU KUP jo. UU HPP, sanksi administrasi berupa denda atas putusan banding yang menolak atau mengabulkan sebagian adalah sebesar 60% (diturunkan dari aturan sebelumnya yang sebesar 100%).",
    landasanHukum: "Pasal 27 ayat (5d) UU KUP jo. UU HPP No. 7/2021",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 8,
    kategori: "KUP & Reformasi UU HPP",
    pertanyaan: "Wajib Pajak Orang Pribadi yang melakukan kegiatan usaha atau pekerjaan bebas dengan peredaran bruto tertentu diperbolehkan menghitung penghasilan neto menggunakan Norma Penghitungan Penghasilan Neto (NPPN). Batas peredaran bruto maksimal setahun untuk menggunakan NPPN adalah...",
    pilihan: [
      "A. Rp1.800.000.000,00",
      "B. Rp2.400.000.000,00",
      "C. Rp4.800.000.000,00",
      "D. Rp10.000.000.000,00"
    ],
    jawabanKunci: "C",
    pembahasan: "Pasal 14 ayat (2) UU PPh mengatur bahwa Wajib Pajak Orang Pribadi yang melakukan kegiatan usaha atau pekerjaan bebas dengan peredaran bruto dalam 1 tahun kurang dari Rp4.800.000.000,00 boleh menghitung penghasilan neto menggunakan NPPN, dengan syarat memberitahukan ke Dirjen Pajak dalam jangka waktu 3 bulan pertama dari tahun pajak bersangkutan.",
    landasanHukum: "Pasal 14 ayat (2) UU PPh",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 9,
    kategori: "KUP & Reformasi UU HPP",
    pertanyaan: "Dalam hukum acara peradilan perpajakan, upaya hukum luar biasa yang dapat diajukan oleh Wajib Pajak atau Direktur Jenderal Pajak atas Putusan Pengadilan Pajak yang telah berkekuatan hukum tetap adalah...",
    pilihan: [
      "A. Banding Ulang ke Mahkamah Konstitusi",
      "B. Peninjauan Kembali (PK) ke Mahkamah Agung",
      "C. Gugatan ke Pengadilan Negeri",
      "D. Kasasi ke Pengadilan Tinggi Tata Usaha Negara"
    ],
    jawabanKunci: "B",
    pembahasan: "Berdasarkan UU No. 14 Tahun 2002 tentang Pengadilan Pajak Pasal 77 ayat (3), pihak-pihak yang bersengketa dapat mengajukan permohonan Peninjauan Kembali (PK) hanya kepada Mahkamah Agung atas putusan Pengadilan Pajak.",
    landasanHukum: "Pasal 77 ayat (3) UU No. 14/2002 tentang Pengadilan Pajak",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 10,
    kategori: "KUP & Reformasi UU HPP",
    pertanyaan: "Prinsip ultimum remedium dalam penegakan hukum pidana perpajakan pada UU HPP memberikan ruang penyelesaian di luar pengadilan. Penghentian penyidikan tindak pidana di bidang perpajakan (Pasal 44B UU KUP jo. UU HPP) dapat dilakukan apabila Wajib Pajak melunasi kerugian negara ditambah sanksi denda sebesar...",
    pilihan: [
      "A. 1 kali jumlah kerugian pada pendapatan negara (alpa) atau 3 kali (sengaja)",
      "B. 4 kali untuk semua tindak pidana perpajakan",
      "C. 50% dari total utang pokok pajak",
      "D. Cukup membayar pokok pajak saja tanpa denda pidana"
    ],
    jawabanKunci: "A",
    pembahasan: "Pasal 44B UU KUP jo. UU HPP mengatur bahwa untuk kepentingan penerimaan negara, atas permintaan Menkeu, Jaksa Agung dapat menghentikan penyidikan tindak pidana perpajakan setelah WP melunasi kerugian pada pendapatan negara ditambah sanksi denda: 1x kerugian (karena alpa Pasal 38), 3x kerugian (karena sengaja Pasal 39), atau 4x (faktur fiktif Pasal 39A).",
    landasanHukum: "Pasal 44B UU KUP jo. UU HPP No. 7/2021",
    tingkatKesulitan: "HOTS / Sulit"
  },

  // 11-20: PPh 21 TER PMK 168/2023 & Tarif Progresif
  {
    nomor: 11,
    kategori: "PPh 21 TER (PMK 168/2023)",
    pertanyaan: "Berdasarkan PMK No. 168 Tahun 2023, penghitungan PPh Pasal 21 bagi Pegawai Tetap pada Masa Pajak selain Masa Pajak Terakhir (Januari–November) dilakukan dengan menggunakan skema Tarif Efektif Rata-Rata (TER). Rumus pemotongan PPh 21 bulanan tersebut adalah...",
    pilihan: [
      "A. Penghasilan Bruto Bulanan x Tarif TER Bulanan (sesuai kategori PTKP)",
      "B. (Penghasilan Bruto - Biaya Jabatan - PTKP) x Tarif Pasal 17 ayat (1) huruf a",
      "C. Penghasilan Neto Disetahunkan x Tarif Progresif / 12",
      "D. Penghasilan Kena Pajak x Tarif Flat 5%"
    ],
    jawabanKunci: "A",
    pembahasan: "Pasal 5 & 6 PMK 168/2023 menegaskan pemotongan PPh 21 untuk Pegawai Tetap masa Januari s.d. November dihitung dengan mengalikan Penghasilan Bruto sebulan langsung dengan Tarif Efektif Bulanan (Kategori A, B, atau C) sesuai status PTKP pada awal tahun.",
    landasanHukum: "Pasal 5 & 6 PMK No. 168 Tahun 2023",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 12,
    kategori: "PPh 21 TER (PMK 168/2023)",
    pertanyaan: "Seorang karyawan berstatus menikah dan memiliki 2 orang anak (K/2). Berdasarkan PMK 168/2023, status PTKP K/2 masuk ke dalam klasifikasi TER Bulanan Kategori...",
    pilihan: [
      "A. Kategori A",
      "B. Kategori B",
      "C. Kategori C",
      "D. Kategori D"
    ],
    jawabanKunci: "B",
    pembahasan: "Klasifikasi TER Bulanan PMK 168/2023:\n- Kategori A: TK/0 (54 jt), TK/1 (58.5 jt), K/0 (58.5 jt)\n- Kategori B: TK/2 (63 jt), TK/3 (67.5 jt), K/1 (63 jt), K/2 (67.5 jt)\n- Kategori C: K/3 (72 jt). Jadi K/2 termasuk Kategori B.",
    landasanHukum: "Lampiran PMK No. 168 Tahun 2023",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 13,
    kategori: "PPh 21 TER (PMK 168/2023)",
    pertanyaan: "Bagaimanakah mekanisme penghitungan PPh Pasal 21 untuk Pegawai Tetap pada Masa Pajak Terakhir (Desember atau masa berhenti bekerja)?",
    pilihan: [
      "A. Tetap menggunakan TER Bulanan dikalikan penghasilan bruto bulan Desember",
      "B. Dihitung kembali dari total penghasilan bruto setahun dikurangi biaya pengurang (Biaya Jabatan/Iuran Pensiun) dan PTKP, dikenakan Tarif Pasal 17 UU PPh, lalu dikurangi PPh 21 yang telah dipotong pada masa Jan-Nov",
      "C. Dikenakan tarif final 15% dari sisa penghasilan",
      "D. Menggunakan TER Harian dikalikan jumlah hari kerja di bulan Desember"
    ],
    jawabanKunci: "B",
    pembahasan: "Pada masa pajak terakhir (Desember), pemotong pajak menghitung PPh 21 setahun secara riil menggunakan tarif Pasal 17 ayat (1) huruf a UU PPh atas PKP setahun (Bruto setahun - Biaya Jabatan - Iuran Pensiun/JHT - PTKP), kemudian diselisihkan dengan total PPh 21 yang sudah dipotong masa Jan–Nov.",
    landasanHukum: "Pasal 7 PMK No. 168 Tahun 2023",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 14,
    kategori: "PPh 21 TER (PMK 168/2023)",
    pertanyaan: "Sesuai UU HPP, lapisan tarif (bracket) PPh Orang Pribadi Pasal 17 ayat (1) huruf a mengalami pembaruan. Berapakah batas rentang penghasilan kena pajak untuk tarif terendah 5% dan tarif tertinggi 35%?",
    pilihan: [
      "A. 5% untuk s.d Rp50 juta; 35% untuk di atas Rp500 juta",
      "B. 5% untuk s.d Rp60 juta; 35% untuk di atas Rp5 miliar",
      "C. 5% untuk s.d Rp100 juta; 35% untuk di atas Rp1 miliar",
      "D. 5% untuk s.d Rp60 juta; 35% untuk di atas Rp2 miliar"
    ],
    jawabanKunci: "B",
    pembahasan: "Berdasarkan Pasal 17 UU PPh jo. UU HPP:\n- Lapisan 1: 0 s.d Rp60 juta = 5%\n- Lapisan 2: > Rp60 jt s.d Rp250 jt = 15%\n- Lapisan 3: > Rp250 jt s.d Rp500 jt = 25%\n- Lapisan 4: > Rp500 jt s.d Rp5 miliar = 30%\n- Lapisan 5: > Rp5 miliar = 35%",
    landasanHukum: "Pasal 17 ayat (1) huruf a UU PPh jo. UU HPP",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 15,
    kategori: "PPh 21 TER (PMK 168/2023)",
    pertanyaan: "PT Prima Jaya menggunakan jasa Konsultan Hukum (Bukan Pegawai / Tenaga Ahli) bernama Adv. Hendra, S.H. yang menerima honorarium sebesar Rp80.000.000,00 atas penanganan satu perkara. Berdasarkan PMK 168/2023, dasar pemotongan PPh Pasal 21 atas jasa tenaga ahli tersebut adalah...",
    pilihan: [
      "A. 100% x Rp80.000.000,00 langsung dikalikan tarif TER Bulanan",
      "B. 50% x Penghasilan Bruto (Rp40.000.000,00) dikalikan Tarif Pasal 17 UU PPh",
      "C. (Rp80.000.000,00 - PTKP bulanan) x 5%",
      "D. Dikenakan PPh Final 0.5% berdasarkan PP 55/2022"
    ],
    jawabanKunci: "B",
    pembahasan: "Berdasarkan PMK 168/2023 Pasal 10, PPh 21 bagi Bukan Pegawai (termasuk tenaga ahli) dihitung dengan dasar pengenaan pajak sebesar 50% dari jumlah penghasilan bruto, lalu dikalikan tarif Pasal 17 ayat (1) huruf a UU PPh, tanpa lagi memperhitungkan syarat berkesinambungan atau PTKP bulanan.",
    landasanHukum: "Pasal 10 ayat (1) PMK No. 168 Tahun 2023",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 16,
    kategori: "PPh 21 TER (PMK 168/2023)",
    pertanyaan: "Berdasarkan PMK No. 66 Tahun 2023, imbalan sehubungan dengan pekerjaan atau jasa yang diberikan dalam bentuk natura dan/atau kenikmatan kini menjadi objek PPh. Manakah di antara natura berikut yang DIKECUALIKAN dari objek PPh 21 bagi pegawai?",
    pilihan: [
      "A. Mobil dinas sedan mewah yang diberikan khusus untuk keperluan pribadi komisaris utama",
      "B. Makanan dan minuman yang disediakan bagi seluruh pegawai di tempat kerja secara bersama-sama",
      "C. Voucher belanja bulanan senilai Rp10 juta per bulan untuk seluruh manajer",
      "D. Paket liburan keluarga eksekutif ke luar negeri"
    ],
    jawabanKunci: "B",
    pembahasan: "Pasal 4 ayat (3) huruf d UU PPh jo. PMK 66/2023 mengecualikan natura/kenikmatan tertentu dari objek PPh, salah satunya adalah makanan, bahan makanan, bahan minuman, dan/atau minuman bagi seluruh pegawai di tempat kerja, serta fasilitas di daerah tertentu dan fasilitas keselamatan kerja.",
    landasanHukum: "Pasal 4 ayat (3) huruf d UU PPh jo. PMK 66/2023",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 17,
    kategori: "PPh 21 TER (PMK 168/2023)",
    pertanyaan: "Batas maksimal pengurangan Biaya Jabatan yang diperkenankan dalam menghitung penghasilan neto Pegawai Tetap menurut ketentuan perpajakan yang berlaku adalah...",
    pilihan: [
      "A. 5% dari penghasilan bruto, setinggi-tingginya Rp500.000,00 sebulan atau Rp6.000.000,00 setahun",
      "B. 10% dari penghasilan bruto, setinggi-tingginya Rp1.000.000,00 sebulan atau Rp12.000.000,00 setahun",
      "C. 5% dari penghasilan neto, setinggi-tingginya Rp300.000,00 sebulan",
      "D. Biaya jabatan dapat dikurangkan tanpa batasan maksimal asalkan didukung bukti pengeluaran riil"
    ],
    jawabanKunci: "A",
    pembahasan: "Pasal 21 ayat (3) UU PPh jo. PMK 168/2023 menetapkan biaya jabatan sebesar 5% dari penghasilan bruto, dengan batas maksimum Rp500.000,00 per bulan atau Rp6.000.000,00 per tahun.",
    landasanHukum: "Pasal 21 ayat (3) UU PPh & PMK 168/2023",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 18,
    kategori: "PPh 21 TER (PMK 168/2023)",
    pertanyaan: "Jika penghasilan bruto harian seorang Pegawai Tidak Tetap/Pekerja Harian Lepas tidak melebihi Rp450.000,00 dan total penghasilan kumulatif dalam bulan kalender bersangkutan belum melebihi Rp4.500.000,00, maka pemotongan PPh Pasal 21-nya adalah...",
    pilihan: [
      "A. Dipotong PPh 21 dengan tarif TER harian 0.5%",
      "B. Tidak dilakukan pemotongan PPh Pasal 21 (Tarif Efektif Harian 0%)",
      "C. Dipotong PPh 21 sebesar 5% dari seluruh penghasilan harian",
      "D. Dipotong PPh 21 sebesar Rp45.000 per hari"
    ],
    jawabanKunci: "B",
    pembahasan: "Berdasarkan PMK 168/2023, upah harian s.d Rp450.000 per hari dengan batas kumulatif belum melebihi Rp4.500.000 sebulan dikenakan TER Harian sebesar 0% (tidak dipotong PPh 21).",
    landasanHukum: "Lampiran TER Harian PMK 168/2023",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 19,
    kategori: "PPh 21 TER (PMK 168/2023)",
    pertanyaan: "Dewan Komisaris yang tidak merangkap sebagai Pegawai Tetap menerima honorarium berkala dari perusahaan. Bagaimana perlakuan pemotongan PPh Pasal 21 atas honorarium komisaris tersebut berdasarkan PMK 168/2023?",
    pilihan: [
      "A. Dikenakan TER Bulanan Pegawai Tetap",
      "B. Dikenakan tarif PPh Final 10%",
      "C. Dikenakan pemotongan dengan mengalikan Penghasilan Bruto langsung dengan Tarif Pasal 17 ayat (1) huruf a UU PPh secara kumulatif",
      "D. Dibebaskan dari pemotongan PPh 21 karena komisaris bukan karyawan operasional"
    ],
    jawabanKunci: "C",
    pembahasan: "Berdasarkan PMK 168/2023, imbalan kepada anggota dewan komisaris atau dewan pengawas yang tidak merangkap sebagai Pegawai Tetap dihitung dengan menerapkan tarif Pasal 17 ayat (1) huruf a UU PPh atas jumlah penghasilan bruto secara kumulatif.",
    landasanHukum: "Pasal 11 PMK No. 168 Tahun 2023",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 20,
    kategori: "PPh 21 TER (PMK 168/2023)",
    pertanyaan: "Dalam skema TER bulanan PMK 168/2023, jika pada bulan Desember terjadi lebih potong PPh 21 (PPh 21 setahun lebih kecil daripada total PPh 21 masa Jan-Nov), kewajiban Pemotong Pajak adalah...",
    pilihan: [
      "A. Mengembalikan kelebihan pemotongan tersebut kepada pegawai bersangkutan beserta bukti potong pada masa Desember",
      "B. Menghanguskan kelebihan potong tersebut dan disetor ke kas negara",
      "C. Menyuruh pegawai meminta restitusi langsung ke Kantor Pelayanan Pajak (KPP)",
      "D. Menahan kelebihan potong sebagai cadangan pajak tahun berikutnya"
    ],
    jawabanKunci: "A",
    pembahasan: "Pasal 14 ayat (2) PMK 168/2023 menyatakan jika jumlah PPh 21 yang dipotong pada masa Jan-Nov lebih besar daripada PPh 21 terutang setahun, pemotong pajak wajib mengembalikan kelebihan pemotongan tersebut kepada Pegawai Tetap yang bersangkutan paling lambat akhir bulan berikutnya.",
    landasanHukum: "Pasal 14 ayat (2) PMK 168/2023",
    tingkatKesulitan: "Sedang"
  },

  // 21-30: PPh Potput, Badan, Fasilitas 31E, PP 55/2022
  {
    nomor: 21,
    kategori: "PPh Potput & Badan",
    pertanyaan: "Instansi Pemerintah (Bendahara Pengeluaran) melakukan pembelian alat tulis kantor (ATK) senilai Rp4.400.000,00 (termasuk PPN 11%) kepada rekanan toko ber-NPWP menggunakan mekanisme Pembayaran Langsung (LS). Berapakah PPh Pasal 22 yang harus dipungut oleh Bendahara Pemerintah?",
    pilihan: [
      "A. Rp60.000,00",
      "B. Rp66.000,00",
      "C. Tidak dipungut PPh 22 karena nilai pembayaran tidak melebihi Rp2.000.000,00",
      "D. Rp100.000,00"
    ],
    jawabanKunci: "A",
    pembahasan: "DPP = Rp4.400.000 / 1.11 = Rp4.000.000. Karena nilai belanja di atas Rp2.000.000 (tidak termasuk PPN), bendahara wajib memungut PPh 22 sebesar 1.5% x DPP = 1.5% x Rp4.000.000 = Rp60.000,00.",
    landasanHukum: "PMK No. 59/PMK.03/2022 jo. PMK No. 231/PMK.03/2019",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 22,
    kategori: "PPh Potput & Badan",
    pertanyaan: "PT Graha Makmur menyewa sebuah gedung perkantoran milik Tuan Robert selama 2 tahun dengan total nilai sewa Rp300.000.000,00. Perlakuan pemotongan PPh atas transaksi persewaan tanah dan/atau bangunan tersebut adalah...",
    pilihan: [
      "A. Dipotong PPh Pasal 23 sebesar 2% bersifat tidak final",
      "B. Dipotong PPh Pasal 4 ayat (2) sebesar 10% bersifat Final",
      "C. Dipotong PPh Pasal 22 sebesar 1.5%",
      "D. Tidak dipotong pajak karena objek sewa adalah milik orang pribadi"
    ],
    jawabanKunci: "B",
    pembahasan: "Berdasarkan PP No. 34 Tahun 2017 jo. Pasal 4 ayat (2) UU PPh, penghasilan dari persewaan tanah dan/atau bangunan dikenai PPh yang bersifat Final dengan tarif 10% dari jumlah bruto nilai persewaan.",
    landasanHukum: "PP No. 34 Tahun 2017 & Pasal 4 ayat (2) UU PPh",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 23,
    kategori: "PPh Potput & Badan",
    pertanyaan: "Berdasarkan Peraturan Pemerintah Nomor 55 Tahun 2022, Wajib Pajak Orang Pribadi yang memiliki peredaran bruto tertentu (UMKM) dari usaha menggunakan tarif PPh Final 0,5%. Terdapat fasilitas batas omzet tidak kena pajak sebesar...",
    pilihan: [
      "A. Rp200.000.000,00 dalam 1 Tahun Pajak",
      "B. Rp500.000.000,00 dalam 1 Tahun Pajak",
      "C. Rp1.000.000.000,00 dalam 1 Tahun Pajak",
      "D. Seluruh omzet tetap dikenakan 0,5% tanpa batasan omzet bebas pajak"
    ],
    jawabanKunci: "B",
    pembahasan: "Pasal 7 ayat (2a) UU PPh jo. PP No. 55 Tahun 2022 memberikan insentif bagi Wajib Pajak Orang Pribadi UMKM: bagian peredaran bruto sampai dengan Rp500.000.000,00 dalam 1 Tahun Pajak tidak dikenai PPh (bebas pajak). Pajak 0.5% hanya dihitung atas kelebihan omzet di atas Rp500 juta.",
    landasanHukum: "Pasal 7 ayat (2a) UU PPh jo. PP 55/2022",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 24,
    kategori: "PPh Potput & Badan",
    pertanyaan: "Tarif umum Pajak Penghasilan (PPh) bagi Wajib Pajak Badan Dalam Negeri dan Bentuk Usaha Tetap (BUT) yang berlaku sejak Tahun Pajak 2022 berdasarkan UU HPP adalah sebesar...",
    pilihan: [
      "A. 25%",
      "B. 22%",
      "C. 20%",
      "D. 19%"
    ],
    jawabanKunci: "B",
    pembahasan: "Pasal 17 ayat (1) huruf b UU PPh jo. UU HPP No. 7/2021 menetapkan tarif PPh Badan Dalam Negeri dan BUT sebesar 22% (membatalkan rencana penurunan ke 20% pada UU No. 2/2020).",
    landasanHukum: "Pasal 17 ayat (1) huruf b UU PPh jo. UU HPP",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 25,
    kategori: "PPh Potput & Badan",
    pertanyaan: "Wajib Pajak Badan dalam negeri dengan peredaran bruto sampai dengan Rp50.000.000.000,00 (lima puluh miliar rupiah) mendapat fasilitas pengurangan tarif sebesar 50% dari tarif normal atas Penghasilan Kena Pajak dari bagian peredaran bruto sampai dengan...",
    pilihan: [
      "A. Rp2.400.000.000,00",
      "B. Rp4.800.000.000,00",
      "C. Rp10.000.000.000,00",
      "D. Rp50.000.000.000,00"
    ],
    jawabanKunci: "B",
    pembahasan: "Berdasarkan Pasal 31E UU PPh, WP Badan DN dengan omzet s.d Rp50 miliar mendapat fasilitas reduksi tarif 50% (menjadi tarif efektif 11%) atas bagian PKP yang memperoleh fasilitas, yaitu dari porsi peredaran bruto s.d Rp4.800.000.000,00.",
    landasanHukum: "Pasal 31E ayat (1) UU PPh",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 26,
    kategori: "PPh Potput & Badan",
    pertanyaan: "Dalam rekonsiliasi fiskal PPh Badan, manakah di antara pos pengeluaran berikut yang merupakan biaya yang TIDAK DAPAT dikurangkan dari penghasilan bruto (Non-Deductible Expense) menurut Pasal 9 UU PPh?",
    pilihan: [
      "A. Biaya gaji dan tunjangan karyawan operasional",
      "B. Premi asuransi kebakaran pabrik yang dibayar perusahaan",
      "C. Pembagian laba berupa dividen kepada para pemegang saham",
      "D. Biaya penyusutan mesin pabrik sesuai metode garis lurus fiskal"
    ],
    jawabanKunci: "C",
    pembahasan: "Pasal 9 ayat (1) huruf a UU PPh menyatakan pembagian laba dengan nama dan dalam bentuk apa pun seperti dividen tidak boleh dikurangkan dalam menentukan besarnya Penghasilan Kena Pajak (Koreksi Fiskal Positif).",
    landasanHukum: "Pasal 9 ayat (1) huruf a UU PPh",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 27,
    kategori: "PPh Potput & Badan",
    pertanyaan: "PT Nusantara membayar dividen tunai kepada pemegang sahamnya, yaitu PT Mandiri (Wajib Pajak Badan Dalam Negeri) yang memiliki kepemilikan saham sebesar 15%. Berdasarkan ketentuan UU Cipta Kerja & UU HPP, perlakuan perpajakan atas dividen yang diterima PT Mandiri adalah...",
    pilihan: [
      "A. Dipotong PPh Pasal 23 sebesar 15%",
      "B. Dikecualikan dari objek PPh (bukan objek pajak) tanpa syarat persentase kepemilikan saham",
      "C. Dikenakan PPh Final 10%",
      "D. Dipotong PPh Pasal 22 sebesar 2.5%"
    ],
    jawabanKunci: "B",
    pembahasan: "Pasal 4 ayat (3) huruf f angka 1 UU PPh jo. UU HPP mengatur bahwa dividen yang berasal dari dalam negeri yang diterima oleh Wajib Pajak Badan dalam negeri dikecualikan dari objek PPh (bukan objek PPh), dan tidak lagi disyaratkan kepemilikan minimal 25%.",
    landasanHukum: "Pasal 4 ayat (3) huruf f UU PPh jo. UU HPP",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 28,
    kategori: "PPh Potput & Badan",
    pertanyaan: "PT Sentosa membayar royalti atas lisensi paten sebesar US$100,000 kepada Global Tech Corp yang berkedudukan di Singapura (tidak memiliki BUT di Indonesia). Tarif PPh Pasal 26 menurut UU domestik adalah 20%, sedangkan tarif menurut Tax Treaty (P3B) Indonesia-Singapura adalah 10% (dengan COD/DGT Form valid). Tarif yang diterapkan adalah...",
    pilihan: [
      "A. Tarif domestik 20% karena azas kedaulatan negara",
      "B. Tarif P3B 10% sesuai asas lex specialis derogat legi generali",
      "C. Tarif rata-rata 15%",
      "D. Bebas pajak royalti sepenuhnya"
    ],
    jawabanKunci: "B",
    pembahasan: "Persetujuan Penghindaran Pajak Berganda (P3B/Tax Treaty) bersifat lex specialis terhadap UU domestik. Jika WPLN memenuhi syarat administratif (Form DGT/Surat Keterangan Domisili valid dan beneficial owner), maka berlaku tarif preferensi P3B yaitu 10%.",
    landasanHukum: "Pasal 26 UU PPh & P3B Indonesia-Singapura",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 29,
    kategori: "PPh Potput & Badan",
    pertanyaan: "Batasan perbandingan antara utang dan modal (Debt to Equity Ratio / DER) yang diperkenankan untuk keperluan penghitungan Pajak Penghasilan Badan berdasarkan PMK No. 169/PMK.010/2015 adalah setinggi-tingginya...",
    pilihan: [
      "A. 1 : 1",
      "B. 2 : 1",
      "C. 4 : 1",
      "D. 8 : 1"
    ],
    jawabanKunci: "C",
    pembahasan: "Berdasarkan PMK No. 169/PMK.010/2015 Pasal 1, besarnya perbandingan antara utang dan modal (DER) bagi Wajib Pajak Badan ditetapkan paling tinggi sebesar 4 : 1 (empat banding satu). Biaya bunga atas utang yang melebihi rasio tersebut tidak dapat dibiayakan secara fiskal.",
    landasanHukum: "PMK No. 169/PMK.010/2015",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 30,
    kategori: "PPh Potput & Badan",
    pertanyaan: "Wajib Pajak yang melakukan kegiatan penanaman modal pada bidang-bidang usaha tertentu dan/atau di daerah-daerah tertentu dapat diberikan fasilitas Pajak Penghasilan berupa pengurangan penghasilan neto sebesar 30% dari jumlah penanaman modal yang dibebankan selama 6 tahun (masing-masing 5% per tahun). Fasilitas ini dikenal sebagai...",
    pilihan: [
      "A. Tax Holiday",
      "B. Tax Allowance",
      "C. Super Tax Deduction Vokasi",
      "D. Sunset Policy"
    ],
    jawabanKunci: "B",
    pembahasan: "Fasilitas pengurangan penghasilan neto sebesar 30% dari nilai investasi (5% per tahun selama 6 tahun) adalah fasilitas Tax Allowance sebagaimana diatur dalam Pasal 31A UU PPh dan PP No. 78 Tahun 2019.",
    landasanHukum: "Pasal 31A UU PPh & PP No. 78 Tahun 2019",
    tingkatKesulitan: "Sedang"
  },

  // 31-38: PPN & PPnBM (11%-12%)
  {
    nomor: 31,
    kategori: "PPN & PPnBM (11%-12%)",
    pertanyaan: "Berdasarkan Pasal 7 ayat (1) UU PPN sebagaimana telah diubah dengan UU HPP No. 7/2021, penyesuaian tarif Pajak Pertambahan Nilai (PPN) secara bertahap diatur sebagai berikut...",
    pilihan: [
      "A. Sebesar 11% mulai 1 April 2022 dan dinaikkan menjadi 12% paling lambat 1 Januari 2025",
      "B. Sebesar 10% tetap hingga 2030",
      "C. Sebesar 12% langsung mulai 1 April 2022",
      "D. Sebesar 15% untuk seluruh barang konsumsi mulai 2024"
    ],
    jawabanKunci: "A",
    pembahasan: "Pasal 7 ayat (1) UU PPN jo. UU HPP mengatur tarif PPN: (a) sebesar 11% yang mulai berlaku pada tanggal 1 April 2022; (b) sebesar 12% yang mulai berlaku paling lambat pada tanggal 1 Januari 2025.",
    landasanHukum: "Pasal 7 ayat (1) UU PPN jo. UU HPP",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 32,
    kategori: "PPN & PPnBM (11%-12%)",
    pertanyaan: "Manakah di antara barang dan jasa berikut yang dalam UU HPP DIKELUARKAN dari daftar non-BKP/non-JKP (menjadi objek PPN), namun dapat diberikan fasilitas PPN dibebaskan/tidak dipungut demi melindungi masyarakat?",
    pilihan: [
      "A. Uang, emas batangan untuk cadangan devisa, dan surat berharga",
      "B. Barang kebutuhan pokok (sembako), jasa pelayanan kesehatan medik, dan jasa pendidikan",
      "C. Jasa keagamaan dan jasa yang disediakan oleh pemerintah",
      "D. Makanan dan minuman yang disajikan di hotel dan restoran (objek PBJT Daerah)"
    ],
    jawabanKunci: "B",
    pembahasan: "UU HPP memperluas basis pajak dengan memindahkan sembako, jasa kesehatan, dan jasa pendidikan dari Pasal 4A (non-BKP/JKP) menjadi objek PPN, namun diberikan fasilitas PPN dibebaskan/tidak dipungut (Pasal 16B) agar masyarakat berpenghasilan rendah tidak terdampak.",
    landasanHukum: "Pasal 4A & Pasal 16B UU PPN jo. UU HPP",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 33,
    kategori: "PPN & PPnBM (11%-12%)",
    pertanyaan: "PKP 'A' membeli bahan baku dari PKP 'B' pada bulan Mei 2024 dan menerima Faktur Pajak Masukan. Apabila Pajak Masukan tersebut belum dikreditkan pada Masa Pajak yang sama, maka Pajak Masukan tersebut masih dapat dikreditkan pada Masa Pajak berikutnya paling lama...",
    pilihan: [
      "A. 1 (satu) bulan setelah berakhirnya Masa Pajak saat Faktur Pajak dibuat",
      "B. 3 (tiga) bulan setelah berakhirnya Masa Pajak saat Faktur Pajak dibuat, sepanjang belum dibebankan sebagai biaya dan belum diperiksa",
      "C. 6 (enam) bulan setelah Tahun Pajak berakhir",
      "D. Tidak dapat dikreditkan sama sekali jika terlambat 1 hari"
    ],
    jawabanKunci: "B",
    pembahasan: "Berdasarkan Pasal 9 ayat (9) UU PPN jo. UU HPP, Pajak Masukan yang dapat dikreditkan tetapi belum dikreditkan dengan Pajak Keluaran pada Masa Pajak yang sama, dapat dikreditkan pada Masa Pajak berikutnya paling lama 3 (tiga) bulan setelah berakhirnya Masa Pajak saat Faktur Pajak dibuat.",
    landasanHukum: "Pasal 9 ayat (9) UU PPN jo. UU HPP",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 34,
    kategori: "PPN & PPnBM (11%-12%)",
    pertanyaan: "Dalam ketentuan e-Faktur DJP, batas waktu maksimal untuk mengunggah (upload) dan memperoleh persetujuan (approval) Faktur Pajak elektronik ke sistem DJP adalah...",
    pilihan: [
      "A. Paling lambat tanggal 15 bulan berikutnya setelah tanggal pembuatan Faktur Pajak",
      "B. Paling lambat akhir bulan pembuatan Faktur Pajak",
      "C. Paling lambat tanggal 20 bulan berikutnya",
      "D. Kapan saja sebelum masa pemeriksaan pajak dimulai"
    ],
    jawabanKunci: "A",
    pembahasan: "Sesuai PER-03/PJ/2022 jo. PER-11/PJ/2022 Pasal 18 ayat (1), Faktur Pajak elektronik (e-Faktur) wajib diunggah (upload) ke DJP paling lambat tanggal 15 bulan berikutnya setelah tanggal pembuatan Faktur Pajak untuk mendapatkan persetujuan (approval).",
    landasanHukum: "PER-03/PJ/2022 jo. PER-11/PJ/2022",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 35,
    kategori: "PPN & PPnBM (11%-12%)",
    pertanyaan: "Seorang Pengusaha Orang Pribadi atau Badan wajib melaporkan usahanya untuk dikukuhkan sebagai Pengusaha Kena Pajak (PKP) apabila peredaran bruto dan/atau penerimaan brutonya dalam satu tahun buku telah melebihi...",
    pilihan: [
      "A. Rp600.000.000,00",
      "B. Rp1.800.000.000,00",
      "C. Rp4.800.000.000,00",
      "D. Rp10.000.000.000,00"
    ],
    jawabanKunci: "C",
    pembahasan: "Berdasarkan PMK No. 197/PMK.03/2013, batasan pengusaha kecil yang tidak wajib dikukuhkan sebagai PKP adalah pengusaha yang memiliki peredaran bruto tidak melebihi Rp4.800.000.000,00. Jika telah melebihi batas tersebut, wajib dikukuhkan sebagai PKP.",
    landasanHukum: "PMK No. 197/PMK.03/2013",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 36,
    kategori: "PPN & PPnBM (11%-12%)",
    pertanyaan: "Perlakuan Pajak Masukan atas perolehan Barang Kena Pajak (BKP) atau Jasa Kena Pajak (JKP) yang dilakukan SEBELUM pengusaha dikukuhkan sebagai Pengusaha Kena Pajak (PKP) berdasarkan UU HPP adalah...",
    pilihan: [
      "A. Mutlak tidak dapat dikreditkan sama sekali",
      "B. Dapat dikreditkan dengan menggunakan pedoman pengkreditan Pajak Masukan sebesar 80% dari Pajak Keluaran yang seharusnya dipungut",
      "C. Dapat dikreditkan 100% dengan bukti kuitansi pembelian",
      "D. Otomatis direstitusi oleh Kantor Pajak"
    ],
    jawabanKunci: "B",
    pembahasan: "UU HPP menambahkan Pasal 9A & Pasal 9 ayat (9a) UU PPN yang memperbolehkan Pajak Masukan sebelum dikukuhkan sebagai PKP dikreditkan dengan menggunakan pedoman pengkreditan Pajak Masukan sebesar 80% dari Pajak Keluaran yang seharusnya dipungut.",
    landasanHukum: "Pasal 9 ayat (9a) UU PPN jo. UU HPP",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 37,
    kategori: "PPN & PPnBM (11%-12%)",
    pertanyaan: "Kegiatan Membangun Sendiri (KMS) bangunan permanen dengan luas 200 m² atau lebih yang dilakukan tidak dalam kegiatan usaha dikenai PPN dengan tarif efektif...",
    pilihan: [
      "A. 11% x Seluruh biaya termasuk harga perolehan tanah",
      "B. 20% x Tarif PPN (11%) x Total biaya pembangunan di luar perolehan tanah (Tarif Efektif 2.2%)",
      "C. 0.5% x Total biaya pembangunan",
      "D. Bebas PPN jika dibangun oleh orang pribadi"
    ],
    jawabanKunci: "B",
    pembahasan: "Berdasarkan PMK No. 64/PMK.03/2022, PPN atas Kegiatan Membangun Sendiri (KMS) dihitung dengan rumus: 20% x Tarif PPN yang berlaku x Dasar Pengenaan Pajak (seluruh biaya pembangunan tidak termasuk harga tanah). Pada tarif PPN 11%, tarif efektifnya adalah 2.2% (dan menjadi 2.4% saat PPN 12%).",
    landasanHukum: "PMK No. 64/PMK.03/2022",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 38,
    kategori: "PPN & PPnBM (11%-12%)",
    pertanyaan: "Tarif Pajak Pertambahan Nilai (PPN) yang dikenakan atas Ekspor Barang Kena Pajak Berwujud, Ekspor BKP Tidak Berwujud, dan Ekspor Jasa Kena Pajak adalah...",
    pilihan: [
      "A. 0% (Nol persen)",
      "B. 1% (Satu persen)",
      "C. 11% (Sebelas persen)",
      "D. Dikecualikan dari PPN (Non-BKP)"
    ],
    jawabanKunci: "A",
    pembahasan: "Pasal 7 ayat (2) UU PPN menetapkan tarif PPN sebesar 0% (nol persen) atas ekspor BKP Berwujud, BKP Tidak Berwujud, dan JKP. Tarif 0% berbeda dengan dibebaskan, karena PKP eksportir tetap dapat mengkreditkan Pajak Masukan yang terkait.",
    landasanHukum: "Pasal 7 ayat (2) UU PPN",
    tingkatKesulitan: "Mudah"
  },

  // 39-44: Coretax System & Digitalisasi DJP (PSIAP)
  {
    nomor: 39,
    kategori: "Coretax System & Digitalisasi DJP",
    pertanyaan: "Proyek Pembaruan Sistem Inti Administrasi Perpajakan (PSIAP) atau Coretax Administration System dibangun oleh DJP untuk menggantikan Sistem Informasi DJP (SIDJP). Tujuan strategis utama Coretax adalah...",
    pilihan: [
      "A. Menghapus seluruh Kantor Pelayanan Pajak (KPP) fisik di Indonesia",
      "B. Mengintegrasikan seluruh proses bisnis perpajakan (registrasi, pelaporan SPT, pembayaran, audit, penagihan, TAM) secara real-time dan terotomatisasi berbasis akun wajib pajak (3C: Core Tax, Compliance, Customer Centric)",
      "C. Menyerahkan pengawasan pajak sepenuhnya ke pihak perbankan swasta",
      "D. Menghapus kewajiban pelaporan SPT bagi seluruh Wajib Pajak Badan"
    ],
    jawabanKunci: "B",
    pembahasan: "Coretax (PSIAP) berlandaskan Perpres No. 40/2018 untuk mewujudkan administrasi perpajakan yang terintegrasi, interoperabel dengan 80+ lembaga negara, otomatisasi data analitik kepatuhan (Compliance Risk Management), dan memberikan portal terpadu bagi Wajib Pajak.",
    landasanHukum: "Perpres No. 40 Tahun 2018 & Dokumen Desain Coretax DJP",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 40,
    kategori: "Coretax System & Digitalisasi DJP",
    pertanyaan: "Dalam arsitektur Coretax DJP, konsep 'Taxpayer Account Management' (TAM) memungkinkan Wajib Pajak untuk...",
    pilihan: [
      "A. Melihat saldo deposit pajak (Buku Besar Pajak), riwayat transaksi, status pembayaran, surat ketetapan, serta melakukan pemindahbukuan (Pbk) secara mandiri dan transparan dalam satu akun digital",
      "B. Menghapus data tunggakan pajak secara sepihak",
      "C. Mengubah tarif pajak undang-undang secara fleksibel",
      "D. Mengalihkan nomor identitas NIK ke orang lain"
    ],
    jawabanKunci: "A",
    pembahasan: "Taxpayer Account Management (TAM) di Coretax menyediakan Tax Ledger (buku besar pajak) bagi WP, mencakup kewajiban pajak, hak pajak, deposit, mutasi kredit pajak, dan riwayat administratif secara real-time.",
    landasanHukum: "Arsitektur Proses Bisnis PSIAP DJP",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 41,
    kategori: "Coretax System & Digitalisasi DJP",
    pertanyaan: "Metode analitik berbasis data yang digunakan DJP untuk memetakan risiko ketidakpatuhan Wajib Pajak ke dalam 4 kuadran (High Risk, Medium High, Medium Low, Low Risk) guna menentukan prioritas edukasi vs pemeriksaan disebut...",
    pilihan: [
      "A. Tax Amnesty Matrix",
      "B. Compliance Risk Management (CRM)",
      "C. Electronic Auditing Scorecard",
      "D. Automated Tax Levying System"
    ],
    jawabanKunci: "B",
    pembahasan: "Compliance Risk Management (CRM) adalah mesin analitik DJP yang memetakan risiko Wajib Pajak (CRM Fungsi Pemeriksaan, CRM Edukasi, CRM Penagihan, CRM Pengawasan) berdasarkan data transaksi pihak ketiga, ILAP, dan histori kepatuhan.",
    landasanHukum: "Surat Edaran Dirjen Pajak SE-24/PJ/2019 tentang CRM",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 42,
    kategori: "Coretax System & Digitalisasi DJP",
    pertanyaan: "Dalam sistem perpajakan terintegrasi saat ini, pembuatan bukti potong PPh Pasal 21/26, 22, 23, 4(2), dan 15 telah disatukan dalam satu aplikasi digital terpadu yang dinamakan...",
    pilihan: [
      "A. e-Faktur 3.0",
      "B. e-Bupot Unifikasi",
      "C. e-Billing Generator",
      "D. e-Reg Pajak Pribadi"
    ],
    jawabanKunci: "B",
    pembahasan: "PER-24/PJ/2021 memperkenalkan e-Bupot Unifikasi yang mengintegrasikan pembuatan bukti potong dan pelaporan SPT Masa PPh Unifikasi untuk PPh 21/26, PPh 22, PPh 23, PPh 4 ayat (2), dan PPh 15 ke dalam satu platform.",
    landasanHukum: "PER-24/PJ/2021 tentang SPT Masa PPh Unifikasi",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 43,
    kategori: "Coretax System & Digitalisasi DJP",
    pertanyaan: "Berdasarkan arsitektur Coretax, proses permohonan Surat Keterangan Bebas (SKB) pemotongan/pemungutan PPh dilakukan melalui Portal Wajib Pajak secara elektronik. Keputusan atas permohonan SKB tersebut diterbitkan oleh sistem...",
    pilihan: [
      "A. Secara otomatis setelah sistem melakukan validasi kriteria kepatuhan dan dokumen syarat proyeksi pajak secara digital",
      "B. Harus menunggu sidang tatap muka di Kantor Pusat DJP",
      "C. Hanya dapat disetujui melalui persetujuan manual Menteri Keuangan",
      "D. Diberikan tanpa syarat apa pun bagi setiap wajib pajak yang meminta"
    ],
    jawabanKunci: "A",
    pembahasan: "Salah satu keunggulan Coretax adalah otomatisasi layanan permohonan wajib pajak (termasuk SKB, perpanjangan SPT, SKCK Perpajakan) di mana sistem secara otomatis memvalidasi eligibility data kepatuhan WP dan mengeluarkan output secara instan.",
    landasanHukum: "Modul Layanan Wajib Pajak Coretax DJP",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 44,
    kategori: "Coretax System & Digitalisasi DJP",
    pertanyaan: "Sistem pertukaran data keuangan otomatis antarnegara untuk mendeteksi penghindaran pajak lintas yurisdiksi yang telah diimplementasikan oleh DJP sesuai standar OECD adalah...",
    pilihan: [
      "A. FATCA & Automatic Exchange of Financial Account Information (AEOI)",
      "B. Interpol Red Notice Database",
      "C. ASEAN Single Window Tariff",
      "D. Global SWIFT Payment Interceptor"
    ],
    jawabanKunci: "A",
    pembahasan: "AEOI (Automatic Exchange of Information) berdasarkan Common Reporting Standard (CRS) dan UU No. 9 Tahun 2017 memungkinkan DJP menerima data saldo rekening keuangan WNI di lebih dari 100 yurisdiksi luar negeri secara otomatis tiap tahun.",
    landasanHukum: "UU No. 9 Tahun 2017 & PMK No. 19/PMK.03/2018",
    tingkatKesulitan: "Sedang"
  },

  // 45-47: Penagihan PPSP & Sengketa Pajak
  {
    nomor: 45,
    kategori: "Penagihan PPSP & Sengketa Pajak",
    pertanyaan: "Dalam prosedur Penagihan Pajak dengan Surat Paksa (UU No. 19 Tahun 1997 jo. UU No. 19 Tahun 2000), urutan tindakan penagihan aktif yang benar setelah Surat Tagihan Pajak / SKPKB jatuh tempo adalah...",
    pilihan: [
      "A. Surat Paksa -> Surat Teguran -> Sita -> Lelang",
      "B. Surat Teguran (setelah 7 hari jatuh tempo) -> Surat Paksa (setelah 21 hari sejak Surat Teguran) -> Surat Perintah Penyitaan (2x24 jam sejak Surat Paksa) -> Pengumuman Lelang (14 hari setelah sita) -> Lelang",
      "C. Langsung Lelang Aset tanpa pemberitahuan Surat Teguran",
      "D. Penyanderaan (Gijzeling) -> Surat Teguran -> Surat Paksa"
    ],
    jawabanKunci: "B",
    pembahasan: "Berdasarkan UU PPSP:\n1. Surat Teguran diterbitkan setelah 7 hari sejak jatuh tempo pembayaran.\n2. Surat Paksa diterbitkan setelah 21 hari sejak Surat Teguran diterbitkan.\n3. Sita dilaksanakan setelah 2x24 jam sejak Surat Paksa diberitahukan.\n4. Pengumuman Lelang dilakukan paling singkat 14 hari setelah penyitaan.\n5. Lelang dilaksanakan paling singkat 14 hari setelah pengumuman lelang.",
    landasanHukum: "UU No. 19 Tahun 1997 jo. UU No. 19 Tahun 2000 (UU PPSP)",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 46,
    kategori: "Penagihan PPSP & Sengketa Pajak",
    pertanyaan: "Syarat kumulatif untuk dapat dilakukannya tindakan Penyanderaan (Gijzeling) atau pengekangan sementara waktu kebebasan Penanggung Pajak di tempat tertentu menurut UU PPSP adalah...",
    pilihan: [
      "A. Mempunyai utang pajak paling sedikit Rp100.000.000,00 dan diragukan itikad baiknya dalam melunasi utang pajak",
      "B. Mempunyai utang pajak berapa pun jumlahnya asalkan terlambat 1 bulan",
      "C. Melakukan penghindaran pajak di bawah Rp50 juta",
      "D. Menolak memberikan dokumen saat pemeriksaan pendahuluan"
    ],
    jawabanKunci: "A",
    pembahasan: "Pasal 33 UU PPSP menetapkan penyanderaan hanya dapat dilakukan terhadap Penanggung Pajak yang: (1) mempunyai utang pajak sekurang-kurangnya Rp100.000.000,00 (seratus juta rupiah); dan (2) diragukan itikad baiknya dalam melunasi utang pajak, serta mendapat izin tertulis dari Menteri Keuangan.",
    landasanHukum: "Pasal 33 UU No. 19/1997 jo. UU No. 19/2000 (UU PPSP)",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 47,
    kategori: "Penagihan PPSP & Sengketa Pajak",
    pertanyaan: "Gugatan Wajib Pajak terhadap pelaksanaan Surat Paksa, Surat Perintah Melakukan Penyitaan, atau Pengumuman Lelang diajukan kepada...",
    pilihan: [
      "A. Pengadilan Negeri setempat",
      "B. Pengadilan Pajak",
      "C. Pengadilan Tata Usaha Negara (PTUN)",
      "D. Mahkamah Agung secara langsung"
    ],
    jawabanKunci: "B",
    pembahasan: "Pasal 23 ayat (2) UU KUP jo. UU Pengadilan Pajak menegaskan bahwa gugatan Wajib Pajak atas pelaksanaan Surat Paksa, SPMP, atau pengumuman lelang diajukan ke Pengadilan Pajak dalam jangka waktu 14 hari sejak pelaksanaan penagihan.",
    landasanHukum: "Pasal 23 ayat (2) UU KUP & UU No. 14/2002",
    tingkatKesulitan: "Sedang"
  },

  // 48-50: Nilai-Nilai Kemenkeu & Kode Etik DJP
  {
    nomor: 48,
    kategori: "Nilai-Nilai Kemenkeu & Kode Etik DJP",
    pertanyaan: "Berikut adalah 5 (lima) Nilai-Nilai Kementerian Keuangan Republik Indonesia secara berurutan sebagaimana diatur dalam Keputusan Menteri Keuangan...",
    pilihan: [
      "A. Kejujuran, Keberanian, Keadilan, Kepedulian, Kedisiplinan",
      "B. Integritas, Profesionalisme, Sinergi, Pelayanan, Kesempurnaan",
      "C. Akuntabilitas, Transparansi, Efisiensi, Efektivitas, Netralitas",
      "D. Loyalitas, Tanggung Jawab, Kerjasama, Kecepatan, Ketelitian"
    ],
    jawabanKunci: "B",
    pembahasan: "Lima Nilai Kementerian Keuangan RI adalah:\n1. Integritas (berpikir, berkata, berperilaku benar dan memegang teguh kode etik)\n2. Profesionalisme (bekerja tuntas dan akurat atas dasar kompetensi)\n3. Sinergi (membangun hubungan kerja sama internal dan eksternal)\n4. Pelayanan (memberikan layanan prima melampaui harapan)\n5. Kesempurnaan (senantiasa melakukan perbaikan terus-menerus).",
    landasanHukum: "PMK No. 190/PMK.01/2018 tentang Kode Etik & Nilai Kemenkeu",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 49,
    kategori: "Nilai-Nilai Kemenkeu & Kode Etik DJP",
    pertanyaan: "Berdasarkan PMK No. 190/PMK.01/2018 tentang Kode Etik dan Kode Perilaku Pegawai Kementerian Keuangan, tindakan manakah yang secara TEGAS DILARANG bagi pegawai DJP?",
    pilihan: [
      "A. Melakukan edukasi perpajakan kepada komunitas UMKM pada jam kerja resmi",
      "B. Menerima imbalan, fasilitas penginapan, tiket perjalanan, atau hadiah dalam bentuk apa pun dari Wajib Pajak yang berkaitan dengan jabatan atau pekerjaannya",
      "C. Melaporkan Laporan Harta Kekayaan Penyelenggara Negara (LHKPN/LHKASN) tepat waktu",
      "D. Menyampaikan saran perbaikan prosedur kerja kepada atasan langsung"
    ],
    jawabanKunci: "B",
    pembahasan: "Pegawai Kemenkeu dilarang keras menerima gratifikasi, hadiah, komisi, jamuan, atau fasilitas pribadi dalam bentuk apa pun dari pihak yang memiliki hubungan kerja/wajib pajak, karena melanggar Nilai Integritas dan ketentuan tindak pidana korupsi.",
    landasanHukum: "Pasal 8 PMK No. 190/PMK.01/2018",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 50,
    kategori: "Nilai-Nilai Kemenkeu & Kode Etik DJP",
    pertanyaan: "Sesuai Peraturan Pemerintah Nomor 94 Tahun 2021 tentang Disiplin Pegawai Negeri Sipil, PNS yang membocorkan rahasia jabatan atau dokumen perpajakan yang bersifat rahasia kepada pihak yang tidak berhak dapat dijatuhi hukuman disiplin...",
    pilihan: [
      "A. Hukuman Disiplin Ringan berupa teguran lisan",
      "B. Hukuman Disiplin Berat (dapat berupa penurunan jabatan, pembebasan dari jabatan, hingga pemberhentian dengan hormat tidak atas permintaan sendiri sebagai PNS)",
      "C. Cukup membuat surat permohonan maaf bermeterai",
      "D. Pemotongan uang makan selama 3 hari"
    ],
    jawabanKunci: "B",
    pembahasan: "Pasal 11 ayat (2) PP No. 94/2021 mengatur bahwa pelanggaran terhadap kewajiban menyimpan rahasia jabatan dan rahasia negara dijatuhi hukuman disiplin berat karena berpotensi merugikan keuangan negara dan merusak marwah institusi.",
    landasanHukum: "Pasal 11 PP No. 94 Tahun 2021 & Pasal 34 UU KUP",
    tingkatKesulitan: "Sedang"
  }
];

pgData.forEach(item => {
  soalList.push({
    id: `djp-soal-${item.nomor}`,
    nomor: item.nomor,
    tipe: 'pilihan_ganda',
    kategori: item.kategori,
    pertanyaan: item.pertanyaan,
    pilihan: item.pilihan,
    jawabanKunci: item.jawabanKunci,
    pembahasan: item.pembahasan,
    landasanHukum: item.landasanHukum,
    tingkatKesulitan: item.tingkatKesulitan
  });
});

console.log('50 PG questions built.');

// =========================================================================
// 2. 25 SOAL ESAI STUDI KASUS NYATA DJP (Nomor 51 - 75)
// =========================================================================

const esaiData = [
  {
    nomor: 51,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Rekonsiliasi Fiskal Biaya Promosi dan Jamuan Klien PT Mahakarya",
    skenario: "PT Mahakarya Indonesia (Wajib Pajak Badan industri manufaktur) dalam laporan laba rugi komersial tahun 2023 membebankan Biaya Pemasaran dan Promosi sebesar Rp2.500.000.000,00. Saat dilakukan pemeriksaan oleh Pemeriksa Pajak KPP Pratama, ditemukan bahwa sebesar Rp800.000.000,00 dari biaya tersebut merupakan biaya jamuan makan malam (entertainment) relasi bisnis dan pemberian souvenir mewah kepada eksekutif rekanan. Wajib Pajak TIDAK membuat dan tidak melampirkan Daftar Nominatif Biaya Promosi/Entertainment dalam SPT Tahunan PPh Badan.",
    pertanyaan: "Sebagai Pemeriksa Pajak, bagaimana perlakuan perpajakan dan koreksi fiskal yang harus Anda lakukan terhadap biaya entertainment sebesar Rp800.000.000,00 tersebut? Jelaskan dasar hukum dan dampaknya terhadap Penghasilan Kena Pajak!",
    jawabanKunci: "Biaya entertainment sebesar Rp800.000.000,00 wajib dilakukan KOREKSI FISKAL POSITIF (tidak dapat dibiayakan / non-deductible expense) karena Wajib Pajak tidak melampirkan Daftar Nominatif. Akibatnya, Penghasilan Kena Pajak PT Mahakarya akan bertambah sebesar Rp800.000.000,00 dan menimbulkan PPh Badan Kurang Bayar sebesar 22% x Rp800.000.000,00 = Rp176.000.000,00.",
    rubrikPoinPenting: [
      "Menyebutkan perlunya Koreksi Fiskal Positif sebesar Rp800.000.000,00",
      "Menjelaskan syarat mutlak pembuatan Daftar Nominatif (PMK No. 02/PMK.03/2010 / Surat Edaran Terkait)",
      "Menghitung dampak penambahan Penghasilan Kena Pajak dan PPh Badan terutang (Tarif 22%)",
      "Menjelaskan prinsip 3M (Mendapatkan, Menagih, Memelihara penghasilan) Pasal 6 vs Pasal 9 UU PPh"
    ],
    pembahasan: "Berdasarkan PMK No. 02/PMK.03/2010 dan Surat Edaran Dirjen Pajak SE-27/PJ.22/1986, biaya promosi dan entertainment dapat dikurangkan dari penghasilan bruto (deductible) HANYA JIKA Wajib Pajak membuat dan melampirkan Daftar Nominatif yang memuat identitas penerima, alamat, jenis/jumlah jamuan, dan hubungan bisnis. Tanpa daftar nominatif, biaya tersebut tidak diakui secara fiskal (koreksi positif).",
    landasanHukum: "Pasal 6 ayat (1) & Pasal 9 ayat (1) UU PPh jo. PMK No. 02/PMK.03/2010",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 52,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Transaksi Hubungan Istimewa & Transfer Pricing PT Indo Auto Parts",
    skenario: "PT Indo Auto Parts (Indonesia) memproduksi komponen suku cadang otomotif dan menjual 70% produknya kepada perusahaan induknya, Tokyo Motor Ltd (Jepang) dengan harga jual Rp150.000 per unit. Pada saat yang sama, PT Indo Auto Parts menjual produk dengan tipe dan spesifikasi yang sama persis kepada pihak ketiga independen di pasar domestik seharga Rp250.000 per unit dengan marjin laba yang jauh lebih wajar. Wajib Pajak tidak dapat menunjukkan Dokumen Penentuan Harga Transfer (TP Doc) yang memadai dan tidak melakukan analisis kesebandingan.",
    pertanyaan: "Analisislah potensi indikasi penghindaran pajak (transfer pricing) pada kasus ini! Metode transfer pricing apa yang paling tepat diterapkan oleh DJP (Arm's Length Principle), dan bagaimana koreksi penetapan harga kembali penjualan tersebut?",
    jawabanKunci: "Terdapat indikasi pergeseran laba (profit shifting) ke luar negeri melalui penekanan harga jual kepada pihak terafiliasi (Rp150.000 vs Rp250.000). DJP berwenang menentukan kembali besarnya penghasilan sesuai Pasal 18 ayat (3) UU PPh jo. PMK 172/2023 menggunakan Metode Perbandingan Harga Antara Pihak yang Independen (Comparable Uncontrolled Price / CUP). Harga wajar ditetapkan Rp250.000 per unit, sehingga selisih Rp100.000 per unit dikoreksi positif sebagai tambahan peredaran bruto dan berpotensi dianggap dividen terselubung (constructive dividend) yang terutang PPh 26.",
    rubrikPoinPenting: [
      "Mengidentifikasi adanya hubungan istimewa kepemilikan saham (Pasal 18 ayat 4 UU PPh)",
      "Menyebutkan Penerapan Prinsip Kewajaran dan Kelaziman Usaha (PKKU / Arm's Length Principle)",
      "Menentukan metode CUP (Comparable Uncontrolled Price) sebagai metode paling andal dalam kasus ini",
      "Menjelaskan koreksi positif atas peredaran usaha dan implikasi dividen terselubung (PPh 26)"
    ],
    pembahasan: "Sesuai PMK No. 172 Tahun 2023, dalam transaksi barang berwujud dengan barang pembanding yang identik dari pihak independen, metode CUP adalah metode prioritas. Koreksi dilakukan dengan menghitung omzet berdasarkan harga pasar wajar Rp250.000 per unit. Selisih laba yang dialihkan ke luar negeri juga dikualifikasikan sebagai dividen terselubung kepada induk perusahaan yang dikenakan PPh Pasal 26.",
    landasanHukum: "Pasal 18 ayat (3) & (4) UU PPh jo. PMK No. 172 Tahun 2023",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 53,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Dugaan Penerbitan Faktur Pajak Fiktif (TBTS) CV Berkah Abadi",
    skenario: "Melalui integrasi data Coretax dan analitik jaringan transaksi faktur pajak, Account Representative (AR) menemukan CV Berkah Abadi menerbitkan Faktur Pajak Keluaran senilai PPN Rp12.000.000.000,00 kepada 15 perusahaan manufaktur. Namun setelah dilakukan pemeriksaan lapangan, alamat kantor CV Berkah Abadi adalah rumah kontrakan kosong, tidak memiliki pegawai, tidak memiliki gudang, dan tidak pernah melakukan pembelian bahan baku maupun impor (Pajak Masukan Nihil). Terindikasi kuat terjadi penerbitan Faktur Pajak yang Tidak Berdasarkan Transaksi yang Sebenarnya (TBTS).",
    pertanyaan: "Sebagai aparatur perpajakan, langkah hukum dan tahapan apa yang harus diambil terhadap CV Berkah Abadi dan perusahaan-perusahaan pembeli yang mengkreditkan Faktur Pajak tersebut?",
    jawabanKunci: "1. Terhadap CV Berkah Abadi: AR meneruskan temuan ke Unit Pemeriksaan Bukti Permulaan (Bukper) untuk dilakukan penyidikan tindak pidana perpajakan berdasarkan Pasal 39A huruf a UU KUP (menerbitkan faktur pajak TBTS) dengan ancaman pidana penjara 2-6 tahun dan denda 2-6 kali jumlah pajak. Akun PKP dan sertifikat elektronik CV Berkah Abadi langsung disuspend/dibekukan.\n2. Terhadap 15 Perusahaan Pembeli: Diterbitkan SP2DK (Surat Permintaan Penjelasan atas Data dan/atau Keterangan) untuk melakukan pembetulan SPT Masa PPN dengan menghapus Pajak Masukan fiktif tersebut dan melunasi PPN Kurang Bayar beserta sanksi bunga. Jika tidak kooperatif, diusulkan pemeriksaan khusus / Bukper turut serta (Pasal 43 UU KUP).",
    rubrikPoinPenting: [
      "Mengidentifikasi pelanggaran Pasal 39A UU KUP (Tindak Pidana Penerbitan Faktur TBTS)",
      "Menyebutkan pengusulan Pemeriksaan Bukti Permulaan (Bukper) dan pemblokiran akun PKP",
      "Menjelaskan perlakuan terhadap PKP pembeli (pembatalan pengkreditan PM, SP2DK, himbauan pembetulan SPT)",
      "Menjelaskan tanggung jawab renteng Pasal 16F UU PPN jika pembeli tidak dapat menunjukkan bukti pembayaran bank"
    ],
    pembahasan: "Faktur pajak fiktif (TBTS) adalah kejahatan serius di bidang perpajakan. Berdasarkan Surat Edaran Dirjen Pajak tentang Penanganan Faktur Pajak TBTS, DJP melakukan penegakan hukum pidana terhadap penerbit dan membatalkan pengkreditan pajak masukan bagi para pengguna faktur.",
    landasanHukum: "Pasal 39A & Pasal 44 UU KUP jo. UU HPP serta Pasal 16F UU PPN",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 54,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Perhitungan PPh 21 TER Komprehensif Pegawai Tetap Memperoleh Bonus",
    skenario: "Bapak Ahmad (K/1, NPWP valid) adalah pegawai tetap di PT Gemilang. Pada bulan Maret 2024, Ahmad menerima gaji pokok Rp10.000.000,00 dan tunjangan operasional Rp2.000.000,00. Selain itu, pada bulan yang sama Ahmad memperoleh Bonus Tahunan Kinerja sebesar Rp30.000.000,00 sehingga total penghasilan bruto bulan Maret adalah Rp42.000.000,00. Sesuai tabel TER Bulanan PMK 168/2023, status K/1 masuk Kategori B. Tarif TER Bulanan Kategori B untuk bruto Rp42.000.000,00 berada pada rentang tarif 17%.",
    pertanyaan: "Hitunglah PPh Pasal 21 yang harus dipotong oleh PT Gemilang atas penghasilan Bapak Ahmad pada bulan Maret 2024 berdasarkan PMK 168/2023! Jelaskan perbedaan mendasar mekanisme ini dibanding aturan lama!",
    jawabanKunci: "Penghitungan PPh 21 Masa Maret 2024:\nPenghasilan Bruto Total = Rp10.000.000 + Rp2.000.000 + Rp30.000.000 = Rp42.000.000,00.\nStatus PTKP K/1 -> TER Kategori B.\nTarif TER Bulanan untuk Rp42.000.000 = 17%.\nPPh 21 Masa Maret = Rp42.000.000,00 x 17% = Rp7.140.000,00.\n\nPerbedaan mendasar:\nPada PMK 168/2023, pemotongan PPh 21 atas bonus/THR tidak lagi memerlukan perhitungan rumit dua kali (PPh gaji setahun vs PPh gaji+bonus setahun), melainkan langsung digabung ke penghasilan bruto bulan bersangkutan dan dikalikan tarif TER.",
    rubrikPoinPenting: [
      "Menghitung total penghasilan bruto bulan Maret (Rp42.000.000)",
      "Mengidentifikasi kategori TER K/1 yaitu Kategori B",
      "Mengalikan bruto langsung dengan tarif TER 17% = Rp7.140.000",
      "Menjelaskan simplifikasi PMK 168/2023 tanpa perlu simulasi dua kali perhitungan disetahunkan"
    ],
    pembahasan: "PMK No. 168/2023 menyederhanakan pemotongan PPh 21 atas penghasilan tidak teratur (bonus/tunjangan hari raya/tantiem) dengan menjumlahkannya ke penghasilan teratur bulan penerimaan, lalu dikenakan tarif TER bulanan yang sesuai. Penyesuaian akhir akan diratakan saat perhitungan PPh 21 setahun di Masa Desember.",
    landasanHukum: "Pasal 5 & Lampiran PMK No. 168 Tahun 2023",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 55,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Perlakuan Fasilitas Rumah Dinas dan Kendaraan Operasional (Natura PMK 66/2023)",
    skenario: "PT Nusantara Sejahtera memberikan fasilitas kepada Direktur Utamanya pada tahun 2023 berupa:\n1. Rumah dinas mewah di kawasan elit Jakarta dengan biaya sewa dibayar perusahaan Rp360.000.000/tahun.\n2. Mobil dinas operasional jabatan jenis SUV beserta biaya sopir dan BBM Rp150.000.000/tahun.\n3. Fasilitas antar-jemput karyawan pabrik menggunakan bus komuter.\nPerusahaan membebankan seluruh biaya tersebut sebagai pengurang penghasilan bruto di laporan keuangan komersial.",
    pertanyaan: "Berdasarkan PMK No. 66 Tahun 2023, bagaimana perlakuan pembebanan biaya (deductibility) bagi perusahaan dan perlakuan pemotongan PPh 21 bagi pegawai atas ketiga fasilitas tersebut?",
    jawabanKunci: "1. Rumah Dinas Direktur: Merupakan biaya deductible bagi perusahaan (Pasal 2 PMK 66/2023), namun bagi Direktur merupakan OBJEK PPh Pasal 21 (karena melebihi batasan kenikmatan yang dikecualikan, yaitu non-daerah tertentu dan fasilitas individu bernilai di atas Rp2 jt/bulan atau non-komunal).\n2. Mobil Dinas Jabatan SUV: Merupakan biaya deductible 100% bagi perusahaan sepanjang untuk 3M, dan kenikmatan mobil dinas operasional jabatan dikecualikan dari objek PPh 21 pegawai sesuai batasan PMK 66/2023.\n3. Bus Antar-Jemput Karyawan Pabrik: Biaya deductible bagi perusahaan dan BUKAN OBJEK PPh 21 bagi karyawan karena dinikmati secara komunal/bersama.",
    rubrikPoinPenting: [
      "Menjelaskan prinsip umum PMK 66/2023: Biaya natura/kenikmatan menjadi DEDUCTIBLE bagi pemberi kerja",
      "Menganalisis rumah dinas individual sebagai OBJEK PPh 21 bagi penerima",
      "Menganalisis mobil dinas operasional sebagai non-objek PPh 21 bagi pegawai",
      "Menganalisis fasilitas transportasi komunal sebagai fasilitas yang dikecualikan dari objek pajak"
    ],
    pembahasan: "UU HPP jo. PMK 66/2023 mengubah paradigma lama natura dari non-deductible/non-taxable menjadi deductible bagi perusahaan dan taxable bagi penerima, kecuali natura/kenikmatan tertentu yang dikecualikan (keamanan, kesehatan, makanan bersama, daerah tertentu, dan fasilitas komunal).",
    landasanHukum: "Pasal 4 ayat (1) huruf a & Pasal 6 ayat (1) UU PPh jo. PMK No. 66 Tahun 2023",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 56,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Sengketa Pengkreditan Pajak Masukan Tanpa Faktur Lengkap",
    skenario: "Dalam pemeriksaan SPT Masa PPN PT Cipta Kreasi, Pemeriksa Pajak menemukan Pajak Masukan sebesar Rp450.000.000,00 dikreditkan oleh Wajib Pajak. Faktur Pajak Masukan tersebut mencantumkan nama dan NPWP pembeli yang benar, namun pada kolom nama barang hanya tertulis 'Tagihan Jasa Konsultasi' tanpa rincian jenis jasa yang jelas dan tidak mencantumkan tanggal penyerahan yang valid. Pemeriksa Pajak menerbitkan koreksi menolak pengkreditan Pajak Masukan tersebut dengan alasan Faktur Pajak Cacat (tidak lengkap). Wajib Pajak berargumen bahwa transaksi benar-benar terjadi dan telah dibayar melalui transfer bank.",
    pertanyaan: "Apakah tindakan koreksi Pemeriksa Pajak tersebut sudah tepat secara hukum? Jelaskan syarat formal dan material Faktur Pajak serta solusi yang dapat ditempuh Wajib Pajak!",
    jawabanKunci: "Koreksi Pemeriksa Pajak secara formal TEPAT. Berdasarkan Pasal 13 ayat (5) jo. Pasal 9 ayat (8) huruf f UU PPN, Faktur Pajak yang tidak memuat keterangan lengkap, jelas, dan benar merupakan Faktur Pajak Cacat yang tidak dapat dikreditkan. Namun secara material, Wajib Pajak dapat membuktikan kebenaran transaksi dengan meminta PKP Penjual untuk menerbitkan Faktur Pajak Pengganti (PER-03/PJ/2022). Jika Faktur Pajak Pengganti telah diterbitkan dan di-approve sebelum pemeriksaan selesai, maka Pajak Masukan dapat diakui.",
    rubrikPoinPenting: [
      "Menyebutkan Pasal 13 ayat (5) UU PPN mengenai syarat formal Faktur Pajak Lengkap",
      "Menjelaskan konsep Faktur Pajak Cacat tidak dapat dikreditkan",
      "Menjelaskan solusi penerbitan Faktur Pajak Pengganti sesuai PER-03/PJ/2022",
      "Menjelaskan pembuktian kebenaran substansi material (substance over form)"
    ],
    pembahasan: "Faktur Pajak harus memenuhi syarat formal dan material. Jika terjadi kesalahan penulisan rincian transaksi, PKP penjual wajib menerbitkan Faktur Pajak Pengganti. Apabila pembeli dapat membuktikan pembayaran arus uang dan arus barang secara riil, pembeli berhak meminta penggantian faktur agar hak pengkreditannya tidak hilang.",
    landasanHukum: "Pasal 9 ayat (8) & Pasal 13 ayat (5) UU PPN jo. PER-03/PJ/2022",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 57,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Analisis Kepatuhan Pajak Influencer / Digital Content Creator",
    skenario: "Rani adalah seorang Beauty Influencer yang memiliki 2 juta pengikut di media sosial. Pada tahun 2023, Rani menerima penghasilan dari:\n1. Endorsement dan promosi produk kosmetik secara transfer bank Rp1.800.000.000,00.\n2. Barang-barang kosmetik gratis (endorse barter) senilai Rp300.000.000,00.\n3. Penghasilan monetisasi AdSense YouTube dari Google Asia Pacific (Singapura) Rp900.000.000,00.\nRani tidak memiliki pembukuan dan hanya mencatatkan penghasilan endorsement transfer bank saja di SPT Tahunannya.",
    pertanyaan: "Identifikasilah seluruh objek pajak dari penghasilan Rani! Bagaimana kewajiban penggunaan Norma Penghitungan (NPPN) vs Pembukuan, serta pemenuhan kewajiban PPN-nya?",
    jawabanKunci: "1. Objek Pajak: Seluruh penghasilan merupakan objek PPh Orang Pribadi, mencakup endorsement uang (Rp1.8 M), barang kosmetik gratis/barter (Rp300 jt - objek natura/imbalan Pasal 4 ayat 1 UU PPh), dan AdSense luar negeri (Rp900 jt - penghasilan dari luar negeri/world-wide income). Total bruto = Rp3.000.000.000,00.\n2. Pembukuan vs NPPN: Karena omzet Rp3 M (< Rp4.8 M), Rani berhak menggunakan NPPN dengan syarat menyampaikan pemberitahuan ke KPP paling lambat 31 Maret 2023. Jika tidak memberitahukan, wajib menyelenggarakan pencatatan/pembukuan.\n3. Kewajiban PPN: Belum wajib dikukuhkan sebagai PKP karena total omzet Rp3 M belum melebihi threshold PKP Rp4.8 Miliar.",
    rubrikPoinPenting: [
      "Mengidentifikasi 3 sumber objek PPh (uang tunai, barter natura, dan adsense luar negeri)",
      "Menerapkan prinsip World-Wide Income bagi Wajib Pajak Dalam Negeri",
      "Menjelaskan syarat penggunaan Norma Penghitungan Penghasilan Neto (NPPN)",
      "Menganalisis batas kewajiban pengukuhan Pengusaha Kena Pajak (PKP) Rp4.8 Miliar"
    ],
    pembahasan: "Sesuai UU PPh, setiap tambahan kemampuan ekonomis yang diterima Wajib Pajak baik dari dalam maupun luar negeri dalam bentuk uang maupun barang (natura) adalah objek PPh. Influencer wajib melaporkan seluruh nilai pasar barter barang endorse dan penghasilan platform digital.",
    landasanHukum: "Pasal 4 ayat (1) & Pasal 14 ayat (2) UU PPh serta PMK No. 197/2013",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 58,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Sengketa Daluwarsa Penetapan SKPKB atas Temuan Tindak Pidana",
    skenario: "Pada bulan Juli 2024, KPP Pratama menerbitkan SKPKB Tahun Pajak 2017 kepada PT Bintang Timur karena ditemukan tindak pidana perpajakan (tidak menyampaikan SPT dengan sengaja) yang telah diputus bersalah oleh Pengadilan Negeri dan berkekuatan hukum tetap (inkracht) pada Mei 2024. Wajib Pajak mengajukan gugatan/keberatan dengan dalil bahwa SKPKB tersebut cacat hukum karena diterbitkan melebihi jangka waktu daluwarsa penetapan 5 tahun (2017 berakhir di 2022).",
    pertanyaan: "Bagaimanakah analisis yuridis Anda terhadap bantahan Wajib Pajak tersebut? Apakah SKPKB tersebut sah menurut UU KUP?",
    jawabanKunci: "Bantahan Wajib Pajak TIDAK TEPAT, dan SKPKB tersebut SAH menurut hukum. Berdasarkan Pasal 13 ayat (5) UU KUP, daluwarsa penetapan 5 (lima) tahun DIKECUALIKAN apabila setelah jangka waktu 5 tahun tersebut Wajib Pajak dipidana karena melakukan tindak pidana di bidang perpajakan berdasarkan putusan pengadilan yang telah memperoleh kekuatan hukum tetap. Dalam kondisi ini, Direktur Jenderal Pajak tetap berwenang menerbitkan SKPKB ditambah sanksi bunga administrasi 48% dari jumlah pajak yang tidak/kurang dibayar.",
    rubrikPoinPenting: [
      "Menyebutkan Pasal 13 ayat (5) UU KUP sebagai klausul pengecualian daluwarsa 5 tahun",
      "Menjelaskan syarat inkracht putusan pengadilan pidana perpajakan",
      "Menjelaskan sanksi bunga administrasi khusus sebesar 48%",
      "Menyimpulkan bahwa SKPKB yang diterbitkan KPP sah secara hukum"
    ],
    pembahasan: "Pasal 13 ayat (5) UU KUP memberikan wewenang kepada fiskus untuk menagih kewajiban pajak masa lalu tanpa terikat batas daluwarsa 5 tahun jika telah terbukti terdapat putusan pidana perpajakan inkracht atas Wajib Pajak.",
    landasanHukum: "Pasal 13 ayat (5) UU No. 6/1983 jo. UU KUP",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 59,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Pemanfaatan Tax Treaty atas Pembayaran Bunga Pinjaman Luar Negeri",
    skenario: "PT Jaya Konstruksi (Indonesia) membayar bunga pinjaman sindikasi sebesar US$500,000 kepada Lender Bank di Belanda. Berdasarkan P3B Indonesia-Belanda, tarif pemotongan pajak bunga adalah 10% (dibandingkan tarif domestik PPh 26 sebesar 20%). Lender Bank melampirkan Certificate of Domicile (Form DGT) yang telah diisi lengkap dan ditandatangani otoritas pajak Belanda. Namun, dari penelusuran fakta transaksi, Lender Bank tersebut hanyalah Special Purpose Vehicle (SPV) / conduit company yang meneruskan 99% bunga tersebut ke entitas di Cayman Islands (tax haven).",
    pertanyaan: "Sebagai Account Representative / Pemeriksa, apakah Anda akan mengabulkan penerapan tarif Tax Treaty 10% tersebut? Jelaskan konsep Beneficial Owner dalam pencegahan penyalahgunaan P3B!",
    jawabanKunci: "Penerapan tarif preferensi Tax Treaty 10% HARUS DITOLAK, dan wajib dipotong PPh Pasal 26 sebesar 20%. Alasan yuridis: Berdasarkan PER-25/PJ/2018 jo. PMK pencegahan treaty shopping, salah satu syarat utama pemanfaatan P3B adalah pihak penerima penghasilan harus merupakan Pemilik Manfaat Sebenarnya (Beneficial Owner). SPV/conduit company yang bertindak sebagai agen/nominee dan tidak memiliki substansi ekonomi serta meneruskan penghasilan ke pihak ketiga di negara non-treaty TIDAK MEMENUHI syarat Beneficial Owner (Treaty Abuse).",
    rubrikPoinPenting: [
      "Menolak tarif P3B dan menerapkan tarif PPh 26 domestik 20%",
      "Menjelaskan konsep Beneficial Owner (Pemilik Manfaat Sebenarnya)",
      "Mengidentifikasi adanya indikasi Treaty Shopping / Conduit Company",
      "Merujuk pada PER-25/PJ/2018 tentang Penerapan Persetujuan Penghindaran Pajak Berganda"
    ],
    pembahasan: "Sesuai PER-25/PJ/2018, WPLN tidak dianggap sebagai Beneficial Owner jika bertindak sebagai Conduit Company yang tidak memiliki kendali penuh atas aset dan penghasilan serta wajib meneruskan penghasilan kepada pihak lain. Jika gagal uji BO, fasilitas P3B gugur.",
    landasanHukum: "Pasal 26 UU PPh jo. PER-25/PJ/2018",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 60,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Dilema Integritas saat Pemeriksaan Lapangan di Perusahaan Besar",
    skenario: "Anda ditugaskan sebagai Ketua Tim Pemeriksa Pajak pada PT Tambang Emas Sejahtera. Saat pemeriksaan lapangan di lokasi tambang luar pulau, pihak manajemen perusahaan menawarkan akomodasi hotel bintang lima termewah, tiket penerbangan bisnis kelas, serta memberikan amplop berisi uang saku harian dengan alasan 'kebiasaan perusahaan dalam menyambut tamu resmi'. Manajemen secara halus meminta agar pengujian sampling dokumen transaksi pembelian bahan bakar solar industri disederhanakan.",
    pertanyaan: "Bagaimana sikap dan tindakan konkret yang Anda ambil sebagai pegawai DJP yang menjunjung tinggi Nilai Integritas Kementerian Keuangan dan kode etik aparatur sipil negara?",
    jawabanKunci: "1. MENOLAK DENGAN TEGAS DAN SANTUN seluruh fasilitas mewah, akomodasi non-standar, tiket bisnis, dan amplop uang saku tersebut, serta menegaskan bahwa seluruh biaya perjalanan dinas pemeriksa telah dibiayai penuh oleh DIPA Negara (APBN).\n2. Melaporkan upaya pemberian tersebut melalui formulir Penolakan Gratifikasi ke Unit Kepatuhan Internal (UKI) KPP dan aplikasi SiDelik/KPK.\n3. Tetap melaksanakan pemeriksaan secara objektif, independen, dan profesional sesuai Surat Perintah Pemeriksaan (SP2), termasuk pengujian mendalam sampling transaksi solar industri tanpa kompromi.\n4. Menjaga marwah institusi DJP sesuai PMK 190/2018 dan Nilai Integritas Kemenkeu.",
    rubrikPoinPenting: [
      "Penolakan tegas dan santun atas segala bentuk gratifikasi/fasilitas pribadi",
      "Penegasan bahwa operasional pemeriksaan didanai penuh oleh DIPA Kemenkeu",
      "Kewajiban pelaporan penolakan gratifikasi ke UKI / KPK",
      "Komitmen menjaga independensi dan profesionalisme pengujian audit"
    ],
    pembahasan: "Integritas adalah nilai nomor satu di Kementerian Keuangan. Berdasarkan PMK 190/PMK.01/2018 dan Pedoman Pengendalian Gratifikasi Kemenkeu, pegawai dilarang menerima fasilitas apa pun dari wajib pajak dan wajib melaporkan setiap upaya pemberian kepada Unit Pengendalian Gratifikasi.",
    landasanHukum: "PMK No. 190/PMK.01/2018 & UU No. 20/2001 (Tipikor)",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 61,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Perlakuan Pajak atas Penjualan Saham di Bursa Efek vs Non-Bursa",
    skenario: "Tuan Bramantyo menjual 10.000 lembar saham PT Telkom Indonesia Tbk melalui Bursa Efek Indonesia (BEI) senilai Rp40.000.000,00. Pada bulan yang sama, Tuan Bramantyo juga menjual 25% saham kepemilikannya pada PT Maju Bersama (perusahaan tertutup / non-go public) kepada rekannya dengan harga jual Rp500.000.000,00 (keuntungan modal/capital gain Rp150.000.000,00).",
    pertanyaan: "Jelaskan perbedaan perlakuan PPh atas kedua transaksi penjualan saham tersebut, tarif yang dikenakan, serta pelaporannya dalam SPT Tahunan PPh Orang Pribadi!",
    jawabanKunci: "1. Penjualan Saham di BEI (PT Telkom Tbk): Dikenakan PPh Final Pasal 4 ayat (2) sebesar 0,1% dari jumlah bruto nilai transaksi penjualan (0.1% x Rp40.000.000 = Rp40.000), dipotong oleh perantara pedagang efek (broker). Dilaporkan pada lampiran penghasilan dikenakan PPh Final.\n2. Penjualan Saham Non-Bursa (PT Maju Bersama): Capital gain sebesar Rp150.000.000,00 merupakan OBJEK PPh Non-Final (Pasal 4 ayat 1 huruf d UU PPh). Keuntungan ini digabungkan dengan penghasilan neto lainnya pada SPT Tahunan dan dikenakan tarif progresif Pasal 17 ayat (1) huruf a UU PPh.",
    rubrikPoinPenting: [
      "Membedakan PPh Final 0.1% untuk saham bursa efek (PP 14/1997)",
      "Menganalisis capital gain saham non-bursa sebagai objek PPh tarif umum Pasal 17",
      "Menjelaskan mekanisme pemotongan oleh broker vs pelaporan mandiri di SPT Tahunan",
      "Memisahkan pelaporan pada kolom Final vs kolom Penghasilan Neto Lainnya di SPT"
    ],
    pembahasan: "Penjualan saham di bursa efek diatur secara khusus dengan PPh Final 0.1% dari nilai bruto transaksi berdasarkan PP 14/1997. Sebaliknya, penjualan saham perseroan tertutup tidak bersifat final, sehingga keuntungan bersih (harga jual - harga perolehan) dikenakan tarif umum PPh Orang Pribadi.",
    landasanHukum: "PP No. 14 Tahun 1997 jo. Pasal 4 ayat (1) huruf d UU PPh",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 62,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Penanganan Wajib Pajak yang Mengabaikan SP2DK dari Account Representative",
    skenario: "Account Representative (AR) Pengawasan menerbitkan Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK) kepada PT Sinar Abadi terkait adanya selisih peredaran usaha sebesar Rp5 Miliar antara SPT Tahunan PPh Badan dengan data Faktur Pajak Keluaran di e-Faktur. Wajib Pajak telah menerima SP2DK tersebut namun tidak memberikan tanggapan tertulis maupun menghadiri undangan pembahasan setelah lewat batas waktu 14 hari kalender.",
    pertanyaan: "Berdasarkan Surat Edaran Direktur Jenderal Pajak tentang Tata Cara Pengawasan (SE-05/PJ/2022), langkah tindak lanjut apa yang harus diambil oleh AR?",
    jawabanKunci: "Berdasarkan SE-05/PJ/2022:\n1. AR menyusun Laporan Hasil Permintaan Penjelasan atas Data dan/atau Keterangan (LHP2DK) dengan simpulan bahwa Wajib Pajak tidak menyampaikan penjelasan atau tidak memenuhi undangan pembahasan.\n2. Berdasarkan LHP2DK tersebut, AR merekomendasikan usulan PEMERIKSAAN KHUSUS (Pemeriksaan Lapangan/Kantor) kepada Kepala Kantor Pelayanan Pajak (KPP).\n3. Kepala KPP meneruskan usulan pemeriksaan ke Unit Pelaksana Pemeriksaan untuk diterbitkan Surat Perintah Pemeriksaan (SP2) guna menguji kepatuhan pemenuhan kewajiban perpajakan.",
    rubrikPoinPenting: [
      "Menjelaskan batas waktu respon SP2DK (14 hari kalender)",
      "Penyusunan LHP2DK oleh Account Representative",
      "Rekomendasi pengusulan Pemeriksaan Khusus (audit) kepada Kepala KPP",
      "Penerbitan Surat Perintah Pemeriksaan (SP2)"
    ],
    pembahasan: "SP2DK merupakan instrumen pengawasan persuasif. Jika Wajib Pajak tidak kooperatif dalam jangka waktu yang ditentukan, pengawasan ditingkatkan menjadi penegakan hukum melalui usulan pemeriksaan pajak.",
    landasanHukum: "Surat Edaran Direktur Jenderal Pajak Nomor SE-05/PJ/2022",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 63,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Pemanfaatan Kompensasi Kerugian Fiskal dalam SPT Tahunan PPh Badan",
    skenario: "PT Surya Pratama mencatatkan kerugian fiskal pada Tahun Pajak 2019 sebesar Rp1.200.000.000,00 berdasarkan SPT Tahunan (tidak ada pemeriksaan). Pada tahun-tahun berikutnya, laba/rugi fiskal perusahaan adalah:\n- Tahun 2020: Rugi Fiskal Rp300.000.000,00\n- Tahun 2021: Laba Fiskal Rp400.000.000,00\n- Tahun 2022: Laba Fiskal Rp500.000.000,00\n- Tahun 2023: Laba Fiskal Rp600.000.000,00",
    pertanyaan: "Hitunglah sisa kompensasi kerugian fiskal yang dapat dikompensasikan pada Tahun Pajak 2023 dan tentukan besarnya Penghasilan Kena Pajak (PKP) PT Surya Pratama untuk Tahun Pajak 2023!",
    jawabanKunci: "Alur Kompensasi Kerugian Fiskal (Maksimal 5 tahun berturut-turut sesuai Pasal 6 ayat 2 UU PPh):\n- Rugi 2019: Rp1.200.000.000\n- 2020: Rugi Rp300 jt (tidak ada kompensasi, saldo rugi 2019 tetap Rp1.2 M, saldo rugi 2020 Rp300 jt)\n- 2021: Laba Rp400 jt -> Dikompensasi dari rugi 2019 (sisa rugi 2019 = Rp800 jt). PKP 2021 = Nihil.\n- 2022: Laba Rp500 jt -> Dikompensasi dari rugi 2019 (sisa rugi 2019 = Rp300 jt). PKP 2022 = Nihil.\n- 2023: Laba Rp600 jt -> Dikompensasi dari sisa rugi 2019 (Rp300 jt) dan sisa rugi 2020 (Rp300 jt).\nTotal kompensasi di 2023 = Rp300 jt + Rp300 jt = Rp600 jt.\nPenghasilan Kena Pajak (PKP) Tahun 2023 = Rp600.000.000 - Rp600.000.000 = NIHIL (Rp0,00).",
    rubrikPoinPenting: [
      "Menjelaskan prinsip kompensasi kerugian fiskal maksimal 5 tahun (Pasal 6 ayat 2 UU PPh)",
      "Menerapkan metode first-in first-out (FIFO) untuk kompensasi kerugian tahun 2019 lalu 2020",
      "Menghitung saldo kompensasi secara kronologis dari 2020 s.d 2023",
      "Menghitung PKP akhir Tahun Pajak 2023 adalah NIHIL"
    ],
    pembahasan: "Kerugian fiskal dapat dikompensasikan dengan penghasilan neto mulai tahun pajak berikutnya berturut-turut sampai dengan 5 (lima) tahun. Kompensasi dilakukan secara berurutan dimulai dari tahun pajak yang paling awal.",
    landasanHukum: "Pasal 6 ayat (2) UU Pajak Penghasilan",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 64,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Perhitungan PBB Sektor Perkebunan dan Bea Meterai Digital",
    skenario: "PT Sawit Mas memiliki areal perkebunan kelapa sawit di Riau seluas 5.000 hektar yang terdiri dari Areal Emplasemen, Areal Belum Menghasilkan (TBM), dan Areal Menghasilkan (TM). Pada saat yang sama, perusahaan menandatangani 100 dokumen perjanjian kontrak pengadaan pupuk secara elektronik masing-masing senilai Rp250.000.000,00.",
    pertanyaan: "1. Jelaskan formula penentuan Nilai Jual Objek Pajak (NJOP) PBB Sektor Perkebunan (PBB-P3)!\n2. Bagaimana ketentuan pemeteraian atas dokumen perjanjian elektronik tersebut menurut UU No. 10 Tahun 2020 tentang Bea Meterai?",
    jawabanKunci: "1. NJOP PBB Sektor Perkebunan: Dihitung dari NJOP Bumi (Areal Produktif, Areal Belum Produktif, Areal Tidak Produktif, Areal Pengaman, dan Areal Emplasemen) ditambah NJOP Bangunan. Pada Areal Produktif, NJOP Bumi dihitung berdasarkan Standar Biaya Investasi Tanaman (SBIT) per hektar dikalikan luas areal.\n2. Bea Meterai Elektronik: Sesuai UU No. 10 Tahun 2020, dokumen perdata bernilai nominal lebih dari Rp5.000.000,00 yang dibuat dalam bentuk elektronik wajib terutang Bea Meterai dengan tarif tetap tunggal Rp10.000,00 per dokumen menggunakan Meterai Elektronik (e-Meterai resmi Peruri).",
    rubrikPoinPenting: [
      "Menjelaskan komponen NJOP Bumi PBB Perkebunan (Emplasemen, TBM, TM, SBIT)",
      "Menyebutkan UU No. 10 Tahun 2020 tentang Bea Meterai",
      "Menyebutkan batas nilai nominal dokumen terutang bea meterai (> Rp5.000.000)",
      "Menyebutkan tarif tunggal Rp10.000 dan penggunaan e-Meterai resmi"
    ],
    pembahasan: "PBB sektor Perkebunan, Perhutanan, Pertambangan, dan Sektor Lainnya (PBB-P3) tetap menjadi wewenang pemerintah pusat (DJP). Sedangkan Bea Meterai telah mengadopsi e-Meterai digital untuk dokumen elektronik.",
    landasanHukum: "UU No. 12/1985 jo. UU No. 12/1994 & UU No. 10 Tahun 2020",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 65,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Penerapan General Anti-Avoidance Rule (GAAR) dalam UU HPP",
    skenario: "Sebuah grup konglomerasi mendirikan serangkaian entitas cangkang (paper company) bertingkat di beberapa negara bebas pajak tanpa kegiatan bisnis riil, semata-mata untuk mengalirkan dividen dan menghindari pengenaan PPh Badan di Indonesia. Meskipun secara formal seluruh dokumen administrasi transaksi tampak sah, substansi ekonominya tidak memiliki tujuan bisnis (business purpose test failed) selain penghindaran pajak.",
    pertanyaan: "Jelaskan bagaimana instrumen General Anti-Avoidance Rule (GAAR) / Prinsip Substance Over Form dalam UU HPP memberikan kewenangan kepada DJP untuk mengatasi skema penghindaran pajak tersebut!",
    jawabanKunci: "Berdasarkan prinsip Substance Over Form (substansi mengungguli bentuk formal) yang diperkuat dalam Pasal 18 UU HPP jo. PP 55/2022 (ketentuan GAAR):\n1. DJP berwenang melakukan pengujian substansi ekonomi (economic substance test) atas skema transaksi Wajib Pajak.\n2. Jika terbukti suatu struktur atau transaksi dilakukan semata-mata untuk tujuan penghindaran pajak tanpa tujuan komersial yang wajar, DJP berwenang mengabaikan (disregard) atau merekarakterisasi transaksi tersebut ke bentuk aslinya.\n3. Pajak dihitung dan ditetapkan kembali berdasarkan substansi ekonomi sebenarnya.",
    rubrikPoinPenting: [
      "Menjelaskan prinsip Substance Over Form dalam perpajakan",
      "Menjelaskan konsep GAAR (General Anti-Avoidance Rule) pada PP 55/2022",
      "Kewenangan DJP merekarakterisasi transaksi yang tidak memiliki tujuan bisnis wajar",
      "Penetapan kembali pajak terutang berdasarkan substansi ekonomi riil"
    ],
    pembahasan: "GAAR memberikan payung hukum komprehensif bagi otoritas pajak untuk menindak skema penghindaran pajak agresif yang belum diatur secara spesifik oleh SAAR (Specific Anti-Avoidance Rules).",
    landasanHukum: "Pasal 18 UU PPh jo. PP No. 55 Tahun 2022",
    tingkatKesulitan: "HOTS / Sulit"
  },

  // 66-75: Additional Case Studies
  {
    nomor: 66,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Perlakuan PPh Pasal 23 atas Jasa Manajemen dan Reimbursable Expense",
    skenario: "PT Citra Konsultan menagihkan jasa konsultasi manajemen kepada PT Abadi Jaya sebesar Rp100.000.000,00. Dalam invoice yang sama terdapat tagihan penggantian biaya (reimbursement) tiket pesawat dan hotel yang ditalangi PT Citra Konsultan sebesar Rp25.000.000,00 yang dilampiri bukti faktur atas nama PT Abadi Jaya.",
    pertanyaan: "Berapakah Dasar Pengenaan Pajak (DPP) dan jumlah PPh Pasal 23 yang wajib dipotong oleh PT Abadi Jaya? Jelaskan syarat agar biaya reimbursement tidak digabung dalam DPP PPh 23!",
    jawabanKunci: "DPP PPh Pasal 23 = Rp100.000.000,00 (hanya atas imbalan jasa konsultasi manajemen).\nPPh Pasal 23 terutang = 2% x Rp100.000.000,00 = Rp2.000.000,00.\nSyarat biaya reimbursement Rp25.000.000,00 dikecualikan dari DPP: Bukti pengeluaran tiket/hotel dibuat langsung atas nama pengguna jasa (PT Abadi Jaya) dan dilampirkan bukti riil pembayaran tanpa adanya penambahan mark-up laba.",
    rubrikPoinPenting: [
      "Menentukan DPP PPh 23 hanya atas imbalan jasa murni (Rp100.000.000)",
      "Menghitung PPh 23 dengan tarif 2% = Rp2.000.000",
      "Menjelaskan syarat murni reimbursement (faktur atas nama pengguna jasa & tanpa mark-up)",
      "Merujuk PMK No. 141/PMK.03/2015 tentang Jenis Jasa Lain Objek PPh 23"
    ],
    pembahasan: "Sesuai PMK 141/PMK.03/2015, jumlah bruto tidak termasuk pembayaran penggantian biaya (reimbursement) sepanjang dapat dibuktikan dengan faktur/kuitansi yang dibuat atas nama penerima jasa.",
    landasanHukum: "PMK No. 141/PMK.03/2015",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 67,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Penerbitan Surat Tagihan Pajak (STP) atas Keterlambatan Pembayaran Pajak",
    skenario: "PT Makmur Sejahtera menyampaikan SPT Tahunan PPh Badan Tahun Pajak 2023 pada tanggal 30 April 2024 dengan status Kurang Bayar (PPh Pasal 29) sebesar Rp200.000.000,00. Namun pembayaran kekurangan pajak tersebut baru disetor ke kas negara pada tanggal 20 Mei 2024 (terlambat 20 hari dari batas akhir pembayaran 30 April). Suku bunga acuan KMK yang berlaku pada saat keterlambatan adalah 0,55% per bulan dengan uplift factor 5% (tarif bunga KMK sanksi = 0,97% per bulan).",
    pertanyaan: "Apakah KPP berwenang menerbitkan Surat Tagihan Pajak (STP)? Hitunglah besaran sanksi bunga administrasi yang tercantum dalam STP!",
    jawabanKunci: "KPP BERWENANG menerbitkan STP berdasarkan Pasal 14 ayat (1) huruf b UU KUP. Keterlambatan pembayaran PPh Pasal 29 dihitung 1 (satu) bulan penuh (bagian dari bulan dihitung satu bulan penuh). Sanksi bunga = 1 bulan x 0,97% x Rp200.000.000,00 = Rp1.940.000,00.",
    rubrikPoinPenting: [
      "Dasar penerbitan STP Pasal 14 ayat (1) huruf b UU KUP",
      "Aturan pembulatan waktu keterlambatan (bagian dari bulan dihitung 1 bulan)",
      "Penghitungan sanksi bunga administrasi berdasarkan tarif bunga KMK",
      "Jumlah akhir sanksi dalam STP Rp1.940.000,00"
    ],
    pembahasan: "Berdasarkan Pasal 9 ayat (2b) jo. Pasal 14 ayat (3) UU KUP, pembayaran pajak setelah jatuh tempo dikenai sanksi bunga per bulan terhitung sejak jatuh tempo sampai tanggal pembayaran.",
    landasanHukum: "Pasal 9 ayat (2b) & Pasal 14 UU KUP",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 68,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Audit Forensik Rekening Bank Berdasarkan Pasal 35A UU KUP",
    skenario: "Dalam proses pemeriksaan pajak terhadap PT Borneo Timber, tim pemeriksa menduga terdapat peredaran usaha tak dilaporkan senilai puluhan miliar rupiah. Direktur menolak memberikan rekening koran perusahaan. Tim Pemeriksa mengajukan permintaan data perbankan secara resmi.",
    pertanyaan: "Jelaskan dasar hukum dan mekanisme kewenangan Direktur Jenderal Pajak untuk membuka rahasia bank demi kepentingan perpajakan menurut UU KUP dan UU No. 9 Tahun 2017!",
    jawabanKunci: "Berdasarkan Pasal 35A UU KUP jo. UU No. 9 Tahun 2017 tentang Akses Informasi Keuangan untuk Kepentingan Perpajakan:\n1. Kerahasiaan bank ditiadakan (dibuka) untuk kepentingan pemeriksaan perpajakan.\n2. Lembaga jasa keuangan (bank) wajib menyampaikan laporan informasi keuangan secara otomatis dan berdasarkan permintaan (on-request) kepada DJP tanpa perlu izin khusus dari OJK/Gubernur BI.\n3. Pejabat bank yang menolak memberikan data diancam sanksi pidana kurungan dan denda sesuai Pasal 41A UU KUP.",
    rubrikPoinPenting: [
      "Menjelaskan Pasal 35A UU KUP dan UU No. 9 Tahun 2017",
      "Kewajiban perbankan membuka data tanpa pembatasan rahasia bank",
      "Mekanisme automatic exchange & request for information",
      "Sanksi pidana bagi pihak ketiga yang menolak memberikan data"
    ],
    pembahasan: "Akses data keuangan tanpa batas rahasia bank adalah instrumen utama DJP untuk menembus praktik underground economy dan tax evasion.",
    landasanHukum: "Pasal 35A UU KUP & UU No. 9 Tahun 2017",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 69,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Penetapan Status Wajib Pajak Non-Efektif (NE) dan Pengaktifan Kembali",
    skenario: "Bapak Budi pensiun dari PNS pada tahun 2022 dan saat ini tidak lagi memiliki penghasilan sama sekali selain uang pensiun bulanan yang telah dipotong PPh 21 Final/Nihil di bawah PTKP. Beliau tidak ingin lagi repot mengisi SPT Tahunan setiap tahun.",
    pertanyaan: "Upaya administratif apa yang dapat ditempuh Bapak Budi di KPP? Bagaimana syarat penetapannya dan apa yang terjadi jika di kemudian hari beliau membuka usaha baru?",
    jawabanKunci: "1. Bapak Budi dapat mengajukan permohonan penetapan status Wajib Pajak Non-Efektif (WP NE) ke KPP terdaftar atau secara online melalui Portal DJP.\n2. Syarat penetapan WP NE terpenuhi karena beliau orang pribadi yang tidak melakukan kegiatan usaha/pekerjaan bebas dan penghasilannya di bawah PTKP (PER-04/PJ/2020).\n3. Dampak status NE: Bebas dari kewajiban lapor SPT Tahunan dan tidak akan diterbitkan STP denda pelaporan.\n4. Jika di kemudian hari membuka usaha baru, status NE dapat diaktifkan kembali secara otomatis atau permohonan mandiri.",
    rubrikPoinPenting: [
      "Permohonan Wajib Pajak Non-Efektif (WP NE)",
      "Syarat orang pribadi tidak menjalankan usaha & penghasilan di bawah PTKP",
      "Pembebasan kewajiban lapor SPT dan penghapusan sanksi denda administrasi",
      "Mekanisme re-aktivasi status NPWP jika kembali memperoleh penghasilan"
    ],
    pembahasan: "Status NE memberikan kepastian hukum bagi WP yang tidak lagi memenuhi kriteria subjektif/objektif tanpa harus menghapus NPWP secara permanen.",
    landasanHukum: "PER-04/PJ/2020 tentang Petunjuk Teknis Pelaksanaan Administrasi NPWP",
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 70,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Pengkreditan Pajak Penghasilan Luar Negeri (PPh Pasal 24)",
    skenario: "PT Nusantara Prima memperoleh penghasilan neto dalam negeri Rp4.000.000.000,00 dan penghasilan neto dari cabang di Malaysia Rp1.000.000.000,00 (telah dipotong pajak di Malaysia sebesar 25% = Rp250.000.000,00). Total Penghasilan Kena Pajak gabungan adalah Rp5.000.000.000,00. Tarif PPh Badan Indonesia 22% (Total PPh terutang = Rp1.100.000.000,00).",
    pertanyaan: "Hitunglah batas maksimum kredit pajak luar negeri (PPh Pasal 24) yang diperkenankan dikreditkan di Indonesia dan tentukan sisa PPh yang masih harus dibayar di dalam negeri!",
    jawabanKunci: "1. Batas Maksimum Kredit Pajak LN (Ordinary Credit Method):\n= (Penghasilan LN / Total Penghasilan Kena Pajak) x Total PPh Terutang\n= (Rp1.000.000.000 / Rp5.000.000.000) x Rp1.100.000.000\n= 20% x Rp1.100.000.000 = Rp220.000.000,00.\n\n2. Pajak yang dibayar di Malaysia = Rp250.000.000,00.\n3. Kredit Pajak yang diakui = Dipilih nilai terendah antara pajak riil dibayar (Rp250 jt) vs batas maksimum (Rp220 jt) -> Diakui sebesar Rp220.000.000,00.\n4. Sisa PPh Badan terutang di Indonesia = Rp1.100.000.000 - Rp220.000.000 = Rp880.000.000,00.",
    rubrikPoinPenting: [
      "Formula Batas Maksimum PPh Pasal 24 (Ordinary Credit)",
      "Menghitung batas maksimum kredit pajak = Rp220.000.000",
      "Membandingkan nilai terendah antara pajak dibayar vs batas maksimum",
      "Menghitung sisa PPh terutang di Indonesia = Rp880.000.000"
    ],
    pembahasan: "Indonesia menganut metode ordinary credit per-country limitation. Pajak luar negeri yang dapat dikreditkan setinggi-tingginya sebesar pajak yang terutang di Indonesia atas penghasilan tersebut.",
    landasanHukum: "Pasal 24 UU PPh jo. PMK No. 192/PMK.03/2018",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 71,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Restitusi Pajak Pertambahan Nilai PKP Berisiko Rendah (Pasal 17C / 17D UU KUP)",
    skenario: "PT Export Prima Tbk (Pengusaha Kena Pajak Berisiko Rendah) mengajukan permohonan pengembalian pendahuluan kelebihan pembayaran PPN (Restitusi) sebesar Rp3.000.000.000,00 pada SPT Masa PPN.",
    pertanyaan: "Bagaimanakah prosedur penerbitan Surat Keputusan Pengembalian Pendahuluan Kelebihan Pajak (SKPPKP) bagi PKP Berisiko Rendah menurut UU KUP jo. UU HPP dan apa konsekuensinya jika kelak dilakukan pemeriksaan?",
    jawabanKunci: "1. KPP wajib menerbitkan SKPPKP paling lama 1 (satu) bulan sejak permohonan diterima lengkap melalui penelitian administrasi tanpa pemeriksaan lapangan terlebih dahulu (Pasal 17C/17D UU KUP).\n2. DJP tetap berwenang melakukan pemeriksaan pajak di kemudian hari dalam jangka waktu 5 tahun.\n3. Apabila dari hasil pemeriksaan diterbitkan SKPKB, Wajib Pajak wajib membayar kekurangan pajak ditambah sanksi bunga per bulan sesuai ketentuan UU HPP.",
    rubrikPoinPenting: [
      "Jangka waktu penerbitan SKPPKP maksimal 1 bulan",
      "Pemberian restitusi melalui penelitian tanpa pemeriksaan awal",
      "Kewenangan DJP melakukan post-audit (pemeriksaan setelahnya)",
      "Konsekuensi sanksi bunga jika ditemukan kurang bayar dalam SKPKB"
    ],
    pembahasan: "Fasilitas pengembalian pendahuluan (golden tax payer) bertujuan menjaga likuiditas eksportir dan wajib pajak patuh.",
    landasanHukum: "Pasal 17C & 17D UU KUP jo. PMK No. 209/PMK.03/2021",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 72,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Perlakuan Pajak Transaksi Kripto dan Fintech P2P Lending (PMK 68 & 69 / 2022)",
    skenario: "PT Digital Exchange memfasilitasi transaksi perdagangan aset kripto dan PT Fintech Dana memfasilitasi pinjaman peer-to-peer (P2P) lending antara lender dan borrower.",
    pertanyaan: "Jelaskan kewajiban pemungutan PPh dan PPN atas transaksi aset kripto dan bunga pinjaman P2P lending berdasarkan PMK 68/2022 dan PMK 69/2022!",
    jawabanKunci: "1. Aset Kripto (PMK 68/2022): Penyelenggara PMSE (Exchanger) memungut PPh 22 Final sebesar 0,1% (jika terdaftar di Bappebti) atau 0,2% (jika tidak terdaftar) dari nilai transaksi, serta memungut PPN Final sebesar 0,11% (terdaftar) atau 0,22% (tidak terdaftar).\n2. Fintech P2P Lending (PMK 69/2022): Platform fintech memotong PPh 23 sebesar 15% (bagi lender WPDN) atau PPh 26 sebesar 20%/P3B (bagi lender WPLN) atas bunga yang diterima lender. Jasa penyediaan platform dikenai PPN 11%.",
    rubrikPoinPenting: [
      "Tarif PPh 22 dan PPN atas aset kripto (0.1% PPh & 0.11% PPN)",
      "Kewajiban exchanger terdaftar Bappebti vs tidak terdaftar",
      "Pemotongan PPh 23/26 atas penghasilan bunga lender P2P lending",
      "Pengenaan PPN atas jasa administrasi platform fintech"
    ],
    pembahasan: "PMK 68/2022 dan PMK 69/2022 merupakan regulasi turunan UU HPP yang memberikan kepastian hukum pemajakan atas ekonomi digital.",
    landasanHukum: "PMK No. 68/PMK.03/2022 & PMK No. 69/PMK.03/2022",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 73,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Pengalihan Hak atas Tanah dan Bangunan pada Real Estate Developer",
    skenario: "PT Griya Asri (developer properti) menjual 1 unit rumah tapak tipe 70 kepada pembeli perorangan dengan harga jual Rp1.200.000.000,00 secara tunai bertahap.",
    pertanyaan: "Sebutkan seluruh jenis pajak yang terutang dari transaksi penjualan rumah tersebut, pihak yang wajib memungut/menyetor, serta besaran tarif masing-masing pajak!",
    jawabanKunci: "1. PPh Final Pasal 4 ayat (2) Pengalihan Hak atas Tanah/Bangunan: Tarif 2,5% x Rp1.200.000.000 = Rp30.000.000,00 (disetor oleh penjual / PT Griya Asri sebelum akta AJB ditandatangani).\n2. PPN: Tarif 11% x Rp1.200.000.000 = Rp132.000.000,00 (dipungut oleh PT Griya Asri selaku PKP dan diterbitkan Faktur Pajak).\n3. BPHTB (Bea Perolehan Hak atas Tanah dan Bangunan): Pajak Daerah terutang oleh Pembeli sebesar 5% x (Nilai Perolehan - NPOPTKP Daerah).",
    rubrikPoinPenting: [
      "PPh Final Pengalihan Tanah/Bangunan 2.5% oleh penjual (PP 34/2016)",
      "PPN 11% dipungut oleh penjual (developer PKP)",
      "BPHTB 5% dibayar oleh pembeli ke kas daerah",
      "Kewajiban validasi SSP PPh di KPP sebelum penandatanganan AJB oleh PPAT"
    ],
    pembahasan: "Transaksi properti melibatkan irisan pajak pusat (PPh Final 2.5% dan PPN 11%) serta pajak daerah (BPHTB 5%). Validasi SSP PPh Pasal 4 ayat (2) wajib dilakukan melalui aplikasi e-PHTB DJP.",
    landasanHukum: "PP No. 34 Tahun 2016 & UU PPN jo. UU HKPD No. 1/2022",
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 74,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Sengketa Penentuan Status Subjek Pajak Luar Negeri (SPLN) Tenaga Ahli Asing",
    skenario: "Mr. John, warga negara Australia, dikontrak oleh PT Indo Mining untuk memberikan supervisi teknis di Kalimantan dari Januari hingga Mei 2024 (total 140 hari berturut-turut di Indonesia), lalu kembali ke Australia. Berdasarkan Tax Treaty Indonesia-Australia, time-test untuk permanent establishment / jasa adalah 120 hari. Mr. John tidak memiliki niat bertempat tinggal tetap di Indonesia.",
    pertanyaan: "Tentukan status subjek pajak Mr. John (SPDN atau SPLN) dan bagaimana pemotongan pajak atas penghasilannya menurut ketentuan UU PPh dan Tax Treaty!",
    jawabanKunci: "1. Menurut UU Domestik (Pasal 2 UU PPh jo. UU HPP): Mr. John berada di Indonesia tidak lebih dari 183 hari dalam 12 bulan, sehingga berstatus Subjek Pajak Luar Negeri (SPLN).\n2. Menurut Tax Treaty Indonesia-Australia: Karena time-test pemberian jasa melebihi 120 hari, kehadiran Mr. John membentuk Bentuk Usaha Tetap (BUT) / Service PE di Indonesia.\n3. Pemajakan: Indonesia memiliki hak pemajakan. Penghasilan Mr. John dikenai pajak di Indonesia melalui BUT atau dipotong PPh Pasal 26 / Pasal 17 sesuai alokasi laba BUT.",
    rubrikPoinPenting: [
      "Uji Time-Test 183 hari UU Domestik vs Time-Test 120 hari Tax Treaty",
      "Penetapan status SPLN dan pembentukan Service PE (Bentuk Usaha Tetap)",
      "Hak pemajakan negara sumber (Indonesia)",
      "Mekanisme pemotongan PPh Pasal 26 / pemajakan BUT"
    ],
    pembahasan: "Berdasarkan prinsip P3B, jika time test jasa terlampaui, negara sumber berhak memajaki laba usaha yang diatribusikan ke BUT tersebut.",
    landasanHukum: "Pasal 2 & Pasal 5 UU PPh serta P3B Indonesia-Australia",
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 75,
    kategori: "Studi Kasus Pemeriksaan & Sengketa",
    judulKasus: "Analisis Penyusutan Fiskal Aset Bangunan Permanen dan Mesin Kelompok 2",
    skenario: "PT Manufaktur Jaya pada awal Januari 2023 membeli:\n1. Bangunan pabrik permanen senilai Rp10.000.000.000,00 (masa manfaat fiskal 20 tahun).\n2. Mesin pabrik (Kelompok 2, masa manfaat 8 tahun) senilai Rp4.000.000.000,00. Perusahaan memilih menggunakan metode Saldo Menurun (Declining Balance Method) untuk aset non-bangunan.",
    pertanyaan: "Hitunglah biaya penyusutan fiskal tahun 2023 untuk bangunan pabrik dan mesin tersebut berdasarkan Pasal 11 UU PPh!",
    jawabanKunci: "1. Bangunan Pabrik Permanen (Wajib Metode Garis Lurus, Tarif 5%):\nBiaya Penyusutan 2023 = 5% x Rp10.000.000.000,00 = Rp500.000.000,00.\n\n2. Mesin Pabrik Kelompok 2 (Metode Saldo Menurun, Tarif 25%):\nBiaya Penyusutan 2023 = 25% x Rp4.000.000.000,00 = Rp1.000.000.000,00.\n\nTotal Biaya Penyusutan Fiskal Tahun 2023 = Rp500.000.000 + Rp1.000.000.000 = Rp1.500.000.000,00.",
    rubrikPoinPenting: [
      "Menentukan metode penyusutan bangunan permanen wajib garis lurus (5% per tahun)",
      "Menghitung penyusutan bangunan = Rp500.000.000",
      "Menentukan tarif saldo menurun Kelompok 2 (25% per tahun)",
      "Menghitung penyusutan mesin = Rp1.000.000.000 dan total Rp1.500.000.000"
    ],
    pembahasan: "Pasal 11 UU PPh mengatur bahwa penyusutan bangunan hanya boleh menggunakan metode garis lurus, sedangkan harta berwujud bukan bangunan dapat memilih metode garis lurus atau metode saldo menurun.",
    landasanHukum: "Pasal 11 UU Pajak Penghasilan jo. PMK No. 72 Tahun 2023",
    tingkatKesulitan: "Mudah"
  }
];

esaiData.forEach(item => {
  soalList.push({
    id: `djp-soal-${item.nomor}`,
    nomor: item.nomor,
    tipe: 'esai_kasus',
    kategori: item.kategori,
    judulKasus: item.judulKasus,
    skenario: item.skenario,
    pertanyaan: item.pertanyaan,
    jawabanKunci: item.jawabanKunci,
    rubrikPoinPenting: item.rubrikPoinPenting,
    pembahasan: item.pembahasan,
    landasanHukum: item.landasanHukum,
    tingkatKesulitan: item.tingkatKesulitan
  });
});

console.log('25 Essay questions built.');

// =========================================================================
// 3. 25 SOAL SIMULASI WAWANCARA DJP & KEMENKEU (Nomor 76 - 100)
// =========================================================================

const wawancaraData = [
  // 76-82: Integritas & Dilema Etika Nyata
  {
    nomor: 76,
    kategori: "Wawancara Situasional & Dilema Etika",
    topik: "Penolakan Gratifikasi & Tekanan Wajib Pajak di Lapangan",
    skenarioPenguji: "Penguji ingin menguji keteguhan integritas Anda saat berada dalam situasi nyata di mana tidak ada orang lain yang melihat dan terdapat godaan materi dari Wajib Pajak besar.",
    pertanyaan: "Ceritakan bagaimana sikap konkret Anda jika saat melakukan verifikasi lapangan atau kunjungan kerja ke kantor Wajib Pajak, Anda disodori amplop berisi uang atau voucher belanja bernilai jutaan rupiah sebagai 'uang lelah / tanda terima kasih' dan pihak WP mengatakan 'semua orang juga biasa menerimanya'?",
    aspekPenilaian: {
      integritas: "Kemampuan menolak godaan materi secara tegas, tanpa kompromi, dan mematuhi aturan anti-gratifikasi Kemenkeu.",
      starMetode: "Menjelaskan Situation (tekanan di lapangan), Task (tanggung jawab integritas), Action (penolakan santun & pelaporan ke UKI), Result (nama baik institusi terjaga).",
      nilaiKemenkeu: "Mencerminkan Nilai Integritas dan Profesionalisme tingkat tertinggi."
    },
    poinKunciJawabanIdeal: [
      "Menolak secara tegas, sopan, dan percaya diri tanpa merasa ragu atau takut menyinggung WP.",
      "Menyampaikan edukasi dengan lugas bahwa aparatur DJP digaji penuh oleh negara dan dilarang keras menerima pemberian apa pun.",
      "Tidak terpengaruh oleh manipulasi psikologis 'semua orang biasa menerima'.",
      "Segera mendokumentasikan dan melaporkan peristiwa penolakan tersebut ke Unit Kepatuhan Internal (UKI) dan UPG (Unit Pengendalian Gratifikasi)."
    ],
    contohJawabanIdeal: "Terima kasih atas pertanyaannya Bapak/Ibu Penguji. Sikap saya sangat tegas dan mutlak: SAYA AKAN MENOLAKNYA seketika secara sopan dan lugas. Saya akan menjelaskan kepada Wajib Pajak: 'Mohon maaf Bapak/Ibu, tugas kami melayani dan memeriksa dibiayai penuh oleh negara melalui APBN. Menerima uang atau barang dalam bentuk apa pun adalah pelanggaran berat kode etik Kementerian Keuangan dan hukum tindak pidana korupsi.' Saya tidak akan pernah terpengaruh dengan dalih 'kebiasaan'. Setelah itu, saya akan mencatat insiden tersebut dan melaporkannya ke Unit Kepatuhan Internal (UKI) melalui aplikasi pelaporan gratifikasi resmi untuk melindungi integritas pribadi dan marwah institusi DJP.",
    indikatorBahaya: [
      "Ragu-ragu atau mencoba mencari pembenaran untuk menerima (misal: 'diterima lalu disumbangkan ke panti asuhan').",
      "Takut menolak karena khawatir merusak hubungan dengan WP.",
      "Tidak mengetahui adanya mekanisme pelaporan ke UKI/UPG."
    ],
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 77,
    kategori: "Wawancara Situasional & Dilema Etika",
    topik: "Perintah Atasan yang Bertentangan dengan Regulasi Perpajakan",
    skenarioPenguji: "Penguji ingin menguji keberanian moral dan kepatuhan hukum Anda saat menghadapi benturan kepentingan vertikal dengan atasan langsung.",
    pertanyaan: "Bagaimana tindakan Anda jika atasan langsung Anda meminta Anda untuk mengubah hasil analisis kepatuhan atau menghapus temuan potensi pajak pada Wajib Pajak tertentu tanpa dasar hukum yang jelas?",
    aspekPenilaian: {
      integritas: "Keberanian menjunjung tinggi kebenaran hukum di atas kepatuhan buta kepada atasan.",
      starMetode: "Langkah terstruktur: klarifikasi profesional, penyampaian dasar hukum, eskalasi berjenjang (Whistleblowing System / Wise Kemenkeu).",
      nilaiKemenkeu: "Integritas, Akuntabilitas, dan Profesionalisme."
    },
    poinKunciJawabanIdeal: [
      "Mengedepankan komunikasi profesional: meminta klarifikasi tertulis dan memaparkan dasar hukum serta bukti kertas kerja pemeriksaan.",
      "Menolak secara santun untuk memanipulasi data atau melanggar aturan perundang-undangan.",
      "Jika ada pemaksaan, mengeskalasikan persoalan ke atasan yang lebih tinggi atau saluran resmi Whistleblowing System (Wise Kemenkeu).",
      "Memastikan seluruh kertas kerja dan jejak audit tersimpan aman dan akuntabel."
    ],
    contohJawabanIdeal: "Pertama, saya akan melakukan komunikasi dua arah secara profesional dengan atasan saya. Saya akan memaparkan kertas kerja dan landasan hukum yang mendasari temuan tersebut, serta meminta arahan tertulis jika terdapat pandangan hukum yang berbeda. Namun, jika instruksi tersebut jelas-jelas meminta manipulasi data yang melanggar undang-undang, saya AKAN MENOLAK dengan santun berdasarkan regulasi perpajakan yang berlaku. Jika atasan tetap memaksa atau mengintimidasi, saya akan mendokumentasikan bukti-bukti secara objektif dan melaporkannya melalui saluran resmi pengaduan internal Kementerian Keuangan, yaitu Whistleblowing System (Wise Kemenkeu). Integritas hukum dan perlindungan penerimaan negara harus selalu di atas kepentingan individu.",
    indikatorBahaya: [
      "Langsung menuruti perintah salah hanya karena takut pada atasan atau penilaian SKP.",
      "Menyebarkan isu ke media sosial tanpa melalui saluran resmi organisasi.",
      "Pasif dan membiarkan kecurangan terjadi."
    ],
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 78,
    kategori: "Wawancara Situasional & Dilema Etika",
    topik: "Kerahasiaan Data Wajib Pajak dan Tekanan Pihak Ketiga / Keluarga",
    skenarioPenguji: "Penguji menguji komitmen Anda terhadap Pasal 34 UU KUP mengenai kerahasiaan jabatan data wajib pajak dari intervensi pihak luar atau keluarga.",
    pertanyaan: "Jika seorang kerabat dekat, tokoh berpengaruh, atau rekan sesama pegawai meminta Anda untuk mengecek data SPT, kekayaan, atau status pemeriksaan seorang pejabat/selebriti tanpa wewenang kedinasan resmi, apa yang Anda lakukan?",
    aspekPenilaian: {
      integritas: "Kepatuhan mutlak terhadap kerahasiaan data jabatan (Pasal 34 UU KUP & PP 94/2021).",
      starMetode: "Menjaga batas kewenangan akses sistem perpajakan (access log audit).",
      nilaiKemenkeu: "Profesionalisme dan Integritas."
    },
    poinKunciJawabanIdeal: [
      "Menolak permintaan tersebut dengan tegas dan memberikan penjelasan edukatif mengenai kerahasiaan data perpajakan.",
      "Menjelaskan konsekuensi pidana dan sanksi pemecatan dalam Pasal 34 UU KUP bagi pembocor data.",
      "Menyadari bahwa setiap akses data di sistem DJP (Coretax/SIDJP) terekam secara digital dalam audit log.",
      "Tidak menyalahgunakan user ID kedinasan untuk kepentingan pribadi atau pihak mana pun."
    ],
    contohJawabanIdeal: "Saya akan MENOLAK permintaan tersebut secara tegas dan memberikan pemahaman bahwa data Wajib Pajak dilindungi oleh undang-undang. Berdasarkan Pasal 34 UU KUP, setiap petugas pajak dilarang memberitahukan data perpajakan kepada pihak yang tidak berhak, dengan ancaman pidana dan sanksi disiplin berat. Selain itu, seluruh aktivitas di sistem informasi DJP diawasi oleh audit log digital. Sebagai aparatur DJP, menjaga kerahasiaan Wajib Pajak adalah pilar utama kepercayaan publik terhadap sistem perpajakan nasional.",
    indikatorBahaya: [
      "Bersedia membantu mengecek data karena merasa 'hanya melihat sebentar dan tidak merugikan siapa-siapa'.",
      "Kompromi atas dasar hubungan kekeluargaan atau pertemanan."
    ],
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 79,
    kategori: "Wawancara Situasional & Dilema Etika",
    topik: "Melihat Rekan Kerja Melakukan Pelanggaran Disiplin / Korupsi",
    skenarioPenguji: "Penguji ingin melihat apakah Anda berani bertindak aktif menjaga kebersihan lingkungan kerja atau memilih bersikap apatis demi 'solidaritas semu'.",
    pertanyaan: "Apa yang Anda lakukan jika mengetahui rekan satu tim Anda secara diam-diam menerima imbalan dari Wajib Pajak atau membocorkan jadwal pemeriksaan lapangan?",
    aspekPenilaian: {
      integritas: "Keberanian menegakkan etika dan tidak mentolerir *moral hazard* di lingkungan kerja.",
      starMetode: "Mengedepankan langkah korektif: mengingatkan dan melaporkan ke instrumen pengawasan resmi.",
      nilaiKemenkeu: "Sinergi yang berlandaskan Integritas."
    },
    poinKunciJawabanIdeal: [
      "Tidak membiarkan atau menutup-nutupi perbuatan tersebut atas nama pertemanan.",
      "Mengingatkan rekan kerja bahwa tindakannya merusak institusi dan melanggar hukum pidana.",
      "Melaporkan temuan tersebut kepada atasan langsung dan Unit Kepatuhan Internal (UKI) disertai fakta/bukti pendukung.",
      "Memahami bahwa melindungi pelanggaran rekan kerja adalah bentuk keterlibatan pasif yang merugikan negara."
    ],
    contohJawabanIdeal: "Saya tidak akan mendiamkannya, karena solidaritas sejati di Kemenkeu adalah saling menjaga integritas, bukan melindungi kejahatan. Langkah pertama, jika memungkinkan saya akan menegur dan mengingatkannya bahwa tindakan tersebut adalah pelanggaran hukum berat. Langkah kedua, saya berkewajiban melaporkan bukti atau indikasi tersebut kepada Unit Kepatuhan Internal (UKI) atau kanal Wise Kemenkeu. Membiarkan kejahatan terjadi sama saja merusak marwah ribuan pegawai DJP lainnya yang telah bekerja jujur demi penerimaan negara.",
    indikatorBahaya: [
      "Memilih diam dengan alasan 'tidak mau ikut campur urusan orang lain'.",
      "Takut dimusuhi rekan kerja sehingga mengorbankan integritas organisasi."
    ],
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 80,
    kategori: "Wawancara Situasional & Dilema Etika",
    topik: "Menghadapi Tawaran Pekerjaan / Fasilitas Menggiurkan dari Konsultan Pajak",
    skenarioPenguji: "Penguji menguji loyalitas dan ketahanan moral Anda terhadap janji masa depan atau tawaran penghasilan di luar dinas.",
    pertanyaan: "Bagaimana Anda menyikapi jika seorang konsultan pajak atau pengusaha menawarkan posisi bergaji tinggi di perusahaannya atau fasilitas istimewa asalkan Anda membantunya memenangkan sengketa pajak saat ini?",
    aspekPenilaian: {
      integritas: "Loyalitas kepada negara dan penolakan terhadap 'revolving door' / konflik kepentingan.",
      starMetode: "Penegasan sumpah jabatan dan fokus pengabdian.",
      nilaiKemenkeu: "Integritas dan Kesempurnaan."
    },
    poinKunciJawabanIdeal: [
      "Menolak tawaran tersebut dengan tegas karena merupakan bentuk suap/janji terlarang (UU Tipikor).",
      "Menegaskan komitmen pengabdian sebagai abdi negara yang terikat sumpah jabatan.",
      "Menjaga independensi proses penanganan sengketa sesuai data objektif.",
      "Melaporkan upaya penyuapan tersebut ke aparat pengawasan internal."
    ],
    contohJawabanIdeal: "Saya akan menolak tawaran tersebut secara mutlak. Tawaran fasilitas atau jabatan di masa depan untuk mempengaruhi keputusan saat ini adalah bentuk suap (janji) yang dilarang undang-undang. Motivasi saya bergabung di DJP adalah untuk mengabdi kepada negara dan mengamankan fondasi keuangan APBN, bukan menjadikan jabatan publik sebagai batu loncatan transaksi pribadi. Proses penyelesaian sengketa akan tetap saya jalankan secara profesional dan objektif sesuai bukti hukum.",
    indikatorBahaya: [
      "Tergiur atau mempertimbangkan tawaran tersebut.",
      "Menganggap tawaran pekerjaan di masa depan adalah hal yang lumrah."
    ],
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 81,
    kategori: "Wawancara Situasional & Dilema Etika",
    topik: "Mengelola Beban Kerja Tinggi & Target Penerimaan Negara di Bawah Tekanan",
    skenarioPenguji: "Penguji ingin mengetahui ketahanan mental, resiliensi, dan strategi manajemen stres Anda menghadapi target APBN yang sangat ketat.",
    pertanyaan: "Target penerimaan pajak setiap tahun sangat tinggi dan pengawasan Wajib Pajak memiliki tenggat waktu ketat. Ceritakan pengalaman Anda saat menghadapi beban kerja luar biasa dan bagaimana Anda tetap menjaga akurasi serta integritas?",
    aspekPenilaian: {
      integritas: "Ketahanan kerja, manajemen waktu, dan pantang menyerah.",
      starMetode: "Struktur STAR nyata: Situation (deadline ketat), Task (tugas kompleks), Action (prioritisasi, koordinasi tim, mitigasi stres), Result (target tercapai tanpa kesalahan).",
      nilaiKemenkeu: "Profesionalisme dan Kesempurnaan."
    },
    poinKunciJawabanIdeal: [
      "Menceritakan contoh riil menggunakan metode STAR dari pengalaman kerja atau organisasi.",
      "Menerapkan skala prioritas berbasis risiko (Eisenhower Matrix / Manajemen Risiko).",
      "Menjaga komunikasi dan kolaborasi aktif dengan tim (Sinergi).",
      "Menjaga kesehatan fisik dan mental tanpa mengorbankan kualitas kertas kerja atau melanggar aturan."
    ],
    contohJawabanIdeal: "Ketika saya memimpin proyek analisis data dengan tenggat waktu mendesak (Situation), saya bertanggung jawab menyajikan laporan akurat dalam 1 minggu (Task). Langkah yang saya lakukan adalah membagi beban kerja menggunakan skala prioritas berbasis risiko, menyusun checklist kontrol kualitas harian, dan melakukan *daily brief* singkat dengan tim untuk memecahkan kendala (Action). Hasilnya, seluruh laporan selesai tepat waktu dengan tingkat kesalahan 0% dan diapresiasi oleh pimpinan (Result). Di DJP, saya akan menerapkan etos kerja yang sama: bekerja sistematis, terukur, memanfaatkan teknologi data analitik, dan menjaga sinergi tim.",
    indikatorBahaya: [
      "Mengeluh soal beban kerja atau menyalahkan lingkungan.",
      "Memilih jalan pintas mengabaikan prosedur audit demi mengejar target angka."
    ],
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 82,
    kategori: "Wawancara Situasional & Dilema Etika",
    topik: "Menangani Konflik Kepentingan Bisnis Pribadi / Keluarga",
    skenarioPenguji: "Penguji menguji pemahaman Anda mengenai PMK Pencegahan Benturan Kepentingan.",
    pertanyaan: "Bagaimana jika dalam penugasan kerja, Anda ditugaskan mengawasi atau memeriksa perusahaan yang ternyata milik keluarga atau rekan bisnis pasangan Anda?",
    aspekPenilaian: {
      integritas: "Kepatuhan terhadap deklarasi benturan kepentingan (Conflict of Interest Declaration).",
      starMetode: "Langkah deklarasi formal dan permohonan pengalihan penugasan.",
      nilaiKemenkeu: "Integritas dan Akuntabilitas."
    },
    poinKunciJawabanIdeal: [
      "Segera melakukan deklarasi benturan kepentingan secara tertulis kepada pimpinan.",
      "Meminta secara resmi untuk dialihkan dari penugasan tersebut kepada pemeriksa/AR lain yang independen.",
      "Tidak mencampuri atau mencari tahu proses pemeriksaan perusahaan tersebut.",
      "Menjaga agar objektivitas pemeriksaan tidak diragukan oleh publik."
    ],
    contohJawabanIdeal: "Sesuai PMK tentang Penanganan Benturan Kepentingan di Lingkungan Kementerian Keuangan, saya akan SEGERA MENDEKLARASIKAN situasi tersebut secara tertulis kepada Kepala Kantor atau pimpinan unit. Saya akan mengajukan permohonan penarikan diri (recusal) dari penugasan pengawasan/pemeriksaan Wajib Pajak tersebut agar dialihkan ke pegawai lain. Hal ini sangat penting untuk menjaga independensi, objektivitas hasil penetapan, dan menghindari potensi fitnah atau bias kepentingan.",
    indikatorBahaya: [
      "Merahasiakan hubungan keluarga agar tetap bisa menangani berkas tersebut.",
      "Merasa bisa bersikap objektif tanpa perlu mendeklarasikan benturan kepentingan."
    ],
    tingkatKesulitan: "Mudah"
  },

  // 83-88: Motivasi Karir & Penempatan Kerja
  {
    nomor: 83,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Motivasi Bergabung dengan DJP dan Visi Pengabdian",
    skenarioPenguji: "Penguji ingin mendengar alasan tulus dan substantif, bukan jawaban klise hafalan.",
    pertanyaan: "Mengapa Anda memilih berkarir di Direktorat Jenderal Pajak Kementerian Keuangan, dan bukan di sektor perbankan swasta, konsultan multinasional, atau BUMN yang menawarkan gaji lebih besar?",
    aspekPenilaian: {
      integritas: "Kemurnian motivasi, visi kontribusi kebangsaan, dan pemahaman peran strategis DJP.",
      starMetode: "Penyampaian visi diri yang selaras dengan misi institusi.",
      nilaiKemenkeu: "Pelayanan dan Integritas."
    },
    poinKunciJawabanIdeal: [
      "Menyadari peran vital pajak sebagai tulang punggung APBN (lebih dari 70% pendapatan negara).",
      "Memiliki panggilan pengabdian publik dan keinginan berkontribusi nyata pada kedaulatan fiskal Indonesia.",
      "Menilai DJP sebagai kawah candradimuka birokrasi paling profesional dan dinamis dengan transformasi Coretax.",
      "Melihat makna kerja (purpose) yang lebih tinggi daripada sekadar materi pribadi."
    ],
    contohJawabanIdeal: "Bagi saya, bekerja di DJP bukan sekadar pekerjaan mencari nafkah, melainkan ladang pengabdian strategis. Pajak adalah tulang punggung lebih dari 70% penerimaan APBN yang membiayai pendidikan, kesehatan, dan infrastruktur jutaan rakyat Indonesia. Di sektor swasta, kontribusi saya mungkin hanya untuk laba segelintir pemegang saham. Namun di DJP, setiap rupiah penerimaan yang kita amankan secara sah dan profesional berdampak langsung pada kelangsungan pembangunan bangsa. Saya ingin mendedikasikan kompetensi dan integritas saya di garda terdepan transformasi perpajakan nasional.",
    indikatorBahaya: [
      "Hanya berorientasi pada tunjangan kinerja (tukin) tanpa memahami beban tanggung jawab.",
      "Jawaban yang terlalu dangkal seperti 'karena disuruh orang tua' atau 'hanya ingin status PNS'."
    ],
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 84,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Kesiapan Penempatan di Daerah 3T (Terdepan, Terluar, Tertinggal) / Seluruh Indonesia",
    skenarioPenguji: "Penguji menguji komitmen mutlak bersedia ditempatkan di mana pun di seluruh pelosok wilayah NKRI tanpa mengajukan pindah dini.",
    pertanyaan: "Jika dalam keputusan penempatan pertama Anda ditempatkan di Kantor Pelayanan Pajak (KPP) kepulauan terpencil atau daerah 3T di Indonesia Timur yang jauh dari keluarga dan minim fasilitas, bagaimana respon dan kesiapan Anda?",
    aspekPenilaian: {
      integritas: "Komitmen kebangsaan, kesiapan mental, dan kepatuhan pada sumpah penempatan.",
      starMetode: "Strategi adaptasi cepat di lingkungan baru.",
      nilaiKemenkeu: "Pelayanan dan Profesionalisme."
    },
    poinKunciJawabanIdeal: [
      "Menyatakan kesiapan 100% dengan penuh antusiasme dan komitmen tanpa syarat.",
      "Memandang penempatan daerah sebagai kesempatan emas belajar kultur masyarakat baru dan memperluas wawasan kebangsaan.",
      "Telah mengkomunikasikan dan mendapatkan dukungan penuh dari keluarga.",
      "Berkomitmen untuk tidak mengajukan pindah sebelum masa dinas wajib terpenuhi."
    ],
    contohJawabanIdeal: "Saya menyatakan SIAP 100% ditempatkan di mana pun di seluruh wilayah Negara Kesatuan Republik Indonesia. Sejak awal mendaftar, saya telah membulatkan tekad dan mendapatkan restu penuh dari keluarga. Saya memandang penempatan di daerah terpencil atau 3T bukan sebagai beban, melainkan sebagai kehormatan untuk melayani masyarakat dan memperluas basis penerimaan pajak di daerah berkembang. Saya siap beradaptasi dengan budaya lokal, membangun sinergi dengan pemerintah daerah, dan memberikan kinerja terbaik saya di mana pun negara menugaskan saya.",
    indikatorBahaya: [
      "Menunjukkan keraguan, membuat syarat (misal: 'asal ada sinyal internet'), atau langsung bertanya kapan bisa pindah ke kota besar.",
      "Jawaban defensif mengenai jarak dari orang tua/pasangan."
    ],
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 85,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Penanganan Wajib Pajak yang Emosional / Marah di Tempat Pelayanan Terpadu (TPT)",
    skenarioPenguji: "Penguji menguji kesabaran, empati, dan kemampuan komunikasi krisis Anda saat menghadapi komplain keras Wajib Pajak.",
    pertanyaan: "Bayangkan Anda bertugas di loket Tempat Pelayanan Terpadu (TPT) KPP. Seorang Wajib Pajak datang dengan marah-marah, berteriak karena rekening banknya diblokir akibat tunggakan pajak, dan menyalahkan petugas di depan umum. Bagaimana Anda mengendalikan situasi tersebut?",
    aspekPenilaian: {
      integritas: "Kecerdasan emosional (EQ), pelayanan prima, dan penegakan SOP.",
      starMetode: "Meredakan emosi, mendengarkan aktif, membawa ke ruang konsultasi, memeriksa data, memberi solusi.",
      nilaiKemenkeu: "Pelayanan dan Profesionalisme."
    },
    poinKunciJawabanIdeal: [
      "Tetap tenang, tidak terpancing emosi, dan tidak membantah dengan nada tinggi.",
      "Mengajak Wajib Pajak dengan sopan ke ruang konsultasi/helpdesk khusus agar tidak mengganggu antrean publik.",
      "Menerapkan teknik mendengarkan aktif (active listening) dan menunjukkan empati atas kekhawatirannya.",
      "Mengecek data di sistem Coretax/SIDJP bersama Seksi Penagihan, menjelaskan kronologi surat paksa/teguran yang telah dikirim, dan memberikan opsi solusi pembayaran/angsuran sesuai regulasi."
    ],
    contohJawabanIdeal: "Pertama, saya akan tetap tenang, tersenyum, dan tidak terpancing emosi. Saya akan berkata dengan sopan: 'Bapak/Ibu, kami sangat memahami kekhawatiran Anda. Mari kita duduk bersama di ruang konsultasi khusus agar kita bisa memeriksa rincian data rekening dan mencari solusinya secara jelas.' Dengan memindahkannya ke ruang privat, situasi antrean umum tetap kondusif. Di ruang konsultasi, saya akan mendengarkan keluhannya secara tuntas, lalu membuka data sistem bersama jurusita/seksi penagihan untuk menjelaskan dasar pemblokiran secara transparan dan menawarkan alternatif penyelesaian (seperti pembayaran atau permohonan restrukturisasi tunggakan) sesuai aturan hukum yang berlaku.",
    indikatorBahaya: [
      "Ikut membentak atau mendebat Wajib Pajak di depan umum.",
      "Menghindar dan melempar tanggung jawab ke petugas lain tanpa mendampingi.",
      "Menjanjikan pembatalan blokir yang melanggar SOP."
    ],
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 86,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Menghadapi Resistensi Masyarakat terhadap Regulasi Pajak Baru (PPN / PPh)",
    skenarioPenguji: "Penguji menguji kemampuan *public communication* dan pemahaman makro ekonomi fiskal Anda.",
    pertanyaan: "Ketika pemerintah mengeluarkan kebijakan penyesuaian tarif pajak (misalnya kenaikan tarif PPN atau skema TER PPh 21) yang mendapat resistensi dan kritik keras di media sosial, bagaimana peran Anda sebagai aparatur DJP dalam memberikan penjelasan ke masyarakat?",
    aspekPenilaian: {
      integritas: "Kemampuan menyampaikan edukasi fiskal secara konstruktif, netral, dan mudah dipahami.",
      starMetode: "Penyampaian fungsi pajak budgeter & reguler bagi kesejahteraan rakyat.",
      nilaiKemenkeu: "Sinergi dan Pelayanan."
    },
    poinKunciJawabanIdeal: [
      "Tidak bersikap reaktif atau berdebat kusir di media sosial.",
      "Menjelaskan substansi kebijakan secara edukatif dan berbasis data (misal: TER PPh 21 tidak menambah beban pajak baru melainkan simplifikasi bulanan).",
      "Menyampaikan bahwa pajak kembali kepada rakyat dalam bentuk subsidi energi, bansos, dan fasilitas publik.",
      "Menjadi representasi citra positif DJP yang solutif dan mengedepankan edukasi humanis."
    ],
    contohJawabanIdeal: "Sebagai aparatur DJP, peran saya adalah menjadi jembatan edukasi yang meluruskan mispersepsi publik secara santun dan berbasis data. Misalnya terkait skema TER PPh 21, saya akan menjelaskan dengan bahasa sederhana bahwa sistem ini adalah penyederhanaan hitungan bulanan dan tidak menambah beban pajak setahun bagi pegawai. Terkait penyesuaian tarif, saya akan mengedukasi bahwa penerimaan pajak dialokasikan kembali untuk subsidi kesehatan, bantuan sosial, dan menjaga stabilitas APBN saat krisis global. Saya akan mengedepankan komunikasi yang humanis dan tidak bersikap arogan.",
    indikatorBahaya: [
      "Menyalahkan masyarakat yang mengkritik.",
      "Menyampaikan informasi yang bertentangan dengan rilis resmi pimpinan Kemenkeu."
    ],
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 87,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Pengalaman Mengatasi Kegagalan dan Mengubahnya Menjadi Keberhasilan",
    skenarioPenguji: "Penguji ingin menguji *growth mindset*, akuntabilitas diri, dan resiliensi Anda saat menghadapi kegagalan.",
    pertanyaan: "Ceritakan salah satu kegagalan terbesar dalam hidup, studi, atau karir Anda di masa lalu. Apa akar penyebabnya dan bagaimana Anda bangkit memperbaiki diri?",
    aspekPenilaian: {
      integritas: "Kejujuran mengakui kekurangan diri tanpa mencari kambing hitam.",
      starMetode: "Metode STAR: Situation (kegagalan), Task (tanggung jawab), Action (refleksi & perbaikan sistemik), Result (pencapaian sukses berikutnya).",
      nilaiKemenkeu: "Kesempurnaan (Continuous Improvement)."
    },
    poinKunciJawabanIdeal: [
      "Jujur mengakui kegagalan nyata (bukan kegagalan pura-pura).",
      "Tidak menyalahkan orang lain, sistem, atau keadaan.",
      "Menjelaskan proses evaluasi diri dan langkah konkret peningkatan kapasitas (*upskilling*).",
      "Menunjukkan hasil positif jangka panjang dari pelajaran tersebut."
    ],
    contohJawabanIdeal: "Pada semester awal kuliah/proyek kerja terdahulu (Situation), saya pernah gagal menyelesaikan analisis laporan tepat waktu karena kurang cermat dalam membagi waktu dan enggan meminta bantuan tim (Task). Dari kegagalan tersebut, saya tidak mencari alasan, melainkan mengevaluasi diri secara menyeluruh. Saya mengambil kursus manajemen proyek, belajar teknik otomatisasi spreadsheet, dan melatih komunikasi kolaboratif (Action). Pada proyek berikutnya, saya berhasil memimpin tim menyelesaikan audit 2 hari lebih cepat dengan akurasi 100% (Result). Dari pengalaman itu saya belajar bahwa kegagalan adalah bahan bakar terbaik untuk penyempurnaan diri (Kesempurnaan).",
    indikatorBahaya: [
      "Mengaku tidak pernah gagal dalam hidup (tidak realistis / arogan).",
      "Menyalahkan rekan tim atau dosen/atasan atas kegagalannya."
    ],
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 88,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Kesiapan Menghadapi Transformasi Teknologi Digital Coretax DJP",
    skenarioPenguji: "Penguji ingin melihat adaptabilitas digital dan kebiasaan belajar Anda menghadapi sistem IT Coretax yang kompleks.",
    pertanyaan: "DJP sedang berada dalam fase implementasi Coretax Administration System (PSIAP) yang mengubah ratusan proses bisnis manual menjadi otomatis. Bagaimana kesiapan Anda dalam mempelajari sistem baru dan membantu Wajib Pajak yang gagap teknologi?",
    aspekPenilaian: {
      integritas: "Agilitas belajar (learning agility), kemampuan adaptasi teknologi, dan kesabaran melayani.",
      starMetode: "Kesiapan upskilling mandiri dan pendampingan wajib pajak.",
      nilaiKemenkeu: "Kesempurnaan dan Pelayanan."
    },
    poinKunciJawabanIdeal: [
      "Menunjukkan antusiasme tinggi terhadap digitalisasi dan literasi teknologi informasi.",
      "Aktif mempelajari modul KLC (Kemenkeu Learning Center) dan panduan teknis Coretax.",
      "Memiliki empati tinggi untuk membimbing Wajib Pajak lansia/UMKM yang kesulitan menggunakan portal digital.",
      "Berperan sebagai *change agent* yang mempercepat adopsi teknologi di kantor unit kerja."
    ],
    contohJawabanIdeal: "Saya sangat antusias dengan implementasi Coretax karena ini adalah lompatan peradaban perpajakan Indonesia. Saya terbiasa cepat beradaptasi dengan aplikasi digital baru melalui pembelajaran mandiri dan eksplorasi modul resmi. Terhadap Wajib Pajak yang belum familiar atau gagap teknologi, saya akan memberikan asistensi tatap muka di *helpdesk* secara sabar dan membuatkan panduan visual langkah demi langkah agar mereka mandiri. Sebagai generasi baru aparatur DJP, saya siap menjadi *champion* digital yang mempercepat kesuksesan implementasi Coretax.",
    indikatorBahaya: [
      "Alergi terhadap perubahan sistem teknologi.",
      "Kurang sabar terhadap masyarakat awam yang belum melek teknologi."
    ],
    tingkatKesulitan: "Mudah"
  },

  // 89-94: Wawancara Strategi Reformasi & Sinergi
  {
    nomor: 89,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Strategi Meningkatkan Rasio Perpajakan (Tax Ratio) Indonesia",
    skenarioPenguji: "Penguji menguji wawasan analitis Anda mengenai tantangan makro tax ratio Indonesia yang masih berada di kisaran 10-11%.",
    pertanyaan: "Tax ratio Indonesia masih relatif tertinggal dibanding negara-negara peers ASEAN. Menurut analisis Anda, terobosan apa yang harus dioptimalkan DJP untuk memperluas basis pajak tanpa mematikan iklim investasi?",
    aspekPenilaian: {
      integritas: "Wawasan kebijakan fiskal komprehensif, berbasis data, dan solutif.",
      starMetode: "Penyampaian pilar ekstensifikasi, intensifikasi, dan digitalisasi Coretax.",
      nilaiKemenkeu: "Profesionalisme dan Sinergi."
    },
    poinKunciJawabanIdeal: [
      "Integrasi NIK-NPWP dan data interoperabilitas pihak ketiga (ILAP, Perbankan, Marketplace) untuk menangkap sektor informal/underground economy.",
      "Pemanfaatan data analitik CRM Coretax untuk pengawasan berbasis risiko tinggi tanpa mengganggu Wajib Pajak patuh.",
      "Pemberian kepastian hukum dan perbaikan layanan restitusi/SKB agar iklim investasi tetap ramah.",
      "Edukasi sadar pajak sejak dini melalui kurikulum pendidikan (Tax Goes to Campus/School)."
    ],
    contohJawabanIdeal: "Untuk meningkatkan tax ratio tanpa menekan dunia usaha, DJP perlu mengoptimalkan 3 pilar: Pertama, optimalisasi data pihak ketiga (ILAP, AEOI, dan perbankan) yang diintegrasikan dengan NIK-NPWP untuk menjaring potensi sektor bayangan (shadow economy) yang selama ini belum tersentuh. Kedua, pengawasan berbasis risiko cerdas melalui Compliance Risk Management (CRM) Coretax, sehingga pemeriksaan difokuskan pada wajib pajak berisiko tinggi tanpa mengganggu kepatuhan dunia usaha patuh. Ketiga, simplifikasi layanan dan kepastian hukum yang membuat iklim investasi semakin menarik, sehingga basis ekonomi riil tumbuh dan penerimaan pajak meningkat secara organik.",
    indikatorBahaya: [
      "Hanya mengusulkan kenaikan tarif pajak tanpa memikirkan dampak ekonomi.",
      "Tidak memahami konsep tax ratio dan basis data pihak ketiga."
    ],
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 90,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Sinergi Kemenkeu Satu (Joint Audit DJP, DJBC, DJA, DJKN)",
    skenarioPenguji: "Penguji menguji pemahaman Anda mengenai inisiatif kolaborasi lintas unit eselon I di Kementerian Keuangan (Kemenkeu Satu).",
    pertanyaan: "Bagaimana Anda memandang pentingnya inisiatif 'Joint Program Kemenkeu Satu' antara DJP (Pajak), DJBC (Bea Cukai), dan DJA/DJKN? Berikan contoh bentuk kolaborasi konkretnya!",
    aspekPenilaian: {
      integritas: "Menghilangkan ego sektoral antar instansi demi optimalisasi penerimaan negara.",
      starMetode: "Penyampaian contoh Joint Audit, Joint Profiling, dan Joint Investigation.",
      nilaiKemenkeu: "Sinergi."
    },
    poinKunciJawabanIdeal: [
      "Menyadari bahwa penerimaan negara optimal hanya bisa dicapai dengan menghilangkan silo/ego sektoral.",
      "Memberikan contoh Joint Profiling (pencocokan data impor DJBC dengan SPT Tahunan DJP).",
      "Contoh Joint Audit (pemeriksaan bersama atas kepatuhan pajak penghasilan dan bea masuk importir).",
      "Contoh Joint Collection (eksekusi sita aset bersama DJKN)."
    ],
    contohJawabanIdeal: "Inisiatif Kemenkeu Satu sangat krusial untuk menutup celah penghindaran pajak dan penyelundupan. Contoh konkretnya adalah Joint Profiling dan Joint Audit antara DJP dan Bea Cukai (DJBC): ketika seorang importir melaporkan nilai impor rendah di Bea Cukai untuk menekan bea masuk, data tersebut langsung disinkronkan dengan data PPh Badan di DJP. Kolaborasi ini mencegah manipulasi ganda (under-invoicing). Selain itu, sinergi dengan DJKN mempercepat lelang aset sitaan penagihan pajak. Kolaborasi ini membuktikan bahwa Sinergi menghadirkan penerimaan negara yang jauh lebih optimal.",
    indikatorBahaya: [
      "Menonjolkan ego sektoral DJP lebih superior daripada instansi lain.",
      "Tidak mengetahui adanya program Kemenkeu Satu."
    ],
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 91,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Pengalaman Memimpin Tim dalam Situasi Sulit dan Mengambil Keputusan Cepat",
    skenarioPenguji: "Penguji menguji jiwa kepemimpinan, inisiatif, dan tanggung jawab Anda dalam situasi kritis.",
    pertanyaan: "Ceritakan situasi saat Anda harus mengambil keputusan penting dalam kondisi informasi terbatas dan terdapat perbedaan pendapat tajam di antara anggota tim!",
    aspekPenilaian: {
      integritas: "Kepemimpinan inklusif, ketegasan mengambil keputusan, dan akuntabilitas.",
      starMetode: "Metode STAR lengkap.",
      nilaiKemenkeu: "Profesionalisme dan Sinergi."
    },
    poinKunciJawabanIdeal: [
      "Menguraikan situasi perbedaan pendapat dengan objektif.",
      "Mengumpulkan data fakta kunci yang tersedia dan mendengarkan sudut pandang anggota tim.",
      "Mengambil keputusan berbasis mitigasi risiko terbaik dan menjelaskan rasionalitasnya ke tim.",
      "Mengevaluasi hasil dan bertanggung jawab penuh atas keputusan tersebut."
    ],
    contohJawabanIdeal: "Saat memimpin tim dalam lomba karya ilmiah/proyek riset (Situation), terjadi perbedaan pandangan tajam mengenai metodologi data yang akan digunakan mendekati batas akhir submisi (Task). Langkah saya adalah memfasilitasi diskusi terarah selama 30 menit untuk membedah kelebihan dan risiko dari masing-masing opsi. Setelah mempertimbangkan validitas data dan ketersediaan waktu, saya mengambil keputusan tegas untuk memilih metodologi gabungan yang paling minim risiko bias (Action). Saya merangkul seluruh anggota tim untuk fokus mengeksekusi peran masing-masing. Hasilnya, karya kami lolos babak final dan meraih peringkat utama (Result).",
    indikatorBahaya: [
      "Otoriter tanpa mau mendengarkan masukan tim, atau sebaliknya pasif dan tidak berani mengambil keputusan.",
      "Menyalahkan anggota tim atas ketidaksepakatan."
    ],
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 92,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Menjaga Netralitas ASN saat Pemilu / Pilkada di Era Media Sosial",
    skenarioPenguji: "Penguji menguji kepatuhan Anda terhadap UU ASN dan PP No. 94/2021 mengenai asas netralitas aparatur negara.",
    pertanyaan: "Bagaimana Anda menerapkan prinsip netralitas ASN di lingkungan kerja maupun di media sosial pribadi selama tahun politik pemilihan umum atau pilkada?",
    aspekPenilaian: {
      integritas: "Kepatuhan mutlak pada asas netralitas ASN (tidak memihak, tidak berkampanye di medsos).",
      starMetode: "Kedisiplinan bermedia sosial dan fokus profesionalisme.",
      nilaiKemenkeu: "Integritas dan Profesionalisme."
    },
    poinKunciJawabanIdeal: [
      "Mematuhi larangan memberikan dukungan, membuat postingan, memberikan like/comment/share yang berpihak pada paslon tertentu di media sosial.",
      "Tidak menggunakan atribut, fasilitas negara, atau jam dinas untuk politik praktis.",
      "Tetap menjalankan hak pilih di bilik suara secara tertutup dan rahasia.",
      "Menjaga netralitas pelayanan kepada Wajib Pajak tanpa memandang latar belakang afiliasi politik."
    ],
    contohJawabanIdeal: "Sesuai amanat UU ASN dan SKB Netralitas ASN, saya berkomitmen menjaga netralitas penuh. Di media sosial pribadi, saya berdisiplin untuk tidak mengunggah, menyukai, mengomentari, atau membagikan konten kampanye calon politik tertentu. Di lingkungan kerja, saya menjamin seluruh Wajib Pajak dilayani secara profesional, adil, dan setara tanpa memandang latar belakang politik. Hak pilih saya akan saya gunakan secara bijak di bilik suara sebagai warga negara, namun identitas profesional saya sebagai ASN Kemenkeu adalah netral dan berfokus melayani bangsa.",
    indikatorBahaya: [
      "Menganggap like/share di medsos pribadi adalah kebebasan berpendapat yang boleh melanggar netralitas ASN.",
      "Tidak mengetahui adanya aturan netralitas ASN."
    ],
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 93,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Mengatasi Kejenuhan Rutinitas Administrasi dan Menjaga Semangat Kerja",
    skenarioPenguji: "Penguji ingin menguji motivasi intrinsik dan daya tahan Anda dalam jangka panjang.",
    pertanyaan: "Pekerjaan teknis perpajakan sering kali melibatkan ribuan baris data angka, rekonsiliasi faktur, dan regulasi yang berulang. Bagaimana cara Anda menjaga antusiasme, ketelitian, dan motivasi kerja tetap tinggi setiap hari?",
    aspekPenilaian: {
      integritas: "Motivasi intrinsik, ketelitian detail (*attention to detail*), dan etos kerja.",
      starMetode: "Melihat makna besar di balik tugas kecil.",
      nilaiKemenkeu: "Kesempurnaan."
    },
    poinKunciJawabanIdeal: [
      "Menghubungkan tugas harian dengan tujuan besar (setiap baris data adalah rupiah penopang beasiswa LPDP dan rumah sakit rakyat).",
      "Membuat inovasi perbaikan kerja kecil (otomatisasi template, checklist ketelitian).",
      "Menjaga keseimbangan hidup sehat dan terus melakukan *self-learning*.",
      "Menikmati proses pemecahan masalah (problem solving) perpajakan."
    ],
    contohJawabanIdeal: "Saya selalu mengaitkan tugas teknis harian dengan gambaran besar (*the bigger picture*). Ketika saya merekonsiliasi ribuan data faktur, saya menyadari bahwa ketelitian saya sedang mengamankan hak negara yang nantinya membiayai fasilitas publik, gaji guru, dan rumah sakit. Selain itu, saya senang melakukan inovasi perbaikan berkelanjutan, misalnya menyusun rumus otomatisasi untuk mempercepat verifikasi. Dengan melihat makna di balik pekerjaan dan selalu menantang diri untuk lebih efisien, saya menjaga motivasi dan ketelitian saya selalu di tingkat tertinggi.",
    indikatorBahaya: [
      "Mudah bosan dan menyatakan tidak suka pekerjaan administratif data.",
      "Bekerja sekadar menggugurkan kewajiban."
    ],
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 94,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Menyikapi Kritik Tajam Masyarakat terhadap Kasus Oknum di Masa Lalu",
    skenarioPenguji: "Penguji menguji kedewasaan mental Anda dalam menghadapi sentimen negatif publik terhadap institusi.",
    pertanyaan: "Masyarakat terkadang masih mengaitkan DJP dengan berita negatif tentang ulah oknum flexing atau korupsi di masa lalu. Sebagai calon pegawai DJP, bagaimana Anda menyikapi stigma tersebut dan meyakinkan masyarakat?",
    aspekPenilaian: {
      integritas: "Keteguhan komitmen reformasi, empati terhadap kritik publik, dan tekad pembuktian lewat integritas.",
      starMetode: "Sikap konstruktif dan keteladanan nyata.",
      nilaiKemenkeu: "Integritas dan Pelayanan."
    },
    poinKunciJawabanIdeal: [
      "Menerima kritik publik sebagai pelecut semangat reformasi dan evaluasi diri institusi.",
      "Tidak membela oknum yang bersalah, melainkan mendukung penegakan hukum tanpa pandang bulu.",
      "Menjelaskan bahwa DJP memiliki sistem pengawasan berlapis (tiga lini pertahanan / Three Lines of Defense) dan whistleblowing Wise yang sangat ketat.",
      "Membuktikan lewat keteladanan gaya hidup sederhana dan pelayanan bersih tanpa cela."
    ],
    contohJawabanIdeal: "Saya memandang kritik publik sebagai bukti kecintaan dan harapan tinggi masyarakat terhadap institusi pengelola uang negara. Kita tidak boleh defensif atas kesalahan oknum di masa lalu, melainkan menjadikannya momentum pembersihan dan penguatan tata kelola. Kemenkeu telah menerapkan sistem pengawasan Three Lines of Defense, pelaporan LHKPN berkala, dan pemantauan profil pegawai secara ketat. Sebagai generasi penerus, jawaban terbaik saya adalah melalui KETELADANAN NYATA: hidup sederhana, bekerja jujur tanpa cela, dan melayani masyarakat setulus hati untuk mengembalikan dan memperkuat kepercayaan publik kepada DJP.",
    indikatorBahaya: [
      "Menjadi sinis atau menyalahkan masyarakat yang mengkritik.",
      "Menganggap wajar perilaku hidup mewah oknum."
    ],
    tingkatKesulitan: "Sedang"
  },

  // 95-100: Pertanyaan Pamungkas & Komitmen
  {
    nomor: 95,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Penerapan 5 Nilai Kementerian Keuangan dalam Tindakan Nyata",
    skenarioPenguji: "Penguji ingin menguji apakah Anda hafal dan benar-benar meresapi 5 Nilai Kemenkeu dalam perilaku harian.",
    pertanyaan: "Sebutkan 5 Nilai Kementerian Keuangan dan jelaskan bagaimana Anda akan mengaplikasikannya secara konkret dalam tugas harian Anda di DJP!",
    aspekPenilaian: {
      integritas: "Penguasaan filosofi nilai Kemenkeu dan aplikasinya.",
      starMetode: "Pemaparan 5 nilai: Integritas, Profesionalisme, Sinergi, Pelayanan, Kesempurnaan.",
      nilaiKemenkeu: "Seluruh 5 Nilai Kemenkeu."
    },
    poinKunciJawabanIdeal: [
      "1. Integritas: Jujur, menolak gratifikasi, patuh kode etik.",
      "2. Profesionalisme: Menguasai regulasi perpajakan, bekerja tuntas dan akurat.",
      "3. Sinergi: Bekerja sama erat dengan rekan, seksi lain, dan Kemenkeu Satu.",
      "4. Pelayanan: Ramah, solutif, transparan melayani Wajib Pajak.",
      "5. Kesempurnaan: Belajar tiada henti, adaptif terhadap inovasi Coretax."
    ],
    contohJawabanIdeal: "Lima Nilai Kementerian Keuangan adalah:\n1. Integritas: Saya terapkan dengan selalu berkata dan bertindak jujur, menolak segala bentuk suap/gratifikasi, dan mematuhi kode etik.\n2. Profesionalisme: Bekerja tuntas dengan keahlian teknis perpajakan yang mumpuni serta menjunjung tinggi objektivitas hukum.\n3. Sinergi: Berkolaborasi aktif antar-seksi di KPP dan instansi lain tanpa sekat ego sektoral.\n4. Pelayanan: Memberikan layanan prima yang solutif, adil, dan transparan kepada seluruh Wajib Pajak.\n5. Kesempurnaan: Terus berinovasi, belajar mandiri memperdalam sistem Coretax, dan melakukan perbaikan tiada henti.",
    indikatorBahaya: [
      "Tidak hafal 5 nilai atau tertukar dengan nilai instansi lain.",
      "Hanya hafal teks tanpa bisa memberikan contoh konkret."
    ],
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 96,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Kesiapan Mengikuti Pembinaan Mental dan Fisik (Bintalsik) DJP",
    skenarioPenguji: "Penguji menguji kedisiplinan dan kesiapan mengikuti pendidikan semi-militer / kedisiplinan dasar pegawai DJP.",
    pertanyaan: "Setiap calon pegawai DJP wajib mengikuti program Pembinaan Mental dan Fisik (Bintalsik) semi-militer yang menuntut kedisiplinan tinggi, ketahanan fisik, dan kepatuhan komando. Apakah Anda siap dan bagaimana Anda mempersiapkan fisik dan mental Anda?",
    aspekPenilaian: {
      integritas: "Kedisiplinan, ketahanan fisik, dan resiliensi.",
      starMetode: "Persiapan fisik dan mental yang terencana.",
      nilaiKemenkeu: "Profesionalisme dan Integritas."
    },
    poinKunciJawabanIdeal: [
      "Menyatakan kesiapan penuh 100% mengikuti Bintalsik.",
      "Menjelaskan persiapan fisik rutin (olahraga lari, push-up, pola hidup sehat).",
      "Menyadari tujuan Bintalsik untuk membentuk karakter pantang menyerah, korsa positif, dan integritas baja.",
      "Menghormati hirarki kedinasan dan disiplin waktu."
    ],
    contohJawabanIdeal: "Saya SIAP 100% mengikuti seluruh rangkaian Pembinaan Mental dan Fisik (Bintalsik) DJP. Saya menyadari bahwa Bintalsik sangat penting untuk membentuk kedisiplinan tinggi, ketahanan mental di bawah tekanan, dan jiwa korsa yang solid dalam mengamankan penerimaan negara. Untuk itu, saya rutin menjaga kebugaran fisik melalui olahraga lari dan latihan kekuatan secara berkala, serta melatih kedisiplinan waktu dalam aktivitas sehari-hari.",
    indikatorBahaya: [
      "Mengeluh soal fisik atau meminta keringanan tanpa alasan medis sah.",
      "Menolak kedisiplinan semi-militer."
    ],
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 97,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Pandangan terhadap Transparansi dan Whistleblowing System (Wise)",
    skenarioPenguji: "Penguji ingin menguji keberanian Anda mendukung tata kelola bersih di Kemenkeu.",
    pertanyaan: "Bagaimana pandangan Anda mengenai peran Whistleblowing System (Wise Kemenkeu) dalam mewujudkan institusi yang bersih dan akuntabel?",
    aspekPenilaian: {
      integritas: "Dukungan terhadap sistem pengawasan internal dan transparansi.",
      starMetode: "Pemanfaatan instrumen pengaduan berdasar fakta akurat.",
      nilaiKemenkeu: "Integritas dan Kesempurnaan."
    },
    poinKunciJawabanIdeal: [
      "Memandang Wise Kemenkeu sebagai kanal strategis perlindungan integritas organisasi.",
      "Mengetahui bahwa identitas pelapor dilindungi kerahasiaannya oleh Inspektorat Jenderal Kemenkeu.",
      "Berkomitmen menggunakan Wise secara bertanggung jawab berbasis bukti faktual, bukan fitnah.",
      "Mendukung zero tolerance terhadap fraud dan korupsi."
    ],
    contohJawabanIdeal: "Whistleblowing System (Wise) adalah benteng pertahanan integritas yang sangat vital di Kementerian Keuangan. Wise memberikan rasa aman bagi pegawai dan masyarakat untuk melaporkan indikasi kecurangan dengan perlindungan identitas yang terjamin oleh Inspektorat Jenderal. Keberadaan Wise menciptakan efek jera dan memastikan bahwa tidak ada ruang toleransi bagi pelanggaran kode etik. Saya mendukung penuh pemanfaatan Wise secara bertanggung jawab dan berbasis bukti nyata.",
    indikatorBahaya: [
      "Menganggap whistleblowing sebagai tindakan memata-matai atau 'menusuk teman dari belakang'.",
      "Tidak percaya pada mekanisme perlindungan pengaduan."
    ],
    tingkatKesulitan: "Mudah"
  },
  {
    nomor: 98,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Rencana Pengembangan Diri dan Karir 5 Tahun ke Depan di DJP",
    skenarioPenguji: "Penguji ingin melihat visi jangka panjang, ambisi positif, dan komitmen belajar berkelanjutan Anda.",
    pertanyaan: "Di mana Anda melihat diri Anda 5 tahun ke depan setelah diterima menjadi pegawai di Direktorat Jenderal Pajak?",
    aspekPenilaian: {
      integritas: "Perencanaan karir terarah, keinginan berkontribusi nyata, dan semangat pengembangan diri.",
      starMetode: "Rencana berjenjang: penguasaan teknis awal, sertifikasi/studi lanjut, pencapaian target kerja.",
      nilaiKemenkeu: "Kesempurnaan dan Profesionalisme."
    },
    poinKunciJawabanIdeal: [
      "Tahun 1-2: Menguasai tuntas proses bisnis Coretax, regulasi perpajakan di lapangan, dan mencapai target IKU (Indikator Kinerja Utama) 100%.",
      "Tahun 3-4: Mengambil sertifikasi keahlian (Pemeriksa Pajak / Data Analyst Perpajakan / Akuntansi Forensik) atau melanjutkan studi S2 melalui beasiswa Pusdiklat Pajak / LPDP.",
      "Tahun 5: Menjadi fungsional pemeriksa/AR yang handal, berkontribusi pada inovasi pengawasan digital, dan menjadi mentor bagi pegawai baru.",
      "Menunjukkan loyalitas berkelanjutan untuk institusi DJP."
    ],
    contohJawabanIdeal: "Dalam 5 tahun ke depan, rencana karir saya terbagi dalam 3 tahapan: Pada 2 tahun pertama, saya fokus menguasai tuntas seluruh proses bisnis dan sistem Coretax di unit penempatan saya serta memastikan seluruh target kinerja (IKU) tercapai sempurna. Pada tahun ke-3 dan ke-4, saya berencana mengambil sertifikasi fungsional perpajakan dan mengejar beasiswa studi lanjut S2 di bidang Kebijakan Perpajakan Internasional atau Data Analytics. Pada tahun ke-5, saya melihat diri saya sebagai Fungsional Pemeriksa atau Account Representative yang berintegritas tinggi, mampu memimpin audit kasus kompleks, dan melahirkan inovasi pengawasan yang berkontribusi nyata pada pencapaian target penerimaan DJP.",
    indikatorBahaya: [
      "Tidak punya rencana karir sama sekali ('mengalir saja').",
      "Hanya berencana resign atau keluar ke kantor konsultan setelah beberapa tahun."
    ],
    tingkatKesulitan: "Sedang"
  },
  {
    nomor: 99,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Mengapa Panel Pewawancara Harus Memilih Anda Dibanding Kandidat Lain?",
    skenarioPenguji: "Penguji memberikan panggung untuk menguji *self-worth*, ringkasan nilai tambah unik, dan kepercayaan diri tanpa terkesan sombong.",
    pertanyaan: "Ada ribuan pelamar lain yang juga memiliki gelar sarjana dan nilai akademis tinggi. Mengapa kami harus memilih Anda untuk bergabung di Direktorat Jenderal Pajak?",
    aspekPenilaian: {
      integritas: "Kombinasi unik kompetensi teknis, integritas karakter tanpa kompromi, dan resiliensi.",
      starMetode: "Penyampaian *Unique Selling Point* (USP) yang padat dan meyakinkan.",
      nilaiKemenkeu: "Profesionalisme dan Integritas."
    },
    poinKunciJawabanIdeal: [
      "Memadukan pemahaman teknis perpajakan yang kuat dengan literasi data digital modern.",
      "Menekankan integritas yang telah teruji dalam rekam jejak akademik/organisasi.",
      "Memiliki daya adaptasi tinggi dan kesiapan ditempatkan di mana pun di nusantara.",
      "Menunjukkan antusiasme dan komitmen jangka panjang untuk mengabdi.",
      "Disampaikan dengan percaya diri, rendah hati, dan meyakinkan."
    ],
    contohJawabanIdeal: "Bapak/Ibu Penguji yang saya hormati, ada tiga alasan utama mengapa saya adalah kandidat yang tepat: Pertama, saya membawa kombinasi pemahaman regulasi perpajakan yang kuat dan keahlian analitik data digital yang sangat relevan dengan era Coretax DJP saat ini. Kedua, saya memiliki integritas karakter yang kokoh dan telah terbukti dalam rekam jejak kepemimpinan saya—saya pantang berkompromi terhadap kecurangan. Ketiga, saya memiliki komitmen pengabdian 100% tanpa syarat, siap bekerja di bawah tekanan target APBN, dan siap ditempatkan di seluruh pelosok Indonesia. Jika saya diberi amanah ini, saya tidak hanya akan bekerja memenuhi target, melainkan mendedikasikan seluruh energi dan kompetensi terbaik saya demi kedaulatan fiskal Indonesia.",
    indikatorBahaya: [
      "Merendahkan kandidat lain.",
      "Terlalu percaya diri berlebihan (narsistik) atau sebaliknya terlalu minder tanpa argumen kuat."
    ],
    tingkatKesulitan: "HOTS / Sulit"
  },
  {
    nomor: 100,
    kategori: "Wawancara Motivasi & Perilaku STAR",
    topik: "Pernyataan Penutup & Komitmen Integritas Sumpah Jabatan DJP",
    skenarioPenguji: "Penguji memberikan kesempatan closing statement untuk mengunci impresi akhir wawancara.",
    pertanyaan: "Apakah ada pernyataan penutup (closing statement) yang ingin Anda sampaikan kepada Tim Penguji sebelum sesi wawancara ini diakhiri?",
    aspekPenilaian: {
      integritas: "Ketulusan, rasa terima kasih, keteguhan hati, dan komitmen profesional.",
      starMetode: "Pernyataan penutup yang inspiratif, sopan, dan berkesan positif mendalam.",
      nilaiKemenkeu: "Seluruh Nilai Kemenkeu."
    },
    poinKunciJawabanIdeal: [
      "Mengucapkan terima kasih yang tulus atas waktu dan kesempatan berharga dari Tim Penguji.",
      "Menegaskan kembali komitmen dan motivasi pengabdian kepada bangsa melalui DJP Kemenkeu.",
      "Menyatakan kesiapan menerima amanah dan bertekad menjadi aparatur yang membanggakan institusi.",
      "Menutup dengan salam santun dan penuh kehormatan."
    ],
    contohJawabanIdeal: "Terima kasih banyak atas waktu dan kesempatan yang sangat berharga ini, Bapak dan Ibu Penguji. Wawancara hari ini semakin mempertebal keyakinan dan tekad saya bahwa Direktorat Jenderal Pajak adalah rumah pengabdian yang saya impikan. Saya siap membawa energi positif, kompetensi terbaik, dan integritas tanpa kompromi untuk memperkuat tim DJP Kemenkeu dalam mengamankan penerimaan negara demi kesejahteraan seluruh rakyat Indonesia. Saya siap berbakti untuk negeri. Terima kasih dan salam hormat.",
    indikatorBahaya: [
      "Hanya menjawab 'tidak ada' dan terburu-buru ingin keluar.",
      "Meminta-minta belas kasihan penguji agar diloloskan."
    ],
    tingkatKesulitan: "Mudah"
  }
];

wawancaraData.forEach(item => {
  soalList.push({
    id: `djp-soal-${item.nomor}`,
    nomor: item.nomor,
    tipe: 'wawancara',
    kategori: item.kategori,
    topik: item.topik,
    skenarioPenguji: item.skenarioPenguji,
    pertanyaan: item.pertanyaan,
    aspekPenilaian: item.aspekPenilaian,
    poinKunciJawabanIdeal: item.poinKunciJawabanIdeal,
    contohJawabanIdeal: item.contohJawabanIdeal,
    indikatorBahaya: item.indikatorBahaya,
    tingkatKesulitan: item.tingkatKesulitan
  });
});

console.log('25 Interview questions built. Total questions in bank: ' + soalList.length);

const masterBank = {
  judul: "Simulasi Ujian Seleksi Penerimaan Pegawai DJP & Kemenkeu RI (100 Soal Master Curated)",
  deskripsi: "Paket komprehensif 100 soal kurasi standar Seleksi Kompetensi Bidang (SKB/TKB), Ujian Esai Analisis Studi Kasus, dan Skenario Wawancara Integritas & Kompetensi Direktorat Jenderal Pajak Kementerian Keuangan Republik Indonesia.",
  versi: "2026.1",
  totalSoal: soalList.length,
  breakdown: {
    pilihanGanda: 50,
    esaiKasus: 25,
    wawancara: 25
  },
  passingGrade: {
    tkbPg: 70,
    esai: 75,
    wawancara: 80,
    gabungan: 75
  },
  soal: soalList
};

const outputDir = path.join(__dirname);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'simulasi-seleksi-djp-100.json');
fs.writeFileSync(outputPath, JSON.stringify(masterBank, null, 2), 'utf-8');
console.log('Successfully saved master bank to ' + outputPath);
