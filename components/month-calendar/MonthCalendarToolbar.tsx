import type { CSSProperties } from 'react'
import type { HeatmapMode, HeatmapVariant } from './monthCalendarTypes'
import MonthCalendarHeader from './MonthCalendarHeader'
import MonthCalendarHeatmapControls from './MonthCalendarHeatmapControls'
import { FoundationSegmentedControl } from '../ui/FoundationPrimitives'

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
        <div data-month-calendar-toolbar-controls="true">
          <MonthCalendarHeatmapControls
            heatmapMode={heatmapMode}
            heatmapInverted={heatmapInverted}
            showHeatmapControls={showHeatmapControls}
            onHeatmapModeChange={onHeatmapModeChange}
            onHeatmapInvertedChange={onHeatmapInvertedChange}
          />
          {onHeatmapVariantChange && (
            <FoundationSegmentedControl<HeatmapVariant>
              value={heatmapVariant}
              ariaLabel="Zakres kalendarza"
              density="compact"
              options={[
                { value: 'balance', label: 'Wszystkie' },
                { value: 'income', label: 'Przychody' },
                { value: 'expense', label: 'Wydatki' },
              ]}
              onChange={onHeatmapVariantChange}
            />
          )}
          {onResetHeatmapSettings && (
            <button type="button" data-ui-action="secondary" data-ui-action-intent="neutral" onClick={onResetHeatmapSettings}>
              Reset
            </button>
          )}
        </div>
      )}
    </>
  )
}
