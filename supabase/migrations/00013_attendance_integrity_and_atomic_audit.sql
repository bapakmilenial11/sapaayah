-- ==============================================================================
-- Migration: 00013_attendance_integrity_and_atomic_audit.sql
-- Description: Hardened database-level row locking & audit triggers on attendance_records
--              to guarantee strict atomicity, audit logging, prevent race conditions
--              with session completion, enforce active account status, and use search_path = ''.
-- Architecture: SAPA Ayah Digital Platform (PostgreSQL 15+)
-- ==============================================================================

-- 1. RPC FUNCTION: bulk_upsert_attendance_atomic
-- Purpose:
-- a. Single authoritative entry-point for recording/correcting bulk attendance.
-- b. Enforces auth.uid() NOT NULL and active account profile (account_status = 'active', is_archived = false).
-- c. Validates p_records: JSON array, size 1..200, strictly typed fields, notes is string/null, no duplicate participant_id.
-- d. Row-locks class_sessions (FOR UPDATE) to serialize with session completion.
-- e. Enforces session completed business rule (admin-only with correction_reason >= 5 chars).
-- f. Sets transaction-local GUC (app.current_correction_reason) for audit trigger.
-- g. Enforces participant 'accepted' registration on session's batch.
-- h. Executes atomic UPSERT preserving original recorded_by.
-- i. Fully hardened with SET search_path = '' and schema-qualified identifiers.

