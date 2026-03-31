import { formatDistanceToNow, parseISO } from 'date-fns'
import {
  Plus, ArrowRight, Pencil, UserPlus, UserMinus,
  Tag, MessageSquare, Calendar, Gauge, Activity,
} from 'lucide-react'
import { useAllActivity, describeActivity } from '../../hooks/useActivityLog'
import { useState } from 'react'
import type { ActivityEntryWithTask } from '../../hooks/useActivityLog'

// ─── Icon + colour per action type (shared logic, duplicated for isolation) ───

interface ActionStyle { icon: React.ReactNode; color: string; bg: string }

function getActionStyle(action: string): ActionStyle {
  switch (action) {
    case 'created':          return { icon: <Plus size={11} />,          color: '#a5b4fc', bg: 'rgba(99,102,241,0.15)' }
    case 'status_change':    return { icon: <ArrowRight size={11} />,    color: '#93c5fd', bg: 'rgba(59,130,246,0.15)' }
    case 'title_edit':
    case 'description_edit': return { icon: <Pencil size={11} />,        color: '#cbd5e1', bg: 'rgba(100,116,139,0.15)' }
    case 'priority_change':  return { icon: <Gauge size={11} />,         color: '#fcd34d', bg: 'rgba(234,179,8,0.15)' }
    case 'due_date_change':  return { icon: <Calendar size={11} />,      color: '#fcd34d', bg: 'rgba(234,179,8,0.15)' }
    case 'assignee_added':   return { icon: <UserPlus size={11} />,      color: '#86efac', bg: 'rgba(34,197,94,0.15)' }
    case 'assignee_removed': return { icon: <UserMinus size={11} />,     color: '#fca5a5', bg: 'rgba(248,113,113,0.15)' }
    case 'label_added':      return { icon: <Tag size={11} />,           color: '#c4b5fd', bg: 'rgba(139,92,246,0.15)' }
    case 'label_removed':    return { icon: <Tag size={11} />,           color: '#94a3b8', bg: 'rgba(100,116,139,0.12)' }
    case 'comment_added':    return { icon: <MessageSquare size={11} />, color: '#7dd3fc', bg: 'rgba(14,165,233,0.15)' }
    default:                 return { icon: <Activity size={11} />,      color: '#6060a0', bg: 'rgba(96,96,160,0.12)' }
  }
}

// ─── Single activity entry ────────────────────────────────────────────────────

function ActivityEntry({
  entry,
  onOpenTask,
}: {
  entry:      ActivityEntryWithTask
  onOpenTask: (projectId: string, taskId: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const style   = getActionStyle(entry.action)
  const task    = entry.tasks
  const project = task?.projects

  function handleClick() {
    if (task && project) onOpenTask(project.id, task.id)
  }

  return (
    <div
      className="flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all"
      style={{
        backgroundColor: hovered && task ? '#16161f' : '#13131c',
        borderColor:     hovered && task ? '#313147' : '#1e1e2e',
        cursor:          task ? 'pointer' : 'default',
      }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon node */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {style.icon}
      </div>

      <div className="flex-1 min-w-0">
        {/* Breadcrumb */}
        {project && task && (
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span
              className="text-[10px] font-semibold"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: project.color }}
            >
              {project.icon ?? '📋'} {project.name}
            </span>
            <span style={{ color: '#2a2a40', fontSize: 10 }}>/</span>
            <span
              className="text-[10px] truncate"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#5a5a78' }}
            >
              {task.title}
            </span>
          </div>
        )}

        {/* Description */}
        <p
          className="text-sm leading-snug"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#b0b0c8' }}
        >
          {describeActivity(entry.action, entry.details)}
        </p>

        {/* Timestamp */}
        <p
          className="text-[10px] mt-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#3a3a55' }}
        >
          {formatDistanceToNow(parseISO(entry.created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}

// ─── Activity page ────────────────────────────────────────────────────────────

interface ActivityPageProps {
  onOpenTask: (projectId: string, taskId: string) => void
}

export function ActivityPage({ onOpenTask }: ActivityPageProps) {
  const { entries, loading } = useAllActivity()

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#0e0e14' }}>
      <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col gap-4">

        <div>
          <h1
            className="text-lg font-bold mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e8e8f8' }}
          >
            Activity
          </h1>
          <p
            className="text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#5a5a78' }}
          >
            A full timeline of every change made across your board.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-center py-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}>
            Loading…
          </p>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366f1' }}
            >
              <Activity size={22} />
            </div>
            <p className="text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}>
              No activity yet.
            </p>
          </div>
        ) : (
          entries.map(e => (
            <ActivityEntry key={e.id} entry={e} onOpenTask={onOpenTask} />
          ))
        )}
      </div>
    </div>
  )
}
