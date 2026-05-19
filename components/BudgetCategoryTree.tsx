'use client'

import { ReactNode, useEffect, useState } from 'react'
import { closestCenter, DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Level2Section from './Level2Section'
import Level3Section from './Level3Section'
import MonthCalendarPanel from './MonthCalendarPanel'
import BudgetCategoryTreeAddSubcategoryForm from './category-tree/BudgetCategoryTreeAddSubcategoryForm'
import BudgetCategoryTreeLevel1Actions from './category-tree/BudgetCategoryTreeLevel1Actions'
import BudgetCategoryTreeLevel1Shell from './category-tree/BudgetCategoryTreeLevel1Shell'
import { Category } from '../lib/budgetPageTypes'
import { usePressHoldDndSensors } from '../lib/usePressHoldDndSensors'
import { useIsMobileViewport } from '../lib/useIsMobileViewport'
import { getNearestDndSwapTargetId } from '../lib/getNearestDndSwapTargetId'

type Props = import('./category-tree/budgetCategoryTreeTypes').BudgetCategoryTreeProps

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
    newSubcategoryIconKey,
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
    setNewSubcategoryIconKey,
    setNewSubcategoryName,
    getSortedLevel2Children,
    getSortedLevel3Children,
    getTransactionsForLevel1AndMonth,
    getTransactionsForCategoryAndMonthForSelectedMonth,
    getSumForCategoryForSelectedMonth,
    getSumForLevel2ForSelectedMonth,
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
    handleUpdateCategoryIcon,
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
  const [level1InlineAddTokens] = useState<Record<string, number>>({})

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
        newSubcategoryIconKey={newSubcategoryIconKey}
        setOpenAddSubcategoryFor={setOpenAddSubcategoryFor}
        newSubcategoryName={newSubcategoryName}
        setNewSubcategoryIconKey={setNewSubcategoryIconKey}
        setNewSubcategoryName={setNewSubcategoryName}
        handleAddSubcategory={handleAddSubcategory}
        handleRenameCategory={handleRenameCategory}
        handleUpdateCategoryIcon={handleUpdateCategoryIcon}
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
        handleUpdateCategoryIcon={handleUpdateCategoryIcon}
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
    const canUseBudgetLimit = level1Category.id === expenseLevel1Id && Boolean(getBudgetLimitView)
    const budgetLimitView = canUseBudgetLimit ? getBudgetLimitView?.(null) ?? null : null

    return (
      <BudgetCategoryTreeLevel1Actions
        level1Category={level1Category}
        isLevel1CalendarOpen={isLevel1CalendarOpen}
        canUseMonthCalendar={canUseMonthCalendar}
        canUseBudgetLimit={canUseBudgetLimit}
        budgetLimitView={budgetLimitView}
        styles={styles}
        toggleLevel1Calendar={toggleLevel1Calendar}
        setOpenAddSubcategoryFor={setOpenAddSubcategoryFor}
        setNewSubcategoryName={setNewSubcategoryName}
        setNewSubcategoryIconKey={setNewSubcategoryIconKey}
        onEditBudgetLimit={onEditBudgetLimit}
      />
    )
  }

  const renderAddSubcategoryForm = (parentId: string, placeholder: string) => (
    <BudgetCategoryTreeAddSubcategoryForm
      parentId={parentId}
      placeholder={placeholder}
      openAddSubcategoryFor={openAddSubcategoryFor}
      newSubcategoryName={newSubcategoryName}
      newSubcategoryIconKey={newSubcategoryIconKey}
      setOpenAddSubcategoryFor={setOpenAddSubcategoryFor}
      setNewSubcategoryName={setNewSubcategoryName}
      setNewSubcategoryIconKey={setNewSubcategoryIconKey}
      handleAddSubcategory={handleAddSubcategory}
      styles={styles}
    />
  )

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

  return (
    <BudgetCategoryTreeLevel1Shell
      sortedLevel1={sortedLevel1}
      openLevel1Ids={openLevel1Ids}
      openLevel1CalendarIds={openLevel1CalendarIds}
      isMobileViewport={isMobileViewport} isLevel1DndBlocked={isLevel1DndBlocked} isLevel1Sortable={isLevel1Sortable}
      dndSensors={dndSensors}
      expenseLevel1Id={expenseLevel1Id} styles={styles} toggleLevel1={toggleLevel1}
      handleLevel1DragStart={handleLevel1DragStart} handleReorderLevel1={handleReorderLevel1}
      getLevel1Kind={getLevel1Kind} getLevel1Summary={getLevel1Summary} getBudgetLimitView={getBudgetLimitView}
      renderBlockedLevel1DragHandle={renderBlockedLevel1DragHandle} renderLevel1Actions={renderLevel1Actions}
      renderLevel1Content={renderLevel1Content}
    />
  )
}
