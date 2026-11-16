'use client';

import { useActionState } from 'react';
import { createSessionAction, SessionActionResult } from '@/features/sessions/actions';

interface SessionFormProps {
  batchId: string;
  batchName?: string;
  onSuccess?: () => void;
}

export function SessionForm({ batchId, batchName }: SessionFormProps) {
  const [state, formAction, isPending] = useActionState<SessionActionResult | null, FormData>(
    createSessionAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.message && (
        <div
          className={`rounded-lg p-3 text-xs font-medium border ${
            state.success
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Hidden batch_id input */}
      <input type="hidden" name="batch_id" value={batchId} />

      {batchName && (
        <div className="rounded-lg bg-[#E8F0F5]/50 px-3 py-2 text-xs text-[#385A75]">
          Menjadwalkan untuk: <span className="font-semibold">{batchName}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Nomor Sesi *
          </label>
          <input
            type="number"
            name="session_number"
            min={1}
            required
            defaultValue={1}
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.session_number && (
            <p className="mt-1 text-xs text-red-600">{state.errors.session_number[0]}</p>
          )}
        </div>

        <div className="sm:col-span-3">
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Judul Sesi Pertemuan *
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="Contoh: Sesi 1 - Fondasi Peran Ayah dalam Keluarga"
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.title && (
            <p className="mt-1 text-xs text-red-600">{state.errors.title[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Waktu Mulai *
          </label>
          <input
            type="datetime-local"
            name="starts_at"
            required
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.starts_at && (
            <p className="mt-1 text-xs text-red-600">{state.errors.starts_at[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Waktu Selesai *
          </label>
          <input
            type="datetime-local"
            name="ends_at"
            required
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.ends_at && (
            <p className="mt-1 text-xs text-red-600">{state.errors.ends_at[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#385A75] mb-1">
          Tautan Pertemuan Online (Meeting URL)
        </label>
        <input
          type="url"
          name="meeting_url"
          placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
          className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
        />
        {state?.errors?.meeting_url && (
          <p className="mt-1 text-xs text-red-600">{state.errors.meeting_url[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#385A75] mb-1">
          Deskripsi & Topik Bahasan
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="Ringkasan agenda pembelajaran, instruksi persiapan, atau materi pokok..."
          className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
        />
        {state?.errors?.description && (
          <p className="mt-1 text-xs text-red-600">{state.errors.description[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#547F9F] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition disabled:opacity-50"
      >
        {isPending ? 'Menjadwalkan Sesi...' : 'Jadwalkan Sesi Pertemuan'}
      </button>
    </form>
  );
}

