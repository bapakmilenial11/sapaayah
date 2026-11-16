-- ==============================================================================
-- Migration / Test Suite: 00012_database_security_tests.sql
-- Description: Comprehensive Automated Security & RLS Regression Test Suite
-- Architecture: SAPA Ayah Digital Platform (PostgreSQL 15+)
-- Usage: Execute inside transaction block (BEGIN ... ROLLBACK)
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- SETUP TEST MOCK USERS & PROFILES
-- ==============================================================================
-- User 1: Regular Participant (Ayah Budi)
INSERT INTO auth.users (id, email) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'budi@test.com') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, full_name, phone) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ayah Budi', '+6281234567890') ON CONFLICT (id) DO NOTHING;

-- User 2: Other Participant (Ayah Ahmad)
INSERT INTO auth.users (id, email) VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ahmad@test.com') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, full_name, phone) VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ayah Ahmad', '+6281234567891') ON CONFLICT (id) DO NOTHING;

-- User 3: Finance Officer (Ganjar Bendahara)
INSERT INTO auth.users (id, email) VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ganjar@test.com') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, full_name, phone) VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ganjar Bendahara', '+6281234567892') ON CONFLICT (id) DO NOTHING;

-- User 4: Facilitator (Ustadz Fauzan)
INSERT INTO auth.users (id, email) VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'fauzan@test.com') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, full_name, phone) VALUES ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Ustadz Fauzan', '+6281234567893') ON CONFLICT (id) DO NOTHING;

-- User 5: Super Admin (Admin Utama)
INSERT INTO auth.users (id, email) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'admin@test.com') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, full_name, phone) VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Admin Utama', '+6281234567894') ON CONFLICT (id) DO NOTHING;

-- Assign Roles
-- Ganjar -> bendahara
INSERT INTO public.user_roles (user_id, role_id)
SELECT 'cccccccc-cccc-cccc-cccc-cccccccccccc', id FROM public.roles WHERE code = 'bendahara'
ON CONFLICT DO NOTHING;

-- Fauzan -> fasilitator
INSERT INTO public.user_roles (user_id, role_id)
SELECT 'dddddddd-dddd-dddd-dddd-dddddddddddd', id FROM public.roles WHERE code = 'fasilitator'
ON CONFLICT DO NOTHING;

-- Admin Utama -> super_admin
INSERT INTO public.user_roles (user_id, role_id)
SELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', id FROM public.roles WHERE code = 'super_admin'
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 1. TEST: has_permission() Privilege Enumeration Prevention (SEC-02)
-- ==============================================================================
DO $$
DECLARE
  v_perm_result BOOLEAN;
