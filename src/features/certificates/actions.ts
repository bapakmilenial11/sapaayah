'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';
import { issueCertificateSchema } from './schemas';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export interface CertificateActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
}

/**
 * Server Action: Menerbitkan Sertifikat Kelulusan Digital untuk Peserta
 * - Menghasilkan kode hash verifikasi unik (SHA-256)
 * - Wewenang: certificates.issue atau super_admin
 */
export async function issueCertificateAction(
  prevState: CertificateActionResult | null,
  formData: FormData
): Promise<CertificateActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    const canIssue =
      user.roles.includes('super_admin') ||
      user.permissions.includes('certificates.issue') ||
      user.permissions.includes('programs.manage');

    if (!canIssue) {
      return {
        success: false,
        message: 'Akses Ditolak: Anda tidak memiliki wewenang untuk menerbitkan sertifikat.',
      };
    }

    const rawData = {
      batch_id: formData.get('batch_id'),
      participant_id: formData.get('participant_id'),
      certificate_number: formData.get('certificate_number'),
    };

    const parsed = issueCertificateSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi data penerbitan sertifikat gagal.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { batch_id, participant_id, certificate_number } = parsed.data;
    const supabase = await createClient();

    // 1. Buat kode hash verifikasi unik anti-pemalsuan (SHA-256)
    const verificationPayload = `${certificate_number}:${batch_id}:${participant_id}:${Date.now()}`;
    const verificationHash = crypto.createHash('sha256').update(verificationPayload).digest('hex');

    // 2. Simpan sertifikat ke database
    const { data: cert, error } = await supabase
      .from('certificates')
      .insert({
        certificate_number,
        batch_id,
        participant_id,
        signed_by_profile_id: user.id,
        verification_hash: verificationHash,
        issued_at: new Date().toISOString().split('T')[0],
      })
      .select('id, certificate_number')
      .single();

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          message: 'Nomor sertifikat atau sertifikat untuk peserta ini sudah ada pada batch tersebut.',
        };
      }
      return { success: false, message: `Gagal menerbitkan sertifikat: ${error.message}` };
    }

    revalidatePath(`/dashboard/program`);
    revalidatePath(`/portal/program-saya/${batch_id}`);

    return {
      success: true,
      message: `Sertifikat ${cert.certificate_number} berhasil diterbitkan.`,
      data: cert,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat menerbitkan sertifikat.' };
  }
}

