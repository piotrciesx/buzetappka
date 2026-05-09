import type { CSSProperties } from 'react'

type MonthCalendarHeaderProps = {
  title: string
  subtitle: string
  styles: Record<string, CSSProperties>
}

export default function MonthCalendarHeader({
  subtitle,
  styles,
}: MonthCalendarHeaderProps) {
  return (
    <>
      {subtitle && <div style={{ ...styles.pageSubtitle, marginBottom: 0 }}>{subtitle}</div>}
    </>
  )
}
