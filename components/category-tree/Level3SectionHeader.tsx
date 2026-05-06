import type { CSSProperties, ReactNode } from 'react'
import BudgetLimitIndicator, { BudgetLimitView } from '../BudgetLimitIndicator'

type Level3SectionHeaderProps = {
  name: string
  categorySum: number
  showCategorySum?: boolean
  showCategoryActions?: boolean
  isOpen: boolean
  isDragging: boolean
  isClosingAfterSelectedMonth: boolean
  isCalendarOpen: boolean
  canUseMonthCalendar?: boolean
  canAddHere: boolean
  isSelectedMonthLocked: boolean
  dragHandle: ReactNode
  styles: Record<string, CSSProperties>
  onToggle: () => void
  onToggleCalendar: () => void
  onInlineAdd: () => void
  onHideNow: () => Promise<void>
  onHideNext: () => Promise<void>
  onRenameCategory: () => Promise<void>
  onDeleteCategory: () => Promise<void>
  onUndoScheduledHide: () => Promise<void>
  budgetLimitView?: BudgetLimitView | null
  canUseBudgetLimit?: boolean
  onEditBudgetLimit?: () => void
}

export default function Level3SectionHeader({
  name,
  categorySum,
  showCategorySum = true,
  showCategoryActions = true,
  isOpen,
  isDragging,
  isClosingAfterSelectedMonth,
  isCalendarOpen,
  canUseMonthCalendar = true,
  canAddHere,
  isSelectedMonthLocked,
  dragHandle,
  styles,
  onToggle,
  onToggleCalendar,
  onInlineAdd,
  onHideNow,
  onHideNext,
  onRenameCategory,
  onDeleteCategory,
  onUndoScheduledHide,
  budgetLimitView = null,
  canUseBudgetLimit = false,
  onEditBudgetLimit,
}: Level3SectionHeaderProps) {
  return (
    <div
      style={{
        ...styles.l3Header,
        boxShadow: isDragging ? '0 12px 24px rgba(0, 0, 0, 0.12)' : styles.l3Header.boxShadow,
      }}
      onClick={() => {
        if (!isDragging) {
          onToggle()
        }
      }}
    >
      <div style={styles.l2Left}>
        {dragHandle}

        <div style={styles.arrow}>{isOpen ? '▾' : '▸'}</div>

        <div>
          <div style={styles.l3Name}>{showCategorySum ? `${name} • ${categorySum}` : name}</div>

          {isClosingAfterSelectedMonth && (
            <div style={styles.closingBadge}>zamknie się z końcem tego miesiąca</div>
          )}

          <BudgetLimitIndicator view={budgetLimitView} />
        </div>
      </div>

      <div style={styles.actions} onClick={(event) => event.stopPropagation()}>
        {canUseMonthCalendar && (
          <button
            type="button"
            style={styles.secondaryButton}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onToggleCalendar()
            }}
          >
            {isCalendarOpen ? 'zamknij kalendarz' : 'kalendarz'}
          </button>
        )}

        {canAddHere && !isSelectedMonthLocked && (
          <button
            style={styles.primaryButton}
            onClick={() => {
              onInlineAdd()
            }}
          >
            + wpis
          </button>
        )}

        {showCategoryActions && canUseBudgetLimit && onEditBudgetLimit && (
          <button
            type="button"
            style={styles.secondaryButton}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onEditBudgetLimit()
            }}
          >
            {budgetLimitView ? 'Edytuj limit' : 'Ustaw limit'}
          </button>
        )}

        {showCategoryActions && isClosingAfterSelectedMonth ? (
          <button
            style={styles.secondaryButton}
            onClick={async () => {
              await onUndoScheduledHide()
            }}
          >
            cofnij zamknięcie
          </button>
        ) : showCategoryActions ? (
          <>
            <button
              style={styles.secondaryButton}
              onClick={async () => {
                await onRenameCategory()
              }}
            >
              zmień nazwę
            </button>

            <button
              style={styles.dangerButton}
              onClick={async () => {
                await onDeleteCategory()
              }}
            >
              usuń podkategorię
            </button>

            <button
              style={styles.dangerButton}
              onClick={async () => {
                await onHideNow()
              }}
            >
              ukryj teraz
            </button>

            <button
              style={styles.dangerButton}
              onClick={async () => {
                await onHideNext()
              }}
            >
              ukryj od następnego
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
