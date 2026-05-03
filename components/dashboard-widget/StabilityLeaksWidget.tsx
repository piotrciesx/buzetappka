'use client'

import type { CSSProperties } from 'react'
import type { Category, Tag, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'
import type { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { getUniqueCategoryLabel } from '../../lib/categoryUtils'
import { getExistingDaysInMonth } from '../../lib/dateUtils'
import type { DashboardWidgetPixelRect } from './dashboardWidgetTileTypes'
import { GREEN, MUTED, RED, SOFT_TEXT } from './dashboardWidgetTileStyles'
import { clampPercent, formatMoney, formatPercent } from './dashboardWidgetTileUtils'

type StabilityLeaksWidgetProps = {
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

type CategoryLeak = {
  categoryId: string
  categoryName: string
  currentTotal: number
  averageToDay: number
  difference: number
  percent: number | null
  monthsCompared: number
  isLeak: boolean
}

type LeakMetrics = {
  currentTotal: number
  averageTotalToDay: number
  difference: number
  percent: number | null
  monthsCompared: number
  checkedDay: number
  leakCount: number
  status: {
    label: string
    description: string
    color: string
    tone: string
  }
  categories: CategoryLeak[]
}

const WARNING = '#ca8a04'
const NEUTRAL_BAR = 'rgba(100,116,139,0.72)'

const FONT =
  'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const rootStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  boxSizing: 'border-box',
  padding: '12px 12px 8px',
  overflow: 'hidden',
  fontFamily: FONT,
}

const compactRootStyle: CSSProperties = {
  ...rootStyle,
  display: 'grid',
  alignContent: 'center',
  gap: 18,
  padding: '24px 18px 22px',
}

const wideRootStyle: CSSProperties = {
  ...rootStyle,
  display: 'grid',
  gridTemplateColumns: '0.86fr 1.34fr',
  gap: 16,
}

const panelStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: 'auto minmax(0, 1fr)',
  gap: 10,
  overflow: 'hidden',
}

const borderedPanelStyle: CSSProperties = {
  ...panelStyle,
  borderRight: '1px solid rgba(203,213,225,0.48)',
  paddingRight: 15,
}

const panelHeaderStyle: CSSProperties = {
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  overflow: 'hidden',
}

const titleStyle: CSSProperties = {
  minWidth: 0,
  color: '#172033',
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 620,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const metaStyle: CSSProperties = {
  flexShrink: 0,
  color: MUTED,
  fontSize: 9.8,
  lineHeight: 1,
  fontWeight: 520,
  whiteSpace: 'nowrap',
}

const heroStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  alignContent: 'center',
  gap: 16,
  overflow: 'hidden',
}

const compactHeroStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 12,
  alignItems: 'center',
  overflow: 'hidden',
}

const statusTextStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 5,
  overflow: 'hidden',
}

const statusLabelStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 24,
  lineHeight: 1.02,
  fontWeight: 650,
  letterSpacing: -0.45,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const compactStatusLabelStyle: CSSProperties = {
  ...statusLabelStyle,
  fontSize: 20,
}

const statusDescriptionStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10.8,
  lineHeight: 1.3,
  fontWeight: 430,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}

const countBlockStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 4,
  overflow: 'hidden',
}

const compactCountBlockStyle: CSSProperties = {
  ...countBlockStyle,
  justifyItems: 'end',
  textAlign: 'right',
}

const countValueStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 27,
  lineHeight: 1,
  fontWeight: 650,
  letterSpacing: -0.5,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const compactCountValueStyle: CSSProperties = {
  ...countValueStyle,
  fontSize: 21,
}

const countLabelStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 430,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}

const numbersStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 12,
  overflow: 'hidden',
}

const numberRowStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 12,
  alignItems: 'baseline',
  overflow: 'hidden',
}

const numberLabelStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10.4,
  lineHeight: 1,
  fontWeight: 470,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const numberValueStyle: CSSProperties = {
  minWidth: 0,
  color: '#172033',
  fontSize: 13,
  lineHeight: 1,
  fontWeight: 630,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const compactListStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 10,
  overflow: 'hidden',
}

const wideListStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: 'repeat(5, minmax(0, 1fr))',
  gap: 8,
  overflow: 'hidden',
}

const leakRowStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 12,
  alignItems: 'start',
  overflow: 'hidden',
}

const wideLeakRowStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.78fr) minmax(0, 1fr)',
  gap: 14,
  alignItems: 'center',
  overflow: 'hidden',
}

const leakTextStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 4,
  overflow: 'hidden',
}

const leakNameStyle: CSSProperties = {
  minWidth: 0,
  color: '#172033',
  fontSize: 11,
  lineHeight: 1.15,
  fontWeight: 620,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const leakMetaStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 10,
  lineHeight: 1.2,
  fontWeight: 430,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
}

const leakValueStyle: CSSProperties = {
  minWidth: 0,
  fontSize: 12,
  lineHeight: 1,
  fontWeight: 650,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const barsStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 7,
  overflow: 'hidden',
}

const barRowStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 4,
  overflow: 'hidden',
}

const barHeaderStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: 8,
  alignItems: 'center',
  overflow: 'hidden',
}

const barLabelStyle: CSSProperties = {
  minWidth: 0,
  color: SOFT_TEXT,
  fontSize: 9.8,
  lineHeight: 1,
  fontWeight: 430,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const barValueStyle: CSSProperties = {
  flexShrink: 0,
  color: MUTED,
  fontSize: 9.8,
  lineHeight: 1,
  fontWeight: 550,
  whiteSpace: 'nowrap',
}

const barTrackStyle: CSSProperties = {
  width: '100%',
  height: 6,
  borderRadius: 999,
  background: 'rgba(203,213,225,0.44)',
  overflow: 'hidden',
}

const barFillStyle: CSSProperties = {
  height: '100%',
  minWidth: 3,
  borderRadius: 999,
  transform: 'translateZ(0)',
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
  fontFamily: FONT,
}

function getDayFromDate(date: string) {
  const day = Number(date.slice(8, 10))

  return Number.isFinite(day) ? day : 0
}

function getDaysInCalendarMonth(month: string) {
  const year = Number(month.slice(0, 4))
  const monthIndex = Number(month.slice(5, 7))

  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
    return 0
  }

  return new Date(year, monthIndex, 0).getDate()
}

function getPreviousMonthText(month: string) {
  const year = Number(month.slice(0, 4))
  const monthIndex = Number(month.slice(5, 7))

  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
    return month
  }

  const date = new Date(year, monthIndex - 2, 1)
  const nextYear = date.getFullYear()
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')

  return `${nextYear}-${nextMonth}`
}

function getPreviousMonths(selectedMonth: string, excludedMonthsSet: Set<string>, limit: number) {
  const months: string[] = []
  let cursor = getPreviousMonthText(selectedMonth)

  while (months.length < limit) {
    if (!excludedMonthsSet.has(cursor)) {
      months.push(cursor)
    }

    cursor = getPreviousMonthText(cursor)
  }

  return months
}

function getTransactionMonth(transaction: Transaction) {
  return transaction.date.slice(0, 7)
}

function isTransactionWithoutDay(transaction: Transaction) {
  return Boolean((transaction as Transaction & { day_is_null?: boolean | null }).day_is_null)
}

function shouldIncludeTransactionToDay(transaction: Transaction, month: string, dayLimit: number) {
  if (!transaction.date.startsWith(month)) {
    return false
  }

  if (isTransactionWithoutDay(transaction)) {
    return true
  }

  const day = getDayFromDate(transaction.date)

  return day >= 1 && day <= dayLimit
}

function getCategoryName(categoryId: string, categoriesById: Record<string, Category>) {
  return getUniqueCategoryLabel(categoryId, categoriesById) || 'Bez kategorii'
}

function getLeakCountText(count: number) {
  if (count === 1) {
    return '1 kategoria'
  }

  if (count >= 2 && count <= 4) {
    return `${count} kategorie`
  }

  return `${count} kategorii`
}

