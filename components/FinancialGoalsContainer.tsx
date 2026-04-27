'use client'

import { CSSProperties } from 'react'
import FinancialGoalsPanel from './FinancialGoalsPanel'
import {
  FinancialGoal,
  FinancialGoalAllocationMode,
  FinancialGoalMonthConfig,
  FinancialGoalMonthPriority,
  Transaction,
} from '../lib/budgetPageTypes'

type Props = {
  selectedMonth: string
  goals?: FinancialGoal[]
  goalPriorities?: FinancialGoalMonthPriority[]
  goalMonthConfigs?: FinancialGoalMonthConfig[]
  transactions?: Transaction[]
  lockedMonthsSet: Set<string>
  getSignedAmountForTransaction: (transaction: Transaction) => number
  onSaveGoal: (input: Omit<FinancialGoal, 'id' | 'profile_id' | 'created_at'>) => Promise<void>
  onDeleteGoal: (goalId: string) => Promise<void>
  onSetGoalModeForMonth: (month: string, mode: FinancialGoalAllocationMode) => Promise<void>
  onSaveGoalAllocationsForMonth: (
    month: string,
    allocationsByGoalId: Record<string, number>
  ) => Promise<void>
  onReorderGoalsForMonth: (month: string, orderedGoalIds: string[]) => Promise<void>
  styles: Record<string, CSSProperties>
}

export default function FinancialGoalsContainer({
  selectedMonth,
  goals = [],
  goalPriorities = [],
  goalMonthConfigs = [],
  transactions = [],
  lockedMonthsSet,
  getSignedAmountForTransaction,
  onSaveGoal,
  onDeleteGoal,
  onSetGoalModeForMonth,
  onSaveGoalAllocationsForMonth,
  onReorderGoalsForMonth,
  styles,
}: Props) {
  return (
    <FinancialGoalsPanel
      selectedMonth={selectedMonth}
      goals={goals}
      goalPriorities={goalPriorities}
      goalMonthConfigs={goalMonthConfigs}
      transactions={transactions}
      lockedMonthsSet={lockedMonthsSet}
      getSignedAmountForTransaction={getSignedAmountForTransaction}
      onSaveGoal={onSaveGoal}
      onDeleteGoal={onDeleteGoal}
      onSetGoalModeForMonth={onSetGoalModeForMonth}
      onSaveGoalAllocationsForMonth={onSaveGoalAllocationsForMonth}
      onReorderGoalsForMonth={onReorderGoalsForMonth}
      styles={styles}
    />
  )
}