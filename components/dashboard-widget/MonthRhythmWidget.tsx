'use client'

import type { Category, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { getDaysInMonth, isFutureDate } from '../../lib/dateUtils'
import { BLUE, GREEN, MUTED, RED } from './dashboardWidgetTileStyles'
import { formatMoney } from './dashboardWidgetTileUtils'

type DayPoint = {
  day: number
  date: string
  income: number
  expense: number
  net: number
  cumulative: number
  count: number
  isFuture: boolean
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const rgbToCss = ([r, g, b]: [number, number, number]) => `rgb(${r}, ${g}, ${b})`

const hslToRgb = (
  hue: number,
  saturationPercent: number,
  lightnessPercent: number
): [number, number, number] => {
  const saturation = clamp(saturationPercent, 0, 100) / 100
  const lightness = clamp(lightnessPercent, 0, 100) / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const hueSection = (((hue % 360) + 360) % 360) / 60
  const secondComponent = chroma * (1 - Math.abs((hueSection % 2) - 1))
  const match = lightness - chroma / 2

  let redPrime = 0
  let greenPrime = 0
  let bluePrime = 0

  if (hueSection >= 0 && hueSection < 1) {
    redPrime = chroma
    greenPrime = secondComponent
  } else if (hueSection < 2) {
    redPrime = secondComponent
    greenPrime = chroma
  } else if (hueSection < 3) {
    greenPrime = chroma
    bluePrime = secondComponent
  } else if (hueSection < 4) {
    greenPrime = secondComponent
    bluePrime = chroma
  } else if (hueSection < 5) {
    redPrime = secondComponent
    bluePrime = chroma
  } else {
    redPrime = chroma
    bluePrime = secondComponent
  }

  return [
    Math.round((redPrime + match) * 255),
    Math.round((greenPrime + match) * 255),
    Math.round((bluePrime + match) * 255),
  ]
}

const getLuminance = ([r, g, b]: [number, number, number]) => {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const getSortedNumbers = (values: number[]) => [...values].sort((left, right) => left - right)

const getQuantile = (sortedValues: number[], quantile: number) => {
  if (sortedValues.length === 0) return 0
  if (sortedValues.length === 1) return sortedValues[0]

  const clampedQuantile = clamp(quantile, 0, 1)
  const index = (sortedValues.length - 1) * clampedQuantile
  const lowerIndex = Math.floor(index)
  const upperIndex = Math.ceil(index)

  if (lowerIndex === upperIndex) return sortedValues[lowerIndex]

  const interpolationFactor = index - lowerIndex

  return (
    sortedValues[lowerIndex] +
    (sortedValues[upperIndex] - sortedValues[lowerIndex]) * interpolationFactor
  )
}

const getReferenceValue = (values: number[]) => {
  if (values.length === 0) return 0

  const sortedValues = getSortedNumbers(values)
  const p60 = getQuantile(sortedValues, 0.6)
  const p85 = getQuantile(sortedValues, 0.85)
  const maxValue = sortedValues[sortedValues.length - 1]

  return Math.max(p85, p60 * 1.35, maxValue * 0.18, 1)
}

const getHeatmapIntensity = (absoluteValue: number, referenceValue: number) => {
  if (absoluteValue <= 0 || referenceValue <= 0) return 0

  const ratio = absoluteValue / referenceValue
  const compressed = Math.log1p(ratio * 6.5) / Math.log1p(7.5)
  const softened = Math.pow(clamp(compressed, 0, 1), 0.82)

  return clamp(softened, 0, 1)
}

const getBalanceHeatmapVisual = (
  value: number,
  negativeReference: number,
  positiveReference: number
) => {
  if (value === 0) {
    const neutralRgb = hslToRgb(42, 92, 56)

    return {
      background: rgbToCss(neutralRgb),
      textColor: '#111827',
      borderColor: rgbToCss(hslToRgb(34, 92, 36)),
    }
  }

  const isPositive = value > 0
  const intensity = getHeatmapIntensity(
    Math.abs(value),
    isPositive ? positiveReference : negativeReference
  )
  const hue = isPositive ? 145 : 8
  const saturation = 88 + intensity * 8
  const lightness = 62 - intensity * 24
  const borderLightness = Math.max(lightness - 18, 20)
  const backgroundRgb = hslToRgb(hue, saturation, lightness)
  const borderRgb = hslToRgb(hue, Math.min(100, saturation + 4), borderLightness)
  const luminance = getLuminance(backgroundRgb)

  return {
    background: rgbToCss(backgroundRgb),
    textColor: luminance < 162 ? '#ffffff' : '#111827',
    borderColor: rgbToCss(borderRgb),
  }
}

const getDayFromDate = (date: string) => {
  const day = Number(date.slice(8, 10))
  return Number.isFinite(day) && day > 0 ? day : 1
}

const isTransactionInMonth = (transaction: Transaction, month: string) => {
  return transaction.date?.startsWith(month)
}

const getColorForRhythm = (value: number) => {
  if (value > 0) return GREEN
  if (value < 0) return RED
  return BLUE
}

const buildMonthRhythmDays = ({
  transactions,
  selectedMonth,
  categoriesById,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  selectedMonth: string
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}) => {
  const daysInMonth = getDaysInMonth(selectedMonth)
  const days: DayPoint[] = Array.from({ length: daysInMonth }, (_, index) => {
    const date = `${selectedMonth}-${String(index + 1).padStart(2, '0')}`

    return {
      day: index + 1,
      date,
      income: 0,
      expense: 0,
      net: 0,
      cumulative: 0,
      count: 0,
      isFuture: isFutureDate(date),
    }
  })

  for (const transaction of transactions) {
    if (!isTransactionInMonth(transaction, selectedMonth)) continue
    if (isFutureDate(transaction.date)) continue
    if (!categoriesById[transaction.category_id]) continue

    const day = days[getDayFromDate(transaction.date) - 1]
    if (!day) continue

    const amount = getSignedAmountForTransaction(transaction)
    day.count += 1
    if (amount > 0) day.income += amount
    if (amount < 0) day.expense += Math.abs(amount)
    day.net += amount
  }

  let cumulative = 0

  return days.map((day) => {
    cumulative += day.net
    return { ...day, cumulative }
  })
}

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
              fontSize: 10.5,
              fontWeight: 650,
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

            return (
              <div
                key={day.date}
                title={`${day.day}: ${formatMoney(day.net)}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: compact ? 8 : 9,
                  background: day.isFuture ? '#f1f5f9' : visual.background,
                  border: day.isFuture ? '1px solid #e2e8f0' : `1px solid ${visual.borderColor}`,
                  display: 'grid',
                  placeItems: 'center',
                  color: day.isFuture ? MUTED : visual.textColor,
                  fontSize: compact ? 10 : 10.5,
                  fontWeight: 720,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  opacity: day.isFuture ? 0.62 : 1,
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
      <div style={{ color: '#111827', fontSize: 14, fontWeight: 740 }}>
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
              fontSize: 12,
              fontWeight: 650,
              lineHeight: 1.2,
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
              stroke="#94a3b8"
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
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 0,
              whiteSpace: 'nowrap',
              maxWidth: 146,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textShadow: '0 1px 0 rgba(255,255,255,0.92)',
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
  categoriesById,
  getSignedAmountForTransaction,
}: {
  widget: DashboardWidgetLayoutItem
  transactions: Transaction[]
  selectedMonth: string
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}) {
  const isSmall = widget.width === 2
  const days = buildMonthRhythmDays({
    transactions,
    selectedMonth,
    categoriesById,
    getSignedAmountForTransaction,
  })
  const existingDays = days.filter((day) => !day.isFuture)

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
          <div style={{ color: '#111827', fontSize: 13, fontWeight: 780, lineHeight: 1.1 }}>
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
          <div style={{ color: '#111827', fontSize: 13, fontWeight: 780, lineHeight: 1.1 }}>
            Rytm dni
          </div>
        </div>

        <MonthCalendarHeatmap days={days} />
      </div>

      <CashflowChart days={existingDays} />
    </div>
  )
}
