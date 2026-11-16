import { RoleCode, PermissionCode } from '@/lib/permissions/constants';

export interface UserProfile {
  id: string;
  fullName: string;
  displayName?: string | null;
  phone?: string | null;
  avatarPath?: string | null;
  accountStatus: 'active' | 'suspended' | 'inactive';
  roles: RoleCode[];
  permissions: PermissionCode[];
}

export type RegistrationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'waitlisted'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'rejected';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';

export interface WeeklyReportData {
  id?: string;
  profileId: string;
  weekDate: string;
  completedWork: string;
  upcomingPlan: string;
  blockers: string;
  submittedAt?: string;
}

