'use client';

import { useActionState, useState } from 'react';
import { uploadMaterialAction, MaterialActionResult } from '@/features/materials/actions';
import { Upload, FileUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MaterialUploadModalProps {
  batchId: string;
  sessionId?: string;
  sessionTitle?: string;
}

export function MaterialUploadModal({
  batchId,
  sessionId,
  sessionTitle,
}: MaterialUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<MaterialActionResult | null, FormData>(
    uploadMaterialAction,
    null
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-1.5 text-xs font-semibold text-[#385A75] hover:bg-[#E8F0F5] hover:text-[#547F9F] transition"
      >
        <FileUp className="h-3.5 w-3.5" />
        <span>Unggah Materi Ajar</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-3">
              <div className="flex items-center gap-2">
                <FileUp className="h-4 w-4 text-[#547F9F]" />
                <h3 className="text-sm font-bold text-[#385A75]">Unggah Materi Sesi</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-[#252D35]/50 hover:text-[#252D35]"
              >
                Tutup
              </button>
            </div>

            {sessionTitle && (
              <div className="text-xs text-[#252D35]/80">
                Sesi: <strong className="text-[#385A75]">{sessionTitle}</strong>
              </div>
            )}

            {state?.message && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium border ${
                  state.success
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {state.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{state.message}</span>
              </div>
            )}

            <form action={formAction} className="space-y-3.5">
              <input type="hidden" name="batch_id" value={batchId} />
              {sessionId && <input type="hidden" name="session_id" value={sessionId} />}

              <div>
                <label className="block text-xs font-semibold text-[#385A75] mb-1">
                  Judul Modul / Berkas Materi *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Contoh: Slide Presentasi Sesi 1 - Fondasi Peran Ayah"
                  className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#385A75] mb-1">
                  Deskripsi / Catatan Tambahan (Opsional)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Keterangan singkat isi materi atau instruksi bacaan..."
                  className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#385A75] mb-1">
                  Pilih Berkas Materi * (PDF / PPTX / DOCX, maks 25 MB)
                </label>
                <input
                  type="file"
                  name="file"
                  required
                  accept=".pdf,.pptx,.ppt,.docx,.doc,.zip"
                  className="w-full text-xs text-[#252D35] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E8F0F5] file:text-[#385A75] hover:file:bg-[#547F9F] hover:file:text-white"
                />
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
                  {isPending ? 'Mengunggah...' : 'Unggah Berkas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

