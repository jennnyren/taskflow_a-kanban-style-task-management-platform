import { COLUMNS } from '../../lib/constants'
import { useTasks } from '../../hooks/useTasks'
import { Column } from './Column'
import type { Task } from '../../lib/types'

export function Board({ projectId }: { projectId: string }) {
  const { tasks, loading, error, createTask } = useTasks(projectId)

  if (loading) return <BoardSkeleton />

  if (error) return (
    <div className="flex-1 flex items-center justify-center">
      <div
        className="flex items-center gap-3 text-sm px-4 py-3 rounded-xl border"
        style={{
          fontFamily:      "'Plus Jakarta Sans', sans-serif",
          color:           '#fca5a5',
          backgroundColor: '#2a1520',
          borderColor:     '#4a2030',
        }}
      >
        <span>⚠</span>
        <span>{error}</span>
      </div>
    </div>
  )

  function handleTaskClick(_task: Task) {
    // Task detail modal — wired up in Phase 6
  }

  return (
    <div
      className="flex-1 overflow-x-auto overflow-y-hidden"
      style={{ backgroundColor: '#0e0e14' }}
    >
      {/* min-width:100% + width:max-content = centers when fits, scrolls when overflows */}
      <div className="flex gap-4 p-5 h-full justify-center" style={{ minWidth: '100%', width: 'max-content' }}>
        {COLUMNS.map(col => {
          const colTasks = tasks
            .filter(t => t.status === col.id)
            .sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at))

          return (
            <Column
              key={col.id}
              column={col}
              tasks={colTasks}
              onAddTask={title => createTask(title, col.id).then(() => {})}
              onTaskClick={handleTaskClick}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="rounded-xl p-3.5 border"
      style={{ backgroundColor: '#16161f', borderColor: '#252535' }}
    >
      <div
        className="h-3 rounded-full mb-3"
        style={{ backgroundColor: '#1e1e2e', width: `${55 + Math.random() * 30}%`, animation: 'pulse 2s ease-in-out infinite' }}
      />
      <div
        className="h-3 rounded-full mb-2.5"
        style={{ backgroundColor: '#1e1e2e', width: `${35 + Math.random() * 25}%`, animation: 'pulse 2s ease-in-out infinite' }}
      />
      <div className="flex gap-1.5 mt-3">
        <div className="h-4 w-12 rounded" style={{ backgroundColor: '#1e1e2e', animation: 'pulse 2s ease-in-out infinite' }} />
      </div>
    </div>
  )
}

function BoardSkeleton() {
  return (
    <div
      className="flex-1 overflow-hidden"
      style={{ backgroundColor: '#0e0e14' }}
    >
      <div className="flex gap-4 p-5">
        {COLUMNS.map(col => (
          <div
            key={col.id}
            className="rounded-2xl min-w-[280px] w-[280px] shrink-0"
            style={{ backgroundColor: '#13131c' }}
          >
            <div className="h-[3px] rounded-t-2xl" style={{ backgroundColor: col.accent, opacity: 0.4 }} />
            <div className="flex items-center gap-2 px-4 pt-3.5 pb-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.dot, opacity: 0.4 }} />
              <div className="h-2.5 rounded-full flex-1" style={{ backgroundColor: '#1e1e2e', maxWidth: 80, animation: 'pulse 2s ease-in-out infinite' }} />
            </div>
            <div className="mx-4 mb-3 h-px" style={{ backgroundColor: '#1e1e2e' }} />
            <div className="flex flex-col gap-2 px-3 pb-3">
              {[1, 2].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }`}</style>
    </div>
  )
}
