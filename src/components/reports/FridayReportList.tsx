import React from 'react';
import { FridayReportItem } from '@/features/reports/queries';
import { formatDateIndonesia } from '@/lib/utils';
import { CheckCircle2, Calendar, AlertTriangle, ArrowRight, FileText } from 'lucide-react';

interface FridayReportListProps {
  reports: FridayReportItem[];
}

export function FridayReportList({ reports }: FridayReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#E8F0F5] bg-white p-8 text-center text-xs text-[#252D35]/60">
        Belum ada riwayat Laporan Jumat yang dikirimkan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-3 hover:border-[#547F9F]/30 transition"
        >
          <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#547F9F]" />
              <span className="text-xs font-bold text-[#385A75]">
                Pekan Jumat: {formatDateIndonesia(r.week_date)}
              </span>
            </div>
            <span className="text-[11px] text-[#252D35]/50">
              Dikirim: {new Date(r.submitted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-[#252D35]">
            <div className="bg-[#F5F7F8] p-3 rounded-lg border border-[#E8F0F5]">
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                1. Sudah apa?
              </div>
              <p className="text-xs text-[#252D35]/85 whitespace-pre-line">{r.completed_work}</p>
            </div>

            <div className="bg-[#F5F7F8] p-3 rounded-lg border border-[#E8F0F5]">
              <div className="text-[11px] font-bold text-[#385A75] uppercase tracking-wide flex items-center gap-1.5 mb-1">
                <ArrowRight className="h-3.5 w-3.5" />
                2. Akan apa?
              </div>
              <p className="text-xs text-[#252D35]/85 whitespace-pre-line">{r.upcoming_plan}</p>
            </div>

            <div className="bg-[#F5F7F8] p-3 rounded-lg border border-[#E8F0F5]">
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                3. Kendalanya apa?
              </div>
              <p className="text-xs text-[#252D35]/85 whitespace-pre-line">{r.blockers}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

