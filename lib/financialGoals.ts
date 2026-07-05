import {
  FinancialGoal,
  FinancialGoalAllocationMode,
  FinancialGoalMonthConfig,
  FinancialGoalMonthPriority,
  Transaction,
} from './budgetPageTypes'
import { getTransactionMonth } from './transactionDomain'

export type FinancialGoalComputedStatus =
  | 'w trakcie'
  | 'wstrzymany'
  | 'oczekuje na zamknięcie miesiąca'
  | 'zrealizowany'
  | 'niezrealizowany'

export type FinancialGoalProgress = {
  goalId: string
  collectedAmount: number
  remainingAmount: number
  percentage: number
  statusLabel: FinancialGoalComputedStatus
  completionMonth: string | null
  allocationsByMonth: Record<string, number>
  deadlineMonth: string | null
  isArchived: boolean
  waitingForLockedMonth: boolean
}

export type FinancialGoalPlan = {
  orderedGoals: FinancialGoal[]
  progressByGoalId: Record<string, FinancialGoalProgress>
  monthlyBalances: Record<string, number>
  monthlySurplus: Record<string, number>
}

export type FinancialGoalCardViewModel = {
  id: string
  name: string
  status: 'active' | 'paused' | 'archived'
  archiveOutcome: 'completed' | 'not_completed' | null
  deadlineMonth: string | null
  targetAmount: number
  collectedAmount: number
  remainingAmount: number
  percentage: number
  allocationPercent: number | null
}

export type FinancialGoalDetailsViewModel = FinancialGoalCardViewModel & {
  goal: FinancialGoal
  monthlyHistory: Array<{ month: string; netAllocation: number }>
  balance: number
  linkedTransactions: Transaction[]
}

export type FinancialGoalsMomentum = {
  depositsThisMonth: number
  withdrawalsThisMonth: number
  netChangeThisMonth: number
  totalCollected: number
  totalRemaining: number
  isWithdrawalHistoryComplete: boolean
}

export const buildFinancialGoalCardViewModel = (
  goal: FinancialGoal,
  progress: FinancialGoalProgress,
  allocationPercent: number | null = null
): FinancialGoalCardViewModel => ({
  id: goal.id,
  name: goal.name,
  status: isFinancialGoalArchived(goal) ? 'archived' : goal.status === 'paused' ? 'paused' : 'active',
  archiveOutcome: goal.status === 'archived_completed'
    ? 'completed'
    : goal.status === 'archived_not_completed'
      ? 'not_completed'
      : null,
  deadlineMonth: goal.deadline_month || null,
  targetAmount: goal.target_amount,
  collectedAmount: progress.collectedAmount,
  remainingAmount: progress.remainingAmount,
  percentage: progress.percentage,
  allocationPercent,
})

export const buildFinancialGoalDetailsViewModel = ({ goal, progress, transactions = [] }: {
  goal: FinancialGoal
  progress: FinancialGoalProgress
  transactions?: Transaction[]
}): FinancialGoalDetailsViewModel => ({
  ...buildFinancialGoalCardViewModel(goal, progress, goal.allocation_percent ?? null),
  goal,
  monthlyHistory: Object.entries(progress.allocationsByMonth)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, netAllocation]) => ({ month, netAllocation })),
  balance: progress.collectedAmount,
  linkedTransactions: transactions,
})

export const buildFinancialGoalsMomentum = (
  goals: FinancialGoal[],
  progressByGoalId: Record<string, FinancialGoalProgress>,
  month: string
): FinancialGoalsMomentum => {
  const depositsThisMonth = goals.reduce(
    (sum, goal) => sum + Math.max(progressByGoalId[goal.id]?.allocationsByMonth[month] || 0, 0),
    0
  )
  const totalCollected = goals.reduce(
    (sum, goal) => sum + (progressByGoalId[goal.id]?.collectedAmount || 0),
    0
  )
  const totalRemaining = goals.reduce(
    (sum, goal) => sum + (progressByGoalId[goal.id]?.remainingAmount || goal.target_amount),
    0
  )
  return {
    depositsThisMonth,
    withdrawalsThisMonth: 0,
    netChangeThisMonth: depositsThisMonth,
    totalCollected,
    totalRemaining,
    isWithdrawalHistoryComplete: false,
  }
}

