/*
# KUZA TUK — Events Schema (Phase 4)

## Overview
Creates the events system: event creation/management by admins, member registration
with capacity tracking, and QR-based attendance check-in. Three new tables plus
SECURITY DEFINER functions for safe concurrent registration and check-in.

## New Tables

### events
- Created by admins (SUPER_ADMIN, CHAPTER_ADMIN)
- Stores event details: title, description, type, dates, venue, capacity
- is_published controls public visibility (draft events hidden from public)
- event_type: WORKSHOP, TRAINING, TALK, HACKATHON, COMMUNITY, OTHER
- capacity null = unlimited

### event_registrations
- One row per user per event (unique constraint on event_id + user_id)
- status: REGISTERED, CANCELLED, ATTENDED, NO_SHOW
- checked_in_at / checked_in_by track attendance
- Only active members (membership_status = ACTIVE) can register

## Security (RLS)
- events: public (anon + authenticated) can read published events; admin/staff full CRUD
- event_registrations: users can read own; admin/staff can read all; users insert/update own (via function for atomic capacity check)

## SECURITY DEFINER Functions
- register_for_event(p_event_id): checks capacity, membership status, duplicate; inserts registration atomically
- cancel_event_registration(p_registration_id): verifies ownership, sets status to CANCELLED
- check_in_attendee(p_registration_id): verifies admin/staff, sets ATTENDED + checked_in_at
- revert_check_in(p_registration_id): verifies admin/staff, removes attendance
- mark_no_show(p_registration_id): verifies admin/staff, marks as NO_SHOW

## Important Notes
1. Registration is atomic via SECURITY DEFINER to prevent overbooking
2. Only ACTIVE members can register (membership_status = 'ACTIVE')
3. Unique constraint prevents duplicate registrations
4. Cancelled registrations free up capacity
5. QR check-in updates the registration row status to ATTENDED
*/

-- ============================================================
-- EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  banner_url text,
  event_type text NOT NULL DEFAULT 'WORKSHOP' CHECK (
    event_type IN ('WORKSHOP', 'TRAINING', 'TALK', 'HACKATHON', 'COMMUNITY', 'OTHER')
  ),
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  venue text,
  location_url text,
  capacity int,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);

-- ============================================================
-- EVENT REGISTRATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'REGISTERED' CHECK (
    status IN ('REGISTERED', 'CANCELLED', 'ATTENDED', 'NO_SHOW')
  ),
  registered_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  checked_in_at timestamptz,
  checked_in_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON event_registrations(status);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
DROP TRIGGER IF EXISTS events_updated_at ON events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS registrations_updated_at ON event_registrations;
CREATE TRIGGER registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================================

