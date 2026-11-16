-- ==============================================================================
-- Migration: 00009_fix_storage_security.sql
-- Description: Connect Supabase Storage RLS directly with database learning_materials metadata
-- Architecture: SAPA Ayah Digital Platform (PostgreSQL 15+)
-- Remediation for: SEC-03 (Critical Severity)
-- ==============================================================================

-- 1. HELPER: Check if authenticated user is legitimately enrolled in the batch containing this material
CREATE OR REPLACE FUNCTION public.can_access_learning_material_file(_storage_path TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.learning_materials lm
    JOIN public.registrations r ON r.batch_id = lm.batch_id
    JOIN public.participants p ON r.participant_id = p.id
    WHERE lm.file_storage_path = _storage_path
      AND p.profile_id = auth.uid()
      AND r.status = 'accepted'
  );
$$;

-- 2. HELPER: Check if authenticated user is assigned to manage materials for this specific file
CREATE OR REPLACE FUNCTION public.can_manage_learning_material_file(_storage_path TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.learning_materials lm
    JOIN public.activities a ON a.batch_id = lm.batch_id
    JOIN public.activity_assignments aa ON aa.activity_id = a.id
    WHERE lm.file_storage_path = _storage_path
      AND aa.profile_id = auth.uid()
  )
  OR public.has_permission(auth.uid(), 'programs.manage');
$$;

REVOKE EXECUTE ON FUNCTION public.can_access_learning_material_file(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_manage_learning_material_file(TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_access_learning_material_file(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_learning_material_file(TEXT) TO authenticated, service_role;

-- 3. RE-DEFINE STORAGE POLICIES FOR private-learning-materials
-- Drop overly generic policy
DROP POLICY IF EXISTS "storage_materials_read_enrolled" ON storage.objects;
DROP POLICY IF EXISTS "storage_materials_upload_authorized" ON storage.objects;

-- Secure Read: User must either be an authorized manager OR legitimately enrolled in that specific batch
CREATE POLICY "storage_materials_read_enrolled" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'private-learning-materials'
    AND (
      public.has_permission(auth.uid(), 'materials.manage_assigned')
      OR public.can_access_learning_material_file(name)
    )
  );

-- Secure Upload: Must have material management permission
CREATE POLICY "storage_materials_upload_authorized" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'private-learning-materials'
    AND public.has_permission(auth.uid(), 'materials.manage_assigned')
  );

-- Secure Update & Delete: Must be assigned manager or program admin
CREATE POLICY "storage_materials_modify_authorized" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'private-learning-materials'
    AND (
      public.has_permission(auth.uid(), 'programs.manage')
      OR public.can_manage_learning_material_file(name)
    )
  )
  WITH CHECK (
    bucket_id = 'private-learning-materials'
    AND (
      public.has_permission(auth.uid(), 'programs.manage')
      OR public.can_manage_learning_material_file(name)
    )
  );

CREATE POLICY "storage_materials_delete_authorized" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'private-learning-materials'
    AND (
      public.has_permission(auth.uid(), 'programs.manage')
      OR public.can_manage_learning_material_file(name)
    )
  );

-- 4. HARDEN private-payment-proofs (Enforce folder ownership matching auth.uid)
DROP POLICY IF EXISTS "storage_proof_upload_payer" ON storage.objects;
DROP POLICY IF EXISTS "storage_proof_read_owner_or_reviewer" ON storage.objects;

CREATE POLICY "storage_proof_upload_payer" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'private-payment-proofs'
    AND (auth.uid())::text = (storage.foldername(name))[1]
    AND (LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'pdf'))
  );

CREATE POLICY "storage_proof_read_owner_or_reviewer" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'private-payment-proofs'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR public.has_permission(auth.uid(), 'payments.verify')
      OR public.has_permission(auth.uid(), 'payments.view_all')
    )
  );

