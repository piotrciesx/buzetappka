import type { CSSProperties } from 'react'
import CategoryIcon from '../CategoryIcon'
import FinancialGoalForm from './FinancialGoalForm'
import type { FormState } from './financialGoalsPanelTypes'

type FinancialGoalEditModalProps = {
  title?: string
  description?: string
  submitLabel?: string
  formState: FormState
  isSaving: boolean
  styles: Record<string, CSSProperties>
  onFormStateChange: (nextFormState: FormState) => void
  onSave: () => void
  onClose: () => void
}

export default function FinancialGoalEditModal({
  title = 'Edytuj cel',
  description = 'Zmień dane celu finansowego. Zmiany kwoty albo miesiąca startu mogą przeliczyć historię celów.',
  submitLabel = 'Zapisz zmiany',
  formState,
  isSaving,
  styles: _styles,
  onFormStateChange,
  onSave,
  onClose,
}: FinancialGoalEditModalProps) {
  void _styles

  return (
    <div data-ui-overlay="true" data-financial-goal-modal-overlay="true" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-ui-modal-shell="true"
        data-ui-size="goal"
        data-financial-goal-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header data-ui-modal-header="true" data-budget-utility-header="true">
          <div data-ui-title-row="true">
            <span data-ui-title-icon="true" aria-hidden="true">
              <CategoryIcon iconKey="system-goals" />
            </span>
            <div data-ui-title-copy="true">
              <strong>{title}</strong>
              <span>{description}</span>
            </div>
          </div>

          <button type="button" data-ui-close-action="true" aria-label="Zamknij" onClick={onClose}>
            <CategoryIcon iconKey="close" />
          </button>
        </header>

        <FinancialGoalForm
          formState={formState}
          isSaving={isSaving}
          submitLabel={submitLabel}
          savingLabel="Zapisywanie..."
          onFormStateChange={onFormStateChange}
          onSubmit={onSave}
          onCancel={onClose}
        />
      </section>
    </div>
  )
}
