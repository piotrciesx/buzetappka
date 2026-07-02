import { useEffect, useRef, useState } from 'react'
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FinancialGoal, FinancialGoalAllocationMode } from '../../lib/budgetPageTypes'
import CategoryIcon from '../CategoryIcon'
import { SectionHeader } from '../ui/FoundationPrimitives'
import { SortableGoalCard, StaticGoalCard } from './FinancialGoalCard'

type ProgressByGoalId = Record<
  string,
  {
    collectedAmount: number
    remainingAmount: number
    percentage: number
    statusLabel: string
    completionMonth: string | null
    deadlineMonth: string | null
    waitingForLockedMonth?: boolean
  }
>

type Props = {
  activeGoals: FinancialGoal[]
  archivedGoals: FinancialGoal[]
  effectiveMode: FinancialGoalAllocationMode
  progressByGoalId: ProgressByGoalId
  pendingAllocationByGoalId: Record<string, number>
  lockedAllocationGoalIds: Set<string>
  lockedMonthsSet: Set<string>
  sensors: Parameters<typeof DndContext>[0]['sensors']
  handleDragEnd: (event: DragEndEvent) => void
  handleAllocationChange: (goalId: string, nextValue: number) => void
  handleAllocationDragStart: () => void
  handleAllocationCommit: () => void
  handleToggleAllocationLock: (goalId: string) => void
  totalPercent: number
  monthSurplus: number
  isAllocationSaving: boolean
  openEditModal: (goal: FinancialGoal) => void
  onDeleteGoal: (goalId: string) => Promise<void>
}

const formatAmount = (value: number) => `${value.toFixed(2)} zł`

const getProgressProps = (
  goal: FinancialGoal,
  progressByGoalId: ProgressByGoalId,
  lockedMonthsSet: Set<string>
) => {
  const progress = progressByGoalId[goal.id]

  return {
    collectedAmount: progress?.collectedAmount || 0,
    remainingAmount: progress?.remainingAmount || goal.target_amount,
    percentage: progress?.percentage || 0,
    statusLabel: progress?.statusLabel || 'w trakcie',
    completionMonth: progress?.completionMonth || null,
    deadlineMonth: progress?.deadlineMonth || goal.deadline_month || null,
    waitingForLockedMonth:
      progress?.waitingForLockedMonth === true ||
      Boolean(progress?.completionMonth) &&
      progress?.statusLabel === 'w trakcie' &&
      !lockedMonthsSet.has(progress.completionMonth as string),
  }
}

