'use client';

import { useActionState } from 'react';
import { submitFridayReportAction, ReportActionResult } from '@/features/reports/actions';
import { FridayReportItem } from '@/features/reports/queries';
import { FileText, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface FridayReportFormProps {
  currentWeekFriday: string;
  existingReport?: FridayReportItem | null;
}

export function FridayReportForm({ currentWeekFriday, existingReport }: FridayReportFormProps) {
  const [state, formAction, isPending] = useActionState<ReportActionResult | null, FormData>(
    submitFridayReportAction,
    null
  );

  return (
    <div className="rounded-xl border border-[#E8F0F5] bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8F0F5] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8F0F5] text-[#547F9F]">
            <FileText className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-[#385A75]">
            Form Laporan Jumat Tiga Baris
          </h3>
        </div>
        <div className="text-xs text-[#252D35]/65">
          Pekan Tanggal: <strong className="text-[#385A75]">{currentWeekFriday}</strong>
        </div>
      </div>

      {state?.message && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-xs font-medium border ${
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

      {existingReport && !state?.success && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
          Anda sudah mengirimkan laporan untuk pekan ini. Menyimpan formulir ini akan <strong>memperbarui (update)</strong> laporan Anda.
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Hidden week_date */}
        <input type="hidden" name="week_date" value={currentWeekFriday} />

        {/* 1. Sudah Apa */}
        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            1. Sudah apa? * (Pekerjaan / target yang selesai sepekan ini)
          </label>
          <textarea
            name="completed_work"
            required
            rows={3}
            defaultValue={existingReport?.completed_work || ''}
            placeholder="Contoh: Menyelesaikan editing 2 video YouTube materi Sesi 1, rekap presensi kelas..."
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.completed_work && (
            <p className="mt-1 text-xs text-red-600">{state.errors.completed_work[0]}</p>
          )}
        </div>

        {/* 2. Akan Apa */}
        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            2. Akan apa? * (Rencana kerja / prioritas sepekan ke depan)
          </label>
          <textarea
            name="upcoming_plan"
            required
            rows={3}
            defaultValue={existingReport?.upcoming_plan || ''}
            placeholder="Contoh: Mempersiapkan poster promosi webinar pranikah, koordinasi narasumber..."
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.upcoming_plan && (
            <p className="mt-1 text-xs text-red-600">{state.errors.upcoming_plan[0]}</p>
          )}
        </div>

        {/* 3. Kendalanya Apa */}
        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            3. Kendalanya apa? * (Hambatan teknis/operasional atau butuh bantuan tim)
          </label>
          <textarea
            name="blockers"
            required
            rows={2}
            defaultValue={existingReport?.blockers || ''}
            placeholder="Tulis kendala yang dihadapi (atau tulis 'Tidak ada kendala' jika semua lancar)..."
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.blockers && (
            <p className="mt-1 text-xs text-red-600">{state.errors.blockers[0]}</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#547F9F] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isPending ? 'Menyimpan Laporan...' : existingReport ? 'Perbarui Laporan Jumat' : 'Kirim Laporan Jumat'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

