-- ==============================================================================
-- Migration: 00005_lms_and_tasks.sql
-- Description: Class sessions, attendance, materials, certificates, tasks, KPI, Friday reports, alumni, & audit logs
-- Architecture: SAPA Ayah Digital Platform (PostgreSQL 15+)
-- ==============================================================================

-- 1. DOMAIN: LEARNING MANAGEMENT SYSTEM (LMS)
CREATE TABLE IF NOT EXISTS public.class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.program_batches(id) ON DELETE CASCADE,
  session_number INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  meeting_url TEXT,
  facilitator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_class_sessions_updated_at
  BEFORE UPDATE ON public.class_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.class_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  attendance_status VARCHAR(20) NOT NULL DEFAULT 'absent' CHECK (attendance_status IN ('present', 'absent', 'excused', 'late')),
  recorded_by UUID REFERENCES public.profiles(id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE (session_id, participant_id)
);

CREATE TABLE IF NOT EXISTS public.learning_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.program_batches(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.class_sessions(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_storage_path TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size_bytes BIGINT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  batch_id UUID NOT NULL REFERENCES public.program_batches(id) ON DELETE RESTRICT,
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE RESTRICT,
  issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
  pdf_storage_path TEXT,
  signed_by_profile_id UUID REFERENCES public.profiles(id),
  verification_hash VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (batch_id, participant_id)
);

-- 2. DOMAIN: PERFORMANCE TARGETS & TASKS
CREATE TABLE IF NOT EXISTS public.target_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'review', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.performance_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID NOT NULL REFERENCES public.target_periods(id) ON DELETE CASCADE,
  position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  target_metric VARCHAR(100) NOT NULL,
  target_value INT NOT NULL,
  achieved_value INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_performance_targets_updated_at
  BEFORE UPDATE ON public.performance_targets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.progress_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID NOT NULL REFERENCES public.performance_targets(id) ON DELETE CASCADE,
  updated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  increment_value INT NOT NULL DEFAULT 0,
  notes TEXT NOT NULL,
  evidence_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  related_target_id UUID REFERENCES public.performance_targets(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  due_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES public.profiles(id)
);

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.task_assignments (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  assignee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, assignee_id)
);

CREATE TABLE IF NOT EXISTS public.task_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  progress_percent INT CHECK (progress_percent BETWEEN 0 AND 100),
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. DOMAIN: WEEKLY FRIDAY REPORTS (Ritme Kerja 3 Baris)
CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  week_date DATE NOT NULL,
  completed_work TEXT NOT NULL,
  upcoming_plan TEXT NOT NULL,
  blockers TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, week_date)
);

-- 4. DOMAIN: ALUMNI & COMMUNITY
CREATE TABLE IF NOT EXISTS public.alumni_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID UNIQUE NOT NULL REFERENCES public.participants(id) ON DELETE RESTRICT,
  graduation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active_community_member BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumni_id UUID NOT NULL REFERENCES public.alumni_profiles(id) ON DELETE CASCADE,
  community_group_name VARCHAR(100) NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. DOMAIN: AUDIT TRAIL (Immutable System Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  before_data JSONB,
  after_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent UPDATE & DELETE on Audit Logs
CREATE OR REPLACE FUNCTION public.trg_fn_immutable_audit_logs()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable. UPDATE and DELETE operations are forbidden.';
END;
$$;

CREATE TRIGGER trg_audit_logs_immutable
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_immutable_audit_logs();

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_class_sessions_batch_id ON public.class_sessions(batch_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_facilitator ON public.class_sessions(facilitator_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session_id ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_participant_id ON public.attendance_records(participant_id);
CREATE INDEX IF NOT EXISTS idx_learning_materials_batch_id ON public.learning_materials(batch_id);
CREATE INDEX IF NOT EXISTS idx_certificates_participant ON public.certificates(participant_id);
CREATE INDEX IF NOT EXISTS idx_performance_targets_period ON public.performance_targets(period_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_assignee ON public.task_assignments(assignee_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_date ON public.weekly_reports(week_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);

