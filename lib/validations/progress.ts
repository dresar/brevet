import { z } from 'zod';

export const sectionProgressSchema = z.object({
  moduleId: z.string().uuid('ID Modul tidak valid'),
  sectionId: z.string().min(1, 'ID Section wajib diisi'),
  completed: z.boolean(),
});

export const batchProgressSchema = z.object({
  moduleId: z.string().uuid('ID Modul tidak valid'),
  completedSectionIds: z.array(z.string()),
});
