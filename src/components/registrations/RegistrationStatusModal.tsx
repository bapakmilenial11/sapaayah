'use client';

import { useActionState, useState } from 'react';
import {
  updateRegistrationStatusAction,
  RegistrationActionResult,
} from '@/features/registrations/actions';
import { RegistrationListItem } from '@/features/registrations/queries';
import { Check, Edit2, X } from 'lucide-react';

interface RegistrationStatusModalProps {
  registration: RegistrationListItem;
  onClose: () => void;
}

export function RegistrationStatusModal({
  registration,
  onClose,
}: RegistrationStatusModalProps) {
  const [state, formAction, isPending] = useActionState<
    RegistrationActionResult | null,
    FormData
  >(updateRegistrationStatusAction, null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-3">
          <h3 className="text-sm font-bold text-[#385A75]">
            Kelola Status Pendaftaran
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#252D35]/50 hover:bg-[#F5F7F8]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-xs space-y-1 bg-[#F5F7F8] p-3 rounded-lg text-[#252D35]/80">
          <div>
            Peserta: <strong className="text-[#385A75]">{registration.participant.full_name}</strong>
          </div>
          <div>
            Program: {registration.batch.program.name} ({registration.batch.name})
          </div>
          <div>Status Saat Ini: <span className="font-semibold uppercase">{registration.status}</span></div>
        </div>

        {state?.message && (
          <div
            className={`rounded-lg p-2.5 text-xs font-medium border ${
              state.success
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input
            type="hidden"
            name="registration_id"
            value={registration.id}
          />

          <div>
            <label className="block text-xs font-semibold text-[#385A75] mb-1">
              Pilih Status Baru *
            </label>
            <select
              name="status"
              defaultValue={registration.status}
              className="w-full rounded-lg border border-[#E8F0F5] bg-white px-3 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
            >
              <option value="submitted">Submitted (Menunggu Verifikasi)</option>
              <option value="under_review">Under Review (Sedang Ditinjau)</option>
              <option value="accepted">Accepted (Diterima / Lolos)</option>
              <option value="waitlisted">Waitlisted (Daftar Tunggu)</option>
              <option value="cancelled">Cancelled (Dibatalkan)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#385A75] mb-1">
              Catatan Admin (Opsional)
            </label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={registration.notes || ''}
              placeholder="Alasan perubahan status / instruksi khusus..."
              className="w-full rounded-lg border border-[#E8F0F5] bg-white px-3 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-[#252D35]/70 hover:bg-[#F5F7F8]"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#385A75] transition disabled:opacity-50"
            >
              {isPending ? 'Menyimpan...' : 'Perbarui Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

