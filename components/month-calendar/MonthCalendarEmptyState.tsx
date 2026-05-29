import type { CSSProperties } from 'react'
import { CalendarEntryRow } from '../reminder-calendar/reminderCalendarPrimitives'

type MonthCalendarEmptyStateProps = {
  children: string
  styles: Record<string, CSSProperties>
}

export default function MonthCalendarEmptyState({
  children,
  styles,
}: MonthCalendarEmptyStateProps) {
  return <CalendarEntryRow style={styles.emptyStateCard}>{children}</CalendarEntryRow>
}
