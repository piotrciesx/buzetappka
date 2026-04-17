import { CSSProperties } from 'react'
import { MoveTarget } from '../lib/budgetPageTypes'

type Props = {
  selectedCount: number
  targetCategoryId: string
  moveTargets: MoveTarget[]
  errorText: string
  onTargetCategoryChange: (value: string) => void
  onDeleteSelected: () => Promise<void>
  onMoveSelected: () => Promise<void>
  onClearSelection: () => void
  styles: Record<string, CSSProperties>
}

export default function BulkActionsBar(props: Props) {
  const {
    selectedCount,
    targetCategoryId,
    moveTargets,
    errorText,
    onTargetCategoryChange,
    onDeleteSelected,
    onMoveSelected,
    onClearSelection,
    styles,
  } = props

  if (selectedCount === 0) {
    return null
  }

  return (
    <div style={styles.topPanel}>
      <div style={styles.sectionTitle}>Zaznaczone wpisy</div>
      <div style={{ ...styles.infoBox, marginBottom: 12 }}>
        Zaznaczono: <b>{selectedCount}</b>
      </div>
      <div style={{ ...styles.infoBox, marginBottom: 12 }}>
        {moveTargets.length === 0
          ? 'Brak wspólnej poprawnej kategorii docelowej dla zaznaczonych wpisów.'
          : `Wspólne kategorie docelowe: ${moveTargets.length}.`}
      </div>

      <div style={styles.formRow}>
        <button
          type="button"
          style={styles.dangerButton}
          onClick={async () => {
            await onDeleteSelected()
          }}
        >
          Usuń zaznaczone
        </button>

        <select
          style={styles.input}
          value={targetCategoryId}
          onChange={(event) => onTargetCategoryChange(event.target.value)}
        >
          <option value="">Wybierz kategorię docelową</option>
          {moveTargets.map((target) => (
            <option key={target.id} value={target.id}>
              {target.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          style={styles.primaryButton}
          disabled={!targetCategoryId || moveTargets.length === 0}
          onClick={async () => {
            await onMoveSelected()
          }}
        >
          Przenieś zaznaczone
        </button>

        <button type="button" style={styles.secondaryButton} onClick={onClearSelection}>
          Wyczyść zaznaczenie
        </button>
      </div>

      {moveTargets.length === 0 && (
        <div style={styles.errorBox}>
          Brak jednej poprawnej kategorii docelowej dla wszystkich zaznaczonych wpisów.
        </div>
      )}

      {errorText && <div style={styles.errorBox}>{errorText}</div>}
    </div>
  )
}
