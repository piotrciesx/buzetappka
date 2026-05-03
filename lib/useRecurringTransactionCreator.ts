import { useCallback } from 'react'
import {
  Category,
  RecurringReminderMonthStatus,
  RecurringTransaction,
  RecurringTransactionExecution,
  Transaction,
} from './budgetPageTypes'
import { getMonthCycleDate } from './recurringTransactions'

type UseRecurringTransactionCreatorParams = {
  recurringTransactions: RecurringTransaction[]
  recurringExecutions: RecurringTransactionExecution[]
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  selectedMonth: string
  selectedRecurringTransactionId: string
  paymentSourceSettings: {
    defaultIncomePaymentSourceId: string | null
    defaultExpensePaymentSourceId: string | null
  }
  getRootLevel1IdForCategory: (categoryId: string) => string | null
  getDraftTypeForLevel1Id: (level1Id: string | null) => 'income' | 'expense' | null
  getPaymentSourceKindForLevel1Id: (level1Id: string | null) => 'income' | 'expense' | null
  applyTransactionCategorySelection: (categoryId: string) => void
  saveRecurringReminderMonthStatus: (input: {
    reminderId: string
    month: string
    status: RecurringReminderMonthStatus['status']
    transactionId?: string | null
  }) => Promise<void>
  amountInputRef: React.RefObject<HTMLInputElement | null>
  setTransactionCreatorSuggestionId: (value: string | null) => void
  setTransactionCreatorLockedLevel1Id: (value: string | null) => void
  setSelectedTransactionTypeId: (value: string | null) => void
  setSelectedLevel2Id: (value: string | null) => void
  setSelectedTransactionCategoryId: (value: string | null) => void
  setNewAmount: (value: string) => void
  setNewDescription: (value: string) => void
  setNewTransactionDate: (value: string) => void
  setSelectedPaymentSourceId: (value: string) => void
  setSelectedPaymentSplitItems: (value: Array<{ paymentSourceId: string; amount: string }>) => void
  setSelectedTagNames: (value: string[]) => void
  setSelectedRecurringTransactionId: (value: string) => void
  setIsSerialTransactionCreatorEnabled: (value: boolean) => void
  setTransactionDraftId: (value: string | null) => void
  setTransactionDraftType: (value: 'income' | 'expense' | null) => void
  setTransactionCreatorInitialDate: (value: string | null) => void
  setIsTransactionCreatorOpen: (value: boolean) => void
  restoreDescriptionSuggestion: (descriptionText: string, categoryId: string | null | undefined) => void
}

