'use client'

import { useCallback } from 'react'
import type { Category, Transaction } from '../../lib/budgetPageTypes'
import {
  getRecurringDisplayLabel,
  isRecurringExpectedInMonth,
} from '../../lib/recurringTransactions'
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
              transaction.date.slice(0, 7) === selectedMonth
          )

          return {
            id: reminder.id,
            label: `${getRecurringDisplayLabel(reminder, categoriesById)}${
              hasTransactionInMonth ? ' — już dodano wpis w tym miesiącu' : ''
            }`,
            description: reminder.description || reminder.name,
            amount: reminder.amount,
            useAmountWhenCreating: Boolean(reminder.use_amount_when_creating),
            hasTransactionInMonth,
          }
        })
        .sort((left, right) => Number(left.hasTransactionInMonth) - Number(right.hasTransactionInMonth))
    },
    [
      categoriesById,
      isEnabled,
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
