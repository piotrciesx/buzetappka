'use client'

import { useMemo } from 'react'
import type { Category, Transaction } from '../../lib/budgetPageTypes'
import {
  buildContextCalendarDays,
  buildPinnedWorkspaceCategories,
  buildRecentTransactionPreviews,
  getSelectedMonthExpenseTotal,
  getSelectedMonthIncomeTotal,
  getTotalBudgetBalance,
} from '../../lib/budgetAppSummary'

type UseBudgetWorkspaceSummaryInput = {
  selectedMonth: string
  scopedTransactions: Transaction[]
  selectedMonthTransactions: Transaction[]
  pinnedCategoryIds: string[]
  addableTransactionCategoryIds: Set<string>
  categories: Category[]
  categoriesById: Record<string, Category>
  expenseLevel1Id: string | null
  transactionCategoryPathLabels: Record<string, string>
  getSignedAmountForTransaction: (transaction: Transaction) => number
  getRootLevel1IdForCategory: (categoryId: string) => string | null
  getSumForCategoryForSelectedMonth: (categoryId: string) => number
  getCategoryCountForSelectedMonth: (categoryId: string) => number
}

export function useBudgetWorkspaceSummary({
  selectedMonth,
  scopedTransactions,
  selectedMonthTransactions,
  pinnedCategoryIds,
  addableTransactionCategoryIds,
  categories,
  categoriesById,
  expenseLevel1Id,
  transactionCategoryPathLabels,
  getSignedAmountForTransaction,
  getRootLevel1IdForCategory,
  getSumForCategoryForSelectedMonth,
  getCategoryCountForSelectedMonth,
}: UseBudgetWorkspaceSummaryInput) {
  const recentTransactionPreviews = useMemo(() => {
    return buildRecentTransactionPreviews({
      transactions: scopedTransactions,
      categoriesById,
      getSignedAmountForTransaction,
    })
  }, [categoriesById, getSignedAmountForTransaction, scopedTransactions])

  const totalBudgetBalance = useMemo(() => {
    return getTotalBudgetBalance({
      transactions: scopedTransactions,
      getSignedAmountForTransaction,
    })
  }, [getSignedAmountForTransaction, scopedTransactions])

  const selectedMonthIncomeTotal = useMemo(() => {
    return getSelectedMonthIncomeTotal({
      transactions: selectedMonthTransactions,
      getSignedAmountForTransaction,
    })
  }, [getSignedAmountForTransaction, selectedMonthTransactions])

  const selectedMonthExpenseTotal = useMemo(() => {
    return getSelectedMonthExpenseTotal({
      transactions: selectedMonthTransactions,
      getSignedAmountForTransaction,
    })
  }, [getSignedAmountForTransaction, selectedMonthTransactions])

  const pinnedWorkspaceCategories = useMemo(() => {
    return buildPinnedWorkspaceCategories({
      pinnedCategoryIds,
      addableTransactionCategoryIds,
      categories,
      categoriesById,
      expenseLevel1Id,
      transactionCategoryPathLabels,
      getRootLevel1IdForCategory,
      getSumForCategoryForSelectedMonth,
      getCategoryCountForSelectedMonth,
    })
  }, [
    addableTransactionCategoryIds,
    categories,
    categoriesById,
    expenseLevel1Id,
    getCategoryCountForSelectedMonth,
    getRootLevel1IdForCategory,
    getSumForCategoryForSelectedMonth,
    pinnedCategoryIds,
    transactionCategoryPathLabels,
  ])

  const contextCalendarDays = useMemo(
    () => buildContextCalendarDays({ selectedMonth }),
    [selectedMonth]
  )

  return {
    recentTransactionPreviews,
    totalBudgetBalance,
    selectedMonthIncomeTotal,
    selectedMonthExpenseTotal,
    pinnedWorkspaceCategories,
    contextCalendarDays,
  }
}
