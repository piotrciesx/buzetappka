'use client'

import { useEffect, useMemo } from 'react'
import { useBankSearch } from '../../lib/useBankSearch'
import { useBudgetCategoryTreeData } from '../../lib/useBudgetCategoryTreeData'
import { useBudgetLimitsData } from '../../lib/budget-limits/useBudgetLimitsData'
import { useBudgetTreeMetrics } from '../../lib/useBudgetTreeMetrics'
import { useBudgetTreeUiState } from '../../lib/useBudgetTreeUiState'
import { useHeatmap } from '../../lib/useHeatmap'
import { useHiddenDescriptionSuggestions } from '../../lib/useHiddenDescriptionSuggestions'
import { useOpenSearchForTag } from '../../lib/useOpenSearchForTag'
import { useSelectedMonthTransactions } from '../../lib/useSelectedMonthTransactions'
import { useTransactionShortcutData } from '../../lib/useTransactionShortcutData'
import { useTransactionCategorySelection } from './useTransactionCategorySelection'
import { buildBudgetLimitViews } from './useBudgetLimitViews'

type Params = Record<string, any>

export function useBudgetAppWorkspaceDataBridge(ctx: Params) {
  const activeScopeTransactions = Array.isArray(ctx.activeScopeTransactions)
    ? ctx.activeScopeTransactions
    : ctx.scopedTransactions

  const selectedMonthTransactions = useSelectedMonthTransactions({
    transactions: ctx.scopedTransactions,
    selectedMonth: ctx.selectedMonth,
  })

  const treeData = useBudgetCategoryTreeData({
    categories: ctx.categories,
    selectedMonth: ctx.selectedMonth,
  })

  const firstVisibleLevel1Id = useMemo(() => {
    return treeData.sortedLevel1[0]?.id || null
  }, [treeData.sortedLevel1])

  const treeUi = useBudgetTreeUiState({
    initialOpenLevel1Id: firstVisibleLevel1Id,
  })

  const heatmap = useHeatmap({
    categoriesById: treeData.categoriesById,
    incomeLevel1Id: treeData.incomeLevel1Id,
    expenseLevel1Id: treeData.expenseLevel1Id,
    heatmapMode: ctx.heatmapMode,
    setHeatmapMode: ctx.setHeatmapMode,
    heatmapInverted: ctx.heatmapInverted,
    setHeatmapInverted: ctx.setHeatmapInverted,
  })

  const budgetLimitsData = useBudgetLimitsData({
    profileId: ctx.profileId,
    selectedMonth: ctx.selectedMonth,
    enabled: ctx.isBudgetLimitsModuleEnabled,
    categoriesById: treeData.categoriesById,
    expenseLevel1Id: treeData.expenseLevel1Id,
    transactions: ctx.scopedTransactions,
    budgetStartDate: ctx.budgetStartDate,
    getSignedAmountForTransaction: heatmap.getSignedAmountForTransaction,
  })
  const budgetLimitViews = buildBudgetLimitViews(budgetLimitsData, ctx.selectedMonth)

  const bankSearch = useBankSearch({
    profileId: ctx.profileId,
    transactions: activeScopeTransactions,
    categories: ctx.categories,
    categoriesById: treeData.categoriesById,
    budgetStartDate: ctx.budgetStartDate,
    getSignedAmountForTransaction: heatmap.getSignedAmountForTransaction,
    isPaymentSourcesEnabled: ctx.isPaymentSourcesModuleEnabled,
    transactionPaymentSplitsMap: ctx.isPaymentSourcesModuleEnabled
      ? ctx.transactionPaymentSplitsMap
      : {},
    tags: ctx.tags,
    transactionTagsMap: ctx.transactionTagsMap,
  })

  const { handleOpenSearchForTag } = useOpenSearchForTag({
    searchPanelRef: ctx.searchPanelRef,
    setIsBankSearchOpen: bankSearch.setIsPanelOpen,
    handleBankSearchFieldChange: bankSearch.handleFieldChange,
  })

  useEffect(() => {
    if (!ctx.isPaymentSourcesModuleEnabled && bankSearch.searchState.paymentSourceId) {
      bankSearch.handleFieldChange('paymentSourceId', '')
    }
  }, [
    bankSearch,
    bankSearch.searchState.paymentSourceId,
    ctx.isPaymentSourcesModuleEnabled,
  ])

  const treeMetrics = useBudgetTreeMetrics({
    transactions: ctx.scopedTransactions,
    categories: ctx.categories,
    selectedMonth: ctx.selectedMonth,
    level3ByParentId: treeData.level3ByParentId,
  })

  const shortcutData = useTransactionShortcutData({
    visibleCategories: treeData.visibleCategories,
    categoriesById: treeData.categoriesById,
    transactions: ctx.scopedTransactions,
  })

  const hiddenDescriptionSuggestions = useHiddenDescriptionSuggestions({
    userId: ctx.userId,
    profileId: ctx.profileId,
    baseDescriptionSuggestions: shortcutData.descriptionSuggestions,
  })

  const applyTransactionCategorySelection = useTransactionCategorySelection({
    categoriesById: treeData.categoriesById,
    setSelectedTransactionTypeId: ctx.setSelectedTransactionTypeId,
    setSelectedLevel2Id: ctx.setSelectedLevel2Id,
    setSelectedTransactionCategoryId: ctx.setSelectedTransactionCategoryId,
  })

  return {
    ...treeData,
    ...treeUi,
    ...heatmap,
    activeBudgetLimitAlerts: budgetLimitViews.filter((view) => view.alertState.level !== 'none'),
    activeBudgetLimits: budgetLimitsData.plans.filter((plan) => plan.status === 'active'),
    activeLimitStates: budgetLimitViews,
    budgetLimitsData,
    applyTransactionCategorySelection,
    bankSearchCategoryOptions: bankSearch.categoryOptions,
    bankSearchResults: bankSearch.results,
    bankSearchState: bankSearch.searchState,
    bankSearchSummary: bankSearch.summary,
    bankSearchTagOptions: bankSearch.tagOptions,
    baseDescriptionSuggestions: shortcutData.descriptionSuggestions,
    descriptionSuggestions: hiddenDescriptionSuggestions.descriptionSuggestions,
    getCategoryCountForSelectedMonth: treeMetrics.getCategoryCountForSelectedMonth,
    getCountForLevel2ForSelectedMonth: treeMetrics.getCountForLevel2ForSelectedMonth,
    getSumForCategoryForSelectedMonth: treeMetrics.getSumForCategoryForSelectedMonth,
    getSumForLevel2ForSelectedMonth: treeMetrics.getSumForLevel2ForSelectedMonth,
    getTransactionsForCategoryAndMonthForSelectedMonth:
      treeMetrics.getTransactionsForCategoryAndMonthForSelectedMonth,
    getTransactionsForLevel1AndMonth: treeMetrics.getTransactionsForLevel1AndMonth,
    handleBankSearchFieldChange: bankSearch.handleFieldChange,
    handleBankSearchToggleTagId: bankSearch.toggleTagId,
    handleDeleteDescriptionSuggestion: hiddenDescriptionSuggestions.handleDeleteDescriptionSuggestion,
    handleOpenSearchForTag,
    isBankSearchOpen: bankSearch.isPanelOpen,
    loadBudgetLimits: budgetLimitsData.load,
    recentTransactionShortcutCategoriesByType:
      shortcutData.recentTransactionShortcutCategoriesByType,
    resetBankSearch: bankSearch.resetSearch,
    restoreDescriptionSuggestion: hiddenDescriptionSuggestions.restoreDescriptionSuggestion,
    selectedMonthTransactions,
    setIsBankSearchOpen: bankSearch.setIsPanelOpen,
    topTransactionShortcutCategoriesByType: shortcutData.topTransactionShortcutCategoriesByType,
    transactionCategoryPathLabels: shortcutData.transactionCategoryPathLabels,
    addableTransactionCategoryIds: shortcutData.addableTransactionCategoryIds,
  }
}
