import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(6, 'Kata sandi minimal 6 karakter'),
  redirectTo: z
    .string()
    .optional(),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Nama lengkap minimal 3 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  phone: z
    .string()
    .min(9, 'Nomor WhatsApp minimal 9 digit')
    .max(16, 'Nomor WhatsApp maksimal 16 digit')
    .regex(/^(\+62|62|08)[0-9]{8,14}$/, 'Format nomor WhatsApp harus dimulai 08, 62, atau +62'),
  password: z
    .string()
    .min(8, 'Kata sandi minimal 8 karakter'),
  confirmPassword: z
    .string()
    .min(8, 'Konfirmasi kata sandi minimal 8 karakter'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi kata sandi tidak cocok',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
});

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Kata sandi minimal 8 karakter'),
  confirmPassword: z
    .string()
    .min(8, 'Konfirmasi kata sandi minimal 8 karakter'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi kata sandi baru tidak cocok',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