CREATE OR REPLACE FUNCTION public.bulk_upsert_attendance_atomic(
  p_session_id UUID,
  p_records JSONB,
  p_correction_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id UUID;
  v_session RECORD;
  v_is_admin BOOLEAN := false;
  v_is_assigned_facilitator BOOLEAN := false;
  v_item RECORD;
  v_record_count INT;
  v_saved_count INT := 0;
  v_trimmed_reason TEXT;
  v_seen_participants UUID[];
  v_elem JSONB;
BEGIN
  -- 1. IDENTIFIKASI & OTENTIKASI WAJIB
  v_actor_id := auth.uid();
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication Violation: Operasi ini membutuhkan sesi pengguna terautentikasi.';
  END IF;

  -- 2. VERIFIKASI KEAKTIFAN AKUN (Anti-Bypass Suspended/Archived Accounts)
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_actor_id
      AND account_status = 'active'
      AND is_archived = false
  ) THEN
    RAISE EXCEPTION 'Account Suspended: Akun pengguna tidak ditemukan, sedang ditangguhkan, atau telah diarsipkan.';
  END IF;

  -- 3. VALIDASI STRUKTUR & KONTRAK PAYLOAD p_records
  IF p_records IS NULL OR pg_catalog.jsonb_typeof(p_records) != 'array' THEN
    RAISE EXCEPTION 'INVALID_PAYLOAD: Parameter p_records wajib berupa JSON array.';
  END IF;

  v_record_count := pg_catalog.jsonb_array_length(p_records);

  IF v_record_count < 1 THEN
    RAISE EXCEPTION 'INVALID_PAYLOAD: Daftar presensi minimal memuat 1 peserta.';
  END IF;

  IF v_record_count > 200 THEN
    RAISE EXCEPTION 'PAYLOAD_TOO_LARGE: Pengiriman presensi maksimal 200 peserta per transaksi (diterima: %).', v_record_count;
  END IF;

  -- 4. VALIDASI TIPE DATA STRICT (Notes hanya boleh string atau null) & FIELD CHECK
  FOR v_elem IN SELECT * FROM pg_catalog.jsonb_array_elements(p_records)
  LOOP
    IF pg_catalog.jsonb_typeof(v_elem) != 'object' THEN
      RAISE EXCEPTION 'INVALID_PAYLOAD: Setiap elemen dalam p_records harus berupa JSON object.';
    END IF;

    -- Validasi tipe data notes: hanya boleh 'string' atau 'null' (jika field ada)
    IF v_elem ? 'notes' AND pg_catalog.jsonb_typeof(v_elem->'notes') NOT IN ('string', 'null') THEN
      RAISE EXCEPTION 'INVALID_PAYLOAD: Field notes hanya menerima tipe data string atau null.';
    END IF;
  END LOOP;

  -- 5. VALIDASI FIELD & DEDUPLIKASI participant_id DALAM PAYLOAD
  v_seen_participants := ARRAY[]::UUID[];
  FOR v_item IN SELECT * FROM pg_catalog.jsonb_to_recordset(p_records) AS x(participant_id UUID, attendance_status TEXT, notes TEXT)
  LOOP
    IF v_item.participant_id IS NULL THEN
      RAISE EXCEPTION 'INVALID_PAYLOAD: Setiap baris presensi wajib memiliki participant_id valid.';
    END IF;

    IF v_item.participant_id = ANY(v_seen_participants) THEN
      RAISE EXCEPTION 'DUPLICATE_PARTICIPANT_IN_PAYLOAD: Peserta [%] muncul lebih dari satu kali dalam payload yang sama.', v_item.participant_id;
    END IF;
    v_seen_participants := pg_catalog.array_append(v_seen_participants, v_item.participant_id);

    IF v_item.attendance_status IS NULL OR v_item.attendance_status NOT IN ('present', 'absent', 'excused', 'late') THEN
      RAISE EXCEPTION 'INVALID_STATUS: Nilai status kehadiran [%] tidak valid (hanya present, absent, excused, late).', v_item.attendance_status;
    END IF;

    IF v_item.notes IS NOT NULL AND pg_catalog.length(v_item.notes) > 500 THEN
      RAISE EXCEPTION 'NOTES_TOO_LONG: Catatan presensi peserta [%] melebihi batas maksimal 500 karakter.', v_item.participant_id;
    END IF;
  END LOOP;

  -- 6. ROW-LOCK EKSKLUSIF PADA class_sessions (FOR UPDATE)
  SELECT id, batch_id, facilitator_id, status, title
  INTO v_session
  FROM public.class_sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SESSION_NOT_FOUND: Sesi kelas tidak ditemukan.';
  END IF;

  -- 7. EVALUASI OTORISASI SECARA INDEPENDEN & PEMERIKSAAN ROLE EXPIRY
  v_is_admin := public.has_permission(v_actor_id, 'programs.manage') OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = v_actor_id
      AND (r.code = 'super_admin' OR r.name = 'Super Admin')
      AND (ur.expires_at IS NULL OR ur.expires_at > pg_catalog.now())
  );

  v_is_assigned_facilitator := (
    public.has_permission(v_actor_id, 'attendance.record_assigned')
    AND v_session.facilitator_id = v_actor_id
  );

  IF NOT v_is_admin AND NOT v_is_assigned_facilitator THEN
    RAISE EXCEPTION 'Authorization Violation: Anda tidak berwenang mencatat presensi pada sesi ini.';
  END IF;

  -- 8. ATURAN SESI COMPLETED (Menggunakan NULLIF dan pg_catalog.btrim)
  v_trimmed_reason := NULLIF(pg_catalog.btrim(p_correction_reason), '');
  IF v_session.status = 'completed' THEN
    IF NOT v_is_admin THEN
      RAISE EXCEPTION 'SESSION_COMPLETED: Sesi ini sudah berstatus [Completed]. Fasilitator dilarang mengubah presensi.';
    END IF;

    IF v_trimmed_reason IS NULL OR pg_catalog.length(v_trimmed_reason) < 5 THEN
      RAISE EXCEPTION 'REASON_REQUIRED: Koreksi presensi pada sesi yang sudah selesai wajib menyertakan alasan minimal 5 karakter.';
    END IF;
  END IF;

  -- 9. SET TRANSACTION-LOCAL GUC UNTUK AUDIT TRIGGER
  IF v_trimmed_reason IS NOT NULL THEN
    PERFORM pg_catalog.set_config('app.current_correction_reason', v_trimmed_reason, true);
  ELSE
    PERFORM pg_catalog.set_config('app.current_correction_reason', '', true);
  END IF;

  -- 10. VALIDASI REGISTRASI ACCEPTED PADA BATCH SESI
  FOR v_item IN SELECT * FROM pg_catalog.jsonb_to_recordset(p_records) AS x(participant_id UUID, attendance_status TEXT, notes TEXT)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.registrations
      WHERE batch_id = v_session.batch_id
        AND participant_id = v_item.participant_id
        AND status = 'accepted'
    ) THEN
      RAISE EXCEPTION 'INVALID_PARTICIPANT: Peserta dengan ID [%] belum berstatus diterima (accepted) atau tidak terdaftar pada batch ini.', v_item.participant_id;
    END IF;
  END LOOP;

  -- 11. EKSEKUSI ATOMIK UPSERT
  FOR v_item IN SELECT * FROM pg_catalog.jsonb_to_recordset(p_records) AS x(participant_id UUID, attendance_status TEXT, notes TEXT)
  LOOP
    INSERT INTO public.attendance_records (
      session_id,
      participant_id,
      attendance_status,
      notes,
      recorded_by,
      recorded_at
    )
    VALUES (
      p_session_id,
      v_item.participant_id,
      v_item.attendance_status::VARCHAR(20),
      v_item.notes,
      v_actor_id,
      pg_catalog.now()
    )
    ON CONFLICT (session_id, participant_id)
    DO UPDATE SET
      attendance_status = EXCLUDED.attendance_status,
      notes = EXCLUDED.notes;

    v_saved_count := v_saved_count + 1;
  END LOOP;

  RETURN pg_catalog.jsonb_build_object(
    'success', true,
    'session_id', p_session_id,
    'saved_count', v_saved_count
  );
