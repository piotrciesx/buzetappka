import type { Category, Transaction } from '../budgetPageTypes'
import { getUniqueCategoryLabel } from '../categoryUtils'
import { isMonthExcludedFromStats } from '../dateUtils'
import { isTransactionInExistingStatsDate, isTransactionInMonth } from '../dashboardStatsHelpers'
import type { DashboardStatsOptions, TopCategory } from './dashboardStatsTypes'

export function getTopExpenseCategories(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number,
  options: DashboardStatsOptions = {}
): TopCategory[] {
  if (isMonthExcludedFromStats(selectedMonth, options.excludedMonthsSet)) {
    return []
  }

  const map: Record<string, number> = {}

  const filtered = transactions.filter((transaction) =>
    isTransactionInMonth(transaction, selectedMonth) && isTransactionInExistingStatsDate(transaction)
  )

  for (const transaction of filtered) {
    const amount = getSignedAmountForTransaction(transaction)

    if (amount >= 0) {
      continue
    }

    const categoryId = transaction.category_id

    if (!categoriesById[categoryId]) {
      continue
    }

    if (!map[categoryId]) {
      map[categoryId] = 0
    }

    map[categoryId] += Math.abs(amount)
  }

  return Object.entries(map)
    .map(([categoryId, total]) => ({
      categoryId,
      name: getUniqueCategoryLabel(categoryId, categoriesById, Object.keys(map)) || 'Nieznana',
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
}

export function getLatestTransactions(
  transactions: Transaction[],
  selectedMonth: string,
  limit = 5,
  options: DashboardStatsOptions = {}
): Transaction[] {
  if (isMonthExcludedFromStats(selectedMonth, options.excludedMonthsSet)) {
    return []
  }

  return transactions
    .filter(
      (transaction) =>
        isTransactionInMonth(transaction, selectedMonth) &&
        isTransactionInExistingStatsDate(transaction)
    )
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date)
      if (dateCompare !== 0) return dateCompare

      return (b.created_at ?? '').localeCompare(a.created_at ?? '')
    })
    .slice(0, limit)
}
