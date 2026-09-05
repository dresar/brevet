import { z } from 'zod';

// ============================================================
// SKEMA JSON MODUL — SUMBER KEBENARAN TUNGGAL
// Identik di: validators.ts, module-types.ts, section-renderer, super-prompts.ts
// Key: snake_case bahasa Indonesia (sesuai spec)
// ============================================================

export const gambarSchema = z.object({
  id: z.string(),
  prompt: z.string().min(10),
  keterangan: z.string().optional(),
  alt: z.string().optional(),
  url_gambar: z.string().url().nullable().optional(), // diisi user setelah upload ke Cloudinary / Media Library
});

export const kuisSoalSchema = z.object({
  id: z.string(),
  pertanyaan: z.string(),
  tipe: z.enum(['pilihan_ganda', 'benar_salah', 'isian_singkat', 'esai']),
  pilihan: z.array(z.string()).nullable().optional(), // wajib untuk pilihan_ganda
  jawaban: z.string(),
  pembahasan: z.string().nullable().optional(),
});

export const bagianSchema = z.object({
  id: z.string(),
  judul: z.string(),
  paragraf: z.array(z.string()).min(1),
  poin_penting: z.array(z.string()).optional(),
  analogi: z.string().optional(),
  contoh_kasus: z
    .object({
      judul: z.string(),
      cerita: z.string(),
      poin: z.array(z.string()).optional(),
    })
    .optional(),
  diagram_mermaid: z.array(z.string()).optional(),
  penjelasan_diagram: z.string().nullable().optional(),
  prompt_gambar: z.array(gambarSchema).optional(),
  kalkulator: z
    .object({
      tipe: z.enum([
        'ppn',
        'pph21_ter',
        'pbb',
        'bphtb',
        'pph_badan',
        'pph_op',
        'pph22',
        'pph23',
        'pph_final',
      ]),
      judul: z.string(),
      keterangan: z.string().optional(),
    })
    .nullable()
    .optional(),
  mini_kuis: z.array(kuisSoalSchema).optional(),
  kesalahan_umum: z
    .array(
      z.object({
        salah: z.string(),
        benar: z.string(),
        tips: z.string().optional(),
      })
    )
    .optional(),
  istilah: z
    .array(
      z.object({
        kata: z.string(),
        definisi: z.string(),
        contoh: z.string().optional(),
      })
    )
    .optional(),
});

export const modulSchema = z.object({
  versi: z.string().optional(),
  modul: z.object({
    kode: z.string(),
    slug: z.string(),
    judul: z.string(),
    kategori: z.string().optional(),
    tingkat_kesulitan: z.enum(['pemula', 'menengah', 'lanjut']).optional(),
    estimasi_menit: z.number().int().positive().optional(),
    url_audio: z.string().url().nullable().optional(),
    ringkasan: z.string().optional(),
    tujuan_belajar: z.array(z.string()).optional(),
    bagian: z.array(bagianSchema).min(1),
    kuis_akhir: z
      .object({
        judul: z.string(),
        nilai_lulus: z.number().optional(),
        waktu_menit: z.number().optional(),
        soal: z.array(kuisSoalSchema).min(1),
      })
      .optional(),
    kuis_perhitungan: z
      .object({
        judul: z.string(),
        soal: z.array(kuisSoalSchema).min(1),
      })
      .optional(),
    glosarium: z
      .array(
        z.object({
          kata: z.string(),
          definisi: z.string(),
          penjelasan_sederhana: z.string().optional(),
        })
      )
      .optional(),
  }),
});

// ============================================================
// API INPUT VALIDATORS
// ============================================================

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
});

export const setupSchema = z.object({
  fullName: z.string().min(1, 'Nama tidak boleh kosong'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

export const createKeySchema = z.object({
  name: z.string().min(1, 'Nama kunci tidak boleh kosong').max(100),
  keyValue: z.string().min(10, 'Kunci API terlalu pendek'), // For cloudinary, this will be JSON stringified
  provider: z.enum(['gemini', 'elevenlabs', 'cloudinary']).default('gemini'),
});

export const updateKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  keyValue: z.string().min(10).optional(),
  status: z.enum(['active', 'error', 'disabled']).optional(),
});

export const importModuleSchema = z.object({
  jsonText: z.string().min(1, 'JSON tidak boleh kosong'),
  mode: z.enum(['baru', 'timpa']),
  targetId: z.string().uuid().optional(),
});

export const chatSchema = z.object({
  message: z.string().min(1, 'Pesan tidak boleh kosong').max(2000),
  module_slug: z.string().optional(),
  judul_bagian: z.string().optional(),
  riwayat: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .max(20)
    .optional(),
});

export const noteUpsertSchema = z.object({
  moduleId: z.string().uuid(),
  sectionId: z.string().optional(),
  content: z.string().min(1, 'Catatan tidak boleh kosong'),
});

export const bookmarkToggleSchema = z.object({
  moduleId: z.string().uuid(),
  sectionId: z.string().optional(),
});

export const progressUpdateSchema = z.object({
  moduleId: z.string().uuid(),
  sectionId: z.string().min(1),
  completed: z.boolean(),
});

export const profileUpdateSchema = z
  .object({
    fullName: z.string().min(1, 'Nama tidak boleh kosong').optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter').optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    {
      message: 'Password saat ini diperlukan untuk mengubah password',
      path: ['currentPassword'],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword !== data.confirmPassword)
        return false;
      return true;
    },
    {
      message: 'Konfirmasi password baru tidak cocok',
      path: ['confirmPassword'],
    }
  );

export const settingsUpdateSchema = z.object({
  fontSize: z.enum(['normal', 'besar']),
});

export const toggleProgressSchema = progressUpdateSchema;

export const userUpdateSchema = z.object({
  fullName: z.string().min(1, 'Nama tidak boleh kosong').optional(),
  email: z.string().email('Format email tidak valid').optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini diperlukan'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
});

