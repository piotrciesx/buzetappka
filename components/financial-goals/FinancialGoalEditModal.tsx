import type { CSSProperties } from 'react'
import type { FormState } from './financialGoalsPanelTypes'

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(15, 23, 42, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
} as const

const modalStyle = {
  width: '100%',
  maxWidth: 720,
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #e5e7eb',
  boxShadow: '0 20px 40px rgba(0,0,0,0.16)',
  padding: 20,
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
              style={styles.input}
              value={formState.name}
              onChange={(event) => onFormStateChange({ ...formState, name: event.target.value })}
            />
          </div>

          <div>
            <label style={styles.sortLabel}>Kwota docelowa</label>
            <input
              style={styles.input}
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
              style={styles.input}
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
