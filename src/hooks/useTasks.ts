import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Task, TaskStatus, TaskPriority } from '../lib/types'

export interface UseTasks {
  tasks:      Task[]
  loading:    boolean
  error:      string | null
  createTask: (title: string, status: TaskStatus, priority?: TaskPriority) => Promise<Task | null>
  updateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'position'>>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  refetch:    () => Promise<void>
}

export function useTasks(): UseTasks {
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
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTasks(data ?? [])
    }
    setLoading(false)
  }, [user.id])

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
      .insert({ title: title.trim(), status, priority, position, user_id: user.id })
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
  }, [tasks, user.id])

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

  return { tasks, loading, error, createTask, updateTask, deleteTask, refetch: fetchTasks }
}
