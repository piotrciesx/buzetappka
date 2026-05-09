import type { CSSProperties } from 'react'
import type { FinancialGoalAllocationMode } from '../../lib/budgetPageTypes'

const modeButtonRowStyle = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap' as const,
  marginTop: 12,
} as const

type FinancialGoalsModeControlsProps = {
  effectiveMode: FinancialGoalAllocationMode
  activeGoalsCount: number
  styles: Record<string, CSSProperties>
  onModeChange: (mode: FinancialGoalAllocationMode) => void
}

export default function FinancialGoalsModeControls({
  effectiveMode,
  activeGoalsCount,
  styles,
  onModeChange,
}: FinancialGoalsModeControlsProps) {
  return (
    <div style={modeButtonRowStyle} data-financial-goals-mode-controls="true">
      <button
        type="button"
        style={effectiveMode === 'priority' ? styles.primaryButton : styles.secondaryButton}
        onClick={() => {
          onModeChange('priority')
        }}
      >
        Tryb priorytet
      </button>
      <button
        type="button"
        style={effectiveMode === 'allocation' ? styles.primaryButton : styles.secondaryButton}
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
