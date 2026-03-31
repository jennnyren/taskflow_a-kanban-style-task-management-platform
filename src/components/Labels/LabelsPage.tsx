import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'
import { COLOR_PALETTE } from '../../lib/constants'
import type { LabelWithCount } from '../../hooks/useLabels'

// ─── Label card ───────────────────────────────────────────────────────────────

function LabelCard({
  label,
  onDelete,
}: {
  label:    LabelWithCount
  onDelete: (id: string) => void
}) {
  const [confirm,  setConfirm]  = useState(false)
  const [deleting, setDeleting] = useState(false)

  function handleDelete() {
    setDeleting(true)
    onDelete(label.id)
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: '#13131c', borderColor: '#1e1e2e' }}
    >
      <div className="h-[3px]" style={{ backgroundColor: label.color, opacity: 0.8 }} />

      <div className="px-4 py-3.5 flex flex-col gap-3">
        {/* Pill preview + name */}
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0"
            style={{
              backgroundColor: label.color + '22',
              border:          `1px solid ${label.color}55`,
              color:           label.color,
              fontFamily:      "'Space Grotesk', sans-serif",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: label.color }} />
            {label.name}
          </span>

          <span
            className="text-[11px] ml-auto"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}
          >
            {label.task_count} {label.task_count === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {/* Delete row */}
        <div className="pt-2 border-t" style={{ borderColor: '#1e1e2e' }}>
          {confirm ? (
            <div className="flex flex-col gap-1.5">
              <p
                className="text-[11px] text-center"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#fca5a5' }}
              >
                Delete this label?
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setConfirm(false)}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#1e1e2e', color: '#8080a0' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#252535' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1e1e2e' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", backgroundColor: '#2a1520', color: '#f87171', opacity: deleting ? 0.6 : 1 }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#3a1a28' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#2a1520' }}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirm(true)}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#5a3040', backgroundColor: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2a1520'; e.currentTarget.style.color = '#f87171' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5a3040' }}
            >
              <Trash2 size={11} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Create label form ────────────────────────────────────────────────────────

function CreateLabelForm({ onCreate }: { onCreate: (name: string, color: string) => Promise<void> }) {
  const [name,      setName]      = useState('')
  const [color,     setColor]     = useState(COLOR_PALETTE[0])
  const [saving,    setSaving]    = useState(false)
  const [nameError, setNameError] = useState(false)
  const inputRef                  = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setNameError(true); inputRef.current?.focus(); return }
    setNameError(false)
    setSaving(true)
    await onCreate(trimmed, color)
    setName('')
    setColor(COLOR_PALETTE[0])
    setSaving(false)
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-4 flex flex-col gap-3"
      style={{ backgroundColor: '#13131c', borderColor: '#252535' }}
    >
      <p
        className="text-xs font-semibold"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#a0a0b8' }}
      >
        Create label
      </p>

      {/* Live preview */}
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{
            backgroundColor: color + '22',
            border:          `1px solid ${color}55`,
            color,
            fontFamily:      "'Space Grotesk', sans-serif",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          {name || 'Preview'}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          value={name}
          onChange={e => { setName(e.target.value); if (nameError) setNameError(false) }}
          placeholder="Label name…"
          disabled={saving}
          className="w-full rounded-lg px-3 py-2 text-sm border outline-none"
          style={{
            fontFamily:      "'Plus Jakarta Sans', sans-serif",
            backgroundColor: '#0e0e14',
            borderColor:     nameError ? '#f87171' : '#252535',
            color:           '#ddddf0',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = nameError ? '#f87171' : '#6366f1' }}
          onBlur={e  => { e.currentTarget.style.borderColor = nameError ? '#f87171' : '#252535' }}
        />
        {nameError && (
          <p className="text-[11px]" style={{ color: '#f87171', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Name is required
          </p>
        )}
      </div>

      {/* Color swatches */}
      <div className="flex gap-2 flex-wrap">
        {COLOR_PALETTE.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className="w-6 h-6 rounded-full cursor-pointer transition-transform"
            style={{
              backgroundColor: c,
              outline:         color === c ? `2px solid ${c}` : 'none',
              outlineOffset:   2,
              transform:       color === c ? 'scale(1.15)' : 'scale(1)',
            }}
            title={c}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="py-2 rounded-xl text-sm font-semibold cursor-pointer transition-opacity"
        style={{
          fontFamily:      "'Space Grotesk', sans-serif",
          backgroundColor: color,
          color:           '#fff',
          opacity:         saving || !name.trim() ? 0.5 : 1,
        }}
      >
        {saving ? 'Creating…' : 'Create label'}
      </button>
    </form>
  )
}

// ─── Labels page ──────────────────────────────────────────────────────────────

export function LabelsPage() {
  const { labels, loading, error, createLabel, deleteLabel } = useLabels()

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#0e0e14' }}>
      <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col gap-6">

        <div>
          <h1
            className="text-lg font-bold mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e8e8f8' }}
          >
            Labels
          </h1>
          <p
            className="text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#5a5a78' }}
          >
            Create labels to categorise and filter your tasks.
          </p>
        </div>

        <CreateLabelForm onCreate={async (name, color) => { await createLabel(name, color) }} />

        {loading ? (
          <p className="text-sm text-center py-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}>
            Loading…
          </p>
        ) : error ? (
          <p className="text-sm text-center py-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#fca5a5' }}>
            {error}
          </p>
        ) : labels.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
              style={{ backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              🏷️
            </div>
            <p
              className="text-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}
            >
              No labels yet — create one above.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {labels.map(l => (
              <LabelCard key={l.id} label={l} onDelete={deleteLabel} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
