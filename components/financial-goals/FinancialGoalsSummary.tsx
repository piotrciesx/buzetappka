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
  return (
    <div data-financial-goals-summary="true" data-ui-summary-grid="true">
      <div data-ui-summary-card="true" data-ui-summary-tone="neutral-accent-1">
        <span data-ui-summary-icon="true" data-ui-tone="neutral-accent-1" aria-hidden="true">
          <CategoryIcon iconKey="card" size="summary" />
        </span>
        <div data-ui-summary-copy="true">
          <span>Bilans miesiąca</span>
          <strong>{formatAmount(monthBalance)}</strong>
        </div>
      </div>

      <div data-ui-summary-card="true" data-ui-summary-tone="neutral-accent-2">
        <span data-ui-summary-icon="true" data-ui-tone="neutral-accent-2" aria-hidden="true">
          <CategoryIcon iconKey="investments" size="summary" />
        </span>
        <div data-ui-summary-copy="true">
          <span>Dostępne dla celów</span>
          <strong>{formatAmount(monthSurplus)}</strong>
        </div>
      </div>

      <div data-ui-summary-card="true" data-ui-summary-tone="neutral-accent-3">
        <span data-ui-summary-icon="true" data-ui-tone="neutral-accent-3" aria-hidden="true">
          <CategoryIcon iconKey="calendar" size="summary" />
        </span>
        <div data-ui-summary-copy="true">
          <span>Miesiąc</span>
          <strong>{selectedMonth} · {lockedMonthsSet.has(selectedMonth) ? 'zamknięty' : 'otwarty'}</strong>
        </div>
      </div>
    </div>
  )
}
