import { useState } from 'react'
import type { TeamMember } from '../../lib/types'

interface MemberAvatarProps {
  member: TeamMember
  size?:  'sm' | 'md'
  /** Overlap stacking — negative margin when rendering in a row */
  stacked?: boolean
}

export function MemberAvatar({ member, size = 'md', stacked = false }: MemberAvatarProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const dim      = size === 'sm' ? 20 : 32
  const fontSize = size === 'sm' ?  9 : 13

  return (
    <div
      className="relative inline-flex items-center justify-center rounded-full shrink-0 font-bold select-none cursor-default"
      style={{
        width:           dim,
        height:          dim,
        backgroundColor: member.color,
        fontSize,
        color:           '#fff',
        fontFamily:      "'Space Grotesk', sans-serif",
        border:          '1.5px solid #13131c',
        marginLeft:      stacked ? -6 : 0,
        zIndex:          showTooltip ? 10 : 'auto',
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {member.name.charAt(0).toUpperCase()}

      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-lg whitespace-nowrap z-50 pointer-events-none"
          style={{
            fontSize:        10,
            backgroundColor: '#1a1a26',
            color:           '#c0c0d8',
            border:          '1px solid #252535',
            boxShadow:       '0 4px 12px rgba(0,0,0,0.5)',
            fontFamily:      "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {member.name}
        </div>
      )}
    </div>
  )
}

// ─── Avatar stack (up to N + overflow) ───────────────────────────────────────

interface AvatarStackProps {
  members:  TeamMember[]
  max?:     number
  size?:    'sm' | 'md'
}

export function AvatarStack({ members, max = 3, size = 'sm' }: AvatarStackProps) {
  if (members.length === 0) return null

  const visible  = members.slice(0, max)
  const overflow = members.length - max
  const dim      = size === 'sm' ? 20 : 32

  return (
    <div className="flex items-center" style={{ marginLeft: 6 }}>
      {visible.map((m, i) => (
        <MemberAvatar
          key={m.id}
          member={m}
          size={size}
          stacked={i > 0}
        />
      ))}
      {overflow > 0 && (
        <div
          className="inline-flex items-center justify-center rounded-full shrink-0 font-bold select-none"
          style={{
            width:           dim,
            height:          dim,
            fontSize:        size === 'sm' ? 8 : 10,
            backgroundColor: '#1e1e2e',
            color:           '#6060a0',
            border:          '1.5px solid #13131c',
            marginLeft:      -6,
            fontFamily:      "'Space Grotesk', sans-serif",
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
