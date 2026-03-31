import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { ActivityEntry } from '../lib/types'

// ─── Enriched type for global feed ───────────────────────────────────────────

export interface ActivityEntryWithTask extends ActivityEntry {
  tasks: {
    id:         string
    title:      string
    project_id: string
    projects:   { id: string; name: string; color: string; icon: string | null } | null
  } | null
}

// ─── Human-readable descriptions ─────────────────────────────────────────────

const STATUS_NAMES: Record<string, string> = {
  todo:        'To Do',
  in_progress: 'In Progress',
  in_review:   'In Review',
  done:        'Done',
}

const PRIORITY_NAMES: Record<string, string> = {
  low:    'Low',
  normal: 'Normal',
  high:   'High',
}

export function describeActivity(action: string, details: any): string {
  switch (action) {
    case 'created':
      return 'Created this task'
    case 'status_change':
      return `Moved to ${STATUS_NAMES[details?.to] ?? details?.to}`
    case 'title_edit':
      return `Renamed to "${details?.to}"`
    case 'description_edit':
      return 'Updated the description'
    case 'priority_change':
      return `Changed priority to ${PRIORITY_NAMES[details?.to] ?? details?.to}`
    case 'due_date_change':
      return details?.to ? `Set due date to ${details.to}` : 'Cleared the due date'
    case 'assignee_added':
      return `Assigned ${details?.name ?? 'someone'}`
    case 'assignee_removed':
      return `Unassigned ${details?.name ?? 'someone'}`
    case 'label_added':
      return `Added label "${details?.name ?? ''}"`
    case 'label_removed':
      return `Removed label "${details?.name ?? ''}"`
    case 'comment_added':
      return 'Added a comment'
    default:
      return action.replace(/_/g, ' ')
  }
}

// ─── Per-task activity (inside TaskModal) ─────────────────────────────────────

export function useTaskActivity(taskId: string) {
  const { user }                    = useAuth()
  const [entries, setEntries]       = useState<ActivityEntry[]>([])
  const [loading, setLoading]       = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setEntries(data ?? [])
    setLoading(false)
  }, [taskId, user.id])

  useEffect(() => { fetch() }, [fetch])

  return { entries, loading, refetch: fetch }
}

// ─── All activity across all tasks (ActivityPage) ─────────────────────────────

export function useAllActivity() {
  const { user }                    = useAuth()
  const [entries, setEntries]       = useState<ActivityEntryWithTask[]>([])
  const [loading, setLoading]       = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('activity_log')
      .select('*, tasks(id, title, project_id, projects(id, name, color, icon))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200)
    setEntries((data ?? []) as ActivityEntryWithTask[])
    setLoading(false)
  }, [user.id])

  useEffect(() => { fetch() }, [fetch])

  return { entries, loading, refetch: fetch }
}
