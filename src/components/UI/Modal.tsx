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
      {/* Centering wrapper — flexbox does all the positioning, no transforms needed */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ animation: 'modalBackdropIn 160ms ease forwards' }}
      >
        {/* Backdrop — fills the wrapper, sits behind the card */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />

        {/* Card — centered by flexbox parent, animation is scale+fade only */}
        <div
          className={`relative z-10 w-full max-h-[90vh] rounded-2xl border flex flex-col
            overflow-hidden shadow-2xl ${className}`}
          style={{
            maxWidth:        width,
            backgroundColor: '#16161f',
            borderColor:     '#252535',
            boxShadow:       '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.06)',
            animation:       'modalCardIn 200ms cubic-bezier(0.16,1,0.3,1) forwards',
          }}
          onClick={e => e.stopPropagation()}
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalBackdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalCardIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);     }
        }
      `}</style>
    </>,
    document.body,
  )
}
