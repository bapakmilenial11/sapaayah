'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';
import { createPositionSchema, assignPersonnelSchema, addJobDescriptionSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export interface OrgActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
}

/**
 * 1. Server Action: Membuat Posisi / Jabatan Struktural Baru
 */
export async function createPositionAction(
  prevState: OrgActionResult | null,
  formData: FormData
): Promise<OrgActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    const canManage =
      user.roles.includes('super_admin') ||
      user.roles.includes('ketua') ||
      user.permissions.includes('organization.manage') ||
      user.permissions.includes('positions.manage');

    if (!canManage) {
      return {
        success: false,
        message: 'Akses Ditolak: Anda tidak berwenang mengelola jabatan organisasi.',
      };
    }

    const rawData = {
      unit_id: formData.get('unit_id'),
      title: formData.get('title'),
      parent_position_id: formData.get('parent_position_id') || null,
    };

    const parsed = createPositionSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi posisi jabatan gagal.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { unit_id, title, parent_position_id } = parsed.data;
    const supabase = await createClient();

    const { data: newPos, error } = await supabase
      .from('positions')
      .insert({
        unit_id,
        title,
        parent_position_id: parent_position_id || null,
        is_active: true,
      })
      .select('id, title')
      .single();

    if (error) {
      return { success: false, message: `Gagal membuat jabatan: ${error.message}` };
    }

    revalidatePath('/dashboard/organisasi');
    return {
      success: true,
      message: `Jabatan "${newPos.title}" berhasil ditambahkan ke struktur organisasi.`,
      data: newPos,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat membuat jabatan.' };
  }
}

/**
 * 2. Server Action: Menugaskan Personel ke Jabatan Struktural
 */
export async function assignPersonnelAction(
  prevState: OrgActionResult | null,
  formData: FormData
): Promise<OrgActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    const canAssign =
      user.roles.includes('super_admin') ||
      user.roles.includes('ketua') ||
      user.permissions.includes('personnel.assign');

    if (!canAssign) {
      return {
        success: false,
        message: 'Akses Ditolak: Anda tidak berwenang menugaskan personel organisasi.',
      };
    }

    const rawData = {
      position_id: formData.get('position_id'),
      profile_id: formData.get('profile_id'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date') || null,
    };

    const parsed = assignPersonnelSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi penugasan personel gagal.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { position_id, profile_id, start_date, end_date } = parsed.data;
    const supabase = await createClient();

    const { data: assignment, error } = await supabase
      .from('personnel_assignments')
      .insert({
        position_id,
        profile_id,
        start_date,
        end_date: end_date || null,
        assignment_status: 'active',
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, message: `Gagal menugaskan personel: ${error.message}` };
    }

    revalidatePath('/dashboard/organisasi');
    return {
      success: true,
      message: 'Personel berhasil ditugaskan pada jabatan tersebut.',
      data: assignment,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat menugaskan personel.' };
  }
}

/**
 * 3. Server Action: Menambahkan Rincian Jobdesk / Tanggung Jawab Jabatan
 */
export async function addJobDescriptionAction(
  prevState: OrgActionResult | null,
  formData: FormData
): Promise<OrgActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    const canManage =
      user.roles.includes('super_admin') ||
      user.roles.includes('ketua') ||
      user.permissions.includes('organization.manage') ||
      user.permissions.includes('positions.manage');

    if (!canManage) {
      return {
        success: false,
        message: 'Akses Ditolak: Anda tidak berwenang menambahkan jobdesk.',
      };
    }

    const rawData = {
      position_id: formData.get('position_id'),
      responsibility: formData.get('responsibility'),
      performance_indicator: formData.get('performance_indicator') || null,
    };

    const parsed = addJobDescriptionSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi jobdesk gagal.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { position_id, responsibility, performance_indicator } = parsed.data;
    const supabase = await createClient();

    const { data: jobdesc, error } = await supabase
      .from('job_descriptions')
      .insert({
        position_id,
        responsibility,
        performance_indicator: performance_indicator || null,
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, message: `Gagal menambahkan jobdesk: ${error.message}` };
    }

    revalidatePath('/dashboard/organisasi');
    return {
      success: true,
      message: 'Butir tanggung jawab jobdesk berhasil ditambahkan.',
      data: jobdesc,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat menambahkan jobdesk.' };
  }
}

