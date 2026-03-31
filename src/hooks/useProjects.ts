import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { Project, ProjectWithCount } from '../lib/types'

export interface UseProjects {
  projects:      ProjectWithCount[]
  loading:       boolean
  error:         string | null
  createProject: (fields: Pick<Project, 'name' | 'color'> & Partial<Pick<Project, 'description' | 'icon'>>) => Promise<Project | null>
  updateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'description' | 'color' | 'icon'>>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

export function useProjects(): UseProjects {
  const { user }                  = useAuth()
  const { toast }                 = useToast()
  const [projects, setProjects]   = useState<ProjectWithCount[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('projects')
      .select('*, tasks(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const enriched: ProjectWithCount[] = (data ?? []).map((row: any) => ({
      id:          row.id,
      name:        row.name,
      description: row.description,
      color:       row.color,
      icon:        row.icon,
      user_id:     row.user_id,
      created_at:  row.created_at,
      updated_at:  row.updated_at,
      task_count:  Array.isArray(row.tasks) ? (row.tasks[0]?.count ?? 0) : 0,
    }))

    setProjects(enriched)
    setLoading(false)
  }, [user.id])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  // ─── Create ───────────────────────────────────────────────────────────────

  const createProject = useCallback(async (
    fields: Pick<Project, 'name' | 'color'> & Partial<Pick<Project, 'description' | 'icon'>>,
  ): Promise<Project | null> => {
    const { data, error: insertError } = await supabase
      .from('projects')
      .insert({ ...fields, user_id: user.id })
      .select()
      .single()

    if (insertError || !data) {
      toast('Failed to create project — please try again', 'error')
      setError(insertError?.message ?? 'Failed to create project')
      return null
    }

    setProjects(prev => [...prev, { ...data, task_count: 0 }])
    toast('Project created', 'success')
    return data
  }, [user.id, toast])

  // ─── Update ───────────────────────────────────────────────────────────────

  const updateProject = useCallback(async (
    id:      string,
    updates: Partial<Pick<Project, 'name' | 'description' | 'color' | 'icon'>>,
  ): Promise<void> => {
    const { data, error: updateError } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      toast('Failed to update project — please try again', 'error')
      setError(updateError.message)
      return
    }

    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  }, [user.id, toast])

  // ─── Delete ───────────────────────────────────────────────────────────────

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      toast('Failed to delete project — please try again', 'error')
      setError(deleteError.message)
      return
    }

    setProjects(prev => prev.filter(p => p.id !== id))
  }, [user.id, toast])

  return { projects, loading, error, createProject, updateProject, deleteProject }
}
