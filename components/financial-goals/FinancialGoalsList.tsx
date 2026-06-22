import { useState } from 'react'
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FinancialGoal, FinancialGoalAllocationMode } from '../../lib/budgetPageTypes'
import { uiListRowApi } from '../../lib/uiFoundation'
import CategoryIcon from '../CategoryIcon'
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
  openEditModal: (goal: FinancialGoal) => void
  onDeleteGoal: (goalId: string) => Promise<void>
}

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
  openEditModal,
  onDeleteGoal,
}: Props) {
  const [isArchiveOpen, setIsArchiveOpen] = useState(false)

  return (
    <>
      <section data-ui-section="true" data-financial-goals-current-list="true">
        <div data-ui-section-heading="true">
          <h3 data-ui-section-title="true">Cele aktualne</h3>
          <span>{activeGoals.length} aktywnych</span>
        </div>

        {activeGoals.length === 0 ? (
          <div data-ui-empty-block="true">Brak aktywnych celów.</div>
        ) : effectiveMode === 'priority' ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={activeGoals.map((goal) => goal.id)} strategy={verticalListSortingStrategy}>
              <div
                className={`${uiListRowApi.classNames.list} ${uiListRowApi.classNames.listNormal}`}
                data-ui-goal-list="true"
              >
                {activeGoals.map((goal) => (
                  <SortableGoalCard
                    key={goal.id}
                    goal={goal}
                    {...getProgressProps(goal, progressByGoalId, lockedMonthsSet)}
                    allocationPercent={pendingAllocationByGoalId[goal.id] ?? null}
                    isAllocationMode={false}
                    onEdit={openEditModal}
                    onDelete={(goalId) => void onDeleteGoal(goalId)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div
            className={`${uiListRowApi.classNames.list} ${uiListRowApi.classNames.listNormal}`}
            data-ui-goal-list="true"
          >
            {activeGoals.map((goal) => (
              <StaticGoalCard
                key={goal.id}
                goal={goal}
                {...getProgressProps(goal, progressByGoalId, lockedMonthsSet)}
                allocationPercent={pendingAllocationByGoalId[goal.id] ?? null}
                isAllocationMode
                isAllocationLocked={lockedAllocationGoalIds.has(goal.id)}
                sliderValue={pendingAllocationByGoalId[goal.id] ?? 0}
                onAllocationChange={handleAllocationChange}
                onAllocationDragStart={handleAllocationDragStart}
                onAllocationCommit={handleAllocationCommit}
                onToggleAllocationLock={handleToggleAllocationLock}
                onEdit={openEditModal}
                onDelete={(goalId) => void onDeleteGoal(goalId)}
              />
            ))}
          </div>
        )}
      </section>

      <section data-ui-section="true" data-financial-goals-archived-list="true">
        <button
          type="button"
          className="ui-button--utility"
          data-financial-goals-archive-toggle="true"
          aria-expanded={isArchiveOpen}
          onClick={() => setIsArchiveOpen((value) => !value)}
        >
          <CategoryIcon iconKey={isArchiveOpen ? 'system-collapse' : 'system-expand'} />
          {isArchiveOpen ? 'Ukryj cele archiwalne' : 'Pokaż cele archiwalne'} ({archivedGoals.length})
        </button>

        {isArchiveOpen && (
          archivedGoals.length === 0 ? (
            <div data-ui-empty-block="true">Brak celów archiwalnych.</div>
          ) : (
            <div
              className={`${uiListRowApi.classNames.list} ${uiListRowApi.classNames.listNormal}`}
              data-ui-goal-list="true"
              data-ui-goal-list-variant="archive"
            >
              {archivedGoals.map((goal) => (
                <StaticGoalCard
                  key={goal.id}
                  goal={goal}
                  {...getProgressProps(goal, progressByGoalId, lockedMonthsSet)}
                  waitingForLockedMonth={false}
                  allocationPercent={pendingAllocationByGoalId[goal.id] ?? null}
                  isAllocationMode={false}
                  onEdit={openEditModal}
                  onDelete={(goalId) => void onDeleteGoal(goalId)}
                />
              ))}
            </div>
          )
        )}
      </section>
    </>
  )
}
