'use client'

import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import DescriptionSuggestionDeleteMenu from './DescriptionSuggestionDeleteMenu'
import PaymentSplitEditor from './PaymentSplitEditor'
import TransactionCreatorCategorySection from './transaction-creator/TransactionCreatorCategorySection'
import TransactionCreatorHeader from './transaction-creator/TransactionCreatorHeader'
import TransactionCreatorModeToggles from './transaction-creator/TransactionCreatorModeToggles'
import { getDayInputFromDate, normalizeDayInput } from '../lib/dateUtils'
import { uiInputApi } from '../lib/uiFoundation'
import { useDescriptionSuggestions } from '../lib/useDescriptionSuggestions'
import { splitTagInput } from '../lib/tagUtils'
import {
  activeSuggestionButtonStyle,
  dateFieldStyle,
  dateLabelStyle,
  descriptionFieldWrapStyle,
  descriptionInputWrapStyle,
  modalStyle,
  overlayStyle,
  sectionStyle,
  suggestionButtonStyle,
  suggestionsDropdownStyle,
  tagBadgeStyle,
  tagBadgesWrapStyle,
  tagInputWrapStyle,
  tagRemoveButtonStyle,
} from './transaction-creator/transactionCreatorModalStyles'
import { Category, TransactionCreatorModalProps } from './transaction-creator/transactionCreatorTypes'
import { getCategoryPathLabel, normalizeAmountInput } from './transaction-creator/transactionCreatorUtils'

export default function TransactionCreatorModal(props: TransactionCreatorModalProps) {
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
        <TransactionCreatorHeader
          selectedMonth={selectedMonth}
          suggestedCategoryId={suggestedCategoryId}
          lockedLevel1Id={lockedLevel1Id}
          categoriesById={categoriesById}
          styles={styles}
          onClose={onClose}
        />

        <TransactionCreatorCategorySection
          level1Categories={level1Categories}
          availableLevel2Categories={availableLevel2Categories}
          availableLevel3Categories={availableLevel3Categories}
          level2ByParentId={level2ByParentId}
          level3ByParentId={level3ByParentId}
          categoriesById={categoriesById}
          lockedLevel1Id={lockedLevel1Id}
          selectedLevel1Id={selectedLevel1Id}
          selectedLevel2Id={selectedLevel2Id}
          effectiveCategoryId={effectiveCategoryId}
          effectiveCategoryLabel={effectiveCategoryLabel}
          topShortcutCategories={topShortcutCategories}
          pinnedShortcutCategories={pinnedShortcutCategories}
          pinnedCategoryIds={pinnedCategoryIds}
          recentShortcutCategories={recentShortcutCategories}
          styles={styles}
          handleShortcutClick={handleShortcutClick} handleLevel1Click={handleLevel1Click}
          handleLevel2Click={handleLevel2Click} handleLevel3Click={handleLevel3Click}
          onTogglePinnedCategory={onTogglePinnedCategory}
        />

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
                  className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputL}`}
                  data-input-width={uiInputApi.width.full}
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
                  <div style={suggestionsDropdownStyle} data-transaction-suggestions="true">
                    {filteredSuggestions.map((suggestion, index) => {
                      const isActive = index === activeSuggestionIndex
                      const isLast = index === filteredSuggestions.length - 1

                      return (
                        <button
                          key={suggestion.text}
                          type="button"
                          data-transaction-suggestion-item="true"
                          data-transaction-suggestion-active={isActive ? 'true' : 'false'}
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
              className={uiInputApi.classNames.amountField}
              data-input-width={uiInputApi.width.full}
              style={{ order: 3 }}
              placeholder="kwota"
              inputMode="decimal"
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
                className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputL}`}
                data-input-width={uiInputApi.width.full}
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
            <label
              style={dateLabelStyle}
              htmlFor="transaction-tags-input"
              data-transaction-field-label="true"
            >
              Tagi
            </label>

            <input
              ref={tagInputRef}
              id="transaction-tags-input"
              data-transaction-tags-input="true"
              className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputL}`}
              data-input-width={uiInputApi.width.full}
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
              <div style={tagBadgesWrapStyle} data-transaction-tag-list="true">
                {selectedTagNames.map((tagName) => (
                  <span key={tagName} style={tagBadgeStyle} data-transaction-tag-badge="true">
                    #{tagName}
                    <button
                      type="button"
                      style={tagRemoveButtonStyle}
                      data-transaction-tag-remove="true"
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
                <label style={dateLabelStyle} data-transaction-field-label="true">
                  Źródło płatności
                </label>
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
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                data-transaction-recurring-field="true"
              >
                <label
                  style={dateLabelStyle}
                  htmlFor="transaction-recurring-link"
                  data-transaction-field-label="true"
                >
                  Powiąż z przypomnieniem
                </label>

                <select
                  id="transaction-recurring-link"
                  data-transaction-recurring-select="true"
                  className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputL}`}
                  data-input-width={uiInputApi.width.full}
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
                  <div
                    style={{ ...styles.emptyText, color: 'var(--ui-color-warning)' }}
                    data-transaction-recurring-warning="true"
                  >
                    To przypomnienie ma już wpis w tym miesiącu. Możesz dodać kolejny, jeśli to celowe.
                  </div>
                )}
              </div>
            )}
          </div>

          <TransactionCreatorModeToggles
            selectedLevel1Id={selectedLevel1Id}
            effectiveCategoryId={effectiveCategoryId}
            isSerialModeEnabled={isSerialModeEnabled}
            setIsSerialModeEnabled={setIsSerialModeEnabled}
            isQuickDayModeEnabled={isQuickDayModeEnabled}
            setIsQuickDayModeEnabled={setIsQuickDayModeEnabled}
            transactionDate={transactionDate} setQuickDayDate={setQuickDayDate} styles={styles}
          />
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

