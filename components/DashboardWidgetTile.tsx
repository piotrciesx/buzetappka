'use client'

import { CSSProperties, PointerEvent, useMemo, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  DASHBOARD_WIDGET_DEFINITION_BY_TYPE,
  DASHBOARD_WIDGET_DEFINITIONS,
} from '../lib/dashboardWidgetConfig'
import { DashboardWidgetLayoutItem, DashboardWidgetType } from '../lib/dashboardTypes'
import { Category, Transaction } from '../lib/budgetPageTypes'
import {
  DashboardCategoryTrend,
  DashboardDailyCashflowPoint,
  DashboardMonthlyTrendPoint,
  DashboardMonthOverMonthMetric,
  DashboardStats,
  TopCategory,
  getDashboardCategoryTrends,
  getDashboardCategoryPatternStats,
  getDashboardDailyCashflowStats,
  getDashboardForecastStats,
  getDashboardMonthOverMonthStats,
  getDashboardTrendStats,
} from '../lib/dashboardStats'

const RESIZE_HIT_AREA = 12
const GREEN = '#15803d'
const RED = '#b91c1c'
const NEUTRAL = '#111827'
const MUTED = '#64748b'
const SOFT_TEXT = '#6b7280'
const SOFT_BORDER = '#e5e7eb'
const BLUE = '#2563eb'
const SERIES_COLORS = [RED, GREEN, BLUE, '#7c3aed', '#ea580c']

export type DashboardResizeEdges = {
  left: boolean
  right: boolean
  top: boolean
  bottom: boolean
}

type DashboardWidgetPixelRect = {
  left: number
  top: number
  width: number
  height: number
}

type DayMetric = {
  day: number
  date: string
  income: number
  expense: number
  balance: number
  count: number
}

type CategoryBreakdown = {
  id: string
  name: string
  total: number
}

type MonthMetrics = {
  days: DayMetric[]
  topIncomeCategories: CategoryBreakdown[]
  topExpenseCategories: CategoryBreakdown[]
  mostExpensiveDay: DayMetric | null
  topExpenseCategory: CategoryBreakdown | null
  daysWithEntries: number
  daysWithoutEntries: number
  averageDailyIncome: number
  averageDailyExpense: number
}

type LineSeries = {
  id: string
  label: string
  color: string
  values: number[]
}

const tileStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: 132,
  background: '#ffffff',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: SOFT_BORDER,
  borderRadius: 16,
  boxShadow: '0 8px 22px rgba(15, 23, 42, 0.06)',
  padding: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  transition: 'box-shadow 180ms ease, border-color 180ms ease',
}

const tileHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 8,
}

const selectStyle: CSSProperties = {
  width: '100%',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '#d1d5db',
  borderRadius: 10,
  padding: '7px 9px',
  fontSize: 13,
  fontWeight: 600,
  background: '#ffffff',
  color: NEUTRAL,
}

const metaStyle: CSSProperties = {
  marginTop: 4,
  fontSize: 11,
  lineHeight: 1.35,
  color: '#9ca3af',
}

const contentStyle: CSSProperties = {
  flex: 1,
  borderRadius: 12,
  background: '#f9fafb',
  padding: 12,
  color: NEUTRAL,
  overflow: 'hidden',
  minHeight: 0,
}

const valueStyle: CSSProperties = {
  fontSize: 26,
  fontWeight: 700,
  lineHeight: 1.08,
  letterSpacing: 0,
}

const compactValueStyle: CSSProperties = {
  ...valueStyle,
  fontSize: 22,
}

const smallTextStyle: CSSProperties = {
  color: SOFT_TEXT,
  fontSize: 12,
  lineHeight: 1.35,
}

const labelStyle: CSSProperties = {
  color: MUTED,
  fontSize: 11,
  lineHeight: 1.25,
}

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 7,
}

const listRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: 10,
  fontSize: 13,
  lineHeight: 1.25,
}

const metricGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
}

const metricBoxStyle: CSSProperties = {
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 10,
  background: '#ffffff',
  padding: 9,
  minWidth: 0,
}

const progressTrackStyle: CSSProperties = {
  width: '100%',
  height: 7,
  borderRadius: 999,
  background: '#e5e7eb',
  overflow: 'hidden',
  marginTop: 5,
}

const heatmapStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: 4,
}

const controlsStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  justifyContent: 'space-between',
}

const dragHandleStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 10,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '#d1d5db',
  background: '#f9fafb',
  color: '#374151',
  cursor: 'grab',
  touchAction: 'none',
  fontWeight: 700,
  lineHeight: 1,
}

const resizeHintStyle: CSSProperties = {
  fontSize: 11,
  color: '#94a3b8',
}

const formatMoney = (value: number) => `${value.toFixed(2)} zł`

const formatPercent = (value: number) => `${value.toFixed(1)}%`

const formatChange = (percent: number | null) => (percent === null ? 'brak bazy' : formatPercent(percent))

const getColorForMoney = (value: number) => {
  if (value > 0) return GREEN
  if (value < 0) return RED
  return NEUTRAL
}

const getExpenseChangeColor = (value: number) => {
  if (value > 0) return RED
  if (value < 0) return GREEN
  return MUTED
}

const getPaceLabel = (status: 'calm' | 'watch' | 'fast') => {
  if (status === 'fast') return 'Za szybko'
  if (status === 'watch') return 'Uważaj'
  return 'Spokojnie'
}

const getPaceColor = (status: 'calm' | 'watch' | 'fast') => {
  if (status === 'fast') return RED
  if (status === 'watch') return '#b45309'
  return GREEN
}

const getRiskColor = (level: 'none' | 'low' | 'medium' | 'high') => {
  if (level === 'high') return RED
  if (level === 'medium') return '#b45309'
  if (level === 'low') return GREEN
  return MUTED
}

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, value))
}

const getTransactionTime = (transaction: Transaction) => transaction.created_at ?? ''

const compareTransactionsByDate = (left: Transaction, right: Transaction) => {
  const dateCompare = right.date.localeCompare(left.date)
  if (dateCompare !== 0) return dateCompare

  return getTransactionTime(right).localeCompare(getTransactionTime(left))
}

const isTransactionInMonth = (transaction: Transaction, selectedMonth: string) => {
  return transaction.date.startsWith(selectedMonth)
}

const getDayFromDate = (date: string) => {
  const day = Number(date.slice(8, 10))
  return Number.isFinite(day) ? day : 0
}

