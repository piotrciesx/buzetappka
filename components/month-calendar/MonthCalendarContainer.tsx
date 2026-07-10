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
  rightPanel: ReactNode
  suggestionMenu: ReactNode
}

export default function MonthCalendarContainer({
  firstDayOffset,
  dayCells,
  heatmapMode,
  legendLabels,
  toolbar,
  notices,
  noDaySection,
  rightPanel,
  suggestionMenu,
}: MonthCalendarContainerProps) {
  return (
    <>
      <CalendarSurface data-month-calendar-panel="true" style={calendarPanelStyle}>
        <div data-month-calendar-workspace="true">
          <div data-month-calendar-left-pane="true">
            {toolbar}
            {notices}
            <MonthCalendarLegend heatmapMode={heatmapMode} legendLabels={legendLabels} />
            <MonthCalendarGrid firstDayOffset={firstDayOffset}>{dayCells}</MonthCalendarGrid>
            {noDaySection}
          </div>
          <aside data-month-calendar-right-pane="true">{rightPanel}</aside>
        </div>
      </CalendarSurface>

      {suggestionMenu}
    </>
  )
}
