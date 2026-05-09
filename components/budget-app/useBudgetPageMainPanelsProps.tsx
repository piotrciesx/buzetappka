'use client'

import type { ComponentProps } from 'react'
import BudgetPageMainPanels from '../BudgetPageMainPanels'
import MainWorkspaceBottomDeck from '../MainWorkspaceBottomDeck'
import BudgetWorkspaceTopNotices from './BudgetWorkspaceTopNotices'
import { getHiddenCategoryLabel } from '../../lib/categoryUtils'

export type BudgetPageMainPanelsPropsContext = Record<string, any>

export function useBudgetPageMainPanelsProps(ctx: BudgetPageMainPanelsPropsContext): ComponentProps<typeof BudgetPageMainPanels> {
  const {
    activeBudgetLimitAlerts,
    activeBudgetLimits,
    activeTransactionsById,
    activeUtilityPanel,
    addableTransactionCategoryIds,
    applyDraftToTransactionCreator,
    bankSearchCategoryOptions,
    bankSearchPaymentSourceOptions,
    bankSearchResults,
    bankSearchState,
    bankSearchSummary,
    bankSearchTagOptions,
    budgetStartDate,
    bulkActionErrorText,
    bulkMoveTargetCategoryId,
    calendarHeatmapVariant,
    canCreateTransactions,
    categories,
    categoriesById,
    categoryId,
    cleanupAllDrafts,
    clearTransactionOperationUi,
    clearTransactionSelection,
    commonBulkMoveTargets,
    contextCalendarDays,
    copyPaymentSourcesBetweenKinds,
    currentTransactionCreatorKind,
    dayText,
    deleteDraft,
    deleteFinancialGoal,
    deletePaymentSource,
    descriptionSuggestions,
    drafts,
    draftsStatusText,
    effectiveVisibleModules,
    error,
    errorText,
    execution,
    expenseLevel1Id,
    finalCategoryOptions,
    financialGoalMonthConfigs,
    financialGoalPriorities,
    financialGoals,
    formatDraftUpdatedAt,
    generatedForDate,
    getAmountNumber,
    getBudgetLimitView,
    getCalendarHeatmapVariantForLevel1Id,
    getCategoryPathLabel,
    getCountForLevel2ForSelectedMonth,
    getDefaultPaymentSourceIdForCategoryId,
    getDraftLevel1Id,
    getDraftLocationLabel,
    getMoveTargetsForTransaction,
    getPaymentSourceOptionsForCategoryId,
    getRecurringOptionsForCategoryId,
    getSignedAmountForTransaction,
    getSortedLevel2Children,
    getSortedLevel3Children,
    getSumForCategoryForSelectedMonth,
    getSumForLevel2ForSelectedMonth,
    getTransactionsForCategoryAndMonthForSelectedMonth,
    getTransactionsForLevel1AndMonth,
    handleAddSubcategory,
    handleBankSearchFieldChange,
    handleBankSearchToggleTagId,
    handleBulkDeleteSelected,
    handleBulkMoveSelected,
    handleConfirmCategoryMigration,
    handleDeleteCategory,
    handleDeleteDescriptionSuggestion,
    handleDeleteTransaction,
    handleDuplicateTransaction,
    handleEmptyTrash,
    handleHideCategory,
    handleImportTransactions,
    handleInlineSaveTransaction,
    handleLevel1DragStart,
    handleLevel3DragStart,
    handleLockMonth,
    handleMoveTransaction,
    handleOpenCategoryCalendarAddForDay,
    handleOpenGlobalCalendarAddForDay,
    handleOpenLevel1CalendarAddForDay,
    handleOpenSearchForTag,
    handlePermanentDeleteTransaction,
    handleRenameCategory,
    handleReorderLevel1,
    handleReorderLevel2,
    handleReorderLevel3,
    handleRestoreCategory,
    handleRestoreTransaction,
    handleToggleSelectedMonthExcludedWithConfirm,
    handleUndoLastAction,
    handleUndoScheduledHide,
    handleUpdateTransaction,
    heatmapInverted,
    heatmapMode,
    hiddenCategoriesInSelectedMonth,
    incomeLevel1Id,
    input,
    isAllowedMoveTarget,
    isBankSearchOpen,
    isBudgetLimitsModuleEnabled,
    isCleaningAllDrafts,
    isDraftsLoading,
    isMonthCalendarModuleEnabled,
    isPaymentSourcesModuleEnabled,
    isRecurringTransactionsModuleEnabled,
    isReorderingLevel1,
    isSelectedMonthExcluded,
    isSelectedMonthLocked,
    isTransactionCreatorPaymentSourceVisible,
    isUpdatingSelectedMonthExclusion,
    isVisible,
    kind,
    label,
    lastUndoAction,
    level2SortDirection,
    level2SortMode,
    level3SortDirection,
    level3SortMode,
    loadData,
    lockedMonthsSet,
    migrationPromptMoveTargets,
    migrationPromptState,
    migrationPromptTransactions,
    newSubcategoryName,
    openAddSubcategoryFor,
    openBlankFloatingTransactionCreator,
    openLevel1CalendarIds,
    openLevel1Ids,
    openLevel2Ids,
    openLevel3Ids,
    openReminderTransactionCreator,
    openTransactionCreator,
    paymentSourceId,
    paymentSourceOptions,
    paymentSourceSettings,
    paymentSourceStats,
    paymentSources,
    pinnedWorkspaceCategories,
    prev,
    previousMonthCloseReminder,
    profileId,
    recentTransactionPreviews,
    recurring,
    recurringExecutions,
    recurringReminderMonthStatuses,
    recurringTransactions,
    reorderingLevel1Id,
    reorderingLevel2Id,
    resetBankSearch,
    saveFinancialGoal,
    saveGoalAllocationsForMonth,
    saveGoalPrioritiesForMonth,
    saveDraft,
    savePaymentSource,
    saveRecurringExecution,
    saveRecurringReminderMonthStatus,
    saveRecurringTransaction,
    scopedTransactions,
    searchPanelRef,
    selectedMonth,
    selectedMonthTransactions,
    selectedPaymentSourceId,
    selectedTransactionCategoryId,
    selectedTransactionIds,
    selectedTransactions,
    setActiveUtilityPanel,
    setActiveSidebarPrimaryPanel,
    setBudgetLimitEditorCategoryId,
    setBulkActionErrorText,
    setBulkMoveTargetCategoryId,
    setDefaultPaymentSource,
    setGoalModeForMonth,
    setHeatmapInverted,
    setHeatmapMode,
    setIsBankSearchOpen,
    setIsDashboardPanelOpen,
    setIsSettingsPanelVisible,
    setIsPreviousMonthCloseReminderHidden,
    setLevel2SortDirection,
    setLevel2SortMode,
    setLevel3SortDirection,
    setLevel3SortMode,
    setMigrationPromptState,
    setNewSubcategoryName,
    setNewTransactionDate,
    setOpenAddSubcategoryFor,
    setPaymentSourceFieldVisibility,
    setSelectedPaymentSourceId,
    showHiddenCategories,
    sortedLevel1,
    sourceKind,
    status,
    styles,
    supabase,
    targetCategoryId,
    targetKind,
    toggleLevel1,
    toggleLevel1Calendar,
    toggleLevel2,
    toggleLevel3,
    toggleTransactionSelection,
    transactionCategoryPathLabels,
    transactionPaymentSplitsMap,
    transactionTagsMap,
    transactions,
    trashedTransactions,
    trashedTransactionsById,
    userId,
    value,
    visibleModules,
  } = ctx

  const openUtilityPanel = (panel: string | null) => {
    setIsDashboardPanelOpen?.(false)
    setActiveSidebarPrimaryPanel?.(null)
    setIsSettingsPanelVisible?.(false)
    setActiveUtilityPanel(panel)
  }

  return {
    visibleModules: effectiveVisibleModules,
    canCreateTransactions: canCreateTransactions,
    activeUtilityPanel: activeUtilityPanel,
    onCloseUtilityPanel: () => setActiveUtilityPanel(null),
    undoBannerProps: lastUndoAction && selectedTransactionIds.length === 0 && !migrationPromptState
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
            : null,
    categoryMigrationPromptProps: migrationPromptState
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
                getTransactionCategoryLabel: (categoryId: string) =>
                  categoriesById[categoryId]
                    ? getCategoryPathLabel(categoryId, categoriesById)
                    : 'Kategoria niedostępna',
                onTargetCategoryChange: (value: string) => {
                  setMigrationPromptState((prev: any) =>
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
            : null,
    bulkActionsBarProps: {
          selectedCount: selectedTransactionIds.length,
          targetCategoryId: bulkMoveTargetCategoryId,
          moveTargets: commonBulkMoveTargets,
          errorText: bulkActionErrorText,
          onTargetCategoryChange: (value: string) => {
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
        },
    draftsPanelProps: {
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
        },
    importExportPanelProps: {
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
        },
    paymentSourcesPanelProps: {
          paymentSources,
          paymentSourceStats,
          paymentSourceSettings,
          onSave: async (input: any) => {
            try {
              await savePaymentSource(input)
            } catch (error) {
              if (error instanceof Error) {
                alert(`Błąd zapisu źródła płatności: ${error.message}`)
              }
            }
          },
          onDelete: async (paymentSourceId: string) => {
            try {
              await deletePaymentSource(paymentSourceId)
            } catch (error) {
              if (error instanceof Error) {
                alert(`Błąd usuwania źródła płatności: ${error.message}`)
              }
            }
          },
          onSetDefault: async (kind: any, paymentSourceId: string | null) => {
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
          onSetFieldVisibility: async (kind: any, isVisible: boolean) => {
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
          onCopyList: async (sourceKind: any, targetKind: any) => {
            try {
              await copyPaymentSourcesBetweenKinds(sourceKind, targetKind)
            } catch (error) {
              if (error instanceof Error) {
                alert(`Błąd kopiowania list źródeł: ${error.message}`)
              }
            }
          },
          styles,
        },
    financialGoalsContainerProps: {
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
        },
    recurringTransactionsPanelProps: {
          selectedMonth,
          isSelectedMonthLocked,
          recurringTransactions: isRecurringTransactionsModuleEnabled ? recurringTransactions : [],
          recurringExecutions: isRecurringTransactionsModuleEnabled ? recurringExecutions : [],
          recurringReminderMonthStatuses: isRecurringTransactionsModuleEnabled
            ? recurringReminderMonthStatuses
            : [],
          transactions: scopedTransactions,
          categoriesById,
          paymentSources: isPaymentSourcesModuleEnabled ? paymentSources : [],
          transactionsById: activeTransactionsById,
          categoryOptions: finalCategoryOptions,
          onSaveRecurringTransaction: saveRecurringTransaction,
          onMarkRecurringRead: async (recurring: any) => {
            await saveRecurringReminderMonthStatus({
              reminderId: recurring.id,
              month: selectedMonth,
              status: 'read',
            })
          },
          onOpenCreateFromRecurring: openReminderTransactionCreator,
          onOpenCreateFromExecution: (recurring: any, execution: any) => {
            openReminderTransactionCreator(recurring)
            setNewTransactionDate(execution.generated_for_date)
          },
          styles,
        },
    searchPanelProps: {
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
        },
    monthCalendarPanelProps: {
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
        },
    budgetTreeSectionProps: {
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
          saveDraft,
          deleteDraft,
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
          onOpenSearch: () => openUtilityPanel('search'),
          onOpenCalendar: () => openUtilityPanel('monthCalendar'),
          workspaceTopContent: (
            <BudgetWorkspaceTopNotices
              previousMonthCloseReminder={previousMonthCloseReminder}
              profileId={profileId}
              userId={userId}
              selectedMonth={selectedMonth}
              isBudgetLimitsVisible={effectiveVisibleModules.budgetLimits}
              activeBudgetLimitsCount={activeBudgetLimits.length}
              activeBudgetLimitAlerts={activeBudgetLimitAlerts}
              categoriesById={categoriesById}
              pinnedWorkspaceCategories={pinnedWorkspaceCategories}
              styles={styles}
              onLockMonth={handleLockMonth}
              onHidePreviousMonthCloseReminder={() => setIsPreviousMonthCloseReminderHidden(true)}
              onOpenBudgetLimit={setBudgetLimitEditorCategoryId}
              onOpenPinnedCategory={openTransactionCreator}
            />
          ),
          workspaceBottomContent: (
            <MainWorkspaceBottomDeck
              selectedMonth={selectedMonth}
              calendarDays={contextCalendarDays}
              recentTransactions={recentTransactionPreviews}
              trashedCount={trashedTransactions.length}
              onOpenMonthCalendar={() => openUtilityPanel('monthCalendar')}
              onOpenDay={(dayText: string) => handleOpenGlobalCalendarAddForDay(dayText)}
              onOpenTrash={() => openUtilityPanel('trash')}
            />
          ),
        },
    hiddenCategoriesPanelProps: {
          categories: hiddenCategoriesInSelectedMonth,
          categoriesById,
          showHiddenCategories,
          getHiddenCategoryLabel,
          handleRestoreCategory,
          styles,
        },
    trashPanelProps: {
          transactions: trashedTransactions,
          categoriesById,
          getAmountNumber,
          onRestoreTransaction: handleRestoreTransaction,
          onPermanentDeleteTransaction: handlePermanentDeleteTransaction,
          onEmptyTrash: handleEmptyTrash,
          styles,
        },
  }
}
