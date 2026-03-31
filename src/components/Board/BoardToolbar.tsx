import { useEffect, useRef, useState } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { useTeam } from '../../hooks/useTeam'
import { useLabels } from '../../hooks/useLabels'
import type { FilterState } from '../../hooks/useFilters'

// ─── Generic filter dropdown ──────────────────────────────────────────────────

interface DropdownOption { value: string; label: string }

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  active,
}: {
  label:    string
  value:    string
  options:  DropdownOption[]
  onChange: (v: string) => void
  active:   boolean
}) {
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
        style={{
          fontFamily:      "'Space Grotesk', sans-serif",
          backgroundColor: active ? 'rgba(99,102,241,0.15)' : '#1a1a26',
          border:          `1px solid ${active ? 'rgba(99,102,241,0.4)' : '#252535'}`,
          color:           active ? '#a5b4fc' : '#7070a0',
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#3a3a50'; e.currentTarget.style.color = '#9090b0' } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#252535'; e.currentTarget.style.color = '#7070a0' } }}
      >
        {active ? (selected?.label ?? label) : label}
        <ChevronDown
          size={10}
          style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 rounded-xl border py-1 z-50"
          style={{
            backgroundColor: '#1a1a26',
            borderColor:     '#252535',
            boxShadow:       '0 8px 24px rgba(0,0,0,0.5)',
            minWidth:        140,
          }}
        >
          {options.map(opt => {
            const isActive = opt.value === value
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] transition-colors cursor-pointer text-left"
                style={{
                  fontFamily:      "'Plus Jakarta Sans', sans-serif",
                  color:           isActive ? '#a5b4fc' : '#8080a0',
                  backgroundColor: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {isActive && <span style={{ color: '#6366f1', fontSize: 10 }}>✓</span>}
                {!isActive && <span style={{ width: 12 }} />}
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Board toolbar ────────────────────────────────────────────────────────────

interface BoardToolbarProps {
  filters:      FilterState
  activeCount:  number
  onSet:        <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  onClear:      () => void
}

export function BoardToolbar({ filters, activeCount, onSet, onClear }: BoardToolbarProps) {
  const { members } = useTeam()
  const { labels }  = useLabels()

  const priorityOptions: DropdownOption[] = [
    { value: 'all',    label: 'All priorities' },
    { value: 'low',    label: 'Low'            },
    { value: 'normal', label: 'Normal'         },
    { value: 'high',   label: 'High'           },
  ]

  const assigneeOptions: DropdownOption[] = [
    { value: 'all', label: 'All members' },
    ...members.map(m => ({ value: m.id, label: m.name })),
  ]

  const labelOptions: DropdownOption[] = [
    { value: 'all', label: 'All labels' },
    ...labels.map(l => ({ value: l.id, label: l.name })),
  ]

  const dueDateOptions: DropdownOption[] = [
    { value: 'all',       label: 'Any due date'    },
    { value: 'overdue',   label: 'Overdue'         },
    { value: 'this_week', label: 'Due this week'   },
    { value: 'no_date',   label: 'No due date'     },
  ]

  return (
    <div
      className="flex items-center gap-2 px-5 py-2.5 border-b flex-wrap"
      style={{ backgroundColor: '#0c0c12', borderColor: '#1a1a28' }}
    >
      {/* Search */}
      <div className="relative flex items-center shrink-0" style={{ width: 200 }}>
        <Search
          size={12}
          className="absolute left-2.5 pointer-events-none"
          style={{ color: filters.search ? '#a5b4fc' : '#4a4a60' }}
        />
        <input
          type="text"
          value={filters.search}
          onChange={e => onSet('search', e.target.value)}
          placeholder="Search tasks…"
          className="w-full h-7 pl-7 pr-2.5 rounded-lg text-[11px] border outline-none"
          style={{
            fontFamily:      "'Plus Jakarta Sans', sans-serif",
            backgroundColor: filters.search ? 'rgba(99,102,241,0.08)' : '#1a1a26',
            borderColor:     filters.search ? 'rgba(99,102,241,0.4)' : '#252535',
            color:           '#c0c0d8',
          }}
          onFocus={e  => { e.currentTarget.style.borderColor = '#6366f1' }}
          onBlur={e   => { e.currentTarget.style.borderColor = filters.search ? 'rgba(99,102,241,0.4)' : '#252535' }}
        />
        {filters.search && (
          <button
            onClick={() => onSet('search', '')}
            className="absolute right-2 cursor-pointer"
            style={{ color: '#5a5a78' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#a5b4fc' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#5a5a78' }}
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      <FilterDropdown
        label="Priority"
        value={filters.priority}
        options={priorityOptions}
        onChange={v => onSet('priority', v as FilterState['priority'])}
        active={filters.priority !== 'all'}
      />
      <FilterDropdown
        label="Assignee"
        value={filters.assignee}
        options={assigneeOptions}
        onChange={v => onSet('assignee', v)}
        active={filters.assignee !== 'all'}
      />
      <FilterDropdown
        label="Label"
        value={filters.label}
        options={labelOptions}
        onChange={v => onSet('label', v)}
        active={filters.label !== 'all'}
      />
      <FilterDropdown
        label="Due date"
        value={filters.dueDate}
        options={dueDateOptions}
        onChange={v => onSet('dueDate', v as FilterState['dueDate'])}
        active={filters.dueDate !== 'all'}
      />

      {/* Clear all */}
      {activeCount > 0 && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors ml-auto"
          style={{
            fontFamily:      "'Space Grotesk', sans-serif",
            backgroundColor: 'rgba(248,113,113,0.08)',
            border:          '1px solid rgba(248,113,113,0.2)',
            color:           '#f87171',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.08)' }}
        >
          <X size={10} />
          Clear {activeCount > 1 ? `${activeCount} filters` : 'filter'}
        </button>
      )}
    </div>
  )
}
