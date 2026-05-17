import { CSSProperties } from 'react'
import type { BudgetLimitView } from '../BudgetLimitIndicator'
import type { HeatmapMode } from '../month-calendar/monthCalendarTypes'
import type { DescriptionSuggestion } from '../../lib/suggestionUtils'
import type { Tag, TransactionPaymentSplit } from '../../lib/budgetPageTypes'
import type { TransactionDraft } from '../../lib/draftUtils'
import type {
  Category,
  HideMode,
  MoveTarget,
  RecurringLinkOption,
  RestoreMode,
  Transaction,
} from './Level2SectionUtils'

export type Level2SectionProps = {
  l2: Category
  sortedLevel3Children: Category[]
  budgetLimitView?: BudgetLimitView | null
  canUseBudgetLimit?: boolean
  onEditBudgetLimit?: (categoryId: string | null) => void
  getBudgetLimitView?: (categoryId: string | null) => BudgetLimitView | null
  selectedMonth: string
  budgetStartDate: string
  isSelectedMonthLocked: boolean
  canUseMonthCalendar?: boolean
  isClosingAfterSelectedMonth: boolean
  openLevel2Ids: string[]
  toggleLevel2: (id: string) => void
  openLevel3Ids: string[]
  toggleLevel3: (id: string) => void
  getSumForLevel2: (id: string) => number
  getSumForCategory: (id: string) => number
  getTransactionsForCategoryAndMonth: (id: string) => Transaction[]
  openAddSubcategoryFor: string | null
  newSubcategoryIconKey: string | null
  setOpenAddSubcategoryFor: (id: string | null) => void
  newSubcategoryName: string
  setNewSubcategoryIconKey: (value: string | null) => void
  setNewSubcategoryName: (value: string) => void
  handleAddSubcategory: (level2Id: string, iconKey?: string | null) => Promise<void>
  handleRenameCategory: (categoryId: string) => Promise<void>
  handleUpdateCategoryIcon: (categoryId: string, iconKey: string | null) => Promise<void>
  handleDeleteCategory: (categoryId: string) => Promise<void>
  openTransactionCreator: (suggestedCategoryId: string) => void
  handleInlineSaveTransaction: (
    categoryId: string,
    amountText: string,
    descriptionText: string,
    dayText: string,
    tagNames?: string[],
    paymentSourceId?: string | null,
    paymentSplitItems?: Array<{ paymentSourceId: string; amount: string }>,
    recurringTransactionId?: string | null
  ) => Promise<void>
  saveDraft: (draft: TransactionDraft, options?: { activate?: boolean }) => Promise<TransactionDraft>
  deleteDraft: (draftType: TransactionDraft['type']) => Promise<void>
  inlineDraftType: TransactionDraft['type']
  inlineDraftLevel1Id: string
  handleHideCategory: (id: string, mode?: HideMode) => Promise<void>
  handleRestoreCategory: (id: string, mode?: RestoreMode) => Promise<void>
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
    paymentSplitItems?: Array<{ paymentSourceId: string; amount: string }>
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
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
  onTagClick?: (tagId: string) => void
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
  isSortable?: boolean
  isDragDisabled?: boolean
  handleLevel3DragStart: (activeId: string) => void
  handleReorderLevel3: (level2Id: string, activeId: string, overId: string) => Promise<void>
  isReorderingLevel2: boolean
  isReorderingLevel3: boolean
  getAmountNumber: (value: unknown) => number
  styles: Record<string, CSSProperties>
}
