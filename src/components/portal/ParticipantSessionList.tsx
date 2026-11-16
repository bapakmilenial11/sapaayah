import React from 'react';
import { formatDateTimeIndonesia } from '@/lib/utils';
import { Calendar, Video, Lock, ExternalLink, MessageSquare, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

export interface ParticipantSessionListItem {
  session_id: string;
  session_number: number;
  session_title: string;
  starts_at: string;
  meeting_url: string | null;
  session_status: string;
  attendance_status: 'present' | 'absent' | 'excused' | 'late' | 'not_recorded';
  notes: string | null;
}

interface ParticipantSessionListProps {
  sessions: ParticipantSessionListItem[];
  isRegistrationAccepted: boolean;
}

export function ParticipantSessionList({
  sessions,
  isRegistrationAccepted,
}: ParticipantSessionListProps) {
  const getAttendanceBadge = (status: ParticipantSessionListItem['attendance_status']) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
            <CheckCircle2 className="h-3 w-3" />
            Hadir
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
            <Clock className="h-3 w-3" />
            Terlambat
          </span>
        );
      case 'excused':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
            <AlertCircle className="h-3 w-3" />
            Izin / Sakit
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-800">
            <XCircle className="h-3 w-3" />
            Tidak Hadir
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
            Belum Ada Presensi
          </span>
        );
    }
  };

  const getSessionStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 animate-pulse">
            Sedang Berlangsung
          </span>
        );
      case 'completed':
        return (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
            Selesai
          </span>
        );
      case 'cancelled':
        return (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            Terjadwal
          </span>
        );
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#E8F0F5] bg-white p-8 text-center text-xs text-[#252D35]/60">
        Jadwal sesi pertemuan untuk angkatan ini belum dirilis oleh fasilitator.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <div
          key={s.session_id}
          className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-3 hover:border-[#547F9F]/40 transition"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8F0F5] pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-[#547F9F] px-2 py-0.5 text-[10px] font-semibold text-white">
                Sesi #{s.session_number}
              </span>
              <h4 className="text-sm font-bold text-[#385A75]">{s.session_title}</h4>
              {getSessionStatusBadge(s.session_status)}
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {getAttendanceBadge(s.attendance_status)}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs text-[#252D35]/70">
              <Calendar className="h-4 w-4 text-[#547F9F] shrink-0" />
              <span>{formatDateTimeIndonesia(s.starts_at)}</span>
            </div>

            {/* Aksi Tautan Ruang Kelas Virtual */}
            <div>
              {isRegistrationAccepted ? (
                s.meeting_url ? (
                  <a
                    href={s.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#547F9F] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition"
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Masuk Ruang Kelas</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-xs text-[#252D35]/50 italic">
                    Tautan ruang kelas belum tersedia
                  </span>
                )
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 cursor-not-allowed">
                  <Lock className="h-3.5 w-3.5 text-gray-400" />
                  <span>Tautan terkunci (Menunggu verifikasi)</span>
                </div>
              )}
            </div>
          </div>

          {/* Catatan Presensi dari Fasilitator (jika ada) */}
          {s.notes && (
            <div className="flex items-start gap-2 rounded-lg bg-[#F5F7F8] p-2.5 text-xs text-[#252D35]/75 border border-[#E8F0F5]">
              <MessageSquare className="h-3.5 w-3.5 text-[#547F9F] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#385A75]">Catatan Fasilitator: </span>
                {s.notes}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

