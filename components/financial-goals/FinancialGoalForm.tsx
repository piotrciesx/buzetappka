import type { CSSProperties } from 'react'
import type { FormState } from './financialGoalsPanelTypes'

type FinancialGoalFormProps = {
  formState: FormState
  isSaving: boolean
  styles: Record<string, CSSProperties>
  submitLabel: string
  savingLabel: string
  onFormStateChange: (nextFormState: FormState) => void
  onSubmit: () => void
}

export default function FinancialGoalForm({
  formState,
  isSaving,
  styles,
  submitLabel,
  savingLabel,
  onFormStateChange,
  onSubmit,
}: FinancialGoalFormProps) {
  return (
    <div
      style={{ ...styles.formRow, alignItems: 'flex-start', marginTop: 14 }}
      data-financial-goal-form="true"
    >
      <input
        style={styles.input}
        placeholder="Nazwa celu"
        value={formState.name}
        onChange={(event) => onFormStateChange({ ...formState, name: event.target.value })}
      />

      <input
        style={styles.smallInput}
        placeholder="Kwota docelowa"
        inputMode="decimal"
        value={formState.targetAmount}
        onChange={(event) =>
          onFormStateChange({ ...formState, targetAmount: event.target.value })
        }
      />

      <input
        style={styles.input}
        type="month"
        value={formState.deadlineMonth}
        onChange={(event) =>
          onFormStateChange({ ...formState, deadlineMonth: event.target.value })
        }
      />

      <div style={{ ...styles.infoBox, minWidth: 180 }}>
        <b>Start:</b> {formState.startMonth}
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.primaryButton}
          disabled={isSaving || !formState.name.trim() || !formState.targetAmount}
          onClick={onSubmit}
        >
          {isSaving ? savingLabel : submitLabel}
        </button>
      </div>
    </div>
  )
}
