import type { CSSProperties } from 'react'
import { uiButtonApi, uiInputApi } from '../../lib/uiFoundation'
import CategoryIconPicker from '../CategoryIconPicker'

type Level2InlineAddFormProps = {
  value: string
  setValue: (value: string) => void
  iconValue: string | null
  setIconValue: (value: string | null) => void
  onSave: () => Promise<void>
  onCancel: () => void
  styles: Record<string, CSSProperties>
}

export default function Level2InlineAddForm({
  value,
  setValue,
  iconValue,
  setIconValue,
  onSave,
  onCancel,
  styles,
}: Level2InlineAddFormProps) {
  return (
    <div style={styles.formRow}>
      <input
        className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
        data-input-width={uiInputApi.width.full}
        placeholder="Nazwa podkategorii"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={async (event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            onCancel()
            return
          }

          if (event.key === 'Enter') {
            event.preventDefault()
            await onSave()
          }
        }}
      />

      <details data-category-icon-picker-menu="true" data-category-icon-picker-inline="true">
        <summary
          className={uiButtonApi.classNames.utility}
          style={styles.secondaryButton}
          data-category-icon-picker-trigger="true"
        >
          <span>Ikona</span>
          <strong>{iconValue ? 'Wybrana' : 'Bez ikony'}</strong>
        </summary>
        <CategoryIconPicker value={iconValue} onChange={setIconValue} />
      </details>

      <button
        type="button"
        className={uiButtonApi.classNames.standard}
        style={styles.primaryButton}
        onClick={async () => {
          await onSave()
        }}
      >
        zapisz
      </button>

      <button
        type="button"
        className={uiButtonApi.classNames.utility}
        style={styles.secondaryButton}
        onClick={onCancel}
      >
        anuluj
      </button>
    </div>
  )
}
