-- Add sort_order to projects table for user-controlled drag-and-drop ordering.
-- Existing rows are initialised in alphabetical order so the initial display
-- matches what users already see.
--
-- Run this in the Supabase SQL editor.

alter table public.projects
  add column if not exists sort_order integer not null default 0;

-- Initialise existing rows: assign sort_order based on alphabetical order
-- within each user's project list.
with ranked as (
  select
    id,
    row_number() over (
      partition by admin_user_id
      order by name
    ) - 1 as rn
  from public.projects
  where deleted_at is null
)
update public.projects p
set sort_order = r.rn
from ranked r
where p.id = r.id;
