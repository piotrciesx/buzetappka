import type { Category, Transaction } from '../budgetPageTypes'
import { isMonthExcludedFromStats } from '../dateUtils'
import { isDaylessTransaction, isTransactionInExistingStatsDate, isTransactionInMonth } from '../dashboardStatsHelpers'
import type { DashboardStats, DashboardStatsOptions } from './dashboardStatsTypes'

export function getDashboardStats(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number,
  options: DashboardStatsOptions = {}
): DashboardStats {
  if (isMonthExcludedFromStats(selectedMonth, options.excludedMonthsSet)) {
    return {
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
    }
  }

  let income = 0
  let expense = 0
  let incomeCount = 0
  let expenseCount = 0
  let biggestExpense = 0
  let biggestIncome = 0
  let daylessCount = 0

  const filtered = transactions.filter((transaction) =>
    isTransactionInMonth(transaction, selectedMonth) && isTransactionInExistingStatsDate(transaction)
  )

  for (const transaction of filtered) {
    const categoryExists = Boolean(categoriesById[transaction.category_id])
    const amount = getSignedAmountForTransaction(transaction)

    if (!categoryExists) {
      continue
    }

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

      if (absoluteAmount > biggestExpense) {
        biggestExpense = absoluteAmount
      }
    }
  }

  return {
    income,
    expense,
    balance: income - expense,
    transactionCount: filtered.length,
    incomeCount,
    expenseCount,
    biggestExpense,
    biggestIncome,
    averageExpense: expenseCount > 0 ? expense / expenseCount : 0,
    averageIncome: incomeCount > 0 ? income / incomeCount : 0,
    daylessCount,
    expenseShareOfIncome: income > 0 ? (expense / income) * 100 : 0,
  }
}
