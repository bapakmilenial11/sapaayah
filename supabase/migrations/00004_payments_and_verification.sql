-- ==============================================================================
-- Migration: 00004_payments_and_verification.sql
-- Description: Bank accounts, payments, multi-submission proof, & reviewer verification
-- Architecture: SAPA Ayah Digital Platform (PostgreSQL 15+)
-- ==============================================================================

-- 1. DOMAIN: PAYMENT INSTRUCTIONS (Official Bank Accounts)
CREATE TABLE IF NOT EXISTS public.payment_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name VARCHAR(50) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_holder VARCHAR(150) NOT NULL,
  instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_payment_instructions_updated_at
  BEFORE UPDATE ON public.payment_instructions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 2. DOMAIN: PAYMENTS (Registration Invoices)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE RESTRICT,
  instruction_id UUID NOT NULL REFERENCES public.payment_instructions(id) ON DELETE RESTRICT,
  amount_due DECIMAL(12, 2) NOT NULL,
  unique_code INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'under_review', 'verified', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3. DOMAIN: PAYMENT PROOF SUBMISSIONS (Multi-Submission History)
CREATE TABLE IF NOT EXISTS public.payment_proof_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  submission_number INT NOT NULL DEFAULT 1,
  proof_storage_path TEXT NOT NULL,
  amount_transferred DECIMAL(12, 2) NOT NULL,
  sender_bank_name VARCHAR(50),
  sender_account_name VARCHAR(150),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'verified', 'rejected'))
);

-- 4. DOMAIN: PAYMENT VERIFICATIONS (Audited Decision Trail)
CREATE TABLE IF NOT EXISTS public.payment_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.payment_proof_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  decision VARCHAR(20) NOT NULL CHECK (decision IN ('verified', 'rejected')),
  notes TEXT NOT NULL,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TRIGGER FUNCTION: Prevent Self-Verification & Sync Payment Status
CREATE OR REPLACE FUNCTION public.trg_fn_payment_verification_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payer_profile_id UUID;
  v_payment_id UUID;
  v_registration_id UUID;
BEGIN
  -- 1. Identify Payer Profile ID
  SELECT pt.profile_id, py.id, py.registration_id
  INTO v_payer_profile_id, v_payment_id, v_registration_id
  FROM public.payment_proof_submissions pps
  JOIN public.payments py ON py.id = pps.payment_id
  JOIN public.registrations r ON r.id = py.registration_id
  JOIN public.participants pt ON pt.id = r.participant_id
  WHERE pps.id = NEW.submission_id;

  -- 2. Enforce Segregation of Duties (Payer cannot verify own payment)
  IF v_payer_profile_id IS NOT NULL AND v_payer_profile_id = NEW.reviewer_id THEN
    RAISE EXCEPTION 'Segregation of Duties Violation: Reviewer (%) cannot verify their own payment.', NEW.reviewer_id;
  END IF;

  -- 3. Update Submission Status
  UPDATE public.payment_proof_submissions
  SET status = NEW.decision
  WHERE id = NEW.submission_id;

  -- 4. Update Parent Payment & Registration Status
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
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_after_payment_verification
  AFTER INSERT ON public.payment_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_payment_verification_sync();

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_payments_registration_id ON public.payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_proof_submissions_payment_id ON public.payment_proof_submissions(payment_id);
CREATE INDEX IF NOT EXISTS idx_verifications_submission_id ON public.payment_verifications(submission_id);
CREATE INDEX IF NOT EXISTS idx_verifications_reviewer_id ON public.payment_verifications(reviewer_id);

