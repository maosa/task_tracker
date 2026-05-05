-- Phase 8 — Auth Enforcement Migration
-- Run this via: Supabase Dashboard → SQL Editor → paste and run.
--
-- Steps:
--   1. Drops the permissive open-mode policies applied during launch
--   2. Adds a policy so any authenticated user can read any other user's
--      basic profile (needed for manager invite lookup and manager landing)
--   3. (Optional) Disable email confirmation for internal use
--
-- After running this, set NEXT_PUBLIC_AUTH_ENFORCED=true in Vercel and
-- remove the open-mode env var (NEXT_PUBLIC_ADMIN_USER_ID) from Vercel.

-- ============================================================
-- 1. Drop open-mode policies
-- ============================================================
drop policy if exists "open_mode: tasks all"         on public.tasks;
drop policy if exists "open_mode: projects all"      on public.projects;
drop policy if exists "open_mode: task_notes all"    on public.task_notes;
drop policy if exists "open_mode: task_comments all" on public.task_comments;
drop policy if exists "open_mode: users read"        on public.users;
drop policy if exists "open_mode: users insert"      on public.users;

-- ============================================================
-- 2. Allow any authenticated user to read any other user's profile
--    Required for:
--      - Manager landing page (read admin user names)
--      - Settings invite section (lookup user by email)
--      - TopBar (read own profile)
-- ============================================================
drop policy if exists "users: authenticated read" on public.users;
create policy "users: authenticated read"
  on public.users for select
  using (auth.uid() is not null);

-- ============================================================
-- 3. Allow users to update their own row
--    (Already present in schema.sql — idempotent)
-- ============================================================
drop policy if exists "users: self update" on public.users;
create policy "users: self update"
  on public.users for update
  using (auth.uid() = id);

-- ============================================================
-- 4. Allow users to insert their own row
--    (The trigger handles this automatically on sign-up,
--     but the signup page also calls update — this covers edge cases)
-- ============================================================
drop policy if exists "users: self insert" on public.users;
create policy "users: self insert"
  on public.users for insert
  with check (auth.uid() = id);

-- ============================================================
-- Notes for Supabase project configuration:
--
-- • Email confirmation: For an internal tool, consider disabling
--   email confirmation in Supabase Dashboard → Authentication →
--   Providers → Email → "Confirm email" toggle.
--
-- • Invitation flow: When an admin invites a manager, the
--   manager_relationships record is created with status='pending'.
--   When the manager signs up / signs in, update the record:
--     UPDATE manager_relationships
--     SET manager_user_id = auth.uid(), status = 'accepted', accepted_at = now()
--     WHERE manager_email = auth.email() AND status = 'pending';
--   This can be done via a Supabase Edge Function triggered on sign-in,
--   or as a database function called from the app after sign-in.
-- ============================================================
