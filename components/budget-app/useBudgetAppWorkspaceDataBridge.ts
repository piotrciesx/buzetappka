'use client'

import { useEffect, useMemo } from 'react'
import { useBankSearch } from '../../lib/useBankSearch'
import { useBudgetCategoryTreeData } from '../../lib/useBudgetCategoryTreeData'
import { useBudgetLimits } from '../../lib/useBudgetLimits'
import { useBudgetTreeMetrics } from '../../lib/useBudgetTreeMetrics'
import { useBudgetTreeUiState } from '../../lib/useBudgetTreeUiState'
import { useHeatmap } from '../../lib/useHeatmap'
import { useHiddenDescriptionSuggestions } from '../../lib/useHiddenDescriptionSuggestions'
import { useOpenSearchForTag } from '../../lib/useOpenSearchForTag'
import { useSelectedMonthTransactions } from '../../lib/useSelectedMonthTransactions'
import { useTransactionShortcutData } from '../../lib/useTransactionShortcutData'
import { useTransactionCategorySelection } from './useTransactionCategorySelection'

type Params = Record<string, any>

export function useBudgetAppWorkspaceDataBridge(ctx: Params) {
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

  const budgetLimits = useBudgetLimits({
    profileId: ctx.profileId,
    selectedMonth: ctx.selectedMonth,
    categoriesById: treeData.categoriesById,
    expenseLevel1Id: treeData.expenseLevel1Id,
    transactions: ctx.scopedTransactions,
    excludedMonthsSet: ctx.excludedMonthsSet,
    getSignedAmountForTransaction: heatmap.getSignedAmountForTransaction,
  })

  const bankSearch = useBankSearch({
    profileId: ctx.profileId,
    transactions: ctx.scopedTransactions,
    categories: ctx.categories,
    categoriesById: treeData.categoriesById,
    getSignedAmountForTransaction: heatmap.getSignedAmountForTransaction,
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
    activeBudgetLimitAlerts: budgetLimits.activeAlerts,
    activeBudgetLimits: budgetLimits.activeLimits,
    activeLimitStates: budgetLimits.activeLimitStates,
    addBudgetLimit: budgetLimits.addBudgetLimit,
    applyTransactionCategorySelection,
    bankSearchCategoryOptions: bankSearch.categoryOptions,
    bankSearchResults: bankSearch.results,
    bankSearchState: bankSearch.searchState,
    bankSearchSummary: bankSearch.summary,
    bankSearchTagOptions: bankSearch.tagOptions,
    baseDescriptionSuggestions: shortcutData.descriptionSuggestions,
    deleteBudgetLimit: budgetLimits.deleteBudgetLimit,
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
    loadBudgetLimits: budgetLimits.loadBudgetLimits,
    recentTransactionShortcutCategoriesByType:
      shortcutData.recentTransactionShortcutCategoriesByType,
    resetBankSearch: bankSearch.resetSearch,
    restoreDescriptionSuggestion: hiddenDescriptionSuggestions.restoreDescriptionSuggestion,
    selectedMonthTransactions,
    setIsBankSearchOpen: bankSearch.setIsPanelOpen,
    topTransactionShortcutCategoriesByType: shortcutData.topTransactionShortcutCategoriesByType,
    transactionCategoryPathLabels: shortcutData.transactionCategoryPathLabels,
    addableTransactionCategoryIds: shortcutData.addableTransactionCategoryIds,
    updateBudgetLimit: budgetLimits.updateBudgetLimit,
  }
}