const getDaysInMonth = (selectedMonth: string) => {
  const [year, month] = selectedMonth.split('-').map(Number)
  if (!year || !month) return 31

  return new Date(year, month, 0).getDate()
}

const areResizeEdgesEqual = (
  left: DashboardResizeEdges | null,
  right: DashboardResizeEdges | null
) => {
  if (left === right) return true
  if (!left || !right) return false

  return (
    left.left === right.left &&
    left.right === right.right &&
    left.top === right.top &&
    left.bottom === right.bottom
  )
}

const getResizeEdgesFromPointer = (
  rect: DOMRect,
  clientX: number,
  clientY: number
): DashboardResizeEdges | null => {
  const nearLeft = clientX - rect.left <= RESIZE_HIT_AREA
  const nearRight = rect.right - clientX <= RESIZE_HIT_AREA
  const nearTop = clientY - rect.top <= RESIZE_HIT_AREA
  const nearBottom = rect.bottom - clientY <= RESIZE_HIT_AREA

  if (!nearLeft && !nearRight && !nearTop && !nearBottom) return null

  return {
    left: nearLeft,
    right: nearRight,
    top: nearTop,
    bottom: nearBottom,
  }
}

const getCursorForResizeEdges = (edges: DashboardResizeEdges | null) => {
  if (!edges) return 'default'
  if ((edges.left && edges.top) || (edges.right && edges.bottom)) return 'nwse-resize'
  if ((edges.right && edges.top) || (edges.left && edges.bottom)) return 'nesw-resize'
  if (edges.left || edges.right) return 'ew-resize'
  return 'ns-resize'
}

const getTransactionLabel = (
  transaction: Transaction,
  categoriesById: Record<string, Category>
) => {
  const categoryName = categoriesById[transaction.category_id]?.name || 'Nieznana'
  const description = transaction.description?.trim()

  return description ? `${description} · ${categoryName}` : categoryName
}

const buildMonthMetrics = (
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (transaction: Transaction) => number
): MonthMetrics => {
  const daysInMonth = getDaysInMonth(selectedMonth)
  const days = Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    date: `${selectedMonth}-${String(index + 1).padStart(2, '0')}`,
    income: 0,
    expense: 0,
    balance: 0,
    count: 0,
  }))
  const incomeCategories: Record<string, CategoryBreakdown> = {}
  const expenseCategories: Record<string, CategoryBreakdown> = {}

  for (const transaction of transactions) {
    if (!isTransactionInMonth(transaction, selectedMonth)) continue

    const category = categoriesById[transaction.category_id]
    if (!category) continue

    const amount = getSignedAmountForTransaction(transaction)
    const dayIndex = getDayFromDate(transaction.date) - 1
    const dayMetric = days[dayIndex]

    if (dayMetric) {
      dayMetric.count += 1

      if (amount > 0) {
        dayMetric.income += amount
      } else if (amount < 0) {
        dayMetric.expense += Math.abs(amount)
      }

      dayMetric.balance = dayMetric.income - dayMetric.expense
    }

    const targetMap = amount >= 0 ? incomeCategories : expenseCategories
    const categoryTotal = Math.abs(amount)

    if (!targetMap[category.id]) {
      targetMap[category.id] = {
        id: category.id,
        name: category.name,
        total: 0,
      }
    }

    targetMap[category.id].total += categoryTotal
  }

  const sortCategories = (items: Record<string, CategoryBreakdown>) =>
    Object.values(items).sort((left, right) => right.total - left.total)
  const daysWithEntries = days.filter((day) => day.count > 0).length
  const totalIncome = days.reduce((sum, day) => sum + day.income, 0)
  const totalExpense = days.reduce((sum, day) => sum + day.expense, 0)
  const mostExpensiveDay =
    days.reduce<DayMetric | null>((winner, day) => {
      if (!winner || day.expense > winner.expense) return day
      return winner
    }, null)?.expense
      ? days.reduce((winner, day) => (day.expense > winner.expense ? day : winner))
      : null
  const topExpenseCategories = sortCategories(expenseCategories)

  return {
    days,
    topIncomeCategories: sortCategories(incomeCategories),
    topExpenseCategories,
    mostExpensiveDay,
    topExpenseCategory: topExpenseCategories[0] ?? null,
    daysWithEntries,
    daysWithoutEntries: Math.max(0, daysInMonth - daysWithEntries),
    averageDailyIncome: totalIncome / daysInMonth,
    averageDailyExpense: totalExpense / daysInMonth,
  }
}

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

function MetricBox({
  label,
  value,
  color = NEUTRAL,
}: {
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div style={metricBoxStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={{ marginTop: 3, fontSize: 14, fontWeight: 700, color, lineHeight: 1.2 }}>
        {value}
      </div>
    </div>
  )
}

function ProgressBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div>
      <div style={listRowStyle}>
        <span style={labelStyle}>{label}</span>
        <strong style={{ color, fontWeight: 700 }}>{formatPercent(value)}</strong>
      </div>
      <div style={progressTrackStyle}>
        <div
          style={{
            width: `${clampPercent(value)}%`,
            height: '100%',
            borderRadius: 999,
            background: color,
          }}
        />
      </div>
    </div>
  )
}

