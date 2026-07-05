'use client'

import { useCallback } from 'react'
import { clearRecurringOccurrenceLinkIntent, peekRecurringOccurrenceLinkIntent } from '../../lib/recurring-payments/occurrenceLinkIntent'
import { supabase } from '../../lib/supabaseClient'
import type { Transaction } from '../../lib/budgetPageTypes'
import {
  getMonthCycleDate,
  getNextExpectedRecurringMonth,
  getReminderMonthStatus,
  getReminderMonthForTransactionLink,
  isReminderMonthHandled,
} from '../../lib/recurringTransactions'
import { useBudgetPageDrafts } from '../../lib/useBudgetPageDrafts'
import { useRecurringTransactionCreator } from '../../lib/useRecurringTransactionCreator'
import { useTransactionCreatorOpeners } from '../../lib/useTransactionCreatorOpeners'
import { useDuplicateTransaction } from './useDuplicateTransaction'

type Params = Record<string, any>

export function useBudgetAppTransactionCreatorBridge(ctx: Params) {
  const getDraftTypeForLevel1Id = useCallback(
    (level1Id: string | null) => {
      if (!level1Id) {
        return null
      }

      if (level1Id === ctx.incomeLevel1Id) {
        return 'income' as const
      }

      if (level1Id === ctx.expenseLevel1Id) {
        return 'expense' as const
      }

      return null
    },
    [ctx.expenseLevel1Id, ctx.incomeLevel1Id]
  )

  const draftsApi = useBudgetPageDrafts({
    profileId: ctx.profileId,
    categoriesById: ctx.categoriesById,
    incomeLevel1Id: ctx.incomeLevel1Id,
    expenseLevel1Id: ctx.expenseLevel1Id,
    selectedMonth: ctx.selectedMonth,
    isTransactionCreatorOpen: ctx.isTransactionCreatorOpen,
    selectedTransactionTypeId: ctx.selectedTransactionTypeId,
    selectedLevel2Id: ctx.selectedLevel2Id,
    selectedTransactionCategoryId: ctx.selectedTransactionCategoryId,
    newAmount: ctx.newAmount,
    newDescription: ctx.newDescription,
    newTransactionDate: ctx.newTransactionDate,
    transactionCreatorInitialDate: ctx.transactionCreatorInitialDate,
    getDraftTypeForLevel1Id,
    applyTransactionCategorySelection: ctx.applyTransactionCategorySelection,
    setSelectedMonth: ctx.setSelectedMonth,
    setTransactionCreatorSuggestionId: ctx.setTransactionCreatorSuggestionId,
    setTransactionCreatorLockedLevel1Id: ctx.setTransactionCreatorLockedLevel1Id,
    setSelectedTransactionTypeId: ctx.setSelectedTransactionTypeIdWithPaymentSource,
    setSelectedLevel2Id: ctx.setSelectedLevel2Id,
    setSelectedTransactionCategoryId: ctx.setSelectedTransactionCategoryId,
    setNewAmount: ctx.setNewAmount,
    setNewDescription: ctx.setNewDescription,
    setNewTransactionDate: ctx.setNewTransactionDate,
    setSelectedRecurringTransactionId: ctx.setSelectedRecurringTransactionId,
    setIsSerialTransactionCreatorEnabled: ctx.setIsSerialTransactionCreatorEnabled,
    setTransactionCreatorInitialDate: ctx.setTransactionCreatorInitialDate,
    setIsTransactionCreatorOpen: ctx.setIsTransactionCreatorOpen,
    amountInputRef: ctx.amountInputRef,
    descriptionInputRef: ctx.descriptionInputRef,
  })

  const { resetTransactionCreator } = useRecurringTransactionCreator({
    recurringTransactions: ctx.isRecurringTransactionsModuleEnabled ? ctx.recurringTransactions : [],
    recurringExecutions: ctx.isRecurringTransactionsModuleEnabled ? ctx.recurringExecutions : [],
    transactions: ctx.scopedTransactions,
    categoriesById: ctx.categoriesById,
    selectedMonth: ctx.selectedMonth,
    selectedRecurringTransactionId: ctx.selectedRecurringTransactionId,
    paymentSourceSettings: ctx.paymentSourceSettings,
    getRootLevel1IdForCategory: ctx.getRootLevel1IdForCategory,
    getDraftTypeForLevel1Id,
    getPaymentSourceKindForLevel1Id: ctx.getPaymentSourceKindForLevel1Id,
    applyTransactionCategorySelection: ctx.applyTransactionCategorySelection,
    saveRecurringReminderMonthStatus: ctx.saveRecurringReminderMonthStatus,
    amountInputRef: ctx.amountInputRef,
    setTransactionCreatorSuggestionId: ctx.setTransactionCreatorSuggestionId,
    setTransactionCreatorLockedLevel1Id: ctx.setTransactionCreatorLockedLevel1Id,
    setSelectedTransactionTypeId: ctx.setSelectedTransactionTypeIdWithPaymentSource,
    setSelectedLevel2Id: ctx.setSelectedLevel2Id,
    setSelectedTransactionCategoryId: ctx.setSelectedTransactionCategoryId,
    setNewAmount: ctx.setNewAmount,
    setNewDescription: ctx.setNewDescription,
    setNewTransactionDate: ctx.setNewTransactionDate,
    setSelectedPaymentSourceId: ctx.setSelectedPaymentSourceId,
    setSelectedPaymentSplitItems: ctx.setSelectedPaymentSplitItems,
    setSelectedTagNames: ctx.setSelectedTagNames,
    setSelectedRecurringTransactionId: ctx.setSelectedRecurringTransactionId,
    setIsSerialTransactionCreatorEnabled: ctx.setIsSerialTransactionCreatorEnabled,
    setTransactionDraftId: draftsApi.setTransactionDraftId,
    setTransactionDraftType: draftsApi.setTransactionDraftType,
    setTransactionCreatorInitialDate: ctx.setTransactionCreatorInitialDate,
    setIsTransactionCreatorOpen: ctx.setIsTransactionCreatorOpen,
    restoreDescriptionSuggestion: ctx.restoreDescriptionSuggestion,
  })

  const handleDuplicateTransaction = useDuplicateTransaction({
    isSelectedMonthLocked: ctx.isSelectedMonthLocked,
    isQuickDayModeEnabled: ctx.isQuickDayModeEnabled,
    effectiveQuickDayDate: ctx.effectiveQuickDayDate,
    transactionTagsMap: ctx.transactionTagsMap,
    transactionPaymentSplitsMap: ctx.transactionPaymentSplitsMap,
    amountInputRef: ctx.amountInputRef,
    applyTransactionCategorySelection: ctx.applyTransactionCategorySelection,
    setTransactionCreatorSuggestionId: ctx.setTransactionCreatorSuggestionId,
    setTransactionCreatorLockedLevel1Id: ctx.setTransactionCreatorLockedLevel1Id,
    setNewAmount: ctx.setNewAmount,
    setNewDescription: ctx.setNewDescription,
    setSelectedTagNames: ctx.setSelectedTagNames,
    setSelectedPaymentSourceId: ctx.setSelectedPaymentSourceId,
    setSelectedPaymentSplitItems: ctx.setSelectedPaymentSplitItems,
    setSelectedRecurringTransactionId: ctx.setSelectedRecurringTransactionId,
    setNewTransactionDate: ctx.setNewTransactionDate,
    setIsSerialTransactionCreatorEnabled: ctx.setIsSerialTransactionCreatorEnabled,
    setTransactionDraftId: draftsApi.setTransactionDraftId,
    setTransactionDraftType: draftsApi.setTransactionDraftType,
    setTransactionCreatorInitialDate: ctx.setTransactionCreatorInitialDate,
    setIsTransactionCreatorOpen: ctx.setIsTransactionCreatorOpen,
  })

  const handleTransactionSavedWithReminderStatus = useCallback(
    async (transaction: Transaction) => {
      const occurrenceIntent = peekRecurringOccurrenceLinkIntent()
      if (occurrenceIntent) {
        const { error: occurrenceLinkError } = await supabase.rpc(
          'link_transaction_to_recurring_occurrence',
          { p_occurrence_id: occurrenceIntent.occurrenceId, p_transaction_id: transaction.id },
        )
        if (occurrenceLinkError) throw occurrenceLinkError
        clearRecurringOccurrenceLinkIntent()
      }

      if (!ctx.effectiveVisibleModules.recurringTransactions) {
        return
      }

      const reminderId = ctx.selectedRecurringTransactionId || transaction.recurring_transaction_id

      if (!reminderId) {
        return
      }

      let reminderMonth = getReminderMonthForTransactionLink({
        transaction,
        selectedMonth: ctx.selectedMonth,
        hasExplicitReminderSelection: Boolean(ctx.selectedRecurringTransactionId),
      })
      const selectedReminder = ctx.recurringTransactions.find((item: any) => item.id === reminderId)

      if (selectedReminder && ctx.selectedRecurringTransactionId) {
        const currentState = getReminderMonthStatus({
          recurring: selectedReminder,
          monthText: reminderMonth,
          monthStatuses: ctx.recurringReminderMonthStatuses,
          executions: ctx.recurringExecutions,
          transactions: ctx.scopedTransactions,
        })

        if (isReminderMonthHandled(currentState) && currentState.transactionId !== transaction.id) {
          const nextMonth = getNextExpectedRecurringMonth(selectedReminder, reminderMonth)
          const shouldUseNextMonth =
            nextMonth &&
            window.confirm(
              `To przypomnienie ma już zamknięty miesiąc ${reminderMonth}. Czy zaliczyć ten wpis na miesiąc ${nextMonth}?`
            )

          if (shouldUseNextMonth) {
            reminderMonth = nextMonth
          }
        }
      }

      await ctx.saveRecurringReminderMonthStatus({
        reminderId,
        month: reminderMonth,
        status: 'handled_with_transaction',
        transactionId: transaction.id,
      })
    },
    [
      ctx.effectiveVisibleModules.recurringTransactions,
      ctx.saveRecurringReminderMonthStatus,
      ctx.recurringExecutions,
      ctx.recurringReminderMonthStatuses,
      ctx.recurringTransactions,
      ctx.selectedRecurringTransactionId,
      ctx.selectedMonth,
      ctx.scopedTransactions,
    ]
  )

  const openReminderTransactionCreator = useCallback(
    (reminder: (typeof ctx.recurringTransactions)[number]) => {
      ctx.applyTransactionCategorySelection(reminder.category_id)
      ctx.setNewDescription(reminder.description || reminder.name)
      ctx.setNewAmount(
        reminder.use_amount_when_creating && reminder.amount !== null ? String(reminder.amount) : ''
      )
      ctx.setSelectedPaymentSourceId(reminder.payment_source_id || '')
      ctx.setSelectedRecurringTransactionId(reminder.id)
      ctx.setNewTransactionDate(getMonthCycleDate(reminder, ctx.selectedMonth))
      ctx.setTransactionCreatorSuggestionId(reminder.category_id)
      ctx.setIsSerialTransactionCreatorEnabled(false)
      ctx.setIsTransactionCreatorOpen(true)
    },
    [ctx]
  )

  const openers = useTransactionCreatorOpeners({
    selectedMonth: ctx.selectedMonth,
    categoriesById: ctx.categoriesById,
    getRootLevel1IdForCategory: ctx.getRootLevel1IdForCategory,
    getDraftTypeForLevel1Id,
    getDraftForType: draftsApi.getDraftForType,
    applyTransactionCategorySelection: ctx.applyTransactionCategorySelection,
    setDraftPromptState: draftsApi.setDraftPromptState,
    setTransactionCreatorSuggestionId: ctx.setTransactionCreatorSuggestionId,
    setTransactionCreatorLockedLevel1Id: ctx.setTransactionCreatorLockedLevel1Id,
    setSelectedTransactionTypeId: ctx.setSelectedTransactionTypeIdWithPaymentSource,
    setSelectedLevel2Id: ctx.setSelectedLevel2Id,
    setSelectedTransactionCategoryId: ctx.setSelectedTransactionCategoryId,
    setNewAmount: ctx.setNewAmount,
    setNewDescription: ctx.setNewDescription,
    setNewTransactionDate: ctx.setNewTransactionDate,
    setSelectedRecurringTransactionId: ctx.setSelectedRecurringTransactionId,
    setIsSerialTransactionCreatorEnabled: ctx.setIsSerialTransactionCreatorEnabled,
    setTransactionDraftId: draftsApi.setTransactionDraftId,
    setTransactionDraftType: draftsApi.setTransactionDraftType,
    setTransactionCreatorInitialDate: ctx.setTransactionCreatorInitialDate,
    setIsTransactionCreatorOpen: ctx.setIsTransactionCreatorOpen,
    amountInputRef: ctx.amountInputRef,
  })

  return {
    ...draftsApi,
    ...openers,
    getDraftTypeForLevel1Id,
    handleDuplicateTransaction,
    handleTransactionSavedWithReminderStatus,
    openReminderTransactionCreator,
    resetTransactionCreator,
  }
}
