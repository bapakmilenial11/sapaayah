import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import {
  getCurrentWeekFridayDate,
  getMyFridayReports,
  getMyReportForWeek,
  getAllFridayReportsByWeek,
} from '@/features/reports/queries';
import { FridayReportForm } from '@/components/reports/FridayReportForm';
import { FridayReportList } from '@/components/reports/FridayReportList';
import { FridayReportsRecap } from '@/components/reports/FridayReportsRecap';
import { StatCard } from '@/components/dashboard/StatCard';
import { FileText, Calendar, CheckCircle2, History } from 'lucide-react';

export default async function FridayReportsPage() {
  await assertPermission('weekly_reports.submit');

  const user = await getCurrentUser();
  const currentFriday = getCurrentWeekFridayDate();

  // Load laporan personal & laporan pekan ini
  const [myReports, existingThisWeek] = await Promise.all([
    getMyFridayReports(),
    getMyReportForWeek(currentFriday),
  ]);

  // Cek apakah user berwenang melihat rekap seluruh tim (Humas, Pimpinan, Super Admin)
  const canViewAll =
    user?.roles.includes('super_admin') ||
    user?.roles.includes('ketua') ||
    user?.roles.includes('pengurus') ||
    user?.permissions.includes('weekly_reports.view_all') ||
    user?.permissions.includes('weekly_reports.recap');

  const allReportsThisWeek = canViewAll
    ? await getAllFridayReportsByWeek(currentFriday)
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F0F5] text-[#547F9F]">
              <FileText className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">
              Laporan Jumat Tiga Baris
            </h1>
          </div>
          <p className="text-xs text-[#252D35]/70 mt-1">
            Ritme akuntabilitas mingguan pengurus yayasan: Sudah apa, Akan apa, dan Kendalanya apa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#E8F0F5] px-3 py-1 text-xs font-semibold text-[#547F9F] flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Pekan Ini: {currentFriday}
          </span>
        </div>
      </div>

      {/* Grid Metrik Singkat */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Status Pekan Ini"
          value={existingThisWeek ? 'Sudah Mengisi' : 'Belum Mengisi'}
          subtitle={`Pekan Jumat ${currentFriday}`}
          icon={CheckCircle2}
          variant={existingThisWeek ? 'success' : 'warning'}
        />
        <StatCard
          title="Total Laporan Pribadi"
          value={myReports.length}
          subtitle="Pekan terlapor sepanjang masa tugas"
          icon={History}
          variant="primary"
        />
        {canViewAll && (
          <StatCard
            title="Laporan Tim Terkumpul"
            value={allReportsThisWeek.length}
            subtitle="Pengurus telah mengisi pekan ini"
            icon={FileText}
            variant="info"
          />
        )}
      </div>

      {/* Form Laporan Jumat Pekan Ini */}
      <FridayReportForm
        currentWeekFriday={currentFriday}
        existingReport={existingThisWeek}
      />

      {/* Panel Rekap Humas & Pimpinan (Jika Berwenang) */}
      {canViewAll && (
        <FridayReportsRecap
          reports={allReportsThisWeek}
          selectedWeek={currentFriday}
        />
      )}

      {/* Riwayat Laporan Jumat Pribadi */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-[#E8F0F5] pb-2">
          <History className="h-4 w-4 text-[#547F9F]" />
          <h3 className="text-sm font-bold text-[#385A75]">Riwayat Laporan Jumat Anda</h3>
        </div>
        <FridayReportList reports={myReports} />
      </div>
    </div>
  );
}

