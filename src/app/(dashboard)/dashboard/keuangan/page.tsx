import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import { createClient } from '@/lib/supabase/server';
import { DollarSign, ArrowUpRight, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export default async function FinancePage() {
  await assertPermission('finance.view');
  const user = await getCurrentUser();

  const supabase = await createClient();

  // Query rekapitulasi pembayaran terverifikasi
  const { data: payments } = await supabase
    .from('payments')
    .select('amount_due, status, updated_at, registration:registrations(batch:program_batches(name))')
    .eq('status', 'verified');

  const verifiedPayments = payments || [];
  const totalVerifiedAmount = verifiedPayments.reduce((acc, p) => acc + Number(p.amount_due || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#385A75]">Rekapitulasi Keuangan & Kas Masuk</h1>
        <p className="text-xs text-[#252D35]/70 mt-1">
          Laporan penerimaan dana pendaftaran program dan kas masuk yayasan yang telah diverifikasi bendahara.
        </p>
      </div>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
            <span>Total Dana Masuk Terverifikasi</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-900">{formatRupiah(totalVerifiedAmount)}</div>
          <p className="text-[11px] text-emerald-700">Akumulasi dari seluruh batch program aktif.</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
            <span>Transaksi Lunas (Verified)</span>
            <CheckCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{verifiedPayments.length} Transaksi</div>
          <p className="text-[11px] text-blue-700">Pembayaran berhasil diverifikasi oleh bendahara.</p>
        </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="rounded-2xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#547F9F]" />
            <h3 className="text-sm font-bold text-gray-900">Daftar Pemasukan Terverifikasi</h3>
          </div>
          <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-medium">
            {verifiedPayments.length} Data
          </span>
        </div>

        {verifiedPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p>Belum ada transaksi pembayaran terverifikasi.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {verifiedPayments.map((p, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-gray-900">
                    {(p.registration as any)?.batch?.name || 'Program SAPA Ayah'}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">Status: Verified</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{formatRupiah(p.amount_due)}</div>
                  <span className="text-[10px] text-gray-400">Transfer Bank</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

