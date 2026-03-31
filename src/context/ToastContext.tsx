import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { ToastStack } from '../components/UI/Toast'
import type { Toast, ToastType } from '../components/UI/Toast'

// ─── Context ──────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

const DISMISS_AFTER   = 3500  // ms before fade starts
const ANIM_DURATION   = 280   // ms fade-out animation

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts,  setToasts]  = useState<Toast[]>([])
  const [exiting, setExiting] = useState<Set<string>>(new Set())
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    // Start exit animation
    setExiting(prev => new Set(prev).add(id))
    // Remove after animation completes
    const t = setTimeout(() => {
      setToasts(prev  => prev.filter(t => t.id !== id))
      setExiting(prev => { const s = new Set(prev); s.delete(id); return s })
      timers.current.delete(id)
    }, ANIM_DURATION)
    timers.current.set(id + '_exit', t)
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, type, message }])

    // Auto-dismiss
    const t = setTimeout(() => dismiss(id), DISMISS_AFTER)
    timers.current.set(id, t)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastStack toasts={toasts} exiting={exiting} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
