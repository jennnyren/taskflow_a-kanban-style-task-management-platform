import { createPortal } from 'react-dom'
import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

// ─── Types (consumed by ToastContext) ─────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id:      string
  type:    ToastType
  message: string
}

// ─── Styling per type ─────────────────────────────────────────────────────────

const TOAST_STYLES: Record<ToastType, {
  border:    string
  iconColor: string
  Icon:      LucideIcon
}> = {
  success: {
    border:    'rgba(74,222,128,0.25)',
    iconColor: '#4ade80',
    Icon:      CheckCircle2,
  },
  error: {
    border:    'rgba(248,113,113,0.25)',
    iconColor: '#f87171',
    Icon:      XCircle,
  },
  info: {
    border:    'rgba(96,165,250,0.25)',
    iconColor: '#60a5fa',
    Icon:      Info,
  },
}

// ─── Individual toast ─────────────────────────────────────────────────────────

function ToastItem({
  toast,
  exiting,
  onDismiss,
}: {
  toast:     Toast
  exiting:   boolean
  onDismiss: () => void
}) {
  const { border, iconColor, Icon } = TOAST_STYLES[toast.type]

  return (
    <div
      className="flex items-start gap-2.5 w-full max-w-xs px-3.5 py-3 rounded-xl border shadow-2xl"
      style={{
        backgroundColor: '#1e1e2c',
        borderColor:     border,
        boxShadow:       '0 8px 32px rgba(0,0,0,0.6)',
        animation:       exiting
          ? 'toastOut 280ms ease-in forwards'
          : 'toastIn 220ms ease-out',
      }}
    >
      <span style={{ color: iconColor, marginTop: 1, flexShrink: 0, display: 'flex' }}>
        <Icon size={15} />
      </span>

      <p
        className="flex-1 text-xs leading-relaxed"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#c8c8e0' }}
      >
        {toast.message}
      </p>

      <button
        onClick={onDismiss}
        className="shrink-0 cursor-pointer"
        style={{ color: '#4a4a60', marginTop: 1 }}
        onMouseEnter={e => { e.currentTarget.style.color = '#8080a0' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#4a4a60' }}
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ─── Toast stack (rendered in portal) ────────────────────────────────────────

export function ToastStack({
  toasts,
  exiting,
  onDismiss,
}: {
  toasts:    Toast[]
  exiting:   Set<string>
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return createPortal(
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0)    scale(1);    }
          to   { opacity: 0; transform: translateX(20px) scale(0.97); }
        }
      `}</style>

      <div
        className="fixed bottom-5 right-5 flex flex-col gap-2 z-[9999] pointer-events-none"
        style={{ width: 320 }}
      >
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem
              toast={t}
              exiting={exiting.has(t.id)}
              onDismiss={() => onDismiss(t.id)}
            />
          </div>
        ))}
      </div>
    </>,
    document.body,
  )
}
