import { useMemo, useState } from 'react'
import { getDueDateStatus } from '../lib/utils'
import type { TaskWithRelations, TaskPriority } from '../lib/types'

export interface FilterState {
  search:   string
  priority: 'all' | TaskPriority
  assignee: string  // 'all' or member id
  label:    string  // 'all' or label id
  dueDate:  'all' | 'overdue' | 'this_week' | 'no_date'
}

const DEFAULTS: FilterState = {
  search:   '',
  priority: 'all',
  assignee: 'all',
  label:    'all',
  dueDate:  'all',
}

export function useFilters(tasks: TaskWithRelations[]) {
  const [filters, setFilters] = useState<FilterState>(DEFAULTS)

  const filtered = useMemo(() => {
    const { search, priority, assignee, label, dueDate } = filters
    return tasks.filter(task => {
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false
      if (priority !== 'all' && task.priority !== priority) return false
      if (assignee !== 'all' && !task.assignees.some(a => a.id === assignee)) return false
      if (label   !== 'all' && !task.labels.some(l => l.id === label)) return false
      if (dueDate === 'overdue'   && getDueDateStatus(task.due_date) !== 'overdue') return false
      if (dueDate === 'this_week') {
        const s = getDueDateStatus(task.due_date)
        if (!s || s === 'upcoming') return false
      }
      if (dueDate === 'no_date' && task.due_date !== null) return false
      return true
    })
  }, [tasks, filters])

  const activeCount = useMemo(() => (
    (filters.search   ? 1 : 0) +
    (filters.priority !== 'all' ? 1 : 0) +
    (filters.assignee !== 'all' ? 1 : 0) +
    (filters.label    !== 'all' ? 1 : 0) +
    (filters.dueDate  !== 'all' ? 1 : 0)
  ), [filters])

  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function clear() {
    setFilters(DEFAULTS)
  }

  return { filters, set, filtered, activeCount, clear }
}
