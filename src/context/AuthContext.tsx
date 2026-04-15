import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Module-level auth setup — runs once, unaffected by StrictMode double-invocation.
// onAuthStateChange internally calls getSession() when subscribed; if subscribed
// inside a useEffect it runs twice in StrictMode, causing auth-lock contention.
let authInitPromise: Promise<User | null> | null = null
const authStateListeners = new Set<(user: User | null) => void>()

supabase.auth.onAuthStateChange((_event, session) => {
  authStateListeners.forEach((fn) => fn(session?.user ?? null))
})

function getOrInitAuth(): Promise<User | null> {
  if (!authInitPromise) {
    authInitPromise = (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) return session.user

      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      return data.user
    })().catch((err) => {
      authInitPromise = null
      throw err
    })
  }
  return authInitPromise
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getOrInitAuth()
      .then((u) => { if (!cancelled) { setUser(u); setLoading(false) } })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Authentication failed')
          setLoading(false)
        }
      })

    // Keep user in sync across tabs / token refreshes via the module-level listener
    const listener = (u: User | null) => { if (!cancelled) setUser(u) }
    authStateListeners.add(listener)

    return () => {
      cancelled = true
      authStateListeners.delete(listener)
    }
  }, [])

  if (loading) return <LoadingScreen />
  if (error)   return <ErrorScreen message={error} />
  if (!user)   return <ErrorScreen message="No user session. Please refresh." />

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0f0f13]">
      {/* Animated logo mark */}
      <div className="relative mb-8">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2"  width="10" height="10" rx="2.5" fill="#6366f1" opacity="0.9" />
            <rect x="16" y="2" width="10" height="10" rx="2.5" fill="#6366f1" opacity="0.5" />
            <rect x="2" y="16" width="10" height="10" rx="2.5" fill="#6366f1" opacity="0.5" />
            <rect x="16" y="16" width="10" height="10" rx="2.5" fill="#6366f1" opacity="0.25" />
          </svg>
        </div>
        {/* Orbit ring */}
        <div
          className="absolute inset-0 rounded-2xl border border-indigo-400/30"
          style={{ animation: 'spin 2s linear infinite' }}
        />
      </div>

      <p
        className="text-sm font-medium tracking-widest uppercase text-slate-500"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Loading
      </p>

      {/* Pulse dots */}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-500"
            style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}

// ─── Error screen ─────────────────────────────────────────────────────────────

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0f0f13] gap-4">
      <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 6v5M10 14h.01" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8.5 2.9L1.6 14.7A1.75 1.75 0 003.1 17.5h13.8a1.75 1.75 0 001.5-2.8L11.5 2.9a1.75 1.75 0 00-3 0z" stroke="#f43f5e" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="text-center">
        <p
          className="text-sm font-semibold text-rose-400 mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Authentication Error
        </p>
        <p className="text-xs text-slate-500 max-w-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {message}
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors cursor-pointer"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Retry
      </button>
    </div>
  )
}
