import { z } from 'zod';

export const paymentStatusEnum = z.enum([
  'pending',
  'submitted',
  'under_review',
  'verified',
  'rejected',
]);

export const verificationDecisionEnum = z.enum([
  'verified',
  'rejected',
]);

// 1. Skema Unggah Bukti Bayar oleh Peserta
export const submitPaymentProofSchema = z.object({
  payment_id: z.string().uuid('ID Pembayaran tidak valid'),
  amount_transferred: z.coerce
    .number()
    .positive('Nominal transfer harus lebih besar dari 0'),
  sender_bank_name: z
    .string()
    .min(2, 'Nama bank pengirim minimal 2 karakter')
    .max(50, 'Nama bank pengirim maksimal 50 karakter'),
  sender_account_name: z
    .string()
    .min(2, 'Nama pemilik rekening pengirim minimal 2 karakter')
    .max(150, 'Nama pemilik rekening pengirim maksimal 150 karakter'),
});

// 2. Skema Verifikasi Bukti Pembayaran oleh Bendahara
export const verifyPaymentSchema = z
  .object({
    submission_id: z.string().uuid('ID Bukti Transfer tidak valid'),
    decision: verificationDecisionEnum,
    notes: z.string().max(500, 'Catatan maksimal 500 karakter').default(''),
  })
  .refine(
    (data) => {
      // Jika keputusan ditolak (rejected), catatan wajib diisi agar peserta tahu alasannya
      if (data.decision === 'rejected') {
        return data.notes.trim().length >= 5;
      }
      return true;
    },
    {
      message: 'Catatan alasan penolakan wajib diisi (minimal 5 karakter) jika bukti transfer ditolak.',
      path: ['notes'],
    }
  );

export type SubmitPaymentProofInput = z.infer<typeof submitPaymentProofSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

