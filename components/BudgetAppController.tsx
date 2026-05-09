'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type BudgetUtilityPanel } from './BudgetPageMainPanels'
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
import { isAllowedMoveTarget as checkIsAllowedMoveTarget } from '../lib/isAllowedMoveTarget'
import { useBudgetPageData } from '../lib/useBudgetPageData'
import { useRecurringOptions } from '../lib/useRecurringOptions'
import { useOpenSearchForTag } from '../lib/useOpenSearchForTag'
import { useAppModuleVisibility } from '../lib/useAppModuleVisibility'
import { getNextMonthText } from '../lib/dateUtils'
import { filterTransactionsByBudgetStartDate } from '../lib/transactionScope'
import { downloadProfileBackupCsv, downloadProfileBackupJson } from '../lib/exportBackup'
import { useBudgetAppEffects } from './budget-app/useBudgetAppEffects'
import BudgetAppControllerView from './budget-app/BudgetAppControllerView'
import { useBudgetAppControllerViewProps } from './budget-app/useBudgetAppControllerViewProps'
import { useDuplicateTransaction } from './budget-app/useDuplicateTransaction'
import { useBudgetLimitViews } from './budget-app/useBudgetLimitViews'
import { useFloatingDropdownDismissal } from './budget-app/useFloatingDropdownDismissal'
import { usePinnedCategories } from './budget-app/usePinnedCategories'
import { usePreviousMonthReminder } from './budget-app/usePreviousMonthReminder'
import { useTransactionCategorySelection } from './budget-app/useTransactionCategorySelection'

type MigrationPromptState = {
  categoryId: string
  mode: HideMode
  hideMonth: string
  transactionIds: string[]
  targetCategoryId: string
  errorText: string
}

