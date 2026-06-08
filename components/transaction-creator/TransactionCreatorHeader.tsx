import { CSSProperties } from 'react'
import { Category } from './transactionCreatorTypes'
import { getCategoryPathLabel } from './transactionCreatorUtils'

type Props = {
  selectedMonth: string
  suggestedCategoryId: string | null
  lockedLevel1Id: string | null
  categoriesById: Record<string, Category>
  styles: Record<string, CSSProperties>
  onClose: () => void
}

export default function TransactionCreatorHeader({
  selectedMonth,
  suggestedCategoryId,
  lockedLevel1Id,
  categoriesById,
  onClose,
}: Props) {
  return (
    <header data-ui-modal-header="true" data-transaction-modal-header="true">
      <div data-ui-title-row="true">
        <div data-ui-title-copy="true">
          <strong>Nowy wpis</strong>
          <span>Miesiąc zapisu: {selectedMonth}</span>
        </div>
      </div>

      <button type="button" className="ui-button--icon" aria-label="Zamknij kreator wpisu" onClick={onClose}>
        ×
      </button>

      {suggestedCategoryId && (
        <div data-ui-empty-block="true" data-transaction-header-note="true">
          <strong>Sugestia kategorii</strong>
          <span>{getCategoryPathLabel(suggestedCategoryId, categoriesById)}</span>
        </div>
      )}

      {lockedLevel1Id && (
        <div data-ui-empty-block="true" data-transaction-header-note="true">
          <strong>Typ wpisu</strong>
          <span>{categoriesById[lockedLevel1Id]?.name || ''}</span>
        </div>
      )}
    </header>
  )
}
