'use client';

import { useActionState, useState } from 'react';
import { assignPersonnelAction, OrgActionResult } from '@/features/organization/actions';
import { UserCheck } from 'lucide-react';

interface PersonnelAssignmentModalProps {
  positionId: string;
  positionTitle: string;
  staffList: { id: string; full_name: string }[];
}

export function PersonnelAssignmentModal({
  positionId,
  positionTitle,
  staffList,
}: PersonnelAssignmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<OrgActionResult | null, FormData>(
    assignPersonnelAction,
    null
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-2.5 py-1 text-[11px] font-semibold text-[#385A75] hover:bg-[#E8F0F5] transition"
      >
        <UserCheck className="h-3 w-3 text-[#547F9F]" />
        <span>Tugaskan Personel</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-3">
              <h3 className="text-sm font-bold text-[#385A75]">Tugaskan Personel</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-[#252D35]/50 hover:text-[#252D35]"
              >
                Tutup
              </button>
            </div>

            <div className="text-xs text-[#252D35]/80">
              Menugaskan personel pada jabatan: <strong className="text-[#385A75]">{positionTitle}</strong>
            </div>

            {state?.message && (
              <div
                className={`p-3 rounded-lg text-xs font-medium border ${
                  state.success
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {state.message}
              </div>
            )}

            <form action={formAction} className="space-y-3.5">
              <input type="hidden" name="position_id" value={positionId} />

              <div>
                <label className="block text-xs font-semibold text-[#385A75] mb-1">
                  Pilih Personel Pengurus *
                </label>
                <select
                  name="profile_id"
                  required
                  className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                >
                  <option value="">-- Pilih Akun Pengurus --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
                {state?.errors?.profile_id && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.profile_id[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#385A75] mb-1">
                    Tanggal Mulai Tugas *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    required
                    defaultValue={today}
                    className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                  />
                  {state?.errors?.start_date && (
                    <p className="mt-1 text-xs text-red-600">{state.errors.start_date[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#385A75] mb-1">
                    Tanggal Akhir (Opsional)
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8F0F5]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-[#252D35]/70 hover:bg-[#F5F7F8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition disabled:opacity-50"
                >
                  {isPending ? 'Menugaskan...' : 'Simpan Penugasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

