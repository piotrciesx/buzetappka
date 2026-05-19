import { Dispatch, SetStateAction, useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { Transaction, UndoAction } from '../budgetPageTypes'
import {
  executeDeleteTransaction,
  executeMoveTransaction,
  executeRestoreTransaction,
  moveTransactionsToCategory as moveTransactionsToCategoryHelper,
  permanentlyDeleteTransactions,
} from '../transactionActions'

type Params = {
  supabase: SupabaseClient
  activeTransactionsById: Record<string, Transaction>
  trashedTransactionsById: Record<string, Transaction>
  isAllowedMoveTarget: (transaction: Transaction, targetCategoryId: string) => boolean
  guardTransactionsUnlocked: (items: Transaction[], actionLabel: string) => boolean
  clearTransactionOperationUi: () => void
  loadData: () => Promise<void>
  setLastUndoAction: Dispatch<SetStateAction<UndoAction | null>>
}

export const useTransactionTrashActions = ({
  supabase,
  activeTransactionsById,
  trashedTransactionsById,
  isAllowedMoveTarget,
  guardTransactionsUnlocked,
  clearTransactionOperationUi,
  loadData,
  setLastUndoAction,
}: Params) => {
  const moveTransactionsToCategory = useCallback(
    async (transactionIds: string[], targetCategoryId: string) => {
      const transactionsToMove = transactionIds
        .map((transactionId) => activeTransactionsById[transactionId])
        .filter((item): item is Transaction => !!item)

      if (!guardTransactionsUnlocked(transactionsToMove, 'przenoszenie wpisów')) {
        throw new Error('locked-month')
      }

      await moveTransactionsToCategoryHelper(supabase, transactionIds, targetCategoryId)
    },
    [activeTransactionsById, guardTransactionsUnlocked, supabase]
  )

  const handleRestoreTransaction = useCallback(
    async (transactionId: string) => {
      await executeRestoreTransaction({
        transactionId,
        trashedTransactionsById,
        supabase,
        setLastUndoAction,
        clearTransactionOperationUi,
        loadData,
      })
    },
    [
      clearTransactionOperationUi,
      loadData,
      setLastUndoAction,
      supabase,
      trashedTransactionsById,
    ]
  )

  const handleMoveTransaction = useCallback(
    async (transactionId: string, targetCategoryId: string) => {
      const transaction = activeTransactionsById[transactionId]

      if (!transaction) {
        alert('Nie znaleziono wpisu')
        return
      }

      if (!guardTransactionsUnlocked([transaction], 'przenoszenie wpisu')) {
        return
      }

      await executeMoveTransaction({
        transactionId,
        targetCategoryId,
        activeTransactionsById,
        isAllowedMoveTarget,
        supabase,
        setLastUndoAction,
        clearTransactionOperationUi,
        loadData,
      })
    },
    [
      activeTransactionsById,
      clearTransactionOperationUi,
      guardTransactionsUnlocked,
      isAllowedMoveTarget,
      loadData,
      setLastUndoAction,
      supabase,
    ]
  )

  const handleDeleteTransaction = useCallback(
    async (transactionId: string) => {
      const transaction = activeTransactionsById[transactionId]

      if (!transaction) {
        alert('Nie znaleziono wpisu')
        return
      }

      if (!guardTransactionsUnlocked([transaction], 'usuwanie wpisu')) {
        return
      }

      await executeDeleteTransaction({
        transactionId,
        activeTransactionsById,
        supabase,
        setLastUndoAction,
        clearTransactionOperationUi,
        loadData,
      })
    },
    [
      activeTransactionsById,
      clearTransactionOperationUi,
      guardTransactionsUnlocked,
      loadData,
      setLastUndoAction,
      supabase,
    ]
  )

  const handlePermanentDeleteTransaction = useCallback(
    async (transactionId: string) => {
      const transaction = trashedTransactionsById[transactionId]

      if (!transaction) {
        alert('Nie znaleziono wpisu w koszu')
        return
      }

      const confirmed = confirm('Czy na pewno chcesz trwale usunąć ten wpis z kosza?')

      if (!confirmed) {
        return
      }

      try {
        await permanentlyDeleteTransactions(supabase, [transactionId])
        clearTransactionOperationUi()
        await loadData()
      } catch (error) {
        if (error instanceof Error) {
          alert(`Błąd trwałego usuwania: ${error.message}`)
        }
      }
    },
    [clearTransactionOperationUi, loadData, supabase, trashedTransactionsById]
  )

  const handleEmptyTrash = useCallback(async () => {
    const trashedTransactionIds = Object.keys(trashedTransactionsById)

    if (trashedTransactionIds.length === 0) {
      return
    }

    const confirmed = confirm(
      `Czy na pewno chcesz opróżnić kosz i trwale usunąć ${trashedTransactionIds.length} wpisów?`
    )

    if (!confirmed) {
      return
    }

    try {
      await permanentlyDeleteTransactions(supabase, trashedTransactionIds)
      clearTransactionOperationUi()
      await loadData()
    } catch (error) {
      if (error instanceof Error) {
        alert(`Błąd opróżniania kosza: ${error.message}`)
      }
    }
  }, [clearTransactionOperationUi, loadData, supabase, trashedTransactionsById])

  return {
    moveTransactionsToCategory,
    handleRestoreTransaction,
    handleMoveTransaction,
    handleDeleteTransaction,
    handlePermanentDeleteTransaction,
    handleEmptyTrash,
  }
}
