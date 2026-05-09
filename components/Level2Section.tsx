'use client'

import { CSSProperties, useState } from 'react'
import { DragEndEvent } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import MonthCalendarPanel from './MonthCalendarPanel'
import type { BudgetLimitView } from './BudgetLimitIndicator'
import Level2Children from './category-tree/Level2Children'
import Level2InlineAddForm from './category-tree/Level2InlineAddForm'
import Level2SectionHeader from './category-tree/Level2SectionHeader'
import Level2TransactionsList from './category-tree/Level2TransactionsList'
import {
  getMonthNumber,
  getNextMonthText,
  type Category,
  type HideMode,
  type MoveTarget,
  type RecurringLinkOption,
  type RestoreMode,
  type Transaction,
} from './category-tree/Level2SectionUtils'
import type { HeatmapMode } from './month-calendar/monthCalendarTypes'
import { DescriptionSuggestion } from '../lib/suggestionUtils'
import { Tag, TransactionPaymentSplit } from '../lib/budgetPageTypes'
import { usePressHoldDndSensors } from '../lib/usePressHoldDndSensors'
import { useIsMobileViewport } from '../lib/useIsMobileViewport'
import { getNearestDndSwapTargetId } from '../lib/getNearestDndSwapTargetId'
import type { TransactionDraft } from '../lib/draftUtils'

type Props = {
  l2: Category
  sortedLevel3Children: Category[]
  budgetLimitView?: BudgetLimitView | null
  canUseBudgetLimit?: boolean
  onEditBudgetLimit?: (categoryId: string | null) => void
  getBudgetLimitView?: (categoryId: string | null) => BudgetLimitView | null
  selectedMonth: string
  budgetStartDate: string
  isSelectedMonthLocked: boolean
  canUseMonthCalendar?: boolean
  isClosingAfterSelectedMonth: boolean
  openLevel2Ids: string[]
  toggleLevel2: (id: string) => void
  openLevel3Ids: string[]
  toggleLevel3: (id: string) => void
  getSumForLevel2: (id: string) => number
  getSumForCategory: (id: string) => number
  getTransactionsForCategoryAndMonth: (id: string) => Transaction[]
  openAddSubcategoryFor: string | null
  newSubcategoryIconKey: string | null
  setOpenAddSubcategoryFor: (id: string | null) => void
  newSubcategoryName: string
  setNewSubcategoryIconKey: (value: string | null) => void
  setNewSubcategoryName: (value: string) => void
  handleAddSubcategory: (level2Id: string, iconKey?: string | null) => Promise<void>
  handleRenameCategory: (categoryId: string) => Promise<void>
  handleUpdateCategoryIcon: (categoryId: string, iconKey: string | null) => Promise<void>
  handleDeleteCategory: (categoryId: string) => Promise<void>
  openTransactionCreator: (suggestedCategoryId: string) => void
  handleInlineSaveTransaction: (
    categoryId: string,
    amountText: string,
    descriptionText: string,
    dayText: string,
    tagNames?: string[],
    paymentSourceId?: string | null,
    paymentSplitItems?: Array<{ paymentSourceId: string; amount: string }>,
    recurringTransactionId?: string | null
  ) => Promise<void>
  saveDraft: (draft: TransactionDraft, options?: { activate?: boolean }) => Promise<TransactionDraft>
  deleteDraft: (draftType: TransactionDraft['type']) => Promise<void>
  inlineDraftType: TransactionDraft['type']
  inlineDraftLevel1Id: string
  handleHideCategory: (id: string, mode?: HideMode) => Promise<void>
  handleRestoreCategory: (id: string, mode?: RestoreMode) => Promise<void>
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
    paymentSplitItems?: Array<{ paymentSourceId: string; amount: string }>
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
  descriptionSuggestions: {
    global: DescriptionSuggestion[]
    byCategory: Record<string, DescriptionSuggestion[]>
  }
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
  isSortable?: boolean
  isDragDisabled?: boolean
  handleLevel3DragStart: (activeId: string) => void
  handleReorderLevel3: (level2Id: string, activeId: string, overId: string) => Promise<void>
  isReorderingLevel2: boolean
  isReorderingLevel3: boolean
  getAmountNumber: (value: unknown) => number
  styles: Record<string, CSSProperties>
}

