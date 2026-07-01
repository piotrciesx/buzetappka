import type { CSSProperties } from 'react'
import CategoryIcon from '../CategoryIcon'
import { CreatorModal, HeroHeader, IconAction } from '../ui/FoundationPrimitives'
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
    <div data-ui-overlay="true" onClick={onClose}>
      <CreatorModal
        size="standard"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <HeroHeader
          variant="creator"
          density="comfort"
          tone={formState.color_tone || 'blue'}
          icon={<CategoryIcon iconKey={formState.icon_key || 'system-goals'} />}
          title={title}
          description={description}
          closeAction={
            <IconAction ariaLabel="Zamknij" onClick={onClose} density="comfort">
              <CategoryIcon iconKey="close" />
            </IconAction>
          }
        />

        <FinancialGoalForm
          formState={formState}
          isSaving={isSaving}
          submitLabel={submitLabel}
          savingLabel="Zapisywanie..."
          onFormStateChange={onFormStateChange}
          onSubmit={onSave}
          onCancel={onClose}
        />
      </CreatorModal>
    </div>
  )
}
