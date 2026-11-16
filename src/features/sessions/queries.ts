import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';

export interface ClassSessionListItem {
  id: string;
  batch_id: string;
  session_number: number;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  meeting_url: string | null;
  facilitator_id: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  facilitator?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export interface ClassSessionDetail extends ClassSessionListItem {
  batch: {
    id: string;
    name: string;
    batch_number: number;
    price: number;
    program: {
      id: string;
      name: string;
      program_type: string;
    };
  };
}

export interface DashboardSessionItem extends ClassSessionListItem {
  batch: {
    id: string;
    name: string;
    batch_number: number;
    program: {
      id: string;
      name: string;
    };
  };
}

export interface EligibleParticipant {
  participant_id: string;
  registration_id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string | null;
  registration_status: 'accepted';
}

export interface SessionAttendanceItem {
  id: string;
  session_id: string;
  participant_id: string;
  attendance_status: 'present' | 'absent' | 'excused' | 'late';
  recorded_by: string | null;
  recorded_at: string;
  notes: string | null;
  participant: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  recorder?: {
    id: string;
    full_name: string;
  } | null;
}

export interface SessionAttendanceRecap {
  session_id: string;
  total_eligible: number;
  recorded_count: number;
  present_count: number;
  absent_count: number;
  excused_count: number;
  late_count: number;
  attendance_percentage: number;
}

export interface BatchAttendanceRecap {
  batch_id: string;
  total_sessions: number;
  completed_sessions: number;
  total_eligible_participants: number;
  overall_attendance_percentage: number;
  session_recaps: SessionAttendanceRecap[];
}

export interface ParticipantPersonalAttendanceHistory {
  participant_id: string;
  full_name: string;
  records: {
    session_id: string;
    session_number: number;
    session_title: string;
    starts_at: string;
    meeting_url: string | null;
    session_status: string;
    attendance_status: 'present' | 'absent' | 'excused' | 'late' | 'not_recorded';
    notes: string | null;
  }[];
  stats: {
    total_sessions: number;
    attended_count: number;
    excused_count: number;
    absent_count: number;
    attendance_rate: number;
  };
}

/**
 * 1. Query: Mengambil daftar sesi berdasarkan batch_id
 * Izin: Pengguna terautentikasi (peserta batch terdaftar 'accepted', fasilitator, atau admin dengan programs.view)
 */
export async function getSessionsByBatch(batchId: string): Promise<ClassSessionListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('class_sessions')
    .select(
      `
      id,
      batch_id,
      session_number,
      title,
      description,
      starts_at,
      ends_at,
      meeting_url,
      facilitator_id,
      status,
      created_at,
      updated_at,
      facilitator:profiles!class_sessions_facilitator_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq('batch_id', batchId)
    .order('session_number', { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat daftar sesi kelas: ${error.message}`);
  }

  return (data as any) || [];
}

/**
 * 2. Query: Mengambil detail satu sesi beserta relasi batch dan program
 */
export async function getSessionDetail(sessionId: string): Promise<ClassSessionDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('class_sessions')
    .select(
      `
      id,
      batch_id,
      session_number,
      title,
      description,
      starts_at,
      ends_at,
      meeting_url,
      facilitator_id,
      status,
      created_at,
      updated_at,
      facilitator:profiles!class_sessions_facilitator_id_fkey(
        id,
        full_name,
        avatar_url
      ),
      batch:program_batches!inner(
        id,
        name,
        batch_number,
        price,
        program:programs!inner(
          id,
          name,
          program_type
        )
      )
    `
    )
    .eq('id', sessionId)
    .maybeSingle();

  if (error || !data) return null;

  return data as any;
}

/**
 * 3. Query: Mengambil daftar peserta yang sah (hanya yang status registrasinya 'accepted')
 * WAJIB filter registrations.status = 'accepted' di server.
 */
