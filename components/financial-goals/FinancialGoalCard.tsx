'use client'

import type { ReactNode } from 'react'
import CategoryIcon from '../CategoryIcon'
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

const getGoalIconKey = (goal: GoalCardBaseProps['goal']) => {
  const goalWithAppearance = goal as GoalCardBaseProps['goal'] & {
    icon?: string | null
    icon_key?: string | null
    category_icon?: string | null
  }

  return (
    goalWithAppearance.icon_key ||
    goalWithAppearance.category_icon ||
    goalWithAppearance.icon ||
    'system-goals'
  )
}

const getGoalTone = (goal: GoalCardBaseProps['goal']) => {
  const goalWithAppearance = goal as GoalCardBaseProps['goal'] & {
    color?: string | null
    color_tone?: string | null
  }

  return goalWithAppearance.color_tone || goalWithAppearance.color || 'green'
}

type GoalCardExtraProps = {
  dragHandle?: ReactNode
  priorityPosition?: number
}

function GoalCardContent(props: GoalCardBaseProps & GoalCardExtraProps) {
  const {
    goal,
    collectedAmount,
    remainingAmount,
    percentage,
    statusLabel,
    deadlineMonth,
    allocationPercent,
    isAllocationMode,
    onEdit,
    onDelete,
    dragHandle,
    priorityPosition,
  } = props

  const isUnsuccessful = statusLabel === 'niezrealizowany'
  const progressWidth = isUnsuccessful ? '100%' : `${Math.min(percentage, 100)}%`
  const progressColor = isUnsuccessful ? getGoalProgressBarColor(0) : getGoalProgressBarColor(percentage)
  const allocationLabel = allocationPercent === null ? '0%' : `${allocationPercent}%`
  const modeLabel = isAllocationMode ? 'Alokacja' : 'Priorytet'
  const modeValue = isAllocationMode ? allocationLabel : String(priorityPosition || '—')

  return (
    <>
      <div data-ui-goal-card-main="true">
        <div data-ui-goal-card-title-row="true">
          {dragHandle}

          <span data-ui-goal-icon="true" data-ui-tone={getGoalTone(goal)} aria-hidden="true">
            <CategoryIcon iconKey={getGoalIconKey(goal)} size="large" />
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
          <div data-ui-goal-metric="true" data-ui-goal-metric-kind={isAllocationMode ? 'allocation' : 'priority'}>
            <span>{modeLabel}</span>
            <strong>{modeValue}</strong>
          </div>
        </div>

        <div data-ui-goal-actions="true">
          <button type="button" className="ui-button--utility" onClick={() => onEdit(goal)}>
            Edytuj
          </button>
          <button
            type="button"
            data-ui-button-danger="true"
            onClick={() => onDelete(goal.id)}
          >
            Usuń
          </button>
        </div>
      </div>

      <div data-ui-goal-progress="true">
        <strong>{percentage.toFixed(0)}%</strong>
        <div>
          <span style={{ width: progressWidth, background: progressColor }} />
        </div>
      </div>
    </>
  )
}

export function SortableGoalCard(props: GoalCardBaseProps & { priorityPosition?: number }) {
  const { goal } = props
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: goal.id,
  })

  return (
    <article
      ref={setNodeRef}
      data-ui-record-card="true"
      data-ui-goal-card="true"
      data-ui-goal-card-mode="priority"
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
            ⋮⋮
          </button>
        }
      />
    </article>
  )
}

export function StaticGoalCard(
  props: GoalCardBaseProps & { priorityPosition?: number; showInactiveDragHandle?: boolean }
) {
  return (
    <article
      data-ui-record-card="true"
      data-ui-goal-card="true"
      data-ui-goal-card-mode={props.isAllocationMode ? 'allocation' : 'static'}
    >
      <GoalCardContent
        {...props}
        dragHandle={
          props.showInactiveDragHandle ? (
            <span
              className="ui-button--icon"
              data-ui-goal-menu="true"
              data-ui-goal-menu-state="disabled"
              aria-hidden="true"
              title="Kolejność w alokacji wynika z procentów"
            >
              ⋮⋮
            </span>
          ) : undefined
        }
      />
    </article>
  )
}
