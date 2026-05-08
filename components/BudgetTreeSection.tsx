'use client'

import {
  cloneElement,
  isValidElement,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'
import BudgetCategoryTree from './BudgetCategoryTree'
import type { BudgetLimitView } from './BudgetLimitIndicator'
import {
  Category,
  HideMode,
  MoveTarget,
  RestoreMode,
  SortDirection,
  SortMode,
  Tag,
  Transaction,
  TransactionPaymentSplit,
} from '../lib/budgetPageTypes'
import { isCategoryClosingAfterSelectedMonth } from '../lib/categoryUtils'
import type { TransactionDraft } from '../lib/draftUtils'

type BudgetCategoryTreeProps = ComponentProps<typeof BudgetCategoryTree>

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

  level2SortMode: string
  setLevel2SortMode: (value: SortMode) => void
  level2SortDirection: string
  setLevel2SortDirection: (value: SortDirection) => void
  level3SortMode: string
  setLevel3SortMode: (value: SortMode) => void
  level3SortDirection: string
  setLevel3SortDirection: (value: SortDirection) => void

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
  heatmapMode: BudgetCategoryTreeProps['heatmapMode']
  heatmapInverted: boolean
  onHeatmapModeChange: BudgetCategoryTreeProps['onHeatmapModeChange']
  onHeatmapInvertedChange: BudgetCategoryTreeProps['onHeatmapInvertedChange']

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
  handleLevel3DragStart: BudgetCategoryTreeProps['handleLevel3DragStart']
  handleReorderLevel3: BudgetCategoryTreeProps['handleReorderLevel3']
  handleLevel1DragStart: BudgetCategoryTreeProps['handleLevel1DragStart']
  handleReorderLevel1: BudgetCategoryTreeProps['handleReorderLevel1']
  handleReorderLevel2: BudgetCategoryTreeProps['handleReorderLevel2']

  descriptionSuggestions: BudgetCategoryTreeProps['descriptionSuggestions']
  getPaymentSourceOptionsForCategoryId: BudgetCategoryTreeProps['getPaymentSourceOptionsForCategoryId']
  getRecurringOptionsForCategoryId: BudgetCategoryTreeProps['getRecurringOptionsForCategoryId']
  getDefaultPaymentSourceIdForCategoryId: BudgetCategoryTreeProps['getDefaultPaymentSourceIdForCategoryId']
  transactionTagsMap: Record<string, Tag[]>
  transactionPaymentSplitsMap: Record<string, TransactionPaymentSplit[]>
  onTagClick: BudgetCategoryTreeProps['onTagClick']
  onDeleteDescriptionSuggestion: BudgetCategoryTreeProps['onDeleteDescriptionSuggestion']
  getBudgetLimitView?: (categoryId: string | null) => BudgetLimitView | null
  onEditBudgetLimit?: (categoryId: string | null) => void
  onAddIncome?: () => void
  onAddExpense?: () => void
  onOpenSearch?: () => void
  onOpenCalendar?: () => void
  workspaceTopContent?: ReactNode
  workspaceBottomContent?: ReactNode
}

