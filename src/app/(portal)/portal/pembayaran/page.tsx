import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  getMyPaymentInvoices,
  getActivePaymentInstruction,
} from '@/features/payments/queries';
import { PaymentProofUploadForm } from '@/components/payments/PaymentProofUploadForm';
import { EmptyState } from '@/components/dashboard/StatCard';
import { formatRupiah, formatDateIndonesia } from '@/lib/utils';
import {
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import Link from 'next/link';

export default async function ParticipantPaymentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirectTo=/portal/pembayaran');

  const [invoices, instruction] = await Promise.all([
    getMyPaymentInvoices(),
    getActivePaymentInstruction(),
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Lunas / Terverifikasi
          </span>
        );
      case 'submitted':
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            <Clock className="h-3.5 w-3.5" />
            Menunggu Verifikasi Bendahara
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
            <XCircle className="h-3.5 w-3.5" />
            Bukti Ditolak (Perlu Kirim Ulang)
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5" />
            Menunggu Pembayaran
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E8F0F5] pb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">
          Status & Verifikasi Pembayaran
        </h1>
        <p className="text-xs text-[#252D35]/70 mt-1">
          Pantau tagihan pendaftaran kelas, nomor rekening resmi yayasan, dan konfirmasi bukti transfer.
        </p>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Tidak Ada Tagihan Pembayaran"
          description="Anda belum memiliki tagihan pembayaran aktif. Silakan pilih kelas atau program di katalog pendaftaran."
          actionText="Buka Pendaftaran Program"
          actionHref="/portal/daftar"
        />
      ) : (
        <div className="space-y-8">
          {invoices.map((inv) => {
            const isVerified = inv.status === 'verified';
            const isPendingOrRejected = ['pending', 'rejected'].includes(inv.status);
            const isUnderReview = ['submitted', 'under_review'].includes(inv.status);
            const isFree = inv.amount_due === 0;

            const latestSubmission = inv.submissions && inv.submissions.length > 0
              ? inv.submissions[inv.submissions.length - 1]
              : null;

            const latestVerification = latestSubmission?.verifications && latestSubmission.verifications.length > 0
              ? latestSubmission.verifications[latestSubmission.verifications.length - 1]
              : null;

            return (
              <div
                key={inv.id}
                className="rounded-2xl border border-[#E8F0F5] bg-white shadow-sm overflow-hidden"
              >
                {/* Banner Header Tagihan */}
                <div className="bg-[#F5F7F8] p-5 sm:p-6 border-b border-[#E8F0F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="rounded bg-[#E8F0F5] px-2.5 py-0.5 text-[10px] font-semibold text-[#547F9F]">
                      {inv.registration.batch.name}
                    </span>
                    <h2 className="text-lg font-bold text-[#385A75]">
                      {inv.registration.batch.program.name}
                    </h2>
                    <p className="text-[11px] text-[#252D35]/60">
                      ID Tagihan: <span className="font-mono">{inv.id}</span>
                    </p>
                  </div>
                  <div>{getStatusBadge(inv.status)}</div>
                </div>

                <div className="p-5 sm:p-6 space-y-6">
                  {/* Kondisi 1: Program Gratis */}
                  {isFree && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <h4 className="font-bold text-[#385A75]">Program Bebas Biaya (Gratis)</h4>
                        <p className="text-[#252D35]/75">
                          Program ini tidak memungut infaq atau biaya transfer. Pendaftaran Anda telah langsung terkonfirmasi otomatis.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Kondisi 2: Program Berbayar */}
                  {!isFree && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Left: Detail Rekening & Rincian Nominal */}
                      <div className="space-y-4">
                        <div className="rounded-xl border border-[#E8F0F5] bg-[#F5F7F8]/80 p-5 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#385A75]">
                            <Building2 className="h-4 w-4 text-[#547F9F]" />
                            <span>Rekening Resmi Tujuan Transfer</span>
                          </div>

                          <div className="space-y-1 bg-white p-3.5 rounded-lg border border-[#E8F0F5]">
                            <div className="text-xs text-[#252D35]/60">Bank Tujuan:</div>
                            <div className="text-sm font-extrabold text-[#385A75]">
                              {instruction?.bank_name || 'Bank Syariah Indonesia (BSI)'}
                            </div>
                            <div className="text-xs text-[#252D35]/60 pt-1">Nomor Rekening:</div>
                            <div className="text-base font-mono font-bold text-[#547F9F] tracking-wide">
                              {instruction?.account_number || '7201234567'}
                            </div>
                            <div className="text-xs text-[#252D35]/60 pt-1">Atas Nama:</div>
                            <div className="text-xs font-semibold text-[#252D35]">
                              {instruction?.account_holder || 'Yayasan Sahabat Pembelajar Ayah'}
                            </div>
                          </div>

                          {instruction?.instructions && (
                            <p className="text-[11px] text-[#252D35]/70 italic">
                              * {instruction.instructions}
                            </p>
                          )}
                        </div>

                        {/* Rincian Nominal */}
                        <div className="rounded-xl border border-[#E8F0F5] bg-white p-4 space-y-2 text-xs">
                          <div className="flex justify-between text-[#252D35]/70">
                            <span>Biaya Program:</span>
                            <span>{formatRupiah(inv.amount_due - inv.unique_code)}</span>
                          </div>
                          <div className="flex justify-between text-[#252D35]/70">
                            <span>Kode Unik Transaksi:</span>
                            <span className="font-mono text-emerald-600">+{inv.unique_code}</span>
                          </div>
                          <div className="border-t border-[#E8F0F5] pt-2 flex justify-between font-bold text-sm text-[#385A75]">
                            <span>Total Harus Ditransfer:</span>
                            <span className="text-[#547F9F]">{formatRupiah(inv.amount_due)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Aksi / Form Upload */}
                      <div className="space-y-4">
                        {/* Jika Verified */}
                        {isVerified && (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 text-center space-y-3">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                            <h4 className="text-sm font-bold text-[#385A75]">
                              Pembayaran Telah Diverifikasi Lunas
                            </h4>
                            <p className="text-xs text-[#252D35]/75">
                              Terima kasih, konfirmasi pembayaran Anda telah disetujui oleh Bendahara. Silakan cek jadwal sesi di menu <em>Program Saya</em>.
                            </p>
                            <Link
                              href="/portal/program-saya"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition"
                            >
                              Buka Program Saya
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        )}

                        {/* Jika Sedang Ditinjau (Submitted / Under Review) */}
                        {isUnderReview && (
                          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-6 text-center space-y-3">
                            <Clock className="h-10 w-10 text-[#547F9F] mx-auto" />
                            <h4 className="text-sm font-bold text-[#385A75]">
                              Bukti Transfer Sedang Ditinjau
                            </h4>
                            <p className="text-xs text-[#252D35]/75 leading-relaxed">
                              Bukti transfer Anda telah berhasil dikirim pada{' '}
                              <strong>
                                {latestSubmission ? formatDateIndonesia(latestSubmission.submitted_at) : 'hari ini'}
                              </strong>
                              . Tim Bendahara kami sedang mencocokkan mutasi rekening.
                            </p>
                          </div>
                        )}

                        {/* Jika Ditolak (Rejected) */}
                        {inv.status === 'rejected' && (
                          <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-red-700">
                              <XCircle className="h-4 w-4" />
                              <span>Catatan Penolakan Bendahara:</span>
                            </div>
                            <p className="text-red-900 bg-white/80 p-2.5 rounded border border-red-200 leading-relaxed">
                              {latestVerification?.notes || 'Bukti transfer tidak terbaca atau nominal tidak sesuai mutasi bank.'}
                            </p>
                            <p className="text-[11px] text-red-700">
                              Silakan unggah kembali bukti transfer yang valid di bawah ini:
                            </p>
                          </div>
                        )}

                        {/* Form Upload Bukti (Hanya saat pending atau rejected) */}
                        {isPendingOrRejected && (
                          <div className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-[#385A75] uppercase tracking-wider">
                              Konfirmasi Pembayaran
                            </h3>
                            <PaymentProofUploadForm
                              paymentId={inv.id}
                              amountDue={inv.amount_due}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Riwayat Pengajuan Bukti Sebelumnya */}
                  {inv.submissions && inv.submissions.length > 0 && (
                    <div className="border-t border-[#E8F0F5] pt-5 space-y-3">
                      <h4 className="text-xs font-bold text-[#385A75]">
                        Riwayat Pengajuan Bukti Transfer
                      </h4>
                      <div className="divide-y divide-[#E8F0F5] text-xs">
                        {inv.submissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold text-[#385A75]">
                                Pengajuan #{sub.submission_number}
                              </span>
                              <div className="text-[11px] text-[#252D35]/60">
                                Ditransfer: {formatRupiah(sub.amount_transferred)} • Bank: {sub.sender_bank_name || '-'} ({sub.sender_account_name || '-'})
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-[#252D35]/60">
                                {formatDateIndonesia(sub.submitted_at)}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                                  sub.status === 'verified'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : sub.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {sub.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