END;
$$;

-- KEAMANAN EKSEKUSI RPC: Cabut dari PUBLIC & anon, izinkan hanya role authenticated
REVOKE EXECUTE ON FUNCTION public.bulk_upsert_attendance_atomic(UUID, JSONB, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bulk_upsert_attendance_atomic(UUID, JSONB, TEXT) TO authenticated;


-- 2. BEFORE INSERT OR UPDATE TRIGGER FUNCTION: trg_fn_validate_attendance_before_upsert
-- Purpose:
-- Defense-in-depth row security untuk menutup seluruh celah direct DML.
-- a. WAJIB auth.uid() valid & akun profil aktif (account_status = 'active', is_archived = false).
-- b. IMMUTABLE session_id & participant_id pada UPDATE (mencegah perpindahan relasi).
-- c. INSERT: recorded_by SELALU auth.uid().
-- d. UPDATE: recorded_by & recorded_at SELALU OLD.recorded_by & OLD.recorded_at (anti-spoofing).
-- e. Row-lock class_sessions (FOR UPDATE).
-- f. Sesi completed: Fasilitator DITOLAK; Admin WAJIB alasan >= 5 char (melalui GUC app.current_correction_reason).
-- g. Validasi peserta accepted pada batch sesi terkait.
-- h. Hardened dengan SET search_path = ''.

CREATE OR REPLACE FUNCTION public.trg_fn_validate_attendance_before_upsert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_session RECORD;
  v_actor_id UUID;
  v_is_admin BOOLEAN := false;
  v_is_assigned_facilitator BOOLEAN := false;
  v_reason TEXT;
BEGIN
  -- 1. IDENTIFIKASI ACTOR NYATA DARI auth.uid() (ANTI-SPOOFING)
  v_actor_id := auth.uid();
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication Violation: Operasi presensi membutuhkan pengguna terautentikasi (auth.uid() is null).';
  END IF;

  -- 2. VERIFIKASI KEAKTIFAN AKUN PROFIL
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_actor_id
      AND account_status = 'active'
      AND is_archived = false
  ) THEN
    RAISE EXCEPTION 'Account Suspended: Akun pengguna tidak ditemukan, sedang ditangguhkan, atau telah diarsipkan.';
  END IF;

  -- 3. PROTEKSI IMMUTABILITAS session_id, participant_id, recorded_by & recorded_at
  IF TG_OP = 'INSERT' THEN
    NEW.recorded_by := v_actor_id;
    NEW.recorded_at := pg_catalog.now();
  ELSIF TG_OP = 'UPDATE' THEN
    -- Larang keras memindahkan baris presensi ke sesi atau peserta lain!
    IF NEW.session_id IS DISTINCT FROM OLD.session_id THEN
      RAISE EXCEPTION 'IMMUTABLE_FIELD: session_id tidak boleh diubah setelah presensi dibuat.';
    END IF;

    IF NEW.participant_id IS DISTINCT FROM OLD.participant_id THEN
      RAISE EXCEPTION 'IMMUTABLE_FIELD: participant_id tidak boleh diubah setelah presensi dibuat.';
    END IF;

    -- Pertahankan identitas dan tanggal pencatat awal
    NEW.recorded_by := OLD.recorded_by;
    NEW.recorded_at := OLD.recorded_at;
  END IF;

  -- 4. ROW-LOCK EKSKLUSIF class_sessions (FOR UPDATE)
  SELECT id, batch_id, facilitator_id, status, title
  INTO v_session
  FROM public.class_sessions
  WHERE id = NEW.session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SESSION_NOT_FOUND: Sesi kelas tidak ditemukan.';
  END IF;

  -- 5. EVALUASI OTORISASI & ROLE EXPIRY
  v_is_admin := public.has_permission(v_actor_id, 'programs.manage') OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = v_actor_id
      AND (r.code = 'super_admin' OR r.name = 'Super Admin')
      AND (ur.expires_at IS NULL OR ur.expires_at > pg_catalog.now())
  );

  v_is_assigned_facilitator := (
    public.has_permission(v_actor_id, 'attendance.record_assigned')
    AND v_session.facilitator_id = v_actor_id
  );

  IF NOT v_is_admin AND NOT v_is_assigned_facilitator THEN
    RAISE EXCEPTION 'Authorization Violation: Anda tidak berwenang mencatat presensi sesi ini.';
  END IF;

  -- 6. ATURAN SESI COMPLETED DI SELURUH JALUR (RPC & RAW DML)
  IF v_session.status = 'completed' THEN
    IF NOT v_is_admin THEN
      RAISE EXCEPTION 'SESSION_COMPLETED: Sesi ini sudah berstatus [Completed]. Fasilitator dilarang mengubah presensi.';
    END IF;

    BEGIN
      v_reason := pg_catalog.current_setting('app.current_correction_reason', true);
    EXCEPTION WHEN OTHERS THEN
      v_reason := NULL;
    END;

    IF v_reason IS NULL OR pg_catalog.length(pg_catalog.btrim(v_reason)) < 5 THEN
      RAISE EXCEPTION 'REASON_REQUIRED: Koreksi presensi pada sesi yang sudah selesai wajib menyertakan alasan koreksi minimal 5 karakter.';
    END IF;
  END IF;

  -- 7. VALIDASI PESERTA WAJIB ACCEPTED DI BATCH SESI
  IF NOT EXISTS (
    SELECT 1 FROM public.registrations
    WHERE batch_id = v_session.batch_id
      AND participant_id = NEW.participant_id
      AND status = 'accepted'
  ) THEN
    RAISE EXCEPTION 'INVALID_PARTICIPANT: Peserta dengan ID [%] belum berstatus diterima (accepted) atau tidak terdaftar pada batch ini.', NEW.participant_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_attendance_before_upsert ON public.attendance_records;
