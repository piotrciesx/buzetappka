import type {
  DashboardCategoryTrend,
  DashboardMonthlyTrendPoint,
  DashboardMonthOverMonthMetric,
} from '../../lib/dashboardStats'
import type { DayMetric, LineSeries } from './dashboardWidgetTileTypes'
import {
  SERIES_COLORS,
  SOFT_BORDER,
  SOFT_TEXT,
  compactValueStyle,
  contentStyle,
  dashboardCalendarBox,
  dashboardChartBox,
  heatmapStyle,
  labelStyle,
  listRowStyle,
  metricGridStyle,
  progressTrackStyle,
  smallTextStyle,
} from './dashboardWidgetTileStyles'
import {
  clampPercent,
  formatChange,
  formatMoney,
  getColorForMoney,
  getExpenseChangeColor,
} from './dashboardWidgetTileUtils'
import { MetricBox } from './DashboardWidgetStatsSection'

const getHeatmapColor = (balance: number, maxAbsBalance: number) => {
  if (balance === 0 || maxAbsBalance <= 0) return '#e5e7eb'

  const intensity = Math.max(0.18, Math.min(1, Math.abs(balance) / maxAbsBalance))
  const alpha = 0.2 + intensity * 0.65

  return balance > 0 ? `rgba(21, 128, 61, ${alpha})` : `rgba(185, 28, 28, ${alpha})`
}

