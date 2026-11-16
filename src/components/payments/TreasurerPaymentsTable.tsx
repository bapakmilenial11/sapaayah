'use client';

import { useState } from 'react';
import { VerificationQueueItem } from '@/features/payments/queries';
import { TreasurerVerificationModal } from './TreasurerVerificationModal';
import { formatCurrency, formatDateIndonesia } from '@/lib/utils';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  Building,
  User,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

interface TreasurerPaymentsTableProps {
  initialItems: VerificationQueueItem[];
  canVerify: boolean;
  currentUserId?: string;
}

export function TreasurerPaymentsTable({
  initialItems,
  canVerify,
  currentUserId,
}: TreasurerPaymentsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('queue'); // default prioritas antrean: submitted / under_review
  const [selectedItem, setSelectedItem] = useState<VerificationQueueItem | null>(null);

  // Filter logika
  const filtered = initialItems.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      item.participant_name.toLowerCase().includes(term) ||
      item.program_name.toLowerCase().includes(term) ||
      item.batch_name.toLowerCase().includes(term) ||
      (item.sender_bank_name && item.sender_bank_name.toLowerCase().includes(term)) ||
      (item.sender_account_name && item.sender_account_name.toLowerCase().includes(term)) ||
      item.participant_phone.includes(term);

    let matchesStatus = true;
    if (statusFilter === 'queue') {
      matchesStatus = ['submitted', 'under_review'].includes(item.submission_status);
    } else if (statusFilter !== 'all') {
      matchesStatus = item.submission_status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
            <Clock className="h-3 w-3" /> Submitted
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
            <Clock className="h-3 w-3" /> Sedang Ditinjau
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> Terverifikasi
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-800">
            <XCircle className="h-3 w-3" /> Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#252D35]/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari peserta, program, bank, no HP..."
            className="w-full rounded-xl border border-[#E8F0F5] bg-white pl-9 pr-3 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-[#547F9F]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#E8F0F5] bg-white px-3 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none shadow-xs"
          >
            <option value="queue">Prioritas: Antrean Verifikasi (Submitted & Review)</option>
            <option value="all">Semua Riwayat Status</option>
            <option value="submitted">Hanya Submitted</option>
            <option value="under_review">Hanya Sedang Ditinjau</option>
            <option value="verified">Hanya Terverifikasi</option>
            <option value="rejected">Hanya Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-[#E8F0F5] bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F7F8] text-[#385A75] font-semibold border-b border-[#E8F0F5]">
            <tr>
              <th className="p-3.5">Peserta</th>
              <th className="p-3.5">Program & Batch</th>
              <th className="p-3.5">Tagihan & Transfer</th>
              <th className="p-3.5">Rekening Pengirim</th>
              <th className="p-3.5">Waktu Pengajuan</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8F0F5] text-[#252D35]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-[#252D35]/60">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileCheck className="h-8 w-8 text-[#547F9F]/40" />
                    <p className="font-medium text-xs">
                      Tidak ada data pembayaran yang sesuai dengan kriteria filter.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isAmountMatching = item.amount_transferred === item.amount_due;
                return (
                  <tr key={item.submission_id} className="hover:bg-[#F5F7F8]/50 transition">
                    {/* Peserta */}
                    <td className="p-3.5">
                      <div className="font-semibold text-[#385A75]">
                        {item.participant_name}
                      </div>
                      <div className="text-[11px] text-[#252D35]/60 mt-0.5">
                        {item.participant_phone}
                      </div>
                    </td>

                    {/* Program & Batch */}
                    <td className="p-3.5">
                      <div className="font-medium text-[#252D35]">{item.program_name}</div>
                      <div className="text-[11px] text-[#252D35]/60 mt-0.5">
                        {item.batch_name}
                      </div>
                    </td>

                    {/* Nominal */}
                    <td className="p-3.5">
                      <div className="font-bold text-[#385A75]">
                        {formatCurrency(item.amount_transferred)}
                      </div>
                      <div className="text-[10px] text-[#252D35]/60 flex items-center gap-1 mt-0.5">
                        <span>Tagihan: {formatCurrency(item.amount_due)}</span>
                        {!isAmountMatching && (
                          <span
                            title="Nominal transfer berbeda dengan tagihan"
                            className="inline-block text-amber-600 font-bold"
                          >
                            ⚠
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Rekening Pengirim */}
                    <td className="p-3.5">
                      <div className="font-medium text-[#252D35]">
                        {item.sender_bank_name || '-'}
                      </div>
                      <div className="text-[11px] text-[#252D35]/60 mt-0.5">
                        a.n. {item.sender_account_name || '-'}
                      </div>
                    </td>

                    {/* Tanggal */}
                    <td className="p-3.5">
                      <div className="text-[11px] text-[#252D35]">
                        {formatDateIndonesia(item.submitted_at)}
                      </div>
                      <div className="text-[10px] text-[#252D35]/50 mt-0.5">
                        Sub #{item.submission_number}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">{getStatusBadge(item.submission_status)}</td>

                    {/* Aksi */}
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs transition ${
                          ['submitted', 'under_review'].includes(item.submission_status)
                            ? 'bg-[#547F9F] text-white hover:bg-[#385A75]'
                            : 'border border-[#E8F0F5] bg-white text-[#385A75] hover:bg-[#F5F7F8]'
                        }`}
                      >
                        {['submitted', 'under_review'].includes(item.submission_status) && canVerify
                          ? 'Verifikasi'
                          : 'Detail'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail / Verifikasi */}
      {selectedItem && (
        <TreasurerVerificationModal
          item={selectedItem}
          isOpen={Boolean(selectedItem)}
          onClose={() => setSelectedItem(null)}
          canVerify={canVerify}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
