import { useMemo } from 'react'
import { buildRecurringSuggestions, getRecurringDisplayLabel } from './recurringTransactions'

type Params = {
  visibleCategories: any[]
  recurringTransactions: any[]
  recurringExecutions: any[]
  selectedMonth: string
  selectedTransactionCategoryId: string | null
  selectedLevel2Id: string | null
  selectedTransactionTypeId: string | null
  newAmount: string
  newDescription: string
  categoriesById: Record<string, any>
}

export function useRecurringOptions({
  visibleCategories,
  recurringTransactions,
  recurringExecutions,
  selectedMonth,
  selectedTransactionCategoryId,
  selectedLevel2Id,
  selectedTransactionTypeId,
  newAmount,
  newDescription,
  categoriesById,
}: Params) {
  const finalCategoryOptions = useMemo(() => {
    return visibleCategories.filter((category) => {
      return !visibleCategories.some((item) => item.parent_id === category.id)
    })
  }, [visibleCategories])

  const recurringOptionItems = useMemo(() => {
    return recurringTransactions.map((recurring) => ({
      id: recurring.id,
      label: getRecurringDisplayLabel(recurring, categoriesById),
    }))
  }, [categoriesById, recurringTransactions])

  const recurringSuggestionItems = useMemo(() => {
    return buildRecurringSuggestions({
      recurringTransactions,
      executions: recurringExecutions,
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
    }))
  }, [
    categoriesById,
    newAmount,
    newDescription,
    recurringExecutions,
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