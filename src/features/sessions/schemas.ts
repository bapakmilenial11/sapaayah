import { z } from 'zod';

/**
 * Nilai status sesi yang didukung oleh database CHECK constraint:
 * 'scheduled', 'in_progress', 'completed', 'cancelled'
 */
export const sessionStatusEnum = z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']);
export type SessionStatus = z.infer<typeof sessionStatusEnum>;

/**
 * Nilai status kehadiran yang didukung oleh database CHECK constraint:
 * 'present', 'absent', 'excused', 'late'
 */
export const attendanceStatusEnum = z.enum(['present', 'absent', 'excused', 'late']);
export type AttendanceStatus = z.infer<typeof attendanceStatusEnum>;

/**
 * Schema pembuatan sesi baru (createSessionAction)
 */
export const createSessionSchema = z
  .object({
    batch_id: z.string().uuid({ message: 'ID Batch tidak valid.' }),
    session_number: z.coerce
      .number({ invalid_type_error: 'Nomor sesi harus berupa angka.' })
      .int({ message: 'Nomor sesi harus berupa bilangan bulat.' })
      .positive({ message: 'Nomor sesi harus bernilai positif (minimal 1).' }),
    title: z
      .string()
      .trim()
      .min(3, { message: 'Judul sesi minimal 3 karakter.' })
      .max(200, { message: 'Judul sesi maksimal 200 karakter.' }),
    description: z.string().trim().max(2000, { message: 'Deskripsi maksimal 2000 karakter.' }).optional().nullable(),
    starts_at: z.string().datetime({ message: 'Format waktu mulai sesi tidak valid (ISO 8601).' }),
    ends_at: z.string().datetime({ message: 'Format waktu selesai sesi tidak valid (ISO 8601).' }),
    meeting_url: z
      .string()
      .trim()
      .url({ message: 'Tautan pertemuan harus berupa URL valid (contoh: https://zoom.us/j/...)' })
      .optional()
      .nullable()
      .or(z.literal('')),
    facilitator_id: z.string().uuid({ message: 'ID Fasilitator tidak valid.' }).optional().nullable().or(z.literal('')),
  })
  .refine((data) => new Date(data.ends_at) > new Date(data.starts_at), {
    message: 'Waktu selesai sesi harus lebih lambat dari waktu mulai sesi.',
    path: ['ends_at'],
  });

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

/**
 * Schema pengubahan sesi (updateSessionAction)
 */
export const updateSessionSchema = z
  .object({
    session_id: z.string().uuid({ message: 'ID Sesi tidak valid.' }),
    session_number: z.coerce
      .number({ invalid_type_error: 'Nomor sesi harus berupa angka.' })
      .int()
      .positive({ message: 'Nomor sesi harus bernilai positif.' })
      .optional(),
    title: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().max(2000).optional().nullable(),
    starts_at: z.string().datetime().optional(),
    ends_at: z.string().datetime().optional(),
    meeting_url: z.string().trim().url().optional().nullable().or(z.literal('')),
    facilitator_id: z.string().uuid().optional().nullable().or(z.literal('')),
    status: sessionStatusEnum.optional(),
  })
  .refine(
    (data) => {
      if (data.starts_at && data.ends_at) {
        return new Date(data.ends_at) > new Date(data.starts_at);
      }
      return true;
    },
    {
      message: 'Waktu selesai sesi harus lebih lambat dari waktu mulai sesi.',
      path: ['ends_at'],
    }
  );

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

/**
 * Schema pembatalan sesi (cancelSessionAction)
 */
export const cancelSessionSchema = z.object({
  session_id: z.string().uuid({ message: 'ID Sesi tidak valid.' }),
  reason: z
    .string()
    .trim()
    .min(5, { message: 'Alasan pembatalan sesi wajib diisi minimal 5 karakter.' })
    .max(500, { message: 'Alasan pembatalan maksimal 500 karakter.' }),
});

export type CancelSessionInput = z.infer<typeof cancelSessionSchema>;

/**
 * Item tunggal dalam payload absensi massal
 */
export const singleAttendanceItemSchema = z.object({
  participant_id: z.string().uuid({ message: 'ID Peserta tidak valid.' }),
  attendance_status: attendanceStatusEnum,
  notes: z.string().trim().max(500, { message: 'Catatan presensi maksimal 500 karakter.' }).optional().default(''),
});

export type SingleAttendanceItem = z.infer<typeof singleAttendanceItemSchema>;

/**
 * Schema pencatatan absensi massal (bulkUpsertAttendanceAction)
 */
export const bulkUpsertAttendanceSchema = z
  .object({
    session_id: z.string().uuid({ message: 'ID Sesi tidak valid.' }),
    records: z
      .array(singleAttendanceItemSchema)
      .min(1, { message: 'Daftar presensi tidak boleh kosong.' })
      .max(200, { message: 'Maksimal 200 data presensi per pengiriman.' }),
    correction_reason: z
      .string()
      .trim()
      .max(500, { message: 'Alasan koreksi maksimal 500 karakter.' })
      .optional()
      .default(''),
  })
  .superRefine((data, ctx) => {
    // Validasi pencegahan duplikasi participant_id dalam satu payload pengiriman
    const seenParticipants = new Set<string>();
    data.records.forEach((rec, idx) => {
      if (seenParticipants.has(rec.participant_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Peserta dengan ID ${rec.participant_id} muncul lebih dari satu kali dalam payload.`,
          path: ['records', idx, 'participant_id'],
        });
      }
      seenParticipants.add(rec.participant_id);
    });
  });

export type BulkUpsertAttendanceInput = z.infer<typeof bulkUpsertAttendanceSchema>;

