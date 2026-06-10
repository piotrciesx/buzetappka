type Props = {
  selectedMonth: string
  monthBalance: number
  monthSurplus: number
  lockedMonthsSet: Set<string>
}

export default function FinancialGoalsSummary({
  selectedMonth,
  monthBalance,
  monthSurplus,
  lockedMonthsSet,
}: Props) {
  return (
    <div data-financial-goals-summary="true">
      <div data-ui-goal-summary-card="true">
        <span>Bilans miesiąca</span>
        <strong>{monthBalance.toFixed(2)} zł</strong>
      </div>
      <div data-ui-goal-summary-card="true">
        <span>Nadwyżka do alokacji</span>
        <strong>{monthSurplus.toFixed(2)} zł</strong>
      </div>
      <div data-ui-goal-summary-card="true">
        <span>Miesiąc</span>
        <strong>{selectedMonth} · {lockedMonthsSet.has(selectedMonth) ? 'zamknięty' : 'otwarty'}</strong>
      </div>
    </div>
  )
}
