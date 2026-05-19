import { CSSProperties } from 'react'
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FinancialGoal, FinancialGoalAllocationMode } from '../../lib/budgetPageTypes'
import { SortableGoalCard, StaticGoalCard } from './FinancialGoalCard'
import { cardsWrapStyle } from './financialGoalsPanelUtils'

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
  styles: Record<string, CSSProperties>
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
  styles,
  handleDragEnd,
  handleAllocationChange,
  handleAllocationDragStart,
  handleAllocationCommit,
  handleToggleAllocationLock,
  openEditModal,
  onDeleteGoal,
}: Props) {
  return (
    <>
      <div style={{ marginTop: 18 }} data-financial-goals-current-list="true">
        <div style={styles.l2Name}>Cele aktualne</div>

        {activeGoals.length === 0 ? (
          <div style={{ ...styles.emptyStateCard, marginTop: 12 }}>Brak aktywnych celów.</div>
        ) : effectiveMode === 'priority' ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={activeGoals.map((goal) => goal.id)} strategy={verticalListSortingStrategy}>
              <div style={cardsWrapStyle}>
                {activeGoals.map((goal) => (
                  <SortableGoalCard
                    key={goal.id}
                    goal={goal}
                    {...getProgressProps(goal, progressByGoalId, lockedMonthsSet)}
                    allocationPercent={pendingAllocationByGoalId[goal.id] ?? null}
                    isAllocationMode={false}
                    onEdit={openEditModal}
                    onDelete={(goalId) => void onDeleteGoal(goalId)}
                    styles={styles}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div style={cardsWrapStyle}>
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
                styles={styles}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 22 }} data-financial-goals-archived-list="true">
        <div style={styles.l2Name}>Cele archiwalne</div>

        {archivedGoals.length === 0 ? (
          <div style={{ ...styles.emptyStateCard, marginTop: 12 }}>Brak celów archiwalnych.</div>
        ) : (
          <div style={cardsWrapStyle}>
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
                styles={styles}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
