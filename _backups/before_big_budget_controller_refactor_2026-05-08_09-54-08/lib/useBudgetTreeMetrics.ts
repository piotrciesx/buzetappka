import { useCallback } from 'react'
import { Category, Transaction } from './budgetPageTypes'
import { getTransactionsForLevel1AndMonth as getTransactionsForLevel1AndMonthHelper } from './calendarPageHelpers'
import {
  getCountForLevel2,
  getSumForCategory,
  getSumForLevel2,
  getTransactionsForCategoryAndMonth,
} from './transactionUtils'

type UseBudgetTreeMetricsParams = {
  transactions: Transaction[]
  categories: Category[]
  selectedMonth: string
  level3ByParentId: Record<string, Category[]>
}

export function useBudgetTreeMetrics({
  transactions,
  categories,
  selectedMonth,
  level3ByParentId,
}: UseBudgetTreeMetricsParams) {
  const getTransactionsForLevel1AndMonth = useCallback(
    (level1Id: string) => {
      return getTransactionsForLevel1AndMonthHelper(
        transactions,
        categories,
        level1Id,
        selectedMonth
      )
    },
    [transactions, categories, selectedMonth]
  )

  const getTransactionsForCategoryAndMonthForSelectedMonth = useCallback(
    (categoryId: string) => {
      return getTransactionsForCategoryAndMonth(transactions, categoryId, selectedMonth)
    },
    [transactions, selectedMonth]
  )

  const getSumForCategoryForSelectedMonth = useCallback(
    (categoryId: string) => {
      return getSumForCategory(transactions, categoryId, selectedMonth)
    },
    [transactions, selectedMonth]
  )

  const getSumForLevel2ForSelectedMonth = useCallback(
    (level2Id: string) => {
      const children = level3ByParentId[level2Id] || []

      if (children.length === 0) {
        return getSumForCategory(transactions, level2Id, selectedMonth)
      }

      const childIds = children.map((child) => child.id)
      return getSumForLevel2(transactions, childIds, selectedMonth)
    },
    [level3ByParentId, transactions, selectedMonth]
  )

  const getCountForLevel2ForSelectedMonth = useCallback(
    (level2Id: string) => {
      const children = level3ByParentId[level2Id] || []

      if (children.length === 0) {
        return getTransactionsForCategoryAndMonth(transactions, level2Id, selectedMonth).length
      }

      const childIds = children.map((child) => child.id)
      return getCountForLevel2(transactions, childIds, selectedMonth)
    },
    [level3ByParentId, transactions, selectedMonth]
  )

  const getCategoryCountForSelectedMonth = useCallback(
    (categoryId: string) => {
      return getTransactionsForCategoryAndMonth(transactions, categoryId, selectedMonth).length
    },
    [transactions, selectedMonth]
  )

  return {
    getTransactionsForLevel1AndMonth,
    getTransactionsForCategoryAndMonthForSelectedMonth,
    getSumForCategoryForSelectedMonth,
    getSumForLevel2ForSelectedMonth,
    getCountForLevel2ForSelectedMonth,
    getCategoryCountForSelectedMonth,
  }
}