import type { CSSProperties } from 'react'
import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Level3Section from '../Level3Section'
import type { BudgetLimitView } from '../BudgetLimitIndicator'
import type { HeatmapMode } from '../month-calendar/monthCalendarTypes'
import type { Tag, TransactionPaymentSplit } from '../../lib/budgetPageTypes'
import type { PaymentSplitInput } from '../../lib/paymentSplitUtils'
import type { DescriptionSuggestion } from '../../lib/suggestionUtils'
import type { Category, HideMode, MoveTarget, RecurringLinkOption, Transaction } from './Level2SectionUtils'

type Level2ChildrenProps = {
  l2: Category
  sortedLevel3Children: Category[]
  sensors: ReturnType<typeof import('../../lib/usePressHoldDndSensors').usePressHoldDndSensors>
  isLevel3DndBlocked: boolean
  selectedMonth: string
  budgetStartDate: string
  isSelectedMonthLocked: boolean
  canUseMonthCalendar: boolean
  openLevel3Ids: string[]
  toggleLevel3: (id: string) => void
  handleLevel3DragStart: (activeId: string) => void
  handleLevel3DragEnd: (event: DragEndEvent) => Promise<void>
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
  handleHideCategory: (id: string, mode?: HideMode) => Promise<void>
  handleRenameCategory: (categoryId: string) => Promise<void>
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
  handleOpenCalendarAddForDay: (categoryId: string, dayText: string) => void
  selectedTransactionIds: string[]
  onToggleTransactionSelection: (transactionId: string) => void
  getMoveTargetsForTransaction: (transaction: Transaction) => MoveTarget[]
  getSignedAmountForTransaction: (transaction: Transaction) => number
  calendarHeatmapVariant: 'balance' | 'income' | 'expense'
  heatmapMode: HeatmapMode
  heatmapInverted: boolean
  onHeatmapModeChange: (value: HeatmapMode) => void
  onHeatmapInvertedChange: (value: boolean) => void
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
  getRecurringOptionsForCategoryId?: (categoryId: string) => RecurringLinkOption[]
  getDefaultPaymentSourceIdForCategoryId?: (categoryId: string) => string
  transactionTagsMap: Record<string, Tag[]>
  transactionPaymentSplitsMap: Record<string, TransactionPaymentSplit[]>
  onTagClick?: (tagId: string) => void
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
  canUseBudgetLimit: boolean
  onEditBudgetLimit?: (categoryId: string | null) => void
  getBudgetLimitView?: (categoryId: string | null) => BudgetLimitView | null
  getAmountNumber: (value: unknown) => number
  getSumForCategory: (id: string) => number
  getTransactionsForCategoryAndMonth: (id: string) => Transaction[]
  isChildClosingAfterSelectedMonth: (category: Category) => boolean
  styles: Record<string, CSSProperties>
}

export default function Level2Children({
  l2,
  sortedLevel3Children,
  sensors,
  isLevel3DndBlocked,
  selectedMonth,
  budgetStartDate,
  isSelectedMonthLocked,
  canUseMonthCalendar,
  openLevel3Ids,
  toggleLevel3,
  handleLevel3DragStart,
  handleLevel3DragEnd,
  openTransactionCreator,
  handleInlineSaveTransaction,
  handleHideCategory,
  handleRenameCategory,
  handleDeleteCategory,
  handleUndoScheduledHide,
  handleDeleteTransaction,
  handleUpdateTransaction,
  handleMoveTransaction,
  handleDuplicateTransaction,
  handleOpenCalendarAddForDay,
  selectedTransactionIds,
  onToggleTransactionSelection,
  getMoveTargetsForTransaction,
  getSignedAmountForTransaction,
  calendarHeatmapVariant,
  heatmapMode,
  heatmapInverted,
  onHeatmapModeChange,
  onHeatmapInvertedChange,
  descriptionSuggestions,
  getPaymentSourceOptionsForCategoryId,
  getRecurringOptionsForCategoryId,
  getDefaultPaymentSourceIdForCategoryId,
  transactionTagsMap,
  transactionPaymentSplitsMap,
  onTagClick,
  onDeleteDescriptionSuggestion,
  canUseBudgetLimit,
  onEditBudgetLimit,
  getBudgetLimitView,
  getAmountNumber,
  getSumForCategory,
  getTransactionsForCategoryAndMonth,
  isChildClosingAfterSelectedMonth,
  styles,
}: Level2ChildrenProps) {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => {
        handleLevel3DragStart(String(event.active.id))
      }}
      onDragEnd={handleLevel3DragEnd}
    >
      <SortableContext
        items={sortedLevel3Children.map((category) => category.id)}
        strategy={verticalListSortingStrategy}
      >
        {sortedLevel3Children.map((l3) => (
          <Level3Section
            key={l3.id}
            l3={l3}
            selectedMonth={selectedMonth}
            budgetStartDate={budgetStartDate}
            isClosingAfterSelectedMonth={isChildClosingAfterSelectedMonth(l3)}
            categorySum={getSumForCategory(l3.id)}
            transactions={getTransactionsForCategoryAndMonth(l3.id)}
            canAddHere={true}
            isSelectedMonthLocked={isSelectedMonthLocked}
            canUseMonthCalendar={canUseMonthCalendar}
            isOpen={openLevel3Ids.includes(l3.id)}
            toggleLevel3={toggleLevel3}
            handleLevel3DragStart={handleLevel3DragStart}
            openTransactionCreator={openTransactionCreator}
            handleInlineSaveTransaction={handleInlineSaveTransaction}
            handleHideCategory={handleHideCategory}
            handleRenameCategory={handleRenameCategory}
            handleDeleteCategory={handleDeleteCategory}
            handleUndoScheduledHide={handleUndoScheduledHide}
            handleDeleteTransaction={handleDeleteTransaction}
            handleUpdateTransaction={handleUpdateTransaction}
            handleMoveTransaction={handleMoveTransaction}
            handleDuplicateTransaction={handleDuplicateTransaction}
            handleOpenCalendarAddForDay={handleOpenCalendarAddForDay}
            selectedTransactionIds={selectedTransactionIds}
            onToggleTransactionSelection={onToggleTransactionSelection}
            getMoveTargetsForTransaction={getMoveTargetsForTransaction}
            getSignedAmountForTransaction={getSignedAmountForTransaction}
            calendarHeatmapVariant={calendarHeatmapVariant}
            heatmapMode={heatmapMode}
            heatmapInverted={heatmapInverted}
            onHeatmapModeChange={onHeatmapModeChange}
            onHeatmapInvertedChange={onHeatmapInvertedChange}
            heatmapStorageKey={`budget-app-tree-calendar-${l3.id}`}
            descriptionSuggestions={descriptionSuggestions}
            getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
            getRecurringOptionsForCategoryId={getRecurringOptionsForCategoryId}
            getDefaultPaymentSourceIdForCategoryId={getDefaultPaymentSourceIdForCategoryId}
            transactionTagsMap={transactionTagsMap}
            transactionPaymentSplitsMap={transactionPaymentSplitsMap}
            onTagClick={onTagClick}
            onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
            budgetLimitView={canUseBudgetLimit ? getBudgetLimitView?.(l3.id) ?? null : null}
            canUseBudgetLimit={canUseBudgetLimit}
            onEditBudgetLimit={onEditBudgetLimit}
            isSortable={sortedLevel3Children.length > 1}
            isDragDisabled={isLevel3DndBlocked}
            getAmountNumber={getAmountNumber}
            styles={styles}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}
