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
  totalRemaining: number
}

const formatAmount = (value: number) =>
  new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + ' zł'

const getBalanceDescription = (value: number) => {
  if (value > 0) return 'Bilans dodatni w tym miesiącu'
  if (value < 0) return 'Bilans ujemny w tym miesiącu'
  return 'Bilans neutralny w tym miesiącu'
}

const getSurplusDescription = (value: number) => {
  if (value > 0) return 'Środki dostępne do finansowania celów'
  return 'Brak wolnych środków do alokacji'
}

const getModeLabel = (mode: FinancialGoalAllocationMode) =>
  mode === 'allocation' ? 'Tryb alokacja' : 'Tryb priorytet'

const getModeDescription = (mode: FinancialGoalAllocationMode) =>
  mode === 'allocation'
    ? 'Finansowanie według procentów'
    : 'Wyższe priorytety finansowane jako pierwsze'

export default function FinancialGoalsSummary({
  selectedMonth,
  monthBalance,
  monthSurplus,
  lockedMonthsSet,
  activeGoalsCount,
  effectiveMode,
  totalRemaining,
}: Props) {
  const isMonthLocked = lockedMonthsSet.has(selectedMonth)

  return (
    <div data-financial-goals-summary="true">
      <AuxiliarySummaryStrip columns={4}>
        <AuxiliarySummaryItem
          tone="information-blue"
          icon={<CategoryIcon iconKey="card" size="summary" />}
          label="Bilans miesiąca"
          value={formatAmount(monthBalance)}
          description={getBalanceDescription(monthBalance)}
        />
        <AuxiliarySummaryItem
          tone="information-mint"
          icon={<CategoryIcon iconKey="investments" size="summary" />}
          label="Dostępne dla celów"
          value={formatAmount(monthSurplus)}
          description={getSurplusDescription(monthSurplus)}
        />
        <AuxiliarySummaryItem
          tone="information-indigo"
          icon={<CategoryIcon iconKey="system-goals" size="summary" />}
          label="Aktywne cele"
          value={activeGoalsCount}
          description={`Pozostało łącznie ${formatAmount(totalRemaining)}`}
        />
        <AuxiliarySummaryItem
          tone="information-steel"
          icon={<CategoryIcon iconKey="allocation" size="summary" />}
          label={isMonthLocked ? 'Miesiąc zamknięty' : 'Tryb pracy'}
          value={isMonthLocked ? 'Zamknięty' : getModeLabel(effectiveMode)}
          description={isMonthLocked ? selectedMonth : getModeDescription(effectiveMode)}
        />
      </AuxiliarySummaryStrip>
    </div>
  )
}
