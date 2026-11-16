-- ==============================================================================
-- Migration: 00006_rls_and_security_policies.sql
-- Description: PostgreSQL Row Level Security (RLS) & Supabase Storage Policies
-- Architecture: SAPA Ayah Digital Platform (PostgreSQL 15+)
-- ==============================================================================

-- 1. SECURITY DEFINER HELPER: has_permission()
-- Purpose: Evaluates granular user permissions without recursive RLS loop
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID,
  _permission_code VARCHAR
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
      AND p.code = _permission_code
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

-- Restrict execute permissions
REVOKE EXECUTE ON FUNCTION public.has_permission(UUID, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_permission(UUID, VARCHAR) TO authenticated, service_role;

-- 2. ENABLE ROW LEVEL SECURITY ON ALL APPLICATION TABLES (35 Tables)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizational_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proof_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. RLS POLICIES SPECIFICATION
-- ==============================================================================

-- A. PROFILES & ROLES
CREATE POLICY "profiles_select_own_or_authorized" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_permission(auth.uid(), 'users.view'));

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "roles_select_all" ON public.roles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "permissions_select_all" ON public.permissions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "role_permissions_select_all" ON public.role_permissions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "user_roles_select_own_or_authorized" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_permission(auth.uid(), 'users.view'));

CREATE POLICY "user_roles_manage_authorized" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'roles.assign'))
  WITH CHECK (public.has_permission(auth.uid(), 'roles.assign'));

-- B. ORGANIZATIONAL STRUCTURE
CREATE POLICY "org_units_select_all" ON public.organizational_units
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "org_units_manage" ON public.organizational_units
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'organization.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'organization.manage'));

CREATE POLICY "positions_select_all" ON public.positions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "positions_manage" ON public.positions
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'positions.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'positions.manage'));

CREATE POLICY "personnel_assignments_select_all" ON public.personnel_assignments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "personnel_assignments_manage" ON public.personnel_assignments
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'personnel.assign'))
  WITH CHECK (public.has_permission(auth.uid(), 'personnel.assign'));

CREATE POLICY "job_descriptions_select_all" ON public.job_descriptions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "job_descriptions_manage" ON public.job_descriptions
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'organization.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'organization.manage'));

CREATE POLICY "memberships_select" ON public.memberships
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.has_permission(auth.uid(), 'organization.view'));

CREATE POLICY "memberships_manage" ON public.memberships
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'organization.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'organization.manage'));

CREATE POLICY "membership_history_select" ON public.membership_status_history
  FOR SELECT TO authenticated
  USING (membership_id IN (SELECT id FROM public.memberships WHERE profile_id = auth.uid()) OR public.has_permission(auth.uid(), 'organization.view'));

-- C. PROGRAMS & ACTIVITIES
CREATE POLICY "programs_select" ON public.programs
  FOR SELECT TO public
  USING (visibility = 'published' OR (auth.role() = 'authenticated' AND public.has_permission(auth.uid(), 'programs.view')));

CREATE POLICY "programs_manage" ON public.programs
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'programs.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'programs.manage'));

CREATE POLICY "batches_select" ON public.program_batches
  FOR SELECT TO public
  USING (status IN ('open', 'in_progress', 'completed') OR (auth.role() = 'authenticated' AND public.has_permission(auth.uid(), 'batches.view')));

CREATE POLICY "batches_manage" ON public.program_batches
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'batches.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'batches.manage'));

CREATE POLICY "activities_select" ON public.activities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "activities_manage" ON public.activities
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'activities.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'activities.manage'));

CREATE POLICY "activity_assignments_select" ON public.activity_assignments
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.has_permission(auth.uid(), 'activities.view'));

CREATE POLICY "activity_assignments_manage" ON public.activity_assignments
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'activities.assign'))
  WITH CHECK (public.has_permission(auth.uid(), 'activities.assign'));

