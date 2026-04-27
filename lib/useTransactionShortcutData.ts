import { useMemo } from 'react'
import { Category, Transaction } from './budgetPageTypes'
import {
  getAddableTransactionCategoryIds,
  getAddableTransactionCategoryRootIds,
  getRecentTransactionShortcutCategoriesByType,
  getTopTransactionShortcutCategoriesByType,
  getTransactionCategoryPathLabels,
} from './transactionShortcutHelpers'
import { buildDescriptionSuggestions } from './suggestionUtils'

type UseTransactionShortcutDataParams = {
  visibleCategories: Category[]
  categoriesById: Record<string, Category>
  transactions: Transaction[]
}

export function useTransactionShortcutData({
  visibleCategories,
  categoriesById,
  transactions,
}: UseTransactionShortcutDataParams) {
  const addableTransactionCategoryIds = useMemo(() => {
    return getAddableTransactionCategoryIds(visibleCategories)
  }, [visibleCategories])

  const transactionCategoryPathLabels = useMemo(() => {
    return getTransactionCategoryPathLabels(addableTransactionCategoryIds, categoriesById)
  }, [addableTransactionCategoryIds, categoriesById])

  const addableTransactionCategoryRootIds = useMemo(() => {
    return getAddableTransactionCategoryRootIds(addableTransactionCategoryIds, categoriesById)
  }, [addableTransactionCategoryIds, categoriesById])

  const activeTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (transaction.is_deleted) {
        return false
      }

      if (!transaction.category_id) {
        return false
      }

      return Boolean(categoriesById[transaction.category_id])
    })
  }, [categoriesById, transactions])

  const topTransactionShortcutCategoriesByType = useMemo(() => {
    return getTopTransactionShortcutCategoriesByType(
      activeTransactions,
      addableTransactionCategoryRootIds,
      transactionCategoryPathLabels
    )
  }, [activeTransactions, addableTransactionCategoryRootIds, transactionCategoryPathLabels])

  const recentTransactionShortcutCategoriesByType = useMemo(() => {
    return getRecentTransactionShortcutCategoriesByType(
      activeTransactions,
      addableTransactionCategoryRootIds,
      transactionCategoryPathLabels
    )
  }, [activeTransactions, addableTransactionCategoryRootIds, transactionCategoryPathLabels])

  const descriptionSuggestions = useMemo(() => {
    return buildDescriptionSuggestions(
      activeTransactions.map((transaction) => ({
        description: transaction.description,
        category_id: transaction.category_id,
      }))
    )
  }, [activeTransactions])

  return {
    addableTransactionCategoryIds,
    transactionCategoryPathLabels,
    addableTransactionCategoryRootIds,
    topTransactionShortcutCategoriesByType,
    recentTransactionShortcutCategoriesByType,
    descriptionSuggestions,
  }
}