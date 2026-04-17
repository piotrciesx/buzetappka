import { CSSProperties } from 'react'

type Props = {
  selectedMonth: string
  status: string
  categoriesCount: number
  visibleCategoriesCount: number
  transactionsCount: number
  hiddenCategoriesCount: number
  showHiddenCategories: boolean
  errorText: string
  onPrevMonth: () => void
  onNextMonth: () => void
  onToggleHidden: () => void
  styles: Record<string, CSSProperties>
}

export default function BudgetHeaderPanel(props: Props) {
  const {
    selectedMonth,
    status,
    categoriesCount,
    visibleCategoriesCount,
    transactionsCount,
    hiddenCategoriesCount,
    showHiddenCategories,
    errorText,
    onPrevMonth,
    onNextMonth,
    onToggleHidden,
    styles,
  } = props

  return (
    <div style={styles.topPanel}>
      <div style={styles.monthBar}>
        <button onClick={onPrevMonth} style={styles.secondaryButton}>
          ← Poprzedni miesiąc
        </button>

        <div style={styles.monthLabel}>{selectedMonth}</div>

        <button onClick={onNextMonth} style={styles.secondaryButton}>
          Następny miesiąc →
        </button>

        <button onClick={onToggleHidden} style={styles.secondaryButton}>
          {showHiddenCategories ? 'Ukryj ukryte' : 'Pokaż ukryte'}
        </button>
      </div>

      <div style={styles.infoRow}>
        <div style={styles.infoBox}>
          <b>Status:</b> {status}
        </div>

        <div style={styles.infoBox}>
          <b>Liczba kategorii w bazie:</b> {categoriesCount}
        </div>

        <div style={styles.infoBox}>
          <b>Liczba widocznych kategorii:</b> {visibleCategoriesCount}
        </div>

        <div style={styles.infoBox}>
          <b>Liczba wpisów:</b> {transactionsCount}
        </div>

        <div style={styles.infoBox}>
          <b>Ukryte w tym miesiącu:</b> {hiddenCategoriesCount}
        </div>
      </div>

      {errorText && (
        <div style={styles.errorBox}>
          <b>Błąd:</b> {errorText}
        </div>
      )}
    </div>
  )
}
