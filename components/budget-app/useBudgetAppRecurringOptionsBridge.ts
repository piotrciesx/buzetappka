'use client'

import { useCallback } from 'react'
import type { Category, Transaction } from '../../lib/budgetPageTypes'
import {
  getRecurringDisplayLabel,
  getReminderMonthStatus,
  isReminderMonthHandled,
  isRecurringExpectedInMonth,
} from '../../lib/recurringTransactions'
import { isTransactionInMonth } from '../../lib/transactionDomain'
import { useRecurringOptions } from '../../lib/useRecurringOptions'

type Params = {
  visibleCategories: Category[]
  recurringTransactions: any[]
  recurringExecutions: any[]
  recurringReminderMonthStatuses: any[]
  transactions: Transaction[]
  selectedMonth: string
  selectedTransactionCategoryId: string | null
  selectedLevel2Id: string | null
  selectedTransactionTypeId: string | null
  newAmount: string
  newDescription: string
  categoriesById: Record<string, Category>
  isEnabled: boolean
}

export function useBudgetAppRecurringOptionsBridge({
  visibleCategories,
  recurringTransactions,
  recurringExecutions,
  recurringReminderMonthStatuses,
  transactions,
  selectedMonth,
  selectedTransactionCategoryId,
  selectedLevel2Id,
  selectedTransactionTypeId,
  newAmount,
  newDescription,
  categoriesById,
  isEnabled,
}: Params) {
  const { finalCategoryOptions, recurringOptionItems, recurringSuggestionItems } =
    useRecurringOptions({
      visibleCategories,
      recurringTransactions,
      recurringExecutions,
      recurringReminderMonthStatuses,
      transactions,
      selectedMonth,
      selectedTransactionCategoryId,
      selectedLevel2Id,
      selectedTransactionTypeId,
      newAmount,
      newDescription,
      categoriesById,
      isEnabled,
    })

  const getRecurringOptionsForCategoryId = useCallback(
    (categoryId: string) => {
      if (!isEnabled) {
        return []
      }

      return recurringTransactions
        .filter(
          (reminder) =>
            reminder.category_id === categoryId && isRecurringExpectedInMonth(reminder, selectedMonth)
        )
        .map((reminder) => {
          const hasTransactionInMonth = transactions.some(
            (transaction) =>
              transaction.recurring_transaction_id === reminder.id &&
              isTransactionInMonth(transaction, selectedMonth)
          )
          const reminderState = getReminderMonthStatus({
            recurring: reminder,
            monthText: selectedMonth,
            monthStatuses: recurringReminderMonthStatuses,
            executions: recurringExecutions,
            transactions,
          })
          const isHandled = isReminderMonthHandled(reminderState)

          return {
            id: reminder.id,
            label: `${getRecurringDisplayLabel(reminder, categoriesById)}${
              isHandled ? ' — już dodano wpis w tym miesiącu' : ''
            }`,
            description: reminder.description || reminder.name,
            amount: reminder.amount,
            useAmountWhenCreating: Boolean(reminder.use_amount_when_creating),
            hasTransactionInMonth: isHandled || hasTransactionInMonth,
          }
        })
        .sort((left, right) => Number(left.hasTransactionInMonth) - Number(right.hasTransactionInMonth))
    },
    [
      categoriesById,
      isEnabled,
      recurringExecutions,
      recurringReminderMonthStatuses,
      recurringTransactions,
      selectedMonth,
      transactions,
    ]
  )

  return {
    finalCategoryOptions,
    getRecurringOptionsForCategoryId,
    recurringOptionItems,
    recurringSuggestionItems,
  }
}
