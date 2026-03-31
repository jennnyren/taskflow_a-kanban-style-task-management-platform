import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { Label } from '../lib/types'

export interface LabelWithCount extends Label {
  task_count: number
}

export interface UseLabels {
  labels:      LabelWithCount[]
  loading:     boolean
  error:       string | null
  createLabel: (name: string, color: string) => Promise<Label | null>
  deleteLabel: (id: string) => Promise<void>
}

export function useLabels(): UseLabels {
  const { user }                = useAuth()
  const { toast }               = useToast()
  const [labels, setLabels]     = useState<LabelWithCount[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const fetchLabels = useCallback(async () => {
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('labels')
      .select('*, task_labels(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      const transformed: LabelWithCount[] = (data ?? []).map((row: any) => ({
        ...row,
        task_count: row.task_labels?.[0]?.count ?? 0,
      }))
      setLabels(transformed)
    }
    setLoading(false)
  }, [user.id])

  useEffect(() => { fetchLabels() }, [fetchLabels])

  const createLabel = useCallback(async (name: string, color: string): Promise<Label | null> => {
    const { data, error: insertError } = await supabase
      .from('labels')
      .insert({ name: name.trim(), color, user_id: user.id })
      .select()
      .single()

    if (insertError || !data) {
      toast('Failed to create label — please try again', 'error')
      setError(insertError?.message ?? 'Failed to create label')
      return null
    }

    setLabels(prev => [...prev, { ...data, task_count: 0 }])
    toast(`Label "${name.trim()}" created`, 'success')
    return data
  }, [user.id, toast])

  const deleteLabel = useCallback(async (id: string): Promise<void> => {
    const { error: deleteError } = await supabase
      .from('labels')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      toast('Failed to delete label — please try again', 'error')
      setError(deleteError.message)
      return
    }

    setLabels(prev => prev.filter(l => l.id !== id))
  }, [user.id, toast])

  return { labels, loading, error, createLabel, deleteLabel }
}
