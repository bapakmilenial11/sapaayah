-- ==============================================================================
-- Migration: 00002_programs_and_activities.sql
-- Description: Master catalog, batches, activities, & rotational activity assignments
-- Architecture: SAPA Ayah Digital Platform (PostgreSQL 15+)
-- ==============================================================================

-- 1. DOMAIN: PROGRAMS CATALOG
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  tagline VARCHAR(255),
  description TEXT,
  program_type VARCHAR(50) NOT NULL CHECK (program_type IN ('journey', 'class', 'webinar', 'camp', 'talk', 'stories')),
  visibility VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (visibility IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES public.profiles(id)
);

CREATE TRIGGER trg_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 2. DOMAIN: PROGRAM BATCHES
CREATE TABLE IF NOT EXISTS public.program_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE RESTRICT,
  batch_number INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  registration_open_at TIMESTAMPTZ NOT NULL,
  registration_close_at TIMESTAMPTZ NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  capacity INT NOT NULL DEFAULT 50,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES public.profiles(id)
);

CREATE TRIGGER trg_program_batches_updated_at
  BEFORE UPDATE ON public.program_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 3. DOMAIN: ACTIVITIES (Agenda / Event Sessions)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.program_batches(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('webinar', 'class_session', 'recording', 'meeting', 'workshop')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  location_or_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 4. DOMAIN: ROTATIONAL ACTIVITY ASSIGNMENTS (Non-structural crew)
CREATE TABLE IF NOT EXISTS public.activity_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  role_in_activity VARCHAR(50) NOT NULL CHECK (role_in_activity IN ('pic', 'moderator', 'speaker', 'admin_support', 'content_creator', 'logistics')),
  notes TEXT,
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (activity_id, profile_id, role_in_activity)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_programs_slug ON public.programs(slug);
CREATE INDEX IF NOT EXISTS idx_programs_visibility ON public.programs(visibility);
CREATE INDEX IF NOT EXISTS idx_program_batches_program_id ON public.program_batches(program_id);
CREATE INDEX IF NOT EXISTS idx_program_batches_status ON public.program_batches(status);
CREATE INDEX IF NOT EXISTS idx_activities_batch_id ON public.activities(batch_id);
CREATE INDEX IF NOT EXISTS idx_activity_assignments_activity_id ON public.activity_assignments(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_assignments_profile_id ON public.activity_assignments(profile_id);

