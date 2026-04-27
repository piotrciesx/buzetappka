import type { CSSProperties } from 'react'

type MonthCalendarHeaderProps = {
  title: string
  subtitle: string
  styles: Record<string, CSSProperties>
}

export default function MonthCalendarHeader({
  title,
  subtitle,
  styles,
}: MonthCalendarHeaderProps) {
  return (
    <>
      <div style={styles.sectionTitle}>{title}</div>
      <div style={{ ...styles.pageSubtitle, marginBottom: 0 }}>{subtitle}</div>
    </>
  )
}
