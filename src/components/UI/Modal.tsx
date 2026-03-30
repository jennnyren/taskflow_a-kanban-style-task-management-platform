import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  onClose:    () => void
  children:   React.ReactNode
  width?:     number | string
  /** Extra classes on the inner card */
  className?: string
}

export function Modal({ onClose, children, width = 860, className = '' }: ModalProps) {
  // ── Body scroll lock ─────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // ── Escape to close ───────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{
          backgroundColor: 'rgba(0,0,0,0.72)',
          backdropFilter:  'blur(4px)',
          animation:       'modalBackdropIn 160ms ease forwards',
        }}
        onClick={onClose}
      />

      {/* Card */}
      <div
        className={`fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[calc(100vw-32px)] max-h-[90vh] rounded-2xl border flex flex-col
          overflow-hidden shadow-2xl ${className}`}
        style={{
          maxWidth:        width,
          backgroundColor: '#16161f',
          borderColor:     '#252535',
          boxShadow:       '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.06)',
          animation:       'modalCardIn 180ms cubic-bezier(0.16,1,0.3,1) forwards',
        }}
        // Prevent clicks inside the card from closing
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>

      <style>{`
        @keyframes modalBackdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalCardIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)) scale(0.97); }
          to   { opacity: 1; transform: translate(-50%, -50%)               scale(1);    }
        }
      `}</style>
    </>,
    document.body,
  )
}
