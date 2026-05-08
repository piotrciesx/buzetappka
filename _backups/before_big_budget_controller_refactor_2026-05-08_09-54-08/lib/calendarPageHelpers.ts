import { RefObject } from 'react'
import { Category, Transaction } from './budgetPageTypes'
import { TransactionDraftType } from './draftUtils'
import { buildDateFromDayInput } from './dateUtils'

type OpenCalendarTransactionCreatorParams = {
  selectedMonth: string
  level1Id: string | null
  level2Id: string | null
  categoryId: string | null
  dayText: string
  getDraftTypeForLevel1Id: (level1Id: string | null) => TransactionDraftType | null

  setDraftPromptState: (value: null) => void
  setTransactionCreatorSuggestionId: (value: string | null) => void
  setTransactionCreatorLockedLevel1Id: (value: string | null) => void
  setSelectedTransactionTypeId: (value: string | null) => void
  setSelectedLevel2Id: (value: string | null) => void
  setSelectedTransactionCategoryId: (value: string | null) => void
  setNewAmount: (value: string) => void
  setNewDescription: (value: string) => void
  setNewTransactionDate: (value: string) => void
  setSelectedRecurringTransactionId: (value: string) => void
  setIsSerialTransactionCreatorEnabled: (value: boolean) => void
  setTransactionDraftId: (value: string | null) => void
  setTransactionDraftType: (value: TransactionDraftType | null) => void
  setTransactionCreatorInitialDate: (value: string | null) => void
  setIsTransactionCreatorOpen: (value: boolean) => void

  amountInputRef: RefObject<HTMLInputElement | null>
}

type OpenCategoryCalendarAddForDayParams = {
  categoryId: string
  dayText: string
  categoriesById: Record<string, Category>
  getRootLevel1IdForCategory: (categoryId: string) => string | null
  openCalendarTransactionCreator: (
    level1Id: string | null,
    level2Id: string | null,
    targetCategoryId: string | null,
    targetDayText: string
  ) => void
}

export const toggleLevel1Calendar = (prev: string[], level1Id: string) => {
  if (prev.includes(level1Id)) {
    return prev.filter((id) => id !== level1Id)
  }

  return [...prev, level1Id]
}

export const getTransactionsForCalendarMonth = (
  transactions: Transaction[],
  selectedMonth: string
) => {
  return transactions.filter((transaction) => transaction.date.slice(0, 7) === selectedMonth)
}

export const getLevel1DescendantCategoryIds = (categories: Category[], level1Id: string) => {
  const directLevel2Ids = categories
    .filter((category) => category.parent_id === level1Id && category.level === 2)
    .map((category) => category.id)

  const directLevel3Ids = categories
    .filter((category) => category.parent_id === level1Id && category.level === 3)
    .map((category) => category.id)

  const nestedLevel3Ids = categories
    .filter(
      (category) =>
        directLevel2Ids.includes(category.parent_id || '') && category.level === 3
    )
    .map((category) => category.id)

  return [...new Set([level1Id, ...directLevel2Ids, ...directLevel3Ids, ...nestedLevel3Ids])]
}

export const getTransactionsForLevel1AndMonth = (
  transactions: Transaction[],
  categories: Category[],
  level1Id: string,
  selectedMonth: string
) => {
  const descendantIds = getLevel1DescendantCategoryIds(categories, level1Id)

  return transactions.filter(
    (transaction) =>
      transaction.date.slice(0, 7) === selectedMonth &&
      descendantIds.includes(transaction.category_id)
  )
}

export const openCalendarTransactionCreator = (
  params: OpenCalendarTransactionCreatorParams
) => {
  const {
    selectedMonth,
    level1Id,
    level2Id,
    categoryId,
    dayText,
    getDraftTypeForLevel1Id,
    setDraftPromptState,
    setTransactionCreatorSuggestionId,
    setTransactionCreatorLockedLevel1Id,
    setSelectedTransactionTypeId,
    setSelectedLevel2Id,
    setSelectedTransactionCategoryId,
    setNewAmount,
    setNewDescription,
    setNewTransactionDate,
    setSelectedRecurringTransactionId,
    setIsSerialTransactionCreatorEnabled,
    setTransactionDraftId,
    setTransactionDraftType,
    setTransactionCreatorInitialDate,
    setIsTransactionCreatorOpen,
    amountInputRef,
  } = params

  const nextTransactionDate = buildDateFromDayInput(selectedMonth, dayText)

  if (!nextTransactionDate) {
    alert('Nie udało się ustawić dnia transakcji')
    return
  }

  setDraftPromptState(null)
  setTransactionCreatorSuggestionId(categoryId)
  setTransactionCreatorLockedLevel1Id(level1Id)
  setSelectedTransactionTypeId(level1Id)
  setSelectedLevel2Id(level2Id)
  setSelectedTransactionCategoryId(categoryId)
  setNewAmount('')
  setNewDescription('')
  setNewTransactionDate(nextTransactionDate)
  setSelectedRecurringTransactionId('')
  setIsSerialTransactionCreatorEnabled(false)
  setTransactionDraftId(null)
  setTransactionDraftType(getDraftTypeForLevel1Id(level1Id))
  setTransactionCreatorInitialDate(nextTransactionDate)
  setIsTransactionCreatorOpen(true)

  window.setTimeout(() => {
    amountInputRef.current?.focus()
  }, 0)
}

export const openGlobalCalendarAddForDay = (
  dayText: string,
  openCalendarCreator: (
    level1Id: string | null,
    level2Id: string | null,
    categoryId: string | null,
    targetDayText: string
  ) => void
) => {
  openCalendarCreator(null, null, null, dayText)
}

export const openLevel1CalendarAddForDay = (
  level1Id: string,
  dayText: string,
  openCalendarCreator: (
    level1Id: string | null,
    level2Id: string | null,
    categoryId: string | null,
    targetDayText: string
  ) => void
) => {
  openCalendarCreator(level1Id, null, null, dayText)
}

export const openCategoryCalendarAddForDay = (
  params: OpenCategoryCalendarAddForDayParams
) => {
  const {
    categoryId,
    dayText,
    categoriesById,
    getRootLevel1IdForCategory,
    openCalendarTransactionCreator,
  } = params

  const category = categoriesById[categoryId]

  if (!category) {
    alert('Nie znaleziono kategorii')
    return
  }

  if (category.level === 3) {
    const parentLevel2Id = category.parent_id || null
    const rootLevel1Id = getRootLevel1IdForCategory(category.id)

    openCalendarTransactionCreator(rootLevel1Id, parentLevel2Id, category.id, dayText)
    return
  }

  if (category.level === 2) {
    const rootLevel1Id = category.parent_id ? getRootLevel1IdForCategory(category.id) : null
    openCalendarTransactionCreator(rootLevel1Id, category.id, null, dayText)
    return
  }

  if (category.level === 1) {
    openCalendarTransactionCreator(category.id, null, null, dayText)
    return
  }

  alert('Nieprawidłowa kategoria')
}
