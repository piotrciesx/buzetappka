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
import {
  activeSuggestionButtonStyle,
  dateFieldStyle,
  dateLabelStyle,
  descriptionFieldWrapStyle,
  descriptionInputWrapStyle,
  disabledLevel3WrapStyle,
  finalCategoryInfoStyle,
  finalCategoryInfoTitleStyle,
  finalCategoryInfoValueStyle,
  modalStyle,
  overlayStyle,
  sectionStyle,
  serialToggleStyle,
  shortcutButtonStyle,
  shortcutListStyle,
  suggestionButtonStyle,
  suggestionsDropdownStyle,
  tagBadgeStyle,
  tagBadgesWrapStyle,
  tagInputWrapStyle,
  tagRemoveButtonStyle,
  treeLevel2WrapStyle,
  treeLevel3ButtonsStyle,
  treeLevel3WrapStyle,
} from './transaction-creator/transactionCreatorModalStyles'

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
  pinnedShortcutCategories: TransactionShortcut[]
  pinnedCategoryIds: string[]
  recentShortcutCategories: TransactionShortcut[]
  descriptionSuggestions: DescriptionSuggestionSet
  onSelectShortcutCategory: (categoryId: string) => void
  onTogglePinnedCategory: (categoryId: string) => void
  selectedLevel1Id: string | null
  setSelectedLevel1Id: (value: string | null) => void
  selectedLevel2Id: string | null
  setSelectedLevel2Id: (value: string | null) => void
  selectedCategoryId: string | null
  setSelectedCategoryId: (value: string | null) => void
  isSerialModeEnabled: boolean
  setIsSerialModeEnabled: (value: boolean) => void
  isQuickDayModeEnabled: boolean
  setIsQuickDayModeEnabled: (value: boolean) => void
  setQuickDayDate: (value: string) => void
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

const getCategoryPathLabel = (
  categoryId: string,
  categoriesById: Record<string, Category>
) => {
  return getUniqueCategoryLabel(categoryId, categoriesById)
}

const normalizeAmountInput = (value: string) => {
  return value.replace(',', '.')
}

