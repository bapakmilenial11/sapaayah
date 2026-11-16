import { z } from 'zod';

export const submitFridayReportSchema = z.object({
  week_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal pekan harus YYYY-MM-DD.' }),
  completed_work: z
    .string()
    .trim()
    .min(5, { message: 'Field "Sudah apa" wajib diisi minimal 5 karakter.' })
    .max(2000, { message: 'Field "Sudah apa" maksimal 2000 karakter.' }),
  upcoming_plan: z
    .string()
    .trim()
    .min(5, { message: 'Field "Akan apa" wajib diisi minimal 5 karakter.' })
    .max(2000, { message: 'Field "Akan apa" maksimal 2000 karakter.' }),
  blockers: z
    .string()
    .trim()
    .min(3, { message: 'Field "Kendalanya apa" wajib diisi minimal 3 karakter (tulis "Tidak ada kendala" jika lancar).' })
    .max(2000, { message: 'Field "Kendalanya apa" maksimal 2000 karakter.' }),
});

export type SubmitFridayReportInput = z.infer<typeof submitFridayReportSchema>;

