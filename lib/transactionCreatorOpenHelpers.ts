import { DraftPromptState, TransactionDraft, TransactionDraftType } from './draftUtils'

type BaseOpenTransactionCreatorParams = {
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
  setTransactionCreatorInitialDate: (value: string) => void
  setIsTransactionCreatorOpen: (value: boolean) => void
}

type OpenTransactionCreatorParams = BaseOpenTransactionCreatorParams & {
  suggestedCategoryId: string
  applyTransactionCategorySelection: (categoryId: string) => void
}

type OpenBlankFloatingTransactionCreatorParams = BaseOpenTransactionCreatorParams & {
  level1Id: string | null
  getDraftTypeForLevel1Id: (level1Id: string | null) => TransactionDraftType | null
}

type OpenFloatingTransactionCreatorParams = {
  level1Id: string | null
  getDraftTypeForLevel1Id: (level1Id: string | null) => TransactionDraftType | null
  getDraftForType: (draftType: TransactionDraftType) => TransactionDraft | null
  setDraftPromptState: (value: DraftPromptState | null) => void
  openBlankFloatingTransactionCreator: (level1Id: string | null) => void
}

const setInitialTransactionCreatorState = (
  params: BaseOpenTransactionCreatorParams & {
    suggestionId: string | null
    lockedLevel1Id: string | null
    selectedLevel1Id: string | null
    selectedLevel2Id: string | null
    selectedCategoryId: string | null
    draftType: TransactionDraftType | null
  }
) => {
  const {
    suggestionId,
    lockedLevel1Id,
    selectedLevel1Id,
    selectedLevel2Id,
    selectedCategoryId,
    draftType,
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
  } = params

  setTransactionCreatorSuggestionId(suggestionId)
  setTransactionCreatorLockedLevel1Id(lockedLevel1Id)
  setSelectedTransactionTypeId(selectedLevel1Id)
  setSelectedLevel2Id(selectedLevel2Id)
  setSelectedTransactionCategoryId(selectedCategoryId)
  setNewAmount('')
  setNewDescription('')
  setNewTransactionDate('')
  setSelectedRecurringTransactionId('')
  setIsSerialTransactionCreatorEnabled(false)
  setTransactionDraftId(null)
  setTransactionDraftType(draftType)
  setTransactionCreatorInitialDate('')
  setIsTransactionCreatorOpen(true)
}

export const openTransactionCreator = (params: OpenTransactionCreatorParams) => {
  const {
    suggestedCategoryId,
    applyTransactionCategorySelection,
    ...stateParams
  } = params

  setInitialTransactionCreatorState({
    ...stateParams,
    suggestionId: suggestedCategoryId,
    lockedLevel1Id: null,
    selectedLevel1Id: null,
    selectedLevel2Id: null,
    selectedCategoryId: null,
    draftType: null,
  })

  applyTransactionCategorySelection(suggestedCategoryId)
}

export const openBlankFloatingTransactionCreator = (
  params: OpenBlankFloatingTransactionCreatorParams
) => {
  const { level1Id, getDraftTypeForLevel1Id, ...stateParams } = params

  setInitialTransactionCreatorState({
    ...stateParams,
    suggestionId: null,
    lockedLevel1Id: level1Id,
    selectedLevel1Id: level1Id,
    selectedLevel2Id: null,
    selectedCategoryId: null,
    draftType: getDraftTypeForLevel1Id(level1Id),
  })
}

export const openFloatingTransactionCreator = (params: OpenFloatingTransactionCreatorParams) => {
  const {
    level1Id,
    getDraftTypeForLevel1Id,
    getDraftForType,
    setDraftPromptState,
    openBlankFloatingTransactionCreator,
  } = params

  const draftType = getDraftTypeForLevel1Id(level1Id)

  if (!level1Id || !draftType) {
    openBlankFloatingTransactionCreator(level1Id)
    return
  }

  const existingDraft = getDraftForType(draftType)

  if (existingDraft) {
    setDraftPromptState({
      draft: existingDraft,
      level1Id,
      type: draftType,
    })
    return
  }

  openBlankFloatingTransactionCreator(level1Id)
}
