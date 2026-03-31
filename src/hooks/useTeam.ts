import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { TeamMember } from '../lib/types'

export interface UseTeam {
  members:      TeamMember[]
  loading:      boolean
  error:        string | null
  addMember:    (name: string, color: string) => Promise<TeamMember | null>
  removeMember: (id: string) => Promise<void>
}

export function useTeam(): UseTeam {
  const { user }                = useAuth()
  const { toast }               = useToast()
  const [members, setMembers]   = useState<TeamMember[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setMembers(data ?? [])
    }
    setLoading(false)
  }, [user.id])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const addMember = useCallback(async (name: string, color: string): Promise<TeamMember | null> => {
    const { data, error: insertError } = await supabase
      .from('team_members')
      .insert({ name: name.trim(), color, user_id: user.id })
      .select()
      .single()

    if (insertError || !data) {
      toast('Failed to add member — please try again', 'error')
      setError(insertError?.message ?? 'Failed to add member')
      return null
    }

    setMembers(prev => [...prev, data])
    toast(`${name.trim()} added to team`, 'success')
    return data
  }, [user.id, toast])

  const removeMember = useCallback(async (id: string): Promise<void> => {
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      toast('Failed to remove member — please try again', 'error')
      setError(deleteError.message)
      return
    }

    setMembers(prev => prev.filter(m => m.id !== id))
  }, [user.id, toast])

  return { members, loading, error, addMember, removeMember }
}
