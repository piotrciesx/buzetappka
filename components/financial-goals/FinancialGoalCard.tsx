'use client'

import type { ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getGoalProgressBarColor } from '../../lib/financialGoals'
import type { GoalCardBaseProps } from './financialGoalsPanelTypes'

const cardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 14,
  background: '#ffffff',
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

export function SortableGoalCard(props: GoalCardBaseProps) {
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

export function StaticGoalCard(props: GoalCardBaseProps) {
  return (
    <div style={cardStyle}>
      <GoalCardContent {...props} />
    </div>
  )
}
