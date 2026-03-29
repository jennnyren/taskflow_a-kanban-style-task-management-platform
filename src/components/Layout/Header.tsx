export function Header() {
  return (
    <header
      className="flex items-center h-14 px-6 shrink-0 border-b"
      style={{ backgroundColor: '#0e0e14', borderColor: '#1e1e2e' }}
    >
      {/* Logo mark + wordmark */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#6366f1', boxShadow: '0 0 12px rgba(99,102,241,0.35)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1.2" fill="white" opacity="0.95" />
            <rect x="8" y="1" width="5" height="5" rx="1.2" fill="white" opacity="0.55" />
            <rect x="1" y="8" width="5" height="5" rx="1.2" fill="white" opacity="0.55" />
            <rect x="8" y="8" width="5" height="5" rx="1.2" fill="white" opacity="0.25" />
          </svg>
        </div>
        <span
          className="text-sm font-semibold tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e2e2f0' }}
        >
          Taskflow
        </span>
      </div>

      {/* Spacer — search bar + filters slotted in here during Phase 12 */}
      <div className="flex-1" />
    </header>
  )
}
