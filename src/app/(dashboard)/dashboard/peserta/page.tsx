import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import { getAdminRegistrations } from '@/features/registrations/queries';
import { RegistrationsTable } from '@/components/registrations/RegistrationsTable';
import { Users2, Download } from 'lucide-react';

export default async function ParticipantManagementPage() {
  await assertPermission('participants.view_all');
  const user = await getCurrentUser();
  const canManage = Boolean(
    user?.roles.includes('super_admin') ||
    user?.permissions.includes('registrations.manage')
  );

  const registrations = await getAdminRegistrations();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8F0F5] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">
            Basis Data & Pendaftaran Peserta
          </h1>
          <p className="text-xs text-[#252D35]/70 mt-1">
            Pantau dan kelola verifikasi pendaftar batch, deduplikasi identitas, dan status penerimaan.
          </p>
        </div>
        <div className="text-xs font-medium text-[#252D35]/70">
          Total Terdata: <span className="font-bold text-[#385A75]">{registrations.length}</span> pendaftaran
        </div>
      </div>

      {/* Main Table */}
      <RegistrationsTable
        initialRegistrations={registrations}
        canManage={canManage}
      />
    </div>
  );
}
