import { useCallback, useMemo } from 'react'
import { Category, MoveTarget, Transaction } from './budgetPageTypes'
import {
  getCommonMoveTargetsForTransactions as getCommonMoveTargetsForTransactionsHelper,
  getMoveTargetsForTransaction as getMoveTargetsForTransactionHelper,
  getSelectedTransactions as getSelectedTransactionsHelper,
  getTransactionsById as getTransactionsByIdHelper,
} from './transactionActions'

type MigrationPromptState = {
  categoryId: string
  mode: string
  hideMonth: string
  transactionIds: string[]
  targetCategoryId: string
  errorText: string
} | null

type UseBudgetMoveTargetsDataParams = {
  transactions: Transaction[]
  trashedTransactions: Transaction[]
  categories: Category[]
  categoriesById: Record<string, Category>
  selectedTransactionIds: string[]
  migrationPromptState: MigrationPromptState
  isAllowedMoveTarget: (transaction: Transaction, targetCategoryId: string) => boolean
}

export function useBudgetMoveTargetsData({
  transactions,
  trashedTransactions,
  categories,
  categoriesById,
  selectedTransactionIds,
  migrationPromptState,
  isAllowedMoveTarget,
}: UseBudgetMoveTargetsDataParams) {
  const getMoveTargetsForTransaction = useCallback(
    (transaction: Transaction): MoveTarget[] => {
      return getMoveTargetsForTransactionHelper(
        transaction,
        categories,
        categoriesById,
        isAllowedMoveTarget
      )
    },
    [categories, categoriesById, isAllowedMoveTarget]
  )

  const getCommonMoveTargetsForTransactions = useCallback(
    (items: Transaction[]) => {
      return getCommonMoveTargetsForTransactionsHelper(items, getMoveTargetsForTransaction)
    },
    [getMoveTargetsForTransaction]
  )

  const selectedTransactions = useMemo(() => {
    return getSelectedTransactionsHelper(selectedTransactionIds, transactions)
  }, [selectedTransactionIds, transactions])

  const commonBulkMoveTargets = useMemo(() => {
    return getCommonMoveTargetsForTransactions(selectedTransactions)
  }, [getCommonMoveTargetsForTransactions, selectedTransactions])

  const migrationPromptTransactions = useMemo(() => {
    if (!migrationPromptState) {
      return [] as Transaction[]
    }

    return transactions.filter((transaction) =>
      migrationPromptState.transactionIds.includes(transaction.id)
    )
  }, [migrationPromptState, transactions])

  const migrationPromptMoveTargets = useMemo(() => {
    return getCommonMoveTargetsForTransactions(migrationPromptTransactions)
  }, [getCommonMoveTargetsForTransactions, migrationPromptTransactions])

  const activeTransactionsById = useMemo(() => {
    return getTransactionsByIdHelper(transactions)
  }, [transactions])

  const trashedTransactionsById = useMemo(() => {
    return getTransactionsByIdHelper(trashedTransactions)
  }, [trashedTransactions])

  return {
    getMoveTargetsForTransaction,
    getCommonMoveTargetsForTransactions,
    selectedTransactions,
    commonBulkMoveTargets,
    migrationPromptTransactions,
    migrationPromptMoveTargets,
    activeTransactionsById,
    trashedTransactionsById,
  }
}