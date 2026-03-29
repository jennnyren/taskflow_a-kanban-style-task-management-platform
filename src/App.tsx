import { useAuth } from './context/AuthContext'

function App() {
  const { user } = useAuth()

  return (
    <div
      className="min-h-screen bg-[#0f0f13] flex items-center justify-center"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="3" fill="#6366f1" />
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3 2" />
          </svg>
        </div>
        <p
          className="text-xs font-semibold tracking-widest uppercase text-emerald-400"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Authenticated
        </p>
        <p className="text-[11px] text-slate-500 font-mono bg-slate-800/60 px-3 py-1.5 rounded-md border border-slate-700/50">
          {user.id}
        </p>
      </div>
    </div>
  )
}

export default App
