import {
  Dispatch,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  RefObject,
  SetStateAction,
} from 'react'
import PaymentSplitEditor from '../PaymentSplitEditor'
import { DescriptionSuggestion } from '../../lib/suggestionUtils'
import { splitTagInput } from '../../lib/tagUtils'
import { normalizeDayInput } from '../../lib/dateUtils'
import { PaymentSplitInput, getTransactionPaymentSourceDisplayLines } from '../../lib/paymentSplitUtils'
import { isDaylessTransaction } from '../../lib/transactionDomain'
import { MonthCalendarPanelProps, Transaction } from './monthCalendarTypes'
import { formatAmount, normalizeAmountInput } from './monthCalendarPanelUtils'
import {
  badgeStyle,
  calendarDayMetaStyle,
  dangerButtonStyle,
  descriptionFieldWrapStyle,
  formRowStyle,
  noDayHintStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  smallInputStyle,
  suggestionButtonBaseStyle,
  suggestionsDropdownStyle,
  tagBadgeStyle,
  tagBadgesWrapStyle,
  tagFieldWrapStyle,
  tagRemoveButtonStyle,
  transactionActionsStyle,
  transactionAmountStyle,
  transactionCardStyle,
  transactionDescriptionStyle,
  transactionTagBadgeStyle,
  transactionTagsStyle,
  transactionTopRowStyle,
  wideInputStyle,
} from './monthCalendarStyles'
import {
  CalendarEntryRow,
  ReminderActionRow,
  ReminderStatusBadge,
} from '../reminder-calendar/reminderCalendarPrimitives'

type Props = {
  transaction: Transaction
  context: 'day' | 'no-day'
  selectedMonth: string
  isSelectedMonthLocked: boolean
  heatmapVariant: MonthCalendarPanelProps['heatmapVariant']
  styles: MonthCalendarPanelProps['styles']
  getAmountNumber: MonthCalendarPanelProps['getAmountNumber']
  getMoveTargetsForTransaction: MonthCalendarPanelProps['getMoveTargetsForTransaction']
  getSignedAmountForTransaction: MonthCalendarPanelProps['getSignedAmountForTransaction']
  getPaymentSourceOptionsForCategoryId: MonthCalendarPanelProps['getPaymentSourceOptionsForCategoryId']
  transactionTagsMap: NonNullable<MonthCalendarPanelProps['transactionTagsMap']>
  transactionPaymentSplitsMap: NonNullable<MonthCalendarPanelProps['transactionPaymentSplitsMap']>
  onTagClick: MonthCalendarPanelProps['onTagClick']
  onDeleteTransaction: MonthCalendarPanelProps['onDeleteTransaction']
  onDuplicateTransaction: MonthCalendarPanelProps['onDuplicateTransaction']
  editingTransactionId: string | null
  movingTransactionId: string | null
  moveTargetCategoryId: string
  editDay: string
  editAmount: string
  editDescription: string
  editTagNames: string[]
  editTagInput: string
  editPaymentSourceId: string
  editPaymentSplitItems: PaymentSplitInput[]
  isUpdating: boolean
  isMoving: boolean
  activeSuggestionIndex: number
  filteredDescriptionSuggestions: DescriptionSuggestion[]
  editAmountInputRef: RefObject<HTMLInputElement | null>
  editDescriptionInputRef: RefObject<HTMLInputElement | null>
  setEditDay: Dispatch<SetStateAction<string>>
  setEditAmount: Dispatch<SetStateAction<string>>
  setEditDescription: Dispatch<SetStateAction<string>>
  setEditTagNames: Dispatch<SetStateAction<string[]>>
  setEditTagInput: Dispatch<SetStateAction<string>>
  setEditPaymentSourceId: Dispatch<SetStateAction<string>>
  setEditPaymentSplitItems: Dispatch<SetStateAction<PaymentSplitInput[]>>
  setIsEditDescriptionFocused: Dispatch<SetStateAction<boolean>>
  setMoveTargetCategoryId: Dispatch<SetStateAction<string>>
  startEditingTransaction: (transaction: Transaction) => void
  cancelEditingTransaction: () => void
  saveEditingTransaction: (transactionId: string) => Promise<void>
  handleEditFieldKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    transactionId: string,
    fieldName: 'day' | 'amount' | 'description'
  ) => Promise<void>
  startMovingTransaction: (transaction: Transaction) => void
  cancelMovingTransaction: () => void
  saveMovingTransaction: (transactionId: string) => Promise<void>
  applySuggestion: (value: string) => void
  handleSuggestionContextMenu: (
    event: MouseEvent<HTMLButtonElement>,
    suggestion: DescriptionSuggestion
  ) => void
  handleSuggestionPointerDown: (
    suggestion: DescriptionSuggestion,
    event?: PointerEvent<HTMLButtonElement>
  ) => void
  handleSuggestionPointerUp: () => void
  handleSuggestionPointerLeave: () => void
}