function formatLeakPercent(value: number | null) {
  if (value === null) {
    return 'nowy wydatek'
  }

  if (value > 0) {
    return `+${formatPercent(value)}`
  }

  return formatPercent(value)
}

function getLeakColor(leak: CategoryLeak) {
  if (leak.isLeak) {
    return leak.percent === null || (leak.percent ?? 0) >= 70 ? RED : WARNING
  }

  return MUTED
}

function buildMetrics({
  transactions,
  selectedMonth,
  excludedMonthsSet,
  categoriesById,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  selectedMonth: string
  excludedMonthsSet: Set<string>
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}): LeakMetrics {
  const existingDays = getExistingDaysInMonth(selectedMonth)
  const daysInSelectedMonth = getDaysInCalendarMonth(selectedMonth)
  const checkedDay = Math.max(
    1,
    Math.min(existingDays || daysInSelectedMonth, daysInSelectedMonth || existingDays || 1)
  )
  const baselineMonths = getPreviousMonths(selectedMonth, excludedMonthsSet, 12)

  const currentCategoryTotals: Record<string, number> = {}
  const baselineCategoryMonthTotals: Record<string, number[]> = {}
  let currentTotal = 0
  let baselineTotal = 0
  let monthsCompared = 0

  transactions.forEach((transaction) => {
    if (transaction.is_deleted) {
      return
    }

    const amount = getSignedAmountForTransaction(transaction)

    if (amount >= 0) {
      return
    }

    const month = getTransactionMonth(transaction)
    const categoryId = transaction.category_id

    if (month === selectedMonth && shouldIncludeTransactionToDay(transaction, selectedMonth, checkedDay)) {
      const expense = Math.abs(amount)

      currentCategoryTotals[categoryId] = (currentCategoryTotals[categoryId] ?? 0) + expense
      currentTotal += expense
    }
  })

  baselineMonths.forEach((month) => {
    const daysInMonth = getDaysInCalendarMonth(month)
    const dayLimit = Math.max(1, Math.min(checkedDay, daysInMonth || checkedDay))
    const monthTotals: Record<string, number> = {}
    let monthTotal = 0

    transactions.forEach((transaction) => {
      if (transaction.is_deleted) {
        return
      }

      if (!shouldIncludeTransactionToDay(transaction, month, dayLimit)) {
        return
      }

      const amount = getSignedAmountForTransaction(transaction)

      if (amount >= 0) {
        return
      }

      const expense = Math.abs(amount)
      const categoryId = transaction.category_id

      monthTotals[categoryId] = (monthTotals[categoryId] ?? 0) + expense
      monthTotal += expense
    })

    if (monthTotal > 0) {
      monthsCompared += 1
      baselineTotal += monthTotal
    }

    Object.entries(monthTotals).forEach(([categoryId, total]) => {
      if (!baselineCategoryMonthTotals[categoryId]) {
        baselineCategoryMonthTotals[categoryId] = []
      }

      baselineCategoryMonthTotals[categoryId].push(total)
    })
  })

  const averageTotalToDay = monthsCompared > 0 ? baselineTotal / monthsCompared : 0
  const difference = currentTotal - averageTotalToDay
  const percent = averageTotalToDay > 0 ? (difference / averageTotalToDay) * 100 : currentTotal > 0 ? null : 0

  const categoryIds = Array.from(
    new Set([...Object.keys(currentCategoryTotals), ...Object.keys(baselineCategoryMonthTotals)])
  )

  const minimumDifference = Math.max(50, averageTotalToDay * 0.03)

  const allCategories = categoryIds
    .map<CategoryLeak>((categoryId) => {
      const current = currentCategoryTotals[categoryId] ?? 0
      const categoryBaselineMonths = baselineCategoryMonthTotals[categoryId] ?? []
      const average =
        categoryBaselineMonths.length > 0
          ? categoryBaselineMonths.reduce((sum, total) => sum + total, 0) / categoryBaselineMonths.length
          : 0
      const categoryDifference = current - average
      const categoryPercent = average > 0 ? (categoryDifference / average) * 100 : current > 0 ? null : 0
      const isLeak =
        current > 0 &&
        (average <= 0
          ? current >= 100
          : categoryDifference >= minimumDifference &&
            categoryPercent !== null &&
            categoryPercent >= 30)

      return {
        categoryId,
        categoryName: getCategoryName(categoryId, categoriesById),
        currentTotal: current,
        averageToDay: average,
        difference: categoryDifference,
        percent: categoryPercent,
        monthsCompared: categoryBaselineMonths.length,
        isLeak,
      }
    })
    .filter((category) => category.currentTotal > 0 || category.averageToDay > 0)
    .sort((left, right) => {
      if (Number(right.isLeak) !== Number(left.isLeak)) {
        return Number(right.isLeak) - Number(left.isLeak)
      }

      const leftScore = left.percent ?? (left.currentTotal > 0 ? 999 : 0)
      const rightScore = right.percent ?? (right.currentTotal > 0 ? 999 : 0)
      const percentCompare = rightScore - leftScore

      if (percentCompare !== 0) {
        return percentCompare
      }

      return right.difference - left.difference
    })

  const leakCount = allCategories.filter((category) => category.isLeak).length

  const status =
    leakCount === 0
      ? {
          label: 'Stabilnie',
          description: 'Nie widać kategorii z dużym odchyleniem od średniej.',
          color: GREEN,
          tone: 'brak wycieków',
        }
      : allCategories.some((category) => category.isLeak && (category.percent === null || (category.percent ?? 0) >= 70))
        ? {
            label: 'Wyciek',
            description: 'Niektóre kategorie są wyraźnie powyżej średniej dla tego dnia miesiąca.',
            color: RED,
            tone: getLeakCountText(leakCount),
          }
        : {
            label: 'Odchylenie',
            description: 'Część kategorii jest powyżej typowego poziomu dla tego dnia miesiąca.',
            color: WARNING,
            tone: getLeakCountText(leakCount),
          }

  return {
    currentTotal,
    averageTotalToDay,
    difference,
    percent,
    monthsCompared,
    checkedDay,
    leakCount,
    status,
    categories: allCategories,
  }
}

