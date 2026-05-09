'use client'

import { CSSProperties, ReactNode, useEffect, useState } from 'react'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Level2Section from './Level2Section'
import Level3Section from './Level3Section'
import MonthCalendarPanel from './MonthCalendarPanel'
import BudgetLimitIndicator, { BudgetLimitView } from './BudgetLimitIndicator'
import type { HeatmapMode } from './month-calendar/monthCalendarTypes'
import { SortableLevel1Card, StaticLevel1Card } from './Level1Cards'
import {
  Category,
  HideMode,
  MoveTarget,
  RestoreMode,
  Tag,
  Transaction,
  TransactionPaymentSplit,
} from '../lib/budgetPageTypes'
import { DescriptionSuggestion } from '../lib/suggestionUtils'
import { usePressHoldDndSensors } from '../lib/usePressHoldDndSensors'
import { useIsMobileViewport } from '../lib/useIsMobileViewport'
import { getNearestDndSwapTargetId } from '../lib/getNearestDndSwapTargetId'
import type { TransactionDraft } from '../lib/draftUtils'

type Props = {
  sortedLevel1: Category[]
  openLevel1Ids: string[]
  openLevel1CalendarIds: string[]
  openLevel2Ids: string[]
  openLevel3Ids: string[]
  selectedMonth: string
  budgetStartDate: string
  isSelectedMonthLocked: boolean
  canUseMonthCalendar?: boolean
  openAddSubcategoryFor: string | null
  newSubcategoryName: string
  selectedTransactionIds: string[]
  isReorderingLevel1: boolean
  reorderingLevel1Id: string | null
  reorderingLevel2Id: string | null
  expenseLevel1Id: string | null
  styles: Record<string, CSSProperties>
  toggleLevel1: (id: string) => void
  toggleLevel1Calendar: (level1Id: string) => void
  toggleLevel2: (id: string) => void
  toggleLevel3: (id: string) => void
  setOpenAddSubcategoryFor: (id: string | null) => void
  setNewSubcategoryName: (value: string) => void
  getSortedLevel2Children: (level1Id: string) => Category[]
  getSortedLevel3Children: (level2Id: string) => Category[]
  getTransactionsForLevel1AndMonth: (level1Id: string) => Transaction[]
  getTransactionsForCategoryAndMonthForSelectedMonth: (categoryId: string) => Transaction[]
  getSumForCategoryForSelectedMonth: (categoryId: string) => number
  getSumForLevel2ForSelectedMonth: (level2Id: string) => number
  getCountForLevel2ForSelectedMonth: (level2Id: string) => number
  getAmountNumber: (value: unknown) => number
  getMoveTargetsForTransaction: (transaction: Transaction) => MoveTarget[]
  getSignedAmountForTransaction: (transaction: Transaction) => number
  getCalendarHeatmapVariantForLevel1Id: (
    level1Id: string | null
  ) => 'balance' | 'income' | 'expense'
  heatmapMode: HeatmapMode
  heatmapInverted: boolean
  onHeatmapModeChange: (value: HeatmapMode) => void
  onHeatmapInvertedChange: (value: boolean) => void
  isCategoryClosingAfterSelectedMonth: (category: Category, selectedMonth: string) => boolean
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
  saveDraft: (draft: TransactionDraft, options?: { activate?: boolean }) => Promise<TransactionDraft>
  deleteDraft: (draftType: TransactionDraft['type']) => Promise<void>
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
  handleOpenCategoryCalendarAddForDay: (categoryId: string, dayText: string) => void
  handleOpenLevel1CalendarAddForDay: (level1Id: string, dayText: string) => void
  toggleTransactionSelection: (transactionId: string) => void
  handleLevel3DragStart: (activeId: string) => void
  handleReorderLevel3: (level2Id: string, activeId: string, overId: string) => Promise<void>
  handleLevel1DragStart: () => void
  handleReorderLevel1: (activeId: string, overId: string) => Promise<void>
  handleReorderLevel2: (level1Id: string, activeId: string, overId: string) => Promise<void>
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
  getRecurringOptionsForCategoryId?: (categoryId: string) => Array<{
    id: string
    label: string
    description?: string
    amount?: number | null
    useAmountWhenCreating?: boolean
    hasTransactionInMonth?: boolean
  }>
  getDefaultPaymentSourceIdForCategoryId?: (categoryId: string) => string
  transactionTagsMap: Record<string, Tag[]>
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
  onTagClick?: (tagId: string) => void
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
  getBudgetLimitView?: (categoryId: string | null) => BudgetLimitView | null
  onEditBudgetLimit?: (categoryId: string | null) => void
}

