import { CSSProperties, ReactNode } from 'react'

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

export type TransactionShortcut = {
  id: string
  label: string
}

export type Tag = {
  id: string
  name: string
  profile_id?: string
  created_at?: string
}

export type TransactionTag = {
  id: string
  transaction_id: string
  tag_id: string
  created_at?: string
}

export type PaymentSourceType = 'cash' | 'card' | 'account' | 'other'

export type PaymentSource = {
  id: string
  profile_id: string
  name: string
  type: PaymentSourceType
  is_income_source?: boolean
  is_expense_source?: boolean
  emoji?: string | null
  color?: string | null
  created_at?: string
}

export type RecurringTransactionFrequency = 'monthly' | 'yearly' | 'custom'
export type RecurringTransactionKind = 'open' | 'installment'
export type RecurringTransactionStatus = 'active' | 'paused' | 'completed'

export type RecurringTransaction = {
  id: string
  profile_id: string
  name: string
  category_id: string
  payment_source_id?: string | null
  amount: number | null
  description: string | null
  frequency: RecurringTransactionFrequency
  custom_interval_months?: number | null
  start_date: string | null
  end_date?: string | null
  installment_total_count?: number | null
  kind: RecurringTransactionKind
  status: RecurringTransactionStatus
  created_at?: string
}

export type RecurringTransactionExecution = {
  id: string
  recurring_transaction_id: string
  transaction_id: string | null
  generated_for_date: string
  status: 'completed' | 'skipped'
  marked_at?: string
  created_at?: string
}

export type FinancialGoal = {
  id: string
  profile_id: string
  name: string
  target_amount: number
  start_month: string
  deadline_month?: string | null
  allocation_percent?: number | null
  created_at?: string
}

export type FinancialGoalAllocationMode = 'priority' | 'allocation'

export type CategoryMonthlyLimit = {
  id: string
  profile_id: string
  category_id: string
  month: string
  limit_amount: number
  created_at?: string
}

export type FinancialGoalMonthPriority = {
  id: string
  profile_id: string
  goal_id: string
  month: string
  sort_order: number
  allocation_percent?: number | null
  allocation_locked?: boolean | null
  created_at?: string
}

export type FinancialGoalMonthConfig = {
  id: string
  profile_id: string
  month: string
  mode: FinancialGoalAllocationMode
  created_at?: string
}

export type TransactionWithTags = Transaction & {
  tags?: Tag[]
}

export type UndoAction =
  | {
      type: 'delete'
      label: string
      transactions: Transaction[]
    }
  | {
      type: 'restore'
      label: string
      transactions: Transaction[]
    }
  | {
      type: 'move'
      label: string
      moves: Array<{
        id: string
        fromCategoryId: string
        toCategoryId: string
      }>
    }

export type HideMode = 'now' | 'next'
export type RestoreMode = 'now' | 'next'
export type SortMode = 'default' | 'manual' | 'sum' | 'frequency'
export type SortDirection = 'asc' | 'desc'

export type Level1CardBaseProps = {
  level1Category: Category
  isOpen: boolean
  onToggle: () => void
  children?: ReactNode
  styles: Record<string, CSSProperties>
  dragHandle?: ReactNode
}

export type SortableLevel1CardProps = Level1CardBaseProps & {
  isSortable: boolean
}
