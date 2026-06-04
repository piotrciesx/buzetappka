'use client'

import type { CSSProperties } from 'react'
import { uiTypographyTokens } from '../../lib/uiFoundation'
import type { Category, Tag, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { getExistingDaysInMonth } from '../../lib/dateUtils'
import { getTransactionDay, getTransactionMonth, isActiveTransaction } from '../../lib/transactionDomain'
import type { DashboardWidgetPixelRect } from './dashboardWidgetTileTypes'
import { BLUE, GREEN, MUTED, RED, SOFT_BORDER, SOFT_TEXT } from './dashboardWidgetTileStyles'
import { clampPercent, formatMoney, formatPercent } from './dashboardWidgetTileUtils'

type DailyAveragesWidgetProps = {
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

type AverageRow = {
  label: string
  value: number
  helper: string
  color: string
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
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 8,
}

const compactSummaryGridStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateRows: 'auto auto',
  gap: 8,
}

const compactIncomeExpenseGridStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
}

const summaryCardStyle: CSSProperties = {
  minWidth: 0,
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 13,
  background: 'linear-gradient(145deg, var(--ui-glass-surface), var(--ui-surface-soft))',
  boxShadow: 'inset 1px 1px 0 var(--ui-glass-surface)',
  padding: '8px 9px',
  display: 'grid',
  gap: 3,
  overflow: 'hidden',
}

const compactBalanceCardStyle: CSSProperties = {
  ...summaryCardStyle,
  textAlign: 'center',
  padding: '8px 10px',
}

const summaryLabelStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: uiTypographyTokens.role.widgetMeta,
  lineHeight: uiTypographyTokens.lineHeight.compact,
  fontWeight: uiTypographyTokens.weight.semibold,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const summaryValueStyle: CSSProperties = {
  minWidth: 0,
  color: 'var(--ui-text-primary)',
  fontSize: uiTypographyTokens.hierarchy.t3,
  lineHeight: uiTypographyTokens.lineHeight.compact,
  fontWeight: uiTypographyTokens.weight.semibold,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const compactBalanceValueStyle: CSSProperties = {
  ...summaryValueStyle,
  fontSize: uiTypographyTokens.hierarchy.t2,
}

const chartBoxStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 16,
  background: 'var(--ui-glass-surface-soft)',
  padding: '10px 10px 8px',
  display: 'grid',
  gap: 8,
  alignContent: 'center',
  overflow: 'hidden',
}

const rowStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: '166px minmax(0, 1fr) 82px',
  gap: 8,
  alignItems: 'center',
}

const compactRowStyle: CSSProperties = {
  ...rowStyle,
  gridTemplateColumns: '126px minmax(0, 1fr) 70px',
  gap: 6,
}

const rowLabelStyle: CSSProperties = {
  minWidth: 0,
  color: 'var(--ui-text-secondary)',
  fontSize: uiTypographyTokens.role.widgetMeta,
  lineHeight: uiTypographyTokens.lineHeight.compact,
  fontWeight: uiTypographyTokens.weight.semibold,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const rowValueStyle: CSSProperties = {
  minWidth: 0,
  fontSize: uiTypographyTokens.role.widgetMeta,
  lineHeight: uiTypographyTokens.lineHeight.compact,
  fontWeight: uiTypographyTokens.weight.semibold,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const trackStyle: CSSProperties = {
  position: 'relative',
  minWidth: 0,
  height: 10,
  borderRadius: 999,
  background: 'var(--ui-chart-grid)',
  overflow: 'hidden',
}

const fillStyle: CSSProperties = {
  height: '100%',
  borderRadius: 999,
  boxShadow: 'inset 1px 1px 0 var(--ui-glass-surface-soft)',
}

const footerGridStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 6,
}

const footerCardStyle: CSSProperties = {
  minWidth: 0,
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 12,
  background: 'var(--ui-glass-surface-soft)',
  padding: '6px 7px',
  display: 'grid',
  gap: 2,
  overflow: 'hidden',
}

const footerLabelStyle: CSSProperties = {
  minWidth: 0,
  color: MUTED,
  fontSize: uiTypographyTokens.role.widgetMeta,
  lineHeight: uiTypographyTokens.lineHeight.compact,
  fontWeight: uiTypographyTokens.weight.semibold,
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'ellipsis',
}

const footerValueStyle: CSSProperties = {
  minWidth: 0,
  color: 'var(--ui-text-primary)',
  fontSize: uiTypographyTokens.role.widgetMeta,
  lineHeight: uiTypographyTokens.lineHeight.compact,
  fontWeight: uiTypographyTokens.weight.semibold,
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
  fontSize: uiTypographyTokens.role.metadata,
  lineHeight: uiTypographyTokens.lineHeight.body,
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
      <div style={{ ...summaryValueStyle, color: color || 'var(--ui-text-primary)' }}>{value}</div>
    </div>
  )
}

