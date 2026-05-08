'use client'

import type { CSSProperties } from 'react'
import type { Category, Tag, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { getExistingDaysInMonth } from '../../lib/dateUtils'
import type { DashboardWidgetPixelRect } from './dashboardWidgetTileTypes'
import { BLUE, GREEN, MUTED, RED, SOFT_BORDER, SOFT_TEXT } from './dashboardWidgetTileStyles'
import { clampPercent, formatMoney } from './dashboardWidgetTileUtils'

type WeeklyTrendWidgetProps = {
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

type WeekMetric = {
  id: string
  label: string
  startDay: number
  endDay: number
  income: number
  expense: number
  balance: number
  count: number
}

const FONT_FAMILY =
  'var(--font-app-sans)'

const rootStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  boxSizing: 'border-box',
  padding: '18px 12px 8px',
  display: 'grid',
  gridTemplateRows: 'auto 1fr auto',
  gap: 10,
  overflow: 'hidden',
  fontFamily: FONT_FAMILY,
}

const compactRootStyle: CSSProperties = {
  ...rootStyle,
  padding: '14px 10px 7px',
  gap: 8,
}

const summaryGridStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 8,
}

const compactSummaryGridStyle: CSSProperties = {
  ...summaryGridStyle,
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
}

const summaryCardStyle: CSSProperties = {
  minWidth: 0,
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 13,
  background: 'linear-gradient(145deg, rgba(255,255,255,0.84), rgba(248,250,252,0.62))',
  boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.86)',
  padding: '8px 9px',
  display: 'grid',
  gap: 3,
  overflow: 'hidden',
}

const summaryLabelStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10.5,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const summaryValueStyle: CSSProperties = {
  minWidth: 0,
  color: '#111827',
  fontSize: 15,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const chartBoxStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 16,
  background: 'rgba(255,255,255,0.58)',
  padding: '10px 10px 8px',
  display: 'grid',
  gridTemplateRows: '1fr auto',
  gap: 7,
  overflow: 'hidden',
}

const barsGridStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(54px, 1fr))',
  alignItems: 'end',
  gap: 8,
}

const weekColumnStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  height: '100%',
  display: 'grid',
  gridTemplateRows: '1fr auto',
  gap: 5,
  alignItems: 'end',
  overflow: 'hidden',
}

const barSlotStyle: CSSProperties = {
  minWidth: 0,
  height: '100%',
  minHeight: 64,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  gap: 4,
  overflow: 'hidden',
}

const barBaseStyle: CSSProperties = {
  width: '36%',
  minWidth: 9,
  maxWidth: 24,
  borderRadius: 4,
  boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.42)',
}

const weekLabelStyle: CSSProperties = {
  minWidth: 0,
  color: MUTED,
  fontSize: 10.5,
  lineHeight: 1.2,
  fontWeight: 600,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const legendStyle: CSSProperties = {
  minWidth: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 10,
  color: SOFT_TEXT,
  fontSize: 10.5,
  lineHeight: 1.2,
  fontWeight: 600,
  overflow: 'hidden',
}

const legendDotStyle: CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: 999,
  flex: '0 0 auto',
}

const footerGridStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
  gap: 6,
}

const weekMiniCardStyle: CSSProperties = {
  minWidth: 0,
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 12,
  background: 'rgba(255,255,255,0.62)',
  padding: '6px 7px',
  display: 'grid',
  gap: 2,
  overflow: 'hidden',
}

const weekMiniTitleStyle: CSSProperties = {
  minWidth: 0,
  color: MUTED,
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const weekMiniValueStyle: CSSProperties = {
  minWidth: 0,
  color: '#111827',
  fontSize: 11.5,
  lineHeight: 1.2,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const emptyStyle: CSSProperties = {
  height: '100%',
  minHeight: 0,
  display: 'grid',
  placeItems: 'center',
  color: SOFT_TEXT,
  fontSize: 12,
  lineHeight: 1.35,
  textAlign: 'center',
  padding: 12,
  fontFamily: FONT_FAMILY,
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div style={summaryCardStyle}>
      <div style={summaryLabelStyle}>{label}</div>
      <div style={{ ...summaryValueStyle, color: color || '#111827' }}>{value}</div>
    </div>
  )
}

function getDayFromDate(date: string) {
  const day = Number(date.slice(8, 10))

  return Number.isFinite(day) ? day : 0
}

function getIsoWeekday(year: number, monthIndex: number, day: number) {
  const weekday = new Date(year, monthIndex, day).getDay()

  return weekday === 0 ? 7 : weekday
}

function getFullWeeksInMonth(selectedMonth: string, existingDays: number): WeekMetric[] {
  const [yearText, monthText] = selectedMonth.split('-')
  const year = Number(yearText)
  const monthIndex = Number(monthText) - 1

  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || existingDays < 7) {
    return []
  }

  const fullWeeks: WeekMetric[] = []
  let day = 1

  while (day <= existingDays) {
    const isoWeekday = getIsoWeekday(year, monthIndex, day)

    if (isoWeekday !== 1) {
      day += 1
      continue
    }

    const startDay = day
    const endDay = day + 6

    if (endDay <= existingDays) {
      const label = `${String(startDay).padStart(2, '0')}–${String(endDay).padStart(2, '0')}`

      fullWeeks.push({
        id: label,
        label,
        startDay,
        endDay,
        income: 0,
        expense: 0,
        balance: 0,
        count: 0,
      })
    }

    day += 7
  }

  return fullWeeks
}

