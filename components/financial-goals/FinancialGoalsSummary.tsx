import { CSSProperties } from 'react'

type Props = {
  selectedMonth: string
  monthBalance: number
  monthSurplus: number
  lockedMonthsSet: Set<string>
  styles: Record<string, CSSProperties>
}

export default function FinancialGoalsSummary({
  selectedMonth,
  monthBalance,
  monthSurplus,
  lockedMonthsSet,
  styles,
}: Props) {
  return (
    <div style={styles.infoRow} data-financial-goals-summary="true">
      <div style={styles.infoBox}>
        <b>Bilans miesiąca:</b> {monthBalance.toFixed(2)} zł
      </div>
      <div style={styles.infoBox}>
        <b>Nadwyżka do alokacji:</b> {monthSurplus.toFixed(2)} zł
      </div>
      <div style={styles.infoBox}>
        <b>Miesiąc:</b> {selectedMonth} {lockedMonthsSet.has(selectedMonth) ? '• zamknięty' : '• otwarty'}
      </div>
    </div>
  )
}
