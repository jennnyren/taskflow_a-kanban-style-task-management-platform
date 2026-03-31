import { useEffect, useRef, useState } from 'react'
import { Trash2, MessageSquare } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useTaskComments } from '../../hooks/useComments'
import type { Comment } from '../../lib/types'

// ─── Single comment row ───────────────────────────────────────────────────────

function CommentRow({
  comment,
  onDelete,
}: {
  comment:  Comment
  onDelete: (id: string) => void
}) {
  const [hovered,  setHovered]  = useState(false)
  const [deleting, setDeleting] = useState(false)

  function handleDelete() {
    setDeleting(true)
    onDelete(comment.id)
  }

  return (
    <div
      className="group flex gap-2.5 py-2.5 border-b"
      style={{ borderColor: '#1e1e2e' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar placeholder dot */}
      <div
        className="w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
        style={{ backgroundColor: '#1e1e2e' }}
      >
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3a3a55' }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className="text-[11px] font-semibold"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#7070a0' }}
          >
            You
          </span>
          <span
            className="text-[10px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#3a3a55' }}
          >
            {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        <p
          className="text-[13px] leading-relaxed break-words"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#b0b0c8' }}
        >
          {comment.content}
        </p>
      </div>

      {hovered && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-colors"
          style={{ color: '#5a3040' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2a1520'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5a3040' }}
          title="Delete comment"
        >
          <Trash2 size={11} />
        </button>
      )}
    </div>
  )
}

// ─── Add comment input ────────────────────────────────────────────────────────

function AddCommentInput({ onSubmit }: { onSubmit: (content: string) => Promise<void> }) {
  const [value,   setValue]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const textareaRef           = useRef<HTMLTextAreaElement>(null)

  async function submit() {
    const trimmed = value.trim()
    if (!trimmed || saving) return
    setSaving(true)
    await onSubmit(trimmed)
    setValue('')
    setSaving(false)
    textareaRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="pt-3">
      <textarea
        ref={textareaRef}
        rows={2}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={saving}
        placeholder="Add a comment… (Ctrl+Enter to submit)"
        className="w-full rounded-xl px-3 py-2.5 text-sm border resize-none outline-none"
        style={{
          fontFamily:      "'Plus Jakarta Sans', sans-serif",
          backgroundColor: '#0e0e14',
          borderColor:     '#252535',
          color:           '#c0c0d8',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#6366f1' }}
        onBlur={e  => { e.currentTarget.style.borderColor = '#252535' }}
      />
      <div className="flex justify-end mt-1.5">
        <button
          onClick={submit}
          disabled={saving || !value.trim()}
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-opacity"
          style={{
            fontFamily:      "'Space Grotesk', sans-serif",
            backgroundColor: '#6366f1',
            color:           '#fff',
            opacity:         saving || !value.trim() ? 0.4 : 1,
          }}
        >
          {saving ? 'Posting…' : 'Comment'}
        </button>
      </div>
    </div>
  )
}

// ─── Comment list (used inside TaskModal) ────────────────────────────────────

export function CommentList({ taskId }: { taskId: string }) {
  const { comments, loading, addComment, deleteComment } = useTaskComments(taskId)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new comment added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  async function handleAdd(content: string) {
    await addComment(content)
    // activity_log insert is handled inside useTaskComments.addComment
  }

  return (
    <div className="mt-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={13} style={{ color: '#5a5a78' }} />
        <span
          className="text-xs font-semibold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#5a5a78' }}
        >
          Comments
        </span>
        {comments.length > 0 && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: '#1e1e2e', color: '#5a5a78', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {comments.length}
          </span>
        )}
        <div className="flex-1 h-px" style={{ backgroundColor: '#1e1e2e' }} />
      </div>

      {/* Comment list */}
      {loading ? (
        <p className="text-[11px] py-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}>
          Loading…
        </p>
      ) : comments.length === 0 ? (
        <p
          className="text-[12px] py-3 text-center"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}
        >
          No comments yet
        </p>
      ) : (
        <>
          {comments.map(c => (
            <CommentRow key={c.id} comment={c} onDelete={deleteComment} />
          ))}
        </>
      )}

      <div ref={bottomRef} />

      {/* Add comment */}
      <AddCommentInput onSubmit={handleAdd} />
    </div>
  )
}
