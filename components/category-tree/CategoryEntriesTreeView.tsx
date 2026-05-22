import type { CSSProperties } from 'react'
import Level3Section from '../Level3Section'
import type { BudgetLimitView } from '../BudgetLimitIndicator'
import type { HeatmapMode } from '../month-calendar/monthCalendarTypes'
import type { Tag, TransactionPaymentSplit } from '../../lib/budgetPageTypes'
import type { PaymentSplitInput } from '../../lib/paymentSplitUtils'
import type { DescriptionSuggestion } from '../../lib/suggestionUtils'
import type { TransactionDraft } from '../../lib/draftUtils'
import type {
  CategoryEntriesPopupChildGroup,
  CategoryEntriesPopupViewModel,
} from '../../lib/buildCategoryEntriesPopupViewModel'
import type { Category, HideMode, MoveTarget, Transaction } from './Level3SectionUtils'

type CategoryEntriesTreeViewProps = {
  viewModel: CategoryEntriesPopupViewModel
  selectedMonth: string
  budgetStartDate: string
  isSelectedMonthLocked: boolean
  canUseMonthCalendar: boolean
  expenseLevel1Id: string | null
  isCategoryClosingAfterSelectedMonth: (category: Category, selectedMonth: string) => boolean
  getSumForCategoryForSelectedMonth: (categoryId: string) => number
  getAmountNumber: (value: unknown) => number
  getMoveTargetsForTransaction: (transaction: Transaction) => MoveTarget[]
  getSignedAmountForTransaction: (transaction: Transaction) => number
  getCalendarHeatmapVariantForLevel1Id: (
    level1Id: string | null
  ) => 'balance' | 'income' | 'expense'
  heatmapMode: HeatmapMode
  heatmapInverted: boolean
  onHeatmapModeChange: (value: HeatmapMode) => void
  onHeatmapInvertedChange: (value: boolean) => void
  openTransactionCreator: (suggestedCategoryId: string) => void
  handleInlineSaveTransaction: (
    categoryId: string,
    amountText: string,
    descriptionText: string,
    dayText: string,
    tagNames?: string[],
    paymentSourceId?: string | null,
    paymentSplitItems?: PaymentSplitInput[],
    recurringTransactionId?: string | null
  ) => Promise<void>
  saveDraft: (draft: TransactionDraft, options?: { activate?: boolean }) => Promise<TransactionDraft>
  deleteDraft: (draftType: TransactionDraft['type']) => Promise<void>
  handleHideCategory: (id: string, mode?: HideMode) => Promise<void>
  handleRenameCategory: (categoryId: string) => Promise<void>
  handleUpdateCategoryIcon: (categoryId: string, iconKey: string | null) => Promise<void>
  handleDeleteCategory: (categoryId: string) => Promise<void>
  handleUndoScheduledHide: (id: string) => Promise<void>
  handleDeleteTransaction: (id: string) => Promise<void>
  handleUpdateTransaction: (
    id: string,
    amount: string,
    description: string,
    date: string,
    tagNames?: string[],
    dayIsNullOverride?: boolean,
    paymentSourceId?: string | null,
    paymentSplitItems?: PaymentSplitInput[]
  ) => Promise<void>
  handleMoveTransaction: (id: string, targetCategoryId: string) => Promise<void>
  handleDuplicateTransaction?: (transaction: Transaction) => void
  handleOpenCategoryCalendarAddForDay: (categoryId: string, dayText: string) => void
  handleOpenLevel1CalendarAddForDay: (level1Id: string, dayText: string) => void
  handleLevel3DragStart: (activeId: string) => void
  selectedTransactionIds: string[]
  onToggleTransactionSelection: (transactionId: string) => void
  descriptionSuggestions: {
    global: DescriptionSuggestion[]
    byCategory: Record<string, DescriptionSuggestion[]>
  }
  getPaymentSourceOptionsForCategoryId?: (
    categoryId: string
  ) => Array<{
    id: string
    name: string
    type: string
    optionLabel?: string
  }>
  getRecurringOptionsForCategoryId?: (categoryId: string) => Array<{
    id: string
    label: string
    description?: string
    amount?: number | null
    useAmountWhenCreating?: boolean
    hasTransactionInMonth?: boolean
  }>
  getDefaultPaymentSourceIdForCategoryId?: (categoryId: string) => string
  transactionTagsMap: Record<string, Tag[]>
  transactionPaymentSplitsMap: Record<string, TransactionPaymentSplit[]>
  onTagClick?: (tagId: string) => void
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
  styles: Record<string, CSSProperties>
}

