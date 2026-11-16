'use client';

import { useActionState, useState } from 'react';
import {
  registerParticipantAction,
  RegistrationActionResult,
} from '@/features/registrations/actions';
import { OpenBatchOption } from '@/features/registrations/queries';
import { UserProfile } from '@/types';
import { formatRupiah, formatDateIndonesia } from '@/lib/utils';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RegistrationFormProps {
  user: UserProfile;
  openBatches: OpenBatchOption[];
  preselectedBatchId?: string;
}

export function RegistrationForm({
  user,
  openBatches,
  preselectedBatchId,
}: RegistrationFormProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    preselectedBatchId || openBatches[0]?.id || ''
  );
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const [state, formAction, isPending] = useActionState<
    RegistrationActionResult | null,
    FormData
  >(registerParticipantAction, null);

  const selectedBatch = openBatches.find((b) => b.id === selectedBatchId);

  if (openBatches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#E8F0F5] bg-[#F5F7F8] p-8 text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-[#547F9F] mx-auto" />
        <h4 className="text-sm font-bold text-[#385A75]">
          Belum Ada Pendaftaran yang Dibuka
        </h4>
        <p className="text-xs text-[#252D35]/70 max-w-md mx-auto">
          Saat ini belum ada batch kelas atau program yang membuka masa pendaftaran. Silakan cek kembali secara berkala.
        </p>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50/70 p-8 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#385A75]">
            Pendaftaran Berhasil Dikirim!
          </h3>
          <p className="text-xs text-[#252D35]/80 max-w-md mx-auto">
            {state.message}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#547F9F] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition"
          >
            Buka Portal Peserta Saya
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && !state.success && (
        <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
          {state.message}
        </div>
      )}

      {/* 1. Pilih Batch & Program */}
      <div className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-[#385A75] uppercase tracking-wider">
          1. Pilih Program & Angkatan
        </h3>

        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Program & Batch Terbuka *
          </label>
          <select
            name="batch_id"
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            required
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          >
            {openBatches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.program.name} — {b.name} ({b.price === 0 ? 'Gratis' : formatRupiah(b.price)})
              </option>
            ))}
          </select>
          {state?.errors?.batch_id && (
            <p className="mt-1 text-xs text-red-600">{state.errors.batch_id[0]}</p>
          )}
        </div>

        {selectedBatch && (
          <div className="rounded-lg bg-[#E8F0F5]/50 p-3 text-xs space-y-1 text-[#252D35]/80">
            <div className="flex justify-between">
              <span>Batas Pendaftaran:</span>
              <span className="font-semibold text-[#385A75]">
                {formatDateIndonesia(selectedBatch.registration_close_at)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Infaq / Investasi Belajar:</span>
              <span className="font-bold text-[#547F9F]">
                {selectedBatch.price === 0 ? 'Gratis' : formatRupiah(selectedBatch.price)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Informasi Peserta */}
      <div className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-[#385A75] uppercase tracking-wider">
          2. Data Identitas Peserta
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#385A75] mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              name="full_name"
              required
              defaultValue={user.fullName}
              className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
            />
            {state?.errors?.full_name && (
              <p className="mt-1 text-xs text-red-600">{state.errors.full_name[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#385A75] mb-1">
              Alamat Email Aktif *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="nama@email.com"
              className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#385A75] mb-1">
              Nomor WhatsApp *
            </label>
            <input
              type="tel"
              name="phone"
              required
              defaultValue={user.phone || ''}
              placeholder="081234567890"
              className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
            />
            {state?.errors?.phone && (
              <p className="mt-1 text-xs text-red-600">{state.errors.phone[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#385A75] mb-1">
              Kota / Kabupaten Domisili *
            </label>
            <input
              type="text"
              name="city"
              required
              placeholder="Contoh: Jakarta Selatan"
              className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
            />
            {state?.errors?.city && (
              <p className="mt-1 text-xs text-red-600">{state.errors.city[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#385A75] mb-1">
              Status Pernikahan *
            </label>
            <select
              name="marital_status"
              required
              defaultValue="married_with_children"
              className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
            >
              <option value="married_with_children">Menikah (Memiliki Anak)</option>
              <option value="married_no_children">Menikah (Belum Memiliki Anak)</option>
              <option value="engaged">Menuju Pernikahan (Calon Ayah)</option>
              <option value="single">Lajang (Single)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#385A75] mb-1">
              Jumlah Anak
            </label>
            <input
              type="number"
              name="number_of_children"
              min={0}
              defaultValue={1}
              className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Harapan atau Catatan Khusus untuk Panitia (Opsional)
          </label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Apa yang paling ingin Anda pelajari atau diskusikan pada kelas ini?"
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Konfirmasi & Pengiriman */}
      <div className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="confirmation"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="mt-0.5 rounded border-[#E8F0F5] text-[#547F9F] focus:ring-[#547F9F]"
          />
          <label htmlFor="confirmation" className="text-xs text-[#252D35]/80 leading-relaxed">
            Saya menyatakan bahwa data yang diisikan adalah benar dan bersedia mengikuti seluruh tata tertib pembelajaran di SAPA Ayah.
          </label>
        </div>

        <button
          type="submit"
          disabled={!isConfirmed || isPending}
          className="w-full rounded-lg bg-[#547F9F] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition disabled:opacity-50"
        >
          {isPending ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran Sekarang'}
        </button>
      </div>
    </form>
  );
}

