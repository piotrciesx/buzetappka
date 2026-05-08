'use client'

import { useCallback } from 'react'
import type { Tag, Transaction, TransactionPaymentSplit } from '../../lib/budgetPageTypes'
import type { TransactionDraftType } from '../../lib/draftUtils'
import { createPaymentSplitItemsFromStoredSplits } from '../../lib/paymentSplitUtils'
import { getAmountNumber } from '../../lib/transactionUtils'
import { canCreateTransactionsInMonth } from '../../lib/transactionCreationAvailability'

type UseDuplicateTransactionInput = {
  isSelectedMonthLocked: boolean
  isQuickDayModeEnabled: boolean
  effectiveQuickDayDate: string
  transactionTagsMap: Record<string, Tag[]>
  transactionPaymentSplitsMap: Record<string, TransactionPaymentSplit[]>
  amountInputRef: React.RefObject<HTMLInputElement | null>
  applyTransactionCategorySelection: (categoryId: string) => void
  setTransactionCreatorSuggestionId: (categoryId: string | null) => void
  setTransactionCreatorLockedLevel1Id: (categoryId: string | null) => void
  setNewAmount: (value: string) => void
  setNewDescription: (value: string) => void
  setSelectedTagNames: (value: string[]) => void
  setSelectedPaymentSourceId: (value: string) => void
  setSelectedPaymentSplitItems: (value: Array<{ paymentSourceId: string; amount: string }>) => void
  setSelectedRecurringTransactionId: (value: string) => void
  setNewTransactionDate: (value: string) => void
  setIsSerialTransactionCreatorEnabled: (value: boolean) => void
  setTransactionDraftId: (value: string | null) => void
  setTransactionDraftType: (value: TransactionDraftType | null) => void
  setTransactionCreatorInitialDate: (value: string | null) => void
  setIsTransactionCreatorOpen: (value: boolean) => void
}

export function useDuplicateTransaction({
  isSelectedMonthLocked,
  isQuickDayModeEnabled,
  effectiveQuickDayDate,
  transactionTagsMap,
  transactionPaymentSplitsMap,
  amountInputRef,
  applyTransactionCategorySelection,
  setTransactionCreatorSuggestionId,
  setTransactionCreatorLockedLevel1Id,
  setNewAmount,
  setNewDescription,
  setSelectedTagNames,
  setSelectedPaymentSourceId,
  setSelectedPaymentSplitItems,
  setSelectedRecurringTransactionId,
  setNewTransactionDate,
  setIsSerialTransactionCreatorEnabled,
  setTransactionDraftId,
  setTransactionDraftType,
  setTransactionCreatorInitialDate,
  setIsTransactionCreatorOpen,
}: UseDuplicateTransactionInput) {
  return useCallback(
    (transaction: Transaction) => {
      if (!canCreateTransactionsInMonth(isSelectedMonthLocked)) {
        return
      }

      applyTransactionCategorySelection(transaction.category_id)
      setTransactionCreatorSuggestionId(transaction.category_id)
      setTransactionCreatorLockedLevel1Id(null)
      setNewAmount(String(getAmountNumber(transaction.amount)))
      setNewDescription(transaction.description || '')
      setSelectedTagNames((transactionTagsMap[transaction.id] || []).map((tag) => tag.name))
      setSelectedPaymentSourceId(transaction.payment_source_id || '')
      setSelectedPaymentSplitItems(
        createPaymentSplitItemsFromStoredSplits(transactionPaymentSplitsMap[transaction.id] || [])
      )
      setSelectedRecurringTransactionId(transaction.recurring_transaction_id || '')
      setNewTransactionDate(isQuickDayModeEnabled && effectiveQuickDayDate ? effectiveQuickDayDate : '')
      setIsSerialTransactionCreatorEnabled(false)
      setTransactionDraftId(null)
      setTransactionDraftType(null)
      setTransactionCreatorInitialDate(null)
      setIsTransactionCreatorOpen(true)

      window.setTimeout(() => {
        amountInputRef.current?.focus()
      }, 0)
    },
    [
      amountInputRef,
      applyTransactionCategorySelection,
      effectiveQuickDayDate,
      isQuickDayModeEnabled,
      isSelectedMonthLocked,
      setIsSerialTransactionCreatorEnabled,
      setIsTransactionCreatorOpen,
      setNewAmount,
      setNewDescription,
      setNewTransactionDate,
      setSelectedPaymentSourceId,
      setSelectedPaymentSplitItems,
      setSelectedRecurringTransactionId,
      setSelectedTagNames,
      setTransactionCreatorInitialDate,
      setTransactionCreatorLockedLevel1Id,
      setTransactionCreatorSuggestionId,
      setTransactionDraftId,
      setTransactionDraftType,
      transactionPaymentSplitsMap,
      transactionTagsMap,
    ]
  )
}
