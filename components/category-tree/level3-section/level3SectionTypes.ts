import { CSSProperties } from 'react'
import type { BudgetLimitView } from '../../BudgetLimitIndicator'
import type { HeatmapMode } from '../../month-calendar/monthCalendarTypes'
import type { Tag, TransactionPaymentSplit } from '../../../lib/budgetPageTypes'
import type { DescriptionSuggestion, DescriptionSuggestionSet } from '../../../lib/suggestionUtils'
import type { PaymentSplitInput } from '../../../lib/paymentSplitUtils'
import type { TransactionDraft } from '../../../lib/draftUtils'
import type { Category, HideMode, MoveTarget, RecurringLinkOption, Transaction } from '../Level3SectionUtils'

export type Level3SectionProps = {
  l3: Category
  headerName?: string
  hideHeader?: boolean
  startInlineAddToken?: number
  showHeaderSum?: boolean
  showCategoryActions?: boolean
  renderTransactionsInline?: boolean
  onOpenEntries?: (categoryId: string) => void
  selectedMonth: string
  profileId?: string
  userId?: string
  budgetStartDate: string
  isClosingAfterSelectedMonth: boolean
  categorySum: number
  transactions: Transaction[]
  canAddHere: boolean
  canUseMonthCalendar?: boolean
  isSelectedMonthLocked: boolean
  isOpen: boolean
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
  saveDraft: (draft: TransactionDraft, options?: { activate?: boolean }) => Promise<TransactionDraft>
  deleteDraft: (draftType: TransactionDraft['type']) => Promise<void>
  inlineDraftType: TransactionDraft['type']
  inlineDraftLevel1Id: string
  inlineDraftLevel2Id: string | null
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
  legacyHeatmapStorageKeys?: string[]
  descriptionSuggestions: DescriptionSuggestionSet
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
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
  onTagClick?: (tagId: string) => void
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
  budgetLimitView?: BudgetLimitView | null
  canUseBudgetLimit?: boolean
  onEditBudgetLimit?: (categoryId: string | null) => void
  isSortable?: boolean
  isDragDisabled?: boolean
  getAmountNumber: (value: unknown) => number
  styles: Record<string, CSSProperties>
}
