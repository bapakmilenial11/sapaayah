import React from 'react';
import { FridayReportItem } from '@/features/reports/queries';
import { User, CheckCircle2, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';

interface FridayReportsRecapProps {
  reports: FridayReportItem[];
  selectedWeek: string;
}

export function FridayReportsRecap({ reports, selectedWeek }: FridayReportsRecapProps) {
  return (
    <div className="rounded-xl border border-[#E8F0F5] bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8F0F5] pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#547F9F]" />
          <h3 className="text-sm font-bold text-[#385A75]">
            Rekap Laporan Mingguan Tim (Humas & Pimpinan)
          </h3>
        </div>
        <div className="text-xs text-[#252D35]/65">
          Terkumpul: <strong className="text-[#385A75]">{reports.length} Laporan Pengurus</strong>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E8F0F5] bg-[#F5F7F8] p-8 text-center text-xs text-[#252D35]/60">
          Belum ada pengurus yang mengirimkan Laporan Jumat pada pekan {selectedWeek}.
        </div>
      ) : (
        <div className="divide-y divide-[#E8F0F5]">
          {reports.map((r) => (
            <div key={r.id} className="py-4 space-y-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8F0F5] text-[#547F9F] text-xs font-bold">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#385A75]">
                      {r.profile?.full_name || 'Pengurus Yayasan'}
                    </h4>
                    <span className="text-[10px] text-[#252D35]/50">
                      Waktu submit: {new Date(r.submitted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#F5F7F8] p-3 rounded-lg border border-[#E8F0F5]">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1 mb-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Sudah Apa:
                  </div>
                  <p className="text-xs text-[#252D35]/80 whitespace-pre-line">{r.completed_work}</p>
                </div>

                <div className="bg-[#F5F7F8] p-3 rounded-lg border border-[#E8F0F5]">
                  <div className="text-[10px] font-bold text-[#385A75] uppercase tracking-wide flex items-center gap-1 mb-1">
                    <ArrowRight className="h-3 w-3" />
                    Akan Apa:
                  </div>
                  <p className="text-xs text-[#252D35]/80 whitespace-pre-line">{r.upcoming_plan}</p>
                </div>

                <div className="bg-[#F5F7F8] p-3 rounded-lg border border-[#E8F0F5]">
                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1 mb-1">
                    <AlertTriangle className="h-3 w-3" />
                    Kendalanya:
                  </div>
                  <p className="text-xs text-[#252D35]/80 whitespace-pre-line">{r.blockers}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

