import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import { getPrograms } from '@/features/programs/queries';
import { EmptyState } from '@/components/dashboard/StatCard';
import { ProgramForm } from '@/components/programs/ProgramForm';
import { Calendar, Plus, BookOpen, Layers, Eye, Archive } from 'lucide-react';
import Link from 'next/link';
import { archiveProgramAction } from '@/features/programs/actions';

export default async function ProgramManagementPage() {
  // Guard wewenang server-side
  await assertPermission('programs.view');
  const user = await getCurrentUser();
  const canManage = user?.roles.includes('super_admin') || user?.permissions.includes('programs.manage');

  const programs = await getPrograms({ includeArchived: false });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8F0F5] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">
            Katalog Program & Angkatan
          </h1>
          <p className="text-xs text-[#252D35]/70 mt-1">
            Kelola master program yayasan, angkatan (batch), jadwal, serta kuota pendaftaran.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Program List Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#547F9F]" />
                <h3 className="text-sm font-bold text-[#385A75]">Daftar Program Yayasan</h3>
              </div>
              <span className="text-xs text-[#252D35]/60">Total: {programs.length} program</span>
            </div>

            {programs.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Belum Ada Program"
                description="Mulai tambahkan kurikulum program baru seperti Kelas Menjadi Ayah atau Webinar Parenting."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F7F8] text-[#385A75] font-semibold border-b border-[#E8F0F5]">
                    <tr>
                      <th className="p-3">Program</th>
                      <th className="p-3">Jenis</th>
                      <th className="p-3">Visibilitas</th>
                      <th className="p-3">Batch</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8F0F5] text-[#252D35]">
                    {programs.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F5F7F8]/50 transition">
                        <td className="p-3">
                          <div className="font-semibold text-[#385A75]">{p.name}</div>
                          <div className="text-[10px] text-[#252D35]/60 font-mono">/{p.slug}</div>
                        </td>
                        <td className="p-3 capitalize">{p.program_type}</td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              p.visibility === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.visibility === 'archived'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.visibility}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-[#547F9F]">
                            {p.batches_count || 0}
                          </span>{' '}
                          angkatan
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <Link
                            href={`/dashboard/program/${p.id}`}
                            className="inline-flex items-center gap-1 rounded bg-[#E8F0F5] px-2.5 py-1 text-[11px] font-semibold text-[#385A75] hover:bg-[#547F9F] hover:text-white transition"
                          >
                            <Eye className="h-3 w-3" />
                            Kelola
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Create Program Form (Only for programs.manage) */}
        {canManage && (
          <div className="rounded-xl border border-[#E8F0F5] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E8F0F5] pb-3">
              <Plus className="h-4 w-4 text-[#547F9F]" />
              <h3 className="text-sm font-bold text-[#385A75]">Tambah Program Baru</h3>
            </div>
            <ProgramForm />
          </div>
        )}
      </div>
    </div>
  );
}

