// ─── Supabase Database Types ───────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'low' | 'normal' | 'high'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  position: number
  user_id: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export interface Label {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export interface TaskAssignee {
  id: string
  task_id: string
  member_id: string
  user_id: string
}

export interface TaskLabel {
  id: string
  task_id: string
  label_id: string
  user_id: string
}

export interface Comment {
  id: string
  task_id: string
  content: string
  user_id: string
  created_at: string
}

export interface ActivityLogEntry {
  id: string
  task_id: string
  action: string
  details: Json
  user_id: string
  created_at: string
}

// ─── Enriched / View Types ──────────────────────────────────────────────────

export interface TaskWithRelations extends Task {
  assignees?: TeamMember[]
  labels?: Label[]
}

// ─── Supabase Generated Database Shape ──────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      tasks: { Row: Task; Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Task, 'id'>> }
      team_members: { Row: TeamMember; Insert: Omit<TeamMember, 'id' | 'created_at'>; Update: Partial<Omit<TeamMember, 'id'>> }
      labels: { Row: Label; Insert: Omit<Label, 'id' | 'created_at'>; Update: Partial<Omit<Label, 'id'>> }
      task_assignees: { Row: TaskAssignee; Insert: Omit<TaskAssignee, 'id'>; Update: Partial<Omit<TaskAssignee, 'id'>> }
      task_labels: { Row: TaskLabel; Insert: Omit<TaskLabel, 'id'>; Update: Partial<Omit<TaskLabel, 'id'>> }
      comments: { Row: Comment; Insert: Omit<Comment, 'id' | 'created_at'>; Update: Partial<Omit<Comment, 'id'>> }
      activity_log: { Row: ActivityLogEntry; Insert: Omit<ActivityLogEntry, 'id' | 'created_at'>; Update: never }
    }
  }
}
