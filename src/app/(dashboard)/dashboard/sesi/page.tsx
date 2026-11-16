import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import { getSessionsForDashboard } from '@/features/sessions/queries';
import { StatCard, EmptyState } from '@/components/dashboard/StatCard';
import { formatDateTimeIndonesia } from '@/lib/utils';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  ArrowRight,
  Video,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

export default async function SesiPage() {
  await assertPermission('sessions.manage_assigned');

  const user = await getCurrentUser();
  const { sessions, userRole } = await getSessionsForDashboard();

  // Hitung metrik ringkasan
  const totalSessions = sessions.length;
  const scheduledCount = sessions.filter((s) => s.status === 'scheduled').length;
  const inProgressCount = sessions.filter((s) => s.status === 'in_progress').length;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F0F5] text-[#547F9F]">
              <BookOpen className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">
              Sesi Kelas & Presensi
            </h1>
          </div>
          <p className="text-xs text-[#252D35]/70 mt-1">
            {userRole === 'admin'
              ? 'Monitoring seluruh sesi pertemuan kelas dan rekap kehadiran peserta lintas program.'
              : 'Daftar sesi pertemuan kelas yang ditugaskan kepada Anda sebagai fasilitator.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#E8F0F5] px-3 py-1 text-xs font-semibold text-[#547F9F]">
            Peran: {userRole === 'admin' ? 'Administrator' : 'Fasilitator'}
          </span>
        </div>
      </div>

      {/* Grid Metrik Ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sesi"
          value={totalSessions}
          subtitle="Sesi terdaftar"
          icon={Layers}
          variant="primary"
        />
        <StatCard
          title="Terjadwal"
          value={scheduledCount}
          subtitle="Menunggu pelaksanaan"
          icon={Calendar}
          variant="warning"
        />
        <StatCard
          title="Berlangsung"
          value={inProgressCount}
          subtitle="Sedang aktif"
          icon={Clock}
          variant="info"
        />
        <StatCard
          title="Selesai"
          value={completedCount}
          subtitle="Telah terlaksana"
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Daftar Sesi Pertemuan */}
      <div className="rounded-xl border border-[#E8F0F5] bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E8F0F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#547F9F]" />
            <h3 className="text-sm font-bold text-[#385A75]">Agenda Sesi Kelas</h3>
          </div>
          <span className="text-xs text-[#252D35]/60 font-medium">
            Total {sessions.length} Sesi
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={BookOpen}
              title="Belum Ada Sesi Kelas"
              description={
                userRole === 'admin'
                  ? 'Belum ada sesi pertemuan yang dijadwalkan pada angkatan manapun.'
                  : 'Anda belum ditugaskan sebagai fasilitator pada sesi pertemuan kelas aktif.'
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-[#E8F0F5]">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="p-5 hover:bg-[#F5F7F8]/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[#547F9F] px-2 py-0.5 text-[10px] font-semibold text-white">
                      Sesi #{s.session_number}
                    </span>
                    <span className="text-xs font-semibold text-[#547F9F]">
                      {s.batch.program.name} — {s.batch.name}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        s.status === 'scheduled'
                          ? 'bg-amber-100 text-amber-800'
                          : s.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : s.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {s.status === 'scheduled'
                        ? 'Terjadwal'
                        : s.status === 'in_progress'
                        ? 'Berlangsung'
                        : s.status === 'completed'
                        ? 'Selesai'
                        : 'Dibatalkan'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#385A75]">{s.title}</h4>

                  {s.description && (
                    <p className="text-xs text-[#252D35]/70 line-clamp-2">{s.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#252D35]/65 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#547F9F]" />
                      <span>{formatDateTimeIndonesia(s.starts_at)}</span>
                    </div>

                    {s.facilitator && (
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-[#547F9F]" />
                        <span>Fasilitator: <strong className="text-[#385A75]">{s.facilitator.full_name}</strong></span>
                      </div>
                    )}

                    {s.meeting_url && (
                      <div className="flex items-center gap-1.5">
                        <Video className="h-3.5 w-3.5 text-blue-600" />
                        <span className="text-blue-600 font-medium">Tersedia Tautan Kelas</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Link
                    href={`/dashboard/sesi/${s.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition"
                  >
                    <span>Presensi & Detail</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

