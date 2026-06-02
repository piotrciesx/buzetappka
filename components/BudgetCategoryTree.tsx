'use client'

import { ReactNode, useEffect, useState } from 'react'
import { closestCenter, DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Level2Section from './Level2Section'
import MonthCalendarPanel from './MonthCalendarPanel'
import BudgetCategoryTreeAddSubcategoryForm from './category-tree/BudgetCategoryTreeAddSubcategoryForm'
import BudgetCategoryTreeLevel1Actions from './category-tree/BudgetCategoryTreeLevel1Actions'
import BudgetCategoryTreeLevel1Shell from './category-tree/BudgetCategoryTreeLevel1Shell'
import CategoryEntriesPopup from './category-tree/CategoryEntriesPopup'
import CategoryEntriesTreeView from './category-tree/CategoryEntriesTreeView'
import { Category } from '../lib/budgetPageTypes'
import {
  buildCategoryEntriesPopupViewModel,
  type SelectedCategoryEntriesPanel,
} from '../lib/buildCategoryEntriesPopupViewModel'
import { usePressHoldDndSensors } from '../lib/usePressHoldDndSensors'
import { useIsMobileViewport } from '../lib/useIsMobileViewport'
import { getNearestDndSwapTargetId } from '../lib/getNearestDndSwapTargetId'
import { getProfileStorageKey } from '../lib/profileStorage'

type Props = import('./category-tree/budgetCategoryTreeTypes').BudgetCategoryTreeProps

export default function BudgetCategoryTree(props: Props) {
  const {
    sortedLevel1,
    openLevel1Ids,
    openLevel1CalendarIds,
    openLevel2Ids,
    openLevel3Ids,
    selectedMonth,
    profileId,
    userId,
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

  const dndSensors = usePressHoldDndSensors({
    mouseDistance: 8,
    touchDelay: 640,
    touchTolerance: 10,
  })
  const isMobileViewport = useIsMobileViewport()
  const [level1InlineAddTokens] = useState<Record<string, number>>({})
  const [selectedCategoryEntriesPanel, setSelectedCategoryEntriesPanel] =
    useState<SelectedCategoryEntriesPanel>(null)
  const getCalendarStorageKey = (categoryId: string) =>
    userId && profileId
      ? getProfileStorageKey({
          userId,
          profileId,
          featureKey: `tree-calendar:${categoryId}`,
        })
      : ''

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

  useEffect(() => {
    if (!selectedCategoryEntriesPanel) {
      return
    }

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedCategoryEntriesPanel(null)
      }
    }

    window.addEventListener('keydown', closeOnEscape)

    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selectedCategoryEntriesPanel])

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
        profileId={profileId}
        userId={userId}
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
        getSumForLevel2={getLevel2TreeSum}
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
        heatmapStorageKey={getCalendarStorageKey(level2Category.id)}
        legacyHeatmapStorageKeys={[`budget-app-tree-calendar-${level2Category.id}`]}
        getCalendarStorageKey={getCalendarStorageKey}
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
        renderTransactionsInline={false}
        onOpenEntries={(type, categoryId) => setSelectedCategoryEntriesPanel({ type, categoryId })}
        styles={styles}
      />
    )
  }

  const renderLevel2List = (level1Category: Category) => {
    const childrenLevel2 = getSortedLevel2Children(level1Category.id)

    if (childrenLevel2.length === 0) {
      return (
        <div data-level2-list="true">
          <div style={styles.emptyText}>Brak kategorii poziomu 2</div>
        </div>
      )
    }

    const isLevel2DndBlocked =
      reorderingLevel1Id === level1Category.id ||
      childrenLevel2.some((category) => openLevel2Ids.includes(category.id))

    if (isLevel2DndBlocked) {
      return (
        <div data-level2-list="true">
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
      <div data-level2-list="true">
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
      </div>
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
        heatmapStorageKey={getCalendarStorageKey(level1Category.id)}
        legacyHeatmapStorageKeys={[`budget-app-tree-calendar-${level1Category.id}`]}
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
    amount: getLevel1TreeSum(level1Category.id),
    transactionCount: getTransactionsForLevel1AndMonth(level1Category.id).length,
    childCount: getSortedLevel2Children(level1Category.id).length,
  })
  const getLevel1Kind = (level1Category: Category) =>
    level1Category.id === expenseLevel1Id ? 'expense' : 'income'

  const getLevel1TreeSum = (level1Id: string) =>
    getTransactionsForLevel1AndMonth(level1Id).reduce(
      (total, transaction) => total + getSignedAmountForTransaction(transaction),
      0
    )

  const getLevel2TreeSum = (level2Id: string) => {
    const directLevel2Sum = getSumForCategoryForSelectedMonth(level2Id)
    const level3Sum = getSortedLevel3Children(level2Id).reduce(
      (total, level3Category) => total + getSumForCategoryForSelectedMonth(level3Category.id),
      0
    )

    return directLevel2Sum + level3Sum
  }

  const renderLevel1Content = (level1Category: Category) => {
    const isLevel1CalendarOpen = openLevel1CalendarIds.includes(level1Category.id)
    const level1Kind = getLevel1Kind(level1Category)

    return (
      <section
        key={`content-${level1Category.id}`}
        data-level1-expanded-content="true"
        data-level1-kind={level1Kind}
      >
        <div data-level1-tree-body="true">
          {canUseMonthCalendar && isLevel1CalendarOpen && renderLevel1CalendarPanel(level1Category)}
          {renderLevel2List(level1Category)}
        </div>
        {renderAddSubcategoryForm(level1Category.id, 'Nazwa kategorii')}
        <button
          type="button"
          data-level1-add-category-button="true"
          onClick={() => {
            setOpenAddSubcategoryFor(level1Category.id)
            setNewSubcategoryName('')
            setNewSubcategoryIconKey(null)
          }}
        >
          + Dodaj kategorię {level1Kind === 'income' ? 'przychodu' : 'wydatku'}
        </button>
      </section>
    )
  }

  const isLevel1DndBlocked = isReorderingLevel1
  const isLevel1Sortable = sortedLevel1.length > 1

  const renderSelectedEntriesPopup = () => {
    const viewModel = buildCategoryEntriesPopupViewModel({
      selectedPanel: selectedCategoryEntriesPanel,
      sortedLevel1,
      selectedMonth,
      getSortedLevel2Children,
      getSortedLevel3Children,
      getTransactionsForCategoryAndMonth: getTransactionsForCategoryAndMonthForSelectedMonth,
    })

    if (!viewModel) {
      return null
    }

    return (
      <CategoryEntriesPopup
        title={viewModel.title}
        subtitle={viewModel.subtitle}
        onClose={() => setSelectedCategoryEntriesPanel(null)}
      >
        <CategoryEntriesTreeView
          viewModel={viewModel}
          selectedMonth={selectedMonth}
          budgetStartDate={budgetStartDate}
          isSelectedMonthLocked={isSelectedMonthLocked}
          canUseMonthCalendar={canUseMonthCalendar}
          expenseLevel1Id={expenseLevel1Id}
          isCategoryClosingAfterSelectedMonth={isCategoryClosingAfterSelectedMonth}
          getSumForCategoryForSelectedMonth={getSumForCategoryForSelectedMonth}
          getAmountNumber={getAmountNumber}
          getMoveTargetsForTransaction={getMoveTargetsForTransaction}
          getSignedAmountForTransaction={getSignedAmountForTransaction}
          getCalendarHeatmapVariantForLevel1Id={getCalendarHeatmapVariantForLevel1Id}
          heatmapMode={heatmapMode}
          heatmapInverted={heatmapInverted}
          onHeatmapModeChange={onHeatmapModeChange}
          onHeatmapInvertedChange={onHeatmapInvertedChange}
          openTransactionCreator={openTransactionCreator}
          handleInlineSaveTransaction={handleInlineSaveTransaction}
          saveDraft={saveDraft}
          deleteDraft={deleteDraft}
          handleHideCategory={handleHideCategory}
          handleRenameCategory={handleRenameCategory}
          handleUpdateCategoryIcon={handleUpdateCategoryIcon}
          handleDeleteCategory={handleDeleteCategory}
          handleUndoScheduledHide={handleUndoScheduledHide}
          handleDeleteTransaction={handleDeleteTransaction}
          handleUpdateTransaction={handleUpdateTransaction}
          handleMoveTransaction={handleMoveTransaction}
          handleDuplicateTransaction={handleDuplicateTransaction}
          handleOpenCategoryCalendarAddForDay={handleOpenCategoryCalendarAddForDay}
          handleOpenLevel1CalendarAddForDay={handleOpenLevel1CalendarAddForDay}
          handleLevel3DragStart={handleLevel3DragStart}
          selectedTransactionIds={selectedTransactionIds}
          onToggleTransactionSelection={toggleTransactionSelection}
          descriptionSuggestions={descriptionSuggestions}
          getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
          getRecurringOptionsForCategoryId={getRecurringOptionsForCategoryId}
          getDefaultPaymentSourceIdForCategoryId={getDefaultPaymentSourceIdForCategoryId}
          transactionTagsMap={transactionTagsMap}
          transactionPaymentSplitsMap={transactionPaymentSplitsMap}
          onTagClick={onTagClick}
          onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
          styles={styles}
        />
      </CategoryEntriesPopup>
    )
  }

  return (
    <>
      <BudgetCategoryTreeLevel1Shell
        sortedLevel1={sortedLevel1}
        openLevel1Ids={openLevel1Ids}
        openLevel1CalendarIds={openLevel1CalendarIds}
        isMobileViewport={isMobileViewport}
        isLevel1DndBlocked={isLevel1DndBlocked}
        isLevel1Sortable={isLevel1Sortable}
        dndSensors={dndSensors}
        expenseLevel1Id={expenseLevel1Id}
        styles={styles}
        onOpenLevel1Entries={(categoryId) =>
          setSelectedCategoryEntriesPanel({ type: 'level1', categoryId })
        }
        handleLevel1DragStart={handleLevel1DragStart}
        handleReorderLevel1={handleReorderLevel1}
        getLevel1Kind={getLevel1Kind}
        getLevel1Summary={getLevel1Summary}
        getBudgetLimitView={getBudgetLimitView}
        renderBlockedLevel1DragHandle={renderBlockedLevel1DragHandle}
        renderLevel1Actions={renderLevel1Actions}
        renderLevel1Content={renderLevel1Content}
      />
      {renderSelectedEntriesPopup()}
    </>
  )
}
