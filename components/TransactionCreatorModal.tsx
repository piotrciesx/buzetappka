'use client'

import { CSSProperties, RefObject } from 'react'

type Category = {
  id: string
  name: string
  parent_id: string | null
  level: number
  default_order?: number | null
  sort_order?: number | null
  active_to?: string | null
  reactivate_from?: string | null
}

type TransactionShortcut = {
  id: string
  label: string
}

type Props = {
  isOpen: boolean
  selectedMonth: string
  level1Categories: Category[]
  level2ByParentId: Record<string, Category[]>
  level3ByParentId: Record<string, Category[]>
  categoriesById: Record<string, Category>
  suggestedCategoryId: string | null
  lockedLevel1Id: string | null
  topShortcutCategories: TransactionShortcut[]
  recentShortcutCategories: TransactionShortcut[]
  onSelectShortcutCategory: (categoryId: string) => void
  selectedLevel1Id: string | null
  setSelectedLevel1Id: (value: string | null) => void
  selectedLevel2Id: string | null
  setSelectedLevel2Id: (value: string | null) => void
  selectedCategoryId: string | null
  setSelectedCategoryId: (value: string | null) => void
  isSerialModeEnabled: boolean
  setIsSerialModeEnabled: (value: boolean) => void
  amount: string
  setAmount: (value: string) => void
  description: string
  setDescription: (value: string) => void
  isSaving: boolean
  onClose: () => void
  onSave: () => Promise<void>
  onSaveAndClose: () => Promise<void>
  amountInputRef: RefObject<HTMLInputElement | null>
  descriptionInputRef: RefObject<HTMLInputElement | null>
  styles: Record<string, CSSProperties>
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(17, 24, 39, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 1000,
} as const

const modalStyle = {
  width: '100%',
  maxWidth: 760,
  maxHeight: '85vh',
  overflowY: 'auto' as const,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
} as const

const sectionStyle = {
  marginTop: 16,
  paddingTop: 16,
  borderTop: '1px solid #e5e7eb',
} as const

const treeLevel2WrapStyle = {
  marginTop: 12,
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
} as const

const treeLevel3WrapStyle = {
  marginTop: 12,
  padding: 12,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  background: '#f9fafb',
} as const

const treeLevel3ButtonsStyle = {
  marginTop: 10,
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
} as const

const shortcutListStyle = {
  marginTop: 10,
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
} as const

const shortcutButtonStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
  gap: 4,
  minWidth: 220,
} as const

const disabledLevel3WrapStyle = {
  ...treeLevel3WrapStyle,
  opacity: 0.55,
  background: '#f3f4f6',
  borderStyle: 'dashed' as const,
} as const

const serialToggleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 12,
  fontSize: 14,
  fontWeight: 600,
  color: '#374151',
} as const

const getCategoryPathLabel = (
  categoryId: string,
  categoriesById: Record<string, Category>
) => {
  const category = categoriesById[categoryId]

  if (!category) {
    return ''
  }

  const parts = [category.name]
  let currentParentId = category.parent_id

  while (currentParentId) {
    const parent = categoriesById[currentParentId]

    if (!parent) {
      break
    }

    parts.unshift(parent.name)
    currentParentId = parent.parent_id
  }

  return parts.join(' > ')
}

const normalizeAmountInput = (value: string) => {
  return value.replace(',', '.')
}

