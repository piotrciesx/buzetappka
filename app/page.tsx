'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import BudgetHeaderPanel from '../components/BudgetHeaderPanel'
import BulkActionsBar from '../components/BulkActionsBar'
import CategoryMigrationPrompt from '../components/CategoryMigrationPrompt'
import FloatingActionButtons from '../components/FloatingActionButtons'
import HiddenCategoriesPanel from '../components/HiddenCategoriesPanel'
import Level2Section from '../components/Level2Section'
import { SortableLevel1Card, StaticLevel1Card } from '../components/Level1Cards'
import TrashPanel from '../components/TrashPanel'
import TransactionCreatorModal from '../components/TransactionCreatorModal'
import UndoBanner from '../components/UndoBanner'
import {
  LEVEL2_SORT_DIRECTION_STORAGE_KEY,
  LEVEL2_SORT_MODE_STORAGE_KEY,
  LEVEL3_SORT_DIRECTION_STORAGE_KEY,
  LEVEL3_SORT_MODE_STORAGE_KEY,
} from '../lib/budgetPageConstants'
import {
  compareCategoriesForDisplay,
  getCategoryPathLabel,
  isSortDirectionValue,
  isSortModeValue,
  normalizeAmountInput,
  sortCategoriesByName,
  sortCategoriesForDefaultDisplay,
  sortCategoriesForDisplay,
} from '../lib/budgetPageHelpers'
import { budgetPageStyles } from '../lib/budgetPageStyles'
import {
  Category,
  HideMode,
  MoveTarget,
  RestoreMode,
  SortDirection,
  SortMode,
  Transaction,
  TransactionShortcut,
} from '../lib/budgetPageTypes'
import {
  getActiveToForMonth,
  getMonthNumber,
  getMonthStartIso,
  getNextMonthText,
  getPrevMonthText,
} from '../lib/dateUtils'
import {
  getCategoryIdsCoveredByHide,
  getHiddenCategoryLabel,
  isCategoryClosingAfterSelectedMonth,
  isCategoryVisibleInMonth,
} from '../lib/categoryUtils'
import { supabase } from '../lib/supabaseClient'
import {
  getAmountNumber,
  getCountForLevel2,
  getSumForCategory,
  getSumForLevel2,
  getTransactionsForCategoriesFromMonth,
  getTransactionsForCategoryAndMonth,
} from '../lib/transactionUtils'

type TransactionDraftType = 'income' | 'expense'

type TransactionDraft = {
  id: string
  type: TransactionDraftType
  level1_id: string | null
  level2_id: string | null
  category_id: string | null
  amount: string
  description: string
  date: string
  updated_at: string | null
}

type DraftRow = {
  id: string
  profile_id: string
  draft_type: TransactionDraftType
  level1_id: string | null
  level2_id: string | null
  category_id: string | null
  amount: string | null
  description: string | null
  date: string | null
  updated_at: string | null
}

type SupabaseLikeError = {
  code?: string
  message?: string
  details?: string
  hint?: string
}

type UndoAction =
  | {
      type: 'delete'
      label: string
      transactions: Transaction[]
    }
  | {
      type: 'restore'
      label: string
      transactions: Transaction[]
    }
  | {
      type: 'move'
      label: string
      moves: Array<{
        id: string
        fromCategoryId: string
        toCategoryId: string
      }>
    }

type MigrationPromptState = {
  categoryId: string
  mode: HideMode
  hideMonth: string
  transactionIds: string[]
  targetCategoryId: string
  errorText: string
}

const LEGACY_DRAFTS_STORAGE_KEY = 'budget_drafts'
const DRAFT_SAVE_DELAY_MS = 400
const OLD_DRAFT_CLEANUP_DAYS = 90

const draftPromptOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(17, 24, 39, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 1100,
} as const

const draftPromptCardStyle = {
  width: '100%',
  maxWidth: 380,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
} as const

const draftsPanelStyle = {
  marginBottom: 20,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: 16,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
} as const

const draftsListStyle = {
  display: 'grid',
  gap: 12,
} as const

const draftCardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 14,
  background: '#f9fafb',
} as const

const draftMetaGridStyle = {
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  marginTop: 12,
} as const

const createDraftId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `draft-${Date.now()}`
}

const mapDraftRowToDraft = (row: DraftRow): TransactionDraft => {
  return {
    id: row.id,
    type: row.draft_type,
    level1_id: row.level1_id,
    level2_id: row.level2_id,
    category_id: row.category_id,
    amount: row.amount || '',
    description: row.description || '',
    date: row.date || '',
    updated_at: row.updated_at,
  }
}

const extractSupabaseErrorParts = (error: unknown) => {
  if (error instanceof Error) {
    const extendedError = error as Error & SupabaseLikeError

    return {
      message: extendedError.message || 'Nieznany błąd',
      details: extendedError.details || '',
      hint: extendedError.hint || '',
      code: extendedError.code || '',
    }
  }

  if (error && typeof error === 'object') {
    const candidate = error as SupabaseLikeError

    return {
      message: candidate.message || 'Nieznany błąd',
      details: candidate.details || '',
      hint: candidate.hint || '',
      code: candidate.code || '',
    }
  }

  if (typeof error === 'string') {
    return {
      message: error,
      details: '',
      hint: '',
      code: '',
    }
  }

  return {
    message: 'Nieznany błąd',
    details: '',
    hint: '',
    code: '',
  }
}

const formatSupabaseErrorForConsole = (error: unknown) => {
  const { message, details, hint, code } = extractSupabaseErrorParts(error)

  return {
    code: code || '(brak kodu)',
    message,
    details: details || '(brak szczegółów)',
    hint: hint || '(brak podpowiedzi)',
    raw: error,
  }
}

const buildDraftsErrorMessage = (error: unknown, action: 'load' | 'save' | 'delete' | 'cleanup') => {
  const { message, details, hint, code } = extractSupabaseErrorParts(error)
  const normalizedText = `${code} ${message} ${details} ${hint}`.toLowerCase()

  if (
    normalizedText.includes('relation "public.drafts" does not exist') ||
    normalizedText.includes('relation "drafts" does not exist') ||
    normalizedText.includes("could not find the table 'public.drafts'") ||
    normalizedText.includes("could not find the table 'drafts'")
  ) {
    return 'Baza nie ma jeszcze tabeli drafts. Wklej SQL dla drafts w Supabase i odśwież stronę.'
  }

  if (
    normalizedText.includes('there is no unique or exclusion constraint matching the on conflict specification') ||
    normalizedText.includes('42p10') ||
    normalizedText.includes('on conflict')
  ) {
    return 'Baza drafts nie ma unikalności dla profile_id + draft_type. Uruchom SQL tworzący UNIQUE(profile_id, draft_type).'
  }

  if (
    normalizedText.includes('row-level security') ||
    normalizedText.includes('permission denied') ||
    normalizedText.includes('42501') ||
    normalizedText.includes('new row violates row-level security policy')
  ) {
    return 'Baza drafts blokuje dostęp przez RLS lub brak policy. Wgraj policies z SQL dla drafts i zaloguj użytkownika.'
  }

  if (action === 'load') {
    return `Nie udało się pobrać szkiców. ${message}`
  }

  if (action === 'save') {
    return `Nie udało się zapisać szkicu. ${message}`
  }

  if (action === 'delete') {
    return `Nie udało się usunąć szkicu. ${message}`
  }

  return `Nie udało się wyczyścić starych szkiców. ${message}`
}

const readLegacyTransactionDrafts = () => {
  if (typeof window === 'undefined') {
    return [] as TransactionDraft[]
  }

  try {
    const rawValue = window.localStorage.getItem(LEGACY_DRAFTS_STORAGE_KEY)

    if (!rawValue) {
      return [] as TransactionDraft[]
    }

    const parsedValue = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return [] as TransactionDraft[]
    }

    return parsedValue
      .filter((item): item is Omit<TransactionDraft, 'updated_at'> => {
        return (
          !!item &&
          typeof item.id === 'string' &&
          (item.type === 'income' || item.type === 'expense') &&
          (typeof item.level1_id === 'string' || item.level1_id === null) &&
          (typeof item.level2_id === 'string' || item.level2_id === null) &&
          (typeof item.category_id === 'string' || item.category_id === null) &&
          typeof item.amount === 'string' &&
          typeof item.description === 'string' &&
          typeof item.date === 'string'
        )
      })
      .map((item) => ({
        ...item,
        updated_at: null,
      }))
  } catch {
    return [] as TransactionDraft[]
  }
}

