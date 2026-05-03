'use client'

import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Category, Tag, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { getExistingDaysInMonth } from '../../lib/dateUtils'
import type { DashboardWidgetPixelRect } from './dashboardWidgetTileTypes'
import { GREEN, RED, SOFT_BORDER, SOFT_TEXT } from './dashboardWidgetTileStyles'

type Props = {
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

type MonthPoint = {
  key: string
  label: string
  income: number
  expense: number
  existingDays: number
}

type LineType = 'income' | 'expense'

const FONT =
  'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const rootStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: '1fr auto',
  gap: 6,
  padding: '8px 10px 6px',
  boxSizing: 'border-box',
  overflow: 'hidden',
  fontFamily: FONT,
}

const chartBoxStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 14,
  background: 'rgba(255,255,255,0.6)',
  padding: '6px 7px 0',
  display: 'grid',
  gridTemplateRows: 'minmax(0, 1fr)',
  gap: 0,
  overflow: 'hidden',
}

const chartAreaStyle: CSSProperties = {
  position: 'relative',
  minWidth: 0,
  minHeight: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
}

const svgWrapStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  minWidth: 0,
  minHeight: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
}

const scaleLabelBaseStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  width: 34,
  textAlign: 'right',
  color: 'rgba(100,116,139,0.52)',
  fontSize: 8.5,
  lineHeight: 1,
  fontWeight: 520,
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  userSelect: 'none',
  fontFamily: FONT,
}

const monthLabelBaseStyle: CSSProperties = {
  position: 'absolute',
  color: SOFT_TEXT,
  fontSize: 8.5,
  lineHeight: 1,
  fontWeight: 650,
  textAlign: 'center',
  transform: 'translateX(-50%)',
  pointerEvents: 'none',
  userSelect: 'none',
  fontFamily: FONT,
  whiteSpace: 'nowrap',
}

const footerStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  alignItems: 'center',
  gap: 8,
  overflow: 'visible',
}

const dropdownWrapStyle: CSSProperties = {
  position: 'relative',
  minWidth: 0,
}

const dropdownButtonStyle: CSSProperties = {
  minWidth: 126,
  height: 24,
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 8,
  background: 'rgba(255,255,255,0.86)',
  color: '#334155',
  fontSize: 10.5,
  fontWeight: 650,
  padding: '2px 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 6,
  cursor: 'pointer',
}

const dropdownPanelStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  bottom: 28,
  zIndex: 20,
  width: 170,
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 10,
  background: 'rgba(255,255,255,0.98)',
  boxShadow: '0 12px 28px rgba(15,23,42,0.12)',
  padding: 8,
  display: 'grid',
  gap: 7,
}

const checkboxRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  color: '#334155',
  fontSize: 11,
  fontWeight: 650,
  cursor: 'pointer',
}

const legendStyle: CSSProperties = {
  minWidth: 0,
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: 10,
  color: SOFT_TEXT,
  fontSize: 10.5,
  lineHeight: 1,
  fontWeight: 650,
  overflow: 'hidden',
}

const legendItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  minWidth: 0,
  whiteSpace: 'nowrap',
}

const dotStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  flex: '0 0 auto',
}

const emptyStyle: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  height: '100%',
  color: SOFT_TEXT,
  fontSize: 12,
  textAlign: 'center',
  padding: 10,
}

function getMonthList(selectedMonth: string, count: number) {
  const [year, month] = selectedMonth.split('-').map(Number)
  const result: string[] = []

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(year, month - 1 - index, 1)
    const nextYear = date.getFullYear()
    const nextMonth = String(date.getMonth() + 1).padStart(2, '0')

    result.push(`${nextYear}-${nextMonth}`)
  }

  return result
}

function formatMonthLabel(month: string) {
  const [year, monthNumber] = month.split('-')

  return `${monthNumber}.${year}`
}

function getDayFromDate(date: string) {
  const day = Number(date.slice(8, 10))

  return Number.isFinite(day) ? day : 0
}

function getVisibleModeLabel(showIncome: boolean, showExpense: boolean) {
  if (showIncome && showExpense) {
    return 'przychody + wydatki'
  }

  if (showIncome) {
    return 'tylko przychody'
  }

  if (showExpense) {
    return 'tylko wydatki'
  }

  return 'brak linii'
}

function getNiceStep(maxValue: number) {
  if (maxValue <= 0) {
    return 1
  }

  const roughStep = maxValue / 4
  const power = Math.pow(10, Math.floor(Math.log10(roughStep)))
  const normalized = roughStep / power

  if (normalized <= 1) {
    return power
  }

  if (normalized <= 2) {
    return 2 * power
  }

  if (normalized <= 5) {
    return 5 * power
  }

  return 10 * power
}

function formatScaleValue(value: number) {
  if (Math.abs(value) >= 1000000) {
    return `${Math.round(value / 100000) / 10} mln`
  }

  if (Math.abs(value) >= 1000) {
    return `${Math.round(value / 100) / 10}k`
  }

  return String(Math.round(value))
}

