-- ==============================================================================
-- Migration: 00003_participants_and_registrations.sql
-- Description: Master participants, phone/email deduplication, & batch registrations
-- Architecture: SAPA Ayah Digital Platform (PostgreSQL 15+)
-- ==============================================================================

-- 1. HELPER: PHONE NUMBER NORMALIZATION FUNCTION
CREATE OR REPLACE FUNCTION public.normalize_phone(p_phone TEXT)
RETURNS VARCHAR(25)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  clean_phone TEXT;
BEGIN
  IF p_phone IS NULL OR trim(p_phone) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Remove all non-digits except leading +
  clean_phone := regexp_replace(trim(p_phone), '[^0-9+]', '', 'g');
  
  -- Convert 08... to +628...
  IF clean_phone LIKE '08%' THEN
    clean_phone := '+62' || substr(clean_phone, 2);
  -- Convert 628... to +628...
  ELSIF clean_phone LIKE '628%' THEN
    clean_phone := '+' || clean_phone;
  END IF;
  
  RETURN clean_phone::VARCHAR(25);
END;
$$;

-- 2. DOMAIN: PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  normalized_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(25) UNIQUE NOT NULL,
  city VARCHAR(100),
  marital_status VARCHAR(50) CHECK (marital_status IN ('married_with_children', 'married_no_children', 'engaged', 'single')),
  number_of_children INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES public.profiles(id)
);

CREATE TRIGGER trg_participants_updated_at
  BEFORE UPDATE ON public.participants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Auto-normalize email and phone trigger
CREATE OR REPLACE FUNCTION public.trg_fn_normalize_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.email := lower(trim(NEW.email));
  NEW.phone := public.normalize_phone(NEW.phone);
  NEW.normalized_name := upper(trim(NEW.full_name));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_normalize_participant_insert_update
  BEFORE INSERT OR UPDATE ON public.participants
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_normalize_participant();

-- 3. DOMAIN: REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE RESTRICT,
  batch_id UUID NOT NULL REFERENCES public.program_batches(id) ON DELETE RESTRICT,
  registration_source VARCHAR(50) NOT NULL DEFAULT 'web_self_service' CHECK (registration_source IN ('web_self_service', 'admin_manual', 'whatsapp_offline')),
  status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'waitlisted', 'cancelled')),
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (participant_id, batch_id)
);

CREATE TRIGGER trg_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_participants_email ON public.participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_phone ON public.participants(phone);
CREATE INDEX IF NOT EXISTS idx_participants_profile_id ON public.participants(profile_id);
CREATE INDEX IF NOT EXISTS idx_registrations_participant_id ON public.registrations(participant_id);
CREATE INDEX IF NOT EXISTS idx_registrations_batch_id ON public.registrations(batch_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);

