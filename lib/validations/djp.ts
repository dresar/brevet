import { z } from 'zod';

export const djpAttemptSchema = z.object({
  mode: z.enum(['all-100', 'tkb-50', 'esai-25', 'wawancara-25']),
  tkbScore: z.number().int().min(0).max(100).default(0),
  essayScore: z.number().int().min(0).max(100).default(0),
  interviewScore: z.number().int().min(0).max(100).default(0),
  finalScore: z.number().int().min(0).max(100),
  isPassed: z.boolean().default(false),
  answersJson: z.record(z.string(), z.string()),
  essayAnalysisJson: z.record(z.string(), z.any()).optional().nullable(),
  interviewAnalysisJson: z.record(z.string(), z.any()).optional().nullable(),
});

export const evaluateEssaySchema = z.object({
  judulKasus: z.string().optional(),
  skenario: z.string().optional(),
  pertanyaan: z.string().min(1, 'Pertanyaan wajib diisi'),
  jawabanKunci: z.string().min(1, 'Kunci jawaban wajib diisi'),
  rubrikPoinPenting: z.array(z.string()).optional(),
  jawabanUser: z.string().min(1, 'Jawaban peserta wajib diisi'),
  landasanHukum: z.string().optional(),
});

export const evaluateInterviewSchema = z.object({
  topik: z.string().optional(),
  skenarioPenguji: z.string().optional(),
  pertanyaan: z.string().min(1, 'Pertanyaan wawancara wajib diisi'),
  aspekPenilaian: z.record(z.string(), z.any()).optional(),
  poinKunciJawabanIdeal: z.array(z.string()).optional(),
  contohJawabanIdeal: z.string().optional(),
  indikatorBahaya: z.array(z.string()).optional(),
  jawabanUser: z.string().min(1, 'Jawaban wawancara wajib diisi'),
});
