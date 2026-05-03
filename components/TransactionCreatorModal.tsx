'use client'

import { CSSProperties, KeyboardEvent, RefObject, useEffect, useRef, useState } from 'react'
import DescriptionSuggestionDeleteMenu from './DescriptionSuggestionDeleteMenu'
import PaymentSplitEditor from './PaymentSplitEditor'
import { getDayInputFromDate, normalizeDayInput } from '../lib/dateUtils'
import { DescriptionSuggestion, DescriptionSuggestionSet } from '../lib/suggestionUtils'
import { useDescriptionSuggestions } from '../lib/useDescriptionSuggestions'
import { splitTagInput } from '../lib/tagUtils'
import { PaymentSplitInput } from '../lib/paymentSplitUtils'
import { getUniqueCategoryLabel } from '../lib/categoryUtils'

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
  descriptionSuggestions: DescriptionSuggestionSet
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
  transactionDate: string
  setTransactionDate: (value: string) => void
  selectedTagNames: string[]
  setSelectedTagNames: (value: string[]) => void
  selectedPaymentSourceId: string
  setSelectedPaymentSourceId: (value: string) => void
  isPaymentSourceVisible: boolean
  paymentSourceOptions: Array<{
    id: string
    name: string
    type: string
    optionLabel?: string
  }>
  paymentSplitItems: PaymentSplitInput[]
  setPaymentSplitItems: (
    value: PaymentSplitInput[] | ((prev: PaymentSplitInput[]) => PaymentSplitInput[])
  ) => void
  selectedRecurringTransactionId: string
  setSelectedRecurringTransactionId: (value: string) => void
  recurringOptions: Array<{
    id: string
    label: string
    description?: string
    amount?: number | null
    useAmountWhenCreating?: boolean
    hasTransactionInMonth?: boolean
  }>
  recurringSuggestions: Array<{
    id: string
    label: string
    description?: string
    amount?: number | null
    useAmountWhenCreating?: boolean
    hasTransactionInMonth?: boolean
  }>
  isSaving: boolean
  onClose: () => void
  onSave: () => Promise<void>
  onSaveAndClose: () => Promise<void>
  amountInputRef: RefObject<HTMLInputElement | null>
  descriptionInputRef: RefObject<HTMLInputElement | null>
  styles: Record<string, CSSProperties>
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
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
  maxWidth: 860,
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

const dateFieldStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
} as const

const dateLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
} as const

const descriptionFieldWrapStyle = {
  flex: 1,
  minWidth: 260,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
} as const

const descriptionInputWrapStyle = {
  position: 'relative' as const,
  width: '100%',
} as const

const suggestionsDropdownStyle = {
  position: 'absolute' as const,
  top: 'calc(100% + 6px)',
  left: 0,
  right: 0,
  zIndex: 30,
  background: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: 12,
  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
  overflow: 'hidden',
} as const

const suggestionButtonStyle = {
  width: '100%',
  textAlign: 'left' as const,
  background: '#ffffff',
  border: 'none',
  borderBottom: '1px solid #f1f5f9',
  padding: '10px 12px',
  cursor: 'pointer',
  fontSize: 14,
  color: '#111827',
} as const

const activeSuggestionButtonStyle = {
  ...suggestionButtonStyle,
  background: '#eff6ff',
} as const

const helperTextStyle = {
  fontSize: 13,
  color: '#6b7280',
  lineHeight: 1.45,
} as const

const finalCategoryInfoStyle = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  border: '1px solid #dbeafe',
  background: '#eff6ff',
} as const

const finalCategoryInfoTitleStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: '#1d4ed8',
  letterSpacing: 0.3,
  textTransform: 'uppercase' as const,
  marginBottom: 4,
} as const

const finalCategoryInfoValueStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#111827',
} as const

const tagInputWrapStyle = {
  marginTop: 12,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
} as const

const tagBadgesWrapStyle = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
} as const

const tagBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 999,
  border: '1px solid #bfdbfe',
  background: '#eff6ff',
  color: '#1d4ed8',
  fontSize: 13,
  fontWeight: 600,
} as const

const tagRemoveButtonStyle = {
  border: 'none',
  background: 'transparent',
  color: '#1d4ed8',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1,
  padding: 0,
} as const

