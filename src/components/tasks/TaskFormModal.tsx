'use client';

import { useActionState, useState } from 'react';
import { createTaskAction, TaskActionResult } from '@/features/tasks/actions';
import { Plus, CheckSquare } from 'lucide-react';

interface TaskFormModalProps {
  staffList: { id: string; full_name: string }[];
}

export function TaskFormModal({ staffList }: TaskFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<TaskActionResult | null, FormData>(
    createTaskAction,
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
        <span>Buat Tugas Baru</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-[#547F9F]" />
                <h3 className="text-sm font-bold text-[#385A75]">Buat Tugas Operasional</h3>
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
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Contoh: Produksi Poster Promosi Webinar Pranikah"
                  className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                />
                {state?.errors?.title && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#385A75] mb-1">
                  Deskripsi / Rincian Tugas
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Jelaskan kebutuhan tugas, link brief, atau instruksi kerja..."
                  className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#385A75] mb-1">
                    Prioritas *
                  </label>
                  <select
                    name="priority"
                    defaultValue="medium"
                    className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                  >
                    <option value="low">Rendah (Low)</option>
                    <option value="medium">Sedang (Medium)</option>
                    <option value="high">Tinggi (High)</option>
                    <option value="urgent">Mendesak (Urgent)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#385A75] mb-1">
                    Tenggat Waktu (Deadline)
                  </label>
                  <input
                    type="datetime-local"
                    name="due_at"
                    className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#385A75] mb-1">
                  Tugaskan Kepada (PIC)
                </label>
                <select
                  name="assignee_ids"
                  multiple
                  className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none min-h-[90px]"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#252D35]/50 block mt-0.5">
                  Tahan Ctrl (Windows) untuk memilih lebih dari satu PIC.
                </span>
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
                  {isPending ? 'Menyimpan...' : 'Simpan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

