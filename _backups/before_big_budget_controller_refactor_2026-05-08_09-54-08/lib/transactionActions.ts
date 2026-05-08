import { sortCategoriesForDisplay } from './budgetPageHelpers'
import { Category, MoveTarget, Transaction, UndoAction } from './budgetPageTypes'

export const getMoveTargetsForTransaction = (
  transaction: Transaction,
  categories: Category[],
  categoriesById: Record<string, Category>,
  isAllowedMoveTarget: (transaction: Transaction, targetCategoryId: string) => boolean
) => {
  return sortCategoriesForDisplay(
    categories.filter((category) => isAllowedMoveTarget(transaction, category.id))
  )
    .map((category) => ({
      id: category.id,
      label: getCategoryPathLabel(category.id, categoriesById),
    }))
}

export const getCommonMoveTargetsForTransactions = (
  items: Transaction[],
  getMoveTargetsForSingleTransaction: (transaction: Transaction) => MoveTarget[]
) => {
  if (items.length === 0) {
    return [] as MoveTarget[]
  }

  const moveTargetsPerTransaction = items.map((transaction) =>
    getMoveTargetsForSingleTransaction(transaction)
  )
  const commonTargetIds = moveTargetsPerTransaction.reduce<Set<string>>((acc, moveTargets, index) => {
    const ids = new Set(moveTargets.map((target) => target.id))

    if (index === 0) {
      return ids
    }

    return new Set([...acc].filter((id) => ids.has(id)))
  }, new Set<string>())

  return moveTargetsPerTransaction[0].filter((target) => commonTargetIds.has(target.id))
}

export const getSelectedTransactions = (
  selectedTransactionIds: string[],
  transactions: Transaction[]
) => {
  const selectedIds = new Set(selectedTransactionIds)
  return transactions.filter((transaction) => selectedIds.has(transaction.id))
}

export const getTransactionsById = (transactions: Transaction[]) => {
  return transactions.reduce<Record<string, Transaction>>((acc, transaction) => {
    acc[transaction.id] = transaction
    return acc
  }, {})
}

export const toggleTransactionSelectionIds = (
  currentSelection: string[],
  transactionId: string
) => {
  if (currentSelection.includes(transactionId)) {
    return currentSelection.filter((id) => id !== transactionId)
  }

  return [...currentSelection, transactionId]
}

export const softDeleteTransactions = async (
  supabase: any,
  transactionIds: string[],
  shouldDelete: boolean,
  deletedAtValue: string | null
) => {
  if (transactionIds.length === 0) {
    return
  }

  const { error } = await supabase
    .from('transactions')
    .update({
      is_deleted: shouldDelete,
      deleted_at: deletedAtValue,
    })
    .in('id', transactionIds)

  if (error) {
    throw error
  }
}

export const moveTransactionsToCategory = async (
  supabase: any,
  transactionIds: string[],
  targetCategoryId: string
) => {
  if (transactionIds.length === 0) {
    return
  }

  const { error } = await supabase
    .from('transactions')
    .update({
      category_id: targetCategoryId,
    })
    .in('id', transactionIds)

  if (error) {
    throw error
  }
}

export const permanentlyDeleteTransactions = async (supabase: any, transactionIds: string[]) => {
  if (transactionIds.length === 0) {
    return
  }

  const { error: tagLinksError } = await supabase
    .from('transaction_tags')
    .delete()
    .in('transaction_id', transactionIds)

  if (tagLinksError) {
    throw tagLinksError
  }

  const { error } = await supabase.from('transactions').delete().in('id', transactionIds)

  if (error) {
    throw error
  }
}

