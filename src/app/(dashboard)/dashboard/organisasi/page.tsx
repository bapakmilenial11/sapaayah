import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import {
  getOrganizationalUnits,
  getOrganizationalStructure,
} from '@/features/organization/queries';
import { getActiveStaffProfiles } from '@/features/tasks/queries';
import { OrganizationalChart } from '@/components/organization/OrganizationalChart';
import { PositionFormModal } from '@/components/organization/PositionFormModal';
import { StatCard } from '@/components/dashboard/StatCard';
import { Building2, Users, Briefcase, Award } from 'lucide-react';

export default async function OrganizationPage() {
  await assertPermission('organization.view');

  const [units, { positions, canManage }, staffList] = await Promise.all([
    getOrganizationalUnits(),
    getOrganizationalStructure(),
    getActiveStaffProfiles(),
  ]);

  const totalPositions = positions.length;
  const assignedPositions = positions.filter((p) => p.current_assignees.length > 0).length;
  const vacantPositions = totalPositions - assignedPositions;
  const totalJobDescriptions = positions.reduce((acc, p) => acc + p.job_descriptions.length, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F0F5] text-[#547F9F]">
              <Building2 className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">
              Struktur Organisasi & Personel
            </h1>
          </div>
          <p className="text-xs text-[#252D35]/70 mt-1">
            Tata kelola unit kerja, posisi jabatan struktural, deskripsi pekerjaan (jobdesk), dan penugasan personel pengurus.
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <PositionFormModal units={units} existingPositions={positions} />
          </div>
        )}
      </div>

      {/* Grid Statistik Organisasi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Unit Organisasi"
          value={units.length}
          subtitle="Unit & divisi kerja"
          icon={Building2}
          variant="primary"
        />
        <StatCard
          title="Jabatan Terisi"
          value={assignedPositions}
          subtitle={`Dari total ${totalPositions} posisi jabatan`}
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Jabatan Kosong"
          value={vacantPositions}
          subtitle="Menunggu penugasan personel"
          icon={Briefcase}
          variant={vacantPositions > 0 ? 'warning' : 'primary'}
        />
        <StatCard
          title="Butir Jobdesk"
          value={totalJobDescriptions}
          subtitle="Tanggung jawab terdefinisi"
          icon={Award}
          variant="info"
        />
      </div>

      {/* Bagan & Daftar Hierarki Struktur Organisasi */}
      <OrganizationalChart
        positions={positions}
        units={units}
        staffList={staffList}
        canManage={canManage}
      />
    </div>
  );
}

