'use client'

import { CSSProperties, KeyboardEvent, useMemo, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DescriptionSuggestionDeleteMenu from './DescriptionSuggestionDeleteMenu'
import PaymentSplitEditor from './PaymentSplitEditor'
import type { BudgetLimitView } from './BudgetLimitIndicator'
import Level3CalendarBlock from './category-tree/Level3CalendarBlock'
import Level3InlineAddForm from './category-tree/Level3InlineAddForm'
import Level3SectionHeader from './category-tree/Level3SectionHeader'
import type { HeatmapMode } from './month-calendar/monthCalendarTypes'
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

type RecurringLinkOption = {
  id: string
  label: string
  description?: string
  amount?: number | null
  useAmountWhenCreating?: boolean
  hasTransactionInMonth?: boolean
}

type HideMode = 'now' | 'next'

type Props = {
  l3: Category
  headerName?: string
  showHeaderSum?: boolean
  showCategoryActions?: boolean
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
    paymentSplitItems?: PaymentSplitInput[],
    recurringTransactionId?: string | null
  ) => Promise<void>
  handleHideCategory: (id: string, mode?: HideMode) => Promise<void>
  handleRenameCategory: (categoryId: string) => Promise<void>
  handleDeleteCategory: (categoryId: string) => Promise<void>
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
  heatmapMode: HeatmapMode
  heatmapInverted: boolean
  onHeatmapModeChange: (value: HeatmapMode) => void
  onHeatmapInvertedChange: (value: boolean) => void
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
  getRecurringOptionsForCategoryId?: (categoryId: string) => RecurringLinkOption[]
  transactionTagsMap: Record<string, Tag[]>
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
  onTagClick?: (tagId: string) => void
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
  budgetLimitView?: BudgetLimitView | null
  canUseBudgetLimit?: boolean
  onEditBudgetLimit?: (categoryId: string | null) => void
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

export default function Level3Section(props: Props) {
  const {
    l3,
    headerName,
    showHeaderSum = true,
    showCategoryActions = true,
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
    handleRenameCategory,
    handleDeleteCategory,
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
    heatmapMode,
    heatmapInverted,
    onHeatmapModeChange,
    onHeatmapInvertedChange,
    heatmapStorageKey,
    descriptionSuggestions,
    getPaymentSourceOptionsForCategoryId,
    getRecurringOptionsForCategoryId,
    transactionTagsMap,
    transactionPaymentSplitsMap = {},
    onTagClick,
    onDeleteDescriptionSuggestion,
    budgetLimitView = null,
    canUseBudgetLimit = false,
    onEditBudgetLimit,
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
  const [inlineRecurringTransactionId, setInlineRecurringTransactionId] = useState('')
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

  const dragHandleTitle = isDragBlocked ? 'Aby przenosić, najpierw zwiń podkategorię' : undefined

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
    setInlineRecurringTransactionId('')

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
    setInlineRecurringTransactionId('')
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
        inlinePaymentSplitItems,
        inlineRecurringTransactionId || null
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
      <Level3SectionHeader
        name={headerName || l3.name}
        categorySum={categorySum}
        showCategorySum={showHeaderSum}
        showCategoryActions={showCategoryActions}
        isOpen={isOpen}
        isDragging={isDragging}
        isClosingAfterSelectedMonth={isClosingAfterSelectedMonth}
        isCalendarOpen={isCalendarOpen}
        canAddHere={canAddHere}
        isSelectedMonthLocked={isSelectedMonthLocked}
        styles={styles}
        onToggle={() => toggleLevel3(l3.id)}
        onToggleCalendar={() => setIsCalendarOpen((prev) => !prev)}
        onInlineAdd={openInlineAdd}
        onHideNow={() => handleHideCategory(l3.id, 'now')}
        onHideNext={() => handleHideCategory(l3.id, 'next')}
        onRenameCategory={() => handleRenameCategory(l3.id)}
        onDeleteCategory={() => handleDeleteCategory(l3.id)}
        onUndoScheduledHide={() => handleUndoScheduledHide(l3.id)}
        budgetLimitView={budgetLimitView}
        canUseBudgetLimit={canUseBudgetLimit}
        onEditBudgetLimit={() => onEditBudgetLimit?.(l3.id)}
        dragHandle={
          isSortable ? (
            <button
              type="button"
              aria-label={`Przeciągnij podkategorię ${l3.name}`}
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
          ) : null
        }
      />

      <Level3CalendarBlock
        isOpen={isCalendarOpen}
        selectedMonth={selectedMonth}
        transactions={transactions}
        styles={styles}
        isSelectedMonthLocked={isSelectedMonthLocked}
        getAmountNumber={getAmountNumber}
        getMoveTargetsForTransaction={getMoveTargetsForTransaction}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
        handleUpdateTransaction={handleUpdateTransaction}
        handleDeleteTransaction={handleDeleteTransaction}
        handleMoveTransaction={handleMoveTransaction}
        calendarHeatmapVariant={calendarHeatmapVariant}
        heatmapMode={heatmapMode}
        heatmapInverted={heatmapInverted}
        onHeatmapModeChange={onHeatmapModeChange}
        onHeatmapInvertedChange={onHeatmapInvertedChange}
        heatmapStorageKey={heatmapStorageKey}
        descriptionSuggestions={descriptionSuggestions}
        transactionTagsMap={transactionTagsMap}
        transactionPaymentSplitsMap={transactionPaymentSplitsMap}
        getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
        onTagClick={onTagClick}
        onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
        onAddTransactionForDay={(dayText) => handleOpenCalendarAddForDay(l3.id, dayText)}
        categoryName={l3.name}
      />

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
            <Level3InlineAddForm
              categoryId={l3.id}
              selectedMonth={selectedMonth}
              inlineDay={inlineDay}
              setInlineDay={setInlineDay}
              inlineAmount={inlineAmount}
              setInlineAmount={setInlineAmount}
              inlineDescription={inlineDescription}
              setInlineDescription={setInlineDescription}
              inlineTagInput={inlineTagInput}
              setInlineTagInput={setInlineTagInput}
              inlineTagNames={inlineTagNames}
              setInlineTagNames={setInlineTagNames}
              inlinePaymentSourceId={inlinePaymentSourceId}
              setInlinePaymentSourceId={setInlinePaymentSourceId}
              inlinePaymentSplitItems={inlinePaymentSplitItems}
              setInlinePaymentSplitItems={setInlinePaymentSplitItems}
              isInlineSaving={isInlineSaving}
              inlineAmountInputRef={inlineAmountInputRef}
              inlineDescriptionInputRef={inlineDescriptionInputRef}
              filteredInlineSuggestions={filteredInlineSuggestions}
              activeInlineSuggestionIndex={activeInlineSuggestionIndex}
              handleInlineSuggestionKeyDown={handleInlineSuggestionKeyDown}
              applyInlineSuggestion={applyInlineSuggestion}
              handleInlineSuggestionContextMenu={handleInlineSuggestionContextMenu}
              handleInlineSuggestionPointerDown={handleInlineSuggestionPointerDown}
              handleInlineSuggestionPointerUp={handleInlineSuggestionPointerUp}
              handleInlineSuggestionPointerLeave={handleInlineSuggestionPointerLeave}
              getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
              recurringOptions={getRecurringOptionsForCategoryId?.(l3.id) || []}
              selectedRecurringTransactionId={inlineRecurringTransactionId}
              setSelectedRecurringTransactionId={setInlineRecurringTransactionId}
              normalizeAmountInput={normalizeAmountInput}
              saveInlineAdd={saveInlineAdd}
              cancelInlineAdd={cancelInlineAdd}
              styles={styles}
            />
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
