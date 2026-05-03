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
  isRecurringExpectedInMonth,
} from './recurringTransactions'

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
            transaction.date.slice(0, 7) === selectedMonth
        )

        return {
          id: recurring.id,
          label: `${getRecurringDisplayLabel(recurring, categoriesById)}${
            hasTransactionInMonth ? ' — już dodano wpis w tym miesiącu' : ''
          }`,
          description: recurring.description || recurring.name,
          amount: recurring.amount,
          useAmountWhenCreating: Boolean(recurring.use_amount_when_creating),
          hasTransactionInMonth,
        }
      })
      .sort((left, right) => Number(left.hasTransactionInMonth) - Number(right.hasTransactionInMonth))
  }, [
    categoriesById,
    isEnabled,
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
  ])

  return {
    finalCategoryOptions,
    recurringOptionItems,
    recurringSuggestionItems,
  }
}
