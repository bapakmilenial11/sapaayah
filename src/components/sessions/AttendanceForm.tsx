'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { bulkUpsertAttendanceAction } from '@/features/sessions/actions';
import { AttendanceStatus } from '@/features/sessions/schemas';
import { CheckCircle2, AlertTriangle, ShieldAlert, Save, RefreshCw, UserCheck } from 'lucide-react';

interface ParticipantItem {
  participant_id: string;
  full_name: string;
  email: string;
  phone?: string;
}

interface ExistingRecordItem {
  participant_id: string;
  attendance_status: AttendanceStatus;
  notes: string | null;
}

interface AttendanceFormProps {
  sessionId: string;
  sessionStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  isAdmin: boolean;
  eligibleParticipants: ParticipantItem[];
  existingRecords: ExistingRecordItem[];
}

interface AttendanceRowState {
  participant_id: string;
  attendance_status: AttendanceStatus;
  notes: string;
}

export function AttendanceForm({
  sessionId,
  sessionStatus,
  isAdmin,
  eligibleParticipants,
  existingRecords,
}: AttendanceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Inisialisasi state presensi per peserta
  const [records, setRecords] = useState<AttendanceRowState[]>(() => {
    const recordMap = new Map<string, ExistingRecordItem>();
    existingRecords.forEach((r) => recordMap.set(r.participant_id, r));

    return eligibleParticipants.map((p) => {
      const existing = recordMap.get(p.participant_id);
      return {
        participant_id: p.participant_id,
        attendance_status: existing ? existing.attendance_status : 'present',
        notes: existing?.notes || '',
      };
    });
  });

  const [correctionReason, setCorrectionReason] = useState('');

  // Aturan sesi
  const isCompleted = sessionStatus === 'completed';
  const isCancelled = sessionStatus === 'cancelled';
  const isReadOnly = isCancelled || (isCompleted && !isAdmin);

  // Update status row tertentu
  const handleStatusChange = (participantId: string, newStatus: AttendanceStatus) => {
    if (isReadOnly) return;
    setRecords((prev) =>
      prev.map((r) => (r.participant_id === participantId ? { ...r, attendance_status: newStatus } : r))
    );
  };

  // Update notes row tertentu
  const handleNotesChange = (participantId: string, newNotes: string) => {
    if (isReadOnly) return;
    setRecords((prev) =>
      prev.map((r) => (r.participant_id === participantId ? { ...r, notes: newNotes } : r))
    );
  };

  // Aksi Cepat: Tandai Semua Hadir
  const handleMarkAllPresent = () => {
    if (isReadOnly) return;
    setRecords((prev) => prev.map((r) => ({ ...r, attendance_status: 'present' })));
  };

  // Handler Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (isReadOnly) return;

    if (isCompleted && isAdmin && correctionReason.trim().length < 5) {
      setMessage({
        type: 'error',
        text: 'Koreksi presensi pada sesi yang sudah selesai wajib menyertakan alasan minimal 5 karakter.',
      });
      return;
    }

    startTransition(async () => {
      const result = await bulkUpsertAttendanceAction({
        session_id: sessionId,
        records: records.map((r) => ({
          participant_id: r.participant_id,
          attendance_status: r.attendance_status,
          notes: r.notes.trim() || '',
        })),
        correction_reason: isCompleted && isAdmin ? correctionReason.trim() : '',
      });

      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message || 'Presensi berhasil disimpan secara atomik.',
        });
        router.refresh();
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Gagal menyimpan presensi.',
        });
      }
    });
  };

  return (
    <div className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8F0F5] pb-3">
        <div>
          <h3 className="text-sm font-bold text-[#385A75]">Lembar Presensi Peserta</h3>
          <p className="text-xs text-[#252D35]/65">
            Daftar seluruh peserta yang berstatus diterima (accepted) pada angkatan ini.
          </p>
        </div>

        {!isReadOnly && (
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition self-start sm:self-auto"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Tandai Semua Hadir
          </button>
        )}
      </div>

      {/* Banner Peringatan Status Sesi */}
      {isCancelled && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Sesi ini telah dibatalkan. Pengisian atau pengubahan presensi dinonaktifkan.</span>
        </div>
      )}

      {isCompleted && !isAdmin && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            Sesi telah berstatus <strong>[Selesai]</strong>. Fasilitator hanya dapat melihat data. Pengubahan
            hanya dapat dilakukan oleh Administrator dengan audit trail.
          </span>
        </div>
      )}

      {isCompleted && isAdmin && (
        <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
          <ShieldAlert className="h-4 w-4 shrink-0 text-blue-700 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-800">Mode Koreksi Administratif (Admin)</div>
            <p className="text-[11px] text-blue-700">
              Sesi ini sudah berstatus [Selesai]. Seluruh koreksi kehadiran akan dicatat secara atomik ke dalam
              audit trail sistem beserta alasan koreksi resmi.
            </p>
          </div>
        </div>
      )}

      {/* Alert Notifikasi Submit */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-xs font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {eligibleParticipants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E8F0F5] bg-[#F5F7F8] p-8 text-center text-xs text-[#252D35]/60">
          Belum ada peserta dengan status registrasi diterima (accepted) pada batch ini.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-[#E8F0F5]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7F8] text-[#385A75] border-b border-[#E8F0F5]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold w-12 text-center">No</th>
                  <th className="py-2.5 px-3 font-semibold">Nama Peserta</th>
                  <th className="py-2.5 px-3 font-semibold w-40">Status Kehadiran</th>
                  <th className="py-2.5 px-3 font-semibold">Catatan / Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8F0F5]">
                {eligibleParticipants.map((p, idx) => {
                  const row = records.find((r) => r.participant_id === p.participant_id) || {
                    participant_id: p.participant_id,
                    attendance_status: 'present' as AttendanceStatus,
                    notes: '',
                  };

                  return (
                    <tr key={p.participant_id} className="hover:bg-[#F5F7F8]/50 transition">
                      <td className="py-2.5 px-3 text-center text-[#252D35]/50">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#385A75]">{p.full_name}</div>
                        <div className="text-[11px] text-[#252D35]/55">{p.email}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          disabled={isReadOnly}
                          value={row.attendance_status}
                          onChange={(e) =>
                            handleStatusChange(p.participant_id, e.target.value as AttendanceStatus)
                          }
                          className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-semibold focus:outline-none transition ${
                            row.attendance_status === 'present'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : row.attendance_status === 'late'
                              ? 'border-amber-300 bg-amber-50 text-amber-800'
                              : row.attendance_status === 'excused'
                              ? 'border-blue-300 bg-blue-50 text-blue-800'
                              : 'border-red-300 bg-red-50 text-red-800'
                          } disabled:opacity-70`}
                        >
                          <option value="present">Hadir</option>
                          <option value="late">Terlambat</option>
                          <option value="excused">Izin / Sakit</option>
                          <option value="absent">Tidak Hadir</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={row.notes}
                          onChange={(e) => handleNotesChange(p.participant_id, e.target.value)}
                          placeholder={isReadOnly ? '-' : 'Tambahkan catatan jika perlu...'}
                          className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-2.5 py-1.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none disabled:bg-gray-100 disabled:opacity-70"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Kolom Alasan Koreksi Khusus Admin pada Sesi Selesai */}
          {isCompleted && isAdmin && (
            <div className="space-y-1.5 pt-2 border-t border-[#E8F0F5]">
              <label className="block text-xs font-semibold text-[#385A75]">
                Alasan Koreksi Administratif * (Wajib diisi minimal 5 karakter)
              </label>
              <textarea
                required
                rows={2}
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="Contoh: Koreksi status kehadiran berdasarkan konfirmasi surat izin resmi via WhatsApp..."
                className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
              />
            </div>
          )}

          {/* Tombol Simpan Presensi */}
          {!isReadOnly && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-[#547F9F] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Menyimpan Presensi...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    {isCompleted && isAdmin ? 'Simpan Koreksi Presensi' : 'Simpan Presensi Massal'}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

