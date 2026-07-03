import CategoryIcon from '../CategoryIcon'

type Props = {
  selectedMonth: string
  monthBalance: number
  monthSurplus: number
  lockedMonthsSet: Set<string>
}

const formatAmount = (value: number) => `${value.toFixed(2)} zł`

const getBalanceState = (value: number) => {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'zero'
}

const getBalanceStatusLabel = (value: number) => {
  if (value > 0) return 'Bilans dodatni'
  if (value < 0) return 'Bilans ujemny'
  return 'Bilans neutralny'
}

const getSurplusState = (value: number) => {
  if (value > 0) return 'positive'
  return 'negative'
}

const getSurplusStatusLabel = (value: number) => {
  if (value > 0) return 'Środki do alokacji'
  return 'Brak środków do alokacji'
}

const getMonthState = (isLocked: boolean) => isLocked ? 'negative' : 'positive'
const getMonthStatusLabel = (isLocked: boolean) => isLocked ? 'Zamknięty' : 'Otwarty'

export default function FinancialGoalsSummary({
  selectedMonth,
  monthBalance,
  monthSurplus,
  lockedMonthsSet,
}: Props) {
  const isMonthLocked = lockedMonthsSet.has(selectedMonth)
  const surplusState = getSurplusState(monthSurplus)
  const monthState = getMonthState(isMonthLocked)

  return (
    <div data-financial-goals-summary="true" data-ui-summary-grid="true">
      <div data-ui-summary-card="true" data-ui-summary-tone="neutral-blue">
        <span data-ui-summary-icon="true" data-ui-tone="neutral-blue" aria-hidden="true">
          <CategoryIcon iconKey="card" size="summary" />
        </span>
        <div data-ui-summary-copy="true">
          <span>Bilans miesiąca</span>
          <strong data-ui-financial-state={getBalanceState(monthBalance)}>{formatAmount(monthBalance)}</strong>
          <small data-ui-summary-status="true" data-ui-status-tone={getBalanceState(monthBalance)}>
            <span aria-hidden="true" />
            {getBalanceStatusLabel(monthBalance)}
          </small>
        </div>
      </div>

      <div data-ui-summary-card="true" data-ui-summary-tone="neutral-blue">
        <span data-ui-summary-icon="true" data-ui-tone="neutral-blue" aria-hidden="true">
          <CategoryIcon iconKey="investments" size="summary" />
        </span>
        <div data-ui-summary-copy="true">
          <span>Dostępne dla celów</span>
          <strong data-ui-financial-state={surplusState}>{formatAmount(monthSurplus)}</strong>
          <small data-ui-summary-status="true" data-ui-status-tone={surplusState}>
            <span aria-hidden="true" />
            {getSurplusStatusLabel(monthSurplus)}
          </small>
        </div>
      </div>

      <div data-ui-summary-card="true" data-ui-summary-tone="neutral-blue">
        <span data-ui-summary-icon="true" data-ui-tone="neutral-blue" aria-hidden="true">
          <CategoryIcon iconKey="calendar" size="summary" />
        </span>
        <div data-ui-summary-copy="true">
          <span>Miesiąc</span>
          <strong data-ui-financial-state={monthState}>{getMonthStatusLabel(isMonthLocked)}</strong>
          <small data-ui-summary-status="true" data-ui-status-tone={monthState}>
            <span aria-hidden="true" />
            {selectedMonth}
          </small>
        </div>
      </div>
    </div>
  )
}
