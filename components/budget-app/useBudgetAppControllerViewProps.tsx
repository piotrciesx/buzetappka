'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildBudgetLimitCreatorRequest } from '../../lib/budget-limits/treeBridge'
import { getPendingRecurringTransactions } from '../../lib/recurringTransactions'
import { buildFinancialGoalsPlan } from '../../lib/financialGoals'
import { getEffectiveTransactionScope } from '../../lib/transactionScope'
import { getProfileStorageKey, readProfileStorageValue } from '../../lib/profileStorage'
import { useBudgetOverlayProps } from './useBudgetOverlayProps'
import { useBudgetPageMainPanelsProps } from './useBudgetPageMainPanelsProps'
import { useBudgetWorkspaceSummary } from './useBudgetWorkspaceSummary'
import { useUserPublicProfile } from '../../lib/useUserPublicProfile'

type BudgetAppControllerViewPropsContext = Record<string, any>

type BudgetAlertLike = {
  id?: unknown
  planId?: unknown
  plan_id?: unknown
  limit_id?: unknown
  categoryId?: unknown
  category_id?: unknown
  usageAmount?: unknown
  usage_amount?: unknown
  usagePercent?: unknown
  usage_percent?: unknown
  amount?: unknown
  limitAmount?: unknown
  limit_amount?: unknown
  text?: unknown
  alertState?: { text?: unknown } | null
  limit?: {
    id?: unknown
    category_id?: unknown
    amount?: unknown
  } | null
}

const getStringFallback = (...values: unknown[]) => {
  const value = values.find((candidate) => typeof candidate === 'string' && candidate.length > 0)
  return typeof value === 'string' ? value : null
}

const getBudgetAlertId = (alert: BudgetAlertLike, index: number) =>
  getStringFallback(
    alert.limit?.id,
    alert.planId,
    alert.plan_id,
    alert.limit_id,
    alert.id,
  ) || `budget-limit-alert-${index}`

const getNumberFallback = (...values: unknown[]) => {
  const value = values.find((candidate) => Number.isFinite(Number(candidate)))
  return value === undefined ? 0 : Number(value)
}

const getSnoozeStorageKey = (profileId: string, month: string) =>
  `budget-recurring-snooze:${profileId}:${month}`
const getScopedSnoozeStorageKey = (userId: string, profileId: string, month: string) =>
  getProfileStorageKey({
    userId,
    profileId,
    featureKey: `recurring-snooze:${month}`,
  })

const getLastDateOfMonth = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return `${monthText}-${String(lastDay).padStart(2, '0')}`
}

