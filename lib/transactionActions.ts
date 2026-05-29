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
  profileId: string,
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
    .eq('profile_id', profileId)
    .in('id', transactionIds)

  if (error) {
    throw error
  }
}

export const moveTransactionsToCategory = async (
  supabase: any,
  profileId: string,
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
    .eq('profile_id', profileId)
    .in('id', transactionIds)

  if (error) {
    throw error
  }
}

export const permanentlyDeleteTransactions = async (
  supabase: any,
  profileId: string,
  transactionIds: string[]
) => {
  if (transactionIds.length === 0) {
    return
  }

  const { data: profileTransactions, error: profileTransactionsError } = await supabase
    .from('transactions')
    .select('id')
    .eq('profile_id', profileId)
    .in('id', transactionIds)

  if (profileTransactionsError) {
    throw profileTransactionsError
  }

  const scopedTransactionIds = (profileTransactions || []).map((transaction: { id: string }) => transaction.id)

  if (scopedTransactionIds.length === 0) {
    return
  }

  const { error: recurringExecutionsError } = await supabase
    .from('recurring_transaction_executions')
    .update({ transaction_id: null })
    .in('transaction_id', scopedTransactionIds)

  if (recurringExecutionsError) {
    throw recurringExecutionsError
  }

  const { error: reminderStatusesError } = await supabase
    .from('recurring_reminder_month_statuses')
    .update({ transaction_id: null })
    .eq('profile_id', profileId)
    .in('transaction_id', scopedTransactionIds)

  if (reminderStatusesError) {
    throw reminderStatusesError
  }

  const { error: tagLinksError } = await supabase
    .from('transaction_tags')
    .delete()
    .in('transaction_id', scopedTransactionIds)

  if (tagLinksError) {
    throw tagLinksError
  }

  const { error: paymentSplitsError } = await supabase
    .from('transaction_payment_splits')
    .delete()
    .in('transaction_id', scopedTransactionIds)

  if (paymentSplitsError) {
    throw paymentSplitsError
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('profile_id', profileId)
    .in('id', scopedTransactionIds)

  if (error) {
    throw error
  }
}

export const executeRestoreTransaction = async ({
  transactionId,
  profileId,
  trashedTransactionsById,
  supabase,
  setLastUndoAction,
  clearTransactionOperationUi,
  loadData,
}: {
  transactionId: string
  profileId: string
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
    await softDeleteTransactions(supabase, profileId, [transactionId], false, null)
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
  profileId,
  activeTransactionsById,
  isAllowedMoveTarget,
  supabase,
  setLastUndoAction,
  clearTransactionOperationUi,
  loadData,
}: {
  transactionId: string
  targetCategoryId: string
  profileId: string
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
    await moveTransactionsToCategory(supabase, profileId, [transactionId], targetCategoryId)
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
  profileId,
  activeTransactionsById,
  supabase,
  setLastUndoAction,
  clearTransactionOperationUi,
  loadData,
}: {
  transactionId: string
  profileId: string
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
    await softDeleteTransactions(supabase, profileId, [transactionId], true, deletedAt)
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
  profileId,
  supabase,
  setLastUndoAction,
  clearTransactionOperationUi,
  loadData,
  setBulkActionErrorText,
}: {
  selectedTransactions: Transaction[]
  profileId: string
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
      profileId,
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
  profileId,
  isAllowedMoveTarget,
  supabase,
  setLastUndoAction,
  clearTransactionOperationUi,
  loadData,
  setBulkActionErrorText,
}: {
  selectedTransactions: Transaction[]
  bulkMoveTargetCategoryId: string
  profileId: string
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
      profileId,
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
  profileId,
  supabase,
  setLastUndoAction,
  clearTransactionOperationUi,
  loadData,
}: {
  lastUndoAction: UndoAction | null
  profileId: string
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
        profileId,
        lastUndoAction.transactions.map((transaction) => transaction.id),
        false,
        null
      )
    }

    if (lastUndoAction.type === 'restore') {
      await softDeleteTransactions(
        supabase,
        profileId,
        lastUndoAction.transactions.map((transaction) => transaction.id),
        true,
        new Date().toISOString()
      )
    }

    if (lastUndoAction.type === 'move') {
      for (const move of lastUndoAction.moves) {
        await moveTransactionsToCategory(supabase, profileId, [move.id], move.fromCategoryId)
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
