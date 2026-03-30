import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Task, TaskStatus, TaskPriority } from '../lib/types'

export interface UseTasks {
  tasks:        Task[]
  loading:      boolean
  error:        string | null
  createTask:   (title: string, status: TaskStatus, priority?: TaskPriority) => Promise<Task | null>
  updateTask:   (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'position'>>) => Promise<void>
  moveTask:     (id: string, newStatus: TaskStatus) => Promise<void>
  deleteTask:   (id: string) => Promise<void>
  logActivity:  (taskId: string, action: string, details: Record<string, unknown>) => void
  refetch:      () => Promise<void>
}

export function useTasks(projectId: string): UseTasks {
  const { user }              = useAuth()
  const [tasks, setTasks]     = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTasks(data ?? [])
    }
    setLoading(false)
  }, [user.id, projectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // ─── Create ───────────────────────────────────────────────────────────────

  const createTask = useCallback(async (
    title:    string,
    status:   TaskStatus,
    priority: TaskPriority = 'normal',
  ): Promise<Task | null> => {
    const position = tasks.filter(t => t.status === status).length

    const { data, error: insertError } = await supabase
      .from('tasks')
      .insert({ title: title.trim(), status, priority, position, project_id: projectId, user_id: user.id })
      .select()
      .single()

    if (insertError || !data) {
      setError(insertError?.message ?? 'Failed to create task')
      return null
    }

    setTasks(prev => [...prev, data])

    // Activity log — fire-and-forget
    supabase.from('activity_log').insert({
      task_id: data.id,
      action:  'created',
      details: { title: data.title, status: data.status },
      user_id: user.id,
    })

    return data
  }, [tasks, user.id, projectId])

  // ─── Update ───────────────────────────────────────────────────────────────

  const updateTask = useCallback(async (
    id:      string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'position'>>,
  ): Promise<void> => {
    const { data, error: updateError } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return
    }

    setTasks(prev => prev.map(t => t.id === id ? data : t))
  }, [user.id])

  // ─── Delete ───────────────────────────────────────────────────────────────

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setTasks(prev => prev.filter(t => t.id !== id))
  }, [user.id])

  // ─── Move (drag & drop status change) ────────────────────────────────────

  const moveTask = useCallback(async (id: string, newStatus: TaskStatus): Promise<void> => {
    const task = tasks.find(t => t.id === id)
    if (!task || task.status === newStatus) return

    const oldStatus = task.status

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))

    const { error: updateError } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      // Rollback
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: oldStatus } : t))
      setError(updateError.message)
      return
    }

    // Activity log — fire-and-forget
    supabase.from('activity_log').insert({
      task_id: id,
      action:  'status_change',
      details: { from: oldStatus, to: newStatus },
      user_id: user.id,
    })
  }, [tasks, user.id])

  // ─── Log activity (called by modal for field-level changes) ──────────────

  const logActivity = useCallback((
    taskId:  string,
    action:  string,
    details: Record<string, unknown>,
  ): void => {
    supabase.from('activity_log').insert({ task_id: taskId, action, details, user_id: user.id })
  }, [user.id])

  return { tasks, loading, error, createTask, updateTask, moveTask, deleteTask, logActivity, refetch: fetchTasks }
}
