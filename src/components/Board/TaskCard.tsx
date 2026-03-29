import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns'
import { CalendarDays, AlertCircle } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { PRIORITY_CONFIG } from '../../lib/constants'
import type { Task } from '../../lib/types'

// ─── Shared card internals ────────────────────────────────────────────────────

function DueDateBadge({ dateStr }: { dateStr: string }) {
  const date    = parseISO(dateStr)
  const overdue = isPast(date) && !isToday(date)
  const today   = isToday(date)
  const soon    = isTomorrow(date)

  const label = today   ? 'Today'
              : soon    ? 'Tomorrow'
              : format(date, 'MMM d')

  const color = overdue ? { text: '#fca5a5', bg: '#2a1520', icon: '#f87171' }
              : today   ? { text: '#fcd34d', bg: '#231c0e', icon: '#fbbf24' }
              : soon    ? { text: '#86efac', bg: '#0e2318', icon: '#4ade80' }
              :           { text: '#94a3b8', bg: '#1c1c28', icon: '#64748b' }

  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
      style={{ color: color.text, backgroundColor: color.bg }}
    >
      {overdue
        ? <AlertCircle size={9} style={{ color: color.icon }} />
        : <CalendarDays size={9} style={{ color: color.icon }} />
      }
      {label}
    </span>
  )
}

function CardBody({ task }: { task: Task }) {
  const priority = PRIORITY_CONFIG[task.priority]
  return (
    <>
      <p
        className="text-sm font-medium leading-snug mb-2.5"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#ddddf0' }}
      >
        {task.title}
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: priority.text, backgroundColor: priority.bg }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: priority.dot }} />
          {priority.label}
        </span>
        {task.due_date && <DueDateBadge dateStr={task.due_date} />}
        {/* Spacer — assignees + labels slot in here (Phase 7 & 8) */}
        <div className="flex-1" />
      </div>
    </>
  )
}

// ─── Drag overlay card (lifted, rotated) ──────────────────────────────────────

export function DragOverlayCard({ task }: { task: Task }) {
  return (
    <div
      className="rounded-xl p-3.5 border"
      style={{
        backgroundColor: '#1e1e2c',
        borderColor:     '#6366f1',
        width:           280,
        transform:       'rotate(2deg) scale(1.02)',
        boxShadow:       '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.3)',
        cursor:          'grabbing',
        opacity:         0.96,
      }}
    >
      <CardBody task={task} />
    </div>
  )
}

// ─── Draggable task card ──────────────────────────────────────────────────────

interface TaskCardProps {
  task:    Task
  onClick: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id })

  if (isDragging) {
    // Ghost placeholder — keeps space in the column while card is in the overlay
    return (
      <div
        ref={setNodeRef}
        className="rounded-xl p-3.5 border"
        style={{
          backgroundColor: '#0e0e14',
          borderColor:     '#1e1e2e',
          borderStyle:     'dashed',
          opacity:         0.4,
          minHeight:       72,
        }}
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="rounded-xl p-3.5 border transition-all duration-150"
      style={{
        backgroundColor: '#16161f',
        borderColor:     '#252535',
        cursor:          'grab',
        touchAction:     'none',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.backgroundColor = '#1b1b26'
        el.style.borderColor     = '#313147'
        el.style.transform       = 'translateY(-1px)'
        el.style.boxShadow       = '0 4px 16px rgba(0,0,0,0.35)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.backgroundColor = '#16161f'
        el.style.borderColor     = '#252535'
        el.style.transform       = 'translateY(0)'
        el.style.boxShadow       = 'none'
      }}
    >
      <CardBody task={task} />
    </div>
  )
}
