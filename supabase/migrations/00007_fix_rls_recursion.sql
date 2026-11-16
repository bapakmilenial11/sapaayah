-- ==============================================================================
-- Migration: 00007_fix_rls_recursion.sql
-- Description: Break RLS recursion between participants/registrations and tasks/task_assignments
-- Architecture: SAPA Ayah Digital Platform (PostgreSQL 15+)
-- Remediation for: SEC-01 (High Severity)
-- ==============================================================================

-- 1. HELPER FUNCTIONS (SECURITY DEFINER with explicit search_path)
-- These functions execute with elevated privileges to check relationships
-- without triggering recursive RLS evaluation on calling tables.

-- A. Returns participant IDs belonging to the authenticated user
CREATE OR REPLACE FUNCTION public.get_my_participant_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.participants WHERE profile_id = auth.uid();
$$;

-- B. Checks if the authenticated user is assigned to an activity
CREATE OR REPLACE FUNCTION public.is_user_assigned_to_activity(_activity_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.activity_assignments
    WHERE activity_id = _activity_id AND profile_id = auth.uid()
  );
$$;

-- C. Checks if the authenticated user is assigned to any activity within a batch
CREATE OR REPLACE FUNCTION public.is_user_assigned_to_batch(_batch_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.activity_assignments aa
    JOIN public.activities a ON a.id = aa.activity_id
    WHERE a.batch_id = _batch_id AND aa.profile_id = auth.uid()
  );
$$;

-- D. Checks if a participant is enrolled in any batch assigned to the authenticated user
CREATE OR REPLACE FUNCTION public.is_participant_in_my_assigned_batches(_participant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.registrations r
    JOIN public.activities a ON a.batch_id = r.batch_id
    JOIN public.activity_assignments aa ON aa.activity_id = a.id
    WHERE r.participant_id = _participant_id AND aa.profile_id = auth.uid()
  );
$$;

-- E. Checks if user is an assignee of a specific task
CREATE OR REPLACE FUNCTION public.is_task_assignee(_task_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.task_assignments
    WHERE task_id = _task_id AND assignee_id = auth.uid()
  );
$$;

-- F. Checks if user is the creator of a task associated with an assignment
CREATE OR REPLACE FUNCTION public.is_task_creator(_task_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tasks
    WHERE id = _task_id AND created_by = auth.uid()
  );
$$;

-- Revoke public execution, grant to authenticated and service_role
REVOKE EXECUTE ON FUNCTION public.get_my_participant_ids() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_user_assigned_to_activity(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_user_assigned_to_batch(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_participant_in_my_assigned_batches(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_task_assignee(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_task_creator(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_my_participant_ids() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_user_assigned_to_activity(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_user_assigned_to_batch(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_participant_in_my_assigned_batches(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_task_assignee(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_task_creator(UUID) TO authenticated, service_role;

-- 2. RE-DEFINE POLICIES TO ELIMINATE MUTUAL RECURSION

-- A. Table: public.participants
DROP POLICY IF EXISTS "participants_select" ON public.participants;
CREATE POLICY "participants_select" ON public.participants
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR public.has_permission(auth.uid(), 'participants.view_all')
    OR (
      public.has_permission(auth.uid(), 'participants.view_assigned')
      AND public.is_participant_in_my_assigned_batches(id)
    )
  );

-- B. Table: public.registrations
DROP POLICY IF EXISTS "registrations_select" ON public.registrations;
CREATE POLICY "registrations_select" ON public.registrations
  FOR SELECT TO authenticated
  USING (
    participant_id IN (SELECT public.get_my_participant_ids())
    OR public.has_permission(auth.uid(), 'registrations.view_all')
    OR (
      public.has_permission(auth.uid(), 'registrations.view_assigned')
      AND public.is_user_assigned_to_batch(batch_id)
    )
  );

DROP POLICY IF EXISTS "registrations_insert_self_or_admin" ON public.registrations;
CREATE POLICY "registrations_insert_self_or_admin" ON public.registrations
  FOR INSERT TO authenticated
  WITH CHECK (
    participant_id IN (SELECT public.get_my_participant_ids())
    OR public.has_permission(auth.uid(), 'registrations.create_admin')
  );

-- C. Table: public.tasks
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR public.is_task_assignee(id)
    OR public.has_permission(auth.uid(), 'tasks.manage_all')
  );

-- D. Table: public.task_assignments
DROP POLICY IF EXISTS "task_assignments_select" ON public.task_assignments;
CREATE POLICY "task_assignments_select" ON public.task_assignments
  FOR SELECT TO authenticated
  USING (
    assignee_id = auth.uid()
    OR public.is_task_creator(task_id)
    OR public.has_permission(auth.uid(), 'tasks.manage_all')
  );

-- E. Table: public.task_updates
DROP POLICY IF EXISTS "task_updates_select" ON public.task_updates;
CREATE POLICY "task_updates_select" ON public.task_updates
  FOR SELECT TO authenticated
  USING (
    logged_by = auth.uid()
    OR public.is_task_creator(task_id)
    OR public.is_task_assignee(task_id)
    OR public.has_permission(auth.uid(), 'tasks.manage_all')
  );

DROP POLICY IF EXISTS "task_updates_insert" ON public.task_updates;
CREATE POLICY "task_updates_insert" ON public.task_updates
  FOR INSERT TO authenticated
  WITH CHECK (
    logged_by = auth.uid()
    AND public.is_task_assignee(task_id)
  );