export default function MonthCalendarTransactionCard({
  transaction,
  context,
  selectedMonth,
  isSelectedMonthLocked,
  heatmapVariant,
  styles,
  getAmountNumber,
  getMoveTargetsForTransaction,
  getSignedAmountForTransaction,
  getPaymentSourceOptionsForCategoryId,
  transactionTagsMap,
  transactionPaymentSplitsMap,
  onTagClick,
  onDeleteTransaction,
  onDuplicateTransaction,
  editingTransactionId,
  movingTransactionId,
  moveTargetCategoryId,
  editDay,
  editAmount,
  editDescription,
  editTagNames,
  editTagInput,
  editPaymentSourceId,
  editPaymentSplitItems,
  isUpdating,
  isMoving,
  activeSuggestionIndex,
  filteredDescriptionSuggestions,
  editAmountInputRef,
  editDescriptionInputRef,
  setEditDay,
  setEditAmount,
  setEditDescription,
  setEditTagNames,
  setEditTagInput,
  setEditPaymentSourceId,
  setEditPaymentSplitItems,
  setIsEditDescriptionFocused,
  setMoveTargetCategoryId,
  startEditingTransaction,
  cancelEditingTransaction,
  saveEditingTransaction,
  handleEditFieldKeyDown,
  startMovingTransaction,
  cancelMovingTransaction,
  saveMovingTransaction,
  applySuggestion,
  handleSuggestionContextMenu,
  handleSuggestionPointerDown,
  handleSuggestionPointerUp,
  handleSuggestionPointerLeave,
}: Props) {
  const isEditing = editingTransactionId === transaction.id
  const isMovingCurrent = movingTransactionId === transaction.id
  const moveTargets = getMoveTargetsForTransaction(transaction)
  const isNoDayTransaction = isDaylessTransaction(transaction)
  const transactionTags = transactionTagsMap[transaction.id] || []
  const signedAmount = getSignedAmountForTransaction(transaction)
  const showSignedAmount = heatmapVariant === 'balance'
  const paymentSourceOptions = getPaymentSourceOptionsForCategoryId?.(transaction.category_id) || []
  const paymentSourceLabels = getTransactionPaymentSourceDisplayLines({
    transaction,
    splitItems: transactionPaymentSplitsMap[transaction.id] || [],
    paymentSourceOptions,
  })

  return (
    <CalendarEntryRow style={transactionCardStyle}>
      <div style={transactionTopRowStyle}>
        <div
          style={{
            ...transactionAmountStyle,
            color: showSignedAmount
              ? signedAmount > 0
                ? '#15803d'
                : signedAmount < 0
                  ? '#b91c1c'
                  : transactionAmountStyle.color
              : transactionAmountStyle.color,
          }}
        >
          {showSignedAmount
            ? `${signedAmount > 0 ? '+' : signedAmount < 0 ? '-' : ''}${formatAmount(Math.abs(signedAmount))} zł`
            : `${formatAmount(getAmountNumber(transaction.amount))} zł`}
        </div>

        <div style={{ ...calendarDayMetaStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
          {isNoDayTransaction ? (
            <ReminderStatusBadge tone="muted" style={badgeStyle}>bez dnia</ReminderStatusBadge>
          ) : (
            <span>{transaction.date}</span>
          )}
        </div>
      </div>

      {isEditing ? (
        <div style={formRowStyle}>
          <input
            style={smallInputStyle}
            value={editDay}
            onChange={(event) => setEditDay(normalizeDayInput(event.target.value, selectedMonth))}
            placeholder={isNoDayTransaction ? 'dzień (opcjonalnie)' : 'dzień'}
            inputMode="numeric"
            onBlur={() => setEditDay((prev) => normalizeDayInput(prev, selectedMonth))}
            onKeyDown={async (event) => {
              await handleEditFieldKeyDown(event, transaction.id, 'day')
            }}
          />

          <input
            ref={editAmountInputRef}
            style={smallInputStyle}
            value={editAmount}
            onChange={(event) => setEditAmount(normalizeAmountInput(event.target.value))}
            placeholder="kwota"
            onKeyDown={async (event) => {
              await handleEditFieldKeyDown(event, transaction.id, 'amount')
            }}
          />

          <div style={descriptionFieldWrapStyle}>
            <input
              ref={editDescriptionInputRef}
              style={wideInputStyle}
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
              onFocus={() => setIsEditDescriptionFocused(true)}
              onBlur={() => setIsEditDescriptionFocused(false)}
              placeholder="opis"
              onKeyDown={async (event) => {
                await handleEditFieldKeyDown(event, transaction.id, 'description')
              }}
            />

            {filteredDescriptionSuggestions.length > 0 && (
              <div style={suggestionsDropdownStyle}>
                {filteredDescriptionSuggestions.map((suggestion, index) => {
                  const isActive = index === activeSuggestionIndex

                  return (
                    <button
                      key={`${transaction.id}-${suggestion.text}`}
                      type="button"
                      style={{
                        ...suggestionButtonBaseStyle,
                        background: isActive ? '#eff6ff' : '#ffffff',
                        color: isActive ? '#1d4ed8' : '#111827',
                        borderTop: index === 0 ? 'none' : '1px solid #e5e7eb',
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

          <div style={tagFieldWrapStyle}>
            <input
              style={wideInputStyle}
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
                if (event.key === 'Enter') {
                  event.preventDefault()
                  await saveEditingTransaction(transaction.id)
                }
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
            isVisible={paymentSourceOptions.length > 0}
            selectedPaymentSourceId={editPaymentSourceId}
            setSelectedPaymentSourceId={setEditPaymentSourceId}
            paymentSourceOptions={paymentSourceOptions}
            paymentSplitItems={editPaymentSplitItems}
            setPaymentSplitItems={setEditPaymentSplitItems}
            styles={styles}
          />
        </div>
      ) : isMovingCurrent ? (
        <div style={formRowStyle}>
          <select
            style={wideInputStyle}
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
        </div>
      ) : (
        <div>
          <div style={transactionDescriptionStyle}>
            {transaction.description?.trim() || 'Brak opisu'}
          </div>
          {paymentSourceLabels.map((label) => (
            <div key={`${transaction.id}-${label}`} style={{ ...calendarDayMetaStyle, marginTop: 6 }}>
              {label}
            </div>
          ))}

          {transactionTags.length > 0 && (
            <div style={transactionTagsStyle}>
              {transactionTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  style={transactionTagBadgeStyle}
                  onClick={() => onTagClick?.(tag.id)}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!isEditing && context === 'no-day' && (
        <ReminderStatusBadge tone="info" style={noDayHintStyle}>
          Ten wpis należy do miesiąca, ale nie wpływa na konkretny dzień ani heatmapę.
        </ReminderStatusBadge>
      )}

      {!isSelectedMonthLocked && (
        <ReminderActionRow data-calendar-entry-actions="true" style={transactionActionsStyle}>
          {isEditing ? (
            <>
              <button
                type="button"
                style={primaryButtonStyle}
                disabled={isUpdating}
                onClick={async () => {
                  await saveEditingTransaction(transaction.id)
                }}
              >
                {isUpdating ? 'zapisywanie...' : 'zapisz'}
              </button>

              <button type="button" style={secondaryButtonStyle} onClick={cancelEditingTransaction}>
                anuluj
              </button>
            </>
          ) : isMovingCurrent ? (
            <>
              <button
                type="button"
                style={primaryButtonStyle}
                disabled={isMoving || !moveTargetCategoryId}
                onClick={async () => {
                  await saveMovingTransaction(transaction.id)
                }}
              >
                {isMoving ? 'zapisywanie...' : 'zapisz'}
              </button>

              <button type="button" style={secondaryButtonStyle} onClick={cancelMovingTransaction}>
                anuluj
              </button>
            </>
          ) : (
            <>
              {context === 'no-day' && (
                <button
                  type="button"
                  style={primaryButtonStyle}
                  onClick={() => startEditingTransaction(transaction)}
                >
                  dodaj dzień
                </button>
              )}

              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => startEditingTransaction(transaction)}
              >
                edytuj
              </button>

              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => startMovingTransaction(transaction)}
              >
                przenieś
              </button>

              {onDuplicateTransaction && (
                <button
                  type="button"
                  style={secondaryButtonStyle}
                  onClick={() => onDuplicateTransaction(transaction)}
                >
                  powiel wpis
                </button>
              )}

              <button
                type="button"
                style={dangerButtonStyle}
                onClick={async () => {
                  await onDeleteTransaction(transaction.id)
                }}
              >
                usuń
              </button>
            </>
          )}
        </ReminderActionRow>
      )}
    </CalendarEntryRow>
  )
}
