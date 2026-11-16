'use server';

import { createClient } from '@/lib/supabase/server';
import { assertPermission } from '@/lib/permissions/guard';
import { programSchema, batchSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export interface ActionResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
}

/**
 * Buat Program Baru
 */
export async function createProgramAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    // 1. Verifikasi wewenang server-side (RBAC)
    const user = await assertPermission('programs.manage');

    // 2. Parse & Validasi
    const rawData = Object.fromEntries(formData.entries());
    const parsed = programSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi form gagal. Periksa kembali isian Anda.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('programs')
      .insert({
        name: parsed.data.name,
        slug: parsed.data.slug,
        tagline: parsed.data.tagline || null,
        description: parsed.data.description || null,
        program_type: parsed.data.program_type,
        visibility: parsed.data.visibility,
      })
      .select('id, slug')
      .single();

    if (error) {
      return {
        success: false,
        message: error.message.includes('unique')
          ? 'Slug program sudah digunakan. Gunakan slug lain.'
          : error.message,
      };
    }

    revalidatePath('/dashboard/program');
    return {
      success: true,
      message: 'Program berhasil dibuat.',
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Terjadi kesalahan sistem.',
    };
  }
}

/**
 * Update Program
 */
export async function updateProgramAction(
  programId: string,
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    await assertPermission('programs.manage');

    const rawData = Object.fromEntries(formData.entries());
    const parsed = programSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi form gagal.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('programs')
      .update({
        name: parsed.data.name,
        slug: parsed.data.slug,
        tagline: parsed.data.tagline || null,
        description: parsed.data.description || null,
        program_type: parsed.data.program_type,
        visibility: parsed.data.visibility,
        updated_at: new Date().toISOString(),
      })
      .eq('id', programId);

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath('/dashboard/program');
    revalidatePath(`/dashboard/program/${programId}`);
    return {
      success: true,
      message: 'Program berhasil diperbarui.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Terjadi kesalahan sistem.',
    };
  }
}

/**
 * Arsipkan Program (Soft-archive)
 */
export async function archiveProgramAction(programId: string): Promise<ActionResponse> {
  try {
    const user = await assertPermission('programs.manage');
    const supabase = await createClient();

    const { error } = await supabase
      .from('programs')
      .update({
        is_archived: true,
        archived_at: new Date().toISOString(),
        archived_by: user.id,
        visibility: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', programId);

    if (error) throw error;

    revalidatePath('/dashboard/program');
    return {
      success: true,
      message: 'Program berhasil diarsipkan.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Gagal mengarsipkan program.',
    };
  }
}

/**
 * Buat Batch Baru
 */
export async function createBatchAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    await assertPermission('batches.manage');

    const rawData = Object.fromEntries(formData.entries());
    const parsed = batchSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi data batch gagal.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('program_batches')
      .insert({
        program_id: parsed.data.program_id,
        batch_number: parsed.data.batch_number,
        name: parsed.data.name,
        slug: parsed.data.slug,
        registration_open_at: new Date(parsed.data.registration_open_at).toISOString(),
        registration_close_at: new Date(parsed.data.registration_close_at).toISOString(),
        start_at: new Date(parsed.data.start_at).toISOString(),
        end_at: new Date(parsed.data.end_at).toISOString(),
        price: parsed.data.price,
        capacity: parsed.data.capacity,
        status: parsed.data.status,
      })
      .select('id, slug, program_id')
      .single();

    if (error) {
      return {
        success: false,
        message: error.message.includes('unique')
          ? 'Slug batch sudah digunakan.'
          : error.message,
      };
    }

    revalidatePath(`/dashboard/program/${parsed.data.program_id}`);
    revalidatePath('/dashboard/program');
    return {
      success: true,
      message: 'Batch pendaftaran berhasil dibuat.',
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Terjadi kesalahan sistem.',
    };
  }
}

/**
 * Update Batch
 */
export async function updateBatchAction(
  batchId: string,
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    await assertPermission('batches.manage');

    const rawData = Object.fromEntries(formData.entries());
    const parsed = batchSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi data batch gagal.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('program_batches')
      .update({
        batch_number: parsed.data.batch_number,
        name: parsed.data.name,
        slug: parsed.data.slug,
        registration_open_at: new Date(parsed.data.registration_open_at).toISOString(),
        registration_close_at: new Date(parsed.data.registration_close_at).toISOString(),
        start_at: new Date(parsed.data.start_at).toISOString(),
        end_at: new Date(parsed.data.end_at).toISOString(),
        price: parsed.data.price,
        capacity: parsed.data.capacity,
        status: parsed.data.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', batchId);

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath(`/dashboard/program/${parsed.data.program_id}`);
    revalidatePath('/dashboard/program');
    return {
      success: true,
      message: 'Batch berhasil diperbarui.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Terjadi kesalahan sistem.',
    };
  }
}

