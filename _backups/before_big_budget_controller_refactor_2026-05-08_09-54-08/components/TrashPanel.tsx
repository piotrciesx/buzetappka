import { CSSProperties } from 'react'
import { getCategoryPathLabel } from '../lib/budgetPageHelpers'
import { Category, Transaction } from '../lib/budgetPageTypes'

type Props = {
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  getAmountNumber: (value: unknown) => number
  onRestoreTransaction: (transactionId: string) => Promise<void>
  onPermanentDeleteTransaction: (transactionId: string) => Promise<void>
  onEmptyTrash: () => Promise<void>
  styles: Record<string, CSSProperties>
}

export default function TrashPanel(props: Props) {
  const {
    transactions,
    categoriesById,
    getAmountNumber,
    onRestoreTransaction,
    onPermanentDeleteTransaction,
    onEmptyTrash,
    styles,
  } = props

  return (
    <div style={styles.topPanel}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={styles.sectionTitle}>Kosz</div>

        {transactions.length > 0 && (
          <button
            type="button"
            style={styles.dangerButton}
            onClick={async () => {
              await onEmptyTrash()
            }}
          >
            Opróżnij kosz
          </button>
        )}
      </div>

      <div style={{ ...styles.infoBox, marginBottom: 12 }}>
        {transactions.length === 0
          ? 'Brak usuniętych wpisów.'
          : `Usunięte wpisy: ${transactions.length}. Przywrócenie zwraca wpis do zwykłego widoku.`}
      </div>

      {transactions.length === 0 ? (
        <div style={styles.emptyStateCard}>Kosz jest pusty.</div>
      ) : (
        <div style={styles.transactionsBox}>
          {transactions.map((transaction) => {
            const categoryLabel = categoriesById[transaction.category_id]
              ? getCategoryPathLabel(transaction.category_id, categoriesById)
              : 'Kategoria niedostępna'

            return (
              <div key={transaction.id} style={styles.transactionRow}>
                <div style={styles.transactionLeft}>
                  <div style={styles.amountText}>{getAmountNumber(transaction.amount)}</div>
                  <div>{transaction.description || '(bez opisu)'}</div>
                  <div style={styles.dateText}>data: {transaction.date}</div>
                  <div style={styles.dateText}>kategoria: {categoryLabel}</div>
                  <div style={styles.dateText}>
                    usunięto: {transaction.deleted_at ? transaction.deleted_at.slice(0, 16) : '-'}
                  </div>
                </div>

                <div style={styles.actions}>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={async () => {
                      await onRestoreTransaction(transaction.id)
                    }}
                  >
                    przywróć
                  </button>

                  <button
                    type="button"
                    style={styles.dangerButton}
                    onClick={async () => {
                      await onPermanentDeleteTransaction(transaction.id)
                    }}
                  >
                    usuń na stałe
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
