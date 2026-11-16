'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import {
  createSessionSchema,
  updateSessionSchema,
  cancelSessionSchema,
  bulkUpsertAttendanceSchema,
  type CreateSessionInput,
  type UpdateSessionInput,
  type CancelSessionInput,
  type BulkUpsertAttendanceInput,
} from './schemas';
import { revalidatePath } from 'next/cache';

export interface SessionActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
}

/**
 * 1. Server Action: Membuat Sesi Kelas Baru
 * - Wewenang: Pengguna dengan 'programs.manage' (Admin/Super Admin) ATAU 'sessions.manage_assigned' jika menjadi fasilitator
 * - Validasi: batch valid, nomor sesi unik dalam batch, tanggal valid
 */
export async function createSessionAction(
  prevState: SessionActionResult | null,
  formData: FormData
): Promise<SessionActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    const rawData = {
      batch_id: formData.get('batch_id'),
      session_number: formData.get('session_number'),
      title: formData.get('title'),
      description: formData.get('description'),
      starts_at: formData.get('starts_at'),
      ends_at: formData.get('ends_at'),
      meeting_url: formData.get('meeting_url'),
      facilitator_id: formData.get('facilitator_id'),
    };

    const parsed = createSessionSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi isian gagal. Periksa kembali form pembuatan sesi.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { batch_id, session_number, title, description, starts_at, ends_at, meeting_url, facilitator_id } =
      parsed.data;

    // Verifikasi Otorisasi Pengguna
    const isAdmin = user.roles.includes('super_admin') || user.permissions.includes('programs.manage');
    const isAssignedFacilitator =
      user.permissions.includes('sessions.manage_assigned') && facilitator_id === user.id;

    if (!isAdmin && !isAssignedFacilitator) {
      return {
        success: false,
        message: 'Akses Ditolak: Anda tidak memiliki wewenang untuk membuat sesi pertemuan pada batch ini.',
      };
    }

    const supabase = await createClient();

    // 1. Periksa keberadaan batch
    const { data: batch, error: batchErr } = await supabase
      .from('program_batches')
      .select('id, name, status')
      .eq('id', batch_id)
      .single();

    if (batchErr || !batch) {
      return { success: false, message: 'Batch program tidak ditemukan.' };
    }

    // 2. Cegah duplikasi session_number dalam batch
    const { data: existingSession } = await supabase
      .from('class_sessions')
      .select('id')
      .eq('batch_id', batch_id)
      .eq('session_number', session_number)
      .maybeSingle();

    if (existingSession) {
      return {
        success: false,
        message: `Sesi nomor ${session_number} sudah ada pada batch ini. Gunakan nomor sesi yang lain.`,
      };
    }

    // 3. Masukkan sesi baru
    const { data: newSession, error: insertErr } = await supabase
      .from('class_sessions')
      .insert({
        batch_id,
        session_number,
        title,
        description: description || null,
        starts_at,
        ends_at,
        meeting_url: meeting_url || null,
        facilitator_id: facilitator_id || null,
        status: 'scheduled',
      })
      .select('id, session_number, title')
      .single();

    if (insertErr || !newSession) {
      return { success: false, message: `Gagal menyimpan sesi kelas: ${insertErr?.message}` };
    }

    revalidatePath('/dashboard/sesi');
    revalidatePath(`/dashboard/program`);
    return {
      success: true,
      message: `Sesi ${newSession.session_number}: "${newSession.title}" berhasil dijadwalkan.`,
      data: newSession,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat membuat sesi.' };
  }
}

/**
 * 2. Server Action: Mengubah Jadwal / Informasi Sesi
 * - Fasilitator yang ditugaskan hanya boleh mengubah jika sesi BELUM berstatus 'completed'
 * - Admin dengan 'programs.manage' dapat mengubah sesi kapan saja
 */
