import React from 'react';
import { Users, UserCheck, UserX, Clock, AlertCircle, BarChart3 } from 'lucide-react';

interface AttendanceRecapProps {
  recap: {
    session_id: string;
    total_eligible: number;
    recorded_count: number;
    present_count: number;
    absent_count: number;
    excused_count: number;
    late_count: number;
    attendance_percentage: number;
  };
}

export function AttendanceRecap({ recap }: AttendanceRecapProps) {
  return (
    <div className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#547F9F]" />
          <h3 className="text-sm font-bold text-[#385A75]">Rekap Kehadiran Sesi</h3>
        </div>
        <div className="text-xs text-[#252D35]/60">
          Tercatat:{' '}
          <span className="font-bold text-[#385A75]">
            {recap.recorded_count} / {recap.total_eligible}
          </span>{' '}
          Peserta
        </div>
      </div>

      {/* Progress Bar Persentase Kehadiran */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#252D35]/70 font-medium">Tingkat Kehadiran Aktif (Hadir + Terlambat)</span>
          <span className="font-extrabold text-[#385A75]">{recap.attendance_percentage}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-[#E8F0F5] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#547F9F] transition-all duration-500"
            style={{ width: `${Math.min(recap.attendance_percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Grid Statistik Kehadiran */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="rounded-lg border border-[#E8F0F5] bg-[#F5F7F8]/80 p-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#252D35]/60">Hadir</div>
            <div className="text-base font-bold text-emerald-700">{recap.present_count}</div>
          </div>
        </div>

        <div className="rounded-lg border border-[#E8F0F5] bg-[#F5F7F8]/80 p-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#252D35]/60">Terlambat</div>
            <div className="text-base font-bold text-amber-700">{recap.late_count}</div>
          </div>
        </div>

        <div className="rounded-lg border border-[#E8F0F5] bg-[#F5F7F8]/80 p-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#252D35]/60">Izin / Sakit</div>
            <div className="text-base font-bold text-blue-700">{recap.excused_count}</div>
          </div>
        </div>

        <div className="rounded-lg border border-[#E8F0F5] bg-[#F5F7F8]/80 p-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-700">
            <UserX className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#252D35]/60">Tidak Hadir</div>
            <div className="text-base font-bold text-red-700">{recap.absent_count}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