export default function BudgetTreeSection({
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
  level2SortMode,
  setLevel2SortMode,
  level2SortDirection,
  setLevel2SortDirection,
  level3SortMode,
  setLevel3SortMode,
  level3SortDirection,
  setLevel3SortDirection,
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
  transactionPaymentSplitsMap,
  onTagClick,
  onDeleteDescriptionSuggestion,
  getBudgetLimitView,
  onEditBudgetLimit,
  onAddIncome,
  onAddExpense,
  onOpenSearch,
  onOpenCalendar,
  workspaceTopContent,
  workspaceBottomContent,
}: Props) {
  const sortMenu = (
      <div data-tree-sort-panel="true" style={styles.sortBar}>
        <div style={styles.sortGroup}>
          <label htmlFor="level2-sort-mode" style={styles.sortLabel}>
            Sortowanie L2
          </label>
          <select
            id="level2-sort-mode"
            value={level2SortMode}
            onChange={(event) => setLevel2SortMode(event.target.value as SortMode)}
            style={styles.input}
          >
            <option value="default">domyślne</option>
            <option value="manual">ręczne</option>
            <option value="sum">według sumy</option>
            <option value="frequency">według częstotliwości</option>
          </select>

          <label htmlFor="level2-sort-direction" style={styles.sortLabel}>
            Kierunek L2
          </label>
          <select
            id="level2-sort-direction"
            value={level2SortDirection}
            onChange={(event) => setLevel2SortDirection(event.target.value as SortDirection)}
            style={styles.input}
            disabled={level2SortMode !== 'sum' && level2SortMode !== 'frequency'}
          >
            <option value="asc">rosnąco</option>
            <option value="desc">malejąco</option>
          </select>
        </div>

        <div style={styles.sortGroup}>
          <label htmlFor="level3-sort-mode" style={styles.sortLabel}>
            Sortowanie L3
          </label>
          <select
            id="level3-sort-mode"
            value={level3SortMode}
            onChange={(event) => setLevel3SortMode(event.target.value as SortMode)}
            style={styles.input}
          >
            <option value="default">domyślne</option>
            <option value="manual">ręczne</option>
            <option value="sum">według sumy</option>
            <option value="frequency">według częstotliwości</option>
          </select>

          <label htmlFor="level3-sort-direction" style={styles.sortLabel}>
            Kierunek L3
          </label>
          <select
            id="level3-sort-direction"
            value={level3SortDirection}
            onChange={(event) => setLevel3SortDirection(event.target.value as SortDirection)}
            style={styles.input}
            disabled={level3SortMode !== 'sum' && level3SortMode !== 'frequency'}
          >
            <option value="asc">rosnąco</option>
            <option value="desc">malejąco</option>
          </select>
        </div>
      </div>
  )

  const workspaceTopNode = isValidElement(workspaceTopContent)
    ? cloneElement(workspaceTopContent as ReactElement<{ sortContent?: ReactNode }>, {
        sortContent: sortMenu,
      })
    : workspaceTopContent

  return (
    <div data-budget-tree-workspace="true">
      <div data-budget-tree-toolbar="true">
        <div data-tree-toolbar-actions="true">
          {onAddIncome && (
            <button
              type="button"
              data-workspace-action="income"
              onClick={onAddIncome}
              aria-label="Dodaj przychód"
              title="Dodaj przychód"
            >
              +
            </button>
          )}
          {onAddExpense && (
            <button
              type="button"
              data-workspace-action="expense"
              onClick={onAddExpense}
              aria-label="Dodaj wydatek"
              title="Dodaj wydatek"
            >
              -
            </button>
          )}
          {onOpenSearch && (
            <button
              type="button"
              data-workspace-action="neutral"
              onClick={onOpenSearch}
              aria-label="Szukaj"
              title="Szukaj"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                />
                <path
                  d="m16 16 4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.9"
                />
              </svg>
            </button>
          )}
          {onOpenCalendar && (
            <button
              type="button"
              data-workspace-action="neutral"
              onClick={onOpenCalendar}
              aria-label="Kalendarz"
              title="Kalendarz"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="15"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M8 3v4M16 3v4M4 10h16"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </button>
          )}

        </div>
      </div>

      <div data-budget-tree-control-deck="true">
        {workspaceTopNode}
      </div>

      {sortedLevel1.length === 0 && (
        <div style={styles.emptyStateCard}>Brak widocznych kategorii w wybranym miesiącu</div>
      )}

      <div data-tree-category-grid="true">
        <div data-tree-category-list="true">
        <BudgetCategoryTree
          sortedLevel1={sortedLevel1}
          openLevel1Ids={openLevel1Ids}
          openLevel1CalendarIds={openLevel1CalendarIds}
          openLevel2Ids={openLevel2Ids}
          openLevel3Ids={openLevel3Ids}
          selectedMonth={selectedMonth}
          budgetStartDate={budgetStartDate}
          isSelectedMonthLocked={isSelectedMonthLocked}
          canUseMonthCalendar={canUseMonthCalendar}
          openAddSubcategoryFor={openAddSubcategoryFor}
          newSubcategoryName={newSubcategoryName}
          selectedTransactionIds={selectedTransactionIds}
          isReorderingLevel1={isReorderingLevel1}
          reorderingLevel1Id={reorderingLevel1Id}
          reorderingLevel2Id={reorderingLevel2Id}
          expenseLevel1Id={expenseLevel1Id}
          styles={styles}
          toggleLevel1={toggleLevel1}
          toggleLevel1Calendar={toggleLevel1Calendar}
          toggleLevel2={toggleLevel2}
          toggleLevel3={toggleLevel3}
          setOpenAddSubcategoryFor={setOpenAddSubcategoryFor}
          setNewSubcategoryName={setNewSubcategoryName}
          getSortedLevel2Children={getSortedLevel2Children}
          getSortedLevel3Children={getSortedLevel3Children}
          getTransactionsForLevel1AndMonth={getTransactionsForLevel1AndMonth}
          getTransactionsForCategoryAndMonthForSelectedMonth={
            getTransactionsForCategoryAndMonthForSelectedMonth
          }
          getSumForCategoryForSelectedMonth={getSumForCategoryForSelectedMonth}
          getSumForLevel2ForSelectedMonth={getSumForLevel2ForSelectedMonth}
          getCountForLevel2ForSelectedMonth={getCountForLevel2ForSelectedMonth}
          getAmountNumber={getAmountNumber}
          getMoveTargetsForTransaction={getMoveTargetsForTransaction}
          getSignedAmountForTransaction={getSignedAmountForTransaction}
          getCalendarHeatmapVariantForLevel1Id={getCalendarHeatmapVariantForLevel1Id}
          heatmapMode={heatmapMode}
          heatmapInverted={heatmapInverted}
          onHeatmapModeChange={onHeatmapModeChange}
          onHeatmapInvertedChange={onHeatmapInvertedChange}
          isCategoryClosingAfterSelectedMonth={isCategoryClosingAfterSelectedMonth}
          handleAddSubcategory={handleAddSubcategory}
          handleRenameCategory={handleRenameCategory}
          handleDeleteCategory={handleDeleteCategory}
          openTransactionCreator={openTransactionCreator}
          handleInlineSaveTransaction={handleInlineSaveTransaction}
          saveDraft={saveDraft}
          deleteDraft={deleteDraft}
          handleHideCategory={handleHideCategory}
          handleRestoreCategory={handleRestoreCategory}
          handleUndoScheduledHide={handleUndoScheduledHide}
          handleDeleteTransaction={handleDeleteTransaction}
          handleUpdateTransaction={handleUpdateTransaction}
          handleMoveTransaction={handleMoveTransaction}
          handleDuplicateTransaction={handleDuplicateTransaction}
          handleOpenCategoryCalendarAddForDay={handleOpenCategoryCalendarAddForDay}
          handleOpenLevel1CalendarAddForDay={handleOpenLevel1CalendarAddForDay}
          toggleTransactionSelection={toggleTransactionSelection}
          handleLevel3DragStart={handleLevel3DragStart}
          handleReorderLevel3={handleReorderLevel3}
          handleLevel1DragStart={handleLevel1DragStart}
          handleReorderLevel1={handleReorderLevel1}
          handleReorderLevel2={handleReorderLevel2}
          descriptionSuggestions={descriptionSuggestions}
          getPaymentSourceOptionsForCategoryId={getPaymentSourceOptionsForCategoryId}
          getRecurringOptionsForCategoryId={getRecurringOptionsForCategoryId}
          getDefaultPaymentSourceIdForCategoryId={getDefaultPaymentSourceIdForCategoryId}
          transactionTagsMap={transactionTagsMap}
          transactionPaymentSplitsMap={transactionPaymentSplitsMap}
          onTagClick={onTagClick}
          onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
          getBudgetLimitView={getBudgetLimitView}
          onEditBudgetLimit={onEditBudgetLimit}
        />
        </div>
      </div>

      {workspaceBottomContent && (
        <div data-budget-tree-bottom-deck="true">{workspaceBottomContent}</div>
      )}
    </div>
  )
}
