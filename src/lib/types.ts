// ─── Primitive value types ────────────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type TaskStatus   = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'low' | 'normal' | 'high'

// ─── Table row types ──────────────────────────────────────────────────────────

export interface Task {
  id:          string
  title:       string
  description: string | null
  status:      TaskStatus
  priority:    TaskPriority
  due_date:    string | null   // ISO date string: "YYYY-MM-DD"
  position:    number
  project_id:  string
  user_id:     string
  created_at:  string
  updated_at:  string
}

export interface TeamMember {
  id:         string
  name:       string
  color:      string           // hex color, e.g. "#6366f1"
  user_id:    string
  created_at: string
}

export interface Label {
  id:         string
  name:       string
  color:      string           // hex color
  user_id:    string
  created_at: string
}

export interface TaskAssignee {
  id:        string
  task_id:   string
  member_id: string
  user_id:   string
}

export interface TaskLabel {
  id:       string
  task_id:  string
  label_id: string
  user_id:  string
}

export interface Comment {
  id:         string
  task_id:    string
  content:    string
  user_id:    string
  created_at: string
}

export interface ActivityEntry {
  id:         string
  task_id:    string
  action:     string
  details:    Json
  user_id:    string
  created_at: string
}

// ─── Enriched / view types ────────────────────────────────────────────────────

export interface Project {
  id:          string
  name:        string
  description: string | null
  color:       string
  icon:        string | null
  user_id:     string
  created_at:  string
  updated_at:  string
}

export interface ProjectWithCount extends Project {
  task_count: number
}

export interface TaskWithRelations extends Task {
  assignees:     TeamMember[]
  labels:        Label[]
  comment_count: number
}

// Note: A proper Database generic for the Supabase client is best generated via:
// npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
