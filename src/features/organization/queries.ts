import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';

export interface OrganizationalUnitItem {
  id: string;
  name: string;
  description: string | null;
}

export interface JobDescriptionItem {
  id: string;
  position_id: string;
  responsibility: string;
  performance_indicator: string | null;
}

export interface PersonnelAssignmentItem {
  id: string;
  profile_id: string;
  position_id: string;
  start_date: string;
  end_date: string | null;
  assignment_status: 'active' | 'completed' | 'transferred';
  profile: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  };
}

export interface PositionDetailItem {
  id: string;
  unit_id: string;
  title: string;
  parent_position_id: string | null;
  is_active: boolean;
  unit: OrganizationalUnitItem;
  parent_position?: {
    id: string;
    title: string;
  } | null;
  current_assignees: PersonnelAssignmentItem[];
  job_descriptions: JobDescriptionItem[];
}

/**
 * 1. Query: Mengambil seluruh unit kerja organisasi
 */
export async function getOrganizationalUnits(): Promise<OrganizationalUnitItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('organizational_units')
    .select('id, name, description')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat unit organisasi: ${error.message}`);
  }

  return data || [];
}

/**
 * 2. Query: Mengambil daftar struktur jabatan lengkap beserta personel aktif & jobdesk
 */
export async function getOrganizationalStructure(): Promise<{
  positions: PositionDetailItem[];
  canManage: boolean;
}> {
  const user = await getCurrentUser();
  const canManage =
    !!user &&
    (user.roles.includes('super_admin') ||
      user.roles.includes('ketua') ||
      user.permissions.includes('organization.manage') ||
      user.permissions.includes('positions.manage'));

  const supabase = await createClient();

  // Query positions with units, job_descriptions, and personnel_assignments
  const { data, error } = await supabase
    .from('positions')
    .select(
      `
      id,
      unit_id,
      title,
      parent_position_id,
      is_active,
      unit:organizational_units!inner(
        id,
        name,
        description
      ),
      parent_position:positions!positions_parent_position_id_fkey(
        id,
        title
      ),
      job_descriptions(
        id,
        position_id,
        responsibility,
        performance_indicator
      ),
      personnel_assignments(
        id,
        profile_id,
        position_id,
        start_date,
        end_date,
        assignment_status,
        profile:profiles!inner(
          id,
          full_name
        )
      )
    `
    )
    .eq('is_active', true)
    .order('title', { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat struktur organisasi: ${error.message}`);
  }

  const formatted: PositionDetailItem[] = (data || []).map((row: any) => ({
    id: row.id,
    unit_id: row.unit_id,
    title: row.title,
    parent_position_id: row.parent_position_id,
    is_active: row.is_active,
    unit: row.unit,
    parent_position: row.parent_position,
    job_descriptions: row.job_descriptions || [],
    current_assignees: (row.personnel_assignments || []).filter(
      (pa: any) => pa.assignment_status === 'active'
    ),
  }));

  return {
    positions: formatted,
    canManage,
  };
}

