/* eslint-disable @typescript-eslint/no-explicit-any */

type UseBudgetPageOverlayPropsParams = {
  canCreateTransactions: boolean
  expenseLevel1Id: string | null
  incomeLevel1Id: string | null
  openFloatingTransactionCreator: (level1Id: string) => void

  isTransactionCreatorOpen: boolean
  selectedMonth: string
  level1: any[]
  sortedLevel2ByParentIdForModal: any
  sortedLevel3ByParentIdForModal: any
  categoriesById: Record<string, any>
  transactionCreatorSuggestionId: string | null
  transactionCreatorLockedLevel1Id: string | null
  topTransactionShortcutCategoriesByType: Record<string, any[]>
  recentTransactionShortcutCategoriesByType: Record<string, any[]>
  descriptionSuggestions: any
  applyTransactionCategorySelection: (id: string) => void
  selectedTransactionTypeId: string | null
  setSelectedTransactionTypeIdWithPaymentSource: (id: string | null) => void
  selectedLevel2Id: string | null
  setSelectedLevel2Id: (id: string | null) => void
  selectedTransactionCategoryId: string | null
  setSelectedTransactionCategoryId: (id: string | null) => void
  isSerialTransactionCreatorEnabled: boolean
  setIsSerialTransactionCreatorEnabled: (value: boolean) => void
  newAmount: string
  setNewAmount: (value: string) => void
  newDescription: string
  setNewDescription: (value: string) => void
  newTransactionDate: string
  setNewTransactionDate: (value: string) => void
  selectedTagNames: string[]
  setSelectedTagNames: any
  selectedPaymentSourceId: string
  setSelectedPaymentSourceId: (value: string) => void
  currentTransactionCreatorPaymentSourceOptions: any[]
  isTransactionCreatorPaymentSourceVisible: boolean
  selectedPaymentSplitItems: Array<{ paymentSourceId: string; amount: string }>
  setSelectedPaymentSplitItems: any
  selectedRecurringTransactionId: string
  setSelectedRecurringTransactionId: (value: string) => void
  recurringOptionItems: any[]
  recurringSuggestionItems: any[]
  isSaving: boolean
  resetTransactionCreator: () => void
  handleSaveTransaction: (close?: boolean) => Promise<void>
  amountInputRef: any
  descriptionInputRef: any
  styles: any
  handleDeleteDescriptionSuggestion: any

  draftPromptState: any
  setDraftPromptState: any
  applyDraftToTransactionCreator: any
  deleteDraft: any
  openBlankFloatingTransactionCreator: any
}

export function useBudgetPageOverlayProps({
  canCreateTransactions,
  expenseLevel1Id,
  incomeLevel1Id,
  openFloatingTransactionCreator,

  isTransactionCreatorOpen,
  selectedMonth,
  level1,
  sortedLevel2ByParentIdForModal,
  sortedLevel3ByParentIdForModal,
  categoriesById,
  transactionCreatorSuggestionId,
  transactionCreatorLockedLevel1Id,
  topTransactionShortcutCategoriesByType,
  recentTransactionShortcutCategoriesByType,
  descriptionSuggestions,
  applyTransactionCategorySelection,
  selectedTransactionTypeId,
  setSelectedTransactionTypeIdWithPaymentSource,
  selectedLevel2Id,
  setSelectedLevel2Id,
  selectedTransactionCategoryId,
  setSelectedTransactionCategoryId,
  isSerialTransactionCreatorEnabled,
  setIsSerialTransactionCreatorEnabled,
  newAmount,
  setNewAmount,
  newDescription,
  setNewDescription,
  newTransactionDate,
  setNewTransactionDate,
  selectedTagNames,
  setSelectedTagNames,
  selectedPaymentSourceId,
  setSelectedPaymentSourceId,
  currentTransactionCreatorPaymentSourceOptions,
  isTransactionCreatorPaymentSourceVisible,
  selectedPaymentSplitItems,
  setSelectedPaymentSplitItems,
  selectedRecurringTransactionId,
  setSelectedRecurringTransactionId,
  recurringOptionItems,
  recurringSuggestionItems,
  isSaving,
  resetTransactionCreator,
  handleSaveTransaction,
  amountInputRef,
  descriptionInputRef,
  styles,
  handleDeleteDescriptionSuggestion,

  draftPromptState,
  setDraftPromptState,
  applyDraftToTransactionCreator,
  deleteDraft,
  openBlankFloatingTransactionCreator,
}: UseBudgetPageOverlayPropsParams) {
  const shortcutBaseLevel1Id = transactionCreatorLockedLevel1Id || selectedTransactionTypeId

  return {
    canCreateTransactions,
    expenseLevel1Id,
    incomeLevel1Id,
    openFloatingTransactionCreator,

    isTransactionCreatorOpen,
    selectedMonth,
    level1,
    sortedLevel2ByParentIdForModal,
    sortedLevel3ByParentIdForModal,
    categoriesById,
    transactionCreatorSuggestionId,
    transactionCreatorLockedLevel1Id,
    topShortcutCategories: shortcutBaseLevel1Id
      ? topTransactionShortcutCategoriesByType[shortcutBaseLevel1Id] || []
      : [],
    recentShortcutCategories: shortcutBaseLevel1Id
      ? recentTransactionShortcutCategoriesByType[shortcutBaseLevel1Id] || []
      : [],
    descriptionSuggestions,
    applyTransactionCategorySelection,
    selectedTransactionTypeId,
    setSelectedTransactionTypeIdWithPaymentSource,
    selectedLevel2Id,
    setSelectedLevel2Id,
    selectedTransactionCategoryId,
    setSelectedTransactionCategoryId,
    isSerialTransactionCreatorEnabled,
    setIsSerialTransactionCreatorEnabled,
    newAmount,
    setNewAmount,
    newDescription,
    setNewDescription,
    newTransactionDate,
    setNewTransactionDate,
    selectedTagNames,
    setSelectedTagNames,
    selectedPaymentSourceId,
    setSelectedPaymentSourceId,
    currentTransactionCreatorPaymentSourceOptions,
    isTransactionCreatorPaymentSourceVisible,
    selectedPaymentSplitItems,
    setSelectedPaymentSplitItems,
    selectedRecurringTransactionId,
    setSelectedRecurringTransactionId,
    recurringOptionItems,
    recurringSuggestionItems,
    isSaving,
    resetTransactionCreator,
    handleSaveTransaction,
    amountInputRef,
    descriptionInputRef,
    styles,
    handleDeleteDescriptionSuggestion,

    draftPromptState,
    setDraftPromptState,
    applyDraftToTransactionCreator,
    deleteDraft,
    openBlankFloatingTransactionCreator,
  }
}
