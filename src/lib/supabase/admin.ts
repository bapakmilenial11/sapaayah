import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client (Service Role)
 * HANYA DIGUNAKAN DI SERVER-SIDE untuk operasi administratif yang berwenang
 * DILARANG KERAS mengekspos client ini ke sisi browser!
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Konfigurasi SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di environment server.'
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

