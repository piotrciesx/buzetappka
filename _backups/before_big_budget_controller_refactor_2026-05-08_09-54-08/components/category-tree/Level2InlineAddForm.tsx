import type { CSSProperties } from 'react'

type Level2InlineAddFormProps = {
  value: string
  setValue: (value: string) => void
  onSave: () => Promise<void>
  onCancel: () => void
  styles: Record<string, CSSProperties>
}

export default function Level2InlineAddForm({
  value,
  setValue,
  onSave,
  onCancel,
  styles,
}: Level2InlineAddFormProps) {
  return (
    <div style={styles.formRow}>
      <input
        style={styles.input}
        placeholder="Nazwa podkategorii"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button
        style={styles.primaryButton}
        onClick={async () => {
          await onSave()
        }}
      >
        zapisz
      </button>

      <button style={styles.secondaryButton} onClick={onCancel}>
        anuluj
      </button>
    </div>
  )
}