export const executeRestoreTransaction = async ({
  transactionId,
  trashedTransactionsById,
  supabase,
  setLastUndoAction,
  clearTransactionOperationUi,
  loadData,
}: {
  transactionId: string
  trashedTransactionsById: Record<string, Transaction>
  supabase: any
  setLastUndoAction: (action: UndoAction | null) => void
  clearTransactionOperationUi: () => void
  loadData: () => Promise<void>
}) => {
  const transaction = trashedTransactionsById[transactionId]

  if (!transaction) {
    alert('Nie znaleziono wpisu w koszu')
    return
  }

  try {
    await softDeleteTransactions(supabase, [transactionId], false, null)
    setLastUndoAction({
      type: 'restore',
      label: 'Przywrócono wpis z kosza.',
      transactions: [transaction],
    })
    clearTransactionOperationUi()
    await loadData()
  } catch (error) {
    if (error instanceof Error) {
      alert(`Błąd przywracania: ${error.message}`)
    }
  }
}

export const executeMoveTransaction = async ({
  transactionId,
  targetCategoryId,
  activeTransactionsById,
  isAllowedMoveTarget,
  supabase,
  setLastUndoAction,
  clearTransactionOperationUi,
  loadData,
}: {
  transactionId: string
  targetCategoryId: string
  activeTransactionsById: Record<string, Transaction>
  isAllowedMoveTarget: (transaction: Transaction, targetCategoryId: string) => boolean
  supabase: any
  setLastUndoAction: (action: UndoAction | null) => void
  clearTransactionOperationUi: () => void
  loadData: () => Promise<void>
}) => {
  const transaction = activeTransactionsById[transactionId]

  if (!transaction) {
    alert('Nie znaleziono wpisu')
    throw new Error('transaction-not-found')
  }

  if (!targetCategoryId) {
    alert('Wybierz docelową kategorię')
    throw new Error('target-required')
  }

  if (!isAllowedMoveTarget(transaction, targetCategoryId)) {
    alert('Nie można przenieść wpisu do tej kategorii')
    throw new Error('invalid-target')
  }

  try {
    await moveTransactionsToCategory(supabase, [transactionId], targetCategoryId)
    setLastUndoAction({
      type: 'move',
      label: 'Przeniesiono wpis.',
      moves: [
        {
          id: transaction.id,
          fromCategoryId: transaction.category_id,
          toCategoryId: targetCategoryId,
        },
      ],
    })
    clearTransactionOperationUi()
    await loadData()
  } catch (error) {
    if (error instanceof Error) {
      alert(`Błąd przenoszenia: ${error.message}`)
    }

    throw error
  }
}

export const executeDeleteTransaction = async ({
  transactionId,
  activeTransactionsById,
  supabase,
  setLastUndoAction,
  clearTransactionOperationUi,
  loadData,
}: {
  transactionId: string
  activeTransactionsById: Record<string, Transaction>
  supabase: any
  setLastUndoAction: (action: UndoAction | null) => void
  clearTransactionOperationUi: () => void
  loadData: () => Promise<void>
}) => {
  const confirmed = confirm('Czy na pewno chcesz usunąć wpis?')

  if (!confirmed) {
    return
  }

  const transaction = activeTransactionsById[transactionId]

  if (!transaction) {
    alert('Nie znaleziono wpisu')
    return
  }

  const deletedAt = new Date().toISOString()

  try {
    await softDeleteTransactions(supabase, [transactionId], true, deletedAt)
    setLastUndoAction({
      type: 'delete',
      label: 'Usunięto wpis.',
      transactions: [transaction],
    })
    clearTransactionOperationUi()
    await loadData()
  } catch (error) {
    if (error instanceof Error) {
      alert(`Błąd usuwania: ${error.message}`)
    }
  }
}

export const executeBulkDeleteSelected = async ({
  selectedTransactions,
  supabase,
  setLastUndoAction,
  clearTransactionOperationUi,
  loadData,
  setBulkActionErrorText,
}: {
  selectedTransactions: Transaction[]
  supabase: any
  setLastUndoAction: (action: UndoAction | null) => void
  clearTransactionOperationUi: () => void
  loadData: () => Promise<void>
  setBulkActionErrorText: (value: string) => void
}) => {
  if (selectedTransactions.length === 0) {
    return
  }

  const confirmed = confirm(`Czy na pewno chcesz usunąć ${selectedTransactions.length} wpisów?`)

  if (!confirmed) {
    return
  }

  try {
    await softDeleteTransactions(
      supabase,
      selectedTransactions.map((transaction) => transaction.id),
      true,
      new Date().toISOString()
    )
    setLastUndoAction({
      type: 'delete',
      label: `Usunięto ${selectedTransactions.length} wpisów.`,
      transactions: selectedTransactions,
    })
    clearTransactionOperationUi()
    await loadData()
  } catch (error) {
    if (error instanceof Error) {
      setBulkActionErrorText(`Błąd usuwania: ${error.message}`)
    }
  }
}

