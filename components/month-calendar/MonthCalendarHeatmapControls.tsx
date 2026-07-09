import type { HeatmapMode } from './monthCalendarTypes'
import { FoundationSegmentedControl } from '../ui/FoundationPrimitives'
import {
  heatmapBarStyle,
} from './monthCalendarStyles'

type MonthCalendarHeatmapControlsProps = {
  heatmapMode: HeatmapMode
  heatmapInverted: boolean
  showHeatmapControls: boolean
  onHeatmapModeChange: (value: HeatmapMode) => void
  onHeatmapInvertedChange: (value: boolean) => void
}

export default function MonthCalendarHeatmapControls({
  heatmapMode,
  heatmapInverted,
  showHeatmapControls,
  onHeatmapModeChange,
  onHeatmapInvertedChange,
}: MonthCalendarHeatmapControlsProps) {
  const displayMode = heatmapMode === 'balance' && heatmapInverted ? 'inverted' : heatmapMode

  const handleDisplayModeChange = (value: HeatmapMode | 'inverted') => {
    if (value === 'normal') {
      onHeatmapModeChange('normal')
      onHeatmapInvertedChange(false)
      return
    }

    onHeatmapModeChange('balance')
    onHeatmapInvertedChange(value === 'inverted')
  }

  return (
    <>
      {showHeatmapControls && (
        <>
          <div style={heatmapBarStyle}>
            <FoundationSegmentedControl<HeatmapMode | 'inverted'>
              value={displayMode}
              ariaLabel="Tryb kalendarza"
              density="compact"
              options={[
                { value: 'normal', label: 'Standard' },
                { value: 'balance', label: 'Heatmapa' },
                { value: 'inverted', label: 'Odwrócone kolory' },
              ]}
              onChange={handleDisplayModeChange}
            />
          </div>
        </>
      )}
    </>
  )
}
