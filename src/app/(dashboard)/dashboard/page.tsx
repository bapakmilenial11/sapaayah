import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getDashboardMetrics } from '@/features/dashboard/queries';
import { StatCard, EmptyState } from '@/components/dashboard/StatCard';
import {
  Calendar,
  Users2,
  CreditCard,
  CheckSquare,
  ShieldAlert,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const metrics = await getDashboardMetrics(user).catch(() => ({
    totalPrograms: 0,
    totalBatches: 0,
    totalParticipants: 0,
    pendingPayments: 0,
    activeTasks: 0,
    totalAuditLogs: 0,
  }));
  const primaryRole = user.roles?.[0] || 'pengurus';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-[#E8F0F5] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">
            Assalamu’alaikum, {user.fullName}
          </h1>
          <p className="text-xs text-[#252D35]/70 mt-1">
            Panel Operasional Terintegrasi — Masuk sebagai peran{' '}
            <span className="font-semibold text-[#547F9F] capitalize">
              {primaryRole.replace('_', ' ')}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user.permissions.includes('weekly_reports.submit') && (
            <Link
              href="/dashboard/laporan-jumat"
              className="rounded-lg bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#385A75] transition shadow-sm inline-flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              Isi Laporan Jumat
            </Link>
          )}
        </div>
      </div>

      {/* Dynamic Role-Based Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Super Admin View */}
        {primaryRole === 'super_admin' && (
          <>
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
          </>
        )}

        {/* Ketua / Eksekutif View */}
        {primaryRole === 'ketua' && (
          <>
            <StatCard
              title="Program Berjalan"
              value={metrics.totalPrograms}
              subtitle="Total batch aktif"
              icon={Calendar}
            />
            <StatCard
              title="Total Peserta"
              value={metrics.totalParticipants}
              subtitle="Partisipan yayasan"
              icon={Users2}
            />
            <StatCard
              title="Tugas Operasional"
              value={metrics.activeTasks}
              subtitle="Tugas tim pengurus"
              icon={CheckSquare}
            />
            <StatCard
              title="Pembayaran Masuk"
              value={metrics.pendingPayments}
              subtitle="Menunggu verifikasi"
              icon={CreditCard}
              variant="warning"
            />
          </>
        )}

        {/* Bendahara View */}
        {primaryRole === 'bendahara' && (
          <>
            <StatCard
              title="Menunggu Verifikasi"
              value={metrics.pendingPayments}
              subtitle="Bukti transfer baru"
              icon={CreditCard}
              variant="warning"
            />
            <StatCard
              title="Tugas Finansial"
              value={metrics.activeTasks}
              subtitle="Tugas aktif saya"
              icon={CheckSquare}
            />
            <StatCard
              title="Katalog Program"
              value={metrics.totalPrograms}
              subtitle="Program berbayar/infaq"
              icon={Calendar}
            />
            <StatCard
              title="Batch Terdaftar"
              value={metrics.totalBatches}
              subtitle="Angkatan kelas aktif"
              icon={BookOpen}
            />
          </>
        )}

        {/* Admin Peserta View */}
        {primaryRole === 'admin_peserta' && (
          <>
            <StatCard
              title="Total Peserta"
              value={metrics.totalParticipants}
              subtitle="Deduplikasi WA/Email"
              icon={Users2}
            />
            <StatCard
              title="Pembayaran Masuk"
              value={metrics.pendingPayments}
              subtitle="Perlu pengecekan"
              icon={CreditCard}
              variant="warning"
            />
            <StatCard
              title="Angkatan Kelas"
              value={metrics.totalBatches}
              subtitle="Batch dibuka"
              icon={BookOpen}
            />
            <StatCard
              title="Tugas Saya"
              value={metrics.activeTasks}
              subtitle="Tugas pendaftaran"
              icon={CheckSquare}
            />
          </>
        )}

        {/* Fasilitator View */}
        {primaryRole === 'fasilitator' && (
          <>
            <StatCard
              title="Program Kelas"
              value={metrics.totalPrograms}
              subtitle="Kelas diampu"
              icon={BookOpen}
            />
            <StatCard
              title="Angkatan Berjalan"
              value={metrics.totalBatches}
              subtitle="Batch aktif"
              icon={Calendar}
            />
            <StatCard
              title="Tugas Mengajar"
              value={metrics.activeTasks}
              subtitle="Sesi & materi"
              icon={CheckSquare}
            />
            <StatCard
              title="Peserta Terdaftar"
              value={metrics.totalParticipants}
              subtitle="Di seluruh angkatan"
              icon={Users2}
            />
          </>
        )}

        {/* Kreator Konten View */}
        {primaryRole === 'kreator_konten' && (
          <>
            <StatCard
              title="Program Media"
              value={metrics.totalPrograms}
              subtitle="Podcast & Cerita Ayah"
              icon={Sparkles}
            />
            <StatCard
              title="Tugas Produksi"
              value={metrics.activeTasks}
              subtitle="Desain, Audio & Video"
              icon={CheckSquare}
            />
            <StatCard
              title="Angkatan Terkait"
              value={metrics.totalBatches}
              subtitle="Batch rilis materi"
              icon={Calendar}
            />
            <StatCard
              title="Jangkauan Peserta"
              value={metrics.totalParticipants}
              subtitle="Penerima materi"
              icon={Users2}
            />
          </>
        )}

        {/* Pengurus / Relawan Umum View */}
        {!['super_admin', 'ketua', 'bendahara', 'admin_peserta', 'fasilitator', 'kreator_konten'].includes(
          primaryRole
        ) && (
          <>
            <StatCard
              title="Tugas Operasional"
              value={metrics.activeTasks}
              subtitle="Tugas yang diemban"
              icon={CheckSquare}
            />
            <StatCard
              title="Program Aktif"
              value={metrics.totalPrograms}
              subtitle="Agenda yayasan"
              icon={Calendar}
            />
            <StatCard
              title="Batch Terbuka"
              value={metrics.totalBatches}
              subtitle="Angkatan berjalan"
              icon={BookOpen}
            />
            <StatCard
              title="Laporan Pekanan"
              value="Jumat"
              subtitle="Ritme laporan berkala"
              icon={FileText}
            />
          </>
        )}
      </div>

      {/* Main Grid: Aktivitas & Ritme Yayasan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Aktivitas / Tugas */}
        <div className="lg:col-span-2 rounded-xl border border-[#E8F0F5] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-3">
            <h2 className="text-sm font-bold text-[#385A75]">
              Aktivitas & Tugas Operasional
            </h2>
            <Link
              href="/dashboard/tugas"
              className="text-xs font-semibold text-[#547F9F] hover:text-[#385A75]"
            >
              Lihat Agenda
            </Link>
          </div>

          {metrics.activeTasks === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="Belum Ada Tugas Aktif"
              description="Seluruh penugasan tim operasional dan persiapan batch saat ini telah selesai atau belum dibuat."
              actionText="Kelola Tugas"
              actionHref="/dashboard/tugas"
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-start justify-between rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] p-3.5">
                <div className="space-y-1">
                  <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                    Prioritas
                  </span>
                  <h4 className="text-xs font-bold text-[#385A75]">
                    Penyusunan Materi Modul & Koordinasi Batch
                  </h4>
                  <p className="text-[11px] text-[#252D35]/70">
                    Memastikan persiapan silabus dan ruang kelas daring
                  </p>
                </div>
                <span className="text-[10px] font-medium text-[#252D35]/60 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Aktif
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pengingat Ritme Kerja Pengurus */}
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