export function useRecurringTransactionCreator({
  recurringTransactions,
  recurringExecutions,
  transactions,
  categoriesById,
  selectedMonth,
  selectedRecurringTransactionId,
  paymentSourceSettings,
  getRootLevel1IdForCategory,
  getDraftTypeForLevel1Id,
  getPaymentSourceKindForLevel1Id,
  applyTransactionCategorySelection,
  saveRecurringReminderMonthStatus,
  amountInputRef,
  setTransactionCreatorSuggestionId,
  setTransactionCreatorLockedLevel1Id,
  setSelectedTransactionTypeId,
  setSelectedLevel2Id,
  setSelectedTransactionCategoryId,
  setNewAmount,
  setNewDescription,
  setNewTransactionDate,
  setSelectedPaymentSourceId,
  setSelectedPaymentSplitItems,
  setSelectedTagNames,
  setSelectedRecurringTransactionId,
  setIsSerialTransactionCreatorEnabled,
  setTransactionDraftId,
  setTransactionDraftType,
  setTransactionCreatorInitialDate,
  setIsTransactionCreatorOpen,
  restoreDescriptionSuggestion,
}: UseRecurringTransactionCreatorParams) {
  const resetTransactionCreator = useCallback(() => {
    setIsTransactionCreatorOpen(false)
    setTransactionCreatorSuggestionId(null)
    setTransactionCreatorLockedLevel1Id(null)
    setSelectedTransactionTypeId(null)
    setSelectedLevel2Id(null)
    setSelectedTransactionCategoryId(null)
    setNewAmount('')
    setNewDescription('')
    setNewTransactionDate('')
    setSelectedTagNames([])
    setSelectedPaymentSourceId('')
    setSelectedPaymentSplitItems([])
    setSelectedRecurringTransactionId('')
    setIsSerialTransactionCreatorEnabled(false)
    setTransactionDraftId(null)
    setTransactionDraftType(null)
    setTransactionCreatorInitialDate(null)
  }, [
    setIsTransactionCreatorOpen,
    setTransactionCreatorSuggestionId,
    setTransactionCreatorLockedLevel1Id,
    setSelectedTransactionTypeId,
    setSelectedLevel2Id,
    setSelectedTransactionCategoryId,
    setNewAmount,
    setNewDescription,
    setNewTransactionDate,
    setSelectedTagNames,
    setSelectedPaymentSourceId,
    setSelectedPaymentSplitItems,
    setSelectedRecurringTransactionId,
    setIsSerialTransactionCreatorEnabled,
    setTransactionDraftId,
    setTransactionDraftType,
    setTransactionCreatorInitialDate,
  ])

  const openRecurringTransactionCreator = useCallback(
    (recurringId: string, executionId?: string) => {
      const recurring = recurringTransactions.find((item) => item.id === recurringId)

      if (!recurring) {
        return
      }

      const rootLevel1Id = getRootLevel1IdForCategory(recurring.category_id)
      const linkedExecution = executionId
        ? recurringExecutions.find((item) => item.id === executionId)
        : null
      const linkedTransaction = linkedExecution?.transaction_id
        ? transactions.find((item) => item.id === linkedExecution.transaction_id)
        : null
      const nextDate = linkedTransaction?.date || getMonthCycleDate(recurring, selectedMonth)

      setTransactionCreatorSuggestionId(recurring.category_id)
      setTransactionCreatorLockedLevel1Id(rootLevel1Id)
      setSelectedTransactionTypeId(rootLevel1Id)
      setSelectedRecurringTransactionId(recurring.id)

      if (categoriesById[recurring.category_id]?.level === 3) {
        applyTransactionCategorySelection(recurring.category_id)
      } else {
        setSelectedLevel2Id(recurring.category_id)
        setSelectedTransactionCategoryId(null)
      }

      setNewAmount(
        String(
          linkedTransaction?.amount ??
            (recurring.use_amount_when_creating ? recurring.amount ?? '' : '')
        )
      )
      setNewDescription(linkedTransaction?.description || recurring.description || recurring.name)
      setNewTransactionDate(nextDate)

      const recurringPaymentSourceKind = getPaymentSourceKindForLevel1Id(rootLevel1Id)
      const recurringDefaultPaymentSourceId =
        recurringPaymentSourceKind === 'income'
          ? paymentSourceSettings.defaultIncomePaymentSourceId
          : recurringPaymentSourceKind === 'expense'
            ? paymentSourceSettings.defaultExpensePaymentSourceId
            : null

      setSelectedPaymentSourceId(
        linkedTransaction?.payment_source_id ||
          recurring.payment_source_id ||
          recurringDefaultPaymentSourceId ||
          ''
      )

      setSelectedPaymentSplitItems([])
      setSelectedTagNames([])
      setIsSerialTransactionCreatorEnabled(false)
      setTransactionDraftId(null)
      setTransactionDraftType(getDraftTypeForLevel1Id(rootLevel1Id))
      setTransactionCreatorInitialDate(nextDate)
      setIsTransactionCreatorOpen(true)

      window.setTimeout(() => {
        amountInputRef.current?.focus()
      }, 0)
    },
    [
      amountInputRef,
      applyTransactionCategorySelection,
      categoriesById,
      getDraftTypeForLevel1Id,
      getPaymentSourceKindForLevel1Id,
      getRootLevel1IdForCategory,
      paymentSourceSettings.defaultExpensePaymentSourceId,
      paymentSourceSettings.defaultIncomePaymentSourceId,
      recurringExecutions,
      recurringTransactions,
      selectedMonth,
      setIsSerialTransactionCreatorEnabled,
      setIsTransactionCreatorOpen,
      setNewAmount,
      setNewDescription,
      setNewTransactionDate,
      setSelectedLevel2Id,
      setSelectedPaymentSourceId,
      setSelectedPaymentSplitItems,
      setSelectedRecurringTransactionId,
      setSelectedTagNames,
      setSelectedTransactionCategoryId,
      setSelectedTransactionTypeId,
      setTransactionCreatorInitialDate,
      setTransactionCreatorLockedLevel1Id,
      setTransactionCreatorSuggestionId,
      setTransactionDraftId,
      setTransactionDraftType,
      transactions,
    ]
  )

  const handleTransactionSaved = useCallback(
    async (transaction: Transaction) => {
      if (transaction.description?.trim()) {
        restoreDescriptionSuggestion(transaction.description || '', transaction.category_id)
      }

      const linkedRecurringId =
        selectedRecurringTransactionId || transaction.recurring_transaction_id || null

      if (linkedRecurringId) {
        await saveRecurringReminderMonthStatus({
          reminderId: linkedRecurringId,
          month: transaction.date.slice(0, 7),
          status: 'linked',
          transactionId: transaction.id,
        })
      }
    },
    [
      restoreDescriptionSuggestion,
      saveRecurringReminderMonthStatus,
      selectedRecurringTransactionId,
    ]
  )

  return {
    resetTransactionCreator,
    openRecurringTransactionCreator,
    handleTransactionSaved,
  }
}
