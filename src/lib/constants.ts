import type { TaskStatus, TaskPriority } from './types'

// ─── Column definitions ───────────────────────────────────────────────────────

export interface ColumnConfig {
  id:          TaskStatus
  label:       string
  accent:      string   // top border color
  dot:         string   // status dot color
  badgeBg:     string   // count badge background
  badgeText:   string   // count badge text
}

export const COLUMNS: ColumnConfig[] = [
  {
    id:        'todo',
    label:     'To Do',
    accent:    '#475569',
    dot:       '#64748b',
    badgeBg:   '#1e2030',
    badgeText: '#94a3b8',
  },
  {
    id:        'in_progress',
    label:     'In Progress',
    accent:    '#3b82f6',
    dot:       '#60a5fa',
    badgeBg:   '#172033',
    badgeText: '#93c5fd',
  },
  {
    id:        'in_review',
    label:     'In Review',
    accent:    '#f59e0b',
    dot:       '#fbbf24',
    badgeBg:   '#231c0e',
    badgeText: '#fcd34d',
  },
  {
    id:        'done',
    label:     'Done',
    accent:    '#22c55e',
    dot:       '#4ade80',
    badgeBg:   '#0e2318',
    badgeText: '#86efac',
  },
]

// ─── Priority config ──────────────────────────────────────────────────────────

export interface PriorityConfig {
  label:     string
  bg:        string
  text:      string
  dot:       string
}

export const PRIORITY_CONFIG: Record<TaskPriority, PriorityConfig> = {
  low: {
    label: 'Low',
    bg:    '#1c1c28',
    text:  '#94a3b8',
    dot:   '#64748b',
  },
  normal: {
    label: 'Normal',
    bg:    '#172033',
    text:  '#93c5fd',
    dot:   '#3b82f6',
  },
  high: {
    label: 'High',
    bg:    '#2a1520',
    text:  '#fca5a5',
    dot:   '#f87171',
  },
}

// ─── Team member avatar colors ────────────────────────────────────────────────

export const MEMBER_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
]
