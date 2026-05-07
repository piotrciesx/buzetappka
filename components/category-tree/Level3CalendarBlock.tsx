import type { CSSProperties } from 'react'
import type { Tag, TransactionPaymentSplit } from '../../lib/budgetPageTypes'
import type { DescriptionSuggestion, DescriptionSuggestionSet } from '../../lib/suggestionUtils'
import type { PaymentSplitInput } from '../../lib/paymentSplitUtils'
import MonthCalendarPanel from '../MonthCalendarPanel'
import type { HeatmapMode } from '../month-calendar/monthCalendarTypes'

type Transaction = {
  id: string
  category_id: string
  amount: number | string
  description: string | null
  date: string
  day_is_null?: boolean
  payment_source_id?: string | null
  created_at?: string
  is_deleted?: boolean
  deleted_at?: string | null
}

type MoveTarget = {
  id: string
  label: string
}

type Level3CalendarBlockProps = {
  isOpen: boolean
  selectedMonth: string
  budgetStartDate: string
  transactions: Transaction[]
  styles: Record<string, CSSProperties>
  isSelectedMonthLocked: boolean
  getAmountNumber: (value: unknown) => number
  getMoveTargetsForTransaction: (transaction: Transaction) => MoveTarget[]
  getSignedAmountForTransaction: (transaction: Transaction) => number
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
  handleDeleteTransaction: (id: string) => Promise<void>
  handleMoveTransaction: (id: string, targetCategoryId: string) => Promise<void>
  calendarHeatmapVariant: 'balance' | 'income' | 'expense'
  heatmapMode: HeatmapMode
  heatmapInverted: boolean
  onHeatmapModeChange: (value: HeatmapMode) => void
  onHeatmapInvertedChange: (value: boolean) => void
  heatmapStorageKey: string
  descriptionSuggestions: DescriptionSuggestionSet
  transactionTagsMap: Record<string, Tag[]>
  onTagClick?: (tagId: string) => void
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
  onAddTransactionForDay: (dayText: string) => void
  categoryName: string
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
  getPaymentSourceOptionsForCategoryId?: (
    categoryId: string
  ) => Array<{
    id: string
    name: string
    type: string
    optionLabel?: string
  }>
}

export default function Level3CalendarBlock({
  isOpen,
  selectedMonth,
  budgetStartDate,
  transactions,
  styles,
  isSelectedMonthLocked,
  getAmountNumber,
  getMoveTargetsForTransaction,
  getSignedAmountForTransaction,
  handleUpdateTransaction,
  handleDeleteTransaction,
  handleMoveTransaction,
  calendarHeatmapVariant,
  heatmapMode,
  heatmapInverted,
  onHeatmapModeChange,
  onHeatmapInvertedChange,
  heatmapStorageKey,
  descriptionSuggestions,
  transactionTagsMap,
  onTagClick,
  onDeleteDescriptionSuggestion,
  onAddTransactionForDay,
  categoryName,
  transactionPaymentSplitsMap,
  getPaymentSourceOptionsForCategoryId,
}: Level3CalendarBlockProps) {
  if (!isOpen) {
    return null
  }

  return (
    <MonthCalendarPanel
      selectedMonth={selectedMonth}
      budgetStartDate={budgetStartDate}
      transactions={transactions}
      styles={styles}
      isSelectedMonthLocked={isSelectedMonthLocked}
      getAmountNumber={getAmountNumber}
      getMoveTargetsForTransaction={getMoveTargetsForTransaction}
      getSignedAmountForTransaction={getSignedAmountForTransaction}
      onUpdateTransaction={handleUpdateTransaction}
      onDeleteTransaction={handleDeleteTransaction}
      onMoveTransaction={handleMoveTransaction}
      heatmapVariant={calendarHeatmapVariant}
      heatmapMode={heatmapMode}
      heatmapInverted={heatmapInverted}
      onHeatmapModeChange={onHeatmapModeChange}
      onHeatmapInvertedChange={onHeatmapInvertedChange}
      heatmapStorageKey={heatmapStorageKey}
      descriptionSuggestions={descriptionSuggestions}
      transactionTagsMap={transactionTagsMap}
      transactionPaymentSplitsMap={transactionPaymentSplitsMap}
      getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
      onTagClick={onTagClick}
      onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
      onAddTransactionForDay={onAddTransactionForDay}
      calendarTitle={`Kalendarz • ${categoryName}`}
      calendarSubtitle=""
    />
  )
}
