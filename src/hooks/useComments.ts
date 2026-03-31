import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { Comment } from '../lib/types'

// ─── Enriched comment for global feed ────────────────────────────────────────

export interface CommentWithTask extends Comment {
  tasks: {
    id:         string
    title:      string
    project_id: string
    projects:   { id: string; name: string; color: string; icon: string | null } | null
  } | null
}

// ─── Per-task comments (used by CommentList inside TaskModal) ─────────────────

export function useTaskComments(taskId: string) {
  const { user }                = useAuth()
  const { toast }               = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading]   = useState(true)

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    setComments(data ?? [])
    setLoading(false)
  }, [taskId, user.id])

  useEffect(() => { fetchComments() }, [fetchComments])

  const addComment = useCallback(async (content: string): Promise<Comment | null> => {
    const { data, error } = await supabase
      .from('comments')
      .insert({ task_id: taskId, content: content.trim(), user_id: user.id })
      .select()
      .single()

    if (error || !data) {
      toast('Failed to post comment — please try again', 'error')
      return null
    }
    setComments(prev => [...prev, data])

    // Log activity — fire-and-forget
    supabase.from('activity_log').insert({
      task_id: taskId,
      action:  'comment_added',
      details: { content: content.trim() },
      user_id: user.id,
    })

    return data
  }, [taskId, user.id, toast])

  const deleteComment = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      toast('Failed to delete comment — please try again', 'error')
      return
    }
    setComments(prev => prev.filter(c => c.id !== id))
  }, [user.id, toast])

  return { comments, loading, addComment, deleteComment }
}

// ─── All comments across all tasks (used by CommentsPage) ────────────────────

export function useAllComments() {
  const { user }                = useAuth()
  const { toast }               = useToast()
  const [comments, setComments] = useState<CommentWithTask[]>([])
  const [loading, setLoading]   = useState(true)

  const fetchAll = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, tasks(id, title, project_id, projects(id, name, color, icon))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setComments((data ?? []) as CommentWithTask[])
    setLoading(false)
  }, [user.id])

  useEffect(() => { fetchAll() }, [fetchAll])

  const deleteComment = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      toast('Failed to delete comment — please try again', 'error')
      return
    }
    setComments(prev => prev.filter(c => c.id !== id))
  }, [user.id, toast])

  return { comments, loading, deleteComment, refetch: fetchAll }
}
