import { useMemo } from 'react'
import {
  Category,
  RecurringReminderMonthStatus,
  RecurringTransaction,
  RecurringTransactionExecution,
  Transaction,
} from './budgetPageTypes'
import {
  buildRecurringSuggestions,
  getRecurringDisplayLabel,
  getReminderMonthStatus,
  isReminderMonthHandled,
  isRecurringExpectedInMonth,
} from './recurringTransactions'
import { isTransactionInMonth } from './transactionDomain'

type Params = {
  visibleCategories: Category[]
  recurringTransactions: RecurringTransaction[]
  recurringExecutions: RecurringTransactionExecution[]
  recurringReminderMonthStatuses: RecurringReminderMonthStatus[]
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

export function useRecurringOptions({
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
  const finalCategoryOptions = useMemo(() => {
    return visibleCategories.filter((category) => {
      return !visibleCategories.some((item) => item.parent_id === category.id)
    })
  }, [visibleCategories])

  const recurringOptionItems = useMemo(() => {
    const effectiveCategoryId =
      selectedTransactionCategoryId || selectedLevel2Id || selectedTransactionTypeId

    if (!isEnabled || !effectiveCategoryId) {
      return []
    }

    return recurringTransactions
      .filter(
        (recurring) =>
          recurring.category_id === effectiveCategoryId &&
          isRecurringExpectedInMonth(recurring, selectedMonth)
      )
      .map((recurring) => {
        const hasTransactionInMonth = transactions.some(
          (transaction) =>
            transaction.recurring_transaction_id === recurring.id &&
            isTransactionInMonth(transaction, selectedMonth)
        )
        const reminderState = getReminderMonthStatus({
          recurring,
          monthText: selectedMonth,
          monthStatuses: recurringReminderMonthStatuses,
          executions: recurringExecutions,
          transactions,
        })
        const isHandled = isReminderMonthHandled(reminderState)

        return {
          id: recurring.id,
          label: `${getRecurringDisplayLabel(recurring, categoriesById)}${
            isHandled ? ' — już dodano wpis w tym miesiącu' : ''
          }`,
          description: recurring.description || recurring.name,
          amount: recurring.amount,
          useAmountWhenCreating: Boolean(recurring.use_amount_when_creating),
          hasTransactionInMonth: isHandled || hasTransactionInMonth,
        }
      })
      .sort((left, right) => Number(left.hasTransactionInMonth) - Number(right.hasTransactionInMonth))
  }, [
    categoriesById,
    isEnabled,
    recurringExecutions,
    recurringReminderMonthStatuses,
    recurringTransactions,
    selectedLevel2Id,
    selectedMonth,
    selectedTransactionCategoryId,
    selectedTransactionTypeId,
    transactions,
  ])

  const recurringSuggestionItems = useMemo(() => {
    if (!isEnabled) {
      return []
    }

    return buildRecurringSuggestions({
      recurringTransactions,
      executions: recurringExecutions,
      monthStatuses: recurringReminderMonthStatuses,
      transactions,
      selectedMonth,
      categoryId:
        selectedTransactionCategoryId ||
        selectedLevel2Id ||
        selectedTransactionTypeId,
      amountText: newAmount,
      description: newDescription,
    }).map((recurring) => ({
      id: recurring.id,
      label: getRecurringDisplayLabel(recurring, categoriesById),
      description: recurring.description || recurring.name,
      amount: recurring.amount,
      useAmountWhenCreating: Boolean(recurring.use_amount_when_creating),
      hasTransactionInMonth: false,
    }))
      .filter(
        (suggestion) => !recurringOptionItems.some((option) => option.id === suggestion.id)
      )
  }, [
    categoriesById,
    isEnabled,
    newAmount,
    newDescription,
    recurringOptionItems,
    recurringExecutions,
    recurringReminderMonthStatuses,
    recurringTransactions,
    selectedLevel2Id,
    selectedMonth,
    selectedTransactionCategoryId,
    selectedTransactionTypeId,
    transactions,
  ])

  return {
    finalCategoryOptions,
    recurringOptionItems,
    recurringSuggestionItems,
  }
}