export default function BudgetCategoryTree(props: Props) {
  const {
    sortedLevel1,
    openLevel1Ids,
    openLevel1CalendarIds,
    openLevel2Ids,
    openLevel3Ids,
    selectedMonth,
    budgetStartDate,
    isSelectedMonthLocked,
    canUseMonthCalendar = true,
    openAddSubcategoryFor,
    newSubcategoryName,
    selectedTransactionIds,
    isReorderingLevel1,
    reorderingLevel1Id,
    reorderingLevel2Id,
    expenseLevel1Id,
    styles,
    toggleLevel1,
    toggleLevel1Calendar,
    toggleLevel2,
    toggleLevel3,
    setOpenAddSubcategoryFor,
    setNewSubcategoryName,
    getSortedLevel2Children,
    getSortedLevel3Children,
    getTransactionsForLevel1AndMonth,
    getTransactionsForCategoryAndMonthForSelectedMonth,
    getSumForCategoryForSelectedMonth,
    getSumForLevel2ForSelectedMonth,
    getCountForLevel2ForSelectedMonth,
    getAmountNumber,
    getMoveTargetsForTransaction,
    getSignedAmountForTransaction,
    getCalendarHeatmapVariantForLevel1Id,
    heatmapMode,
    heatmapInverted,
    onHeatmapModeChange,
    onHeatmapInvertedChange,
    isCategoryClosingAfterSelectedMonth,
    handleAddSubcategory,
    handleRenameCategory,
    handleDeleteCategory,
    openTransactionCreator,
    handleInlineSaveTransaction,
    saveDraft,
    deleteDraft,
    handleHideCategory,
    handleRestoreCategory,
    handleUndoScheduledHide,
    handleDeleteTransaction,
    handleUpdateTransaction,
    handleMoveTransaction,
    handleDuplicateTransaction,
    handleOpenCategoryCalendarAddForDay,
    handleOpenLevel1CalendarAddForDay,
    toggleTransactionSelection,
    handleLevel3DragStart,
    handleReorderLevel3,
    handleLevel1DragStart,
    handleReorderLevel1,
    handleReorderLevel2,
    descriptionSuggestions,
    getPaymentSourceOptionsForCategoryId,
    getRecurringOptionsForCategoryId,
    getDefaultPaymentSourceIdForCategoryId,
    transactionTagsMap,
    transactionPaymentSplitsMap = {},
    onTagClick,
    onDeleteDescriptionSuggestion,
    getBudgetLimitView,
    onEditBudgetLimit,
  } = props

  const dndSensors = usePressHoldDndSensors()
  const isMobileViewport = useIsMobileViewport()
  const [level1InlineAddTokens, setLevel1InlineAddTokens] = useState<Record<string, number>>({})

  useEffect(() => {
    const closeOpenMenu = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-mobile-category-menu="true"]')) {
        const currentMenu = event.target.closest('details[data-mobile-category-menu="true"]')
        document
          .querySelectorAll<HTMLDetailsElement>('details[data-mobile-category-menu="true"][open]')
          .forEach((menu) => {
            if (menu !== currentMenu) {
              menu.open = false
            }
          })
        return
      }

      document
        .querySelectorAll<HTMLDetailsElement>('details[data-mobile-category-menu="true"][open]')
        .forEach((menu) => {
          menu.open = false
        })
    }

    document.addEventListener('pointerdown', closeOpenMenu)

    return () => {
      document.removeEventListener('pointerdown', closeOpenMenu)
    }
  }, [])

  const openLevel1InlineAdd = (level1Id: string) => {
    if (!openLevel1Ids.includes(level1Id)) {
      toggleLevel1(level1Id)
    }

    setLevel1InlineAddTokens((previousTokens) => ({
      ...previousTokens,
      [level1Id]: (previousTokens[level1Id] || 0) + 1,
    }))
  }

  const renderLevel2Section = (
    level1Category: Category,
    level2Category: Category,
    sortedLevel3Children: Category[],
    isLevel2DndBlocked: boolean
  ) => {
    const calendarHeatmapVariant = getCalendarHeatmapVariantForLevel1Id(level1Category.id)
    const canUseBudgetLimit =
      level1Category.id === expenseLevel1Id && Boolean(getBudgetLimitView && onEditBudgetLimit)
    const budgetLimitView = canUseBudgetLimit ? getBudgetLimitView?.(level2Category.id) ?? null : null

    return (
      <Level2Section
        key={level2Category.id}
        l2={level2Category}
        sortedLevel3Children={sortedLevel3Children}
        budgetLimitView={budgetLimitView}
        canUseBudgetLimit={canUseBudgetLimit}
        onEditBudgetLimit={onEditBudgetLimit}
        getBudgetLimitView={getBudgetLimitView}
        selectedMonth={selectedMonth}
        budgetStartDate={budgetStartDate}
        isSelectedMonthLocked={isSelectedMonthLocked}
        canUseMonthCalendar={canUseMonthCalendar}
        isClosingAfterSelectedMonth={isCategoryClosingAfterSelectedMonth(
          level2Category,
          selectedMonth
        )}
        openLevel2Ids={openLevel2Ids}
        toggleLevel2={toggleLevel2}
        openLevel3Ids={openLevel3Ids}
        toggleLevel3={toggleLevel3}
        getSumForLevel2={getSumForLevel2ForSelectedMonth}
        getSumForCategory={getSumForCategoryForSelectedMonth}
        getTransactionsForCategoryAndMonth={getTransactionsForCategoryAndMonthForSelectedMonth}
        openAddSubcategoryFor={openAddSubcategoryFor}
        setOpenAddSubcategoryFor={setOpenAddSubcategoryFor}
        newSubcategoryName={newSubcategoryName}
        setNewSubcategoryName={setNewSubcategoryName}
        handleAddSubcategory={handleAddSubcategory}
        handleRenameCategory={handleRenameCategory}
        handleDeleteCategory={handleDeleteCategory}
        openTransactionCreator={openTransactionCreator}
        handleInlineSaveTransaction={handleInlineSaveTransaction}
        saveDraft={saveDraft}
        deleteDraft={deleteDraft}
        inlineDraftType={level1Category.id === expenseLevel1Id ? 'expense' : 'income'}
        inlineDraftLevel1Id={level1Category.id}
        handleHideCategory={handleHideCategory}
        handleRestoreCategory={handleRestoreCategory}
        handleUndoScheduledHide={handleUndoScheduledHide}
        handleDeleteTransaction={handleDeleteTransaction}
        handleUpdateTransaction={handleUpdateTransaction}
        handleMoveTransaction={handleMoveTransaction}
        handleDuplicateTransaction={handleDuplicateTransaction}
        handleOpenCalendarAddForDay={handleOpenCategoryCalendarAddForDay}
        selectedTransactionIds={selectedTransactionIds}
        onToggleTransactionSelection={toggleTransactionSelection}
        getMoveTargetsForTransaction={getMoveTargetsForTransaction}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
        calendarHeatmapVariant={calendarHeatmapVariant}
        heatmapMode={heatmapMode}
        heatmapInverted={heatmapInverted}
        onHeatmapModeChange={onHeatmapModeChange}
        onHeatmapInvertedChange={onHeatmapInvertedChange}
        heatmapStorageKey={`budget-app-tree-calendar-${level2Category.id}`}
        descriptionSuggestions={descriptionSuggestions}
        getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
        getRecurringOptionsForCategoryId={getRecurringOptionsForCategoryId}
        getDefaultPaymentSourceIdForCategoryId={getDefaultPaymentSourceIdForCategoryId}
        transactionTagsMap={transactionTagsMap}
        transactionPaymentSplitsMap={transactionPaymentSplitsMap}
        onTagClick={onTagClick}
        onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
        isSortable={true}
        isDragDisabled={isLevel2DndBlocked}
        handleLevel3DragStart={handleLevel3DragStart}
        handleReorderLevel3={handleReorderLevel3}
        isReorderingLevel2={reorderingLevel1Id === level1Category.id}
        isReorderingLevel3={reorderingLevel2Id === level2Category.id}
        getAmountNumber={getAmountNumber}
        styles={styles}
      />
    )
  }

  const renderLevel1LeafSection = (level1Category: Category) => {
    const calendarHeatmapVariant = getCalendarHeatmapVariantForLevel1Id(level1Category.id)
    const directLevel1Transactions = getTransactionsForCategoryAndMonthForSelectedMonth(
      level1Category.id
    )

    return (
      <Level3Section
        key={level1Category.id}
        l3={level1Category}
        hideHeader
        startInlineAddToken={level1InlineAddTokens[level1Category.id] || 0}
        showCategoryActions={false}
        selectedMonth={selectedMonth}
        budgetStartDate={budgetStartDate}
        isClosingAfterSelectedMonth={isCategoryClosingAfterSelectedMonth(
          level1Category,
          selectedMonth
        )}
        categorySum={getSumForCategoryForSelectedMonth(level1Category.id)}
        transactions={directLevel1Transactions}
        canAddHere={true}
        isSelectedMonthLocked={isSelectedMonthLocked}
        canUseMonthCalendar={canUseMonthCalendar}
        isOpen={true}
        toggleLevel3={toggleLevel3}
        handleLevel3DragStart={handleLevel3DragStart}
        openTransactionCreator={openTransactionCreator}
        handleInlineSaveTransaction={handleInlineSaveTransaction}
        saveDraft={saveDraft}
        deleteDraft={deleteDraft}
        inlineDraftType={level1Category.id === expenseLevel1Id ? 'expense' : 'income'}
        inlineDraftLevel1Id={level1Category.id}
        inlineDraftLevel2Id={null}
        handleHideCategory={handleHideCategory}
        handleRenameCategory={handleRenameCategory}
        handleDeleteCategory={handleDeleteCategory}
        handleUndoScheduledHide={handleUndoScheduledHide}
        handleDeleteTransaction={handleDeleteTransaction}
        handleUpdateTransaction={handleUpdateTransaction}
        handleMoveTransaction={handleMoveTransaction}
        handleDuplicateTransaction={handleDuplicateTransaction}
        handleOpenCalendarAddForDay={(_, dayText) =>
          handleOpenLevel1CalendarAddForDay(level1Category.id, dayText)
        }
        selectedTransactionIds={selectedTransactionIds}
        onToggleTransactionSelection={toggleTransactionSelection}
        getMoveTargetsForTransaction={getMoveTargetsForTransaction}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
        calendarHeatmapVariant={calendarHeatmapVariant}
        heatmapMode={heatmapMode}
        heatmapInverted={heatmapInverted}
        onHeatmapModeChange={onHeatmapModeChange}
        onHeatmapInvertedChange={onHeatmapInvertedChange}
        heatmapStorageKey={`budget-app-tree-calendar-${level1Category.id}`}
        descriptionSuggestions={descriptionSuggestions}
        getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
        getRecurringOptionsForCategoryId={getRecurringOptionsForCategoryId}
        getDefaultPaymentSourceIdForCategoryId={getDefaultPaymentSourceIdForCategoryId}
        transactionTagsMap={transactionTagsMap}
        transactionPaymentSplitsMap={transactionPaymentSplitsMap}
        onTagClick={onTagClick}
        onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
        getAmountNumber={getAmountNumber}
        styles={styles}
      />
    )
  }

  const renderLevel1DirectTransactionsSection = (level1Category: Category) => {
    const directLevel1Transactions = getTransactionsForCategoryAndMonthForSelectedMonth(
      level1Category.id
    )
    const hasInlineDraftStart = (level1InlineAddTokens[level1Category.id] || 0) > 0

    if (directLevel1Transactions.length === 0 && !hasInlineDraftStart) {
      return null
    }

    return renderLevel1LeafSection(level1Category)
  }

  const renderLevel2List = (level1Category: Category) => {
    const childrenLevel2 = getSortedLevel2Children(level1Category.id)

    if (childrenLevel2.length === 0) {
      return renderLevel1LeafSection(level1Category)
    }

    const isLevel2DndBlocked =
      reorderingLevel1Id === level1Category.id ||
      childrenLevel2.some((category) => openLevel2Ids.includes(category.id))

    if (isLevel2DndBlocked) {
      return (
        <div>
          {renderLevel1DirectTransactionsSection(level1Category)}
          {childrenLevel2.map((level2Category) => {
            const sortedLevel3Children = getSortedLevel3Children(level2Category.id)

            return renderLevel2Section(
              level1Category,
              level2Category,
              sortedLevel3Children,
              isLevel2DndBlocked
            )
          })}
        </div>
      )
    }

    return (
      <DndContext
        sensors={dndSensors}
        collisionDetection={closestCenter}
        onDragEnd={async (event) => {
          const { active, over } = event

          if (!over || active.id === over.id) {
            return
          }

          const level2Ids = childrenLevel2.map((category) => category.id)
          await handleReorderLevel2(
            level1Category.id,
            String(active.id),
            getNearestDndSwapTargetId(
              level2Ids,
              String(active.id),
              String(over.id),
              isMobileViewport
            )
          )
        }}
      >
        {renderLevel1DirectTransactionsSection(level1Category)}
        <SortableContext
          items={childrenLevel2.map((category) => category.id)}
          strategy={verticalListSortingStrategy}
        >
          {childrenLevel2.map((level2Category) => {
            const sortedLevel3Children = getSortedLevel3Children(level2Category.id)

            return renderLevel2Section(
              level1Category,
              level2Category,
              sortedLevel3Children,
              isLevel2DndBlocked
            )
          })}
        </SortableContext>
      </DndContext>
    )
  }

  const renderBlockedLevel1DragHandle = (level1Category: Category, isSortable: boolean) => {
    if (!isSortable) {
      return undefined
    }

    return (
      <button
        type="button"
        data-category-drag-handle="true"
        aria-label={`Przeciągnij kategorię ${level1Category.name}`}
        title="Aby przenosić, najpierw zwiń kategorię"
        style={{
          ...(styles.dragHandle || {}),
          ...(styles.dragHandleDisabled || {}),
          cursor: 'not-allowed',
          opacity: 0.45,
        }}
        disabled={true}
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
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
    )
  }

  const renderLevel1Actions = (level1Category: Category, isLevel1CalendarOpen: boolean) => {
    const canUseBudgetLimit =
      level1Category.id === expenseLevel1Id && Boolean(getBudgetLimitView && onEditBudgetLimit)
    const budgetLimitView = canUseBudgetLimit ? getBudgetLimitView?.(null) ?? null : null

    return (
      <>
        {!isSelectedMonthLocked && (
          <button
            type="button"
            data-category-quick-add="true"
            style={styles.secondaryButton}
            aria-label={`Dodaj wpis: ${level1Category.name}`}
            title="Dodaj wpis"
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              openTransactionCreator(level1Category.id)
            }}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
              <path
                d="M12 5v14M5 12h14"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        )}

        <details
          data-mobile-category-menu="true"
          data-floating-dropdown="true"
          onClick={(event) => event.stopPropagation()}
        >
          <summary style={styles.secondaryButton} aria-label={`Menu kategorii ${level1Category.name}`}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <circle cx="5" cy="12" r="1.8" fill="currentColor" />
              <circle cx="12" cy="12" r="1.8" fill="currentColor" />
              <circle cx="19" cy="12" r="1.8" fill="currentColor" />
            </svg>
          </summary>
          <div data-mobile-category-menu-panel="true">
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={(event) => {
                event.stopPropagation()
                setOpenAddSubcategoryFor(level1Category.id)
                setNewSubcategoryName('')

                if (!openLevel1Ids.includes(level1Category.id)) {
                  toggleLevel1(level1Category.id)
                }
              }}
            >
              Dodaj kategorię
            </button>

            {canUseMonthCalendar && (
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={(event) => {
                  event.stopPropagation()
                  toggleLevel1Calendar(level1Category.id)
                }}
              >
                {isLevel1CalendarOpen ? 'zamknij kalendarz' : 'kalendarz'}
              </button>
            )}

            {canUseBudgetLimit && onEditBudgetLimit && (
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={(event) => {
                  event.stopPropagation()
                  onEditBudgetLimit(null)
                }}
              >
                {budgetLimitView ? 'Edytuj limit' : 'Ustaw limit'}
              </button>
            )}
          </div>
        </details>
      </>
    )
  }

  const renderAddSubcategoryForm = (parentId: string, placeholder: string) => {
    if (openAddSubcategoryFor !== parentId) {
      return null
    }

    return (
      <div style={styles.formRow}>
        <input
          style={styles.input}
          placeholder={placeholder}
          value={newSubcategoryName}
          onChange={(event) => setNewSubcategoryName(event.target.value)}
          onKeyDown={async (event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              setOpenAddSubcategoryFor(null)
              setNewSubcategoryName('')
              return
            }

            if (event.key === 'Enter') {
              event.preventDefault()
              await handleAddSubcategory(parentId)
            }
          }}
        />
        <button
          type="button"
          style={styles.primaryButton}
          onClick={async () => {
            await handleAddSubcategory(parentId)
          }}
        >
          zapisz
        </button>
        <button
          type="button"
          style={styles.secondaryButton}
          onClick={() => {
            setOpenAddSubcategoryFor(null)
            setNewSubcategoryName('')
          }}
        >
          anuluj
        </button>
      </div>
    )
  }

  const renderLevel1CalendarPanel = (level1Category: Category): ReactNode => {
    const calendarHeatmapVariant = getCalendarHeatmapVariantForLevel1Id(level1Category.id)

    return (
      <MonthCalendarPanel
        selectedMonth={selectedMonth}
        budgetStartDate={budgetStartDate}
        transactions={getTransactionsForLevel1AndMonth(level1Category.id)}
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
        heatmapStorageKey={`budget-app-tree-calendar-${level1Category.id}`}
        descriptionSuggestions={descriptionSuggestions}
        getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
        transactionTagsMap={transactionTagsMap}
        transactionPaymentSplitsMap={transactionPaymentSplitsMap}
        onTagClick={onTagClick}
        onAddTransactionForDay={(dayText) =>
          handleOpenLevel1CalendarAddForDay(level1Category.id, dayText)
        }
        calendarTitle={`Kalendarz • ${level1Category.name}`}
        calendarSubtitle=""
      />
    )
  }

  const getLevel1Summary = (level1Category: Category) => ({
    amount: getSumForCategoryForSelectedMonth(level1Category.id),
    transactionCount: getTransactionsForLevel1AndMonth(level1Category.id).length,
    childCount: getSortedLevel2Children(level1Category.id).length,
  })
  const getLevel1Kind = (level1Category: Category) =>
    level1Category.id === expenseLevel1Id ? 'expense' : 'income'

  const renderLevel1Content = (level1Category: Category) => {
    const isLevel1Open = openLevel1Ids.includes(level1Category.id)
    const isLevel1CalendarOpen = openLevel1CalendarIds.includes(level1Category.id)

    if (!isLevel1Open && !(canUseMonthCalendar && isLevel1CalendarOpen)) {
      return null
    }

    return (
      <section
        key={`content-${level1Category.id}`}
        data-level1-expanded-content="true"
        data-level1-kind={getLevel1Kind(level1Category)}
      >
        {canUseMonthCalendar && isLevel1CalendarOpen && renderLevel1CalendarPanel(level1Category)}
        {renderAddSubcategoryForm(level1Category.id, 'Nazwa kategorii')}
        {isLevel1Open ? renderLevel2List(level1Category) : null}
      </section>
    )
  }

  const isLevel1DndBlocked =
    isReorderingLevel1 || sortedLevel1.some((category) => openLevel1Ids.includes(category.id))
  const isLevel1Sortable = sortedLevel1.length > 1

  if (isMobileViewport) {
    return (
      <div data-level1-tree-shell="true" data-level1-mobile-flow="true">
        <DndContext
          sensors={dndSensors}
          collisionDetection={closestCenter}
          onDragStart={() => {
            handleLevel1DragStart()
          }}
          onDragEnd={async (event: DragEndEvent) => {
            const { active, over } = event

            if (!over || active.id === over.id) {
              return
            }

            const level1Ids = sortedLevel1.map((category) => category.id)
            await handleReorderLevel1(
              String(active.id),
              getNearestDndSwapTargetId(
                level1Ids,
                String(active.id),
                String(over.id),
                true
              )
            )
          }}
        >
          <SortableContext
            items={sortedLevel1.map((category) => category.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedLevel1.map((level1Category) => {
              const isLevel1Open = openLevel1Ids.includes(level1Category.id)
              const isLevel1CalendarOpen = openLevel1CalendarIds.includes(level1Category.id)

              return (
                <SortableLevel1Card
                  key={level1Category.id}
                  level1Category={level1Category}
                  isOpen={isLevel1Open}
                  onToggle={() => toggleLevel1(level1Category.id)}
                  isSortable={isLevel1Sortable}
                  styles={styles}
                  kind={getLevel1Kind(level1Category)}
                  summary={getLevel1Summary(level1Category)}
                  extraActions={renderLevel1Actions(level1Category, isLevel1CalendarOpen)}
                  limitIndicator={
                    level1Category.id === expenseLevel1Id && getBudgetLimitView ? (
                      <BudgetLimitIndicator view={getBudgetLimitView?.(null) ?? null} />
                    ) : null
                  }
                >
                  {renderLevel1Content(level1Category)}
                </SortableLevel1Card>
              )
            })}
          </SortableContext>
        </DndContext>
      </div>
    )
  }

  if (isLevel1DndBlocked) {
    return (
      <div data-level1-tree-shell="true">
        <div data-level1-header-grid="true">
          {sortedLevel1.map((level1Category) => {
            const isLevel1Open = openLevel1Ids.includes(level1Category.id)
          const isLevel1CalendarOpen = openLevel1CalendarIds.includes(level1Category.id)

          return (
            <StaticLevel1Card
              key={level1Category.id}
              level1Category={level1Category}
              isOpen={isLevel1Open}
              onToggle={() => toggleLevel1(level1Category.id)}
              styles={styles}
              kind={getLevel1Kind(level1Category)}
              summary={getLevel1Summary(level1Category)}
              dragHandle={renderBlockedLevel1DragHandle(level1Category, isLevel1Sortable)}
              extraActions={renderLevel1Actions(level1Category, isLevel1CalendarOpen)}
              limitIndicator={
                level1Category.id === expenseLevel1Id && getBudgetLimitView ? (
                  <BudgetLimitIndicator view={getBudgetLimitView?.(null) ?? null} />
                ) : null
              }
            />
          )
        })}
        </div>
        <div data-level1-content-stack="true">{sortedLevel1.map(renderLevel1Content)}</div>
      </div>
    )
  }

  return (
    <div data-level1-tree-shell="true">
      <DndContext
        sensors={dndSensors}
        collisionDetection={closestCenter}
        onDragStart={() => {
          handleLevel1DragStart()
        }}
        onDragEnd={async (event: DragEndEvent) => {
          const { active, over } = event

          if (!over || active.id === over.id) {
            return
          }

          const level1Ids = sortedLevel1.map((category) => category.id)
          await handleReorderLevel1(
            String(active.id),
            getNearestDndSwapTargetId(
              level1Ids,
              String(active.id),
              String(over.id),
              isMobileViewport
            )
          )
        }}
      >
        <SortableContext
          items={sortedLevel1.map((category) => category.id)}
          strategy={verticalListSortingStrategy}
        >
          <div data-level1-header-grid="true">
            {sortedLevel1.map((level1Category) => {
              const isLevel1Open = openLevel1Ids.includes(level1Category.id)
              const isLevel1CalendarOpen = openLevel1CalendarIds.includes(level1Category.id)

          return (
            <SortableLevel1Card
              key={level1Category.id}
              level1Category={level1Category}
              isOpen={isLevel1Open}
              onToggle={() => toggleLevel1(level1Category.id)}
              isSortable={isLevel1Sortable}
              styles={styles}
              kind={getLevel1Kind(level1Category)}
              summary={getLevel1Summary(level1Category)}
              extraActions={renderLevel1Actions(level1Category, isLevel1CalendarOpen)}
              limitIndicator={
                level1Category.id === expenseLevel1Id && getBudgetLimitView ? (
                  <BudgetLimitIndicator view={getBudgetLimitView?.(null) ?? null} />
                ) : null
              }
            />
          )
        })}
          </div>
        </SortableContext>
      </DndContext>
      <div data-level1-content-stack="true">{sortedLevel1.map(renderLevel1Content)}</div>
    </div>
  )
}
