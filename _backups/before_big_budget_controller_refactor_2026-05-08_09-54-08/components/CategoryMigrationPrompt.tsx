import { CSSProperties } from 'react'
import { MoveTarget, Transaction } from '../lib/budgetPageTypes'

type Props = {
  categoryLabel: string
  modeLabel: string
  transactions: Transaction[]
  moveTargets: MoveTarget[]
  targetCategoryId: string
  errorText: string
  getAmountNumber: (value: unknown) => number
  getTransactionCategoryLabel: (categoryId: string) => string
  onTargetCategoryChange: (value: string) => void
  onConfirm: () => Promise<void>
  onCancel: () => void
  styles: Record<string, CSSProperties>
}

export default function CategoryMigrationPrompt(props: Props) {
  const {
    categoryLabel,
    modeLabel,
    transactions,
    moveTargets,
    targetCategoryId,
    errorText,
    getAmountNumber,
    getTransactionCategoryLabel,
    onTargetCategoryChange,
    onConfirm,
    onCancel,
    styles,
  } = props

  return (
    <div style={styles.topPanel}>
      <div style={styles.sectionTitle}>Przeniesienie wymagane</div>
      <div style={styles.infoBox}>
        Kategoria <b>{categoryLabel}</b> nie może zostać ustawiona na tryb: <b>{modeLabel}</b>,
        dopóki ma wpisy w bieżącym lub przyszłych miesiącach. Najpierw przenieś te wpisy.
      </div>
      <div style={{ ...styles.infoBox, marginTop: 12 }}>
        Wpisy do przeniesienia: <b>{transactions.length}</b>. Po wyborze poprawnej kategorii wpisy
        zostaną przeniesione, a operacja na kategorii będzie kontynuowana.
      </div>
      <div style={{ ...styles.infoBox, marginTop: 12 }}>
        {moveTargets.length === 0
          ? 'Brak wspólnej poprawnej kategorii docelowej dla tych wpisów.'
          : `Dostępne wspólne kategorie docelowe: ${moveTargets.length}.`}
      </div>

      <div style={{ ...styles.transactionsBox, marginTop: 12 }}>
        {transactions.map((transaction) => (
          <div key={transaction.id} style={styles.transactionRow}>
            <div style={styles.transactionLeft}>
              <div style={styles.amountText}>{getAmountNumber(transaction.amount)}</div>
              <div>{transaction.description || '(bez opisu)'}</div>
              <div style={styles.dateText}>data: {transaction.date}</div>
              <div style={styles.dateText}>
                kategoria: {getTransactionCategoryLabel(transaction.category_id)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.formRow}>
        <select
          style={styles.input}
          value={targetCategoryId}
          onChange={(event) => onTargetCategoryChange(event.target.value)}
        >
          <option value="">Wybierz kategorię docelową</option>
          {moveTargets.map((target) => (
            <option key={target.id} value={target.id}>
              {target.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          style={styles.primaryButton}
          disabled={!targetCategoryId || moveTargets.length === 0}
          onClick={async () => {
            await onConfirm()
          }}
        >
          Przenieś wpisy i kontynuuj
        </button>

        <button type="button" style={styles.secondaryButton} onClick={onCancel}>
          Anuluj
        </button>
      </div>

      {moveTargets.length === 0 && (
        <div style={styles.errorBox}>
          Nie znaleziono jednej poprawnej kategorii docelowej dla wszystkich wpisów.
        </div>
      )}

      {errorText && <div style={styles.errorBox}>{errorText}</div>}
    </div>
  )
}
