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
  const surplusTone = monthSurplus > 0 ? 'success' : 'danger'

  return (
    <div data-financial-goals-summary="true">
      <div data-ui-goal-summary-card="true" data-ui-summary-tone="neutral">
        <span data-ui-goal-summary-icon="true" data-ui-tone="blue" aria-hidden="true">
          <CategoryIcon iconKey="card" size="summary" />
        </span>
        <div data-ui-goal-summary-copy="true">
          <span>Bilans miesiąca</span>
          <strong>{formatAmount(monthBalance)}</strong>
        </div>
      </div>

      <div data-ui-goal-summary-card="true" data-ui-summary-tone={surplusTone}>
        <span data-ui-goal-summary-icon="true" data-ui-tone="green" aria-hidden="true">
          <CategoryIcon iconKey="investments" size="summary" />
        </span>
        <div data-ui-goal-summary-copy="true">
          <span>Dostępne dla celów</span>
          <strong>{formatAmount(monthSurplus)}</strong>
        </div>
      </div>

      <div data-ui-goal-summary-card="true" data-ui-summary-tone="neutral">
        <span data-ui-goal-summary-icon="true" data-ui-tone="yellow" aria-hidden="true">
          <CategoryIcon iconKey="calendar" size="summary" />
        </span>
        <div data-ui-goal-summary-copy="true">
          <span>Miesiąc</span>
          <strong>{selectedMonth} · {lockedMonthsSet.has(selectedMonth) ? 'zamknięty' : 'otwarty'}</strong>
        </div>
      </div>
    </div>
  )
}
