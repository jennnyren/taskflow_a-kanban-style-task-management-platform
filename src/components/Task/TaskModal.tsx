import { useEffect, useRef, useState } from 'react'
import { X, Trash2, Calendar, ChevronDown } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Modal } from '../UI/Modal'
import { COLUMNS, PRIORITY_CONFIG } from '../../lib/constants'
import type { Task, TaskStatus, TaskPriority } from '../../lib/types'
import type { UseTasks } from '../../hooks/useTasks'

interface TaskModalProps {
  task:         Task
  updateTask:   UseTasks['updateTask']
  deleteTask:   UseTasks['deleteTask']
  logActivity:  UseTasks['logActivity']
  onClose:      () => void
}

// ─── Auto-resize textarea hook ────────────────────────────────────────────────

function useAutoResize(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])
  return ref
}

// ─── Status selector ──────────────────────────────────────────────────────────

function StatusSelector({
  value,
  onChange,
}: {
  value:    TaskStatus
  onChange: (s: TaskStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const col = COLUMNS.find(c => c.id === value)!
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer"
        style={{ backgroundColor: '#0e0e14', borderColor: '#252535', color: '#c0c0d8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#3a3a50' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = '#252535' }}
      >
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.dot }} />
        <span className="flex-1 text-left" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{col.label}</span>
        <ChevronDown size={12} style={{ color: '#5a5a78', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-full rounded-xl border py-1 z-10"
          style={{ backgroundColor: '#1a1a26', borderColor: '#252535', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
        >
          {COLUMNS.map(c => (
            <button
              key={c.id}
              onClick={() => { onChange(c.id); setOpen(false) }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs transition-colors cursor-pointer"
              style={{
                color:           c.id === value ? '#a5b4fc' : '#8080a0',
                backgroundColor: c.id === value ? 'rgba(99,102,241,0.1)' : 'transparent',
                fontFamily:      "'Space Grotesk', sans-serif",
              }}
              onMouseEnter={e => { if (c.id !== value) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (c.id !== value) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Priority selector ────────────────────────────────────────────────────────

function PrioritySelector({
  value,
  onChange,
}: {
  value:    TaskPriority
  onChange: (p: TaskPriority) => void
}) {
  const priorities: TaskPriority[] = ['low', 'normal', 'high']
  return (
    <div className="flex gap-1">
      {priorities.map(p => {
        const cfg     = PRIORITY_CONFIG[p]
        const active  = p === value
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
            style={{
              fontFamily:      "'Space Grotesk', sans-serif",
              backgroundColor: active ? cfg.bg : '#0e0e14',
              color:           active ? cfg.text : '#4a4a60',
              border:          `1px solid ${active ? cfg.dot + '55' : '#252535'}`,
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = '#1a1a28'; e.currentTarget.style.color = '#7a7a98' } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = '#0e0e14'; e.currentTarget.style.color = '#4a4a60' } }}
          >
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Sidebar meta row ─────────────────────────────────────────────────────────

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#4a4a60', letterSpacing: '0.1em' }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

// ─── Placeholder section ──────────────────────────────────────────────────────

function PlaceholderSection({ label, phase }: { label: string; phase: number }) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-xs font-semibold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#5a5a78' }}
        >
          {label}
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: '#1e1e2e' }} />
        <span
          className="text-[9px] px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: '#1a1a28', color: '#3a3a50', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Phase {phase}
        </span>
      </div>
      <div
        className="rounded-xl px-3 py-4 text-center"
        style={{ backgroundColor: '#0e0e14', border: '1px dashed #1e1e2e' }}
      >
        <p
          className="text-[11px]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#3a3a50' }}
        >
          Coming in Phase {phase}
        </p>
      </div>
    </div>
  )
}

// ─── Task modal ───────────────────────────────────────────────────────────────

export function TaskModal({ task, updateTask, deleteTask, logActivity, onClose }: TaskModalProps) {
  const [title, setTitle]           = useState(task.title)
  const [description, setDesc]      = useState(task.description ?? '')
  const [confirmDelete, setConfirm] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const descRef = useAutoResize(description)

  // Keep local state in sync if the task prop changes (e.g. drag-to-move)
  useEffect(() => { setTitle(task.title) },             [task.title])
  useEffect(() => { setDesc(task.description ?? '') },  [task.description])

  // ── Field savers ──────────────────────────────────────────────────────────

  function saveTitle() {
    const trimmed = title.trim()
    if (!trimmed || trimmed === task.title) return
    updateTask(task.id, { title: trimmed })
    logActivity(task.id, 'title_edit', { from: task.title, to: trimmed })
  }

  function saveDescription() {
    const trimmed = description.trim()
    const prev    = task.description ?? ''
    if (trimmed === prev) return
    updateTask(task.id, { description: trimmed || null })
    logActivity(task.id, 'description_edit', { from: prev, to: trimmed })
  }

  function changeStatus(newStatus: TaskStatus) {
    if (newStatus === task.status) return
    updateTask(task.id, { status: newStatus })
    logActivity(task.id, 'status_change', { from: task.status, to: newStatus })
  }

  function changePriority(newPriority: TaskPriority) {
    if (newPriority === task.priority) return
    updateTask(task.id, { priority: newPriority })
    logActivity(task.id, 'priority_change', { from: task.priority, to: newPriority })
  }

  function changeDueDate(raw: string) {
    const value = raw || null
    updateTask(task.id, { due_date: value })
    logActivity(task.id, 'due_date_change', { from: task.due_date, to: value })
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteTask(task.id)
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-4 shrink-0 border-b"
        style={{ borderColor: '#1e1e2e' }}
      >
        {/* Status pill in header */}
        {(() => {
          const col = COLUMNS.find(c => c.id === task.status)!
          return (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-lg"
              style={{ fontFamily: "'Space Grotesk', sans-serif", backgroundColor: col.badgeBg, color: col.badgeText }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.dot }} />
              {col.label}
            </span>
          )
        })()}

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ml-auto"
          style={{ color: '#5a5a78' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1e1e2e'; e.currentTarget.style.color = '#9090b0' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5a5a78' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

        {/* Left: main content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-w-0">

          {/* Title */}
          <textarea
            rows={1}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLTextAreaElement).blur() } }}
            className="w-full bg-transparent resize-none outline-none leading-snug font-semibold mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color:      '#e8e8f8',
              fontSize:   22,
              lineHeight: 1.3,
            }}
            placeholder="Task title"
          />

          {/* Description */}
          <textarea
            ref={descRef}
            value={description}
            onChange={e => setDesc(e.target.value)}
            placeholder="Add a description…"
            className="w-full bg-transparent resize-none outline-none text-sm leading-relaxed"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color:      '#8080a0',
              minHeight:  80,
            }}
            onFocus={e => { e.currentTarget.style.color = '#c0c0d8' }}
            onBlur={e  => {
              e.currentTarget.style.color = '#8080a0'
              saveDescription()
            }}
          />

          {/* Placeholder sections */}
          <PlaceholderSection label="Comments" phase={9} />
          <PlaceholderSection label="Activity" phase={10} />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px shrink-0" style={{ backgroundColor: '#1e1e2e' }} />
        <div className="md:hidden h-px shrink-0 mx-6" style={{ backgroundColor: '#1e1e2e' }} />

        {/* Right: metadata sidebar */}
        <div
          className="w-full md:w-[220px] shrink-0 overflow-y-auto px-4 py-5 flex flex-col gap-4"
          style={{ backgroundColor: '#13131c' }}
        >

          <MetaRow label="Status">
            <StatusSelector value={task.status} onChange={changeStatus} />
          </MetaRow>

          <MetaRow label="Priority">
            <PrioritySelector value={task.priority} onChange={changePriority} />
          </MetaRow>

          <MetaRow label="Due date">
            <div className="relative">
              <input
                type="date"
                value={task.due_date ?? ''}
                onChange={e => changeDueDate(e.target.value)}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs border outline-none cursor-pointer"
                style={{
                  fontFamily:      "'Plus Jakarta Sans', sans-serif",
                  backgroundColor: '#0e0e14',
                  borderColor:     '#252535',
                  color:           task.due_date ? '#c0c0d8' : '#4a4a60',
                  colorScheme:     'dark',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#6366f1' }}
                onBlur={e  => { e.currentTarget.style.borderColor = '#252535' }}
              />
              {!task.due_date && (
                <Calendar size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#3a3a50' }} />
              )}
            </div>
          </MetaRow>

          {/* Assignees placeholder (Phase 7) */}
          <MetaRow label="Assignees">
            <div
              className="rounded-lg px-2.5 py-2 text-[11px] border border-dashed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#3a3a50', borderColor: '#1e1e2e', backgroundColor: '#0e0e14' }}
            >
              Coming in Phase 7
            </div>
          </MetaRow>

          {/* Labels placeholder (Phase 8) */}
          <MetaRow label="Labels">
            <div
              className="rounded-lg px-2.5 py-2 text-[11px] border border-dashed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#3a3a50', borderColor: '#1e1e2e', backgroundColor: '#0e0e14' }}
            >
              Coming in Phase 8
            </div>
          </MetaRow>

          {/* Spacer pushes footer to bottom */}
          <div className="flex-1" />

          {/* Footer: created date + delete */}
          <div className="flex flex-col gap-3 pt-3 border-t" style={{ borderColor: '#1e1e2e' }}>
            <p
              className="text-[10px] leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#3a3a50' }}
            >
              Created {format(parseISO(task.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>

            {confirmDelete ? (
              <div className="flex flex-col gap-1.5">
                <p
                  className="text-[11px] text-center"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#fca5a5' }}
                >
                  Delete this task?
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setConfirm(false)}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#1e1e2e', color: '#8080a0' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#252535' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1e1e2e' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#2a1520', color: '#f87171', opacity: deleting ? 0.6 : 1 }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#3a1a28' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#2a1520' }}
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirm(true)}
                className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors w-full cursor-pointer"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#5a3040', backgroundColor: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2a1520'; e.currentTarget.style.color = '#f87171' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5a3040' }}
              >
                <Trash2 size={11} />
                Delete task
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