-- D. PARTICIPANTS & REGISTRATIONS
CREATE POLICY "participants_select" ON public.participants
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR public.has_permission(auth.uid(), 'participants.view_all')
    OR (
      public.has_permission(auth.uid(), 'participants.view_assigned')
      AND id IN (
        SELECT r.participant_id
        FROM public.registrations r
        JOIN public.activities a ON a.batch_id = r.batch_id
        JOIN public.activity_assignments aa ON aa.activity_id = a.id
        WHERE aa.profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "participants_insert_self_or_admin" ON public.participants
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.has_permission(auth.uid(), 'participants.manage'));

CREATE POLICY "participants_update_self_or_admin" ON public.participants
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid() OR public.has_permission(auth.uid(), 'participants.manage'))
  WITH CHECK (profile_id = auth.uid() OR public.has_permission(auth.uid(), 'participants.manage'));

CREATE POLICY "registrations_select" ON public.registrations
  FOR SELECT TO authenticated
  USING (
    participant_id IN (SELECT id FROM public.participants WHERE profile_id = auth.uid())
    OR public.has_permission(auth.uid(), 'registrations.view_all')
    OR (
      public.has_permission(auth.uid(), 'registrations.view_assigned')
      AND batch_id IN (
        SELECT a.batch_id
        FROM public.activities a
        JOIN public.activity_assignments aa ON aa.activity_id = a.id
        WHERE aa.profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "registrations_insert_self_or_admin" ON public.registrations
  FOR INSERT TO authenticated
  WITH CHECK (
    participant_id IN (SELECT id FROM public.participants WHERE profile_id = auth.uid())
    OR public.has_permission(auth.uid(), 'registrations.create_admin')
  );

CREATE POLICY "registrations_manage" ON public.registrations
  FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'registrations.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'registrations.manage'));

-- E. PAYMENTS & VERIFICATION
CREATE POLICY "payment_instructions_select" ON public.payment_instructions
  FOR SELECT TO public
  USING (is_active = true OR (auth.role() = 'authenticated' AND public.has_permission(auth.uid(), 'payments.manage_accounts')));

CREATE POLICY "payment_instructions_manage" ON public.payment_instructions
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'payments.manage_accounts'))
  WITH CHECK (public.has_permission(auth.uid(), 'payments.manage_accounts'));

CREATE POLICY "payments_select" ON public.payments
  FOR SELECT TO authenticated
  USING (
    registration_id IN (
      SELECT r.id FROM public.registrations r
      JOIN public.participants p ON r.participant_id = p.id
      WHERE p.profile_id = auth.uid()
    )
    OR public.has_permission(auth.uid(), 'payments.view_all')
  );

CREATE POLICY "payments_update_verify" ON public.payments
  FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'payments.verify'))
  WITH CHECK (public.has_permission(auth.uid(), 'payments.verify'));

CREATE POLICY "proof_submissions_select" ON public.payment_proof_submissions
  FOR SELECT TO authenticated
  USING (
    payment_id IN (
      SELECT py.id FROM public.payments py
      JOIN public.registrations r ON py.registration_id = r.id
      JOIN public.participants p ON r.participant_id = p.id
      WHERE p.profile_id = auth.uid()
    )
    OR public.has_permission(auth.uid(), 'payments.view_all')
  );

CREATE POLICY "proof_submissions_insert_payer" ON public.payment_proof_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    payment_id IN (
      SELECT py.id FROM public.payments py
      JOIN public.registrations r ON py.registration_id = r.id
      JOIN public.participants p ON r.participant_id = p.id
      WHERE p.profile_id = auth.uid()
        AND py.status IN ('pending', 'rejected')
    )
  );

