import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getDashboardMetrics } from '@/features/dashboard/queries';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  Calendar,
  Users2,
  CreditCard,
  CheckSquare,
  ShieldAlert,
  FileText,
  AlertCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let metrics = {
    totalPrograms: 0,
    totalBatches: 0,
    totalParticipants: 0,
    pendingPayments: 0,
    activeTasks: 0,
    totalAuditLogs: 0,
  };

  try {
    metrics = await getDashboardMetrics(user);
  } catch (err) {
    console.error('Failed to load metrics:', err);
  }

  const primaryRole = user.roles?.[0] || 'pengurus';
  const fullName = user.fullName || 'Pengurus SAPA Ayah';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-[#E8F0F5] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">
            Assalamu’alaikum, {fullName}
          </h1>
          <p className="text-xs text-[#252D35]/70 mt-1">
            Panel Operasional Terintegrasi — Masuk sebagai peran{' '}
            <span className="font-semibold text-[#547F9F] capitalize">
              {primaryRole.replace('_', ' ')}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user.permissions?.includes('weekly_reports.submit') && (
            <Link
              href="/dashboard/laporan-jumat"
              className="rounded-lg bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#385A75] transition shadow-sm inline-flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Isi Laporan Jumat</span>
            </Link>
          )}
        </div>
      </div>

      {/* Dynamic Role-Based Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Program"
          value={metrics.totalPrograms}
          subtitle="Katalog program aktif"
          icon={Calendar}
        />
        <StatCard
          title="Basis Data Peserta"
          value={metrics.totalParticipants}
          subtitle="Peserta terdaftar"
          icon={Users2}
        />
        <StatCard
          title="Verifikasi Pembayaran"
          value={metrics.pendingPayments}
          subtitle="Menunggu konfirmasi"
          icon={CreditCard}
          variant="warning"
        />
        <StatCard
          title="Audit Logs Sistem"
          value={metrics.totalAuditLogs}
          subtitle="Jejak audit terekam"
          icon={ShieldAlert}
          variant="info"
        />
      </div>

      {/* Grid Informasi & Pengingat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-[#E8F0F5] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-3">
            <h3 className="text-sm font-bold text-[#385A75]">Status Operasional Cepat</h3>
            <span className="text-xs text-[#252D35]/60">SAPA Ayah Digital</span>
          </div>

          <div className="flex items-start justify-between rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] p-3.5">
            <div className="space-y-1">
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                Sistem Aktif
              </span>
              <h4 className="text-xs font-bold text-[#385A75]">
                Sistem Berjalan Normal (Production Ready)
              </h4>
              <p className="text-[11px] text-[#252D35]/70">
                Seluruh modul operasional, pembayaran manual, dan sesi presensi siap digunakan.
              </p>
            </div>
            <span className="text-[10px] font-medium text-[#252D35]/60 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Realtime
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-[#E8F0F5] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#385A75] border-b border-[#E8F0F5] pb-3">
            <AlertCircle className="h-4 w-4 text-[#547F9F]" />
            <h3>Ritme Kerja Pengurus</h3>
          </div>
          <div className="space-y-3 text-xs text-[#252D35]/80 leading-relaxed">
            <p>
              Setiap hari Jumat, setiap pengurus wajib mengisi laporan ringkas 3 baris:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-[#385A75] font-medium">
              <li>Sudah apa pekan ini?</li>
              <li>Akan apa pekan depan?</li>
              <li>Apa kendala yang dihadapi?</li>
            </ol>
            <div className="pt-2">
              <Link
                href="/dashboard/laporan-jumat"
                className="block w-full text-center rounded-lg bg-[#E8F0F5] py-2 text-xs font-semibold text-[#385A75] hover:bg-[#547F9F] hover:text-white transition"
              >
                Buka Formulir Laporan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
