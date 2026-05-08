import type { CSSProperties } from 'react'
import type { Tag } from '../../lib/budgetPageTypes'
import type { DescriptionSuggestion, DescriptionSuggestionSet } from '../../lib/suggestionUtils'
import type { PaymentSplitInput } from '../../lib/paymentSplitUtils'

export type Transaction = {
  id: string
  category_id: string
  amount: number | string
  description: string | null
  date: string
  day_is_null?: boolean
  payment_source_id?: string | null
  recurring_transaction_id?: string | null
  created_at?: string
  is_deleted?: boolean
  deleted_at?: string | null
}

export type TransactionPaymentSplit = {
  id: string
  transaction_id: string
  payment_source_id: string
  amount: number
  created_at?: string
}

export type MoveTarget = {
  id: string
  label: string
}

export type HeatmapMode = 'normal' | 'balance'
export type HeatmapVariant = 'balance' | 'income' | 'expense'

export type MonthCalendarPanelProps = {
  selectedMonth: string
  transactions: Transaction[]
  budgetStartDate?: string
  isSelectedMonthExcluded?: boolean
  isUpdatingSelectedMonthExclusion?: boolean
  onToggleSelectedMonthExcluded?: () => Promise<void>
  styles: Record<string, CSSProperties>
  isSelectedMonthLocked: boolean
  getAmountNumber: (value: unknown) => number
  getMoveTargetsForTransaction: (transaction: Transaction) => MoveTarget[]
  getSignedAmountForTransaction: (transaction: Transaction) => number
  onUpdateTransaction: (
    transactionId: string,
    amountText: string,
    descriptionText: string,
    dateText: string,
    tagNames?: string[],
    dayIsNullOverride?: boolean,
    paymentSourceId?: string | null,
    paymentSplitItems?: PaymentSplitInput[]
  ) => Promise<void>
  onDeleteTransaction: (transactionId: string) => Promise<void>
  onMoveTransaction: (transactionId: string, targetCategoryId: string) => Promise<void>
  onDuplicateTransaction?: (transaction: Transaction) => void
  onAddTransactionForDay?: (dayText: string) => void
  calendarTitle?: string
  calendarSubtitle?: string
  heatmapVariant?: HeatmapVariant
  heatmapMode?: HeatmapMode
  onHeatmapModeChange?: (value: HeatmapMode) => void
  heatmapInverted?: boolean
  onHeatmapInvertedChange?: (value: boolean) => void
  defaultHeatmapMode?: HeatmapMode
  defaultHeatmapInverted?: boolean
  heatmapStorageKey?: string
  showHeatmapControls?: boolean
  descriptionSuggestions: DescriptionSuggestionSet
  getPaymentSourceOptionsForCategoryId?: (
    categoryId: string
  ) => Array<{
    id: string
    name: string
    type: string
    optionLabel?: string
  }>
  transactionTagsMap?: Record<string, Tag[]>
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
  onTagClick?: (tagId: string) => void
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
}
