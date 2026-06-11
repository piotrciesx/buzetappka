import { uiInputApi } from '../../lib/uiFoundation'
import type { FormState } from './financialGoalsPanelTypes'

type FinancialGoalFormProps = {
  formState: FormState
  isSaving: boolean
  submitLabel: string
  savingLabel: string
  onFormStateChange: (nextFormState: FormState) => void
  onSubmit: () => void
}

export default function FinancialGoalForm({
  formState,
  isSaving,
  submitLabel,
  savingLabel,
  onFormStateChange,
  onSubmit,
}: FinancialGoalFormProps) {
  return (
    <div data-ui-section="true" data-ui-inline-form="true" data-financial-goal-form="true">
      <div data-ui-inline-form-intro="true">
        <span data-ui-inline-form-add-icon="true" aria-hidden="true">+</span>
        <strong>Dodaj nowy cel</strong>
      </div>

      <input
        className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
        data-input-width={uiInputApi.width.full}
        placeholder="Nazwa celu"
        value={formState.name}
        onChange={(event) => onFormStateChange({ ...formState, name: event.target.value })}
      />

      <span data-ui-amount-shell="true">
        <input
          className={uiInputApi.classNames.amountField}
          data-input-width={uiInputApi.width.full}
          placeholder="Kwota docelowa"
          inputMode="decimal"
          value={formState.targetAmount}
          onChange={(event) =>
            onFormStateChange({ ...formState, targetAmount: event.target.value })
          }
        />
        <span aria-hidden="true">zł</span>
      </span>

      <input
        className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
        data-input-width={uiInputApi.width.full}
        type="month"
        value={formState.deadlineMonth}
        onChange={(event) =>
          onFormStateChange({ ...formState, deadlineMonth: event.target.value })
        }
      />

      <button
        type="button"
        className="ui-button--standard"
        disabled={isSaving || !formState.name.trim() || !formState.targetAmount}
        onClick={onSubmit}
      >
        {isSaving ? savingLabel : submitLabel}
      </button>
    </div>
  )
}