CREATE POLICY "payment_verifications_select" ON public.payment_verifications
  FOR SELECT TO authenticated
  USING (
    submission_id IN (
      SELECT pps.id FROM public.payment_proof_submissions pps
      JOIN public.payments py ON py.id = pps.payment_id
      JOIN public.registrations r ON py.registration_id = r.id
      JOIN public.participants p ON r.participant_id = p.id
      WHERE p.profile_id = auth.uid()
    )
    OR public.has_permission(auth.uid(), 'payments.view_all')
  );

CREATE POLICY "payment_verifications_insert_reviewer" ON public.payment_verifications
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_permission(auth.uid(), 'payments.verify')
    AND reviewer_id = auth.uid()
  );

-- F. LMS (Sessions, Attendance, Materials, Certificates)
CREATE POLICY "class_sessions_select" ON public.class_sessions
  FOR SELECT TO authenticated
  USING (
    batch_id IN (
      SELECT r.batch_id FROM public.registrations r
      JOIN public.participants p ON r.participant_id = p.id
      WHERE p.profile_id = auth.uid() AND r.status = 'accepted'
    )
    OR facilitator_id = auth.uid()
    OR public.has_permission(auth.uid(), 'programs.view')
  );

CREATE POLICY "class_sessions_manage" ON public.class_sessions
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'programs.manage')
    OR (public.has_permission(auth.uid(), 'sessions.manage_assigned') AND facilitator_id = auth.uid())
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'programs.manage')
    OR (public.has_permission(auth.uid(), 'sessions.manage_assigned') AND facilitator_id = auth.uid())
  );

CREATE POLICY "attendance_records_select" ON public.attendance_records
  FOR SELECT TO authenticated
  USING (
    participant_id IN (SELECT id FROM public.participants WHERE profile_id = auth.uid())
    OR recorded_by = auth.uid()
    OR public.has_permission(auth.uid(), 'attendance.record_assigned')
  );

CREATE POLICY "attendance_records_record" ON public.attendance_records
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'attendance.record_assigned')
    AND session_id IN (
      SELECT id FROM public.class_sessions
      WHERE facilitator_id = auth.uid() OR public.has_permission(auth.uid(), 'programs.manage')
    )
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'attendance.record_assigned')
    AND session_id IN (
      SELECT id FROM public.class_sessions
      WHERE facilitator_id = auth.uid() OR public.has_permission(auth.uid(), 'programs.manage')
    )
  );

CREATE POLICY "materials_select" ON public.learning_materials
  FOR SELECT TO authenticated
  USING (
    batch_id IN (
      SELECT r.batch_id FROM public.registrations r
      JOIN public.participants p ON r.participant_id = p.id
      WHERE p.profile_id = auth.uid() AND r.status = 'accepted'
    )
    OR public.has_permission(auth.uid(), 'materials.manage_assigned')
  );

CREATE POLICY "materials_manage" ON public.learning_materials
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'materials.manage_assigned'))
  WITH CHECK (public.has_permission(auth.uid(), 'materials.manage_assigned'));

CREATE POLICY "certificates_select" ON public.certificates
  FOR SELECT TO authenticated
  USING (
    participant_id IN (SELECT id FROM public.participants WHERE profile_id = auth.uid())
    OR public.has_permission(auth.uid(), 'certificates.issue')
  );

CREATE POLICY "certificates_issue" ON public.certificates
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'certificates.issue'))
  WITH CHECK (public.has_permission(auth.uid(), 'certificates.issue'));

-- G. TASKS, KPI, & FRIDAY REPORTS
CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR id IN (SELECT task_id FROM public.task_assignments WHERE assignee_id = auth.uid())
    OR public.has_permission(auth.uid(), 'tasks.manage_all')
  );

CREATE POLICY "tasks_manage" ON public.tasks
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'tasks.manage_all'))
  WITH CHECK (public.has_permission(auth.uid(), 'tasks.manage_all'));

CREATE POLICY "task_assignments_select" ON public.task_assignments
  FOR SELECT TO authenticated
  USING (
    assignee_id = auth.uid()
    OR task_id IN (SELECT id FROM public.tasks WHERE created_by = auth.uid())
    OR public.has_permission(auth.uid(), 'tasks.manage_all')
  );

