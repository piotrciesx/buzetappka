import { useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { uiListRowApi } from '../../lib/uiFoundation'
import BudgetLimitIndicator, { type BudgetLimitView } from '../BudgetLimitIndicator'
import CategoryIcon from '../CategoryIcon'
import CategoryIconPicker from '../CategoryIconPicker'
import DropdownShell from '../dropdown/DropdownShell'

type Level2SectionHeaderProps = {
  name: string
  iconKey?: string | null
  categorySum: number
  isOpen: boolean
  hasChildren: boolean
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
  onOpenEntries: () => void
  onToggleCalendar: () => void
  onEditBudgetLimit?: () => void
  onInlineAdd: () => void
  onRenameCategory: () => Promise<void>
  onIconChange: (iconKey: string | null) => Promise<void>
  onDeleteCategory: () => Promise<void>
  onAddSubcategory: () => void
  onUndoScheduledHide: () => Promise<void>
  onHideNow: () => Promise<void>
  onHideNext: () => Promise<void>
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

export default function Level2SectionHeader({
  name,
  iconKey,
  categorySum,
  isOpen,
  hasChildren,
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
  onOpenEntries,
  onToggleCalendar,
  onEditBudgetLimit,
  onInlineAdd,
  onRenameCategory,
  onIconChange,
  onDeleteCategory,
  onAddSubcategory,
  onUndoScheduledHide,
  onHideNow,
  onHideNext,
}: Level2SectionHeaderProps) {
  const formattedSum = categorySum.toLocaleString('pl-PL')
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  return (
    <div
      {...headerDragProps}
      className={`${uiListRowApi.classNames.row} ${uiListRowApi.classNames.rowMd} ${headerDragProps?.className ?? ''}`.trim()}
      data-category-drag-row="true"
      data-category-level="2"
      data-category-open={isOpen ? 'true' : 'false'}
      data-row-density={uiListRowApi.density.normal}
      data-row-kind={uiListRowApi.kind.category}
      data-row-state={isDragging ? uiListRowApi.state.dragging : isOpen ? uiListRowApi.state.open : uiListRowApi.state.default}
      style={{
        ...headerDragProps?.style,
        ...styles.l2Header,
        boxShadow: isDragging ? 'var(--ui-shadow-medium)' : styles.l2Header.boxShadow,
      }}
      onClick={() => {
        if (!isDragging) {
          onOpenEntries()
        }
      }}
    >
      <div className={uiListRowApi.classNames.main} style={styles.l2Left} data-category-row-main="true">
        {dragHandle}

        {hasChildren && (
          <button
          type="button"
          style={styles.arrow}
          data-category-toggle-icon="true"
          aria-label={isOpen ? `Zwiń ${name}` : `Rozwiń ${name}`}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            onToggle()
          }}
        >
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
          </button>
        )}

        <div data-category-row-copy="true">
          <div style={styles.l2Name} data-category-row-name="true">
            <CategoryIcon iconKey={iconKey} level={2} />
            <span>{name}</span>
            <strong data-category-row-amount="true">{formattedSum} zł</strong>
          </div>

          {isClosingAfterSelectedMonth && (
            <div style={styles.closingBadge}>zamknie się z końcem tego miesiąca</div>
          )}

          <BudgetLimitIndicator view={budgetLimitView} />
        </div>
      </div>

      <div
        className={uiListRowApi.classNames.actions}
        data-category-actions="true"
        style={styles.actions}
        onClick={(event) => event.stopPropagation()}
      >
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

        {canAddDirectTransaction && !isSelectedMonthLocked && (
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

        {canUseBudgetLimit && onEditBudgetLimit && (
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

        <DropdownShell
          open={isActionsOpen}
          onOpenChange={setIsActionsOpen}
          size="action"
          trigger={(triggerProps) => (
            <button
              type="button"
              style={styles.secondaryButton}
              aria-label={`Menu kategorii ${name}`}
              title="Menu"
              {...triggerProps}
              onClick={(event) => {
                event.stopPropagation()
                triggerProps.onClick(event)
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <circle cx="5" cy="12" r="1.8" fill="currentColor" />
                <circle cx="12" cy="12" r="1.8" fill="currentColor" />
                <circle cx="19" cy="12" r="1.8" fill="currentColor" />
              </svg>
            </button>
          )}
        >
          <button type="button" className="ui-dropdown__item" onClick={onAddSubcategory}>
            Dodaj podkategorię
          </button>

          {canUseMonthCalendar && (
            <button type="button" className="ui-dropdown__item" onClick={onToggleCalendar}>
              {isCalendarOpen ? 'Zamknij kalendarz' : 'Otwórz kalendarz'}
            </button>
          )}

          {canUseBudgetLimit && onEditBudgetLimit && (
            <button type="button" className="ui-dropdown__item" onClick={onEditBudgetLimit}>
              {budgetLimitView ? 'Edytuj limit' : 'Ustaw limit'}
            </button>
          )}

          <CategoryIconPicker value={iconKey} onChange={onIconChange} />

          <button type="button" className="ui-dropdown__item" onClick={onRenameCategory}>
            Zmień nazwę
          </button>

          {isClosingAfterSelectedMonth ? (
            <button type="button" className="ui-dropdown__item" onClick={onUndoScheduledHide}>
              Cofnij zamknięcie
            </button>
          ) : (
            <>
              <button type="button" className="ui-dropdown__item" data-button-tone="danger" onClick={onHideNow}>
                Ukryj teraz
              </button>
              <button type="button" className="ui-dropdown__item" data-button-tone="danger" onClick={onHideNext}>
                Ukryj od następnego
              </button>
            </>
          )}

          <button type="button" className="ui-dropdown__item" data-button-tone="danger" onClick={onDeleteCategory}>
            Usuń
          </button>
        </DropdownShell>
      </div>
    </div>
  )
}
