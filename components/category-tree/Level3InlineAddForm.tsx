import type { CSSProperties, Dispatch, KeyboardEvent, MouseEvent, PointerEvent, RefObject, SetStateAction } from 'react'
import PaymentSplitEditor from '../PaymentSplitEditor'
import { normalizeDayInput } from '../../lib/dateUtils'
import type { DescriptionSuggestion } from '../../lib/suggestionUtils'
import { splitTagInput } from '../../lib/tagUtils'
import type { PaymentSplitInput } from '../../lib/paymentSplitUtils'

const inlineDescriptionFieldWrapStyle = {
  flex: 1,
  minWidth: 220,
  position: 'relative' as const,
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
  marginTop: 8,
  fontSize: 13,
  color: '#6b7280',
  lineHeight: 1.45,
} as const

const tagBadgesWrapStyle = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap' as const,
} as const

const tagBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 8px',
  borderRadius: 999,
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  color: '#1d4ed8',
  fontSize: 12,
  fontWeight: 600,
} as const

const tagRemoveButtonStyle = {
  border: 'none',
  background: 'transparent',
  color: '#1d4ed8',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1.2,
  padding: 0,
} as const

const compactPrimaryButtonStyle = {
  padding: '6px 10px',
  fontSize: 13,
  minHeight: 32,
} as const

const compactSecondaryButtonStyle = {
  padding: '6px 10px',
  fontSize: 13,
  minHeight: 32,
} as const

type PaymentSourceOption = {
  id: string
  name: string
  type: string
  optionLabel?: string
}

type RecurringLinkOption = {
  id: string
  label: string
  description?: string
  amount?: number | null
  useAmountWhenCreating?: boolean
  hasTransactionInMonth?: boolean
}

type Level3InlineAddFormProps = {
  categoryId: string
  selectedMonth: string
  inlineDay: string
  setInlineDay: Dispatch<SetStateAction<string>>
  inlineAmount: string
  setInlineAmount: Dispatch<SetStateAction<string>>
  inlineDescription: string
  setInlineDescription: Dispatch<SetStateAction<string>>
  inlineTagInput: string
  setInlineTagInput: Dispatch<SetStateAction<string>>
  inlineTagNames: string[]
  setInlineTagNames: Dispatch<SetStateAction<string[]>>
  inlinePaymentSourceId: string
  setInlinePaymentSourceId: Dispatch<SetStateAction<string>>
  inlinePaymentSplitItems: PaymentSplitInput[]
  setInlinePaymentSplitItems: Dispatch<SetStateAction<PaymentSplitInput[]>>
  recurringOptions?: RecurringLinkOption[]
  selectedRecurringTransactionId: string
  setSelectedRecurringTransactionId: Dispatch<SetStateAction<string>>
  isInlineSaving: boolean
  inlineAmountInputRef: RefObject<HTMLInputElement | null>
  inlineDescriptionInputRef: RefObject<HTMLInputElement | null>
  filteredInlineSuggestions: DescriptionSuggestion[]
  activeInlineSuggestionIndex: number
  handleInlineSuggestionKeyDown: (event: KeyboardEvent<HTMLInputElement>) => boolean
  applyInlineSuggestion: (text: string) => void
  handleInlineSuggestionContextMenu: (
    event: MouseEvent<HTMLButtonElement>,
    suggestion: DescriptionSuggestion
  ) => void
  handleInlineSuggestionPointerDown: (
    suggestion: DescriptionSuggestion,
    event: PointerEvent<HTMLButtonElement>
  ) => void
  handleInlineSuggestionPointerUp: () => void
  handleInlineSuggestionPointerLeave: () => void
  getPaymentSourceOptionsForCategoryId?: (categoryId: string) => PaymentSourceOption[]
  getDefaultPaymentSourceIdForCategoryId?: (categoryId: string) => string
  normalizeAmountInput: (value: string) => string
  saveInlineAdd: () => Promise<void>
  cancelInlineAdd: () => void
  styles: Record<string, CSSProperties>
}