export default function IncomeExpenseTrendWidget({
  rect,
  transactions,
  selectedMonth,
  excludedMonthsSet,
  getSignedAmountForTransaction,
}: Props) {
  const isCompact = rect.width < 520
  const monthsCount = isCompact ? 6 : 12
  const [showIncome, setShowIncome] = useState(true)
  const [showExpense, setShowExpense] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const months = useMemo(() => getMonthList(selectedMonth, monthsCount), [selectedMonth, monthsCount])

  const data: MonthPoint[] = useMemo(() => {
    const map: Record<string, MonthPoint> = {}

    months.forEach((month) => {
      map[month] = {
        key: month,
        label: formatMonthLabel(month),
        income: 0,
        expense: 0,
        existingDays: getExistingDaysInMonth(month),
      }
    })

    transactions.forEach((transaction) => {
      if (transaction.is_deleted) {
        return
      }

      const month = transaction.date.slice(0, 7)
      const day = getDayFromDate(transaction.date)
      const monthPoint = map[month]

      if (!monthPoint || excludedMonthsSet.has(month) || monthPoint.existingDays === 0) {
        return
      }

      if (day < 1 || day > monthPoint.existingDays) {
        return
      }

      const amount = getSignedAmountForTransaction(transaction)

      if (amount >= 0) {
        monthPoint.income += amount
      } else {
        monthPoint.expense += Math.abs(amount)
      }
    })

    return months.map((month) => map[month])
  }, [transactions, months, excludedMonthsSet, getSignedAmountForTransaction])

  const rawMaxValue = Math.max(1, ...data.map((point) => Math.max(point.income, point.expense)))
  const scaleStep = getNiceStep(rawMaxValue)
  const scaleMaxValue = Math.max(scaleStep, Math.ceil(rawMaxValue / scaleStep) * scaleStep)
  const scaleValues = Array.from({ length: Math.floor(scaleMaxValue / scaleStep) + 1 }, (_, index) =>
    index * scaleStep
  ).slice(0, 6)

  if (data.length === 0) {
    return <div style={emptyStyle}>Brak danych.</div>
  }

  const viewBoxWidth = 100
  const viewBoxHeight = 48
  const chartLeft = 13
  const chartRight = 95
  const chartTop = 7
  const chartBottom = 39
  const chartHeight = chartBottom - chartTop
  const monthLabelTopPercent = ((chartBottom + 3.4) / viewBoxHeight) * 100

  const getPointX = (index: number) => {
    if (data.length <= 1) {
      return (chartLeft + chartRight) / 2
    }

    return chartLeft + (index / (data.length - 1)) * (chartRight - chartLeft)
  }

  const getPointY = (value: number) => {
    return chartBottom - (value / scaleMaxValue) * chartHeight
  }

  const buildPath = (type: LineType) => {
    return data
      .map((point, index) => {
        const x = getPointX(index)
        const y = getPointY(point[type])

        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .join(' ')
  }

  return (
    <div style={rootStyle}>
      <div style={chartBoxStyle}>
        <div style={chartAreaStyle}>
          <div style={svgWrapStyle}>
            <svg
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
              width="100%"
              height="100%"
              preserveAspectRatio="none"
            >
              {scaleValues.map((value) => {
                const y = getPointY(value)

                return (
                  <line
                    key={value}
                    x1={chartLeft}
                    y1={y}
                    x2={chartRight}
                    y2={y}
                    stroke={value === 0 ? 'rgba(148,163,184,0.34)' : 'rgba(148,163,184,0.16)'}
                    strokeWidth={value === 0 ? 1 : 0.8}
                    vectorEffect="non-scaling-stroke"
                  />
                )
              })}

              {showIncome && (
                <path
                  d={buildPath('income')}
                  fill="none"
                  stroke={GREEN}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {showExpense && (
                <path
                  d={buildPath('expense')}
                  fill="none"
                  stroke={RED}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </svg>
          </div>

          {scaleValues.map((value) => {
            const topPercent = (getPointY(value) / viewBoxHeight) * 100

            return (
              <div
                key={value}
                style={{
                  ...scaleLabelBaseStyle,
                  top: `${topPercent}%`,
                }}
              >
                {formatScaleValue(value)}
              </div>
            )
          })}

          {data.map((point, index) => {
            const leftPercent = (getPointX(index) / viewBoxWidth) * 100

            return (
              <div
                key={point.key}
                style={{
                  ...monthLabelBaseStyle,
                  left: `${leftPercent}%`,
                  top: `${monthLabelTopPercent}%`,
                }}
              >
                {point.label}
              </div>
            )
          })}
        </div>
      </div>

      <div style={footerStyle}>
        <div style={dropdownWrapStyle}>
          <button
            type="button"
            style={dropdownButtonStyle}
            onClick={() => setIsDropdownOpen((previousValue) => !previousValue)}
          >
            <span>{getVisibleModeLabel(showIncome, showExpense)}</span>
            <span>{isDropdownOpen ? '▴' : '▾'}</span>
          </button>

          {isDropdownOpen && (
            <div style={dropdownPanelStyle}>
              <label style={checkboxRowStyle}>
                <input
                  type="checkbox"
                  checked={showIncome}
                  onChange={(event) => setShowIncome(event.target.checked)}
                />
                <span>przychody</span>
              </label>

              <label style={checkboxRowStyle}>
                <input
                  type="checkbox"
                  checked={showExpense}
                  onChange={(event) => setShowExpense(event.target.checked)}
                />
                <span>wydatki</span>
              </label>
            </div>
          )}
        </div>

        <div style={legendStyle}>
          <span style={legendItemStyle}>
            <span style={{ ...dotStyle, background: GREEN }} />
            <span>przychody</span>
          </span>

          <span style={legendItemStyle}>
            <span style={{ ...dotStyle, background: RED }} />
            <span>wydatki</span>
          </span>
        </div>
      </div>
    </div>
  )
}