import { Plus, CheckSquare } from 'lucide-react'
import type { ProjectWithCount } from '../../lib/types'

interface ProjectListProps {
  projects:       ProjectWithCount[]
  onSelect:       (id: string) => void
  onCreateClick:  () => void
}

function ProjectCard({ project, onClick }: { project: ProjectWithCount; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col rounded-2xl border text-left transition-all duration-150 cursor-pointer overflow-hidden w-full"
      style={{ backgroundColor: '#13131c', borderColor: '#252535' }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor     = project.color + '55'
        el.style.backgroundColor = '#16161f'
        el.style.transform       = 'translateY(-2px)'
        el.style.boxShadow       = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${project.color}22`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor     = '#252535'
        el.style.backgroundColor = '#13131c'
        el.style.transform       = 'translateY(0)'
        el.style.boxShadow       = 'none'
      }}
    >
      {/* Color accent bar */}
      <div className="h-1 w-full shrink-0" style={{ backgroundColor: project.color }} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Icon + name row */}
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: project.color + '20', border: `1px solid ${project.color}35` }}
          >
            {project.icon ?? '📋'}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3
              className="text-sm font-semibold leading-tight truncate"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#ddddf0' }}
            >
              {project.name}
            </h3>
            {project.description && (
              <p
                className="text-xs mt-0.5 line-clamp-2 leading-relaxed"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#5a5a78' }}
              >
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer: task count */}
        <div
          className="flex items-center gap-1.5 pt-2 border-t"
          style={{ borderColor: '#1e1e2e' }}
        >
          <CheckSquare size={11} style={{ color: '#4a4a60' }} />
          <span
            className="text-[11px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}
          >
            {project.task_count === 0
              ? 'No tasks'
              : `${project.task_count} task${project.task_count === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>
    </button>
  )
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ border: '1.5px dashed #2a2a40', backgroundColor: '#13131c' }}
      >
        <span className="text-3xl">📋</span>
      </div>
      <div className="text-center">
        <h2
          className="text-base font-semibold mb-1.5"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#c0c0d8' }}
        >
          No projects yet
        </h2>
        <p
          className="text-sm"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#5a5a78' }}
        >
          Create your first project to start organising tasks.
        </p>
      </div>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity cursor-pointer"
        style={{ backgroundColor: '#6366f1', color: '#fff' }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        <Plus size={15} />
        Create your first project
      </button>
    </div>
  )
}

export function ProjectList({ projects, onSelect, onCreateClick }: ProjectListProps) {
  if (projects.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-6"
      style={{ backgroundColor: '#0e0e14' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-base font-semibold"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#c0c0d8' }}
          >
            Projects
          </h1>
          <p
            className="text-xs mt-0.5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#5a5a78' }}
          >
            {projects.length} project{projects.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{ backgroundColor: '#6366f1', color: '#fff' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          <Plus size={13} />
          New project
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => onSelect(project.id)}
          />
        ))}
      </div>
    </div>
  )
}
