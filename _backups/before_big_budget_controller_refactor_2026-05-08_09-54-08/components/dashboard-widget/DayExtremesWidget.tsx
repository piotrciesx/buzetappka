'use client'

import type { CSSProperties } from 'react'
import type { Category, Tag, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { getExistingDaysInMonth } from '../../lib/dateUtils'
import type { DashboardWidgetPixelRect } from './dashboardWidgetTileTypes'
import { GREEN, RED, SOFT_BORDER, SOFT_TEXT } from './dashboardWidgetTileStyles'
import { clampPercent, formatMoney } from './dashboardWidgetTileUtils'

type DayExtremesWidgetProps = {
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

type DayStats = {
  day: number
  income: number
  expense: number
  balance: number
}

const FONT_FAMILY =
  'var(--font-app-sans)'

const rootStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  padding: '16px 12px 8px',
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
  gap: 8,
  overflow: 'hidden',
  fontFamily: FONT_FAMILY,
}

const compactRootStyle: CSSProperties = {
  ...rootStyle,
  padding: '12px 10px 6px',
  gap: 6,
}

const summaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 8,
}

const summaryCardStyle: CSSProperties = {
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 12,
  background: 'rgba(255,255,255,0.75)',
  padding: '8px 10px',
  display: 'grid',
  gap: 2,
}

const labelStyle: CSSProperties = {
  fontSize: 10.5,
  color: SOFT_TEXT,
  fontWeight: 600,
}

const valueStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
}

const listStyle: CSSProperties = {
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 14,
  background: 'rgba(255,255,255,0.6)',
  padding: '8px 8px 6px',
  display: 'grid',
  gap: 6,
}

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '70px 1fr 70px',
  alignItems: 'center',
  gap: 6,
  fontSize: 11.5,
  fontWeight: 600,
}

const barTrackStyle: CSSProperties = {
  height: 8,
  background: 'rgba(226,232,240,0.8)',
  borderRadius: 4,
  overflow: 'hidden',
}

const barFillStyle: CSSProperties = {
  height: '100%',
  borderRadius: 2,
}

const emptyStyle: CSSProperties = {
  height: '100%',
  display: 'grid',
  placeItems: 'center',
  color: SOFT_TEXT,
  fontSize: 12,
  textAlign: 'center',
}

const formatDate = (month: string, day: number) => {
  const [, m] = month.split('-')
  return `${String(day).padStart(2, '0')}.${m}`
}

export default function DayExtremesWidget({
  rect,
  transactions,
  selectedMonth,
  excludedMonthsSet,
  getSignedAmountForTransaction,
}: DayExtremesWidgetProps) {
  const existingDays = getExistingDaysInMonth(selectedMonth)
  const isCompact = rect.width < 520 || rect.height < 300

  if (excludedMonthsSet.has(selectedMonth)) {
    return <div style={emptyStyle}>Ten miesiąc jest wyłączony ze statystyk.</div>
  }

  if (existingDays === 0) {
    return <div style={emptyStyle}>Brak danych dla przyszłego miesiąca.</div>
  }

  const daysMap: Record<number, DayStats> = {}

  transactions.forEach((t) => {
    if (t.is_deleted || !t.date.startsWith(selectedMonth)) return

    const day = Number(t.date.slice(8, 10))
    if (day < 1 || day > existingDays) return

    if (!daysMap[day]) {
      daysMap[day] = { day, income: 0, expense: 0, balance: 0 }
    }

    const amount = getSignedAmountForTransaction(t)

    if (amount >= 0) {
      daysMap[day].income += amount
    } else {
      daysMap[day].expense += Math.abs(amount)
    }

    daysMap[day].balance += amount
  })

  const days = Object.values(daysMap)

  if (days.length === 0) {
    return <div style={emptyStyle}>Brak wpisów w tym miesiącu.</div>
  }

  const maxIncomeDay = [...days].sort((a, b) => b.income - a.income)[0]
  const maxExpenseDay = [...days].sort((a, b) => b.expense - a.expense)[0]

  const topDays = [...days]
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
    .slice(0, 4)

  const maxValue = Math.max(1, ...topDays.map((d) => Math.abs(d.balance)))

  return (
    <div style={isCompact ? compactRootStyle : rootStyle}>
      <div style={summaryGridStyle}>
        <div style={summaryCardStyle}>
          <div style={labelStyle}>Największy przychód</div>
          <div style={{ ...valueStyle, color: GREEN }}>
            {formatDate(selectedMonth, maxIncomeDay.day)} · {formatMoney(maxIncomeDay.income)}
          </div>
        </div>

        <div style={summaryCardStyle}>
          <div style={labelStyle}>Największy wydatek</div>
          <div style={{ ...valueStyle, color: RED }}>
            {formatDate(selectedMonth, maxExpenseDay.day)} · {formatMoney(maxExpenseDay.expense)}
          </div>
        </div>
      </div>

      <div style={listStyle}>
        {topDays.map((d) => {
          const percent = clampPercent((Math.abs(d.balance) / maxValue) * 100)
          const isPositive = d.balance >= 0

          return (
            <div key={d.day} style={rowStyle}>
              <span>{formatDate(selectedMonth, d.day)}</span>

              <div style={barTrackStyle}>
                <div
                  style={{
                    ...barFillStyle,
                    width: `${Math.max(6, percent)}%`,
                    background: isPositive ? GREEN : RED,
                    opacity: d.balance === 0 ? 0.25 : 0.9,
                  }}
                />
              </div>

              <span style={{ color: isPositive ? GREEN : RED }}>
                {formatMoney(d.balance)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
