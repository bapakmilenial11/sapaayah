import { z } from 'zod';

export const maritalStatusEnum = z.enum([
  'married_with_children',
  'married_no_children',
  'engaged',
  'single',
]);

export const registrationStatusEnum = z.enum([
  'draft',
  'submitted',
  'under_review',
  'accepted',
  'waitlisted',
  'cancelled',
]);

export const registrationSourceEnum = z.enum([
  'web_self_service',
  'admin_manual',
  'whatsapp_offline',
]);

export const participantRegistrationSchema = z.object({
  batch_id: z.string().uuid('ID Angkatan (Batch) tidak valid'),
  full_name: z
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
    .regex(/^(\+62|62|08)[0-9]{8,14}$/, 'Format nomor WhatsApp harus diawali 08, 62, atau +62'),
  city: z
    .string()
    .min(2, 'Kota/kabupaten domisili wajib diisi')
    .max(100, 'Nama kota maksimal 100 karakter'),
  marital_status: maritalStatusEnum,
  number_of_children: z.coerce
    .number()
    .int('Jumlah anak harus angka bulat')
    .min(0, 'Jumlah anak tidak boleh negatif')
    .default(0),
  notes: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
    .nullable(),
});

export const updateRegistrationStatusSchema = z.object({
  registration_id: z.string().uuid('ID Registrasi tidak valid'),
  status: registrationStatusEnum,
  notes: z.string().optional().nullable(),
});

export type ParticipantRegistrationInput = z.infer<typeof participantRegistrationSchema>;
export type UpdateRegistrationStatusInput = z.infer<typeof updateRegistrationStatusSchema>;

