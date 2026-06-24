import type { FinancialGoal } from '../../lib/budgetPageTypes'
import type { FormState } from './financialGoalsPanelTypes'

export const panelStyle = {
  marginBottom: 0,
} as const

export const cardsWrapStyle = {
  marginTop: 0,
} as const

export const getInitialFormState = (selectedMonth: string): FormState => ({
  name: '',
  targetAmount: '',
  deadlineMonth: '',
  startMonth: selectedMonth,
  allocationPercent: null,
  icon_key: 'system-goals',
  color_tone: 'blue',
})

export const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export const areAllocationMapsEqual = (
  left: Record<string, number>,
  right: Record<string, number>
) => {
  const leftKeys = Object.keys(left).sort()
  const rightKeys = Object.keys(right).sort()

  if (leftKeys.length !== rightKeys.length) {
    return false
  }

  return leftKeys.every((key, index) => {
    return key === rightKeys[index] && left[key] === right[key]
  })
}

export const areSetsEqual = (left: Set<string>, right: Set<string>) => {
  if (left.size !== right.size) {
    return false
  }

  for (const value of left) {
    if (!right.has(value)) {
      return false
    }
  }

  return true
}

export const sortGoalsByAllocation = (
  goals: FinancialGoal[],
  allocationsByGoalId: Record<string, number>
) => {
  return goals.slice().sort((left, right) => {
    const allocationDiff =
      (allocationsByGoalId[right.id] || 0) - (allocationsByGoalId[left.id] || 0)

    if (allocationDiff !== 0) {
      return allocationDiff
    }

    return left.name.localeCompare(right.name, 'pl', { sensitivity: 'base' })
  })
}

export const orderGoalsByIds = (goals: FinancialGoal[], orderedIds: string[]) => {
  if (orderedIds.length === 0) {
    return goals
  }

  const orderIndexById = new Map(orderedIds.map((goalId, index) => [goalId, index]))

  return goals.slice().sort((left, right) => {
    const leftIndex = orderIndexById.get(left.id) ?? Number.MAX_SAFE_INTEGER
    const rightIndex = orderIndexById.get(right.id) ?? Number.MAX_SAFE_INTEGER

    return leftIndex - rightIndex
  })
}

export const normalizeAllocationMap = (
  goalIds: string[],
  allocationsByGoalId: Record<string, number>
) => {
  if (goalIds.length === 0) {
    return {}
  }

  if (goalIds.length === 1) {
    return { [goalIds[0]]: 100 }
  }

  const next = Object.fromEntries(
    goalIds.map((goalId) => [goalId, clampPercent(allocationsByGoalId[goalId] || 0)])
  )

  let total = Object.values(next).reduce((sum, value) => sum + value, 0)
  let diff = 100 - total
  let index = goalIds.length - 1
  let safetyCounter = 0

  while (diff !== 0 && goalIds.length > 0 && safetyCounter < 300) {
    const goalId = goalIds[index]
    const currentValue = next[goalId] || 0

    if (diff > 0 && currentValue < 100) {
      next[goalId] = currentValue + 1
      diff -= 1
    }

    if (diff < 0 && currentValue > 0) {
      next[goalId] = currentValue - 1
      diff += 1
    }

    index -= 1
    safetyCounter += 1

    if (index < 0) {
      index = goalIds.length - 1
    }

    total = Object.values(next).reduce((sum, value) => sum + value, 0)

    if (total === 100) {
      break
    }
  }

  return next
}

export const rebalanceAllocations = (
  goalIds: string[],
  currentAllocations: Record<string, number>,
  changedGoalId: string,
  nextValue: number,
  lockedGoalIds: Set<string>
) => {
  if (goalIds.length === 0) {
    return {}
  }

  if (goalIds.length === 1) {
    return { [goalIds[0]]: 100 }
  }

  const lockedTotal = goalIds
    .filter((goalId) => goalId !== changedGoalId && lockedGoalIds.has(goalId))
    .reduce((sum, goalId) => sum + clampPercent(currentAllocations[goalId] || 0), 0)

  const maxChangedValue = Math.max(0, 100 - lockedTotal)
  const clampedValue = Math.min(clampPercent(nextValue), maxChangedValue)

  const flexibleOtherGoalIds = goalIds.filter(
    (goalId) => goalId !== changedGoalId && !lockedGoalIds.has(goalId)
  )

  const nextAllocations: Record<string, number> = {}

  goalIds.forEach((goalId) => {
    if (lockedGoalIds.has(goalId) && goalId !== changedGoalId) {
      nextAllocations[goalId] = clampPercent(currentAllocations[goalId] || 0)
    }
  })

  nextAllocations[changedGoalId] = clampedValue

  const remaining = 100 - lockedTotal - clampedValue

  if (flexibleOtherGoalIds.length === 0) {
    nextAllocations[changedGoalId] = Math.max(0, 100 - lockedTotal)
    return normalizeAllocationMap(goalIds, nextAllocations)
  }

  const currentOtherValues = flexibleOtherGoalIds.map((goalId) =>
    Math.max(currentAllocations[goalId] || 0, 0)
  )
  const currentOtherTotal = currentOtherValues.reduce((sum, value) => sum + value, 0)

  const rawValues =
    currentOtherTotal > 0
      ? currentOtherValues.map((value) => (remaining * value) / currentOtherTotal)
      : flexibleOtherGoalIds.map(() => remaining / flexibleOtherGoalIds.length)

  const floorValues = rawValues.map((value) => Math.floor(value))
  let remainder = remaining - floorValues.reduce((sum, value) => sum + value, 0)

  const ranking = rawValues
    .map((value, index) => ({
      index,
      fraction: value - floorValues[index],
    }))
    .sort((left, right) => {
      if (right.fraction !== left.fraction) {
        return right.fraction - left.fraction
      }

      return left.index - right.index
    })

  let rankingIndex = 0

  while (remainder > 0 && ranking.length > 0) {
    floorValues[ranking[rankingIndex % ranking.length].index] += 1
    remainder -= 1
    rankingIndex += 1
  }

  flexibleOtherGoalIds.forEach((goalId, index) => {
    nextAllocations[goalId] = floorValues[index]
  })

  return normalizeAllocationMap(goalIds, nextAllocations)
}
