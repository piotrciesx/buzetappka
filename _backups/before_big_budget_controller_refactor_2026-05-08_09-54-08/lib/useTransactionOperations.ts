import { useCallback, useState } from 'react'
import {
  executeBulkDeleteSelected,
  executeBulkMoveSelected,
  executeUndoLastAction,
  toggleTransactionSelectionIds,
} from './transactionActions'
import { Transaction, UndoAction } from './budgetPageTypes'
import { SupabaseClient } from '@supabase/supabase-js'
import { Category } from './budgetPageTypes'

type MoveTargetValidator = (transaction: Transaction, targetCategoryId: string) => boolean

type UseTransactionOperationsParams = {
  lockedMonthsSet: Set<string>
  setMigrationPromptState: (value: null) => void
}

type HandleBulkDeleteSelectedParams = {
  selectedTransactions: Transaction[]
  supabase: SupabaseClient
  clearTransactionOperationUi: () => void
  loadData: () => Promise<void>
}

type HandleBulkMoveSelectedParams = {
  selectedTransactions: Transaction[]
  bulkMoveTargetCategoryId: string
  isAllowedMoveTarget: MoveTargetValidator
  supabase: SupabaseClient
  clearTransactionOperationUi: () => void
  loadData: () => Promise<void>
}

type HandleUndoLastActionParams = {
  activeTransactionsById: Record<string, Transaction>
  trashedTransactionsById: Record<string, Transaction>
  supabase: SupabaseClient
  clearTransactionOperationUi: () => void
  loadData: () => Promise<void>
}

export function useTransactionOperations({
  lockedMonthsSet,
  setMigrationPromptState,
}: UseTransactionOperationsParams) {
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([])
  const [bulkMoveTargetCategoryId, setBulkMoveTargetCategoryId] = useState('')
  const [bulkActionErrorText, setBulkActionErrorText] = useState('')
  const [lastUndoAction, setLastUndoAction] = useState<UndoAction | null>(null)

  const clearTransactionSelection = useCallback(() => {
    setSelectedTransactionIds([])
    setBulkMoveTargetCategoryId('')
    setBulkActionErrorText('')
  }, [])

  const clearTransactionOperationUi = useCallback(() => {
    clearTransactionSelection()
    setMigrationPromptState(null)
  }, [clearTransactionSelection, setMigrationPromptState])

  const toggleTransactionSelection = useCallback((transactionId: string) => {
    setSelectedTransactionIds((prev) => {
      return toggleTransactionSelectionIds(prev, transactionId)
    })
    setBulkActionErrorText('')
  }, [])

  const getTransactionMonth = useCallback((transaction: Transaction) => {
    return transaction.date.slice(0, 7)
  }, [])

  const getLockedMonthsFromTransactions = useCallback(
    (items: Transaction[]) => {
      return [
        ...new Set(
          items
            .map((transaction) => getTransactionMonth(transaction))
            .filter((monthText) => lockedMonthsSet.has(monthText))
        ),
      ]
    },
    [getTransactionMonth, lockedMonthsSet]
  )

  const guardMonthUnlocked = useCallback(
    (monthText: string, actionLabel: string) => {
      if (!lockedMonthsSet.has(monthText)) {
        return true
      }

      alert(`Nie można wykonać akcji "${actionLabel}". Miesiąc ${monthText} jest zamknięty.`)
      return false
    },
    [lockedMonthsSet]
  )

  const guardTransactionsUnlocked = useCallback(
    (items: Transaction[], actionLabel: string) => {
      const blockedMonths = getLockedMonthsFromTransactions(items)

      if (blockedMonths.length === 0) {
        return true
      }

      alert(
        `Nie można wykonać akcji "${actionLabel}". Zamknięte miesiące: ${blockedMonths.join(', ')}.`
      )
      return false
    },
    [getLockedMonthsFromTransactions]
  )

  const handleBulkDeleteSelected = useCallback(
    async ({
      selectedTransactions,
      supabase,
      clearTransactionOperationUi,
      loadData,
    }: HandleBulkDeleteSelectedParams) => {
      if (!guardTransactionsUnlocked(selectedTransactions, 'usuwanie zaznaczonych wpisów')) {
        return
      }

      await executeBulkDeleteSelected({
        selectedTransactions,
        supabase,
        setLastUndoAction,
        clearTransactionOperationUi,
        loadData,
        setBulkActionErrorText,
      })
    },
    [guardTransactionsUnlocked]
  )

  const handleBulkMoveSelected = useCallback(
    async ({
      selectedTransactions,
      bulkMoveTargetCategoryId,
      isAllowedMoveTarget,
      supabase,
      clearTransactionOperationUi,
      loadData,
    }: HandleBulkMoveSelectedParams) => {
      if (!guardTransactionsUnlocked(selectedTransactions, 'przenoszenie zaznaczonych wpisów')) {
        return
      }

      await executeBulkMoveSelected({
        selectedTransactions,
        bulkMoveTargetCategoryId,
        isAllowedMoveTarget,
        supabase,
        setLastUndoAction,
        clearTransactionOperationUi,
        loadData,
        setBulkActionErrorText,
      })
    },
    [guardTransactionsUnlocked]
  )

  const handleUndoLastAction = useCallback(
    async ({
      activeTransactionsById,
      trashedTransactionsById,
      supabase,
      clearTransactionOperationUi,
      loadData,
    }: HandleUndoLastActionParams) => {
      if (lastUndoAction?.type === 'delete' || lastUndoAction?.type === 'restore') {
        if (!guardTransactionsUnlocked(lastUndoAction.transactions, 'cofnięcie operacji')) {
          return
        }
      }

      if (lastUndoAction?.type === 'move') {
        const movedTransactions = lastUndoAction.moves
          .map((move) => activeTransactionsById[move.id] || trashedTransactionsById[move.id])
          .filter((transaction): transaction is Transaction => !!transaction)

        if (!guardTransactionsUnlocked(movedTransactions, 'cofnięcie przeniesienia')) {
          return
        }
      }

      await executeUndoLastAction({
        lastUndoAction,
        supabase,
        setLastUndoAction,
        clearTransactionOperationUi,
        loadData,
      })
    },
    [guardTransactionsUnlocked, lastUndoAction]
  )

  return {
    selectedTransactionIds,
    setSelectedTransactionIds,
    bulkMoveTargetCategoryId,
    setBulkMoveTargetCategoryId,
    bulkActionErrorText,
    setBulkActionErrorText,
    lastUndoAction,
    setLastUndoAction,
    clearTransactionSelection,
    clearTransactionOperationUi,
    toggleTransactionSelection,
    getTransactionMonth,
    getLockedMonthsFromTransactions,
    guardMonthUnlocked,
    guardTransactionsUnlocked,
    handleBulkDeleteSelected,
    handleBulkMoveSelected,
    handleUndoLastAction,
  }
}