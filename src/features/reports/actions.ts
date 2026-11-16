'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';
import { submitFridayReportSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export interface ReportActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
}

/**
 * Server Action: Menyimpan / Memperbarui Laporan Jumat Tiga Baris
 * - Wewenang: Pengguna terautentikasi (staf internal) dengan izin 'weekly_reports.submit'
 * - Idempotent: Menggunakan UPSERT ON CONFLICT(profile_id, week_date)
 */
export async function submitFridayReportAction(
  prevState: ReportActionResult | null,
  formData: FormData
): Promise<ReportActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    const hasPermission =
      user.roles.includes('super_admin') ||
      user.permissions.includes('weekly_reports.submit');

    if (!hasPermission) {
      return {
        success: false,
        message: 'Akses Ditolak: Anda tidak memiliki wewenang untuk mengisi Laporan Jumat.',
      };
    }

    const rawData = {
      week_date: formData.get('week_date'),
      completed_work: formData.get('completed_work'),
      upcoming_plan: formData.get('upcoming_plan'),
      blockers: formData.get('blockers'),
    };

    const parsed = submitFridayReportSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi isian laporan gagal. Mohon lengkapi seluruh field.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { week_date, completed_work, upcoming_plan, blockers } = parsed.data;
    const supabase = await createClient();

    // Idempotent UPSERT ke weekly_reports (berdasarkan UNIQUE(profile_id, week_date))
    const { data: report, error } = await supabase
      .from('weekly_reports')
      .upsert(
        {
          profile_id: user.id,
          week_date,
          completed_work,
          upcoming_plan,
          blockers,
          submitted_at: new Date().toISOString(),
        },
        {
          onConflict: 'profile_id,week_date',
        }
      )
      .select('id, week_date')
      .single();

    if (error) {
      return { success: false, message: `Gagal menyimpan laporan Jumat: ${error.message}` };
    }

    revalidatePath('/dashboard/laporan-jumat');
    return {
      success: true,
      message: `Laporan Jumat untuk pekan ${week_date} berhasil disimpan.`,
      data: report,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat menyimpan laporan.' };
  }
}