function HeroBlock({
  metrics,
  compact,
}: {
  metrics: LeakMetrics
  compact: boolean
}) {
  const countText = metrics.leakCount > 0 ? getLeakCountText(metrics.leakCount) : 'brak wycieków'
  const countColor = metrics.leakCount > 0 ? metrics.status.color : GREEN

  return (
    <div style={compact ? compactHeroStyle : heroStyle}>
      <div style={statusTextStyle}>
        <div style={{ ...(compact ? compactStatusLabelStyle : statusLabelStyle), color: metrics.status.color }}>
          {metrics.status.label}
        </div>
        <div style={statusDescriptionStyle}>{metrics.status.description}</div>
      </div>

      <div style={compact ? compactCountBlockStyle : countBlockStyle}>
        <div style={{ ...(compact ? compactCountValueStyle : countValueStyle), color: countColor }}>
          {countText}
        </div>
        <div style={countLabelStyle}>powyżej progu 30%</div>
      </div>
    </div>
  )
}

function NumbersBlock({ metrics }: { metrics: LeakMetrics }) {
  return (
    <div style={numbersStyle}>
      <div style={numberRowStyle}>
        <div style={numberLabelStyle}>Teraz do dnia {metrics.checkedDay}</div>
        <div style={{ ...numberValueStyle, color: RED }}>{formatMoney(metrics.currentTotal)}</div>
      </div>

      <div style={numberRowStyle}>
        <div style={numberLabelStyle}>Średnio wcześniej</div>
        <div style={numberValueStyle}>{formatMoney(metrics.averageTotalToDay)}</div>
      </div>

      <div style={numberRowStyle}>
        <div style={numberLabelStyle}>Różnica</div>
        <div style={{ ...numberValueStyle, color: metrics.difference > 0 ? RED : GREEN }}>
          {formatMoney(metrics.difference)}
        </div>
      </div>
    </div>
  )
}