export default function Level2Section(props: Props) {
  const {
    l2,
    sortedLevel3Children,
    budgetLimitView = null,
    canUseBudgetLimit = false,
    onEditBudgetLimit,
    getBudgetLimitView,
    selectedMonth,
    budgetStartDate,
    isSelectedMonthLocked,
    canUseMonthCalendar = true,
    isClosingAfterSelectedMonth,
    openLevel2Ids,
    toggleLevel2,
    openLevel3Ids,
    toggleLevel3,
    getSumForLevel2,
    getSumForCategory,
    getTransactionsForCategoryAndMonth,
    openAddSubcategoryFor,
    newSubcategoryIconKey,
    setOpenAddSubcategoryFor,
    newSubcategoryName,
    setNewSubcategoryIconKey,
    setNewSubcategoryName,
    handleAddSubcategory,
    handleRenameCategory,
    handleUpdateCategoryIcon,
    handleDeleteCategory,
    openTransactionCreator,
    handleInlineSaveTransaction,
    saveDraft,
    deleteDraft,
    inlineDraftType,
    inlineDraftLevel1Id,
    handleHideCategory,
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
    isSortable = false,
    isDragDisabled = false,
    handleLevel3DragStart,
    handleReorderLevel3,
    isReorderingLevel2,
    isReorderingLevel3,
    getAmountNumber,
    styles,
  } = props

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [inlineAddToken, setInlineAddToken] = useState(0)

  const isOpen = openLevel2Ids.includes(l2.id)
  const hasChildren = sortedLevel3Children.length > 0
  const isLevel2DragBlocked = isDragDisabled || isOpen

  const sensors = usePressHoldDndSensors()
  const isMobileViewport = useIsMobileViewport()

  const hasVisibleOpenLevel3 = sortedLevel3Children.some((category) =>
    openLevel3Ids.includes(category.id)
  )
  const isLevel3DndBlocked = isReorderingLevel2 || isReorderingLevel3 || hasVisibleOpenLevel3

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: l2.id,
    disabled: !isSortable || isLevel2DragBlocked,
  })

  const wrapStyle: CSSProperties = {
    ...styles.l2Wrap,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : 'auto',
  }

  const dragHandleStyle: CSSProperties = {
    ...(styles.dragHandle || {}),
    ...(isLevel2DragBlocked ? styles.dragHandleDisabled || {} : {}),
    cursor: isLevel2DragBlocked ? 'not-allowed' : 'grab',
    opacity: isLevel2DragBlocked ? 0.45 : styles.dragHandle?.opacity,
  }

  const dragHandleTitle = isLevel2DragBlocked
    ? 'Aby przenosić, najpierw zwiń kategorię'
    : undefined

  const isChildClosingAfterSelectedMonth = (category: Category) => {
    if (!category.active_to) {
      return false
    }

    const hiddenFromMonth = category.active_to.slice(0, 7)
    const nextMonth = getNextMonthText(selectedMonth)

    if (getMonthNumber(hiddenFromMonth) !== getMonthNumber(nextMonth)) {
      return false
    }

    if (!category.reactivate_from) {
      return true
    }

    const returnMonth = category.reactivate_from.slice(0, 7)
    return getMonthNumber(returnMonth) > getMonthNumber(nextMonth)
  }

  const handleHideLevel2Click = async (mode: HideMode) => {
    if (hasChildren) {
      const confirmChildren = confirm(
        'Ta kategoria ma podkategorie.\n\nCzy na pewno chcesz ją ukryć?'
      )

      if (!confirmChildren) {
        return
      }
    }

    await handleHideCategory(l2.id, mode)
  }

  const handleLevel3DragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const level3Ids = sortedLevel3Children.map((category) => category.id)
    await handleReorderLevel3(
      l2.id,
      String(active.id),
      getNearestDndSwapTargetId(
        level3Ids,
        String(active.id),
        String(over.id),
        isMobileViewport
      )
    )
  }

  const level2Transactions = hasChildren
    ? sortedLevel3Children.flatMap((child) => getTransactionsForCategoryAndMonth(child.id))
    : getTransactionsForCategoryAndMonth(l2.id)

  const openLevel2InlineAdd = () => {
    if (!isOpen) {
      toggleLevel2(l2.id)
    }

    setInlineAddToken((previousToken) => previousToken + 1)
  }

  const openAddSubcategory = () => {
    setOpenAddSubcategoryFor(l2.id)
    setNewSubcategoryName('')
    setNewSubcategoryIconKey(null)

    if (!isOpen) {
      toggleLevel2(l2.id)
    }
  }

  return (
    <div ref={setNodeRef} style={wrapStyle}>
      <Level2SectionHeader
        name={l2.name}
        iconKey={l2.icon_key}
        categorySum={getSumForLevel2(l2.id)}
        isOpen={isOpen}
        isDragging={isDragging}
        isClosingAfterSelectedMonth={isClosingAfterSelectedMonth}
        isCalendarOpen={isCalendarOpen}
        canUseMonthCalendar={canUseMonthCalendar}
        canUseBudgetLimit={canUseBudgetLimit}
        canAddDirectTransaction={!hasChildren}
        isSelectedMonthLocked={isSelectedMonthLocked}
        budgetLimitView={budgetLimitView}
        styles={styles}
        onToggle={() => toggleLevel2(l2.id)}
        onToggleCalendar={() => setIsCalendarOpen((prev) => !prev)}
        onEditBudgetLimit={onEditBudgetLimit ? () => onEditBudgetLimit(l2.id) : undefined}
        onInlineAdd={openLevel2InlineAdd}
        onRenameCategory={() => handleRenameCategory(l2.id)}
        onIconChange={(iconKey) => handleUpdateCategoryIcon(l2.id, iconKey)}
        onDeleteCategory={() => handleDeleteCategory(l2.id)}
        onAddSubcategory={openAddSubcategory}
        onUndoScheduledHide={() => handleUndoScheduledHide(l2.id)}
        onHideNow={() => handleHideLevel2Click('now')}
        onHideNext={() => handleHideLevel2Click('next')}
        headerDragProps={
          isSortable && !isLevel2DragBlocked && isMobileViewport
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
              aria-label={`Przeciągnij kategorię ${l2.name}`}
              title={dragHandleTitle}
              style={dragHandleStyle}
              disabled={isLevel2DragBlocked}
              onMouseDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
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

      {canUseMonthCalendar && isCalendarOpen && (
        <MonthCalendarPanel
          selectedMonth={selectedMonth}
          budgetStartDate={budgetStartDate}
          transactions={level2Transactions}
          styles={styles}
          isSelectedMonthLocked={isSelectedMonthLocked}
          getAmountNumber={getAmountNumber}
          getMoveTargetsForTransaction={getMoveTargetsForTransaction}
          getSignedAmountForTransaction={getSignedAmountForTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onMoveTransaction={handleMoveTransaction}
          onDuplicateTransaction={handleDuplicateTransaction}
          heatmapVariant={calendarHeatmapVariant}
          heatmapMode={heatmapMode}
          heatmapInverted={heatmapInverted}
          onHeatmapModeChange={onHeatmapModeChange}
          onHeatmapInvertedChange={onHeatmapInvertedChange}
          heatmapStorageKey={heatmapStorageKey}
          descriptionSuggestions={descriptionSuggestions}
          getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
          transactionTagsMap={transactionTagsMap}
          transactionPaymentSplitsMap={transactionPaymentSplitsMap}
          onTagClick={onTagClick}
          onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
          onAddTransactionForDay={(dayText) => handleOpenCalendarAddForDay(l2.id, dayText)}
          calendarTitle={`Kalendarz • ${l2.name}`}
          calendarSubtitle=""
        />
      )}

      {openAddSubcategoryFor === l2.id && (
        <Level2InlineAddForm
          value={newSubcategoryName}
          setValue={setNewSubcategoryName}
          iconValue={newSubcategoryIconKey}
          setIconValue={setNewSubcategoryIconKey}
          onSave={() => handleAddSubcategory(l2.id, newSubcategoryIconKey)}
          onCancel={() => {
            setOpenAddSubcategoryFor(null)
            setNewSubcategoryName('')
            setNewSubcategoryIconKey(null)
          }}
          styles={styles}
        />
      )}

      {isOpen && !hasChildren && (
        <Level2TransactionsList
          l2={l2}
          inlineAddToken={inlineAddToken}
          selectedMonth={selectedMonth}
          budgetStartDate={budgetStartDate}
          isClosingAfterSelectedMonth={isClosingAfterSelectedMonth}
          isSelectedMonthLocked={isSelectedMonthLocked}
          canUseMonthCalendar={canUseMonthCalendar}
          toggleLevel3={toggleLevel3}
          handleLevel3DragStart={handleLevel3DragStart}
          openTransactionCreator={openTransactionCreator}
          handleInlineSaveTransaction={handleInlineSaveTransaction}
          saveDraft={saveDraft}
          deleteDraft={deleteDraft}
          inlineDraftType={inlineDraftType}
          inlineDraftLevel1Id={inlineDraftLevel1Id}
          handleHideCategory={handleHideCategory}
          handleRenameCategory={handleRenameCategory}
          handleUpdateCategoryIcon={handleUpdateCategoryIcon}
          handleDeleteCategory={handleDeleteCategory}
          handleUndoScheduledHide={handleUndoScheduledHide}
          handleDeleteTransaction={handleDeleteTransaction}
          handleUpdateTransaction={handleUpdateTransaction}
          handleMoveTransaction={handleMoveTransaction}
          handleDuplicateTransaction={handleDuplicateTransaction}
          handleOpenCalendarAddForDay={handleOpenCalendarAddForDay}
          selectedTransactionIds={selectedTransactionIds}
          onToggleTransactionSelection={onToggleTransactionSelection}
          getMoveTargetsForTransaction={getMoveTargetsForTransaction}
          getSignedAmountForTransaction={getSignedAmountForTransaction}
          calendarHeatmapVariant={calendarHeatmapVariant}
          heatmapMode={heatmapMode}
          heatmapInverted={heatmapInverted}
          onHeatmapModeChange={onHeatmapModeChange}
          onHeatmapInvertedChange={onHeatmapInvertedChange}
          heatmapStorageKey={heatmapStorageKey}
          descriptionSuggestions={descriptionSuggestions}
          getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
          getRecurringOptionsForCategoryId={getRecurringOptionsForCategoryId}
          getDefaultPaymentSourceIdForCategoryId={getDefaultPaymentSourceIdForCategoryId}
          transactionTagsMap={transactionTagsMap}
          transactionPaymentSplitsMap={transactionPaymentSplitsMap}
          onTagClick={onTagClick}
          onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
          getAmountNumber={getAmountNumber}
          getSumForCategory={getSumForCategory}
          getTransactionsForCategoryAndMonth={getTransactionsForCategoryAndMonth}
          styles={styles}
        />
      )}

      {isOpen && hasChildren && (
        <Level2Children
          l2={l2}
          sortedLevel3Children={sortedLevel3Children}
          sensors={sensors}
          isLevel3DndBlocked={isLevel3DndBlocked}
          selectedMonth={selectedMonth}
          budgetStartDate={budgetStartDate}
          isSelectedMonthLocked={isSelectedMonthLocked}
          canUseMonthCalendar={canUseMonthCalendar}
          openLevel3Ids={openLevel3Ids}
          toggleLevel3={toggleLevel3}
          handleLevel3DragStart={handleLevel3DragStart}
          handleLevel3DragEnd={handleLevel3DragEnd}
          openTransactionCreator={openTransactionCreator}
          handleInlineSaveTransaction={handleInlineSaveTransaction}
          saveDraft={saveDraft}
          deleteDraft={deleteDraft}
          inlineDraftType={inlineDraftType}
          inlineDraftLevel1Id={inlineDraftLevel1Id}
          handleHideCategory={handleHideCategory}
          handleRenameCategory={handleRenameCategory}
          handleUpdateCategoryIcon={handleUpdateCategoryIcon}
          handleDeleteCategory={handleDeleteCategory}
          handleUndoScheduledHide={handleUndoScheduledHide}
          handleDeleteTransaction={handleDeleteTransaction}
          handleUpdateTransaction={handleUpdateTransaction}
          handleMoveTransaction={handleMoveTransaction}
          handleDuplicateTransaction={handleDuplicateTransaction}
          handleOpenCalendarAddForDay={handleOpenCalendarAddForDay}
          selectedTransactionIds={selectedTransactionIds}
          onToggleTransactionSelection={onToggleTransactionSelection}
          getMoveTargetsForTransaction={getMoveTargetsForTransaction}
          getSignedAmountForTransaction={getSignedAmountForTransaction}
          calendarHeatmapVariant={calendarHeatmapVariant}
          heatmapMode={heatmapMode}
          heatmapInverted={heatmapInverted}
          onHeatmapModeChange={onHeatmapModeChange}
          onHeatmapInvertedChange={onHeatmapInvertedChange}
          descriptionSuggestions={descriptionSuggestions}
          getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
          getRecurringOptionsForCategoryId={getRecurringOptionsForCategoryId}
          getDefaultPaymentSourceIdForCategoryId={getDefaultPaymentSourceIdForCategoryId}
          transactionTagsMap={transactionTagsMap}
          transactionPaymentSplitsMap={transactionPaymentSplitsMap}
          onTagClick={onTagClick}
          onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
          canUseBudgetLimit={canUseBudgetLimit}
          onEditBudgetLimit={onEditBudgetLimit}
          getBudgetLimitView={getBudgetLimitView}
          getAmountNumber={getAmountNumber}
          getSumForCategory={getSumForCategory}
          getTransactionsForCategoryAndMonth={getTransactionsForCategoryAndMonth}
          isChildClosingAfterSelectedMonth={isChildClosingAfterSelectedMonth}
          styles={styles}
        />
      )}
    </div>
  )
}
