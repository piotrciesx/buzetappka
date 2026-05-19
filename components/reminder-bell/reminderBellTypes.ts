import { CSSProperties } from 'react'
import type { Category, RecurringReminderMonthStatus, RecurringTransaction, Transaction } from '../../lib/budgetPageTypes'

export type ReminderInput = Omit<RecurringTransaction, 'id' | 'profile_id' | 'created_at'> & {
  id?: string
}

export type ReminderBellPanelProps = {
  selectedMonth: string
  recurringTransactions: RecurringTransaction[]
  recurringReminderMonthStatuses: RecurringReminderMonthStatus[]
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  styles: Record<string, CSSProperties>
  onAddFromReminder: (reminder: RecurringTransaction) => void
  onMarkRead: (reminder: RecurringTransaction) => Promise<void>
  categoryOptions: Category[]
  onSaveReminder: (input: ReminderInput) => Promise<void>
  onDeleteReminder: (reminderId: string) => Promise<void>
}
