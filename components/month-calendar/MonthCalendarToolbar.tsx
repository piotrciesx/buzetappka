import { useState, type CSSProperties } from 'react'
import type { HeatmapMode, HeatmapVariant } from './monthCalendarTypes'
import MonthCalendarHeader from './MonthCalendarHeader'
import MonthCalendarHeatmapControls from './MonthCalendarHeatmapControls'
import DropdownShell from '../dropdown/DropdownShell'

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <>
      <MonthCalendarHeader title={title} subtitle={subtitle} styles={styles} />
      {showHeatmapControls && (
        <DropdownShell
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          size="utility"
          trigger={(triggerProps) => (
            <button type="button" aria-label="Ustawienia heatmapy" title="Ustawienia heatmapy" {...triggerProps}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <circle cx="5" cy="12" r="1.8" fill="currentColor" />
                <circle cx="12" cy="12" r="1.8" fill="currentColor" />
                <circle cx="19" cy="12" r="1.8" fill="currentColor" />
              </svg>
            </button>
          )}
        >
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
              <button type="button" className="ui-dropdown__item" onClick={onResetHeatmapSettings}>
                Reset
              </button>
            )}
        </DropdownShell>
      )}
    </>
  )
}
