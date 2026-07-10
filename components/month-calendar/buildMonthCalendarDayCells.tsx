import { CSSProperties, ReactNode } from 'react'
import { isDateBeforeBudgetStart, isFutureDate } from '../../lib/dateUtils'
import {
  formatAmount,
  getBalanceHeatmapVisual,
  getDirectionalHeatmapVisual,
} from './monthCalendarPanelUtils'
import {
  calendarDayCellStyle,
  calendarDayCountStyle,
  calendarDayMetaStyle,
  calendarDayNumberStyle,
} from './monthCalendarStyles'
import { HeatmapMode, MonthCalendarPanelProps } from './monthCalendarTypes'
import { CalendarCell } from '../reminder-calendar/reminderCalendarPrimitives'

type DayStats = Record<string, { count: number; rawSum: number; signedSum: number }>

type Args = {
  daysInMonth: number
  selectedMonth: string
  selectedDay: string | null
  budgetStartDate: string | null | undefined
  dayStats: DayStats
  heatmapMode: HeatmapMode
  heatmapVariant: MonthCalendarPanelProps['heatmapVariant']
  heatmapInverted: boolean
  negativeHeatmapReference: number
  positiveHeatmapReference: number
  sumHeatmapReference: number
  getDayMetricLabel: () => string
  getDayMetricValue: (stats: { rawSum: number; signedSum: number } | undefined) => number
  setSelectedDay: (value: string) => void
}

export const buildMonthCalendarDayCells = ({
  daysInMonth,
  selectedMonth,
  selectedDay,
  budgetStartDate,
  dayStats,
  heatmapMode,
  heatmapVariant,
  heatmapInverted,
  negativeHeatmapReference,
  positiveHeatmapReference,
  sumHeatmapReference,
  getDayMetricLabel,
  getDayMetricValue,
  setSelectedDay,
}: Args): ReactNode[] => {
  const dayCells: ReactNode[] = []

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayKey = String(day).padStart(2, '0')
    const dateText = `${selectedMonth}-${dayKey}`
    const stats = dayStats[dayKey]
    const dayMetricValue = getDayMetricValue(stats)
    const isActive = selectedDay === dayKey
    const isBeforeBudgetStart = isDateBeforeBudgetStart(dateText, budgetStartDate)
    const isFuture = isFutureDate(dateText)

    let cellStyle: CSSProperties = calendarDayCellStyle
    let dynamicTextColor = 'var(--ui-color-primary-text)'

    if (isFuture) {
      cellStyle = {
        ...calendarDayCellStyle,
        background: 'var(--ui-color-soft-section-background)',
        border: '1px solid var(--ui-color-disabled-border)',
        opacity: 0.62,
      }
      dynamicTextColor = 'var(--ui-color-secondary-text)'
    } else if (isBeforeBudgetStart) {
      cellStyle = {
        ...calendarDayCellStyle,
        background: 'var(--ui-color-soft-section-background)',
        border: '1px dashed var(--ui-color-soft-border)',
        opacity: 0.58,
      }
      dynamicTextColor = 'var(--ui-color-secondary-text)'
    } else if (heatmapMode === 'normal') {
      cellStyle = isActive
        ? {
            ...calendarDayCellStyle,
            background: 'rgba(255, 255, 255, 0.92)',
            border: '1px solid var(--ui-day-accent-border-hover)',
          }
        : calendarDayCellStyle
    } else {
      const visual =
        heatmapVariant === 'balance'
          ? getBalanceHeatmapVisual(
              stats?.signedSum || 0,
              negativeHeatmapReference,
              positiveHeatmapReference,
              heatmapInverted
            )
          : getDirectionalHeatmapVisual(
              stats?.rawSum || 0,
              sumHeatmapReference,
              heatmapVariant === 'income' ? 8 : 145,
              heatmapVariant === 'income' ? 145 : 8,
              heatmapInverted
            )

      dynamicTextColor = visual.textColor

      cellStyle = {
        ...calendarDayCellStyle,
        background: visual.background,
        border: `1px solid ${visual.borderColor}`,
      }

      if (isActive) {
        cellStyle = {
          ...cellStyle,
          border: '1px solid var(--ui-day-accent-border-hover)',
        }
      }
    }

    const cellState = isBeforeBudgetStart
      ? 'disabled'
      : isFuture
        ? 'future'
        : isActive
          ? 'selected'
          : 'default'

    dayCells.push(
      <CalendarCell
        key={dayKey}
        type="button"
        state={cellState}
        style={cellStyle}
        disabled={isBeforeBudgetStart}
        onClick={() => setSelectedDay(dayKey)}
      >
        <div style={{ ...calendarDayNumberStyle, color: dynamicTextColor }}>{day}</div>

        {isBeforeBudgetStart ? (
          <div style={{ ...calendarDayMetaStyle, color: dynamicTextColor }}>Poza zakresem</div>
        ) : isFuture ? (
          <div style={{ ...calendarDayMetaStyle, color: dynamicTextColor }}>Przyszłość</div>
        ) : stats ? (
          <>
            <div
              style={{
                ...calendarDayMetaStyle,
                color: heatmapMode === 'balance' ? dynamicTextColor : calendarDayMetaStyle.color,
                fontWeight: 700,
              }}
              title={`${getDayMetricLabel()}: ${
                heatmapVariant === 'balance' && dayMetricValue > 0 ? '+' : ''
              }${formatAmount(dayMetricValue)} zł`}
            >
              <strong
                style={{
                  whiteSpace: 'nowrap',
                  color:
                    heatmapMode === 'normal' && dayMetricValue > 0
                      ? 'var(--ui-financial-income)'
                      : heatmapMode === 'normal' && dayMetricValue < 0
                        ? 'var(--ui-financial-expense)'
                        : undefined,
                }}
              >
                {heatmapVariant === 'balance' && dayMetricValue > 0 ? '+' : ''}
                {formatAmount(dayMetricValue)} zł
              </strong>
            </div>
            <div
              style={{
                ...calendarDayCountStyle,
                color: heatmapMode === 'balance' ? dynamicTextColor : calendarDayCountStyle.color,
              }}
            >
              {stats.count === 1 ? '1 wpis' : `${stats.count} wpisy`}
            </div>
          </>
        ) : (
          <div style={{ ...calendarDayMetaStyle, color: dynamicTextColor }}>Brak wpisów</div>
        )}
      </CalendarCell>
    )
  }

  return dayCells
}
