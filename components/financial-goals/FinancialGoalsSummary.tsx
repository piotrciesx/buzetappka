import CategoryIcon from '../CategoryIcon'

type Props = {
  selectedMonth: string
  monthBalance: number
  monthSurplus: number
  lockedMonthsSet: Set<string>
}

const formatAmount = (value: number) => `${value.toFixed(2)} zł`

export default function FinancialGoalsSummary({
  selectedMonth,
  monthBalance,
  monthSurplus,
  lockedMonthsSet,
}: Props) {
  const hasSurplus = monthSurplus > 0

  return (
    <div data-financial-goals-summary="true">
      <div data-ui-goal-summary-card="true" data-ui-tone="navy" data-summary-kind="balance">
        <span data-ui-goal-summary-icon="true" aria-hidden="true">
          <CategoryIcon iconKey="cash" size="summary" />
        </span>
        <span data-ui-goal-summary-copy="true">
          <span>Bilans miesiąca</span>
          <strong>{formatAmount(monthBalance)}</strong>
        </span>
      </div>

      <div
        data-ui-goal-summary-card="true"
        data-ui-tone={hasSurplus ? 'green' : 'red'}
        data-summary-kind="surplus"
        data-value-state={hasSurplus ? 'positive' : 'empty'}
        title="Dodatnia część bilansu, którą system może rozdzielić między aktywne cele."
      >
        <span data-ui-goal-summary-icon="true" aria-hidden="true">
          <CategoryIcon iconKey="investments" size="summary" />
        </span>
        <span data-ui-goal-summary-copy="true">
          <span>Dostępne dla celów</span>
          <strong>{formatAmount(monthSurplus)}</strong>
        </span>
      </div>

      <div data-ui-goal-summary-card="true" data-ui-tone="gold" data-summary-kind="month">
        <span data-ui-goal-summary-icon="true" aria-hidden="true">
          <CategoryIcon iconKey="calendar" size="summary" />
        </span>
        <span data-ui-goal-summary-copy="true">
          <span>Miesiąc</span>
          <strong>{selectedMonth} · {lockedMonthsSet.has(selectedMonth) ? 'zamknięty' : 'otwarty'}</strong>
        </span>
      </div>
    </div>
  )
}