export async function updateSessionAction(
  prevState: SessionActionResult | null,
  formData: FormData
): Promise<SessionActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    const rawData = {
      session_id: formData.get('session_id'),
      session_number: formData.get('session_number') || undefined,
      title: formData.get('title') || undefined,
      description: formData.get('description'),
      starts_at: formData.get('starts_at') || undefined,
      ends_at: formData.get('ends_at') || undefined,
      meeting_url: formData.get('meeting_url'),
      facilitator_id: formData.get('facilitator_id'),
      status: formData.get('status') || undefined,
    };

    const parsed = updateSessionSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi perubahan gagal.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { session_id, ...updates } = parsed.data;
    const supabase = await createClient();

    // 1. Ambil data sesi eksisting
    const { data: existing, error: fetchErr } = await supabase
      .from('class_sessions')
      .select('id, batch_id, session_number, facilitator_id, status')
      .eq('id', session_id)
      .single();

    if (fetchErr || !existing) {
      return { success: false, message: 'Sesi kelas tidak ditemukan.' };
    }

    // 2. Evaluasi Otorisasi
    const isAdmin = user.roles.includes('super_admin') || user.permissions.includes('programs.manage');
    const isAssignedFacilitator =
      user.permissions.includes('sessions.manage_assigned') && existing.facilitator_id === user.id;

    if (!isAdmin && !isAssignedFacilitator) {
      return {
        success: false,
        message: 'Akses Ditolak: Anda bukan fasilitator yang ditugaskan pada sesi ini.',
      };
    }

    // 3. Kebijakan Bisnis: Fasilitator tidak boleh mengubah sesi yang sudah berstatus 'completed'
    if (!isAdmin && existing.status === 'completed') {
      return {
        success: false,
        message: 'Sesi yang sudah berstatus [Selesai / Completed] hanya dapat diubah oleh Administrator.',
      };
    }

    // 4. Jika session_number diubah, periksa duplikasi
    if (updates.session_number && updates.session_number !== existing.session_number) {
      const { data: duplicate } = await supabase
        .from('class_sessions')
        .select('id')
        .eq('batch_id', existing.batch_id)
        .eq('session_number', updates.session_number)
        .neq('id', session_id)
        .maybeSingle();

      if (duplicate) {
        return {
          success: false,
          message: `Nomor sesi ${updates.session_number} sudah digunakan oleh sesi lain pada batch ini.`,
        };
      }
    }

    // 5. Eksekusi Update
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.session_number !== undefined) updatePayload.session_number = updates.session_number;
    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.description !== undefined) updatePayload.description = updates.description || null;
    if (updates.starts_at !== undefined) updatePayload.starts_at = updates.starts_at;
    if (updates.ends_at !== undefined) updatePayload.ends_at = updates.ends_at;
    if (updates.meeting_url !== undefined) updatePayload.meeting_url = updates.meeting_url || null;
    if (updates.facilitator_id !== undefined) updatePayload.facilitator_id = updates.facilitator_id || null;
    if (updates.status !== undefined) updatePayload.status = updates.status;

    const { error: updateErr } = await supabase.from('class_sessions').update(updatePayload).eq('id', session_id);

    if (updateErr) {
      return { success: false, message: `Gagal memperbarui sesi: ${updateErr.message}` };
    }

    revalidatePath('/dashboard/sesi');
    return {
      success: true,
      message: 'Informasi sesi pertemuan berhasil diperbarui.',
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat memperbarui sesi.' };
  }
}

/**
 * 3. Server Action: Membatalkan Sesi Pertemuan (Soft Cancel, status = 'cancelled')
 */
export async function cancelSessionAction(
  prevState: SessionActionResult | null,
  formData: FormData
): Promise<SessionActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    const rawData = {
      session_id: formData.get('session_id'),
      reason: formData.get('reason'),
    };

    const parsed = cancelSessionSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi pembatalan gagal.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { session_id, reason } = parsed.data;
    const supabase = await createClient();

    const { data: existing, error: fetchErr } = await supabase
      .from('class_sessions')
      .select('id, facilitator_id, status, title')
      .eq('id', session_id)
      .single();

    if (fetchErr || !existing) {
      return { success: false, message: 'Sesi tidak ditemukan.' };
    }

    const isAdmin = user.roles.includes('super_admin') || user.permissions.includes('programs.manage');
    const isAssignedFacilitator =
      user.permissions.includes('sessions.manage_assigned') && existing.facilitator_id === user.id;

    if (!isAdmin && !isAssignedFacilitator) {
      return { success: false, message: 'Akses Ditolak: Anda tidak berwenang membatalkan sesi ini.' };
    }

    // Update status menjadi cancelled
    const { error: cancelErr } = await supabase
      .from('class_sessions')
      .update({
        status: 'cancelled',
        description: existing.title + ` [DIBATALKAN: ${reason}]`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session_id);

    if (cancelErr) {
      return { success: false, message: `Gagal membatalkan sesi: ${cancelErr.message}` };
    }

    revalidatePath('/dashboard/sesi');
    return { success: true, message: 'Sesi pertemuan telah dibatalkan.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat membatalkan sesi.' };
  }
}

