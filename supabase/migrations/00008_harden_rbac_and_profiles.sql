-- ==============================================================================
-- Migration: 00008_harden_rbac_and_profiles.sql
-- Description: Harden has_permission against enumeration, protect profiles mass-assignment
-- Architecture: SAPA Ayah Digital Platform (PostgreSQL 15+)
-- Remediation for: SEC-02 (Medium Severity) & SEC-04 (Critical Severity)
-- ==============================================================================

-- 1. HARDEN has_permission() FUNCTION
-- Users can ONLY check their own permissions, preventing privilege enumeration of other users.
-- Only super_admin or service_role can check permissions of other users.

CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID,
  _permission_code VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_is_authorized_checker BOOLEAN := false;
  v_has_perm BOOLEAN := false;
BEGIN
  v_caller_id := auth.uid();

  -- If caller is checking their own permission, always allowed
  IF v_caller_id IS NOT NULL AND v_caller_id = _user_id THEN
    v_is_authorized_checker := true;
  -- If caller is service_role (e.g. background job), allowed
  ELSIF auth.role() = 'service_role' OR v_caller_id IS NULL THEN
    v_is_authorized_checker := true;
  -- If caller is a super_admin, allowed to inspect other users
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = v_caller_id
        AND r.code = 'super_admin'
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    ) INTO v_is_authorized_checker;
  END IF;

  -- Block unauthorized cross-user permission snooping
  IF NOT v_is_authorized_checker THEN
    RETURN false;
  END IF;

  -- Evaluate actual permission grant
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
      AND p.code = _permission_code
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  ) INTO v_has_perm;

  RETURN v_has_perm;
END;
$$;

-- Provide convenient 1-argument overload that automatically uses auth.uid()
CREATE OR REPLACE FUNCTION public.has_my_permission(_permission_code VARCHAR)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_permission(auth.uid(), _permission_code);
$$;

REVOKE EXECUTE ON FUNCTION public.has_my_permission(VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_my_permission(VARCHAR) TO authenticated, service_role;

-- 2. HARDEN PROFILES AGAINST MASS-ASSIGNMENT & PRIVILEGE ESCALATION
-- Regular users can only update personal fields: full_name, display_name, phone, avatar_path.
-- Sensitive fields (account_status, is_archived, archived_at, archived_by, id) CANNOT be changed by users.

CREATE OR REPLACE FUNCTION public.trg_fn_protect_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN := false;
BEGIN
  -- Check if caller is super_admin or service_role
  IF auth.role() = 'service_role' THEN
    v_is_admin := true;
  ELSIF auth.uid() IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.code = 'super_admin'
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    ) INTO v_is_admin;
  END IF;

  -- If not admin, block changes to sensitive columns
  IF NOT v_is_admin THEN
    -- Protect ID
    IF NEW.id != OLD.id THEN
      RAISE EXCEPTION 'Security Violation: Cannot change profile ID.';
    END IF;

    -- Protect account_status
    IF NEW.account_status != OLD.account_status THEN
      RAISE EXCEPTION 'Security Violation: Users cannot modify their own account status.';
    END IF;

    -- Protect archival status
    IF NEW.is_archived != OLD.is_archived OR NEW.archived_at IS DISTINCT FROM OLD.archived_at OR NEW.archived_by IS DISTINCT FROM OLD.archived_by THEN
      RAISE EXCEPTION 'Security Violation: Users cannot archive or restore their own profile.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_protect_profile_columns();

-- 3. HARDEN USER_ROLES POLICIES (Explicit Anti-Self-Assignment)
DROP POLICY IF EXISTS "user_roles_manage_authorized" ON public.user_roles;

CREATE POLICY "user_roles_manage_authorized" ON public.user_roles
  FOR ALL TO authenticated
  USING (
    public.has_permission(auth.uid(), 'roles.assign')
    AND user_id != auth.uid() -- Cannot modify own roles to prevent escalation/lockout
  )
  WITH CHECK (
    public.has_permission(auth.uid(), 'roles.assign')
    AND user_id != auth.uid()
  );

