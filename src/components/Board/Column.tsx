import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'
import type { ColumnConfig } from '../../lib/constants'
import type { Task } from '../../lib/types'

interface ColumnProps {
  column:      ColumnConfig
  tasks:       Task[]
  onAddTask:   (title: string) => Promise<void>
  onTaskClick: (task: Task) => void
}

function EmptyState({ color, onAdd }: { color: string; onAdd: () => void }) {
  return (
    <button
      onClick={onAdd}
      className="flex flex-col items-center justify-center py-10 px-4 w-full rounded-xl transition-colors cursor-pointer"
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)' }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      <div
        className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
        style={{ border: `1.5px dashed ${color}`, opacity: 0.4 }}
      >
        <Plus size={14} color={color} />
      </div>
      <p
        className="text-[11px] text-center leading-relaxed"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}
      >
        No tasks yet
      </p>
    </button>
  )
}

function InlineAddInput({
  onConfirm,
  onCancel,
}: {
  onConfirm: (title: string) => Promise<void>
  onCancel:  () => void
}) {
  const [value, setValue]   = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef            = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const trimmed = value.trim()
      if (!trimmed) return
      setSaving(true)
      await onConfirm(trimmed)
      setSaving(false)
    }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div
      className="rounded-xl p-3 border"
      style={{ backgroundColor: '#16161f', borderColor: '#6366f1' }}
    >
      <textarea
        ref={inputRef}
        rows={2}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (!value.trim()) onCancel() }}
        disabled={saving}
        placeholder="Task title…"
        className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-[#3a3a50]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#ddddf0' }}
      />
      <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t" style={{ borderColor: '#252535' }}>
        <span
          className="text-[10px]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}
        >
          Enter to save · Esc to cancel
        </span>
      </div>
    </div>
  )
}

export function Column({ column, tasks, onAddTask, onTaskClick }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false)

  const { isOver, setNodeRef } = useDroppable({ id: column.id })

  async function handleConfirm(title: string) {
    await onAddTask(title)
    setIsAdding(false)
  }

  return (
    <div
      className="flex flex-col rounded-2xl min-w-[280px] w-[280px] shrink-0 transition-colors duration-150"
      style={{
        backgroundColor: isOver ? '#18182a' : '#13131c',
        boxShadow:       isOver ? `0 0 0 1.5px ${column.accent}55` : 'none',
      }}
    >
      {/* Accent stripe */}
      <div
        className="h-[3px] rounded-t-2xl shrink-0 transition-opacity duration-150"
        style={{ backgroundColor: column.accent, opacity: isOver ? 1 : 0.7 }}
      />

      {/* Column header */}
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-3">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: column.dot }} />
        <span
          className="text-xs font-semibold flex-1 tracking-wide uppercase"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#a0a0b8', letterSpacing: '0.06em' }}
        >
          {column.label}
        </span>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
          style={{ fontFamily: "'Space Grotesk', sans-serif", backgroundColor: column.badgeBg, color: column.badgeText }}
        >
          {tasks.length}
        </span>
        <button
          onClick={() => setIsAdding(true)}
          className="w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer"
          style={{ color: '#4a4a60' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1e1e2e'; e.currentTarget.style.color = '#a0a0c0' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4a4a60' }}
          title={`Add task to ${column.label}`}
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3 h-px" style={{ backgroundColor: '#1e1e2e' }} />

      {/* Droppable task list */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 px-3 pb-3 flex-1 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 200px)', minHeight: 80 }}
      >
        {isAdding && (
          <InlineAddInput
            onConfirm={handleConfirm}
            onCancel={() => setIsAdding(false)}
          />
        )}

        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}

        {!isAdding && tasks.length === 0 && (
          <EmptyState color={column.dot} onAdd={() => setIsAdding(true)} />
        )}
      </div>
    </div>
  )
}
