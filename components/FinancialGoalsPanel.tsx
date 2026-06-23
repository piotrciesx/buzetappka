'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { FinancialGoal, FinancialGoalAllocationMode, FinancialGoalMonthPriority } from '../lib/budgetPageTypes'
import {
  buildFinancialGoalsPlan,
  getEffectiveMonthPriorityRowsForMonth,
  getFinancialGoalAllocationPercentagesForMonth,
  getFinancialGoalModeForMonth,
  getFinancialGoalPriorityItemsForMonth,
} from '../lib/financialGoals'
import FinancialGoalEditModal from './financial-goals/FinancialGoalEditModal'
import FinancialGoalsList from './financial-goals/FinancialGoalsList'
import FinancialGoalsModeControls from './financial-goals/FinancialGoalsModeControls'
import FinancialGoalsSummary from './financial-goals/FinancialGoalsSummary'
import type { FinancialGoalsPanelProps, FormState } from './financial-goals/financialGoalsPanelTypes'
import { usePressHoldDndSensors } from '../lib/usePressHoldDndSensors'
import { getEffectiveTransactionScope } from '../lib/transactionScope'

import {
  areAllocationMapsEqual,
  areSetsEqual,
  getInitialFormState,
  normalizeAllocationMap,
  orderGoalsByIds,
  rebalanceAllocations,
  sortGoalsByAllocation,
} from './financial-goals/financialGoalsPanelUtils'
export default function FinancialGoalsPanel(props: FinancialGoalsPanelProps) {
  const {
    selectedMonth,
    goals,
    goalPriorities,
    goalMonthConfigs,
    transactions,
    budgetStartDate,
    excludedMonthsSet,
    lockedMonthsSet,
    getSignedAmountForTransaction,
    onSaveGoal,
    onDeleteGoal,
    onSetGoalModeForMonth,
    onSaveGoalAllocationsForMonth,
    onReorderGoalsForMonth,
    styles,
  } = props

  const saveTimeoutRef = useRef<number | null>(null); const selectedMonthRef = useRef(selectedMonth)

  const [createFormState, setCreateFormState] = useState<FormState>(() => getInitialFormState(selectedMonth))
  const [editFormState, setEditFormState] = useState<FormState | null>(null)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
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
  const localPriorityOrder = useMemo(() => localPriorityOrderByMonth[selectedMonth] || [], [localPriorityOrderByMonth, selectedMonth])

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

  useEffect(() => {
    const handleOpenCreate = () => {
      setIsCreateFormOpen(true)
    }

    window.addEventListener('budget-open-financial-goal-create', handleOpenCreate)

    return () => {
      window.removeEventListener('budget-open-financial-goal-create', handleOpenCreate)
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
      transactions: getEffectiveTransactionScope(transactions, {
        mode: 'goals',
        budgetStartDate,
        excludedMonthsSet,
      }),
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
    budgetStartDate,
    excludedMonthsSet,
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
      transactions: getEffectiveTransactionScope(transactions, {
        mode: 'goals',
        budgetStartDate,
        excludedMonthsSet,
      }),
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
    budgetStartDate,
    excludedMonthsSet,
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
    <section data-ui-section="true" data-financial-goals-panel="true">
      <FinancialGoalsModeControls
        effectiveMode={effectiveMode}
        activeGoalsCount={activeGoals.length}
        onModeChange={handleModeChange}
      />

      <FinancialGoalsSummary
        selectedMonth={selectedMonth}
        monthBalance={monthBalance}
        monthSurplus={monthSurplus}
        lockedMonthsSet={lockedMonthsSet}
      />

      <div data-ui-goal-helper="true">
        {effectiveMode === 'allocation'
          ? 'W trybie alokacji ustawiasz procentowy podział nadwyżki między aktywne cele.'
          : `Przeciągnij cele, aby ustawić priorytet realizacji dla miesiąca ${selectedMonth}.`}
        {isReordering ? ' Zapisywanie nowej kolejności...' : ''}
        {isModeSaving ? ' Zapisywanie trybu...' : ''}
        {isAllocationSaving ? ' Zapisywanie alokacji...' : ''}
      </div>

      <FinancialGoalsList
        activeGoals={activeGoals}
        archivedGoals={archivedGoals}
        effectiveMode={effectiveMode}
        progressByGoalId={plan.progressByGoalId}
        pendingAllocationByGoalId={pendingAllocationByGoalId}
        lockedAllocationGoalIds={lockedAllocationGoalIds}
        lockedMonthsSet={lockedMonthsSet}
        sensors={sensors}
        handleDragEnd={handleDragEnd}
        handleAllocationChange={handleAllocationChange}
        handleAllocationDragStart={handleAllocationDragStart}
        handleAllocationCommit={handleAllocationCommit}
        handleToggleAllocationLock={handleToggleAllocationLock}
        totalPercent={totalPercent}
        monthSurplus={monthSurplus}
        isAllocationSaving={isAllocationSaving}
        openEditModal={openEditModal}
        onDeleteGoal={onDeleteGoal}
      />

      {isCreateFormOpen && (
        <FinancialGoalEditModal
          title="Nowy cel finansowy"
          description="Dodaj cel, który będzie rozliczany z nadwyżki budżetu."
          submitLabel="Dodaj cel"
          formState={createFormState}
          isSaving={isSaving}
          styles={styles}
          onFormStateChange={setCreateFormState}
          onSave={() =>
            void saveGoal(createFormState, () => {
              setCreateFormState(getInitialFormState(selectedMonth))
              setIsCreateFormOpen(false)
            })
          }
          onClose={() => setIsCreateFormOpen(false)}
        />
      )}

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
