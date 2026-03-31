import { format, parseISO } from 'date-fns'
import { CalendarDays, AlertCircle, MessageSquare } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { PRIORITY_CONFIG } from '../../lib/constants'
import { getDueDateStatus } from '../../lib/utils'
import { AvatarStack } from '../Team/MemberAvatar'
import type { TaskWithRelations } from '../../lib/types'
import type { DueDateStatus } from '../../lib/utils'

// ─── Due date badge ───────────────────────────────────────────────────────────

const DUE_DATE_STYLES: Record<DueDateStatus, { text: string; bg: string; icon: string }> = {
  overdue:   { text: '#fca5a5', bg: '#2a1520', icon: '#f87171' },
  due_today: { text: '#fb923c', bg: '#2a1608', icon: '#f97316' },
  due_soon:  { text: '#fcd34d', bg: '#231c0e', icon: '#fbbf24' },
  upcoming:  { text: '#94a3b8', bg: '#1c1c28', icon: '#64748b' },
}

function DueDateBadge({ dateStr }: { dateStr: string }) {
  const status = getDueDateStatus(dateStr)
  if (!status) return null

  const style = DUE_DATE_STYLES[status]
  const date  = parseISO(dateStr)
  const label = status === 'due_today' ? 'Today' : format(date, 'MMM d')

  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
      style={{ color: style.text, backgroundColor: style.bg, fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {status === 'overdue'
        ? <AlertCircle size={9} style={{ color: style.icon }} />
        : <CalendarDays size={9} style={{ color: style.icon }} />
      }
      {label}
    </span>
  )
}

// ─── Card body (shared between draggable card and drag overlay) ───────────────

function CardBody({ task }: { task: TaskWithRelations }) {
  const priority = PRIORITY_CONFIG[task.priority]
  return (
    <>
      <p
        className="text-sm font-medium leading-snug mb-2.5"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#ddddf0' }}
      >
        {task.title}
      </p>

      {/* Labels row */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map(l => (
            <span
              key={l.id}
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                fontFamily:      "'Space Grotesk', sans-serif",
                color:           l.color,
                backgroundColor: l.color + '1a',
                border:          `1px solid ${l.color}33`,
              }}
            >
              <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
              {l.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer row: priority · due date · comments · assignees */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: priority.text, backgroundColor: priority.bg }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: priority.dot }} />
          {priority.label}
        </span>
        {task.due_date && <DueDateBadge dateStr={task.due_date} />}
        <div className="flex-1" />
        {task.comment_count > 0 && (
          <span
            className="inline-flex items-center gap-1 text-[10px]"
            style={{ color: '#4a4a60', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <MessageSquare size={10} />
            {task.comment_count}
          </span>
        )}
        {task.assignees.length > 0 && (
          <AvatarStack members={task.assignees} max={3} size="sm" />
        )}
      </div>
    </>
  )
}

// ─── Drag overlay card (lifted, rotated) ─────────────────────────────────────

export function DragOverlayCard({ task }: { task: TaskWithRelations }) {
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
  task:    TaskWithRelations
  onClick: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id })
  const dueDateStatus = getDueDateStatus(task.due_date)
  const isOverdue     = dueDateStatus === 'overdue'

  if (isDragging) {
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
        backgroundColor: isOverdue ? '#1a1212' : '#16161f',
        borderColor:     isOverdue ? '#3d2020' : '#252535',
        // Inset left accent for overdue — no layout shift, pure visual
        boxShadow:       isOverdue ? 'inset 3px 0 0 rgba(248,113,113,0.4)' : 'none',
        cursor:          'grab',
        touchAction:     'none',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.backgroundColor = isOverdue ? '#1f1515' : '#1b1b26'
        el.style.borderColor     = isOverdue ? '#4d2828' : '#313147'
        el.style.transform       = 'translateY(-1px)'
        el.style.boxShadow       = isOverdue
          ? 'inset 3px 0 0 rgba(248,113,113,0.6), 0 4px 16px rgba(0,0,0,0.35)'
          : '0 4px 16px rgba(0,0,0,0.35)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.backgroundColor = isOverdue ? '#1a1212' : '#16161f'
        el.style.borderColor     = isOverdue ? '#3d2020' : '#252535'
        el.style.transform       = 'translateY(0)'
        el.style.boxShadow       = isOverdue ? 'inset 3px 0 0 rgba(248,113,113,0.4)' : 'none'
      }}
    >
      <CardBody task={task} />
    </div>
  )
}
