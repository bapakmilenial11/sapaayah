import { z } from 'zod';

export const issueCertificateSchema = z.object({
  batch_id: z.string().uuid({ message: 'ID Batch tidak valid.' }),
  participant_id: z.string().uuid({ message: 'ID Peserta tidak valid.' }),
  certificate_number: z
    .string()
    .trim()
    .min(5, { message: 'Nomor sertifikat minimal 5 karakter.' })
    .max(100, { message: 'Nomor sertifikat maksimal 100 karakter.' }),
});

export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;

