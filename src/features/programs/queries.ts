import { createClient } from '@/lib/supabase/server';

export interface ProgramListItem {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  program_type: string;
  visibility: string;
  created_at: string;
  is_archived: boolean;
  batches_count?: number;
}

export interface BatchListItem {
  id: string;
  program_id: string;
  batch_number: number;
  name: string;
  slug: string;
  registration_open_at: string;
  registration_close_at: string;
  start_at: string;
  end_at: string;
  price: number;
  capacity: number;
  status: string;
  created_at: string;
  is_archived: boolean;
  registrations_count?: number;
}

/**
 * Mengambil daftar program (dengan filter pencarian dan visibilitas)
 */
export async function getPrograms(params?: {
  query?: string;
  visibility?: string;
  includeArchived?: boolean;
}): Promise<ProgramListItem[]> {
  const supabase = await createClient();

  let queryBuilder = supabase
    .from('programs')
    .select('*, program_batches(count)')
    .order('created_at', { ascending: false });

  if (!params?.includeArchived) {
    queryBuilder = queryBuilder.eq('is_archived', false);
  }

  if (params?.visibility && params.visibility !== 'all') {
    queryBuilder = queryBuilder.eq('visibility', params.visibility);
  }

  if (params?.query) {
    queryBuilder = queryBuilder.ilike('name', `%${params.query}%`);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching programs:', error.message);
    throw new Error(`Gagal memuat katalog program: ${error.message}`);
  }

  return (data || []).map((p: any) => ({
    ...p,
    batches_count: p.program_batches ? p.program_batches[0]?.count || 0 : 0,
  }));
}

/**
 * Mengambil detail program berdasarkan ID
 */
export async function getProgramById(id: string): Promise<ProgramListItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Gagal memuat detail program: ${error.message}`);
  }

  return data;
}

/**
 * Mengambil daftar batch untuk program tertentu
 */
export async function getBatchesByProgramId(programId: string): Promise<BatchListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('program_batches')
    .select('*, registrations(count)')
    .eq('program_id', programId)
    .eq('is_archived', false)
    .order('batch_number', { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat daftar batch: ${error.message}`);
  }

  return (data || []).map((b: any) => ({
    ...b,
    registrations_count: b.registrations ? b.registrations[0]?.count || 0 : 0,
  }));
}

/**
 * Mengambil detail satu batch
 */
export async function getBatchById(batchId: string): Promise<BatchListItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('program_batches')
    .select('*')
    .eq('id', batchId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Gagal memuat detail batch: ${error.message}`);
  }

  return data;
}

