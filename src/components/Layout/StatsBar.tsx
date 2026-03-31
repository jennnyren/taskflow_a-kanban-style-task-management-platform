import { useMemo } from 'react'
import { LayoutGrid, Loader, CheckCircle2, AlertTriangle } from 'lucide-react'
import { getDueDateStatus } from '../../lib/utils'
import type { TaskWithRelations } from '../../lib/types'

interface StatsBarProps {
  tasks:          TaskWithRelations[]
  overdueActive:  boolean
  onOverdueClick: () => void
  onClearClick:   () => void
}

interface StatPillProps {
  icon:     React.ReactNode
  label:    string
  count:    number
  color:    string
  bgColor:  string
  onClick?: () => void
  active?:  boolean
}

function StatPill({ icon, label, count, color, bgColor, onClick, active }: StatPillProps) {
  const isClickable = !!onClick

  if (!isClickable) {
    return (
      <div
        className="inline-flex items-center gap-1.5 h-6 px-2 rounded-full text-[10px] font-medium shrink-0"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color:      `${color}88`,
        }}
      >
        <span style={{ opacity: 0.5 }}>{icon}</span>
        <span style={{ opacity: 0.5 }}>{label}</span>
        <span className="font-semibold tabular-nums" style={{ opacity: 0.65 }}>{count}</span>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[10px] font-medium shrink-0 cursor-pointer"
      style={{
        fontFamily:      "'Space Grotesk', sans-serif",
        color:           active ? color : `${color}88`,
        backgroundColor: active ? bgColor : 'transparent',
        border:          `1px solid ${active ? `${color}40` : 'transparent'}`,
        transition:      'color 120ms, background-color 120ms, border-color 120ms',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color            = color
        e.currentTarget.style.backgroundColor  = bgColor
        e.currentTarget.style.borderColor      = `${color}40`
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color            = `${color}88`
          e.currentTarget.style.backgroundColor  = 'transparent'
          e.currentTarget.style.borderColor      = 'transparent'
        } else {
          e.currentTarget.style.color            = color
          e.currentTarget.style.backgroundColor  = bgColor
          e.currentTarget.style.borderColor      = `${color}40`
        }
      }}
    >
      <span style={{ opacity: active ? 1 : 0.55 }}>{icon}</span>
      <span style={{ opacity: active ? 1 : 0.6 }}>{label}</span>
      <span className="font-semibold tabular-nums">{count}</span>
    </button>
  )
}

function Dot() {
  return <span style={{ color: '#252535', fontSize: 14, lineHeight: 1, userSelect: 'none', flexShrink: 0 }}>·</span>
}

export function StatsBar({ tasks, overdueActive, onOverdueClick, onClearClick }: StatsBarProps) {
  const stats = useMemo(() => {
    const total      = tasks.length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const done       = tasks.filter(t => t.status === 'done').length
    const overdue    = tasks.filter(
      t => t.status !== 'done' && getDueDateStatus(t.due_date) === 'overdue'
    ).length
    return { total, inProgress, done, overdue }
  }, [tasks])

  return (
    <div
      className="flex items-center gap-1.5 px-5 h-9 border-b shrink-0"
      style={{ backgroundColor: '#0c0c12', borderColor: '#1a1a28' }}
    >
      <StatPill
        icon={<LayoutGrid size={9} />}
        label="Total"
        count={stats.total}
        color="#7070a0"
        bgColor="rgba(112,112,160,0.12)"
        onClick={onClearClick}
      />

      <Dot />

      <StatPill
        icon={<Loader size={9} />}
        label="In progress"
        count={stats.inProgress}
        color="#60a5fa"
        bgColor="rgba(96,165,250,0.1)"
      />

      <Dot />

      <StatPill
        icon={<CheckCircle2 size={9} />}
        label="Done"
        count={stats.done}
        color="#4ade80"
        bgColor="rgba(74,222,128,0.1)"
      />

      {stats.overdue > 0 && (
        <>
          <Dot />
          <StatPill
            icon={<AlertTriangle size={9} />}
            label="Overdue"
            count={stats.overdue}
            color="#f87171"
            bgColor="rgba(248,113,113,0.1)"
            onClick={onOverdueClick}
            active={overdueActive}
          />
        </>
      )}
    </div>
  )
}
