import type { CSSProperties } from 'react'
import type { HeatmapMode } from './monthCalendarTypes'
import MonthCalendarHeader from './MonthCalendarHeader'
import MonthCalendarHeatmapControls from './MonthCalendarHeatmapControls'

type MonthCalendarToolbarProps = {
  title: string
  subtitle: string
  styles: Record<string, CSSProperties>
  heatmapMode: HeatmapMode
  heatmapInverted: boolean
  showHeatmapControls: boolean
  onHeatmapModeChange: (value: HeatmapMode) => void
  onHeatmapInvertedChange: (value: boolean) => void
}

export default function MonthCalendarToolbar({
  title,
  subtitle,
  styles,
  heatmapMode,
  heatmapInverted,
  showHeatmapControls,
  onHeatmapModeChange,
  onHeatmapInvertedChange,
}: MonthCalendarToolbarProps) {
  return (
    <>
      <MonthCalendarHeader title={title} subtitle={subtitle} styles={styles} />
      <MonthCalendarHeatmapControls
        heatmapMode={heatmapMode}
        heatmapInverted={heatmapInverted}
        showHeatmapControls={showHeatmapControls}
        onHeatmapModeChange={onHeatmapModeChange}
        onHeatmapInvertedChange={onHeatmapInvertedChange}
      />
    </>
  )
}
