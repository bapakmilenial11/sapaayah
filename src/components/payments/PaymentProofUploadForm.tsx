'use client';

import { useState, useActionState } from 'react';
import {
  submitPaymentProofAction,
  PaymentActionResult,
} from '@/features/payments/actions';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface PaymentProofUploadFormProps {
  paymentId: string;
  amountDue: number;
}

export function PaymentProofUploadForm({
  paymentId,
  amountDue,
}: PaymentProofUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState<
    PaymentActionResult | null,
    FormData
  >(submitPaymentProofAction, null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // 1. Batas ukuran 2 MB
    if (file.size > 2 * 1024 * 1024) {
      setFileError('Ukuran berkas melebihi batas maksimal 2 MB.');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // 2. Format file
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setFileError('Hanya format JPG, PNG, atau PDF yang diizinkan.');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);

    // Buat preview jika format gambar
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="payment_id" value={paymentId} />

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

      {fileError && (
        <div className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-700 border border-red-200">
          {fileError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Bank Pengirim (Asal Transfer) *
          </label>
          <input
            type="text"
            name="sender_bank_name"
            required
            placeholder="Contoh: BCA / Mandiri / BSI"
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.sender_bank_name && (
            <p className="mt-1 text-xs text-red-600">
              {state.errors.sender_bank_name[0]}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#385A75] mb-1">
            Nama Pemilik Rekening Pengirim *
          </label>
          <input
            type="text"
            name="sender_account_name"
            required
            placeholder="Sesuai nama di buku tabungan/rekening"
            className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
          {state?.errors?.sender_account_name && (
            <p className="mt-1 text-xs text-red-600">
              {state.errors.sender_account_name[0]}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#385A75] mb-1">
          Nominal yang Ditransfer (Rp) *
        </label>
        <input
          type="number"
          name="amount_transferred"
          required
          defaultValue={amountDue}
          min={1}
          className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
        />
        {state?.errors?.amount_transferred && (
          <p className="mt-1 text-xs text-red-600">
            {state.errors.amount_transferred[0]}
          </p>
        )}
      </div>

      {/* File Upload Box */}
      <div>
        <label className="block text-xs font-semibold text-[#385A75] mb-1">
          Lampirkan Struk / Screenshot Bukti Transfer *
        </label>
        <div className="rounded-xl border border-dashed border-[#547F9F]/40 bg-[#F5F7F8]/80 p-4 text-center hover:bg-[#E8F0F5]/40 transition">
          <input
            type="file"
            name="proof_file"
            id={`file-input-${paymentId}`}
            required
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor={`file-input-${paymentId}`}
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <UploadCloud className="h-7 w-7 text-[#547F9F]" />
            <div className="text-xs text-[#385A75] font-semibold">
              {selectedFile ? selectedFile.name : 'Pilih Berkas atau Tarik ke Sini'}
            </div>
            <div className="text-[11px] text-[#252D35]/60">
              Maksimal 2 MB • Format JPG, PNG, atau PDF
            </div>
          </label>
        </div>

        {/* Preview Container */}
        {previewUrl && (
          <div className="mt-3 rounded-lg border border-[#E8F0F5] bg-white p-2 flex items-center gap-3">
            <img
              src={previewUrl}
              alt="Pratinjau Bukti Bayar"
              className="h-16 w-16 object-cover rounded"
            />
            <div className="text-xs space-y-0.5">
              <span className="font-semibold text-[#385A75]">Pratinjau Gambar</span>
              <p className="text-[10px] text-[#252D35]/60">
                Pastikan nama bank, tanggal, nominal, dan rekening tujuan terlihat jelas.
              </p>
            </div>
          </div>
        )}

        {selectedFile && !previewUrl && (
          <div className="mt-3 rounded-lg border border-[#E8F0F5] bg-white p-2.5 flex items-center gap-2 text-xs text-[#385A75]">
            <FileText className="h-4 w-4 text-[#547F9F]" />
            <span>Dokumen PDF terpilih: <strong>{selectedFile.name}</strong></span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || !selectedFile}
        className="w-full rounded-lg bg-[#547F9F] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition disabled:opacity-50"
      >
        {isPending ? 'Mengunggah & Memvalidasi...' : 'Kirim Bukti Pembayaran'}
      </button>
    </form>
  );
}

