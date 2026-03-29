import { Menu } from 'lucide-react'
import type { Page } from './AppLayout'

const PAGE_LABELS: Record<Page, string> = {
  workspace: 'Workspace',
  team:      'Team',
  comments:  'Comments',
  labels:    'Labels',
  activity:  'Activity',
}

interface HeaderProps {
  activePage:       Page
  onMobileMenuOpen: () => void
}

export function Header({ activePage, onMobileMenuOpen }: HeaderProps) {
  return (
    <header
      className="flex items-center h-14 px-5 shrink-0 border-b gap-3"
      style={{ backgroundColor: '#0e0e14', borderColor: '#1e1e2e' }}
    >
      {/* Mobile hamburger — hidden on md+ */}
      <button
        onClick={onMobileMenuOpen}
        className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors shrink-0 cursor-pointer"
        style={{ color: '#6a6a88' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1e1e2e'; e.currentTarget.style.color = '#a0a0b8' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6a6a88' }}
      >
        <Menu size={18} />
      </button>

      {/* Page title */}
      <h1
        className="text-sm font-semibold"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#c0c0d8' }}
      >
        {PAGE_LABELS[activePage]}
      </h1>

      {/* Spacer — search bar + filters slot in here during Phase 12 */}
      <div className="flex-1" />
    </header>
  )
}
