'use client'

import type { Category, Tag, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { getExistingDaysInMonth } from '../../lib/dateUtils'
import type { DashboardWidgetPixelRect } from './dashboardWidgetTileTypes'
import { BLUE, GREEN, MUTED, RED, SOFT_BORDER, SOFT_TEXT } from './dashboardWidgetTileStyles'
import { clampPercent, formatPercent } from './dashboardWidgetTileUtils'

type DayActivityWidgetProps = {
  widget: DashboardWidgetLayoutItem
  rect: DashboardWidgetPixelRect
  transactions: Transaction[]
  selectedMonth: string
  excludedMonthsSet: Set<string>
  transactionTagsMap: Record<string, Tag[]>
  dashboardStats: DashboardStats
  topExpenseCategories: TopCategory[]
  latestTransactions: Transaction[]
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}

type DayActivity = {
  hasIncome: boolean
  hasExpense: boolean
}

type MetricCardProps = {
  label: string
  value: string | number
  percentLabel: string
  color: string
  compact: boolean
}

const FONT_FAMILY =
  'var(--font-app-sans)'

const getDayFromDate = (date: string) => {
  const day = Number(date.slice(8, 10))

  return Number.isFinite(day) ? day : 0
}

const rootStyle = {
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  boxSizing: 'border-box' as const,
  padding: '20px 12px 8px',
  display: 'grid',
  gridTemplateRows: 'auto auto',
  alignContent: 'start',
  gap: 13,
  overflow: 'hidden',
  fontFamily: FONT_FAMILY,
}

const cardsGridStyle = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 8,
}

const compactCardsGridStyle = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
}

const cardStyle = {
  minWidth: 0,
  minHeight: 98,
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 14,
  background: 'linear-gradient(145deg, rgba(255,255,255,0.82), rgba(248,250,252,0.62))',
  boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.86)',
  padding: '9px 10px',
  display: 'grid',
  gridTemplateRows: '32px 1fr 16px',
  gap: 3,
  overflow: 'hidden',
  fontFamily: FONT_FAMILY,
}

const compactCardStyle = {
  ...cardStyle,
  minHeight: 72,
  gridTemplateRows: '24px 1fr 14px',
  padding: '7px 8px',
}

const labelStyle = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 11,
  lineHeight: '15px',
  fontWeight: 500,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  fontFamily: FONT_FAMILY,
}

const compactLabelStyle = {
  ...labelStyle,
  lineHeight: '12px',
  WebkitLineClamp: 2,
}

const valueStyle = {
  minWidth: 0,
  alignSelf: 'center',
  fontSize: 23,
  lineHeight: 1.2,
  fontWeight: 600,
  letterSpacing: '-0.035em',
  fontFamily: FONT_FAMILY,
}

const compactValueStyle = {
  ...valueStyle,
  fontSize: 18,
  letterSpacing: 0,
}

const percentStyle = {
  minWidth: 0,
  color: MUTED,
  fontSize: 10.5,
  lineHeight: '16px',
  fontWeight: 500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
  fontFamily: FONT_FAMILY,
}

const chartPanelStyle = {
  minWidth: 0,
  minHeight: 0,
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 14,
  background: 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(248,250,252,0.58))',
  boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.86)',
  padding: 11,
  display: 'grid',
  gap: 11,
  overflow: 'hidden',
  fontFamily: FONT_FAMILY,
}

const chartTitleStyle = {
  color: '#243041',
  fontSize: 12.5,
  lineHeight: 1.2,
  fontWeight: 600,
  fontFamily: FONT_FAMILY,
}

const barListStyle = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gap: 12,
  overflow: 'hidden',
}

function MetricCard({ label, value, percentLabel, color, compact }: MetricCardProps) {
  return (
    <div style={compact ? compactCardStyle : cardStyle}>
      <div style={compact ? compactLabelStyle : labelStyle}>{label}</div>
      <div style={{ ...(compact ? compactValueStyle : valueStyle), color }}>{value}</div>
      <div style={percentStyle}>{percentLabel}</div>
    </div>
  )
}

