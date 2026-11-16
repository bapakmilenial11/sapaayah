import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import {
  getSessionDetail,
  getEligibleParticipantsForSession,
  getSessionAttendanceRecords,
  getSessionAttendanceRecap,
} from '@/features/sessions/queries';
import { getMaterialsForSession } from '@/features/materials/queries';
import { AttendanceForm } from '@/components/sessions/AttendanceForm';
import { AttendanceRecap } from '@/components/sessions/AttendanceRecap';
import { MaterialUploadModal } from '@/components/materials/MaterialUploadModal';
import { MaterialListCard } from '@/components/materials/MaterialListCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDateTimeIndonesia } from '@/lib/utils';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Video,
  User,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await assertPermission('sessions.manage_assigned');

  const user = await getCurrentUser();
  if (!user) notFound();

  // Load session detail, eligible participants, existing attendance, recap, and materials in parallel
  const [session, eligibleParticipants, attendanceRecords, recap, materials] = await Promise.all([
    getSessionDetail(id),
    getEligibleParticipantsForSession(id).catch(() => []),
    getSessionAttendanceRecords(id).catch(() => []),
    getSessionAttendanceRecap(id).catch(() => ({
      session_id: id,
      total_eligible: 0,
      recorded_count: 0,
      present_count: 0,
      absent_count: 0,
      excused_count: 0,
      late_count: 0,
      attendance_percentage: 0,
    })),
    getMaterialsForSession(id).catch(() => []),
  ]);

  if (!session) {
    notFound();
  }

  // Wewenang role:
  // - Admin (programs.manage atau super_admin)
  // - Fasilitator yang ditugaskan pada sesi ini
  const isAdmin = user.roles.includes('super_admin') || user.permissions.includes('programs.manage');
  const isAssignedFacilitator = session.facilitator_id === user.id;

  if (!isAdmin && !isAssignedFacilitator) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
          <h2 className="text-base font-bold text-red-800">Akses Dibatasi</h2>
          <p className="text-xs text-red-700 max-w-md mx-auto">
            Anda bukan fasilitator yang ditugaskan untuk sesi pertemuan ini. Hanya fasilitator bertugas
            atau Administrator yang dapat mengakses lembar presensi sesi ini.
          </p>
          <Link
            href="/dashboard/sesi"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#385A75] transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Daftar Sesi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#252D35]/60">
        <Link
          href="/dashboard/sesi"
          className="hover:text-[#547F9F] flex items-center gap-1 transition"
        >
          <ArrowLeft className="h-3 w-3" />
          Sesi Kelas
        </Link>
        <span>/</span>
        <span className="text-[#385A75] font-semibold">{session.title}</span>
      </div>

      {/* Detail Ringkasan Sesi Kelas */}
      <div className="rounded-2xl border border-[#E8F0F5] bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-[#547F9F] px-2 py-0.5 text-[10px] font-semibold text-white">
                Sesi #{session.session_number}
              </span>
              <span className="text-xs font-bold text-[#547F9F]">
                {session.batch.program.name} — {session.batch.name}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                  session.status === 'scheduled'
                    ? 'bg-amber-100 text-amber-800'
                    : session.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800'
                    : session.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {session.status === 'scheduled'
                  ? 'Terjadwal'
                  : session.status === 'in_progress'
                  ? 'Sedang Berlangsung'
                  : session.status === 'completed'
                  ? 'Selesai'
                  : 'Dibatalkan'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">{session.title}</h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                Akses Administrator
              </span>
            )}
          </div>
        </div>

        {session.description && (
          <p className="text-xs text-[#252D35]/75 leading-relaxed bg-[#F5F7F8] p-3 rounded-lg border border-[#E8F0F5]">
            {session.description}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E8F0F5] text-xs text-[#252D35]/75">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#547F9F]" />
            <div>
              <div className="text-[10px] text-[#252D35]/50">Jadwal Pertemuan</div>
              <div className="font-semibold text-[#385A75]">
                {formatDateTimeIndonesia(session.starts_at)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#547F9F]" />
            <div>
              <div className="text-[10px] text-[#252D35]/50">Fasilitator Sesi</div>
              <div className="font-semibold text-[#385A75]">
                {session.facilitator?.full_name || 'Belum Ditugaskan'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-[10px] text-[#252D35]/50">Ruang Kelas Virtual</div>
              {session.meeting_url ? (
                <a
                  href={session.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:underline truncate block max-w-[200px]"
                >
                  Buka Link Pertemuan &rarr;
                </a>
              ) : (
                <span className="text-[#252D35]/50 italic">Tautan belum diisi</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Komponen Rekap Statistik Kehadiran Sesi */}
      <AttendanceRecap recap={recap} />

      {/* Bagian Materi Pembelajaran Sesi */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#385A75]">Materi Pembelajaran Sesi</h2>
          <MaterialUploadModal
            batchId={session.batch.id}
            sessionId={session.id}
            sessionTitle={session.title}
          />
        </div>
        <MaterialListCard
          materials={materials}
          title={`Berkas Materi: ${session.title}`}
          emptyMessage="Belum ada materi pembelajaran yang diunggah untuk sesi pertemuan ini."
        />
      </div>

      {/* Lembar Presensi Massal & Koreksi Atomik */}
      <AttendanceForm
        sessionId={session.id}
        sessionStatus={session.status}
        isAdmin={isAdmin}
        eligibleParticipants={eligibleParticipants.map((p) => ({
          participant_id: p.participant_id,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
        }))}
        existingRecords={attendanceRecords.map((r) => ({
          participant_id: r.participant_id,
          attendance_status: r.attendance_status,
          notes: r.notes,
        }))}
      />
    </div>
  );
}

