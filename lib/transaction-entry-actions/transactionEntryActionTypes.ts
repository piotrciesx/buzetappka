import { RefObject } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import type { Category, Tag, Transaction, UndoAction } from '../budgetPageTypes'
import type { PaymentSplitInput } from '../paymentSplitUtils'

export type DraftType = 'income' | 'expense' | null

export type UseTransactionEntryActionsParams = {
  supabase: SupabaseClient
  profileId: string
  selectedMonth: string
  visibleCategories: Category[]
  categoriesById: Record<string, Category>
  activeTransactionsById: Record<string, Transaction>
  trashedTransactionsById: Record<string, Transaction>
  transactionDraftType: DraftType
  selectedTransactionTypeId: string | null
  selectedLevel2Id: string | null
  selectedTransactionCategoryId: string | null
  newAmount: string
  newDescription: string
  newTransactionDate: string
  selectedRecurringTransactionId: string
  isSerialTransactionCreatorEnabled: boolean
  isQuickDayModeEnabled?: boolean
  quickDayDate?: string
  isPaymentSourcesEnabled: boolean
  isRecurringTransactionsEnabled: boolean
  isAllowedMoveTarget: (transaction: Transaction, targetCategoryId: string) => boolean
  getRootLevel1IdForCategory: (categoryId: string) => string | null
  deleteDraft: (draftType: 'income' | 'expense') => Promise<void>
  guardMonthUnlocked: (monthText: string, actionLabel: string) => boolean
  guardTransactionsUnlocked: (items: Transaction[], actionLabel: string) => boolean
  clearTransactionOperationUi: () => void
  loadData: () => Promise<void>
  resetTransactionCreator: () => void
  setLastUndoAction: React.Dispatch<React.SetStateAction<UndoAction | null>>
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>
  setTransactionCreatorSuggestionId: React.Dispatch<React.SetStateAction<string | null>>
  setNewTransactionDate: React.Dispatch<React.SetStateAction<string>>
  setNewAmount: React.Dispatch<React.SetStateAction<string>>
  setNewDescription: React.Dispatch<React.SetStateAction<string>>
  setSelectedTagNames: React.Dispatch<React.SetStateAction<string[]>>
  setSelectedPaymentSourceId: React.Dispatch<React.SetStateAction<string>>
  setSelectedPaymentSplitItems: React.Dispatch<React.SetStateAction<PaymentSplitInput[]>>
  defaultPaymentSourceId: string | null
  onTransactionSaved?: (transaction: Transaction) => Promise<void> | void
  amountInputRef: RefObject<HTMLInputElement | null>
  selectedTagNames: string[]
  selectedPaymentSourceId: string
  selectedPaymentSplitItems: Array<{
    paymentSourceId: string
    amount: string
  }>
  transactionTagsMap: Record<string, Tag[]>
}
