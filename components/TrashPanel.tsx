import { CSSProperties } from 'react'
import { getCategoryPathLabel } from '../lib/budgetPageHelpers'
import { Category, Transaction } from '../lib/budgetPageTypes'

type Props = {
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  getAmountNumber: (value: unknown) => number
  onRestoreTransaction: (transactionId: string) => Promise<void>
  styles: Record<string, CSSProperties>
}

export default function TrashPanel(props: Props) {
  const { transactions, categoriesById, getAmountNumber, onRestoreTransaction, styles } = props

  return (
    <div style={styles.topPanel}>
      <div style={styles.sectionTitle}>Kosz</div>
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
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