export default function TransactionCreatorModal(props: Props) {
  const {
    isOpen,
    selectedMonth,
    level1Categories,
    level2ByParentId,
    level3ByParentId,
    categoriesById,
    suggestedCategoryId,
    lockedLevel1Id,
    topShortcutCategories,
    recentShortcutCategories,
    onSelectShortcutCategory,
    selectedLevel1Id,
    setSelectedLevel1Id,
    selectedLevel2Id,
    setSelectedLevel2Id,
    selectedCategoryId,
    setSelectedCategoryId,
    isSerialModeEnabled,
    setIsSerialModeEnabled,
    amount,
    setAmount,
    description,
    setDescription,
    isSaving,
    onClose,
    onSave,
    onSaveAndClose,
    amountInputRef,
    descriptionInputRef,
    styles,
  } = props

  if (!isOpen) {
    return null
  }

  const availableLevel2Categories = selectedLevel1Id
    ? level2ByParentId[selectedLevel1Id] || []
    : []

  const availableLevel3Categories = selectedLevel2Id
    ? level3ByParentId[selectedLevel2Id] || []
    : []

  const allVisibleFinalCategories = Object.values(level3ByParentId).flat()
  const duplicateFinalCategoryNames = allVisibleFinalCategories.reduce<Record<string, number>>(
    (acc, category) => {
      acc[category.name] = (acc[category.name] || 0) + 1
      return acc
    },
    {}
  )

  const getLevel3ButtonLabel = (category: Category) => {
    if ((duplicateFinalCategoryNames[category.name] || 0) > 1) {
      return getCategoryPathLabel(category.id, categoriesById)
    }

    return category.name
  }

  const handleShortcutClick = (categoryId: string) => {
    onSelectShortcutCategory(categoryId)

    window.setTimeout(() => {
      amountInputRef.current?.focus()
    }, 0)
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div style={styles.sectionTitle}>Nowy wpis</div>

        <div style={styles.pageSubtitle}>
          Miesiąc zapisu: <b>{selectedMonth}</b>
        </div>

        {suggestedCategoryId && (
          <div style={styles.infoBox}>
            <b>Sugestia kategorii:</b> {getCategoryPathLabel(suggestedCategoryId, categoriesById)}
          </div>
        )}

        {lockedLevel1Id && (
          <div style={styles.infoBox}>
            <b>Typ wpisu:</b> {categoriesById[lockedLevel1Id]?.name || ''}
          </div>
        )}

        {topShortcutCategories.length > 0 && (
          <div style={sectionStyle}>
            <div style={styles.l2Name}>Szybkie kategorie</div>

            <div style={shortcutListStyle}>
              {topShortcutCategories.map((shortcut) => {
                const isSelected = selectedCategoryId === shortcut.id

                return (
                  <button
                    key={shortcut.id}
                    style={{
                      ...(isSelected ? styles.primaryButton : styles.secondaryButton),
                      ...shortcutButtonStyle,
                    }}
                    onClick={() => {
                      handleShortcutClick(shortcut.id)
                    }}
                  >
                    <span>najczęstsze</span>
                    <span>{shortcut.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {recentShortcutCategories.length > 0 && (
          <div style={sectionStyle}>
            <div style={styles.l2Name}>Ostatnio używane</div>

            <div style={shortcutListStyle}>
              {recentShortcutCategories.map((shortcut) => {
                const isSelected = selectedCategoryId === shortcut.id

                return (
                  <button
                    key={shortcut.id}
                    style={{
                      ...(isSelected ? styles.primaryButton : styles.secondaryButton),
                      ...shortcutButtonStyle,
                    }}
                    onClick={() => {
                      handleShortcutClick(shortcut.id)
                    }}
                  >
                    <span>ostatnie</span>
                    <span>{shortcut.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {!lockedLevel1Id && (
          <div style={sectionStyle}>
            <div style={styles.l2Name}>Typ</div>

            <div style={{ ...styles.actions, marginTop: 10 }}>
              {level1Categories.map((category) => {
                const isSelected = selectedLevel1Id === category.id

                return (
                  <button
                    key={category.id}
                    style={isSelected ? styles.primaryButton : styles.secondaryButton}
                    onClick={() => {
                      setSelectedLevel1Id(category.id)
                      setSelectedLevel2Id(null)
                      setSelectedCategoryId(null)
                    }}
                  >
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div style={sectionStyle}>
          <div style={styles.l2Name}>Kategoria poziom 2</div>

          {!selectedLevel1Id && (
            <div style={styles.emptyText}>
              Najpierw wybierz typ wpisu.
            </div>
          )}

          {selectedLevel1Id && availableLevel2Categories.length > 0 && (
            <div style={treeLevel2WrapStyle}>
              {availableLevel2Categories.map((level2Category) => {
                const isSelected = selectedLevel2Id === level2Category.id

                return (
                  <button
                    key={level2Category.id}
                    style={isSelected ? styles.primaryButton : styles.secondaryButton}
                    onClick={() => {
                      setSelectedLevel2Id(level2Category.id)
                      setSelectedCategoryId(null)
                    }}
                  >
                    {level2Category.name}
                  </button>
                )
              })}
            </div>
          )}

          {selectedLevel1Id && availableLevel2Categories.length === 0 && (
            <div style={styles.emptyText}>
              Brak dostępnych kategorii dla wybranego typu.
            </div>
          )}
        </div>

        <div style={sectionStyle}>
          <div style={styles.l2Name}>Kategoria końcowa</div>

          {!selectedLevel2Id && (
            <div style={disabledLevel3WrapStyle}>
              <div style={styles.l2Name}>Najpierw wybierz kategorię poziomu 2</div>
              <div style={styles.emptyText}>
                Wybór kategorii końcowej odblokuje się po wskazaniu poziomu 2.
              </div>
            </div>
          )}

          {selectedLevel2Id && availableLevel3Categories.length > 0 && (
            <div style={treeLevel3WrapStyle}>
              <div style={styles.l2Name}>{categoriesById[selectedLevel2Id]?.name || ''}</div>

              <div style={treeLevel3ButtonsStyle}>
                {availableLevel3Categories.map((level3Category) => {
                  const isSelected = selectedCategoryId === level3Category.id

                  return (
                    <button
                      key={level3Category.id}
                      style={isSelected ? styles.primaryButton : styles.secondaryButton}
                      onClick={() => {
                        setSelectedCategoryId(level3Category.id)

                        window.setTimeout(() => {
                          amountInputRef.current?.focus()
                        }, 0)
                      }}
                    >
                      {getLevel3ButtonLabel(level3Category)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {selectedLevel2Id && availableLevel3Categories.length === 0 && (
            <div style={styles.emptyText}>
              Brak dostępnych kategorii końcowych dla wybranego poziomu 2.
            </div>
          )}
        </div>

        <div style={sectionStyle}>
          <div style={styles.l2Name}>Dane wpisu</div>

          <div style={{ ...styles.formRow, marginTop: 10 }}>
            <input
              ref={amountInputRef}
              style={styles.smallInput}
              placeholder="kwota"
              value={amount}
              onChange={(event) => setAmount(normalizeAmountInput(event.target.value))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  descriptionInputRef.current?.focus()
                }
              }}
            />

            <input
              ref={descriptionInputRef}
              style={styles.input}
              placeholder="opis"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onKeyDown={async (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()

                  if (isSaving || !selectedLevel1Id || !selectedLevel2Id || !selectedCategoryId) {
                    return
                  }

                  await onSave()
                }
              }}
            />

            <button
              style={{
                ...styles.primaryButton,
                opacity:
                  isSaving || !selectedLevel1Id || !selectedLevel2Id || !selectedCategoryId
                    ? 0.6
                    : 1,
                cursor:
                  isSaving || !selectedLevel1Id || !selectedLevel2Id || !selectedCategoryId
                    ? 'not-allowed'
                    : 'pointer',
              }}
              disabled={isSaving || !selectedLevel1Id || !selectedLevel2Id || !selectedCategoryId}
              onClick={async () => {
                await onSave()
              }}
            >
              {isSaving ? 'zapisywanie...' : 'zapisz'}
            </button>

            {isSerialModeEnabled ? (
              <>
                <button
                  style={styles.secondaryButton}
                  disabled={isSaving || !selectedLevel1Id || !selectedLevel2Id || !selectedCategoryId}
                  onClick={async () => {
                    await onSaveAndClose()
                  }}
                >
                  {isSaving ? 'zapisywanie...' : 'zapisz i zakończ'}
                </button>

                <button style={styles.secondaryButton} onClick={onClose}>
                  zakończ
                </button>
              </>
            ) : (
              <button style={styles.secondaryButton} onClick={onClose}>
                anuluj
              </button>
            )}
          </div>

          <label style={serialToggleStyle}>
            <input
              type="checkbox"
              checked={isSerialModeEnabled}
              onChange={(event) => setIsSerialModeEnabled(event.target.checked)}
            />
            dodawaj seryjnie
          </label>

          {(!selectedLevel1Id || !selectedLevel2Id || !selectedCategoryId) && (
            <div style={styles.emptyText}>
              Aby zapisać wpis, wybierz typ, kategorię poziomu 2 oraz kategorię końcową.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