/**
 * 4. Server Action: Pencatatan Absensi Massal (Bulk Upsert Attendance)
 * - Memverifikasi izin: 'attendance.record_assigned' atau 'programs.manage'
 * - Memverifikasi bahwa peserta berstatus 'accepted' pada batch terkait
 * - Fasilitator hanya boleh mencatat/koreksi saat sesi belum 'completed'
 * - Admin dapat mengoreksi setelah 'completed' dengan alasan koreksi wajib
 * - Catat audit log jika terjadi perubahan status presensi (koreksi)
 * - Memanfaatkan UNIQUE (session_id, participant_id) untuk idempotent upsert
 */
export async function bulkUpsertAttendanceAction(input: BulkUpsertAttendanceInput): Promise<SessionActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    // 1. Validasi Schema Input
    const parsed = bulkUpsertAttendanceSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi data presensi gagal.',
        errors: parsed.error.flatten().fieldErrors as any,
      };
    }

    const { session_id, records, correction_reason } = parsed.data;
    const supabase = await createClient();

    // 2. Panggil RPC Database Atomik: bulk_upsert_attendance_atomic
    // Seluruh row-locking class_sessions, verifikasi wewenang fasilitator/admin,
    // pengecekan akun aktif, validasi registrasi accepted, UPSERT immutabilitas,
    // dan pencatatan audit_logs berjalan dalam satu transaksi database tunggal (all-or-nothing).
    const { data: rpcResult, error: rpcErr } = await supabase.rpc(
      'bulk_upsert_attendance_atomic',
      {
        p_session_id: session_id,
        p_records: records,
        p_correction_reason: correction_reason || null,
      }
    );

    if (rpcErr) {
      let friendlyMessage = rpcErr.message;
      if (rpcErr.message.includes('SESSION_COMPLETED')) {
        friendlyMessage = 'Sesi ini sudah berstatus [Completed]. Fasilitator dilarang mengubah presensi.';
      } else if (rpcErr.message.includes('REASON_REQUIRED')) {
        friendlyMessage = 'Koreksi presensi pada sesi yang sudah selesai wajib menyertakan alasan minimal 5 karakter.';
      } else if (rpcErr.message.includes('INVALID_PARTICIPANT')) {
        friendlyMessage = 'Terdapat peserta yang belum berstatus diterima (accepted) atau tidak terdaftar pada batch ini.';
      } else if (rpcErr.message.includes('DUPLICATE_PARTICIPANT_IN_PAYLOAD')) {
        friendlyMessage = 'Terdapat peserta duplikat dalam pengiriman presensi.';
      } else if (rpcErr.message.includes('Authorization Violation')) {
        friendlyMessage = 'Akses Ditolak: Anda tidak berwenang mencatat presensi sesi ini.';
      } else if (rpcErr.message.includes('Account Suspended')) {
        friendlyMessage = 'Akun Anda sedang ditangguhkan atau tidak aktif.';
      }

      return { success: false, message: friendlyMessage };
    }

    revalidatePath('/dashboard/sesi');
    revalidatePath(`/dashboard/sesi/${session_id}`);
    revalidatePath('/portal/program-saya');

    const savedCount = (rpcResult as any)?.saved_count || records.length;
    return {
      success: true,
      message: `Presensi ${savedCount} peserta berhasil dicatat secara atomik.`,
      data: rpcResult,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat menyimpan presensi.' };
  }
}