export const isFinancialGoalArchived = (goal: Pick<FinancialGoal, 'status'>) =>
  goal.status === 'archived_completed' || goal.status === 'archived_not_completed'

export const isFinancialGoalActiveInMonth = (
  goal: Pick<FinancialGoal, 'status' | 'status_changed_month'>,
  month: string
) => {
  if (!goal.status || goal.status === 'active') return true
  return Boolean(goal.status_changed_month && month < goal.status_changed_month)
}

const FULL_PERCENT = 100

const compareMonths = (left: string, right: string) => left.localeCompare(right)

const getMonthSequence = (fromMonth: string, toMonth: string) => {
  const months: string[] = []
  let [year, month] = fromMonth.split('-').map(Number)
  const [endYear, endMonth] = toMonth.split('-').map(Number)

  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`)
    month += 1

    if (month > 12) {
      month = 1
      year += 1
    }
  }

  return months
}

const getMonthPriorityMap = (priorities: FinancialGoalMonthPriority[] = []) => {
  return priorities.reduce<Record<string, FinancialGoalMonthPriority[]>>((acc, priority) => {
    if (!acc[priority.month]) {
      acc[priority.month] = []
    }

    acc[priority.month].push(priority)
    return acc
  }, {})
}

const getMonthConfigMap = (configs: FinancialGoalMonthConfig[] = []) => {
  return configs.reduce<Record<string, FinancialGoalMonthConfig>>((acc, config) => {
    acc[config.month] = config
    return acc
  }, {})
}

const sortGoalsByBaseOrder = (goals: FinancialGoal[] = []) => {
  return [...goals].sort((left, right) => {
    const createdAtCompare = (left.created_at || '').localeCompare(right.created_at || '')

    if (createdAtCompare !== 0) {
      return createdAtCompare
    }

    return left.name.localeCompare(right.name, 'pl', { sensitivity: 'base' })
  })
}

const roundToTwo = (value: number) => Math.round(value * 100) / 100

const normalizeAllocationWeights = (
  goalIds: string[] = [],
  rawWeights: Record<string, number> = {}
): Record<string, number> => {
  if (goalIds.length === 0) {
    return {}
  }

  if (goalIds.length === 1) {
    return { [goalIds[0]]: FULL_PERCENT }
  }

  const positiveWeights = goalIds.map((goalId) => Math.max(Math.round(rawWeights[goalId] || 0), 0))
  const totalWeight = positiveWeights.reduce((sum, value) => sum + value, 0)

  const rawPercents =
    totalWeight > 0
      ? positiveWeights.map((value) => (value / totalWeight) * FULL_PERCENT)
      : goalIds.map(() => FULL_PERCENT / goalIds.length)

  const floorPercents = rawPercents.map((value) => Math.floor(value))
  let remainingPercent = FULL_PERCENT - floorPercents.reduce((sum, value) => sum + value, 0)

  const ranking = rawPercents
    .map((value, index) => ({
      index,
      fraction: value - floorPercents[index],
    }))
    .sort((left, right) => {
      if (right.fraction !== left.fraction) {
        return right.fraction - left.fraction
      }

      return left.index - right.index
    })

  let rankingIndex = 0

  while (remainingPercent > 0 && ranking.length > 0) {
    floorPercents[ranking[rankingIndex % ranking.length].index] += 1
    remainingPercent -= 1
    rankingIndex += 1
  }

  return Object.fromEntries(goalIds.map((goalId, index) => [goalId, floorPercents[index]]))
}

export const getFinancialGoalModeForMonth = (
  month: string,
  configs: FinancialGoalMonthConfig[] = []
): FinancialGoalAllocationMode => {
  const configMap = getMonthConfigMap(configs)
  const availableMonths = Object.keys(configMap)
    .filter((currentMonth) => compareMonths(currentMonth, month) <= 0)
    .sort(compareMonths)

  for (let index = availableMonths.length - 1; index >= 0; index -= 1) {
    const config = configMap[availableMonths[index]]

    if (config?.mode) {
      return config.mode
    }
  }

  return 'priority'
}

export const getEffectiveMonthPriorityRowsForMonth = (
  month: string,
  priorities: FinancialGoalMonthPriority[] = []
) => {
  const priorityMap = getMonthPriorityMap(priorities)
  const availableMonths = Object.keys(priorityMap)
    .filter((currentMonth) => compareMonths(currentMonth, month) <= 0)
    .sort(compareMonths)

  for (let index = availableMonths.length - 1; index >= 0; index -= 1) {
    const currentRows = priorityMap[availableMonths[index]] || []

    if (currentRows.length > 0) {
      return currentRows.slice().sort((left, right) => left.sort_order - right.sort_order)
    }
  }

  return []
}

export const getFinancialGoalAllocationPercentagesForMonth = ({
  month,
  goals = [],
  priorities = [],
}: {
  month: string
  goals?: FinancialGoal[]
  priorities?: FinancialGoalMonthPriority[]
}) => {
  const sortedGoals = sortGoalsByBaseOrder(goals.filter((goal) => goal.status === 'active' || !goal.status))
  const goalIds = sortedGoals.map((goal) => goal.id)
  const effectivePriorityRows = getEffectiveMonthPriorityRowsForMonth(month, priorities)
  const priorityRowMap = Object.fromEntries(
    effectivePriorityRows.map((priority) => [priority.goal_id, priority])
  )

  const fallbackWeight = goalIds.length > 0 ? FULL_PERCENT / goalIds.length : 0
  const rawWeights = Object.fromEntries(
    sortedGoals.map((goal) => {
      const priorityRow = priorityRowMap[goal.id]
      return [goal.id, priorityRow?.allocation_percent ?? fallbackWeight]
    })
  )

  return normalizeAllocationWeights(goalIds, rawWeights)
}

export const getFinancialGoalFirstProtectedMonth = (
  goal: Pick<FinancialGoal, 'start_month'>,
  progress?: Pick<FinancialGoalProgress, 'collectedAmount' | 'allocationsByMonth'> | null
) => {
  const allocationMonths = Object.entries(progress?.allocationsByMonth || {})
    .filter(([, amount]) => Number(amount) > 0)
    .map(([month]) => month)
    .sort(compareMonths)

  if (allocationMonths[0]) {
    return allocationMonths[0]
  }

  if ((progress?.collectedAmount || 0) > 0) {
    return goal.start_month
  }

  return null
}

const getInheritedOrderIds = (month: string, priorities: FinancialGoalMonthPriority[] = []) => {
  return getEffectiveMonthPriorityRowsForMonth(month, priorities).map((priority) => priority.goal_id)
}

const getInheritedOrderIndex = (goalId: string, inheritedOrderIds: string[] = []) => {
  const index = inheritedOrderIds.indexOf(goalId)
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER
}

const getOrderedGoalIdsForMonth = ({
  month,
  goals = [],
  priorities = [],
  monthConfigs = [],
}: {
  month: string
  goals?: FinancialGoal[]
  priorities?: FinancialGoalMonthPriority[]
  monthConfigs?: FinancialGoalMonthConfig[]
}) => {
  const orderedBaseGoals = sortGoalsByBaseOrder(goals)
  const inheritedOrderIds = getInheritedOrderIds(month, priorities)
  const mode = getFinancialGoalModeForMonth(month, monthConfigs)

  if (mode === 'allocation') {
    const allocationByGoalId = getFinancialGoalAllocationPercentagesForMonth({
      month,
      goals: orderedBaseGoals,
      priorities,
    })

    return orderedBaseGoals
      .slice()
      .sort((left, right) => {
        const allocationDiff =
          (allocationByGoalId[right.id] || 0) - (allocationByGoalId[left.id] || 0)

        if (allocationDiff !== 0) {
          return allocationDiff
        }

        return (
          getInheritedOrderIndex(left.id, inheritedOrderIds) -
          getInheritedOrderIndex(right.id, inheritedOrderIds)
        )
      })
      .map((goal) => goal.id)
  }

  return [
    ...inheritedOrderIds.filter((goalId) => orderedBaseGoals.some((goal) => goal.id === goalId)),
    ...orderedBaseGoals.map((goal) => goal.id).filter((goalId) => !inheritedOrderIds.includes(goalId)),
  ]
}

const getValidFinancialGoalTargetAmount = (value: unknown) => {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    (typeof value === 'string' && !value.trim())
  ) {
    return null
  }

  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

export const mapFinancialGoalRow = (row: Record<string, unknown>): FinancialGoal | null => {
  const targetAmount = getValidFinancialGoalTargetAmount(row.target_amount)

  if (targetAmount === null) {
    return null
  }

  const startMonth =
    typeof row.start_month === 'string' && row.start_month
      ? row.start_month.slice(0, 7)
      : typeof row.start_date === 'string' && row.start_date
        ? row.start_date.slice(0, 7)
        : ''
  const deadlineMonth =
    typeof row.deadline_month === 'string' && row.deadline_month
      ? row.deadline_month.slice(0, 7)
      : typeof row.end_date === 'string' && row.end_date
        ? row.end_date.slice(0, 7)
        : null

  return {
    id: String(row.id || ''),
    profile_id: String(row.profile_id || ''),
    name: String(row.name || 'Cel'),
    target_amount: targetAmount,
    start_month: startMonth,
    deadline_month: deadlineMonth,
    allocation_percent:
      row.allocation_percent === null || row.allocation_percent === undefined
        ? null
        : Math.round(Number(row.allocation_percent)),
    icon_key: typeof row.icon_key === 'string' && row.icon_key ? row.icon_key : null,
    color_tone: typeof row.color_tone === 'string' && row.color_tone ? row.color_tone : null,
    status:
      row.status === 'paused' ||
      row.status === 'archived_completed' ||
      row.status === 'archived_not_completed' ||
      row.status === 'active'
        ? row.status
        : row.status === 'completed'
          ? 'archived_completed'
          : row.status === 'cancelled'
            ? 'archived_not_completed'
            : 'active',
    status_changed_month:
      typeof row.status_changed_month === 'string' ? row.status_changed_month.slice(0, 7) : null,
    paused_at: typeof row.paused_at === 'string' ? row.paused_at : null,
    archived_at: typeof row.archived_at === 'string' ? row.archived_at : null,
    completed_at: typeof row.completed_at === 'string' ? row.completed_at : null,
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
  }
}

export const mapFinancialGoalMonthPriorityRow = (
  row: Record<string, unknown>
): FinancialGoalMonthPriority => {
  return {
    id: String(row.id || ''),
    profile_id: String(row.profile_id || ''),
    goal_id: String(row.goal_id || ''),
    month: String(row.month || '').slice(0, 7),
    sort_order: Number(row.sort_order || 0),
    allocation_percent:
      row.allocation_percent === null || row.allocation_percent === undefined
        ? null
        : Math.round(Number(row.allocation_percent)),
    allocation_locked: row.allocation_locked === true,
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
  }
}

export const mapFinancialGoalMonthConfigRow = (
  row: Record<string, unknown>
): FinancialGoalMonthConfig => {
  const mode = row.mode === 'allocation' ? 'allocation' : 'priority'

  return {
    id: String(row.id || ''),
    profile_id: String(row.profile_id || ''),
    month: String(row.month || '').slice(0, 7),
    mode,
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
  }
}

export const getGoalProgressBarColor = (percentage: number) => {
  const normalized = Math.max(0, Math.min(percentage, 100)) / 100
  const hue = normalized * 120
  return `hsl(${hue}, 78%, 46%)`
}

type FinancialGoalLedgerEntry = {
  goalId: string
  remainingAmount: number
  allocationWeight: number
}

type FinancialGoalLedgerBatch = {
  month: string
  mode: FinancialGoalAllocationMode
  entries: FinancialGoalLedgerEntry[]
}

const getLedgerBatchAmount = (batch: FinancialGoalLedgerBatch) =>
  roundToTwo(batch.entries.reduce((sum, entry) => sum + entry.remainingAmount, 0))

const addLedgerAllocation = (
  batch: FinancialGoalLedgerBatch,
  goalId: string,
  amount: number,
  allocationWeight: number
) => {
  const existingEntry = batch.entries.find((entry) => entry.goalId === goalId)

  if (existingEntry) {
    existingEntry.remainingAmount = roundToTwo(existingEntry.remainingAmount + amount)
    return
  }

  batch.entries.push({ goalId, remainingAmount: amount, allocationWeight })
}

const consumePriorityBatch = (batch: FinancialGoalLedgerBatch, requestedAmount: number) => {
  let remainingAmount = requestedAmount

  for (let index = batch.entries.length - 1; index >= 0 && remainingAmount > 0; index -= 1) {
    const entry = batch.entries[index]
    const consumedAmount = Math.min(entry.remainingAmount, remainingAmount)
    entry.remainingAmount = roundToTwo(entry.remainingAmount - consumedAmount)
    remainingAmount = roundToTwo(remainingAmount - consumedAmount)
  }

  return roundToTwo(requestedAmount - remainingAmount)
}

const consumeAllocationBatch = (batch: FinancialGoalLedgerBatch, requestedAmount: number) => {
  const amountToConsume = Math.min(requestedAmount, getLedgerBatchAmount(batch))
  let remainingAmount = amountToConsume
  let eligibleEntries = batch.entries.filter((entry) => entry.remainingAmount > 0)

  while (remainingAmount > 0 && eligibleEntries.length > 0) {
    const totalWeight = eligibleEntries.reduce(
      (sum, entry) => sum + Math.max(entry.allocationWeight, 0),
      0
    )
    const fallbackWeight = totalWeight > 0 ? 0 : 1
    let consumedInPass = 0

    eligibleEntries.forEach((entry, index) => {
      const weight = totalWeight > 0 ? Math.max(entry.allocationWeight, 0) : fallbackWeight
      const weightTotal = totalWeight > 0 ? totalWeight : eligibleEntries.length
      const isLastEntry = index === eligibleEntries.length - 1
      const proportionalAmount = isLastEntry
        ? roundToTwo(remainingAmount - consumedInPass)
        : roundToTwo((remainingAmount * weight) / weightTotal)
      const consumedAmount = Math.min(entry.remainingAmount, proportionalAmount)

      entry.remainingAmount = roundToTwo(entry.remainingAmount - consumedAmount)
      consumedInPass = roundToTwo(consumedInPass + consumedAmount)
    })

    if (consumedInPass <= 0) {
      const fallbackEntry = eligibleEntries[eligibleEntries.length - 1]
      const consumedAmount = Math.min(fallbackEntry.remainingAmount, remainingAmount)
      fallbackEntry.remainingAmount = roundToTwo(fallbackEntry.remainingAmount - consumedAmount)
      consumedInPass = consumedAmount
    }

    remainingAmount = roundToTwo(remainingAmount - consumedInPass)
    eligibleEntries = eligibleEntries.filter((entry) => entry.remainingAmount > 0)
  }

  return roundToTwo(amountToConsume - remainingAmount)
}

export const buildFinancialGoalsPlan = ({
  goals = [],
  priorities = [],
  monthConfigs = [],
  transactions = [],
  selectedMonth,
  lockedMonthsSet,
  getSignedAmountForTransaction,
}: {
  goals?: FinancialGoal[]
  priorities?: FinancialGoalMonthPriority[]
  monthConfigs?: FinancialGoalMonthConfig[]
  transactions?: Transaction[]
  selectedMonth: string
  lockedMonthsSet: Set<string>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}): FinancialGoalPlan => {
  const validGoals = goals.filter((goal) => goal.start_month)
  const baseGoals = sortGoalsByBaseOrder(validGoals)
  const monthlyBalances = transactions.reduce<Record<string, number>>((acc, transaction) => {
    const month = getTransactionMonth(transaction)

    if (compareMonths(month, selectedMonth) > 0) {
      return acc
    }

    acc[month] = (acc[month] || 0) + getSignedAmountForTransaction(transaction)
    return acc
  }, {})

  const monthlySurplus: Record<string, number> = {}
  const ledger: FinancialGoalLedgerBatch[] = []
  let unresolvedLoss = 0

  const getCollectedByGoalId = () => {
    const collected = Object.fromEntries(baseGoals.map((goal) => [goal.id, 0]))

    ledger.forEach((batch) => {
      batch.entries.forEach((entry) => {
        collected[entry.goalId] = roundToTwo(
          (collected[entry.goalId] || 0) + entry.remainingAmount
        )
      })
    })

    return collected
  }

  const firstGoalMonth = baseGoals.length > 0 ? baseGoals[0].start_month : selectedMonth
  const timelineStartMonth = baseGoals.reduce((lowest, goal) => {
    if (!lowest) {
      return goal.start_month
    }

    return compareMonths(goal.start_month, lowest) < 0 ? goal.start_month : lowest
  }, firstGoalMonth)

  const timelineMonths = timelineStartMonth ? getMonthSequence(timelineStartMonth, selectedMonth) : []

  timelineMonths.forEach((month) => {
    const monthBalance = monthlyBalances[month] || 0
    const monthSurplus = Math.max(monthBalance, 0)
    const mode = getFinancialGoalModeForMonth(month, monthConfigs)
    monthlySurplus[month] = monthSurplus

    if (monthBalance < 0) {
      let remainingLoss = roundToTwo(Math.abs(monthBalance))

      for (let index = ledger.length - 1; index >= 0 && remainingLoss > 0; index -= 1) {
        const batch = ledger[index]
        const consumedAmount = batch.mode === 'allocation'
          ? consumeAllocationBatch(batch, remainingLoss)
          : consumePriorityBatch(batch, remainingLoss)
        remainingLoss = roundToTwo(remainingLoss - consumedAmount)
      }

      unresolvedLoss = roundToTwo(unresolvedLoss + remainingLoss)
      return
    }

    const lossPayment = Math.min(monthSurplus, unresolvedLoss)
    unresolvedLoss = roundToTwo(unresolvedLoss - lossPayment)
    let remainingSurplus = roundToTwo(monthSurplus - lossPayment)
    const allocatableSurplus = remainingSurplus
    const collectedByGoalId = getCollectedByGoalId()
    const batch: FinancialGoalLedgerBatch = { month, mode, entries: [] }

    const activeGoals = baseGoals.filter((goal) => {
      if (!isFinancialGoalActiveInMonth(goal, month)) {
        return false
      }
      if (compareMonths(goal.start_month, month) > 0) {
        return false
      }

      if ((collectedByGoalId[goal.id] || 0) >= goal.target_amount) {
        return false
      }

      if (goal.deadline_month && compareMonths(goal.deadline_month, month) < 0) {
        return false
      }

      return true
    })

    if (mode === 'allocation') {
      const allocationByGoalId = getFinancialGoalAllocationPercentagesForMonth({
        month,
        goals: activeGoals,
        priorities,
      })

      activeGoals.forEach((goal) => {
        if (remainingSurplus <= 0) {
          return
        }

        const currentCollected = collectedByGoalId[goal.id] || 0
        const missingAmount = Math.max(goal.target_amount - currentCollected, 0)

        if (missingAmount <= 0) {
          return
        }

        const allocationPercent = allocationByGoalId[goal.id] || 0
        const allocatedAmount = roundToTwo((allocatableSurplus * allocationPercent) / FULL_PERCENT)
        const appliedAmount = Math.min(allocatedAmount, missingAmount, remainingSurplus)

        if (appliedAmount <= 0) {
          return
        }

        collectedByGoalId[goal.id] = roundToTwo(currentCollected + appliedAmount)
        addLedgerAllocation(batch, goal.id, appliedAmount, allocationPercent)
        remainingSurplus = roundToTwo(remainingSurplus - appliedAmount)
      })

      if (remainingSurplus > 0) {
        const orderedActiveGoalIds = getOrderedGoalIdsForMonth({
          month,
          goals: activeGoals,
          priorities,
          monthConfigs,
        })

        orderedActiveGoalIds.forEach((goalId) => {
          if (remainingSurplus <= 0) {
            return
          }

          const goal = activeGoals.find((item) => item.id === goalId)

          if (!goal) {
            return
          }

          const currentCollected = collectedByGoalId[goal.id] || 0
          const missingAmount = Math.max(goal.target_amount - currentCollected, 0)
          const appliedAmount = Math.min(missingAmount, remainingSurplus)

          if (appliedAmount <= 0) {
            return
          }

          collectedByGoalId[goal.id] = roundToTwo(currentCollected + appliedAmount)
          addLedgerAllocation(
            batch,
            goal.id,
            appliedAmount,
            allocationByGoalId[goal.id] || 0
          )
          remainingSurplus = roundToTwo(remainingSurplus - appliedAmount)
        })
      }

      if (batch.entries.length > 0) {
        ledger.push(batch)
      }
      return
    }

    const orderedGoalIds = getOrderedGoalIdsForMonth({
      month,
      goals: activeGoals,
      priorities,
      monthConfigs,
    })

    orderedGoalIds.forEach((goalId) => {
      if (remainingSurplus <= 0) {
        return
      }

      const goal = activeGoals.find((item) => item.id === goalId)

      if (!goal) {
        return
      }

      const currentCollected = collectedByGoalId[goal.id] || 0
      const missingAmount = Math.max(goal.target_amount - currentCollected, 0)
      const appliedAmount = Math.min(missingAmount, remainingSurplus)

      if (appliedAmount <= 0) {
        return
      }

      collectedByGoalId[goal.id] = roundToTwo(currentCollected + appliedAmount)
      addLedgerAllocation(batch, goal.id, appliedAmount, 0)
      remainingSurplus = roundToTwo(remainingSurplus - appliedAmount)
    })

    if (batch.entries.length > 0) {
      ledger.push(batch)
    }
  })

  const collectedByGoalId = getCollectedByGoalId()
  const allocationsByGoalId = Object.fromEntries(
    baseGoals.map((goal) => [goal.id, {} as Record<string, number>])
  )

  ledger.forEach((batch) => {
    batch.entries.forEach((entry) => {
      if (entry.remainingAmount <= 0) {
        return
      }

      allocationsByGoalId[entry.goalId][batch.month] = roundToTwo(
        (allocationsByGoalId[entry.goalId][batch.month] || 0) + entry.remainingAmount
      )
    })
  })

  const completionMonthByGoalId = Object.fromEntries(
    baseGoals.map((goal) => {
      let runningTotal = 0
      let completionMonth: string | null = null

      for (const batch of ledger) {
        runningTotal = roundToTwo(
          runningTotal + batch.entries
            .filter((entry) => entry.goalId === goal.id)
            .reduce((sum, entry) => sum + entry.remainingAmount, 0)
        )

        if (runningTotal >= goal.target_amount) {
          completionMonth = batch.month
          break
        }
      }

      return [goal.id, completionMonth]
    })
  )

  const orderedGoals = getFinancialGoalPriorityItemsForMonth({
    goals: baseGoals,
    priorities,
    monthConfigs,
    month: selectedMonth,
  })

  const progressByGoalId = Object.fromEntries(
    baseGoals.map((goal) => {
      const collectedAmount = roundToTwo(Math.max(collectedByGoalId[goal.id] || 0, 0))
      const remainingAmount = roundToTwo(Math.max(goal.target_amount - collectedAmount, 0))
      const percentage =
        goal.target_amount > 0
          ? Math.max(0, Math.min((collectedAmount / goal.target_amount) * 100, 100))
          : 0
      const completionMonth = completionMonthByGoalId[goal.id]
      const isCompletionMonthLocked = Boolean(completionMonth && lockedMonthsSet.has(completionMonth))
      const isCompleted = Boolean(completionMonth && isCompletionMonthLocked)
      const deadlineMonth = goal.deadline_month || null
      const isDeadlineReached =
        Boolean(deadlineMonth) &&
        compareMonths(deadlineMonth as string, selectedMonth) <= 0 &&
        !completionMonth
      const isFailedDeadlineClosed =
        isDeadlineReached &&
        Boolean(deadlineMonth) &&
        lockedMonthsSet.has(deadlineMonth as string)
      const waitingForLockedMonth =
        Boolean(completionMonth && !isCompletionMonthLocked) ||
        Boolean(isDeadlineReached && !isFailedDeadlineClosed)
      const isArchived =
        isCompleted ||
        Boolean(isFailedDeadlineClosed) ||
        goal.status === 'archived_completed' ||
        goal.status === 'archived_not_completed'

      const statusLabel: FinancialGoalComputedStatus = isCompleted || goal.status === 'archived_completed'
        ? 'zrealizowany'
        : isFailedDeadlineClosed || goal.status === 'archived_not_completed'
          ? 'niezrealizowany'
          : goal.status === 'paused'
            ? 'wstrzymany'
          : waitingForLockedMonth
            ? 'oczekuje na zamknięcie miesiąca'
            : 'w trakcie'

      return [
        goal.id,
        {
          goalId: goal.id,
          collectedAmount,
          remainingAmount,
          percentage,
          statusLabel,
          completionMonth,
          allocationsByMonth: allocationsByGoalId[goal.id] || {},
          deadlineMonth,
          isArchived,
          waitingForLockedMonth,
        },
      ]
    })
  )

  return {
    orderedGoals,
    progressByGoalId,
    monthlyBalances,
    monthlySurplus,
  }
}

export const getFinancialGoalPriorityItemsForMonth = ({
  goals = [],
  priorities = [],
  monthConfigs = [],
  month,
}: {
  goals?: FinancialGoal[]
  priorities?: FinancialGoalMonthPriority[]
  monthConfigs?: FinancialGoalMonthConfig[]
  month: string
}) => {
  const orderedBaseGoals = sortGoalsByBaseOrder(goals)
  const orderedGoalIds = getOrderedGoalIdsForMonth({
    month,
    goals: orderedBaseGoals,
    priorities,
    monthConfigs,
  })
  const byId = Object.fromEntries(orderedBaseGoals.map((goal) => [goal.id, goal]))

  return [
    ...orderedGoalIds
      .map((goalId) => byId[goalId])
      .filter((goal): goal is FinancialGoal => Boolean(goal)),
    ...orderedBaseGoals.filter((goal) => !orderedGoalIds.includes(goal.id)),
  ]
}
