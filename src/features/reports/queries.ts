import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';

export interface FridayReportItem {
  id: string;
  profile_id: string;
  week_date: string;
  completed_work: string;
  upcoming_plan: string;
  blockers: string;
  submitted_at: string;
  profile?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

/**
 * Mendapatkan tanggal hari Jumat pada pekan saat ini (format YYYY-MM-DD)
 */
export function getCurrentWeekFridayDate(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Minggu, 5 = Jumat
  const diffToFriday = (5 - dayOfWeek + 7) % 7;
  const friday = new Date(now);
  friday.setDate(now.getDate() + (diffToFriday === 0 && dayOfWeek !== 5 ? -7 : diffToFriday));
  return friday.toISOString().split('T')[0];
}

/**
 * 1. Query: Mengambil riwayat laporan jumat pribadi pengguna aktif
 */
export async function getMyFridayReports(): Promise<FridayReportItem[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('weekly_reports')
    .select(
      `
      id,
      profile_id,
      week_date,
      completed_work,
      upcoming_plan,
      blockers,
      submitted_at
    `
    )
    .eq('profile_id', user.id)
    .order('week_date', { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat riwayat laporan: ${error.message}`);
  }

  return (data as any) || [];
}

/**
 * 2. Query: Mengambil laporan jumat spesifik pekan tertentu untuk pengguna aktif (untuk prefill form)
 */
export async function getMyReportForWeek(weekDate: string): Promise<FridayReportItem | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('weekly_reports')
    .select('*')
    .eq('profile_id', user.id)
    .eq('week_date', weekDate)
    .maybeSingle();

  if (error || !data) return null;
  return data as any;
}

/**
 * 3. Query: Mengambil rekap seluruh laporan jumat per tanggal pekan untuk Humas / Pimpinan
 * Wewenang: weekly_reports.view_all, weekly_reports.recap, atau super_admin
 */
export async function getAllFridayReportsByWeek(weekDate: string): Promise<FridayReportItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('weekly_reports')
    .select(
      `
      id,
      profile_id,
      week_date,
      completed_work,
      upcoming_plan,
      blockers,
      submitted_at,
      profile:profiles!weekly_reports_profile_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq('week_date', weekDate)
    .order('submitted_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat rekap laporan mingguan: ${error.message}`);
  }

  return (data as any) || [];
}

