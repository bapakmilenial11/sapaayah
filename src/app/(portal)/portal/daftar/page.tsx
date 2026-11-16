import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getOpenBatches } from '@/features/registrations/queries';
import { RegistrationForm } from '@/components/registrations/RegistrationForm';
import { BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PortalRegistrationPage({
  searchParams,
}: {
  searchParams: Promise<{ batchId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirectTo=/portal/daftar');

  const { batchId } = await searchParams;
  const openBatches = await getOpenBatches();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#252D35]/60">
        <Link
          href="/portal"
          className="hover:text-[#547F9F] flex items-center gap-1 transition"
        >
          <ArrowLeft className="h-3 w-3" />
          Kembali ke Portal
        </Link>
        <span>/</span>
        <span className="text-[#385A75] font-semibold">Formulir Pendaftaran</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">
          Pendaftaran Program SAPA Ayah
        </h1>
        <p className="text-xs text-[#252D35]/70">
          Lengkapi data profil Anda untuk mendaftar pada batch kelas pembelajaran ayah.
        </p>
      </div>

      <RegistrationForm
        user={user}
        openBatches={openBatches}
        preselectedBatchId={batchId}
      />
    </div>
  );
}

