import {
  FinancialGoal,
  FinancialGoalAllocationMode,
  FinancialGoalMonthConfig,
  FinancialGoalMonthPriority,
  Transaction,
} from './budgetPageTypes'

export type FinancialGoalComputedStatus = 'w trakcie' | 'zrealizowany' | 'niezrealizowany'

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
}

export type FinancialGoalPlan = {
  orderedGoals: FinancialGoal[]
  progressByGoalId: Record<string, FinancialGoalProgress>
  monthlyBalances: Record<string, number>
  monthlySurplus: Record<string, number>
}

const FULL_PERCENT = 100

const compareMonths = (left: string, right: string) => left.localeCompare(right)

const getTransactionMonth = (transaction: Transaction) => transaction.date.slice(0, 7)

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
  const sortedGoals = sortGoalsByBaseOrder(goals)
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

export const mapFinancialGoalRow = (row: Record<string, unknown>): FinancialGoal => {
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
    target_amount: Number(row.target_amount || 0),
    start_month: startMonth,
    deadline_month: deadlineMonth,
    allocation_percent:
      row.allocation_percent === null || row.allocation_percent === undefined
        ? null
        : Math.round(Number(row.allocation_percent)),
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
  const collectedByGoalId = Object.fromEntries(baseGoals.map((goal) => [goal.id, 0]))
  const allocationsByGoalId = Object.fromEntries(
    baseGoals.map((goal) => [goal.id, {} as Record<string, number>])
  )
  const completionMonthByGoalId = Object.fromEntries(
    baseGoals.map((goal) => [goal.id, null as string | null])
  )

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

    let remainingSurplus = monthSurplus

    const activeGoals = baseGoals.filter((goal) => {
      if (compareMonths(goal.start_month, month) > 0) {
        return false
      }

      const completionMonth = completionMonthByGoalId[goal.id]

      return !completionMonth || compareMonths(completionMonth, month) >= 0
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
        const allocatedAmount = roundToTwo((monthSurplus * allocationPercent) / FULL_PERCENT)
        const appliedAmount = Math.min(allocatedAmount, missingAmount, remainingSurplus)

        if (appliedAmount <= 0) {
          return
        }

        collectedByGoalId[goal.id] = roundToTwo(currentCollected + appliedAmount)
        allocationsByGoalId[goal.id][month] = roundToTwo(
          (allocationsByGoalId[goal.id][month] || 0) + appliedAmount
        )
        remainingSurplus = roundToTwo(remainingSurplus - appliedAmount)

        if (
          collectedByGoalId[goal.id] >= goal.target_amount &&
          lockedMonthsSet.has(month) &&
          !completionMonthByGoalId[goal.id]
        ) {
          completionMonthByGoalId[goal.id] = month
        }
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
          allocationsByGoalId[goal.id][month] = roundToTwo(
            (allocationsByGoalId[goal.id][month] || 0) + appliedAmount
          )
          remainingSurplus = roundToTwo(remainingSurplus - appliedAmount)

          if (
            collectedByGoalId[goal.id] >= goal.target_amount &&
            lockedMonthsSet.has(month) &&
            !completionMonthByGoalId[goal.id]
          ) {
            completionMonthByGoalId[goal.id] = month
          }
        })
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
      allocationsByGoalId[goal.id][month] = roundToTwo(
        (allocationsByGoalId[goal.id][month] || 0) + appliedAmount
      )
      remainingSurplus = roundToTwo(remainingSurplus - appliedAmount)

      if (
        collectedByGoalId[goal.id] >= goal.target_amount &&
        lockedMonthsSet.has(month) &&
        !completionMonthByGoalId[goal.id]
      ) {
        completionMonthByGoalId[goal.id] = month
      }
    })
  })

  const orderedGoals = getFinancialGoalPriorityItemsForMonth({
    goals: baseGoals,
    priorities,
    monthConfigs,
    month: selectedMonth,
  })

  const progressByGoalId = Object.fromEntries(
    baseGoals.map((goal) => {
      const collectedAmount = roundToTwo(collectedByGoalId[goal.id] || 0)
      const remainingAmount = roundToTwo(Math.max(goal.target_amount - collectedAmount, 0))
      const percentage =
        goal.target_amount > 0 ? Math.min((collectedAmount / goal.target_amount) * 100, 100) : 0
      const completionMonth = completionMonthByGoalId[goal.id]
      const isCompleted = Boolean(completionMonth)
      const deadlineMonth = goal.deadline_month || null
      const isDeadlinePassed =
        Boolean(deadlineMonth) &&
        compareMonths(deadlineMonth as string, selectedMonth) < 0 &&
        !isCompleted
      const isArchived =
        isCompleted && completionMonth ? compareMonths(completionMonth, selectedMonth) < 0 : false

      const statusLabel: FinancialGoalComputedStatus = isCompleted
        ? 'zrealizowany'
        : isDeadlinePassed
          ? 'niezrealizowany'
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