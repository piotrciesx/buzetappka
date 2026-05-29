import type { Category, Transaction } from '../budgetPageTypes'
import { getUniqueCategoryLabel } from '../categoryUtils'
import { isMonthExcludedFromStats } from '../dateUtils'
import {
  isDaylessTransaction,
  isTransactionInExistingStatsDate,
  isTransactionInMonth,
} from '../dashboardStatsHelpers'
import type { DashboardOverview, DashboardStats, DashboardStatsOptions, TopCategory } from './dashboardStatsTypes'

const emptyDashboardStats = (): DashboardStats => ({
  income: 0,
  expense: 0,
  balance: 0,
  transactionCount: 0,
  incomeCount: 0,
  expenseCount: 0,
  biggestExpense: 0,
  biggestIncome: 0,
  averageExpense: 0,
  averageIncome: 0,
  daylessCount: 0,
  expenseShareOfIncome: 0,
})

export function getDashboardOverview(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number,
  options: DashboardStatsOptions = {}
): DashboardOverview {
  if (isMonthExcludedFromStats(selectedMonth, options.excludedMonthsSet)) {
    return {
      dashboardStats: emptyDashboardStats(),
      topExpenseCategories: [],
      latestTransactions: [],
    }
  }

  let income = 0
  let expense = 0
  let incomeCount = 0
  let expenseCount = 0
  let biggestExpense = 0
  let biggestIncome = 0
  let daylessCount = 0
  let transactionCount = 0
  const topExpenseTotals: Record<string, number> = {}
  const latestTransactions: Transaction[] = []

  for (const transaction of transactions) {
    if (
      !isTransactionInMonth(transaction, selectedMonth) ||
      !isTransactionInExistingStatsDate(transaction)
    ) {
      continue
    }

    transactionCount += 1
    latestTransactions.push(transaction)

    const categoryExists = Boolean(categoriesById[transaction.category_id])
    if (!categoryExists) {
      continue
    }

    const amount = getSignedAmountForTransaction(transaction)

    if (isDaylessTransaction(transaction)) {
      daylessCount += 1
    }

    if (amount > 0) {
      income += amount
      incomeCount += 1

      if (amount > biggestIncome) {
        biggestIncome = amount
      }
    }

    if (amount < 0) {
      const absoluteAmount = Math.abs(amount)

      expense += absoluteAmount
      expenseCount += 1
      topExpenseTotals[transaction.category_id] =
        (topExpenseTotals[transaction.category_id] ?? 0) + absoluteAmount

      if (absoluteAmount > biggestExpense) {
        biggestExpense = absoluteAmount
      }
    }
  }

  const topExpenseCategoryIds = Object.keys(topExpenseTotals)
  const topExpenseCategories: TopCategory[] = Object.entries(topExpenseTotals)
    .map(([categoryId, total]) => ({
      categoryId,
      name: getUniqueCategoryLabel(categoryId, categoriesById, topExpenseCategoryIds) || 'Nieznana',
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  latestTransactions.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date)
    if (dateCompare !== 0) return dateCompare

    return (b.created_at ?? '').localeCompare(a.created_at ?? '')
  })

  return {
    dashboardStats: {
      income,
      expense,
      balance: income - expense,
      transactionCount,
      incomeCount,
      expenseCount,
      biggestExpense,
      biggestIncome,
      averageExpense: expenseCount > 0 ? expense / expenseCount : 0,
      averageIncome: incomeCount > 0 ? income / incomeCount : 0,
      daylessCount,
      expenseShareOfIncome: income > 0 ? (expense / income) * 100 : 0,
    },
    topExpenseCategories,
    latestTransactions: latestTransactions.slice(0, options.latestLimit ?? 8),
  }
}