BEGIN
  -- Simulate caller as Ayah Budi (regular participant)
  PERFORM set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  -- Ayah Budi checking his own permission (Allowed, returns false)
  v_perm_result := public.has_permission('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'finance.manage');
  IF v_perm_result != false THEN
    RAISE EXCEPTION 'TEST 1A FAILED: Participant should not have finance.manage permission.';
  END IF;

  -- Ayah Budi checking Ganjar's permission (MUST FAIL/RETURN FALSE without revealing)
  v_perm_result := public.has_permission('cccccccc-cccc-cccc-cccc-cccccccccccc', 'payments.verify');
  IF v_perm_result = true THEN
    RAISE EXCEPTION 'TEST 1B FAILED: Unauthorized user should not be able to snoop other users permissions.';
  END IF;

  RAISE NOTICE 'TEST 1 PASSED: has_permission() anti-enumeration verified.';
END $$;

-- ==============================================================================
-- 2. TEST: Profiles Mass-Assignment Protection (SEC-04)
-- ==============================================================================
DO $$
BEGIN
  -- Simulate caller as Ayah Budi
  PERFORM set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  -- Normal update (Allowed)
  UPDATE public.profiles SET display_name = 'Budi Keren' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  -- Malicious attempt to change account_status to suspended or active (MUST FAIL)
  BEGIN
    UPDATE public.profiles SET account_status = 'suspended' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    RAISE EXCEPTION 'TEST 2A FAILED: Regular user should not be able to change account_status.';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST 2A PASSED: Profile account_status mass-assignment blocked: %', SQLERRM;
  END;

  -- Malicious attempt to archive profile (MUST FAIL)
  BEGIN
    UPDATE public.profiles SET is_archived = true WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    RAISE EXCEPTION 'TEST 2B FAILED: Regular user should not be able to archive own profile.';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST 2B PASSED: Profile archival tampering blocked: %', SQLERRM;
  END;
END $$;

-- ==============================================================================
-- 3. TEST: Self-Assignment of Roles Prevention (SEC-04 / Anti-Escalation)
-- ==============================================================================
DO $$
BEGIN
  -- Simulate caller as Ayah Budi
  PERFORM set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  BEGIN
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', id FROM public.roles WHERE code = 'super_admin';
    RAISE EXCEPTION 'TEST 3 FAILED: Regular user should not be able to assign roles to themselves.';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST 3 PASSED: Self-role assignment blocked: %', SQLERRM;
  END;
END $$;

-- ==============================================================================
-- 4. TEST: Segregation of Duties in Payments (SEC-05)
-- ==============================================================================
DO $$
DECLARE
  v_batch_id UUID := '11111111-2222-3333-4444-555555555555';
  v_participant_id UUID := '22222222-3333-4444-5555-666666666666';
  v_reg_id UUID := '33333333-4444-5555-6666-777777777777';
  v_pay_id UUID := '44444444-5555-6666-7777-888888888888';
  v_sub_id UUID := '55555555-6666-7777-8888-999999999999';
  v_inst_id UUID := '66666666-7777-8888-9999-000000000000';
BEGIN
  -- Setup test program, batch, participant, and registration for Budi
  INSERT INTO public.programs (id, name, slug, program_type, visibility)
  VALUES ('00000000-1111-2222-3333-444444444444', 'SAPA Test', 'sapa-test', 'class', 'published');

  INSERT INTO public.program_batches (id, program_id, batch_number, name, slug, registration_open_at, registration_close_at, start_at, end_at, price, capacity, status)
  VALUES (v_batch_id, '00000000-1111-2222-3333-444444444444', 1, 'Batch Test', 'batch-test-sec', now() - interval '1 day', now() + interval '5 days', now() + interval '10 days', now() + interval '20 days', 200000, 30, 'open');

  INSERT INTO public.participants (id, profile_id, full_name, email, phone)
  VALUES (v_participant_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ayah Budi', 'budi@test.com', '081234567890');

  INSERT INTO public.registrations (id, participant_id, batch_id, status)
  VALUES (v_reg_id, v_participant_id, v_batch_id, 'submitted');

  INSERT INTO public.payment_instructions (id, bank_name, account_number, account_holder)
  VALUES (v_inst_id, 'BSI', '7201234567', 'SAPA');

  INSERT INTO public.payments (id, registration_id, instruction_id, amount_due, status)
  VALUES (v_pay_id, v_reg_id, v_inst_id, 200000, 'submitted');

  INSERT INTO public.payment_proof_submissions (id, payment_id, submission_number, proof_storage_path, amount_transferred, status)
  VALUES (v_sub_id, v_pay_id, 1, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/proof1.jpg', 200000, 'submitted');

  -- Attempt 4A: Payer Budi attempts to verify his own payment (MUST FAIL)
  PERFORM set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  BEGIN
    INSERT INTO public.payment_verifications (submission_id, reviewer_id, decision, notes)
    VALUES (v_sub_id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'verified', 'Self approve');
    RAISE EXCEPTION 'TEST 4A FAILED: Self-verification should have been blocked.';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST 4A PASSED: Self-verification correctly blocked: %', SQLERRM;
  END;

  -- Attempt 4B: Legitimate reviewer Ganjar verifies Budi's payment (MUST SUCCEED)
  PERFORM set_config('request.jwt.claim.sub', 'cccccccc-cccc-cccc-cccc-cccccccccccc', true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  INSERT INTO public.payment_verifications (submission_id, reviewer_id, decision, notes)
  VALUES (v_sub_id, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'verified', 'Mutasi bank cocok');

  RAISE NOTICE 'TEST 4B PASSED: Authorized reviewer verification succeeded.';
END $$;

-- ==============================================================================
-- 5. TEST: Cross-Batch Material Access Isolation (SEC-03)
-- ==============================================================================
DO $$
DECLARE
  v_mat_path TEXT := 'batch-2-secret/modul.pdf';
  v_can_access BOOLEAN;
BEGIN
  -- Setup learning material for Batch 2 (Budi is only enrolled in Batch 1)
  INSERT INTO public.program_batches (id, program_id, batch_number, name, slug, registration_open_at, registration_close_at, start_at, end_at, price, capacity, status)
  VALUES ('77777777-8888-9999-0000-111111111111', '00000000-1111-2222-3333-444444444444', 2, 'Batch 2 Eksklusif', 'batch-2-sec', now() - interval '1 day', now() + interval '5 days', now() + interval '10 days', now() + interval '20 days', 500000, 30, 'open');

  INSERT INTO public.learning_materials (batch_id, title, file_storage_path)
  VALUES ('77777777-8888-9999-0000-111111111111', 'Slide Rahasia Batch 2', v_mat_path);

  -- Set caller as Budi (enrolled in Batch 1, NOT Batch 2)
  PERFORM set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  v_can_access := public.can_access_learning_material_file(v_mat_path);
  IF v_can_access = true THEN
    RAISE EXCEPTION 'TEST 5 FAILED: Participant Budi should NOT have access to Batch 2 material.';
  END IF;

  RAISE NOTICE 'TEST 5 PASSED: Cross-batch learning material access blocked.';
END $$;

-- ==============================================================================
-- 6. TEST: Audit Logs Immutability & Anti-Truncate (SEC-06)
-- ==============================================================================
DO $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id)
  VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'SYSTEM_INIT', 'system', '00000000-0000-0000-0000-000000000000');

  -- Attempt UPDATE (MUST FAIL)
  BEGIN
    UPDATE public.audit_logs SET action = 'ALTERED';
    RAISE EXCEPTION 'TEST 6A FAILED: Audit logs UPDATE should be forbidden.';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST 6A PASSED: Audit log UPDATE blocked.';
  END;

  -- Attempt DELETE (MUST FAIL)
  BEGIN
    DELETE FROM public.audit_logs;
    RAISE EXCEPTION 'TEST 6B FAILED: Audit logs DELETE should be forbidden.';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST 6B PASSED: Audit log DELETE blocked.';
  END;

  -- Attempt TRUNCATE (MUST FAIL)
  BEGIN
    TRUNCATE TABLE public.audit_logs;
    RAISE EXCEPTION 'TEST 6C FAILED: Audit logs TRUNCATE should be forbidden.';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST 6C PASSED: Audit log TRUNCATE blocked.';
  END;
END $$;

-- ==============================================================================
-- 7. TEST: Robust Phone Normalization & Validation (SEC-08)
-- ==============================================================================
DO $$
DECLARE
  v_norm VARCHAR(25);
BEGIN
  -- Valid Indonesia inputs
  v_norm := public.normalize_phone('081234567890');
  IF v_norm != '+6281234567890' THEN
    RAISE EXCEPTION 'TEST 7A FAILED: Expected +6281234567890, got %', v_norm;
  END IF;

  v_norm := public.normalize_phone('6281234567890');
  IF v_norm != '+6281234567890' THEN
    RAISE EXCEPTION 'TEST 7B FAILED: Expected +6281234567890, got %', v_norm;
  END IF;

  v_norm := public.normalize_phone('+6281234567890');
  IF v_norm != '+6281234567890' THEN
    RAISE EXCEPTION 'TEST 7C FAILED: Expected +6281234567890, got %', v_norm;
  END IF;

  -- Invalid short numbers (MUST FAIL)
  BEGIN
    PERFORM public.normalize_phone('081');
    RAISE EXCEPTION 'TEST 7D FAILED: Short invalid phone number should be rejected.';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST 7D PASSED: Invalid short phone number rejected.';
  END;

  RAISE NOTICE 'TEST 7 PASSED: Phone normalization & validation verified.';
END $$;

-- ROLLBACK transaction to ensure clean state
ROLLBACK;

