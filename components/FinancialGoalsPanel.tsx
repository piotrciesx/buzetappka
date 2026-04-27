'use client'

import { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  FinancialGoal,
  FinancialGoalAllocationMode,
  FinancialGoalMonthConfig,
  FinancialGoalMonthPriority,
  Transaction,
} from '../lib/budgetPageTypes'
import {
  buildFinancialGoalsPlan,
  getEffectiveMonthPriorityRowsForMonth,
  getFinancialGoalAllocationPercentagesForMonth,
  getFinancialGoalModeForMonth,
  getFinancialGoalPriorityItemsForMonth,
  getGoalProgressBarColor,
} from '../lib/financialGoals'

const panelStyle = {
  marginBottom: 20,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: 16,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
} as const

const cardsWrapStyle = {
  display: 'grid',
  gap: 12,
  marginTop: 12,
} as const

const cardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 14,
  background: '#ffffff',
} as const

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(15, 23, 42, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
} as const

const modalStyle = {
  width: '100%',
  maxWidth: 720,
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #e5e7eb',
  boxShadow: '0 20px 40px rgba(0,0,0,0.16)',
  padding: 20,
} as const

const modeButtonRowStyle = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap' as const,
  marginTop: 12,
} as const

const sliderWrapStyle = {
  display: 'grid',
  gap: 10,
  marginTop: 8,
} as const

const sliderRowStyle = {
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'minmax(160px, 1fr) minmax(180px, 2fr) 88px 112px',
  alignItems: 'center',
} as const

type FormState = {
  id?: string
  name: string
  targetAmount: string
  deadlineMonth: string
  startMonth: string
  allocationPercent: number | null
}

type Props = {
  selectedMonth: string
  goals: FinancialGoal[]
  goalPriorities: FinancialGoalMonthPriority[]
  goalMonthConfigs: FinancialGoalMonthConfig[]
  transactions: Transaction[]
  lockedMonthsSet: Set<string>
  getSignedAmountForTransaction: (transaction: Transaction) => number
  onSaveGoal: (
    input: Omit<FinancialGoal, 'id' | 'profile_id' | 'created_at'> & { id?: string }
  ) => Promise<void>
  onDeleteGoal: (goalId: string) => Promise<void>
  onSetGoalModeForMonth: (month: string, mode: FinancialGoalAllocationMode) => Promise<void>
  onSaveGoalAllocationsForMonth: (
    month: string,
    allocationsByGoalId: Record<string, number>,
    lockedGoalIds?: string[]
  ) => Promise<void>
  onReorderGoalsForMonth: (month: string, orderedGoalIds: string[]) => Promise<void>
  styles: Record<string, CSSProperties>
}

