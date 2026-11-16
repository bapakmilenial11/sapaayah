import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';

export interface CertificateItem {
  id: string;
  certificate_number: string;
  batch_id: string;
  participant_id: string;
  issued_at: string;
  pdf_storage_path: string | null;
  signed_by_profile_id: string | null;
  verification_hash: string;
  created_at: string;
  batch?: {
    id: string;
    name: string;
    program: {
      id: string;
      name: string;
    };
  };
  participant?: {
    id: string;
    full_name: string;
    email: string;
  };
}

/**
 * 1. Query: Mengambil sertifikat kelulusan milik peserta untuk batch tertentu
 */
export async function getParticipantCertificate(batchId: string): Promise<CertificateItem | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();

  // Ambil participant_id
  const { data: part } = await supabase
    .from('participants')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (!part) return null;

  const { data, error } = await supabase
    .from('certificates')
    .select(
      `
      id,
      certificate_number,
      batch_id,
      participant_id,
      issued_at,
      pdf_storage_path,
      signed_by_profile_id,
      verification_hash,
      created_at,
      batch:program_batches!inner(
        id,
        name,
        program:programs!inner(
          id,
          name
        )
      )
    `
    )
    .eq('batch_id', batchId)
    .eq('participant_id', part.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as any;
}

/**
 * 2. Query: Mengambil seluruh sertifikat yang telah diterbitkan pada suatu batch (untuk admin)
 */
export async function getCertificatesByBatch(batchId: string): Promise<CertificateItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('certificates')
    .select(
      `
      id,
      certificate_number,
      batch_id,
      participant_id,
      issued_at,
      verification_hash,
      created_at,
      participant:participants!inner(
        id,
        full_name,
        email
      )
    `
    )
    .eq('batch_id', batchId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat sertifikat batch: ${error.message}`);
  }

  return (data as any) || [];
}

