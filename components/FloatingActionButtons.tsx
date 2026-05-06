import { CSSProperties } from 'react'

type Props = {
  expenseLevel1Id: string | null
  incomeLevel1Id: string | null
  onOpenExpense: () => void
  onOpenIncome: () => void
  styles: Record<string, CSSProperties>
}

export default function FloatingActionButtons(props: Props) {
  const { expenseLevel1Id, incomeLevel1Id, onOpenExpense, onOpenIncome, styles } = props

  return (
    <div style={styles.floatingActionPanel}>
      <button
        type="button"
        aria-label="Dodaj przychód"
        title="Dodaj przychód"
        style={{
          ...styles.floatingActionButton,
          ...styles.floatingIncomeButton,
          opacity: incomeLevel1Id ? 1 : 0.6,
          cursor: incomeLevel1Id ? 'pointer' : 'not-allowed',
        }}
        disabled={!incomeLevel1Id}
        onClick={onOpenIncome}
      >
        +
      </button>

      <button
        type="button"
        aria-label="Dodaj wydatek"
        title="Dodaj wydatek"
        style={{
          ...styles.floatingActionButton,
          ...styles.floatingExpenseButton,
          opacity: expenseLevel1Id ? 1 : 0.6,
          cursor: expenseLevel1Id ? 'pointer' : 'not-allowed',
        }}
        disabled={!expenseLevel1Id}
        onClick={onOpenExpense}
      >
        −
      </button>
    </div>
  )
}
