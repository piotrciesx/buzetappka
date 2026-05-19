import type { Category, Transaction } from '../budgetPageTypes'
import { getUniqueCategoryLabel } from '../categoryUtils'
import { getExistingDaysInMonth, isMonthExcludedFromStats } from '../dateUtils'
import { getChange, getIncludedMonthRange, getMonthLabel, getTransactionDay, isTransactionInExistingStatsDate, isTransactionInMonth, shiftMonth } from '../dashboardStatsHelpers'
import type { DashboardCategoryTrend, DashboardDailyCashflowPoint, DashboardDailyCashflowStats, DashboardMonthlyTrendPoint, DashboardMonthOverMonthStats, DashboardStatsOptions, DashboardTrendStats } from './dashboardStatsTypes'

const createEmptyMonthPoint = (month: string): DashboardMonthlyTrendPoint => ({
  month,
  label: getMonthLabel(month),
  income: 0,
  expense: 0,
  balance: 0,
})

const getMonthlyTrendPoints = (
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number,
  options: DashboardStatsOptions = {}
) => {
  const months = getIncludedMonthRange(selectedMonth, 6, options.excludedMonthsSet)
  const monthSet = new Set(months)
  const pointsByMonth = Object.fromEntries(
    months.map((month) => [month, createEmptyMonthPoint(month)])
  ) as Record<string, DashboardMonthlyTrendPoint>

  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7)
    if (!isTransactionInExistingStatsDate(transaction)) continue
    if (!monthSet.has(month) || !categoriesById[transaction.category_id]) continue

    const amount = getSignedAmountForTransaction(transaction)
    const point = pointsByMonth[month]

    if (amount > 0) {
      point.income += amount
    } else if (amount < 0) {
      point.expense += Math.abs(amount)
    }
  }

  return months.map((month) => {
    const point = pointsByMonth[month]
    return {
      ...point,
      balance: point.income - point.expense,
    }
  })
}

export function getDashboardTrendStats(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number,
  options: DashboardStatsOptions = {}
): DashboardTrendStats {
  const months = getMonthlyTrendPoints(
    transactions,
    categoriesById,
    selectedMonth,
    getSignedAmountForTransaction,
    options
  )
  const current = months[months.length - 1] ?? createEmptyMonthPoint(selectedMonth)
  const previous = months[months.length - 2] ?? null

  return {
    months,
    current,
    previous,
    expenseChange: getChange(current.expense, previous?.expense ?? 0),
    incomeChange: getChange(current.income, previous?.income ?? 0),
    balanceChange: getChange(current.balance, previous?.balance ?? 0),
  }
}

export function getDashboardDailyCashflowStats(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number,
  options: DashboardStatsOptions = {}
): DashboardDailyCashflowStats {
  const daysInMonth = getExistingDaysInMonth(selectedMonth)
  const points = Array.from({ length: daysInMonth }, (_, index) => ({
    day: index + 1,
    label: String(index + 1),
    income: 0,
    expense: 0,
    net: 0,
    cumulative: 0,
  }))
  let daylessCount = 0

  if (isMonthExcludedFromStats(selectedMonth, options.excludedMonthsSet)) {
    return {
      points,
      finalBalance: 0,
      minPoint: points[0] ?? null,
      maxPoint: points[0] ?? null,
      daylessCount: 0,
    }
  }

  for (const transaction of transactions) {
    if (!isTransactionInMonth(transaction, selectedMonth)) continue
    if (!isTransactionInExistingStatsDate(transaction)) continue
    if (!categoriesById[transaction.category_id]) continue

    const day = getTransactionDay(transaction)
    if (!day) {
      daylessCount += 1
      continue
    }

    const point = points[day - 1]
    if (!point) continue

    const amount = getSignedAmountForTransaction(transaction)

    if (amount > 0) {
      point.income += amount
    } else if (amount < 0) {
      point.expense += Math.abs(amount)
    }

    point.net += amount
  }

  let cumulative = 0

  for (const point of points) {
    cumulative += point.net
    point.cumulative = cumulative
  }

  const minPoint = points.reduce<DashboardDailyCashflowPoint | null>((winner, point) => {
    if (!winner || point.cumulative < winner.cumulative) return point
    return winner
  }, null)
  const maxPoint = points.reduce<DashboardDailyCashflowPoint | null>((winner, point) => {
    if (!winner || point.cumulative > winner.cumulative) return point
    return winner
  }, null)

  return {
    points,
    finalBalance: points[points.length - 1]?.cumulative ?? 0,
    minPoint,
    maxPoint,
    daylessCount,
  }
}

export function getDashboardMonthOverMonthStats(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number,
  options: DashboardStatsOptions = {}
): DashboardMonthOverMonthStats {
  const trend = getDashboardTrendStats(
    transactions,
    categoriesById,
    selectedMonth,
    getSignedAmountForTransaction,
    options
  )
  const current = trend.current
  const previous = trend.previous ?? createEmptyMonthPoint(shiftMonth(selectedMonth, -1))

  return {
    currentMonth: current.month,
    previousMonth: previous.month,
    metrics: [
      {
        key: 'income',
        label: 'Przychody',
        current: current.income,
        previous: previous.income,
        change: getChange(current.income, previous.income),
      },
      {
        key: 'expense',
        label: 'Wydatki',
        current: current.expense,
        previous: previous.expense,
        change: getChange(current.expense, previous.expense),
      },
      {
        key: 'balance',
        label: 'Bilans',
        current: current.balance,
        previous: previous.balance,
        change: getChange(current.balance, previous.balance),
      },
    ],
  }
}

export function getDashboardCategoryTrends(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number,
  options: DashboardStatsOptions = {}
): DashboardCategoryTrend[] {
  const months = getIncludedMonthRange(selectedMonth, 6, options.excludedMonthsSet)
  const monthSet = new Set(months)
  const categoryMap: Record<string, DashboardCategoryTrend> = {}

  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7)
    const category = categoriesById[transaction.category_id]
    if (!isTransactionInExistingStatsDate(transaction)) continue
    if (!monthSet.has(month) || !category) continue

    const amount = getSignedAmountForTransaction(transaction)
    if (amount >= 0) continue

    if (!categoryMap[category.id]) {
      categoryMap[category.id] = {
        categoryId: category.id,
        name: getUniqueCategoryLabel(category.id, categoriesById),
        total: 0,
        months: months.map((item) => ({
          month: item,
          label: getMonthLabel(item),
          total: 0,
        })),
        change: { amount: 0, percent: null },
      }
    }

    const trend = categoryMap[category.id]
    const monthPoint = trend.months.find((item) => item.month === month)
    const absoluteAmount = Math.abs(amount)

    trend.total += absoluteAmount

    if (monthPoint) {
      monthPoint.total += absoluteAmount
    }
  }

  return Object.values(categoryMap)
    .map((category) => {
      const current = category.months[category.months.length - 1]?.total ?? 0
      const previous = category.months[category.months.length - 2]?.total ?? 0

      return {
        ...category,
        name: getUniqueCategoryLabel(category.categoryId, categoriesById, Object.keys(categoryMap)),
        change: getChange(current, previous),
      }
    })
    .sort((left, right) => right.total - left.total)
}
