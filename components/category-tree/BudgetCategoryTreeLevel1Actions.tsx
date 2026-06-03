import { CSSProperties } from 'react'
import BudgetLimitIndicator, { BudgetLimitView } from '../BudgetLimitIndicator'
import { Category } from '../../lib/budgetPageTypes'

type Props = {
  level1Category: Category
  isLevel1CalendarOpen: boolean
  canUseMonthCalendar: boolean
  canUseBudgetLimit: boolean
  budgetLimitView: BudgetLimitView | null
  styles: Record<string, CSSProperties>
  toggleLevel1Calendar: (level1Id: string) => void
  setOpenAddSubcategoryFor: (id: string | null) => void
  setNewSubcategoryName: (value: string) => void
  setNewSubcategoryIconKey: (value: string | null) => void
  onEditBudgetLimit?: (categoryId: string | null) => void
}

export default function BudgetCategoryTreeLevel1Actions({
  level1Category,
  isLevel1CalendarOpen,
  canUseMonthCalendar,
  canUseBudgetLimit,
  budgetLimitView,
  styles,
  toggleLevel1Calendar,
  onEditBudgetLimit,
}: Props) {
  return (
    <>
      {canUseBudgetLimit && budgetLimitView && <BudgetLimitIndicator view={budgetLimitView} />}

      <details
        data-mobile-category-menu="true"
        data-floating-dropdown="true"
        data-dropdown-placement="bottom"
        data-dropdown-align="end"
      >
        <summary style={styles.secondaryButton}>akcje</summary>
        <div
          className="ui-dropdown ui-dropdown--action"
          data-mobile-category-menu-panel="true"
        >
          {canUseMonthCalendar && (
            <button
              type="button"
              className="ui-dropdown__item"
              onClick={(event) => {
                event.stopPropagation()
                toggleLevel1Calendar(level1Category.id)
              }}
            >
              {isLevel1CalendarOpen ? 'Zamknij kalendarz' : 'Kalendarz'}
            </button>
          )}

          {canUseBudgetLimit && onEditBudgetLimit && (
            <button
              type="button"
              className="ui-dropdown__item"
              onClick={(event) => {
                event.stopPropagation()
                onEditBudgetLimit(null)
              }}
            >
              {budgetLimitView ? 'Edytuj limit' : 'Ustaw limit'}
            </button>
          )}
        </div>
      </details>
    </>
  )
}