function MiniLineChart({
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
    <div style={{ display: 'grid', gap: 6 }}>
      <svg viewBox={`0 0 ${width} ${chartHeight}`} role="img" style={{ width: '100%', height }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
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

function MiniBars({
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

function SimpleBars({
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
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

function Heatmap({ days, dense }: { days: DayMetric[]; dense: boolean }) {
  const maxAbsBalance = Math.max(1, ...days.map((day) => Math.abs(day.balance)))
  const visibleDays = days.slice(0, 35)

  return (
    <div style={heatmapStyle} aria-label="Heatmapa bilansu dni">
      {visibleDays.map((day) => (
        <div
          key={day.date}
          title={`${day.day}: ${formatMoney(day.balance)}`}
          style={{
            aspectRatio: '1 / 1',
            minHeight: dense ? 13 : 18,
            borderRadius: 5,
            background: getHeatmapColor(day.balance, maxAbsBalance),
            border: '1px solid rgba(17, 24, 39, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: Math.abs(day.balance) > maxAbsBalance * 0.6 ? '#ffffff' : '#374151',
            fontSize: dense ? 0 : 10,
            fontWeight: 600,
          }}
        >
          {!dense ? day.day : null}
        </div>
      ))}
    </div>
  )
}

function CategoryRows({
  categories,
  total,
  limit,
  showBars,
}: {
  categories: TopCategory[]
  total: number
  limit: number
  showBars: boolean
}) {
  const visibleItems = categories.slice(0, limit)

  if (visibleItems.length === 0) {
    return <div style={smallTextStyle}>Brak wydatków</div>
  }

  return (
    <div style={listStyle}>
      {visibleItems.map((category, index) => {
        const percent = total > 0 ? (category.total / total) * 100 : 0

        return (
          <div key={category.categoryId}>
            <div style={listRowStyle}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {index + 1}. {category.name}
              </span>
              <strong style={{ fontWeight: 700 }}>{formatMoney(category.total)}</strong>
            </div>
            {showBars && (
              <>
                <div style={progressTrackStyle}>
                  <div
                    style={{
                      width: `${clampPercent(percent)}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: RED,
                    }}
                  />
                </div>
                <div style={{ ...labelStyle, marginTop: 2 }}>{formatPercent(percent)}</div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TrendWidget({
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

function MonthOverMonthTable({
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

function CategoryTrendChart({
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

type WidgetContentProps = {
  widget: DashboardWidgetLayoutItem
  transactions: Transaction[]
  selectedMonth: string
  dashboardStats: DashboardStats
  topExpenseCategories: TopCategory[]
  latestTransactions: Transaction[]
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}

function DashboardWidgetContent({
  widget,
  transactions,
  selectedMonth,
  dashboardStats,
  topExpenseCategories,
  latestTransactions,
  categoriesById,
  getSignedAmountForTransaction,
}: WidgetContentProps) {
  const isTiny = widget.width === 1 && widget.height === 1
  const isMedium = widget.width >= 2
  const isLarge = widget.width >= 3 || widget.height >= 3
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const monthMetrics = useMemo(
    () =>
      buildMonthMetrics(
        transactions,
        categoriesById,
        selectedMonth,
        getSignedAmountForTransaction
      ),
    [transactions, categoriesById, selectedMonth, getSignedAmountForTransaction]
  )
  const trendStats = useMemo(
    () =>
      getDashboardTrendStats(
        transactions,
        categoriesById,
        selectedMonth,
        getSignedAmountForTransaction
      ),
    [transactions, categoriesById, selectedMonth, getSignedAmountForTransaction]
  )
  const dailyCashflow = useMemo(
    () =>
      getDashboardDailyCashflowStats(
        transactions,
        categoriesById,
        selectedMonth,
        getSignedAmountForTransaction
      ),
    [transactions, categoriesById, selectedMonth, getSignedAmountForTransaction]
  )
  const monthOverMonth = useMemo(
    () =>
      getDashboardMonthOverMonthStats(
        transactions,
        categoriesById,
        selectedMonth,
        getSignedAmountForTransaction
      ),
    [transactions, categoriesById, selectedMonth, getSignedAmountForTransaction]
  )
  const categoryTrends = useMemo(
    () =>
      getDashboardCategoryTrends(
        transactions,
        categoriesById,
        selectedMonth,
        getSignedAmountForTransaction
      ),
    [transactions, categoriesById, selectedMonth, getSignedAmountForTransaction]
  )
  const forecastStats = useMemo(
    () =>
      getDashboardForecastStats(
        transactions,
        categoriesById,
        selectedMonth,
        getSignedAmountForTransaction
      ),
    [transactions, categoriesById, selectedMonth, getSignedAmountForTransaction]
  )
  const categoryPatternStats = useMemo(
    () =>
      getDashboardCategoryPatternStats(
        transactions,
        categoriesById,
        selectedMonth,
        getSignedAmountForTransaction
      ),
    [transactions, categoriesById, selectedMonth, getSignedAmountForTransaction]
  )
  const defaultCategoryIds = categoryTrends.slice(0, 3).map((category) => category.categoryId)
  const availableCategoryIds = new Set(categoryTrends.map((category) => category.categoryId))
  const effectiveSelectedCategoryIds = (
    selectedCategoryIds.length > 0 ? selectedCategoryIds : defaultCategoryIds
  )
    .filter((id) => availableCategoryIds.has(id))
    .slice(0, 5)

  if (widget.type === 'monthly-balance') {
    const totalFlow = dashboardStats.income + dashboardStats.expense
    const incomeShare = totalFlow > 0 ? (dashboardStats.income / totalFlow) * 100 : 50

    return (
      <div style={contentStyle}>
        <div style={{ display: 'grid', gap: isLarge ? 12 : 8 }}>
          <div style={{ ...valueStyle, color: getColorForMoney(dashboardStats.balance) }}>
            {formatMoney(dashboardStats.balance)}
          </div>

          {!isTiny && (
            <div style={metricGridStyle}>
              <MetricBox label="Przychody" value={formatMoney(dashboardStats.income)} color={GREEN} />
              <MetricBox label="Wydatki" value={formatMoney(dashboardStats.expense)} color={RED} />
            </div>
          )}

          {isLarge && (
            <>
              <div style={metricGridStyle}>
                <MetricBox label="Transakcje" value={dashboardStats.transactionCount} />
                <MetricBox
                  label="Największy wydatek"
                  value={formatMoney(dashboardStats.biggestExpense)}
                  color={RED}
                />
                <MetricBox
                  label="Największy przychód"
                  value={formatMoney(dashboardStats.biggestIncome)}
                  color={GREEN}
                />
                <MetricBox label="Udział przychodów" value={formatPercent(incomeShare)} />
              </div>
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: `conic-gradient(${GREEN} 0 ${incomeShare}%, ${RED} ${incomeShare}% 100%)`,
                  boxShadow: 'inset 0 0 0 12px #ffffff',
                }}
                aria-label="Udział przychodów i wydatków"
              />
            </>
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'expense-trend') {
    return (
      <TrendWidget
        title="wydatki w tym miesiącu"
        value={trendStats.current.expense}
        points={trendStats.months}
        valueKey="expense"
        color={RED}
        changeAmount={trendStats.expenseChange.amount}
        changePercent={trendStats.expenseChange.percent}
        isTiny={isTiny}
        isLarge={isLarge}
      />
    )
  }

  if (widget.type === 'income-trend') {
    return (
      <TrendWidget
        title="przychody w tym miesiącu"
        value={trendStats.current.income}
        points={trendStats.months}
        valueKey="income"
        color={GREEN}
        changeAmount={trendStats.incomeChange.amount}
        changePercent={trendStats.incomeChange.percent}
        isTiny={isTiny}
        isLarge={isLarge}
      />
    )
  }

  if (widget.type === 'balance-trend') {
    const bestMonth = trendStats.months.reduce((winner, month) =>
      month.balance > winner.balance ? month : winner
    )
    const worstMonth = trendStats.months.reduce((winner, month) =>
      month.balance < winner.balance ? month : winner
    )

    return (
      <div style={contentStyle}>
        <div style={{ display: 'grid', gap: 9 }}>
          <div>
            <div style={{ ...compactValueStyle, color: getColorForMoney(trendStats.current.balance) }}>
              {formatMoney(trendStats.current.balance)}
            </div>
            <div style={smallTextStyle}>
              {trendStats.balanceChange.amount >= 0 ? 'bilans rośnie m/m' : 'bilans spada m/m'}
            </div>
          </div>
          <MiniLineChart
            height={isTiny ? 42 : 86}
            labels={isTiny ? undefined : trendStats.months.map((month) => month.label)}
            series={[
              {
                id: 'balance',
                label: 'Bilans',
                color: trendStats.current.balance >= 0 ? GREEN : RED,
                values: trendStats.months.map((month) => month.balance),
              },
            ]}
          />
          {isLarge && (
            <div style={metricGridStyle}>
              <MetricBox label="Najlepszy miesiąc" value={`${bestMonth.label} · ${formatMoney(bestMonth.balance)}`} color={GREEN} />
              <MetricBox label="Najgorszy miesiąc" value={`${worstMonth.label} · ${formatMoney(worstMonth.balance)}`} color={RED} />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'cashflow-daily') {
    const cashflowSeries = dailyCashflow.points.map((point: DashboardDailyCashflowPoint) => point.cumulative)

    return (
      <div style={contentStyle}>
        <div style={{ display: 'grid', gap: 9 }}>
          <div>
            <div style={{ ...compactValueStyle, color: getColorForMoney(dailyCashflow.finalBalance) }}>
              {formatMoney(dailyCashflow.finalBalance)}
            </div>
            <div style={smallTextStyle}>końcowy bilans miesiąca</div>
          </div>
          {!isTiny && (
            <MiniLineChart
              height={isLarge ? 100 : 70}
              series={[
                {
                  id: 'cashflow',
                  label: 'Cashflow',
                  color: dailyCashflow.finalBalance >= 0 ? GREEN : RED,
                  values: cashflowSeries,
                },
              ]}
            />
          )}
          {isLarge && (
            <>
              <div style={metricGridStyle}>
                <MetricBox label="Minimum dnia" value={dailyCashflow.minPoint ? `${dailyCashflow.minPoint.day}. · ${formatMoney(dailyCashflow.minPoint.cumulative)}` : 'Brak'} color={RED} />
                <MetricBox label="Maksimum dnia" value={dailyCashflow.maxPoint ? `${dailyCashflow.maxPoint.day}. · ${formatMoney(dailyCashflow.maxPoint.cumulative)}` : 'Brak'} color={GREEN} />
              </div>
              {dailyCashflow.daylessCount > 0 && (
                <div style={smallTextStyle}>Wpisy bez dnia nie są na osi dni: {dailyCashflow.daylessCount}</div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'month-over-month') {
    return (
      <MonthOverMonthTable
        metrics={monthOverMonth.metrics}
        isTiny={isTiny}
        isLarge={isLarge}
      />
    )
  }

  if (widget.type === 'category-trends') {
    const topCategory = categoryTrends[0]

    if (isTiny) {
      return (
        <div style={contentStyle}>
          <div style={{ ...compactValueStyle, color: RED }}>
            {topCategory ? formatMoney(topCategory.months.at(-1)?.total ?? 0) : formatMoney(0)}
          </div>
          <div style={smallTextStyle}>
            {topCategory ? `${topCategory.name} · ${formatChange(topCategory.change.percent)}` : 'Brak kategorii'}
          </div>
        </div>
      )
    }

    return (
      <div style={contentStyle}>
        <div style={{ display: 'grid', gap: 10 }}>
          {isLarge && (
            <div
              data-dashboard-ignore-resize="true"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 6,
                maxHeight: 88,
                overflow: 'auto',
              }}
            >
              {categoryTrends.slice(0, 10).map((category) => {
                const checked = effectiveSelectedCategoryIds.includes(category.categoryId)
                const disabled = !checked && effectiveSelectedCategoryIds.length >= 5

                return (
                  <label
                    key={category.categoryId}
                    style={{
                      ...labelStyle,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: disabled ? '#9ca3af' : NEUTRAL,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={(event) => {
                        setSelectedCategoryIds((prev) => {
                          const base = prev.length > 0 ? prev : defaultCategoryIds

                          if (event.target.checked) {
                            return [...base, category.categoryId].slice(0, 5)
                          }

                          return base.filter((id) => id !== category.categoryId)
                        })
                      }}
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {category.name}
                    </span>
                  </label>
                )
              })}
            </div>
          )}
          <CategoryTrendChart
            categories={categoryTrends}
            selectedIds={isLarge ? effectiveSelectedCategoryIds : defaultCategoryIds}
            compact={!isLarge}
          />
        </div>
      </div>
    )
  }

  if (widget.type === 'month-forecast') {
    return (
      <div style={contentStyle}>
        <div style={{ display: 'grid', gap: 9 }}>
          <div>
            <div style={{ ...compactValueStyle, color: RED }}>
              {formatMoney(forecastStats.forecastExpense)}
            </div>
            <div style={smallTextStyle}>prognozowane wydatki</div>
          </div>

          {!isTiny && (
            <MetricBox
              label="Prognozowany bilans"
              value={formatMoney(forecastStats.forecastBalance)}
              color={getColorForMoney(forecastStats.forecastBalance)}
            />
          )}

          {isLarge && (
            <>
              <div style={metricGridStyle}>
                <MetricBox
                  label="Wydatki teraz"
                  value={formatMoney(forecastStats.expenseToDate)}
                  color={RED}
                />
                <MetricBox
                  label="Bilans teraz"
                  value={formatMoney(forecastStats.currentBalance)}
                  color={getColorForMoney(forecastStats.currentBalance)}
                />
                <MetricBox
                  label="Przychody"
                  value={formatMoney(forecastStats.incomeToDate)}
                  color={GREEN}
                />
                <MetricBox
                  label="Upłynęło"
                  value={`${forecastStats.elapsedDays}/${forecastStats.daysInMonth} dni`}
                />
              </div>
              <ProgressBar
                label="Postęp miesiąca"
                value={forecastStats.monthProgressPercent}
                color={BLUE}
              />
              {forecastStats.daylessCount > 0 && (
                <div style={smallTextStyle}>
                  Wpisy bez dnia są w sumach: {forecastStats.daylessCount}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'spending-pace') {
    const paceColor = getPaceColor(forecastStats.spendingPaceStatus)
    const paceLabel = getPaceLabel(forecastStats.spendingPaceStatus)

    return (
      <div style={contentStyle}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <div style={{ ...compactValueStyle, color: paceColor }}>{paceLabel}</div>
            <div style={smallTextStyle}>tempo wydatków</div>
          </div>

          {!isTiny && (
            <div style={metricGridStyle}>
              <MetricBox
                label="Miesiąc"
                value={formatPercent(forecastStats.monthProgressPercent)}
                color={BLUE}
              />
              <MetricBox
                label="Wydatki"
                value={formatPercent(forecastStats.spendingProgressPercent)}
                color={paceColor}
              />
            </div>
          )}

          {isLarge && (
            <>
              <ProgressBar
                label="Upływ miesiąca"
                value={forecastStats.monthProgressPercent}
                color={BLUE}
              />
              <ProgressBar
                label="Tempo wydatków"
                value={forecastStats.spendingProgressPercent}
                color={paceColor}
              />
              <div style={smallTextStyle}>
                Różnica tempa: {formatPercent(forecastStats.spendingPaceDifference)}.
                {forecastStats.spendingPaceStatus === 'calm'
                  ? ' Wydatki idą wolniej lub podobnie jak czas.'
                  : forecastStats.spendingPaceStatus === 'watch'
                    ? ' Wydatki wyprzedzają kalendarz.'
                    : ' Wydatki mocno wyprzedzają kalendarz.'}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'budget-risk') {
    const riskColor = getRiskColor(forecastStats.budgetRiskLevel)

    return (
      <div style={contentStyle}>
        <div style={{ display: 'grid', gap: 9 }}>
          <div>
            <div style={{ ...compactValueStyle, color: riskColor }}>
              {forecastStats.budgetRiskLabel}
            </div>
            <div style={smallTextStyle}>ryzyko przekroczenia</div>
          </div>

          {!isTiny && (
            <MetricBox
              label="Różnica"
              value={
                forecastStats.budgetRiskLevel === 'none'
                  ? 'Brak danych'
                  : formatMoney(forecastStats.budgetRiskDifference)
              }
              color={riskColor}
            />
          )}

          {isLarge && (
            <>
              <div style={metricGridStyle}>
                <MetricBox
                  label="Prognoza wydatków"
                  value={formatMoney(forecastStats.forecastExpense)}
                  color={RED}
                />
                <MetricBox
                  label="Przychody"
                  value={formatMoney(forecastStats.incomeToDate)}
                  color={GREEN}
                />
              </div>
              <div style={smallTextStyle}>{forecastStats.budgetRiskDescription}</div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'savings-rate') {
    const savingsColor = getColorForMoney(forecastStats.currentBalance)
    const savingsProgress = Math.abs(forecastStats.savingsRate)

    return (
      <div style={contentStyle}>
        <div style={{ display: 'grid', gap: 9 }}>
          <div>
            <div style={{ ...compactValueStyle, color: savingsColor }}>
              {formatPercent(forecastStats.savingsRate)}
            </div>
            <div style={smallTextStyle}>{forecastStats.savingsRateDescription}</div>
          </div>

          {!isTiny && (
            <MetricBox
              label="Bilans"
              value={formatMoney(forecastStats.currentBalance)}
              color={savingsColor}
            />
          )}

          {isLarge && (
            <>
              <div style={metricGridStyle}>
                <MetricBox
                  label="Przychody"
                  value={formatMoney(forecastStats.incomeToDate)}
                  color={GREEN}
                />
                <MetricBox
                  label="Wydatki"
                  value={formatMoney(forecastStats.expenseToDate)}
                  color={RED}
                />
              </div>
              <ProgressBar
                label="Skala oszczędności"
                value={savingsProgress}
                color={savingsColor}
              />
            </>
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'fixed-vs-variable') {
    const fixedVariable = categoryPatternStats.fixedVariable
    const fixedPercent =
      fixedVariable.total > 0 ? (fixedVariable.fixed / fixedVariable.total) * 100 : 0

    if (!fixedVariable.hasConfiguredGroups) {
      return (
        <div style={contentStyle}>
          <div style={smallTextStyle}>Brak kategorii stałe/zmienne</div>
        </div>
      )
    }

    return (
      <div style={contentStyle}>
        <div style={{ display: 'grid', gap: 9 }}>
          <div>
            <div style={{ ...compactValueStyle, color: BLUE }}>{formatPercent(fixedPercent)}</div>
            <div style={smallTextStyle}>stałych wydatków</div>
          </div>

          {!isTiny && (
            <div style={metricGridStyle}>
              <MetricBox label="Stałe" value={formatMoney(fixedVariable.fixed)} color={BLUE} />
              <MetricBox label="Zmienne" value={formatMoney(fixedVariable.variable)} color={RED} />
            </div>
          )}

          {isLarge && (
            <SimpleBars
              color={BLUE}
              items={[
                { label: 'Stałe', value: fixedVariable.fixed, color: BLUE },
                { label: 'Zmienne', value: fixedVariable.variable, color: RED },
                { label: 'Pozostałe', value: fixedVariable.other, color: MUTED },
              ]}
            />
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'fastest-growing-category') {
    const movement = categoryPatternStats.fastestGrowing

    return (
      <div style={contentStyle}>
        {movement ? (
          <div style={{ display: 'grid', gap: 9 }}>
            <div>
              <div style={{ ...compactValueStyle, color: RED }}>{movement.name}</div>
              <div style={smallTextStyle}>
                {movement.isNew ? 'nowy wydatek' : `wzrost ${formatChange(movement.percent)}`}
              </div>
            </div>

            {!isTiny && (
              <MetricBox label="Wzrost" value={formatMoney(movement.difference)} color={RED} />
            )}

            {isLarge && (
              <div style={metricGridStyle}>
                <MetricBox label="Poprzednio" value={formatMoney(movement.previous)} />
                <MetricBox label="Teraz" value={formatMoney(movement.current)} color={RED} />
              </div>
            )}
          </div>
        ) : (
          <div style={smallTextStyle}>Brak wzrostów</div>
        )}
      </div>
    )
  }

  if (widget.type === 'fastest-falling-category') {
    const movement = categoryPatternStats.fastestFalling

    return (
      <div style={contentStyle}>
        {movement ? (
          <div style={{ display: 'grid', gap: 9 }}>
            <div>
              <div style={{ ...compactValueStyle, color: GREEN }}>{movement.name}</div>
              <div style={smallTextStyle}>spadek wydatków</div>
            </div>

            {!isTiny && (
              <MetricBox label="Spadek" value={formatMoney(Math.abs(movement.difference))} color={GREEN} />
            )}

            {isLarge && (
              <div style={metricGridStyle}>
                <MetricBox label="Poprzednio" value={formatMoney(movement.previous)} color={RED} />
                <MetricBox label="Teraz" value={formatMoney(movement.current)} color={GREEN} />
              </div>
            )}
          </div>
        ) : (
          <div style={smallTextStyle}>Brak spadków</div>
        )}
      </div>
    )
  }

  if (widget.type === 'expense-stability') {
    const stability = categoryPatternStats.expenseStability
    const statusColor =
      stability.status === 'spiky' ? RED : stability.status === 'medium' ? '#b45309' : GREEN
    const dailyItems = stability.dailyExpenses.map((value, index) => ({
      label: String(index + 1),
      value,
      color: value === stability.biggestDay?.total ? RED : BLUE,
    }))

    return (
      <div style={contentStyle}>
        <div style={{ display: 'grid', gap: 9 }}>
          <div>
            <div style={{ ...compactValueStyle, color: statusColor }}>{stability.label}</div>
            <div style={smallTextStyle}>stabilność wydatków</div>
          </div>

          {!isTiny && (
            <MetricBox
              label="Średni dzień"
              value={formatMoney(stability.averageDailyExpense)}
              color={statusColor}
            />
          )}

          {isLarge && (
            <>
              <MetricBox
                label="Największy dzień"
                value={
                  stability.biggestDay
                    ? `${stability.biggestDay.day}. dzień · ${formatMoney(stability.biggestDay.total)}`
                    : 'Brak wydatków'
                }
                color={RED}
              />
              <div style={{ display: 'flex', alignItems: 'end', gap: 3, height: 42 }}>
                {dailyItems.map((item) => {
                  const maxValue = Math.max(1, ...dailyItems.map((entry) => entry.value))
                  const barHeight = Math.max(2, (item.value / maxValue) * 38)

                  return (
                    <div
                      key={item.label}
                      title={`${item.label}: ${formatMoney(item.value)}`}
                      style={{
                        flex: 1,
                        height: barHeight,
                        borderRadius: 4,
                        background: item.color,
                        opacity: 0.85,
                      }}
                    />
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'weekday-patterns') {
    const weekdayPatterns = categoryPatternStats.weekdayPatterns
    const topWeekday = weekdayPatterns[0]

    return (
      <div style={contentStyle}>
        <div style={{ display: 'grid', gap: 9 }}>
          <div>
            <div style={{ ...compactValueStyle, color: RED }}>
              {topWeekday?.label ?? 'Brak'}
            </div>
            <div style={smallTextStyle}>najdroższy dzień tygodnia</div>
          </div>

          {!isTiny && (
            <div style={listStyle}>
              {weekdayPatterns.slice(0, 3).map((day) => (
                <div key={day.label} style={listRowStyle}>
                  <span>{day.label}</span>
                  <strong style={{ fontWeight: 700 }}>{formatMoney(day.total)}</strong>
                </div>
              ))}
            </div>
          )}

          {isLarge && (
            <SimpleBars
              color={RED}
              items={[...weekdayPatterns]
                .sort((left, right) => left.dayIndex - right.dayIndex)
                .map((day) => ({ label: day.label, value: day.total }))}
            />
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'money-leaks') {
    const leaks = categoryPatternStats.moneyLeaks
    const topLeak = leaks[0]

    return (
      <div style={contentStyle}>
        {topLeak ? (
          <div style={{ display: 'grid', gap: 9 }}>
            <div>
              <div style={{ ...compactValueStyle, color: RED }}>{topLeak.name}</div>
              <div style={smallTextStyle}>największy wyciek</div>
            </div>

            {!isTiny && (
              <div style={listStyle}>
                {leaks.map((leak) => (
                  <div key={leak.categoryId} style={listRowStyle}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {leak.name}
                    </span>
                    <strong style={{ fontWeight: 700 }}>{formatMoney(leak.total)}</strong>
                  </div>
                ))}
              </div>
            )}

            {isLarge && (
              <div style={listStyle}>
                {leaks.map((leak) => (
                  <div key={leak.categoryId} style={metricBoxStyle}>
                    <div style={listRowStyle}>
                      <strong style={{ fontWeight: 700 }}>{leak.name}</strong>
                      <strong style={{ color: RED, fontWeight: 700 }}>{formatMoney(leak.total)}</strong>
                    </div>
                    <div style={{ ...smallTextStyle, marginTop: 4 }}>
                      {leak.count} wpisów · średnio {formatMoney(leak.average)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={smallTextStyle}>Brak wyraźnych wycieków</div>
        )}
      </div>
    )
  }

  if (widget.type === 'calendar-heatmap') {
    return (
      <div style={contentStyle}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Heatmap days={monthMetrics.days} dense={isTiny} />

          {isMedium && (
            <div style={metricGridStyle}>
              <MetricBox label="Przychody" value={formatMoney(dashboardStats.income)} color={GREEN} />
              <MetricBox label="Wydatki" value={formatMoney(dashboardStats.expense)} color={RED} />
            </div>
          )}

          {isLarge && (
            <>
              <div style={metricGridStyle}>
                <MetricBox
                  label="Śr. przychód dzienny"
                  value={formatMoney(monthMetrics.averageDailyIncome)}
                  color={GREEN}
                />
                <MetricBox
                  label="Śr. wydatek dzienny"
                  value={formatMoney(monthMetrics.averageDailyExpense)}
                  color={RED}
                />
              </div>
              <div style={listStyle}>
                <div style={{ ...labelStyle, color: NEUTRAL, fontWeight: 700 }}>Top przychody</div>
                {monthMetrics.topIncomeCategories.slice(0, 2).map((category) => (
                  <div key={category.id} style={listRowStyle}>
                    <span>{category.name}</span>
                    <strong style={{ color: GREEN, fontWeight: 700 }}>
                      {formatMoney(category.total)}
                    </strong>
                  </div>
                ))}
                <div style={{ ...labelStyle, color: NEUTRAL, fontWeight: 700 }}>Top wydatki</div>
                {monthMetrics.topExpenseCategories.slice(0, 3).map((category) => (
                  <div key={category.id} style={listRowStyle}>
                    <span>{category.name}</span>
                    <strong style={{ color: RED, fontWeight: 700 }}>
                      {formatMoney(category.total)}
                    </strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'monthly-overview') {
    return (
      <div style={contentStyle}>
        <div style={{ display: 'grid', gap: 9 }}>
          <div style={compactValueStyle}>{dashboardStats.transactionCount}</div>
          <div style={smallTextStyle}>liczba wpisów</div>

          {!isTiny && (
            <MetricBox
              label="Najdroższy dzień"
              value={
                monthMetrics.mostExpensiveDay
                  ? `${monthMetrics.mostExpensiveDay.day}. dzień · ${formatMoney(
                      monthMetrics.mostExpensiveDay.expense
                    )}`
                  : 'Brak wydatków'
              }
              color={monthMetrics.mostExpensiveDay ? RED : NEUTRAL}
            />
          )}

          {isLarge && (
            <div style={metricGridStyle}>
              <MetricBox
                label="Top kategoria"
                value={monthMetrics.topExpenseCategory?.name ?? 'Brak'}
                color={monthMetrics.topExpenseCategory ? RED : NEUTRAL}
              />
              <MetricBox label="Dni z wpisami" value={monthMetrics.daysWithEntries} />
              <MetricBox label="Dni bez wpisów" value={monthMetrics.daysWithoutEntries} />
              <MetricBox label="Bilans" value={formatMoney(dashboardStats.balance)} color={getColorForMoney(dashboardStats.balance)} />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'income-total') {
    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: GREEN }}>{formatMoney(dashboardStats.income)}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Łączne przychody miesiąca</div>}
      </div>
    )
  }

  if (widget.type === 'expense-total') {
    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: RED }}>{formatMoney(dashboardStats.expense)}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Łączne wydatki miesiąca</div>}
      </div>
    )
  }

  if (widget.type === 'transaction-count') {
    return (
      <div style={contentStyle}>
        <div style={valueStyle}>{dashboardStats.transactionCount}</div>
        {!isTiny && (
          <div style={{ ...smallTextStyle, marginTop: 6 }}>
            Przychody: {dashboardStats.incomeCount} · Wydatki: {dashboardStats.expenseCount}
          </div>
        )}
      </div>
    )
  }

  if (widget.type === 'largest-expense') {
    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: RED }}>{formatMoney(dashboardStats.biggestExpense)}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Największy pojedynczy wydatek</div>}
      </div>
    )
  }

  if (widget.type === 'largest-income') {
    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: GREEN }}>{formatMoney(dashboardStats.biggestIncome)}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Największy pojedynczy przychód</div>}
      </div>
    )
  }

  if (widget.type === 'average-expense') {
    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: RED }}>{formatMoney(dashboardStats.averageExpense)}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Średnia wartość wydatku</div>}
      </div>
    )
  }

  if (widget.type === 'average-income') {
    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: GREEN }}>{formatMoney(dashboardStats.averageIncome)}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Średnia wartość przychodu</div>}
      </div>
    )
  }

  if (widget.type === 'dayless-count') {
    return (
      <div style={contentStyle}>
        <div style={valueStyle}>{dashboardStats.daylessCount}</div>
        {!isTiny && <div style={{ ...smallTextStyle, marginTop: 6 }}>Wpisy bez konkretnego dnia</div>}
      </div>
    )
  }

  if (widget.type === 'expense-share') {
    const percent = clampPercent(dashboardStats.expenseShareOfIncome)

    return (
      <div style={contentStyle}>
        <div style={{ ...valueStyle, color: percent > 100 ? RED : NEUTRAL }}>
          {formatPercent(dashboardStats.expenseShareOfIncome)}
        </div>
        {!isTiny && (
          <>
            <div style={{ ...smallTextStyle, marginTop: 6 }}>Wydatki względem przychodów</div>
            <div style={progressTrackStyle}>
              <div
                style={{
                  width: `${percent}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: percent > 90 ? RED : BLUE,
                }}
              />
            </div>
          </>
        )}
      </div>
    )
  }

  if (widget.type === 'income-expense') {
    return (
      <div style={contentStyle}>
        <div style={listStyle}>
          <div style={listRowStyle}>
            <span>Przychody</span>
            <strong style={{ color: GREEN, fontWeight: 700 }}>{formatMoney(dashboardStats.income)}</strong>
          </div>
          <div style={listRowStyle}>
            <span>Wydatki</span>
            <strong style={{ color: RED, fontWeight: 700 }}>{formatMoney(dashboardStats.expense)}</strong>
          </div>
          {isMedium && (
            <div style={listRowStyle}>
              <span>Bilans</span>
              <strong style={{ color: getColorForMoney(dashboardStats.balance), fontWeight: 700 }}>
                {formatMoney(dashboardStats.balance)}
              </strong>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (widget.type === 'top-categories') {
    const limit = isTiny ? 1 : isLarge ? 5 : 4

    return (
      <div style={contentStyle}>
        <CategoryRows
          categories={topExpenseCategories}
          total={dashboardStats.expense}
          limit={limit}
          showBars={isLarge}
        />
      </div>
    )
  }

  if (widget.type === 'recent-transactions') {
    const limit = isTiny ? 1 : isLarge ? 8 : 4
    const visibleItems = [...latestTransactions].sort(compareTransactionsByDate).slice(0, limit)

    return (
      <div style={contentStyle}>
        {visibleItems.length === 0 ? (
          <div style={smallTextStyle}>Brak wpisów</div>
        ) : (
          <div style={listStyle}>
            {visibleItems.map((transaction) => {
              const amount = getSignedAmountForTransaction(transaction)

              return (
                <div key={transaction.id} style={listRowStyle}>
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getTransactionLabel(transaction, categoriesById)}
                  </span>
                  <strong style={{ color: getColorForMoney(amount), fontWeight: 700 }}>
                    {formatMoney(amount)}
                  </strong>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={contentStyle}>
      <div style={smallTextStyle}>Wybierz statystykę dla tego kafla.</div>
    </div>
  )
}

type Props = {
  widget: DashboardWidgetLayoutItem
  rect: DashboardWidgetPixelRect
  transactions: Transaction[]
  selectedMonth: string
  dashboardStats: DashboardStats
  topExpenseCategories: TopCategory[]
  latestTransactions: Transaction[]
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
  onWidgetTypeChange: (id: string, type: DashboardWidgetType) => void
  isDragging: boolean
  isDropBlocked: boolean
  isInteractionLocked: boolean
  isResizeActive: boolean
  onRemove: (id: string) => void
  onResizeStart: (
    id: string,
    edges: DashboardResizeEdges,
    event: { clientX: number; clientY: number }
  ) => void
  styles: Record<string, CSSProperties>
}

export default function DashboardWidgetTile({
  widget,
  rect,
  transactions,
  selectedMonth,
  dashboardStats,
  topExpenseCategories,
  latestTransactions,
  categoriesById,
  getSignedAmountForTransaction,
  onWidgetTypeChange,
  isDragging,
  isDropBlocked,
  isInteractionLocked,
  isResizeActive,
  onRemove,
  onResizeStart,
  styles,
}: Props) {
  const [hoveredResizeEdges, setHoveredResizeEdges] = useState<DashboardResizeEdges | null>(null)
  const definition = DASHBOARD_WIDGET_DEFINITION_BY_TYPE[widget.type]

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: widget.id,
    disabled: isInteractionLocked,
  })

  const wrapperStyle = useMemo<CSSProperties>(() => {
    const dragTransform = isDragging ? transform : null

    return {
      position: 'absolute',
      left: 0,
      top: 0,
      width: rect.width,
      height: rect.height,
      transform: CSS.Translate.toString({
        x: rect.left + (dragTransform?.x ?? 0),
        y: rect.top + (dragTransform?.y ?? 0),
        scaleX: 1,
        scaleY: 1,
      }),
      transition:
        isDragging || isResizeActive
          ? 'none'
          : 'transform 180ms ease, width 180ms ease, height 180ms ease',
      zIndex: isDragging || isResizeActive ? 6 : 2,
      pointerEvents: 'auto',
    }
  }, [isDragging, isResizeActive, rect.height, rect.left, rect.top, rect.width, transform])

  const updateHoveredResizeEdges = (nextEdges: DashboardResizeEdges | null) => {
    setHoveredResizeEdges((prev) => {
      if (areResizeEdgesEqual(prev, nextEdges)) return prev
      return nextEdges
    })
  }

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (isDragging || isResizeActive) return

    const nextEdges = getResizeEdgesFromPointer(
      event.currentTarget.getBoundingClientRect(),
      event.clientX,
      event.clientY
    )

    updateHoveredResizeEdges(nextEdges)
  }

  const handlePointerLeave = () => {
    if (!isResizeActive) updateHoveredResizeEdges(null)
  }

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (isDragging || isResizeActive) return

    const target = event.target as HTMLElement
    if (target.closest('[data-dashboard-ignore-resize="true"]')) return

    const resizeEdges = getResizeEdgesFromPointer(
      event.currentTarget.getBoundingClientRect(),
      event.clientX,
      event.clientY
    )

    if (!resizeEdges) return

    event.preventDefault()
    event.stopPropagation()
    updateHoveredResizeEdges(resizeEdges)
    onResizeStart(widget.id, resizeEdges, { clientX: event.clientX, clientY: event.clientY })
  }

  const cursor = getCursorForResizeEdges(hoveredResizeEdges)
  const safeDefinition =
    definition ??
    DASHBOARD_WIDGET_DEFINITIONS.find((item) => item.type === 'monthly-balance') ??
    DASHBOARD_WIDGET_DEFINITIONS[0]

  return (
    <article ref={setNodeRef} style={wrapperStyle}>
      <div
        style={{
          ...tileStyle,
          cursor,
          borderColor:
            isDragging || isResizeActive
              ? BLUE
              : hoveredResizeEdges
                ? '#60a5fa'
                : tileStyle.borderColor,
          boxShadow:
            isDragging || isResizeActive
              ? '0 18px 36px rgba(37, 99, 235, 0.16)'
              : tileStyle.boxShadow,
          opacity: isDropBlocked ? 0.82 : 1,
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      >
        <div style={tileHeaderStyle}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <select
              data-dashboard-ignore-resize="true"
              value={definition ? widget.type : safeDefinition.type}
              onChange={(event) =>
                onWidgetTypeChange(widget.id, event.target.value as DashboardWidgetType)
              }
              style={selectStyle}
              aria-label="Wybierz statystykę na kaflu"
            >
              {DASHBOARD_WIDGET_DEFINITIONS.map((item) => (
                <option key={item.type} value={item.type}>
                  {item.title}
                </option>
              ))}
            </select>

            {widget.width > 1 && (
              <div style={metaStyle}>
                {safeDefinition.description} · {widget.width}x{widget.height}
              </div>
            )}
          </div>

          <button
            type="button"
            data-dashboard-ignore-resize="true"
            style={dragHandleStyle}
            aria-label={`Przeciągnij widget ${safeDefinition.title}`}
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </button>
        </div>

        <DashboardWidgetContent
          widget={widget}
          transactions={transactions}
          selectedMonth={selectedMonth}
          dashboardStats={dashboardStats}
          topExpenseCategories={topExpenseCategories}
          latestTransactions={latestTransactions}
          categoriesById={categoriesById}
          getSignedAmountForTransaction={getSignedAmountForTransaction}
        />

        <div style={controlsStyle}>
          <div style={resizeHintStyle}>{widget.width > 1 ? 'Zmień rozmiar krawędzią.' : ''}</div>

          <button
            type="button"
            data-dashboard-ignore-resize="true"
            style={styles.dangerButton}
            onClick={() => onRemove(widget.id)}
          >
            Usuń
          </button>
        </div>
      </div>
    </article>
  )
}