export default function FinancialGoalsList({
  activeGoals,
  archivedGoals,
  effectiveMode,
  progressByGoalId,
  pendingAllocationByGoalId,
  lockedAllocationGoalIds,
  lockedMonthsSet,
  sensors,
  handleDragEnd,
  handleAllocationChange,
  handleAllocationDragStart,
  handleAllocationCommit,
  handleToggleAllocationLock,
  totalPercent,
  monthSurplus,
  isAllocationSaving,
  openEditModal,
  onDeleteGoal,
}: Props) {
  const [activeList, setActiveList] = useState<'current' | 'archived'>('current')
  const [isAllocationMenuOpen, setIsAllocationMenuOpen] = useState(false)
  const allocationMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isAllocationMenuOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (!allocationMenuRef.current?.contains(target)) {
        setIsAllocationMenuOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isAllocationMenuOpen])

  const visibleGoals = activeList === 'current' ? activeGoals : archivedGoals
  const isCurrentList = activeList === 'current'

  const renderAllocationManager = () => {
    if (effectiveMode !== 'allocation' || !isCurrentList || activeGoals.length === 0) {
      return null
    }

    return (
      <div
        ref={allocationMenuRef}
        data-financial-goals-allocation-control="true"
        data-open={isAllocationMenuOpen ? 'true' : 'false'}
      >
        <button
          type="button"
          className="ui-button--utility"
          data-financial-goals-allocation-trigger="true"
          aria-expanded={isAllocationMenuOpen}
          onClick={() => setIsAllocationMenuOpen((value) => !value)}
        >
          <CategoryIcon iconKey="allocation" size="small" />
          Ustaw alokację
          <span data-ui-picker-chevron="true" aria-hidden="true" />
        </button>

        {isAllocationMenuOpen && (
          <div data-financial-goals-allocation-menu="true">
            <header data-financial-goals-allocation-menu-header="true">
              <span>
                <strong>Suma alokacji:</strong> {totalPercent.toFixed(0)}%
              </span>
              <span>
                <strong>Nadwyżka:</strong> {formatAmount(monthSurplus)}
              </span>
              {isAllocationSaving && <small>Zapisywanie...</small>}
            </header>

            <div data-financial-goals-allocation-rows="true">
              {activeGoals.map((goal) => {
                const value = pendingAllocationByGoalId[goal.id] ?? 0
                const isLocked = lockedAllocationGoalIds.has(goal.id)

                return (
                  <div key={goal.id} data-financial-goals-allocation-row="true">
                    <strong>{goal.name}</strong>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={value}
                      disabled={isLocked}
                      onPointerDown={handleAllocationDragStart}
                      onPointerUp={handleAllocationCommit}
                      onMouseUp={handleAllocationCommit}
                      onTouchEnd={handleAllocationCommit}
                      onKeyUp={handleAllocationCommit}
                      onChange={(event) => handleAllocationChange(goal.id, Number(event.target.value))}
                    />
                    <span>{value}%</span>
                    <button
                      type="button"
                      className="ui-button--icon"
                      data-financial-goals-lock-action="true"
                      data-active={isLocked ? 'true' : 'false'}
                      aria-label={isLocked ? 'Odblokuj alokację' : 'Zablokuj alokację'}
                      title={isLocked ? 'Odblokuj alokację' : 'Zablokuj alokację'}
                      onClick={() => handleToggleAllocationLock(goal.id)}
                    >
                      <CategoryIcon iconKey={isLocked ? 'lock' : 'unlock'} size="small" />
                    </button>
                  </div>
                )
              })}
            </div>

            <footer data-financial-goals-allocation-menu-footer="true">
              <span data-state={totalPercent === 100 ? 'valid' : 'invalid'}>
                {totalPercent === 100 ? 'Alokacja gotowa do zapisu.' : 'Suma musi wynosić 100%.'}
              </span>
            </footer>
          </div>
        )}
      </div>
    )
  }

  const renderGoalList = () => {
    if (visibleGoals.length === 0) {
      return (
        <div data-ui-empty-block="true">
          {isCurrentList ? 'Brak aktywnych celów.' : 'Brak celów historycznych.'}
        </div>
      )
    }

    if (isCurrentList && effectiveMode === 'priority') {
      return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={activeGoals.map((goal) => goal.id)} strategy={verticalListSortingStrategy}>
            <div
              data-ui-large-record-list="true"
              data-financial-goals-list-viewport="true"
            >
              {activeGoals.map((goal, index) => (
                <SortableGoalCard
                  key={goal.id}
                  goal={goal}
                  {...getProgressProps(goal, progressByGoalId, lockedMonthsSet)}
                  allocationPercent={pendingAllocationByGoalId[goal.id] ?? null}
                  isAllocationMode={false}
                  priorityPosition={index + 1}
                  onEdit={openEditModal}
                  onDelete={(goalId) => void onDeleteGoal(goalId)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )
    }

    return (
      <div
        data-ui-large-record-list="true"
        data-financial-goals-list-viewport="true"
      >
        {visibleGoals.map((goal, index) => (
          <StaticGoalCard
            key={goal.id}
            goal={goal}
            {...getProgressProps(goal, progressByGoalId, lockedMonthsSet)}
            allocationPercent={pendingAllocationByGoalId[goal.id] ?? null}
            isAllocationMode={isCurrentList && effectiveMode === 'allocation'}
            priorityPosition={index + 1}
            showInactiveDragHandle={isCurrentList && effectiveMode === 'allocation'}
            onEdit={openEditModal}
            onDelete={(goalId) => void onDeleteGoal(goalId)}
          />
        ))}
      </div>
    )
  }

  return (
    <section data-ui-section="true" data-ui-large-section="true" data-financial-goals-current-list="true">
      <SectionHeader
        tone={isCurrentList ? 'neutral-accent-2' : 'neutral-accent-3'}
        icon={<CategoryIcon iconKey={isCurrentList ? 'system-goals' : 'calendar'} size="small" />}
        title={isCurrentList ? 'Cele aktualne' : 'Cele historyczne'}
        description={`${visibleGoals.length} ${isCurrentList ? 'aktywnych' : 'historycznych'}`}
        trailing={
          <>
            {renderAllocationManager()}

            <div data-ui-list-switch="true" role="group" aria-label="Zakres celów">
              <button
                type="button"
                data-active={activeList === 'current' ? 'true' : undefined}
                onClick={() => {
                  setActiveList('current')
                  setIsAllocationMenuOpen(false)
                }}
              >
                Cele aktualne
              </button>
              <button
                type="button"
                data-active={activeList === 'archived' ? 'true' : undefined}
                onClick={() => {
                  setActiveList('archived')
                  setIsAllocationMenuOpen(false)
                }}
              >
                Cele historyczne
              </button>
            </div>
          </>
        }
      />

      {renderGoalList()}
    </section>
  )
}
