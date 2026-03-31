# Kanban Board

A full-featured Kanban task management app built as a frontend assessment project. Drag tasks between columns, track due dates, assign team members, add labels and comments, and monitor activity across the board.

## Tech Stack

- **React 19** + **TypeScript** (strict)
- **Vite 8** — build tooling
- **Supabase** — Postgres database, Row Level Security, anonymous auth
- **Tailwind CSS v4** — utility styling via `@tailwindcss/vite`
- **@dnd-kit** — accessible drag-and-drop
- **date-fns** — date formatting and due-date logic
- **lucide-react** — icons

## Running Locally

```bash
# 1. Clone the repo
git clone <repo-url>
cd np-assesssment

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your Supabase project URL and anon key

# 4. Run database migrations
# In your Supabase project's SQL editor, run:
#   supabase-migration-projects.sql   (adds projects table)
# The initial schema SQL is also in the repo root.

# 5. Start the dev server
npm run dev
```

The app opens at `http://localhost:5173`. Authentication is anonymous — a session is created automatically on first load.

## Environment Variables

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Both values are found in your Supabase project under **Settings → API**.

## Features

### Board
- Multi-project workspace — create projects with a name, color, and emoji icon
- Kanban columns: **To Do**, **In Progress**, **In Review**, **Done**
- Drag and drop tasks between columns with optimistic UI updates
- Inline task creation per column

### Tasks
- Title and description (inline editing, auto-saves on blur)
- Priority levels: Low, Normal, High
- Due dates with visual indicators: overdue, due today, due soon, upcoming
- Assign multiple team members per task
- Apply multiple labels per task
- Comment thread per task

### Filtering & Stats
- Search by task title (case-insensitive)
- Filter by priority, assignee, label, and due date
- Active filter count with one-click clear
- Stats bar: total, in-progress, done, overdue counts — click Overdue to filter

### Team
- Add team members with a name and colour
- View tasks assigned to each member

### Labels
- Create labels with a name and colour
- Labels shown as chips on task cards

### Comments
- Add and delete comments per task
- Global comments feed across all tasks and projects

### Activity Log
- Full timeline of task changes (created, edited, moved, deleted, comments)
- Per-task activity in the task modal
- Global activity feed page

### Notifications
- Toast notifications for all create/update/delete operations
- Error toasts on any Supabase failure with rollback where applicable