export async function getEligibleParticipantsForSession(sessionId: string): Promise<EligibleParticipant[]> {
  const supabase = await createClient();

  // 1. Dapatkan batch_id sesi terkait
  const { data: session, error: sessionErr } = await supabase
    .from('class_sessions')
    .select('batch_id')
    .eq('id', sessionId)
    .single();

  if (sessionErr || !session) {
    throw new Error('Sesi tidak ditemukan.');
  }

  // 2. Ambil hanya peserta dengan registrasi accepted pada batch tersebut
  const { data, error } = await supabase
    .from('registrations')
    .select(
      `
      id,
      status,
      participant:participants!inner(
        id,
        full_name,
        email,
        phone,
        city
      )
    `
    )
    .eq('batch_id', session.batch_id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat peserta sesi: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    participant_id: row.participant.id,
    registration_id: row.id,
    full_name: row.participant.full_name,
    email: row.participant.email,
    phone: row.participant.phone,
    city: row.participant.city,
    registration_status: 'accepted',
  }));
}

/**
 * 4. Query: Mengambil catatan presensi untuk satu sesi tertentu
 */
export async function getSessionAttendanceRecords(sessionId: string): Promise<SessionAttendanceItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('attendance_records')
    .select(
      `
      id,
      session_id,
      participant_id,
      attendance_status,
      recorded_by,
      recorded_at,
      notes,
      participant:participants!inner(
        id,
        full_name,
        email,
        phone
      ),
      recorder:profiles!attendance_records_recorded_by_fkey(
        id,
        full_name
      )
    `
    )
    .eq('session_id', sessionId)
    .order('recorded_at', { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat rekaman kehadiran sesi: ${error.message}`);
  }

  return (data as any) || [];
}

/**
 * 5. Query: Rekap kehadiran per sesi
 */
export async function getSessionAttendanceRecap(sessionId: string): Promise<SessionAttendanceRecap> {
  const [eligibleList, records] = await Promise.all([
    getEligibleParticipantsForSession(sessionId),
    getSessionAttendanceRecords(sessionId),
  ]);

  const totalEligible = eligibleList.length;
  let presentCount = 0;
  let absentCount = 0;
  let excusedCount = 0;
  let lateCount = 0;

  records.forEach((r) => {
    switch (r.attendance_status) {
      case 'present':
        presentCount++;
        break;
      case 'absent':
        absentCount++;
        break;
      case 'excused':
        excusedCount++;
        break;
      case 'late':
        lateCount++;
        break;
    }
  });

  // Hadir + Terlambat dihitung sebagai kehadiran aktif
  const attendedTotal = presentCount + lateCount;
  const attendancePercentage = totalEligible > 0 ? Math.round((attendedTotal / totalEligible) * 100) : 0;

  return {
    session_id: sessionId,
    total_eligible: totalEligible,
    recorded_count: records.length,
    present_count: presentCount,
    absent_count: absentCount,
    excused_count: excusedCount,
    late_count: lateCount,
    attendance_percentage: attendancePercentage,
  };
}

/**
 * 6. Query: Rekap kehadiran per batch
 */
export async function getBatchAttendanceRecap(batchId: string): Promise<BatchAttendanceRecap> {
  const sessions = await getSessionsByBatch(batchId);
  const sessionRecaps = await Promise.all(sessions.map((s) => getSessionAttendanceRecap(s.id)));

  const completedSessions = sessions.filter((s) => s.status === 'completed').length;

  let totalPossiblePresences = 0;
  let totalActualPresences = 0;
  let maxEligible = 0;

  sessionRecaps.forEach((recap) => {
    if (recap.total_eligible > maxEligible) {
      maxEligible = recap.total_eligible;
    }
    totalPossiblePresences += recap.total_eligible;
    totalActualPresences += recap.present_count + recap.late_count;
  });

  const overallPercentage =
    totalPossiblePresences > 0 ? Math.round((totalActualPresences / totalPossiblePresences) * 100) : 0;

  return {
    batch_id: batchId,
    total_sessions: sessions.length,
    completed_sessions: completedSessions,
    total_eligible_participants: maxEligible,
    overall_attendance_percentage: overallPercentage,
    session_recaps: sessionRecaps,
  };
}

/**
 * 7 & 8. Query: Riwayat kehadiran pribadi peserta yang sedang login pada suatu batch
 * Mengisolasi data: Peserta hanya dapat membaca catatan kehadiran milik dirinya sendiri.
 */
export async function getMyAttendanceHistory(batchId: string): Promise<ParticipantPersonalAttendanceHistory | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();

  // 1. Ambil participant_id pengguna aktif
  const { data: participant } = await supabase
    .from('participants')
    .select('id, full_name')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (!participant) return null;

  // 2. Ambil sesi-sesi pada batch tersebut
  const sessions = await getSessionsByBatch(batchId);

  // 3. Ambil seluruh record presensi peserta pada sesi-sesi tersebut
  const sessionIds = sessions.map((s) => s.id);
  let records: any[] = [];
  if (sessionIds.length > 0) {
    const { data: attData } = await supabase
      .from('attendance_records')
      .select('session_id, attendance_status, notes')
      .eq('participant_id', participant.id)
      .in('session_id', sessionIds);

    records = attData || [];
  }

  const recordMap = new Map<string, { status: any; notes: string | null }>();
  records.forEach((r) => {
    recordMap.set(r.session_id, { status: r.attendance_status, notes: r.notes });
  });

  let attendedCount = 0;
  let excusedCount = 0;
  let absentCount = 0;

  const historyRecords = sessions.map((s) => {
    const recorded = recordMap.get(s.id);
    const attStatus = recorded ? recorded.status : 'not_recorded';

    if (attStatus === 'present' || attStatus === 'late') attendedCount++;
    else if (attStatus === 'excused') excusedCount++;
    else if (attStatus === 'absent') absentCount++;

    return {
      session_id: s.id,
      session_number: s.session_number,
      session_title: s.title,
      starts_at: s.starts_at,
      meeting_url: s.meeting_url,
      session_status: s.status,
      attendance_status: attStatus,
      notes: recorded?.notes || null,
    };
  });

  const totalSessions = sessions.length;
  const attendanceRate = totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 0;

  return {
    participant_id: participant.id,
    full_name: participant.full_name,
    records: historyRecords,
    stats: {
      total_sessions: totalSessions,
      attended_count: attendedCount,
      excused_count: excusedCount,
      absent_count: absentCount,
      attendance_rate: attendanceRate,
    },
  };
}

/**
 * 9. Query: Mengambil daftar sesi untuk dashboard internal
 * Otomatis memfilter berdasarkan hak akses:
 * - Admin / Super Admin (programs.manage atau super_admin): dapat melihat seluruh sesi
 * - Fasilitator (sessions.manage_assigned): hanya melihat sesi yang ditugaskan kepada dirinya
 */
export async function getSessionsForDashboard(): Promise<{
  sessions: DashboardSessionItem[];
  userRole: 'admin' | 'facilitator';
}> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
  }

  const isAdmin = user.roles.includes('super_admin') || user.permissions.includes('programs.manage');
  const isFacilitator = user.permissions.includes('sessions.manage_assigned');

  if (!isAdmin && !isFacilitator) {
    throw new Error('Akses Ditolak: Anda tidak memiliki wewenang untuk melihat modul sesi kelas.');
  }

  const supabase = await createClient();

  let query = supabase
    .from('class_sessions')
    .select(
      `
      id,
      batch_id,
      session_number,
      title,
      description,
      starts_at,
      ends_at,
      meeting_url,
      facilitator_id,
      status,
      created_at,
      updated_at,
      facilitator:profiles!class_sessions_facilitator_id_fkey(
        id,
        full_name,
        avatar_url
      ),
      batch:program_batches!inner(
        id,
        name,
        batch_number,
        program:programs!inner(
          id,
          name
        )
      )
    `
    )
    .order('starts_at', { ascending: false });

  if (!isAdmin && isFacilitator) {
    query = query.eq('facilitator_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal memuat sesi kelas: ${error.message}`);
  }

  return {
    sessions: (data as any) || [],
    userRole: isAdmin ? 'admin' : 'facilitator',
  };
}

