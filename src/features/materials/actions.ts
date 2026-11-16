'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';
import { createMaterialSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export interface MaterialActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
}

/**
 * Server Action: Mengunggah Berkas Materi Ajar
 * - File disimpan di private bucket 'private-learning-materials'
 * - Wewenang: materials.manage_assigned atau programs.manage
 */
export async function uploadMaterialAction(
  prevState: MaterialActionResult | null,
  formData: FormData
): Promise<MaterialActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    const canUpload =
      user.roles.includes('super_admin') ||
      user.permissions.includes('programs.manage') ||
      user.permissions.includes('materials.manage_assigned');

    if (!canUpload) {
      return {
        success: false,
        message: 'Akses Ditolak: Anda tidak memiliki wewenang untuk mengunggah materi pembelajaran.',
      };
    }

    const batch_id = formData.get('batch_id') as string;
    const session_id = (formData.get('session_id') as string) || null;
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || null;
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return { success: false, message: 'Berkas materi pembelajaran wajib dipilih.' };
    }

    // Batas maksimal 25 MB
    const maxSizeBytes = 25 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { success: false, message: 'Ukuran berkas materi maksimal 25 MB.' };
    }

    const supabase = await createClient();

    // 1. Upload berkas ke private storage bucket
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${batch_id}/${Date.now()}_${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('private-learning-materials')
      .upload(storagePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, message: `Gagal mengunggah berkas ke storage: ${uploadError.message}` };
    }

    // 2. Insert record ke tabel learning_materials
    const { data: record, error: dbError } = await supabase
      .from('learning_materials')
      .insert({
        batch_id,
        session_id: session_id || null,
        title,
        description,
        file_storage_path: storagePath,
        file_type: fileExt,
        file_size_bytes: file.size,
        uploaded_by: user.id,
      })
      .select('id, title')
      .single();

    if (dbError) {
      return { success: false, message: `Gagal menyimpan data materi: ${dbError.message}` };
    }

    if (session_id) {
      revalidatePath(`/dashboard/sesi/${session_id}`);
    }
    revalidatePath(`/portal/program-saya/${batch_id}`);

    return {
      success: true,
      message: `Materi "${record.title}" berhasil diunggah.`,
      data: record,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat mengunggah materi.' };
  }
}

/**
 * Server Action: Mendapatkan Signed URL untuk unduhan berkas privat
 * Berlaku 15 menit (900 detik).
 */
export async function getMaterialDownloadUrlAction(materialId: string): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Silakan login terlebih dahulu.' };
    }

    const supabase = await createClient();

    // Ambil detail materi
    const { data: material } = await supabase
      .from('learning_materials')
      .select('id, batch_id, file_storage_path')
      .eq('id', materialId)
      .single();

    if (!material) {
      return { success: false, message: 'Berkas materi tidak ditemukan.' };
    }

    // Verifikasi otorisasi: Admin atau Peserta Accepted
    const isAdmin = user.roles.includes('super_admin') || user.permissions.includes('programs.manage');
    let isAuthorized = isAdmin;

    if (!isAuthorized) {
      const { data: reg } = await supabase
        .from('registrations')
        .select('id')
        .eq('batch_id', material.batch_id)
        .eq('participant.profile_id', user.id)
        .eq('status', 'accepted')
        .maybeSingle();

      if (reg) isAuthorized = true;
    }

    if (!isAuthorized) {
      return { success: false, message: 'Akses Ditolak: Anda belum terdaftar sebagai peserta resmi pada kelas ini.' };
    }

    const { data: signedData, error } = await supabase.storage
      .from('private-learning-materials')
      .createSignedUrl(material.file_storage_path, 900);

    if (error || !signedData?.signedUrl) {
      return { success: false, message: 'Gagal menghasilkan tautan unduhan privat.' };
    }

    return { success: true, url: signedData.signedUrl };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan server.' };
  }
}

