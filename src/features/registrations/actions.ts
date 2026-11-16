'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import {
  participantRegistrationSchema,
  updateRegistrationStatusSchema,
} from './schemas';
import { revalidatePath } from 'next/cache';

export interface RegistrationActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  registrationId?: string;
}

/**
 * Server Action: Pendaftaran Mandiri Peserta (Self-Service)
 * Menggunakan Database RPC register_participant_atomic jika tersedia,
 * atau Server-Side Transactional Check dengan fallback.
 */
export async function registerParticipantAction(
  prevState: RegistrationActionResult | null,
  formData: FormData
): Promise<RegistrationActionResult> {
  try {
    // 1. Verifikasi user terautentikasi
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: 'Silakan masuk (login) terlebih dahulu untuk mendaftar kelas.',
      };
    }

    // 2. Parse & Validasi Zod
    const rawData = Object.fromEntries(formData.entries());
    const parsed = participantRegistrationSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi isian gagal. Periksa kembali form pendaftaran.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const {
      batch_id,
      full_name,
      email,
      phone,
      city,
      marital_status,
      number_of_children,
      notes,
    } = parsed.data;

    const supabase = await createClient();

    // 3. Coba eksekusi via RPC Atomik register_participant_atomic
    const { data: rpcData, error: rpcErr } = await supabase.rpc(
      'register_participant_atomic',
      {
        p_batch_id: batch_id,
        p_full_name: full_name,
        p_email: email,
        p_phone: phone,
        p_city: city,
        p_marital_status: marital_status,
        p_number_of_children: number_of_children,
        p_notes: notes || '',
        p_source: 'web_self_service',
      }
    );

    if (!rpcErr && rpcData?.success) {
      revalidatePath('/portal');
      revalidatePath('/dashboard/peserta');
      return {
        success: true,
        message: 'Pendaftaran berhasil dikirim! Silakan ikuti petunjuk selanjutnya di Portal Peserta.',
        registrationId: rpcData.registration_id,
      };
    }

    // Jika RPC error karena validasi bisnis (kapasitas penuh, duplikat, dsb)
    if (rpcErr && !rpcErr.message.includes('Could not find the function')) {
      return {
        success: false,
        message: rpcErr.message.replace(/^[A-Z_]+:\s*/, ''),
      };
    }

    // 4. Fallback jika migration 00012 belum dieksekusi di database
    // Validasi Batch di Server (Status, Tanggal, dan Kuota)
    const { data: batch, error: batchErr } = await supabase
      .from('program_batches')
      .select('id, name, status, capacity, registration_open_at, registration_close_at, is_archived')
      .eq('id', batch_id)
      .single();

    if (batchErr || !batch || batch.is_archived) {
      return {
        success: false,
        message: 'Batch program yang dipilih tidak ditemukan atau telah diarsipkan.',
      };
    }

    if (batch.status !== 'open') {
      return {
        success: false,
        message: `Pendaftaran untuk batch ini saat ini berstatus [${batch.status}], tidak menerima pendaftaran baru.`,
      };
    }

    const now = new Date();
    const openAt = new Date(batch.registration_open_at);
    const closeAt = new Date(batch.registration_close_at);

    if (now < openAt) {
      return {
        success: false,
        message: 'Pendaftaran untuk batch ini belum dibuka.',
      };
    }

    if (now > closeAt) {
      return {
        success: false,
        message: 'Masa pendaftaran untuk batch ini telah berakhir.',
      };
    }

    // Periksa Kuota Terisi
    const { count: registeredCount } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('batch_id', batch_id)
      .in('status', ['submitted', 'under_review', 'accepted']);

    if (registeredCount !== null && registeredCount >= batch.capacity) {
      return {
        success: false,
        message: 'Mohon maaf, kuota peserta untuk batch ini telah penuh.',
      };
    }

    // Deduplikasi Peserta
    let participantId: string;

    const { data: existingParticipant } = await supabase
      .from('participants')
      .select('id')
      .or(`profile_id.eq.${user.id},email.eq.${email.toLowerCase().trim()}`)
      .limit(1)
      .maybeSingle();

    if (existingParticipant) {
      participantId = existingParticipant.id;
      await supabase
        .from('participants')
        .update({
          full_name,
          city,
          marital_status,
          number_of_children,
          profile_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', participantId);
    } else {
      const { data: newParticipant, error: partErr } = await supabase
        .from('participants')
        .insert({
          profile_id: user.id,
          full_name,
          normalized_name: full_name.toUpperCase().trim(),
          email: email.toLowerCase().trim(),
          phone,
          city,
          marital_status,
          number_of_children,
        })
        .select('id')
        .single();

      if (partErr || !newParticipant) {
        return {
          success: false,
          message: `Gagal menyimpan data peserta: ${partErr?.message || 'Error'}`,
        };
      }
      participantId = newParticipant.id;
    }

    // Cegah Pendaftaran Ganda
    const { data: duplicateReg } = await supabase
      .from('registrations')
      .select('id, status')
      .eq('participant_id', participantId)
      .eq('batch_id', batch_id)
      .maybeSingle();

    if (duplicateReg) {
      return {
        success: false,
        message: `Anda sudah pernah mendaftar pada batch ini (Status: ${duplicateReg.status}).`,
        registrationId: duplicateReg.id,
      };
    }

    // Simpan Pendaftaran Baru
    const { data: regData, error: regErr } = await supabase
      .from('registrations')
      .insert({
        participant_id: participantId,
        batch_id,
        registration_source: 'web_self_service',
        status: 'submitted',
        notes: notes || null,
      })
      .select('id')
      .single();

    if (regErr || !regData) {
      return {
        success: false,
        message: `Gagal membuat pendaftaran: ${regErr?.message || 'Error'}`,
      };
    }

    revalidatePath('/portal');
    revalidatePath('/dashboard/peserta');
    return {
      success: true,
      message: 'Pendaftaran berhasil dikirim! Silakan ikuti petunjuk selanjutnya di Portal Peserta.',
      registrationId: regData.id,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Terjadi kesalahan sistem saat memproses pendaftaran.',
    };
  }
}

/**
 * Server Action: Update Status Pendaftaran oleh Admin Peserta
 */
export async function updateRegistrationStatusAction(
  prevState: RegistrationActionResult | null,
  formData: FormData
): Promise<RegistrationActionResult> {
  try {
    const admin = await assertPermission('registrations.manage');

    const rawData = Object.fromEntries(formData.entries());
    const parsed = updateRegistrationStatusSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        message: 'Data status tidak valid.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { registration_id, status, notes } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from('registrations')
      .update({
        status,
        notes: notes || null,
        reviewed_by: admin.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', registration_id);

    if (error) {
      return {
        success: false,
        message: `Gagal mengubah status pendaftaran: ${error.message}`,
      };
    }

    revalidatePath('/dashboard/peserta');
    revalidatePath('/portal');
    return {
      success: true,
      message: `Status pendaftaran berhasil diperbarui menjadi [${status}].`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Wewenang tidak cukup.',
    };
  }
}
