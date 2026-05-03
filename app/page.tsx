'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppSettingsPanel from '../components/AppSettingsPanel'
import BudgetHeaderPanel from '../components/BudgetHeaderPanel'
import BulkActionsBar from '../components/BulkActionsBar'
import CategoryMigrationPrompt from '../components/CategoryMigrationPrompt'
import DraftsPanel from '../components/DraftsPanel'
import DashboardPanel from '../components/DashboardPanel'
import HiddenCategoriesPanel from '../components/HiddenCategoriesPanel'
import ImportExportPanel from '../components/ImportExportPanel'
import MonthCalendarPanel from '../components/MonthCalendarPanel'
import PaymentSourcesPanel from '../components/PaymentSourcesPanel'
import ReminderBellPanel from '../components/ReminderBellPanel'
import SearchPanel from '../components/SearchPanel'
import TrashPanel from '../components/TrashPanel'
import UndoBanner from '../components/UndoBanner'
import BudgetTreeSection from '../components/BudgetTreeSection'
import BudgetPageOverlays from '../components/BudgetPageOverlays'
import FinancialGoalsContainer from '../components/FinancialGoalsContainer'
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
import { isAllowedMoveTarget as checkIsAllowedMoveTarget } from '../lib/isAllowedMoveTarget'
import { useBudgetPageData } from '../lib/useBudgetPageData'
import { useRecurringOptions } from '../lib/useRecurringOptions'
import { useOpenSearchForTag } from '../lib/useOpenSearchForTag'
import { useBudgetPageOverlayProps } from '../lib/useBudgetPageOverlayProps'
import { useAppModuleVisibility } from '../lib/useAppModuleVisibility'
import { getNextMonthText, getPrevMonthText } from '../lib/dateUtils'

type MigrationPromptState = {
  categoryId: string
  mode: HideMode
  hideMonth: string
  transactionIds: string[]
  targetCategoryId: string
  errorText: string
}

