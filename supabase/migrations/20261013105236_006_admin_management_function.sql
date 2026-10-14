/*
# Admin Management — Role Update Function

## Overview
This migration adds a SECURITY DEFINER function that allows a SUPER_ADMIN
to change another user's role. This is the only safe way to modify the
`profiles.role` column — it enforces that the caller is a SUPER_ADMIN
and blocks any attempt to escalate to or from SUPER_ADMIN by non-super-admins.

## New Functions

### update_user_role(p_target_user_id uuid, p_new_role text)
- Can only be called by a user whose own profile role is SUPER_ADMIN
- Validates that p_new_role is one of the allowed roles
- Prevents a SUPER_ADMIN from demoting themselves (safety guard against
  accidentally removing the last super admin)
- Returns the updated profile row

## Security
- Function is SECURITY DEFINER so it can update profiles regardless of RLS
- Execution is granted to `authenticated` only — the function internally
  checks that the caller is a SUPER_ADMIN and raises an exception otherwise
- The `anon` role does NOT get execute permission
- A search_path is set explicitly to prevent path injection
*/

CREATE OR REPLACE FUNCTION update_user_role(p_target_user_id uuid, p_new_role text)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  target_profile profiles%ROWTYPE;
BEGIN
  -- Get the caller's role
  SELECT role INTO caller_role
  FROM profiles
  WHERE user_id = auth.uid();

  IF caller_role IS NULL OR caller_role <> 'SUPER_ADMIN' THEN
    RAISE EXCEPTION 'Only super admins can change user roles';
  END IF;

  -- Validate the new role
  IF p_new_role NOT IN ('SUPER_ADMIN', 'CHAPTER_ADMIN', 'EXECUTIVE', 'MEMBER', 'ALUMNI') THEN
    RAISE EXCEPTION 'Invalid role value';
  END IF;

  -- Prevent self-demotion (avoid locking out all super admins)
  IF p_target_user_id = auth.uid() AND p_new_role <> 'SUPER_ADMIN' THEN
    RAISE EXCEPTION 'You cannot demote your own super admin role';
  END IF;

  -- Update the target profile
  UPDATE profiles
  SET role = p_new_role
  WHERE user_id = p_target_user_id
  RETURNING * INTO target_profile;

  IF target_profile IS NULL THEN
    RAISE EXCEPTION 'Target user profile not found';
  END IF;

  RETURN target_profile;
END;
$$;

-- Grant execute only to authenticated (not anon)
REVOKE EXECUTE ON FUNCTION update_user_role(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION update_user_role(uuid, text) TO authenticated;
