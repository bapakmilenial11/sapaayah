import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase Client untuk Browser / Client Components
 * Menggunakan variabel publik (URL & ANON KEY)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

