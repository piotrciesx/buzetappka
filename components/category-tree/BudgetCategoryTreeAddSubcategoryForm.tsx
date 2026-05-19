import { CSSProperties } from 'react'
import CategoryIconPicker from '../CategoryIconPicker'

type Props = {
  parentId: string
  placeholder: string
  openAddSubcategoryFor: string | null
  newSubcategoryName: string
  newSubcategoryIconKey: string | null
  setOpenAddSubcategoryFor: (id: string | null) => void
  setNewSubcategoryName: (value: string) => void
  setNewSubcategoryIconKey: (value: string | null) => void
  handleAddSubcategory: (level2Id: string, iconKey?: string | null) => Promise<void>
  styles: Record<string, CSSProperties>
}

export default function BudgetCategoryTreeAddSubcategoryForm({
  parentId,
  placeholder,
  openAddSubcategoryFor,
  newSubcategoryName,
  newSubcategoryIconKey,
  setOpenAddSubcategoryFor,
  setNewSubcategoryName,
  setNewSubcategoryIconKey,
  handleAddSubcategory,
  styles,
}: Props) {
  if (openAddSubcategoryFor !== parentId) {
    return null
  }

  return (
    <div style={styles.formRow}>
      <input
        style={styles.input}
        placeholder={placeholder}
        value={newSubcategoryName}
        onChange={(event) => setNewSubcategoryName(event.target.value)}
        onKeyDown={async (event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            setOpenAddSubcategoryFor(null)
            setNewSubcategoryName('')
            setNewSubcategoryIconKey(null)
            return
          }

          if (event.key === 'Enter') {
            event.preventDefault()
            await handleAddSubcategory(parentId, newSubcategoryIconKey)
          }
        }}
      />
      <details data-category-icon-picker-menu="true" data-category-icon-picker-inline="true">
        <summary style={styles.secondaryButton} data-category-icon-picker-trigger="true">
          <span>Ikona</span>
          <strong>{newSubcategoryIconKey ? 'Wybrana' : 'Bez ikony'}</strong>
        </summary>
        <CategoryIconPicker value={newSubcategoryIconKey} onChange={setNewSubcategoryIconKey} />
      </details>
      <button
        type="button"
        style={styles.primaryButton}
        onClick={async () => {
          await handleAddSubcategory(parentId, newSubcategoryIconKey)
        }}
      >
        zapisz
      </button>
      <button
        type="button"
        style={styles.secondaryButton}
        onClick={() => {
          setOpenAddSubcategoryFor(null)
          setNewSubcategoryName('')
          setNewSubcategoryIconKey(null)
        }}
      >
        anuluj
      </button>
    </div>
  )
}
