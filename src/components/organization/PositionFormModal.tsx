'use client';

import { useActionState, useState } from 'react';
import { createPositionAction, OrgActionResult } from '@/features/organization/actions';
import { OrganizationalUnitItem, PositionDetailItem } from '@/features/organization/queries';
import { Plus, Building2 } from 'lucide-react';

interface PositionFormModalProps {
  units: OrganizationalUnitItem[];
  existingPositions: PositionDetailItem[];
}

export function PositionFormModal({ units, existingPositions }: PositionFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<OrgActionResult | null, FormData>(
    createPositionAction,
    null
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition"
      >
        <Plus className="h-4 w-4" />
        <span>Tambah Jabatan</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#547F9F]" />
                <h3 className="text-sm font-bold text-[#385A75]">Tambah Jabatan Struktural</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-[#252D35]/50 hover:text-[#252D35]"
              >
                Tutup
              </button>
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
              <div>
                <label className="block text-xs font-semibold text-[#385A75] mb-1">
                  Unit Kerja Organisasi *
                </label>
                <select
                  name="unit_id"
                  required
                  className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                >
                  <option value="">-- Pilih Unit Kerja --</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
                {state?.errors?.unit_id && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.unit_id[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#385A75] mb-1">
                  Judul Jabatan / Posisi *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Contoh: Koordinator Humas & Kemitraan"
                  className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                />
                {state?.errors?.title && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#385A75] mb-1">
                  Jabatan Atasan Langsung (Hierarki)
                </label>
                <select
                  name="parent_position_id"
                  className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                >
                  <option value="">-- Tidak Ada / Pimpinan Utama --</option>
                  {existingPositions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.unit.name})
                    </option>
                  ))}
                </select>
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
                  {isPending ? 'Menyimpan...' : 'Simpan Jabatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

