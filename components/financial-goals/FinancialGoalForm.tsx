import { uiInputApi } from '../../lib/uiFoundation'
import type { FormState } from './financialGoalsPanelTypes'

type FinancialGoalFormProps = {
  formState: FormState
  isSaving: boolean
  submitLabel: string
  savingLabel: string
  cancelLabel?: string
  onFormStateChange: (nextFormState: FormState) => void
  onSubmit: () => void
  onCancel?: () => void
}

export default function FinancialGoalForm({
  formState,
  isSaving,
  submitLabel,
  savingLabel,
  cancelLabel = 'Anuluj',
  onFormStateChange,
  onSubmit,
  onCancel,
}: FinancialGoalFormProps) {
  return (
    <div data-ui-section="true" data-financial-goal-form="true">
      <div data-ui-form-card="true" data-financial-goal-form-card="true">
        <div data-financial-goal-form-grid="true">
          <label data-ui-field-wrapper="true">
            <span data-ui-field-label="true">Nazwa celu</span>
            <input
              className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
              placeholder="np. Wycieczka, laptop, poduszka finansowa"
              value={formState.name}
              onChange={(event) => onFormStateChange({ ...formState, name: event.target.value })}
            />
          </label>

          <label data-ui-field-wrapper="true">
            <span data-ui-field-label="true">Kwota docelowa</span>
            <span data-ui-amount-shell="true">
              <input
                className={uiInputApi.classNames.amountField}
                data-input-width={uiInputApi.width.full}
                placeholder="0,00"
                inputMode="decimal"
                value={formState.targetAmount}
                onChange={(event) =>
                  onFormStateChange({ ...formState, targetAmount: event.target.value })
                }
              />
              <span aria-hidden="true">zł</span>
            </span>
          </label>

          <label data-ui-field-wrapper="true">
            <span data-ui-field-label="true">Miesiąc startu</span>
            <input
              className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
              type="month"
              value={formState.startMonth}
              onChange={(event) =>
                onFormStateChange({ ...formState, startMonth: event.target.value })
              }
            />
          </label>

          <label data-ui-field-wrapper="true">
            <span data-ui-field-label="true">Deadline</span>
            <input
              className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
              type="month"
              value={formState.deadlineMonth}
              onChange={(event) =>
                onFormStateChange({ ...formState, deadlineMonth: event.target.value })
              }
            />
          </label>
        </div>

        <div data-ui-empty-block="true" data-financial-goal-form-note="true">
          Cel nie ma osobnego źródła finansowania. Jest rozliczany z nadwyżki budżetu
          zgodnie z trybem ustawionym dla danego miesiąca.
        </div>
      </div>

      <div data-ui-form-actions="true">
        {onCancel && (
          <button type="button" data-ui-button-cancel="true" onClick={onCancel}>
            {cancelLabel}
          </button>
        )}
        <button
          type="button"
          data-ui-button-confirm="true"
          disabled={isSaving || !formState.name.trim() || !formState.targetAmount}
          onClick={onSubmit}
        >
          {isSaving ? savingLabel : submitLabel}
        </button>
      </div>
    </div>
  )
}
