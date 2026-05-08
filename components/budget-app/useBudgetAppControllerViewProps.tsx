'use client'

import { useCallback, useMemo } from 'react'
import type { SaveBudgetLimitInput } from '../../lib/useBudgetLimits'
import { getCategoryPathLabel } from '../../lib/budgetPageHelpers'
import type { BudgetLimitView } from '../BudgetLimitIndicator'
import { useBudgetOverlayProps } from './useBudgetOverlayProps'
import { useBudgetPageMainPanelsProps } from './useBudgetPageMainPanelsProps'
import { useBudgetWorkspaceSummary } from './useBudgetWorkspaceSummary'

type BudgetAppControllerViewPropsContext = Record<string, any>

const GLOBAL_BUDGET_LIMIT_KEY = '__global__'

const getBudgetLimitKey = (categoryId: string | null) => categoryId || GLOBAL_BUDGET_LIMIT_KEY
const zeroForCategory = () => 0
const noRootCategory = () => null
const fallbackSignedAmount = () => 0

export function useBudgetAppControllerViewProps(ctx: BudgetAppControllerViewPropsContext) {
  const {
    activeBudgetLimitAlerts,
    activeBudgetLimits,
    activeLimitStates,
    addBudgetLimit,
    budgetLimitEditorCategoryId,
    categoriesById,
    deleteBudgetLimit,
    editedBudgetLimitView: ignoredEditedBudgetLimitView,
    effectiveVisibleModules,
    getBudgetLimitView,
    isBudgetLimitsModuleEnabled,
    selectedMonth,
    setBudgetLimitEditorCategoryId,
    setErrorText,
    updateBudgetLimit,
  } = ctx

  void ignoredEditedBudgetLimitView

  const editedBudgetLimitView = useMemo(() => {
    if (budgetLimitEditorCategoryId === undefined) {
      return null
    }

    return getBudgetLimitView(budgetLimitEditorCategoryId)
  }, [budgetLimitEditorCategoryId, getBudgetLimitView])

  const getSignedAmountForTransaction =
    typeof ctx.getSignedAmountForTransaction === 'function'
      ? ctx.getSignedAmountForTransaction
      : fallbackSignedAmount
  const getRootLevel1IdForCategory =
    typeof ctx.getRootLevel1IdForCategory === 'function'
      ? ctx.getRootLevel1IdForCategory
      : noRootCategory
  const getSumForCategoryForSelectedMonth =
    typeof ctx.getSumForCategoryForSelectedMonth === 'function'
      ? ctx.getSumForCategoryForSelectedMonth
      : zeroForCategory
  const getCategoryCountForSelectedMonth =
    typeof ctx.getCategoryCountForSelectedMonth === 'function'
      ? ctx.getCategoryCountForSelectedMonth
      : zeroForCategory

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
    [addBudgetLimit, editedBudgetLimitView, setErrorText, updateBudgetLimit]
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
    [deleteBudgetLimit, setErrorText]
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
    [deleteBudgetLimit, selectedMonth, setErrorText]
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

  const budgetWorkspaceSummary = useBudgetWorkspaceSummary({
    selectedMonth,
    scopedTransactions: ctx.scopedTransactions,
    selectedMonthTransactions: ctx.selectedMonthTransactions,
    pinnedCategoryIds: ctx.pinnedCategoryIds,
    addableTransactionCategoryIds: ctx.addableTransactionCategoryIds,
    categories: ctx.categories,
    categoriesById,
    expenseLevel1Id: ctx.expenseLevel1Id,
    transactionCategoryPathLabels: ctx.transactionCategoryPathLabels,
    getSignedAmountForTransaction,
    getRootLevel1IdForCategory,
    getSumForCategoryForSelectedMonth,
    getCategoryCountForSelectedMonth,
  })

  const viewCtx = {
    ...ctx,
    ...budgetWorkspaceSummary,
    getSignedAmountForTransaction,
    getRootLevel1IdForCategory,
    getSumForCategoryForSelectedMonth,
    getCategoryCountForSelectedMonth,
  }

  const budgetPageOverlayProps = useBudgetOverlayProps({
    canCreateTransactions: ctx.canCreateTransactions,
    expenseLevel1Id: ctx.expenseLevel1Id,
    incomeLevel1Id: ctx.incomeLevel1Id,
    openFloatingTransactionCreator: ctx.openFloatingTransactionCreator,
    isTransactionCreatorOpen: ctx.isTransactionCreatorOpen,
    selectedMonth: ctx.selectedMonth,
    level1: ctx.level1,
    sortedLevel2ByParentIdForModal: ctx.sortedLevel2ByParentIdForModal,
    sortedLevel3ByParentIdForModal: ctx.sortedLevel3ByParentIdForModal,
    categoriesById: ctx.categoriesById,
    transactionCreatorSuggestionId: ctx.transactionCreatorSuggestionId,
    transactionCreatorLockedLevel1Id: ctx.transactionCreatorLockedLevel1Id,
    topTransactionShortcutCategoriesByType: ctx.topTransactionShortcutCategoriesByType,
    recentTransactionShortcutCategoriesByType: ctx.recentTransactionShortcutCategoriesByType,
    pinnedTransactionShortcutCategoriesByType: ctx.pinnedTransactionShortcutCategoriesByType,
    pinnedCategoryIds: ctx.pinnedCategoryIds,
    togglePinnedCategory: ctx.togglePinnedCategory,
    descriptionSuggestions: ctx.descriptionSuggestions,
    applyTransactionCategorySelection: ctx.applyTransactionCategorySelection,
    selectedTransactionTypeId: ctx.selectedTransactionTypeId,
    setSelectedTransactionTypeIdWithPaymentSource: ctx.setSelectedTransactionTypeIdWithPaymentSource,
    selectedLevel2Id: ctx.selectedLevel2Id,
    setSelectedLevel2Id: ctx.setSelectedLevel2Id,
    selectedTransactionCategoryId: ctx.selectedTransactionCategoryId,
    setSelectedTransactionCategoryId: ctx.setSelectedTransactionCategoryId,
    isSerialTransactionCreatorEnabled: ctx.isSerialTransactionCreatorEnabled,
    setIsSerialTransactionCreatorEnabled: ctx.setIsSerialTransactionCreatorEnabled,
    isQuickDayModeEnabled: ctx.isQuickDayModeEnabled,
    setIsQuickDayModeEnabled: ctx.setIsQuickDayModeEnabled,
    setQuickDayDate: ctx.setQuickDayDate,
    newAmount: ctx.newAmount,
    setNewAmount: ctx.setNewAmount,
    newDescription: ctx.newDescription,
    setNewDescription: ctx.setNewDescription,
    newTransactionDate: ctx.newTransactionDate,
    setNewTransactionDate: ctx.setNewTransactionDate,
    selectedTagNames: ctx.selectedTagNames,
    setSelectedTagNames: ctx.setSelectedTagNames,
    selectedPaymentSourceId: ctx.selectedPaymentSourceId,
    setSelectedPaymentSourceId: ctx.setSelectedPaymentSourceId,
    currentTransactionCreatorPaymentSourceOptions: ctx.isPaymentSourcesModuleEnabled
      ? ctx.currentTransactionCreatorPaymentSourceOptions
      : [],
    isTransactionCreatorPaymentSourceVisible:
      ctx.isPaymentSourcesModuleEnabled && ctx.isTransactionCreatorPaymentSourceVisible,
    selectedPaymentSplitItems: ctx.isPaymentSourcesModuleEnabled ? ctx.selectedPaymentSplitItems : [],
    setSelectedPaymentSplitItems: ctx.setSelectedPaymentSplitItems,
    selectedRecurringTransactionId: ctx.isRecurringTransactionsModuleEnabled
      ? ctx.selectedRecurringTransactionId
      : '',
    setSelectedRecurringTransactionId: ctx.setSelectedRecurringTransactionId,
    recurringOptionItems: ctx.isRecurringTransactionsModuleEnabled ? ctx.recurringOptionItems : [],
    recurringSuggestionItems: ctx.isRecurringTransactionsModuleEnabled ? ctx.recurringSuggestionItems : [],
    isSaving: ctx.isSaving,
    resetTransactionCreator: ctx.resetTransactionCreator,
    handleSaveTransaction: ctx.handleSaveTransaction,
    amountInputRef: ctx.amountInputRef,
    descriptionInputRef: ctx.descriptionInputRef,
    styles: ctx.styles,
    handleDeleteDescriptionSuggestion: ctx.handleDeleteDescriptionSuggestion,
    draftPromptState: ctx.draftPromptState,
    setDraftPromptState: ctx.setDraftPromptState,
    applyDraftToTransactionCreator: ctx.applyDraftToTransactionCreator,
    deleteDraft: ctx.deleteDraft,
    openBlankFloatingTransactionCreator: ctx.openBlankFloatingTransactionCreator,
  })

  const mainPanelsProps = useBudgetPageMainPanelsProps(viewCtx)

  const statusPanelsCtx = {
    activeSidebarPrimaryPanel: ctx.activeSidebarPrimaryPanel,
    activeUtilityPanel: ctx.activeUtilityPanel,
    autoExcludePartialMonths: ctx.autoExcludePartialMonths,
    budgetStartDate: ctx.budgetStartDate,
    calendarHeatmapVariant: ctx.calendarHeatmapVariant,
    categories: ctx.categories,
    copyInviteLink: ctx.copyInviteLink,
    createInvitation: ctx.createInvitation,
    currentMonth: ctx.currentMonth,
    draftVisibleModules: ctx.draftVisibleModules,
    effectiveVisibleModules,
    errorText: ctx.errorText,
    goToNextMonth: ctx.goToNextMonth,
    goToPrevMonth: ctx.goToPrevMonth,
    handleLockAllPastMonths: ctx.handleLockAllPastMonths,
    handleLockSelectedMonth: ctx.handleLockSelectedMonth,
    handleResetAllHistory: ctx.handleResetAllHistory,
    handleResetHeatmapSettings: ctx.handleResetHeatmapSettings,
    handleResetSelectedMonthData: ctx.handleResetSelectedMonthData,
    handleSaveMonthNavigationSettingsWithStartDateWarning:
      ctx.handleSaveMonthNavigationSettingsWithStartDateWarning,
    handleToggleSelectedMonthExcludedWithConfirm: ctx.handleToggleSelectedMonthExcludedWithConfirm,
    handleUnlockAllPastMonths: ctx.handleUnlockAllPastMonths,
    handleUnlockSelectedMonth: ctx.handleUnlockSelectedMonth,
    heatmapInverted: ctx.heatmapInverted,
    heatmapMode: ctx.heatmapMode,
    hiddenCategoriesInSelectedMonth: ctx.hiddenCategoriesInSelectedMonth,
    invitationErrorText: ctx.invitationErrorText,
    invitationStatusText: ctx.invitationStatusText,
    inviteEmail: ctx.inviteEmail,
    inviteLink: ctx.inviteLink,
    isDashboardPanelOpen: ctx.isDashboardPanelOpen,
    isFutureMonthNavigationLocked: ctx.isFutureMonthNavigationLocked,
    isInvitationWorking: ctx.isInvitationWorking,
    isNextMonthNavigationBlocked: ctx.isNextMonthNavigationBlocked,
    isPrevMonthNavigationBlocked: ctx.isPrevMonthNavigationBlocked,
    isSavingMonthNavigationSettings: ctx.isSavingMonthNavigationSettings,
    isSelectedMonthExcluded: ctx.isSelectedMonthExcluded,
    isSelectedMonthLocked: ctx.isSelectedMonthLocked,
    isSettingsPanelVisible: ctx.isSettingsPanelVisible,
    isUpdatingSelectedMonthExclusion: ctx.isUpdatingSelectedMonthExclusion,
    isUpdatingSelectedMonthLock: ctx.isUpdatingSelectedMonthLock,
    maxAllowedMonth: ctx.maxAllowedMonth,
    minAllowedMonth: ctx.minAllowedMonth,
    moduleVisibilitySaveStatusText: ctx.moduleVisibilitySaveStatusText,
    monthNavigationErrorText: ctx.monthNavigationErrorText,
    onCurrentUserLeftProfile: ctx.onCurrentUserLeftProfile,
    openBlankFloatingTransactionCreator: ctx.openBlankFloatingTransactionCreator,
    profileId: ctx.profileId,
    recentTransactionPreviews: budgetWorkspaceSummary.recentTransactionPreviews,
    resetDraftVisibleModules: ctx.resetDraftVisibleModules,
    saveVisibleModules: ctx.saveVisibleModules,
    scopedTransactions: ctx.scopedTransactions,
    selectedMonth,
    setActiveSidebarPrimaryPanel: ctx.setActiveSidebarPrimaryPanel,
    setActiveUtilityPanel: ctx.setActiveUtilityPanel,
    setAutoExcludePartialMonths: ctx.setAutoExcludePartialMonths,
    setBudgetStartDate: ctx.setBudgetStartDate,
    setCalendarHeatmapVariant: ctx.setCalendarHeatmapVariant,
    setDraftModuleVisibility: ctx.setDraftModuleVisibility,
    setHeatmapInverted: ctx.setHeatmapInverted,
    setHeatmapMode: ctx.setHeatmapMode,
    setInviteEmail: ctx.setInviteEmail,
    setIsDashboardPanelOpen: ctx.setIsDashboardPanelOpen,
    setIsFutureMonthNavigationLocked: ctx.setIsFutureMonthNavigationLocked,
    setIsSettingsPanelVisible: ctx.setIsSettingsPanelVisible,
    setMonthNavigationErrorText: ctx.setMonthNavigationErrorText,
    setMonthNavigationStartMonth: ctx.setMonthNavigationStartMonth,
    setSelectedMonth: ctx.setSelectedMonth,
    setShowHiddenCategories: ctx.setShowHiddenCategories,
    setSimpleMode: ctx.setSimpleMode,
    showHiddenCategories: ctx.showHiddenCategories,
    signOut: ctx.signOut,
    simpleMode: ctx.simpleMode,
    status: ctx.status,
    styles: ctx.styles,
    supabase: ctx.supabase,
    userEmail: ctx.userEmail,
    userId: ctx.userId,
    visibleCategories: ctx.visibleCategories,
    visibleModules: ctx.visibleModules,
  }

  const rightRailProps = {
    selectedMonth,
    isSelectedMonthLocked: ctx.isSelectedMonthLocked,
    transactionCount: ctx.selectedMonthTransactions.length,
    categoryCount: ctx.visibleCategories.length,
    balance: budgetWorkspaceSummary.totalBudgetBalance,
    incomeTotal: budgetWorkspaceSummary.selectedMonthIncomeTotal,
    expenseTotal: budgetWorkspaceSummary.selectedMonthExpenseTotal,
    draftCount: ctx.drafts.length,
    recurringCount: ctx.recurringTransactions.length,
    showRecurring: effectiveVisibleModules.recurringTransactions,
    onOpenSearch: () => {
      ctx.setIsDashboardPanelOpen(false)
      ctx.setActiveSidebarPrimaryPanel?.(null)
      ctx.setIsSettingsPanelVisible(false)
      ctx.setActiveUtilityPanel('search')
    },
    onOpenNotifications: () => {
      ctx.setIsDashboardPanelOpen(false)
      ctx.setActiveSidebarPrimaryPanel?.(null)
      ctx.setIsSettingsPanelVisible(false)
      ctx.setActiveUtilityPanel('recurringTransactions')
    },
    onQuickAdd: () => ctx.openBlankFloatingTransactionCreator(null),
    onToggleProfile: () => {
      ctx.setIsDashboardPanelOpen(false)
      ctx.setActiveUtilityPanel(null)
      ctx.setActiveSidebarPrimaryPanel?.((previousValue: string | null) =>
        previousValue === 'profile' ? null : 'profile'
      )
    },
  }

  const dashboardDrawerProps = {
    isOpen: ctx.isDashboardPanelOpen,
    onClose: () => ctx.setIsDashboardPanelOpen(false),
    dashboardPanelProps: {
      profileId: ctx.profileId,
      styles: ctx.styles,
      transactions: ctx.scopedTransactions,
      transactionTagsMap: ctx.transactionTagsMap,
      categoriesById,
      selectedMonth,
      budgetStartDate: ctx.budgetStartDate,
      excludedMonthsSet: ctx.excludedMonthsSet,
      getSignedAmountForTransaction,
    },
  }

  const overlaySectionProps = {
    overlayProps: budgetPageOverlayProps,
    budgetLimitEditorModalProps: {
      isOpen: effectiveVisibleModules.budgetLimits && budgetLimitEditorCategoryId !== undefined,
      categoryId: budgetLimitEditorCategoryId ?? null,
      categoryLabel: editedBudgetLimitCategoryLabel,
      selectedMonth,
      existingLimit: (editedBudgetLimitView as BudgetLimitView | null)?.limit ?? null,
      onClose: () => setBudgetLimitEditorCategoryId(undefined),
      onSave: saveBudgetLimit,
      onDelete: removeBudgetLimit,
      onDisable: disableEditedBudgetLimit,
    },
  }

  return {
    budgetLimitDataSnapshot,
    statusPanelsCtx,
    rightRailProps,
    mainPanelsProps,
    dashboardDrawerProps,
    overlaySectionProps,
  }
}
