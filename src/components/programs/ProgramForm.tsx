'use client';

import { useActionState } from 'react';
import { createProgramAction, updateProgramAction, ActionResponse } from '@/features/programs/actions';
import { ProgramListItem } from '@/features/programs/queries';

interface ProgramFormProps {
  initialData?: ProgramListItem | null;
  onSuccess?: () => void;
}

export function ProgramForm({ initialData, onSuccess }: ProgramFormProps) {
  const isEditing = !!initialData;
  const updateActionWithId = isEditing
    ? updateProgramAction.bind(null, initialData.id)
    : createProgramAction;

  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    updateActionWithId,
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

      <div>
        <label className="block text-xs font-semibold text-[#385A75] mb-1">
          Nama Program *
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={initialData?.name || ''}
          placeholder="Contoh: Kelas Menjadi Ayah"
          className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
        />
        {state?.errors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#385A75] mb-1">
          Slug URL *
        </label>
        <input
          type="text"
          name="slug"
          required
          defaultValue={initialData?.slug || ''}
          placeholder="kelas-menjadi-ayah"
          className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
        />
        {state?.errors?.slug && (
          <p className="mt-1 text-xs text-red-600">{state.errors.slug[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Jenis Program *
          </label>
          <select
            name="program_type"
            required
            defaultValue={initialData?.program_type || 'class'}
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          >
            <option value="class">Class (Kelas Tematik)</option>
            <option value="journey">Journey (Program Berkelanjutan)</option>
            <option value="webinar">Webinar</option>
            <option value="camp">Ayah Camp (Offline Outbound)</option>
            <option value="talk">Talk / Diskusi Panel</option>
            <option value="stories">Cerita Ayah</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Status Visibilitas *
          </label>
          <select
            name="visibility"
            required
            defaultValue={initialData?.visibility || 'draft'}
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          >
            <option value="draft">Draft (Internal)</option>
            <option value="published">Published (Tayang Publik)</option>
            <option value="archived">Archived (Diarsipkan)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#385A75] mb-1">
          Tagline Singkat
        </label>
        <input
          type="text"
          name="tagline"
          defaultValue={initialData?.tagline || ''}
          placeholder="Membangun Fondasi Kepemimpinan Ayah dalam Keluarga"
          className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#385A75] mb-1">
          Deskripsi Lengkap
        </label>
        <textarea
          name="description"
          rows={4}
          defaultValue={initialData?.description || ''}
          placeholder="Jelaskan kurikulum, tujuan, dan sasaran peserta program..."
          className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#547F9F] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition disabled:opacity-50"
      >
        {isPending
          ? 'Menyimpan...'
          : isEditing
          ? 'Perbarui Program'
          : 'Simpan Program Baru'}
      </button>
    </form>
  );
}

