import type { CSSProperties } from 'react'
import type { HeatmapMode, HeatmapVariant } from './monthCalendarTypes'
import MonthCalendarHeader from './MonthCalendarHeader'
import MonthCalendarHeatmapControls from './MonthCalendarHeatmapControls'

type MonthCalendarToolbarProps = {
  title: string
  subtitle: string
  styles: Record<string, CSSProperties>
  heatmapMode: HeatmapMode
  heatmapVariant: HeatmapVariant
  heatmapInverted: boolean
  showHeatmapControls: boolean
  onHeatmapModeChange: (value: HeatmapMode) => void
  onHeatmapVariantChange?: (value: HeatmapVariant) => void
  onHeatmapInvertedChange: (value: boolean) => void
  onResetHeatmapSettings?: () => void
}

export default function MonthCalendarToolbar({
  title,
  subtitle,
  styles,
  heatmapMode,
  heatmapVariant,
  heatmapInverted,
  showHeatmapControls,
  onHeatmapModeChange,
  onHeatmapVariantChange,
  onHeatmapInvertedChange,
  onResetHeatmapSettings,
}: MonthCalendarToolbarProps) {
  return (
    <>
      <MonthCalendarHeader title={title} subtitle={subtitle} styles={styles} />
      {showHeatmapControls && (
        <details data-month-calendar-settings-menu="true">
          <summary aria-label="Ustawienia heatmapy" title="Ustawienia heatmapy">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <circle cx="5" cy="12" r="1.8" fill="currentColor" />
              <circle cx="12" cy="12" r="1.8" fill="currentColor" />
              <circle cx="19" cy="12" r="1.8" fill="currentColor" />
            </svg>
          </summary>
          <div data-month-calendar-settings-panel="true">
            <MonthCalendarHeatmapControls
              heatmapMode={heatmapMode}
              heatmapInverted={heatmapInverted}
              showHeatmapControls={showHeatmapControls}
              onHeatmapModeChange={onHeatmapModeChange}
              onHeatmapInvertedChange={onHeatmapInvertedChange}
            />
            {onHeatmapVariantChange && (
              <label data-month-calendar-heatmap-field="true">
                <span>Tryb</span>
                <select
                  value={heatmapVariant}
                  onChange={(event) =>
                    onHeatmapVariantChange(event.target.value as HeatmapVariant)
                  }
                >
                  <option value="balance">bilans</option>
                  <option value="income">przychody</option>
                  <option value="expense">wydatki</option>
                </select>
              </label>
            )}
            {onResetHeatmapSettings && (
              <button type="button" onClick={onResetHeatmapSettings}>
                Reset
              </button>
            )}
          </div>
        </details>
      )}
    </>
  )
}