export default function Home() {
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
  const profileId = '4d206618-95ba-44e8-989b-90e139314ac9'

  const styles = budgetPageStyles
  const {
    visibleModules,
    draftVisibleModules,
    saveStatusText: moduleVisibilitySaveStatusText,
    setDraftModuleVisibility,
    saveVisibleModules,
    resetDraftVisibleModules,
  } = useAppModuleVisibility()

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
    transactions,
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
    heatmapMode,
    setHeatmapMode,
    heatmapInverted,
    setHeatmapInverted,
    handleResetHeatmapSettings,
    getRootLevel1IdForCategory,
    getSignedAmountForTransaction,
    getCalendarHeatmapVariantForLevel1Id,
  } = useHeatmap({
    categoriesById,
    incomeLevel1Id,
    expenseLevel1Id,
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
    transactions,
    categories,
    categoriesById,
    getSignedAmountForTransaction,
    transactionPaymentSplitsMap,
    tags,
    transactionTagsMap,
  })

  const { handleOpenSearchForTag } = useOpenSearchForTag({
    searchPanelRef,
    setIsBankSearchOpen,
    handleBankSearchFieldChange,
  })

  const {
    getTransactionsForLevel1AndMonth,
    getTransactionsForCategoryAndMonthForSelectedMonth,
    getSumForCategoryForSelectedMonth,
    getSumForLevel2ForSelectedMonth,
    getCountForLevel2ForSelectedMonth,
    getCategoryCountForSelectedMonth,
  } = useBudgetTreeMetrics({
    transactions,
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
    transactions,
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
    transactions,
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
    paymentSources,
    paymentSourceOptions,
    incomePaymentSourceOptions,
    expensePaymentSourceOptions,
    paymentSourceSettings,
    selectedTransactionTypeId,
    transactionCreatorLockedLevel1Id,
    getRootLevel1IdForCategory,
    setSelectedPaymentSourceId,
    setSelectedTransactionTypeId,
  })

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
    recurringTransactions,
    recurringExecutions,
    transactions,
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

  const handleTransactionSavedWithReminderStatus = useCallback(
    async (transaction: Transaction) => {
      if (!visibleModules.recurringTransactions) {
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
    [saveRecurringReminderMonthStatus, selectedRecurringTransactionId, visibleModules.recurringTransactions]
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
    transactions,
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
    const monthTransactions = transactions.filter(
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
      .gte('date', `${selectedMonth}-01`)
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
    selectedMonth,
    transactions,
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadData])

  useEffect(() => {
    const refreshCurrentDay = () => {
      setCurrentDayOfMonth(new Date().getDate())
    }

    refreshCurrentDay()

    const intervalId = window.setInterval(refreshCurrentDay, 60 * 1000)
    window.addEventListener('focus', refreshCurrentDay)
    document.addEventListener('visibilitychange', refreshCurrentDay)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshCurrentDay)
      document.removeEventListener('visibilitychange', refreshCurrentDay)
    }
  }, [])

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
    transactions,
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
    transactions,
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

  useEffect(() => {
    const activeTransactionIds = new Set(transactions.map((transaction) => transaction.id))
    setSelectedTransactionIds((prev) => prev.filter((id) => activeTransactionIds.has(id)))
  }, [transactions, setSelectedTransactionIds])

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
  }, [bulkMoveTargetCategoryId, commonBulkMoveTargets, setBulkMoveTargetCategoryId])

  useEffect(() => {
    if (!migrationPromptState?.targetCategoryId) {
      return
    }

    const isStillAvailable = migrationPromptMoveTargets.some(
      (target) => target.id === migrationPromptState.targetCategoryId
    )

    if (!isStillAvailable) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      transactions,
      selectedMonth,
      selectedTransactionCategoryId,
      selectedLevel2Id,
      selectedTransactionTypeId,
      newAmount,
      newDescription,
      categoriesById,
      isEnabled: visibleModules.recurringTransactions,
    })

  const getRecurringOptionsForCategoryId = useCallback(
    (categoryId: string) => {
      if (!visibleModules.recurringTransactions) {
        return []
      }

      return recurringTransactions
        .filter(
          (reminder) =>
            reminder.category_id === categoryId && isRecurringExpectedInMonth(reminder, selectedMonth)
        )
        .map((reminder) => {
          const hasTransactionInMonth = transactions.some(
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
      transactions,
      visibleModules.recurringTransactions,
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

  const budgetPageOverlayProps = useBudgetPageOverlayProps({
    canCreateTransactions: canCreateTransactions && visibleModules.floatingActions,
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
  })

  return (
    <main style={styles.page}>
      <div style={styles.pageTitle}>Budżet testowy</div>
      <div style={styles.pageSubtitle}>Wersja robocza do wygodniejszego klikania i testowania</div>

      <BudgetHeaderPanel
        selectedMonth={selectedMonth}
        currentMonth={currentMonth}
        status={status}
        categoriesCount={categories.length}
        visibleCategoriesCount={visibleCategories.length}
        transactionsCount={transactions.length}
        hiddenCategoriesCount={hiddenCategoriesInSelectedMonth.length}
        showHiddenCategories={showHiddenCategories}
        errorText={errorText}
        minAllowedMonth={minAllowedMonth}
        maxAllowedMonth={maxAllowedMonth}
        monthNavigationStartMonth={monthNavigationStartMonth}
        budgetStartDate={budgetStartDate}
        monthNavigationFutureLocked={isFutureMonthNavigationLocked}
        isSavingMonthNavigationSettings={isSavingMonthNavigationSettings}
        monthNavigationErrorText={monthNavigationErrorText}
        isPrevMonthNavigationBlocked={isPrevMonthNavigationBlocked}
        isNextMonthNavigationBlocked={isNextMonthNavigationBlocked}
        isSelectedMonthLocked={isSelectedMonthLocked}
        isUpdatingSelectedMonthLock={isUpdatingSelectedMonthLock}
        isSelectedMonthExcluded={isSelectedMonthExcluded}
        isUpdatingSelectedMonthExclusion={isUpdatingSelectedMonthExclusion}
        heatmapMode={heatmapMode}
        heatmapInverted={heatmapInverted}
        onHeatmapModeChange={setHeatmapMode}
        onHeatmapInvertedChange={setHeatmapInverted}
        onResetHeatmapSettings={handleResetHeatmapSettings}
        onPrevMonth={goToPrevMonth}
        onNextMonth={goToNextMonth}
        onLockSelectedMonth={handleLockSelectedMonth}
        onUnlockSelectedMonth={handleUnlockSelectedMonth}
        onToggleHidden={() => setShowHiddenCategories((prev) => !prev)}
        onMonthNavigationStartMonthChange={(value) => {
          setMonthNavigationStartMonth(value)
          setMonthNavigationErrorText('')
        }}
        onBudgetStartDateChange={(value) => {
          setBudgetStartDate(value)
          setMonthNavigationStartMonth(value.slice(0, 7))
          setMonthNavigationErrorText('')
        }}
        onMonthNavigationFutureLockedChange={(value) => {
          setIsFutureMonthNavigationLocked(value)
          setMonthNavigationErrorText('')
        }}
        onSaveMonthNavigationSettings={handleSaveMonthNavigationSettingsWithStartDateWarning}
        onToggleSelectedMonthExcluded={handleToggleSelectedMonthExcludedWithConfirm}
        styles={styles}
      />

      {previousMonthCloseReminder && (
        <div style={styles.infoBox}>
          Poprzedni miesiąc {previousMonthCloseReminder} nie jest jeszcze zamknięty.
          <div style={{ ...styles.actions, marginTop: 8 }}>
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
              Zamknij poprzedni miesiąc
            </button>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => setIsPreviousMonthCloseReminderHidden(true)}
            >
              Przypomnij później
            </button>
          </div>
        </div>
      )}

      {visibleModules.recurringTransactions && (
        <div style={{ ...styles.topPanel, display: 'flex', justifyContent: 'flex-end' }}>
          <ReminderBellPanel
            selectedMonth={currentMonth}
            recurringTransactions={recurringTransactions}
            recurringReminderMonthStatuses={recurringReminderMonthStatuses}
            transactions={transactions}
            categoriesById={categoriesById}
            styles={styles}
            onAddFromReminder={openReminderTransactionCreator}
            categoryOptions={finalCategoryOptions}
            onSaveReminder={saveRecurringTransaction}
            onDeleteReminder={deleteRecurringTransaction}
            onMarkRead={(reminder) =>
              saveRecurringReminderMonthStatus({
                reminderId: reminder.id,
                month: currentMonth,
                status: 'read',
              })
            }
          />
        </div>
      )}

      <AppSettingsPanel
        visibleModules={visibleModules}
        draftVisibleModules={draftVisibleModules}
        saveStatusText={moduleVisibilitySaveStatusText}
        onChangeModuleVisibility={setDraftModuleVisibility}
        onSave={saveVisibleModules}
        onResetDraft={resetDraftVisibleModules}
        onLockAllPastMonths={handleLockAllPastMonths}
        onUnlockAllPastMonths={handleUnlockAllPastMonths}
        onResetSelectedMonthData={handleResetSelectedMonthData}
        onResetAllHistory={handleResetAllHistory}
        styles={styles}
      />

      {visibleModules.dashboard && (
        <DashboardPanel
          profileId={profileId}
          styles={styles}
          transactions={transactions}
          transactionTagsMap={transactionTagsMap}
          categoriesById={categoriesById}
          selectedMonth={selectedMonth}
          budgetStartDate={budgetStartDate}
          excludedMonthsSet={excludedMonthsSet}
          getSignedAmountForTransaction={getSignedAmountForTransaction}
        />
      )}

      {lastUndoAction && selectedTransactionIds.length === 0 && !migrationPromptState && (
        <UndoBanner
          label={lastUndoAction.label}
          onUndo={() =>
            handleUndoLastAction({
              activeTransactionsById,
              trashedTransactionsById,
              supabase,
              clearTransactionOperationUi,
              loadData,
            })
          }
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
          modeLabel={migrationPromptState.mode === 'now' ? 'ukryj teraz' : 'ukryj od następnego'}
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
          onConfirm={() => handleConfirmCategoryMigration(migrationPromptState)}
          onCancel={() => clearTransactionOperationUi()}
          styles={styles}
        />
      )}

      {visibleModules.bulkActions && canCreateTransactions && (
        <BulkActionsBar
          selectedCount={selectedTransactionIds.length}
          targetCategoryId={bulkMoveTargetCategoryId}
          moveTargets={commonBulkMoveTargets}
          errorText={bulkActionErrorText}
          onTargetCategoryChange={(value) => {
            setBulkMoveTargetCategoryId(value)
            setBulkActionErrorText('')
          }}
          onDeleteSelected={() =>
            handleBulkDeleteSelected({
              selectedTransactions,
              supabase,
              clearTransactionOperationUi,
              loadData,
            })
          }
          onMoveSelected={() =>
            handleBulkMoveSelected({
              selectedTransactions,
              bulkMoveTargetCategoryId,
              isAllowedMoveTarget,
              supabase,
              clearTransactionOperationUi,
              loadData,
            })
          }
          onClearSelection={clearTransactionSelection}
          styles={styles}
        />
      )}

      {visibleModules.drafts && (
        <DraftsPanel
          draftsStatusText={draftsStatusText}
          isDraftsLoading={isDraftsLoading}
          drafts={drafts}
          isCleaningAllDrafts={isCleaningAllDrafts}
          cleanupAllDrafts={() => {
            void cleanupAllDrafts()
          }}
          getDraftLevel1Id={getDraftLevel1Id}
          formatDraftUpdatedAt={formatDraftUpdatedAt}
          getDraftLocationLabel={getDraftLocationLabel}
          applyDraftToTransactionCreator={applyDraftToTransactionCreator}
          deleteDraft={deleteDraft}
          styles={styles}
        />
      )}

      {visibleModules.importExport && (
        <ImportExportPanel
          selectedMonth={selectedMonth}
          categories={categories}
          categoriesById={categoriesById}
          transactions={transactions}
          trashedTransactions={trashedTransactions}
          transactionPaymentSplitsMap={transactionPaymentSplitsMap}
          importableCategoryIds={addableTransactionCategoryIds}
          categoryPathLabels={transactionCategoryPathLabels}
          defaultCategoryId={selectedTransactionCategoryId}
          isSelectedMonthLocked={isSelectedMonthLocked}
          canCreateTransactions={canCreateTransactions}
          getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
          onImportRows={handleImportTransactions}
          styles={styles}
        />
      )}

      {visibleModules.paymentSources && (
        <PaymentSourcesPanel
        paymentSources={paymentSources}
        paymentSourceStats={paymentSourceStats}
        paymentSourceSettings={paymentSourceSettings}
        onSave={async (input) => {
          try {
            await savePaymentSource(input)
          } catch (error) {
            if (error instanceof Error) {
              alert(`Błąd zapisu źródła płatności: ${error.message}`)
            }
          }
        }}
        onDelete={async (paymentSourceId) => {
          try {
            await deletePaymentSource(paymentSourceId)
          } catch (error) {
            if (error instanceof Error) {
              alert(`Błąd usuwania źródła płatności: ${error.message}`)
            }
          }
        }}
        onSetDefault={async (kind, paymentSourceId) => {
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
        }}
        onSetFieldVisibility={async (kind, isVisible) => {
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
        }}
        onCopyList={async (sourceKind, targetKind) => {
          try {
            await copyPaymentSourcesBetweenKinds(sourceKind, targetKind)
          } catch (error) {
            if (error instanceof Error) {
              alert(`Błąd kopiowania list źródeł: ${error.message}`)
            }
          }
        }}
        styles={styles}
        />
      )}

      {visibleModules.financialGoals && (
        <FinancialGoalsContainer
          selectedMonth={selectedMonth}
          goals={financialGoals}
          goalPriorities={financialGoalPriorities}
          goalMonthConfigs={financialGoalMonthConfigs}
          transactions={transactions}
          lockedMonthsSet={lockedMonthsSet}
          getSignedAmountForTransaction={getSignedAmountForTransaction}
          onSaveGoal={saveFinancialGoal}
          onDeleteGoal={deleteFinancialGoal}
          onSetGoalModeForMonth={setGoalModeForMonth}
          onSaveGoalAllocationsForMonth={saveGoalAllocationsForMonth}
          onReorderGoalsForMonth={saveGoalPrioritiesForMonth}
          styles={styles}
        />
      )}

      {visibleModules.bankSearch && (
        <SearchPanel
          ref={searchPanelRef}
          isOpen={isBankSearchOpen}
          setIsOpen={setIsBankSearchOpen}
          searchState={bankSearchState}
          onFieldChange={handleBankSearchFieldChange}
          onToggleTagId={handleBankSearchToggleTagId}
          onReset={resetBankSearch}
          results={bankSearchResults}
          summary={bankSearchSummary}
          categoryOptions={bankSearchCategoryOptions}
          paymentSourceOptions={bankSearchPaymentSourceOptions}
          tagOptions={bankSearchTagOptions}
          transactionTagsMap={transactionTagsMap}
          transactionPaymentSplitsMap={transactionPaymentSplitsMap}
          categoriesById={categoriesById}
          onOpenSearchForTag={handleOpenSearchForTag}
          styles={styles}
        />
      )}

      {visibleModules.monthCalendar && (
        <MonthCalendarPanel
        selectedMonth={selectedMonth}
        transactions={selectedMonthTransactions}
        budgetStartDate={budgetStartDate}
        isSelectedMonthExcluded={isSelectedMonthExcluded}
        onToggleSelectedMonthExcluded={handleToggleSelectedMonthExcludedWithConfirm}
        isUpdatingSelectedMonthExclusion={isUpdatingSelectedMonthExclusion}
        styles={styles}
        isSelectedMonthLocked={isSelectedMonthLocked}
        getAmountNumber={getAmountNumber}
        getMoveTargetsForTransaction={getMoveTargetsForTransaction}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
        onUpdateTransaction={handleUpdateTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        onMoveTransaction={handleMoveTransaction}
        onAddTransactionForDay={handleOpenGlobalCalendarAddForDay}
        calendarTitle="Kalendarz miesiąca"
        calendarSubtitle="Kliknij dzień, aby zobaczyć wpisy z tego dnia lub dodać nowy wpis."
        heatmapMode={heatmapMode}
        onHeatmapModeChange={setHeatmapMode}
        heatmapInverted={heatmapInverted}
        onHeatmapInvertedChange={setHeatmapInverted}
        heatmapVariant="balance"
        showHeatmapControls={false}
        descriptionSuggestions={descriptionSuggestions}
        getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
        transactionTagsMap={transactionTagsMap}
        transactionPaymentSplitsMap={transactionPaymentSplitsMap}
        onTagClick={handleOpenSearchForTag}
        onDeleteDescriptionSuggestion={handleDeleteDescriptionSuggestion}
        />
      )}

      {visibleModules.budgetTree && (
        <BudgetTreeSection
        sortedLevel1={sortedLevel1}
        openLevel1Ids={openLevel1Ids}
        openLevel1CalendarIds={openLevel1CalendarIds}
        openLevel2Ids={openLevel2Ids}
        openLevel3Ids={openLevel3Ids}
        selectedMonth={selectedMonth}
        isSelectedMonthLocked={isSelectedMonthLocked}
        openAddSubcategoryFor={openAddSubcategoryFor}
        newSubcategoryName={newSubcategoryName}
        selectedTransactionIds={selectedTransactionIds}
        isReorderingLevel1={isReorderingLevel1}
        reorderingLevel1Id={reorderingLevel1Id}
        reorderingLevel2Id={reorderingLevel2Id}
        styles={styles}
        level2SortMode={level2SortMode}
        setLevel2SortMode={setLevel2SortMode}
        level2SortDirection={level2SortDirection}
        setLevel2SortDirection={setLevel2SortDirection}
        level3SortMode={level3SortMode}
        setLevel3SortMode={setLevel3SortMode}
        level3SortDirection={level3SortDirection}
        setLevel3SortDirection={setLevel3SortDirection}
        toggleLevel1={toggleLevel1}
        toggleLevel1Calendar={toggleLevel1Calendar}
        toggleLevel2={toggleLevel2}
        toggleLevel3={toggleLevel3}
        setOpenAddSubcategoryFor={setOpenAddSubcategoryFor}
        setNewSubcategoryName={setNewSubcategoryName}
        getSortedLevel2Children={getSortedLevel2Children}
        getSortedLevel3Children={getSortedLevel3Children}
        getTransactionsForLevel1AndMonth={getTransactionsForLevel1AndMonth}
        getTransactionsForCategoryAndMonthForSelectedMonth={
          getTransactionsForCategoryAndMonthForSelectedMonth
        }
        getSumForCategoryForSelectedMonth={getSumForCategoryForSelectedMonth}
        getSumForLevel2ForSelectedMonth={getSumForLevel2ForSelectedMonth}
        getCountForLevel2ForSelectedMonth={getCountForLevel2ForSelectedMonth}
        getAmountNumber={getAmountNumber}
        getMoveTargetsForTransaction={getMoveTargetsForTransaction}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
        getCalendarHeatmapVariantForLevel1Id={getCalendarHeatmapVariantForLevel1Id}
        heatmapMode={heatmapMode}
        heatmapInverted={heatmapInverted}
        onHeatmapModeChange={setHeatmapMode}
        onHeatmapInvertedChange={setHeatmapInverted}
        handleAddSubcategory={handleAddSubcategory}
        handleRenameCategory={handleRenameCategory}
        handleDeleteCategory={handleDeleteCategory}
        openTransactionCreator={openTransactionCreator}
        handleInlineSaveTransaction={handleInlineSaveTransaction}
        handleHideCategory={handleHideCategory}
        handleRestoreCategory={handleRestoreCategory}
        handleUndoScheduledHide={handleUndoScheduledHide}
        handleDeleteTransaction={handleDeleteTransaction}
        handleUpdateTransaction={handleUpdateTransaction}
        handleMoveTransaction={handleMoveTransaction}
        handleOpenCategoryCalendarAddForDay={handleOpenCategoryCalendarAddForDay}
        handleOpenLevel1CalendarAddForDay={handleOpenLevel1CalendarAddForDay}
        toggleTransactionSelection={toggleTransactionSelection}
        handleLevel3DragStart={handleLevel3DragStart}
        handleReorderLevel3={handleReorderLevel3}
        handleLevel1DragStart={handleLevel1DragStart}
        handleReorderLevel1={handleReorderLevel1}
        handleReorderLevel2={handleReorderLevel2}
        descriptionSuggestions={descriptionSuggestions}
        getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
        getRecurringOptionsForCategoryId={getRecurringOptionsForCategoryId}
        transactionTagsMap={transactionTagsMap}
        transactionPaymentSplitsMap={transactionPaymentSplitsMap}
        onTagClick={handleOpenSearchForTag}
        onDeleteDescriptionSuggestion={handleDeleteDescriptionSuggestion}
        />
      )}

      {visibleModules.hiddenCategories && (
        <HiddenCategoriesPanel
          categories={hiddenCategoriesInSelectedMonth}
          categoriesById={categoriesById}
          showHiddenCategories={showHiddenCategories}
          getHiddenCategoryLabel={getHiddenCategoryLabel}
          handleRestoreCategory={handleRestoreCategory}
          styles={styles}
        />
      )}

      {visibleModules.trash && (
        <TrashPanel
          transactions={trashedTransactions}
          categoriesById={categoriesById}
          getAmountNumber={getAmountNumber}
          onRestoreTransaction={handleRestoreTransaction}
          onPermanentDeleteTransaction={handlePermanentDeleteTransaction}
          onEmptyTrash={handleEmptyTrash}
          styles={styles}
        />
      )}

      <BudgetPageOverlays {...budgetPageOverlayProps} />
    </main>
  )
}
