import { createClient } from '@/lib/supabase/server';

export interface RegistrationListItem {
  id: string;
  registration_source: string;
  status: string;
  notes: string | null;
  submitted_at: string;
  created_at: string;
  participant: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    city: string | null;
    marital_status: string | null;
    number_of_children: number;
  };
  batch: {
    id: string;
    name: string;
    batch_number: number;
    price: number;
    status: string;
    program: {
      id: string;
      name: string;
    };
  };
}

export interface OpenBatchOption {
  id: string;
  name: string;
  batch_number: number;
  price: number;
  capacity: number;
  registration_close_at: string;
  program: {
    id: string;
    name: string;
  };
}

/**
 * Mengambil daftar pendaftar (untuk dashboard Admin Peserta)
 */
export async function getAdminRegistrations(params?: {
  batchId?: string;
  status?: string;
  search?: string;
}): Promise<RegistrationListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from('registrations')
    .select(
      `
      id,
      registration_source,
      status,
      notes,
      submitted_at,
      created_at,
      participant:participants!inner(
        id,
        full_name,
        email,
        phone,
        city,
        marital_status,
        number_of_children
      ),
      batch:program_batches!inner(
        id,
        name,
        batch_number,
        price,
        status,
        program:programs!inner(
          id,
          name
        )
      )
    `
    )
    .order('created_at', { ascending: false });

  if (params?.batchId && params.batchId !== 'all') {
    query = query.eq('batch_id', params.batchId);
  }

  if (params?.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  if (params?.search) {
    query = query.ilike('participant.full_name', `%${params.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal memuat daftar pendaftar: ${error.message}`);
  }

  return (data as any) || [];
}

/**
 * Mengambil daftar pendaftaran milik pengguna saat ini (untuk Portal Peserta)
 */
export async function getMyRegistrations(profileId: string): Promise<RegistrationListItem[]> {
  const supabase = await createClient();

  // Ambil participant_id terkait user
  const { data: participant } = await supabase
    .from('participants')
    .select('id')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (!participant) return [];

  const { data, error } = await supabase
    .from('registrations')
    .select(
      `
      id,
      registration_source,
      status,
      notes,
      submitted_at,
      created_at,
      participant:participants!inner(
        id,
        full_name,
        email,
        phone,
        city,
        marital_status,
        number_of_children
      ),
      batch:program_batches!inner(
        id,
        name,
        batch_number,
        price,
        status,
        program:programs!inner(
          id,
          name
        )
      )
    `
    )
    .eq('participant_id', participant.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat riwayat pendaftaran saya: ${error.message}`);
  }

  return (data as any) || [];
}

/**
 * Mengambil daftar batch yang statusnya OPEN untuk form pendaftaran publik/peserta
 */
export async function getOpenBatches(): Promise<OpenBatchOption[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('program_batches')
    .select(
      `
      id,
      name,
      batch_number,
      price,
      capacity,
      registration_close_at,
      program:programs!inner(
        id,
        name
      )
    `
    )
    .eq('status', 'open')
    .eq('is_archived', false)
    .lte('registration_open_at', now)
    .gte('registration_close_at', now)
    .order('registration_close_at', { ascending: true });

  if (error) {
    return [];
  }

  return (data as any) || [];
}

