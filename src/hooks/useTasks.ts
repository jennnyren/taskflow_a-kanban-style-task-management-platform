import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { TaskWithRelations, TeamMember, Label, TaskStatus, TaskPriority } from '../lib/types'

export interface UseTasks {
  tasks:          TaskWithRelations[]
  loading:        boolean
  error:          string | null
  createTask:     (title: string, status: TaskStatus, priority?: TaskPriority) => Promise<TaskWithRelations | null>
  updateTask:     (id: string, updates: Partial<Pick<TaskWithRelations, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'position'>>) => Promise<void>
  moveTask:       (id: string, newStatus: TaskStatus) => Promise<void>
  deleteTask:     (id: string) => Promise<void>
  toggleAssignee: (taskId: string, member: TeamMember) => Promise<void>
  toggleLabel:    (taskId: string, label: Label) => Promise<void>
  logActivity:    (taskId: string, action: string, details: Record<string, unknown>) => void
  refetch:        () => Promise<void>
}

const TASK_SELECT = '*, task_assignees(member_id, team_members(id, name, color, user_id, created_at)), task_labels(label_id, labels(id, name, color, user_id, created_at)), comments(count)'

function toTaskWithRelations(row: any): TaskWithRelations {
  return {
    ...row,
    assignees:     (row.task_assignees ?? []).map((ta: any) => ta.team_members).filter(Boolean),
    labels:        (row.task_labels ?? []).map((tl: any) => tl.labels).filter(Boolean),
    comment_count: row.comments?.[0]?.count ?? 0,
  }
}

function log(taskId: string, userId: string, action: string, details: Record<string, unknown>) {
  supabase.from('activity_log').insert({ task_id: taskId, action, details, user_id: userId })
}

