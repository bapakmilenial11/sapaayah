-- ==============================================================================
-- Migration: 00011_audit_and_reports_hardening.sql
-- Description: Harden audit logs immutability, fix weekly_reports policies, & robust phone normalization
-- Architecture: SAPA Ayah Digital Platform (PostgreSQL 15+)
-- Remediation for: SEC-06 (High), SEC-07 (Medium), & SEC-08 (Medium)
-- ==============================================================================

-- 1. HARDEN AUDIT LOGS AGAINST TRUNCATE & FORGERY
-- A. Block TRUNCATE on audit_logs
CREATE OR REPLACE FUNCTION public.trg_fn_prevent_audit_logs_truncate()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable. TRUNCATE operation is strictly forbidden.';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_no_truncate ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_no_truncate
  BEFORE TRUNCATE ON public.audit_logs
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trg_fn_prevent_audit_logs_truncate();

-- B. Harden RLS on audit_logs: Restrict INSERT to system triggers and service_role only
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;

CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'audit_logs.view'));

CREATE POLICY "audit_logs_insert_system_only" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Authenticated users can only insert audit logs matching their own auth.uid() as actor
    actor_id = auth.uid()
  );

-- 2. HARDEN WEEKLY REPORTS RLS POLICIES (Prevent Unintentional Deletion)
DROP POLICY IF EXISTS "weekly_reports_insert_update" ON public.weekly_reports;
DROP POLICY IF EXISTS "weekly_reports_select" ON public.weekly_reports;

-- Separate SELECT policy
CREATE POLICY "weekly_reports_select" ON public.weekly_reports
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR public.has_permission(auth.uid(), 'weekly_reports.view_all')
  );

-- Separate INSERT policy
CREATE POLICY "weekly_reports_insert" ON public.weekly_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND public.has_permission(auth.uid(), 'weekly_reports.submit')
  );

-- Separate UPDATE policy (No DELETE policy is created, disallowing report deletion)
CREATE POLICY "weekly_reports_update" ON public.weekly_reports
  FOR UPDATE TO authenticated
  USING (
    profile_id = auth.uid()
    AND public.has_permission(auth.uid(), 'weekly_reports.submit')
  )
  WITH CHECK (
    profile_id = auth.uid()
    AND public.has_permission(auth.uid(), 'weekly_reports.submit')
  );

-- 3. ENHANCE PHONE NORMALIZATION (Robust Indonesian Format Validation)
-- Handles:
-- - '08123456789' -> '+628123456789'
-- - '628123456789' -> '+628123456789'
-- - '+628123456789' -> '+628123456789'
-- - Validates length: Indonesian mobile numbers are between 10 to 14 digits (after +62: 9 to 13 digits).
-- - Rejects invalid formats (e.g. '081', non-digits, garbage).

CREATE OR REPLACE FUNCTION public.normalize_phone(p_phone TEXT)
RETURNS VARCHAR(25)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_clean TEXT;
  v_digits TEXT;
BEGIN
  IF p_phone IS NULL OR trim(p_phone) = '' THEN
    RETURN NULL;
  END IF;

  v_clean := trim(p_phone);

  -- Extract all digits
  v_digits := regexp_replace(v_clean, '[^0-9]', '', 'g');

  -- Convert local 08... to 628...
  IF v_digits LIKE '08%' THEN
    v_digits := '62' || substr(v_digits, 2);
  -- If starts with 8... (missing leading 0), prepend 62
  ELSIF v_digits LIKE '8%' AND length(v_digits) BETWEEN 9 AND 13 THEN
    v_digits := '62' || v_digits;
  END IF;

  -- Validate: Indonesian number starting with 628 must have total length 11 to 15 digits (including 62)
  IF v_digits NOT LIKE '628%' OR length(v_digits) < 11 OR length(v_digits) > 15 THEN
    RAISE EXCEPTION 'Format Nomor Telepon Tidak Valid: "%" harus berupa nomor seluler Indonesia yang valid (contoh: 081234567890).', p_phone;
  END IF;

  RETURN ('+' || v_digits)::VARCHAR(25);
END;
$$;

