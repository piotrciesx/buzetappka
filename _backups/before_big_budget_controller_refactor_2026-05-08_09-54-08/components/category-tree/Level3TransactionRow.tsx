import type {
  CSSProperties,
  Dispatch,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  RefObject,
  SetStateAction,
} from 'react'
import PaymentSplitEditor from '../PaymentSplitEditor'
import type { Tag, TransactionPaymentSplit } from '../../lib/budgetPageTypes'
import type { PaymentSplitInput } from '../../lib/paymentSplitUtils'
import { getTransactionPaymentSourceDisplayLines } from '../../lib/paymentSplitUtils'
import type { DescriptionSuggestion } from '../../lib/suggestionUtils'
import { normalizeDayInput } from '../../lib/dateUtils'
import { splitTagInput } from '../../lib/tagUtils'
import {
  activeSuggestionButtonStyle,
  clickableTagBadgeStyle,
  compactPrimaryButtonStyle,
  compactSecondaryButtonStyle,
  inlineDescriptionFieldWrapStyle,
  suggestionButtonStyle,
  suggestionsDropdownStyle,
  tagBadgeStyle,
  tagBadgesWrapStyle,
  tagFieldWrapStyle,
  tagRemoveButtonStyle,
} from './level3SectionStyles'
import {
  getTransactionDateLabel,
  normalizeAmountInput,
  type MoveTarget,
  type Transaction,
} from './Level3SectionUtils'

type PaymentSourceOption = {
  id: string
  name: string
  type: string
  optionLabel?: string
}

type Level3TransactionRowProps = {
  transaction: Transaction
  selectedMonth: string
  isSelectedMonthLocked: boolean
  isSelected: boolean
  isEditing: boolean
  isMovingCurrent: boolean
  isUpdating: boolean
  isMoving: boolean
  moveTargetCategoryId: string
  moveTargets: MoveTarget[]
  transactionTags: Tag[]
  editDay: string
  setEditDay: Dispatch<SetStateAction<string>>
  editAmount: string
  setEditAmount: Dispatch<SetStateAction<string>>
  editDescription: string
  setEditDescription: Dispatch<SetStateAction<string>>
  editTagNames: string[]
  setEditTagNames: Dispatch<SetStateAction<string[]>>
  editTagInput: string
  setEditTagInput: Dispatch<SetStateAction<string>>
  editPaymentSourceId: string
  setEditPaymentSourceId: Dispatch<SetStateAction<string>>
  editPaymentSplitItems: PaymentSplitInput[]
  setEditPaymentSplitItems: Dispatch<SetStateAction<PaymentSplitInput[]>>
  editDayInputRef: RefObject<HTMLInputElement | null>
  editAmountInputRef: RefObject<HTMLInputElement | null>
  editDescriptionInputRef: RefObject<HTMLInputElement | null>
  filteredEditSuggestions: DescriptionSuggestion[]
  activeEditSuggestionIndex: number
  handleEditSuggestionKeyDown: (event: KeyboardEvent<HTMLInputElement>) => boolean
  applyEditSuggestion: (text: string) => void
  handleEditSuggestionContextMenu: (
    event: MouseEvent<HTMLButtonElement>,
    suggestion: DescriptionSuggestion
  ) => void
  handleEditSuggestionPointerDown: (
    suggestion: DescriptionSuggestion,
    event: PointerEvent<HTMLButtonElement>
  ) => void
  handleEditSuggestionPointerUp: () => void
  handleEditSuggestionPointerLeave: () => void
  handleEditFieldKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    transactionId: string,
    field: 'amount' | 'description' | 'tags'
  ) => Promise<void>
  setIsEditDescriptionFocused: Dispatch<SetStateAction<boolean>>
  setMoveTargetCategoryId: Dispatch<SetStateAction<string>>
  onToggleTransactionSelection: (transactionId: string) => void
  onTagClick?: (tagId: string) => void
  getAmountNumber: (value: unknown) => number
  getPaymentSourceOptions: (categoryId: string) => PaymentSourceOption[]
  transactionPaymentSplitsMap: Record<string, TransactionPaymentSplit[]>
  canUsePaymentSources: boolean
  startEditingTransaction: (transaction: Transaction) => void
  cancelEditingTransaction: () => void
  saveEditingTransaction: (transactionId: string) => Promise<void>
  startMovingTransaction: (transaction: Transaction) => void
  cancelMovingTransaction: () => void
  saveMovingTransaction: (transactionId: string) => Promise<void>
  handleDeleteTransaction: (id: string) => Promise<void>
  handleDuplicateTransaction?: (transaction: Transaction) => void
  styles: Record<string, CSSProperties>
}

