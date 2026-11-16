-- ==============================================================================
-- Migration: 00010_payment_integrity.sql
-- Description: Harden payment verification with row locks, atomic transitions, & race condition prevention
-- Architecture: SAPA Ayah Digital Platform (PostgreSQL 15+)
-- Remediation for: SEC-05 (Critical Severity)
-- ==============================================================================

-- 1. HARDEN BEFORE INSERT TRIGGER ON payment_verifications
-- Purpose:
-- a. Force reviewer_id = auth.uid() (prevent client spoofing)
-- b. Enforce Segregation of Duties (prevent self-verification)
-- c. Lock the parent payment row (FOR UPDATE) to prevent concurrent review race conditions
-- d. Validate that payment is currently in a reviewable state

CREATE OR REPLACE FUNCTION public.trg_fn_validate_payment_verification_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payer_profile_id UUID;
  v_payment_id UUID;
  v_current_payment_status VARCHAR(20);
  v_current_submission_status VARCHAR(20);
BEGIN
  -- 1. Ensure reviewer_id is authenticated user (ignore any spoofed client value)
  IF auth.uid() IS NOT NULL THEN
    NEW.reviewer_id := auth.uid();
  END IF;

  IF NEW.reviewer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication Violation: Reviewer must be an authenticated user.';
  END IF;

  -- 2. Verify Reviewer Permission
  IF NOT public.has_permission(NEW.reviewer_id, 'payments.verify') THEN
    RAISE EXCEPTION 'Authorization Violation: User % lacks payments.verify permission.', NEW.reviewer_id;
  END IF;

  -- 3. Lock Submission and Payment with FOR UPDATE to prevent race conditions
  SELECT pps.status, py.id, py.status, pt.profile_id
  INTO v_current_submission_status, v_payment_id, v_current_payment_status, v_payer_profile_id
  FROM public.payment_proof_submissions pps
  JOIN public.payments py ON py.id = pps.payment_id
  JOIN public.registrations r ON r.id = py.registration_id
  JOIN public.participants pt ON pt.id = r.participant_id
  WHERE pps.id = NEW.submission_id
  FOR UPDATE OF py, pps;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Data Integrity Violation: Submission % or payment record not found.', NEW.submission_id;
  END IF;

  -- 4. Check if already reviewed
  IF v_current_submission_status IN ('verified', 'rejected') THEN
    RAISE EXCEPTION 'Race Condition Violation: Submission % has already been %.', NEW.submission_id, v_current_submission_status;
  END IF;

  -- 5. Enforce Segregation of Duties
  IF v_payer_profile_id IS NOT NULL AND v_payer_profile_id = NEW.reviewer_id THEN
    RAISE EXCEPTION 'Segregation of Duties Violation: Reviewer cannot verify their own payment.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_payment_verification_before ON public.payment_verifications;
CREATE TRIGGER trg_validate_payment_verification_before
  BEFORE INSERT ON public.payment_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_validate_payment_verification_before_insert();

-- 2. HARDEN AFTER INSERT TRIGGER ON payment_verifications
-- Synchronize statuses across submission, payments, and registrations atomically
CREATE OR REPLACE FUNCTION public.trg_fn_payment_verification_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_id UUID;
  v_registration_id UUID;
BEGIN
  SELECT py.id, py.registration_id
  INTO v_payment_id, v_registration_id
  FROM public.payment_proof_submissions pps
  JOIN public.payments py ON py.id = pps.payment_id
  WHERE pps.id = NEW.submission_id;

  -- 1. Update Submission status
  UPDATE public.payment_proof_submissions
  SET status = NEW.decision
  WHERE id = NEW.submission_id;

  -- 2. Synchronize Payment and Registration statuses
  IF NEW.decision = 'verified' THEN
    UPDATE public.payments
    SET status = 'verified', updated_at = now()
    WHERE id = v_payment_id;

    UPDATE public.registrations
    SET status = 'accepted', reviewed_by = NEW.reviewer_id, updated_at = now()
    WHERE id = v_registration_id;

  ELSIF NEW.decision = 'rejected' THEN
    UPDATE public.payments
    SET status = 'rejected', updated_at = now()
    WHERE id = v_payment_id;

    -- Ensure registration status reflects rejected payment (revert from accepted if needed)
    UPDATE public.registrations
    SET status = 'under_review', reviewed_by = NEW.reviewer_id, updated_at = now()
    WHERE id = v_registration_id AND status = 'accepted';
  END IF;

  -- 3. Automatic Audit Log Entry for Financial Action
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, after_data)
  VALUES (
    NEW.reviewer_id,
    'PAYMENT_VERIFIED_' || UPPER(NEW.decision),
    'payments',
    v_payment_id,
    jsonb_build_object(
      'decision', NEW.decision,
      'submission_id', NEW.submission_id,
      'notes', NEW.notes,
      'timestamp', now()
    )
  );

  RETURN NEW;
END;
$$;

