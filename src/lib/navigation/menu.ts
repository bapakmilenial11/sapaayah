import { PermissionCode, RoleCode } from '@/lib/permissions/constants';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Users2,
  CreditCard,
  CheckSquare,
  Target,
  FileText,
  Settings,
  BookOpen,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  FolderOpen,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';

export interface DashboardMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: PermissionCode;
  roles?: RoleCode[];
}

export const allDashboardMenuItems: DashboardMenuItem[] = [
  {
    label: 'Ringkasan',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Pengaturan Sistem',
    href: '/dashboard/pengaturan',
    icon: Settings,
    permission: 'settings.view',
    roles: ['super_admin', 'ketua'],
  },
  {
    label: 'Log Audit Keamanan',
    href: '/dashboard/audit-logs',
    icon: ShieldAlert,
    permission: 'audit_logs.view',
    roles: ['super_admin', 'ketua'],
  },
  {
    label: 'Organisasi & Jabatan',
    href: '/dashboard/organisasi',
    icon: Building2,
    permission: 'organization.view',
  },
  {
    label: 'Program & Batch',
    href: '/dashboard/program',
    icon: CalendarDays,
    permission: 'programs.view',
  },
  {
    label: 'Data Peserta',
    href: '/dashboard/peserta',
    icon: Users2,
    permission: 'participants.view_all',
  },
  {
    label: 'Verifikasi Pembayaran',
    href: '/dashboard/pembayaran',
    icon: CreditCard,
    permission: 'payments.view_all',
  },
  {
    label: 'Manajemen Keuangan',
    href: '/dashboard/keuangan',
    icon: DollarSign,
    permission: 'finance.view',
  },
  {
    label: 'Sesi & Materi Ajar',
    href: '/dashboard/sesi',
    icon: BookOpen,
    permission: 'sessions.manage_assigned',
  },
  {
    label: 'Tugas Operasional',
    href: '/dashboard/tugas',
    icon: CheckSquare,
    permission: 'tasks.manage_all',
  },
  {
    label: 'Target & KPI Bulanan',
    href: '/dashboard/target',
    icon: Target,
    permission: 'targets.view_all',
  },
  {
    label: 'Laporan Jumat',
    href: '/dashboard/laporan-jumat',
    icon: FileText,
    permission: 'weekly_reports.submit',
  },
  {
    label: 'Konten & Media',
    href: '/dashboard/konten',
    icon: Sparkles,
    permission: 'content.view',
  },
  {
    label: 'Komunitas & Alumni',
    href: '/dashboard/alumni',
    icon: GraduationCap,
    permission: 'community.view',
  },
];

/**
 * Filter menu navigasi berdasarkan peran dan izin yang dimiliki pengguna aktif
 */
export function getAuthorizedMenuItems(
  userRoles: RoleCode[],
  userPermissions: PermissionCode[]
): DashboardMenuItem[] {
  const isSuperAdmin = userRoles.includes('super_admin');

  return allDashboardMenuItems.filter((item) => {
    // Ringkasan selalu tersedia
    if (item.href === '/dashboard') return true;

    // Super Admin memiliki akses ke seluruh menu
    if (isSuperAdmin) return true;

    // Periksa pembatasan role eksplisit jika ada
    if (item.roles && !item.roles.some((r) => userRoles.includes(r))) {
      return false;
    }

    // Periksa permission jika diperlukan
    if (item.permission) {
      return userPermissions.includes(item.permission);
    }

    return true;
  });
}

