import type { RecurringTransaction } from '../../lib/budgetPageTypes'

export type LiveWidgetCard = {
  id: string
  kind: 'payment' | 'alert' | 'goal' | 'dashboard'
  eyebrow: string
  title: string
  value?: string
  description: string
  meta?: string
  tone?: 'income' | 'expense' | 'warning' | 'neutral'
  progressPercent?: number
}

export type BudgetAlertPreview = {
  id: string
  categoryLabel: string
  usageAmount: number
  limitAmount: number
  usagePercent: number
  text: string
}

export type FinancialGoalPreview = {
  id: string
  name: string
  collectedAmount: number
  remainingAmount: number
  percentage: number
}

export type Props = {
  selectedMonth: string
  isSelectedMonthLocked: boolean
  transactionCount: number
  categoryCount: number
  balance: number
  incomeTotal: number
  expenseTotal: number
  draftCount: number
  recurringCount: number
  recurringAlerts: RecurringTransaction[]
  budgetAlerts: BudgetAlertPreview[]
  financialGoals: FinancialGoalPreview[]
  userDisplayName?: string
  userAvatarKey?: string | null
  showRecurring: boolean
  onOpenSearch: (query?: string) => void
  onOpenNotifications: () => void
  onAddFromReminder: (reminder: RecurringTransaction) => void
  onSnoozeRecurring: (reminder: RecurringTransaction) => void
  onQuickAdd: () => void
  onToggleProfile: () => void
}
