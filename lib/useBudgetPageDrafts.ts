'use client'

import { Dispatch, RefObject, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { getCategoryPathLabel } from './budgetPageHelpers'
import { Category } from './budgetPageTypes'
import {
  buildDraftsErrorMessage,
  clearLegacyTransactionDrafts,
  createDraftId,
  DRAFT_SAVE_DELAY_MS,
  DraftPromptState,
  DraftRow,
  mapDraftRowToDraft,
  readLegacyTransactionDrafts,
  TransactionDraft,
  TransactionDraftType,
} from './draftUtils'
import { supabase } from './supabaseClient'

type UseBudgetPageDraftsParams = {
  profileId: string
  categoriesById: Record<string, Category>
  incomeLevel1Id: string | null
  expenseLevel1Id: string | null
  selectedMonth: string
  isTransactionCreatorOpen: boolean
  selectedTransactionTypeId: string | null
  selectedLevel2Id: string | null
  selectedTransactionCategoryId: string | null
  newAmount: string
  newDescription: string
  newTransactionDate: string
  transactionCreatorInitialDate: string | null
  getDraftTypeForLevel1Id: (level1Id: string | null) => TransactionDraftType | null
  applyTransactionCategorySelection: (categoryId: string) => void
  setSelectedMonth: Dispatch<SetStateAction<string>>
  setTransactionCreatorSuggestionId: Dispatch<SetStateAction<string | null>>
  setTransactionCreatorLockedLevel1Id: Dispatch<SetStateAction<string | null>>
  setSelectedTransactionTypeId: Dispatch<SetStateAction<string | null>>
  setSelectedLevel2Id: Dispatch<SetStateAction<string | null>>
  setSelectedTransactionCategoryId: Dispatch<SetStateAction<string | null>>
  setNewAmount: Dispatch<SetStateAction<string>>
  setNewDescription: Dispatch<SetStateAction<string>>
  setNewTransactionDate: Dispatch<SetStateAction<string>>
  setSelectedRecurringTransactionId: Dispatch<SetStateAction<string>>
  setIsSerialTransactionCreatorEnabled: Dispatch<SetStateAction<boolean>>
  setTransactionCreatorInitialDate: Dispatch<SetStateAction<string | null>>
  setIsTransactionCreatorOpen: Dispatch<SetStateAction<boolean>>
  amountInputRef: RefObject<HTMLInputElement | null>
  descriptionInputRef: RefObject<HTMLInputElement | null>
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }

  return fallback
}

const isMissingBackendObjectError = (error: unknown) => {
  const message = getErrorMessage(error, '').toLowerCase()

  return (
    message.includes('does not exist') ||
    message.includes('not found') ||
    message.includes('relation') ||
    message.includes('table') ||
    message.includes('schema cache')
  )
}

