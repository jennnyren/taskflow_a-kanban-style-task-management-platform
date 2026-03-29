import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Tags,
  Activity,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react'
import type { Page } from './AppLayout'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed:     boolean
  onToggle:      () => void
  activePage:    Page
  onNavigate:    (page: Page) => void
  mobileOpen:    boolean
  onMobileClose: () => void
}

interface NavItem {
  id:    Page
  label: string
  icon:  React.ReactNode
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { id: 'workspace', label: 'Workspace', icon: <LayoutDashboard size={17} /> },
  { id: 'team',      label: 'Team',      icon: <Users            size={17} /> },
  { id: 'comments',  label: 'Comments',  icon: <MessageSquare    size={17} /> },
  { id: 'labels',    label: 'Labels',    icon: <Tags             size={17} /> },
  { id: 'activity',  label: 'Activity',  icon: <Activity         size={17} /> },
]

const SIDEBAR_W_EXPANDED  = 220
const SIDEBAR_W_COLLAPSED = 56

// ─── Inner sidebar content (shared between desktop + mobile) ──────────────────

function SidebarContent({
  collapsed,
  onToggle,
  activePage,
  onNavigate,
  isMobile = false,
  onMobileClose,
}: {
  collapsed:     boolean
  onToggle:      () => void
  activePage:    Page
  onNavigate:    (page: Page) => void
  isMobile?:     boolean
  onMobileClose: () => void
}) {
  const isExpanded = isMobile || !collapsed

  function handleNavClick(page: Page) {
    onNavigate(page)
    if (isMobile) onMobileClose()
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Top: logo + toggle ── */}
      <div
        className="flex items-center shrink-0 h-14 px-3 gap-2.5 border-b"
        style={{ borderColor: '#1a1a28' }}
      >
        {/* Logo mark */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#6366f1', boxShadow: '0 0 10px rgba(99,102,241,0.3)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1.2" fill="white" opacity="0.95" />
            <rect x="8" y="1" width="5" height="5" rx="1.2" fill="white" opacity="0.55" />
            <rect x="1" y="8" width="5" height="5" rx="1.2" fill="white" opacity="0.55" />
            <rect x="8" y="8" width="5" height="5" rx="1.2" fill="white" opacity="0.25" />
          </svg>
        </div>

        {/* Wordmark — only when expanded */}
        <span
          className="text-sm font-semibold tracking-tight flex-1 overflow-hidden whitespace-nowrap"
          style={{
            fontFamily:  "'Space Grotesk', sans-serif",
            color:       '#e2e2f0',
            opacity:     isExpanded ? 1 : 0,
            width:       isExpanded ? 'auto' : 0,
            transition:  'opacity 150ms ease',
          }}
        >
          Taskflow
        </span>

        {/* Toggle button */}
        {isMobile ? (
          <button
            onClick={onMobileClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0 cursor-pointer"
            style={{ color: '#5a5a78' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1e1e2e'; e.currentTarget.style.color = '#9090b0' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5a5a78' }}
          >
            <X size={15} />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0 cursor-pointer"
            style={{
              color:   '#5a5a78',
              opacity: isExpanded ? 1 : 0,
              width:   isExpanded ? 28 : 0,
              overflow: 'hidden',
              transition: 'opacity 150ms ease, width 200ms ease',
            }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1e1e2e'; e.currentTarget.style.color = '#9090b0' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5a5a78' }}
          >
            <PanelLeftClose size={15} />
          </button>
        )}
      </div>

      {/* ── Collapsed-state expand trigger (icon only, centered) ── */}
      {!isMobile && collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mt-2 w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
          style={{ color: '#5a5a78' }}
          title="Expand sidebar"
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1e1e2e'; e.currentTarget.style.color = '#9090b0' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5a5a78' }}
        >
          <PanelLeftOpen size={15} />
        </button>
      )}

      {/* ── Nav items ── */}
      <nav className="flex flex-col gap-0.5 px-2 mt-3 flex-1">
        {NAV_ITEMS.map(item => {
          const isActive = activePage === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={!isExpanded ? item.label : undefined}
              className="flex items-center gap-2.5 rounded-lg transition-all duration-100 cursor-pointer w-full text-left relative"
              style={{
                height:          36,
                paddingLeft:     isExpanded ? 10 : 0,
                paddingRight:    isExpanded ? 10 : 0,
                justifyContent:  isExpanded ? 'flex-start' : 'center',
                backgroundColor: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                color:           isActive ? '#a5b4fc' : '#6a6a88',
                borderLeft:      isActive ? '2px solid #6366f1' : '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color           = '#9090b0'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color           = '#6a6a88'
                }
              }}
            >
              <span className="shrink-0">{item.icon}</span>
              {isExpanded && (
                <span
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Bottom: settings ── */}
      <div className="px-2 pb-4 shrink-0">
        <div className="h-px mb-3" style={{ backgroundColor: '#1a1a28' }} />
        <button
          className="flex items-center gap-2.5 rounded-lg transition-colors w-full cursor-pointer"
          style={{
            height:         36,
            paddingLeft:    isExpanded ? 10 : 0,
            paddingRight:   isExpanded ? 10 : 0,
            justifyContent: isExpanded ? 'flex-start' : 'center',
            color:          '#5a5a78',
          }}
          title={!isExpanded ? 'Settings' : undefined}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#9090b0' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5a5a78' }}
        >
          <Settings size={17} className="shrink-0" />
          {isExpanded && (
            <span
              className="text-sm font-medium"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Settings
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({
  collapsed,
  onToggle,
  activePage,
  onNavigate,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const width = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r overflow-hidden"
        style={{
          width:           width,
          minWidth:        width,
          backgroundColor: '#0a0a10',
          borderColor:     '#1a1a28',
          transition:      'width 200ms ease, min-width 200ms ease',
        }}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggle={onToggle}
          activePage={activePage}
          onNavigate={onNavigate}
          onMobileClose={onMobileClose}
        />
      </aside>

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={onMobileClose}
        />
      )}

      {/* ── Mobile sidebar (full-height overlay) ── */}
      <aside
        className="md:hidden fixed top-0 left-0 h-full z-50 flex flex-col border-r overflow-hidden"
        style={{
          width:           SIDEBAR_W_EXPANDED,
          backgroundColor: '#0a0a10',
          borderColor:     '#1a1a28',
          transform:       mobileOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_W_EXPANDED}px)`,
          transition:      'transform 220ms ease',
          boxShadow:       mobileOpen ? '4px 0 32px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <SidebarContent
          collapsed={false}
          onToggle={onToggle}
          activePage={activePage}
          onNavigate={onNavigate}
          isMobile
          onMobileClose={onMobileClose}
        />
      </aside>
    </>
  )
}
