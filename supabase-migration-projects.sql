-- ============================================================
-- Migration: Add projects table + backfill tasks.project_id
-- Safe to run on a live database with existing tasks rows.
-- ============================================================


-- ─── 1. Create projects table ─────────────────────────────────────────────────

create table public.projects (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  description text,
  color       text        not null default '#6366f1',
  icon        text,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index projects_user_id_idx on public.projects(user_id);


-- ─── 2. updated_at trigger for projects ──────────────────────────────────────
-- Reuses the handle_updated_at() function created in the initial schema.
-- If for any reason it doesn't exist yet, the block below creates it.

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on public.projects
  for each row
  execute function public.handle_updated_at();


-- ─── 3. RLS on projects ───────────────────────────────────────────────────────

alter table public.projects enable row level security;

create policy "projects: select own"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "projects: insert own"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "projects: update own"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "projects: delete own"
  on public.projects for delete
  using (auth.uid() = user_id);


-- ─── 4. Backfill: one default project per existing user ───────────────────────
-- We do this BEFORE adding project_id to tasks so the FK targets already exist.
-- Uses a CTE to insert exactly one row per distinct user_id found in tasks,
-- skipping users who somehow already have a project (idempotency guard).

insert into public.projects (name, color, user_id)
select
  'My First Project' as name,
  '#6366f1'          as color,
  distinct_users.user_id
from (
  select distinct user_id from public.tasks
) as distinct_users
where not exists (
  select 1 from public.projects p
  where p.user_id = distinct_users.user_id
);


-- ─── 5. Add project_id to tasks (nullable first, for safe backfill) ──────────

alter table public.tasks
  add column project_id uuid references public.projects(id) on delete cascade;


-- ─── 6. Backfill tasks.project_id ────────────────────────────────────────────
-- Each task gets the default project that belongs to the same user_id.
-- Because we inserted exactly one project per user above, this is a safe 1:1 match.

update public.tasks t
set project_id = p.id
from public.projects p
where p.user_id = t.user_id;


-- ─── 7. Now enforce NOT NULL ─────────────────────────────────────────────────
-- Safe to do after the backfill — every row now has a value.

alter table public.tasks
  alter column project_id set not null;


-- ─── 8. Index on tasks.project_id ────────────────────────────────────────────

create index tasks_project_id_idx on public.tasks(project_id);
