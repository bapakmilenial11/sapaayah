'use client';

import { useActionState } from 'react';
import { createBatchAction, updateBatchAction, ActionResponse } from '@/features/programs/actions';
import { BatchListItem } from '@/features/programs/queries';

interface BatchFormProps {
  programId: string;
  initialData?: BatchListItem | null;
  onSuccess?: () => void;
}

export function BatchForm({ programId, initialData }: BatchFormProps) {
  const isEditing = !!initialData;
  const updateActionWithId = isEditing
    ? updateBatchAction.bind(null, initialData.id)
    : createBatchAction;

  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    updateActionWithId,
    null
  );

  // Format date helper for datetime-local input
  const toInputDate = (isoStr?: string) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toISOString().slice(0, 16);
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="program_id" value={programId} />

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Nomor Angkatan (Batch #) *
          </label>
          <input
            type="number"
            name="batch_number"
            required
            min={1}
            defaultValue={initialData?.batch_number || 1}
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.batch_number && (
            <p className="mt-1 text-xs text-red-600">{state.errors.batch_number[0]}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Nama Batch *
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={initialData?.name || 'Angkatan 1 (Q1 2027)'}
            placeholder="Angkatan 1 (Q1 2027)"
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.name && (
            <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#385A75] mb-1">
          Slug URL Batch *
        </label>
        <input
          type="text"
          name="slug"
          required
          defaultValue={initialData?.slug || ''}
          placeholder="angkatan-1-2027"
          className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
        />
        {state?.errors?.slug && (
          <p className="mt-1 text-xs text-red-600">{state.errors.slug[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Pendaftaran Dibuka *
          </label>
          <input
            type="datetime-local"
            name="registration_open_at"
            required
            defaultValue={toInputDate(initialData?.registration_open_at)}
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.registration_open_at && (
            <p className="mt-1 text-xs text-red-600">{state.errors.registration_open_at[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Pendaftaran Ditutup *
          </label>
          <input
            type="datetime-local"
            name="registration_close_at"
            required
            defaultValue={toInputDate(initialData?.registration_close_at)}
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.registration_close_at && (
            <p className="mt-1 text-xs text-red-600">{state.errors.registration_close_at[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Jadwal Mulai Program *
          </label>
          <input
            type="datetime-local"
            name="start_at"
            required
            defaultValue={toInputDate(initialData?.start_at)}
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.start_at && (
            <p className="mt-1 text-xs text-red-600">{state.errors.start_at[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Jadwal Selesai Program *
          </label>
          <input
            type="datetime-local"
            name="end_at"
            required
            defaultValue={toInputDate(initialData?.end_at)}
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.end_at && (
            <p className="mt-1 text-xs text-red-600">{state.errors.end_at[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Biaya / Infaq (Rp) *
          </label>
          <input
            type="number"
            name="price"
            required
            min={0}
            defaultValue={initialData?.price ?? 0}
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.price && (
            <p className="mt-1 text-xs text-red-600">{state.errors.price[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Kuota Maksimal *
          </label>
          <input
            type="number"
            name="capacity"
            required
            min={1}
            defaultValue={initialData?.capacity || 50}
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.capacity && (
            <p className="mt-1 text-xs text-red-600">{state.errors.capacity[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Status Batch *
          </label>
          <select
            name="status"
            required
            defaultValue={initialData?.status || 'draft'}
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="open">Open (Pendaftaran Dibuka)</option>
            <option value="in_progress">In Progress (Berjalan)</option>
            <option value="completed">Completed (Selesai)</option>
            <option value="cancelled">Cancelled (Dibatalkan)</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#547F9F] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition disabled:opacity-50"
      >
        {isPending ? 'Menyimpan...' : isEditing ? 'Perbarui Batch' : 'Buka Batch Baru'}
      </button>
    </form>
  );
}

