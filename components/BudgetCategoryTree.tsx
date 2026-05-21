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
import CategoryEntriesPopup from './category-tree/CategoryEntriesPopup'
import { Category } from '../lib/budgetPageTypes'
import { usePressHoldDndSensors } from '../lib/usePressHoldDndSensors'
import { useIsMobileViewport } from '../lib/useIsMobileViewport'
import { getNearestDndSwapTargetId } from '../lib/getNearestDndSwapTargetId'

type Props = import('./category-tree/budgetCategoryTreeTypes').BudgetCategoryTreeProps
type SelectedCategoryEntriesPanel =
  | { type: 'level1' | 'level2' | 'level3'; categoryId: string }
  | null

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
  const [selectedCategoryEntriesPanel, setSelectedCategoryEntriesPanel] =
    useState<SelectedCategoryEntriesPanel>(null)

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
        renderTransactionsInline={false}
        onOpenEntries={(type, categoryId) => setSelectedCategoryEntriesPanel({ type, categoryId })}
        styles={styles}
      />
    )
  }

  const renderLevel2List = (level1Category: Category) => {
    const childrenLevel2 = getSortedLevel2Children(level1Category.id)

    if (childrenLevel2.length === 0) {
      return <div style={styles.emptyText}>Brak kategorii poziomu 2</div>
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

    return (
      <section
        key={`content-${level1Category.id}`}
        data-level1-expanded-content="true"
        data-level1-kind={getLevel1Kind(level1Category)}
      >
        {canUseMonthCalendar && isLevel1CalendarOpen && renderLevel1CalendarPanel(level1Category)}
        {renderAddSubcategoryForm(level1Category.id, 'Nazwa kategorii')}
        {renderLevel2List(level1Category)}
      </section>
    )
  }

  const isLevel1DndBlocked = isReorderingLevel1
  const isLevel1Sortable = sortedLevel1.length > 1

  const findLevel1ById = (categoryId: string) =>
    sortedLevel1.find((category) => category.id === categoryId) || null

  const findLevel2ById = (categoryId: string) => {
    for (const level1Category of sortedLevel1) {
      const level2Category = getSortedLevel2Children(level1Category.id).find(
        (category) => category.id === categoryId
      )

      if (level2Category) {
        return { level1Category, level2Category }
      }
    }

    return null
  }

  const findLevel3ById = (categoryId: string) => {
    for (const level1Category of sortedLevel1) {
      for (const level2Category of getSortedLevel2Children(level1Category.id)) {
        const level3Category = getSortedLevel3Children(level2Category.id).find(
          (category) => category.id === categoryId
        )

        if (level3Category) {
          return { level1Category, level2Category, level3Category }
        }
      }
    }

    return null
  }

  const renderPopupTransactionSection = (
    category: Category,
    level1Category: Category,
    inlineDraftLevel2Id: string | null,
    transactions = getTransactionsForCategoryAndMonthForSelectedMonth(category.id),
    headerName = category.name
  ) => {
    const calendarHeatmapVariant = getCalendarHeatmapVariantForLevel1Id(level1Category.id)

    return (
      <Level3Section
        key={`entries-${category.id}-${headerName}`}
        l3={category}
        headerName={headerName}
        showCategoryActions={false}
        selectedMonth={selectedMonth}
        budgetStartDate={budgetStartDate}
        isClosingAfterSelectedMonth={isCategoryClosingAfterSelectedMonth(category, selectedMonth)}
        categorySum={getSumForCategoryForSelectedMonth(category.id)}
        transactions={transactions}
        canAddHere={true}
        isSelectedMonthLocked={isSelectedMonthLocked}
        canUseMonthCalendar={canUseMonthCalendar}
        isOpen={true}
        toggleLevel3={() => {}}
        handleLevel3DragStart={handleLevel3DragStart}
        openTransactionCreator={openTransactionCreator}
        handleInlineSaveTransaction={handleInlineSaveTransaction}
        saveDraft={saveDraft}
        deleteDraft={deleteDraft}
        inlineDraftType={level1Category.id === expenseLevel1Id ? 'expense' : 'income'}
        inlineDraftLevel1Id={level1Category.id}
        inlineDraftLevel2Id={inlineDraftLevel2Id}
        handleHideCategory={handleHideCategory}
        handleRenameCategory={handleRenameCategory}
        handleUpdateCategoryIcon={handleUpdateCategoryIcon}
        handleDeleteCategory={handleDeleteCategory}
        handleUndoScheduledHide={handleUndoScheduledHide}
        handleDeleteTransaction={handleDeleteTransaction}
        handleUpdateTransaction={handleUpdateTransaction}
        handleMoveTransaction={handleMoveTransaction}
        handleDuplicateTransaction={handleDuplicateTransaction}
        handleOpenCalendarAddForDay={(categoryId, dayText) => {
          if (category.level === 1) {
            handleOpenLevel1CalendarAddForDay(level1Category.id, dayText)
            return
          }

          handleOpenCategoryCalendarAddForDay(categoryId, dayText)
        }}
        selectedTransactionIds={selectedTransactionIds}
        onToggleTransactionSelection={toggleTransactionSelection}
        getMoveTargetsForTransaction={getMoveTargetsForTransaction}
        getSignedAmountForTransaction={getSignedAmountForTransaction}
        calendarHeatmapVariant={calendarHeatmapVariant}
        heatmapMode={heatmapMode}
        heatmapInverted={heatmapInverted}
        onHeatmapModeChange={onHeatmapModeChange}
        onHeatmapInvertedChange={onHeatmapInvertedChange}
        heatmapStorageKey={`budget-app-tree-popup-calendar-${category.id}`}
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

  const renderSelectedEntriesPopup = () => {
    if (!selectedCategoryEntriesPanel) {
      return null
    }

    const sections: ReactNode[] = []
    let title = 'Wpisy kategorii'
    let subtitle = selectedMonth

    if (selectedCategoryEntriesPanel.type === 'level1') {
      const level1Category = findLevel1ById(selectedCategoryEntriesPanel.categoryId)

      if (!level1Category) {
        return null
      }

      title = level1Category.name
      subtitle = `Całe drzewo • ${selectedMonth}`

      const directLevel1Transactions =
        getTransactionsForCategoryAndMonthForSelectedMonth(level1Category.id)

      if (directLevel1Transactions.length > 0) {
        sections.push(
          renderPopupTransactionSection(
            level1Category,
            level1Category,
            null,
            directLevel1Transactions,
            'Wpisy bezpośrednie'
          )
        )
      }

      getSortedLevel2Children(level1Category.id).forEach((level2Category) => {
        const directLevel2Transactions =
          getTransactionsForCategoryAndMonthForSelectedMonth(level2Category.id)

        if (directLevel2Transactions.length > 0) {
          sections.push(
            renderPopupTransactionSection(
              level2Category,
              level1Category,
              level2Category.id,
              directLevel2Transactions,
              `${level2Category.name} • bezpośrednie`
            )
          )
        }

        getSortedLevel3Children(level2Category.id).forEach((level3Category) => {
          const level3Transactions = getTransactionsForCategoryAndMonthForSelectedMonth(
            level3Category.id
          )

          if (level3Transactions.length > 0) {
            sections.push(
              renderPopupTransactionSection(
                level3Category,
                level1Category,
                level2Category.id,
                level3Transactions,
                `${level2Category.name} • ${level3Category.name}`
              )
            )
          }
        })
      })
    }

    if (selectedCategoryEntriesPanel.type === 'level2') {
      const result = findLevel2ById(selectedCategoryEntriesPanel.categoryId)

      if (!result) {
        return null
      }

      const { level1Category, level2Category } = result
      title = level2Category.name
      subtitle = `${level1Category.name} • ${selectedMonth}`

      sections.push(
        renderPopupTransactionSection(
          level2Category,
          level1Category,
          level2Category.id,
          getTransactionsForCategoryAndMonthForSelectedMonth(level2Category.id),
          'Wpisy bezpośrednie'
        )
      )

      getSortedLevel3Children(level2Category.id).forEach((level3Category) => {
        sections.push(
          renderPopupTransactionSection(
            level3Category,
            level1Category,
            level2Category.id,
            getTransactionsForCategoryAndMonthForSelectedMonth(level3Category.id),
            level3Category.name
          )
        )
      })
    }

    if (selectedCategoryEntriesPanel.type === 'level3') {
      const result = findLevel3ById(selectedCategoryEntriesPanel.categoryId)

      if (!result) {
        return null
      }

      const { level1Category, level2Category, level3Category } = result
      title = level3Category.name
      subtitle = `${level1Category.name} • ${level2Category.name} • ${selectedMonth}`
      sections.push(
        renderPopupTransactionSection(
          level3Category,
          level1Category,
          level2Category.id,
          getTransactionsForCategoryAndMonthForSelectedMonth(level3Category.id),
          level3Category.name
        )
      )
    }

    return (
      <CategoryEntriesPopup
        title={title}
        subtitle={subtitle}
        onClose={() => setSelectedCategoryEntriesPanel(null)}
      >
        {sections.length > 0 ? sections : <div style={styles.emptyText}>Brak wpisów w tym miesiącu</div>}
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