CREATE TRIGGER trg_validate_attendance_before_upsert
  BEFORE INSERT OR UPDATE ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_validate_attendance_before_upsert();


-- 3. AFTER UPDATE TRIGGER FUNCTION: trg_fn_audit_attendance_after_update
-- Purpose:
-- Atomically record ATTENDANCE_CORRECTED into audit_logs within the EXACT SAME database transaction!
-- Mendeteksi perubahan attendance_status ATAU notes (IS DISTINCT FROM).
-- Actor audit = auth.uid() (pengoreksi saat ini).
-- original_recorder = OLD.recorded_by.
-- correction_reason diambil dari app.current_correction_reason.
-- Hardened dengan SET search_path = ''.

CREATE OR REPLACE FUNCTION public.trg_fn_audit_attendance_after_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_modifier_id UUID;
  v_reason TEXT;
BEGIN
  -- 1. Evaluasi diff status ATAU notes
  IF OLD.attendance_status IS DISTINCT FROM NEW.attendance_status
     OR OLD.notes IS DISTINCT FROM NEW.notes THEN

    v_modifier_id := auth.uid();
    IF v_modifier_id IS NULL THEN
      RAISE EXCEPTION 'Audit Violation: Modifikasi presensi memerlukan sesi pengguna terautentikasi.';
    END IF;

    -- Ambil alasan koreksi dari setting transaksi (btrim)
    BEGIN
      v_reason := pg_catalog.current_setting('app.current_correction_reason', true);
    EXCEPTION WHEN OTHERS THEN
      v_reason := NULL;
    END;

    IF v_reason IS NULL OR pg_catalog.length(pg_catalog.btrim(v_reason)) = 0 THEN
      v_reason := 'Koreksi kehadiran oleh petugas berwenang';
    END IF;

    -- 2. Insert ke audit_logs (satu transaksi atomik dengan UPDATE attendance_records)
    INSERT INTO public.audit_logs (
      actor_id,
      action,
      entity_type,
      entity_id,
      before_data,
      after_data
    )
    VALUES (
      v_modifier_id,
      'ATTENDANCE_CORRECTED',
      'attendance_records',
      NEW.id,
      pg_catalog.jsonb_build_object(
        'session_id', OLD.session_id,
        'participant_id', OLD.participant_id,
        'previous_status', OLD.attendance_status,
        'previous_notes', OLD.notes,
        'original_recorder_id', OLD.recorded_by,
        'original_recorded_at', OLD.recorded_at
      ),
      pg_catalog.jsonb_build_object(
        'session_id', NEW.session_id,
        'participant_id', NEW.participant_id,
        'new_status', NEW.attendance_status,
        'new_notes', NEW.notes,
        'reason', v_reason,
        'corrected_by', v_modifier_id,
        'timestamp', pg_catalog.now()
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_attendance_after_update ON public.attendance_records;
CREATE TRIGGER trg_audit_attendance_after_update
  AFTER UPDATE ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_audit_attendance_after_update();
