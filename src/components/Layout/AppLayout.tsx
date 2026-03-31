import { useState } from 'react'
import { Sidebar }   from './Sidebar'
import { Header }    from './Header'
import { WorkspacePage } from '../Workspace/WorkspacePage'
import { TeamPage } from '../Team/TeamPage'
import { LabelsPage } from '../Labels/LabelsPage'
import { CommentsPage } from '../Comments/CommentsPage'
import { ActivityPage } from '../Activity/ActivityPage'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Tags,
  Activity,
} from 'lucide-react'

// ─── Page type (shared with Sidebar via re-export) ────────────────────────────

export type Page = 'workspace' | 'team' | 'comments' | 'labels' | 'activity'

// ─── Placeholder pages ────────────────────────────────────────────────────────

const PAGE_META: Record<Page, { label: string; description: string; icon: React.ReactNode }> = {
  workspace: {
    label:       'Workspace',
    description: 'Your Kanban board.',
    icon:        <LayoutDashboard size={28} />,
  },
  team: {
    label:       'Team',
    description: 'Add team members and manage assignees across your tasks.',
    icon:        <Users size={28} />,
  },
  comments: {
    label:       'Comments',
    description: 'A feed of all comments across every task.',
    icon:        <MessageSquare size={28} />,
  },
  labels: {
    label:       'Labels',
    description: 'Create and manage labels to categorise your tasks.',
    icon:        <Tags size={28} />,
  },
  activity: {
    label:       'Activity',
    description: 'A full timeline of changes made across your board.',
    icon:        <Activity size={28} />,
  },
}

function PlaceholderPage({ page }: { page: Exclude<Page, 'workspace'> }) {
  const meta = PAGE_META[page]
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div
        className="flex flex-col items-center text-center gap-4 max-w-xs"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          {meta.icon}
        </div>
        <div>
          <h2
            className="text-base font-semibold mb-1.5"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#c0c0d8' }}
          >
            {meta.label}
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#5a5a78' }}
          >
            {meta.description}
          </p>
          <p
            className="text-xs mt-3 px-3 py-1.5 rounded-lg inline-block"
            style={{
              fontFamily:      "'Plus Jakarta Sans', sans-serif",
              color:           '#4a4a60',
              backgroundColor: '#13131c',
              border:          '1px solid #1e1e2e',
            }}
          >
            Coming soon
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── App layout ───────────────────────────────────────────────────────────────

interface PendingTask { projectId: string; taskId: string }

export function AppLayout() {
  const [activePage,   setActivePage]  = useState<Page>('workspace')
  const [collapsed,    setCollapsed]   = useState(true)
  const [mobileOpen,   setMobileOpen]  = useState(false)
  const [pendingTask,  setPendingTask] = useState<PendingTask | null>(null)

  function handleOpenTask(projectId: string, taskId: string) {
    setPendingTask({ projectId, taskId })
    setActivePage('workspace')
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: '#0a0a10' }}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        activePage={activePage}
        onNavigate={setActivePage}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* ── Main content area ── */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <Header
          activePage={activePage}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />

        {/* Page content */}
        {activePage === 'workspace'
          ? <WorkspacePage pendingTask={pendingTask} onPendingConsumed={() => setPendingTask(null)} />
          : activePage === 'team'
          ? <TeamPage />
          : activePage === 'labels'
          ? <LabelsPage />
          : activePage === 'comments'
          ? <CommentsPage onOpenTask={handleOpenTask} />
          : activePage === 'activity'
          ? <ActivityPage onOpenTask={handleOpenTask} />
          : <PlaceholderPage page={activePage} />
        }
      </div>
    </div>
  )
}
