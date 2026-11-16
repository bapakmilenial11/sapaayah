'use client';

import { useState } from 'react';
import { RegistrationListItem } from '@/features/registrations/queries';
import { RegistrationStatusModal } from './RegistrationStatusModal';
import { formatDateIndonesia } from '@/lib/utils';
import { Users2, Search, Filter, Edit2, ShieldAlert } from 'lucide-react';

interface RegistrationsTableProps {
  initialRegistrations: RegistrationListItem[];
  canManage: boolean;
}

export function RegistrationsTable({
  initialRegistrations,
  canManage,
}: RegistrationsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReg, setSelectedReg] = useState<RegistrationListItem | null>(null);

  const filtered = initialRegistrations.filter((r) => {
    const matchesSearch =
      r.participant.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.participant.email.toLowerCase().includes(search.toLowerCase()) ||
      r.participant.phone.includes(search);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      submitted: 'bg-amber-100 text-amber-800',
      under_review: 'bg-blue-100 text-blue-800',
      accepted: 'bg-emerald-100 text-emerald-800',
      waitlisted: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#252D35]/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, WA..."
            className="w-full rounded-lg border border-[#E8F0F5] bg-white pl-9 pr-3 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-[#547F9F]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#E8F0F5] bg-white px-3 py-2 text-xs text-[#252D35] focus:border-[#547F9F] focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E8F0F5] bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F7F8] text-[#385A75] font-semibold border-b border-[#E8F0F5]">
            <tr>
              <th className="p-3">Peserta</th>
              <th className="p-3">Program & Batch</th>
              <th className="p-3">Domisili</th>
              <th className="p-3">Status</th>
              <th className="p-3">Tgl Daftar</th>
              {canManage && <th className="p-3 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8F0F5] text-[#252D35]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#252D35]/60">
                  Tidak ada pendaftar yang sesuai filter.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[#F5F7F8]/50 transition">
                  <td className="p-3">
                    <div className="font-semibold text-[#385A75]">
                      {r.participant.full_name}
                    </div>
                    <div className="text-[11px] text-[#252D35]/65">
                      {r.participant.phone} • {r.participant.email}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold">{r.batch.program.name}</div>
                    <div className="text-[11px] text-[#547F9F]">{r.batch.name}</div>
                  </td>
                  <td className="p-3">
                    <div>{r.participant.city || '-'}</div>
                    <div className="text-[10px] text-[#252D35]/60 capitalize">
                      {r.participant.marital_status?.replace(/_/g, ' ') || '-'}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${getStatusBadge(
                        r.status
                      )}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-[#252D35]/70">
                    {formatDateIndonesia(r.submitted_at)}
                  </td>
                  {canManage && (
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReg(r)}
                        className="inline-flex items-center gap-1 rounded bg-[#E8F0F5] px-2.5 py-1 text-[11px] font-semibold text-[#385A75] hover:bg-[#547F9F] hover:text-white transition"
                      >
                        <Edit2 className="h-3 w-3" />
                        Status
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Status */}
      {selectedReg && (
        <RegistrationStatusModal
          registration={selectedReg}
          onClose={() => setSelectedReg(null)}
        />
      )}
    </div>
  );
}

