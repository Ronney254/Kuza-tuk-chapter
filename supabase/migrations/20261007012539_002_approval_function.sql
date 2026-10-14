/*
# KUZA TUK — Membership Approval Function

## Overview
Creates a SECURITY DEFINER function that allows admins to approve a membership
application. This function:
1. Verifies the caller is an admin
2. Updates the application status to APPROVED
3. Creates a membership record with a unique, atomically-generated member ID
4. Updates the profile's membership_status to ACTIVE

## Security
- SECURITY DEFINER: runs with elevated privileges to insert into memberships table
- Checks is_admin() at the start — non-admins get an error
- Member ID is generated via the sequence (atomic, no race conditions)
*/

CREATE OR REPLACE FUNCTION approve_membership_application(p_application_id uuid)
RETURNS TABLE(member_id text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  app_record membership_applications;
  new_member_id text;
BEGIN
  -- Verify caller is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  -- Fetch the application
  SELECT * INTO app_record
  FROM membership_applications
  WHERE id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  -- Generate unique member ID
  new_member_id := generate_member_id();

  -- Create membership record
  INSERT INTO memberships (user_id, application_id, member_id, membership_category, status, valid_from)
  VALUES (app_record.user_id, app_record.id, new_member_id, app_record.membership_category, 'ACTIVE', now());

  -- Update application status
  UPDATE membership_applications
  SET status = 'APPROVED', reviewed_by = auth.uid(), reviewed_at = now()
  WHERE id = p_application_id;

  -- Update profile membership status
  UPDATE profiles
  SET membership_status = 'ACTIVE'
  WHERE user_id = app_record.user_id;

  RETURN QUERY SELECT new_member_id;
END;
$$;

GRANT EXECUTE ON FUNCTION approve_membership_application(uuid) TO authenticated;