CREATE POLICY "task_updates_select" ON public.task_updates
  FOR SELECT TO authenticated
  USING (
    logged_by = auth.uid()
    OR task_id IN (SELECT id FROM public.tasks WHERE created_by = auth.uid())
    OR public.has_permission(auth.uid(), 'tasks.manage_all')
  );

CREATE POLICY "task_updates_insert" ON public.task_updates
  FOR INSERT TO authenticated
  WITH CHECK (
    logged_by = auth.uid()
    AND task_id IN (SELECT task_id FROM public.task_assignments WHERE assignee_id = auth.uid())
  );

CREATE POLICY "target_periods_select" ON public.target_periods
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "performance_targets_select" ON public.performance_targets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "performance_targets_manage" ON public.performance_targets
  FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'targets.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'targets.manage'));

CREATE POLICY "progress_updates_select" ON public.progress_updates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "progress_updates_insert" ON public.progress_updates
  FOR INSERT TO authenticated
  WITH CHECK (
    updated_by = auth.uid()
    AND (
      target_id IN (SELECT id FROM public.performance_targets WHERE profile_id = auth.uid())
      OR public.has_permission(auth.uid(), 'targets.manage')
    )
  );

CREATE POLICY "weekly_reports_select" ON public.weekly_reports
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.has_permission(auth.uid(), 'weekly_reports.view_all'));

CREATE POLICY "weekly_reports_insert_update" ON public.weekly_reports
  FOR ALL TO authenticated
  USING (profile_id = auth.uid() AND public.has_permission(auth.uid(), 'weekly_reports.submit'))
  WITH CHECK (profile_id = auth.uid() AND public.has_permission(auth.uid(), 'weekly_reports.submit'));

-- H. ALUMNI & AUDIT LOGS
CREATE POLICY "alumni_profiles_select" ON public.alumni_profiles
  FOR SELECT TO authenticated
  USING (participant_id IN (SELECT id FROM public.participants WHERE profile_id = auth.uid()) OR public.has_permission(auth.uid(), 'community.view'));

CREATE POLICY "community_memberships_select" ON public.community_memberships
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'audit_logs.view'));

-- ==============================================================================
-- 4. SUPABASE STORAGE BUCKET CONFIGURATION & POLICIES
-- ==============================================================================

-- A. Bucket Creation (Idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('private-payment-proofs', 'private-payment-proofs', false, 2097152, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('private-learning-materials', 'private-learning-materials', false, 52428800, ARRAY['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']),
  ('private-documents', 'private-documents', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- B. Storage RLS Policies
-- 1. private-payment-proofs
CREATE POLICY "storage_proof_upload_payer" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'private-payment-proofs'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_proof_read_owner_or_reviewer" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'private-payment-proofs'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR public.has_permission(auth.uid(), 'payments.verify')
      OR public.has_permission(auth.uid(), 'payments.view_all')
    )
  );

-- 2. private-learning-materials
CREATE POLICY "storage_materials_upload_authorized" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'private-learning-materials'
    AND public.has_permission(auth.uid(), 'materials.manage_assigned')
  );

CREATE POLICY "storage_materials_read_enrolled" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'private-learning-materials'
    AND (
      public.has_permission(auth.uid(), 'materials.manage_assigned')
      OR public.has_permission(auth.uid(), 'materials.view_enrolled')
    )
  );

-- 3. private-documents
CREATE POLICY "storage_docs_manage" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'private-documents'
    AND (public.has_permission(auth.uid(), 'organization.manage') OR public.has_permission(auth.uid(), 'finance.manage'))
  )
  WITH CHECK (
    bucket_id = 'private-documents'
    AND (public.has_permission(auth.uid(), 'organization.manage') OR public.has_permission(auth.uid(), 'finance.manage'))
  );

