import { CSSProperties } from 'react'
import {
  Category,
  PaymentSource,
  RecurringReminderMonthStatus,
  RecurringTransaction,
  RecurringTransactionExecution,
  Transaction,
} from '../../lib/budgetPageTypes'

export type RecurringTransactionFormState = {
  id?: string
  name: string
  amount: string
  categoryId: string
  paymentSourceId: string
  usePaymentSource: boolean
  description: string
  frequency: RecurringTransaction['frequency']
  customIntervalMonths: string
  reminderDay: string
  startDate: string
  endDate: string
  installmentTotalCount: string
  initialPaymentAmount: string
  kind: RecurringTransaction['kind']
}

export type RecurringTransactionsPanelProps = {
  selectedMonth: string
  isSelectedMonthLocked: boolean
  recurringTransactions: RecurringTransaction[]
  recurringExecutions: RecurringTransactionExecution[]
  recurringReminderMonthStatuses: RecurringReminderMonthStatus[]
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  paymentSources: PaymentSource[]
  transactionsById: Record<string, Transaction>
  categoryOptions: Category[]
  onSaveRecurringTransaction: (
    input: Omit<RecurringTransaction, 'id' | 'profile_id' | 'created_at'> & {
      id?: string
      createPastExecutions?: boolean
      referenceMonth?: string
    }
  ) => Promise<void>
  onDeleteRecurringTransaction: (recurring: RecurringTransaction) => Promise<void>
  onSnoozeRecurring?: (recurring: RecurringTransaction) => void
  onOpenCreateFromRecurring: (recurring: RecurringTransaction) => void
  onOpenCreateFromExecution?: (
    recurring: RecurringTransaction,
    execution: RecurringTransactionExecution
  ) => void
  styles: Record<string, CSSProperties>
}
