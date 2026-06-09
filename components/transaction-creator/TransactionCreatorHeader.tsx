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
        <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
          <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {suggestedCategoryId && (
        <div data-ui-empty-block="true" data-transaction-header-note="true">
          <strong>Sugestia kategorii</strong>
          <span>{getCategoryPathLabel(suggestedCategoryId, categoriesById)}</span>
        </div>
      )}
    </header>
  )
}