const clearLegacyTransactionDrafts = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(LEGACY_DRAFTS_STORAGE_KEY)
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [trashedTransactions, setTrashedTransactions] = useState<Transaction[]>([])
  const [status, setStatus] = useState('Ładowanie...')
  const [errorText, setErrorText] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('2026-04')
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([])
  const [bulkMoveTargetCategoryId, setBulkMoveTargetCategoryId] = useState('')
  const [bulkActionErrorText, setBulkActionErrorText] = useState('')
  const [lastUndoAction, setLastUndoAction] = useState<UndoAction | null>(null)
  const [migrationPromptState, setMigrationPromptState] = useState<MigrationPromptState | null>(
    null
  )

  const [openAddSubcategoryFor, setOpenAddSubcategoryFor] = useState<string | null>(null)
  const [newSubcategoryName, setNewSubcategoryName] = useState('')

  const [isTransactionCreatorOpen, setIsTransactionCreatorOpen] = useState(false)
  const [transactionCreatorSuggestionId, setTransactionCreatorSuggestionId] = useState<
    string | null
  >(null)
  const [transactionCreatorLockedLevel1Id, setTransactionCreatorLockedLevel1Id] = useState<
    string | null
  >(null)
  const [selectedTransactionTypeId, setSelectedTransactionTypeId] = useState<string | null>(null)
  const [selectedLevel2Id, setSelectedLevel2Id] = useState<string | null>(null)
  const [selectedTransactionCategoryId, setSelectedTransactionCategoryId] = useState<
    string | null
  >(null)
  const [newAmount, setNewAmount] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isSerialTransactionCreatorEnabled, setIsSerialTransactionCreatorEnabled] = useState(false)
  const [transactionDraftId, setTransactionDraftId] = useState<string | null>(null)
  const [transactionDraftType, setTransactionDraftType] = useState<TransactionDraftType | null>(null)
  const [transactionCreatorInitialDate, setTransactionCreatorInitialDate] = useState<string | null>(
    null
  )
  const [drafts, setDrafts] = useState<TransactionDraft[]>([])
  const [draftsStatusText, setDraftsStatusText] = useState('')
  const [isDraftsLoading, setIsDraftsLoading] = useState(false)
  const [isCleaningOldDrafts, setIsCleaningOldDrafts] = useState(false)
  const [draftPromptState, setDraftPromptState] = useState<{
    draft: TransactionDraft
    level1Id: string
    type: TransactionDraftType
  } | null>(null)

  const [openLevel1Ids, setOpenLevel1Ids] = useState<string[]>([])
  const [openLevel2Ids, setOpenLevel2Ids] = useState<string[]>([])
  const [openLevel3Ids, setOpenLevel3Ids] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [showHiddenCategories, setShowHiddenCategories] = useState(false)
  const [level2SortMode, setLevel2SortMode] = useState<SortMode>('default')
  const [level2SortDirection, setLevel2SortDirection] = useState<SortDirection>('desc')
  const [level3SortMode, setLevel3SortMode] = useState<SortMode>('default')
  const [level3SortDirection, setLevel3SortDirection] = useState<SortDirection>('desc')
  const [hasHydratedSortPreferences, setHasHydratedSortPreferences] = useState(false)
  const [isReorderingLevel1, setIsReorderingLevel1] = useState(false)
  const [reorderingLevel1Id, setReorderingLevel1Id] = useState<string | null>(null)
  const [reorderingLevel2Id, setReorderingLevel2Id] = useState<string | null>(null)

  const amountInputRef = useRef<HTMLInputElement | null>(null)
  const descriptionInputRef = useRef<HTMLInputElement | null>(null)
  const hasMigratedLegacyDraftsRef = useRef(false)
  const level1Sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  )
  const level2Sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  )

  const profileId = '4d206618-95ba-44e8-989b-90e139314ac9'

  const styles = budgetPageStyles

  const resetTransactionCreator = () => {
    setIsTransactionCreatorOpen(false)
    setTransactionCreatorSuggestionId(null)
    setTransactionCreatorLockedLevel1Id(null)
    setSelectedTransactionTypeId(null)
    setSelectedLevel2Id(null)
    setSelectedTransactionCategoryId(null)
    setNewAmount('')
    setNewDescription('')
    setIsSerialTransactionCreatorEnabled(false)
    setTransactionDraftId(null)
    setTransactionDraftType(null)
    setTransactionCreatorInitialDate(null)
  }

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
      const uiMessage = buildDraftsErrorMessage(error, 'load')

      console.error('Błąd pobierania szkiców', formatSupabaseErrorForConsole(error))
      setDrafts([])
      setDraftsStatusText(uiMessage)
      setIsDraftsLoading(false)
      return
    }

    setDrafts((data || []).map((item) => mapDraftRowToDraft(item as DraftRow)))
    setDraftsStatusText('')
    setIsDraftsLoading(false)
  }, [])

  const loadData = useCallback(async () => {
    setStatus('Ładowanie...')
    setErrorText('')

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, parent_id, level, default_order, sort_order, active_to, reactivate_from')
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (categoriesError) {
      setErrorText(categoriesError.message)
      setStatus('Błąd przy pobieraniu kategorii')
      return
    }

    const nextCategories = sortCategoriesForDisplay(categoriesData || [])
    const firstLevel1Id = nextCategories.find((category) => category.level === 1)?.id || null

    setCategories(nextCategories)
    setOpenLevel1Ids(firstLevel1Id ? [firstLevel1Id] : [])
    setOpenLevel2Ids([])
    setOpenLevel3Ids([])

    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('id, category_id, amount, description, date, created_at, is_deleted, deleted_at')
      .eq('is_deleted', false)
      .order('date', { ascending: false })

    if (transactionsError) {
      setErrorText(transactionsError.message)
      setStatus('Błąd przy pobieraniu wpisów')
      return
    }

    setTransactions(transactionsData || [])

    const { data: trashedTransactionsData, error: trashedTransactionsError } = await supabase
      .from('transactions')
      .select('id, category_id, amount, description, date, created_at, is_deleted, deleted_at')
      .eq('is_deleted', true)
      .order('deleted_at', { ascending: false })

    if (trashedTransactionsError) {
      setErrorText(trashedTransactionsError.message)
      setStatus('Błąd przy pobieraniu kosza')
      return
    }

    setTrashedTransactions(trashedTransactionsData || [])
    await loadDrafts()

    if (!categoriesData || categoriesData.length === 0) {
      setStatus('Brak kategorii z bazy')
      return
    }

    setStatus('OK')
  }, [loadDrafts])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadData])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      const storedLevel2SortMode = window.localStorage.getItem(LEVEL2_SORT_MODE_STORAGE_KEY)
      const storedLevel2SortDirection = window.localStorage.getItem(
        LEVEL2_SORT_DIRECTION_STORAGE_KEY
      )
      const storedLevel3SortMode = window.localStorage.getItem(LEVEL3_SORT_MODE_STORAGE_KEY)
      const storedLevel3SortDirection = window.localStorage.getItem(
        LEVEL3_SORT_DIRECTION_STORAGE_KEY
      )

      if (storedLevel2SortMode && isSortModeValue(storedLevel2SortMode)) {
        setLevel2SortMode(storedLevel2SortMode)
      }

      if (storedLevel2SortDirection && isSortDirectionValue(storedLevel2SortDirection)) {
        setLevel2SortDirection(storedLevel2SortDirection)
      }

      if (storedLevel3SortMode && isSortModeValue(storedLevel3SortMode)) {
        setLevel3SortMode(storedLevel3SortMode)
      }

      if (storedLevel3SortDirection && isSortDirectionValue(storedLevel3SortDirection)) {
        setLevel3SortDirection(storedLevel3SortDirection)
      }

      setHasHydratedSortPreferences(true)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    if (!hasHydratedSortPreferences || typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(LEVEL2_SORT_MODE_STORAGE_KEY, level2SortMode)
    window.localStorage.setItem(LEVEL2_SORT_DIRECTION_STORAGE_KEY, level2SortDirection)
    window.localStorage.setItem(LEVEL3_SORT_MODE_STORAGE_KEY, level3SortMode)
    window.localStorage.setItem(LEVEL3_SORT_DIRECTION_STORAGE_KEY, level3SortDirection)
  }, [
    hasHydratedSortPreferences,
    level2SortMode,
    level2SortDirection,
    level3SortMode,
    level3SortDirection,
  ])

  useEffect(() => {
    const activeTransactionIds = new Set(transactions.map((transaction) => transaction.id))

    setSelectedTransactionIds((prev) => prev.filter((id) => activeTransactionIds.has(id)))
  }, [transactions])

  const visibleCategories = useMemo(() => {
    return categories.filter((category) => isCategoryVisibleInMonth(category, selectedMonth))
  }, [categories, selectedMonth])

  const level1 = useMemo(() => {
    return visibleCategories.filter((category) => category.level === 1)
  }, [visibleCategories])

  const expenseLevel1Id = useMemo(() => {
    return (
      level1.find((category) => category.name.trim().toLowerCase() === 'wydatki')?.id || null
    )
  }, [level1])

  const incomeLevel1Id = useMemo(() => {
    return (
      level1.find((category) => category.name.trim().toLowerCase() === 'przychody')?.id || null
    )
  }, [level1])

  const sortedLevel1 = useMemo(() => {
    return sortCategoriesForDisplay(level1)
  }, [level1])

  const level2 = useMemo(() => {
    return visibleCategories.filter((category) => category.level === 2)
  }, [visibleCategories])

  const level3 = useMemo(() => {
    return visibleCategories.filter((category) => category.level === 3)
  }, [visibleCategories])

  const level2ByParentId = useMemo(() => {
    const grouped = level2.reduce<Record<string, Category[]>>((acc, category) => {
      const parentId = category.parent_id

      if (!parentId) {
        return acc
      }

      if (!acc[parentId]) {
        acc[parentId] = []
      }

      acc[parentId].push(category)
      return acc
    }, {})

    Object.values(grouped).forEach((items) => {
      items.sort(compareCategoriesForDisplay)
    })

    return grouped
  }, [level2])

  const level3ByParentId = useMemo(() => {
    const grouped = level3.reduce<Record<string, Category[]>>((acc, category) => {
      const parentId = category.parent_id

      if (!parentId) {
        return acc
      }

      if (!acc[parentId]) {
        acc[parentId] = []
      }

      acc[parentId].push(category)
      return acc
    }, {})

    Object.values(grouped).forEach((items) => {
      items.sort(compareCategoriesForDisplay)
    })

    return grouped
  }, [level3])

  const hiddenCategoriesInSelectedMonth = useMemo(() => {
    return sortCategoriesForDisplay(
      categories.filter((category) => {
        if (category.level === 1) {
          return false
        }

        return !isCategoryVisibleInMonth(category, selectedMonth)
      })
    )
  }, [categories, selectedMonth])

  const categoriesById = useMemo(() => {
    return categories.reduce<Record<string, Category>>((acc, category) => {
      acc[category.id] = category
      return acc
    }, {})
  }, [categories])

  const getRootLevel1IdForCategory = useCallback((categoryId: string) => {
    let currentCategory = categoriesById[categoryId]

    while (currentCategory?.parent_id) {
      currentCategory = categoriesById[currentCategory.parent_id]
    }

    if (!currentCategory || currentCategory.level !== 1) {
      return null
    }

    return currentCategory.id
  }, [categoriesById])

  const applyTransactionCategorySelection = (categoryId: string) => {
    const selectedCategory = categoriesById[categoryId]

    if (!selectedCategory || selectedCategory.level !== 3 || !selectedCategory.parent_id) {
      return
    }

    const selectedLevel2 = categoriesById[selectedCategory.parent_id]

    if (!selectedLevel2 || selectedLevel2.level !== 2 || !selectedLevel2.parent_id) {
      return
    }

    const selectedLevel1 = categoriesById[selectedLevel2.parent_id]

    if (!selectedLevel1 || selectedLevel1.level !== 1) {
      return
    }

    setSelectedTransactionTypeId(selectedLevel1.id)
    setSelectedLevel2Id(selectedLevel2.id)
    setSelectedTransactionCategoryId(selectedCategory.id)
  }

  const getDraftTypeForLevel1Id = useCallback((level1Id: string | null) => {
    if (!level1Id) {
      return null
    }

    if (level1Id === incomeLevel1Id) {
      return 'income' as const
    }

    if (level1Id === expenseLevel1Id) {
      return 'expense' as const
    }

    return null
  }, [expenseLevel1Id, incomeLevel1Id])

  const getDraftForType = useCallback((draftType: TransactionDraftType) => {
    return drafts.find((draft) => draft.type === draftType) || null
  }, [drafts])

  const saveDraft = useCallback(async (draft: TransactionDraft) => {
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

      console.error('Błąd zapisu szkicu', formatSupabaseErrorForConsole(error))
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
  }, [])

  const deleteDraft = useCallback(async (draftType: TransactionDraftType) => {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('profile_id', profileId)
      .eq('draft_type', draftType)

    if (error) {
      const uiMessage = buildDraftsErrorMessage(error, 'delete')

      console.error('Błąd usuwania szkicu', formatSupabaseErrorForConsole(error))
      setDraftsStatusText(uiMessage)
      throw new Error(uiMessage)
    }

    setDrafts((prev) => prev.filter((draft) => draft.type !== draftType))
    setDraftsStatusText('')

    if (transactionDraftType === draftType) {
      setTransactionDraftId(null)
      setTransactionDraftType(null)
    }
  }, [transactionDraftType])

  const cleanupOldDrafts = async () => {
    if (isCleaningOldDrafts) {
      return
    }

    setIsCleaningOldDrafts(true)

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - OLD_DRAFT_CLEANUP_DAYS)

    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('profile_id', profileId)
      .lt('updated_at', cutoffDate.toISOString())

    if (error) {
      const uiMessage = buildDraftsErrorMessage(error, 'cleanup')

      console.error('Błąd czyszczenia starych szkiców', formatSupabaseErrorForConsole(error))
      setDraftsStatusText(uiMessage)
      setIsCleaningOldDrafts(false)
      return
    }

    setDrafts((prev) =>
      prev.filter((draft) => {
        if (!draft.updated_at) {
          return true
        }

        return draft.updated_at >= cutoffDate.toISOString()
      })
    )
    setDraftsStatusText('Usunięto stare szkice.')
    setIsCleaningOldDrafts(false)
  }

  const getDraftLevel1Id = (draft: TransactionDraft) => {
    if (draft.level1_id && categoriesById[draft.level1_id]?.level === 1) {
      return draft.level1_id
    }

    return draft.type === 'income' ? incomeLevel1Id : expenseLevel1Id
  }

  const formatDraftUpdatedAt = (value: string | null) => {
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
  }

  const getDraftLocationLabel = (draft: TransactionDraft) => {
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
  }

  const applyDraftToTransactionCreator = (draft: TransactionDraft, level1Id: string) => {
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
    setTransactionDraftId(draft.id)
    setTransactionDraftType(draft.type)
    setTransactionCreatorInitialDate(draft.date || `${selectedMonth}-01`)
    setIsTransactionCreatorOpen(true)

    window.setTimeout(() => {
      if (draft.amount.trim()) {
        descriptionInputRef.current?.focus()
        return
      }

      amountInputRef.current?.focus()
    }, 0)
  }

  const openBlankFloatingTransactionCreator = (level1Id: string | null) => {
    setTransactionCreatorSuggestionId(null)
    setTransactionCreatorLockedLevel1Id(level1Id)
    setSelectedTransactionTypeId(level1Id)
    setSelectedLevel2Id(null)
    setSelectedTransactionCategoryId(null)
    setNewAmount('')
    setNewDescription('')
    setIsSerialTransactionCreatorEnabled(false)
    setTransactionDraftId(null)
    setTransactionDraftType(getDraftTypeForLevel1Id(level1Id))
    setTransactionCreatorInitialDate(`${selectedMonth}-01`)
    setIsTransactionCreatorOpen(true)
  }

  const isAllowedMoveTarget = useCallback((transaction: Transaction, targetCategoryId: string) => {
    const sourceCategory = categoriesById[transaction.category_id]
    const targetCategory = categoriesById[targetCategoryId]

    if (!sourceCategory || !targetCategory) {
      return false
    }

    if (sourceCategory.id === targetCategory.id) {
      return false
    }

    if (targetCategory.level === 1) {
      return false
    }

    if (targetCategory.level === 2) {
      const hasLevel3Children = categories.some(
        (category) => category.parent_id === targetCategory.id && category.level === 3
      )

      if (hasLevel3Children) {
        return false
      }
    }

    if (targetCategory.level !== 2 && targetCategory.level !== 3) {
      return false
    }

    const sourceRootId = getRootLevel1IdForCategory(sourceCategory.id)
    const targetRootId = getRootLevel1IdForCategory(targetCategory.id)

    if (!sourceRootId || !targetRootId || sourceRootId !== targetRootId) {
      return false
    }

    const transactionMonth = transaction.date.slice(0, 7)

    if (!isCategoryVisibleInMonth(targetCategory, transactionMonth)) {
      return false
    }

    return true
  }, [categories, categoriesById, getRootLevel1IdForCategory])

  const getMoveTargetsForTransaction = useCallback((transaction: Transaction): MoveTarget[] => {
    return sortCategoriesForDisplay(
      categories.filter((category) => isAllowedMoveTarget(transaction, category.id))
    )
      .map((category) => ({
        id: category.id,
        label: getCategoryPathLabel(category.id, categoriesById),
      }))
  }, [categories, categoriesById, isAllowedMoveTarget])

  const getCommonMoveTargetsForTransactions = useCallback((items: Transaction[]) => {
    if (items.length === 0) {
      return [] as MoveTarget[]
    }

    const moveTargetsPerTransaction = items.map((transaction) => getMoveTargetsForTransaction(transaction))
    const commonTargetIds = moveTargetsPerTransaction.reduce<Set<string>>((acc, moveTargets, index) => {
      const ids = new Set(moveTargets.map((target) => target.id))

      if (index === 0) {
        return ids
      }

      return new Set([...acc].filter((id) => ids.has(id)))
    }, new Set<string>())

    return moveTargetsPerTransaction[0].filter((target) => commonTargetIds.has(target.id))
  }, [getMoveTargetsForTransaction])

  const selectedTransactions = useMemo(() => {
    const selectedIds = new Set(selectedTransactionIds)
    return transactions.filter((transaction) => selectedIds.has(transaction.id))
  }, [selectedTransactionIds, transactions])

  const commonBulkMoveTargets = useMemo(() => {
    return getCommonMoveTargetsForTransactions(selectedTransactions)
  }, [getCommonMoveTargetsForTransactions, selectedTransactions])

  const migrationPromptTransactions = useMemo(() => {
    if (!migrationPromptState) {
      return [] as Transaction[]
    }

    return transactions.filter((transaction) => migrationPromptState.transactionIds.includes(transaction.id))
  }, [migrationPromptState, transactions])

  const migrationPromptMoveTargets = useMemo(() => {
    return getCommonMoveTargetsForTransactions(migrationPromptTransactions)
  }, [getCommonMoveTargetsForTransactions, migrationPromptTransactions])

  const activeTransactionsById = useMemo(() => {
    return transactions.reduce<Record<string, Transaction>>((acc, transaction) => {
      acc[transaction.id] = transaction
      return acc
    }, {})
  }, [transactions])

  const trashedTransactionsById = useMemo(() => {
    return trashedTransactions.reduce<Record<string, Transaction>>((acc, transaction) => {
      acc[transaction.id] = transaction
      return acc
    }, {})
  }, [trashedTransactions])

  const clearTransactionSelection = () => {
    setSelectedTransactionIds([])
    setBulkMoveTargetCategoryId('')
    setBulkActionErrorText('')
  }

  const clearTransactionOperationUi = () => {
    clearTransactionSelection()
    setMigrationPromptState(null)
  }

  const handleCancelCategoryMigration = () => {
    clearTransactionOperationUi()
  }

  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactionIds((prev) => {
      if (prev.includes(transactionId)) {
        return prev.filter((id) => id !== transactionId)
      }

      return [...prev, transactionId]
    })
    setBulkActionErrorText('')
  }

  useEffect(() => {
    if (!bulkMoveTargetCategoryId) {
      return
    }

    const isStillAvailable = commonBulkMoveTargets.some(
      (target) => target.id === bulkMoveTargetCategoryId
    )

    if (!isStillAvailable) {
      setBulkMoveTargetCategoryId('')
    }
  }, [bulkMoveTargetCategoryId, commonBulkMoveTargets])

  useEffect(() => {
    if (!migrationPromptState?.targetCategoryId) {
      return
    }

    const isStillAvailable = migrationPromptMoveTargets.some(
      (target) => target.id === migrationPromptState.targetCategoryId
    )

    if (!isStillAvailable) {
      setMigrationPromptState((prev) =>
        prev
          ? {
              ...prev,
              targetCategoryId: '',
            }
          : null
      )
    }
  }, [migrationPromptMoveTargets, migrationPromptState])

  const addableTransactionCategoryIds = useMemo(() => {
    return new Set(
      visibleCategories
        .filter((category) => category.level === 3)
        .filter((category) => {
          const hasChildren = visibleCategories.some((item) => item.parent_id === category.id)
          return !hasChildren
        })
        .map((category) => category.id)
    )
  }, [visibleCategories])

  const transactionCategoryPathLabels = useMemo(() => {
    const nextLabels: Record<string, string> = {}

    for (const categoryId of addableTransactionCategoryIds) {
      nextLabels[categoryId] = getCategoryPathLabel(categoryId, categoriesById)
    }

    return nextLabels
  }, [addableTransactionCategoryIds, categoriesById])

  const addableTransactionCategoryRootIds = useMemo(() => {
    const nextRootIds: Record<string, string> = {}

    for (const categoryId of addableTransactionCategoryIds) {
      let currentCategory = categoriesById[categoryId]

      while (currentCategory?.parent_id) {
        currentCategory = categoriesById[currentCategory.parent_id]
      }

      const rootId = currentCategory?.level === 1 ? currentCategory.id : null

      if (rootId) {
        nextRootIds[categoryId] = rootId
      }
    }

    return nextRootIds
  }, [addableTransactionCategoryIds, categoriesById])

  const topTransactionShortcutCategoriesByType = useMemo(() => {
    const groupedStats: Record<string, Record<string, { count: number; latestIndex: number }>> = {}

    for (const [index, transaction] of transactions.entries()) {
      const rootId = addableTransactionCategoryRootIds[transaction.category_id]

      if (!rootId) {
        continue
      }

      if (!groupedStats[rootId]) {
        groupedStats[rootId] = {}
      }

      if (!groupedStats[rootId][transaction.category_id]) {
        groupedStats[rootId][transaction.category_id] = { count: 0, latestIndex: index }
      }

      groupedStats[rootId][transaction.category_id].count += 1
      groupedStats[rootId][transaction.category_id].latestIndex = Math.min(
        groupedStats[rootId][transaction.category_id].latestIndex,
        index
      )
    }

    return Object.entries(groupedStats).reduce<Record<string, TransactionShortcut[]>>(
      (acc, [rootId, stats]) => {
        acc[rootId] = Object.entries(stats)
          .sort((a, b) => {
            if (b[1].count !== a[1].count) {
              return b[1].count - a[1].count
            }

            if (a[1].latestIndex !== b[1].latestIndex) {
              return a[1].latestIndex - b[1].latestIndex
            }

            return transactionCategoryPathLabels[a[0]].localeCompare(
              transactionCategoryPathLabels[b[0]]
            )
          })
          .slice(0, 4)
          .map(([categoryId]) => ({
            id: categoryId,
            label: transactionCategoryPathLabels[categoryId],
          }))

        return acc
      },
      {}
    )
  }, [addableTransactionCategoryRootIds, transactionCategoryPathLabels, transactions])

  const recentTransactionShortcutCategoriesByType = useMemo(() => {
    const groupedRecent: Record<string, TransactionShortcut[]> = {}
    const seenByType: Record<string, Set<string>> = {}

    for (const transaction of transactions) {
      const rootId = addableTransactionCategoryRootIds[transaction.category_id]

      if (!rootId) {
        continue
      }

      if (!groupedRecent[rootId]) {
        groupedRecent[rootId] = []
        seenByType[rootId] = new Set<string>()
      }

      if (groupedRecent[rootId].length === 4) {
        continue
      }

      if (seenByType[rootId].has(transaction.category_id)) {
        continue
      }

      seenByType[rootId].add(transaction.category_id)
      groupedRecent[rootId].push({
        id: transaction.category_id,
        label: transactionCategoryPathLabels[transaction.category_id],
      })

      if (groupedRecent[rootId].length === 4) {
        continue
      }
    }

    return groupedRecent
  }, [addableTransactionCategoryRootIds, transactionCategoryPathLabels, transactions])

  const handleReorderLevel3 = async (level2Id: string, activeId: string, overId: string) => {
    if (activeId === overId || reorderingLevel2Id === level2Id) {
      return
    }

    setLevel3SortMode('manual')

    const siblingCategories = sortCategoriesForDisplay(
      categories.filter((category) => category.level === 3 && category.parent_id === level2Id)
    )

    const oldIndex = siblingCategories.findIndex((category) => category.id === activeId)
    const newIndex = siblingCategories.findIndex((category) => category.id === overId)

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return
    }

    const reorderedSiblings = siblingCategories
      .slice()
      .sort(compareCategoriesForDisplay)

    const movedCategory = reorderedSiblings.splice(oldIndex, 1)[0]

    if (!movedCategory) {
      return
    }

    reorderedSiblings.splice(newIndex, 0, movedCategory)

    const updatedSiblings = reorderedSiblings.map((category, index) => ({
      ...category,
      sort_order: index + 1,
    }))

    const updatedById = updatedSiblings.reduce<Record<string, Category>>((acc, category) => {
      acc[category.id] = category
      return acc
    }, {})

    const previousCategories = categories
    const nextCategories = sortCategoriesForDisplay(
      categories.map((category) => updatedById[category.id] || category)
    )

    setCategories(nextCategories)
    setReorderingLevel2Id(level2Id)

    const results = await Promise.all(
      updatedSiblings.map((category) =>
        supabase
          .from('categories')
          .update({ sort_order: category.sort_order })
          .eq('id', category.id)
      )
    )

    const failedUpdate = results.find((result) => result.error)

    if (failedUpdate?.error) {
      setCategories(previousCategories)
      alert(`Błąd zapisu kolejności: ${failedUpdate.error.message}`)
      setReorderingLevel2Id(null)
      return
    }

    setReorderingLevel2Id(null)
  }

  const handleReorderLevel2 = async (level1Id: string, activeId: string, overId: string) => {
    if (activeId === overId || reorderingLevel1Id === level1Id) {
      return
    }

    setLevel2SortMode('manual')

    const siblingCategories = sortCategoriesForDisplay(
      categories.filter((category) => category.level === 2 && category.parent_id === level1Id)
    )

    const oldIndex = siblingCategories.findIndex((category) => category.id === activeId)
    const newIndex = siblingCategories.findIndex((category) => category.id === overId)

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return
    }

    const reorderedSiblings = siblingCategories
      .slice()
      .sort(compareCategoriesForDisplay)

    const movedCategory = reorderedSiblings.splice(oldIndex, 1)[0]

    if (!movedCategory) {
      return
    }

    reorderedSiblings.splice(newIndex, 0, movedCategory)

    const updatedSiblings = reorderedSiblings.map((category, index) => ({
      ...category,
      sort_order: index + 1,
    }))

    const updatedById = updatedSiblings.reduce<Record<string, Category>>((acc, category) => {
      acc[category.id] = category
      return acc
    }, {})

    const previousCategories = categories
    const nextCategories = sortCategoriesForDisplay(
      categories.map((category) => updatedById[category.id] || category)
    )

    setCategories(nextCategories)
    setReorderingLevel1Id(level1Id)

    const results = await Promise.all(
      updatedSiblings.map((category) =>
        supabase
          .from('categories')
          .update({ sort_order: category.sort_order })
          .eq('id', category.id)
      )
    )

    const failedUpdate = results.find((result) => result.error)

    if (failedUpdate?.error) {
      setCategories(previousCategories)
      alert(`Błąd zapisu kolejności: ${failedUpdate.error.message}`)
      setReorderingLevel1Id(null)
      return
    }

    setReorderingLevel1Id(null)
  }

  const handleReorderLevel1 = async (activeId: string, overId: string) => {
    if (activeId === overId || isReorderingLevel1) {
      return
    }

    const siblingCategories = sortCategoriesForDisplay(
      categories.filter((category) => category.level === 1)
    )

    const oldIndex = siblingCategories.findIndex((category) => category.id === activeId)
    const newIndex = siblingCategories.findIndex((category) => category.id === overId)

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return
    }

    const reorderedSiblings = siblingCategories
      .slice()
      .sort(compareCategoriesForDisplay)

    const movedCategory = reorderedSiblings.splice(oldIndex, 1)[0]

    if (!movedCategory) {
      return
    }

    reorderedSiblings.splice(newIndex, 0, movedCategory)

    const updatedSiblings = reorderedSiblings.map((category, index) => ({
      ...category,
      sort_order: index + 1,
    }))

    const updatedById = updatedSiblings.reduce<Record<string, Category>>((acc, category) => {
      acc[category.id] = category
      return acc
    }, {})

    const previousCategories = categories
    const nextCategories = sortCategoriesForDisplay(
      categories.map((category) => updatedById[category.id] || category)
    )

    setCategories(nextCategories)
    setIsReorderingLevel1(true)

    const results = await Promise.all(
      updatedSiblings.map((category) =>
        supabase
          .from('categories')
          .update({ sort_order: category.sort_order })
          .eq('id', category.id)
      )
    )

    const failedUpdate = results.find((result) => result.error)

    if (failedUpdate?.error) {
      setCategories(previousCategories)
      alert(`Błąd zapisu kolejności: ${failedUpdate.error.message}`)
      setIsReorderingLevel1(false)
      return
    }

    setIsReorderingLevel1(false)
  }

  const handleLevel3DragStart = (activeId: string) => {
    const activeCategory = categories.find(
      (category) => category.id === activeId && category.level === 3
    )

    const parentLevel2 = activeCategory?.parent_id
      ? categories.find(
          (category) => category.id === activeCategory.parent_id && category.level === 2
        )
      : null

    const parentLevel1 = parentLevel2?.parent_id
      ? categories.find(
          (category) => category.id === parentLevel2.parent_id && category.level === 1
        )
      : null

    setOpenLevel3Ids([])
    setOpenLevel2Ids(parentLevel2 ? [parentLevel2.id] : [])
    setOpenLevel1Ids(parentLevel1 ? [parentLevel1.id] : [])
  }

  const handleLevel1DragStart = () => {
    setOpenLevel2Ids([])
    setOpenLevel3Ids([])
  }

  const goToPrevMonth = () => {
    setSelectedMonth(getPrevMonthText(selectedMonth))
  }

  const goToNextMonth = () => {
    setSelectedMonth(getNextMonthText(selectedMonth))
  }

  const toggleLevel1 = (id: string) => {
    setOpenLevel1Ids((prev) => {
      const isClosing = prev.includes(id)
      if (isClosing) {
        setOpenLevel2Ids([])
        setOpenLevel3Ids([])
        return []
      }
      setOpenLevel2Ids([])
      setOpenLevel3Ids([])
      return [id]
    })
  }
  const toggleLevel2 = (id: string) => {
    setOpenLevel2Ids((prev) => {
      const isClosing = prev.includes(id)
      setOpenLevel3Ids([])
      if (isClosing) {
        return []
      }
      return [id]
    })
  }
  const toggleLevel3 = (id: string) => {
    setOpenLevel3Ids((prev) => {
      if (prev.includes(id)) {
        return []
      }
      return [id]
    })
  }
  const getTransactionsForCategoryAndMonthForSelectedMonth = (categoryId: string) => {
    return getTransactionsForCategoryAndMonth(transactions, categoryId, selectedMonth)
  }

  const getSumForCategoryForSelectedMonth = (categoryId: string) => {
    return getSumForCategory(transactions, categoryId, selectedMonth)
  }

  const getSumForLevel2ForSelectedMonth = (level2Id: string) => {
    const children = level3ByParentId[level2Id] || []

    if (children.length === 0) {
      return getSumForCategory(transactions, level2Id, selectedMonth)
    }

    const childIds = children.map((child) => child.id)
    return getSumForLevel2(transactions, childIds, selectedMonth)
  }

  const getCountForLevel2ForSelectedMonth = (level2Id: string) => {
    const children = level3ByParentId[level2Id] || []

    if (children.length === 0) {
      return getTransactionsForCategoryAndMonth(transactions, level2Id, selectedMonth).length
    }

    const childIds = children.map((child) => child.id)
    return getCountForLevel2(transactions, childIds, selectedMonth)
  }

  const getCategoryCountForSelectedMonth = (categoryId: string) => {
    return getTransactionsForCategoryAndMonth(transactions, categoryId, selectedMonth).length
  }

  const sortCategoriesForMode = (
    items: Category[],
    mode: SortMode,
    direction: SortDirection,
    getMetricValue: (categoryId: string) => number
  ) => {
    if (mode === 'default') {
      return sortCategoriesForDefaultDisplay(items)
    }

    if (mode === 'manual') {
      return sortCategoriesForDisplay(items)
    }

    if (mode === 'sum' || mode === 'frequency') {
      return [...items].sort((a, b) => {
        const difference =
          direction === 'asc'
            ? getMetricValue(a.id) - getMetricValue(b.id)
            : getMetricValue(b.id) - getMetricValue(a.id)

        if (difference !== 0) {
          return difference
        }

        return a.name.localeCompare(b.name)
      })
    }

    return sortCategoriesByName(items)
  }

  const getSortedLevel2Children = (level1Id: string) => {
    const children = level2ByParentId[level1Id] || []

    if (level2SortMode === 'sum') {
      return sortCategoriesForMode(
        children,
        level2SortMode,
        level2SortDirection,
        getSumForLevel2ForSelectedMonth
      )
    }

    if (level2SortMode === 'frequency') {
      return sortCategoriesForMode(
        children,
        level2SortMode,
        level2SortDirection,
        getCountForLevel2ForSelectedMonth
      )
    }

    return sortCategoriesForMode(children, level2SortMode, level2SortDirection, () => 0)
  }

  const getSortedLevel3Children = (level2Id: string) => {
    const children = level3ByParentId[level2Id] || []

    if (level3SortMode === 'sum') {
      return sortCategoriesForMode(
        children,
        level3SortMode,
        level3SortDirection,
        getSumForCategoryForSelectedMonth
      )
    }

    if (level3SortMode === 'frequency') {
      return sortCategoriesForMode(
        children,
        level3SortMode,
        level3SortDirection,
        getCategoryCountForSelectedMonth
      )
    }

    return sortCategoriesForMode(children, level3SortMode, level3SortDirection, () => 0)
  }

  const sortedLevel2ByParentIdForModal = level1.reduce<Record<string, Category[]>>(
    (acc, category) => {
      acc[category.id] = getSortedLevel2Children(category.id)
      return acc
    },
    {}
  )

  const sortedLevel3ByParentIdForModal = level2.reduce<Record<string, Category[]>>(
    (acc, category) => {
      acc[category.id] = getSortedLevel3Children(category.id)
      return acc
    },
    {}
  )

  const canAddTransactionToCategory = (categoryId: string) => {
    const category = visibleCategories.find((item) => item.id === categoryId)

    if (!category) {
      return false
    }

    const hasChildren = visibleCategories.some((item) => item.parent_id === categoryId)

    if (hasChildren) {
      return false
    }

    return category.level === 3
  }

  const openTransactionCreator = (suggestedCategoryId: string) => {
    setTransactionCreatorSuggestionId(suggestedCategoryId)
    setTransactionCreatorLockedLevel1Id(null)
    applyTransactionCategorySelection(suggestedCategoryId)
    setNewAmount('')
    setNewDescription('')
    setIsSerialTransactionCreatorEnabled(false)
    setIsTransactionCreatorOpen(true)
  }

  const openFloatingTransactionCreator = (level1Id: string | null) => {
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

  const saveTransactionToCategory = async (
    categoryId: string,
    amountText: string,
    descriptionText: string
  ) => {
    if (!canAddTransactionToCategory(categoryId)) {
      throw new Error('invalid-category')
    }

    const value = Number(normalizeAmountInput(amountText))

    if (!value || value <= 0) {
      throw new Error('invalid-amount')
    }

    const monthDate = `${selectedMonth}-01`

    const { data: insertedTransaction, error } = await supabase
      .from('transactions')
      .insert([
        {
          amount: value,
          description: descriptionText.trim() || null,
          category_id: categoryId,
          profile_id: profileId,
          date: monthDate,
        },
      ])
      .select('id, category_id, amount, description, date, created_at, is_deleted, deleted_at')
      .single()

    if (error) {
      throw error
    }

    if (!insertedTransaction) {
      throw new Error('missing-inserted-transaction')
    }

    setTransactions((prev) => [insertedTransaction, ...prev])
    return insertedTransaction
  }

  const handleSaveTransaction = async (shouldCloseAfterSave = false) => {
    if (isSaving) return

    if (!selectedTransactionTypeId) {
      alert('Wybierz typ wpisu')
      return
    }

    if (!selectedLevel2Id) {
      alert('Wybierz kategorię poziomu 2')
      return
    }

    if (!selectedTransactionCategoryId) {
      alert('Wybierz kategorię końcową')
      return
    }

    if (!canAddTransactionToCategory(selectedTransactionCategoryId)) {
      alert('Wpis można dodać tylko do kategorii końcowej, bez dzieci')
      return
    }

    const selectedLevel1Id = getRootLevel1IdForCategory(selectedTransactionCategoryId)
    const selectedCategory = categoriesById[selectedTransactionCategoryId]

    if (!selectedCategory || selectedCategory.parent_id !== selectedLevel2Id) {
      alert('Wybrana kategoria nie pasuje do wybranego poziomu 2')
      return
    }

    if (!selectedLevel1Id || selectedLevel1Id !== selectedTransactionTypeId) {
      alert('Wybrana kategoria nie pasuje do wybranego typu')
      return
    }

    setIsSaving(true)

    try {
      await saveTransactionToCategory(selectedTransactionCategoryId, newAmount, newDescription)
      if (transactionDraftType) {
        await deleteDraft(transactionDraftType)
      }
      setIsSaving(false)
    } catch (error) {
      if (error instanceof Error && error.message === 'invalid-amount') {
        alert('Podaj poprawną kwotę')
      } else if (error instanceof Error && error.message === 'missing-inserted-transaction') {
        alert('Wpis niby został zapisany, ale nie wrócił z bazy')
      } else if (error instanceof Error && 'message' in error) {
        alert(`Błąd zapisu: ${error.message}`)
      }

      setIsSaving(false)
      return
    }

    if (isSerialTransactionCreatorEnabled && !shouldCloseAfterSave) {
      setTransactionCreatorSuggestionId(selectedTransactionCategoryId)
      setNewAmount('')
      setNewDescription('')

      window.setTimeout(() => {
        amountInputRef.current?.focus()
      }, 0)

      return
    }

    resetTransactionCreator()
  }

  const handleInlineSaveTransaction = async (
    categoryId: string,
    amountText: string,
    descriptionText: string
  ) => {
    try {
      await saveTransactionToCategory(categoryId, amountText, descriptionText)
    } catch (error) {
      if (error instanceof Error && error.message === 'invalid-amount') {
        alert('Podaj poprawną kwotę')
        throw error
      }

      if (error instanceof Error && error.message === 'missing-inserted-transaction') {
        alert('Wpis niby został zapisany, ale nie wrócił z bazy')
        throw error
      }

      if (error instanceof Error) {
        alert(`Błąd zapisu: ${error.message}`)
      }

      throw error
    }
  }

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
    const currentDraftDate = `${selectedMonth}-01`
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
    isTransactionCreatorOpen,
    newAmount,
    newDescription,
    selectedLevel2Id,
    selectedMonth,
    selectedTransactionCategoryId,
    selectedTransactionTypeId,
    drafts,
    transactionDraftId,
    transactionCreatorInitialDate,
    deleteDraft,
    incomeLevel1Id,
    expenseLevel1Id,
    getDraftForType,
    getDraftTypeForLevel1Id,
    saveDraft,
  ])

  const handleUpdateTransaction = async (
    transactionId: string,
    amountText: string,
    descriptionText: string
  ) => {
    const value = Number(amountText)

    if (!value || value <= 0) {
      alert('Podaj poprawną kwotę')
      throw new Error('invalid-amount')
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        amount: value,
        description: descriptionText.trim() || null,
      })
      .eq('id', transactionId)

    if (error) {
      alert(`Błąd zapisu: ${error.message}`)
      throw error
    }

    await loadData()
  }

  const softDeleteTransactions = async (
    transactionIds: string[],
    shouldDelete: boolean,
    deletedAtValue: string | null
  ) => {
    if (transactionIds.length === 0) {
      return
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        is_deleted: shouldDelete,
        deleted_at: deletedAtValue,
      })
      .in('id', transactionIds)

    if (error) {
      throw error
    }
  }

  const moveTransactionsToCategory = async (transactionIds: string[], targetCategoryId: string) => {
    if (transactionIds.length === 0) {
      return
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        category_id: targetCategoryId,
      })
      .in('id', transactionIds)

    if (error) {
      throw error
    }
  }

  const handleRestoreTransaction = async (transactionId: string) => {
    const transaction = trashedTransactionsById[transactionId]

    if (!transaction) {
      alert('Nie znaleziono wpisu w koszu')
      return
    }

    try {
      await softDeleteTransactions([transactionId], false, null)
      setLastUndoAction({
        type: 'restore',
        label: 'Przywrócono wpis z kosza.',
        transactions: [transaction],
      })
      clearTransactionOperationUi()
      await loadData()
    } catch (error) {
      if (error instanceof Error) {
        alert(`Błąd przywracania: ${error.message}`)
      }
    }
  }

  const handleMoveTransaction = async (transactionId: string, targetCategoryId: string) => {
    const transaction = activeTransactionsById[transactionId]

    if (!transaction) {
      alert('Nie znaleziono wpisu')
      throw new Error('transaction-not-found')
    }

    if (!targetCategoryId) {
      alert('Wybierz docelową kategorię')
      throw new Error('target-required')
    }

    if (!isAllowedMoveTarget(transaction, targetCategoryId)) {
      alert('Nie można przenieść wpisu do tej kategorii')
      throw new Error('invalid-target')
    }

    try {
      await moveTransactionsToCategory([transactionId], targetCategoryId)
      setLastUndoAction({
        type: 'move',
        label: 'Przeniesiono wpis.',
        moves: [
          {
            id: transaction.id,
            fromCategoryId: transaction.category_id,
            toCategoryId: targetCategoryId,
          },
        ],
      })
      clearTransactionOperationUi()
      await loadData()
    } catch (error) {
      if (error instanceof Error) {
        alert(`Błąd przenoszenia: ${error.message}`)
      }

      throw error
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    const confirmed = confirm('Czy na pewno chcesz usunąć wpis?')

    if (!confirmed) {
      return
    }

    const transaction = activeTransactionsById[transactionId]

    if (!transaction) {
      alert('Nie znaleziono wpisu')
      return
    }

    const deletedAt = new Date().toISOString()

    try {
      await softDeleteTransactions([transactionId], true, deletedAt)
      setLastUndoAction({
        type: 'delete',
        label: 'Usunięto wpis.',
        transactions: [transaction],
      })
      clearTransactionOperationUi()
      await loadData()
    } catch (error) {
      if (error instanceof Error) {
        alert(`Błąd usuwania: ${error.message}`)
      }
    }
  }

  const handleBulkDeleteSelected = async () => {
    if (selectedTransactions.length === 0) {
      return
    }

    const confirmed = confirm(`Czy na pewno chcesz usunąć ${selectedTransactions.length} wpisów?`)

    if (!confirmed) {
      return
    }

    try {
      await softDeleteTransactions(
        selectedTransactions.map((transaction) => transaction.id),
        true,
        new Date().toISOString()
      )
      setLastUndoAction({
        type: 'delete',
        label: `Usunięto ${selectedTransactions.length} wpisów.`,
        transactions: selectedTransactions,
      })
      clearTransactionOperationUi()
      await loadData()
    } catch (error) {
      if (error instanceof Error) {
        setBulkActionErrorText(`Błąd usuwania: ${error.message}`)
      }
    }
  }

  const handleBulkMoveSelected = async () => {
    if (selectedTransactions.length === 0) {
      return
    }

    if (!bulkMoveTargetCategoryId) {
      setBulkActionErrorText('Wybierz kategorię docelową.')
      return
    }

    const isValidForAll = selectedTransactions.every((transaction) =>
      isAllowedMoveTarget(transaction, bulkMoveTargetCategoryId)
    )

    if (!isValidForAll) {
      setBulkActionErrorText(
        'Wybrana kategoria nie jest poprawna dla wszystkich zaznaczonych wpisów.'
      )
      return
    }

    try {
      await moveTransactionsToCategory(
        selectedTransactions.map((transaction) => transaction.id),
        bulkMoveTargetCategoryId
      )
      setLastUndoAction({
        type: 'move',
        label: `Przeniesiono ${selectedTransactions.length} wpisów.`,
        moves: selectedTransactions.map((transaction) => ({
          id: transaction.id,
          fromCategoryId: transaction.category_id,
          toCategoryId: bulkMoveTargetCategoryId,
        })),
      })
      clearTransactionOperationUi()
      await loadData()
    } catch (error) {
      if (error instanceof Error) {
        setBulkActionErrorText(`Błąd przenoszenia: ${error.message}`)
      }
    }
  }

  const handleUndoLastAction = async () => {
    if (!lastUndoAction) {
      return
    }

    try {
      if (lastUndoAction.type === 'delete') {
        await softDeleteTransactions(
          lastUndoAction.transactions.map((transaction) => transaction.id),
          false,
          null
        )
      }

      if (lastUndoAction.type === 'restore') {
        await softDeleteTransactions(
          lastUndoAction.transactions.map((transaction) => transaction.id),
          true,
          new Date().toISOString()
        )
      }

      if (lastUndoAction.type === 'move') {
        for (const move of lastUndoAction.moves) {
          await moveTransactionsToCategory([move.id], move.fromCategoryId)
        }
      }

      setLastUndoAction(null)
      clearTransactionOperationUi()
      await loadData()
    } catch (error) {
      if (error instanceof Error) {
        alert(`Nie udało się cofnąć akcji: ${error.message}`)
      }
    }
  }

  const handleAddSubcategory = async (level2Id: string) => {
    const cleanName = newSubcategoryName.trim()

    if (!cleanName) {
      alert('Podaj nazwę')
      return
    }

    const nextSortOrder =
      categories
        .filter((category) => category.level === 3 && category.parent_id === level2Id)
        .reduce((maxValue, category) => {
          const currentValue = typeof category.sort_order === 'number' ? category.sort_order : 0
          return Math.max(maxValue, currentValue)
        }, 0) + 1

    const { error } = await supabase.from('categories').insert([
      {
        name: cleanName,
        parent_id: level2Id,
        level: 3,
        profile_id: profileId,
        sort_order: nextSortOrder,
        is_active: true,
      },
    ])

    if (error) {
      alert(`Błąd zapisu: ${error.message}`)
      return
    }

    alert('Podkategoria dodana')
    setOpenAddSubcategoryFor(null)
    setNewSubcategoryName('')
    await loadData()
  }

  const performHideCategoryUpdate = async (categoryId: string, mode: HideMode) => {
    const hideMonth = mode === 'now' ? selectedMonth : getNextMonthText(selectedMonth)
    const activeToValue = getActiveToForMonth(hideMonth)

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update({
        active_to: activeToValue,
        reactivate_from: null,
      })
      .eq('id', categoryId)
      .select('id, active_to, reactivate_from')
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!updatedCategory) {
      throw new Error('hide-category-update-missing')
    }

    setOpenAddSubcategoryFor(null)
    setNewSubcategoryName('')
    resetTransactionCreator()
    clearTransactionOperationUi()

    await loadData()

    if (mode === 'now') {
      alert(`Kategoria została ukryta od ${selectedMonth}`)
      return
    }

    alert(`Kategoria została ustawiona do zamknięcia od ${activeToValue.slice(0, 7)}`)
  }

  const handleConfirmCategoryMigration = async () => {
    if (!migrationPromptState) {
      return
    }

    const impactedTransactions = transactions.filter((transaction) =>
      migrationPromptState.transactionIds.includes(transaction.id)
    )
    const commonMoveTargets = getCommonMoveTargetsForTransactions(impactedTransactions)

    if (!migrationPromptState.targetCategoryId) {
      setMigrationPromptState((prev) =>
        prev
          ? {
              ...prev,
              errorText: 'Wybierz kategorię docelową.',
            }
          : null
      )
      return
    }

    if (!commonMoveTargets.some((target) => target.id === migrationPromptState.targetCategoryId)) {
      setMigrationPromptState((prev) =>
        prev
          ? {
              ...prev,
              errorText: 'Wybrana kategoria nie pasuje do wszystkich wpisów.',
            }
          : null
      )
      return
    }

    try {
      await moveTransactionsToCategory(
        migrationPromptState.transactionIds,
        migrationPromptState.targetCategoryId
      )
      setLastUndoAction({
        type: 'move',
        label: `Przeniesiono ${migrationPromptState.transactionIds.length} wpisów przed zmianą kategorii.`,
        moves: migrationPromptState.transactionIds
          .map((transactionId) => activeTransactionsById[transactionId])
          .filter((transaction): transaction is Transaction => !!transaction)
          .map((transaction) => ({
            id: transaction.id,
            fromCategoryId: transaction.category_id,
            toCategoryId: migrationPromptState.targetCategoryId,
          })),
      })
      await performHideCategoryUpdate(migrationPromptState.categoryId, migrationPromptState.mode)
    } catch (error) {
      if (error instanceof Error) {
        setMigrationPromptState((prev) =>
          prev
            ? {
                ...prev,
                errorText: `Nie udało się przenieść wpisów: ${error.message}`,
              }
            : null
        )
      }
    }
  }

  const handleHideCategory = async (categoryId: string, mode: HideMode = 'next') => {
    const category = categories.find((item) => item.id === categoryId)

    if (!category) {
      alert('Nie znaleziono kategorii')
      return
    }

    if (category.level === 1) {
      alert('Nie można ukryć kategorii głównej poziomu 1')
      return
    }

    const hideMonth = mode === 'now' ? selectedMonth : getNextMonthText(selectedMonth)
    const categoryIdsToCheck = getCategoryIdsCoveredByHide(categories, categoryId)
    const blockedTransactions = getTransactionsForCategoriesFromMonth(
      transactions,
      categoryIdsToCheck,
      hideMonth
    )

    if (blockedTransactions.length > 0) {
      clearTransactionSelection()
      setMigrationPromptState({
        categoryId,
        mode,
        hideMonth,
        transactionIds: blockedTransactions.map((transaction) => transaction.id),
        targetCategoryId: '',
        errorText: '',
      })
      return
    }

    const confirmText =
      mode === 'now'
        ? `Czy na pewno chcesz ukryć tę kategorię już w ${selectedMonth}?`
        : 'Czy na pewno chcesz ukryć tę kategorię?\n\nKategoria zamknie się z końcem bieżącego miesiąca.'

    const confirm1 = confirm(confirmText)

    if (!confirm1) {
      return
    }

    try {
      await performHideCategoryUpdate(categoryId, mode)
    } catch (error) {
      if (error instanceof Error && error.message === 'hide-category-update-missing') {
        alert('Nie udało się ukryć kategorii w bazie. Najpewniej update nie przeszedł.')
        return
      }

      if (error instanceof Error) {
        alert(`Błąd ukrywania: ${error.message}`)
      }
    }
  }

  const handleUndoScheduledHide = async (categoryId: string) => {
    const category = categories.find((item) => item.id === categoryId)

    if (!category) {
      alert('Nie znaleziono kategorii')
      return
    }

    if (!isCategoryClosingAfterSelectedMonth(category, selectedMonth)) {
      alert('Ta kategoria nie ma zaplanowanego zamknięcia od następnego miesiąca')
      return
    }

    const confirm1 = confirm('Czy na pewno chcesz cofnąć zaplanowane zamknięcie tej kategorii?')

    if (!confirm1) {
      return
    }

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update({
        active_to: null,
        reactivate_from: null,
      })
      .eq('id', categoryId)
      .select('id, active_to, reactivate_from')
      .maybeSingle()

    if (error) {
      alert(`Błąd cofania zamknięcia: ${error.message}`)
      return
    }

    if (!updatedCategory) {
      alert('Nie udało się cofnąć zamknięcia kategorii w bazie.')
      return
    }

    await loadData()
    alert('Zaplanowane zamknięcie kategorii zostało cofnięte')
  }

  const handleRestoreCategory = async (categoryId: string, mode: RestoreMode = 'now') => {
    const category = categories.find((item) => item.id === categoryId)

    if (!category) {
      alert('Nie znaleziono kategorii')
      return
    }

    if (!category.active_to) {
      alert('Ta kategoria nie jest ustawiona do zamknięcia')
      return
    }

    const targetMonth = mode === 'now' ? selectedMonth : getNextMonthText(selectedMonth)
    const hiddenFromMonth = category.active_to.slice(0, 7)

    if (getMonthNumber(targetMonth) < getMonthNumber(hiddenFromMonth)) {
      alert(`Kategoria może wrócić najwcześniej od ${hiddenFromMonth}`)
      return
    }

    const confirmText =
      mode === 'now'
        ? `Czy na pewno chcesz przywrócić tę kategorię od ${selectedMonth}?`
        : `Czy na pewno chcesz przywrócić tę kategorię od ${targetMonth}?`

    const confirm1 = confirm(confirmText)

    if (!confirm1) {
      return
    }

    const reactivateFromValue = getMonthStartIso(targetMonth)

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update({
        reactivate_from: reactivateFromValue,
      })
      .eq('id', categoryId)
      .select('id, active_to, reactivate_from')
      .maybeSingle()

    if (error) {
      alert(`Błąd ustawiania powrotu: ${error.message}`)
      return
    }

    if (!updatedCategory) {
      alert('Nie udało się ustawić miesiąca powrotu w bazie.')
      return
    }

    setOpenAddSubcategoryFor(null)
    setNewSubcategoryName('')
    resetTransactionCreator()

    await loadData()
    alert(`Kategoria wróci od ${targetMonth}`)
  }

  const renderLevel2Section = (
    level1Category: Category,
    level2Category: Category,
    sortedLevel3Children: Category[],
    isLevel2DndBlocked: boolean
  ) => {
    return (
      <Level2Section
        key={level2Category.id}
        l2={level2Category}
        level3Children={sortedLevel3Children}
        selectedMonth={selectedMonth}
        isClosingAfterSelectedMonth={isCategoryClosingAfterSelectedMonth(
          level2Category,
          selectedMonth
        )}
        openLevel2Ids={openLevel2Ids}
        toggleLevel2={toggleLevel2}
        openLevel3Ids={openLevel3Ids}
        toggleLevel3={toggleLevel3}
        getSumForLevel2={getSumForLevel2ForSelectedMonth}
        getCountForLevel2={getCountForLevel2ForSelectedMonth}
        getSumForCategory={getSumForCategoryForSelectedMonth}
        getTransactionsForCategoryAndMonth={getTransactionsForCategoryAndMonthForSelectedMonth}
        openAddSubcategoryFor={openAddSubcategoryFor}
        setOpenAddSubcategoryFor={setOpenAddSubcategoryFor}
        newSubcategoryName={newSubcategoryName}
        setNewSubcategoryName={setNewSubcategoryName}
        handleAddSubcategory={handleAddSubcategory}
        openTransactionCreator={openTransactionCreator}
        handleInlineSaveTransaction={handleInlineSaveTransaction}
        handleHideCategory={handleHideCategory}
        handleRestoreCategory={handleRestoreCategory}
        handleUndoScheduledHide={handleUndoScheduledHide}
        handleDeleteTransaction={handleDeleteTransaction}
        handleUpdateTransaction={handleUpdateTransaction}
        handleMoveTransaction={handleMoveTransaction}
        selectedTransactionIds={selectedTransactionIds}
        onToggleTransactionSelection={toggleTransactionSelection}
        getMoveTargetsForTransaction={getMoveTargetsForTransaction}
        isSortable={true}
        isDragDisabled={isLevel2DndBlocked}
        level3SortMode={level3SortMode}
        level3SortDirection={level3SortDirection}
        handleLevel3DragStart={handleLevel3DragStart}
        handleReorderLevel3={handleReorderLevel3}
        isReorderingLevel2={reorderingLevel1Id === level1Category.id}
        isReorderingLevel3={reorderingLevel2Id === level2Category.id}
        getCountForCategory={getCategoryCountForSelectedMonth}
        getAmountNumber={getAmountNumber}
        styles={styles}
      />
    )
  }

  const renderLevel2List = (level1Category: Category) => {
    const childrenLevel2 = getSortedLevel2Children(level1Category.id)
    const isLevel2DndBlocked =
      reorderingLevel1Id === level1Category.id ||
      childrenLevel2.some((category) => openLevel2Ids.includes(category.id))

    if (isLevel2DndBlocked) {
      return (
        <div>
          {childrenLevel2.map((level2Category) => {
            const sortedLevel3Children = level3ByParentId[level2Category.id] || []

            return renderLevel2Section(
              level1Category,
              level2Category,
              sortedLevel3Children,
              isLevel2DndBlocked
            )
          })}
        </div>
      )
    }

    return (
      <DndContext
        sensors={level2Sensors}
        collisionDetection={closestCenter}
        onDragEnd={async (event) => {
          const { active, over } = event

          if (!over || active.id === over.id) {
            return
          }

          await handleReorderLevel2(level1Category.id, String(active.id), String(over.id))
        }}
      >
        <SortableContext
          items={childrenLevel2.map((category) => category.id)}
          strategy={verticalListSortingStrategy}
        >
          {childrenLevel2.map((level2Category) => {
            const sortedLevel3Children = level3ByParentId[level2Category.id] || []

            return renderLevel2Section(
              level1Category,
              level2Category,
              sortedLevel3Children,
              isLevel2DndBlocked
            )
          })}
        </SortableContext>
      </DndContext>
    )
  }

  const renderBlockedLevel1DragHandle = (level1Category: Category, isSortable: boolean) => {
    if (!isSortable) {
      return undefined
    }

    return (
      <button
        type="button"
        aria-label={`Przeciągnij kategorię ${level1Category.name}`}
        title="Aby przenosić, najpierw zwiń kategorię"
        style={{
          ...(styles.dragHandle || {}),
          ...(styles.dragHandleDisabled || {}),
          cursor: 'not-allowed',
          opacity: 0.45,
        }}
        disabled={true}
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        ::
      </button>
    )
  }

  const level1Tree = (() => {
    const isLevel1DndBlocked =
      isReorderingLevel1 || sortedLevel1.some((category) => openLevel1Ids.includes(category.id))
    const isLevel1Sortable = sortedLevel1.length > 1

    if (isLevel1DndBlocked) {
      return (
        <div>
          {sortedLevel1.map((level1Category) => {
            const isLevel1Open = openLevel1Ids.includes(level1Category.id)

            return (
              <StaticLevel1Card
                key={level1Category.id}
                level1Category={level1Category}
                isOpen={isLevel1Open}
                onToggle={() => toggleLevel1(level1Category.id)}
                styles={styles}
                dragHandle={renderBlockedLevel1DragHandle(level1Category, isLevel1Sortable)}
              >
                {isLevel1Open ? renderLevel2List(level1Category) : null}
              </StaticLevel1Card>
            )
          })}
        </div>
      )
    }

    return (
      <DndContext
        sensors={level1Sensors}
        collisionDetection={closestCenter}
        onDragStart={() => {
          handleLevel1DragStart()
        }}
        onDragEnd={async (event: DragEndEvent) => {
          const { active, over } = event

          if (!over || active.id === over.id) {
            return
          }

          await handleReorderLevel1(String(active.id), String(over.id))
        }}
      >
        <SortableContext
          items={sortedLevel1.map((category) => category.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedLevel1.map((level1Category) => {
            const isLevel1Open = openLevel1Ids.includes(level1Category.id)

            return (
              <SortableLevel1Card
                key={level1Category.id}
                level1Category={level1Category}
                isOpen={isLevel1Open}
                onToggle={() => toggleLevel1(level1Category.id)}
                isSortable={isLevel1Sortable}
                styles={styles}
              >
                {isLevel1Open ? renderLevel2List(level1Category) : null}
              </SortableLevel1Card>
            )
          })}
        </SortableContext>
      </DndContext>
    )
  })()

  return (
    <main style={styles.page}>
      <div style={styles.pageTitle}>Budżet testowy</div>
      <div style={styles.pageSubtitle}>
        Wersja robocza do wygodniejszego klikania i testowania
      </div>

      <BudgetHeaderPanel
        selectedMonth={selectedMonth}
        status={status}
        categoriesCount={categories.length}
        visibleCategoriesCount={visibleCategories.length}
        transactionsCount={transactions.length}
        hiddenCategoriesCount={hiddenCategoriesInSelectedMonth.length}
        showHiddenCategories={showHiddenCategories}
        errorText={errorText}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onToggleHidden={() => setShowHiddenCategories((prev) => !prev)}
        styles={styles}
      />

      {lastUndoAction && selectedTransactionIds.length === 0 && !migrationPromptState && (
        <UndoBanner
          label={lastUndoAction.label}
          onUndo={handleUndoLastAction}
          styles={styles}
        />
      )}

      {migrationPromptState && (
        <CategoryMigrationPrompt
          categoryLabel={
            migrationPromptState.categoryId
              ? getCategoryPathLabel(migrationPromptState.categoryId, categoriesById)
              : 'Wybrana kategoria'
          }
          modeLabel={migrationPromptState.mode === 'now' ? `ukryj teraz` : 'ukryj od następnego'}
          transactions={migrationPromptTransactions}
          moveTargets={migrationPromptMoveTargets}
          targetCategoryId={migrationPromptState.targetCategoryId}
          errorText={migrationPromptState.errorText}
          getAmountNumber={getAmountNumber}
          getTransactionCategoryLabel={(categoryId) =>
            categoriesById[categoryId]
              ? getCategoryPathLabel(categoryId, categoriesById)
              : 'Kategoria niedostępna'
          }
          onTargetCategoryChange={(value) => {
            setMigrationPromptState((prev) =>
              prev
                ? {
                    ...prev,
                    targetCategoryId: value,
                    errorText: '',
                  }
                : null
            )
          }}
          onConfirm={handleConfirmCategoryMigration}
          onCancel={handleCancelCategoryMigration}
          styles={styles}
        />
      )}

      <BulkActionsBar
        selectedCount={selectedTransactionIds.length}
        targetCategoryId={bulkMoveTargetCategoryId}
        moveTargets={commonBulkMoveTargets}
        errorText={bulkActionErrorText}
        onTargetCategoryChange={(value) => {
          setBulkMoveTargetCategoryId(value)
          setBulkActionErrorText('')
        }}
        onDeleteSelected={handleBulkDeleteSelected}
        onMoveSelected={handleBulkMoveSelected}
        onClearSelection={clearTransactionSelection}
        styles={styles}
      />

      <section style={draftsPanelStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={styles.sectionTitle}>Szkice</div>
            <div style={{ ...styles.pageSubtitle, marginBottom: 0 }}>
              Szkic zapisuje się chwilę po wpisaniu kwoty lub opisu albo po zmianie miesiąca.
              Po finalnym zapisie znika automatycznie.
            </div>
          </div>
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => {
                void cleanupOldDrafts()
              }}
              disabled={isCleaningOldDrafts}
            >
              {isCleaningOldDrafts ? 'Czyszczenie...' : 'Usuń stare szkice'}
            </button>
          </div>
        </div>

        {draftsStatusText && (
          <div style={{ ...styles.infoBox, marginTop: 12 }}>{draftsStatusText}</div>
        )}

        {isDraftsLoading ? (
          <div style={{ ...styles.infoBox, marginTop: 12 }}>Ładowanie szkiców...</div>
        ) : drafts.length === 0 ? (
          <div style={{ ...styles.emptyStateCard, marginTop: 12 }}>
            Nie ma zapisanych szkiców.
          </div>
        ) : (
          <div style={{ ...draftsListStyle, marginTop: 12 }}>
            {drafts.map((draft) => {
              const draftLevel1Id = getDraftLevel1Id(draft)

              return (
                <div key={draft.id} style={draftCardStyle}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 700 }}>
                      {draft.type === 'income' ? 'Przychód' : 'Wydatek'}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 13 }}>
                      Ostatnia zmiana: {formatDraftUpdatedAt(draft.updated_at)}
                    </div>
                  </div>

                  <div style={draftMetaGridStyle}>
                    <div style={styles.infoBox}>
                      <b>Kategoria:</b> {getDraftLocationLabel(draft)}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Kwota:</b> {draft.amount.trim() || 'brak'}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Opis:</b> {draft.description.trim() || 'brak'}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Data:</b> {draft.date || 'brak'}
                    </div>
                  </div>

                  <div style={{ ...styles.actions, marginTop: 12 }}>
                    <button
                      type="button"
                      style={styles.primaryButton}
                      onClick={() => {
                        if (!draftLevel1Id) {
                          return
                        }

                        applyDraftToTransactionCreator(draft, draftLevel1Id)
                      }}
                      disabled={!draftLevel1Id}
                    >
                      Kontynuuj
                    </button>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() => {
                        void deleteDraft(draft.type).catch(() => {})
                      }}
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <div>
        <div style={styles.sectionTitle}>Drzewo kategorii</div>

        <div style={styles.sortBar}>
          <div style={styles.sortGroup}>
            <label htmlFor="level2-sort-mode" style={styles.sortLabel}>
              Sortowanie L2
            </label>
            <select
              id="level2-sort-mode"
              value={level2SortMode}
              onChange={(event) => setLevel2SortMode(event.target.value as SortMode)}
              style={styles.input}
            >
              <option value="default">domyślne</option>
              <option value="manual">ręczne</option>
              <option value="sum">według sumy</option>
              <option value="frequency">według częstotliwości</option>
            </select>

            <label htmlFor="level2-sort-direction" style={styles.sortLabel}>
              Kierunek L2
            </label>
            <select
              id="level2-sort-direction"
              value={level2SortDirection}
              onChange={(event) => setLevel2SortDirection(event.target.value as SortDirection)}
              style={styles.input}
              disabled={level2SortMode !== 'sum' && level2SortMode !== 'frequency'}
            >
              <option value="asc">rosnąco</option>
              <option value="desc">malejąco</option>
            </select>
          </div>

          <div style={styles.sortGroup}>
            <label htmlFor="level3-sort-mode" style={styles.sortLabel}>
              Sortowanie L3
            </label>
            <select
              id="level3-sort-mode"
              value={level3SortMode}
              onChange={(event) => setLevel3SortMode(event.target.value as SortMode)}
              style={styles.input}
            >
              <option value="default">domyślne</option>
              <option value="manual">ręczne</option>
              <option value="sum">według sumy</option>
              <option value="frequency">według częstotliwości</option>
            </select>

            <label htmlFor="level3-sort-direction" style={styles.sortLabel}>
              Kierunek L3
            </label>
            <select
              id="level3-sort-direction"
              value={level3SortDirection}
              onChange={(event) => setLevel3SortDirection(event.target.value as SortDirection)}
              style={styles.input}
              disabled={level3SortMode !== 'sum' && level3SortMode !== 'frequency'}
            >
              <option value="asc">rosnąco</option>
              <option value="desc">malejąco</option>
            </select>
          </div>
        </div>

        {sortedLevel1.length === 0 && (
          <div style={styles.emptyStateCard}>
            Brak widocznych kategorii w wybranym miesiącu
          </div>
        )}

        {level1Tree}
        {false && level1.map((level1Category) => {
          const childrenLevel2 = level2ByParentId[level1Category.id] || []
          const isLevel1Open = openLevel1Ids.includes(level1Category.id)
          const isLevel2DndBlocked =
            reorderingLevel1Id === level1Category.id ||
            childrenLevel2.some((category) => openLevel2Ids.includes(category.id))

          return (
            <div key={level1Category.id} style={styles.l1Card}>
              <div style={styles.l1Header} onClick={() => toggleLevel1(level1Category.id)}>
                <div style={styles.arrow}>{isLevel1Open ? '▼' : '▶'}</div>
                <div>{level1Category.name}</div>
              </div>

              {isLevel1Open &&
                (isLevel2DndBlocked ? (
                  <div>
                    {childrenLevel2.map((level2Category) => (
                      <Level2Section
                        key={level2Category.id}
                        l2={level2Category}
                        level3Children={level3ByParentId[level2Category.id] || []}
                        selectedMonth={selectedMonth}
                        isClosingAfterSelectedMonth={isCategoryClosingAfterSelectedMonth(
                          level2Category,
                          selectedMonth
                        )}
                        openLevel2Ids={openLevel2Ids}
                        toggleLevel2={toggleLevel2}
                        openLevel3Ids={openLevel3Ids}
                        toggleLevel3={toggleLevel3}
                        getSumForLevel2={getSumForLevel2ForSelectedMonth}
                        getCountForLevel2={getCountForLevel2ForSelectedMonth}
                        getSumForCategory={getSumForCategoryForSelectedMonth}
                        getTransactionsForCategoryAndMonth={
                          getTransactionsForCategoryAndMonthForSelectedMonth
                        }
                        openAddSubcategoryFor={openAddSubcategoryFor}
                        setOpenAddSubcategoryFor={setOpenAddSubcategoryFor}
                        newSubcategoryName={newSubcategoryName}
                        setNewSubcategoryName={setNewSubcategoryName}
                        handleAddSubcategory={handleAddSubcategory}
                        openTransactionCreator={openTransactionCreator}
                        handleInlineSaveTransaction={handleInlineSaveTransaction}
                        handleHideCategory={handleHideCategory}
                        handleRestoreCategory={handleRestoreCategory}
                        handleUndoScheduledHide={handleUndoScheduledHide}
                        handleDeleteTransaction={handleDeleteTransaction}
                        handleUpdateTransaction={handleUpdateTransaction}
                        handleMoveTransaction={handleMoveTransaction}
                        selectedTransactionIds={selectedTransactionIds}
                        onToggleTransactionSelection={toggleTransactionSelection}
                        getMoveTargetsForTransaction={getMoveTargetsForTransaction}
                        isSortable={true}
                        isDragDisabled={isLevel2DndBlocked}
                        level3SortMode={level3SortMode}
                        level3SortDirection={level3SortDirection}
                        handleLevel3DragStart={handleLevel3DragStart}
                        handleReorderLevel3={handleReorderLevel3}
                        isReorderingLevel2={reorderingLevel1Id === level1Category.id}
                        isReorderingLevel3={reorderingLevel2Id === level2Category.id}
                        getCountForCategory={getCategoryCountForSelectedMonth}
                        getAmountNumber={getAmountNumber}
                        styles={styles}
                      />
                    ))}
                  </div>
                ) : (
                  <DndContext
                    sensors={level2Sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={async (event) => {
                      const { active, over } = event

                      if (!over || active.id === over.id) {
                        return
                      }

                      await handleReorderLevel2(
                        level1Category.id,
                        String(active.id),
                        String(over.id)
                      )
                    }}
                  >
                    <SortableContext
                      items={childrenLevel2.map((category) => category.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {childrenLevel2.map((level2Category) => (
                        <Level2Section
                          key={level2Category.id}
                          l2={level2Category}
                          level3Children={level3ByParentId[level2Category.id] || []}
                          selectedMonth={selectedMonth}
                          isClosingAfterSelectedMonth={isCategoryClosingAfterSelectedMonth(
                            level2Category,
                            selectedMonth
                          )}
                          openLevel2Ids={openLevel2Ids}
                          toggleLevel2={toggleLevel2}
                          openLevel3Ids={openLevel3Ids}
                          toggleLevel3={toggleLevel3}
                          getSumForLevel2={getSumForLevel2ForSelectedMonth}
                          getCountForLevel2={getCountForLevel2ForSelectedMonth}
                          getSumForCategory={getSumForCategoryForSelectedMonth}
                          getTransactionsForCategoryAndMonth={
                            getTransactionsForCategoryAndMonthForSelectedMonth
                          }
                          openAddSubcategoryFor={openAddSubcategoryFor}
                          setOpenAddSubcategoryFor={setOpenAddSubcategoryFor}
                          newSubcategoryName={newSubcategoryName}
                          setNewSubcategoryName={setNewSubcategoryName}
                          handleAddSubcategory={handleAddSubcategory}
                          openTransactionCreator={openTransactionCreator}
                          handleInlineSaveTransaction={handleInlineSaveTransaction}
                          handleHideCategory={handleHideCategory}
                          handleRestoreCategory={handleRestoreCategory}
                          handleUndoScheduledHide={handleUndoScheduledHide}
                          handleDeleteTransaction={handleDeleteTransaction}
                          handleUpdateTransaction={handleUpdateTransaction}
                          handleMoveTransaction={handleMoveTransaction}
                          selectedTransactionIds={selectedTransactionIds}
                          onToggleTransactionSelection={toggleTransactionSelection}
                          getMoveTargetsForTransaction={getMoveTargetsForTransaction}
                          isSortable={true}
                          isDragDisabled={isLevel2DndBlocked}
                          level3SortMode={level3SortMode}
                          level3SortDirection={level3SortDirection}
                          handleLevel3DragStart={handleLevel3DragStart}
                          handleReorderLevel3={handleReorderLevel3}
                          isReorderingLevel2={reorderingLevel1Id === level1Category.id}
                          isReorderingLevel3={reorderingLevel2Id === level2Category.id}
                          getCountForCategory={getCategoryCountForSelectedMonth}
                          getAmountNumber={getAmountNumber}
                          styles={styles}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ))}
            </div>
          )
        })}
      </div>
      <HiddenCategoriesPanel
        categories={hiddenCategoriesInSelectedMonth}
        categoriesById={categoriesById}
        showHiddenCategories={showHiddenCategories}
        getHiddenCategoryLabel={getHiddenCategoryLabel}
        handleRestoreCategory={handleRestoreCategory}
        styles={styles}
      />

      <TrashPanel
        transactions={trashedTransactions}
        categoriesById={categoriesById}
        getAmountNumber={getAmountNumber}
        onRestoreTransaction={handleRestoreTransaction}
        styles={styles}
      />

      <FloatingActionButtons
        expenseLevel1Id={expenseLevel1Id}
        incomeLevel1Id={incomeLevel1Id}
        onOpenExpense={() => {
          openFloatingTransactionCreator(expenseLevel1Id)
        }}
        onOpenIncome={() => {
          openFloatingTransactionCreator(incomeLevel1Id)
        }}
        styles={styles}
      />

      <TransactionCreatorModal
        isOpen={isTransactionCreatorOpen}
        selectedMonth={selectedMonth}
        level1Categories={level1}
        level2ByParentId={sortedLevel2ByParentIdForModal}
        level3ByParentId={sortedLevel3ByParentIdForModal}
        categoriesById={categoriesById}
        suggestedCategoryId={transactionCreatorSuggestionId}
        lockedLevel1Id={transactionCreatorLockedLevel1Id}
        topShortcutCategories={
          (transactionCreatorLockedLevel1Id
            ? topTransactionShortcutCategoriesByType[transactionCreatorLockedLevel1Id]
            : selectedTransactionTypeId
              ? topTransactionShortcutCategoriesByType[selectedTransactionTypeId]
              : []) || []
        }
        recentShortcutCategories={
          (transactionCreatorLockedLevel1Id
            ? recentTransactionShortcutCategoriesByType[transactionCreatorLockedLevel1Id]
            : selectedTransactionTypeId
              ? recentTransactionShortcutCategoriesByType[selectedTransactionTypeId]
              : []) || []
        }
        onSelectShortcutCategory={applyTransactionCategorySelection}
        selectedLevel1Id={selectedTransactionTypeId}
        setSelectedLevel1Id={setSelectedTransactionTypeId}
        selectedLevel2Id={selectedLevel2Id}
        setSelectedLevel2Id={setSelectedLevel2Id}
        selectedCategoryId={selectedTransactionCategoryId}
        setSelectedCategoryId={setSelectedTransactionCategoryId}
        isSerialModeEnabled={isSerialTransactionCreatorEnabled}
        setIsSerialModeEnabled={setIsSerialTransactionCreatorEnabled}
        amount={newAmount}
        setAmount={setNewAmount}
        description={newDescription}
        setDescription={setNewDescription}
        isSaving={isSaving}
        onClose={resetTransactionCreator}
        onSave={handleSaveTransaction}
        onSaveAndClose={async () => {
          await handleSaveTransaction(true)
        }}
        amountInputRef={amountInputRef}
        descriptionInputRef={descriptionInputRef}
        styles={styles}
      />

      {draftPromptState && (
        <div
          style={draftPromptOverlayStyle}
          onClick={() => {
            setDraftPromptState(null)
          }}
        >
          <div style={draftPromptCardStyle} onClick={(event) => event.stopPropagation()}>
            <div style={styles.sectionTitle}>Masz niedokończony wpis</div>
            <div style={{ ...styles.pageSubtitle, marginTop: 8 }}>
              Możesz wrócić do wersji roboczej albo ją usunąć i zacząć od pustego formularza.
            </div>
            <div style={{ ...styles.actions, marginTop: 16 }}>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={() => {
                  applyDraftToTransactionCreator(
                    draftPromptState.draft,
                    draftPromptState.level1Id
                  )
                  setDraftPromptState(null)
                }}
              >
                Kontynuuj
              </button>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => {
                  const { level1Id, type } = draftPromptState

                  void (async () => {
                    await deleteDraft(type)
                    setDraftPromptState(null)
                    openBlankFloatingTransactionCreator(level1Id)
                  })().catch(() => {})
                }}
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

