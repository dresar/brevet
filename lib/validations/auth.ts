import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Format email tidak valid').min(5, 'Email terlalu pendek').max(100),
  password: z.string().min(6, 'Password minimal 6 karakter').max(100),
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
});

export const updateUserProfileSchema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter').max(100).optional(),
});
