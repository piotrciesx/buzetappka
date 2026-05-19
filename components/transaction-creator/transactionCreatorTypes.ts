import { CSSProperties, RefObject } from 'react'
import { DescriptionSuggestion, DescriptionSuggestionSet } from '../../lib/suggestionUtils'
import { PaymentSplitInput } from '../../lib/paymentSplitUtils'

export type Category = {
  id: string
  name: string
  parent_id: string | null
  level: number
  default_order?: number | null
  sort_order?: number | null
  active_to?: string | null
  reactivate_from?: string | null
}

export type TransactionShortcut = {
  id: string
  label: string
}

export type TransactionCreatorRecurringOption = {
  id: string
  label: string
  description?: string
  amount?: number | null
  useAmountWhenCreating?: boolean
  hasTransactionInMonth?: boolean
}

export type TransactionCreatorModalProps = {
  isOpen: boolean
  selectedMonth: string
  level1Categories: Category[]
  level2ByParentId: Record<string, Category[]>
  level3ByParentId: Record<string, Category[]>
  categoriesById: Record<string, Category>
  suggestedCategoryId: string | null
  lockedLevel1Id: string | null
  topShortcutCategories: TransactionShortcut[]
  pinnedShortcutCategories: TransactionShortcut[]
  pinnedCategoryIds: string[]
  recentShortcutCategories: TransactionShortcut[]
  descriptionSuggestions: DescriptionSuggestionSet
  onSelectShortcutCategory: (categoryId: string) => void
  onTogglePinnedCategory: (categoryId: string) => void
  selectedLevel1Id: string | null
  setSelectedLevel1Id: (value: string | null) => void
  selectedLevel2Id: string | null
  setSelectedLevel2Id: (value: string | null) => void
  selectedCategoryId: string | null
  setSelectedCategoryId: (value: string | null) => void
  isSerialModeEnabled: boolean
  setIsSerialModeEnabled: (value: boolean) => void
  isQuickDayModeEnabled: boolean
  setIsQuickDayModeEnabled: (value: boolean) => void
  setQuickDayDate: (value: string) => void
  amount: string
  setAmount: (value: string) => void
  description: string
  setDescription: (value: string) => void
  transactionDate: string
  setTransactionDate: (value: string) => void
  selectedTagNames: string[]
  setSelectedTagNames: (value: string[]) => void
  selectedPaymentSourceId: string
  setSelectedPaymentSourceId: (value: string) => void
  isPaymentSourceVisible: boolean
  paymentSourceOptions: Array<{
    id: string
    name: string
    type: string
    optionLabel?: string
  }>
  paymentSplitItems: PaymentSplitInput[]
  setPaymentSplitItems: (
    value: PaymentSplitInput[] | ((prev: PaymentSplitInput[]) => PaymentSplitInput[])
  ) => void
  selectedRecurringTransactionId: string
  setSelectedRecurringTransactionId: (value: string) => void
  recurringOptions: TransactionCreatorRecurringOption[]
  recurringSuggestions: TransactionCreatorRecurringOption[]
  isSaving: boolean
  onClose: () => void
  onSave: () => Promise<void>
  onSaveAndClose: () => Promise<void>
  amountInputRef: RefObject<HTMLInputElement | null>
  descriptionInputRef: RefObject<HTMLInputElement | null>
  styles: Record<string, CSSProperties>
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
}
