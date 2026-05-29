import type { HeatmapMode } from './monthCalendarTypes'
import {
  heatmapLegendBarStyle,
  heatmapLegendLabelsStyle,
  heatmapLegendStyle,
} from './monthCalendarStyles'
import {
  CalendarLegend,
  HeatmapScale,
} from '../reminder-calendar/reminderCalendarPrimitives'

type MonthCalendarLegendProps = {
  heatmapMode: HeatmapMode
  legendLabels: {
    left: string
    right: string
  }
}

export default function MonthCalendarLegend({
  heatmapMode,
  legendLabels,
}: MonthCalendarLegendProps) {
  if (heatmapMode !== 'balance') {
    return null
  }

  return (
    <CalendarLegend style={heatmapLegendStyle}>
      <div style={heatmapLegendLabelsStyle}>
        <span>{legendLabels.left}</span>
        <span>{legendLabels.right}</span>
      </div>
      <HeatmapScale style={heatmapLegendBarStyle} />
    </CalendarLegend>
  )
}
