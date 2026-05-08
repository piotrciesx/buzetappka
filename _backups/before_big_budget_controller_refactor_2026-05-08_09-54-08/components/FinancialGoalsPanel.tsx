'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  FinancialGoal,
  FinancialGoalAllocationMode,
  FinancialGoalMonthPriority,
} from '../lib/budgetPageTypes'
import {
  buildFinancialGoalsPlan,
  getEffectiveMonthPriorityRowsForMonth,
  getFinancialGoalAllocationPercentagesForMonth,
  getFinancialGoalModeForMonth,
  getFinancialGoalPriorityItemsForMonth,
} from '../lib/financialGoals'
import FinancialGoalEditModal from './financial-goals/FinancialGoalEditModal'
import FinancialGoalForm from './financial-goals/FinancialGoalForm'
import FinancialGoalsHeader from './financial-goals/FinancialGoalsHeader'
import FinancialGoalsModeControls from './financial-goals/FinancialGoalsModeControls'
import { SortableGoalCard, StaticGoalCard } from './financial-goals/FinancialGoalCard'
import type { FinancialGoalsPanelProps, FormState } from './financial-goals/financialGoalsPanelTypes'
import { usePressHoldDndSensors } from '../lib/usePressHoldDndSensors'

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

export default function FinancialGoalsPanel(props: FinancialGoalsPanelProps) {
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

  const sensors = usePressHoldDndSensors()

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
      <FinancialGoalsHeader styles={styles} />

      <FinancialGoalsModeControls
        effectiveMode={effectiveMode}
        activeGoalsCount={activeGoals.length}
        styles={styles}
        onModeChange={handleModeChange}
      />

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

      <FinancialGoalForm
        formState={createFormState}
        isSaving={isSaving}
        styles={styles}
        submitLabel="Dodaj cel"
        savingLabel="Zapisywanie..."
        onFormStateChange={setCreateFormState}
        onSubmit={() =>
          void saveGoal(createFormState, () =>
            setCreateFormState(getInitialFormState(selectedMonth))
          )
        }
      />

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
        <FinancialGoalEditModal
          formState={editFormState}
          isSaving={isSaving}
          styles={styles}
          onFormStateChange={setEditFormState}
          onSave={() => void saveGoal(editFormState, () => setEditFormState(null))}
          onClose={() => setEditFormState(null)}
        />
      )}
    </section>
  )
}
