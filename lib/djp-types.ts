export type DJPQuestionType = 'pilihan_ganda' | 'esai_kasus' | 'wawancara';

export type DJPKategori = 
  | 'KUP & Reformasi UU HPP'
  | 'PPh 21 TER (PMK 168/2023)'
  | 'PPh Potput & Badan'
  | 'PPN & PPnBM (11%-12%)'
  | 'Coretax System & Digitalisasi DJP'
  | 'Penagihan PPSP & Sengketa Pajak'
  | 'Nilai-Nilai Kemenkeu & Kode Etik DJP'
  | 'Integritas & Anti-Gratifikasi'
  | 'Studi Kasus Pemeriksaan & Sengketa'
  | 'Wawancara Motivasi & Perilaku STAR'
  | 'Wawancara Situasional & Dilema Etika';

export interface DJPSoalPG {
  id: string;
  nomor: number;
  tipe: 'pilihan_ganda';
  kategori: DJPKategori;
  pertanyaan: string;
  pilihan: string[]; // [ "A. ...", "B. ...", "C. ...", "D. ..." ]
  jawabanKunci: string; // "A" | "B" | "C" | "D"
  pembahasan: string;
  landasanHukum: string;
  tingkatKesulitan: 'Mudah' | 'Sedang' | 'HOTS / Sulit';
}

export interface DJPSoalEsai {
  id: string;
  nomor: number;
  tipe: 'esai_kasus';
  kategori: DJPKategori;
  judulKasus: string;
  skenario: string;
  dataTambahan?: string[];
  pertanyaan: string;
  jawabanKunci: string;
  rubrikPoinPenting: string[];
  pembahasan: string;
  landasanHukum: string;
  tingkatKesulitan: 'Sedang' | 'HOTS / Sulit';
}

export interface DJPSoalWawancara {
  id: string;
  nomor: number;
  tipe: 'wawancara';
  kategori: DJPKategori;
  topik: string;
  skenarioPenguji: string;
  pertanyaan: string;
  aspekPenilaian: {
    integritas: string;
    starMetode: string;
    nilaiKemenkeu: string;
  };
  poinKunciJawabanIdeal: string[];
  contohJawabanIdeal: string;
  indikatorBahaya: string[]; // Red flags in answers
  tingkatKesulitan: 'Sedang' | 'HOTS / Sulit';
}

export type DJPSoal = DJPSoalPG | DJPSoalEsai | DJPSoalWawancara;

export interface DJPExamBank {
  judul: string;
  deskripsi: string;
  versi: string;
  totalSoal: number;
  breakdown: {
    pilihanGanda: number;
    esaiKasus: number;
    wawancara: number;
  };
  passingGrade: {
    tkbPg: number; // e.g. 70
    esai: number;  // e.g. 75
    wawancara: number; // e.g. 80
    gabungan: number; // e.g. 75
  };
  soal: DJPSoal[];
}

export type ExamMode = 'all-100' | 'tkb-50' | 'esai-25' | 'wawancara-25';

export interface EssayAIAnalysis {
  skor: number; // 0 - 100
  status: 'sesuai' | 'cukup' | 'kurang';
  verdictText: string;
  apresiasi: string;
  perbaikan: string;
  penjelasanDetail: string;
  analisisPoinHukum: string[];
}

export interface InterviewAIAnalysis {
  skor: number; // 0 - 100
  status: 'sangat_siap' | 'cukup_siap' | 'perlu_pembinaan';
  verdictText: string;
  evaluasiSTAR: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  keselarasanNilaiKemenkeu: {
    integritas: number; // 1 - 5
    profesionalisme: number;
    sinergi: number;
    pelayanan: number;
    kesempurnaan: number;
    catatan: string;
  };
  apresiasi: string;
  saranPengembangan: string;
  modelAnswer: string;
}

export interface DJPAttemptState {
  currentIdx: number;
  answers: Record<string, string>; // questionId -> answer text or selected option
  flagged: Record<string, boolean>; // questionId -> boolean (ragu-ragu)
  essayAnalysis: Record<string, EssayAIAnalysis>;
  interviewAnalysis: Record<string, InterviewAIAnalysis>;
  timeLeft: number;
  quizFinished: boolean;
  mode: ExamMode;
}

export interface CompetencyScore {
  kategori: string;
  totalSoal: number;
  benar: number;
  skorRata: number;
}
