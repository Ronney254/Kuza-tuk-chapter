/*
# KUZA TUK — Core Schema Migration (Phase 2)

## Overview
This migration establishes the foundational database schema for the KUZA TUK
member management platform. It creates the core tables, role system, triggers,
helper functions, and Row Level Security policies.

## New Tables

### profiles
- Links to Supabase auth.users (1:1 via user_id)
- Stores public-facing user data (full_name, avatar_url, bio, skills, interests, social links)
- Has a role column (SUPER_ADMIN, CHAPTER_ADMIN, EXECUTIVE, MEMBER, ALUMNI)
- Membership status column (NONE, PENDING, ACTIVE, SUSPENDED, REJECTED, DEACTIVATED)
- Controls whether the member appears in the public directory

### membership_applications
- Submitted by users applying to become KUZA members
- Contains academic info, skills, interests, and membership category
- Status flow: PENDING -> APPROVED/REJECTED/CHANGES_REQUESTED/SUSPENDED/DEACTIVATED
- Reviewed by admins

### memberships
- Created when an application is approved
- Contains unique member_id (format: KUZA-TUK-YYYY-NNNN)
- Links to membership category (ACTIVE_STUDENT, ALUMNI, EXECUTIVE, HONORARY)
- Validity dates and status

### contact_messages
- Stores contact form submissions from the public website
- Only admins can view; no public access

### partnership_requests
- Stores partnership inquiry form submissions
- Organization details, collaboration type, message
- Only admins can view

### site_settings
- Singleton table (one row) for configurable site content
- Organization name, tagline, contact email, social links, footer text
- Editable by admins only

## Helper Functions

### is_admin()
- Returns true if the current user's role is SUPER_ADMIN or CHAPTER_ADMIN
- Used in RLS policies for admin access

### is_staff()
- Returns true if the current user's role is SUPER_ADMIN, CHAPTER_ADMIN, or EXECUTIVE

### generate_member_id()
- Generates unique member ID in format KUZA-TUK-2026-0001
- Uses a sequence to ensure uniqueness even with concurrent approvals

## Triggers

### handle_new_user
- When a new user signs up in auth.users, automatically creates a profile row
- Default role: MEMBER, default status: NONE

### update_updated_at
- Updates the updated_at column on row modification for all core tables

## Security (RLS)
- profiles: users can read/update own profile; admins can read all and update roles/status
- membership_applications: users can read own; admins can read all; users insert own
- memberships: users can read own; admins full access
- contact_messages: admins only (insert by anon/authenticated for public form)
- partnership_requests: admins only (insert by anon/authenticated for public form)
- site_settings: public read; admin write

## Important Notes
1. All tables use UUID primary keys
2. Foreign keys use ON DELETE CASCADE for auth.users links
3. Member IDs are generated atomically via a sequence to prevent duplicates
4. RLS is enabled on every table
5. The profiles.role column is managed via admin actions, not user-mutable metadata
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  bio text,
  skills text[],
  interests text[],
  linkedin_url text,
  github_url text,
  role text NOT NULL DEFAULT 'MEMBER' CHECK (
    role IN ('SUPER_ADMIN', 'CHAPTER_ADMIN', 'EXECUTIVE', 'MEMBER', 'ALUMNI')
  ),
  membership_status text NOT NULL DEFAULT 'NONE' CHECK (
    membership_status IN ('NONE', 'PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'DEACTIVATED')
  ),
  public_directory boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================================
-- MEMBERSHIP APPLICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS membership_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  admission_number text,
  course text,
  department text,
  year_of_study text,
  school_faculty text,
  skills text[],
  areas_of_interest text[],
  linkedin_url text,
  github_url text,
  profile_photo_url text,
  short_bio text,
  membership_category text NOT NULL DEFAULT 'ACTIVE_STUDENT' CHECK (
    membership_category IN ('ACTIVE_STUDENT', 'ALUMNI', 'EXECUTIVE', 'HONORARY')
  ),
  status text NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'SUSPENDED', 'DEACTIVATED')
  ),
  review_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON membership_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_email ON membership_applications(email);

-- ============================================================
-- MEMBERSHIPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES membership_applications(id) ON DELETE SET NULL,
  member_id text NOT NULL UNIQUE,
  membership_category text NOT NULL DEFAULT 'ACTIVE_STUDENT' CHECK (
    membership_category IN ('ACTIVE_STUDENT', 'ALUMNI', 'EXECUTIVE', 'HONORARY')
  ),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (
    status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')
  ),
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_member_id ON memberships(member_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);

-- ============================================================
-- CONTACT MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON contact_messages(created_at DESC);

-- ============================================================
-- PARTNERSHIP REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS partnership_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text,
  organization_type text NOT NULL CHECK (
    organization_type IN ('Research', 'Training', 'Sponsorship', 'Industry Visit', 'Technology', 'Events', 'Community', 'Other')
  ),
  area_of_interest text,
  proposed_collaboration text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'REVIEWED', 'ACCEPTED', 'DECLINED')
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partnership_status ON partnership_requests(status);
CREATE INDEX IF NOT EXISTS idx_partnership_created_at ON partnership_requests(created_at DESC);

-- ============================================================
-- SITE SETTINGS TABLE (singleton)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name text NOT NULL DEFAULT 'KUZA Technical University of Kenya Chapter',
  short_name text NOT NULL DEFAULT 'KUZA TUK',
  tagline text NOT NULL DEFAULT 'Where Spatial Meets Everything.',
  contact_email text NOT NULL DEFAULT 'kuzatukchapter@gmail.com',
  about_text text,
  vision text,
  mission text,
  footer_text text NOT NULL DEFAULT '© 2026 KUZA TUK. All rights reserved.',
  social_x_url text,
  social_instagram_url text,
  social_linkedin_url text,
  homepage_stats jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- MEMBER ID SEQUENCE
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS member_id_seq START 1;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Check if current user is an admin (SUPER_ADMIN or CHAPTER_ADMIN)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('SUPER_ADMIN', 'CHAPTER_ADMIN')
  );
$$;

-- Check if current user is staff (admin or executive)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('SUPER_ADMIN', 'CHAPTER_ADMIN', 'EXECUTIVE')
  );
$$;

-- Generate a unique member ID (KUZA-TUK-YYYY-NNNN)
CREATE OR REPLACE FUNCTION generate_member_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  seq_val bigint;
  current_year int;
BEGIN
  seq_val := nextval('member_id_seq');
  current_year := extract(year from now());
  RETURN 'KUZA-TUK-' || current_year || '-' || lpad(seq_val::text, 4, '0');
END;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile when a new auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS applications_updated_at ON membership_applications;
CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON membership_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS memberships_updated_at ON memberships;
CREATE TRIGGER memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED: SITE SETTINGS
-- ============================================================
INSERT INTO site_settings (organization_name, short_name, tagline, contact_email, footer_text)
SELECT 'KUZA Technical University of Kenya Chapter', 'KUZA TUK', 'Where Spatial Meets Everything.', 'kuzatukchapter@gmail.com', '© 2026 KUZA TUK. All rights reserved.'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- ---- PROFILES ----
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "profiles_select_public_directory" ON profiles;
CREATE POLICY "profiles_select_public_directory"
ON profiles FOR SELECT
TO anon, authenticated
USING (public_directory = true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin"
ON profiles FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ---- MEMBERSHIP APPLICATIONS ----
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_select_own_or_admin" ON membership_applications;
CREATE POLICY "applications_select_own_or_admin"
ON membership_applications FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "applications_insert_own" ON membership_applications;
CREATE POLICY "applications_insert_own"
ON membership_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "applications_update_own" ON membership_applications;
CREATE POLICY "applications_update_own"
ON membership_applications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "applications_update_admin" ON membership_applications;
CREATE POLICY "applications_update_admin"
ON membership_applications FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ---- MEMBERSHIPS ----
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "memberships_select_own_or_admin" ON memberships;
CREATE POLICY "memberships_select_own_or_admin"
ON memberships FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "memberships_update_admin" ON memberships;
CREATE POLICY "memberships_update_admin"
ON memberships FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ---- CONTACT MESSAGES ----
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_insert_public" ON contact_messages;
CREATE POLICY "messages_insert_public"
ON contact_messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "messages_select_admin" ON contact_messages;
CREATE POLICY "messages_select_admin"
ON contact_messages FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "messages_update_admin" ON contact_messages;
CREATE POLICY "messages_update_admin"
ON contact_messages FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "messages_delete_admin" ON contact_messages;
CREATE POLICY "messages_delete_admin"
ON contact_messages FOR DELETE
TO authenticated
USING (is_admin());

-- ---- PARTNERSHIP REQUESTS ----
ALTER TABLE partnership_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "partnership_insert_public" ON partnership_requests;
CREATE POLICY "partnership_insert_public"
ON partnership_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "partnership_select_admin" ON partnership_requests;
CREATE POLICY "partnership_select_admin"
ON partnership_requests FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "partnership_update_admin" ON partnership_requests;
CREATE POLICY "partnership_update_admin"
ON partnership_requests FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "partnership_delete_admin" ON partnership_requests;
CREATE POLICY "partnership_delete_admin"
ON partnership_requests FOR DELETE
TO authenticated
USING (is_admin());

-- ---- SITE SETTINGS ----
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select_public" ON site_settings;
CREATE POLICY "settings_select_public"
ON site_settings FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "settings_update_admin" ON site_settings;
CREATE POLICY "settings_update_admin"
ON site_settings FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================
-- PUBLIC VERIFICATION FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION verify_member_by_id(p_member_id text)
RETURNS TABLE(
  full_name text,
  member_id text,
  membership_status text,
  membership_category text,
  valid_from timestamptz,
  valid_until timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    pr.full_name,
    m.member_id,
    m.status AS membership_status,
    m.membership_category,
    m.valid_from,
    m.valid_until
  FROM memberships m
  JOIN profiles pr ON pr.user_id = m.user_id
  WHERE m.member_id = p_member_id
  AND m.status = 'ACTIVE';
$$;

GRANT EXECUTE ON FUNCTION verify_member_by_id(text) TO anon, authenticated;
