import { formatDistanceToNow, parseISO } from 'date-fns'
import {
  Plus, ArrowRight, Pencil, UserPlus, UserMinus,
  Tag, MessageSquare, Calendar, Gauge, Activity,
} from 'lucide-react'
import { useTaskActivity, describeActivity } from '../../hooks/useActivityLog'

// ─── Icon + colour per action type ───────────────────────────────────────────

interface ActionStyle {
  icon:  React.ReactNode
  color: string
  bg:    string
}

function getActionStyle(action: string): ActionStyle {
  switch (action) {
    case 'created':
      return { icon: <Plus size={10} />,          color: '#a5b4fc', bg: 'rgba(99,102,241,0.15)' }
    case 'status_change':
      return { icon: <ArrowRight size={10} />,    color: '#93c5fd', bg: 'rgba(59,130,246,0.15)' }
    case 'title_edit':
    case 'description_edit':
      return { icon: <Pencil size={10} />,        color: '#cbd5e1', bg: 'rgba(100,116,139,0.15)' }
    case 'priority_change':
      return { icon: <Gauge size={10} />,         color: '#fcd34d', bg: 'rgba(234,179,8,0.15)' }
    case 'due_date_change':
      return { icon: <Calendar size={10} />,      color: '#fcd34d', bg: 'rgba(234,179,8,0.15)' }
    case 'assignee_added':
      return { icon: <UserPlus size={10} />,      color: '#86efac', bg: 'rgba(34,197,94,0.15)' }
    case 'assignee_removed':
      return { icon: <UserMinus size={10} />,     color: '#fca5a5', bg: 'rgba(248,113,113,0.15)' }
    case 'label_added':
      return { icon: <Tag size={10} />,           color: '#c4b5fd', bg: 'rgba(139,92,246,0.15)' }
    case 'label_removed':
      return { icon: <Tag size={10} />,           color: '#94a3b8', bg: 'rgba(100,116,139,0.12)' }
    case 'comment_added':
      return { icon: <MessageSquare size={10} />, color: '#7dd3fc', bg: 'rgba(14,165,233,0.15)' }
    default:
      return { icon: <Activity size={10} />,      color: '#6060a0', bg: 'rgba(96,96,160,0.12)' }
  }
}

// ─── Activity log (used inside TaskModal) ─────────────────────────────────────

export function ActivityLog({ taskId }: { taskId: string }) {
  const { entries, loading } = useTaskActivity(taskId)

  return (
    <div className="mt-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <Activity size={13} style={{ color: '#5a5a78' }} />
        <span
          className="text-xs font-semibold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#5a5a78' }}
        >
          Activity
        </span>
        {entries.length > 0 && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: '#1e1e2e', color: '#5a5a78', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {entries.length}
          </span>
        )}
        <div className="flex-1 h-px" style={{ backgroundColor: '#1e1e2e' }} />
      </div>

      {loading ? (
        <p className="text-[11px] py-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}>
          Loading…
        </p>
      ) : entries.length === 0 ? (
        <p
          className="text-[12px] py-3 text-center"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}
        >
          No activity yet
        </p>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div
            className="absolute left-[11px] top-3 bottom-3 w-px"
            style={{ backgroundColor: '#1e1e2e' }}
          />

          <div className="flex flex-col gap-3">
            {entries.map(entry => {
              const style = getActionStyle(entry.action)
              return (
                <div key={entry.id} className="flex items-start gap-3 relative">
                  {/* Icon node */}
                  <div
                    className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 z-10"
                    style={{ backgroundColor: style.bg, color: style.color }}
                  >
                    {style.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p
                      className="text-[12px] leading-snug"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#9090b0' }}
                    >
                      {describeActivity(entry.action, entry.details)}
                    </p>
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#3a3a55' }}
                    >
                      {formatDistanceToNow(parseISO(entry.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
