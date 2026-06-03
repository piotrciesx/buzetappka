import type { CSSProperties } from 'react'
import { uiInputApi, uiOverlayPrimitives, uiSurfacePrimitives } from '../../lib/uiFoundation'
import type { FormState } from './financialGoalsPanelTypes'

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: uiOverlayPrimitives.modalBase.layer,
  background: 'var(--ui-overlay-backdrop-strong)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: uiOverlayPrimitives.modalBase.padding,
} as const

const modalStyle = {
  width: '100%',
  maxWidth: 720,
  background: uiSurfacePrimitives.modalSurfaceNeutral.background,
  borderRadius: uiSurfacePrimitives.modalSurfaceNeutral.radius,
  border: uiSurfacePrimitives.modalSurfaceNeutral.border,
  boxShadow: uiSurfacePrimitives.modalSurfaceNeutral.shadow,
  padding: uiSurfacePrimitives.modalSurfaceNeutral.padding,
} as const

type FinancialGoalEditModalProps = {
  formState: FormState
  isSaving: boolean
  styles: Record<string, CSSProperties>
  onFormStateChange: (nextFormState: FormState) => void
  onSave: () => void
  onClose: () => void
}

export default function FinancialGoalEditModal({
  formState,
  isSaving,
  styles,
  onFormStateChange,
  onSave,
  onClose,
}: FinancialGoalEditModalProps) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div style={styles.sectionTitle}>Edytuj cel</div>
        <div style={{ ...styles.pageSubtitle, marginBottom: 16 }}>
          Możesz zmienić nazwę, kwotę docelową i deadline bez ręcznego przenoszenia celu między
          listami.
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={styles.sortLabel}>Nazwa</label>
            <input
              className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
              value={formState.name}
              onChange={(event) => onFormStateChange({ ...formState, name: event.target.value })}
            />
          </div>

          <div>
            <label style={styles.sortLabel}>Kwota docelowa</label>
            <input
              className={uiInputApi.classNames.amountField}
              data-input-width={uiInputApi.width.full}
              inputMode="decimal"
              value={formState.targetAmount}
              onChange={(event) =>
                onFormStateChange({ ...formState, targetAmount: event.target.value })
              }
            />
          </div>

          <div>
            <label style={styles.sortLabel}>Deadline</label>
            <input
              className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
              type="month"
              value={formState.deadlineMonth}
              onChange={(event) =>
                onFormStateChange({ ...formState, deadlineMonth: event.target.value })
              }
            />
          </div>
        </div>

        <div style={{ ...styles.actions, marginTop: 16 }}>
          <button
            type="button"
            style={styles.primaryButton}
            disabled={isSaving || !formState.name.trim() || !formState.targetAmount}
            onClick={onSave}
          >
            {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
          <button type="button" style={styles.secondaryButton} onClick={onClose}>
            Zamknij
          </button>
        </div>
      </div>
    </div>
  )
}