export function useTasks(projectId: string): UseTasks {
  const { user }              = useAuth()
  const { toast }             = useToast()
  const [tasks, setTasks]     = useState<TaskWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select(TASK_SELECT)
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTasks((data ?? []).map(toTaskWithRelations))
    }
    setLoading(false)
  }, [user.id, projectId])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // ─── Create ───────────────────────────────────────────────────────────────

  const createTask = useCallback(async (
    title:    string,
    status:   TaskStatus,
    priority: TaskPriority = 'normal',
  ): Promise<TaskWithRelations | null> => {
    const position = tasks.filter(t => t.status === status).length

    const { data, error: insertError } = await supabase
      .from('tasks')
      .insert({ title: title.trim(), status, priority, position, project_id: projectId, user_id: user.id })
      .select(TASK_SELECT)
      .single()

    if (insertError || !data) {
      toast('Failed to create task — please try again', 'error')
      setError(insertError?.message ?? 'Failed to create task')
      return null
    }

    const task = toTaskWithRelations(data)
    setTasks(prev => [...prev, task])
    log(task.id, user.id, 'created', { title: task.title, status: task.status })
    toast('Task created', 'success')
    return task
  }, [tasks, user.id, projectId, toast])

  // ─── Update ───────────────────────────────────────────────────────────────

  const updateTask = useCallback(async (
    id:      string,
    updates: Partial<Pick<TaskWithRelations, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'position'>>,
  ): Promise<void> => {
    const oldTask = tasks.find(t => t.id === id)

    const { data, error: updateError } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      toast('Failed to save — please try again', 'error')
      setError(updateError.message)
      return
    }

    // Merge scalar fields, preserve relations
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
    toast('Task updated', 'success')

    // Log each changed field
    if (oldTask) {
      if ('title' in updates && updates.title !== oldTask.title) {
        log(id, user.id, 'title_edit', { from: oldTask.title, to: updates.title })
      }
      if ('description' in updates && updates.description !== oldTask.description) {
        log(id, user.id, 'description_edit', { from: oldTask.description, to: updates.description })
      }
      if ('status' in updates && updates.status !== oldTask.status) {
        log(id, user.id, 'status_change', { from: oldTask.status, to: updates.status })
      }
      if ('priority' in updates && updates.priority !== oldTask.priority) {
        log(id, user.id, 'priority_change', { from: oldTask.priority, to: updates.priority })
      }
      if ('due_date' in updates && updates.due_date !== oldTask.due_date) {
        log(id, user.id, 'due_date_change', { from: oldTask.due_date, to: updates.due_date })
      }
    }
  }, [tasks, user.id, toast])

  // ─── Delete ───────────────────────────────────────────────────────────────

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    const task = tasks.find(t => t.id === id)

    if (task) {
      log(id, user.id, 'deleted', { title: task.title })
    }

    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      toast('Failed to delete task — please try again', 'error')
      setError(deleteError.message)
      return
    }

    setTasks(prev => prev.filter(t => t.id !== id))
    toast('Task deleted', 'success')
  }, [tasks, user.id, toast])

  // ─── Move (drag & drop status change) ────────────────────────────────────

  const moveTask = useCallback(async (id: string, newStatus: TaskStatus): Promise<void> => {
    const task = tasks.find(t => t.id === id)
    if (!task || task.status === newStatus) return

    const oldStatus = task.status

    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))

    const { error: updateError } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: oldStatus } : t))
      toast('Failed to move task — please try again', 'error')
      setError(updateError.message)
      return
    }

    log(id, user.id, 'status_change', { from: oldStatus, to: newStatus })
  }, [tasks, user.id, toast])

  // ─── Toggle assignee ──────────────────────────────────────────────────────

  const toggleAssignee = useCallback(async (taskId: string, member: TeamMember): Promise<void> => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const isAssigned = task.assignees.some(a => a.id === member.id)

    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return {
        ...t,
        assignees: isAssigned
          ? t.assignees.filter(a => a.id !== member.id)
          : [...t.assignees, member],
      }
    }))

    if (isAssigned) {
      const { error } = await supabase
        .from('task_assignees')
        .delete()
        .eq('task_id', taskId)
        .eq('member_id', member.id)
        .eq('user_id', user.id)

      if (error) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignees: task.assignees } : t))
        toast('Failed to update assignee — please try again', 'error')
        setError(error.message)
        return
      }
    } else {
      const { error } = await supabase
        .from('task_assignees')
        .insert({ task_id: taskId, member_id: member.id, user_id: user.id })

      if (error) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignees: task.assignees } : t))
        toast('Failed to update assignee — please try again', 'error')
        setError(error.message)
        return
      }
    }

    log(taskId, user.id,
      isAssigned ? 'assignee_removed' : 'assignee_added',
      { member_id: member.id, name: member.name },
    )
  }, [tasks, user.id, toast])

  // ─── Toggle label ─────────────────────────────────────────────────────────

  const toggleLabel = useCallback(async (taskId: string, label: Label): Promise<void> => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const isApplied = task.labels.some(l => l.id === label.id)

    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return {
        ...t,
        labels: isApplied
          ? t.labels.filter(l => l.id !== label.id)
          : [...t.labels, label],
      }
    }))

    if (isApplied) {
      const { error } = await supabase
        .from('task_labels')
        .delete()
        .eq('task_id', taskId)
        .eq('label_id', label.id)
        .eq('user_id', user.id)

      if (error) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, labels: task.labels } : t))
        toast('Failed to update label — please try again', 'error')
        setError(error.message)
        return
      }
    } else {
      const { error } = await supabase
        .from('task_labels')
        .insert({ task_id: taskId, label_id: label.id, user_id: user.id })

      if (error) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, labels: task.labels } : t))
        toast('Failed to update label — please try again', 'error')
        setError(error.message)
        return
      }
    }

    log(taskId, user.id,
      isApplied ? 'label_removed' : 'label_added',
      { label_id: label.id, name: label.name },
    )
  }, [tasks, user.id, toast])

  // ─── logActivity — kept for external callers ──────────────────────────────

  const logActivity = useCallback((
    taskId:  string,
    action:  string,
    details: Record<string, unknown>,
  ): void => {
    log(taskId, user.id, action, details)
  }, [user.id])

  return { tasks, loading, error, createTask, updateTask, moveTask, deleteTask, toggleAssignee, toggleLabel, logActivity, refetch: fetchTasks }
}
