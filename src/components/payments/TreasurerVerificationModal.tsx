'use client';

import { useState, useEffect } from 'react';
import { VerificationQueueItem } from '@/features/payments/queries';
import { verifyPaymentAction, getProofSignedUrlAction } from '@/features/payments/actions';
import { formatCurrency, formatDateIndonesia } from '@/lib/utils';
import {
  X,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Loader2,
  Eye,
  Lock,
  User,
  Building,
  CreditCard,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface TreasurerVerificationModalProps {
  item: VerificationQueueItem;
  isOpen: boolean;
  onClose: () => void;
  canVerify: boolean;
  currentUserId?: string;
}

export function TreasurerVerificationModal({
  item,
  isOpen,
  onClose,
  canVerify,
  currentUserId,
}: TreasurerVerificationModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Form states
  const [decision, setDecision] = useState<'verified' | 'rejected'>('verified');
  const [notes, setNotes] = useState('');
  const [confirmStep, setConfirmStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Fetch signed URL when modal opens
  useEffect(() => {
    if (isOpen && item.proof_storage_path) {
      setUrlLoading(true);
      setUrlError(null);
      setSignedUrl(null);
      setFeedback(null);
      setConfirmStep(false);
      setNotes('');
      setDecision('verified');

      getProofSignedUrlAction(item.proof_storage_path).then((res) => {
        setUrlLoading(false);
        if (res.success && res.url) {
          setSignedUrl(res.url);
        } else {
          setUrlError(res.message || 'Gagal membuat signed URL.');
        }
      });
    }
  }, [isOpen, item.proof_storage_path]);

  if (!isOpen) return null;

  const isPdf = item.proof_storage_path.toLowerCase().endsWith('.pdf');
  const isPending = ['submitted', 'under_review'].includes(item.submission_status);

  // Periksa apakah nominal transfer sesuai dengan total tagihan
  const isAmountMatching = item.amount_transferred === item.amount_due;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmStep) {
      // Validasi catatan jika rejected
      if (decision === 'rejected' && (!notes || notes.trim().length < 5)) {
        setFeedback({
          success: false,
          message: 'Catatan penolakan wajib diisi minimal 5 karakter untuk menjelaskan alasan kepada peserta.',
        });
        return;
      }
      setConfirmStep(true);
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('submission_id', item.submission_id);
    formData.append('decision', decision);
    formData.append('notes', notes.trim());

    try {
      const res = await verifyPaymentAction(null, formData);
      setIsSubmitting(false);
      if (res.success) {
        setFeedback({ success: true, message: res.message });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setFeedback({ success: false, message: res.message });
        setConfirmStep(false);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ success: false, message: err.message || 'Terjadi kesalahan sistem.' });
      setConfirmStep(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-[#E8F0F5] overflow-hidden my-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-[#E8F0F5] px-6 py-4 bg-[#F5F7F8]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F0F5] text-[#385A75]">
                Pengajuan #{item.submission_number}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#385A75]">
                Tinjauan Bukti Transfer Pembayaran
              </h2>
            </div>
            <p className="text-xs text-[#252D35]/70 mt-0.5">
              ID Pembayaran: <span className="font-mono">{item.payment_id.slice(0, 8)}...</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#252D35]/60 hover:bg-[#E8F0F5] hover:text-[#252D35] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body: Split View (Details & Proof) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                feedback.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              )}
              <p className="font-medium">{feedback.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kolom Kiri: Rincian Pendaftar & Nominal */}
            <div className="space-y-4">
              <div className="bg-[#F5F7F8] p-4 rounded-xl border border-[#E8F0F5] space-y-3">
                <h3 className="text-xs font-bold text-[#385A75] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-4 w-4 text-[#547F9F]" />
                  Informasi Peserta & Program
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[#252D35]/60">Nama Lengkap:</span>
                    <p className="font-semibold text-[#252D35]">{item.participant_name}</p>
                  </div>
                  <div>
                    <span className="text-[#252D35]/60">Kontak:</span>
                    <p className="text-[#252D35]">
                      {item.participant_phone} • {item.participant_email}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#252D35]/60">Program & Batch:</span>
                    <p className="font-medium text-[#385A75]">
                      {item.program_name} ({item.batch_name})
                    </p>
                  </div>
                </div>
              </div>

              {/* Rincian Tagihan vs Transfer */}
              <div className="bg-white p-4 rounded-xl border border-[#E8F0F5] space-y-3 shadow-xs">
                <h3 className="text-xs font-bold text-[#385A75] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-[#547F9F]" />
                  Pemeriksaan Nominal Transfer
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#F5F7F8] p-2.5 rounded-lg border border-[#E8F0F5]">
                    <span className="text-[11px] text-[#252D35]/60 block">Total Tagihan Sistem</span>
                    <span className="font-bold text-[#385A75] text-sm">
                      {formatCurrency(item.amount_due)}
                    </span>
                    <span className="text-[10px] text-[#252D35]/50 block">
                      (Kode Unik: {item.unique_code})
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-lg border ${
                      isAmountMatching
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-amber-50/60 border-amber-200'
                    }`}
                  >
                    <span className="text-[11px] text-[#252D35]/60 block">Nominal Ditransfer</span>
                    <span
                      className={`font-bold text-sm ${
                        isAmountMatching ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {formatCurrency(item.amount_transferred)}
                    </span>
                    <span className="text-[10px] text-[#252D35]/60 block">
                      {isAmountMatching ? '✓ Sesuai tagihan' : '⚠ Selisih dengan tagihan'}
                    </span>
                  </div>
                </div>

                {!isAmountMatching && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 text-amber-800 text-[11px]">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>
                      Perhatian: Terdapat selisih nominal Rp{' '}
                      {Math.abs(item.amount_transferred - item.amount_due).toLocaleString('id-ID')}.
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#E8F0F5] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#252D35]/60">Bank Pengirim:</span>
                    <span className="font-semibold text-[#252D35]">
                      {item.sender_bank_name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#252D35]/60">Nama Pemilik Rekening:</span>
                    <span className="font-semibold text-[#252D35]">
                      {item.sender_account_name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#252D35]/60">Waktu Pengajuan:</span>
                    <span className="text-[#252D35]">
                      {formatDateIndonesia(item.submitted_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Review Terakhir (jika sudah diverifikasi/ditolak sebelumnya) */}
              {item.latest_verification && (
                <div className="p-3.5 rounded-xl border border-[#E8F0F5] bg-[#F5F7F8] text-xs space-y-1">
                  <span className="font-semibold text-[#385A75] block">
                    Riwayat Keputusan Terakhir:
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                        item.latest_verification.decision === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.latest_verification.decision}
                    </span>
                    <span className="text-[#252D35]/60 text-[11px]">
                      {formatDateIndonesia(item.latest_verification.decided_at)}
                    </span>
                  </div>
                  {item.latest_verification.notes && (
                    <p className="text-[#252D35]/80 text-[11px] italic mt-1">
                      &quot;{item.latest_verification.notes}&quot;
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Kolom Kanan: Preview Bukti Transfer (Signed URL) */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#385A75] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-[#547F9F]" />
                  Bukti Berkas Transfer (Privat)
                </h3>
                {signedUrl && (
                  <a
                    href={signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#547F9F] hover:underline"
                  >
                    Buka Berkas <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="flex-1 min-h-[320px] max-h-[460px] rounded-xl border border-[#E8F0F5] bg-[#F5F7F8] p-3 flex flex-col items-center justify-center overflow-hidden">
                {urlLoading ? (
                  <div className="flex flex-col items-center gap-2 text-xs text-[#252D35]/60">
                    <Loader2 className="h-6 w-6 animate-spin text-[#547F9F]" />
                    <span>Membuat tautan akses privat aman (15 menit)...</span>
                  </div>
                ) : urlError ? (
                  <div className="p-4 text-center text-xs text-red-600 space-y-1">
                    <AlertCircle className="h-6 w-6 mx-auto text-red-500" />
                    <p className="font-semibold">Gagal memuat bukti transfer</p>
                    <p className="text-[11px] text-red-500">{urlError}</p>
                  </div>
                ) : signedUrl ? (
                  isPdf ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-white rounded-lg border border-[#E8F0F5]">
                      <FileText className="h-16 w-16 text-[#547F9F]" />
                      <div>
                        <p className="font-semibold text-xs text-[#252D35]">Dokumen Bukti Transfer PDF</p>
                        <p className="text-[11px] text-[#252D35]/60 mt-0.5">
                          Tautan privat berlaku selama 15 menit.
                        </p>
                      </div>
                      <a
                        href={signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#385A75] transition"
                      >
                        Lihat Berkas PDF Lengkap <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center overflow-auto bg-black/5 rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={signedUrl}
                        alt="Bukti Transfer"
                        className="max-h-full max-w-full object-contain rounded shadow-xs"
                      />
                    </div>
                  )
                ) : null}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#252D35]/60 px-1">
                <Lock className="h-3 w-3 text-[#547F9F]" />
                <span>Penyimpanan privat terenkripsi. URL otomatis kedaluwarsa dalam 15 menit.</span>
              </div>
            </div>
          </div>

          {/* Form Keputusan Verifikasi (Hanya jika memiliki hak verifikasi dan status masih antrean) */}
          {canVerify && isPending ? (
            <form onSubmit={handleSubmit} className="border-t border-[#E8F0F5] pt-5 space-y-4">
              <h3 className="text-xs font-bold text-[#385A75] uppercase tracking-wider">
                Keputusan Verifikasi Bendahara
              </h3>

              {!confirmStep ? (
                <div className="space-y-4">
                  {/* Pilihan Keputusan */}
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        decision === 'verified'
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-xs'
                          : 'border-[#E8F0F5] bg-white hover:bg-[#F5F7F8]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="decision"
                        value="verified"
                        checked={decision === 'verified'}
                        onChange={() => setDecision('verified')}
                        className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      <div>
                        <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Setujui Pembayaran (Verified)
                        </span>
                        <span className="text-[11px] text-[#252D35]/70 block mt-0.5">
                          Dana valid, status pendaftaran peserta otomatis menjadi Diterima (Accepted).
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        decision === 'rejected'
                          ? 'border-red-500 bg-red-50/50 text-red-950 shadow-xs'
                          : 'border-[#E8F0F5] bg-white hover:bg-[#F5F7F8]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="decision"
                        value="rejected"
                        checked={decision === 'rejected'}
                        onChange={() => setDecision('rejected')}
                        className="text-red-600 focus:ring-red-500 h-4 w-4"
                      />
                      <div>
                        <span className="font-bold text-xs flex items-center gap-1.5 text-red-800">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Tolak Pembayaran (Rejected)
                        </span>
                        <span className="text-[11px] text-[#252D35]/70 block mt-0.5">
                          Bukti buram, nominal salah, atau tidak valid. Peserta diminta upload ulang.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Input Catatan */}
                  <div>
                    <label className="block text-xs font-semibold text-[#252D35] mb-1">
                      Catatan Verifikasi {decision === 'rejected' && <span className="text-red-600">* (Wajib diisi jika ditolak)</span>}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={
                        decision === 'verified'
                          ? 'Catatan opsional, contoh: "Dana masuk mutasi BSI tanggal 13 Nov".'
                          : 'Jelaskan alasan penolakan, contoh: "Nominal tidak sesuai kode unik, mohon transfer sisa Rp 250 atau lampirkan struk jelas".'
                      }
                      rows={2}
                      className="w-full rounded-xl border border-[#E8F0F5] p-3 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
                    />
                    <p className="text-[10px] text-[#252D35]/60 mt-1">
                      Catatan ini akan disimpan dalam audit log dan ditampilkan pada portal peserta.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-[#E8F0F5] px-4 py-2 text-xs font-semibold text-[#252D35] hover:bg-[#F5F7F8] transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={`rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-sm transition ${
                        decision === 'verified'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      Lanjutkan Konfirmasi
                    </button>
                  </div>
                </div>
              ) : (
                /* Step Konfirmasi Sebelum Eksekusi */
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-amber-900">
                        Konfirmasi Keputusan Akhir
                      </h4>
                      <p className="text-xs text-amber-800 mt-1">
                        Apakah Anda yakin ingin{' '}
                        <span className="font-bold uppercase">
                          {decision === 'verified' ? 'MENYETUJUI' : 'MENOLAK'}
                        </span>{' '}
                        pembayaran ini?
                      </p>
                      {decision === 'rejected' && (
                        <p className="text-xs text-amber-900 mt-1 italic">
                          Alasan penolakan: &quot;{notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmStep(false)}
                      disabled={isSubmitting}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-[#252D35] hover:bg-gray-50 transition"
                    >
                      Kembali Ubah
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-sm transition ${
                        decision === 'verified'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-red-600 hover:bg-red-700'
                      } disabled:opacity-50`}
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {decision === 'verified' ? 'Ya, Setujui Pembayaran' : 'Ya, Tolak Pembayaran'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <div className="border-t border-[#E8F0F5] pt-4 flex items-center justify-between">
              <span className="text-xs text-[#252D35]/60 italic">
                {!canVerify
                  ? 'Anda hanya memiliki izin melihat (View Only).'
                  : 'Pengajuan ini sudah selesai diproses.'}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#E8F0F5] px-4 py-2 text-xs font-semibold text-[#252D35] hover:bg-[#F5F7F8] transition"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
