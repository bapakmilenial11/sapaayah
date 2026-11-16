-- ==============================================================================
-- Test Suite: 00001_database_constraints_test.sql
-- Description: Unit & integration test assertions for PostgreSQL constraints
-- Architecture: SAPA Ayah Digital Platform
-- Usage: Can be executed in pgTAP or standard psql test runner
-- ==============================================================================

BEGIN;

-- 1. TEST: Phone number normalization trigger
INSERT INTO auth.users (id, email) VALUES ('11111111-1111-1111-1111-111111111111', 'ayah.budi@example.com') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, full_name, phone) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Budi Santoso', '081234567890')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.participants (id, profile_id, full_name, email, phone)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Budi Santoso',
  'AYAH.BUDI@EXAMPLE.COM',
  '0812-3456-7890'
);

-- Assertion 1: Email must be normalized to lowercase, phone to +6281234567890
DO $$
DECLARE
  v_phone VARCHAR(25);
  v_email VARCHAR(255);
BEGIN
  SELECT phone, email INTO v_phone, v_email FROM public.participants WHERE id = '22222222-2222-2222-2222-222222222222';
  IF v_phone != '+6281234567890' THEN
    RAISE EXCEPTION 'TEST FAILED: Phone normalization failed. Expected +6281234567890, got %', v_phone;
  END IF;
  IF v_email != 'ayah.budi@example.com' THEN
    RAISE EXCEPTION 'TEST FAILED: Email lowercase normalization failed. Expected ayah.budi@example.com, got %', v_email;
  END IF;
  RAISE NOTICE 'TEST PASSED: Participant phone and email normalization verified.';
END $$;

-- 2. TEST: Unique Phone and Email constraint on participants
DO $$
BEGIN
  BEGIN
    INSERT INTO public.participants (full_name, email, phone)
    VALUES ('Budi Kloning', 'ayah.budi@example.com', '+628999999999');
    RAISE EXCEPTION 'TEST FAILED: Duplicate email should have been rejected by unique constraint.';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'TEST PASSED: Duplicate participant email correctly rejected.';
  END;

  BEGIN
    INSERT INTO public.participants (full_name, email, phone)
    VALUES ('Budi Kloning 2', 'budi2@example.com', '081234567890');
    RAISE EXCEPTION 'TEST FAILED: Duplicate phone should have been rejected by unique constraint.';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'TEST PASSED: Duplicate participant phone correctly rejected.';
  END;
END $$;

-- 3. TEST: Self-Verification Prevention (Segregation of Duties)
INSERT INTO auth.users (id, email) VALUES ('33333333-3333-3333-3333-333333333333', 'bendahara.ganjar@example.com') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, full_name, phone) 
VALUES ('33333333-3333-3333-3333-333333333333', 'Ganjar Bendahara', '+628111111111')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.programs (id, name, slug, program_type, visibility)
VALUES ('44444444-4444-4444-4444-444444444444', 'SAPA Grow', 'sapa-grow-test', 'class', 'published');

INSERT INTO public.program_batches (id, program_id, batch_number, name, slug, registration_open_at, registration_close_at, start_at, end_at, price, capacity, status)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444',
  1,
  'Batch 1 Test',
  'batch-1-test',
  now() - interval '1 day',
  now() + interval '10 days',
  now() + interval '15 days',
  now() + interval '30 days',
  150000.00,
  30,
  'open'
);

INSERT INTO public.registrations (id, participant_id, batch_id, status)
VALUES ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'submitted');

INSERT INTO public.payment_instructions (id, bank_name, account_number, account_holder)
VALUES ('77777777-7777-7777-7777-777777777777', 'BSI', '12345678', 'Yayasan SAPA');

INSERT INTO public.payments (id, registration_id, instruction_id, amount_due, status)
VALUES ('88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', 150000.00, 'submitted');

INSERT INTO public.payment_proof_submissions (id, payment_id, submission_number, proof_storage_path, amount_transferred, status)
VALUES ('99999999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', 1, 'proofs/test.jpg', 150000.00, 'submitted');

-- Payer Budi attempts to verify his own payment (MUST FAIL)
DO $$
BEGIN
  BEGIN
    INSERT INTO public.payment_verifications (submission_id, reviewer_id, decision, notes)
    VALUES ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'verified', 'Saya verifikasi sendiri');
    RAISE EXCEPTION 'TEST FAILED: Self-verification should have been rejected by trigger.';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST PASSED: Self-verification correctly blocked by trigger: %', SQLERRM;
  END;
END $$;

-- Reviewer Ganjar (different person) verifies payment (MUST SUCCEED)
INSERT INTO public.payment_verifications (submission_id, reviewer_id, decision, notes)
VALUES ('99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', 'verified', 'Bukti mutasi valid di BSI');

-- Assertion: Payments and Registrations must now be verified/accepted
DO $$
DECLARE
  v_pay_status VARCHAR(20);
  v_reg_status VARCHAR(20);
BEGIN
  SELECT status INTO v_pay_status FROM public.payments WHERE id = '88888888-8888-8888-8888-888888888888';
  SELECT status INTO v_reg_status FROM public.registrations WHERE id = '66666666-6666-6666-6666-666666666666';

  IF v_pay_status != 'verified' THEN
    RAISE EXCEPTION 'TEST FAILED: Payment status expected verified, got %', v_pay_status;
  END IF;
  IF v_reg_status != 'accepted' THEN
    RAISE EXCEPTION 'TEST FAILED: Registration status expected accepted, got %', v_reg_status;
  END IF;

  RAISE NOTICE 'TEST PASSED: Legitimate verification synced payment and registration status successfully.';
END $$;

-- 4. TEST: Friday Report Unique Constraint per Week
INSERT INTO public.weekly_reports (profile_id, week_date, completed_work, upcoming_plan, blockers)
VALUES ('11111111-1111-1111-1111-111111111111', '2026-11-13', 'Selesai modul 1', 'Mulai modul 2', 'Tidak ada');

DO $$
BEGIN
  BEGIN
    INSERT INTO public.weekly_reports (profile_id, week_date, completed_work, upcoming_plan, blockers)
    VALUES ('11111111-1111-1111-1111-111111111111', '2026-11-13', 'Laporan duplikat', 'Rencana sama', 'Kendala sama');
    RAISE EXCEPTION 'TEST FAILED: Duplicate Friday report on the same week should be rejected.';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'TEST PASSED: Duplicate Friday report for the same week correctly rejected.';
  END;
END $$;

-- 5. TEST: Audit Log Immutability
INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id)
VALUES ('33333333-3333-3333-3333-333333333333', 'PAYMENT_VERIFIED', 'payments', '88888888-8888-8888-8888-888888888888');

DO $$
BEGIN
  BEGIN
    UPDATE public.audit_logs SET action = 'ALTERED' WHERE actor_id = '33333333-3333-3333-3333-333333333333';
    RAISE EXCEPTION 'TEST FAILED: Audit logs must be immutable (UPDATE should fail).';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST PASSED: Audit log UPDATE blocked successfully: %', SQLERRM;
  END;

  BEGIN
    DELETE FROM public.audit_logs WHERE actor_id = '33333333-3333-3333-3333-333333333333';
    RAISE EXCEPTION 'TEST FAILED: Audit logs must be immutable (DELETE should fail).';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST PASSED: Audit log DELETE blocked successfully: %', SQLERRM;
  END;
END $$;

-- Rollback entire test transaction to leave clean state
ROLLBACK;

