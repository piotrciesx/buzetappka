import type { CSSProperties } from 'react'

type MonthCalendarEmptyStateProps = {
  children: string
  styles: Record<string, CSSProperties>
}

export default function MonthCalendarEmptyState({
  children,
  styles,
}: MonthCalendarEmptyStateProps) {
  return <div style={styles.emptyStateCard}>{children}</div>
}
