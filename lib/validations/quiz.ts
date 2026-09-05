import { z } from 'zod';

export const quizAttemptSchema = z.object({
  moduleId: z.string().uuid('ID Modul tidak valid'),
  pgScore: z.number().int().min(0).max(100),
  essayScore: z.number().int().min(0).max(100).optional().default(0),
  finalScore: z.number().int().min(0).max(100),
  answersJson: z.record(z.string(), z.string()),
  essayAnalysisJson: z.record(z.string(), z.any()).optional().nullable(),
});
