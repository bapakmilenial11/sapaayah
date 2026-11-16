import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import { getAllPaymentVerifications } from '@/features/payments/queries';
import { TreasurerPaymentsTable } from '@/components/payments/TreasurerPaymentsTable';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default async function TreasurerPaymentsPage() {
  // Verifikasi izin akses: pengguna harus memiliki payments.view_all
  await assertPermission('payments.view_all');

  const user = await getCurrentUser();
  const canVerify = Boolean(
    user?.roles.includes('super_admin') ||
    user?.permissions.includes('payments.verify')
  );

  // Ambil semua daftar pengajuan bukti pembayaran
  const items = await getAllPaymentVerifications('all');

  // Ringkasan metrik statistik
  const pendingCount = items.filter((i) =>
    ['submitted', 'under_review'].includes(i.submission_status)
  ).length;
  const verifiedCount = items.filter((i) => i.submission_status === 'verified').length;
  const rejectedCount = items.filter((i) => i.submission_status === 'rejected').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8F0F5] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#385A75] flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-[#547F9F]" />
            Verifikasi Pembayaran & Bukti Transfer
          </h1>
          <p className="text-xs text-[#252D35]/70 mt-1">
            Validasi mutasi transfer rekening BSI resmi yayasan, periksa berkas bukti privat, dan setujui penerimaan pendaftar.
          </p>
        </div>

        {/* Status Peran Reviewer */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#252D35]/70">Wewenang:</span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              canVerify
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {canVerify ? 'Verifikator (Bendahara)' : 'Hanya Lihat (View-Only)'}
          </span>
        </div>
      </div>

      {/* Ringkasan Status / Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E8F0F5] shadow-xs flex items-center gap-3">
          <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 border border-amber-100">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-[#252D35]/60 font-medium block">
              Antrean Verifikasi
            </span>
            <span className="text-xl font-bold text-[#385A75]">{pendingCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8F0F5] shadow-xs flex items-center gap-3">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-[#252D35]/60 font-medium block">
              Pembayaran Terverifikasi
            </span>
            <span className="text-xl font-bold text-emerald-700">{verifiedCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8F0F5] shadow-xs flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-2.5 text-red-600 border border-red-100">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-[#252D35]/60 font-medium block">
              Pembayaran Ditolak
            </span>
            <span className="text-xl font-bold text-red-700">{rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* Tabel Utama Antrean & Riwayat */}
      <TreasurerPaymentsTable
        initialItems={items}
        canVerify={canVerify}
        currentUserId={user?.id}
      />
    </div>
  );
}
