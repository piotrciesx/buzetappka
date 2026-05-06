import type { ReactNode } from 'react'
import {
  calendarEmptyCellStyle,
  calendarGridStyle,
  calendarWeekdayStyle,
  calendarWeekdaysStyle,
  weekdayLabels,
} from './monthCalendarStyles'

type MonthCalendarGridProps = {
  firstDayOffset: number
  children: ReactNode
}

export default function MonthCalendarGrid({ firstDayOffset, children }: MonthCalendarGridProps) {
  return (
    <>
      <div data-month-calendar-weekdays="true" style={calendarWeekdaysStyle}>
        {weekdayLabels.map((label) => (
          <div key={label} style={calendarWeekdayStyle}>
            {label}
          </div>
        ))}
      </div>

      <div data-month-calendar-grid="true" style={calendarGridStyle}>
        {Array.from({ length: firstDayOffset }, (_, index) => (
          <div key={`empty-${index}`} style={calendarEmptyCellStyle} />
        ))}
        {children}
      </div>
    </>
  )
}