function BarRow({
  label,
  value,
  percent,
  color,
}: {
  label: string
  value: number
  percent: number
  color: string
}) {
  const width = clampPercent(percent)

  return (
    <div style={{ display: 'grid', gap: 5, minWidth: 0, fontFamily: FONT_FAMILY }}>
      <div
        style={{
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          color: '#334155',
          fontSize: 12,
          lineHeight: 1.2,
          fontWeight: 500,
          fontFamily: FONT_FAMILY,
        }}
      >
        <span
          style={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        <span style={{ color: MUTED, whiteSpace: 'nowrap' }}>
          {value} · {formatPercent(percent)}
        </span>
      </div>

      <div
        style={{
          width: '100%',
          height: 11,
          borderRadius: 999,
          background: 'rgba(148, 163, 184, 0.16)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${width}%`,
            height: '100%',
            borderRadius: 999,
            background: color,
          }}
        />
      </div>
    </div>
  )
}

export default function DayActivityWidget({
  widget,
  rect,
  transactions,
  selectedMonth,
  excludedMonthsSet,
  getSignedAmountForTransaction,
}: DayActivityWidgetProps) {
  const existingDaysInMonth = getExistingDaysInMonth(selectedMonth)
  const isMonthExcluded = excludedMonthsSet.has(selectedMonth)
  const daysMap = new Map<number, DayActivity>()

  if (!isMonthExcluded && existingDaysInMonth > 0) {
    transactions.forEach((transaction) => {
      if (
        transaction.is_deleted ||
        transaction.day_is_null ||
        !transaction.date.startsWith(selectedMonth)
      ) {
        return
      }

      const day = getDayFromDate(transaction.date)

      if (day < 1 || day > existingDaysInMonth) {
        return
      }

      const signedAmount = getSignedAmountForTransaction(transaction)
      const current = daysMap.get(day) ?? {
        hasIncome: false,
        hasExpense: false,
      }

      if (signedAmount > 0) {
        current.hasIncome = true
      }

      if (signedAmount < 0) {
        current.hasExpense = true
      }

      daysMap.set(day, current)
    })
  }

  const dayStats = [...daysMap.values()]
  const daysWithIncome = dayStats.filter((day) => day.hasIncome).length
  const daysWithExpense = dayStats.filter((day) => day.hasExpense).length
  const activeDays = dayStats.length
  const daysWithoutActivity = isMonthExcluded
    ? 0
    : Math.max(0, existingDaysInMonth - activeDays)

  const incomePercent = existingDaysInMonth > 0 ? (daysWithIncome / existingDaysInMonth) * 100 : 0
  const expensePercent =
    existingDaysInMonth > 0 ? (daysWithExpense / existingDaysInMonth) * 100 : 0
  const emptyPercent =
    existingDaysInMonth > 0 ? (daysWithoutActivity / existingDaysInMonth) * 100 : 0
  const activePercent = existingDaysInMonth > 0 ? (activeDays / existingDaysInMonth) * 100 : 0

  const isLarge = widget.width >= 4
  const isNarrow = rect.width < 420
  const isCompact = !isLarge && isNarrow
  const showChart = isLarge || !isCompact

  if (isMonthExcluded) {
    return (
      <div style={rootStyle}>
        <div
          style={{
            ...cardStyle,
            minHeight: 76,
            gridTemplateRows: 'auto',
            alignContent: 'center',
            color: MUTED,
            fontSize: 13,
            lineHeight: 1.35,
            fontWeight: 500,
          }}
        >
          Ten miesiąc jest wyłączony ze statystyk.
        </div>
      </div>
    )
  }

  return (
    <div style={rootStyle}>
      <div style={isCompact ? compactCardsGridStyle : cardsGridStyle}>
        <MetricCard
          compact={isCompact}
          label="Dni z przychodami"
          value={daysWithIncome}
          percentLabel={formatPercent(incomePercent)}
          color={GREEN}
        />
        <MetricCard
          compact={isCompact}
          label="Dni z wydatkami"
          value={daysWithExpense}
          percentLabel={formatPercent(expensePercent)}
          color={RED}
        />
        <MetricCard
          compact={isCompact}
          label="Dni bez aktywności"
          value={daysWithoutActivity}
          percentLabel={formatPercent(emptyPercent)}
          color={MUTED}
        />
        <MetricCard
          compact={isCompact}
          label="Aktywne dni"
          value={formatPercent(activePercent)}
          percentLabel={`${activeDays} z ${existingDaysInMonth} dni`}
          color={BLUE}
        />
      </div>

      {showChart && (
        <div style={chartPanelStyle}>
          <div style={chartTitleStyle}>Diagram aktywności</div>

          <div style={barListStyle}>
            <BarRow
              label="Dni z przychodami"
              value={daysWithIncome}
              percent={incomePercent}
              color={GREEN}
            />
            <BarRow
              label="Dni z wydatkami"
              value={daysWithExpense}
              percent={expensePercent}
              color={RED}
            />
            <BarRow
              label="Dni bez aktywności"
              value={daysWithoutActivity}
              percent={emptyPercent}
              color={MUTED}
            />
          </div>
        </div>
      )}
    </div>
  )
}
