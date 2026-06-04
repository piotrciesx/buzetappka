'use client'

import { uiTypographyTokens } from '../../lib/uiFoundation'
import type { Category, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { GREEN, MUTED, RED } from './dashboardWidgetTileStyles'
import { formatMoney } from './dashboardWidgetTileUtils'
import { buildMonthRhythmDays, clamp, getBalanceHeatmapVisual, getColorForRhythm, getReferenceValue, type DayPoint } from './MonthRhythmWidgetData'
function MonthCalendarHeatmap({
  days,
  compact = false,
}: {
  days: DayPoint[]
  compact?: boolean
}) {
  const positiveReference = getReferenceValue(days.map((day) => day.net).filter((value) => value > 0))
  const negativeReference = getReferenceValue(
    days
      .map((day) => day.net)
      .filter((value) => value < 0)
      .map((value) => Math.abs(value))
  )
  const firstDayIndex = days[0] ? (new Date(`${days[0].date}T00:00:00`).getDay() + 6) % 7 : 0
  const cells: Array<DayPoint | null> = [
    ...Array.from({ length: firstDayIndex }, () => null),
    ...days,
  ]
  const weekLabels = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'nd']
  const cellSize = compact ? 32 : 36
  const gap = compact ? 4 : 5
  const calendarWidth = cellSize * 7 + gap * 6

  return (
    <div
      style={{
        minWidth: 0,
        minHeight: 0,
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        paddingBottom: compact ? 4 : 0,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: calendarWidth,
          maxWidth: '100%',
          minWidth: 0,
          display: 'grid',
          gridTemplateRows: compact ? '1fr' : 'auto 1fr',
          gap: compact ? 0 : 7,
          overflow: 'hidden',
        }}
      >
        {!compact && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(7, ${cellSize}px)`,
              gap,
              color: MUTED,
              fontSize: uiTypographyTokens.role.widgetMeta,
              fontWeight: uiTypographyTokens.weight.semibold,
              textAlign: 'center',
            }}
          >
            {weekLabels.map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>
        )}

        <div
          style={{
            minWidth: 0,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(7, ${cellSize}px)`,
            gap,
            overflow: 'hidden',
            alignContent: 'center',
            justifyContent: 'center',
          }}
        >
          {cells.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} style={{ width: cellSize, height: cellSize }} />
            }

            const visual = getBalanceHeatmapVisual(day.net, negativeReference, positiveReference)
            const isInactive = day.isFuture || day.isBeforeBudgetStart

            return (
              <div
                key={day.date}
                title={
                  day.isBeforeBudgetStart
                    ? `${day.day}: poza zakresem budżetu`
                    : `${day.day}: ${formatMoney(day.net)}`
                }
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: compact ? 8 : 9,
                  background: isInactive ? 'var(--ui-surface-soft)' : visual.background,
                  border: day.isBeforeBudgetStart
                    ? '1px dashed var(--ui-border-soft)'
                    : day.isFuture
                      ? '1px solid var(--ui-border-disabled)'
                      : `1px solid ${visual.borderColor}`,
                  display: 'grid',
                  placeItems: 'center',
                  color: isInactive ? MUTED : visual.textColor,
                  fontSize: uiTypographyTokens.role.widgetMeta,
                  fontWeight: uiTypographyTokens.weight.semibold,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  opacity: isInactive ? 0.62 : 1,
                }}
              >
                {day.day}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CashflowChart({ days }: { days: DayPoint[] }) {
  const width = 420
  const height = 102
  const values = days.map((day) => day.cumulative)
  const minValue = Math.min(0, ...values)
  const maxValue = Math.max(0, ...values)
  const hasRange = maxValue !== minValue
  const range = hasRange ? maxValue - minValue : 1
  const finalValue = values[values.length - 1] ?? 0
  const zeroY = hasRange ? height - ((0 - minValue) / range) * height : height / 2

  const getPoint = (value: number, index: number) => {
    const x = days.length > 1 ? (index / (days.length - 1)) * width : 0
    const y = hasRange ? height - ((value - minValue) / range) * height : height / 2
    return { x, y }
  }

  const segments = values.slice(1).map((value, index) => {
    const previous = values[index] ?? 0
    const from = getPoint(previous, index)
    const to = getPoint(value, index + 1)

    return {
      key: `${index}-${value}`,
      from,
      to,
      color: value < 0 || previous < 0 ? RED : GREEN,
    }
  })

  const finalPoint = getPoint(finalValue, Math.max(0, values.length - 1))
  const finalLabelColor = getColorForRhythm(finalValue)
  const finalLabelTop = hasRange ? clamp((finalPoint.y / height) * 100, 18, 82) : 42

  return (
    <div
      style={{
        minWidth: 0,
        minHeight: 0,
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr)',
        gap: 4,
        overflow: 'hidden',
      }}
    >
      <div style={{ color: 'var(--ui-text-primary)', fontSize: uiTypographyTokens.hierarchy.t3, fontWeight: uiTypographyTokens.weight.semibold }}>
        Trend
      </div>

      <div
        style={{
          minWidth: 0,
          minHeight: 0,
          display: 'grid',
          alignItems: 'center',
          justifyItems: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '88%',
            maxWidth: 430,
            height: '82%',
            justifySelf: 'center',
            alignSelf: 'center',
            minWidth: 0,
            minHeight: 0,
            position: 'relative',
            overflow: 'hidden',
            padding: '30px 54px 28px 92px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 30,
              bottom: 28,
              width: 90,
              color: MUTED,
              fontSize: uiTypographyTokens.role.metadata,
              fontWeight: uiTypographyTokens.weight.semibold,
              lineHeight: uiTypographyTokens.lineHeight.compact,
            }}
          >
            {hasRange ? (
              <>
                <span style={{ position: 'absolute', right: 10, top: 0, transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}>
                  {formatMoney(maxValue)}
                </span>
                <span style={{ position: 'absolute', right: 10, top: `${(zeroY / height) * 100}%`, transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}>
                  0 zł
                </span>
                <span style={{ position: 'absolute', right: 10, bottom: 0, transform: 'translateY(50%)', whiteSpace: 'nowrap' }}>
                  {formatMoney(minValue)}
                </span>
              </>
            ) : (
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap' }}>
                0 zł
              </span>
            )}
          </div>

          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Trend salda miesiąca"
            preserveAspectRatio="none"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              overflow: 'visible',
            }}
          >
            <line
              x1="0"
              x2={width}
              y1={zeroY}
              y2={zeroY}
              stroke="var(--ui-text-muted)"
              strokeWidth="1.2"
              strokeDasharray="5 5"
              vectorEffect="non-scaling-stroke"
            />

            {segments.map((segment) => (
              <line
                key={segment.key}
                x1={segment.from.x}
                y1={segment.from.y}
                x2={segment.to.x}
                y2={segment.to.y}
                stroke={segment.color}
                strokeWidth="2.9"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <circle cx={finalPoint.x} cy={finalPoint.y} r="3.9" fill={finalLabelColor} />
          </svg>

          <div
            style={{
              position: 'absolute',
              right: 40,
              top: hasRange ? `calc(${finalLabelTop}% - 32px)` : `calc(${finalLabelTop}% - 28px)`,
              color: finalLabelColor,
              fontSize: uiTypographyTokens.hierarchy.t3,
              fontWeight: uiTypographyTokens.weight.semibold,
              letterSpacing: 0,
              whiteSpace: 'nowrap',
              maxWidth: 146,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textShadow: '0 1px 0 var(--ui-glass-surface-strong)',
            }}
          >
            {formatMoney(finalValue)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MonthRhythmWidget({
  widget,
  transactions,
  selectedMonth,
  budgetStartDate,
  categoriesById,
  getSignedAmountForTransaction,
}: {
  widget: DashboardWidgetLayoutItem
  transactions: Transaction[]
  selectedMonth: string
  budgetStartDate: string
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}) {
  const isSmall = widget.width === 2
  const days = buildMonthRhythmDays({
    transactions,
    selectedMonth,
    budgetStartDate,
    categoriesById,
    getSignedAmountForTransaction,
  })
  const existingDays = days.filter((day) => !day.isFuture && !day.isBeforeBudgetStart)

  if (isSmall) {
    return (
      <div
        style={{
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr)',
          gap: 7,
          padding: '6px 10px 12px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ color: 'var(--ui-text-primary)', fontSize: uiTypographyTokens.role.label, fontWeight: uiTypographyTokens.weight.semibold, lineHeight: uiTypographyTokens.lineHeight.compact }}>
            Rytm dni
          </div>
        </div>

        <MonthCalendarHeatmap days={days} compact />
      </div>
    )
  }

  return (
    <div
      style={{
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'minmax(230px, 0.78fr) minmax(350px, 1.22fr)',
        gap: 26,
        alignItems: 'stretch',
        padding: '8px 24px 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          minWidth: 0,
          minHeight: 0,
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr)',
          gap: 8,
          overflow: 'hidden',
        }}
      >
        <div>
          <div style={{ color: 'var(--ui-text-primary)', fontSize: uiTypographyTokens.role.label, fontWeight: uiTypographyTokens.weight.semibold, lineHeight: uiTypographyTokens.lineHeight.compact }}>
            Rytm dni
          </div>
        </div>

        <MonthCalendarHeatmap days={days} />
      </div>

      <CashflowChart days={existingDays} />
    </div>
  )
}
