import type { FinancialGoalAllocationMode } from '../../lib/budgetPageTypes'

type FinancialGoalsModeControlsProps = {
  effectiveMode: FinancialGoalAllocationMode
  activeGoalsCount: number
  onModeChange: (mode: FinancialGoalAllocationMode) => void
}

export default function FinancialGoalsModeControls({
  effectiveMode,
  activeGoalsCount,
  onModeChange,
}: FinancialGoalsModeControlsProps) {
  return (
    <div data-ui-list-switch="true" data-financial-goals-mode-controls="true" role="group" aria-label="Tryb rozliczania celów">
      <button
        type="button"
        data-active={effectiveMode === 'priority' ? 'true' : 'false'}
        onClick={() => {
          onModeChange('priority')
        }}
      >
        Tryb priorytet
      </button>
      <button
        type="button"
        data-active={effectiveMode === 'allocation' ? 'true' : 'false'}
        disabled={activeGoalsCount === 0}
        onClick={() => {
          onModeChange('allocation')
        }}
      >
        Tryb alokacja
      </button>
    </div>
  )
}
