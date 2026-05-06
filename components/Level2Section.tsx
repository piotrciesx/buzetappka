'use client'

import { CSSProperties, useState } from 'react'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import MonthCalendarPanel from './MonthCalendarPanel'
import Level3Section from './Level3Section'
import BudgetLimitIndicator, { BudgetLimitView } from './BudgetLimitIndicator'
import type { HeatmapMode } from './month-calendar/monthCalendarTypes'
import { DescriptionSuggestion } from '../lib/suggestionUtils'
import { Tag, TransactionPaymentSplit } from '../lib/budgetPageTypes'
import { usePressHoldDndSensors } from '../lib/usePressHoldDndSensors'

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

type Transaction = {
  id: string
  category_id: string
  amount: number | string
  description: string | null
  date: string
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
type RestoreMode = 'now' | 'next'

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
  getCountForLevel2: (id: string) => number
  getSumForCategory: (id: string) => number
  getTransactionsForCategoryAndMonth: (id: string) => Transaction[]
  openAddSubcategoryFor: string | null
  setOpenAddSubcategoryFor: (id: string | null) => void
  newSubcategoryName: string
  setNewSubcategoryName: (value: string) => void
  handleAddSubcategory: (level2Id: string) => Promise<void>
  handleRenameCategory: (categoryId: string) => Promise<void>
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
    getCountForLevel2,
    getSumForCategory,
    getTransactionsForCategoryAndMonth,
    openAddSubcategoryFor,
    setOpenAddSubcategoryFor,
    newSubcategoryName,
    setNewSubcategoryName,
    handleAddSubcategory,
    handleRenameCategory,
    handleDeleteCategory,
    openTransactionCreator,
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

  const getMonthNumber = (monthText: string) => {
    const [year, month] = monthText.split('-').map(Number)
    return year * 100 + month
  }

  const getNextMonthText = (monthText: string) => {
    const [year, month] = monthText.split('-').map(Number)
    const date = new Date(year, month, 1)
    const newYear = date.getFullYear()
    const newMonth = String(date.getMonth() + 1).padStart(2, '0')
    return `${newYear}-${newMonth}`
  }

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

    await handleReorderLevel3(l2.id, String(active.id), String(over.id))
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

  const renderLevel3List = () => {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event) => {
          handleLevel3DragStart(String(event.active.id))
        }}
        onDragEnd={handleLevel3DragEnd}
      >
        <SortableContext
          items={sortedLevel3Children.map((category) => category.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedLevel3Children.map((l3) => (
            <Level3Section
              key={l3.id}
              l3={l3}
              selectedMonth={selectedMonth}
              budgetStartDate={budgetStartDate}
              isClosingAfterSelectedMonth={isChildClosingAfterSelectedMonth(l3)}
              categorySum={getSumForCategory(l3.id)}
              transactions={getTransactionsForCategoryAndMonth(l3.id)}
              canAddHere={true}
              isSelectedMonthLocked={isSelectedMonthLocked}
              canUseMonthCalendar={canUseMonthCalendar}
              isOpen={openLevel3Ids.includes(l3.id)}
              toggleLevel3={toggleLevel3}
              handleLevel3DragStart={handleLevel3DragStart}
              openTransactionCreator={openTransactionCreator}
              handleInlineSaveTransaction={handleInlineSaveTransaction}
              handleHideCategory={handleHideCategory}
              handleRenameCategory={handleRenameCategory}
              handleDeleteCategory={handleDeleteCategory}
              handleUndoScheduledHide={handleUndoScheduledHide}
              handleDeleteTransaction={handleDeleteTransaction}
              handleUpdateTransaction={handleUpdateTransaction}
              handleMoveTransaction={handleMoveTransaction}
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
              heatmapStorageKey={`budget-app-tree-calendar-${l3.id}`}
              descriptionSuggestions={descriptionSuggestions}
              getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
              getRecurringOptionsForCategoryId={getRecurringOptionsForCategoryId}
              getDefaultPaymentSourceIdForCategoryId={getDefaultPaymentSourceIdForCategoryId}
              transactionTagsMap={transactionTagsMap}
              transactionPaymentSplitsMap={transactionPaymentSplitsMap}
              onTagClick={onTagClick}
              onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
              budgetLimitView={canUseBudgetLimit ? getBudgetLimitView?.(l3.id) ?? null : null}
              canUseBudgetLimit={canUseBudgetLimit}
              onEditBudgetLimit={onEditBudgetLimit}
              isSortable={sortedLevel3Children.length > 1}
              isDragDisabled={isLevel3DndBlocked}
              getAmountNumber={getAmountNumber}
              styles={styles}
            />
          ))}
        </SortableContext>
      </DndContext>
    )
  }

  return (
    <div ref={setNodeRef} style={wrapStyle}>
      <div
        style={{
          ...styles.l2Header,
          boxShadow: isDragging ? '0 12px 24px rgba(0, 0, 0, 0.12)' : styles.l2Header.boxShadow,
        }}
        onClick={() => {
          if (!isDragging) {
            toggleLevel2(l2.id)
          }
        }}
      >
        <div style={styles.l2Left}>
          {isSortable && (
            <button
              type="button"
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
              ::
            </button>
          )}

          <div style={styles.arrow}>{isOpen ? '▾' : '▸'}</div>

          <div>
            <div style={styles.l2Name}>{l2.name}</div>

            <div style={styles.l2Meta}>
              Podkategorie: {sortedLevel3Children.length} • Wpisy: {getCountForLevel2(l2.id)} • Suma:{' '}
              {getSumForLevel2(l2.id)}
            </div>

            {isClosingAfterSelectedMonth && (
              <div style={styles.closingBadge}>zamknie się z końcem tego miesiąca</div>
            )}

            <BudgetLimitIndicator view={budgetLimitView} />
          </div>
        </div>

        <div style={styles.actions} onClick={(event) => event.stopPropagation()}>
          {canUseMonthCalendar && (
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
          )}

          {canUseBudgetLimit && onEditBudgetLimit && (
            <button
              type="button"
              style={styles.secondaryButton}
              onMouseDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                onEditBudgetLimit(l2.id)
              }}
            >
              {budgetLimitView ? 'Edytuj limit' : 'Ustaw limit'}
            </button>
          )}

          {!hasChildren && !isSelectedMonthLocked && (
            <button
              type="button"
              style={styles.primaryButton}
              onMouseDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation()
                openLevel2InlineAdd()
              }}
            >
              + wpis
            </button>
          )}

          <button
            style={styles.secondaryButton}
            onClick={async () => {
              await handleRenameCategory(l2.id)
            }}
          >
            zmień nazwę
          </button>

          <button
            style={styles.dangerButton}
            onClick={async () => {
              await handleDeleteCategory(l2.id)
            }}
          >
            usuń kategorię
          </button>

          <button
            style={styles.primaryButton}
            onClick={() => {
              setOpenAddSubcategoryFor(l2.id)
              setNewSubcategoryName('')

              if (!isOpen) {
                toggleLevel2(l2.id)
              }
            }}
          >
            Dodaj podkategorię
          </button>

          {isClosingAfterSelectedMonth ? (
            <button
              style={styles.secondaryButton}
              onClick={async () => {
                await handleUndoScheduledHide(l2.id)
              }}
            >
              cofnij zamknięcie
            </button>
          ) : (
            <>
              <button
                style={styles.dangerButton}
                onClick={async () => {
                  await handleHideLevel2Click('now')
                }}
              >
                ukryj teraz
              </button>

              <button
                style={styles.dangerButton}
                onClick={async () => {
                  await handleHideLevel2Click('next')
                }}
              >
                ukryj od następnego
              </button>
            </>
          )}
        </div>
      </div>

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
          calendarSubtitle="Kliknij dzień, aby zobaczyć wpisy z tej kategorii lub dodać nowy wpis."
        />
      )}

      {openAddSubcategoryFor === l2.id && (
        <div style={styles.formRow}>
          <input
            style={styles.input}
            placeholder="Nazwa podkategorii"
            value={newSubcategoryName}
            onChange={(e) => setNewSubcategoryName(e.target.value)}
          />

          <button
            style={styles.primaryButton}
            onClick={async () => {
              await handleAddSubcategory(l2.id)
            }}
          >
            zapisz
          </button>

          <button
            style={styles.secondaryButton}
            onClick={() => {
              setOpenAddSubcategoryFor(null)
              setNewSubcategoryName('')
            }}
          >
            anuluj
          </button>
        </div>
      )}

      {isOpen && !hasChildren && (
        <Level3Section
          l3={l2}
          hideHeader
          startInlineAddToken={inlineAddToken}
          headerName="Wpisy w kategorii"
          showHeaderSum={false}
          showCategoryActions={false}
          selectedMonth={selectedMonth}
          budgetStartDate={budgetStartDate}
          isClosingAfterSelectedMonth={isClosingAfterSelectedMonth}
          categorySum={getSumForCategory(l2.id)}
          transactions={getTransactionsForCategoryAndMonth(l2.id)}
          canAddHere={true}
          isSelectedMonthLocked={isSelectedMonthLocked}
          canUseMonthCalendar={canUseMonthCalendar}
          isOpen={true}
          toggleLevel3={toggleLevel3}
          handleLevel3DragStart={handleLevel3DragStart}
          openTransactionCreator={openTransactionCreator}
          handleInlineSaveTransaction={handleInlineSaveTransaction}
          handleHideCategory={handleHideCategory}
          handleRenameCategory={handleRenameCategory}
          handleDeleteCategory={handleDeleteCategory}
          handleUndoScheduledHide={handleUndoScheduledHide}
          handleDeleteTransaction={handleDeleteTransaction}
          handleUpdateTransaction={handleUpdateTransaction}
          handleMoveTransaction={handleMoveTransaction}
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
          budgetLimitView={null}
          canUseBudgetLimit={false}
          onEditBudgetLimit={undefined}
          getAmountNumber={getAmountNumber}
          styles={styles}
        />
      )}

      {isOpen && hasChildren && renderLevel3List()}
    </div>
  )
}