export default function Level3InlineAddForm({
  categoryId,
  selectedMonth,
  inlineDay,
  setInlineDay,
  inlineAmount,
  setInlineAmount,
  inlineDescription,
  setInlineDescription,
  inlineTagInput,
  setInlineTagInput,
  inlineTagNames,
  setInlineTagNames,
  inlinePaymentSourceId,
  setInlinePaymentSourceId,
  inlinePaymentSplitItems,
  setInlinePaymentSplitItems,
  recurringOptions = [],
  selectedRecurringTransactionId,
  setSelectedRecurringTransactionId,
  isInlineSaving,
  inlineAmountInputRef,
  inlineDescriptionInputRef,
  filteredInlineSuggestions,
  activeInlineSuggestionIndex,
  handleInlineSuggestionKeyDown,
  applyInlineSuggestion,
  handleInlineSuggestionContextMenu,
  handleInlineSuggestionPointerDown,
  handleInlineSuggestionPointerUp,
  handleInlineSuggestionPointerLeave,
  getPaymentSourceOptionsForCategoryId,
  getDefaultPaymentSourceIdForCategoryId: _getDefaultPaymentSourceIdForCategoryId,
  normalizeAmountInput,
  saveInlineAdd,
  cancelInlineAdd,
  styles,
}: Level3InlineAddFormProps) {
  const paymentSourceOptions = getPaymentSourceOptionsForCategoryId?.(categoryId) || []
  const selectedRecurringOption = recurringOptions.find(
    (option) => option.id === selectedRecurringTransactionId
  )

  const applyRecurringLink = (itemId: string) => {
    setSelectedRecurringTransactionId(itemId)

    const option = recurringOptions.find((item) => item.id === itemId)

    if (!option) {
      return
    }

    if (option.description) {
      setInlineDescription(option.description)
    }

    if (
      option.useAmountWhenCreating &&
      option.amount !== null &&
      option.amount !== undefined
    ) {
      setInlineAmount(String(option.amount))
    }
  }

  return (
    <div style={styles.formRow}>
      <input
        style={styles.smallInput}
        value={inlineDay}
        onChange={(event) => setInlineDay(normalizeDayInput(event.target.value, selectedMonth))}
        placeholder="dzień"
        inputMode="numeric"
        onBlur={() => {
          setInlineDay((prev) => normalizeDayInput(prev, selectedMonth))
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            inlineAmountInputRef.current?.focus()
          }
        }}
      />

      <input
        ref={inlineAmountInputRef}
        style={styles.smallInput}
        value={inlineAmount}
        onChange={(event) => setInlineAmount(normalizeAmountInput(event.target.value))}
        placeholder="kwota"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            inlineDescriptionInputRef.current?.focus()
          }
        }}
      />

      <div style={inlineDescriptionFieldWrapStyle}>
        <input
          ref={inlineDescriptionInputRef}
          style={styles.input}
          value={inlineDescription}
          onChange={(event) => setInlineDescription(event.target.value)}
          placeholder="opis"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onKeyDown={async (event) => {
            if (handleInlineSuggestionKeyDown(event)) {
              return
            }

            if (event.key === 'Enter') {
              event.preventDefault()
              await saveInlineAdd()
            }
          }}
        />

        {filteredInlineSuggestions.length > 0 && (
          <div style={suggestionsDropdownStyle}>
            {filteredInlineSuggestions.map((suggestion, index) => {
              const isActive = index === activeInlineSuggestionIndex
              const isLast = index === filteredInlineSuggestions.length - 1

              return (
                <button
                  key={suggestion.text}
                  type="button"
                  style={{
                    ...(isActive ? activeSuggestionButtonStyle : suggestionButtonStyle),
                    borderBottom: isLast ? 'none' : suggestionButtonStyle.borderBottom,
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    applyInlineSuggestion(suggestion.text)
                  }}
                  onContextMenu={(event) => {
                    handleInlineSuggestionContextMenu(event, suggestion)
                  }}
                  onPointerDown={(event) => {
                    handleInlineSuggestionPointerDown(suggestion, event)
                  }}
                  onPointerUp={handleInlineSuggestionPointerUp}
                  onPointerLeave={handleInlineSuggestionPointerLeave}
                  onPointerCancel={handleInlineSuggestionPointerLeave}
                >
                  {suggestion.text}
                </button>
              )
            })}
          </div>
        )}

        <div style={helperTextStyle}>
          Sugestie filtrują się na żywo po całym wpisanym tekście. Możesz wybrać je
          strzałkami i Enterem, a ukryć prawym przyciskiem albo długim przytrzymaniem.
        </div>
      </div>

      <div style={{ ...inlineDescriptionFieldWrapStyle, minWidth: 180 }}>
        <input
          style={styles.input}
          value={inlineTagInput}
          onChange={(event) => {
            const nextValue = event.target.value
            setInlineTagInput(nextValue)
            setInlineTagNames(splitTagInput(nextValue))
          }}
          placeholder="tagi, po przecinku"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onKeyDown={async (event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              await saveInlineAdd()
            }
          }}
        />

        {inlineTagNames.length > 0 && (
          <div style={{ ...tagBadgesWrapStyle, marginTop: 8 }}>
            {inlineTagNames.map((tagName) => (
              <span key={tagName} style={tagBadgeStyle}>
                #{tagName}
                <button
                  type="button"
                  style={tagRemoveButtonStyle}
                  onClick={() => {
                    const nextTagNames = inlineTagNames.filter((item) => item !== tagName)
                    setInlineTagNames(nextTagNames)
                    setInlineTagInput(nextTagNames.join(', '))
                  }}
                >
                ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {getPaymentSourceOptionsForCategoryId && (
        <div style={{ minWidth: 280, flex: 1 }}>
          <PaymentSplitEditor
            amount={inlineAmount}
            isVisible
            selectedPaymentSourceId={inlinePaymentSourceId}
            setSelectedPaymentSourceId={setInlinePaymentSourceId}
            paymentSourceOptions={paymentSourceOptions}
            paymentSplitItems={inlinePaymentSplitItems}
            setPaymentSplitItems={setInlinePaymentSplitItems}
            styles={styles}
          />
          {paymentSourceOptions.length === 0 && (
            <div style={helperTextStyle}>
              Źródła płatności są włączone, ale nie masz jeszcze żadnego źródła do wyboru.
            </div>
          )}
        </div>
      )}

      {recurringOptions.length > 0 && (
        <div style={{ minWidth: 240, flex: 1 }}>
          <label style={{ ...styles.emptyText, display: 'flex', flexDirection: 'column', gap: 6 }}>
            Powiąż z przypomnieniem
            <select
              style={styles.input}
              value={selectedRecurringTransactionId}
              onChange={(event) => applyRecurringLink(event.target.value)}
            >
              <option value="">Brak powiązania</option>
              {recurringOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {selectedRecurringOption?.hasTransactionInMonth && (
            <div style={{ ...styles.infoBox, marginTop: 8, background: '#fff7ed', border: '1px solid #fed7aa' }}>
              To przypomnienie ma już wpis w tym miesiącu. Możesz dodać kolejny, jeśli to celowe.
            </div>
          )}
        </div>
      )}

      <button
        style={{ ...styles.primaryButton, ...compactPrimaryButtonStyle }}
        disabled={isInlineSaving}
        onClick={async () => {
          await saveInlineAdd()
        }}
      >
        {isInlineSaving ? 'zapisywanie...' : 'zapisz'}
      </button>

      <button
        style={{ ...styles.secondaryButton, ...compactSecondaryButtonStyle }}
        onClick={() => {
          cancelInlineAdd()
        }}
      >
        anuluj
      </button>
    </div>
  )
}