const compactCategoryButtonStyle: CSSProperties = {
  minHeight: 32,
  padding: '6px 10px',
  borderRadius: 10,
  fontSize: 13,
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
    pinnedShortcutCategories,
    pinnedCategoryIds,
    recentShortcutCategories,
    descriptionSuggestions,
    onSelectShortcutCategory,
    onTogglePinnedCategory,
    selectedLevel1Id,
    setSelectedLevel1Id,
    selectedLevel2Id,
    setSelectedLevel2Id,
    selectedCategoryId,
    setSelectedCategoryId,
    isSerialModeEnabled,
    setIsSerialModeEnabled,
    isQuickDayModeEnabled,
    setIsQuickDayModeEnabled,
    setQuickDayDate,
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
    <div data-transaction-modal-overlay="true" style={overlayStyle} onClick={onClose}>
      <div data-transaction-modal="true" style={modalStyle} onClick={(event) => event.stopPropagation()}>
        <div style={styles.sectionTitle} data-transaction-modal-title="true">
          <span>Nowy wpis</span>
          <button
            type="button"
            data-transaction-close-action="true"
            aria-label="Zamknij kreator wpisu"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onClose}
          >
            ×
          </button>
        </div>

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

        {pinnedShortcutCategories.length > 0 && (
          <div style={sectionStyle}>
            <div style={styles.l2Name}>Przypięte kategorie</div>

            <div style={shortcutListStyle}>
              {pinnedShortcutCategories.map((shortcut) => {
                const isSelected = effectiveCategoryId === shortcut.id

                return (
                  <button
                    key={shortcut.id}
                    style={{
                      ...(isSelected ? styles.primaryButton : styles.secondaryButton),
                      ...shortcutButtonStyle,
                      ...compactCategoryButtonStyle,
                    }}
                    onClick={() => handleShortcutClick(shortcut.id)}
                  >
                    <span>przypięte</span>
                    <span>{shortcut.label}</span>
                  </button>
                )
              })}
            </div>
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
                    style={{
                      ...(isSelected ? styles.primaryButton : styles.secondaryButton),
                      ...compactCategoryButtonStyle,
                    }}
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

        <div style={sectionStyle} data-transaction-entry-section="true">
          <div style={styles.l2Name}>Kategorie</div>

          {!selectedLevel1Id && (
            <div style={styles.emptyText} data-transaction-category-hint="true">
              Najpierw wybierz typ wpisu.
            </div>
          )}

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
                    style={{
                      ...(isSelected ? styles.primaryButton : styles.secondaryButton),
                      ...compactCategoryButtonStyle,
                    }}
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
            <div style={styles.emptyText} data-transaction-category-hint="true">
              Ten typ nie ma dodatkowych kategorii — wpis zapisze się bezpośrednio tutaj.
            </div>
          )}
        </div>

        <div style={sectionStyle} data-transaction-subcategory-section="true">
          <div style={styles.l2Name}>Podkategorie</div>

          {!selectedLevel2Id && availableLevel2Categories.length > 0 && (
            <div style={disabledLevel3WrapStyle} data-transaction-category-disabled="true">
              <div style={styles.l2Name}>Najpierw wybierz kategorię</div>
              <div style={styles.emptyText} data-transaction-category-hint="true">
                Wybór podkategorii odblokuje się po wskazaniu kategorii.
              </div>
            </div>
          )}

          {selectedLevel1Id && availableLevel2Categories.length === 0 && (
            <div style={treeLevel3WrapStyle} data-transaction-final-category-placeholder="true">
              <div style={styles.l2Name}>Kategoria końcowa</div>
              <div style={styles.emptyText} data-transaction-category-hint="true">
                W tym typie nie ma niższych kategorii — wpis zapisze się tutaj.
              </div>
            </div>
          )}

          {selectedLevel2Id && availableLevel3Categories.length > 0 && (
            <div style={treeLevel3WrapStyle} data-transaction-final-category-placeholder="true">
              <div style={styles.l2Name}>{categoriesById[selectedLevel2Id]?.name || ''}</div>

              <div style={treeLevel3ButtonsStyle}>
                {availableLevel3Categories.map((level3Category) => {
                  const isSelected = effectiveCategoryId === level3Category.id

                  return (
                    <button
                      key={level3Category.id}
                      style={{
                        ...(isSelected ? styles.primaryButton : styles.secondaryButton),
                        ...compactCategoryButtonStyle,
                      }}
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
              <div style={styles.emptyText} data-transaction-category-hint="true">
                Ta kategoria nie ma podkategorii — wpis zapisze się tutaj.
              </div>
            </div>
          )}

          {effectiveCategoryId && (
            <div style={finalCategoryInfoStyle} data-transaction-final-category="true">
              <div style={finalCategoryInfoTitleStyle}>Zapis trafi do</div>
              <div style={finalCategoryInfoValueStyle}>{effectiveCategoryLabel}</div>
              <button
                type="button"
                data-transaction-pin-button="true"
                data-transaction-pinned={
                  pinnedCategoryIds.includes(effectiveCategoryId) ? 'true' : 'false'
                }
                aria-label={
                  pinnedCategoryIds.includes(effectiveCategoryId)
                    ? 'Odepnij kategorię'
                    : 'Przypnij kategorię'
                }
                title={
                  pinnedCategoryIds.includes(effectiveCategoryId)
                    ? 'Odepnij kategorię'
                    : 'Przypnij kategorię'
                }
                style={{ ...styles.secondaryButton, marginTop: 8 }}
                onClick={() => onTogglePinnedCategory(effectiveCategoryId)}
              >
                {pinnedCategoryIds.includes(effectiveCategoryId)
                  ? 'odepnij kategorię'
                  : 'przypnij kategorię'}
              </button>
            </div>
          )}
        </div>

        <div style={sectionStyle} data-transaction-data-section="true">
          <div style={styles.l2Name}>Dane wpisu</div>

          <div
            style={{ ...styles.formRow, marginTop: 10, alignItems: 'center' }}
            data-transaction-entry-form="true"
          >
            <div style={{ ...descriptionFieldWrapStyle, order: 2 }}>
              <div style={descriptionInputWrapStyle}>
                <input
                  ref={descriptionInputRef}
                  data-transaction-description-input="true"
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

            </div>

            <input
              ref={amountInputRef}
              data-transaction-amount-input="true"
              style={{ ...styles.smallInput, order: 3 }}
              placeholder="kwota"
              value={amount}
              onChange={(event) => setAmount(normalizeAmountInput(event.target.value))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void handleSaveFromKeyboard()
                }
              }}
            />

            <label style={{ ...dateFieldStyle, order: 1 }}>
              <input
                ref={dayInputRef}
                data-transaction-day-input="true"
                style={styles.smallInput}
                value={dayInputValue}
                placeholder="dzień"
                inputMode="numeric"
                onChange={(event) => {
                  const nextDay = normalizeDayInput(event.target.value, selectedMonth)
                  const nextDate = nextDay ? `${selectedMonth}-${nextDay}` : ''
                  setTransactionDate(nextDate)
                  if (isQuickDayModeEnabled) {
                    setQuickDayDate(nextDate)
                  }
                }}
                onBlur={(event) => {
                  const nextDay = normalizeDayInput(event.target.value, selectedMonth)
                  const nextDate = nextDay ? `${selectedMonth}-${nextDay}` : ''
                  setTransactionDate(nextDate)
                  if (isQuickDayModeEnabled) {
                    setQuickDayDate(nextDate)
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    descriptionInputRef.current?.focus()
                  }
                }}
              />
            </label>

            <button
              ref={saveButtonRef}
              data-transaction-save-action="true"
              style={{
                ...styles.primaryButton,
                order: 4,
                marginLeft: 'auto',
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
                  data-transaction-save-close-action="true"
                  style={{ ...styles.secondaryButton, order: 5 }}
                  disabled={isSaving || !selectedLevel1Id || !effectiveCategoryId}
                  onClick={async () => {
                    await onSaveAndClose()
                  }}
                >
                  {isSaving ? 'zapisywanie...' : 'zapisz i zakończ'}
                </button>

                <button
                  data-transaction-cancel-action="true"
                  style={{ ...styles.secondaryButton, order: 6 }}
                  onClick={onClose}
                >
                  zakończ
                </button>
              </>
            ) : (
              <button
                data-transaction-cancel-action="true"
                style={{ ...styles.secondaryButton, order: 5 }}
                onClick={onClose}
              >
                anuluj
              </button>
            )}
          </div>

          <div style={tagInputWrapStyle} data-transaction-entry-extra="true">
            <label style={dateLabelStyle} htmlFor="transaction-tags-input">
              Tagi
            </label>

            <input
              ref={tagInputRef}
              id="transaction-tags-input"
              data-transaction-tags-input="true"
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

              </>
            )}


            {(recurringOptions.length > 0 || recurringSuggestions.length > 0) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={dateLabelStyle} htmlFor="transaction-recurring-link">
                  Powiąż z przypomnieniem
                </label>

                <select
                  id="transaction-recurring-link"
                  data-transaction-recurring-select="true"
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

          <label style={serialToggleStyle} data-transaction-entry-toggle="true">
            <input
              type="checkbox"
              checked={isSerialModeEnabled}
              onChange={(event) => setIsSerialModeEnabled(event.target.checked)}
            />
            dodawaj seryjnie
          </label>

          <label style={serialToggleStyle} data-transaction-entry-toggle="true">
            <input
              type="checkbox"
              checked={isQuickDayModeEnabled}
              onChange={(event) => {
                setIsQuickDayModeEnabled(event.target.checked)
                if (event.target.checked) {
                  setQuickDayDate(transactionDate)
                }
              }}
            />
            tryb szybkiego dnia
          </label>

          {(!selectedLevel1Id || !effectiveCategoryId) && (
            <div style={styles.emptyText} data-transaction-save-hint="true">
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

