import { useCallback, useRef } from 'react'
import { normalizeAmountInput } from './budgetPageHelpers'
import { buildDateFromDayInput, getDayInputFromDate } from './dateUtils'
import { buildPaymentSplitPayload, PaymentSplitInput } from './paymentSplitUtils'

import type { UseTransactionEntryActionsParams } from './transaction-entry-actions/transactionEntryActionTypes'
import { confirmPotentialDuplicateTransaction } from './transaction-entry-actions/transactionEntryValidation'
import { syncTransactionPaymentSplits as syncTransactionPaymentSplitsHelper, syncTransactionTags as syncTransactionTagsHelper } from './transaction-entry-actions/transactionEntryPersistence'
import { useTransactionTrashActions } from './transaction-entry-actions/useTransactionTrashActions'

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
  isQuickDayModeEnabled = false,
  quickDayDate = '',
  isPaymentSourcesEnabled,
  isRecurringTransactionsEnabled,
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
  const saveLockRef = useRef(false)
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
      await syncTransactionTagsHelper(
        supabase,
        profileId,
        transactionId,
        rawTagNames,
        transactionTagsMap[transactionId] || []
      )
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
      await syncTransactionPaymentSplitsHelper(
        supabase,
        transactionId,
        amountText,
        paymentSourceIdValue,
        paymentSplitItemsValue
      )
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

  const confirmPotentialDuplicate = useCallback(
    (
      categoryId: string,
      amountText: string,
      descriptionText: string,
      dateText: string,
      dayIsNull = false
    ) =>
      confirmPotentialDuplicateTransaction(
        activeTransactionsById,
        categoryId,
        Number(normalizeAmountInput(amountText)),
        descriptionText,
        dateText,
        dayIsNull
      ),
    [activeTransactionsById]
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

      if (
        !confirmPotentialDuplicate(
          categoryId,
          amountText,
          descriptionText,
          dateText,
          dayIsNull
        )
      ) {
        throw new Error('duplicate-cancelled')
      }

      const normalizedPaymentSplit = isPaymentSourcesEnabled
        ? buildPaymentSplitPayload({
            totalAmountText: amountText,
            selectedPaymentSourceId:
              paymentSourceIdOverride === undefined ? selectedPaymentSourceId : paymentSourceIdOverride || '',
            splitItems: paymentSplitItemsOverride ?? selectedPaymentSplitItems,
          })
        : { paymentSourceId: null, splitRows: [], errors: [] }

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
            recurring_transaction_id: isRecurringTransactionsEnabled ? recurringTransactionId : null,
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
        if (isPaymentSourcesEnabled) {
          await syncTransactionPaymentSplits(
            insertedTransaction.id,
            amountText,
            normalizedPaymentSplit.paymentSourceId || '',
            paymentSplitItemsOverride ?? selectedPaymentSplitItems
          )
        }
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
      confirmPotentialDuplicate,
      isPaymentSourcesEnabled,
      isRecurringTransactionsEnabled,
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
      if (saveLockRef.current) {
        return
      }

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

      saveLockRef.current = true
      setIsSaving(true)

      try {
        await saveTransactionToCategory(
          effectiveCategoryId,
          newAmount,
          newDescription,
          nextTransactionDate,
          nextDayIsNull,
          selectedTagNames,
          isRecurringTransactionsEnabled ? selectedRecurringTransactionId || null : null
        )

        if (transactionDraftType) {
          await deleteDraft(transactionDraftType)
        }

        saveLockRef.current = false
        setIsSaving(false)
      } catch (error) {
        if (error instanceof Error && error.message === 'locked-month') {
          saveLockRef.current = false
          setIsSaving(false)
          return
        } else if (error instanceof Error && error.message === 'duplicate-cancelled') {
          saveLockRef.current = false
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

        saveLockRef.current = false
        setIsSaving(false)
        return
      }

      if (isSerialTransactionCreatorEnabled && !shouldCloseAfterSave) {
        setTransactionCreatorSuggestionId(effectiveCategoryId)
        setNewTransactionDate(isQuickDayModeEnabled && quickDayDate ? quickDayDate : '')
        setNewAmount('')
        setNewDescription('')
        setSelectedTagNames([])
        setSelectedPaymentSourceId(defaultPaymentSourceId || '')
        setSelectedPaymentSplitItems([])

        window.setTimeout(() => {
          amountInputRef.current?.focus()
        }, 0)

        saveLockRef.current = false
        return
      }

      resetTransactionCreator()
      saveLockRef.current = false
    },
    [
      amountInputRef,
      canAddTransactionToCategory,
      categoriesById,
      deleteDraft,
      getEffectiveTransactionCategoryId,
      getRootLevel1IdForCategory,
      isSerialTransactionCreatorEnabled,
      isQuickDayModeEnabled,
      isRecurringTransactionsEnabled,
      quickDayDate,
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
          isRecurringTransactionsEnabled ? recurringTransactionId || null : null,
          paymentSourceId,
          paymentSplitItems
        )
      } catch (error) {
        if (error instanceof Error && error.message === 'locked-month') {
          throw error
        }

        if (error instanceof Error && error.message === 'duplicate-cancelled') {
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
    [isRecurringTransactionsEnabled, saveTransactionToCategory, selectedMonth]
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

      const shouldUpdatePaymentSources = isPaymentSourcesEnabled && paymentSourceId !== undefined
      const normalizedPaymentSplit = shouldUpdatePaymentSources
        ? buildPaymentSplitPayload({
            totalAmountText: amountText,
            selectedPaymentSourceId: paymentSourceId || '',
            splitItems: paymentSplitItems ?? [],
          })
        : { paymentSourceId: transaction.payment_source_id || null, splitRows: [], errors: [] }

      if (normalizedPaymentSplit.errors.length > 0) {
        alert(normalizedPaymentSplit.errors.join('\n'))
        throw new Error('invalid-payment-split-total')
      }

      const transactionUpdates = shouldUpdatePaymentSources
        ? {
            amount: value,
            description: descriptionText.trim() || null,
            date: trimmedDateText,
            day_is_null: nextDayIsNull,
            payment_source_id: normalizedPaymentSplit.paymentSourceId,
          }
        : {
            amount: value,
            description: descriptionText.trim() || null,
            date: trimmedDateText,
            day_is_null: nextDayIsNull,
          }

      const { error } = await supabase
        .from('transactions')
        .update(transactionUpdates)
        .eq('id', transactionId)

      if (error) {
        alert(`Błąd zapisu: ${error.message}`)
        throw error
      }

      await syncTransactionTags(transactionId, tagNames)
      if (shouldUpdatePaymentSources) {
        await syncTransactionPaymentSplits(
          transactionId,
          amountText,
          normalizedPaymentSplit.paymentSourceId || '',
          paymentSplitItems ?? []
        )
      }
      await loadData()
    },
    [
      activeTransactionsById,
      guardTransactionsUnlocked,
      isPaymentSourcesEnabled,
      loadData,
      supabase,
      syncTransactionPaymentSplits,
      syncTransactionTags,
    ]
  )

  const {
    moveTransactionsToCategory,
    handleRestoreTransaction,
    handleMoveTransaction,
    handleDeleteTransaction,
    handlePermanentDeleteTransaction,
    handleEmptyTrash,
  } = useTransactionTrashActions({
    supabase,
    activeTransactionsById,
    trashedTransactionsById,
    isAllowedMoveTarget,
    guardTransactionsUnlocked,
    clearTransactionOperationUi,
    loadData,
    setLastUndoAction,
  })

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
