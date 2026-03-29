-- ============================================================
-- Taskflow — Supabase SQL Schema
-- Run this once in the Supabase SQL editor
-- ============================================================


-- ─── Extensions ──────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";


-- ─── 1. tasks ────────────────────────────────────────────────────────────────

create table public.tasks (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  description text,
  status      text        not null default 'todo',
  priority    text        not null default 'normal',
  due_date    date,
  position    integer     not null default 0,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint tasks_status_check   check (status   in ('todo', 'in_progress', 'in_review', 'done')),
  constraint tasks_priority_check check (priority in ('low', 'normal', 'high'))
);

create index tasks_user_id_idx  on public.tasks(user_id);
create index tasks_status_idx   on public.tasks(status);
create index tasks_position_idx on public.tasks(user_id, status, position);


-- ─── 2. team_members ─────────────────────────────────────────────────────────

create table public.team_members (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  color      text        not null default '#6366f1',
  user_id    uuid        not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index team_members_user_id_idx on public.team_members(user_id);


-- ─── 3. labels ───────────────────────────────────────────────────────────────

create table public.labels (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  color      text        not null default '#6366f1',
  user_id    uuid        not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index labels_user_id_idx on public.labels(user_id);


-- ─── 4. task_assignees ───────────────────────────────────────────────────────

create table public.task_assignees (
  id        uuid primary key default gen_random_uuid(),
  task_id   uuid not null references public.tasks(id)        on delete cascade,
  member_id uuid not null references public.team_members(id) on delete cascade,
  user_id   uuid not null references auth.users(id)          on delete cascade,

  constraint task_assignees_unique unique (task_id, member_id)
);

create index task_assignees_task_id_idx   on public.task_assignees(task_id);
create index task_assignees_member_id_idx on public.task_assignees(member_id);


-- ─── 5. task_labels ──────────────────────────────────────────────────────────

create table public.task_labels (
  id       uuid primary key default gen_random_uuid(),
  task_id  uuid not null references public.tasks(id)  on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  user_id  uuid not null references auth.users(id)    on delete cascade,

  constraint task_labels_unique unique (task_id, label_id)
);

create index task_labels_task_id_idx  on public.task_labels(task_id);
create index task_labels_label_id_idx on public.task_labels(label_id);


-- ─── 6. comments ─────────────────────────────────────────────────────────────

create table public.comments (
  id         uuid        primary key default gen_random_uuid(),
  task_id    uuid        not null references public.tasks(id) on delete cascade,
  content    text        not null,
  user_id    uuid        not null references auth.users(id)   on delete cascade,
  created_at timestamptz not null default now()
);

create index comments_task_id_idx on public.comments(task_id);
create index comments_user_id_idx on public.comments(user_id);


-- ─── 7. activity_log ─────────────────────────────────────────────────────────

create table public.activity_log (
  id         uuid        primary key default gen_random_uuid(),
  task_id    uuid        not null references public.tasks(id) on delete cascade,
  action     text        not null,
  details    jsonb       not null default '{}',
  user_id    uuid        not null references auth.users(id)   on delete cascade,
  created_at timestamptz not null default now()
);

create index activity_log_task_id_idx on public.activity_log(task_id);
create index activity_log_user_id_idx on public.activity_log(user_id);


-- ─── Trigger: auto-update tasks.updated_at ───────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();


-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.tasks          enable row level security;
alter table public.team_members   enable row level security;
alter table public.labels         enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_labels    enable row level security;
alter table public.comments       enable row level security;
alter table public.activity_log   enable row level security;


-- ─── RLS Policies: tasks ─────────────────────────────────────────────────────

create policy "tasks: select own"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "tasks: insert own"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks: update own"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks: delete own"
  on public.tasks for delete
  using (auth.uid() = user_id);


-- ─── RLS Policies: team_members ──────────────────────────────────────────────

create policy "team_members: select own"
  on public.team_members for select
  using (auth.uid() = user_id);

create policy "team_members: insert own"
  on public.team_members for insert
  with check (auth.uid() = user_id);

create policy "team_members: update own"
  on public.team_members for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "team_members: delete own"
  on public.team_members for delete
  using (auth.uid() = user_id);


-- ─── RLS Policies: labels ────────────────────────────────────────────────────

create policy "labels: select own"
  on public.labels for select
  using (auth.uid() = user_id);

create policy "labels: insert own"
  on public.labels for insert
  with check (auth.uid() = user_id);

create policy "labels: update own"
  on public.labels for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "labels: delete own"
  on public.labels for delete
  using (auth.uid() = user_id);


-- ─── RLS Policies: task_assignees ────────────────────────────────────────────

create policy "task_assignees: select own"
  on public.task_assignees for select
  using (auth.uid() = user_id);

create policy "task_assignees: insert own"
  on public.task_assignees for insert
  with check (auth.uid() = user_id);

create policy "task_assignees: update own"
  on public.task_assignees for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "task_assignees: delete own"
  on public.task_assignees for delete
  using (auth.uid() = user_id);


-- ─── RLS Policies: task_labels ───────────────────────────────────────────────

create policy "task_labels: select own"
  on public.task_labels for select
  using (auth.uid() = user_id);

create policy "task_labels: insert own"
  on public.task_labels for insert
  with check (auth.uid() = user_id);

create policy "task_labels: update own"
  on public.task_labels for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "task_labels: delete own"
  on public.task_labels for delete
  using (auth.uid() = user_id);


-- ─── RLS Policies: comments ──────────────────────────────────────────────────

create policy "comments: select own"
  on public.comments for select
  using (auth.uid() = user_id);

create policy "comments: insert own"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "comments: update own"
  on public.comments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "comments: delete own"
  on public.comments for delete
  using (auth.uid() = user_id);


-- ─── RLS Policies: activity_log ──────────────────────────────────────────────
-- activity_log is append-only: no update or delete policies

create policy "activity_log: select own"
  on public.activity_log for select
  using (auth.uid() = user_id);

create policy "activity_log: insert own"
  on public.activity_log for insert
  with check (auth.uid() = user_id);