export const executeBulkMoveSelected = async ({
  selectedTransactions,
  bulkMoveTargetCategoryId,
  isAllowedMoveTarget,
  supabase,
  setLastUndoAction,
  clearTransactionOperationUi,
  loadData,
  setBulkActionErrorText,
}: {
  selectedTransactions: Transaction[]
  bulkMoveTargetCategoryId: string
  isAllowedMoveTarget: (transaction: Transaction, targetCategoryId: string) => boolean
  supabase: any
  setLastUndoAction: (action: UndoAction | null) => void
  clearTransactionOperationUi: () => void
  loadData: () => Promise<void>
  setBulkActionErrorText: (value: string) => void
}) => {
  if (selectedTransactions.length === 0) {
    return
  }

  if (!bulkMoveTargetCategoryId) {
    setBulkActionErrorText('Wybierz kategorię docelową.')
    return
  }

  const isValidForAll = selectedTransactions.every((transaction) =>
    isAllowedMoveTarget(transaction, bulkMoveTargetCategoryId)
  )

  if (!isValidForAll) {
    setBulkActionErrorText('Wybrana kategoria nie jest poprawna dla wszystkich zaznaczonych wpisów.')
    return
  }

  try {
    await moveTransactionsToCategory(
      supabase,
      selectedTransactions.map((transaction) => transaction.id),
      bulkMoveTargetCategoryId
    )
    setLastUndoAction({
      type: 'move',
      label: `Przeniesiono ${selectedTransactions.length} wpisów.`,
      moves: selectedTransactions.map((transaction) => ({
        id: transaction.id,
        fromCategoryId: transaction.category_id,
        toCategoryId: bulkMoveTargetCategoryId,
      })),
    })
    clearTransactionOperationUi()
    await loadData()
  } catch (error) {
    if (error instanceof Error) {
      setBulkActionErrorText(`Błąd przenoszenia: ${error.message}`)
    }
  }
}

export const executeUndoLastAction = async ({
  lastUndoAction,
  supabase,
  setLastUndoAction,
  clearTransactionOperationUi,
  loadData,
}: {
  lastUndoAction: UndoAction | null
  supabase: any
  setLastUndoAction: (action: UndoAction | null) => void
  clearTransactionOperationUi: () => void
  loadData: () => Promise<void>
}) => {
  if (!lastUndoAction) {
    return
  }

  try {
    if (lastUndoAction.type === 'delete') {
      await softDeleteTransactions(
        supabase,
        lastUndoAction.transactions.map((transaction) => transaction.id),
        false,
        null
      )
    }

    if (lastUndoAction.type === 'restore') {
      await softDeleteTransactions(
        supabase,
        lastUndoAction.transactions.map((transaction) => transaction.id),
        true,
        new Date().toISOString()
      )
    }

    if (lastUndoAction.type === 'move') {
      for (const move of lastUndoAction.moves) {
        await moveTransactionsToCategory(supabase, [move.id], move.fromCategoryId)
      }
    }

    setLastUndoAction(null)
    clearTransactionOperationUi()
    await loadData()
  } catch (error) {
    if (error instanceof Error) {
      alert(`Nie udało się cofnąć akcji: ${error.message}`)
    }
  }
}

const getCategoryPathLabel = (categoryId: string, categoriesById: Record<string, Category>) => {
  const category = categoriesById[categoryId]

  if (!category) {
    return ''
  }

  const parts = [category.name]
  let currentParentId = category.parent_id

  while (currentParentId) {
    const parent = categoriesById[currentParentId]

    if (!parent) {
      break
    }

    parts.unshift(parent.name)
    currentParentId = parent.parent_id
  }

  return parts.join(' > ')
}
