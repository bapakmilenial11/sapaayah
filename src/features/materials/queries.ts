import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';

export interface LearningMaterialItem {
  id: string;
  batch_id: string;
  session_id: string | null;
  title: string;
  description: string | null;
  file_storage_path: string;
  file_type: string | null;
  file_size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
  download_url?: string | null;
}

/**
 * 1. Query: Mengambil daftar materi untuk suatu sesi atau batch
 */
export async function getMaterialsForSession(sessionId: string): Promise<LearningMaterialItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('learning_materials')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat materi sesi: ${error.message}`);
  }

  return (data as any) || [];
}

/**
 * 2. Query: Mengambil seluruh materi pembelajaran untuk suatu batch
 */
export async function getMaterialsForBatch(batchId: string): Promise<LearningMaterialItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('learning_materials')
    .select('*')
    .eq('batch_id', batchId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat materi batch: ${error.message}`);
  }

  return (data as any) || [];
}

/**
 * 3. Query: Menghasilkan Time-Limited Signed URL (15 menit) untuk unduhan materi
 * Syarat: Pengguna terautentikasi adalah Admin, Fasilitator sesi, ATAU peserta batch berstatus 'accepted'
 */
export async function getMaterialSignedDownloadUrl(materialId: string): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();

  // Ambil detail materi
  const { data: material } = await supabase
    .from('learning_materials')
    .select('id, batch_id, file_storage_path')
    .eq('id', materialId)
    .single();

  if (!material) return null;

  // Verifikasi izin akses: Admin, Fasilitator, atau Peserta Accepted
  const isAdmin = user.roles.includes('super_admin') || user.permissions.includes('programs.manage');
  let isAuthorized = isAdmin;

  if (!isAuthorized) {
    // Cek apakah user adalah peserta accepted pada batch tersebut
    const { data: reg } = await supabase
      .from('registrations')
      .select('id')
      .eq('batch_id', material.batch_id)
      .eq('participant.profile_id', user.id)
      .eq('status', 'accepted')
      .maybeSingle();

    if (reg) isAuthorized = true;
  }

  if (!isAuthorized) return null;

  // Generate signed URL berlaku 15 menit (900 detik)
  const { data: signedData, error } = await supabase.storage
    .from('private-learning-materials')
    .createSignedUrl(material.file_storage_path, 900);

  if (error || !signedData) return null;

  return signedData.signedUrl;
}

