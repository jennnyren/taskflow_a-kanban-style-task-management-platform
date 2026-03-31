import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useTeam } from '../../hooks/useTeam'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { MemberAvatar } from './MemberAvatar'
import { MEMBER_COLORS } from '../../lib/constants'
import type { TeamMember } from '../../lib/types'

// ─── Assigned tasks for a member ─────────────────────────────────────────────

interface AssignedTask {
  task_id: string
  tasks: { id: string; title: string; status: string } | null
}

function MemberTaskList({ member }: { member: TeamMember }) {
  const { user }                          = useAuth()
  const [rows, setRows]                   = useState<AssignedTask[]>([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    supabase
      .from('task_assignees')
      .select('task_id, tasks(id, title, status)')
      .eq('member_id', member.id)
      .eq('user_id', user.id)
      .then(({ data }) => {
        setRows((data ?? []) as unknown as AssignedTask[])
        setLoading(false)
      })
  }, [member.id, user.id])

  if (loading) return (
    <p className="text-[11px] py-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}>
      Loading…
    </p>
  )

  if (rows.length === 0) return (
    <p className="text-[11px] py-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}>
      No tasks assigned
    </p>
  )

  return (
    <ul className="flex flex-col gap-1 mt-1">
      {rows.map(row => {
        const task = row.tasks
        if (!task) return null
        return (
          <li
            key={row.task_id}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px]"
            style={{ backgroundColor: '#0e0e14', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#8080a0' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: member.color, opacity: 0.6 }}
            />
            {task.title}
            <span
              className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: '#1e1e2e', color: '#5a5a78', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {task.status.replace('_', ' ')}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

// ─── Member card ──────────────────────────────────────────────────────────────

function MemberCard({
  member,
  onRemove,
}: {
  member:   TeamMember
  onRemove: (id: string) => void
}) {
  const [expanded,      setExpanded]      = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [removing,      setRemoving]      = useState(false)

  function handleRemove() {
    setRemoving(true)
    onRemove(member.id)
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all"
      style={{ backgroundColor: '#13131c', borderColor: '#1e1e2e' }}
    >
      {/* Accent bar */}
      <div className="h-[3px]" style={{ backgroundColor: member.color, opacity: 0.7 }} />

      <div className="px-4 py-3.5">
        {/* Header row */}
        <div className="flex items-center gap-3">
          <MemberAvatar member={member} size="md" />

          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#ddddf0' }}
            >
              {member.name}
            </p>
          </div>

          <button
            onClick={() => setExpanded(e => !e)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            style={{ color: '#4a4a60' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1e1e2e'; e.currentTarget.style.color = '#9090b0' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4a4a60' }}
            title={expanded ? 'Collapse' : 'Show assigned tasks'}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Expanded: assigned tasks */}
        {expanded && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: '#1e1e2e' }}>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#4a4a60', letterSpacing: '0.1em' }}
            >
              Assigned tasks
            </p>
            <MemberTaskList member={member} />
          </div>
        )}

        {/* Delete row */}
        <div className="mt-3 pt-3 border-t" style={{ borderColor: '#1e1e2e' }}>
          {confirmDelete ? (
            <div className="flex flex-col gap-1.5">
              <p
                className="text-[11px] text-center"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#fca5a5' }}
              >
                Remove from all tasks too?
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#1e1e2e', color: '#8080a0' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#252535' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1e1e2e' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#2a1520', color: '#f87171', opacity: removing ? 0.6 : 1 }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#3a1a28' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#2a1520' }}
                >
                  {removing ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#5a3040', backgroundColor: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2a1520'; e.currentTarget.style.color = '#f87171' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5a3040' }}
            >
              <Trash2 size={11} />
              Remove member
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Add member form ──────────────────────────────────────────────────────────

function AddMemberForm({ onAdd }: { onAdd: (name: string, color: string) => Promise<void> }) {
  const [name,      setName]      = useState('')
  const [color,     setColor]     = useState(MEMBER_COLORS[0])
  const [saving,    setSaving]    = useState(false)
  const [nameError, setNameError] = useState(false)
  const inputRef                  = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setNameError(true); inputRef.current?.focus(); return }
    setNameError(false)
    setSaving(true)
    await onAdd(trimmed, color)
    setName('')
    setColor(MEMBER_COLORS[0])
    setSaving(false)
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-4 flex flex-col gap-3"
      style={{ backgroundColor: '#13131c', borderColor: '#252535' }}
    >
      <p
        className="text-xs font-semibold"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#a0a0b8' }}
      >
        Add member
      </p>

      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          value={name}
          onChange={e => { setName(e.target.value); if (nameError) setNameError(false) }}
          placeholder="Name…"
          disabled={saving}
          className="w-full rounded-lg px-3 py-2 text-sm border outline-none"
          style={{
            fontFamily:      "'Plus Jakarta Sans', sans-serif",
            backgroundColor: '#0e0e14',
            borderColor:     nameError ? '#f87171' : '#252535',
            color:           '#ddddf0',
          }}
          onFocus={e  => { e.currentTarget.style.borderColor = nameError ? '#f87171' : '#6366f1' }}
          onBlur={e   => { e.currentTarget.style.borderColor = nameError ? '#f87171' : '#252535' }}
        />
        {nameError && (
          <p className="text-[11px]" style={{ color: '#f87171', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Name is required
          </p>
        )}
      </div>

      {/* Color swatches */}
      <div className="flex gap-2 flex-wrap">
        {MEMBER_COLORS.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className="w-6 h-6 rounded-full cursor-pointer transition-transform"
            style={{
              backgroundColor: c,
              outline:         color === c ? `2px solid ${c}` : 'none',
              outlineOffset:   2,
              transform:       color === c ? 'scale(1.15)' : 'scale(1)',
            }}
            title={c}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-opacity"
        style={{
          fontFamily:      "'Space Grotesk', sans-serif",
          backgroundColor: color,
          color:           '#fff',
          opacity:         saving || !name.trim() ? 0.5 : 1,
        }}
      >
        <Plus size={14} />
        {saving ? 'Adding…' : 'Add member'}
      </button>
    </form>
  )
}

// ─── Team page ────────────────────────────────────────────────────────────────

export function TeamPage() {
  const { members, loading, error, addMember, removeMember } = useTeam()

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ backgroundColor: '#0e0e14' }}
    >
      <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col gap-6">

        {/* Page header */}
        <div>
          <h1
            className="text-lg font-bold mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e8e8f8' }}
          >
            Team
          </h1>
          <p
            className="text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#5a5a78' }}
          >
            Add members and assign them to tasks on the board.
          </p>
        </div>

        {/* Add form */}
        <AddMemberForm onAdd={async (name, color) => { await addMember(name, color) }} />

        {/* Member list */}
        {loading ? (
          <p className="text-sm text-center py-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}>
            Loading…
          </p>
        ) : error ? (
          <p className="text-sm text-center py-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#fca5a5' }}>
            {error}
          </p>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
              style={{ backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              👥
            </div>
            <p
              className="text-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}
            >
              No members yet — add one above.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {members.map(m => (
              <MemberCard key={m.id} member={m} onRemove={removeMember} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
