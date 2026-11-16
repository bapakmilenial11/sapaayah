import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getMyRegistrations } from '@/features/registrations/queries';
import { EmptyState } from '@/components/dashboard/StatCard';
import { formatDateIndonesia, formatRupiah } from '@/lib/utils';
import { BookOpen, Calendar, CreditCard, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function MyProgramsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const myRegistrations = await getMyRegistrations(user.id);

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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8F0F5] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">
            Program & Kelas Saya
          </h1>
          <p className="text-xs text-[#252D35]/70 mt-1">
            Riwayat pendaftaran, status verifikasi administrasi, dan jadwal sesi belajar Anda.
          </p>
        </div>
        <Link
          href="/portal/daftar"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition"
        >
          <Plus className="h-4 w-4" />
          Daftar Program Lain
        </Link>
      </div>

      {myRegistrations.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum Ada Program yang Diikuti"
          description="Anda belum mendaftar pada batch program manapun. Silakan lihat katalog batch yang sedang dibuka pendaftarannya."
          actionText="Buka Pendaftaran Kelas"
          actionHref="/portal/daftar"
        />
      ) : (
        <div className="space-y-4">
          {myRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-4 hover:border-[#547F9F]/30 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8F0F5] pb-3">
                <div className="space-y-0.5">
                  <span className="rounded bg-[#E8F0F5] px-2 py-0.5 text-[10px] font-semibold text-[#547F9F]">
                    {reg.batch.name}
                  </span>
                  <h3 className="text-base font-bold text-[#385A75]">
                    {reg.batch.program.name}
                  </h3>
                </div>
                <div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusBadge(
                      reg.status
                    )}`}
                  >
                    Status: {reg.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#252D35]/70">
                <div>
                  <span className="text-[#252D35]/50 block text-[11px]">Tanggal Mendaftar:</span>
                  <span className="font-semibold text-[#385A75]">
                    {formatDateIndonesia(reg.submitted_at)}
                  </span>
                </div>
                <div>
                  <span className="text-[#252D35]/50 block text-[11px]">Investasi Program:</span>
                  <span className="font-semibold text-[#385A75]">
                    {reg.batch.price === 0 ? 'Gratis' : formatRupiah(reg.batch.price)}
                  </span>
                </div>
                <div>
                  <span className="text-[#252D35]/50 block text-[11px]">Langkah Berikutnya:</span>
                  <span className="font-medium text-[#547F9F]">
                    {reg.status === 'submitted'
                      ? 'Menunggu verifikasi admin'
                      : reg.status === 'accepted'
                      ? 'Siap mengikuti sesi kelas'
                      : 'Cek instruksi pada portal'}
                  </span>
                </div>
              </div>

              {reg.notes && (
                <div className="rounded-lg bg-[#F5F7F8] p-3 text-xs text-[#252D35]/80">
                  <span className="font-semibold text-[#385A75]">Catatan Pendaftaran: </span>
                  {reg.notes}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-[#E8F0F5]">
                <Link
                  href={`/portal/program-saya/${reg.batch.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition"
                >
                  <span>Lihat Jadwal & Presensi Sesi</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

