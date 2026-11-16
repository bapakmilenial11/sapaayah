-- ==============================================================================
-- Migration: 00012_enforce_batch_capacity_constraint.sql
-- Description: Database-level BEFORE INSERT Trigger with Row Locking to guarantee
--              Strict Batch Capacity Serialization (Zero Overbooking Guarantee)
-- Architecture: SAPA Ayah Digital Platform (PostgreSQL 15+)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.trg_fn_enforce_batch_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch RECORD;
  v_current_count INT;
BEGIN
  -- 1. Lock the target program_batch row EXCLUSIVELY (FOR UPDATE)
  -- This serializes all concurrent inserts for the same batch at the database level!
  SELECT id, status, capacity, registration_open_at, registration_close_at, is_archived
  INTO v_batch
  FROM public.program_batches
  WHERE id = NEW.batch_id
  FOR UPDATE;

  IF NOT FOUND OR v_batch.is_archived THEN
    RAISE EXCEPTION 'BATCH_NOT_FOUND: Batch program tidak ditemukan atau telah diarsipkan.';
  END IF;

  IF v_batch.status != 'open' THEN
    RAISE EXCEPTION 'BATCH_NOT_OPEN: Batch pendaftaran berstatus [%], tidak menerima pendaftaran baru.', v_batch.status;
  END IF;

  IF now() < v_batch.registration_open_at THEN
    RAISE EXCEPTION 'REGISTRATION_NOT_STARTED: Pendaftaran untuk batch ini belum dibuka.';
  END IF;

  IF now() > v_batch.registration_close_at THEN
    RAISE EXCEPTION 'REGISTRATION_CLOSED: Masa pendaftaran untuk batch ini telah berakhir.';
  END IF;

  -- 2. Count active registrations under the locked row state
  SELECT COUNT(*)
  INTO v_current_count
  FROM public.registrations
  WHERE batch_id = NEW.batch_id
    AND status IN ('submitted', 'under_review', 'accepted');

  -- 3. Strict Capacity Check
  IF v_current_count >= v_batch.capacity THEN
    RAISE EXCEPTION 'CAPACITY_EXCEEDED: Kuota peserta untuk batch ini telah penuh (%/%).', v_current_count, v_batch.capacity;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_batch_capacity ON public.registrations;
CREATE TRIGGER trg_enforce_batch_capacity
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_enforce_batch_capacity();

