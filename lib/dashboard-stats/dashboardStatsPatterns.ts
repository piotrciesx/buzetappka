import type { Category, Transaction } from '../budgetPageTypes'
import { getUniqueCategoryLabel } from '../categoryUtils'
import { getExistingDaysInMonth, isMonthExcludedFromStats } from '../dateUtils'
import { getIncludedMonthRange, getTransactionDay, getWeekdayIndex, isTransactionInExistingStatsDate, shiftMonth } from '../dashboardStatsHelpers'
import { getTransactionMonth, isTransactionInMonth } from '../transactionDomain'
import type { DashboardCategoryMovement, DashboardCategoryPatternStats, DashboardFixedVariableStats, DashboardMoneyLeak, DashboardStatsOptions } from './dashboardStatsTypes'

export function getDashboardCategoryPatternStats(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number,
  options: DashboardStatsOptions = {}
): DashboardCategoryPatternStats {
  const previousMonths = getIncludedMonthRange(
    shiftMonth(selectedMonth, -1),
    3,
    options.excludedMonthsSet
  )
  const fallbackPreviousMonth = shiftMonth(selectedMonth, -1)
  const baselineMonths = previousMonths.length > 0 ? previousMonths : [fallbackPreviousMonth]
  const daysInMonth = getExistingDaysInMonth(selectedMonth)
  const dailyExpenses = Array.from({ length: daysInMonth }, () => 0)
  const weekdayLabels = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'niedz.']
  const weekdayPatterns = weekdayLabels.map((label, dayIndex) => ({
    dayIndex,
    label,
    total: 0,
  }))
  const fixedIds = new Set<string>()
  const variableIds = new Set<string>()

  const currentCategoryTotals: Record<string, DashboardCategoryMovement> = {}
  const previousCategoryTotals: Record<string, number> = {}
  const leakMap: Record<string, Omit<DashboardMoneyLeak, 'baseline' | 'difference' | 'percent'>> = {}
  const fixedVariable: DashboardFixedVariableStats = {
    fixed: 0,
    variable: 0,
    other: 0,
    total: 0,
    hasConfiguredGroups: fixedIds.size > 0 || variableIds.size > 0,
  }

  if (isMonthExcludedFromStats(selectedMonth, options.excludedMonthsSet)) {
    return {
      fixedVariable,
      fastestGrowing: null,
      fastestFalling: null,
      expenseStability: {
        status: 'stable',
        label: 'Brak danych',
        averageDailyExpense: 0,
        biggestDay: null,
        dailyExpenses,
      },
      weekdayPatterns,
      moneyLeaks: [],
    }
  }

  for (const transaction of transactions) {
    const month = getTransactionMonth(transaction)
    if (!isTransactionInExistingStatsDate(transaction)) continue
    if (month !== selectedMonth && !baselineMonths.includes(month)) continue

    const category = categoriesById[transaction.category_id]
    if (!category) continue

    const amount = getSignedAmountForTransaction(transaction)
    if (amount >= 0) continue

    const expense = Math.abs(amount)

    if (baselineMonths.includes(month)) {
      previousCategoryTotals[category.id] = (previousCategoryTotals[category.id] ?? 0) + expense
      continue
    }

    if (!currentCategoryTotals[category.id]) {
      currentCategoryTotals[category.id] = {
        categoryId: category.id,
        name: getUniqueCategoryLabel(category.id, categoriesById),
        previous: 0,
        current: 0,
        difference: 0,
        percent: null,
        isNew: false,
      }
    }

    currentCategoryTotals[category.id].current += expense
    fixedVariable.total += expense

    if (fixedIds.has(category.id)) {
      fixedVariable.fixed += expense
    } else if (variableIds.has(category.id)) {
      fixedVariable.variable += expense
    } else {
      fixedVariable.other += expense
    }

    const day = getTransactionDay(transaction)

    if (day && dailyExpenses[day - 1] !== undefined) {
      dailyExpenses[day - 1] += expense
      weekdayPatterns[getWeekdayIndex(transaction.date)].total += expense
    }

    if (!leakMap[category.id]) {
      leakMap[category.id] = {
        categoryId: category.id,
        name: getUniqueCategoryLabel(category.id, categoriesById),
        total: 0,
        count: 0,
        average: 0,
      }
    }

    leakMap[category.id].total += expense
    leakMap[category.id].count += 1
  }

  const categoryIds = new Set([
    ...Object.keys(currentCategoryTotals),
    ...Object.keys(previousCategoryTotals),
  ])
  const scopedCategoryIds = [...categoryIds]
  const movements = [...categoryIds].map((categoryId) => {
    const current = currentCategoryTotals[categoryId]?.current ?? 0
    const previous = previousCategoryTotals[categoryId] ?? 0
    const difference = current - previous

    return {
      categoryId,
      name: getUniqueCategoryLabel(categoryId, categoriesById, scopedCategoryIds) || 'Nieznana',
      previous,
      current,
      difference,
      percent: previous > 0 ? (difference / previous) * 100 : null,
      isNew: previous === 0 && current > 0,
    }
  })
  const fastestGrowing =
    movements
      .filter((movement) => movement.difference > 0)
      .sort((left, right) => right.difference - left.difference)[0] ?? null
  const fastestFalling =
    movements
      .filter((movement) => movement.difference < 0)
      .sort((left, right) => left.difference - right.difference)[0] ?? null
  const averageDailyExpense =
    dailyExpenses.reduce((sum, value) => sum + value, 0) / Math.max(1, dailyExpenses.length)
  const averageDeviation =
    dailyExpenses.reduce((sum, value) => sum + Math.abs(value - averageDailyExpense), 0) /
    Math.max(1, dailyExpenses.length)
  const variationRatio = averageDailyExpense > 0 ? averageDeviation / averageDailyExpense : 0
  const stabilityStatus =
    variationRatio > 1 ? 'spiky' : variationRatio > 0.55 ? 'medium' : 'stable'
  const biggestDayTotal = Math.max(...dailyExpenses, 0)
  const biggestDayIndex = dailyExpenses.findIndex((value) => value === biggestDayTotal)
  const totalExpense = fixedVariable.total
  const leakNoticeableThreshold = Math.max(50, totalExpense * 0.03)
  const hasEnoughLeakHistory = baselineMonths.some((month) =>
    transactions.some((transaction) => {
      const category = categoriesById[transaction.category_id]
      return (
        category &&
        isTransactionInMonth(transaction, month) &&
        getSignedAmountForTransaction(transaction) < 0
      )
    })
  )
  const moneyLeaks = hasEnoughLeakHistory
    ? Object.values(leakMap)
    .map((leak) => {
      const previousTotal = previousCategoryTotals[leak.categoryId] ?? 0
      const baseline = previousTotal / Math.max(1, baselineMonths.length)
      const difference = leak.total - baseline

      return {
        ...leak,
        name: getUniqueCategoryLabel(leak.categoryId, categoriesById, Object.keys(leakMap)) || leak.name,
        average: leak.count > 0 ? leak.total / leak.count : 0,
        baseline,
        difference,
        percent: baseline > 0 ? (difference / baseline) * 100 : null,
      }
    })
    .filter(
      (leak) =>
        leak.total >= leakNoticeableThreshold &&
        leak.difference >= leakNoticeableThreshold &&
        (leak.percent === null ? leak.baseline === 0 : leak.percent >= 40)
    )
    .sort((left, right) => right.difference - left.difference)
    .slice(0, 3)
    : []

  return {
    fixedVariable,
    fastestGrowing,
    fastestFalling,
    expenseStability: {
      status: stabilityStatus,
      label:
        stabilityStatus === 'spiky'
          ? 'Skokowo'
          : stabilityStatus === 'medium'
            ? 'Średnio'
            : 'Stabilnie',
      averageDailyExpense,
      biggestDay:
        biggestDayIndex >= 0 && biggestDayTotal > 0
          ? {
              day: biggestDayIndex + 1,
              total: biggestDayTotal,
            }
          : null,
      dailyExpenses,
    },
    weekdayPatterns: weekdayPatterns.sort((left, right) => right.total - left.total),
    moneyLeaks,
  }
}
