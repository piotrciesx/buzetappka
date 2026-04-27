'use client'

import { CSSProperties, ReactNode } from 'react'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Level2Section from './Level2Section'
import Level3Section from './Level3Section'
import MonthCalendarPanel from './MonthCalendarPanel'
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

type Props = {
  sortedLevel1: Category[]
  openLevel1Ids: string[]
  openLevel1CalendarIds: string[]
  openLevel2Ids: string[]
  openLevel3Ids: string[]
  selectedMonth: string
  isSelectedMonthLocked: boolean
  openAddSubcategoryFor: string | null
  newSubcategoryName: string
  selectedTransactionIds: string[]
  isReorderingLevel1: boolean
  reorderingLevel1Id: string | null
  reorderingLevel2Id: string | null
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
  isCategoryClosingAfterSelectedMonth: (category: Category, selectedMonth: string) => boolean
  handleAddSubcategory: (level2Id: string) => Promise<void>
  openTransactionCreator: (suggestedCategoryId: string) => void
  handleInlineSaveTransaction: (
    categoryId: string,
    amountText: string,
    descriptionText: string,
    dayText: string,
    tagNames?: string[],
    paymentSourceId?: string | null,
    paymentSplitItems?: Array<{ paymentSourceId: string; amount: string }>
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
  transactionTagsMap: Record<string, Tag[]>
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
  onTagClick?: (tagId: string) => void
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
}

export default function BudgetCategoryTree(props: Props) {
  const {
    sortedLevel1,
    openLevel1Ids,
    openLevel1CalendarIds,
    openLevel2Ids,
    openLevel3Ids,
    selectedMonth,
    isSelectedMonthLocked,
    openAddSubcategoryFor,
    newSubcategoryName,
    selectedTransactionIds,
    isReorderingLevel1,
    reorderingLevel1Id,
    reorderingLevel2Id,
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
    isCategoryClosingAfterSelectedMonth,
    handleAddSubcategory,
    openTransactionCreator,
    handleInlineSaveTransaction,
    handleHideCategory,
    handleRestoreCategory,
    handleUndoScheduledHide,
    handleDeleteTransaction,
    handleUpdateTransaction,
    handleMoveTransaction,
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
    transactionTagsMap,
    transactionPaymentSplitsMap = {},
    onTagClick,
    onDeleteDescriptionSuggestion,
  } = props

  const level1Sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  )

  const level2Sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  )

  const renderLevel2Section = (
    level1Category: Category,
    level2Category: Category,
    sortedLevel3Children: Category[],
    isLevel2DndBlocked: boolean
  ) => {
    const calendarHeatmapVariant = getCalendarHeatmapVariantForLevel1Id(level1Category.id)

    return (
      <Level2Section
        key={level2Category.id}
        l2={level2Category}
        sortedLevel3Children={sortedLevel3Children}
        selectedMonth={selectedMonth}
        isSelectedMonthLocked={isSelectedMonthLocked}
        isClosingAfterSelectedMonth={isCategoryClosingAfterSelectedMonth(
          level2Category,
          selectedMonth
        )}
        openLevel2Ids={openLevel2Ids}
        toggleLevel2={toggleLevel2}
        openLevel3Ids={openLevel3Ids}
        toggleLevel3={toggleLevel3}
        getSumForLevel2={getSumForLevel2ForSelectedMonth}
        getCountForLevel2={getCountForLevel2ForSelectedMonth}
        getSumForCategory={getSumForCategoryForSelectedMonth}
        getTransactionsForCategoryAndMonth={getTransactionsForCategoryAndMonthForSelectedMonth}
        openAddSubcategoryFor={openAddSubcategoryFor}
        setOpenAddSubcategoryFor={setOpenAddSubcategoryFor}
        newSubcategoryName={newSubcategoryName}
        setNewSubcategoryName={setNewSubcategoryName}
        handleAddSubcategory={handleAddSubcategory}
        openTransactionCreator={openTransactionCreator}
        handleInlineSaveTransaction={handleInlineSaveTransaction}
        handleHideCategory={handleHideCategory}
        handleRestoreCategory={handleRestoreCategory}
        handleUndoScheduledHide={handleUndoScheduledHide}
        handleDeleteTransaction={handleDeleteTransaction}
        handleUpdateTransaction={handleUpdateTransaction}
        handleMoveTransaction={handleMoveTransaction}
        handleOpenCalendarAddForDay={handleOpenCategoryCalendarAddForDay}
        selectedTransactionIds={selectedTransactionIds}
        onToggleTransactionSelection={toggleTransactionSelection}
        getMoveTargetsForTransaction={getMoveTargetsForTransaction}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
        calendarHeatmapVariant={calendarHeatmapVariant}
        heatmapStorageKey={`budget-app-tree-calendar-${level2Category.id}`}
        descriptionSuggestions={descriptionSuggestions}
        getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
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

    return (
      <Level3Section
        key={level1Category.id}
        l3={level1Category}
        selectedMonth={selectedMonth}
        isClosingAfterSelectedMonth={isCategoryClosingAfterSelectedMonth(
          level1Category,
          selectedMonth
        )}
        categorySum={getSumForCategoryForSelectedMonth(level1Category.id)}
        transactions={getTransactionsForLevel1AndMonth(level1Category.id)}
        canAddHere={true}
        isSelectedMonthLocked={isSelectedMonthLocked}
        isOpen={openLevel3Ids.includes(level1Category.id)}
        toggleLevel3={toggleLevel3}
        handleLevel3DragStart={handleLevel3DragStart}
        openTransactionCreator={openTransactionCreator}
        handleInlineSaveTransaction={handleInlineSaveTransaction}
        handleHideCategory={handleHideCategory}
        handleUndoScheduledHide={handleUndoScheduledHide}
        handleDeleteTransaction={handleDeleteTransaction}
        handleUpdateTransaction={handleUpdateTransaction}
        handleMoveTransaction={handleMoveTransaction}
        handleOpenCalendarAddForDay={(_, dayText) =>
          handleOpenLevel1CalendarAddForDay(level1Category.id, dayText)
        }
        selectedTransactionIds={selectedTransactionIds}
        onToggleTransactionSelection={toggleTransactionSelection}
        getMoveTargetsForTransaction={getMoveTargetsForTransaction}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
        calendarHeatmapVariant={calendarHeatmapVariant}
        heatmapStorageKey={`budget-app-tree-calendar-${level1Category.id}`}
        descriptionSuggestions={descriptionSuggestions}
        transactionTagsMap={transactionTagsMap}
        transactionPaymentSplitsMap={transactionPaymentSplitsMap}
        onTagClick={onTagClick}
        onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
        getAmountNumber={getAmountNumber}
        styles={styles}
      />
    )
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
        sensors={level2Sensors}
        collisionDetection={closestCenter}
        onDragEnd={async (event) => {
          const { active, over } = event

          if (!over || active.id === over.id) {
            return
          }

          await handleReorderLevel2(level1Category.id, String(active.id), String(over.id))
        }}
      >
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
        ::
      </button>
    )
  }

  const renderLevel1CalendarButton = (level1Category: Category, isLevel1CalendarOpen: boolean) => {
    return (
      <button
        type="button"
        style={styles.secondaryButton}
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          toggleLevel1Calendar(level1Category.id)
        }}
      >
        {isLevel1CalendarOpen ? 'zamknij kalendarz' : 'kalendarz'}
      </button>
    )
  }

  const renderLevel1CalendarPanel = (level1Category: Category): ReactNode => {
    const calendarHeatmapVariant = getCalendarHeatmapVariantForLevel1Id(level1Category.id)

    return (
      <MonthCalendarPanel
        selectedMonth={selectedMonth}
        transactions={getTransactionsForLevel1AndMonth(level1Category.id)}
        styles={styles}
        isSelectedMonthLocked={isSelectedMonthLocked}
        getAmountNumber={getAmountNumber}
        getMoveTargetsForTransaction={getMoveTargetsForTransaction}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
        onUpdateTransaction={handleUpdateTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        onMoveTransaction={handleMoveTransaction}
        heatmapVariant={calendarHeatmapVariant}
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
        calendarSubtitle="Kliknij dzień, aby zobaczyć wpisy z tego Level 1 lub dodać nowy wpis."
      />
    )
  }

  const isLevel1DndBlocked =
    isReorderingLevel1 || sortedLevel1.some((category) => openLevel1Ids.includes(category.id))
  const isLevel1Sortable = sortedLevel1.length > 1

  if (isLevel1DndBlocked) {
    return (
      <div>
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
              dragHandle={renderBlockedLevel1DragHandle(level1Category, isLevel1Sortable)}
              extraActions={renderLevel1CalendarButton(level1Category, isLevel1CalendarOpen)}
            >
              {isLevel1CalendarOpen && renderLevel1CalendarPanel(level1Category)}
              {isLevel1Open ? renderLevel2List(level1Category) : null}
            </StaticLevel1Card>
          )
        })}
      </div>
    )
  }

  return (
    <DndContext
      sensors={level1Sensors}
      collisionDetection={closestCenter}
      onDragStart={() => {
        handleLevel1DragStart()
      }}
      onDragEnd={async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) {
          return
        }

        await handleReorderLevel1(String(active.id), String(over.id))
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
              extraActions={renderLevel1CalendarButton(level1Category, isLevel1CalendarOpen)}
            >
              {isLevel1CalendarOpen && renderLevel1CalendarPanel(level1Category)}
              {isLevel1Open ? renderLevel2List(level1Category) : null}
            </SortableLevel1Card>
          )
        })}
      </SortableContext>
    </DndContext>
  )
}
