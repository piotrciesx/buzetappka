'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BudgetPageMainPanels, { type BudgetUtilityPanel } from './BudgetPageMainPanels'
import DashboardPanel from './DashboardPanel'
import BudgetPageOverlays from './BudgetPageOverlays'
import BudgetPageStatusPanels from './BudgetPageStatusPanels'
import BudgetLimitEditorModal from './BudgetLimitEditorModal'
import BudgetLimitAlertsPanel from './BudgetLimitAlertsPanel'
import ProfileMembersPanel from './ProfileMembersPanel'
import ProfileMonthNotePanel from './ProfileMonthNotePanel'
import type { BudgetLimitView } from './BudgetLimitIndicator'
import { useTransactionOperations } from '../lib/useTransactionOperations'
import { useTransactionCreatorOpeners } from '../lib/useTransactionCreatorOpeners'
import { useCategoryVisibilityActions } from '../lib/useCategoryVisibilityActions'
import { useTransactionEntryActions } from '../lib/useTransactionEntryActions'
import { getCategoryPathLabel } from '../lib/budgetPageHelpers'
import { budgetPageStyles } from '../lib/budgetPageStyles'
import { useRecurringTransactionCreator } from '../lib/useRecurringTransactionCreator'
import {
  Category,
  HideMode,
  Tag,
  Transaction,
  TransactionPaymentSplit,
} from '../lib/budgetPageTypes'
import { useSelectedMonthTransactions } from '../lib/useSelectedMonthTransactions'
import { useBudgetPageDrafts } from '../lib/useBudgetPageDrafts'
import { getHiddenCategoryLabel } from '../lib/categoryUtils'
import { supabase } from '../lib/supabaseClient'
import { getAmountNumber } from '../lib/transactionUtils'
import { useBudgetMonthNavigation } from '../lib/useBudgetMonthNavigation'
import { useBudgetTreeSorting } from '../lib/useBudgetTreeSorting'
import { useHeatmap } from '../lib/useHeatmap'
import { useBudgetCategoryTreeData } from '../lib/useBudgetCategoryTreeData'
import { useBudgetTreeUiState } from '../lib/useBudgetTreeUiState'
import { useBudgetTreeMetrics } from '../lib/useBudgetTreeMetrics'
import { useTransactionShortcutData } from '../lib/useTransactionShortcutData'
import { useBudgetPageActions } from '../lib/useBudgetPageActions'
import { useBudgetMoveTargetsData } from '../lib/useBudgetMoveTargetsData'
import { useBankSearch } from '../lib/useBankSearch'
import { useHiddenDescriptionSuggestions } from '../lib/useHiddenDescriptionSuggestions'
import { usePaymentSources } from '../lib/usePaymentSources'
import { useTransactionPaymentSourceSelection } from '../lib/useTransactionPaymentSourceSelection'
import { canCreateTransactionsInMonth } from '../lib/transactionCreationAvailability'
import { useRecurringTransactions } from '../lib/useRecurringTransactions'
import {
  getMonthCycleDate,
  getRecurringDisplayLabel,
  isRecurringExpectedInMonth,
} from '../lib/recurringTransactions'
import { useFinancialGoals } from '../lib/useFinancialGoals'
import { useBudgetLimits } from '../lib/useBudgetLimits'
import type { SaveBudgetLimitInput } from '../lib/useBudgetLimits'
import { isAllowedMoveTarget as checkIsAllowedMoveTarget } from '../lib/isAllowedMoveTarget'
import { useBudgetPageData } from '../lib/useBudgetPageData'
import { useRecurringOptions } from '../lib/useRecurringOptions'
import { useOpenSearchForTag } from '../lib/useOpenSearchForTag'
import { useBudgetPageOverlayProps } from '../lib/useBudgetPageOverlayProps'
import { useAppModuleVisibility } from '../lib/useAppModuleVisibility'
import { getNextMonthText, getPrevMonthText } from '../lib/dateUtils'
import { filterTransactionsByBudgetStartDate } from '../lib/transactionScope'
import { downloadProfileBackupCsv, downloadProfileBackupJson } from '../lib/exportBackup'
import { useBudgetAppEffects } from './budget-app/useBudgetAppEffects'
import { createPaymentSplitItemsFromStoredSplits } from '../lib/paymentSplitUtils'

type MigrationPromptState = {
  categoryId: string
  mode: HideMode
  hideMonth: string
  transactionIds: string[]
  targetCategoryId: string
  errorText: string
}

const GLOBAL_BUDGET_LIMIT_KEY = '__global__'

const getBudgetLimitKey = (categoryId: string | null) => categoryId || GLOBAL_BUDGET_LIMIT_KEY

export type BudgetAppProps = {
  profileId: string
  userId: string
  userEmail: string
  signOut: () => Promise<void>
  inviteEmail: string
  setInviteEmail: (value: string) => void
  inviteLink: string
  invitationStatusText: string
  invitationErrorText: string
  isInvitationWorking: boolean
  createInvitation: () => Promise<void>
  copyInviteLink: () => Promise<void>
  onCurrentUserLeftProfile: () => Promise<void>
}

