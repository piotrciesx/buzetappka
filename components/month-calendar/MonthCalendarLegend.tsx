import type { HeatmapMode } from './monthCalendarTypes'
import {
  heatmapLegendBarStyle,
  heatmapLegendLabelsStyle,
  heatmapLegendStyle,
} from './monthCalendarStyles'

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
    <div style={heatmapLegendStyle}>
      <div style={heatmapLegendLabelsStyle}>
        <span>{legendLabels.left}</span>
        <span>{legendLabels.right}</span>
      </div>
      <div style={heatmapLegendBarStyle} />
    </div>
  )
}