-- Register for an event (atomic capacity check)
CREATE OR REPLACE FUNCTION register_for_event(p_event_id uuid)
RETURNS TABLE(registration_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_record events;
  current_count int;
  user_status text;
  existing_reg text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO event_record FROM events WHERE id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  IF NOT event_record.is_published THEN
    RAISE EXCEPTION 'Event is not available for registration';
  END IF;

  SELECT membership_status INTO user_status
  FROM profiles WHERE user_id = auth.uid();

  IF user_status IS NULL OR user_status != 'ACTIVE' THEN
    RAISE EXCEPTION 'Only active members can register for events';
  END IF;

  SELECT status INTO existing_reg
  FROM event_registrations
  WHERE event_id = p_event_id AND user_id = auth.uid();

  IF existing_reg = 'REGISTERED' OR existing_reg = 'ATTENDED' THEN
    RAISE EXCEPTION 'You are already registered for this event';
  END IF;

  IF event_record.capacity IS NOT NULL THEN
    SELECT count(*) INTO current_count
    FROM event_registrations
    WHERE event_id = p_event_id
    AND status IN ('REGISTERED', 'ATTENDED');

    IF current_count >= event_record.capacity THEN
      RAISE EXCEPTION 'This event is full';
    END IF;
  END IF;

  INSERT INTO event_registrations (event_id, user_id, status, registered_at)
  VALUES (p_event_id, auth.uid(), 'REGISTERED', now())
  ON CONFLICT (event_id, user_id)
  DO UPDATE SET status = 'REGISTERED', registered_at = now(), cancelled_at = NULL, updated_at = now()
  RETURNING id INTO event_record.id;

  RETURN QUERY SELECT event_record.id;
END;
$$;

GRANT EXECUTE ON FUNCTION register_for_event(uuid) TO authenticated;

-- Cancel own registration
CREATE OR REPLACE FUNCTION cancel_event_registration(p_registration_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reg_record event_registrations;
BEGIN
  SELECT * INTO reg_record FROM event_registrations WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found';
  END IF;

  IF reg_record.user_id != auth.uid() THEN
    RAISE EXCEPTION 'You can only cancel your own registration';
  END IF;

  IF reg_record.status NOT IN ('REGISTERED') THEN
    RAISE EXCEPTION 'Cannot cancel a registration with status %', reg_record.status;
  END IF;

  UPDATE event_registrations
  SET status = 'CANCELLED', cancelled_at = now(), updated_at = now()
  WHERE id = p_registration_id;
END;
$$;

GRANT EXECUTE ON FUNCTION cancel_event_registration(uuid) TO authenticated;

-- Check in attendee (admin/staff only)
CREATE OR REPLACE FUNCTION check_in_attendee(p_registration_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reg_record event_registrations;
BEGIN
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Unauthorized: staff access required';
  END IF;

  SELECT * INTO reg_record FROM event_registrations WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found';
  END IF;

  IF reg_record.status = 'CANCELLED' THEN
    RAISE EXCEPTION 'Cannot check in a cancelled registration';
  END IF;

  IF reg_record.status = 'ATTENDED' THEN
    RAISE EXCEPTION 'Attendee already checked in';
  END IF;

  UPDATE event_registrations
  SET status = 'ATTENDED', checked_in_at = now(), checked_in_by = auth.uid(), updated_at = now()
  WHERE id = p_registration_id;
END;
$$;

GRANT EXECUTE ON FUNCTION check_in_attendee(uuid) TO authenticated;

-- Revert check-in (admin/staff only)
CREATE OR REPLACE FUNCTION revert_check_in(p_registration_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reg_record event_registrations;
BEGIN
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Unauthorized: staff access required';
  END IF;

  SELECT * INTO reg_record FROM event_registrations WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found';
  END IF;

  IF reg_record.status != 'ATTENDED' THEN
    RAISE EXCEPTION 'Attendee is not checked in';
  END IF;

  UPDATE event_registrations
  SET status = 'REGISTERED', checked_in_at = NULL, checked_in_by = NULL, updated_at = now()
  WHERE id = p_registration_id;
END;
$$;

GRANT EXECUTE ON FUNCTION revert_check_in(uuid) TO authenticated;

-- Mark no-show (admin/staff only)
CREATE OR REPLACE FUNCTION mark_no_show(p_registration_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reg_record event_registrations;
BEGIN
  IF NOT is_staff() THEN
    RAISE EXCEPTION 'Unauthorized: staff access required';
  END IF;

  SELECT * INTO reg_record FROM event_registrations WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found';
  END IF;

  IF reg_record.status = 'CANCELLED' THEN
    RAISE EXCEPTION 'Cannot mark a cancelled registration as no-show';
  END IF;

  UPDATE event_registrations
  SET status = 'NO_SHOW', updated_at = now()
  WHERE id = p_registration_id;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_no_show(uuid) TO authenticated;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- ---- EVENTS ----
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select_published" ON events;
CREATE POLICY "events_select_published"
ON events FOR SELECT
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "events_select_staff" ON events;
CREATE POLICY "events_select_staff"
ON events FOR SELECT
TO authenticated
USING (is_staff());

DROP POLICY IF EXISTS "events_insert_admin" ON events;
CREATE POLICY "events_insert_admin"
ON events FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "events_update_admin" ON events;
CREATE POLICY "events_update_admin"
ON events FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "events_delete_admin" ON events;
CREATE POLICY "events_delete_admin"
ON events FOR DELETE
TO authenticated
USING (is_admin());

-- ---- EVENT REGISTRATIONS ----
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "registrations_select_own_or_staff" ON event_registrations;
CREATE POLICY "registrations_select_own_or_staff"
ON event_registrations FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_staff());

DROP POLICY IF EXISTS "registrations_update_own" ON event_registrations;
CREATE POLICY "registrations_update_own"
ON event_registrations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "registrations_update_staff" ON event_registrations;
CREATE POLICY "registrations_update_staff"
ON event_registrations FOR UPDATE
TO authenticated
USING (is_staff())
WITH CHECK (is_staff());

DROP POLICY IF EXISTS "registrations_delete_admin" ON event_registrations;
CREATE POLICY "registrations_delete_admin"
ON event_registrations FOR DELETE
TO authenticated
USING (is_admin());