function LeakCompactRow({ leak }: { leak: CategoryLeak }) {
  const color = getLeakColor(leak)

  return (
    <div style={leakRowStyle}>
      <div style={leakTextStyle}>
        <div style={leakNameStyle}>{leak.categoryName}</div>
        <div style={leakMetaStyle}>
          teraz {formatMoney(leak.currentTotal)} · średnio {formatMoney(leak.averageToDay)}
        </div>
      </div>

      <div style={{ ...leakValueStyle, color }}>{formatLeakPercent(leak.percent)}</div>
    </div>
  )
}

function CompareBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const percent = max > 0 ? (value / max) * 100 : 0

  return (
    <div style={barRowStyle}>
      <div style={barHeaderStyle}>
        <div style={barLabelStyle}>{label}</div>
        <div style={barValueStyle}>{formatMoney(value)}</div>
      </div>

      <div style={barTrackStyle}>
        <div
          style={{
            ...barFillStyle,
            width: `${clampPercent(percent)}%`,
            background: color,
          }}
        />
      </div>
    </div>
  )
}

function LeakWideRow({ leak }: { leak: CategoryLeak }) {
  const max = Math.max(leak.currentTotal, leak.averageToDay, 1)
  const color = getLeakColor(leak)

  return (
    <div style={wideLeakRowStyle}>
      <div style={leakTextStyle}>
        <div style={leakNameStyle}>{leak.categoryName}</div>
        <div style={leakMetaStyle}>
          {formatLeakPercent(leak.percent)} · różnica {formatMoney(leak.difference)}
        </div>
      </div>

      <div style={barsStyle}>
        <CompareBar label="średnia" value={leak.averageToDay} max={max} color={NEUTRAL_BAR} />
        <CompareBar label="teraz" value={leak.currentTotal} max={max} color={color} />
      </div>
    </div>
  )
}

export default function StabilityLeaksWidget({
  rect,
  transactions,
  selectedMonth,
  excludedMonthsSet,
  categoriesById,
  getSignedAmountForTransaction,
}: StabilityLeaksWidgetProps) {
  const isCompact = rect.width < 520

  if (excludedMonthsSet.has(selectedMonth)) {
    return <div style={emptyStyle}>Ten miesiąc jest wyłączony ze statystyk.</div>
  }

  const metrics = buildMetrics({
    transactions,
    selectedMonth,
    excludedMonthsSet,
    categoriesById,
    getSignedAmountForTransaction,
  })

  if (metrics.currentTotal === 0 && metrics.averageTotalToDay === 0) {
    return <div style={emptyStyle}>Brak wydatków do porównania.</div>
  }

  if (metrics.monthsCompared === 0) {
    return <div style={emptyStyle}>Za mało wcześniejszych miesięcy do porównania.</div>
  }

  if (isCompact) {
    const compactCategories = metrics.categories.slice(0, 3)

    return (
      <div style={compactRootStyle}>
        <HeroBlock metrics={metrics} compact />

        <div style={compactListStyle}>
          {compactCategories.map((leak) => (
            <LeakCompactRow key={leak.categoryId} leak={leak} />
          ))}
        </div>
      </div>
    )
  }

  const wideCategories = metrics.categories.slice(0, 5)

  return (
    <div style={wideRootStyle}>
      <section style={borderedPanelStyle}>
        <div style={panelHeaderStyle}>
          <div style={{ ...titleStyle, color: metrics.status.color }}>Sygnał</div>
          <div style={metaStyle}>{metrics.status.tone}</div>
        </div>

        <div style={heroStyle}>
          <HeroBlock metrics={metrics} compact={false} />
          <NumbersBlock metrics={metrics} />
        </div>
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div style={titleStyle}>Największe odchylenia</div>
          <div style={metaStyle}>{metrics.monthsCompared} mies. historii</div>
        </div>

        <div style={wideListStyle}>
          {wideCategories.map((leak) => (
            <LeakWideRow key={leak.categoryId} leak={leak} />
          ))}
        </div>
      </section>
    </div>
  )
}