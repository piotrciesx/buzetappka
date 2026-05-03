import { RefObject, useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { normalizeAmountInput } from './budgetPageHelpers'
import { Category, Tag, Transaction, UndoAction } from './budgetPageTypes'
import { buildDateFromDayInput, getDayInputFromDate } from './dateUtils'
import { buildPaymentSplitPayload, PaymentSplitInput } from './paymentSplitUtils'
import {
  executeDeleteTransaction,
  executeMoveTransaction,
  executeRestoreTransaction,
  moveTransactionsToCategory as moveTransactionsToCategoryHelper,
  permanentlyDeleteTransactions,
} from './transactionActions'
import { setTransactionTags } from './tagUtils'

type DraftType = 'income' | 'expense' | null

type UseTransactionEntryActionsParams = {
  supabase: SupabaseClient
  profileId: string
  selectedMonth: string
  visibleCategories: Category[]
  categoriesById: Record<string, Category>
  activeTransactionsById: Record<string, Transaction>
  trashedTransactionsById: Record<string, Transaction>
  transactionDraftType: DraftType
  selectedTransactionTypeId: string | null
  selectedLevel2Id: string | null
  selectedTransactionCategoryId: string | null
  newAmount: string
  newDescription: string
  newTransactionDate: string
  selectedRecurringTransactionId: string
  isSerialTransactionCreatorEnabled: boolean
  isAllowedMoveTarget: (transaction: Transaction, targetCategoryId: string) => boolean
  getRootLevel1IdForCategory: (categoryId: string) => string | null
  deleteDraft: (draftType: 'income' | 'expense') => Promise<void>
  guardMonthUnlocked: (monthText: string, actionLabel: string) => boolean
  guardTransactionsUnlocked: (items: Transaction[], actionLabel: string) => boolean
  clearTransactionOperationUi: () => void
  loadData: () => Promise<void>
  resetTransactionCreator: () => void
  setLastUndoAction: React.Dispatch<React.SetStateAction<UndoAction | null>>
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  setTransactionCreatorSuggestionId: React.Dispatch<React.SetStateAction<string | null>>
  setNewTransactionDate: React.Dispatch<React.SetStateAction<string>>
  setNewAmount: React.Dispatch<React.SetStateAction<string>>
  setNewDescription: React.Dispatch<React.SetStateAction<string>>
  setSelectedTagNames: React.Dispatch<React.SetStateAction<string[]>>
  setSelectedPaymentSourceId: React.Dispatch<React.SetStateAction<string>>
  setSelectedPaymentSplitItems: React.Dispatch<React.SetStateAction<PaymentSplitInput[]>>
  defaultPaymentSourceId: string | null
  onTransactionSaved?: (transaction: Transaction) => Promise<void> | void
  amountInputRef: RefObject<HTMLInputElement | null>
  selectedTagNames: string[]
  selectedPaymentSourceId: string
  selectedPaymentSplitItems: Array<{
    paymentSourceId: string
    amount: string
  }>
  transactionTagsMap: Record<string, Tag[]>
}

export function useTransactionEntryActions({
  supabase,
  profileId,
  selectedMonth,
  visibleCategories,
  categoriesById,
  activeTransactionsById,
  trashedTransactionsById,
  transactionDraftType,
  selectedTransactionTypeId,
  selectedLevel2Id,
  selectedTransactionCategoryId,
  newAmount,
  newDescription,
  newTransactionDate,
  selectedRecurringTransactionId,
  isSerialTransactionCreatorEnabled,
  isAllowedMoveTarget,
  getRootLevel1IdForCategory,
  deleteDraft,
  guardMonthUnlocked,
  guardTransactionsUnlocked,
  clearTransactionOperationUi,
  loadData,
  resetTransactionCreator,
  setLastUndoAction,
  setTransactions,
  setIsSaving,
  setTransactionCreatorSuggestionId,
  setNewTransactionDate,
  setNewAmount,
  setNewDescription,
  setSelectedTagNames,
  setSelectedPaymentSourceId,
  setSelectedPaymentSplitItems,
  defaultPaymentSourceId,
  onTransactionSaved,
  amountInputRef,
  selectedTagNames,
  selectedPaymentSourceId,
  selectedPaymentSplitItems,
  transactionTagsMap,
}: UseTransactionEntryActionsParams) {
  const canAddTransactionToCategory = useCallback(
    (categoryId: string) => {
      const category = visibleCategories.find((item) => item.id === categoryId)

      if (!category) {
        return false
      }

      const hasChildren = visibleCategories.some((item) => item.parent_id === categoryId)

      if (hasChildren) {
        return false
      }

      return category.level >= 1 && category.level <= 3
    },
    [visibleCategories]
  )

  const getEffectiveTransactionCategoryId = useCallback(() => {
    if (selectedTransactionCategoryId && canAddTransactionToCategory(selectedTransactionCategoryId)) {
      return selectedTransactionCategoryId
    }

    if (selectedLevel2Id && canAddTransactionToCategory(selectedLevel2Id)) {
      return selectedLevel2Id
    }

    if (selectedTransactionTypeId && canAddTransactionToCategory(selectedTransactionTypeId)) {
      return selectedTransactionTypeId
    }

    return null
  }, [
    canAddTransactionToCategory,
    selectedLevel2Id,
    selectedTransactionCategoryId,
    selectedTransactionTypeId,
  ])

  const syncTransactionTags = useCallback(
    async (transactionId: string, rawTagNames: string[]) => {
      const currentTags = transactionTagsMap[transactionId] || []
      await setTransactionTags(supabase, profileId, transactionId, rawTagNames, currentTags)
    },
    [profileId, supabase, transactionTagsMap]
  )

  const syncTransactionPaymentSplits = useCallback(
    async (
      transactionId: string,
      amountText: string,
      paymentSourceIdValue: string,
      paymentSplitItemsValue: PaymentSplitInput[]
    ) => {
      const normalizedPaymentSplit = buildPaymentSplitPayload({
        totalAmountText: amountText,
        selectedPaymentSourceId: paymentSourceIdValue,
        splitItems: paymentSplitItemsValue,
      })

      if (normalizedPaymentSplit.errors.length > 0) {
        throw new Error('invalid-payment-split-total')
      }

      const { error: deleteError } = await supabase
        .from('transaction_payment_splits')
        .delete()
        .eq('transaction_id', transactionId)

      if (deleteError) {
        throw deleteError
      }

      if (normalizedPaymentSplit.splitRows.length === 0) {
        return
      }

      const { error: insertError } = await supabase.from('transaction_payment_splits').insert(
        normalizedPaymentSplit.splitRows.map((item) => ({
          transaction_id: transactionId,
          payment_source_id: item.payment_source_id,
          amount: item.amount,
        }))
      )

      if (insertError) {
        throw insertError
      }
    },
    [supabase]
  )

  const rollbackInsertedTransaction = useCallback(
    async (transactionId: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', transactionId)

      if (error) {
        throw error
      }
    },
    [supabase]
  )

  const saveTransactionToCategory = useCallback(
    async (
      categoryId: string,
      amountText: string,
      descriptionText: string,
      dateText: string,
      dayIsNull = false,
      tagNames: string[] = [],
      recurringTransactionId: string | null = null,
      paymentSourceIdOverride?: string | null,
      paymentSplitItemsOverride?: PaymentSplitInput[]
    ) => {
      if (!guardMonthUnlocked(selectedMonth, 'dodawanie wpisu')) {
        throw new Error('locked-month')
      }

      if (!canAddTransactionToCategory(categoryId)) {
        throw new Error('invalid-category')
      }

      const value = Number(normalizeAmountInput(amountText))

      if (!value || value <= 0) {
        throw new Error('invalid-amount')
      }

      if (!dateText.trim()) {
        throw new Error('missing-date')
      }

      const trimmedDescription = descriptionText.trim() || null

      const normalizedPaymentSplit = buildPaymentSplitPayload({
        totalAmountText: amountText,
        selectedPaymentSourceId:
          paymentSourceIdOverride === undefined ? selectedPaymentSourceId : paymentSourceIdOverride || '',
        splitItems: paymentSplitItemsOverride ?? selectedPaymentSplitItems,
      })

      if (normalizedPaymentSplit.errors.length > 0) {
        throw new Error('invalid-payment-split-total')
      }

      const { data: insertedTransaction, error } = await supabase
        .from('transactions')
        .insert([
          {
            amount: value,
            description: trimmedDescription,
            category_id: categoryId,
            profile_id: profileId,
            date: dateText,
            day_is_null: dayIsNull,
            payment_source_id: normalizedPaymentSplit.paymentSourceId,
            recurring_transaction_id: recurringTransactionId,
          },
        ])
        .select(
          'id, category_id, amount, description, date, day_is_null, payment_source_id, recurring_transaction_id, created_at, is_deleted, deleted_at'
        )
        .single()

      if (error) {
        throw error
      }

      if (!insertedTransaction) {
        throw new Error('missing-inserted-transaction')
      }

      try {
        await syncTransactionTags(insertedTransaction.id, tagNames)
        await syncTransactionPaymentSplits(
          insertedTransaction.id,
          amountText,
          normalizedPaymentSplit.paymentSourceId || '',
          paymentSplitItemsOverride ?? selectedPaymentSplitItems
        )
      } catch (tagError) {
        await rollbackInsertedTransaction(insertedTransaction.id)
        throw tagError
      }

      setTransactions((prev) => [insertedTransaction, ...prev])
      await loadData()
      await onTransactionSaved?.(insertedTransaction)

      return insertedTransaction
    },
    [
      canAddTransactionToCategory,
      guardMonthUnlocked,
      loadData,
      onTransactionSaved,
      profileId,
      rollbackInsertedTransaction,
      selectedMonth,
      selectedPaymentSourceId,
      selectedPaymentSplitItems,
      setTransactions,
      supabase,
      syncTransactionTags,
      syncTransactionPaymentSplits,
    ]
  )

  const handleSaveTransaction = useCallback(
    async (shouldCloseAfterSave = false) => {
      const effectiveCategoryId = getEffectiveTransactionCategoryId()

      if (!selectedTransactionTypeId) {
        alert('Wybierz typ wpisu')
        return
      }

      if (!effectiveCategoryId) {
        alert('Wybierz najniższą dostępną kategorię')
        return
      }

      if (!canAddTransactionToCategory(effectiveCategoryId)) {
        alert('Wpis można dodać tylko do najniższej dostępnej kategorii, bez dzieci')
        return
      }

      const effectiveCategory = categoriesById[effectiveCategoryId]

      if (!effectiveCategory) {
        alert('Nie znaleziono wybranej kategorii')
        return
      }

      const selectedLevel1RootId = getRootLevel1IdForCategory(effectiveCategoryId)

      if (!selectedLevel1RootId || selectedLevel1RootId !== selectedTransactionTypeId) {
        alert('Wybrana kategoria nie pasuje do wybranego typu')
        return
      }

      if (effectiveCategory.level === 3) {
        if (!selectedLevel2Id) {
          alert('Wybierz kategorię')
          return
        }

        if (effectiveCategory.parent_id !== selectedLevel2Id) {
          alert('Wybrana podkategoria nie pasuje do wybranej kategorii')
          return
        }
      }

      if (effectiveCategory.level === 2) {
        if (!selectedLevel2Id || effectiveCategory.id !== selectedLevel2Id) {
          alert('Wybrana kategoria nie jest ustawiona poprawnie')
          return
        }
      }

      const normalizedDayInput = getDayInputFromDate(newTransactionDate, selectedMonth)
      const nextTransactionDate =
        buildDateFromDayInput(selectedMonth, normalizedDayInput) || `${selectedMonth}-01`
      const nextDayIsNull = !normalizedDayInput

      setIsSaving(true)

      try {
        await saveTransactionToCategory(
          effectiveCategoryId,
          newAmount,
          newDescription,
          nextTransactionDate,
          nextDayIsNull,
          selectedTagNames,
          selectedRecurringTransactionId || null
        )

        if (transactionDraftType) {
          await deleteDraft(transactionDraftType)
        }

        setIsSaving(false)
      } catch (error) {
        if (error instanceof Error && error.message === 'locked-month') {
          setIsSaving(false)
          return
        } else if (error instanceof Error && error.message === 'invalid-amount') {
          alert('Podaj poprawną kwotę')
        } else if (error instanceof Error && error.message === 'missing-inserted-transaction') {
          alert('Wpis niby został zapisany, ale nie wrócił z bazy')
        } else if (error instanceof Error && error.message === 'invalid-category') {
          alert('Nie można dodać wpisu do tej kategorii')
        } else if (error instanceof Error && 'message' in error) {
          alert(`Błąd zapisu: ${error.message}`)
        }

        setIsSaving(false)
        return
      }

      if (isSerialTransactionCreatorEnabled && !shouldCloseAfterSave) {
        setTransactionCreatorSuggestionId(effectiveCategoryId)
        setNewTransactionDate('')
        setNewAmount('')
        setNewDescription('')
        setSelectedTagNames([])
        setSelectedPaymentSourceId(defaultPaymentSourceId || '')
        setSelectedPaymentSplitItems([])

        window.setTimeout(() => {
          amountInputRef.current?.focus()
        }, 0)

        return
      }

      resetTransactionCreator()
    },
    [
      amountInputRef,
      canAddTransactionToCategory,
      categoriesById,
      deleteDraft,
      getEffectiveTransactionCategoryId,
      getRootLevel1IdForCategory,
      isSerialTransactionCreatorEnabled,
      newAmount,
      newDescription,
      newTransactionDate,
      defaultPaymentSourceId,
      resetTransactionCreator,
      saveTransactionToCategory,
      selectedRecurringTransactionId,
      selectedLevel2Id,
      selectedMonth,
      selectedTagNames,
      selectedTransactionTypeId,
      setIsSaving,
      setNewAmount,
      setNewDescription,
      setNewTransactionDate,
      setSelectedTagNames,
      setSelectedPaymentSourceId,
      setSelectedPaymentSplitItems,
      setTransactionCreatorSuggestionId,
      transactionDraftType,
    ]
  )

  const handleInlineSaveTransaction = useCallback(
    async (
      categoryId: string,
      amountText: string,
      descriptionText: string,
      dayText: string,
      tagNames: string[] = [],
      paymentSourceId?: string | null,
      paymentSplitItems?: PaymentSplitInput[],
      recurringTransactionId?: string | null
    ) => {
      try {
        const trimmedDayText = dayText.trim()
        const nextTransactionDate =
          buildDateFromDayInput(selectedMonth, trimmedDayText) || `${selectedMonth}-01`
        const nextDayIsNull = !trimmedDayText

        await saveTransactionToCategory(
          categoryId,
          amountText,
          descriptionText,
          nextTransactionDate,
          nextDayIsNull,
          tagNames,
          recurringTransactionId || null,
          paymentSourceId,
          paymentSplitItems
        )
      } catch (error) {
        if (error instanceof Error && error.message === 'locked-month') {
          throw error
        }

        if (error instanceof Error && error.message === 'invalid-amount') {
          alert('Podaj poprawną kwotę')
          throw error
        }

        if (error instanceof Error && error.message === 'missing-inserted-transaction') {
          alert('Wpis niby został zapisany, ale nie wrócił z bazy')
          throw error
        }

        if (error instanceof Error && error.message === 'missing-date') {
          alert('Błąd daty wpisu')
          throw error
        }

        if (error instanceof Error && error.message === 'invalid-category') {
          alert('Nie można dodać wpisu do tej kategorii')
          throw error
        }

        if (error instanceof Error) {
          alert(`Błąd zapisu: ${error.message}`)
        }

        throw error
      }
    },
    [saveTransactionToCategory, selectedMonth]
  )

  const handleUpdateTransaction = useCallback(
    async (
      transactionId: string,
      amountText: string,
      descriptionText: string,
      dateText: string,
      tagNames: string[] = [],
      dayIsNullOverride?: boolean,
      paymentSourceId?: string | null,
      paymentSplitItems?: PaymentSplitInput[]
    ) => {
      const transaction = activeTransactionsById[transactionId]

      if (!transaction) {
        alert('Nie znaleziono wpisu')
        throw new Error('transaction-not-found')
      }

      if (!guardTransactionsUnlocked([transaction], 'edycja wpisu')) {
        throw new Error('locked-month')
      }

      const value = Number(normalizeAmountInput(amountText))

      if (!value || value <= 0) {
        alert('Podaj poprawną kwotę')
        throw new Error('invalid-amount')
      }

      const trimmedDateText = dateText.trim()

      if (!trimmedDateText) {
        alert('Podaj dzień transakcji')
        throw new Error('missing-date')
      }

      const nextDayIsNull =
        typeof dayIsNullOverride === 'boolean'
          ? dayIsNullOverride
          : Boolean(transaction.day_is_null) && trimmedDateText === transaction.date

      const normalizedPaymentSplit = buildPaymentSplitPayload({
        totalAmountText: amountText,
        selectedPaymentSourceId: paymentSourceId === undefined ? transaction.payment_source_id || '' : paymentSourceId || '',
        splitItems: paymentSplitItems ?? [],
      })

      if (normalizedPaymentSplit.errors.length > 0) {
        alert(normalizedPaymentSplit.errors.join('\n'))
        throw new Error('invalid-payment-split-total')
      }

      const { error } = await supabase
        .from('transactions')
        .update({
          amount: value,
          description: descriptionText.trim() || null,
          date: trimmedDateText,
          day_is_null: nextDayIsNull,
          payment_source_id: normalizedPaymentSplit.paymentSourceId,
        })
        .eq('id', transactionId)

      if (error) {
        alert(`Błąd zapisu: ${error.message}`)
        throw error
      }

      await syncTransactionTags(transactionId, tagNames)
      await syncTransactionPaymentSplits(
        transactionId,
        amountText,
        normalizedPaymentSplit.paymentSourceId || '',
        paymentSplitItems ?? []
      )
      await loadData()
    },
    [
      activeTransactionsById,
      guardTransactionsUnlocked,
      loadData,
      supabase,
      syncTransactionPaymentSplits,
      syncTransactionTags,
    ]
  )

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
    handleSaveTransaction,
    handleInlineSaveTransaction,
    handleUpdateTransaction,
    moveTransactionsToCategory,
    handleRestoreTransaction,
    handleMoveTransaction,
    handleDeleteTransaction,
    handlePermanentDeleteTransaction,
    handleEmptyTrash,
  }
}