const getPolylinePoints = (values: number[], width: number, height: number) => {
  if (values.length === 0) return ''

  const min = Math.min(...values, 0)
  const max = Math.max(...values, 0)
  const range = max - min || 1
  const step = values.length > 1 ? width / (values.length - 1) : width

  return values
    .map((value, index) => {
      const x = index * step
      const y = height - ((value - min) / range) * height

      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

export function MiniLineChart({
  series,
  labels,
  height = 76,
  showLegend = false,
}: {
  series: LineSeries[]
  labels?: string[]
  height?: number
  showLegend?: boolean
}) {
  const width = 240
  const chartHeight = height
  const allValues = series.flatMap((item) => item.values)
  const min = Math.min(...allValues, 0)
  const max = Math.max(...allValues, 0)
  const zeroY = chartHeight - ((0 - min) / (max - min || 1)) * chartHeight

  return (
    <div style={{ ...dashboardChartBox, gap: 6 }}>
      <svg viewBox={`0 0 ${width} ${chartHeight}`} role="img" style={{ width: '100%', height: '100%', maxHeight: height, overflow: 'hidden' }}>
        <line
          x1="0"
          x2={width}
          y1={zeroY}
          y2={zeroY}
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        {series.map((item) => (
          <polyline
            key={item.id}
            points={getPolylinePoints(item.values, width, chartHeight)}
            fill="none"
            stroke={item.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, minWidth: 0, overflow: 'hidden' }}>
          {labels.map((label) => (
            <span key={label} style={labelStyle}>
              {label}
            </span>
          ))}
        </div>
      )}
      {showLegend && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {series.map((item) => (
            <span
              key={item.id}
              style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: item.color,
                  display: 'inline-block',
                }}
              />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function MiniBars({
  points,
  valueKey,
  color,
}: {
  points: DashboardMonthlyTrendPoint[]
  valueKey: 'income' | 'expense' | 'balance'
  color: string
}) {
  const maxValue = Math.max(1, ...points.map((point) => Math.abs(point[valueKey])))

  return (
    <div style={{ display: 'flex', alignItems: 'end', gap: 6, height: 74 }}>
      {points.map((point) => {
        const value = point[valueKey]
        const height = Math.max(4, (Math.abs(value) / maxValue) * 64)

        return (
          <div
            key={point.month}
            title={`${point.month}: ${formatMoney(value)}`}
            style={{ flex: 1, display: 'grid', gap: 4, alignItems: 'end' }}
          >
            <div
              style={{
                height,
                borderRadius: 6,
                background: valueKey === 'balance' ? getColorForMoney(value) : color,
                opacity: 0.86,
              }}
            />
            <div style={{ ...labelStyle, textAlign: 'center' }}>{point.label}</div>
          </div>
        )
      })}
    </div>
  )
}

export function SimpleBars({
  items,
  color,
}: {
  items: Array<{ label: string; value: number; color?: string }>
  color: string
}) {
  const maxValue = Math.max(1, ...items.map((item) => item.value))

  return (
    <div style={{ display: 'grid', gap: 7 }}>
      {items.map((item) => (
        <div key={item.label}>
          <div style={listRowStyle}>
            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {item.label}
            </span>
            <strong style={{ fontWeight: 700 }}>{formatMoney(item.value)}</strong>
          </div>
          <div style={progressTrackStyle}>
            <div
              style={{
                width: `${clampPercent((item.value / maxValue) * 100)}%`,
                height: '100%',
                borderRadius: 999,
                background: item.color ?? color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Heatmap({ days, dense }: { days: DayMetric[]; dense: boolean }) {
  const maxAbsBalance = Math.max(1, ...days.map((day) => Math.abs(day.balance)))
  const firstDayIndex = days[0]
    ? (new Date(`${days[0].date}T00:00:00`).getDay() + 6) % 7
    : 0
  const cells: Array<DayMetric | null> = [
    ...Array.from({ length: firstDayIndex }, () => null),
    ...days,
  ]
  const rowCount = Math.max(1, Math.ceil(cells.length / 7))

  return (
    <div
      style={{
        ...dashboardCalendarBox,
        ...heatmapStyle,
        gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
      }}
      aria-label="Heatmapa bilansu dni"
    >
      {cells.map((day, index) => day ? (
        <div
          key={day.date}
          title={`${day.day}: ${formatMoney(day.balance)}`}
          style={{
            aspectRatio: '1 / 1',
            minWidth: 0,
            minHeight: 0,
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: 5,
            background: getHeatmapColor(day.balance, maxAbsBalance),
            border: '1px solid rgba(17, 24, 39, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: Math.abs(day.balance) > maxAbsBalance * 0.6 ? '#ffffff' : '#374151',
            fontSize: dense ? 0 : 9,
            fontWeight: 600,
          }}
        >
          {!dense ? day.day : null}
        </div>
      ) : (
        <div key={`empty-${index}`} style={{ minWidth: 0, minHeight: 0 }} />
      ))}
    </div>
  )
}

export function TrendWidget({
  title,
  value,
  points,
  valueKey,
  color,
  changeAmount,
  changePercent,
  isTiny,
  isLarge,
}: {
  title: string
  value: number
  points: DashboardMonthlyTrendPoint[]
  valueKey: 'income' | 'expense' | 'balance'
  color: string
  changeAmount: number
  changePercent: number | null
  isTiny: boolean
  isLarge: boolean
}) {
  const changeColor =
    valueKey === 'expense' ? getExpenseChangeColor(changeAmount) : getColorForMoney(changeAmount)

  return (
    <div style={contentStyle}>
      <div style={{ display: 'grid', gap: 9 }}>
        <div>
          <div style={{ ...compactValueStyle, color }}>{formatMoney(value)}</div>
          <div style={smallTextStyle}>{title}</div>
        </div>
        {isTiny ? (
          <MiniLineChart
            height={38}
            series={[
              {
                id: valueKey,
                label: title,
                color,
                values: points.map((point) => point[valueKey]),
              },
            ]}
          />
        ) : (
          <MiniBars points={points} valueKey={valueKey} color={color} />
        )}
        {isLarge && (
          <div style={metricGridStyle}>
            <MetricBox label="Różnica m/m" value={formatMoney(changeAmount)} color={changeColor} />
            <MetricBox label="Zmiana %" value={formatChange(changePercent)} color={changeColor} />
          </div>
        )}
      </div>
    </div>
  )
}

export function MonthOverMonthTable({
  metrics,
  isTiny,
  isLarge,
}: {
  metrics: DashboardMonthOverMonthMetric[]
  isTiny: boolean
  isLarge: boolean
}) {
  const balanceMetric = metrics.find((metric) => metric.key === 'balance') ?? metrics[0]
  const expenseMetric = metrics.find((metric) => metric.key === 'expense') ?? metrics[0]

  if (isTiny) {
    return (
      <div style={contentStyle}>
        <div style={{ ...compactValueStyle, color: getColorForMoney(balanceMetric.change.amount) }}>
          {formatChange(balanceMetric.change.percent)}
        </div>
        <div style={smallTextStyle}>zmiana bilansu m/m</div>
      </div>
    )
  }

  return (
    <div style={contentStyle}>
      <div style={{ display: 'grid', gap: 8 }}>
        {(isLarge ? metrics : metrics.slice(0, 3)).map((metric) => {
          const color =
            metric.key === 'expense'
              ? getExpenseChangeColor(metric.change.amount)
              : getColorForMoney(metric.change.amount)

          return (
            <div
              key={metric.key}
              style={{
                border: `1px solid ${SOFT_BORDER}`,
                borderRadius: 10,
                background: '#ffffff',
                padding: 8,
                display: 'grid',
                gap: 5,
              }}
            >
              <div style={{ ...listRowStyle, fontWeight: 700 }}>
                <span>{metric.label}</span>
                <strong style={{ color }}>{formatChange(metric.change.percent)}</strong>
              </div>
              <div style={{ ...listRowStyle, color: SOFT_TEXT }}>
                <span>teraz {formatMoney(metric.current)}</span>
                <span>poprz. {formatMoney(metric.previous)}</span>
              </div>
              {isLarge && (
                <div style={{ ...smallTextStyle, color }}>
                  Różnica: {formatMoney(metric.change.amount)}
                </div>
              )}
            </div>
          )
        })}
        {!isLarge && (
          <div style={{ ...smallTextStyle, color: getExpenseChangeColor(expenseMetric.change.amount) }}>
            Wydatki m/m: {formatChange(expenseMetric.change.percent)}
          </div>
        )}
      </div>
    </div>
  )
}

export function CategoryTrendChart({
  categories,
  selectedIds,
  compact,
}: {
  categories: DashboardCategoryTrend[]
  selectedIds: string[]
  compact: boolean
}) {
  const selected = categories.filter((category) => selectedIds.includes(category.categoryId))
  const labels = selected[0]?.months.map((month) => month.label) ?? []
  const series = selected.map((category, index) => ({
    id: category.categoryId,
    label: category.name,
    color: SERIES_COLORS[index % SERIES_COLORS.length],
    values: category.months.map((month) => month.total),
  }))

  if (series.length === 0) {
    return <div style={smallTextStyle}>Brak kategorii z wydatkami.</div>
  }

  return (
    <MiniLineChart
      series={series}
      labels={compact ? undefined : labels}
      height={compact ? 72 : 110}
      showLegend={!compact}
    />
  )
}
