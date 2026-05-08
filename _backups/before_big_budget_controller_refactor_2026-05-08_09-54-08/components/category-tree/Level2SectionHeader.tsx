import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import BudgetLimitIndicator, { type BudgetLimitView } from '../BudgetLimitIndicator'

type Level2SectionHeaderProps = {
  name: string
  level3Count: number
  transactionCount: number
  categorySum: number
  isOpen: boolean
  isDragging: boolean
  isClosingAfterSelectedMonth: boolean
  isCalendarOpen: boolean
  canUseMonthCalendar: boolean
  canUseBudgetLimit: boolean
  canAddDirectTransaction: boolean
  isSelectedMonthLocked: boolean
  budgetLimitView?: BudgetLimitView | null
  dragHandle: ReactNode
  headerDragProps?: HTMLAttributes<HTMLDivElement>
  styles: Record<string, CSSProperties>
  onToggle: () => void
  onToggleCalendar: () => void
  onEditBudgetLimit?: () => void
  onInlineAdd: () => void
  onRenameCategory: () => Promise<void>
  onDeleteCategory: () => Promise<void>
  onAddSubcategory: () => void
  onUndoScheduledHide: () => Promise<void>
  onHideNow: () => Promise<void>
  onHideNext: () => Promise<void>
}

export default function Level2SectionHeader({
  name,
  level3Count,
  transactionCount,
  categorySum,
  isOpen,
  isDragging,
  isClosingAfterSelectedMonth,
  isCalendarOpen,
  canUseMonthCalendar,
  canUseBudgetLimit,
  canAddDirectTransaction,
  isSelectedMonthLocked,
  budgetLimitView = null,
  dragHandle,
  headerDragProps,
  styles,
  onToggle,
  onToggleCalendar,
  onEditBudgetLimit,
  onInlineAdd,
  onRenameCategory,
  onDeleteCategory,
  onAddSubcategory,
  onUndoScheduledHide,
  onHideNow,
  onHideNext,
}: Level2SectionHeaderProps) {
  return (
    <div
      data-category-drag-row="true"
      style={{
        ...styles.l2Header,
        boxShadow: isDragging ? '0 12px 24px rgba(0, 0, 0, 0.12)' : styles.l2Header.boxShadow,
      }}
      onClick={() => {
        if (!isDragging) {
          onToggle()
        }
      }}
      {...headerDragProps}
    >
      <div style={styles.l2Left}>
        {dragHandle}

        <div style={styles.arrow} data-category-toggle-icon="true" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="17" height="17">
            <path
              d={isOpen ? 'm7 10 5 5 5-5' : 'm10 7 5 5-5 5'}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div>
          <div style={styles.l2Name}>{name}</div>

          <div style={styles.l2Meta}>
            Podkategorie: {level3Count} • Wpisy: {transactionCount} • Suma: {categorySum}
          </div>

          {isClosingAfterSelectedMonth && (
            <div style={styles.closingBadge}>zamknie się z końcem tego miesiąca</div>
          )}

          <BudgetLimitIndicator view={budgetLimitView} />
        </div>
      </div>

      <div data-category-actions="true" style={styles.actions} onClick={(event) => event.stopPropagation()}>
        {canUseMonthCalendar && (
          <button
            type="button"
            data-category-secondary-action="true"
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

        {canUseBudgetLimit && onEditBudgetLimit && (
          <button
            type="button"
            data-category-secondary-action="true"
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

        {canAddDirectTransaction && !isSelectedMonthLocked && (
          <button
            type="button"
            data-category-quick-add="true"
            style={styles.primaryButton}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onInlineAdd()
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M12 20h9"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.9"
              />
              <path
                d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.9"
              />
            </svg>
          </button>
        )}

        <button
          data-category-secondary-action="true"
          style={styles.secondaryButton}
          onClick={async () => {
            await onRenameCategory()
          }}
        >
          zmień nazwę
        </button>

        <button
          data-category-secondary-action="true"
          style={styles.dangerButton}
          onClick={async () => {
            await onDeleteCategory()
          }}
        >
          usuń kategorię
        </button>

        <button
          data-category-secondary-action="true"
          style={styles.primaryButton}
          onClick={onAddSubcategory}
        >
          Dodaj podkategorię
        </button>

        {isClosingAfterSelectedMonth ? (
          <button
            data-category-secondary-action="true"
            style={styles.secondaryButton}
            onClick={async () => {
              await onUndoScheduledHide()
            }}
          >
            cofnij zamknięcie
          </button>
        ) : (
          <>
            <button
              data-category-secondary-action="true"
              style={styles.dangerButton}
              onClick={async () => {
                await onHideNow()
              }}
            >
              ukryj teraz
            </button>

            <button
              data-category-secondary-action="true"
              style={styles.dangerButton}
              onClick={async () => {
                await onHideNext()
              }}
            >
              ukryj od następnego
            </button>
          </>
        )}

        <details
          data-mobile-category-menu="true"
          data-floating-dropdown="true"
          onClick={(event) => event.stopPropagation()}
        >
          <summary style={styles.secondaryButton}>⋯</summary>
          <div data-mobile-category-menu-panel="true">
            <button type="button" style={styles.secondaryButton} onClick={onAddSubcategory}>
              Dodaj podkategorię
            </button>

            {canUseMonthCalendar && (
              <button type="button" style={styles.secondaryButton} onClick={onToggleCalendar}>
                {isCalendarOpen ? 'zamknij kalendarz' : 'kalendarz'}
              </button>
            )}
            {canUseBudgetLimit && onEditBudgetLimit && (
              <button type="button" style={styles.secondaryButton} onClick={onEditBudgetLimit}>
                {budgetLimitView ? 'Edytuj limit' : 'Ustaw limit'}
              </button>
            )}
            <button style={styles.secondaryButton} onClick={async () => onRenameCategory()}>
              zmień nazwę
            </button>
            {isClosingAfterSelectedMonth ? (
              <button style={styles.secondaryButton} onClick={async () => onUndoScheduledHide()}>
                cofnij zamknięcie
              </button>
            ) : (
              <>
                <button style={styles.dangerButton} onClick={async () => onHideNow()}>
                  ukryj teraz
                </button>
                <button style={styles.dangerButton} onClick={async () => onHideNext()}>
                  ukryj od następnego
                </button>
              </>
            )}
            <button style={styles.dangerButton} onClick={async () => onDeleteCategory()}>
              usuń
            </button>
          </div>
        </details>
      </div>
    </div>
  )
}
