-- ==============================================================================
-- Seed: 00001_roles_and_permissions.sql
-- Description: Master seed for 10 System Roles, 36 Permissions, & Role-Permission mappings
-- Architecture: SAPA Ayah Digital Platform
-- Note: Idempotent (ON CONFLICT DO NOTHING / UPDATE) - No hardcoded admin passwords!
-- ==============================================================================

-- 1. SEED 10 SYSTEM ROLES
INSERT INTO public.roles (code, name, description, is_system_role)
VALUES
  ('super_admin', 'Super Admin', 'Konfigurasi teknis, manajemen hak akses, dan audit trail sistem.', true),
  ('ketua', 'Ketua Yayasan', 'Monitoring eksekutif seluruh program, target bulanan, rekap laporan, dan persetujuan kebijakan strategis.', true),
  ('pengurus', 'Pengurus Yayasan', 'Akses operasional internal: manajemen tugas, pengisian laporan Jumat, koordinasi kegiatan.', true),
  ('admin_peserta', 'Admin Peserta', 'Manajemen batch, pendaftaran mandiri & manual, verifikasi profil, kuota peserta, dan sertifikat.', true),
  ('bendahara', 'Bendahara / Keuangan', 'Verifikasi bukti transfer manual, pengelolaan data rekening, pencatatan transaksi kas masuk/keluar.', true),
  ('kreator_konten', 'Kreator Konten', 'Pengelolaan kalender konten publikasi, media aset promosi, podcast, video, dan artikel cerita.', true),
  ('fasilitator', 'Fasilitator Sesi', 'Akses ke sesi kelas yang diampu, pencatatan absensi kehadiran, dan pengunggahan materi ajar.', true),
  ('relawan', 'Relawan', 'Akses terbatas hanya pada tugas atau kegiatan spesifik yang ditugaskan melalui activity_assignments.', true),
  ('peserta', 'Peserta Program', 'Layanan mandiri pendaftaran kelas, unggah bukti bayar transfer, akses jadwal, materi terdaftar, & sertifikat pribadi.', true),
  ('alumni', 'Alumni Program', 'Akses ke direktori komunitas alumni, forum silaturahmi, dan agenda jejaring pasca-kelulusan.', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_system_role = EXCLUDED.is_system_role;

-- 2. SEED 36 MASTER PERMISSIONS
INSERT INTO public.permissions (code, module, action, description)
VALUES
  -- System & Settings
  ('system.manage', 'system', 'manage', 'Mengelola konfigurasi teknis tingkat sistem.'),
  ('settings.view', 'settings', 'view', 'Melihat konfigurasi operasional yayasan.'),
  ('settings.manage', 'settings', 'manage', 'Mengubah konfigurasi operasional yayasan.'),

  -- Users & RBAC
  ('users.view', 'users', 'view', 'Melihat daftar akun dan profil pengguna.'),
  ('users.manage', 'users', 'manage', 'Mengelola status akun pengguna (suspend/aktivasi).'),
  ('roles.assign', 'roles', 'assign', 'Menetapkan dan mencabut role sistem pada akun pengguna.'),

  -- Organization & Personnel
  ('organization.view', 'organization', 'view', 'Melihat struktur unit, posisi jabatan, dan jobdesk.'),
  ('organization.manage', 'organization', 'manage', 'Mengelola struktur organisasi, posisi, dan jobdesk.'),
  ('positions.manage', 'positions', 'manage', 'Mengelola master posisi struktural yayasan.'),
  ('personnel.assign', 'personnel', 'assign', 'Menetapkan personel pada posisi struktural yayasan.'),

  -- Programs & Batches
  ('programs.view', 'programs', 'view', 'Melihat katalog program yayasan.'),
  ('programs.manage', 'programs', 'manage', 'Membuat dan mengedit master katalog program.'),
  ('batches.view', 'batches', 'view', 'Melihat daftar batch/angkatan program.'),
  ('batches.manage', 'batches', 'manage', 'Mengonfigurasi jadwal, kuota, harga, dan status batch.'),

  -- Activities & Crew Assignments
  ('activities.view', 'activities', 'view', 'Melihat agenda dan daftar kegiatan batch.'),
  ('activities.manage', 'activities', 'manage', 'Membuat dan mengelola kegiatan spesifik batch.'),
  ('activities.assign', 'activities', 'assign', 'Menetapkan tim pelaksana kegiatan bergilir (PIC, Moderator, dll.).'),

  -- Participants & Registrations
  ('participants.view_all', 'participants', 'view_all', 'Melihat seluruh basis data peserta terdaftar.'),
  ('participants.view_assigned', 'participants', 'view_assigned', 'Melihat data peserta pada batch/kegiatan yang ditugaskan.'),
  ('participants.manage', 'participants', 'manage', 'Mengelola dan mengedit profil data peserta.'),
  ('registrations.create_admin', 'registrations', 'create_admin', 'Mendaftarkan peserta secara manual oleh admin.'),
  ('registrations.view_all', 'registrations', 'view_all', 'Melihat seluruh riwayat pendaftaran batch.'),
  ('registrations.view_assigned', 'registrations', 'view_assigned', 'Melihat pendaftaran pada batch yang ditugaskan.'),
  ('registrations.manage', 'registrations', 'manage', 'Mengelola dan mengubah status pendaftaran peserta.'),

  -- Payments & Treasury
  ('payments.view_all', 'payments', 'view_all', 'Melihat seluruh data pembayaran dan tagihan.'),
  ('payments.verify', 'payments', 'verify', 'Memverifikasi atau menolak bukti transfer bank peserta.'),
  ('payments.manage_accounts', 'payments', 'manage_accounts', 'Mengelola rekening bank resmi tujuan transfer.'),

  -- Tasks, Targets, & Friday Reports
  ('tasks.manage_all', 'tasks', 'manage_all', 'Membuat dan mengelola seluruh tugas operasional yayasan.'),
  ('tasks.update_assigned', 'tasks', 'update_assigned', 'Memperbarui progres dan catatan pada tugas yang diemban.'),
  ('targets.view_all', 'targets', 'view_all', 'Melihat rekap seluruh target kinerja pengurus.'),
  ('targets.manage', 'targets', 'manage', 'Menetapkan target KPI bulanan dan periode evaluasi.'),
  ('targets.update_assigned', 'targets', 'update_assigned', 'Memperbarui progres pencapaian target bulanan pribadi.'),
  ('weekly_reports.submit', 'weekly_reports', 'submit', 'Mengisi dan mengirimkan Laporan Jumat 3 baris.'),
  ('weekly_reports.view_all', 'weekly_reports', 'view_all', 'Melihat seluruh Laporan Jumat pengurus.'),
  ('weekly_reports.recap', 'weekly_reports', 'recap', 'Mengompilasi dan menyusun rekap mingguan Humas.'),

  -- Learning Management (LMS)
  ('sessions.manage_assigned', 'sessions', 'manage_assigned', 'Mengelola jadwal dan tautan sesi kelas yang diampu.'),
  ('attendance.record_assigned', 'attendance', 'record_assigned', 'Mencatat absensi kehadiran peserta pada sesi kelas tugas.'),
  ('materials.manage_assigned', 'materials', 'manage_assigned', 'Mengunggah materi belajar pada batch/sesi terkait.'),
  ('materials.view_enrolled', 'materials', 'view_enrolled', 'Mengunduh materi belajar pada batch yang diikuti.'),
  ('certificates.issue', 'certificates', 'issue', 'Menerbitkan sertifikat kelulusan bagi peserta.'),
  ('certificates.download_own', 'certificates', 'download_own', 'Mengunduh sertifikat kelulusan milik pribadi.'),

  -- Finance & Treasury
  ('finance.view', 'finance', 'view', 'Melihat ringkasan dan laporan keuangan yayasan.'),
  ('finance.manage', 'finance', 'manage', 'Mencatat transaksi kas masuk dan keluar yayasan.'),

  -- Content & Media
  ('content.view', 'content', 'view', 'Melihat kalender konten dan arsip publikasi.'),
  ('content.manage', 'content', 'manage', 'Mengelola produksi konten, video, poster, dan artikel.'),

  -- Community & Alumni
  ('community.view', 'community', 'view', 'Mengakses direktori dan agenda komunitas alumni.'),
  ('community.manage', 'community', 'manage', 'Mengelola pengumuman dan kegiatan komunitas alumni.'),

  -- Audit Logs
  ('audit_logs.view', 'audit_logs', 'view', 'Memeriksa jejak audit aktivitas sistem.')
ON CONFLICT (code) DO UPDATE SET
  module = EXCLUDED.module,
  action = EXCLUDED.action,
  description = EXCLUDED.description;

-- 3. HELPER FUNCTION TO ASSIGN PERMISSIONS TO ROLES
CREATE OR REPLACE FUNCTION public.seed_role_permission(
  p_role_code VARCHAR,
  p_permission_code VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_role_id UUID;
  v_permission_id UUID;
BEGIN
  SELECT id INTO v_role_id FROM public.roles WHERE code = p_role_code;
  SELECT id INTO v_permission_id FROM public.permissions WHERE code = p_permission_code;

  IF v_role_id IS NOT NULL AND v_permission_id IS NOT NULL THEN
    INSERT INTO public.role_permissions (role_id, permission_id)
    VALUES (v_role_id, v_permission_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
END;
$$;

-- 4. MAP ROLE-PERMISSIONS

-- A. Super Admin: ALL Permissions
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN SELECT code FROM public.permissions LOOP
    PERFORM public.seed_role_permission('super_admin', p.code);
  END LOOP;
END $$;

-- B. Ketua: Executive Oversight & Strategic Management
DO $$
DECLARE
  perm TEXT;
  perms TEXT[] := ARRAY[
    'settings.view', 'users.view', 'organization.view', 'organization.manage',
    'positions.manage', 'programs.view', 'programs.manage', 'batches.view',
    'batches.manage', 'activities.view', 'activities.manage', 'activities.assign',
    'participants.view_all', 'registrations.view_all', 'payments.view_all',
    'tasks.manage_all', 'tasks.update_assigned', 'targets.view_all', 'targets.manage',
    'weekly_reports.view_all', 'weekly_reports.recap', 'sessions.manage_assigned',
    'materials.manage_assigned', 'certificates.issue', 'finance.view', 'finance.manage',
    'content.view', 'content.manage', 'community.view', 'audit_logs.view'
  ];
BEGIN
  FOREACH perm IN ARRAY perms LOOP
    PERFORM public.seed_role_permission('ketua', perm);
  END LOOP;
END $$;

-- C. Pengurus: Internal Operations & Friday Reports
DO $$
DECLARE
  perm TEXT;
  perms TEXT[] := ARRAY[
    'organization.view', 'programs.view', 'batches.view', 'activities.view',
    'tasks.manage_all', 'tasks.update_assigned', 'targets.view_all', 'targets.update_assigned',
    'weekly_reports.submit', 'weekly_reports.view_all', 'content.view', 'community.view'
  ];
BEGIN
  FOREACH perm IN ARRAY perms LOOP
    PERFORM public.seed_role_permission('pengurus', perm);
  END LOOP;
END $$;

-- D. Admin Peserta: Registration, Deduplication, & Certificate Issuance
DO $$
DECLARE
  perm TEXT;
  perms TEXT[] := ARRAY[
    'programs.view', 'batches.view', 'activities.view',
    'participants.view_all', 'participants.manage', 'registrations.create_admin',
    'registrations.view_all', 'registrations.manage', 'payments.view_all',
    'certificates.issue', 'tasks.update_assigned', 'weekly_reports.submit'
  ];
BEGIN
  FOREACH perm IN ARRAY perms LOOP
    PERFORM public.seed_role_permission('admin_peserta', perm);
  END LOOP;
END $$;

-- E. Bendahara: Manual Bank Verification & Treasury
DO $$
DECLARE
  perm TEXT;
  perms TEXT[] := ARRAY[
    'payments.view_all', 'payments.verify', 'payments.manage_accounts',
    'finance.view', 'finance.manage', 'tasks.update_assigned', 'weekly_reports.submit'
  ];
BEGIN
  FOREACH perm IN ARRAY perms LOOP
    PERFORM public.seed_role_permission('bendahara', perm);
  END LOOP;
END $$;

-- F. Kreator Konten: Media & Articles
DO $$
DECLARE
  perm TEXT;
  perms TEXT[] := ARRAY[
    'content.view', 'content.manage', 'programs.view',
    'tasks.update_assigned', 'weekly_reports.submit'
  ];
BEGIN
  FOREACH perm IN ARRAY perms LOOP
    PERFORM public.seed_role_permission('kreator_konten', perm);
  END LOOP;
END $$;

-- G. Fasilitator: Assigned Class Sessions & Attendance
DO $$
DECLARE
  perm TEXT;
  perms TEXT[] := ARRAY[
    'sessions.manage_assigned', 'attendance.record_assigned', 'materials.manage_assigned',
    'participants.view_assigned', 'registrations.view_assigned',
    'tasks.update_assigned', 'weekly_reports.submit'
  ];
BEGIN
  FOREACH perm IN ARRAY perms LOOP
    PERFORM public.seed_role_permission('fasilitator', perm);
  END LOOP;
END $$;

-- H. Relawan: Assigned Tasks & Assigned Activities
DO $$
DECLARE
  perm TEXT;
  perms TEXT[] := ARRAY[
    'tasks.update_assigned', 'activities.view'
  ];
BEGIN
  FOREACH perm IN ARRAY perms LOOP
    PERFORM public.seed_role_permission('relawan', perm);
  END LOOP;
END $$;

-- I. Peserta: Self-service & Enrolled Materials
DO $$
DECLARE
  perm TEXT;
  perms TEXT[] := ARRAY[
    'programs.view', 'batches.view', 'materials.view_enrolled', 'certificates.download_own'
  ];
BEGIN
  FOREACH perm IN ARRAY perms LOOP
    PERFORM public.seed_role_permission('peserta', perm);
  END LOOP;
END $$;

-- J. Alumni: Community Networking
DO $$
DECLARE
  perm TEXT;
  perms TEXT[] := ARRAY[
    'community.view', 'programs.view'
  ];
BEGIN
  FOREACH perm IN ARRAY perms LOOP
    PERFORM public.seed_role_permission('alumni', perm);
  END LOOP;
END $$;

-- Clean up helper function
DROP FUNCTION public.seed_role_permission(VARCHAR, VARCHAR);

-- 5. INITIAL OFFICIAL BANK ACCOUNT (Placeholder)
INSERT INTO public.payment_instructions (bank_name, account_number, account_holder, instructions, is_active)
VALUES (
  'Bank Syariah Indonesia (BSI)',
  '7201234567',
  'Yayasan Sahabat Pembelajar Ayah',
  'Mohon sertakan kode unik transaksi pada nominal transfer untuk mempercepat verifikasi otomatis oleh bendahara.',
  true
)
ON CONFLICT DO NOTHING;

