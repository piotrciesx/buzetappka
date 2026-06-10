'use client'

import type { ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getGoalProgressBarColor } from '../../lib/financialGoals'
import type { GoalCardBaseProps } from './financialGoalsPanelTypes'

const formatAmount = (value: number) => `${value.toFixed(2)} zł`

const getStatusTone = (statusLabel: string) => {
  if (statusLabel === 'zrealizowany') return 'success'
  if (statusLabel === 'niezrealizowany') return 'danger'
  return 'active'
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
    dragHandle,
  } = props

  const isUnsuccessful = statusLabel === 'niezrealizowany'
  const progressWidth = isUnsuccessful ? '100%' : `${Math.min(percentage, 100)}%`
  const progressColor = isUnsuccessful ? getGoalProgressBarColor(0) : getGoalProgressBarColor(percentage)
  const allocationLabel = allocationPercent === null ? '0%' : `${allocationPercent}%`

  return (
    <>
      <div data-ui-goal-card-main="true">
        <div data-ui-goal-card-title-row="true">
          <span data-ui-goal-icon="true" aria-hidden="true">
            {goal.name.trim().slice(0, 1).toUpperCase() || '+'}
          </span>

          <div data-ui-goal-card-copy="true">
            <div>
              <strong>{goal.name}</strong>
              <span data-ui-goal-status={getStatusTone(statusLabel)}>
                <span aria-hidden="true" />
                {statusLabel}
              </span>
            </div>
            <p>
              Start: {goal.start_month}
              {' · '}
              Deadline: {deadlineMonth || 'brak'}
            </p>
          </div>
        </div>

        <div data-ui-goal-metrics="true">
          <div data-ui-goal-metric="true">
            <span>Docelowa</span>
            <strong>{formatAmount(goal.target_amount)}</strong>
          </div>
          <div data-ui-goal-metric="true">
            <span>Uzbierano</span>
            <strong>{formatAmount(collectedAmount)}</strong>
          </div>
          <div data-ui-goal-metric="true">
            <span>Brakuje</span>
            <strong>{formatAmount(remainingAmount)}</strong>
          </div>
          <div data-ui-goal-metric="true">
            <span>Alokacja</span>
            <strong>{allocationLabel}</strong>
          </div>
        </div>

        <div data-ui-goal-actions="true">
          {dragHandle}
          <button type="button" className="ui-button--utility" onClick={() => onEdit(goal)}>
            Edytuj
          </button>
          <button
            type="button"
            className="ui-button--utility"
            data-button-tone="danger"
            onClick={() => onDelete(goal.id)}
          >
            Usuń
          </button>
          {isAllocationMode && onToggleAllocationLock && (
            <button
              type="button"
              className={isAllocationLocked ? 'ui-button--standard' : 'ui-button--utility'}
              onClick={() => onToggleAllocationLock(goal.id)}
              title={
                isAllocationLocked
                  ? 'Odblokuj procent tego celu'
                  : 'Zablokuj procent tego celu'
              }
            >
              {isAllocationLocked ? 'Odblokuj' : 'Zablokuj'}
            </button>
          )}
        </div>
      </div>

      {isAllocationMode && typeof sliderValue === 'number' && onAllocationChange && (
        <div data-ui-goal-slider="true">
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
          <strong>{sliderValue}%</strong>
        </div>
      )}

      <div data-ui-goal-progress="true">
        <strong>{percentage.toFixed(0)}%</strong>
        <div>
          <span style={{ width: progressWidth, background: progressColor }} />
        </div>
      </div>

      <p data-ui-goal-progress-caption="true">
        Postęp: {percentage.toFixed(1)}%
        {completionMonth ? ` · osiągnięcie: ${completionMonth}` : ''}
        {waitingForLockedMonth ? ' · czeka na zamknięcie miesiąca' : ''}
      </p>
    </>
  )
}

export function SortableGoalCard(props: GoalCardBaseProps) {
  const { goal } = props
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: goal.id,
  })

  return (
    <article
      ref={setNodeRef}
      data-ui-record-card="true"
      data-ui-goal-card="true"
      data-dragging={isDragging ? 'true' : 'false'}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <GoalCardContent
        {...props}
        dragHandle={
          <button
            type="button"
            className="ui-button--icon"
            data-ui-goal-menu="true"
            title="Przeciągnij, aby zmienić priorytet"
            {...attributes}
            {...listeners}
          >
            ...
          </button>
        }
      />
    </article>
  )
}

export function StaticGoalCard(props: GoalCardBaseProps) {
  return (
    <article data-ui-record-card="true" data-ui-goal-card="true">
      <GoalCardContent
        {...props}
        dragHandle={
          <button
            type="button"
            className="ui-button--icon"
            data-ui-goal-menu="true"
            onClick={() => props.onEdit(props.goal)}
          >
            ...
          </button>
        }
      />
    </article>
  )
}