export default function DailyAveragesWidget({
  rect,
  transactions,
  selectedMonth,
  excludedMonthsSet,
  getSignedAmountForTransaction,
}: DailyAveragesWidgetProps) {
  const existingDays = getExistingDaysInMonth(selectedMonth)
  const isMonthExcluded = excludedMonthsSet.has(selectedMonth)
  const isCompact = rect.width < 520 || rect.height < 300
  const showThirdSummary = rect.width >= 500
  const showFooter = rect.height >= 315

  if (isMonthExcluded) {
    return <div style={emptyStyle}>Ten miesiąc jest wyłączony ze statystyk.</div>
  }

  if (existingDays === 0) {
    return <div style={emptyStyle}>Przyszły miesiąc — brak istniejących dni do policzenia.</div>
  }

  let income = 0
  let expense = 0
  let transactionCount = 0
  const incomeDays = new Set<number>()
  const expenseDays = new Set<number>()
  const activeDays = new Set<number>()

  transactions.forEach((transaction) => {
    if (!isActiveTransaction(transaction) || getTransactionMonth(transaction) !== selectedMonth) {
      return
    }

    const day = getTransactionDay(transaction)

    if (day === null || day < 1 || day > existingDays) {
      return
    }

    const amount = getSignedAmountForTransaction(transaction)
    transactionCount += 1
    activeDays.add(day)

    if (amount >= 0) {
      income += amount
      incomeDays.add(day)
    } else {
      expense += Math.abs(amount)
      expenseDays.add(day)
    }
  })

  const balance = income - expense
  const activeDaysCount = activeDays.size
  const inactiveDaysCount = Math.max(0, existingDays - activeDaysCount)

  const averageIncomePerDay = income / existingDays
  const averageExpensePerDay = expense / existingDays
  const averageBalancePerDay = balance / existingDays
  const averageIncomeActiveDay = incomeDays.size > 0 ? income / incomeDays.size : 0
  const averageExpenseActiveDay = expenseDays.size > 0 ? expense / expenseDays.size : 0
  const activePercent = existingDays > 0 ? (activeDaysCount / existingDays) * 100 : 0

  const rows: AverageRow[] = [
    {
      label: 'Przychód / dzień',
      value: averageIncomePerDay,
      helper: `${incomeDays.size} dni z przychodem`,
      color: GREEN,
    },
    {
      label: 'Wydatek / dzień',
      value: averageExpensePerDay,
      helper: `${expenseDays.size} dni z wydatkiem`,
      color: RED,
    },
    {
      label: 'Bilans / dzień',
      value: averageBalancePerDay,
      helper: `${transactionCount} wpisów`,
      color: averageBalancePerDay >= 0 ? GREEN : RED,
    },
    {
      label: 'Przychód / dzień z przychodem',
      value: averageIncomeActiveDay,
      helper: `${incomeDays.size} dni z przychodem`,
      color: GREEN,
    },
    {
      label: 'Wydatek / dzień z wydatkiem',
      value: averageExpenseActiveDay,
      helper: `${expenseDays.size} dni z wydatkiem`,
      color: RED,
    },
  ]

  const visibleRows = isCompact ? rows.slice(0, 3) : rows
  const maxRowValue = Math.max(1, ...visibleRows.map((row) => Math.abs(row.value)))

  return (
    <div style={isCompact ? compactRootStyle : rootStyle}>
      {isCompact ? (
        <div style={compactSummaryGridStyle}>
          <div style={compactBalanceCardStyle}>
            <div style={summaryLabelStyle}>Średni bilans dzienny</div>
            <div
              style={{
                ...compactBalanceValueStyle,
                color: averageBalancePerDay >= 0 ? GREEN : RED,
              }}
            >
              {formatMoney(averageBalancePerDay)}
            </div>
          </div>

          <div style={compactIncomeExpenseGridStyle}>
            <SummaryCard
              label="Średni przychód dzienny"
              value={formatMoney(averageIncomePerDay)}
              color={GREEN}
            />
            <SummaryCard
              label="Średni wydatek dzienny"
              value={formatMoney(averageExpensePerDay)}
              color={RED}
            />
          </div>
        </div>
      ) : (
        <div style={summaryGridStyle}>
          <SummaryCard
            label="Średni bilans dzienny"
            value={formatMoney(averageBalancePerDay)}
            color={averageBalancePerDay >= 0 ? GREEN : RED}
          />
          <SummaryCard
            label="Średni przychód dzienny"
            value={formatMoney(averageIncomePerDay)}
            color={GREEN}
          />
          {showThirdSummary && (
            <SummaryCard
              label="Średni wydatek dzienny"
              value={formatMoney(averageExpensePerDay)}
              color={RED}
            />
          )}
        </div>
      )}

      <div style={chartBoxStyle}>
        {visibleRows.map((row) => {
          const percent = clampPercent((Math.abs(row.value) / maxRowValue) * 100)

          return (
            <div key={row.label} style={isCompact ? compactRowStyle : rowStyle}>
              <div style={rowLabelStyle} title={row.helper}>
                {row.label}
              </div>
              <div style={trackStyle}>
                <div
                  style={{
                    ...fillStyle,
                    width: `${Math.max(4, percent)}%`,
                    background: row.color,
                    opacity: row.value === 0 ? 0.22 : 0.86,
                  }}
                />
              </div>
              <div style={{ ...rowValueStyle, color: row.color }}>{formatMoney(row.value)}</div>
            </div>
          )
        })}
      </div>

      {showFooter && (
        <div style={footerGridStyle}>
          <div style={footerCardStyle}>
            <div style={footerLabelStyle}>Aktywne dni</div>
            <div style={{ ...footerValueStyle, color: BLUE }}>{formatPercent(activePercent)}</div>
          </div>
          <div style={footerCardStyle}>
            <div style={footerLabelStyle}>Bez aktywności</div>
            <div style={footerValueStyle}>{inactiveDaysCount} dni</div>
          </div>
          <div style={footerCardStyle}>
            <div style={footerLabelStyle}>Wpisy / dzień</div>
            <div style={footerValueStyle}>{(transactionCount / existingDays).toFixed(1)}</div>
          </div>
        </div>
      )}
    </div>
  )
}