const getCategoryPathLabel = (
  categoryId: string,
  categoriesById: Record<string, Category>
) => {
  return getUniqueCategoryLabel(categoryId, categoriesById)
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
    descriptionSuggestions,
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
    transactionDate,
    setTransactionDate,
    selectedTagNames,
    setSelectedTagNames,
    selectedPaymentSourceId,
    setSelectedPaymentSourceId,
    isPaymentSourceVisible,
    paymentSourceOptions,
    paymentSplitItems,
    setPaymentSplitItems,
    selectedRecurringTransactionId,
    setSelectedRecurringTransactionId,
    recurringOptions,
    recurringSuggestions,
    isSaving,
    onClose,
    onSave,
    onSaveAndClose,
    amountInputRef,
    descriptionInputRef,
    styles,
    onDeleteDescriptionSuggestion,
  } = props

  const [tagInputValue, setTagInputValue] = useState('')
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false)
  const tagInputRef = useRef<HTMLInputElement | null>(null)
  const dayInputRef = useRef<HTMLInputElement | null>(null)
  const saveButtonRef = useRef<HTMLButtonElement | null>(null)

  const availableLevel2Categories = selectedLevel1Id ? level2ByParentId[selectedLevel1Id] || [] : []
  const availableLevel3Categories = selectedLevel2Id ? level3ByParentId[selectedLevel2Id] || [] : []

  const canSaveOnLevel1 = Boolean(selectedLevel1Id) && availableLevel2Categories.length === 0
  const canSaveOnLevel2 = Boolean(selectedLevel2Id) && availableLevel3Categories.length === 0

  const effectiveCategoryId =
    selectedCategoryId ||
    (canSaveOnLevel2 ? selectedLevel2Id : null) ||
    (canSaveOnLevel1 ? selectedLevel1Id : null)

  const effectiveCategoryLabel = effectiveCategoryId
    ? getCategoryPathLabel(effectiveCategoryId, categoriesById)
    : ''

  const getLevel3ButtonLabel = (category: Category) => {
    return getUniqueCategoryLabel(category.id, categoriesById, availableLevel3Categories.map((item) => item.id))
  }

  const focusAmountInput = () => {
    window.setTimeout(() => {
      amountInputRef.current?.focus()
    }, 0)
  }

  const handleShortcutClick = (categoryId: string) => {
    onSelectShortcutCategory(categoryId)
    focusAmountInput()
  }

  const handleLevel1Click = (category: Category) => {
    const level2Children = level2ByParentId[category.id] || []
    const isFinalHere = level2Children.length === 0

    setSelectedLevel1Id(category.id)
    setSelectedLevel2Id(null)
    setSelectedCategoryId(isFinalHere ? category.id : null)

    if (isFinalHere) {
      focusAmountInput()
    }
  }

  const handleLevel2Click = (level2Category: Category) => {
    const level3Children = level3ByParentId[level2Category.id] || []
    const isFinalHere = level3Children.length === 0

    setSelectedLevel2Id(level2Category.id)
    setSelectedCategoryId(isFinalHere ? level2Category.id : null)

    if (isFinalHere) {
      focusAmountInput()
    }
  }

  const handleLevel3Click = (level3Category: Category) => {
    setSelectedCategoryId(level3Category.id)
    focusAmountInput()
  }

  const applyRecurringLink = (itemId: string) => {
    setSelectedRecurringTransactionId(itemId)

    const item = [...recurringOptions, ...recurringSuggestions].find(
      (option) => option.id === itemId
    )

    if (!item) {
      return
    }

    if (item.description) {
      setDescription(item.description)
    }

    if (item.useAmountWhenCreating && item.amount !== null && item.amount !== undefined) {
      setAmount(String(item.amount))
    }
  }

  const handleTagInputChange = (value: string) => {
    setTagInputValue(value)
    setSelectedTagNames(splitTagInput(value))
  }

  const handleRemoveTag = (tagName: string) => {
    const nextTagNames = selectedTagNames.filter((item) => item !== tagName)
    setSelectedTagNames(nextTagNames)
    setTagInputValue(nextTagNames.join(', '))
  }

  useEffect(() => {
    setTagInputValue(selectedTagNames.join(', '))
  }, [selectedTagNames])

  const dayInputValue = getDayInputFromDate(transactionDate, selectedMonth)
  const selectedRecurringOption = [...recurringOptions, ...recurringSuggestions].find(
    (item) => item.id === selectedRecurringTransactionId
  )
  const {
    filteredSuggestions,
    activeSuggestionIndex,
    applySuggestion,
    handleKeyDown,
    handleSuggestionContextMenu,
    handleSuggestionPointerDown,
    handleSuggestionPointerUp,
    handleSuggestionPointerLeave,
    suggestionToDelete,
    deletePromptPosition,
    closeDeletePrompt,
    confirmDeleteSuggestion,
  } = useDescriptionSuggestions({
    query: description,
    setQuery: setDescription,
    categoryId: effectiveCategoryId,
    isEnabled: isDescriptionFocused,
    descriptionSuggestions,
    inputRef: descriptionInputRef,
    onDeleteSuggestion: onDeleteDescriptionSuggestion,
  })

  const handleSaveFromKeyboard = async () => {
    if (isSaving || !selectedLevel1Id || !effectiveCategoryId) {
      return
    }

    await onSave()
  }

  const handleDescriptionKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (handleKeyDown(event)) {
      return
    }

    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault()
      amountInputRef.current?.focus()
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      await handleSaveFromKeyboard()
    }
  }

  const handleTagsKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault()

      if (event.shiftKey) {
        dayInputRef.current?.focus()
      } else {
        saveButtonRef.current?.focus()
      }

      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      await handleSaveFromKeyboard()
    }
  }

  if (!isOpen) {
    return null
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
                const isSelected = effectiveCategoryId === shortcut.id

                return (
                  <button
                    key={shortcut.id}
                    style={{
                      ...(isSelected ? styles.primaryButton : styles.secondaryButton),
                      ...shortcutButtonStyle,
                    }}
                    onClick={() => handleShortcutClick(shortcut.id)}
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
                const isSelected = effectiveCategoryId === shortcut.id

                return (
                  <button
                    key={shortcut.id}
                    style={{
                      ...(isSelected ? styles.primaryButton : styles.secondaryButton),
                      ...shortcutButtonStyle,
                    }}
                    onClick={() => handleShortcutClick(shortcut.id)}
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
                const level2Children = level2ByParentId[category.id] || []
                const isFinalHere = level2Children.length === 0

                return (
                  <button
                    key={category.id}
                    style={isSelected ? styles.primaryButton : styles.secondaryButton}
                    onClick={() => handleLevel1Click(category)}
                  >
                    {category.name}
                    {isFinalHere ? ' (końcowy)' : ''}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div style={sectionStyle}>
          <div style={styles.l2Name}>Kategorie</div>

          {!selectedLevel1Id && <div style={styles.emptyText}>Najpierw wybierz typ wpisu.</div>}

          {selectedLevel1Id && availableLevel2Categories.length > 0 && (
            <div style={treeLevel2WrapStyle}>
              {availableLevel2Categories.map((level2Category) => {
                const level3Children = level3ByParentId[level2Category.id] || []
                const isFinalHere = level3Children.length === 0
                const isSelected =
                  selectedLevel2Id === level2Category.id ||
                  (availableLevel3Categories.length === 0 && effectiveCategoryId === level2Category.id)

                return (
                  <button
                    key={level2Category.id}
                    style={isSelected ? styles.primaryButton : styles.secondaryButton}
                    onClick={() => handleLevel2Click(level2Category)}
                  >
                    {level2Category.name}
                    {isFinalHere ? ' (końcowy)' : ''}
                  </button>
                )
              })}
            </div>
          )}

          {selectedLevel1Id && availableLevel2Categories.length === 0 && (
            <div style={styles.emptyText}>
              Ten typ nie ma dodatkowych kategorii — wpis zapisze się bezpośrednio tutaj.
            </div>
          )}
        </div>

        <div style={sectionStyle}>
          <div style={styles.l2Name}>Podkategorie</div>

          {!selectedLevel2Id && availableLevel2Categories.length > 0 && (
            <div style={disabledLevel3WrapStyle}>
              <div style={styles.l2Name}>Najpierw wybierz kategorię</div>
              <div style={styles.emptyText}>
                Wybór podkategorii odblokuje się po wskazaniu kategorii.
              </div>
            </div>
          )}

          {selectedLevel1Id && availableLevel2Categories.length === 0 && (
            <div style={treeLevel3WrapStyle}>
              <div style={styles.l2Name}>Kategoria końcowa</div>
              <div style={styles.emptyText}>
                W tym typie nie ma niższych kategorii — wpis zapisze się tutaj.
              </div>
            </div>
          )}

          {selectedLevel2Id && availableLevel3Categories.length > 0 && (
            <div style={treeLevel3WrapStyle}>
              <div style={styles.l2Name}>{categoriesById[selectedLevel2Id]?.name || ''}</div>

              <div style={treeLevel3ButtonsStyle}>
                {availableLevel3Categories.map((level3Category) => {
                  const isSelected = effectiveCategoryId === level3Category.id

                  return (
                    <button
                      key={level3Category.id}
                      style={isSelected ? styles.primaryButton : styles.secondaryButton}
                      onClick={() => handleLevel3Click(level3Category)}
                    >
                      {getLevel3ButtonLabel(level3Category)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {selectedLevel2Id && availableLevel3Categories.length === 0 && (
            <div style={treeLevel3WrapStyle}>
              <div style={styles.l2Name}>{categoriesById[selectedLevel2Id]?.name || ''}</div>
              <div style={styles.emptyText}>
                Ta kategoria nie ma podkategorii — wpis zapisze się tutaj.
              </div>
            </div>
          )}

          {effectiveCategoryId && (
            <div style={finalCategoryInfoStyle}>
              <div style={finalCategoryInfoTitleStyle}>Zapis trafi do</div>
              <div style={finalCategoryInfoValueStyle}>{effectiveCategoryLabel}</div>
            </div>
          )}
        </div>

        <div style={sectionStyle}>
          <div style={styles.l2Name}>Dane wpisu</div>

          <div style={{ ...styles.formRow, marginTop: 10, alignItems: 'flex-start' }}>
            <div style={descriptionFieldWrapStyle}>
              <div style={descriptionInputWrapStyle}>
                <input
                  ref={descriptionInputRef}
                  style={styles.input}
                  placeholder="opis"
                  value={description}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  onFocus={() => setIsDescriptionFocused(true)}
                  onBlur={() => setIsDescriptionFocused(false)}
                  onChange={(event) => setDescription(event.target.value)}
                  onKeyDown={handleDescriptionKeyDown}
                />

                {filteredSuggestions.length > 0 && (
                  <div style={suggestionsDropdownStyle}>
                    {filteredSuggestions.map((suggestion, index) => {
                      const isActive = index === activeSuggestionIndex
                      const isLast = index === filteredSuggestions.length - 1

                      return (
                        <button
                          key={suggestion.text}
                          type="button"
                          style={{
                            ...(isActive ? activeSuggestionButtonStyle : suggestionButtonStyle),
                            borderBottom: isLast ? 'none' : suggestionButtonStyle.borderBottom,
                          }}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => applySuggestion(suggestion.text)}
                          onContextMenu={(event) => handleSuggestionContextMenu(event, suggestion)}
                          onPointerDown={(event) => handleSuggestionPointerDown(suggestion, event)}
                          onPointerUp={handleSuggestionPointerUp}
                          onPointerLeave={handleSuggestionPointerLeave}
                          onPointerCancel={handleSuggestionPointerLeave}
                        >
                          {suggestion.text}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div style={helperTextStyle}>
                Sugestie filtrują się na żywo po całym wpisanym tekście. Możesz wybrać je strzałkami
                i Enterem, a ukryć prawym przyciskiem albo długim przytrzymaniem.
              </div>
            </div>

            <input
              ref={amountInputRef}
              style={styles.smallInput}
              placeholder="kwota"
              value={amount}
              onChange={(event) => setAmount(normalizeAmountInput(event.target.value))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  dayInputRef.current?.focus()
                }
              }}
            />

            <label style={dateFieldStyle}>
              <span style={dateLabelStyle}>dzień</span>
              <input
                ref={dayInputRef}
                style={styles.smallInput}
                value={dayInputValue}
                placeholder="dzień"
                inputMode="numeric"
                onChange={(event) => {
                  const nextDay = normalizeDayInput(event.target.value, selectedMonth)
                  setTransactionDate(nextDay ? `${selectedMonth}-${nextDay}` : '')
                }}
                onBlur={(event) => {
                  const nextDay = normalizeDayInput(event.target.value, selectedMonth)
                  setTransactionDate(nextDay ? `${selectedMonth}-${nextDay}` : '')
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    tagInputRef.current?.focus()
                  }
                }}
              />
            </label>

            <button
              ref={saveButtonRef}
              style={{
                ...styles.primaryButton,
                opacity: isSaving || !selectedLevel1Id || !effectiveCategoryId ? 0.6 : 1,
                cursor:
                  isSaving || !selectedLevel1Id || !effectiveCategoryId ? 'not-allowed' : 'pointer',
              }}
              disabled={isSaving || !selectedLevel1Id || !effectiveCategoryId}
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
                  disabled={isSaving || !selectedLevel1Id || !effectiveCategoryId}
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

          <div style={tagInputWrapStyle}>
            <label style={dateLabelStyle} htmlFor="transaction-tags-input">
              Tagi
            </label>

            <input
              ref={tagInputRef}
              id="transaction-tags-input"
              style={styles.input}
              placeholder="np. sklep, dom, jedzenie"
              value={tagInputValue}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              onChange={(event) => {
                handleTagInputChange(event.target.value)
              }}
              onKeyDown={handleTagsKeyDown}
            />

            <div style={helperTextStyle}>
              Wpisuj tagi po przecinku. Zostaną zapisane i będzie można po nich filtrować w
              wyszukiwarce.
            </div>

            {selectedTagNames.length > 0 && (
              <div style={tagBadgesWrapStyle}>
                {selectedTagNames.map((tagName) => (
                  <span key={tagName} style={tagBadgeStyle}>
                    #{tagName}
                    <button
                      type="button"
                      style={tagRemoveButtonStyle}
                      onClick={() => handleRemoveTag(tagName)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {isPaymentSourceVisible && (
              <>
                <label style={dateLabelStyle}>Źródło płatności</label>
                <PaymentSplitEditor
                  amount={amount}
                  isVisible={isPaymentSourceVisible}
                  selectedPaymentSourceId={selectedPaymentSourceId}
                  setSelectedPaymentSourceId={setSelectedPaymentSourceId}
                  paymentSourceOptions={paymentSourceOptions}
                  paymentSplitItems={paymentSplitItems}
                  setPaymentSplitItems={setPaymentSplitItems}
                  styles={styles}
                />

                <div style={helperTextStyle}>
                  To pole jest opcjonalne i zapisuje powiązanie wpisu z gotówką, kartą albo kontem.
                  Jeśli dodasz kolejne źródło, zapisze się pełny split płatności.
                </div>
              </>
            )}


            {(recurringOptions.length > 0 || recurringSuggestions.length > 0) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={dateLabelStyle} htmlFor="transaction-recurring-link">
                  Powiąż z przypomnieniem
                </label>

                <select
                  id="transaction-recurring-link"
                  style={styles.input}
                  value={selectedRecurringTransactionId}
                  onChange={(event) => applyRecurringLink(event.target.value)}
                >
                  <option value="">Brak powiązania</option>
                  {recurringOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                  {recurringSuggestions.map((item) => (
                    <option key={`suggestion-${item.id}`} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>

                {selectedRecurringOption?.hasTransactionInMonth && (
                  <div style={{ ...styles.emptyText, color: '#92400e' }}>
                    To przypomnienie ma już wpis w tym miesiącu. Możesz dodać kolejny, jeśli to celowe.
                  </div>
                )}
              </div>
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

          {(!selectedLevel1Id || !effectiveCategoryId) && (
            <div style={styles.emptyText}>
              Aby zapisać wpis, wybierz typ oraz najniższą dostępną kategorię.
            </div>
          )}
        </div>
      </div>

      <DescriptionSuggestionDeleteMenu
        isOpen={Boolean(suggestionToDelete)}
        x={deletePromptPosition.x}
        y={deletePromptPosition.y}
        onConfirm={confirmDeleteSuggestion}
        onCancel={closeDeletePrompt}
      />
    </div>
  )
}

