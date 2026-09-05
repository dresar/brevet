import { z } from 'zod';
import {
  modulSchema,
  bagianSchema,
  gambarSchema,
  kuisSoalSchema,
} from './validators';

// ============================================================
// TYPESCRIPT TYPES — Derived from Zod schemas (single source of truth)
// ============================================================

export type Modul = z.infer<typeof modulSchema>;
export type ModulData = Modul['modul'];
export type Bagian = z.infer<typeof bagianSchema>;
export type Gambar = z.infer<typeof gambarSchema>;
export type KuisSoal = z.infer<typeof kuisSoalSchema>;

export type TipeKalkulator =
  | 'ppn'
  | 'pph21_ter'
  | 'pbb'
  | 'bphtb'
  | 'pph_badan'
  | 'pph_op'
  | 'pph22'
  | 'pph23'
  | 'pph_final';

export type KalkulatorConfig = {
  tipe: TipeKalkulator;
  judul: string;
  keterangan?: string;
};

export type ContohKasus = {
  judul: string;
  cerita: string;
  poin?: string[];
};

export type KesalahanUmum = {
  salah: string;
  benar: string;
  tips?: string;
};

export type Istilah = {
  kata: string;
  definisi: string;
  contoh?: string;
};

export type GlosariumItem = {
  kata: string;
  definisi: string;
  penjelasan_sederhana?: string;
};

export type KuisAkhir = {
  judul: string;
  nilai_lulus?: number;
  waktu_menit?: number;
  soal: KuisSoal[];
};

export type KuisPerhitungan = {
  judul: string;
  soal: KuisSoal[];
};

// ============================================================
// API RESPONSE TYPES
// ============================================================

export type ApiKey = {
  id: string;
  name: string;
  keyValue: string;
  status: 'active' | 'error' | 'disabled';
  orderIndex: number;
  errorCount: number | null;
  lastError: string | null;
  lastUsedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type ModuleSummary = {
  id: string;
  code: string;
  slug: string;
  title: string;
  category: string | null;
  difficulty: string | null;
  estimatedMinutes: number | null;
  status: string | null;
  orderIndex: number | null;
  progressPersen: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type ModuleDetail = ModuleSummary & {
  contentJson: Modul;
};

export type UserNote = {
  id: string;
  moduleId: string;
  sectionId: string | null;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type UserBookmark = {
  id: string;
  moduleId: string;
  sectionId: string | null;
  createdAt: Date | null;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date | null;
};

export type UserSettings = {
  fontSize: 'normal' | 'besar';
};

export type UserProfile = {
  id: string;
  email: string;
  fullName: string | null;
  role: string | null;
};

// ============================================================
// GEMINI RESPONSE TYPES
// ============================================================

export type GeminiSuccessResult = {
  ok: true;
  teks: string;
};

export type GeminiRotatedResult = {
  ok: false;
  rotated: true;
  pesan: string;
  detail?: string;
};

export type GeminiErrorResult = {
  ok: false;
  rotated?: false;
  pesan: string;
};

export type GeminiResult =
  | GeminiSuccessResult
  | GeminiRotatedResult
  | GeminiErrorResult;

// ============================================================
// VALIDATION RESULT TYPES
// ============================================================

export type ParseSyntaxError = {
  ok: false;
  kind: 'syntax';
  line?: number;
  column?: number;
  message: string;
};

export type ParseSchemaError = {
  ok: false;
  kind: 'schema';
  issues: Array<{ path: string; message: string }>;
};

export type ParseSuccess = {
  ok: true;
  data: Modul;
};

export type ParseResult = ParseSyntaxError | ParseSchemaError | ParseSuccess;
