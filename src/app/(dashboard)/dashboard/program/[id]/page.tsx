import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import { getProgramById, getBatchesByProgramId } from '@/features/programs/queries';
import { notFound } from 'next/navigation';
import { ProgramForm } from '@/components/programs/ProgramForm';
import { BatchForm } from '@/components/programs/BatchForm';
import { EmptyState } from '@/components/dashboard/StatCard';
import { formatRupiah, formatDateIndonesia } from '@/lib/utils';
import {
  Calendar,
  Layers,
  ArrowLeft,
  Users,
  Clock,
  Plus,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await assertPermission('programs.view');

  const user = await getCurrentUser();
  const canManagePrograms =
    user?.roles.includes('super_admin') || user?.permissions.includes('programs.manage');
  const canManageBatches =
    user?.roles.includes('super_admin') || user?.permissions.includes('batches.manage');

  const program = await getProgramById(id);
  if (!program) notFound();

  const batches = await getBatchesByProgramId(id);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#252D35]/60">
        <Link
          href="/dashboard/program"
          className="hover:text-[#547F9F] flex items-center gap-1 transition"
        >
          <ArrowLeft className="h-3 w-3" />
          Katalog Program
        </Link>
        <span>/</span>
        <span className="text-[#385A75] font-semibold">{program.name}</span>
      </div>

      {/* Program Summary Card */}
      <div className="rounded-2xl border border-[#E8F0F5] bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#E8F0F5] px-2.5 py-0.5 text-[10px] font-semibold text-[#547F9F] uppercase">
              {program.program_type}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                program.visibility === 'published'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {program.visibility}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">
            {program.name}
          </h1>
          {program.tagline && (
            <p className="text-xs text-[#252D35]/70 italic">{program.tagline}</p>
          )}
        </div>
        <div className="text-xs text-[#252D35]/60">
          Total Batch: <span className="font-bold text-[#385A75]">{batches.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Batches List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#547F9F]" />
                <h3 className="text-sm font-bold text-[#385A75]">
                  Angkatan (Batch) Terbuka & Riwayat
                </h3>
              </div>
            </div>

            {batches.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="Belum Ada Angkatan Batch"
                description="Buka pendaftaran angkatan baru untuk memulai penerimaan peserta kelas ini."
              />
            ) : (
              <div className="space-y-3">
                {batches.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-lg border border-[#E8F0F5] bg-[#F5F7F8]/60 p-4 space-y-2 hover:border-[#547F9F]/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[#547F9F] px-2 py-0.5 text-[10px] font-semibold text-white">
                          Batch #{b.batch_number}
                        </span>
                        <h4 className="text-xs font-bold text-[#385A75]">{b.name}</h4>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          b.status === 'open'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : b.status === 'completed'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#252D35]/70 pt-2 border-t border-[#E8F0F5]">
                      <div>
                        <span className="text-[#252D35]/50 block">Biaya / Infaq:</span>
                        <span className="font-semibold text-[#385A75]">
                          {b.price === 0 ? 'Gratis' : formatRupiah(b.price)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#252D35]/50 block">Kapasitas:</span>
                        <span className="font-semibold text-[#385A75]">
                          {b.registrations_count || 0} / {b.capacity} orang
                        </span>
                      </div>
                      <div>
                        <span className="text-[#252D35]/50 block">Pendaftaran:</span>
                        <span>
                          {formatDateIndonesia(b.registration_open_at)} -{' '}
                          {formatDateIndonesia(b.registration_close_at)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#252D35]/50 block">Pelaksanaan:</span>
                        <span>
                          {formatDateIndonesia(b.start_at)} -{' '}
                          {formatDateIndonesia(b.end_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Program Details Card (If authorized) */}
          {canManagePrograms && (
            <div className="rounded-xl border border-[#E8F0F5] bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#385A75] border-b border-[#E8F0F5] pb-3">
                Edit Informasi Program
              </h3>
              <ProgramForm initialData={program} />
            </div>
          )}
        </div>

        {/* Right Col: Create New Batch Form */}
        {canManageBatches && (
          <div className="rounded-xl border border-[#E8F0F5] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E8F0F5] pb-3">
              <Plus className="h-4 w-4 text-[#547F9F]" />
              <h3 className="text-sm font-bold text-[#385A75]">Buka Batch Baru</h3>
            </div>
            <BatchForm programId={program.id} />
          </div>
        )}
      </div>
    </div>
  );
}