const getSnoozeTargetDate = (monthText: string) => {
  const today = new Date()
  const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
  const targetText = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(
    target.getDate()
  ).padStart(2, '0')}`
  const monthEnd = getLastDateOfMonth(monthText)

  return targetText.slice(0, 7) === monthText && targetText <= monthEnd ? targetText : monthEnd
}

export function useBudgetAppControllerViewProps(ctx: BudgetAppControllerViewPropsContext) {
  const {
    activeBudgetLimitAlerts,
    activeBudgetLimits,
    activeLimitStates,
    budgetLimitCreatorRequest,
    budgetLimitsData,
    categoriesById,
    editedBudgetLimitView: ignoredEditedBudgetLimitView,
    effectiveVisibleModules,
    getBudgetLimitView,
    isBudgetLimitsModuleEnabled,
    selectedMonth,
    setActiveUtilityPanel,
    setBudgetLimitCreatorRequest,
  } = ctx

  void ignoredEditedBudgetLimitView

  const [recurringSnoozes, setRecurringSnoozes] = useState<Record<string, string>>({})

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
    if (!ctx.profileId || !selectedMonth || typeof window === 'undefined') {
      setRecurringSnoozes({})
      return
    }

    try {
      const stored = readProfileStorageValue({
        storageKey: getScopedSnoozeStorageKey(ctx.userId, ctx.profileId, selectedMonth),
        legacyStorageKeys: [getSnoozeStorageKey(ctx.profileId, selectedMonth)],
      })
      setRecurringSnoozes(stored ? JSON.parse(stored) : {})
    } catch {
      setRecurringSnoozes({})
    }
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [ctx.profileId, ctx.userId, selectedMonth])

  const handleSnoozeRecurringReminder = useCallback(
    (recurring: { id: string; name?: string }) => {
      if (!ctx.profileId || !selectedMonth || typeof window === 'undefined') {
        return
      }

      const targetDate = getSnoozeTargetDate(selectedMonth)
      const nextSnoozes = {
        ...recurringSnoozes,
        [recurring.id]: targetDate,
      }
      setRecurringSnoozes(nextSnoozes)
      window.localStorage.setItem(
        getScopedSnoozeStorageKey(ctx.userId, ctx.profileId, selectedMonth),
        JSON.stringify(nextSnoozes)
      )
      alert(`Przypomnienie wróci ${targetDate}.`)
    },
    [ctx.profileId, ctx.userId, recurringSnoozes, selectedMonth]
  )

  const {
    getSignedAmountForTransaction,
    getRootLevel1IdForCategory,
    getSumForCategoryForSelectedMonth,
    getCategoryCountForSelectedMonth,
  } = ctx

  const openBudgetLimitCreator = useCallback((categoryId: string | null) => {
    const category = categoryId ? categoriesById[categoryId] : null
    if (categoryId && category?.level !== 2 && category?.level !== 3) return

    const existingPlanId = getBudgetLimitView(categoryId)?.planId
    setBudgetLimitCreatorRequest(buildBudgetLimitCreatorRequest(
      categoryId,
      category?.level ?? null,
      selectedMonth,
      existingPlanId
    ))
    setActiveUtilityPanel('budgetLimits')
  }, [categoriesById, getBudgetLimitView, selectedMonth, setActiveUtilityPanel, setBudgetLimitCreatorRequest])

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
    incomeLevel1Id: ctx.incomeLevel1Id,
    expenseLevel1Id: ctx.expenseLevel1Id,
    transactionCategoryPathLabels: ctx.transactionCategoryPathLabels,
    getSignedAmountForTransaction,
    getRootLevel1IdForCategory,
    getSumForCategoryForSelectedMonth,
    getCategoryCountForSelectedMonth,
  })
  const { displayName: userDisplayName, avatarKey: userAvatarKey } = useUserPublicProfile(
    ctx.userId,
    ctx.userEmail
  )

  const viewCtx = {
    ...ctx,
    ...budgetWorkspaceSummary,
    getSignedAmountForTransaction,
    getRootLevel1IdForCategory,
    getSumForCategoryForSelectedMonth,
    getCategoryCountForSelectedMonth,
    handleSnoozeRecurringReminder,
    openBudgetLimitCreator,
    budgetLimitCreatorRequest,
    budgetLimitsData,
    setBudgetLimitCreatorRequest,
  }
  const activeScopeTransactions = Array.isArray(ctx.activeScopeTransactions)
    ? ctx.activeScopeTransactions
    : ctx.scopedTransactions

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
    activeScopeTransactions,
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
    handleLockMonth: ctx.handleLockMonth,
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
    incomeLevel1Id: ctx.incomeLevel1Id,
    expenseLevel1Id: ctx.expenseLevel1Id,
    getSignedAmountForTransaction,
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
    openFloatingTransactionCreator: ctx.openFloatingTransactionCreator,
    openTransactionCreator: ctx.openTransactionCreator,
    pinnedWorkspaceCategories: budgetWorkspaceSummary.pinnedWorkspaceCategories,
    previousMonthCloseReminder: ctx.previousMonthCloseReminder,
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
    setIsPreviousMonthCloseReminderHidden: ctx.setIsPreviousMonthCloseReminderHidden,
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
    userDisplayName,
    userAvatarKey,
    userId: ctx.userId,
    visibleCategories: ctx.visibleCategories,
    visibleModules: ctx.visibleModules,
  }

  const rightRailFinancialGoals = useMemo(() => {
    if (!effectiveVisibleModules.financialGoals) {
      return []
    }

    const plan = buildFinancialGoalsPlan({
      goals: ctx.financialGoals,
      priorities: ctx.financialGoalPriorities,
      monthConfigs: ctx.financialGoalMonthConfigs,
      transactions: getEffectiveTransactionScope(activeScopeTransactions, {
        mode: 'goals',
        budgetStartDate: ctx.budgetStartDate,
        excludedMonthsSet: ctx.excludedMonthsSet,
      }),
      selectedMonth,
      lockedMonthsSet: ctx.lockedMonthsSet,
      getSignedAmountForTransaction,
    })

    return plan.orderedGoals
      .map((goal: any) => {
        const progress = plan.progressByGoalId[goal.id]

        if (!progress || progress.isArchived) {
          return null
        }

        return {
          id: goal.id,
          name: goal.name,
          collectedAmount: progress.collectedAmount,
          remainingAmount: progress.remainingAmount,
          percentage: progress.percentage,
        }
      })
      .filter(
        (
          goal
        ): goal is {
          id: string
          name: string
          collectedAmount: number
          remainingAmount: number
          percentage: number
        } => Boolean(goal)
      )
  }, [
    ctx.financialGoalMonthConfigs,
    ctx.financialGoalPriorities,
    ctx.financialGoals,
    ctx.budgetStartDate,
    ctx.excludedMonthsSet,
    ctx.lockedMonthsSet,
    activeScopeTransactions,
    effectiveVisibleModules.financialGoals,
    getSignedAmountForTransaction,
    selectedMonth,
  ])

  const rightRailBudgetAlerts = useMemo(
    () => {
      const sourceAlerts = effectiveVisibleModules.budgetLimits && Array.isArray(activeBudgetLimitAlerts)
        ? activeBudgetLimitAlerts
        : []

      return sourceAlerts.flatMap((rawAlert: unknown, index: number) => {
        const alert = rawAlert as BudgetAlertLike
        if (!alert) return []

        if (process.env.NODE_ENV === 'development' && !alert.limit && !alert.planId && !alert.plan_id) {
          console.warn('[budget-limits] Alert bez powiązanego limitu', alert)
        }

        const categoryId = getStringFallback(alert.limit?.category_id, alert.categoryId, alert.category_id)
        const categoryLabel = categoryId
          ? categoriesById[categoryId]?.name || 'Kategoria'
          : 'Limit budżetowy'

        return [{
          id: getBudgetAlertId(alert, index),
          categoryLabel,
          usageAmount: getNumberFallback(alert.usageAmount, alert.usage_amount, alert.amount),
          limitAmount: getNumberFallback(alert.limit?.amount, alert.amount, alert.limitAmount, alert.limit_amount),
          usagePercent: getNumberFallback(alert.usagePercent, alert.usage_percent),
          text: getStringFallback(alert.alertState?.text, alert.text) || 'Limit budżetowy wymaga uwagi',
        }]
      })
    },
    [activeBudgetLimitAlerts, categoriesById, effectiveVisibleModules.budgetLimits]
  )

  const rightRailRecurringAlerts = useMemo(() => {
    if (!effectiveVisibleModules.recurringTransactions) {
      return []
    }

    const todayText = new Date().toISOString().slice(0, 10)

    return getPendingRecurringTransactions(
      ctx.recurringTransactions,
      ctx.recurringExecutions,
      selectedMonth,
      ctx.recurringReminderMonthStatuses,
      {
        transactions: ctx.scopedTransactions,
        snoozedUntilByReminderId: recurringSnoozes,
        todayText,
      }
    ).filter((recurring: any) => {
      return Boolean(recurring)
    })
  }, [
    ctx.recurringExecutions,
    ctx.recurringReminderMonthStatuses,
    ctx.recurringTransactions,
    effectiveVisibleModules.recurringTransactions,
    recurringSnoozes,
    selectedMonth,
  ])

  const rightRailProps = {
    selectedMonth,
    isSelectedMonthLocked: ctx.isSelectedMonthLocked,
    transactionCount: ctx.selectedMonthTransactions.length,
    categoryCount: ctx.visibleCategories.length,
    balance: budgetWorkspaceSummary.totalBudgetBalance,
    incomeTotal: budgetWorkspaceSummary.selectedMonthIncomeTotal,
    expenseTotal: budgetWorkspaceSummary.selectedMonthExpenseTotal,
    draftCount: ctx.drafts.length,
    recurringCount: rightRailRecurringAlerts.length,
    recurringAlerts: rightRailRecurringAlerts,
    budgetAlerts: rightRailBudgetAlerts,
    financialGoals: rightRailFinancialGoals,
    userDisplayName,
    userAvatarKey,
    showRecurring: effectiveVisibleModules.recurringTransactions,
    onOpenSearch: (query?: string) => {
      ctx.setIsDashboardPanelOpen(false)
      ctx.setActiveSidebarPrimaryPanel?.(null)
      ctx.setIsSettingsPanelVisible(false)
      if (query?.trim()) {
        ctx.handleBankSearchFieldChange('description', query.trim())
      }
      ctx.setActiveUtilityPanel('search')
    },
    onOpenNotifications: () => {
      ctx.setIsDashboardPanelOpen(false)
      ctx.setActiveSidebarPrimaryPanel?.(null)
      ctx.setIsSettingsPanelVisible(false)
      ctx.setActiveUtilityPanel('recurringTransactions')
    },
    onAddFromReminder: ctx.openReminderTransactionCreator,
    onSnoozeRecurring: handleSnoozeRecurringReminder,
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
    isOpen: effectiveVisibleModules.dashboard && ctx.isDashboardPanelOpen,
    onClose: () => ctx.setIsDashboardPanelOpen(false),
    dashboardPanelProps: {
      profileId: ctx.profileId,
      userId: ctx.userId,
      styles: ctx.styles,
      transactions: effectiveVisibleModules.dashboard ? activeScopeTransactions : [],
      transactionTagsMap: ctx.transactionTagsMap,
      categoriesById,
      selectedMonth,
      budgetStartDate: ctx.budgetStartDate,
      excludedMonthsSet: ctx.excludedMonthsSet,
      getSignedAmountForTransaction,
    },
  }

  const overlaySectionProps = { overlayProps: budgetPageOverlayProps }

  return {
    budgetLimitDataSnapshot,
    statusPanelsCtx,
    rightRailProps,
    mainPanelsProps,
    dashboardDrawerProps,
    overlaySectionProps,
  }
}
