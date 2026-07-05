import type { CSSProperties } from 'react'
import type { FinancialGoal, FinancialGoalAllocationMode, FinancialGoalMonthConfig, FinancialGoalMonthPriority, Transaction } from '../../lib/budgetPageTypes'

export type FormState = {
  id?: string
  name: string
  targetAmount: string
  deadlineMonth: string
  startMonth: string
  allocationPercent: number | null
  icon_key?: string | null
  color_tone?: string | null
}

export type FinancialGoalsPanelProps = {
  selectedMonth: string
  goals: FinancialGoal[]
  goalPriorities: FinancialGoalMonthPriority[]
  goalMonthConfigs: FinancialGoalMonthConfig[]
  transactions: Transaction[]
  budgetStartDate?: string | null
  excludedMonthsSet: Set<string>
  lockedMonthsSet: Set<string>
  getSignedAmountForTransaction: (transaction: Transaction) => number
  onSaveGoal: (
    input: Omit<FinancialGoal, 'id' | 'profile_id' | 'created_at'> & { id?: string }
  ) => Promise<void>
  onDeleteGoal: (goalId: string) => Promise<void>
  onSetGoalStatus: (goalId: string, status: NonNullable<FinancialGoal['status']>, month: string) => Promise<void>
  onSetGoalModeForMonth: (month: string, mode: FinancialGoalAllocationMode) => Promise<void>
  onSaveGoalAllocationsForMonth: (
    month: string,
    allocationsByGoalId: Record<string, number>,
    lockedGoalIds?: string[]
  ) => Promise<void>
  onReorderGoalsForMonth: (month: string, orderedGoalIds: string[]) => Promise<void>
  styles: Record<string, CSSProperties>
}

export type GoalCardBaseProps = {
  goal: FinancialGoal
  collectedAmount: number
  remainingAmount: number
  percentage: number
  statusLabel: string
  completionMonth: string | null
  deadlineMonth: string | null
  waitingForLockedMonth: boolean
  allocationPercent: number | null
  isAllocationMode: boolean
  isAllocationLocked?: boolean
  sliderValue?: number
  onAllocationChange?: (goalId: string, value: number) => void
  onAllocationDragStart?: () => void
  onAllocationCommit?: () => void
  onToggleAllocationLock?: (goalId: string) => void
  onEdit: (goal: FinancialGoal) => void
  onDelete: (goalId: string) => void
  onSetStatus: (goalId: string, status: NonNullable<FinancialGoal['status']>) => void
}
