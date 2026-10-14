/*
# Fix: Set search_path on all SECURITY DEFINER functions

## Root Cause
The `handle_new_user()` trigger fires on auth.users INSERT (during signup).
It is SECURITY DEFINER and references `profiles` without schema qualification.
Without an explicit `search_path`, the function could not resolve `profiles`
during the signup transaction, causing:
  42P01: relation "profiles" does not exist
  25P02: current transaction is aborted

This made every signup return HTTP 500.

## Fix
Recreate all SECURITY DEFINER functions with `SET search_path = public` so
unqualified table references always resolve to the public schema.

## Functions Updated
1. handle_new_user() — trigger on auth.users, inserts into profiles
2. is_admin() — checks profiles.role
3. is_staff() — checks profiles.role
4. generate_member_id() — uses member_id_seq
5. approve_membership_application() — updates profiles, memberships, applications
6. verify_member_by_id() — reads memberships + profiles
7. register_for_event() — reads events, profiles, event_registrations
8. cancel_event_registration() — updates event_registrations
9. check_in_attendee() — updates event_registrations
10. revert_check_in() — updates event_registrations
11. mark_no_show() — updates event_registrations

## Safety
- No tables dropped or altered
- No data deleted
- No RLS policies changed
- Only function definitions updated to include search_path
*/

-- 1. handle_new_user (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 2. is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('SUPER_ADMIN', 'CHAPTER_ADMIN')
  );
$$;

-- 3. is_staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('SUPER_ADMIN', 'CHAPTER_ADMIN', 'EXECUTIVE')
  );
$$;

-- 4. generate_member_id
CREATE OR REPLACE FUNCTION public.generate_member_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 5. approve_membership_application
CREATE OR REPLACE FUNCTION public.approve_membership_application(p_application_id uuid)
RETURNS TABLE(member_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_record membership_applications;
  new_member_id text;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  SELECT * INTO app_record
  FROM membership_applications
  WHERE id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  new_member_id := generate_member_id();

  INSERT INTO memberships (user_id, application_id, member_id, membership_category, status, valid_from)
  VALUES (app_record.user_id, app_record.id, new_member_id, app_record.membership_category, 'ACTIVE', now());

  UPDATE membership_applications
  SET status = 'APPROVED', reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = p_application_id;

  UPDATE profiles
  SET membership_status = 'ACTIVE'
  WHERE user_id = app_record.user_id;

  RETURN QUERY SELECT new_member_id;
END;
$$;

-- 6. verify_member_by_id
CREATE OR REPLACE FUNCTION public.verify_member_by_id(p_member_id text)
RETURNS TABLE(
  full_name text,
  member_id text,
  membership_status text,
  membership_category text,
  valid_from timestamptz,
  valid_until timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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

GRANT EXECUTE ON FUNCTION public.verify_member_by_id(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_membership_application(uuid) TO authenticated;

-- 7. register_for_event
CREATE OR REPLACE FUNCTION public.register_for_event(p_event_id uuid)
RETURNS TABLE(registration_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_record events;
  current_count int;
  user_status text;
  existing_reg text;
  reg_id uuid;
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
  RETURNING id INTO reg_id;

  RETURN QUERY SELECT reg_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_for_event(uuid) TO authenticated;

-- 8. cancel_event_registration
CREATE OR REPLACE FUNCTION public.cancel_event_registration(p_registration_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

GRANT EXECUTE ON FUNCTION public.cancel_event_registration(uuid) TO authenticated;

-- 9. check_in_attendee
CREATE OR REPLACE FUNCTION public.check_in_attendee(p_registration_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

GRANT EXECUTE ON FUNCTION public.check_in_attendee(uuid) TO authenticated;

-- 10. revert_check_in
CREATE OR REPLACE FUNCTION public.revert_check_in(p_registration_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

GRANT EXECUTE ON FUNCTION public.revert_check_in(uuid) TO authenticated;

-- 11. mark_no_show
CREATE OR REPLACE FUNCTION public.mark_no_show(p_registration_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

GRANT EXECUTE ON FUNCTION public.mark_no_show(uuid) TO authenticated;
