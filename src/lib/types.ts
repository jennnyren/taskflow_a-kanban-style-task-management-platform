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

export interface TaskWithRelations extends Task {
  assignees: TeamMember[]
  labels:    Label[]
}

// ─── Supabase database shape (for typed client) ───────────────────────────────

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row:    Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>
      }
      team_members: {
        Row:    TeamMember
        Insert: Omit<TeamMember, 'id' | 'created_at'>
        Update: Partial<Omit<TeamMember, 'id' | 'created_at'>>
      }
      labels: {
        Row:    Label
        Insert: Omit<Label, 'id' | 'created_at'>
        Update: Partial<Omit<Label, 'id' | 'created_at'>>
      }
      task_assignees: {
        Row:    TaskAssignee
        Insert: Omit<TaskAssignee, 'id'>
        Update: never
      }
      task_labels: {
        Row:    TaskLabel
        Insert: Omit<TaskLabel, 'id'>
        Update: never
      }
      comments: {
        Row:    Comment
        Insert: Omit<Comment, 'id' | 'created_at'>
        Update: Partial<Pick<Comment, 'content'>>
      }
      activity_log: {
        Row:    ActivityEntry
        Insert: Omit<ActivityEntry, 'id' | 'created_at'>
        Update: never
      }
    }
  }
}
