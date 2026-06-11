import { CSSProperties } from 'react'
import { Category } from './transactionCreatorTypes'
import { getCategoryPathLabel } from './transactionCreatorUtils'
import CategoryIcon from '../CategoryIcon'

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

      <button type="button" data-ui-close-action="true" aria-label="Zamknij kreator wpisu" onClick={onClose}>
        <CategoryIcon iconKey="close" />
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