export default function BudgetAppController({
  profileId,
  userId,
  userEmail,
  signOut,
  inviteEmail,
  setInviteEmail,
  inviteLink,
  invitationStatusText,
  invitationErrorText,
  isInvitationWorking,
  createInvitation,
  copyInviteLink,
  onCurrentUserLeftProfile,
}: BudgetAppProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [trashedTransactions, setTrashedTransactions] = useState<Transaction[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [transactionTagsMap, setTransactionTagsMap] = useState<Record<string, Tag[]>>({})
  const [status, setStatus] = useState('Ładowanie...')
  const [errorText, setErrorText] = useState('')
  const [migrationPromptState, setMigrationPromptState] = useState<MigrationPromptState | null>(
    null
  )
  const [budgetLimitEditorCategoryId, setBudgetLimitEditorCategoryId] = useState<
    string | null | undefined
  >(undefined)

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
  const [newTransactionDate, setNewTransactionDate] = useState<string>('')
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([])
  const [selectedPaymentSourceId, setSelectedPaymentSourceId] = useState('')
  const [selectedPaymentSplitItems, setSelectedPaymentSplitItems] = useState<
    Array<{ paymentSourceId: string; amount: string }>
  >([])
  const [selectedRecurringTransactionId, setSelectedRecurringTransactionId] = useState('')
  const [isSerialTransactionCreatorEnabled, setIsSerialTransactionCreatorEnabled] = useState(false)
  const [isQuickDayModeEnabled, setIsQuickDayModeEnabled] = useState(false)
  const [quickDayDate, setQuickDayDate] = useState('')
  const [pinnedCategoryIds, setPinnedCategoryIds] = useState<string[]>(() => {
    if (!profileId || typeof window === 'undefined') {
      return []
    }

    const storedValue = window.localStorage.getItem(`budget-app-pinned-categories-${profileId}`)
    if (!storedValue) {
      return []
    }

    try {
      const parsedValue = JSON.parse(storedValue)
      return Array.isArray(parsedValue) ? parsedValue.filter(Boolean) : []
    } catch {
      return []
    }
  })
  const [transactionCreatorInitialDate, setTransactionCreatorInitialDate] = useState<string | null>(
    null
  )

  const [isSaving, setIsSaving] = useState(false)
  const [showHiddenCategories, setShowHiddenCategories] = useState(false)
  const [transactionPaymentSplitsMap, setTransactionPaymentSplitsMap] = useState<
    Record<string, TransactionPaymentSplit[]>
  >({})
  const [isPreviousMonthCloseReminderHidden, setIsPreviousMonthCloseReminderHidden] =
    useState(false)
  const [currentDayOfMonth, setCurrentDayOfMonth] = useState<number | null>(null)

  const amountInputRef = useRef<HTMLInputElement | null>(null)
  const descriptionInputRef = useRef<HTMLInputElement | null>(null)
  const searchPanelRef = useRef<HTMLDivElement | null>(null)

  const styles = budgetPageStyles
  const [isSettingsPanelVisible, setIsSettingsPanelVisible] = useState(false)
  const [activeUtilityPanel, setActiveUtilityPanel] = useState<BudgetUtilityPanel>(null)
  const [isDashboardPanelOpen, setIsDashboardPanelOpen] = useState(false)
  const {
    visibleModules,
    draftVisibleModules,
    saveStatusText: moduleVisibilitySaveStatusText,
    setDraftModuleVisibility,
    saveVisibleModules,
    resetDraftVisibleModules,
  } = useAppModuleVisibility({ profileId, userId })

  const {
    selectedMonth,
    setSelectedMonth,
    currentMonth,
    monthNavigationStartMonth,
    setMonthNavigationStartMonth,
    budgetStartDate,
    savedBudgetStartDate,
    setBudgetStartDate,
    isFutureMonthNavigationLocked,
    setIsFutureMonthNavigationLocked,
    simpleMode,
    setSimpleMode,
    calendarHeatmapVariant,
    setCalendarHeatmapVariant,
    heatmapMode,
    setHeatmapMode,
    heatmapInverted,
    setHeatmapInverted,
    autoExcludePartialMonths,
    setAutoExcludePartialMonths,
    isSavingMonthNavigationSettings,
    monthNavigationErrorText,
    setMonthNavigationErrorText,
    lockedMonthsSet,
    excludedMonthsSet,
    isUpdatingSelectedMonthLock,
    isSelectedMonthLocked,
    isUpdatingSelectedMonthExclusion,
    isSelectedMonthExcluded,
    minAllowedMonth,
    maxAllowedMonth,
    isPrevMonthNavigationBlocked,
    isNextMonthNavigationBlocked,
    loadMonthNavigationSettings,
    loadLockedMonths,
    loadExcludedMonths,
    handleSaveMonthNavigationSettings,
    handleLockSelectedMonth,
    handleUnlockSelectedMonth,
    handleToggleSelectedMonthExcluded,
    handleLockAllPastMonths,
    handleUnlockAllPastMonths,
    handleLockMonth,
    goToPrevMonth,
    goToNextMonth,
  } = useBudgetMonthNavigation({ profileId })

  const effectiveQuickDayDate = quickDayDate.startsWith(selectedMonth) ? quickDayDate : ''

  useEffect(() => {
    if (
      !isTransactionCreatorOpen ||
      !isQuickDayModeEnabled ||
      !effectiveQuickDayDate ||
      newTransactionDate
    ) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setNewTransactionDate(effectiveQuickDayDate)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    effectiveQuickDayDate,
    isQuickDayModeEnabled,
    isTransactionCreatorOpen,
    newTransactionDate,
  ])

  useEffect(() => {
    const selector = 'details[data-floating-dropdown="true"]'

    const closeOtherDropdowns = (currentDropdown: HTMLDetailsElement) => {
      document.querySelectorAll<HTMLDetailsElement>(selector).forEach((dropdown) => {
        if (dropdown !== currentDropdown) {
          dropdown.open = false
        }
      })
    }

    const handleToggle = (event: Event) => {
      const dropdown = event.target instanceof HTMLDetailsElement ? event.target : null

      if (!dropdown?.matches(selector) || !dropdown.open) {
        return
      }

      closeOtherDropdowns(dropdown)
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Node ? event.target : null

      if (!target) {
        return
      }

      document.querySelectorAll<HTMLDetailsElement>(selector).forEach((dropdown) => {
        if (!dropdown.contains(target)) {
          dropdown.open = false
        }
      })
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      document.querySelectorAll<HTMLDetailsElement>(selector).forEach((dropdown) => {
        dropdown.open = false
      })
    }

    document.addEventListener('toggle', handleToggle, true)
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('toggle', handleToggle, true)
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const effectiveVisibleModules = useMemo(
    () =>
      simpleMode
        ? {
            ...visibleModules,
            paymentSources: false,
            recurringTransactions: false,
            financialGoals: false,
            budgetLimits: false,
          }
        : visibleModules,
    [simpleMode, visibleModules]
  )
  const isPaymentSourcesModuleEnabled = effectiveVisibleModules.paymentSources
  const isRecurringTransactionsModuleEnabled = effectiveVisibleModules.recurringTransactions
  const isMonthCalendarModuleEnabled = effectiveVisibleModules.monthCalendar
  const isBudgetLimitsModuleEnabled = effectiveVisibleModules.budgetLimits

  const scopedTransactions = useMemo(
    () => filterTransactionsByBudgetStartDate(transactions, budgetStartDate),
    [budgetStartDate, transactions]
  )

  const {
    selectedTransactionIds,
    setSelectedTransactionIds,
    bulkMoveTargetCategoryId,
    setBulkMoveTargetCategoryId,
    bulkActionErrorText,
    setBulkActionErrorText,
    lastUndoAction,
    setLastUndoAction,
    clearTransactionSelection,
    clearTransactionOperationUi,
    toggleTransactionSelection,
    guardMonthUnlocked,
    guardTransactionsUnlocked,
    handleBulkDeleteSelected,
    handleBulkMoveSelected,
    handleUndoLastAction,
  } = useTransactionOperations({
    lockedMonthsSet,
    setMigrationPromptState,
  })

  const selectedMonthTransactions = useSelectedMonthTransactions({
    transactions: scopedTransactions,
    selectedMonth,
  })

  const {
    visibleCategories,
    level1,
    level2,
    expenseLevel1Id,
    incomeLevel1Id,
    sortedLevel1,
    level2ByParentId,
    level3ByParentId,
    hiddenCategoriesInSelectedMonth,
    categoriesById,
  } = useBudgetCategoryTreeData({
    categories,
    selectedMonth,
  })

  const firstVisibleLevel1Id = useMemo(() => {
    return sortedLevel1[0]?.id || null
  }, [sortedLevel1])

  const {
    openLevel1Ids,
    openLevel1CalendarIds,
    openLevel2Ids,
    openLevel3Ids,
    setOpenLevel1Ids,
    setOpenLevel2Ids,
    setOpenLevel3Ids,
    resetTreeOpenState,
    toggleLevel1,
    toggleLevel2,
    toggleLevel3,
    toggleLevel1Calendar,
  } = useBudgetTreeUiState({
    initialOpenLevel1Id: firstVisibleLevel1Id,
  })

  const {
    handleResetHeatmapSettings,
    getRootLevel1IdForCategory,
    getSignedAmountForTransaction,
    getCalendarHeatmapVariantForLevel1Id,
  } = useHeatmap({
    categoriesById,
    incomeLevel1Id,
    expenseLevel1Id,
    heatmapMode,
    setHeatmapMode,
    heatmapInverted,
    setHeatmapInverted,
  })

  const {
    activeLimits: activeBudgetLimits,
    activeLimitStates,
    activeAlerts: activeBudgetLimitAlerts,
    loadBudgetLimits,
    addBudgetLimit,
    updateBudgetLimit,
    deleteBudgetLimit,
  } = useBudgetLimits({
    profileId,
    selectedMonth,
    categoriesById,
    expenseLevel1Id,
    transactions: scopedTransactions,
    excludedMonthsSet,
    getSignedAmountForTransaction,
  })

  const canCreateTransactions = canCreateTransactionsInMonth(isSelectedMonthLocked)

  const {
    searchState: bankSearchState,
    handleFieldChange: handleBankSearchFieldChange,
    toggleTagId: handleBankSearchToggleTagId,
    resetSearch: resetBankSearch,
    results: bankSearchResults,
    summary: bankSearchSummary,
    categoryOptions: bankSearchCategoryOptions,
    tagOptions: bankSearchTagOptions,
    isPanelOpen: isBankSearchOpen,
    setIsPanelOpen: setIsBankSearchOpen,
  } = useBankSearch({
    profileId,
    transactions: scopedTransactions,
    categories,
    categoriesById,
    getSignedAmountForTransaction,
    transactionPaymentSplitsMap: isPaymentSourcesModuleEnabled ? transactionPaymentSplitsMap : {},
    tags,
    transactionTagsMap,
  })

  const { handleOpenSearchForTag } = useOpenSearchForTag({
    searchPanelRef,
    setIsBankSearchOpen,
    handleBankSearchFieldChange,
  })

  useEffect(() => {
    if (!isPaymentSourcesModuleEnabled && bankSearchState.paymentSourceId) {
      handleBankSearchFieldChange('paymentSourceId', '')
    }
  }, [bankSearchState.paymentSourceId, handleBankSearchFieldChange, isPaymentSourcesModuleEnabled])

  const {
    getTransactionsForLevel1AndMonth,
    getTransactionsForCategoryAndMonthForSelectedMonth,
    getSumForCategoryForSelectedMonth,
    getSumForLevel2ForSelectedMonth,
    getCountForLevel2ForSelectedMonth,
    getCategoryCountForSelectedMonth,
  } = useBudgetTreeMetrics({
    transactions: scopedTransactions,
    categories,
    selectedMonth,
    level3ByParentId,
  })

  const {
    addableTransactionCategoryIds,
    transactionCategoryPathLabels,
    topTransactionShortcutCategoriesByType,
    recentTransactionShortcutCategoriesByType,
    descriptionSuggestions: baseDescriptionSuggestions,
  } = useTransactionShortcutData({
    visibleCategories,
    categoriesById,
    transactions: scopedTransactions,
  })

  const {
    descriptionSuggestions,
    handleDeleteDescriptionSuggestion,
    restoreDescriptionSuggestion,
  } = useHiddenDescriptionSuggestions({
    profileId,
    baseDescriptionSuggestions,
  })

  const applyTransactionCategorySelection = useCallback(
    (categoryId: string) => {
      const selectedCategory = categoriesById[categoryId]

      if (!selectedCategory) {
        return
      }

      if (selectedCategory.level === 1) {
        setSelectedTransactionTypeId(selectedCategory.id)
        setSelectedLevel2Id(null)
        setSelectedTransactionCategoryId(selectedCategory.id)
        return
      }

      if (selectedCategory.level === 2 && selectedCategory.parent_id) {
        const selectedLevel1 = categoriesById[selectedCategory.parent_id]

        if (!selectedLevel1 || selectedLevel1.level !== 1) {
          return
        }

        setSelectedTransactionTypeId(selectedLevel1.id)
        setSelectedLevel2Id(selectedCategory.id)
        setSelectedTransactionCategoryId(selectedCategory.id)
        return
      }

      if (selectedCategory.level !== 3 || !selectedCategory.parent_id) {
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
    },
    [categoriesById]
  )

  const {
    paymentSources,
    paymentSourceOptions,
    incomePaymentSourceOptions,
    expensePaymentSourceOptions,
    paymentSourceStats,
    paymentSourceSettings,
    loadPaymentSources,
    savePaymentSource,
    deletePaymentSource,
    setDefaultPaymentSource,
    setPaymentSourceFieldVisibility,
    copyPaymentSourcesBetweenKinds,
  } = usePaymentSources({
    profileId,
    transactions: scopedTransactions,
    transactionPaymentSplitsMap,
    categoriesById,
    incomeLevel1Id,
    expenseLevel1Id,
    getRootLevel1IdForCategory,
    getAmountNumber,
    onDeletedSelectedPaymentSource: (paymentSourceId) => {
      if (selectedPaymentSourceId === paymentSourceId) {
        setSelectedPaymentSourceId('')
      }
    },
  })

  const {
    bankSearchPaymentSourceOptions,
    getPaymentSourceKindForLevel1Id,
    getPaymentSourceOptionsForCategoryId,
    currentTransactionCreatorKind,
    currentTransactionCreatorPaymentSourceOptions,
    currentTransactionCreatorDefaultPaymentSourceId,
    isTransactionCreatorPaymentSourceVisible,
    setSelectedTransactionTypeIdWithPaymentSource,
  } = useTransactionPaymentSourceSelection({
    expenseLevel1Id,
    incomeLevel1Id,
    paymentSources: isPaymentSourcesModuleEnabled ? paymentSources : [],
    paymentSourceOptions: isPaymentSourcesModuleEnabled ? paymentSourceOptions : [],
    incomePaymentSourceOptions: isPaymentSourcesModuleEnabled ? incomePaymentSourceOptions : [],
    expensePaymentSourceOptions: isPaymentSourcesModuleEnabled ? expensePaymentSourceOptions : [],
    paymentSourceSettings: isPaymentSourcesModuleEnabled
      ? paymentSourceSettings
      : {
          ...paymentSourceSettings,
          defaultIncomePaymentSourceId: null,
          defaultExpensePaymentSourceId: null,
          showIncomePaymentSource: false,
          showExpensePaymentSource: false,
        },
    selectedTransactionTypeId,
    transactionCreatorLockedLevel1Id,
    getRootLevel1IdForCategory,
    setSelectedPaymentSourceId,
    setSelectedTransactionTypeId,
  })

  useEffect(() => {
    if (!profileId || typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      `budget-app-pinned-categories-${profileId}`,
      JSON.stringify(pinnedCategoryIds)
    )
  }, [pinnedCategoryIds, profileId])

  const togglePinnedCategory = useCallback((categoryId: string) => {
    setPinnedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((item) => item !== categoryId)
        : [categoryId, ...prev].slice(0, 12)
    )
  }, [])

  const pinnedTransactionShortcutCategoriesByType = useMemo(() => {
    return pinnedCategoryIds.reduce<Record<string, Array<{ id: string; label: string }>>>(
      (acc, categoryId) => {
        if (!addableTransactionCategoryIds.has(categoryId)) {
          return acc
        }

        const rootId = getRootLevel1IdForCategory(categoryId)
        const label = transactionCategoryPathLabels[categoryId]

        if (!rootId || !label) {
          return acc
        }

        acc[rootId] = [...(acc[rootId] || []), { id: categoryId, label }]
        return acc
      },
      {}
    )
  }, [
    addableTransactionCategoryIds,
    getRootLevel1IdForCategory,
    pinnedCategoryIds,
    transactionCategoryPathLabels,
  ])

  const getDefaultPaymentSourceIdForCategoryId = useCallback(
    (categoryId: string) => {
      if (!isPaymentSourcesModuleEnabled) {
        return ''
      }

      const rootLevel1Id = getRootLevel1IdForCategory(categoryId)
      const kind = getPaymentSourceKindForLevel1Id(rootLevel1Id)

      if (kind === 'income') {
        return paymentSourceSettings.showIncomePaymentSource
          ? paymentSourceSettings.defaultIncomePaymentSourceId || ''
          : ''
      }

      if (kind === 'expense') {
        return paymentSourceSettings.showExpensePaymentSource
          ? paymentSourceSettings.defaultExpensePaymentSourceId || ''
          : ''
      }

      return ''
    },
    [
      getPaymentSourceKindForLevel1Id,
      getRootLevel1IdForCategory,
      isPaymentSourcesModuleEnabled,
      paymentSourceSettings,
    ]
  )

  const {
    recurringTransactions,
    recurringExecutions,
    recurringReminderMonthStatuses,
    loadRecurringTransactions,
    saveRecurringTransaction,
    deleteRecurringTransaction,
    saveRecurringReminderMonthStatus,
  } = useRecurringTransactions({
    profileId,
    selectedMonth,
  })

  const {
    financialGoals,
    financialGoalPriorities,
    financialGoalMonthConfigs,
    loadFinancialGoals,
    saveFinancialGoal,
    deleteFinancialGoal,
    setGoalModeForMonth,
    saveGoalPrioritiesForMonth,
    saveGoalAllocationsForMonth,
  } = useFinancialGoals({
    profileId,
  })

  const getDraftTypeForLevel1Id = useCallback(
    (level1Id: string | null) => {
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
    },
    [expenseLevel1Id, incomeLevel1Id]
  )

  const {
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
    deleteDraft,
    cleanupAllDrafts,
    getDraftLevel1Id,
    formatDraftUpdatedAt,
    getDraftLocationLabel,
    applyDraftToTransactionCreator,
  } = useBudgetPageDrafts({
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
    setSelectedTransactionTypeId: setSelectedTransactionTypeIdWithPaymentSource,
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
  })

  const {
    resetTransactionCreator,
  } = useRecurringTransactionCreator({
    recurringTransactions: isRecurringTransactionsModuleEnabled ? recurringTransactions : [],
    recurringExecutions: isRecurringTransactionsModuleEnabled ? recurringExecutions : [],
    transactions: scopedTransactions,
    categoriesById,
    selectedMonth,
    selectedRecurringTransactionId,
    paymentSourceSettings,
    getRootLevel1IdForCategory,
    getDraftTypeForLevel1Id,
    getPaymentSourceKindForLevel1Id,
    applyTransactionCategorySelection,
    saveRecurringReminderMonthStatus,
    amountInputRef,
    setTransactionCreatorSuggestionId,
    setTransactionCreatorLockedLevel1Id,
    setSelectedTransactionTypeId: setSelectedTransactionTypeIdWithPaymentSource,
    setSelectedLevel2Id,
    setSelectedTransactionCategoryId,
    setNewAmount,
    setNewDescription,
    setNewTransactionDate,
    setSelectedPaymentSourceId,
    setSelectedPaymentSplitItems,
    setSelectedTagNames,
    setSelectedRecurringTransactionId,
    setIsSerialTransactionCreatorEnabled,
    setTransactionDraftId,
    setTransactionDraftType,
    setTransactionCreatorInitialDate,
    setIsTransactionCreatorOpen,
    restoreDescriptionSuggestion,
  })

  const handleDuplicateTransaction = useCallback(
    (transaction: Transaction) => {
      if (!canCreateTransactionsInMonth(isSelectedMonthLocked)) {
        return
      }

      applyTransactionCategorySelection(transaction.category_id)
      setTransactionCreatorSuggestionId(transaction.category_id)
      setTransactionCreatorLockedLevel1Id(null)
      setNewAmount(String(getAmountNumber(transaction.amount)))
      setNewDescription(transaction.description || '')
      setSelectedTagNames((transactionTagsMap[transaction.id] || []).map((tag) => tag.name))
      setSelectedPaymentSourceId(transaction.payment_source_id || '')
      setSelectedPaymentSplitItems(
        createPaymentSplitItemsFromStoredSplits(transactionPaymentSplitsMap[transaction.id] || [])
      )
      setSelectedRecurringTransactionId(transaction.recurring_transaction_id || '')
      setNewTransactionDate(isQuickDayModeEnabled && effectiveQuickDayDate ? effectiveQuickDayDate : '')
      setIsSerialTransactionCreatorEnabled(false)
      setTransactionDraftId(null)
      setTransactionDraftType(null)
      setTransactionCreatorInitialDate(null)
      setIsTransactionCreatorOpen(true)

      window.setTimeout(() => {
        amountInputRef.current?.focus()
      }, 0)
    },
    [
      applyTransactionCategorySelection,
      isQuickDayModeEnabled,
      isSelectedMonthLocked,
      effectiveQuickDayDate,
      setTransactionDraftId,
      setTransactionDraftType,
      transactionPaymentSplitsMap,
      transactionTagsMap,
    ]
  )

  const handleTransactionSavedWithReminderStatus = useCallback(
    async (transaction: Transaction) => {
      if (!effectiveVisibleModules.recurringTransactions) {
        return
      }

      const reminderId = selectedRecurringTransactionId || transaction.recurring_transaction_id

      if (!reminderId) {
        return
      }

      await saveRecurringReminderMonthStatus({
        reminderId,
        month: transaction.date.slice(0, 7),
        status: 'linked',
        transactionId: transaction.id,
      })
    },
    [effectiveVisibleModules.recurringTransactions, saveRecurringReminderMonthStatus, selectedRecurringTransactionId]
  )

  const openReminderTransactionCreator = useCallback(
    (reminder: (typeof recurringTransactions)[number]) => {
      applyTransactionCategorySelection(reminder.category_id)
      setNewDescription(reminder.description || reminder.name)
      setNewAmount(
        reminder.use_amount_when_creating && reminder.amount !== null ? String(reminder.amount) : ''
      )
      setSelectedRecurringTransactionId(reminder.id)
      setNewTransactionDate(getMonthCycleDate(reminder, currentMonth))
      setTransactionCreatorSuggestionId(reminder.category_id)
      setIsSerialTransactionCreatorEnabled(false)
      setIsTransactionCreatorOpen(true)
    },
    [applyTransactionCategorySelection, currentMonth]
  )

  const {
    openBlankFloatingTransactionCreator,
    handleOpenGlobalCalendarAddForDay,
    handleOpenLevel1CalendarAddForDay,
    handleOpenCategoryCalendarAddForDay,
    openTransactionCreator,
    openFloatingTransactionCreator,
  } = useTransactionCreatorOpeners({
    selectedMonth,
    categoriesById,
    getRootLevel1IdForCategory,
    getDraftTypeForLevel1Id,
    getDraftForType,
    applyTransactionCategorySelection,
    setDraftPromptState,
    setTransactionCreatorSuggestionId,
    setTransactionCreatorLockedLevel1Id,
    setSelectedTransactionTypeId: setSelectedTransactionTypeIdWithPaymentSource,
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

  const { loadData } = useBudgetPageData({
    profileId,
    selectedMonth,
    budgetStartDate: savedBudgetStartDate,
    setStatus,
    setErrorText,
    setCategories,
    setTransactions,
    setTrashedTransactions,
    setTransactionPaymentSplitsMap,
    setTransactionTagsMap,
    setTags,
    resetTreeOpenState,
    loadMonthNavigationSettings,
    loadLockedMonths,
    loadExcludedMonths,
    loadPaymentSources,
    loadRecurringTransactions,
    loadFinancialGoals,
    loadDrafts,
  })

  const {
    handleImportTransactions,
    handleAddSubcategory,
    handleRenameCategory,
    handleDeleteCategory,
  } = useBudgetPageActions({
    profileId,
    selectedMonth,
    guardMonthUnlocked,
    categories,
    transactions: scopedTransactions,
    isPaymentSourcesEnabled: isPaymentSourcesModuleEnabled,
    newSubcategoryName,
    setOpenAddSubcategoryFor,
    setNewSubcategoryName,
    loadData,
  })

  const handleSaveMonthNavigationSettingsWithStartDateWarning = useCallback(async () => {
    const nextBudgetStartDate = budgetStartDate.slice(0, 10)
    const previousBudgetStartDate = savedBudgetStartDate.slice(0, 10)

    if (
      nextBudgetStartDate &&
      nextBudgetStartDate !== previousBudgetStartDate &&
      transactions.some(
        (transaction) =>
          !transaction.is_deleted && transaction.date.slice(0, 10) < nextBudgetStartDate
      )
    ) {
      const confirmed = confirm(
        'Masz wpisy sprzed daty startowej. Te wpisy zostaną zachowane, ale nie będą liczone w statystykach. Czy na pewno chcesz zmienić datę startową?'
      )

      if (!confirmed) {
        return
      }
    }

    await handleSaveMonthNavigationSettings()
  }, [budgetStartDate, handleSaveMonthNavigationSettings, savedBudgetStartDate, transactions])

  const handleResetSelectedMonthData = useCallback(async () => {
    const monthTransactions = scopedTransactions.filter(
      (transaction) => transaction.date.slice(0, 7) === selectedMonth
    )

    if (monthTransactions.length === 0) {
      alert('Ten miesiąc nie ma wpisów do resetu.')
      return
    }

    const firstConfirmed = confirm(
      `Czy na pewno zresetować dane miesiąca ${selectedMonth}? Wpisy zostaną przeniesione do kosza, a kategorie i ustawienia zostaną bez zmian.`
    )

    if (!firstConfirmed) {
      return
    }

    const secondConfirmed = confirm(
      'To działanie jest trudne do cofnięcia przy większej liczbie wpisów. Czy na pewno kontynuować?'
    )

    if (!secondConfirmed) {
      return
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('profile_id', profileId)
      .gte(
        'date',
        budgetStartDate && budgetStartDate.slice(0, 7) === selectedMonth
          ? budgetStartDate.slice(0, 10)
          : `${selectedMonth}-01`
      )
      .lt('date', `${getNextMonthText(selectedMonth)}-01`)

    if (error) {
      alert(`Błąd resetu miesiąca: ${error.message}`)
      return
    }

    clearTransactionOperationUi()
    clearTransactionSelection()
    resetTransactionCreator()
    await loadData()
    alert(`Zresetowano wpisy z miesiąca ${selectedMonth}.`)
  }, [
    clearTransactionOperationUi,
    clearTransactionSelection,
    loadData,
    profileId,
    resetTransactionCreator,
    budgetStartDate,
    selectedMonth,
    scopedTransactions,
  ])

  const handleResetAllHistory = useCallback(async () => {
    const firstConfirmed = confirm(
      'Czy na pewno zresetować całą historię wpisów? Kategorie, ustawienia, źródła płatności, cele i przypomnienia zostaną bez zmian.'
    )

    if (!firstConfirmed) {
      return
    }

    const confirmationText = prompt(
      'To działanie jest nieodwracalne albo trudne do cofnięcia. Aby kontynuować, wpisz: USUŃ HISTORIĘ'
    )

    if (confirmationText !== 'USUŃ HISTORIĘ') {
      alert('Reset całej historii anulowany.')
      return
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('profile_id', profileId)

    if (error) {
      alert(`Błąd resetu historii: ${error.message}`)
      return
    }

    clearTransactionOperationUi()
    clearTransactionSelection()
    resetTransactionCreator()
    await loadData()
    alert('Zresetowano całą historię wpisów.')
  }, [
    clearTransactionOperationUi,
    clearTransactionSelection,
    loadData,
    profileId,
    resetTransactionCreator,
  ])

  const isAllowedMoveTarget = (transaction: Transaction, targetCategoryId: string) => {
    return checkIsAllowedMoveTarget(
      transaction,
      targetCategoryId,
      categories,
      categoriesById,
      getRootLevel1IdForCategory
    )
  }

  const {
    getMoveTargetsForTransaction,
    getCommonMoveTargetsForTransactions,
    selectedTransactions,
    commonBulkMoveTargets,
    migrationPromptTransactions,
    migrationPromptMoveTargets,
    activeTransactionsById,
    trashedTransactionsById,
  } = useBudgetMoveTargetsData({
    transactions: scopedTransactions,
    trashedTransactions,
    categories,
    categoriesById,
    selectedTransactionIds,
    migrationPromptState,
    isAllowedMoveTarget,
  })

  const {
    handleSaveTransaction,
    handleInlineSaveTransaction,
    handleUpdateTransaction,
    moveTransactionsToCategory,
    handleRestoreTransaction,
    handleMoveTransaction,
    handleDeleteTransaction,
    handlePermanentDeleteTransaction,
    handleEmptyTrash,
  } = useTransactionEntryActions({
    supabase,
    profileId,
    selectedMonth,
    visibleCategories,
    categoriesById,
    activeTransactionsById,
    trashedTransactionsById,
    transactionDraftType,
    selectedTransactionTypeId,
    selectedLevel2Id,
    selectedTransactionCategoryId,
    newAmount,
    newDescription,
    newTransactionDate,
    selectedRecurringTransactionId,
    isSerialTransactionCreatorEnabled,
    isQuickDayModeEnabled,
    quickDayDate: effectiveQuickDayDate,
    isPaymentSourcesEnabled: isPaymentSourcesModuleEnabled,
    isRecurringTransactionsEnabled: isRecurringTransactionsModuleEnabled,
    isAllowedMoveTarget,
    getRootLevel1IdForCategory,
    deleteDraft,
    guardMonthUnlocked,
    guardTransactionsUnlocked,
    clearTransactionOperationUi,
    loadData,
    resetTransactionCreator,
    setLastUndoAction,
    setTransactions,
    setIsSaving,
    setTransactionCreatorSuggestionId,
    setNewTransactionDate,
    setNewAmount,
    setNewDescription,
    setSelectedTagNames,
    setSelectedPaymentSourceId,
    setSelectedPaymentSplitItems,
    defaultPaymentSourceId: currentTransactionCreatorDefaultPaymentSourceId,
    onTransactionSaved: handleTransactionSavedWithReminderStatus,
    amountInputRef,
    selectedTagNames,
    selectedPaymentSourceId,
    selectedPaymentSplitItems,
    transactionTagsMap,
  })

  const {
    handleConfirmCategoryMigration,
    handleHideCategory,
    handleUndoScheduledHide,
    handleRestoreCategory,
  } = useCategoryVisibilityActions({
    supabase,
    categories,
    transactions: scopedTransactions,
    selectedMonth,
    activeTransactionsById,
    loadData,
    clearTransactionOperationUi,
    clearTransactionSelection,
    resetTransactionCreator,
    moveTransactionsToCategory,
    getCommonMoveTargetsForTransactions,
    setMigrationPromptState,
    setLastUndoAction,
    setOpenAddSubcategoryFor,
    setNewSubcategoryName,
  })

  useBudgetAppEffects({
    loadData,
    loadBudgetLimits,
    setErrorText,
    setCurrentDayOfMonth,
    scopedTransactions,
    setSelectedTransactionIds,
    bulkMoveTargetCategoryId,
    commonBulkMoveTargets,
    setBulkMoveTargetCategoryId,
    migrationPromptState,
    migrationPromptMoveTargets,
    setMigrationPromptState,
  })

  const {
    level2SortMode,
    setLevel2SortMode,
    level2SortDirection,
    setLevel2SortDirection,
    level3SortMode,
    setLevel3SortMode,
    level3SortDirection,
    setLevel3SortDirection,
    isReorderingLevel1,
    reorderingLevel1Id,
    reorderingLevel2Id,
    getSortedLevel2Children,
    getSortedLevel3Children,
    sortedLevel2ByParentIdForModal,
    sortedLevel3ByParentIdForModal,
    handleReorderLevel1,
    handleReorderLevel2,
    handleReorderLevel3,
    handleLevel1DragStart,
    handleLevel3DragStart,
  } = useBudgetTreeSorting({
    categories,
    setCategories,
    openLevel1Ids,
    openLevel2Ids,
    setOpenLevel1Ids,
    setOpenLevel2Ids,
    setOpenLevel3Ids,
    level1,
    level2,
    level2ByParentId,
    level3ByParentId,
    getSumForCategoryForSelectedMonth,
    getSumForLevel2ForSelectedMonth,
    getCountForLevel2ForSelectedMonth,
    getCategoryCountForSelectedMonth,
  })

  const { finalCategoryOptions, recurringOptionItems, recurringSuggestionItems } =
    useRecurringOptions({
      visibleCategories,
      recurringTransactions,
      recurringExecutions,
      recurringReminderMonthStatuses,
      transactions: scopedTransactions,
      selectedMonth,
      selectedTransactionCategoryId,
      selectedLevel2Id,
      selectedTransactionTypeId,
      newAmount,
      newDescription,
      categoriesById,
      isEnabled: effectiveVisibleModules.recurringTransactions,
    })

  const getRecurringOptionsForCategoryId = useCallback(
    (categoryId: string) => {
      if (!effectiveVisibleModules.recurringTransactions) {
        return []
      }

      return recurringTransactions
        .filter(
          (reminder) =>
            reminder.category_id === categoryId && isRecurringExpectedInMonth(reminder, selectedMonth)
        )
        .map((reminder) => {
          const hasTransactionInMonth = scopedTransactions.some(
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
      recurringTransactions,
      selectedMonth,
      scopedTransactions,
      effectiveVisibleModules.recurringTransactions,
    ]
  )

  const handleToggleSelectedMonthExcludedWithConfirm = useCallback(async () => {
    if (isSelectedMonthExcluded) {
      const confirmed = confirm('Czy na pewno chcesz przywrócić ten miesiąc do statystyk?')

      if (!confirmed) {
        return
      }

      await handleToggleSelectedMonthExcluded()
      return
    }

    const confirmed = confirm(
      'Czy na pewno chcesz wyłączyć ten miesiąc ze statystyk? Dane nie zostaną usunięte.'
    )

    if (!confirmed) {
      return
    }

    if (selectedMonthTransactions.length > 0) {
      const confirmedWithEntries = confirm(
        'Ten miesiąc zawiera wpisy. Wyłączenie miesiąca spowoduje, że nie będzie liczony w statystykach, trendach i dashboardzie. Dane nadal zostaną w historii. Czy na pewno?'
      )

      if (!confirmedWithEntries) {
        return
      }
    }

    await handleToggleSelectedMonthExcluded()
  }, [
    handleToggleSelectedMonthExcluded,
    isSelectedMonthExcluded,
    selectedMonthTransactions.length,
  ])

  const previousMonthCloseReminder = useMemo(() => {
    if (
      currentDayOfMonth === null ||
      currentDayOfMonth < 5 ||
      !currentMonth ||
      isPreviousMonthCloseReminderHidden
    ) {
      return null
    }

    const previousMonth = getPrevMonthText(currentMonth)

    if (lockedMonthsSet.has(previousMonth)) {
      return null
    }

    return previousMonth
  }, [currentDayOfMonth, currentMonth, isPreviousMonthCloseReminderHidden, lockedMonthsSet])

  const budgetLimitViewsByCategoryId = useMemo(() => {
    return activeLimitStates.reduce<Record<string, BudgetLimitView>>((acc, state) => {
      acc[getBudgetLimitKey(state.limit.category_id)] = state
      return acc
    }, {})
  }, [activeLimitStates])

  const getBudgetLimitView = useCallback(
    (categoryId: string | null) => budgetLimitViewsByCategoryId[getBudgetLimitKey(categoryId)] || null,
    [budgetLimitViewsByCategoryId]
  )

  const editedBudgetLimitView = useMemo(() => {
    if (budgetLimitEditorCategoryId === undefined) {
      return null
    }

    return getBudgetLimitView(budgetLimitEditorCategoryId)
  }, [budgetLimitEditorCategoryId, getBudgetLimitView])

  const editedBudgetLimitCategoryLabel = useMemo(() => {
    if (budgetLimitEditorCategoryId === null) {
      return 'Wydatki'
    }

    if (!budgetLimitEditorCategoryId) {
      return ''
    }

    return getCategoryPathLabel(budgetLimitEditorCategoryId, categoriesById)
  }, [budgetLimitEditorCategoryId, categoriesById])

  const saveBudgetLimit = useCallback(
    async (input: SaveBudgetLimitInput) => {
      try {
        if (editedBudgetLimitView) {
          await updateBudgetLimit({
            ...input,
            id: editedBudgetLimitView.limit.id,
          })
        } else {
          await addBudgetLimit(input)
        }
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : 'Nie udało się zapisać limitu.')
        throw error
      }
    },
    [addBudgetLimit, editedBudgetLimitView, updateBudgetLimit]
  )

  const removeBudgetLimit = useCallback(
    async (limitId: string) => {
      try {
        await deleteBudgetLimit(limitId)
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : 'Nie udało się usunąć limitu.')
        throw error
      }
    },
    [deleteBudgetLimit]
  )

  const disableEditedBudgetLimit = useCallback(
    async (limitId: string) => {
      try {
        await deleteBudgetLimit(limitId, selectedMonth)
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : 'Nie udało się wyłączyć limitu.')
        throw error
      }
    },
    [deleteBudgetLimit, selectedMonth]
  )

  const budgetLimitDataSnapshot = useMemo(
    () => ({
      activeLimitCount: isBudgetLimitsModuleEnabled ? activeBudgetLimits.length : 0,
      calculatedLimitCount: isBudgetLimitsModuleEnabled ? activeLimitStates.length : 0,
      activeAlertCount: isBudgetLimitsModuleEnabled ? activeBudgetLimitAlerts.length : 0,
    }),
    [
      activeBudgetLimitAlerts.length,
      activeBudgetLimits.length,
      activeLimitStates.length,
      isBudgetLimitsModuleEnabled,
    ]
  )

  const recentTransactionPreviews = useMemo(() => {
    return scopedTransactions
      .filter((transaction) => !transaction.is_deleted)
      .sort((left, right) => (right.created_at || '').localeCompare(left.created_at || ''))
      .slice(0, 8)
      .map((transaction) => ({
        id: transaction.id,
        amount: String(getAmountNumber(transaction.amount)),
        kind: getSignedAmountForTransaction(transaction) >= 0 ? 'income' : 'expense',
        date: transaction.day_is_null ? `${transaction.date.slice(0, 7)} · bez dnia` : transaction.date,
        description: transaction.description || '',
        categoryLabel: categoriesById[transaction.category_id]
          ? getCategoryPathLabel(transaction.category_id, categoriesById)
          : 'Kategoria niedostępna',
      }))
  }, [categoriesById, getSignedAmountForTransaction, scopedTransactions])

  const budgetPageOverlayProps = useBudgetPageOverlayProps({
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
    pinnedTransactionShortcutCategoriesByType,
    pinnedCategoryIds,
    togglePinnedCategory,
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
    isQuickDayModeEnabled,
    setIsQuickDayModeEnabled,
    setQuickDayDate,
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
    currentTransactionCreatorPaymentSourceOptions: isPaymentSourcesModuleEnabled
      ? currentTransactionCreatorPaymentSourceOptions
      : [],
    isTransactionCreatorPaymentSourceVisible:
      isPaymentSourcesModuleEnabled && isTransactionCreatorPaymentSourceVisible,
    selectedPaymentSplitItems: isPaymentSourcesModuleEnabled ? selectedPaymentSplitItems : [],
    setSelectedPaymentSplitItems,
    selectedRecurringTransactionId: isRecurringTransactionsModuleEnabled
      ? selectedRecurringTransactionId
      : '',
    setSelectedRecurringTransactionId,
    recurringOptionItems: isRecurringTransactionsModuleEnabled ? recurringOptionItems : [],
    recurringSuggestionItems: isRecurringTransactionsModuleEnabled ? recurringSuggestionItems : [],
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
  })

  const contextCalendarDays = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number)

    if (!year || !month) {
      return []
    }

    const firstDay = new Date(year, month - 1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()
    const leadingEmptyDays = (firstDay.getDay() + 6) % 7

    return [
      ...Array.from({ length: leadingEmptyDays }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ]
  }, [selectedMonth])

  return (
    <main
      style={styles.page}
      data-budget-app="true"
      data-budget-limit-count={budgetLimitDataSnapshot.activeLimitCount}
      data-budget-limit-calculated-count={budgetLimitDataSnapshot.calculatedLimitCount}
      data-budget-limit-alert-count={budgetLimitDataSnapshot.activeAlertCount}
    >
      <BudgetPageStatusPanels
        styles={styles}
        userProfileMenuProps={{
          userEmail,
          onToggleSettings: () => setIsSettingsPanelVisible((previousValue) => !previousValue),
          onToggleImportExport: () =>
            setActiveUtilityPanel((previousValue) =>
              previousValue === 'importExport' ? null : 'importExport'
            ),
          onExportBackupJson: () => downloadProfileBackupJson(supabase, profileId),
          onExportBackupCsv: () => downloadProfileBackupCsv(supabase, profileId, budgetStartDate),
          onSignOut: signOut,
          styles,
        }}
        budgetHeaderPanelProps={{
          selectedMonth,
          currentMonth,
          status,
          categoriesCount: categories.length,
          visibleCategoriesCount: visibleCategories.length,
          transactionsCount: scopedTransactions.length,
          hiddenCategoriesCount: hiddenCategoriesInSelectedMonth.length,
          showHiddenCategories,
          errorText,
          minAllowedMonth,
          maxAllowedMonth,
          budgetStartDate,
          monthNavigationFutureLocked: isFutureMonthNavigationLocked,
          isSavingMonthNavigationSettings,
          monthNavigationErrorText,
          isPrevMonthNavigationBlocked,
          isNextMonthNavigationBlocked,
          isSelectedMonthLocked,
          isUpdatingSelectedMonthLock,
          isSelectedMonthExcluded,
          isUpdatingSelectedMonthExclusion,
          heatmapMode,
          calendarHeatmapVariant,
          heatmapInverted,
          recentTransactions: recentTransactionPreviews,
          onHeatmapModeChange: setHeatmapMode,
          onCalendarHeatmapVariantChange: setCalendarHeatmapVariant,
          onHeatmapInvertedChange: setHeatmapInverted,
          onResetHeatmapSettings: handleResetHeatmapSettings,
          onPrevMonth: goToPrevMonth,
          onNextMonth: goToNextMonth,
          onGoToCurrentMonth: () => setSelectedMonth(currentMonth),
          onLockSelectedMonth: handleLockSelectedMonth,
          onUnlockSelectedMonth: handleUnlockSelectedMonth,
          onToggleHidden: () => setShowHiddenCategories((prev) => !prev),
          onBudgetStartDateChange: (value) => {
            setBudgetStartDate(value)
            setMonthNavigationStartMonth(value ? value.slice(0, 7) : '')
            setMonthNavigationErrorText('')
          },
          onMonthNavigationFutureLockedChange: (value) => {
            setIsFutureMonthNavigationLocked(value)
            setMonthNavigationErrorText('')
          },
          onSaveMonthNavigationSettings: handleSaveMonthNavigationSettingsWithStartDateWarning,
          onToggleSelectedMonthExcluded: handleToggleSelectedMonthExcludedWithConfirm,
          styles,
        }}
        appSettingsPanelProps={{
          simpleMode,
          onSimpleModeChange: setSimpleMode,
          autoExcludePartialMonths,
          onAutoExcludePartialMonthsChange: setAutoExcludePartialMonths,
          draftVisibleModules,
          saveStatusText: moduleVisibilitySaveStatusText,
          onChangeModuleVisibility: setDraftModuleVisibility,
          onSave: async () => {
            await handleSaveMonthNavigationSettingsWithStartDateWarning()
            await saveVisibleModules()
          },
          onResetDraft: resetDraftVisibleModules,
          onLockAllPastMonths: handleLockAllPastMonths,
          onUnlockAllPastMonths: handleUnlockAllPastMonths,
          onResetSelectedMonthData: handleResetSelectedMonthData,
          onResetAllHistory: handleResetAllHistory,
          styles,
          defaultOpen: true,
          profileMembersPanel: (
            <ProfileMembersPanel
              profileId={profileId}
              userId={userId}
              userEmail={userEmail}
              inviteEmail={inviteEmail}
              setInviteEmail={setInviteEmail}
              inviteLink={inviteLink}
              invitationStatusText={invitationStatusText}
              invitationErrorText={invitationErrorText}
              isInvitationWorking={isInvitationWorking}
              createInvitation={createInvitation}
              copyInviteLink={copyInviteLink}
              onCurrentUserLeftProfile={onCurrentUserLeftProfile}
              styles={styles}
            />
          ),
        }}
        isSettingsPanelVisible={isSettingsPanelVisible}
        isDashboardOpen={isDashboardPanelOpen}
        onToggleDashboard={() => setIsDashboardPanelOpen((previousValue) => !previousValue)}
        activeUtilityPanel={activeUtilityPanel}
        onOpenUtilityPanel={setActiveUtilityPanel}
        onQuickAdd={() => openBlankFloatingTransactionCreator(null)}
      />

      <section data-budget-workspace="true">
        <div data-budget-workspace-main="true">
          <div data-budget-status-grid="true">
            {previousMonthCloseReminder && (
              <details data-budget-compact-notice="alert">
                <summary>Alert miesiąca</summary>
                <div>
                  Poprzedni miesiąc {previousMonthCloseReminder} nie jest jeszcze zamknięty.
                </div>
                <div data-budget-actions-row="true" style={{ ...styles.actions, marginTop: 8 }}>
                  <button
                    type="button"
                    style={styles.primaryButton}
                    onClick={async () => {
                      const confirmed = confirm(
                        `Czy na pewno zamknąć poprzedni miesiąc ${previousMonthCloseReminder}?`
                      )

                      if (!confirmed) {
                        return
                      }

                      await handleLockMonth(previousMonthCloseReminder)
                    }}
                  >
                    Zamknij
                  </button>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => setIsPreviousMonthCloseReminderHidden(true)}
                  >
                    Później
                  </button>
                </div>
              </details>
            )}

            <details data-budget-compact-notice="note">
              <summary>Notatka miesiąca</summary>
              <ProfileMonthNotePanel
                profileId={profileId}
                userId={userId}
                selectedMonth={selectedMonth}
                styles={styles}
              />
            </details>

            {effectiveVisibleModules.budgetLimits && activeBudgetLimits.length > 0 && (
              <section data-budget-compact-notice="limits">
                <div data-workspace-card-title="true">Limity</div>
                <BudgetLimitAlertsPanel
                  alerts={activeBudgetLimitAlerts}
                  categoriesById={categoriesById}
                  styles={styles}
                  onOpenLimit={setBudgetLimitEditorCategoryId}
                />
              </section>
            )}
          </div>

      <BudgetPageMainPanels
        visibleModules={effectiveVisibleModules}
        canCreateTransactions={canCreateTransactions}
        activeUtilityPanel={activeUtilityPanel}
        onCloseUtilityPanel={() => setActiveUtilityPanel(null)}
        undoBannerProps={
          lastUndoAction && selectedTransactionIds.length === 0 && !migrationPromptState
            ? {
                label: lastUndoAction.label,
                onUndo: () =>
                  handleUndoLastAction({
                    activeTransactionsById,
                    trashedTransactionsById,
                    supabase,
                    clearTransactionOperationUi,
                    loadData,
                  }),
                styles,
              }
            : null
        }
        categoryMigrationPromptProps={
          migrationPromptState
            ? {
                categoryLabel: migrationPromptState.categoryId
                  ? getCategoryPathLabel(migrationPromptState.categoryId, categoriesById)
                  : 'Wybrana kategoria',
                modeLabel: migrationPromptState.mode === 'now' ? 'ukryj teraz' : 'ukryj od następnego',
                transactions: migrationPromptTransactions,
                moveTargets: migrationPromptMoveTargets,
                targetCategoryId: migrationPromptState.targetCategoryId,
                errorText: migrationPromptState.errorText,
                getAmountNumber,
                getTransactionCategoryLabel: (categoryId) =>
                  categoriesById[categoryId]
                    ? getCategoryPathLabel(categoryId, categoriesById)
                    : 'Kategoria niedostępna',
                onTargetCategoryChange: (value) => {
                  setMigrationPromptState((prev) =>
                    prev
                      ? {
                          ...prev,
                          targetCategoryId: value,
                          errorText: '',
                        }
                      : null
                  )
                },
                onConfirm: () => handleConfirmCategoryMigration(migrationPromptState),
                onCancel: () => clearTransactionOperationUi(),
                styles,
              }
            : null
        }
        bulkActionsBarProps={{
          selectedCount: selectedTransactionIds.length,
          targetCategoryId: bulkMoveTargetCategoryId,
          moveTargets: commonBulkMoveTargets,
          errorText: bulkActionErrorText,
          onTargetCategoryChange: (value) => {
            setBulkMoveTargetCategoryId(value)
            setBulkActionErrorText('')
          },
          onDeleteSelected: () =>
            handleBulkDeleteSelected({
              selectedTransactions,
              supabase,
              clearTransactionOperationUi,
              loadData,
            }),
          onMoveSelected: () =>
            handleBulkMoveSelected({
              selectedTransactions,
              bulkMoveTargetCategoryId,
              isAllowedMoveTarget,
              supabase,
              clearTransactionOperationUi,
              loadData,
            }),
          onClearSelection: clearTransactionSelection,
          styles,
        }}
        draftsPanelProps={{
          draftsStatusText,
          isDraftsLoading,
          drafts,
          isCleaningAllDrafts,
          cleanupAllDrafts: () => {
            void cleanupAllDrafts()
          },
          getDraftLevel1Id,
          formatDraftUpdatedAt,
          getDraftLocationLabel,
          applyDraftToTransactionCreator,
          deleteDraft,
          styles,
        }}
        importExportPanelProps={{
          selectedMonth,
          categories,
          categoriesById,
          transactions: scopedTransactions,
          trashedTransactions,
          transactionPaymentSplitsMap: isPaymentSourcesModuleEnabled ? transactionPaymentSplitsMap : {},
          importableCategoryIds: addableTransactionCategoryIds,
          categoryPathLabels: transactionCategoryPathLabels,
          defaultCategoryId: selectedTransactionCategoryId,
          isSelectedMonthLocked,
          canCreateTransactions,
          getPaymentSourceOptionsForCategoryId: isPaymentSourcesModuleEnabled
            ? getPaymentSourceOptionsForCategoryId
            : undefined,
          onImportRows: handleImportTransactions,
          styles,
        }}
        paymentSourcesPanelProps={{
          paymentSources,
          paymentSourceStats,
          paymentSourceSettings,
          onSave: async (input) => {
            try {
              await savePaymentSource(input)
            } catch (error) {
              if (error instanceof Error) {
                alert(`Błąd zapisu źródła płatności: ${error.message}`)
              }
            }
          },
          onDelete: async (paymentSourceId) => {
            try {
              await deletePaymentSource(paymentSourceId)
            } catch (error) {
              if (error instanceof Error) {
                alert(`Błąd usuwania źródła płatności: ${error.message}`)
              }
            }
          },
          onSetDefault: async (kind, paymentSourceId) => {
            try {
              await setDefaultPaymentSource(kind, paymentSourceId)
              if (
                !selectedPaymentSourceId &&
                currentTransactionCreatorKind === kind &&
                isTransactionCreatorPaymentSourceVisible
              ) {
                setSelectedPaymentSourceId(paymentSourceId || '')
              }
            } catch (error) {
              if (error instanceof Error) {
                alert(`Błąd ustawiania domyślnego źródła: ${error.message}`)
              }
            }
          },
          onSetFieldVisibility: async (kind, isVisible) => {
            try {
              await setPaymentSourceFieldVisibility(kind, isVisible)

              if (!isVisible && currentTransactionCreatorKind === kind) {
                setSelectedPaymentSourceId('')
              }
            } catch (error) {
              if (error instanceof Error) {
                alert(`Błąd zapisu ustawień pola źródła: ${error.message}`)
              }
            }
          },
          onCopyList: async (sourceKind, targetKind) => {
            try {
              await copyPaymentSourcesBetweenKinds(sourceKind, targetKind)
            } catch (error) {
              if (error instanceof Error) {
                alert(`Błąd kopiowania list źródeł: ${error.message}`)
              }
            }
          },
          styles,
        }}
        financialGoalsContainerProps={{
          selectedMonth,
          goals: financialGoals,
          goalPriorities: financialGoalPriorities,
          goalMonthConfigs: financialGoalMonthConfigs,
          transactions: scopedTransactions,
          lockedMonthsSet,
          getSignedAmountForTransaction,
          onSaveGoal: saveFinancialGoal,
          onDeleteGoal: deleteFinancialGoal,
          onSetGoalModeForMonth: setGoalModeForMonth,
          onSaveGoalAllocationsForMonth: saveGoalAllocationsForMonth,
          onReorderGoalsForMonth: saveGoalPrioritiesForMonth,
          styles,
        }}
        searchPanelProps={{
          ref: searchPanelRef,
          isOpen: isBankSearchOpen,
          setIsOpen: setIsBankSearchOpen,
          searchState: bankSearchState,
          onFieldChange: handleBankSearchFieldChange,
          onToggleTagId: handleBankSearchToggleTagId,
          onReset: resetBankSearch,
          results: bankSearchResults,
          summary: bankSearchSummary,
          categoryOptions: bankSearchCategoryOptions,
          paymentSourceOptions: isPaymentSourcesModuleEnabled ? bankSearchPaymentSourceOptions : [],
          tagOptions: bankSearchTagOptions,
          transactionTagsMap,
          transactionPaymentSplitsMap: isPaymentSourcesModuleEnabled ? transactionPaymentSplitsMap : {},
          categoriesById,
          onOpenSearchForTag: handleOpenSearchForTag,
          styles,
        }}
        monthCalendarPanelProps={{
          selectedMonth,
          transactions: selectedMonthTransactions,
          budgetStartDate,
          isSelectedMonthExcluded,
          onToggleSelectedMonthExcluded: handleToggleSelectedMonthExcludedWithConfirm,
          isUpdatingSelectedMonthExclusion,
          styles,
          isSelectedMonthLocked,
          getAmountNumber,
          getMoveTargetsForTransaction,
          getSignedAmountForTransaction,
          onUpdateTransaction: handleUpdateTransaction,
          onDeleteTransaction: handleDeleteTransaction,
          onMoveTransaction: handleMoveTransaction,
          onDuplicateTransaction: handleDuplicateTransaction,
          onAddTransactionForDay: handleOpenGlobalCalendarAddForDay,
          calendarTitle: 'Kalendarz miesiąca',
          calendarSubtitle: '',
          heatmapMode,
          onHeatmapModeChange: setHeatmapMode,
          heatmapInverted,
          onHeatmapInvertedChange: setHeatmapInverted,
          heatmapVariant: calendarHeatmapVariant,
          showHeatmapControls: false,
          descriptionSuggestions,
          getPaymentSourceOptionsForCategoryId: isPaymentSourcesModuleEnabled
            ? getPaymentSourceOptionsForCategoryId
            : undefined,
          transactionTagsMap,
          transactionPaymentSplitsMap: isPaymentSourcesModuleEnabled ? transactionPaymentSplitsMap : {},
          onTagClick: handleOpenSearchForTag,
          onDeleteDescriptionSuggestion: handleDeleteDescriptionSuggestion,
        }}
        budgetTreeSectionProps={{
          sortedLevel1,
          openLevel1Ids,
          openLevel1CalendarIds,
          openLevel2Ids,
          openLevel3Ids,
          selectedMonth,
          budgetStartDate,
          isSelectedMonthLocked,
          canUseMonthCalendar: isMonthCalendarModuleEnabled,
          openAddSubcategoryFor,
          newSubcategoryName,
          selectedTransactionIds,
          isReorderingLevel1,
          reorderingLevel1Id,
          reorderingLevel2Id,
          expenseLevel1Id,
          styles,
          level2SortMode,
          setLevel2SortMode,
          level2SortDirection,
          setLevel2SortDirection,
          level3SortMode,
          setLevel3SortMode,
          level3SortDirection,
          setLevel3SortDirection,
          toggleLevel1,
          toggleLevel1Calendar,
          toggleLevel2,
          toggleLevel3,
          setOpenAddSubcategoryFor,
          setNewSubcategoryName,
          getSortedLevel2Children,
          getSortedLevel3Children,
          getTransactionsForLevel1AndMonth,
          getTransactionsForCategoryAndMonthForSelectedMonth,
          getSumForCategoryForSelectedMonth,
          getSumForLevel2ForSelectedMonth,
          getCountForLevel2ForSelectedMonth,
          getAmountNumber,
          getMoveTargetsForTransaction,
          getSignedAmountForTransaction,
          getCalendarHeatmapVariantForLevel1Id,
          heatmapMode,
          heatmapInverted,
          onHeatmapModeChange: setHeatmapMode,
          onHeatmapInvertedChange: setHeatmapInverted,
          handleAddSubcategory,
          handleRenameCategory,
          handleDeleteCategory,
          openTransactionCreator,
          handleInlineSaveTransaction,
          handleHideCategory,
          handleRestoreCategory,
          handleUndoScheduledHide,
          handleDeleteTransaction,
          handleUpdateTransaction,
          handleMoveTransaction,
          handleDuplicateTransaction,
          handleOpenCategoryCalendarAddForDay,
          handleOpenLevel1CalendarAddForDay,
          toggleTransactionSelection,
          handleLevel3DragStart,
          handleReorderLevel3,
          handleLevel1DragStart,
          handleReorderLevel1,
          handleReorderLevel2,
          descriptionSuggestions,
          getPaymentSourceOptionsForCategoryId: isPaymentSourcesModuleEnabled
            ? getPaymentSourceOptionsForCategoryId
            : undefined,
          getRecurringOptionsForCategoryId: isRecurringTransactionsModuleEnabled
            ? getRecurringOptionsForCategoryId
            : undefined,
          getDefaultPaymentSourceIdForCategoryId,
          transactionTagsMap,
          transactionPaymentSplitsMap: isPaymentSourcesModuleEnabled ? transactionPaymentSplitsMap : {},
          onTagClick: handleOpenSearchForTag,
          onDeleteDescriptionSuggestion: handleDeleteDescriptionSuggestion,
          getBudgetLimitView: isBudgetLimitsModuleEnabled ? getBudgetLimitView : undefined,
          onEditBudgetLimit: isBudgetLimitsModuleEnabled ? setBudgetLimitEditorCategoryId : undefined,
          onAddIncome: incomeLevel1Id
            ? () => openBlankFloatingTransactionCreator(incomeLevel1Id)
            : undefined,
          onAddExpense: expenseLevel1Id
            ? () => openBlankFloatingTransactionCreator(expenseLevel1Id)
            : undefined,
          onOpenSearch: () => setActiveUtilityPanel('search'),
          onOpenCalendar: () => setActiveUtilityPanel('monthCalendar'),
        }}
        hiddenCategoriesPanelProps={{
          categories: hiddenCategoriesInSelectedMonth,
          categoriesById,
          showHiddenCategories,
          getHiddenCategoryLabel,
          handleRestoreCategory,
          styles,
        }}
        trashPanelProps={{
          transactions: trashedTransactions,
          categoriesById,
          getAmountNumber,
          onRestoreTransaction: handleRestoreTransaction,
          onPermanentDeleteTransaction: handlePermanentDeleteTransaction,
          onEmptyTrash: handleEmptyTrash,
          styles,
        }}
      />
          <section data-core-workspace-footer="true" aria-label="Dolny kontekst workspace">
            <div data-workspace-month-switch="true">
              <button
                type="button"
                onClick={goToPrevMonth}
                disabled={isPrevMonthNavigationBlocked}
                aria-label="Poprzedni miesiac"
              >
                ‹
              </button>
              <span>{selectedMonth}</span>
              <button
                type="button"
                onClick={goToNextMonth}
                disabled={isNextMonthNavigationBlocked}
                aria-label="Nastepny miesiac"
              >
                ›
              </button>
            </div>

            <div data-workspace-bottom-feed="true">
              <span>Ostatnie</span>
              {recentTransactionPreviews.slice(0, 3).map((transaction) => (
                <button
                  key={transaction.id}
                  type="button"
                  data-transaction-kind={transaction.kind}
                  onClick={() => {
                    setActiveUtilityPanel('search')
                    handleBankSearchFieldChange('description', transaction.description)
                  }}
                >
                  <b>{transaction.amount} zl</b>
                  <small>{transaction.description || 'Bez opisu'}</small>
                </button>
              ))}
            </div>

            <button
              type="button"
              data-workspace-trash-chip="true"
              onClick={() => setActiveUtilityPanel('trash')}
            >
              <span>Trash</span>
              <b>{trashedTransactions.length}</b>
              <small>Kosz</small>
            </button>
          </section>
          <section data-lower-workspace="true" aria-label="Dolny kontekst workspace">
            <div data-workspace-insight-card="true">
              <span>Ostatnie wpisy</span>
              <strong>{recentTransactionPreviews.length}</strong>
              <small>najnowsze operacje w budżecie</small>
            </div>
            <div data-workspace-insight-card="true">
              <span>Aktywne kategorie</span>
              <strong>{visibleCategories.length}</strong>
              <small>widoczne w tym miesiącu</small>
            </div>
            <div data-workspace-insight-card="true">
              <span>Szybkie akcje</span>
              <div data-workspace-quick-actions="true">
                <button type="button" onClick={() => openBlankFloatingTransactionCreator(null)}>
                  Dodaj wpis
                </button>
                <button type="button" onClick={() => setActiveUtilityPanel('search')}>
                  Szukaj
                </button>
                <button type="button" onClick={() => setActiveUtilityPanel('monthCalendar')}>
                  Kalendarz
                </button>
              </div>
            </div>
          </section>
        </div>

        <aside data-budget-context-rail="true" aria-label="Kontekst workspace">
          <section data-context-card="summary">
            <div>
              <span>Miesiąc</span>
              <strong>{selectedMonth}</strong>
            </div>
            <em>{isSelectedMonthLocked ? 'zamknięty' : 'otwarty'}</em>
          </section>

          <section data-context-card="metrics">
            <div data-context-metric="true">
              <span>Wpisy</span>
              <strong>{selectedMonthTransactions.length}</strong>
            </div>
            <div data-context-metric="true">
              <span>Kategorie</span>
              <strong>{visibleCategories.length}</strong>
            </div>
          </section>

          <section data-context-card="calendar">
            <div data-context-card-header="true">
              <span>Mini kalendarz</span>
              <button type="button" onClick={() => setActiveUtilityPanel('monthCalendar')}>
                Otwórz
              </button>
            </div>
            <div data-mini-calendar="true">
              {['P', 'W', 'Ś', 'C', 'P', 'S', 'N'].map((dayLabel) => (
                <small key={dayLabel}>{dayLabel}</small>
              ))}
              {contextCalendarDays.map((dayNumber, index) =>
                dayNumber ? (
                  <button
                    key={`${selectedMonth}-${dayNumber}`}
                    type="button"
                    onClick={() => handleOpenGlobalCalendarAddForDay(String(dayNumber))}
                  >
                    {dayNumber}
                  </button>
                ) : (
                  <i key={`empty-${index}`} />
                )
              )}
            </div>
          </section>

          <section data-context-card="activity">
            <span>Ostatnio dodane</span>
            {recentTransactionPreviews.length === 0 ? (
              <small>Brak wpisów</small>
            ) : (
              recentTransactionPreviews.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  data-context-activity-row="true"
                  data-transaction-kind={transaction.kind}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setActiveUtilityPanel('search')
                    handleBankSearchFieldChange('description', transaction.description)
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') {
                      return
                    }

                    event.preventDefault()
                    setActiveUtilityPanel('search')
                    handleBankSearchFieldChange('description', transaction.description)
                  }}
                >
                  <b>{transaction.amount} zł</b>
                  <div data-context-activity-copy="true">
                    <strong>{transaction.description || 'Bez opisu'}</strong>
                    <small>{transaction.categoryLabel}</small>
                  </div>
                  <time>{transaction.date}</time>
                </div>
              ))
            )}
          </section>
        </aside>
      </section>

      {effectiveVisibleModules.dashboard && isDashboardPanelOpen && (
        <div data-dashboard-overlay="true">
          <button
            type="button"
            data-dashboard-backdrop="true"
            aria-label="Zamknij dashboard"
            onClick={() => setIsDashboardPanelOpen(false)}
          />
          <aside data-dashboard-drawer="true" aria-label="Dashboard analityczny">
            <div data-dashboard-drawer-header="true">
              <div>
                <strong>Dashboard</strong>
                <span>compact analytics</span>
              </div>
              <div data-dashboard-mode-tabs="true" aria-label="Tryb dashboardu">
                <button type="button">compact</button>
                <button type="button">standard</button>
                <button type="button">full</button>
              </div>
              <button
                type="button"
                aria-label="Zamknij dashboard"
                onClick={() => setIsDashboardPanelOpen(false)}
              >
                ×
              </button>
            </div>
            <DashboardPanel
              profileId={profileId}
              styles={styles}
              transactions={scopedTransactions}
              transactionTagsMap={transactionTagsMap}
              categoriesById={categoriesById}
              selectedMonth={selectedMonth}
              budgetStartDate={budgetStartDate}
              excludedMonthsSet={excludedMonthsSet}
              getSignedAmountForTransaction={getSignedAmountForTransaction}
            />
          </aside>
        </div>
      )}
      <BudgetPageOverlays {...budgetPageOverlayProps} />

      <BudgetLimitEditorModal
        isOpen={effectiveVisibleModules.budgetLimits && budgetLimitEditorCategoryId !== undefined}
        categoryId={budgetLimitEditorCategoryId ?? null}
        categoryLabel={editedBudgetLimitCategoryLabel}
        selectedMonth={selectedMonth}
        existingLimit={editedBudgetLimitView?.limit ?? null}
        onClose={() => setBudgetLimitEditorCategoryId(undefined)}
        onSave={saveBudgetLimit}
        onDelete={removeBudgetLimit}
        onDisable={disableEditedBudgetLimit}
      />
    </main>
  )
}