const getInitialFormState = (selectedMonth: string): FormState => ({
  name: '',
  targetAmount: '',
  deadlineMonth: '',
  startMonth: selectedMonth,
  allocationPercent: null,
})

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const areAllocationMapsEqual = (
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

const areSetsEqual = (left: Set<string>, right: Set<string>) => {
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

const sortGoalsByAllocation = (
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

const orderGoalsByIds = (goals: FinancialGoal[], orderedIds: string[]) => {
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

const normalizeAllocationMap = (
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

const rebalanceAllocations = (
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

type GoalCardBaseProps = {
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
  styles: Record<string, CSSProperties>
}

function GoalCardContent(props: GoalCardBaseProps & { dragHandle?: ReactNode }) {
  const {
    goal,
    collectedAmount,
    remainingAmount,
    percentage,
    statusLabel,
    completionMonth,
    deadlineMonth,
    waitingForLockedMonth,
    allocationPercent,
    isAllocationMode,
    isAllocationLocked,
    sliderValue,
    onAllocationChange,
    onAllocationDragStart,
    onAllocationCommit,
    onToggleAllocationLock,
    onEdit,
    onDelete,
    styles,
    dragHandle,
  } = props

  const isUnsuccessful = statusLabel === 'niezrealizowany'
  const progressWidth = isUnsuccessful ? '100%' : `${Math.min(percentage, 100)}%`
  const progressColor = isUnsuccessful ? getGoalProgressBarColor(0) : getGoalProgressBarColor(percentage)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {dragHandle}

          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{goal.name}</div>
            <div style={{ ...styles.pageSubtitle, margin: '4px 0 0' }}>
              Start: {goal.start_month}
              {deadlineMonth ? ` • deadline: ${deadlineMonth}` : ' • bez deadline’u'}
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          <button type="button" style={styles.secondaryButton} onClick={() => onEdit(goal)}>
            Edytuj
          </button>
          <button type="button" style={styles.dangerButton} onClick={() => onDelete(goal.id)}>
            Usuń
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 8,
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          marginTop: 12,
        }}
      >
        <div style={styles.infoBox}>
          <b>Kwota docelowa:</b> {goal.target_amount.toFixed(2)} zł
        </div>
        <div style={styles.infoBox}>
          <b>Uzbierano:</b> {collectedAmount.toFixed(2)} zł
        </div>
        <div style={styles.infoBox}>
          <b>Brakuje:</b> {remainingAmount.toFixed(2)} zł
        </div>
        <div style={styles.infoBox}>
          <b>Status:</b> {statusLabel}
        </div>
        {isAllocationMode && (
          <div style={styles.infoBox}>
            <b>Alokacja:</b> {allocationPercent === null ? '0%' : `${allocationPercent}%`}
            {isAllocationLocked ? ' • zablokowana' : ''}
          </div>
        )}
      </div>

      {isAllocationMode && typeof sliderValue === 'number' && onAllocationChange && (
        <div style={sliderWrapStyle}>
          <div style={sliderRowStyle}>
            <div style={{ fontWeight: 600 }}>{goal.name}</div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={sliderValue}
              disabled={isAllocationLocked}
              onPointerDown={onAllocationDragStart}
              onPointerUp={onAllocationCommit}
              onMouseUp={onAllocationCommit}
              onTouchEnd={onAllocationCommit}
              onKeyUp={onAllocationCommit}
              onChange={(event) => onAllocationChange(goal.id, Number(event.target.value))}
            />
            <div style={{ fontWeight: 700, textAlign: 'right' }}>{sliderValue}%</div>
            {onToggleAllocationLock && (
              <button
                type="button"
                style={{
                  ...(isAllocationLocked ? styles.primaryButton : styles.secondaryButton),
                  minWidth: 104,
                  justifyContent: 'center',
                }}
                onClick={() => onToggleAllocationLock(goal.id)}
                title={
                  isAllocationLocked
                    ? 'Odblokuj procent tego celu'
                    : 'Zablokuj procent tego celu'
                }
              >
                {isAllocationLocked ? '🔒 Blokada' : '🔓 Blokuj'}
              </button>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 12,
          height: 10,
          borderRadius: 999,
          background: '#e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: progressWidth,
            height: '100%',
            background: progressColor,
            transition: 'width 180ms ease, background-color 180ms ease',
          }}
        />
      </div>

      <div style={{ ...styles.pageSubtitle, margin: '8px 0 0' }}>
        Progres: {percentage.toFixed(1)}%
        {completionMonth ? ` • osiągnięcie: ${completionMonth}` : ''}
        {waitingForLockedMonth ? ' • czeka na zamknięcie miesiąca' : ''}
      </div>
    </>
  )
}

function SortableGoalCard(props: GoalCardBaseProps) {
  const { goal } = props
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: goal.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        ...cardStyle,
        transform: CSS.Transform.toString(transform),
        transition,
        boxShadow: isDragging ? '0 12px 24px rgba(15, 23, 42, 0.12)' : 'none',
        opacity: isDragging ? 0.82 : 1,
      }}
    >
      <GoalCardContent
        {...props}
        dragHandle={
          <button
            type="button"
            style={{
              border: '1px solid #d1d5db',
              background: '#f8fafc',
              borderRadius: 10,
              padding: '6px 10px',
              cursor: 'grab',
              fontWeight: 700,
              color: '#475569',
            }}
            title="Przeciągnij, aby zmienić priorytet"
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </button>
        }
      />
    </div>
  )
}

function StaticGoalCard(props: GoalCardBaseProps) {
  return (
    <div style={cardStyle}>
      <GoalCardContent {...props} />
    </div>
  )
}

export default function FinancialGoalsPanel(props: Props) {
  const {
    selectedMonth,
    goals,
    goalPriorities,
    goalMonthConfigs,
    transactions,
    lockedMonthsSet,
    getSignedAmountForTransaction,
    onSaveGoal,
    onDeleteGoal,
    onSetGoalModeForMonth,
    onSaveGoalAllocationsForMonth,
    onReorderGoalsForMonth,
    styles,
  } = props

  const saveTimeoutRef = useRef<number | null>(null)
  const selectedMonthRef = useRef(selectedMonth)

  const [createFormState, setCreateFormState] = useState<FormState>(() => getInitialFormState(selectedMonth))
  const [editFormState, setEditFormState] = useState<FormState | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [localModeByMonth, setLocalModeByMonth] = useState<Record<string, FinancialGoalAllocationMode>>({})
  const [isModeSaving, setIsModeSaving] = useState(false)
  const [isAllocationSaving, setIsAllocationSaving] = useState(false)
  const [localPriorityOrderByMonth, setLocalPriorityOrderByMonth] = useState<Record<string, string[]>>({})
  const [pendingAllocationByGoalId, setPendingAllocationByGoalId] = useState<Record<string, number>>({})
  const [lockedAllocationGoalIds, setLockedAllocationGoalIds] = useState<Set<string>>(() => new Set())
  const [allocationDragOrderIds, setAllocationDragOrderIds] = useState<string[]>([])
  const [isAllocationSliderActive, setIsAllocationSliderActive] = useState(false)
  const [isLocalAllocationActive, setIsLocalAllocationActive] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const storedMode = useMemo(
    () => getFinancialGoalModeForMonth(selectedMonth, goalMonthConfigs),
    [goalMonthConfigs, selectedMonth]
  )

  const effectiveMode = localModeByMonth[selectedMonth] || storedMode
  const localPriorityOrder = localPriorityOrderByMonth[selectedMonth] || []

  useEffect(() => {
    selectedMonthRef.current = selectedMonth
  }, [selectedMonth])

  useEffect(() => {
    setCreateFormState((prev) => ({ ...prev, startMonth: selectedMonth }))
    setAllocationDragOrderIds([])
    setIsAllocationSliderActive(false)
    setIsLocalAllocationActive(false)
  }, [selectedMonth])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const effectiveMonthConfigs = useMemo(() => {
    const localMode = localModeByMonth[selectedMonth]

    if (!localMode) {
      return goalMonthConfigs
    }

    const withoutSelectedMonth = goalMonthConfigs.filter((config) => config.month !== selectedMonth)

    return [
      ...withoutSelectedMonth,
      {
        id: `local-mode-${selectedMonth}`,
        profile_id: '',
        month: selectedMonth,
        mode: localMode,
      },
    ]
  }, [goalMonthConfigs, localModeByMonth, selectedMonth])

  const orderedGoalsFromStoredData = useMemo(() => {
    return getFinancialGoalPriorityItemsForMonth({
      goals,
      priorities: goalPriorities,
      monthConfigs: effectiveMonthConfigs,
      month: selectedMonth,
    })
  }, [effectiveMonthConfigs, goalPriorities, goals, selectedMonth])

  const storedPlan = useMemo(() => {
    return buildFinancialGoalsPlan({
      goals,
      priorities: goalPriorities,
      monthConfigs: effectiveMonthConfigs,
      transactions,
      selectedMonth,
      lockedMonthsSet,
      getSignedAmountForTransaction,
    })
  }, [
    effectiveMonthConfigs,
    getSignedAmountForTransaction,
    goalPriorities,
    goals,
    lockedMonthsSet,
    selectedMonth,
    transactions,
  ])

  const baseActiveGoals = useMemo(() => {
    return orderedGoalsFromStoredData.filter((goal) => !storedPlan.progressByGoalId[goal.id]?.isArchived)
  }, [orderedGoalsFromStoredData, storedPlan.progressByGoalId])

  const baseActiveGoalIds = useMemo(() => baseActiveGoals.map((goal) => goal.id), [baseActiveGoals])

  const effectiveAllocationByGoalId = useMemo(() => {
    return getFinancialGoalAllocationPercentagesForMonth({
      month: selectedMonth,
      goals: baseActiveGoals,
      priorities: goalPriorities,
    })
  }, [baseActiveGoals, goalPriorities, selectedMonth])

  const effectiveLockedGoalIds = useMemo(() => {
    const effectivePriorityRows = getEffectiveMonthPriorityRowsForMonth(selectedMonth, goalPriorities)

    return new Set(
      effectivePriorityRows
        .filter((priority) => priority.allocation_locked === true)
        .map((priority) => priority.goal_id)
    )
  }, [goalPriorities, selectedMonth])

  useEffect(() => {
    if (isLocalAllocationActive) {
      return
    }

    setPendingAllocationByGoalId((prev) => {
      if (areAllocationMapsEqual(prev, effectiveAllocationByGoalId)) {
        return prev
      }

      return effectiveAllocationByGoalId
    })

    setLockedAllocationGoalIds((prev) => {
      if (areSetsEqual(prev, effectiveLockedGoalIds)) {
        return prev
      }

      return effectiveLockedGoalIds
    })
  }, [effectiveAllocationByGoalId, effectiveLockedGoalIds, isLocalAllocationActive, selectedMonth])

  useEffect(() => {
    setLockedAllocationGoalIds((prev) => {
      const allowedGoalIds = new Set(baseActiveGoalIds)
      const next = new Set<string>()

      prev.forEach((goalId) => {
        if (allowedGoalIds.has(goalId)) {
          next.add(goalId)
        }
      })

      return next
    })
  }, [baseActiveGoalIds])

  const effectiveGoalPriorities = useMemo(() => {
    const withoutSelectedMonth = goalPriorities.filter((priority) => priority.month !== selectedMonth)

    if (effectiveMode === 'allocation') {
      const allocationRows = baseActiveGoalIds
        .slice()
        .sort((leftGoalId, rightGoalId) => {
          const allocationDiff =
            (pendingAllocationByGoalId[rightGoalId] || 0) -
            (pendingAllocationByGoalId[leftGoalId] || 0)

          if (allocationDiff !== 0) {
            return allocationDiff
          }

          return leftGoalId.localeCompare(rightGoalId)
        })
        .map((goalId, index) => ({
          id: `local-allocation-${selectedMonth}-${goalId}`,
          profile_id: '',
          goal_id: goalId,
          month: selectedMonth,
          sort_order: index,
          allocation_percent: pendingAllocationByGoalId[goalId] ?? 0,
          allocation_locked: lockedAllocationGoalIds.has(goalId),
        } satisfies FinancialGoalMonthPriority))

      return [...withoutSelectedMonth, ...allocationRows]
    }

    if (localPriorityOrder.length > 0) {
      const priorityRows = localPriorityOrder.map((goalId, index) => ({
        id: `local-priority-${selectedMonth}-${goalId}`,
        profile_id: '',
        goal_id: goalId,
        month: selectedMonth,
        sort_order: index,
        allocation_percent: null,
        allocation_locked: false,
      } satisfies FinancialGoalMonthPriority))

      return [...withoutSelectedMonth, ...priorityRows]
    }

    return goalPriorities
  }, [
    baseActiveGoalIds,
    effectiveMode,
    goalPriorities,
    localPriorityOrder,
    lockedAllocationGoalIds,
    pendingAllocationByGoalId,
    selectedMonth,
  ])

  const plan = useMemo(() => {
    return buildFinancialGoalsPlan({
      goals,
      priorities: effectiveGoalPriorities,
      monthConfigs: effectiveMonthConfigs,
      transactions,
      selectedMonth,
      lockedMonthsSet,
      getSignedAmountForTransaction,
    })
  }, [
    effectiveGoalPriorities,
    effectiveMonthConfigs,
    getSignedAmountForTransaction,
    goals,
    lockedMonthsSet,
    selectedMonth,
    transactions,
  ])

  const orderedGoals = useMemo(() => {
    return getFinancialGoalPriorityItemsForMonth({
      goals,
      priorities: effectiveGoalPriorities,
      monthConfigs: effectiveMonthConfigs,
      month: selectedMonth,
    })
  }, [effectiveGoalPriorities, effectiveMonthConfigs, goals, selectedMonth])

  const archivedGoals = useMemo(() => {
    return orderedGoals.filter((goal) => plan.progressByGoalId[goal.id]?.isArchived)
  }, [orderedGoals, plan.progressByGoalId])

  const activeGoals = useMemo(() => {
    const currentActiveGoals = orderedGoals.filter((goal) => !plan.progressByGoalId[goal.id]?.isArchived)

    if (effectiveMode !== 'allocation') {
      if (localPriorityOrder.length > 0) {
        return orderGoalsByIds(currentActiveGoals, localPriorityOrder)
      }

      return currentActiveGoals
    }

    if (isAllocationSliderActive && allocationDragOrderIds.length > 0) {
      return orderGoalsByIds(currentActiveGoals, allocationDragOrderIds)
    }

    if (isAllocationSaving && allocationDragOrderIds.length > 0) {
      return orderGoalsByIds(currentActiveGoals, allocationDragOrderIds)
    }

    return sortGoalsByAllocation(currentActiveGoals, pendingAllocationByGoalId)
  }, [
    allocationDragOrderIds,
    effectiveMode,
    isAllocationSaving,
    isAllocationSliderActive,
    localPriorityOrder,
    orderedGoals,
    pendingAllocationByGoalId,
    plan.progressByGoalId,
  ])

  const monthBalance = plan.monthlyBalances[selectedMonth] || 0
  const monthSurplus = plan.monthlySurplus[selectedMonth] || 0

  const allocationGoalIds = baseActiveGoalIds

  const totalPercent = allocationGoalIds.reduce(
    (sum, goalId) => sum + (pendingAllocationByGoalId[goalId] || 0),
    0
  )

  const scheduleAllocationSave = (
    nextAllocations: Record<string, number>,
    nextLockedGoalIds: Set<string>
  ) => {
    if (effectiveMode !== 'allocation') {
      return
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current)
    }

    setIsLocalAllocationActive(true)
    setIsAllocationSaving(true)

    saveTimeoutRef.current = window.setTimeout(() => {
      const monthToSave = selectedMonthRef.current

      void onSaveGoalAllocationsForMonth(
        monthToSave,
        nextAllocations,
        Array.from(nextLockedGoalIds)
      ).finally(() => {
        setIsAllocationSaving(false)
      })
    }, 700)
  }

  const openEditModal = (goal: FinancialGoal) => {
    setEditFormState({
      id: goal.id,
      name: goal.name,
      targetAmount: String(goal.target_amount),
      deadlineMonth: goal.deadline_month || '',
      startMonth: goal.start_month,
      allocationPercent: goal.allocation_percent ?? null,
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (effectiveMode !== 'priority') {
      return
    }

    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const currentIds = activeGoals.map((goal) => goal.id)
    const oldIndex = currentIds.indexOf(String(active.id))
    const newIndex = currentIds.indexOf(String(over.id))

    if (oldIndex < 0 || newIndex < 0) {
      return
    }

    const nextIds = arrayMove(currentIds, oldIndex, newIndex)

    setLocalPriorityOrderByMonth((prev) => ({
      ...prev,
      [selectedMonth]: nextIds,
    }))
    setIsReordering(true)

    void onReorderGoalsForMonth(selectedMonth, nextIds).finally(() => {
      setIsReordering(false)
    })
  }

  const handleAllocationDragStart = () => {
    setAllocationDragOrderIds(activeGoals.map((goal) => goal.id))
    setIsAllocationSliderActive(true)
  }

  const handleAllocationCommit = () => {
    setIsAllocationSliderActive(false)
    setAllocationDragOrderIds([])
  }

  const handleAllocationChange = (goalId: string, nextValue: number) => {
    if (lockedAllocationGoalIds.has(goalId)) {
      return
    }

    setIsLocalAllocationActive(true)

    setPendingAllocationByGoalId((prev) => {
      const next = rebalanceAllocations(
        allocationGoalIds,
        prev,
        goalId,
        nextValue,
        lockedAllocationGoalIds
      )

      scheduleAllocationSave(next, lockedAllocationGoalIds)
      return next
    })
  }

  const handleToggleAllocationLock = (goalId: string) => {
    setIsLocalAllocationActive(true)

    setLockedAllocationGoalIds((prev) => {
      const next = new Set(prev)

      if (next.has(goalId)) {
        next.delete(goalId)
      } else {
        next.add(goalId)
      }

      scheduleAllocationSave(pendingAllocationByGoalId, next)
      return next
    })
  }

  const handleModeChange = (nextMode: FinancialGoalAllocationMode) => {
    if (nextMode === effectiveMode) {
      return
    }

    setLocalModeByMonth((prev) => ({
      ...prev,
      [selectedMonth]: nextMode,
    }))
    setIsModeSaving(true)

    if (nextMode === 'allocation') {
      const snapshot = normalizeAllocationMap(baseActiveGoalIds, pendingAllocationByGoalId)
      setPendingAllocationByGoalId(snapshot)
      setIsLocalAllocationActive(true)

      void onSaveGoalAllocationsForMonth(
        selectedMonth,
        snapshot,
        Array.from(lockedAllocationGoalIds)
      ).catch((error) => {
        console.error(error)
      })
    }

    void onSetGoalModeForMonth(selectedMonth, nextMode).finally(() => {
      setIsModeSaving(false)
    })
  }

  const saveGoal = async (formState: FormState, onDone: () => void) => {
    setIsSaving(true)

    try {
      await onSaveGoal({
        id: formState.id,
        name: formState.name,
        target_amount: Number(formState.targetAmount.replace(',', '.')),
        start_month: formState.startMonth,
        deadline_month: formState.deadlineMonth || null,
        allocation_percent: formState.allocationPercent,
      })
      onDone()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section style={panelStyle}>
      <div style={styles.sectionTitle}>Cele finansowe</div>
      <div style={styles.pageSubtitle}>
        Start celu ustawiamy na miesiąc utworzenia. Nadwyżka dodatnia jest rozdzielana według
        aktywnego trybu z konfiguracją dziedziczoną od wybranego miesiąca do przodu, bez zmiany
        historii wcześniejszych miesięcy.
      </div>

      <div style={modeButtonRowStyle}>
        <button
          type="button"
          style={effectiveMode === 'priority' ? styles.primaryButton : styles.secondaryButton}
          onClick={() => {
            handleModeChange('priority')
          }}
        >
          Tryb priorytet
        </button>
        <button
          type="button"
          style={effectiveMode === 'allocation' ? styles.primaryButton : styles.secondaryButton}
          disabled={activeGoals.length === 0}
          onClick={() => {
            handleModeChange('allocation')
          }}
        >
          Tryb alokacja
        </button>
      </div>

      <div style={styles.infoRow}>
        <div style={styles.infoBox}>
          <b>Bilans miesiąca:</b> {monthBalance.toFixed(2)} zł
        </div>
        <div style={styles.infoBox}>
          <b>Nadwyżka do alokacji:</b> {monthSurplus.toFixed(2)} zł
        </div>
        <div style={styles.infoBox}>
          <b>Miesiąc:</b> {selectedMonth} {lockedMonthsSet.has(selectedMonth) ? '• zamknięty' : '• otwarty'}
        </div>
      </div>

      <div style={{ ...styles.formRow, alignItems: 'flex-start', marginTop: 14 }}>
        <input
          style={styles.input}
          placeholder="Nazwa celu"
          value={createFormState.name}
          onChange={(event) =>
            setCreateFormState((prev) => ({ ...prev, name: event.target.value }))
          }
        />

        <input
          style={styles.smallInput}
          placeholder="Kwota docelowa"
          inputMode="decimal"
          value={createFormState.targetAmount}
          onChange={(event) =>
            setCreateFormState((prev) => ({ ...prev, targetAmount: event.target.value }))
          }
        />

        <input
          style={styles.input}
          type="month"
          value={createFormState.deadlineMonth}
          onChange={(event) =>
            setCreateFormState((prev) => ({ ...prev, deadlineMonth: event.target.value }))
          }
        />

        <div style={{ ...styles.infoBox, minWidth: 180 }}>
          <b>Start:</b> {createFormState.startMonth}
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            style={styles.primaryButton}
            disabled={isSaving || !createFormState.name.trim() || !createFormState.targetAmount}
            onClick={() =>
              void saveGoal(createFormState, () => setCreateFormState(getInitialFormState(selectedMonth)))
            }
          >
            {isSaving ? 'Zapisywanie...' : 'Dodaj cel'}
          </button>
        </div>
      </div>

      {effectiveMode === 'allocation' ? (
        <>
          <div style={{ ...styles.infoBox, marginTop: 12 }}>
            <b>Suma alokacji:</b> {totalPercent.toFixed(0)}%
            {totalPercent !== 100 ? ' • musi wynosić dokładnie 100%' : ' • zapis automatyczny'}
            {isAllocationSaving ? ' • zapisywanie...' : ''}
          </div>

          <div style={{ ...styles.pageSubtitle, marginTop: 12 }}>
            W trybie alokacji suwak działa co 1%. Zmiana zapisuje się automatycznie dla wybranego
            miesiąca i kolejnych miesięcy, dopóki w kolejnym miesiącu nie ustawisz innej alokacji.
            Zablokowany cel nie bierze udziału w automatycznym przeliczaniu procentów.
          </div>
        </>
      ) : (
        <div style={{ ...styles.pageSubtitle, marginTop: 12 }}>
          Przeciągnij kafle, aby ustawić priorytet dla miesiąca {selectedMonth}.
          {isReordering ? ' Zapisywanie nowej kolejności...' : ''}
          {isModeSaving ? ' Zapisywanie trybu...' : ''}
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <div style={styles.l2Name}>Cele aktualne</div>

        {activeGoals.length === 0 ? (
          <div style={{ ...styles.emptyStateCard, marginTop: 12 }}>Brak aktywnych celów.</div>
        ) : effectiveMode === 'priority' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeGoals.map((goal) => goal.id)}
              strategy={verticalListSortingStrategy}
            >
              <div style={cardsWrapStyle}>
                {activeGoals.map((goal) => {
                  const progress = plan.progressByGoalId[goal.id]

                  return (
                    <SortableGoalCard
                      key={goal.id}
                      goal={goal}
                      collectedAmount={progress?.collectedAmount || 0}
                      remainingAmount={progress?.remainingAmount || goal.target_amount}
                      percentage={progress?.percentage || 0}
                      statusLabel={progress?.statusLabel || 'w trakcie'}
                      completionMonth={progress?.completionMonth || null}
                      deadlineMonth={progress?.deadlineMonth || goal.deadline_month || null}
                      waitingForLockedMonth={
                        Boolean(progress?.completionMonth) &&
                        progress?.statusLabel === 'w trakcie' &&
                        !lockedMonthsSet.has(progress.completionMonth as string)
                      }
                      allocationPercent={pendingAllocationByGoalId[goal.id] ?? null}
                      isAllocationMode={false}
                      onEdit={openEditModal}
                      onDelete={(goalId) => {
                        void onDeleteGoal(goalId)
                      }}
                      styles={styles}
                    />
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div style={cardsWrapStyle}>
            {activeGoals.map((goal) => {
              const progress = plan.progressByGoalId[goal.id]

              return (
                <StaticGoalCard
                  key={goal.id}
                  goal={goal}
                  collectedAmount={progress?.collectedAmount || 0}
                  remainingAmount={progress?.remainingAmount || goal.target_amount}
                  percentage={progress?.percentage || 0}
                  statusLabel={progress?.statusLabel || 'w trakcie'}
                  completionMonth={progress?.completionMonth || null}
                  deadlineMonth={progress?.deadlineMonth || goal.deadline_month || null}
                  waitingForLockedMonth={
                    Boolean(progress?.completionMonth) &&
                    progress?.statusLabel === 'w trakcie' &&
                    !lockedMonthsSet.has(progress.completionMonth as string)
                  }
                  allocationPercent={pendingAllocationByGoalId[goal.id] ?? null}
                  isAllocationMode
                  isAllocationLocked={lockedAllocationGoalIds.has(goal.id)}
                  sliderValue={pendingAllocationByGoalId[goal.id] ?? 0}
                  onAllocationChange={handleAllocationChange}
                  onAllocationDragStart={handleAllocationDragStart}
                  onAllocationCommit={handleAllocationCommit}
                  onToggleAllocationLock={handleToggleAllocationLock}
                  onEdit={openEditModal}
                  onDelete={(goalId) => {
                    void onDeleteGoal(goalId)
                  }}
                  styles={styles}
                />
              )
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={styles.l2Name}>Cele archiwalne</div>

        {archivedGoals.length === 0 ? (
          <div style={{ ...styles.emptyStateCard, marginTop: 12 }}>Brak celów archiwalnych.</div>
        ) : (
          <div style={cardsWrapStyle}>
            {archivedGoals.map((goal) => {
              const progress = plan.progressByGoalId[goal.id]

              return (
                <StaticGoalCard
                  key={goal.id}
                  goal={goal}
                  collectedAmount={progress?.collectedAmount || 0}
                  remainingAmount={progress?.remainingAmount || goal.target_amount}
                  percentage={progress?.percentage || 0}
                  statusLabel={progress?.statusLabel || 'w trakcie'}
                  completionMonth={progress?.completionMonth || null}
                  deadlineMonth={progress?.deadlineMonth || goal.deadline_month || null}
                  waitingForLockedMonth={false}
                  allocationPercent={pendingAllocationByGoalId[goal.id] ?? null}
                  isAllocationMode={false}
                  onEdit={openEditModal}
                  onDelete={(goalId) => {
                    void onDeleteGoal(goalId)
                  }}
                  styles={styles}
                />
              )
            })}
          </div>
        )}
      </div>

      {editFormState && (
        <div style={overlayStyle} onClick={() => setEditFormState(null)}>
          <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={styles.sectionTitle}>Edytuj cel</div>
            <div style={{ ...styles.pageSubtitle, marginBottom: 16 }}>
              Możesz zmienić nazwę, kwotę docelową i deadline bez ręcznego przenoszenia celu między
              listami.
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={styles.sortLabel}>Nazwa</label>
                <input
                  style={styles.input}
                  value={editFormState.name}
                  onChange={(event) =>
                    setEditFormState((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                  }
                />
              </div>

              <div>
                <label style={styles.sortLabel}>Kwota docelowa</label>
                <input
                  style={styles.input}
                  inputMode="decimal"
                  value={editFormState.targetAmount}
                  onChange={(event) =>
                    setEditFormState((prev) =>
                      prev ? { ...prev, targetAmount: event.target.value } : prev
                    )
                  }
                />
              </div>

              <div>
                <label style={styles.sortLabel}>Deadline</label>
                <input
                  style={styles.input}
                  type="month"
                  value={editFormState.deadlineMonth}
                  onChange={(event) =>
                    setEditFormState((prev) =>
                      prev ? { ...prev, deadlineMonth: event.target.value } : prev
                    )
                  }
                />
              </div>
            </div>

            <div style={{ ...styles.actions, marginTop: 16 }}>
              <button
                type="button"
                style={styles.primaryButton}
                disabled={isSaving || !editFormState.name.trim() || !editFormState.targetAmount}
                onClick={() => void saveGoal(editFormState, () => setEditFormState(null))}
              >
                {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </button>
              <button type="button" style={styles.secondaryButton} onClick={() => setEditFormState(null)}>
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
