import type { HeatmapMode } from './monthCalendarTypes'
import {
  heatmapBarStyle,
  heatmapLegendBarStyle,
  heatmapLegendLabelsStyle,
  heatmapLegendStyle,
  heatmapSwitchRowStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from './monthCalendarStyles'

type MonthCalendarHeatmapControlsProps = {
  heatmapMode: HeatmapMode
  heatmapInverted: boolean
  showHeatmapControls: boolean
  legendLabels: {
    left: string
    right: string
  }
  onHeatmapModeChange: (value: HeatmapMode) => void
  onHeatmapInvertedChange: (value: boolean) => void
}

export default function MonthCalendarHeatmapControls({
  heatmapMode,
  heatmapInverted,
  showHeatmapControls,
  legendLabels,
  onHeatmapModeChange,
  onHeatmapInvertedChange,
}: MonthCalendarHeatmapControlsProps) {
  return (
    <>
      {showHeatmapControls && (
        <>
          <div style={heatmapBarStyle}>
            <button
              type="button"
              style={heatmapMode === 'normal' ? primaryButtonStyle : secondaryButtonStyle}
              onClick={() => onHeatmapModeChange('normal')}
            >
              zwykły
            </button>

            <button
              type="button"
              style={heatmapMode === 'balance' ? primaryButtonStyle : secondaryButtonStyle}
              onClick={() => onHeatmapModeChange('balance')}
            >
              heatmapa
            </button>
          </div>

          <label style={heatmapSwitchRowStyle}>
            <input
              type="checkbox"
              checked={heatmapInverted}
              onChange={(event) => onHeatmapInvertedChange(event.target.checked)}
            />
            <span>Odwróć kierunek kolorów</span>
          </label>
        </>
      )}

      {heatmapMode === 'balance' && (
        <div style={heatmapLegendStyle}>
          <div style={heatmapLegendLabelsStyle}>
            <span>{legendLabels.left}</span>
            <span>{legendLabels.right}</span>
          </div>
          <div style={heatmapLegendBarStyle} />
        </div>
      )}
    </>
  )
}
