-- Migration: fix ON DELETE behaviour on created_by / updated_by foreign keys.
--
-- The tasks, task_notes, and task_comments tables reference public.users(id)
-- via created_by / updated_by without any ON DELETE rule (defaults to RESTRICT).
-- This blocked user deletion even though public.users itself cascades from auth.users.
--
-- Fix:
--   created_by (NOT NULL)  → ON DELETE CASCADE   (row is owned by its author)
--   updated_by (nullable)  → ON DELETE SET NULL  (audit reference, safe to clear)
--
-- Run once in the Supabase SQL editor.

-- ── tasks ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.tasks
  DROP CONSTRAINT IF EXISTS tasks_created_by_fkey,
  DROP CONSTRAINT IF EXISTS tasks_updated_by_fkey;

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT tasks_updated_by_fkey
    FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- ── task_notes ────────────────────────────────────────────────────────────────
ALTER TABLE public.task_notes
  DROP CONSTRAINT IF EXISTS task_notes_created_by_fkey,
  DROP CONSTRAINT IF EXISTS task_notes_updated_by_fkey;

ALTER TABLE public.task_notes
  ADD CONSTRAINT task_notes_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT task_notes_updated_by_fkey
    FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- ── task_comments ─────────────────────────────────────────────────────────────
ALTER TABLE public.task_comments
  DROP CONSTRAINT IF EXISTS task_comments_created_by_fkey,
  DROP CONSTRAINT IF EXISTS task_comments_updated_by_fkey;

ALTER TABLE public.task_comments
  ADD CONSTRAINT task_comments_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT task_comments_updated_by_fkey
    FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;