export default function Level3TransactionRow({
  transaction,
  selectedMonth,
  isSelectedMonthLocked,
  isSelected,
  isEditing,
  isMovingCurrent,
  isUpdating,
  isMoving,
  moveTargetCategoryId,
  moveTargets,
  transactionTags,
  editDay,
  setEditDay,
  editAmount,
  setEditAmount,
  editDescription,
  setEditDescription,
  editTagNames,
  setEditTagNames,
  editTagInput,
  setEditTagInput,
  editPaymentSourceId,
  setEditPaymentSourceId,
  editPaymentSplitItems,
  setEditPaymentSplitItems,
  editDayInputRef,
  editAmountInputRef,
  editDescriptionInputRef,
  filteredEditSuggestions,
  activeEditSuggestionIndex,
  handleEditSuggestionKeyDown,
  applyEditSuggestion,
  handleEditSuggestionContextMenu,
  handleEditSuggestionPointerDown,
  handleEditSuggestionPointerUp,
  handleEditSuggestionPointerLeave,
  handleEditFieldKeyDown,
  setIsEditDescriptionFocused,
  setMoveTargetCategoryId,
  onToggleTransactionSelection,
  onTagClick,
  getAmountNumber,
  getPaymentSourceOptions,
  transactionPaymentSplitsMap,
  canUsePaymentSources,
  startEditingTransaction,
  cancelEditingTransaction,
  saveEditingTransaction,
  startMovingTransaction,
  cancelMovingTransaction,
  saveMovingTransaction,
  handleDeleteTransaction,
  handleDuplicateTransaction,
  styles,
}: Level3TransactionRowProps) {
  const paymentSourceLabels = getTransactionPaymentSourceDisplayLines({
    transaction,
    splitItems: transactionPaymentSplitsMap[transaction.id] || [],
    paymentSourceOptions: getPaymentSourceOptions(transaction.category_id),
  })

  return (
    <div style={styles.transactionRow}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {
            onToggleTransactionSelection(transaction.id)
          }}
          onClick={(event) => event.stopPropagation()}
          style={{ marginTop: 4 }}
        />

        <div style={styles.transactionLeft}>
          {isEditing && !isSelectedMonthLocked ? (
            <>
              <input
                ref={editDayInputRef}
                style={styles.smallInput}
                value={editDay}
                onChange={(event) => setEditDay(normalizeDayInput(event.target.value, selectedMonth))}
                placeholder="dzień"
                inputMode="numeric"
                onBlur={() => {
                  setEditDay((prev) => normalizeDayInput(prev, selectedMonth))
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    editDescriptionInputRef.current?.focus()
                  }
                }}
              />

              <div style={inlineDescriptionFieldWrapStyle}>
                <input
                  ref={editDescriptionInputRef}
                  style={styles.input}
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  placeholder="opis"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  onFocus={() => setIsEditDescriptionFocused(true)}
                  onBlur={() => setIsEditDescriptionFocused(false)}
                  onKeyDown={async (event) => {
                    if (handleEditSuggestionKeyDown(event)) {
                      return
                    }

                    if (event.key === 'Escape') {
                      event.preventDefault()
                      cancelEditingTransaction()
                      return
                    }

                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      editAmountInputRef.current?.focus()
                    }
                  }}
                />

                {filteredEditSuggestions.length > 0 && (
                  <div style={suggestionsDropdownStyle}>
                    {filteredEditSuggestions.map((suggestion, index) => {
                      const isActive = index === activeEditSuggestionIndex
                      const isLast = index === filteredEditSuggestions.length - 1

                      return (
                        <button
                          key={`edit-${transaction.id}-${suggestion.text}`}
                          type="button"
                          style={{
                            ...(isActive ? activeSuggestionButtonStyle : suggestionButtonStyle),
                            borderBottom: isLast ? 'none' : suggestionButtonStyle.borderBottom,
                          }}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            applyEditSuggestion(suggestion.text)
                          }}
                          onContextMenu={(event) => {
                            handleEditSuggestionContextMenu(event, suggestion)
                          }}
                          onPointerDown={(event) => {
                            handleEditSuggestionPointerDown(suggestion, event)
                          }}
                          onPointerUp={handleEditSuggestionPointerUp}
                          onPointerLeave={handleEditSuggestionPointerLeave}
                          onPointerCancel={handleEditSuggestionPointerLeave}
                        >
                          {suggestion.text}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <input
                ref={editAmountInputRef}
                style={styles.smallInput}
                value={editAmount}
                onChange={(event) => setEditAmount(normalizeAmountInput(event.target.value))}
                placeholder="kwota"
                onKeyDown={async (event) => {
                  await handleEditFieldKeyDown(event, transaction.id, 'description')
                }}
              />

              <div style={tagFieldWrapStyle}>
                <input
                  style={styles.input}
                  value={editTagInput}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setEditTagInput(nextValue)
                    setEditTagNames(splitTagInput(nextValue))
                  }}
                  placeholder="tagi, po przecinku"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  onKeyDown={async (event) => {
                    await handleEditFieldKeyDown(event, transaction.id, 'tags')
                  }}
                />

                {editTagNames.length > 0 && (
                  <div style={tagBadgesWrapStyle}>
                    {editTagNames.map((tagName) => (
                      <span key={tagName} style={tagBadgeStyle}>
                        #{tagName}
                        <button
                          type="button"
                          style={tagRemoveButtonStyle}
                          onClick={() => {
                            const nextTagNames = editTagNames.filter((item) => item !== tagName)
                            setEditTagNames(nextTagNames)
                            setEditTagInput(nextTagNames.join(', '))
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <PaymentSplitEditor
                amount={editAmount}
                selectedPaymentSourceId={editPaymentSourceId}
                setSelectedPaymentSourceId={setEditPaymentSourceId}
                isVisible={canUsePaymentSources}
                paymentSourceOptions={getPaymentSourceOptions(transaction.category_id)}
                paymentSplitItems={editPaymentSplitItems}
                setPaymentSplitItems={setEditPaymentSplitItems}
                styles={styles}
              />

              <div style={styles.dateText}>{getTransactionDateLabel(transaction)}</div>
            </>
          ) : isMovingCurrent && !isSelectedMonthLocked ? (
            <>
              <div style={styles.amountText}>{getAmountNumber(transaction.amount)}</div>
              <div>{transaction.description || '(bez opisu)'}</div>
              {transactionTags.length > 0 && (
                <div style={tagBadgesWrapStyle}>
                  {transactionTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      style={clickableTagBadgeStyle}
                      onClick={() => {
                        onTagClick?.(tag.id)
                      }}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              )}
              <div style={styles.dateText}>{getTransactionDateLabel(transaction)}</div>
              <select
                style={styles.input}
                value={moveTargetCategoryId}
                onChange={(event) => setMoveTargetCategoryId(event.target.value)}
              >
                <option value="">Wybierz kategorię</option>
                {moveTargets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.label}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <div style={styles.amountText}>{getAmountNumber(transaction.amount)}</div>
              <div>{transaction.description || '(bez opisu)'}</div>
              {paymentSourceLabels.map((label) => (
                <div key={`${transaction.id}-${label}`} style={styles.dateText}>
                  {label}
                </div>
              ))}
              {transactionTags.length > 0 && (
                <div style={tagBadgesWrapStyle}>
                  {transactionTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      style={clickableTagBadgeStyle}
                      onClick={() => {
                        onTagClick?.(tag.id)
                      }}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              )}
              <div style={styles.dateText}>{getTransactionDateLabel(transaction)}</div>
            </>
          )}
        </div>
      </div>

      <div style={styles.actions}>
        <div style={styles.dateText}>miesiąc: {selectedMonth}</div>

        {isEditing && !isSelectedMonthLocked ? (
          <>
            <button
              style={{ ...styles.primaryButton, ...compactPrimaryButtonStyle }}
              disabled={isUpdating}
              onClick={async () => {
                await saveEditingTransaction(transaction.id)
              }}
            >
              {isUpdating ? 'zapisywanie...' : 'zapisz'}
            </button>

            <button
              style={{ ...styles.secondaryButton, ...compactSecondaryButtonStyle }}
              onClick={() => {
                cancelEditingTransaction()
              }}
            >
              anuluj
            </button>
          </>
        ) : isMovingCurrent && !isSelectedMonthLocked ? (
          <>
            <button
              style={{ ...styles.primaryButton, ...compactPrimaryButtonStyle }}
              disabled={isMoving || !moveTargetCategoryId}
              onClick={async () => {
                await saveMovingTransaction(transaction.id)
              }}
            >
              {isMoving ? 'zapisywanie...' : 'zapisz'}
            </button>

            <button
              style={{ ...styles.secondaryButton, ...compactSecondaryButtonStyle }}
              onClick={() => {
                cancelMovingTransaction()
              }}
            >
              anuluj
            </button>
          </>
        ) : !isSelectedMonthLocked ? (
          <>
            <button
              style={styles.secondaryButton}
              onClick={() => {
                startEditingTransaction(transaction)
              }}
            >
              edytuj
            </button>

            <button
              style={styles.secondaryButton}
              onClick={() => {
                startMovingTransaction(transaction)
              }}
            >
              przenieś
            </button>

            {handleDuplicateTransaction && (
              <button
                style={styles.secondaryButton}
                onClick={() => {
                  handleDuplicateTransaction(transaction)
                }}
              >
                powiel wpis
              </button>
            )}

            <button
              style={styles.secondaryButton}
              onClick={async () => {
                await handleDeleteTransaction(transaction.id)
              }}
            >
              usuń
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
