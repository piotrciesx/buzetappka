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
  styles,
  onClose,
}: Props) {
  return (
    <>
      <div style={styles.sectionTitle} data-transaction-modal-title="true">
        <span>Nowy wpis</span>
        <button
          type="button"
          data-transaction-close-action="true"
          aria-label="Zamknij kreator wpisu"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div style={styles.pageSubtitle}>
        Miesiąc zapisu: <b>{selectedMonth}</b>
      </div>

      {suggestedCategoryId && (
        <div style={styles.infoBox}>
          <b>Sugestia kategorii:</b> {getCategoryPathLabel(suggestedCategoryId, categoriesById)}
        </div>
      )}

      {lockedLevel1Id && (
        <div style={styles.infoBox}>
          <b>Typ wpisu:</b> {categoriesById[lockedLevel1Id]?.name || ''}
        </div>
      )}
    </>
  )
}
