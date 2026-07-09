import type { HeatmapMode } from './monthCalendarTypes'
import { FoundationSegmentedControl, FoundationSwitch } from '../ui/FoundationPrimitives'
import {
  heatmapBarStyle,
  heatmapSwitchRowStyle,
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
  return (
    <>
      {showHeatmapControls && (
        <>
          <div style={heatmapBarStyle}>
            <FoundationSegmentedControl<HeatmapMode>
              value={heatmapMode}
              ariaLabel="Tryb kalendarza"
              density="compact"
              options={[
                { value: 'normal', label: 'Standard' },
                { value: 'balance', label: 'Heatmapa' },
              ]}
              onChange={onHeatmapModeChange}
            />
          </div>

          <div style={heatmapSwitchRowStyle}>
            <span>Odwrócone kolory</span>
            <FoundationSwitch
              checked={heatmapInverted}
              onChange={onHeatmapInvertedChange}
              ariaLabel="Odwrócone kolory heatmapy"
              size="sm"
            />
          </div>
        </>
      )}
    </>
  )
}
