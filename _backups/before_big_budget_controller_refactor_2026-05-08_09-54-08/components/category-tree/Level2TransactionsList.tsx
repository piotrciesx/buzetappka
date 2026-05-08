import type { CSSProperties } from 'react'
import Level3Section from '../Level3Section'
import type { BudgetLimitView } from '../BudgetLimitIndicator'
import type { HeatmapMode } from '../month-calendar/monthCalendarTypes'
import type { Tag, TransactionPaymentSplit } from '../../lib/budgetPageTypes'
import type { PaymentSplitInput } from '../../lib/paymentSplitUtils'
import type { DescriptionSuggestion } from '../../lib/suggestionUtils'
import type { Category, HideMode, MoveTarget, RecurringLinkOption, Transaction } from './Level2SectionUtils'

type Level2TransactionsListProps = {
  l2: Category
  inlineAddToken: number
  selectedMonth: string
  budgetStartDate: string
  isClosingAfterSelectedMonth: boolean
  isSelectedMonthLocked: boolean
  canUseMonthCalendar: boolean
  toggleLevel3: (id: string) => void
  handleLevel3DragStart: (activeId: string) => void
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
  heatmapStorageKey: string
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
  getAmountNumber: (value: unknown) => number
  getSumForCategory: (id: string) => number
  getTransactionsForCategoryAndMonth: (id: string) => Transaction[]
  styles: Record<string, CSSProperties>
}

export default function Level2TransactionsList({
  l2,
  inlineAddToken,
  selectedMonth,
  budgetStartDate,
  isClosingAfterSelectedMonth,
  isSelectedMonthLocked,
  canUseMonthCalendar,
  toggleLevel3,
  handleLevel3DragStart,
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
  heatmapStorageKey,
  descriptionSuggestions,
  getPaymentSourceOptionsForCategoryId,
  getRecurringOptionsForCategoryId,
  getDefaultPaymentSourceIdForCategoryId,
  transactionTagsMap,
  transactionPaymentSplitsMap,
  onTagClick,
  onDeleteDescriptionSuggestion,
  getAmountNumber,
  getSumForCategory,
  getTransactionsForCategoryAndMonth,
  styles,
}: Level2TransactionsListProps) {
  return (
    <Level3Section
      l3={l2}
      hideHeader
      startInlineAddToken={inlineAddToken}
      headerName="Wpisy w kategorii"
      showHeaderSum={false}
      showCategoryActions={false}
      selectedMonth={selectedMonth}
      budgetStartDate={budgetStartDate}
      isClosingAfterSelectedMonth={isClosingAfterSelectedMonth}
      categorySum={getSumForCategory(l2.id)}
      transactions={getTransactionsForCategoryAndMonth(l2.id)}
      canAddHere={true}
      isSelectedMonthLocked={isSelectedMonthLocked}
      canUseMonthCalendar={canUseMonthCalendar}
      isOpen={true}
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
      heatmapStorageKey={heatmapStorageKey}
      descriptionSuggestions={descriptionSuggestions}
      getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
      getRecurringOptionsForCategoryId={getRecurringOptionsForCategoryId}
      getDefaultPaymentSourceIdForCategoryId={getDefaultPaymentSourceIdForCategoryId}
      transactionTagsMap={transactionTagsMap}
      transactionPaymentSplitsMap={transactionPaymentSplitsMap}
      onTagClick={onTagClick}
      onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
      budgetLimitView={null as BudgetLimitView | null}
      canUseBudgetLimit={false}
      onEditBudgetLimit={undefined}
      getAmountNumber={getAmountNumber}
      styles={styles}
    />
  )
}
