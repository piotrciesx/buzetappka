import type { ReactNode } from 'react'
import type { HeatmapMode } from './monthCalendarTypes'
import { calendarPanelStyle } from './monthCalendarStyles'
import MonthCalendarGrid from './MonthCalendarGrid'
import MonthCalendarLegend from './MonthCalendarLegend'
import { CalendarSurface } from '../reminder-calendar/reminderCalendarPrimitives'

type MonthCalendarContainerProps = {
  firstDayOffset: number
  dayCells: ReactNode[]
  heatmapMode: HeatmapMode
  legendLabels: {
    left: string
    right: string
  }
  toolbar: ReactNode
  notices?: ReactNode
  noDaySection: ReactNode
  suggestionMenu: ReactNode
  dayModal: ReactNode
}

export default function MonthCalendarContainer({
  firstDayOffset,
  dayCells,
  heatmapMode,
  legendLabels,
  toolbar,
  notices,
  noDaySection,
  suggestionMenu,
  dayModal,
}: MonthCalendarContainerProps) {
  return (
    <>
      <CalendarSurface data-month-calendar-panel="true" style={calendarPanelStyle}>
        {toolbar}
        {notices}
        <MonthCalendarLegend heatmapMode={heatmapMode} legendLabels={legendLabels} />
        <MonthCalendarGrid firstDayOffset={firstDayOffset}>{dayCells}</MonthCalendarGrid>
        {noDaySection}
      </CalendarSurface>

      {suggestionMenu}
      {dayModal}
    </>
  )
}