export const useBudgetPageDrafts = ({
  profileId,
  categoriesById,
  incomeLevel1Id,
  expenseLevel1Id,
  selectedMonth,
  isTransactionCreatorOpen,
  selectedTransactionTypeId,
  selectedLevel2Id,
  selectedTransactionCategoryId,
  newAmount,
  newDescription,
  newTransactionDate,
  transactionCreatorInitialDate,
  getDraftTypeForLevel1Id,
  applyTransactionCategorySelection,
  setSelectedMonth,
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
  setTransactionCreatorInitialDate,
  setIsTransactionCreatorOpen,
  amountInputRef,
  descriptionInputRef,
}: UseBudgetPageDraftsParams) => {
  const [transactionDraftId, setTransactionDraftId] = useState<string | null>(null)
  const [transactionDraftType, setTransactionDraftType] = useState<TransactionDraftType | null>(null)
  const [drafts, setDrafts] = useState<TransactionDraft[]>([])
  const [draftsStatusText, setDraftsStatusText] = useState('')
  const [isDraftsLoading, setIsDraftsLoading] = useState(false)
  const [isCleaningAllDrafts, setIsCleaningAllDrafts] = useState(false)
  const [draftPromptState, setDraftPromptState] = useState<DraftPromptState | null>(null)
  const hasMigratedLegacyDraftsRef = useRef(false)

  const loadDrafts = useCallback(async () => {
    setIsDraftsLoading(true)

    const { data, error } = await supabase
      .from('drafts')
      .select(
        'id, profile_id, draft_type, level1_id, level2_id, category_id, amount, description, date, updated_at'
      )
      .eq('profile_id', profileId)
      .order('updated_at', { ascending: false })

    if (error) {
      const shouldHideTechnicalError = isMissingBackendObjectError(error)
      const uiMessage = shouldHideTechnicalError ? '' : buildDraftsErrorMessage(error, 'load')

      setDrafts([])
      setDraftsStatusText(uiMessage)
      setIsDraftsLoading(false)
      return
    }

    setDrafts((data || []).map((item) => mapDraftRowToDraft(item as DraftRow)))
    setDraftsStatusText('')
    setIsDraftsLoading(false)
  }, [profileId])

  const getDraftForType = useCallback(
    (draftType: TransactionDraftType) => {
      return drafts.find((draft) => draft.type === draftType) || null
    },
    [drafts]
  )

  const saveDraft = useCallback(
    async (draft: TransactionDraft) => {
      const { data, error } = await supabase
        .from('drafts')
        .upsert(
          [
            {
              id: draft.id,
              profile_id: profileId,
              draft_type: draft.type,
              level1_id: draft.level1_id,
              level2_id: draft.level2_id,
              category_id: draft.category_id,
              amount: draft.amount.trim() || null,
              description: draft.description.trim() || null,
              date: draft.date || null,
            },
          ],
          {
            onConflict: 'profile_id,draft_type',
          }
        )
        .select(
          'id, profile_id, draft_type, level1_id, level2_id, category_id, amount, description, date, updated_at'
        )
        .single()

      if (error) {
        const uiMessage = buildDraftsErrorMessage(error, 'save')

        setDraftsStatusText(uiMessage)
        throw new Error(uiMessage)
      }

      const nextDraft = mapDraftRowToDraft(data as DraftRow)

      setDrafts((prev) => {
        const remainingDrafts = prev.filter((item) => item.type !== nextDraft.type)
        return [nextDraft, ...remainingDrafts].sort((left, right) =>
          (right.updated_at || '').localeCompare(left.updated_at || '')
        )
      })
      setDraftsStatusText('')
      setTransactionDraftId(nextDraft.id)
      setTransactionDraftType(nextDraft.type)

      return nextDraft
    },
    [profileId]
  )

  const deleteDraft = useCallback(
    async (draftType: TransactionDraftType) => {
      const { error } = await supabase
        .from('drafts')
        .delete()
        .eq('profile_id', profileId)
        .eq('draft_type', draftType)

      if (error) {
        const uiMessage = buildDraftsErrorMessage(error, 'delete')

        setDraftsStatusText(uiMessage)
        throw new Error(uiMessage)
      }

      setDrafts((prev) => prev.filter((draft) => draft.type !== draftType))
      setDraftsStatusText('')

      if (transactionDraftType === draftType) {
        setTransactionDraftId(null)
        setTransactionDraftType(null)
      }
    },
    [profileId, transactionDraftType]
  )

  const cleanupAllDrafts = useCallback(async () => {
    if (isCleaningAllDrafts) {
      return
    }

    setIsCleaningAllDrafts(true)

    try {
      const { error } = await supabase.from('drafts').delete().eq('profile_id', profileId)

      if (error) {
        throw error
      }

      setDrafts([])
      setTransactionDraftId(null)
      setTransactionDraftType(null)
      setDraftPromptState(null)
      await loadDrafts()
      setDraftsStatusText('Usunięto wszystkie szkice użytkownika.')
    } catch (error) {
      const uiMessage = buildDraftsErrorMessage(error, 'cleanup')
      setDraftsStatusText(uiMessage)
    } finally {
      setIsCleaningAllDrafts(false)
    }
  }, [isCleaningAllDrafts, loadDrafts, profileId])

  const getDraftLevel1Id = useCallback(
    (draft: TransactionDraft) => {
      if (draft.level1_id && categoriesById[draft.level1_id]?.level === 1) {
        return draft.level1_id
      }

      return draft.type === 'income' ? incomeLevel1Id : expenseLevel1Id
    },
    [categoriesById, expenseLevel1Id, incomeLevel1Id]
  )

  const formatDraftUpdatedAt = useCallback((value: string | null) => {
    if (!value) {
      return 'brak danych'
    }

    const parsedDate = new Date(value)

    if (Number.isNaN(parsedDate.getTime())) {
      return 'brak danych'
    }

    return new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(parsedDate)
  }, [])

  const getDraftLocationLabel = useCallback(
    (draft: TransactionDraft) => {
      if (draft.category_id && categoriesById[draft.category_id]) {
        return getCategoryPathLabel(draft.category_id, categoriesById)
      }

      if (draft.level2_id && categoriesById[draft.level2_id]) {
        return getCategoryPathLabel(draft.level2_id, categoriesById)
      }

      const level1Id = getDraftLevel1Id(draft)

      if (level1Id && categoriesById[level1Id]) {
        return categoriesById[level1Id].name
      }

      return 'Bez wybranej kategorii'
    },
    [categoriesById, getDraftLevel1Id]
  )

  const applyDraftToTransactionCreator = useCallback(
    (draft: TransactionDraft, level1Id: string) => {
      setTransactionCreatorSuggestionId(draft.category_id)
      setTransactionCreatorLockedLevel1Id(level1Id)
      setSelectedTransactionTypeId(level1Id)

      const draftMonth = draft.date.slice(0, 7)

      if (draftMonth) {
        setSelectedMonth(draftMonth)
      }

      if (draft.category_id && categoriesById[draft.category_id]?.level === 3) {
        applyTransactionCategorySelection(draft.category_id)
      } else {
        setSelectedLevel2Id(draft.level2_id)
        setSelectedTransactionCategoryId(null)
      }

      setNewAmount(draft.amount)
      setNewDescription(draft.description)
      setIsSerialTransactionCreatorEnabled(false)
      setSelectedRecurringTransactionId('')
      setTransactionDraftId(draft.id)
      setTransactionDraftType(draft.type)
      setNewTransactionDate(draft.date || '')
      setTransactionCreatorInitialDate(draft.date || '')
      setIsTransactionCreatorOpen(true)

      window.setTimeout(() => {
        if (draft.amount.trim()) {
          descriptionInputRef.current?.focus()
          return
        }

        amountInputRef.current?.focus()
      }, 0)
    },
    [
      amountInputRef,
      applyTransactionCategorySelection,
      categoriesById,
      descriptionInputRef,
      setIsSerialTransactionCreatorEnabled,
      setIsTransactionCreatorOpen,
      setNewAmount,
      setNewDescription,
      setNewTransactionDate,
      setSelectedRecurringTransactionId,
      setSelectedLevel2Id,
      setSelectedMonth,
      setSelectedTransactionCategoryId,
      setSelectedTransactionTypeId,
      setTransactionCreatorInitialDate,
      setTransactionCreatorLockedLevel1Id,
      setTransactionCreatorSuggestionId,
    ]
  )

  useEffect(() => {
    if (hasMigratedLegacyDraftsRef.current || isDraftsLoading || draftsStatusText) {
      return
    }

    const legacyDrafts = readLegacyTransactionDrafts()

    if (legacyDrafts.length === 0) {
      hasMigratedLegacyDraftsRef.current = true
      return
    }

    const missingDrafts = legacyDrafts.filter(
      (legacyDraft) => !drafts.some((draft) => draft.type === legacyDraft.type)
    )

    if (missingDrafts.length === 0) {
      clearLegacyTransactionDrafts()
      hasMigratedLegacyDraftsRef.current = true
      return
    }

    let isCancelled = false

    const migrateLegacyDrafts = async () => {
      try {
        for (const legacyDraft of missingDrafts) {
          if (isCancelled) {
            return
          }

          await saveDraft({
            ...legacyDraft,
            updated_at: null,
          })
        }

        if (!isCancelled) {
          clearLegacyTransactionDrafts()
          hasMigratedLegacyDraftsRef.current = true
          setDraftsStatusText('Przeniesiono starsze szkice do bazy.')
        }
      } catch (error) {
        if (!isCancelled) {
          const message =
            error instanceof Error
              ? error.message
              : 'Nie udało się przenieść starszych szkiców z przeglądarki.'

          setDraftsStatusText(message)
        }
      }
    }

    void migrateLegacyDrafts()

    return () => {
      isCancelled = true
    }
  }, [drafts, draftsStatusText, isDraftsLoading, saveDraft])

  useEffect(() => {
    if (!isTransactionCreatorOpen) {
      return
    }

    const draftType = getDraftTypeForLevel1Id(selectedTransactionTypeId)
    const currentDraftDate = newTransactionDate
    const hasStartedDraft =
      newAmount.trim() !== '' ||
      newDescription.trim() !== '' ||
      (transactionCreatorInitialDate !== null && transactionCreatorInitialDate !== currentDraftDate)

    if (!draftType) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      if (!hasStartedDraft) {
        if (transactionDraftId || getDraftForType(draftType)) {
          void deleteDraft(draftType).catch(() => {})
        }

        return
      }

      const nextDraftId = transactionDraftId || getDraftForType(draftType)?.id || createDraftId()
      const nextDraft: TransactionDraft = {
        id: nextDraftId,
        type: draftType,
        level1_id: selectedTransactionTypeId,
        level2_id: selectedLevel2Id,
        category_id: selectedTransactionCategoryId,
        amount: newAmount,
        description: newDescription,
        date: currentDraftDate,
        updated_at: null,
      }

      void saveDraft(nextDraft).catch(() => {})
    }, DRAFT_SAVE_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    deleteDraft,
    getDraftForType,
    getDraftTypeForLevel1Id,
    isTransactionCreatorOpen,
    newAmount,
    newDescription,
    newTransactionDate,
    saveDraft,
    selectedLevel2Id,
    selectedMonth,
    selectedTransactionCategoryId,
    selectedTransactionTypeId,
    transactionCreatorInitialDate,
    transactionDraftId,
  ])

  return {
    transactionDraftId,
    setTransactionDraftId,
    transactionDraftType,
    setTransactionDraftType,
    drafts,
    draftsStatusText,
    isDraftsLoading,
    isCleaningAllDrafts,
    draftPromptState,
    setDraftPromptState,
    loadDrafts,
    getDraftForType,
    saveDraft,
    deleteDraft,
    cleanupAllDrafts,
    getDraftLevel1Id,
    formatDraftUpdatedAt,
    getDraftLocationLabel,
    applyDraftToTransactionCreator,
  }
}

