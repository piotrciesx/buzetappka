import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
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
  headerDragProps?: HTMLAttributes<HTMLDivElement>
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

const Icon = ({ name }: { name: 'calendar' | 'plus' | 'limit' }) => {
  if (name === 'calendar') {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <rect
          x="4"
          y="5"
          width="16"
          height="15"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M8 3v4M16 3v4M4 10h16"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    )
  }

  if (name === 'limit') {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M4 18V6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M8 18V10M12 18V8M16 18V12M20 18V5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  )
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
  headerDragProps,
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
  const formattedSum = categorySum.toLocaleString('pl-PL')

  return (
    <div
      data-category-drag-row="true"
      data-category-level="3"
      data-category-open={isOpen ? 'true' : 'false'}
      style={{
        ...styles.l3Header,
        boxShadow: isDragging ? '0 12px 24px rgba(0, 0, 0, 0.12)' : styles.l3Header.boxShadow,
      }}
      onClick={() => {
        if (!isDragging) {
          onToggle()
        }
      }}
      {...headerDragProps}
    >
      <div style={styles.l2Left} data-category-row-main="true">
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

        <div data-category-row-copy="true">
          <div style={styles.l3Name} data-category-row-name="true">
            <span>{name}</span>
            {showCategorySum && <strong data-category-row-amount="true">{formattedSum} zł</strong>}
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
            data-category-icon-action="calendar"
            data-active={isCalendarOpen ? 'true' : 'false'}
            style={styles.secondaryButton}
            aria-label={isCalendarOpen ? 'Zamknij kalendarz' : 'Otwórz kalendarz'}
            title={isCalendarOpen ? 'Zamknij kalendarz' : 'Otwórz kalendarz'}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onToggleCalendar()
            }}
          >
            <Icon name="calendar" />
          </button>
        )}

        {canAddHere && !isSelectedMonthLocked && (
          <button
            type="button"
            data-category-quick-add="true"
            style={styles.primaryButton}
            aria-label={`Dodaj wpis: ${name}`}
            title="Dodaj wpis"
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onInlineAdd()
            }}
          >
            <Icon name="plus" />
          </button>
        )}

        {showCategoryActions && canUseBudgetLimit && onEditBudgetLimit && (
          <button
            type="button"
            data-category-icon-action="limit"
            style={styles.secondaryButton}
            aria-label={budgetLimitView ? 'Edytuj limit' : 'Ustaw limit'}
            title={budgetLimitView ? 'Edytuj limit' : 'Ustaw limit'}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onEditBudgetLimit()
            }}
          >
            <Icon name="limit" />
          </button>
        )}

        {showCategoryActions && (
          <details
            data-mobile-category-menu="true"
            data-floating-dropdown="true"
            onClick={(event) => event.stopPropagation()}
          >
            <summary style={styles.secondaryButton} aria-label={`Menu kategorii ${name}`} title="Menu">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <circle cx="5" cy="12" r="1.8" fill="currentColor" />
                <circle cx="12" cy="12" r="1.8" fill="currentColor" />
                <circle cx="19" cy="12" r="1.8" fill="currentColor" />
              </svg>
            </summary>
            <div data-mobile-category-menu-panel="true">
              {canUseMonthCalendar && (
                <button type="button" style={styles.secondaryButton} onClick={onToggleCalendar}>
                  {isCalendarOpen ? 'Zamknij kalendarz' : 'Otwórz kalendarz'}
                </button>
              )}

              {canUseBudgetLimit && onEditBudgetLimit && (
                <button type="button" style={styles.secondaryButton} onClick={onEditBudgetLimit}>
                  {budgetLimitView ? 'Edytuj limit' : 'Ustaw limit'}
                </button>
              )}

              {isClosingAfterSelectedMonth ? (
                <button style={styles.secondaryButton} onClick={async () => onUndoScheduledHide()}>
                  Cofnij zamknięcie
                </button>
              ) : (
                <>
                  <button style={styles.secondaryButton} onClick={async () => onRenameCategory()}>
                    Zmień nazwę
                  </button>
                  <button style={styles.dangerButton} onClick={async () => onHideNow()}>
                    Ukryj teraz
                  </button>
                  <button style={styles.dangerButton} onClick={async () => onHideNext()}>
                    Ukryj od następnego
                  </button>
                  <button style={styles.dangerButton} onClick={async () => onDeleteCategory()}>
                    Usuń
                  </button>
                </>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
