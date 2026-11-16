import React from 'react';
import { UserCheck, Clock, AlertCircle, UserX, BarChart3 } from 'lucide-react';

interface ParticipantAttendanceCardProps {
  stats: {
    total_sessions: number;
    attended_count: number;
    excused_count: number;
    absent_count: number;
    attendance_rate: number;
  };
}

export function ParticipantAttendanceCard({ stats }: ParticipantAttendanceCardProps) {
  return (
    <div className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#547F9F]" />
          <h3 className="text-sm font-bold text-[#385A75]">Riwayat Kehadiran Anda</h3>
        </div>
        <div className="text-xs text-[#252D35]/65">
          Total: <span className="font-bold text-[#385A75]">{stats.total_sessions} Sesi Pertemuan</span>
        </div>
      </div>

      {/* Progress Bar Kehadiran */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#252D35]/70 font-medium">Tingkat Kehadiran Aktif</span>
          <span className="font-extrabold text-[#385A75] text-sm">{stats.attendance_rate}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-[#E8F0F5] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#547F9F] transition-all duration-500"
            style={{ width: `${Math.min(stats.attendance_rate, 100)}%` }}
          />
        </div>
      </div>

      {/* Rincian Status Kehadiran */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="rounded-lg border border-[#E8F0F5] bg-[#F5F7F8]/80 p-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] text-[#252D35]/60">Hadir</div>
            <div className="text-sm font-bold text-emerald-700">{stats.attended_count}</div>
          </div>
        </div>

        <div className="rounded-lg border border-[#E8F0F5] bg-[#F5F7F8]/80 p-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 shrink-0">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] text-[#252D35]/60">Izin / Sakit</div>
            <div className="text-sm font-bold text-blue-700">{stats.excused_count}</div>
          </div>
        </div>

        <div className="rounded-lg border border-[#E8F0F5] bg-[#F5F7F8]/80 p-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 shrink-0">
            <UserX className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] text-[#252D35]/60">Tidak Hadir</div>
            <div className="text-sm font-bold text-red-700">{stats.absent_count}</div>
          </div>
        </div>

        <div className="rounded-lg border border-[#E8F0F5] bg-[#F5F7F8]/80 p-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F0F5] text-[#547F9F] shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] text-[#252D35]/60">Total Sesi</div>
            <div className="text-sm font-bold text-[#385A75]">{stats.total_sessions}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

