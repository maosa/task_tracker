-- Open-mode RLS policies for Task Tracker launch mode.
-- Apply these when NEXT_PUBLIC_AUTH_ENFORCED=false so that the anon key
-- can read/write data without a logged-in session.
--
-- IMPORTANT: Drop these policies before enabling auth enforcement (Phase 8).
--            They grant full public read/write access.
--
-- Run via: Supabase Dashboard → SQL Editor → paste and run.

-- Tasks: public full access
drop policy if exists "open_mode: tasks all" on public.tasks;
create policy "open_mode: tasks all"
  on public.tasks for all
  using (true)
  with check (true);

-- Projects: public full access
drop policy if exists "open_mode: projects all" on public.projects;
create policy "open_mode: projects all"
  on public.projects for all
  using (true)
  with check (true);

-- Task notes: public full access
drop policy if exists "open_mode: task_notes all" on public.task_notes;
create policy "open_mode: task_notes all"
  on public.task_notes for all
  using (true)
  with check (true);

-- Task comments: public full access
drop policy if exists "open_mode: task_comments all" on public.task_comments;
create policy "open_mode: task_comments all"
  on public.task_comments for all
  using (true)
  with check (true);

-- Users: public read/insert (needed to display user info and seed a demo user)
drop policy if exists "open_mode: users read" on public.users;
create policy "open_mode: users read"
  on public.users for select
  using (true);

drop policy if exists "open_mode: users insert" on public.users;
create policy "open_mode: users insert"
  on public.users for insert
  with check (true);
