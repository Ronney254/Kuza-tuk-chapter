/*
# Revoke anon EXECUTE on admin/staff-only SECURITY DEFINER functions

## Overview
The Supabase security advisor flagged that several SECURITY DEFINER functions
are callable by the anon role. While each function has internal auth checks
(is_admin/is_staff/auth.uid), revoking anon EXECUTE adds defense-in-depth
so unauthenticated callers are rejected before the function body even runs.

## Changes
- REVOKE EXECUTE on approve_membership_application FROM anon
- REVOKE EXECUTE on check_in_attendee FROM anon
- REVOKE EXECUTE on revert_check_in FROM anon
- REVOKE EXECUTE on mark_no_show FROM anon
- REVOKE EXECUTE on register_for_event FROM anon
- REVOKE EXECUTE on cancel_event_registration FROM anon

## Functions kept executable by anon
- verify_member_by_id: intentionally public (public member verification)
*/

REVOKE EXECUTE ON FUNCTION public.approve_membership_application(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_in_attendee(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.revert_check_in(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.mark_no_show(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.register_for_event(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.cancel_event_registration(uuid) FROM anon;