type SidebarPrimaryPanel = 'profile' | 'settings' | null

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
  const [newSubcategoryIconKey, setNewSubcategoryIconKey] = useState<string | null>(null)

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
  const [transactionCreatorInitialDate, setTransactionCreatorInitialDate] = useState<string | null>(
    null
  )

  const [isSaving, setIsSaving] = useState(false)
  const [showHiddenCategories, setShowHiddenCategories] = useState(false)
  const [transactionPaymentSplitsMap, setTransactionPaymentSplitsMap] = useState<
    Record<string, TransactionPaymentSplit[]>
  >({})
  const amountInputRef = useRef<HTMLInputElement | null>(null)
  const descriptionInputRef = useRef<HTMLInputElement | null>(null)
  const searchPanelRef = useRef<HTMLDivElement | null>(null)

  const styles = budgetPageStyles
  const [activeSidebarPrimaryPanel, setActiveSidebarPrimaryPanel] =
    useState<SidebarPrimaryPanel>(null)
  const isSettingsPanelVisible = activeSidebarPrimaryPanel === 'settings'
  const setIsSettingsPanelVisible = useCallback(
    (value: boolean | ((previousValue: boolean) => boolean)) => {
      setActiveSidebarPrimaryPanel((previousPanel) => {
        const previousValue = previousPanel === 'settings'
        const nextValue = typeof value === 'function' ? value(previousValue) : value

        if (nextValue) {
          return 'settings'
        }

        return previousPanel === 'settings' ? null : previousPanel
      })
    },
    []
  )
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

  useFloatingDropdownDismissal()

  const effectiveVisibleModules = useMemo(
    () =>
      simpleMode
        ? {
            ...visibleModules,
            dashboard: true,
            monthCalendar: true,
            paymentSources: false,
            recurringTransactions: false,
            financialGoals: false,
            budgetLimits: false,
          }
        : {
            ...visibleModules,
            dashboard: true,
            monthCalendar: true,
          },
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

  const applyTransactionCategorySelection = useTransactionCategorySelection({
    categoriesById,
    setSelectedTransactionTypeId,
    setSelectedLevel2Id,
    setSelectedTransactionCategoryId,
  })

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

  const {
    pinnedCategoryIds,
    pinnedTransactionShortcutCategoriesByType,
    togglePinnedCategory,
  } = usePinnedCategories({
    profileId,
    addableTransactionCategoryIds,
    transactionCategoryPathLabels,
    getRootLevel1IdForCategory,
  })

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
    saveRecurringExecution,
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
    saveDraft,
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

  const handleDuplicateTransaction = useDuplicateTransaction({
    isSelectedMonthLocked,
    isQuickDayModeEnabled,
    effectiveQuickDayDate,
    transactionTagsMap,
    transactionPaymentSplitsMap,
    amountInputRef,
    applyTransactionCategorySelection,
    setTransactionCreatorSuggestionId,
    setTransactionCreatorLockedLevel1Id,
    setNewAmount,
    setNewDescription,
    setSelectedTagNames,
    setSelectedPaymentSourceId,
    setSelectedPaymentSplitItems,
    setSelectedRecurringTransactionId,
    setNewTransactionDate,
    setIsSerialTransactionCreatorEnabled,
    setTransactionDraftId,
    setTransactionDraftType,
    setTransactionCreatorInitialDate,
    setIsTransactionCreatorOpen,
  })

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
      setSelectedPaymentSourceId(reminder.payment_source_id || '')
      setSelectedRecurringTransactionId(reminder.id)
      setNewTransactionDate(getMonthCycleDate(reminder, selectedMonth))
      setTransactionCreatorSuggestionId(reminder.category_id)
      setIsSerialTransactionCreatorEnabled(false)
      setIsTransactionCreatorOpen(true)
    },
    [
      applyTransactionCategorySelection,
      selectedMonth,
      setSelectedPaymentSourceId,
      setSelectedRecurringTransactionId,
      setNewTransactionDate,
      setTransactionCreatorSuggestionId,
      setIsSerialTransactionCreatorEnabled,
      setIsTransactionCreatorOpen,
      setNewDescription,
      setNewAmount,
    ]
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
    handleUpdateCategoryIcon,
    handleDeleteCategory,
  } = useBudgetPageActions({
    profileId,
    selectedMonth,
    guardMonthUnlocked,
    categories,
    transactions: scopedTransactions,
    isPaymentSourcesEnabled: isPaymentSourcesModuleEnabled,
    newSubcategoryName,
    newSubcategoryIconKey,
    setOpenAddSubcategoryFor,
    setNewSubcategoryName,
    setNewSubcategoryIconKey,
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
    setNewSubcategoryIconKey,
  })

  const {
    previousMonthCloseReminder,
    setCurrentDayOfMonth,
    setIsPreviousMonthCloseReminderHidden,
  } = usePreviousMonthReminder({
    currentMonth,
    lockedMonthsSet,
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

  const getBudgetLimitView = useBudgetLimitViews(activeLimitStates)

  const {
    budgetLimitDataSnapshot,
    statusPanelsCtx,
    rightRailProps,
    mainPanelsProps,
    dashboardDrawerProps,
    overlaySectionProps,
  } = useBudgetAppControllerViewProps({
    activeBudgetLimitAlerts, activeBudgetLimits, activeTransactionsById, activeUtilityPanel, addableTransactionCategoryIds, applyDraftToTransactionCreator, bankSearchCategoryOptions, bankSearchPaymentSourceOptions, bankSearchResults, bankSearchState,
    bankSearchSummary, bankSearchTagOptions, budgetStartDate, bulkActionErrorText, bulkMoveTargetCategoryId, calendarHeatmapVariant, canCreateTransactions, categories, categoriesById, cleanupAllDrafts,
    clearTransactionOperationUi, clearTransactionSelection, commonBulkMoveTargets, copyPaymentSourcesBetweenKinds, currentTransactionCreatorKind, deleteDraft, deleteFinancialGoal, deletePaymentSource, deleteRecurringTransaction, descriptionSuggestions, drafts,
    draftsStatusText, effectiveVisibleModules, errorText, expenseLevel1Id, finalCategoryOptions, financialGoalMonthConfigs, financialGoalPriorities, financialGoals, formatDraftUpdatedAt, getAmountNumber,
    getBudgetLimitView, getCalendarHeatmapVariantForLevel1Id, getCategoryPathLabel, getCountForLevel2ForSelectedMonth, getDefaultPaymentSourceIdForCategoryId, getDraftLevel1Id, getDraftLocationLabel, getMoveTargetsForTransaction, getPaymentSourceOptionsForCategoryId, getRecurringOptionsForCategoryId,
    getSignedAmountForTransaction, getRootLevel1IdForCategory, getSortedLevel2Children, getSortedLevel3Children, getSumForCategoryForSelectedMonth, getSumForLevel2ForSelectedMonth, getTransactionsForCategoryAndMonthForSelectedMonth, getTransactionsForLevel1AndMonth, handleAddSubcategory, handleBankSearchFieldChange,
    handleBulkDeleteSelected, handleBulkMoveSelected, handleConfirmCategoryMigration, handleDeleteCategory, handleDeleteDescriptionSuggestion, handleDeleteTransaction, handleDuplicateTransaction, handleEmptyTrash, handleHideCategory, handleImportTransactions,
    handleInlineSaveTransaction, handleLevel1DragStart, handleLevel3DragStart, handleLockMonth, handleMoveTransaction, handleOpenCategoryCalendarAddForDay, handleOpenGlobalCalendarAddForDay, handleOpenLevel1CalendarAddForDay, handleOpenSearchForTag, handlePermanentDeleteTransaction,
    handleRenameCategory, handleUpdateCategoryIcon, handleReorderLevel1, handleReorderLevel2, handleReorderLevel3, handleRestoreCategory, handleRestoreTransaction, handleToggleSelectedMonthExcludedWithConfirm, handleUndoLastAction, handleUndoScheduledHide, handleUpdateTransaction,
    heatmapInverted, heatmapMode, hiddenCategoriesInSelectedMonth, incomeLevel1Id, isAllowedMoveTarget, isBankSearchOpen, isBudgetLimitsModuleEnabled, isCleaningAllDrafts, isDraftsLoading, isMonthCalendarModuleEnabled,
    isPaymentSourcesModuleEnabled, isRecurringTransactionsModuleEnabled, isReorderingLevel1, isSelectedMonthExcluded, isSelectedMonthLocked, isTransactionCreatorPaymentSourceVisible, isUpdatingSelectedMonthExclusion, lastUndoAction, level2SortDirection, level2SortMode,
    level3SortDirection, level3SortMode, loadData, lockedMonthsSet, migrationPromptMoveTargets, migrationPromptState, migrationPromptTransactions, newSubcategoryIconKey, newSubcategoryName, openAddSubcategoryFor, openBlankFloatingTransactionCreator,
    openLevel1CalendarIds, openLevel1Ids, openLevel2Ids, openLevel3Ids, openReminderTransactionCreator, openTransactionCreator, paymentSourceOptions, paymentSourceSettings, paymentSourceStats, paymentSources,
    previousMonthCloseReminder, profileId, recurringExecutions, recurringTransactions, reorderingLevel1Id, reorderingLevel2Id, resetBankSearch, saveDraft, saveFinancialGoal, saveGoalAllocationsForMonth, saveGoalPrioritiesForMonth,
    savePaymentSource, saveRecurringExecution, saveRecurringTransaction, scopedTransactions, searchPanelRef, selectedMonth, selectedMonthTransactions, selectedPaymentSourceId, selectedTransactionCategoryId, selectedTransactionIds,
    selectedTransactions, setActiveUtilityPanel, setBudgetLimitEditorCategoryId, setBulkActionErrorText, setBulkMoveTargetCategoryId, setDefaultPaymentSource, setGoalModeForMonth, setHeatmapInverted, setHeatmapMode, setIsBankSearchOpen,
    setIsPreviousMonthCloseReminderHidden, setLevel2SortDirection, setLevel2SortMode, setLevel3SortDirection, setLevel3SortMode, setMigrationPromptState, setNewSubcategoryIconKey, setNewSubcategoryName, setNewTransactionDate, setOpenAddSubcategoryFor, setPaymentSourceFieldVisibility,
    setSelectedPaymentSourceId, showHiddenCategories, sortedLevel1, status, styles, supabase, toggleLevel1, toggleLevel1Calendar, toggleLevel2, toggleLevel3,
    toggleTransactionSelection, transactionCategoryPathLabels, transactionPaymentSplitsMap, transactionTagsMap, transactions, trashedTransactions, trashedTransactionsById, userId, visibleModules, autoExcludePartialMonths,
    copyInviteLink, createInvitation, currentMonth, draftVisibleModules, goToNextMonth, goToPrevMonth, handleLockAllPastMonths, handleLockSelectedMonth, handleResetAllHistory, handleResetHeatmapSettings,
    handleResetSelectedMonthData, handleSaveMonthNavigationSettingsWithStartDateWarning, handleUnlockAllPastMonths, handleUnlockSelectedMonth, invitationErrorText, invitationStatusText, inviteEmail, inviteLink, isDashboardPanelOpen, isFutureMonthNavigationLocked,
    isInvitationWorking, isNextMonthNavigationBlocked, isPrevMonthNavigationBlocked, isSavingMonthNavigationSettings, activeSidebarPrimaryPanel, isSettingsPanelVisible, isUpdatingSelectedMonthLock, maxAllowedMonth, minAllowedMonth, moduleVisibilitySaveStatusText, monthNavigationErrorText,
    onCurrentUserLeftProfile, resetDraftVisibleModules, saveVisibleModules, setActiveSidebarPrimaryPanel, setAutoExcludePartialMonths, setBudgetStartDate, setCalendarHeatmapVariant, setDraftModuleVisibility, setInviteEmail, setIsDashboardPanelOpen, setIsFutureMonthNavigationLocked,
    setIsSettingsPanelVisible, setMonthNavigationErrorText, setMonthNavigationStartMonth, setSelectedMonth, setShowHiddenCategories, setSimpleMode, signOut, simpleMode, userEmail, visibleCategories,
    addBudgetLimit, amountInputRef, applyTransactionCategorySelection, budgetLimitEditorCategoryId, currentTransactionCreatorPaymentSourceOptions, deleteBudgetLimit, descriptionInputRef, draftPromptState, excludedMonthsSet, handleSaveTransaction,
    incomePaymentSourceOptions, isQuickDayModeEnabled, isSaving, isSerialTransactionCreatorEnabled, isTransactionCreatorOpen, level1, newAmount, newDescription, newTransactionDate, openFloatingTransactionCreator,
    pinnedCategoryIds, pinnedTransactionShortcutCategoriesByType, recentTransactionShortcutCategoriesByType, recurringOptionItems, recurringSuggestionItems, resetTransactionCreator, selectedLevel2Id, selectedPaymentSplitItems, selectedRecurringTransactionId, selectedTagNames,
    selectedTransactionTypeId, setDraftPromptState, setErrorText, setIsQuickDayModeEnabled, setIsSerialTransactionCreatorEnabled, setNewAmount, setNewDescription, setQuickDayDate, setSelectedLevel2Id, setSelectedPaymentSplitItems,
    setSelectedRecurringTransactionId, setSelectedTagNames, setSelectedTransactionCategoryId, setSelectedTransactionTypeIdWithPaymentSource, sortedLevel2ByParentIdForModal, sortedLevel3ByParentIdForModal, topTransactionShortcutCategoriesByType, togglePinnedCategory, updateBudgetLimit, activeLimitStates,
    transactionCreatorLockedLevel1Id, transactionCreatorSuggestionId,
  })
  return (
    <BudgetAppControllerView
      styles={styles}
      budgetLimitDataSnapshot={budgetLimitDataSnapshot}
      statusPanelsCtx={statusPanelsCtx}
      rightRailProps={rightRailProps}
      mainPanelsProps={mainPanelsProps}
      dashboardDrawerProps={dashboardDrawerProps}
      overlaySectionProps={overlaySectionProps}
    />
  )
}
