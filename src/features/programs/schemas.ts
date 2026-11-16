import { z } from 'zod';

export const programTypeEnum = z.enum([
  'journey',
  'class',
  'webinar',
  'camp',
  'talk',
  'stories',
]);

export const programVisibilityEnum = z.enum([
  'draft',
  'published',
  'archived',
]);

export const batchStatusEnum = z.enum([
  'draft',
  'open',
  'in_progress',
  'completed',
  'cancelled',
]);

export const programSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama program minimal 3 karakter')
    .max(150, 'Nama program maksimal 150 karakter'),
  slug: z
    .string()
    .min(3, 'Slug program minimal 3 karakter')
    .max(150, 'Slug program maksimal 150 karakter')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung (-)'),
  tagline: z
    .string()
    .max(255, 'Tagline maksimal 255 karakter')
    .optional()
    .nullable(),
  description: z
    .string()
    .optional()
    .nullable(),
  program_type: programTypeEnum,
  visibility: programVisibilityEnum.default('draft'),
});

export const batchSchema = z
  .object({
    program_id: z.string().uuid('ID Program tidak valid'),
    batch_number: z.coerce.number().int().positive('Nomor batch harus angka positif'),
    name: z
      .string()
      .min(3, 'Nama batch minimal 3 karakter')
      .max(150, 'Nama batch maksimal 150 karakter'),
    slug: z
      .string()
      .min(3, 'Slug batch minimal 3 karakter')
      .max(150, 'Slug batch maksimal 150 karakter')
      .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung (-)'),
    registration_open_at: z.string().min(1, 'Jadwal pembukaan pendaftaran wajib diisi'),
    registration_close_at: z.string().min(1, 'Jadwal penutupan pendaftaran wajib diisi'),
    start_at: z.string().min(1, 'Jadwal mulai program wajib diisi'),
    end_at: z.string().min(1, 'Jadwal selesai program wajib diisi'),
    price: z.coerce.number().min(0, 'Biaya tidak boleh negatif').default(0),
    capacity: z.coerce.number().int().positive('Kapasitas minimal 1 peserta').default(50),
    status: batchStatusEnum.default('draft'),
  })
  .refine(
    (data) => new Date(data.registration_close_at) > new Date(data.registration_open_at),
    {
      message: 'Jadwal penutupan pendaftaran harus setelah jadwal pembukaan',
      path: ['registration_close_at'],
    }
  )
  .refine(
    (data) => new Date(data.start_at) >= new Date(data.registration_close_at),
    {
      message: 'Jadwal pelaksanaan program harus setelah/sama dengan pendaftaran ditutup',
      path: ['start_at'],
    }
  )
  .refine(
    (data) => new Date(data.end_at) >= new Date(data.start_at),
    {
      message: 'Jadwal selesai program harus setelah/sama dengan jadwal mulai',
      path: ['end_at'],
    }
  );

export type ProgramInput = z.infer<typeof programSchema>;
export type BatchInput = z.infer<typeof batchSchema>;

