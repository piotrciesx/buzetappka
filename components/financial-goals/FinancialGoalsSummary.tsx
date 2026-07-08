import CategoryIcon from '../CategoryIcon'
import { AuxiliarySummaryItem, AuxiliarySummaryStrip } from '../ui/FoundationPrimitives'
import type { FinancialGoalAllocationMode } from '../../lib/budgetPageTypes'

type Props = {
  selectedMonth: string
  monthBalance: number
  monthSurplus: number
  lockedMonthsSet: Set<string>
  activeGoalsCount: number
  effectiveMode: FinancialGoalAllocationMode
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

const getModeLabel = (mode: FinancialGoalAllocationMode) =>
  mode === 'allocation' ? 'Tryb alokacji' : 'Tryb priorytet'

const getModeDescription = (mode: FinancialGoalAllocationMode) =>
  mode === 'allocation'
    ? 'Podział według procentów'
    : 'Wyższe priorytety pierwsze'

export default function FinancialGoalsSummary({
  selectedMonth,
  monthBalance,
  monthSurplus,
  lockedMonthsSet,
  activeGoalsCount,
  effectiveMode,
}: Props) {
  const isMonthLocked = lockedMonthsSet.has(selectedMonth)
  const balanceState = getBalanceState(monthBalance)
  const surplusState = getSurplusState(monthSurplus)

  return (
    <AuxiliarySummaryStrip data-financial-goals-summary="true" columns={4}>
      <AuxiliarySummaryItem
        tone="neutral-blue"
        icon={<CategoryIcon iconKey="card" size="summary" />}
        label="Bilans miesiąca"
        value={<span data-ui-financial-state={balanceState}>{formatAmount(monthBalance)}</span>}
        description={getBalanceStatusLabel(monthBalance)}
      />
      <AuxiliarySummaryItem
        tone="information-indigo"
        icon={<CategoryIcon iconKey="investments" size="summary" />}
        label="Dostępne dla celów"
        value={<span data-ui-financial-state={surplusState}>{formatAmount(monthSurplus)}</span>}
        description={getSurplusStatusLabel(monthSurplus)}
      />
      <AuxiliarySummaryItem
        tone="information-cyan"
        icon={<CategoryIcon iconKey="goals" size="summary" />}
        label="Aktywne cele"
        value={activeGoalsCount}
        description={activeGoalsCount === 1 ? '1 aktywny cel' : `${activeGoalsCount} aktywnych celów`}
      />
      <AuxiliarySummaryItem
        tone="information-blue"
        icon={<CategoryIcon iconKey="settings" size="summary" />}
        label="Tryb pracy"
        value={getModeLabel(effectiveMode)}
        description={`${getModeDescription(effectiveMode)} · ${isMonthLocked ? 'miesiąc zamknięty' : selectedMonth}`}
      />
    </AuxiliarySummaryStrip>
  )
}
