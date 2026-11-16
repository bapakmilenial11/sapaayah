import { z } from 'zod';

export const createMaterialSchema = z.object({
  batch_id: z.string().uuid({ message: 'ID Batch tidak valid.' }),
  session_id: z.string().uuid({ message: 'ID Sesi tidak valid.' }).optional().nullable().or(z.literal('')),
  title: z
    .string()
    .trim()
    .min(3, { message: 'Judul materi minimal 3 karakter.' })
    .max(200, { message: 'Judul materi maksimal 200 karakter.' }),
  description: z.string().trim().max(1000).optional().nullable().or(z.literal('')),
  file_storage_path: z.string().min(1, { message: 'File materi wajib diunggah.' }),
  file_type: z.string().optional().nullable(),
  file_size_bytes: z.coerce.number().optional().nullable(),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;

