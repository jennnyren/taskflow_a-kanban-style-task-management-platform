import { differenceInCalendarDays, isPast, isToday, parseISO } from 'date-fns'

export type DueDateStatus = 'overdue' | 'due_today' | 'due_soon' | 'upcoming'

/**
test code change
 * Classifies a due_date string into a status bucket for visual styling.
 * Returns null when dueDate is null (no badge should be shown).
 *
 * - overdue:   date is strictly in the past (not today)
 * - due_today: date is today
 * - due_soon:  within the next 1–3 calendar days
 * - upcoming:  more than 3 days away
 */
export function getDueDateStatus(dueDate: string | null): DueDateStatus | null {
  if (!dueDate) return null
  const date = parseISO(dueDate)
  if (isToday(date)) return 'due_today'
  if (isPast(date))  return 'overdue'
  const daysUntil = differenceInCalendarDays(date, new Date())
  if (daysUntil <= 3) return 'due_soon'
  return 'upcoming'
}