export default function CategoryEntriesTreeView({
  viewModel,
  selectedMonth,
  budgetStartDate,
  isSelectedMonthLocked,
  canUseMonthCalendar,
  expenseLevel1Id,
  isCategoryClosingAfterSelectedMonth,
  getSumForCategoryForSelectedMonth,
  getAmountNumber,
  getMoveTargetsForTransaction,
  getSignedAmountForTransaction,
  getCalendarHeatmapVariantForLevel1Id,
  heatmapMode,
  heatmapInverted,
  onHeatmapModeChange,
  onHeatmapInvertedChange,
  openTransactionCreator,
  handleInlineSaveTransaction,
  saveDraft,
  deleteDraft,
  handleHideCategory,
  handleRenameCategory,
  handleUpdateCategoryIcon,
  handleDeleteCategory,
  handleUndoScheduledHide,
  handleDeleteTransaction,
  handleUpdateTransaction,
  handleMoveTransaction,
  handleDuplicateTransaction,
  handleOpenCategoryCalendarAddForDay,
  handleOpenLevel1CalendarAddForDay,
  handleLevel3DragStart,
  selectedTransactionIds,
  onToggleTransactionSelection,
  descriptionSuggestions,
  getPaymentSourceOptionsForCategoryId,
  getRecurringOptionsForCategoryId,
  getDefaultPaymentSourceIdForCategoryId,
  transactionTagsMap,
  transactionPaymentSplitsMap,
  onTagClick,
  onDeleteDescriptionSuggestion,
  styles,
}: CategoryEntriesTreeViewProps) {
  const inlineDraftType = viewModel.parentLevel1.id === expenseLevel1Id ? 'expense' : 'income'
  const calendarHeatmapVariant = getCalendarHeatmapVariantForLevel1Id(viewModel.parentLevel1.id)

  const getInlineDraftLevel2Id = (category: Category, parentLevel2: Category | null) => {
    if (category.level === 2) {
      return category.id
    }

    if (category.level === 3) {
      return parentLevel2?.id || category.parent_id || null
    }

    return null
  }

  const renderTransactionSection = (
    category: Category,
    transactions: Transaction[],
    headerName: string,
    parentLevel2: Category | null
  ) => {
    const canAddHere =
      viewModel.canInlineAdd && viewModel.inlineAddTargetCategoryId === category.id

    return (
      <Level3Section
        key={`entries-${category.id}-${headerName}`}
        l3={category}
        headerName={headerName}
        showCategoryActions={false}
        selectedMonth={selectedMonth}
        budgetStartDate={budgetStartDate}
        isClosingAfterSelectedMonth={isCategoryClosingAfterSelectedMonth(
          category,
          selectedMonth
        )}
        categorySum={getSumForCategoryForSelectedMonth(category.id)}
        transactions={transactions}
        canAddHere={canAddHere}
        isSelectedMonthLocked={isSelectedMonthLocked}
        canUseMonthCalendar={canUseMonthCalendar}
        isOpen={true}
        toggleLevel3={() => {}}
        handleLevel3DragStart={handleLevel3DragStart}
        openTransactionCreator={openTransactionCreator}
        handleInlineSaveTransaction={handleInlineSaveTransaction}
        saveDraft={saveDraft}
        deleteDraft={deleteDraft}
        inlineDraftType={inlineDraftType}
        inlineDraftLevel1Id={viewModel.parentLevel1.id}
        inlineDraftLevel2Id={getInlineDraftLevel2Id(category, parentLevel2)}
        handleHideCategory={handleHideCategory}
        handleRenameCategory={handleRenameCategory}
        handleUpdateCategoryIcon={handleUpdateCategoryIcon}
        handleDeleteCategory={handleDeleteCategory}
        handleUndoScheduledHide={handleUndoScheduledHide}
        handleDeleteTransaction={handleDeleteTransaction}
        handleUpdateTransaction={handleUpdateTransaction}
        handleMoveTransaction={handleMoveTransaction}
        handleDuplicateTransaction={handleDuplicateTransaction}
        handleOpenCalendarAddForDay={(categoryId, dayText) => {
          if (category.level === 1) {
            handleOpenLevel1CalendarAddForDay(viewModel.parentLevel1.id, dayText)
            return
          }

          handleOpenCategoryCalendarAddForDay(categoryId, dayText)
        }}
        selectedTransactionIds={selectedTransactionIds}
        onToggleTransactionSelection={onToggleTransactionSelection}
        getMoveTargetsForTransaction={getMoveTargetsForTransaction}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
        calendarHeatmapVariant={calendarHeatmapVariant}
        heatmapMode={heatmapMode}
        heatmapInverted={heatmapInverted}
        onHeatmapModeChange={onHeatmapModeChange}
        onHeatmapInvertedChange={onHeatmapInvertedChange}
        heatmapStorageKey={`budget-app-tree-popup-calendar-${category.id}`}
        descriptionSuggestions={descriptionSuggestions}
        getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
        getRecurringOptionsForCategoryId={getRecurringOptionsForCategoryId}
        getDefaultPaymentSourceIdForCategoryId={getDefaultPaymentSourceIdForCategoryId}
        transactionTagsMap={transactionTagsMap}
        transactionPaymentSplitsMap={transactionPaymentSplitsMap}
        onTagClick={onTagClick}
        onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
        getAmountNumber={getAmountNumber}
        styles={styles}
      />
    )
  }

  const renderGroup = (group: CategoryEntriesPopupChildGroup) => {
    if (group.categoryLevel === 3) {
      return renderTransactionSection(
        group.category,
        group.directEntries,
        group.category.name,
        viewModel.clickedCategoryLevel === 2 ? viewModel.clickedCategory : viewModel.parentLevel2
      )
    }

    return (
      <div key={`group-${group.category.id}`}>
        {renderTransactionSection(
          group.category,
          group.directEntries,
          `${group.category.name} • bezpośrednie`,
          group.category
        )}
        {group.children.map((child) =>
          renderTransactionSection(
            child.category,
            child.directEntries,
            `${group.category.name} • ${child.category.name}`,
            group.category
          )
        )}
      </div>
    )
  }

  const shouldRenderDirectSection =
    viewModel.canInlineAdd || viewModel.directEntries.length > 0 || viewModel.children.length === 0

  return (
    <>
      {shouldRenderDirectSection &&
        renderTransactionSection(
          viewModel.clickedCategory,
          viewModel.directEntries,
          viewModel.hasChildren ? 'Wpisy bezpośrednie' : viewModel.clickedCategory.name,
          viewModel.parentLevel2
        )}

      {viewModel.groupedChildren.map(renderGroup)}

      {!shouldRenderDirectSection && viewModel.groupedChildren.length === 0 && (
        <div style={styles.emptyText}>Brak wpisów w tym miesiącu</div>
      )}
    </>
  )
}