export default function WeeklyTrendWidget({
  rect,
  transactions,
  selectedMonth,
  excludedMonthsSet,
  getSignedAmountForTransaction,
}: WeeklyTrendWidgetProps) {
  const existingDays = getExistingDaysInMonth(selectedMonth)
  const isMonthExcluded = excludedMonthsSet.has(selectedMonth)
  const isCompact = rect.width < 520 || rect.height < 300
  const showFooter = rect.height >= 315

  if (isMonthExcluded) {
    return <div style={emptyStyle}>Ten miesiąc jest wyłączony ze statystyk.</div>
  }

  if (existingDays === 0) {
    return <div style={emptyStyle}>Przyszły miesiąc — brak istniejących dni do policzenia.</div>
  }

  const weeks = getFullWeeksInMonth(selectedMonth, existingDays)

  if (weeks.length === 0) {
    return <div style={emptyStyle}>Brak pełnych tygodni do porównania w tym miesiącu.</div>
  }

  transactions.forEach((transaction) => {
    if (transaction.is_deleted || !transaction.date.startsWith(selectedMonth)) {
      return
    }

    const day = getDayFromDate(transaction.date)

    if (day < 1 || day > existingDays) {
      return
    }

    const week = weeks.find((item) => day >= item.startDay && day <= item.endDay)

    if (!week) {
      return
    }

    const amount = getSignedAmountForTransaction(transaction)

    if (amount >= 0) {
      week.income += amount
    } else {
      week.expense += Math.abs(amount)
    }

    week.balance += amount
    week.count += 1
  })

  const totalBalance = weeks.reduce((sum, week) => sum + week.balance, 0)
  const bestWeek = [...weeks].sort((left, right) => right.balance - left.balance)[0]
  const worstWeek = [...weeks].sort((left, right) => left.balance - right.balance)[0]
  const busiestWeek = [...weeks].sort((left, right) => right.count - left.count)[0]
  const maxBarValue = Math.max(1, ...weeks.map((week) => Math.max(week.income, week.expense)))

  return (
    <div style={isCompact ? compactRootStyle : rootStyle}>
      <div style={isCompact ? compactSummaryGridStyle : summaryGridStyle}>
        <SummaryCard
          label="Bilans pełnych tygodni"
          value={formatMoney(totalBalance)}
          color={totalBalance >= 0 ? GREEN : RED}
        />
        <SummaryCard
          label="Największy ruch"
          value={`${busiestWeek.label} · ${busiestWeek.count} wpisów`}
          color={BLUE}
        />
        <SummaryCard
          label="Najlepszy tydzień"
          value={`${bestWeek.label} · ${formatMoney(bestWeek.balance)}`}
          color={bestWeek.balance >= 0 ? GREEN : RED}
        />
        <SummaryCard
          label="Najgorszy tydzień"
          value={`${worstWeek.label} · ${formatMoney(worstWeek.balance)}`}
          color={worstWeek.balance >= 0 ? GREEN : RED}
        />
      </div>

      <div style={chartBoxStyle}>
        <div style={barsGridStyle}>
          {weeks.map((week) => {
            const incomePercent = clampPercent((week.income / maxBarValue) * 100)
            const expensePercent = clampPercent((week.expense / maxBarValue) * 100)

            return (
              <div key={week.id} style={weekColumnStyle}>
                <div style={barSlotStyle}>
                  <div
                    title={`${week.label} przychody: ${formatMoney(week.income)}`}
                    style={{
                      ...barBaseStyle,
                      height: `${Math.max(5, incomePercent)}%`,
                      background: GREEN,
                      opacity: week.income === 0 ? 0.2 : 0.88,
                    }}
                  />
                  <div
                    title={`${week.label} wydatki: ${formatMoney(week.expense)}`}
                    style={{
                      ...barBaseStyle,
                      height: `${Math.max(5, expensePercent)}%`,
                      background: RED,
                      opacity: week.expense === 0 ? 0.2 : 0.82,
                    }}
                  />
                </div>

                <div style={weekLabelStyle}>{week.label}</div>
              </div>
            )
          })}
        </div>

        <div style={legendStyle}>
          <span style={{ ...legendDotStyle, background: GREEN }} />
          <span>przychody</span>
          <span style={{ ...legendDotStyle, background: RED }} />
          <span>wydatki</span>
        </div>
      </div>

      {showFooter && (
        <div style={footerGridStyle}>
          {weeks.map((week) => (
            <div key={week.id} style={weekMiniCardStyle}>
              <div style={weekMiniTitleStyle}>{week.label}</div>
              <div style={{ ...weekMiniValueStyle, color: week.balance >= 0 ? GREEN : RED }}>
                {formatMoney(week.balance)}
              </div>
              <div style={{ ...weekMiniTitleStyle, fontWeight: 600 }}>{week.count} wpisów</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
