import { z } from 'zod';

export const createPositionSchema = z.object({
  unit_id: z.string().uuid({ message: 'Unit kerja tidak valid.' }),
  title: z
    .string()
    .trim()
    .min(3, { message: 'Judul jabatan minimal 3 karakter.' })
    .max(100, { message: 'Judul jabatan maksimal 100 karakter.' }),
  parent_position_id: z
    .string()
    .uuid({ message: 'Posisi atasan tidak valid.' })
    .optional()
    .nullable()
    .or(z.literal('')),
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>;

export const assignPersonnelSchema = z.object({
  position_id: z.string().uuid({ message: 'Jabatan tidak valid.' }),
  profile_id: z.string().uuid({ message: 'Personel profil tidak valid.' }),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal mulai harus YYYY-MM-DD.' }),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal selesai harus YYYY-MM-DD.' })
    .optional()
    .nullable()
    .or(z.literal('')),
});

export type AssignPersonnelInput = z.infer<typeof assignPersonnelSchema>;

export const addJobDescriptionSchema = z.object({
  position_id: z.string().uuid({ message: 'Jabatan tidak valid.' }),
  responsibility: z
    .string()
    .trim()
    .min(5, { message: 'Rincian tanggung jawab minimal 5 karakter.' })
    .max(1000, { message: 'Rincian tanggung jawab maksimal 1000 karakter.' }),
  performance_indicator: z
    .string()
    .trim()
    .max(500, { message: 'Indikator kinerja maksimal 500 karakter.' })
    .optional()
    .nullable()
    .or(z.literal('')),
});

export type AddJobDescriptionInput = z.infer<typeof addJobDescriptionSchema>;

