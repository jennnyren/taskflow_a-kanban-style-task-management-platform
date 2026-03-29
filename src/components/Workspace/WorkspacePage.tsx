import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useProjects } from '../../hooks/useProjects'
import { ProjectList } from './ProjectList'
import { CreateProjectModal } from './CreateProjectModal'
import { Board } from '../Board/Board'
import type { ProjectWithCount } from '../../lib/types'

function ProjectsLoadingSkeleton() {
  return (
    <div className="flex-1 p-6 overflow-hidden" style={{ backgroundColor: '#0e0e14' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-4 w-20 rounded-md mb-1.5" style={{ backgroundColor: '#1e1e2e', animation: 'pulse 2s ease-in-out infinite' }} />
          <div className="h-3 w-14 rounded-md"        style={{ backgroundColor: '#1a1a28', animation: 'pulse 2s ease-in-out infinite' }} />
        </div>
        <div className="h-7 w-24 rounded-lg" style={{ backgroundColor: '#1e1e2e', animation: 'pulse 2s ease-in-out infinite' }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: '#13131c', borderColor: '#252535' }}>
            <div className="h-1" style={{ backgroundColor: '#2a2a40', animation: 'pulse 2s ease-in-out infinite' }} />
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl shrink-0" style={{ backgroundColor: '#1e1e2e', animation: 'pulse 2s ease-in-out infinite' }} />
                <div className="flex-1 pt-0.5">
                  <div className="h-3 w-3/4 rounded mb-2" style={{ backgroundColor: '#1e1e2e', animation: 'pulse 2s ease-in-out infinite' }} />
                  <div className="h-2.5 w-1/2 rounded"    style={{ backgroundColor: '#1a1a28', animation: 'pulse 2s ease-in-out infinite' }} />
                </div>
              </div>
              <div className="h-px mb-3" style={{ backgroundColor: '#1e1e2e' }} />
              <div className="h-2.5 w-16 rounded" style={{ backgroundColor: '#1a1a28', animation: 'pulse 2s ease-in-out infinite' }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.7} }`}</style>
    </div>
  )
}

function BoardHeader({ project, onBack }: { project: ProjectWithCount; onBack: () => void }) {
  return (
    <div
      className="flex items-center gap-3 px-5 h-10 shrink-0 border-b"
      style={{ backgroundColor: '#0c0c12', borderColor: '#1a1a28' }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer"
        style={{ color: '#5a5a78' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#a0a0c0' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#5a5a78' }}
      >
        <ChevronLeft size={13} />
        Projects
      </button>

      <span style={{ color: '#2a2a40' }}>/</span>

      <div className="flex items-center gap-2">
        <span className="text-sm">{project.icon ?? '📋'}</span>
        <span
          className="text-xs font-semibold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#c0c0d8' }}
        >
          {project.name}
        </span>
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: project.color }}
        />
      </div>
    </div>
  )
}

export function WorkspacePage() {
  const { projects, loading, createProject } = useProjects()
  const [selectedId,      setSelectedId]      = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (loading) return <ProjectsLoadingSkeleton />

  const selectedProject = projects.find(p => p.id === selectedId)

  // ── Board view ──────────────────────────────────────────────────────────────
  if (selectedId && selectedProject) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <BoardHeader
          project={selectedProject}
          onBack={() => setSelectedId(null)}
        />
        <Board projectId={selectedId} />
      </div>
    )
  }

  // ── Project list view ───────────────────────────────────────────────────────
  return (
    <>
      <ProjectList
        projects={projects}
        onSelect={setSelectedId}
        onCreateClick={() => setShowCreateModal(true)}
      />

      {showCreateModal && (
        <CreateProjectModal
          createProject={createProject}
          onClose={() => setShowCreateModal(false)}
          onCreated={id => {
            setShowCreateModal(false)
            setSelectedId(id)
          }}
        />
      )}
    </>
  )
}
