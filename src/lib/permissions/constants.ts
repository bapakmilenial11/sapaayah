/**
 * Konstanta Kode Role & Hak Akses (Permissions) SAPA Ayah Digital Platform
 * Berdasarkan Master Technical Blueprint, docs/rbac-matrix.md, & docs/rbac-permission-catalog.md
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  KETUA: 'ketua',
  PENGURUS: 'pengurus',
  ADMIN_PESERTA: 'admin_peserta',
  BENDAHARA: 'bendahara',
  KREATOR_KONTEN: 'kreator_konten',
  FASILITATOR: 'fasilitator',
  RELAWAN: 'relawan',
  PESERTA: 'peserta',
  ALUMNI: 'alumni',
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  // System & Settings
  SYSTEM_MANAGE: 'system.manage',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',

  // Users & Access Control
  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',
  ROLES_ASSIGN: 'roles.assign',

  // Organization & Personnel
  ORGANIZATION_VIEW: 'organization.view',
  ORGANIZATION_MANAGE: 'organization.manage',
  POSITIONS_MANAGE: 'positions.manage',
  PERSONNEL_ASSIGN: 'personnel.assign',

  // Programs & Batches
  PROGRAMS_VIEW: 'programs.view',
  PROGRAMS_MANAGE: 'programs.manage',
  BATCHES_VIEW: 'batches.view',
  BATCHES_MANAGE: 'batches.manage',

  // Activities & Crew Assignments
  ACTIVITIES_VIEW: 'activities.view',
  ACTIVITIES_MANAGE: 'activities.manage',
  ACTIVITIES_ASSIGN: 'activities.assign',

  // Participants & Registrations
  PARTICIPANTS_VIEW_ALL: 'participants.view_all',
  PARTICIPANTS_VIEW_ASSIGNED: 'participants.view_assigned',
  PARTICIPANTS_MANAGE: 'participants.manage',
  REGISTRATIONS_CREATE_ADMIN: 'registrations.create_admin',
  REGISTRATIONS_VIEW_ALL: 'registrations.view_all',
  REGISTRATIONS_VIEW_ASSIGNED: 'registrations.view_assigned',
  REGISTRATIONS_MANAGE: 'registrations.manage',

  // Payments & Manual Verification
  PAYMENTS_VIEW_ALL: 'payments.view_all',
  PAYMENTS_VERIFY: 'payments.verify',
  PAYMENTS_MANAGE_ACCOUNTS: 'payments.manage_accounts',

  // Tasks, Targets & Weekly Reports
  TASKS_MANAGE_ALL: 'tasks.manage_all',
  TASKS_UPDATE_ASSIGNED: 'tasks.update_assigned',
  TARGETS_VIEW_ALL: 'targets.view_all',
  TARGETS_MANAGE: 'targets.manage',
  TARGETS_UPDATE_ASSIGNED: 'targets.update_assigned',
  WEEKLY_REPORTS_SUBMIT: 'weekly_reports.submit',
  WEEKLY_REPORTS_VIEW_ALL: 'weekly_reports.view_all',
  WEEKLY_REPORTS_RECAP: 'weekly_reports.recap',

  // Learning Management System (LMS)
  SESSIONS_MANAGE_ASSIGNED: 'sessions.manage_assigned',
  ATTENDANCE_RECORD_ASSIGNED: 'attendance.record_assigned',
  MATERIALS_MANAGE_ASSIGNED: 'materials.manage_assigned',
  MATERIALS_VIEW_ENROLLED: 'materials.view_enrolled',
  CERTIFICATES_ISSUE: 'certificates.issue',
  CERTIFICATES_DOWNLOAD_OWN: 'certificates.download_own',

  // Treasury & Finance
  FINANCE_VIEW: 'finance.view',
  FINANCE_MANAGE: 'finance.manage',

  // Media & Content
  CONTENT_VIEW: 'content.view',
  CONTENT_MANAGE: 'content.manage',

  // Community & Alumni
  COMMUNITY_VIEW: 'community.view',
  COMMUNITY_MANAGE: 'community.manage',

  // Audit Logs
  AUDIT_LOGS_VIEW: 'audit_logs.view',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
