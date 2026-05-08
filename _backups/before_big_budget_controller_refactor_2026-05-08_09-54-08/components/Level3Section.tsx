'use client'

import { CSSProperties, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DescriptionSuggestionDeleteMenu from './DescriptionSuggestionDeleteMenu'
import type { BudgetLimitView } from './BudgetLimitIndicator'
import Level3CalendarBlock from './category-tree/Level3CalendarBlock'
import Level3InlineAddForm from './category-tree/Level3InlineAddForm'
import Level3SectionHeader from './category-tree/Level3SectionHeader'
import Level3TransactionsList from './category-tree/Level3TransactionsList'
import {
  getOrderedLevel3Transactions,
  normalizeAmountInput,
  type Category,
  type HideMode,
  type MoveTarget,
  type RecurringLinkOption,
  type Transaction,
} from './category-tree/Level3SectionUtils'
import type { HeatmapMode } from './month-calendar/monthCalendarTypes'
import { buildDateFromDayInput, getDayInputFromDate } from '../lib/dateUtils'
import { Tag, TransactionPaymentSplit } from '../lib/budgetPageTypes'
import {
  createPaymentSplitItemsFromStoredSplits,
  PaymentSplitInput,
} from '../lib/paymentSplitUtils'
import { DescriptionSuggestion, DescriptionSuggestionSet } from '../lib/suggestionUtils'
import { splitTagInput } from '../lib/tagUtils'
import { useDescriptionSuggestions } from '../lib/useDescriptionSuggestions'
import { useIsMobileViewport } from '../lib/useIsMobileViewport'

type Props = {
  l3: Category
  headerName?: string
  hideHeader?: boolean
  startInlineAddToken?: number
  showHeaderSum?: boolean
  showCategoryActions?: boolean
  selectedMonth: string
  budgetStartDate: string
  isClosingAfterSelectedMonth: boolean
  categorySum: number
  transactions: Transaction[]
  canAddHere: boolean
  canUseMonthCalendar?: boolean
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
  handleDuplicateTransaction?: (transaction: Transaction) => void
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
  getDefaultPaymentSourceIdForCategoryId?: (categoryId: string) => string
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

export default function Level3Section(props: Props) {
  const {
    l3,
    headerName,
    hideHeader = false,
    startInlineAddToken = 0,
    showHeaderSum = true,
    showCategoryActions = true,
    selectedMonth,
    budgetStartDate,
    isClosingAfterSelectedMonth,
    categorySum,
    transactions,
    canAddHere,
    canUseMonthCalendar = true,
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
    handleDuplicateTransaction,
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
    getDefaultPaymentSourceIdForCategoryId,
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
  const inlineSaveLockRef = useRef(false)
  const inlineDayInputRef = useRef<HTMLInputElement | null>(null)
  const inlineAmountInputRef = useRef<HTMLInputElement | null>(null)
  const inlineDescriptionInputRef = useRef<HTMLInputElement | null>(null)
  const editDayInputRef = useRef<HTMLInputElement | null>(null)

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
  const isMobileViewport = useIsMobileViewport()
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

  const getPaymentSourceOptions = (categoryId: string) =>
    getPaymentSourceOptionsForCategoryId?.(categoryId) || []
  const canUsePaymentSources = Boolean(getPaymentSourceOptionsForCategoryId)

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
        canUsePaymentSources ? editPaymentSourceId || null : undefined,
        canUsePaymentSources ? editPaymentSplitItems : undefined
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

  const openInlineAdd = useCallback(() => {
    setIsInlineAdding(true)
    const storageKey = `budget-inline-draft-${l3.id}-${selectedMonth}`
    const storedDraft = typeof window === 'undefined' ? null : window.localStorage.getItem(storageKey)
    let parsedDraft: Partial<{ day: string; amount: string; description: string; tags: string }> = {}

    if (storedDraft) {
      try {
        parsedDraft = JSON.parse(storedDraft)
      } catch {
        parsedDraft = {}
      }
    }

    setInlineDay(parsedDraft.day || '')
    setInlineAmount(parsedDraft.amount || '')
    setInlineDescription(parsedDraft.description || '')
    setInlineTagNames(splitTagInput(parsedDraft.tags || ''))
    setInlineTagInput(parsedDraft.tags || '')
    setInlinePaymentSourceId(
      canUsePaymentSources ? getDefaultPaymentSourceIdForCategoryId?.(l3.id) || '' : ''
    )
    setInlinePaymentSplitItems([])
    setInlineRecurringTransactionId('')

    if (!isOpen) {
      toggleLevel3(l3.id)
    }

    window.setTimeout(() => {
      inlineDayInputRef.current?.focus()
    }, 0)
  }, [
    canUsePaymentSources,
    getDefaultPaymentSourceIdForCategoryId,
    isOpen,
    l3.id,
    selectedMonth,
    toggleLevel3,
  ])

  useEffect(() => {
    if (startInlineAddToken <= 0 || isSelectedMonthLocked) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      openInlineAdd()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isSelectedMonthLocked, openInlineAdd, startInlineAddToken])

  const cancelInlineAdd = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(`budget-inline-draft-${l3.id}-${selectedMonth}`)
    }

    setIsInlineAdding(false)
    setInlineDay('')
    setInlineAmount('')
    setInlineDescription('')
    setInlineTagNames([])
    setInlineTagInput('')
    setInlinePaymentSourceId('')
    setInlinePaymentSplitItems([])
    setInlineRecurringTransactionId('')
    inlineSaveLockRef.current = false
    setIsInlineSaving(false)
  }

  const saveInlineAdd = async () => {
    if (inlineSaveLockRef.current) {
      return
    }

    inlineSaveLockRef.current = true
    setIsInlineSaving(true)

    try {
      await handleInlineSaveTransaction(
        l3.id,
        inlineAmount,
        inlineDescription,
        inlineDay,
        inlineTagNames,
        canUsePaymentSources ? inlinePaymentSourceId || null : undefined,
        canUsePaymentSources ? inlinePaymentSplitItems : undefined,
        inlineRecurringTransactionId || null
      )
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(`budget-inline-draft-${l3.id}-${selectedMonth}`)
      }
      cancelInlineAdd()
    } catch {
      inlineSaveLockRef.current = false
      setIsInlineSaving(false)
    }
  }

  useEffect(() => {
    if (!isInlineAdding || typeof window === 'undefined') {
      return
    }

    const hasDraft =
      inlineDay.trim() || inlineAmount.trim() || inlineDescription.trim() || inlineTagInput.trim()
    const storageKey = `budget-inline-draft-${l3.id}-${selectedMonth}`
    const timeoutId = window.setTimeout(() => {
      if (!hasDraft) {
        window.localStorage.removeItem(storageKey)
        return
      }

      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          day: inlineDay,
          amount: inlineAmount,
          description: inlineDescription,
          tags: inlineTagInput,
        })
      )
    }, 450)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [inlineAmount, inlineDay, inlineDescription, inlineTagInput, isInlineAdding, l3.id, selectedMonth])

  const orderedTransactions = useMemo(() => {
    return getOrderedLevel3Transactions(transactions)
  }, [transactions])

  return (
    <div ref={setNodeRef} style={wrapStyle}>
      {!hideHeader && (
      <Level3SectionHeader
        name={headerName || l3.name}
        categorySum={categorySum}
        showCategorySum={showHeaderSum}
        showCategoryActions={showCategoryActions}
        isOpen={isOpen}
        isDragging={isDragging}
        isClosingAfterSelectedMonth={isClosingAfterSelectedMonth}
        isCalendarOpen={isCalendarOpen}
        canUseMonthCalendar={canUseMonthCalendar}
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
        onEditBudgetLimit={onEditBudgetLimit ? () => onEditBudgetLimit(l3.id) : undefined}
        headerDragProps={
          isSortable && !isDragBlocked && isMobileViewport
            ? {
                ...attributes,
                ...listeners,
              }
            : undefined
        }
        dragHandle={
          isSortable && !isMobileViewport ? (
            <button
              type="button"
              data-category-drag-handle="true"
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
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
              </svg>
            </button>
          ) : null
        }
      />
      )}

      <Level3CalendarBlock
        isOpen={canUseMonthCalendar && isCalendarOpen}
        selectedMonth={selectedMonth}
        budgetStartDate={budgetStartDate}
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
              getDefaultPaymentSourceIdForCategoryId={getDefaultPaymentSourceIdForCategoryId}
              recurringOptions={getRecurringOptionsForCategoryId?.(l3.id) || []}
              selectedRecurringTransactionId={inlineRecurringTransactionId}
              setSelectedRecurringTransactionId={setInlineRecurringTransactionId}
              normalizeAmountInput={normalizeAmountInput}
              saveInlineAdd={saveInlineAdd}
              cancelInlineAdd={cancelInlineAdd}
              inlineDayInputRef={inlineDayInputRef}
              styles={styles}
            />
          )}

          <Level3TransactionsList
            transactions={orderedTransactions}
            selectedMonth={selectedMonth}
            isSelectedMonthLocked={isSelectedMonthLocked}
            editingTransactionId={editingTransactionId}
            movingTransactionId={movingTransactionId}
            isUpdating={isUpdating}
            isMoving={isMoving}
            moveTargetCategoryId={moveTargetCategoryId}
            editDay={editDay}
            setEditDay={setEditDay}
            editAmount={editAmount}
            setEditAmount={setEditAmount}
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            editTagNames={editTagNames}
            setEditTagNames={setEditTagNames}
            editTagInput={editTagInput}
            setEditTagInput={setEditTagInput}
            editPaymentSourceId={editPaymentSourceId}
            setEditPaymentSourceId={setEditPaymentSourceId}
            editPaymentSplitItems={editPaymentSplitItems}
            setEditPaymentSplitItems={setEditPaymentSplitItems}
            editDayInputRef={editDayInputRef}
            editAmountInputRef={editAmountInputRef}
            editDescriptionInputRef={editDescriptionInputRef}
            filteredEditSuggestions={filteredEditSuggestions}
            activeEditSuggestionIndex={activeEditSuggestionIndex}
            handleEditSuggestionKeyDown={handleEditSuggestionKeyDown}
            applyEditSuggestion={applyEditSuggestion}
            handleEditSuggestionContextMenu={handleEditSuggestionContextMenu}
            handleEditSuggestionPointerDown={handleEditSuggestionPointerDown}
            handleEditSuggestionPointerUp={handleEditSuggestionPointerUp}
            handleEditSuggestionPointerLeave={handleEditSuggestionPointerLeave}
            handleEditFieldKeyDown={handleEditFieldKeyDown}
            setIsEditDescriptionFocused={setIsEditDescriptionFocused}
            setMoveTargetCategoryId={setMoveTargetCategoryId}
            selectedTransactionIds={selectedTransactionIds}
            onToggleTransactionSelection={onToggleTransactionSelection}
            getMoveTargetsForTransaction={getMoveTargetsForTransaction}
            getAmountNumber={getAmountNumber}
            getPaymentSourceOptions={getPaymentSourceOptions}
            transactionTagsMap={transactionTagsMap}
            transactionPaymentSplitsMap={transactionPaymentSplitsMap}
            canUsePaymentSources={canUsePaymentSources}
            onTagClick={onTagClick}
            startEditingTransaction={startEditingTransaction}
            cancelEditingTransaction={cancelEditingTransaction}
            saveEditingTransaction={saveEditingTransaction}
            startMovingTransaction={startMovingTransaction}
            cancelMovingTransaction={cancelMovingTransaction}
            saveMovingTransaction={saveMovingTransaction}
            handleDeleteTransaction={handleDeleteTransaction}
            handleDuplicateTransaction={handleDuplicateTransaction}
            styles={styles}
          />
        </div>
      )}
    </div>
  )
}
