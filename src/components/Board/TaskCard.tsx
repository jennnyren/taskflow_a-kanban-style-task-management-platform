import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns'
import { CalendarDays, AlertCircle } from 'lucide-react'
import { PRIORITY_CONFIG } from '../../lib/constants'
import type { Task } from '../../lib/types'

interface TaskCardProps {
  task:    Task
  onClick: () => void
}

function DueDateBadge({ dateStr }: { dateStr: string }) {
  const date    = parseISO(dateStr)
  const overdue = isPast(date) && !isToday(date)
  const today   = isToday(date)
  const soon    = isTomorrow(date)

  const label = today  ? 'Today'
              : soon   ? 'Tomorrow'
              : overdue ? format(date, 'MMM d')
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
        : <CalendarDays  size={9} style={{ color: color.icon }} />
      }
      {label}
    </span>
  )
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const priority = PRIORITY_CONFIG[task.priority]

  return (
    <div
      onClick={onClick}
      className="group rounded-xl p-3.5 cursor-pointer transition-all duration-150 border"
      style={{
        backgroundColor: '#16161f',
        borderColor:     '#252535',
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
      {/* Title */}
      <p
        className="text-sm font-medium leading-snug mb-2.5"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color:      '#ddddf0',
        }}
      >
        {task.title}
      </p>

      {/* Footer row: priority + due date + future slots (assignees, labels) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Priority badge */}
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{
            fontFamily:      "'Space Grotesk', sans-serif",
            color:           priority.text,
            backgroundColor: priority.bg,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: priority.dot }}
          />
          {priority.label}
        </span>

        {/* Due date badge */}
        {task.due_date && <DueDateBadge dateStr={task.due_date} />}

        {/* Spacer — assignee avatars and label chips slot in here (Phase 7 & 8) */}
        <div className="flex-1" />
      </div>
    </div>
  )
}
