import type { Category, Transaction } from '../../lib/budgetPageTypes'
import { getUniqueCategoryLabel } from '../../lib/categoryUtils'
import { getExistingDaysInMonth } from '../../lib/dateUtils'
import { GREEN, MUTED, RED } from './dashboardWidgetTileStyles'
import { formatPercent } from './dashboardWidgetTileUtils'

const WARNING = '#ca8a04'

export type CategoryLeak = {
  categoryId: string
  categoryName: string
  currentTotal: number
  averageToDay: number
  difference: number
  percent: number | null
  monthsCompared: number
  isLeak: boolean
}

export type LeakMetrics = {
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

export function getLeakCountText(count: number) {
  if (count === 1) {
    return '1 kategoria'
  }

  if (count >= 2 && count <= 4) {
    return `${count} kategorie`
  }

  return `${count} kategorii`
}

export function formatLeakPercent(value: number | null) {
  if (value === null) {
    return 'nowy wydatek'
  }

  if (value > 0) {
    return `+${formatPercent(value)}`
  }

  return formatPercent(value)
}

export function getLeakColor(leak: CategoryLeak) {
  if (leak.isLeak) {
    return leak.percent === null || (leak.percent ?? 0) >= 70 ? RED : WARNING
  }

  return MUTED
}

export function buildMetrics({
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
