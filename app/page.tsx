'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BudgetHeaderPanel from '../components/BudgetHeaderPanel'
import BulkActionsBar from '../components/BulkActionsBar'
import CategoryMigrationPrompt from '../components/CategoryMigrationPrompt'
import DraftsPanel from '../components/DraftsPanel'
import DashboardPanel from '../components/DashboardPanel'
import HiddenCategoriesPanel from '../components/HiddenCategoriesPanel'
import ImportExportPanel from '../components/ImportExportPanel'
import MonthCalendarPanel from '../components/MonthCalendarPanel'
import PaymentSourcesPanel from '../components/PaymentSourcesPanel'
import RecurringTransactionsPanel from '../components/RecurringTransactionsPanel'
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
import { buildRecurringCompletionCandidates } from '../lib/recurringTransactions'
import { useFinancialGoals } from '../lib/useFinancialGoals'
import { isAllowedMoveTarget as checkIsAllowedMoveTarget } from '../lib/isAllowedMoveTarget'
import { useBudgetPageData } from '../lib/useBudgetPageData'
import { useRecurringOptions } from '../lib/useRecurringOptions'
import { useOpenSearchForTag } from '../lib/useOpenSearchForTag'
import { useBudgetPageOverlayProps } from '../lib/useBudgetPageOverlayProps'

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
  const [recurringCompletionPrompt, setRecurringCompletionPrompt] = useState<{
    transaction: Transaction
    candidates: ReturnType<typeof buildRecurringCompletionCandidates>
  } | null>(null)

  const amountInputRef = useRef<HTMLInputElement | null>(null)
  const descriptionInputRef = useRef<HTMLInputElement | null>(null)
  const searchPanelRef = useRef<HTMLDivElement | null>(null)
  const profileId = '4d206618-95ba-44e8-989b-90e139314ac9'

  const styles = budgetPageStyles
  const SHOW_RECURRING_STAGE_15 = false

  const {
    selectedMonth,
    setSelectedMonth,
    currentMonth,
    monthNavigationStartMonth,
    setMonthNavigationStartMonth,
    isFutureMonthNavigationLocked,
    setIsFutureMonthNavigationLocked,
    isSavingMonthNavigationSettings,
    monthNavigationErrorText,
    setMonthNavigationErrorText,
    lockedMonthsSet,
    isUpdatingSelectedMonthLock,
    isSelectedMonthLocked,
    minAllowedMonth,
    maxAllowedMonth,
    isPrevMonthNavigationBlocked,
    isNextMonthNavigationBlocked,
    loadMonthNavigationSettings,
    loadLockedMonths,
    handleSaveMonthNavigationSettings,
    handleLockSelectedMonth,
    handleUnlockSelectedMonth,
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
    loadRecurringTransactions,
    saveRecurringTransaction,
    saveRecurringExecution,
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
    openRecurringTransactionCreator,
    handleTransactionSaved,
    handleConfirmRecurringCompletion,
    handleSkipRecurringInMonth,
  } = useRecurringTransactionCreator({
    recurringTransactions,
    recurringExecutions,
    transactions,
    categoriesById,
    selectedMonth,
    selectedRecurringTransactionId,
    newDescription,
    paymentSourceSettings,
    getRootLevel1IdForCategory,
    getDraftTypeForLevel1Id,
    getPaymentSourceKindForLevel1Id,
    applyTransactionCategorySelection,
    saveRecurringExecution,
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
    setRecurringCompletionPrompt,
    restoreDescriptionSuggestion,
  })

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
    loadPaymentSources,
    loadRecurringTransactions,
    loadFinancialGoals,
    loadDrafts,
  })

  const { handleImportTransactions, handleAddSubcategory } = useBudgetPageActions({
    profileId,
    selectedMonth,
    guardMonthUnlocked,
    categories,
    newSubcategoryName,
    setOpenAddSubcategoryFor,
    setNewSubcategoryName,
    loadData,
  })

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadData])

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
    onTransactionSaved: handleTransactionSaved,
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
      selectedMonth,
      selectedTransactionCategoryId,
      selectedLevel2Id,
      selectedTransactionTypeId,
      newAmount,
      newDescription,
      categoriesById,
    })

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

    SHOW_RECURRING_STAGE_15,
    recurringCompletionPrompt,
    handleConfirmRecurringCompletion,
    setRecurringCompletionPrompt,
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
        monthNavigationFutureLocked={isFutureMonthNavigationLocked}
        isSavingMonthNavigationSettings={isSavingMonthNavigationSettings}
        monthNavigationErrorText={monthNavigationErrorText}
        isPrevMonthNavigationBlocked={isPrevMonthNavigationBlocked}
        isNextMonthNavigationBlocked={isNextMonthNavigationBlocked}
        isSelectedMonthLocked={isSelectedMonthLocked}
        isUpdatingSelectedMonthLock={isUpdatingSelectedMonthLock}
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
        onMonthNavigationFutureLockedChange={(value) => {
          setIsFutureMonthNavigationLocked(value)
          setMonthNavigationErrorText('')
        }}
        onSaveMonthNavigationSettings={handleSaveMonthNavigationSettings}
        styles={styles}
      />

      <DashboardPanel
        profileId={profileId}
        styles={styles}
        transactions={transactions}
        categoriesById={categoriesById}
        selectedMonth={selectedMonth}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
      />

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

      {canCreateTransactions && (
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

      {SHOW_RECURRING_STAGE_15 && (
        <RecurringTransactionsPanel
          selectedMonth={selectedMonth}
          isSelectedMonthLocked={isSelectedMonthLocked}
          recurringTransactions={recurringTransactions}
          recurringExecutions={recurringExecutions}
          categoriesById={categoriesById}
          paymentSources={paymentSources}
          transactionsById={activeTransactionsById}
          categoryOptions={finalCategoryOptions}
          onSaveRecurringTransaction={saveRecurringTransaction}
          onSkipRecurringInMonth={async (recurring, generatedForDate) => {
            try {
              await handleSkipRecurringInMonth(recurring.id, generatedForDate)
            } catch (error) {
              if (error instanceof Error) {
                alert(`Błąd zapisu historii przypomnienia: ${error.message}`)
              }
            }
          }}
          onOpenCreateFromRecurring={(recurring) => {
            openRecurringTransactionCreator(recurring.id)
          }}
          onOpenCreateFromExecution={(recurring, execution) => {
            openRecurringTransactionCreator(recurring.id, execution.id)
          }}
          styles={styles}
        />
      )}

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

      <MonthCalendarPanel
        selectedMonth={selectedMonth}
        transactions={selectedMonthTransactions}
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
        handleAddSubcategory={handleAddSubcategory}
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
        transactionTagsMap={transactionTagsMap}
        transactionPaymentSplitsMap={transactionPaymentSplitsMap}
        onTagClick={handleOpenSearchForTag}
        onDeleteDescriptionSuggestion={handleDeleteDescriptionSuggestion}
      />

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
        onPermanentDeleteTransaction={handlePermanentDeleteTransaction}
        onEmptyTrash={handleEmptyTrash}
        styles={styles}
      />

      <BudgetPageOverlays {...budgetPageOverlayProps} />
    </main>
  )
}