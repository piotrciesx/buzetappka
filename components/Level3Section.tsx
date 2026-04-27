'use client'

import { CSSProperties, KeyboardEvent, useMemo, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DescriptionSuggestionDeleteMenu from './DescriptionSuggestionDeleteMenu'
import MonthCalendarPanel from './MonthCalendarPanel'
import PaymentSplitEditor from './PaymentSplitEditor'
import { buildDateFromDayInput, getDayInputFromDate, normalizeDayInput } from '../lib/dateUtils'
import { Tag, TransactionPaymentSplit } from '../lib/budgetPageTypes'
import {
  createPaymentSplitItemsFromStoredSplits,
  getTransactionPaymentSourceDisplayLines,
  PaymentSplitInput,
} from '../lib/paymentSplitUtils'
import { DescriptionSuggestion, DescriptionSuggestionSet } from '../lib/suggestionUtils'
import { splitTagInput } from '../lib/tagUtils'
import { useDescriptionSuggestions } from '../lib/useDescriptionSuggestions'

const normalizeAmountInput = (value: string) => {
  return value.replace(',', '.')
}

type Category = {
  id: string
  name: string
  parent_id: string | null
  level: number
  sort_order?: number | null
  active_to?: string | null
  reactivate_from?: string | null
}

type Transaction = {
  id: string
  category_id: string
  amount: number | string
  description: string | null
  date: string
  day_is_null?: boolean
  payment_source_id?: string | null
  created_at?: string
  is_deleted?: boolean
  deleted_at?: string | null
}

type MoveTarget = {
  id: string
  label: string
}

type HideMode = 'now' | 'next'

type Props = {
  l3: Category
  selectedMonth: string
  isClosingAfterSelectedMonth: boolean
  categorySum: number
  transactions: Transaction[]
  canAddHere: boolean
  isSelectedMonthLocked: boolean
  isOpen: boolean
  toggleLevel3: (id: string) => void
  handleLevel3DragStart: (activeId: string) => void
  openTransactionCreator: (suggestedCategoryId: string) => void
  handleInlineSaveTransaction: (
    categoryId: string,
    amountText: string,
    descriptionText: string,
    dayText: string,
    tagNames?: string[],
    paymentSourceId?: string | null,
    paymentSplitItems?: PaymentSplitInput[]
  ) => Promise<void>
  handleHideCategory: (id: string, mode?: HideMode) => Promise<void>
  handleUndoScheduledHide: (id: string) => Promise<void>
  handleDeleteTransaction: (id: string) => Promise<void>
  handleUpdateTransaction: (
    id: string,
    amount: string,
    description: string,
    date: string,
    tagNames?: string[],
    dayIsNullOverride?: boolean,
    paymentSourceId?: string | null,
    paymentSplitItems?: PaymentSplitInput[]
  ) => Promise<void>
  handleMoveTransaction: (id: string, targetCategoryId: string) => Promise<void>
  handleOpenCalendarAddForDay: (categoryId: string, dayText: string) => void
  selectedTransactionIds: string[]
  onToggleTransactionSelection: (transactionId: string) => void
  getMoveTargetsForTransaction: (transaction: Transaction) => MoveTarget[]
  getSignedAmountForTransaction: (transaction: Transaction) => number
  calendarHeatmapVariant: 'balance' | 'income' | 'expense'
  heatmapStorageKey: string
  descriptionSuggestions: DescriptionSuggestionSet
  getPaymentSourceOptionsForCategoryId?: (
    categoryId: string
  ) => Array<{
    id: string
    name: string
    type: string
    optionLabel?: string
  }>
  transactionTagsMap: Record<string, Tag[]>
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
  onTagClick?: (tagId: string) => void
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
  isSortable?: boolean
  isDragDisabled?: boolean
  getAmountNumber: (value: unknown) => number
  styles: Record<string, CSSProperties>
}

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

const tagFieldWrapStyle = {
  marginTop: 8,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
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

const clickableTagBadgeStyle = {
  ...tagBadgeStyle,
  cursor: 'pointer',
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

export default function Level3Section(props: Props) {
  const {
    l3,
    selectedMonth,
    isClosingAfterSelectedMonth,
    categorySum,
    transactions,
    canAddHere,
    isSelectedMonthLocked,
    isOpen,
    toggleLevel3,
    handleLevel3DragStart,
    handleInlineSaveTransaction,
    handleHideCategory,
    handleUndoScheduledHide,
    handleDeleteTransaction,
    handleUpdateTransaction,
    handleMoveTransaction,
    handleOpenCalendarAddForDay,
    selectedTransactionIds,
    onToggleTransactionSelection,
    getMoveTargetsForTransaction,
    getSignedAmountForTransaction,
    calendarHeatmapVariant,
    heatmapStorageKey,
    descriptionSuggestions,
    getPaymentSourceOptionsForCategoryId,
    transactionTagsMap,
    transactionPaymentSplitsMap = {},
    onTagClick,
    onDeleteDescriptionSuggestion,
    isSortable = false,
    isDragDisabled = false,
    getAmountNumber,
    styles,
  } = props

  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [editDay, setEditDay] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTagNames, setEditTagNames] = useState<string[]>([])
  const [editTagInput, setEditTagInput] = useState('')
  const [editPaymentSourceId, setEditPaymentSourceId] = useState('')
  const [editPaymentSplitItems, setEditPaymentSplitItems] = useState<PaymentSplitInput[]>([])
  const [isEditDescriptionFocused, setIsEditDescriptionFocused] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const editAmountInputRef = useRef<HTMLInputElement | null>(null)
  const editDescriptionInputRef = useRef<HTMLInputElement | null>(null)

  const [movingTransactionId, setMovingTransactionId] = useState<string | null>(null)
  const [moveTargetCategoryId, setMoveTargetCategoryId] = useState('')
  const [isMoving, setIsMoving] = useState(false)

  const [isInlineAdding, setIsInlineAdding] = useState(false)
  const [inlineDay, setInlineDay] = useState('')
  const [inlineAmount, setInlineAmount] = useState('')
  const [inlineDescription, setInlineDescription] = useState('')
  const [inlineTagNames, setInlineTagNames] = useState<string[]>([])
  const [inlineTagInput, setInlineTagInput] = useState('')
  const [inlinePaymentSourceId, setInlinePaymentSourceId] = useState('')
  const [inlinePaymentSplitItems, setInlinePaymentSplitItems] = useState<PaymentSplitInput[]>([])
  const [isInlineSaving, setIsInlineSaving] = useState(false)
  const inlineAmountInputRef = useRef<HTMLInputElement | null>(null)
  const inlineDescriptionInputRef = useRef<HTMLInputElement | null>(null)

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const {
    filteredSuggestions: filteredEditSuggestions,
    activeSuggestionIndex: activeEditSuggestionIndex,
    applySuggestion: applyEditSuggestion,
    handleKeyDown: handleEditSuggestionKeyDown,
    handleSuggestionContextMenu: handleEditSuggestionContextMenu,
    handleSuggestionPointerDown: handleEditSuggestionPointerDown,
    handleSuggestionPointerUp: handleEditSuggestionPointerUp,
    handleSuggestionPointerLeave: handleEditSuggestionPointerLeave,
  } = useDescriptionSuggestions({
    query: editDescription,
    setQuery: setEditDescription,
    categoryId: l3.id,
    isEnabled: isEditDescriptionFocused,
    descriptionSuggestions,
    inputRef: editDescriptionInputRef,
    onDeleteSuggestion: onDeleteDescriptionSuggestion,
  })

  const {
    filteredSuggestions: filteredInlineSuggestions,
    activeSuggestionIndex: activeInlineSuggestionIndex,
    applySuggestion: applyInlineSuggestion,
    handleKeyDown: handleInlineSuggestionKeyDown,
    handleSuggestionContextMenu: handleInlineSuggestionContextMenu,
    handleSuggestionPointerDown: handleInlineSuggestionPointerDown,
    handleSuggestionPointerUp: handleInlineSuggestionPointerUp,
    handleSuggestionPointerLeave: handleInlineSuggestionPointerLeave,
    suggestionToDelete: inlineSuggestionToDelete,
    deletePromptPosition: inlineDeletePromptPosition,
    closeDeletePrompt: closeInlineDeletePrompt,
    confirmDeleteSuggestion: confirmDeleteInlineSuggestion,
  } = useDescriptionSuggestions({
    query: inlineDescription,
    setQuery: setInlineDescription,
    categoryId: l3.id,
    descriptionSuggestions,
    inputRef: inlineDescriptionInputRef,
    onDeleteSuggestion: onDeleteDescriptionSuggestion,
  })

  const isDragBlocked = isDragDisabled || isOpen
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: l3.id,
    disabled: !isSortable || isDragBlocked,
  })

  const wrapStyle: CSSProperties = {
    ...styles.l3Wrap,
    transform: CSS.Transform.toString(transform),
    transition: 'none',
    opacity: isDragging ? 0.7 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : 'auto',
  }

  const dragHandleStyle: CSSProperties = {
    ...(styles.dragHandle || {}),
    ...(isDragBlocked ? styles.dragHandleDisabled || {} : {}),
    cursor: isDragBlocked ? 'not-allowed' : 'grab',
    opacity: isDragBlocked ? 0.45 : styles.dragHandle?.opacity,
  }

  const dragHandleTitle = isDragBlocked ? 'Aby przenosić, najpierw zwiń kategorię' : undefined

  const getTransactionTagNames = (transactionId: string) => {
    return (transactionTagsMap[transactionId] || []).map((tag) => tag.name)
  }

  const startEditingTransaction = (transaction: Transaction) => {
    const nextTagNames = getTransactionTagNames(transaction.id)

    setMovingTransactionId(null)
    setMoveTargetCategoryId('')
    setEditingTransactionId(transaction.id)
    setEditDay(getDayInputFromDate(transaction.date, selectedMonth))
    setEditAmount(String(getAmountNumber(transaction.amount)))
    setEditDescription(transaction.description || '')
    setEditTagNames(nextTagNames)
    setEditTagInput(nextTagNames.join(', '))
    setEditPaymentSourceId(transaction.payment_source_id || '')
    setEditPaymentSplitItems(
      createPaymentSplitItemsFromStoredSplits(transactionPaymentSplitsMap[transaction.id] || [])
    )
  }

  const cancelEditingTransaction = () => {
    setEditingTransactionId(null)
    setEditDay('')
    setEditAmount('')
    setEditDescription('')
    setEditTagNames([])
    setEditTagInput('')
    setEditPaymentSourceId('')
    setEditPaymentSplitItems([])
    setIsUpdating(false)
  }

  const saveEditingTransaction = async (transactionId: string) => {
    if (isUpdating) {
      return
    }

    setIsUpdating(true)

    try {
      const nextTransactionDate = buildDateFromDayInput(selectedMonth, editDay)
      await handleUpdateTransaction(
        transactionId,
        editAmount,
        editDescription,
        nextTransactionDate,
        editTagNames,
        undefined,
        editPaymentSourceId || null,
        editPaymentSplitItems
      )
      cancelEditingTransaction()
    } catch {
      setIsUpdating(false)
    }
  }

  const handleEditFieldKeyDown = async (
    event: KeyboardEvent<HTMLInputElement>,
    transactionId: string,
    field: 'amount' | 'description' | 'tags'
  ) => {
    if (field === 'description' && handleEditSuggestionKeyDown(event)) {
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      cancelEditingTransaction()
      return
    }

    if (event.key !== 'Enter' || event.shiftKey) {
      return
    }

    event.preventDefault()

    if (field === 'amount') {
      editDescriptionInputRef.current?.focus()
      return
    }

    await saveEditingTransaction(transactionId)
  }

  const startMovingTransaction = (transaction: Transaction) => {
    setEditingTransactionId(null)
    setEditAmount('')
    setEditDescription('')
    setEditTagNames([])
    setEditTagInput('')
    setEditPaymentSourceId('')
    setEditPaymentSplitItems([])
    setMovingTransactionId(transaction.id)
    setMoveTargetCategoryId('')
  }

  const cancelMovingTransaction = () => {
    setMovingTransactionId(null)
    setMoveTargetCategoryId('')
    setIsMoving(false)
  }

  const saveMovingTransaction = async (transactionId: string) => {
    if (isMoving || !moveTargetCategoryId) {
      return
    }

    setIsMoving(true)

    try {
      await handleMoveTransaction(transactionId, moveTargetCategoryId)
      cancelMovingTransaction()
    } catch {
      setIsMoving(false)
    }
  }

  const openInlineAdd = () => {
    setIsInlineAdding(true)
    setInlineDay('')
    setInlineAmount('')
    setInlineDescription('')
    setInlineTagNames([])
    setInlineTagInput('')
    setInlinePaymentSourceId('')
    setInlinePaymentSplitItems([])

    if (!isOpen) {
      toggleLevel3(l3.id)
    }

    window.setTimeout(() => {
      inlineAmountInputRef.current?.focus()
    }, 0)
  }

  const cancelInlineAdd = () => {
    setIsInlineAdding(false)
    setInlineDay('')
    setInlineAmount('')
    setInlineDescription('')
    setInlineTagNames([])
    setInlineTagInput('')
    setInlinePaymentSourceId('')
    setInlinePaymentSplitItems([])
    setIsInlineSaving(false)
  }

  const saveInlineAdd = async () => {
    if (isInlineSaving) {
      return
    }

    setIsInlineSaving(true)

    try {
      await handleInlineSaveTransaction(
        l3.id,
        inlineAmount,
        inlineDescription,
        inlineDay,
        inlineTagNames,
        inlinePaymentSourceId || null,
        inlinePaymentSplitItems
      )
      cancelInlineAdd()
    } catch {
      setIsInlineSaving(false)
    }
  }

  const orderedTransactions = useMemo(() => {
    return [...transactions].sort((left, right) => {
      const leftNoDay = Boolean(left.day_is_null)
      const rightNoDay = Boolean(right.day_is_null)

      if (leftNoDay !== rightNoDay) {
        return leftNoDay ? 1 : -1
      }

      return right.date.localeCompare(left.date)
    })
  }, [transactions])

  const getTransactionDateLabel = (transaction: Transaction) => {
    return transaction.day_is_null ? 'brak dnia' : transaction.date
  }

  const getTransactionPaymentSourceLabels = (transaction: Transaction) => {
    return getTransactionPaymentSourceDisplayLines({
      transaction,
      splitItems: transactionPaymentSplitsMap[transaction.id] || [],
      paymentSourceOptions: getPaymentSourceOptionsForCategoryId?.(transaction.category_id) || [],
    })
  }

  return (
    <div ref={setNodeRef} style={wrapStyle}>
      <div
        style={{
          ...styles.l3Header,
          boxShadow: isDragging ? '0 12px 24px rgba(0, 0, 0, 0.12)' : styles.l3Header.boxShadow,
        }}
        onClick={() => {
          if (!isDragging) {
            toggleLevel3(l3.id)
          }
        }}
      >
        <div style={styles.l2Left}>
          {isSortable && (
            <button
              type="button"
              aria-label={`Przeciągnij kategorię ${l3.name}`}
              title={dragHandleTitle}
              style={dragHandleStyle}
              disabled={isDragBlocked}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => {
                event.stopPropagation()
                handleLevel3DragStart(l3.id)
              }}
              {...attributes}
              {...listeners}
            >
              ::
            </button>
          )}

          <div style={styles.arrow}>{isOpen ? '▾' : '▸'}</div>

          <div>
            <div style={styles.l3Name}>
              {l3.name} • {categorySum}
            </div>

            {isClosingAfterSelectedMonth && (
              <div style={styles.closingBadge}>zamknie się z końcem tego miesiąca</div>
            )}
          </div>
        </div>

        <div style={styles.actions} onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            style={styles.secondaryButton}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              setIsCalendarOpen((prev) => !prev)
            }}
          >
            {isCalendarOpen ? 'zamknij kalendarz' : 'kalendarz'}
          </button>

          {canAddHere && !isSelectedMonthLocked && (
            <button
              style={styles.primaryButton}
              onClick={() => {
                openInlineAdd()
              }}
            >
              + wpis
            </button>
          )}

          {isClosingAfterSelectedMonth ? (
            <button
              style={styles.secondaryButton}
              onClick={async () => {
                await handleUndoScheduledHide(l3.id)
              }}
            >
              cofnij zamknięcie
            </button>
          ) : (
            <>
              <button
                style={styles.dangerButton}
                onClick={async () => {
                  await handleHideCategory(l3.id, 'now')
                }}
              >
                ukryj teraz
              </button>

              <button
                style={styles.dangerButton}
                onClick={async () => {
                  await handleHideCategory(l3.id, 'next')
                }}
              >
                ukryj od następnego
              </button>
            </>
          )}
        </div>
      </div>

      {isCalendarOpen && (
        <MonthCalendarPanel
          selectedMonth={selectedMonth}
          transactions={transactions}
          styles={styles}
          isSelectedMonthLocked={isSelectedMonthLocked}
          getAmountNumber={getAmountNumber}
          getMoveTargetsForTransaction={getMoveTargetsForTransaction}
          getSignedAmountForTransaction={getSignedAmountForTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onMoveTransaction={handleMoveTransaction}
          heatmapVariant={calendarHeatmapVariant}
          heatmapStorageKey={heatmapStorageKey}
          descriptionSuggestions={descriptionSuggestions}
          transactionTagsMap={transactionTagsMap}
          onTagClick={onTagClick}
          onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
          onAddTransactionForDay={(dayText) => handleOpenCalendarAddForDay(l3.id, dayText)}
          calendarTitle={`Kalendarz • ${l3.name}`}
          calendarSubtitle="Kliknij dzień, aby zobaczyć wpisy z tego Level 3 lub dodać nowy wpis."
        />
      )}

      <DescriptionSuggestionDeleteMenu
        isOpen={Boolean(inlineSuggestionToDelete)}
        x={inlineDeletePromptPosition.x}
        y={inlineDeletePromptPosition.y}
        onConfirm={confirmDeleteInlineSuggestion}
        onCancel={closeInlineDeletePrompt}
      />

      {isOpen && (
        <div style={styles.transactionsBox}>
          {isInlineAdding && !isSelectedMonthLocked && (
            <div style={styles.formRow}>
              <input
                style={styles.smallInput}
                value={inlineDay}
                onChange={(event) =>
                  setInlineDay(normalizeDayInput(event.target.value, selectedMonth))
                }
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

              {(getPaymentSourceOptionsForCategoryId?.(l3.id) || []).length > 0 && (
                <div style={{ minWidth: 280, flex: 1 }}>
                  <PaymentSplitEditor
                    amount={inlineAmount}
                    isVisible
                    selectedPaymentSourceId={inlinePaymentSourceId}
                    setSelectedPaymentSourceId={setInlinePaymentSourceId}
                    paymentSourceOptions={getPaymentSourceOptionsForCategoryId?.(l3.id) || []}
                    paymentSplitItems={inlinePaymentSplitItems}
                    setPaymentSplitItems={setInlinePaymentSplitItems}
                    styles={styles}
                  />
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
          )}

          {orderedTransactions.length === 0 && <div style={styles.emptyText}>Brak wpisów w tym miesiącu</div>}

          {orderedTransactions.map((transaction) => {
            const isEditing = editingTransactionId === transaction.id
            const isMovingCurrent = movingTransactionId === transaction.id
            const moveTargets = getMoveTargetsForTransaction(transaction)
            const isSelected = selectedTransactionIds.includes(transaction.id)
            const transactionTags = transactionTagsMap[transaction.id] || []

            return (
              <div key={transaction.id} style={styles.transactionRow}>
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
                          style={styles.smallInput}
                          value={editDay}
                          onChange={(event) =>
                            setEditDay(normalizeDayInput(event.target.value, selectedMonth))
                          }
                          placeholder="dzień"
                          inputMode="numeric"
                          onBlur={() => {
                            setEditDay((prev) => normalizeDayInput(prev, selectedMonth))
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              editAmountInputRef.current?.focus()
                            }
                          }}
                        />

                        <input
                          ref={editAmountInputRef}
                          style={styles.smallInput}
                          value={editAmount}
                          onChange={(event) => setEditAmount(normalizeAmountInput(event.target.value))}
                          placeholder="kwota"
                          onKeyDown={async (event) => {
                            await handleEditFieldKeyDown(event, transaction.id, 'amount')
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
                              await handleEditFieldKeyDown(event, transaction.id, 'description')
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
                                      ...(isActive
                                        ? activeSuggestionButtonStyle
                                        : suggestionButtonStyle),
                                      borderBottom: isLast
                                        ? 'none'
                                        : suggestionButtonStyle.borderBottom,
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
                                      const nextTagNames = editTagNames.filter(
                                        (item) => item !== tagName
                                      )
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
                          isVisible
                          selectedPaymentSourceId={editPaymentSourceId}
                          setSelectedPaymentSourceId={setEditPaymentSourceId}
                          paymentSourceOptions={
                            getPaymentSourceOptionsForCategoryId?.(transaction.category_id) || []
                          }
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
                        {getTransactionPaymentSourceLabels(transaction).map((label) => (
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
          })}
        </div>
      )}
    </div>
  )
}
