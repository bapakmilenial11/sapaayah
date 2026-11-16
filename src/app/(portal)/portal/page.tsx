import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StatCard, EmptyState } from '@/components/dashboard/StatCard';
import {
  BookOpen,
  CreditCard,
  Calendar,
  Award,
  HelpCircle,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default async function PortalOverviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const supabase = await createClient();

  // Query program aktif peserta
  let activeRegistration: any = null;
  let activePayment: any = null;

  try {
    const { data: participant } = await supabase
      .from('participants')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (participant) {
      const { data: reg } = await supabase
        .from('registrations')
        .select('id, status, program_batches(batch_name, programs(name))')
        .eq('participant_id', participant.id)
        .order('registered_at', { ascending: false })
        .limit(1)
        .single();
      activeRegistration = reg;

      if (reg) {
        const { data: pay } = await supabase
          .from('payments')
          .select('id, status, amount')
          .eq('registration_id', reg.id)
          .single();
        activePayment = pay;
      }
    }
  } catch {
    // Fallback gracefully on query error
  }

  const isAlumni = user.roles.includes('alumni');

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Card */}
      <div className="rounded-2xl border border-[#E8F0F5] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">
            Selamat Datang, {user.fullName}
          </h1>
          <p className="text-xs text-[#252D35]/70 mt-1">
            {isAlumni
              ? 'Ruang Komunitas & Jejaring Alumni Sahabat Pembelajar Ayah.'
              : 'Pantau status pendaftaran kelas, pembayaran, dan jadwal sesi belajar Anda di SAPA Ayah.'}
          </p>
        </div>
        <div>
          <span className="rounded-full bg-[#E8F0F5] px-3 py-1 text-xs font-semibold text-[#547F9F] capitalize">
            Peran: {isAlumni ? 'Alumni Program' : 'Peserta Aktif'}
          </span>
        </div>
      </div>

      {/* Status Cards (Peserta View) */}
      {!isAlumni && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Pendaftaran Aktif"
            value={activeRegistration?.program_batches?.programs?.name || 'Belum Ada'}
            subtitle={
              activeRegistration
                ? `Status: ${activeRegistration.status}`
                : 'Pilih program di katalog'
            }
            icon={BookOpen}
          />

          <StatCard
            title="Status Pembayaran"
            value={activePayment?.status || 'Belum Ada Tagihan'}
            subtitle="Manual Transfer BSI"
            icon={CreditCard}
            variant="warning"
          />

          <StatCard
            title="Sesi Belajar"
            value="Terjadwal"
            subtitle="Info link diumumkan bertahap"
            icon={Calendar}
          />
        </div>
      )}

      {/* Alumni View */}
      {isAlumni && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Sertifikat Kelulusan"
            value="Tersedia"
            subtitle="Unduh sertifikat resmi"
            icon={Award}
            variant="success"
          />

          <StatCard
            title="Komunitas Alumni"
            value="Aktif"
            subtitle="Forum silaturahmi & jejaring"
            icon={Users}
            variant="primary"
          />

          <StatCard
            title="Agenda Lanjutan"
            value="Q1 2027"
            subtitle="Temu alumni & workshop lanjutan"
            icon={Sparkles}
          />
        </div>
      )}

      {/* Detail Konten / Empty State */}
      {!activeRegistration && !isAlumni ? (
        <EmptyState
          icon={BookOpen}
          title="Anda Belum Mendaftar Program"
          description="Jelajahi program pembelajaran keayahan seperti Kelas Menjadi Ayah, Webinar Parenting, atau Ayah Camp."
          actionText="Lihat Program Tersedia"
          actionHref="/program"
        />
      ) : null}

      {/* Help Section */}
      <div className="rounded-xl border border-[#E8F0F5] bg-[#E8F0F5]/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-[#547F9F] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#385A75]">
              Butuh Bantuan Administrasi & Teknis?
            </h4>
            <p className="text-xs text-[#252D35]/75">
              Jika mengalami kendala transfer atau membutuhkan informasi program, tim pengurus siap membantu.
            </p>
          </div>
        </div>
        <Link
          href="/kontak"
          className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#385A75] border border-[#547F9F]/30 hover:bg-[#547F9F] hover:text-white transition shadow-sm text-center shrink-0"
        >
          Hubungi Layanan Bantuan
        </Link>
      </div>
    </div>
  );
}
