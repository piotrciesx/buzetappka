'use client'

import type { ComponentProps, CSSProperties } from 'react'
import BudgetCategoryTree from './BudgetCategoryTree'
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

type BudgetCategoryTreeProps = ComponentProps<typeof BudgetCategoryTree>

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
  handleLevel3DragStart: BudgetCategoryTreeProps['handleLevel3DragStart']
  handleReorderLevel3: BudgetCategoryTreeProps['handleReorderLevel3']
  handleLevel1DragStart: BudgetCategoryTreeProps['handleLevel1DragStart']
  handleReorderLevel1: BudgetCategoryTreeProps['handleReorderLevel1']
  handleReorderLevel2: BudgetCategoryTreeProps['handleReorderLevel2']

  descriptionSuggestions: BudgetCategoryTreeProps['descriptionSuggestions']
  getPaymentSourceOptionsForCategoryId: BudgetCategoryTreeProps['getPaymentSourceOptionsForCategoryId']
  getRecurringOptionsForCategoryId: BudgetCategoryTreeProps['getRecurringOptionsForCategoryId']
  transactionTagsMap: Record<string, Tag[]>
  transactionPaymentSplitsMap: Record<string, TransactionPaymentSplit[]>
  onTagClick: BudgetCategoryTreeProps['onTagClick']
  onDeleteDescriptionSuggestion: BudgetCategoryTreeProps['onDeleteDescriptionSuggestion']
}

export default function BudgetTreeSection({
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
  getRecurringOptionsForCategoryId,
  transactionTagsMap,
  transactionPaymentSplitsMap,
  onTagClick,
  onDeleteDescriptionSuggestion,
}: Props) {
  return (
    <div>
      <div style={styles.sectionTitle}>Drzewo kategorii</div>

      <div style={styles.sortBar}>
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

      {sortedLevel1.length === 0 && (
        <div style={styles.emptyStateCard}>Brak widocznych kategorii w wybranym miesiącu</div>
      )}

      <BudgetCategoryTree
        sortedLevel1={sortedLevel1}
        openLevel1Ids={openLevel1Ids}
        openLevel1CalendarIds={openLevel1CalendarIds}
        openLevel2Ids={openLevel2Ids}
        openLevel3Ids={openLevel3Ids}
        selectedMonth={selectedMonth}
        isSelectedMonthLocked={isSelectedMonthLocked}
        openAddSubcategoryFor={openAddSubcategoryFor}
        newSubcategoryName={newSubcategoryName}
        selectedTransactionIds={selectedTransactionIds}
        isReorderingLevel1={isReorderingLevel1}
        reorderingLevel1Id={reorderingLevel1Id}
        reorderingLevel2Id={reorderingLevel2Id}
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
        handleHideCategory={handleHideCategory}
        handleRestoreCategory={handleRestoreCategory}
        handleUndoScheduledHide={handleUndoScheduledHide}
        handleDeleteTransaction={handleDeleteTransaction}
        handleUpdateTransaction={handleUpdateTransaction}
        handleMoveTransaction={handleMoveTransaction}
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
        transactionTagsMap={transactionTagsMap}
        transactionPaymentSplitsMap={transactionPaymentSplitsMap}
        onTagClick={onTagClick}
        onDeleteDescriptionSuggestion={onDeleteDescriptionSuggestion}
      />
    </div>
  )
}
