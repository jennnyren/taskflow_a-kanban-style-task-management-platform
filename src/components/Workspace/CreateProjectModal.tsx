import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { COLOR_PALETTE, PROJECT_ICONS } from '../../lib/constants'
import type { UseProjects } from '../../hooks/useProjects'

interface CreateProjectModalProps {
  createProject: UseProjects['createProject']
  onClose:       () => void
  onCreated:     (id: string) => void
}

export function CreateProjectModal({ createProject, onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName]             = useState('')
  const [description, setDesc]      = useState('')
  const [color, setColor]           = useState(COLOR_PALETTE[0])
  const [icon, setIcon]             = useState(PROJECT_ICONS[0])
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const nameRef                     = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    const project = await createProject({
      name:        name.trim(),
      description: description.trim() || null,
      color,
      icon,
    })
    setSaving(false)
    if (!project) { setError('Failed to create project'); return }
    onCreated(project.id)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        className="fixed z-50 top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border shadow-2xl"
        style={{ backgroundColor: '#16161f', borderColor: '#252535' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b" style={{ borderColor: '#252535' }}>
          <h2
            className="text-sm font-semibold"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e2e2f0' }}
          >
            New Project
          </h2>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            style={{ color: '#5a5a78' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1e1e2e'; e.currentTarget.style.color = '#9090b0' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5a5a78' }}
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-medium"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#8080a0' }}
            >
              Name <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              ref={nameRef}
              value={name}
              onChange={e => { setName(e.target.value); setError(null) }}
              placeholder="e.g. Website Redesign"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none border transition-colors"
              style={{
                fontFamily:      "'Plus Jakarta Sans', sans-serif",
                backgroundColor: '#0e0e14',
                borderColor:     error ? '#f87171' : '#252535',
                color:           '#e2e2f0',
              }}
              onFocus={e  => { e.currentTarget.style.borderColor = '#6366f1' }}
              onBlur={e   => { e.currentTarget.style.borderColor = error ? '#f87171' : '#252535' }}
            />
            {error && (
              <p className="text-[11px]" style={{ color: '#f87171', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {error}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-medium"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#8080a0' }}
            >
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder="What's this project about?"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none border resize-none transition-colors"
              style={{
                fontFamily:      "'Plus Jakarta Sans', sans-serif",
                backgroundColor: '#0e0e14',
                borderColor:     '#252535',
                color:           '#e2e2f0',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#6366f1' }}
              onBlur={e  => { e.currentTarget.style.borderColor = '#252535' }}
            />
          </div>

          {/* Color + Icon row */}
          <div className="flex gap-4">

            {/* Color picker */}
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                className="text-xs font-medium"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#8080a0' }}
              >
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full transition-transform cursor-pointer"
                    style={{
                      backgroundColor: c,
                      outline:         color === c ? `2px solid ${c}` : 'none',
                      outlineOffset:   '2px',
                      transform:       color === c ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Icon picker */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-medium"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#8080a0' }}
              >
                Icon
              </label>
              <div className="grid grid-cols-5 gap-1">
                {PROJECT_ICONS.map(em => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className="w-7 h-7 rounded-lg text-base flex items-center justify-center transition-colors cursor-pointer"
                    style={{
                      backgroundColor: icon === em ? 'rgba(99,102,241,0.2)' : 'transparent',
                      border:          icon === em ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                    }}
                    onMouseEnter={e => { if (icon !== em) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { if (icon !== em) e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Preview strip */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
            style={{ backgroundColor: '#0e0e14', borderColor: '#252535', borderLeft: `3px solid ${color}` }}
          >
            <span className="text-xl">{icon}</span>
            <span
              className="text-sm font-medium truncate"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: name ? '#e2e2f0' : '#3a3a50' }}
            >
              {name || 'Project name…'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              style={{
                fontFamily:      "'Plus Jakarta Sans', sans-serif",
                color:           '#6a6a88',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1e1e2e' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-opacity cursor-pointer"
              style={{
                fontFamily:      "'Plus Jakarta Sans', sans-serif",
                backgroundColor: color,
                color:           '#fff',
                opacity:         saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Creating…' : 'Create project'}
            </button>
          </div>

        </form>
      </div>
    </>
  )
}
