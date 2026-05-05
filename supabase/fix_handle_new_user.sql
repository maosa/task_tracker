-- Fix: persist first_name, last_name, and role at signup time.
--
-- Root cause: the post-signup UPDATE in the client code ran without a session
-- (email confirmation is required), so RLS blocked it silently.
-- Fix: read all three fields from raw_user_meta_data inside the trigger,
-- which runs as SECURITY DEFINER and needs no session.
--
-- Run this in the Supabase SQL editor, then redeploy the app.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, first_name, last_name, role, created_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'role',
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
