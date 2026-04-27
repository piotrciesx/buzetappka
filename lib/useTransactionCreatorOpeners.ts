import { RefObject, useCallback } from 'react'
import { Category } from './budgetPageTypes'
import {
  DraftPromptState,
  TransactionDraft,
  TransactionDraftType,
} from './draftUtils'
import {
  openBlankFloatingTransactionCreator as openBlankFloatingTransactionCreatorHelper,
  openFloatingTransactionCreator as openFloatingTransactionCreatorHelper,
  openTransactionCreator as openTransactionCreatorHelper,
} from './transactionCreatorOpenHelpers'
import {
  openCalendarTransactionCreator as openCalendarTransactionCreatorHelper,
  openCategoryCalendarAddForDay as openCategoryCalendarAddForDayHelper,
  openGlobalCalendarAddForDay as openGlobalCalendarAddForDayHelper,
  openLevel1CalendarAddForDay as openLevel1CalendarAddForDayHelper,
} from './calendarPageHelpers'

type UseTransactionCreatorOpenersParams = {
  selectedMonth: string
  categoriesById: Record<string, Category>
  getRootLevel1IdForCategory: (categoryId: string) => string | null
  getDraftTypeForLevel1Id: (level1Id: string | null) => TransactionDraftType | null
  getDraftForType: (draftType: TransactionDraftType) => TransactionDraft | null
  applyTransactionCategorySelection: (categoryId: string) => void

  setDraftPromptState: (value: DraftPromptState | null) => void
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

export function useTransactionCreatorOpeners({
  selectedMonth,
  categoriesById,
  getRootLevel1IdForCategory,
  getDraftTypeForLevel1Id,
  getDraftForType,
  applyTransactionCategorySelection,

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
}: UseTransactionCreatorOpenersParams) {
  const openBlankFloatingTransactionCreator = useCallback(
    (level1Id: string | null) => {
      openBlankFloatingTransactionCreatorHelper({
        level1Id,
        getDraftTypeForLevel1Id,
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
      })
    },
    [
      getDraftTypeForLevel1Id,
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
    ]
  )

  const openCalendarTransactionCreator = useCallback(
    (
      level1Id: string | null,
      level2Id: string | null,
      categoryId: string | null,
      dayText: string
    ) => {
      openCalendarTransactionCreatorHelper({
        selectedMonth,
        level1Id,
        level2Id,
        categoryId,
        dayText,
        getDraftTypeForLevel1Id,
        setDraftPromptState: () => setDraftPromptState(null),
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
      })
    },
    [
      selectedMonth,
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
    ]
  )

  const handleOpenGlobalCalendarAddForDay = useCallback(
    (dayText: string) => {
      openGlobalCalendarAddForDayHelper(dayText, openCalendarTransactionCreator)
    },
    [openCalendarTransactionCreator]
  )

  const handleOpenLevel1CalendarAddForDay = useCallback(
    (level1Id: string, dayText: string) => {
      openLevel1CalendarAddForDayHelper(level1Id, dayText, openCalendarTransactionCreator)
    },
    [openCalendarTransactionCreator]
  )

  const handleOpenCategoryCalendarAddForDay = useCallback(
    (categoryId: string, dayText: string) => {
      openCategoryCalendarAddForDayHelper({
        categoryId,
        dayText,
        categoriesById,
        getRootLevel1IdForCategory,
        openCalendarTransactionCreator,
      })
    },
    [categoriesById, getRootLevel1IdForCategory, openCalendarTransactionCreator]
  )

  const openTransactionCreator = useCallback(
    (suggestedCategoryId: string) => {
      openTransactionCreatorHelper({
        suggestedCategoryId,
        applyTransactionCategorySelection,
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
      })
    },
    [
      applyTransactionCategorySelection,
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
    ]
  )

  const openFloatingTransactionCreator = useCallback(
    (level1Id: string | null) => {
      openFloatingTransactionCreatorHelper({
        level1Id,
        getDraftTypeForLevel1Id,
        getDraftForType,
        setDraftPromptState,
        openBlankFloatingTransactionCreator,
      })
    },
    [
      getDraftTypeForLevel1Id,
      getDraftForType,
      setDraftPromptState,
      openBlankFloatingTransactionCreator,
    ]
  )

  return {
    openBlankFloatingTransactionCreator,
    openCalendarTransactionCreator,
    handleOpenGlobalCalendarAddForDay,
    handleOpenLevel1CalendarAddForDay,
    handleOpenCategoryCalendarAddForDay,
    openTransactionCreator,
    openFloatingTransactionCreator,
  }
}
