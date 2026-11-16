import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import { Target, CheckCircle2, Clock, Users, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default async function TargetsPage() {
  await assertPermission('targets.view_all');
  const user = await getCurrentUser();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#385A75]">Target Operasional & Indikator Kinerja (KPI)</h1>
        <p className="text-xs text-[#252D35]/70 mt-1">
          Pemantauan target bulanan, capaian kuota pendaftaran batch kelas, dan kepatuhan ritme laporan pengurus yayasan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI Pendaftaran Peserta */}
        <div className="rounded-2xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#385A75]">Akuisisi Peserta</span>
            <Target className="w-4 h-4 text-[#547F9F]" />
          </div>
          <div className="text-2xl font-bold text-[#252D35]">100%</div>
          <p className="text-[11px] text-gray-500">Kuota peserta batch terpenuhi sesuai kapasitas ruang.</p>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#547F9F] h-full w-full" />
          </div>
        </div>

        {/* Kepatuhan Laporan Jumat */}
        <div className="rounded-2xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#385A75]">Kepatuhan Laporan Jumat</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#252D35]">Aktif</div>
          <p className="text-[11px] text-gray-500">Rekapitulasi 3-baris mingguan terkompilasi via Humas.</p>
          <Link
            href="/dashboard/laporan-jumat"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#547F9F] hover:underline"
          >
            <span>Buka Panel Laporan Jumat</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Manajemen Tugas */}
        <div className="rounded-2xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#385A75]">Tugas Operasional</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#252D35]">Terkendali</div>
          <p className="text-[11px] text-gray-500">Monitoring progres tugas pengurus dan penugasan PIC.</p>
          <Link
            href="/dashboard/tugas"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#547F9F] hover:underline"
          >
            <span>Kelola Daftar Tugas</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

