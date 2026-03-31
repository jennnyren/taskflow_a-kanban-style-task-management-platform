import { Trash2 } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useAllComments } from '../../hooks/useComments'
import { useState } from 'react'
import type { CommentWithTask } from '../../hooks/useComments'

interface CommentsPageProps {
  onOpenTask: (projectId: string, taskId: string) => void
}

// ─── Single comment entry ─────────────────────────────────────────────────────

function CommentEntry({
  comment,
  onDelete,
  onOpenTask,
}: {
  comment:    CommentWithTask
  onDelete:   (id: string) => void
  onOpenTask: (projectId: string, taskId: string) => void
}) {
  const [hovered, setHovered] = useState(false)

  const task    = comment.tasks
  const project = task?.projects

  return (
    <div
      className="rounded-2xl border p-4 transition-all cursor-pointer"
      style={{ backgroundColor: '#13131c', borderColor: hovered ? '#313147' : '#1e1e2e' }}
      onClick={() => task && project && onOpenTask(project.id, task.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Project color dot */}
        <div
          className="w-1.5 h-full rounded-full shrink-0 mt-1.5 self-stretch"
          style={{ backgroundColor: project?.color ?? '#3a3a55', minHeight: 16 }}
        />

        <div className="flex-1 min-w-0">
          {/* Breadcrumb: project / task */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {project && (
              <>
                <span
                  className="text-[10px] font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: project.color }}
                >
                  {project.icon ?? '📋'} {project.name}
                </span>
                <span style={{ color: '#2a2a40', fontSize: 10 }}>/</span>
              </>
            )}
            <span
              className="text-[10px] font-medium truncate"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#6060a0' }}
            >
              {task?.title ?? 'Unknown task'}
            </span>
          </div>

          {/* Comment content */}
          <p
            className="text-sm leading-relaxed break-words"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#b0b0c8' }}
          >
            {comment.content}
          </p>

          {/* Timestamp */}
          <p
            className="text-[10px] mt-1.5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#3a3a55' }}
          >
            {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}
          </p>
        </div>

        {/* Delete */}
        {hovered && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(comment.id) }}
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            style={{ color: '#5a3040' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#2a1520'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5a3040' }}
            title="Delete comment"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Comments page ────────────────────────────────────────────────────────────

export function CommentsPage({ onOpenTask }: CommentsPageProps) {
  const { comments, loading, deleteComment } = useAllComments()

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#0e0e14' }}>
      <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col gap-4">

        <div>
          <h1
            className="text-lg font-bold mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e8e8f8' }}
          >
            Comments
          </h1>
          <p
            className="text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#5a5a78' }}
          >
            All comments across every task, newest first.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-center py-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}>
            Loading…
          </p>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
              style={{ backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              💬
            </div>
            <p className="text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#4a4a60' }}>
              No comments yet across any tasks.
            </p>
          </div>
        ) : (
          comments.map(c => (
            <CommentEntry
              key={c.id}
              comment={c}
              onDelete={deleteComment}
              onOpenTask={onOpenTask}
            />
          ))
        )}
      </div>
    </div>
  )
}
