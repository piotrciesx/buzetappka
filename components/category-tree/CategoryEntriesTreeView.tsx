import { useState, type FormEvent } from 'react'
import type { CSSProperties } from 'react'
import type { BudgetLimitView } from '../BudgetLimitIndicator'
import type { HeatmapMode } from '../month-calendar/monthCalendarTypes'
import type { Tag, TransactionPaymentSplit } from '../../lib/budgetPageTypes'
import type { PaymentSplitInput } from '../../lib/paymentSplitUtils'
import type { DescriptionSuggestion } from '../../lib/suggestionUtils'
import type { TransactionDraft } from '../../lib/draftUtils'
import {
  buildDateFromDayInput,
  getDayInputFromDate,
  normalizeDayInput,
} from '../../lib/dateUtils'
import type {
  CategoryEntriesPopupChildGroup,
  CategoryEntriesPopupViewModel,
} from '../../lib/buildCategoryEntriesPopupViewModel'
import {
  getOrderedLevel3Transactions,
  getTransactionDateLabel,
  type Category,
  type HideMode,
  type MoveTarget,
  type Transaction,
} from './Level3SectionUtils'

type CategoryEntriesTreeViewProps = {
  viewModel: CategoryEntriesPopupViewModel
  selectedMonth: string
  budgetStartDate: string
  isSelectedMonthLocked: boolean
  canUseMonthCalendar: boolean
  expenseLevel1Id: string | null
  isCategoryClosingAfterSelectedMonth: (category: Category, selectedMonth: string) => boolean
  getSumForCategoryForSelectedMonth: (categoryId: string) => number
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
  saveDraft: (draft: TransactionDraft, options?: { activate?: boolean }) => Promise<TransactionDraft>
  deleteDraft: (draftType: TransactionDraft['type']) => Promise<void>
  handleHideCategory: (id: string, mode?: HideMode) => Promise<void>
  handleRenameCategory: (categoryId: string) => Promise<void>
  handleUpdateCategoryIcon: (categoryId: string, iconKey: string | null) => Promise<void>
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
  handleOpenCategoryCalendarAddForDay: (categoryId: string, dayText: string) => void
  handleOpenLevel1CalendarAddForDay: (level1Id: string, dayText: string) => void
  handleLevel3DragStart: (activeId: string) => void
  selectedTransactionIds: string[]
  onToggleTransactionSelection: (transactionId: string) => void
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
  transactionPaymentSplitsMap: Record<string, TransactionPaymentSplit[]>
  onTagClick?: (tagId: string) => void
  onDeleteDescriptionSuggestion?: (
    categoryId: string | null | undefined,
    suggestion: DescriptionSuggestion
  ) => void
  styles: Record<string, CSSProperties>
}

const formatMoney = (value: number) =>
  `${value.toLocaleString('pl-PL', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  })} zł`

export default function CategoryEntriesTreeView({
  viewModel,
  selectedMonth,
  isSelectedMonthLocked,
  getAmountNumber,
  getMoveTargetsForTransaction,
  getSignedAmountForTransaction,
  handleInlineSaveTransaction,
  handleHideCategory,
  handleRenameCategory,
  handleDeleteCategory,
  handleUndoScheduledHide,
  handleDeleteTransaction,
  handleUpdateTransaction,
  handleMoveTransaction,
  handleDuplicateTransaction,
  selectedTransactionIds,
  onToggleTransactionSelection,
  transactionTagsMap,
  styles,
}: CategoryEntriesTreeViewProps) {
  const [inlineDay, setInlineDay] = useState('')
  const [inlineDescription, setInlineDescription] = useState('')
  const [inlineAmount, setInlineAmount] = useState('')
  const [isInlineSaving, setIsInlineSaving] = useState(false)

  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [editDay, setEditDay] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const [movingTransactionId, setMovingTransactionId] = useState<string | null>(null)
  const [moveTargetCategoryId, setMoveTargetCategoryId] = useState('')
  const [isMoving, setIsMoving] = useState(false)

  const hasAnyEntries =
    viewModel.directEntries.length > 0 ||
    viewModel.groupedChildren.some(
      (group) =>
        group.directEntries.length > 0 ||
        group.children.some((child) => child.directEntries.length > 0)
    )

  const startEditingTransaction = (transaction: Transaction) => {
    setMovingTransactionId(null)
    setMoveTargetCategoryId('')
    setEditingTransactionId(transaction.id)
    setEditDay(getDayInputFromDate(transaction.date, selectedMonth))
    setEditDescription(transaction.description || '')
    setEditAmount(String(Math.abs(getAmountNumber(transaction.amount))))
  }

  const cancelEditingTransaction = () => {
    setEditingTransactionId(null)
    setEditDay('')
    setEditDescription('')
    setEditAmount('')
    setIsUpdating(false)
  }

  const saveEditingTransaction = async (transaction: Transaction) => {
    if (isUpdating) {
      return
    }

    setIsUpdating(true)

    try {
      await handleUpdateTransaction(
        transaction.id,
        editAmount,
        editDescription,
        buildDateFromDayInput(selectedMonth, editDay),
        (transactionTagsMap[transaction.id] || []).map((tag) => tag.name)
      )
      cancelEditingTransaction()
    } catch {
      setIsUpdating(false)
    }
  }

  const startMovingTransaction = (transaction: Transaction) => {
    setEditingTransactionId(null)
    setMovingTransactionId(transaction.id)
    setMoveTargetCategoryId('')
  }

  const cancelMovingTransaction = () => {
    setMovingTransactionId(null)
    setMoveTargetCategoryId('')
    setIsMoving(false)
  }

  const saveMovingTransaction = async (transaction: Transaction) => {
    if (isMoving || !moveTargetCategoryId) {
      return
    }

    setIsMoving(true)

    try {
      await handleMoveTransaction(transaction.id, moveTargetCategoryId)
      cancelMovingTransaction()
    } catch {
      setIsMoving(false)
    }
  }

  const saveInlineEntry = async (event: FormEvent<HTMLFormElement>, categoryId: string) => {
    event.preventDefault()

    if (isInlineSaving || isSelectedMonthLocked) {
      return
    }

    setIsInlineSaving(true)

    try {
      await handleInlineSaveTransaction(categoryId, inlineAmount, inlineDescription, inlineDay)
      setInlineDay('')
      setInlineDescription('')
      setInlineAmount('')
    } finally {
      setIsInlineSaving(false)
    }
  }

  const renderCategoryActions = (category: Category) => (
    <details data-entries-category-menu="true">
      <summary aria-label={`Menu kategorii ${category.name}`} title="Menu">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="5" cy="12" r="1.7" fill="currentColor" />
          <circle cx="12" cy="12" r="1.7" fill="currentColor" />
          <circle cx="19" cy="12" r="1.7" fill="currentColor" />
        </svg>
      </summary>
      <div data-entries-menu-panel="true">
        {category.active_to ? (
          <button type="button" onClick={() => void handleUndoScheduledHide(category.id)}>
            Cofnij zamknięcie
          </button>
        ) : (
          <>
            <button type="button" onClick={() => void handleRenameCategory(category.id)}>
              Zmień nazwę
            </button>
            <button type="button" onClick={() => void handleHideCategory(category.id, 'now')}>
              Ukryj teraz
            </button>
            <button type="button" onClick={() => void handleHideCategory(category.id, 'next')}>
              Ukryj od następnego
            </button>
            <button type="button" data-danger="true" onClick={() => void handleDeleteCategory(category.id)}>
              Usuń
            </button>
          </>
        )}
      </div>
    </details>
  )

  const renderGroupHeader = (category: Category) => (
    <div data-entries-group-header="true">
      <div>
        <span>{category.name}</span>
      </div>
      {renderCategoryActions(category)}
    </div>
  )

  const renderInlineComposer = (category: Category) => (
    <form
      data-entries-inline-composer="true"
      onSubmit={(event) => void saveInlineEntry(event, category.id)}
    >
      <input
        value={inlineDay}
        placeholder="dzień"
        inputMode="numeric"
        disabled={isSelectedMonthLocked || isInlineSaving}
        onChange={(event) => setInlineDay(normalizeDayInput(event.target.value, selectedMonth))}
      />
      <input
        value={inlineDescription}
        placeholder="Opis"
        disabled={isSelectedMonthLocked || isInlineSaving}
        onChange={(event) => setInlineDescription(event.target.value)}
      />
      <input
        value={inlineAmount}
        placeholder="Kwota"
        inputMode="decimal"
        disabled={isSelectedMonthLocked || isInlineSaving}
        onChange={(event) => setInlineAmount(event.target.value)}
      />
      <button type="submit" disabled={isSelectedMonthLocked || isInlineSaving}>
        Zapisz
      </button>
    </form>
  )

  const renderTransactionActions = (transaction: Transaction) => (
    <details data-entries-transaction-menu="true">
      <summary aria-label="Menu wpisu" title="Menu wpisu">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="5" cy="12" r="1.7" fill="currentColor" />
          <circle cx="12" cy="12" r="1.7" fill="currentColor" />
          <circle cx="19" cy="12" r="1.7" fill="currentColor" />
        </svg>
      </summary>
      <div data-entries-menu-panel="true">
        <button
          type="button"
          disabled={isSelectedMonthLocked}
          onClick={() => startEditingTransaction(transaction)}
        >
          Edytuj
        </button>
        <button
          type="button"
          disabled={isSelectedMonthLocked}
          onClick={() => startMovingTransaction(transaction)}
        >
          Przenieś
        </button>
        {handleDuplicateTransaction && (
          <button type="button" onClick={() => handleDuplicateTransaction(transaction)}>
            Powiel
          </button>
        )}
        <button
          type="button"
          data-danger="true"
          disabled={isSelectedMonthLocked}
          onClick={() => void handleDeleteTransaction(transaction.id)}
        >
          Usuń
        </button>
      </div>
    </details>
  )

  const renderTransactionRow = (transaction: Transaction) => {
    const signedAmount = getSignedAmountForTransaction(transaction)
    const transactionKind = signedAmount >= 0 ? 'income' : 'expense'
    const isSelected = selectedTransactionIds.includes(transaction.id)
    const isEditing = editingTransactionId === transaction.id
    const isMovingCurrent = movingTransactionId === transaction.id
    const moveTargets = getMoveTargetsForTransaction(transaction)

    if (isEditing) {
      return (
        <form
          key={transaction.id}
          data-entries-transaction-row="true"
          data-entries-transaction-editing="true"
          onSubmit={(event) => {
            event.preventDefault()
            void saveEditingTransaction(transaction)
          }}
        >
          <input
            value={editDay}
            placeholder="dzień"
            inputMode="numeric"
            disabled={isUpdating}
            onChange={(event) => setEditDay(normalizeDayInput(event.target.value, selectedMonth))}
          />
          <input
            value={editDescription}
            placeholder="Opis"
            disabled={isUpdating}
            onChange={(event) => setEditDescription(event.target.value)}
          />
          <input
            value={editAmount}
            placeholder="Kwota"
            inputMode="decimal"
            disabled={isUpdating}
            onChange={(event) => setEditAmount(event.target.value)}
          />
          <div data-entries-row-actions="true">
            <button type="submit" disabled={isUpdating}>
              Zapisz
            </button>
            <button type="button" onClick={cancelEditingTransaction}>
              Anuluj
            </button>
          </div>
        </form>
      )
    }

    if (isMovingCurrent) {
      return (
        <div key={transaction.id} data-entries-transaction-row="true" data-entries-transaction-moving="true">
          <select
            value={moveTargetCategoryId}
            disabled={isMoving}
            onChange={(event) => setMoveTargetCategoryId(event.target.value)}
          >
            <option value="">Wybierz kategorię</option>
            {moveTargets.map((target) => (
              <option key={target.id} value={target.id}>
                {target.label}
              </option>
            ))}
          </select>
          <div data-entries-row-actions="true">
            <button type="button" disabled={isMoving || !moveTargetCategoryId} onClick={() => void saveMovingTransaction(transaction)}>
              Przenieś
            </button>
            <button type="button" onClick={cancelMovingTransaction}>
              Anuluj
            </button>
          </div>
        </div>
      )
    }

    return (
      <div
        key={transaction.id}
        data-entries-transaction-row="true"
        data-entries-transaction-kind={transactionKind}
        data-entries-transaction-selected={isSelected ? 'true' : 'false'}
      >
        <label data-entries-transaction-select="true" title="Zaznacz wpis">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleTransactionSelection(transaction.id)}
          />
        </label>
        <div data-entries-transaction-copy="true">
          <span>{transaction.description || 'Bez opisu'}</span>
          <small>{getTransactionDateLabel(transaction)}</small>
        </div>
        <strong>{formatMoney(signedAmount)}</strong>
        {renderTransactionActions(transaction)}
      </div>
    )
  }

  const renderTransactionFeed = (transactions: Transaction[]) => (
    <div data-entries-feed="true">{getOrderedLevel3Transactions(transactions).map(renderTransactionRow)}</div>
  )

  const renderSubgroup = (
    category: Category,
    transactions: Transaction[],
    title: string | null,
    tone: 'direct' | 'subgroup' = 'subgroup'
  ) => {
    const canAddHere =
      viewModel.canInlineAdd && viewModel.inlineAddTargetCategoryId === category.id

    if (transactions.length === 0 && !canAddHere) {
      return null
    }

    return (
      <section
        key={`entries-section-${category.id}-${title || 'feed'}`}
        data-entries-subgroup="true"
        data-entries-level={category.level}
        data-entries-subgroup-tone={tone}
      >
        {title && (
          <div data-entries-subgroup-header="true" data-entries-subgroup-tone={tone}>
            <span>{title}</span>
            {renderCategoryActions(category)}
          </div>
        )}
        {canAddHere && renderInlineComposer(category)}
        {renderTransactionFeed(transactions)}
      </section>
    )
  }

  const renderGroup = (group: CategoryEntriesPopupChildGroup) => {
    if (group.categoryLevel === 3) {
      return renderSubgroup(group.category, group.directEntries, group.category.name, 'subgroup')
    }

    const childrenWithEntries = group.children.filter((child) => child.directEntries.length > 0)
    const hasDirectEntries = group.directEntries.length > 0

    if (!hasDirectEntries && childrenWithEntries.length === 0) {
      return null
    }

    return (
      <section key={`group-${group.category.id}`} data-entries-group="true">
        {renderGroupHeader(group.category)}
        {hasDirectEntries && renderSubgroup(group.category, group.directEntries, null, 'direct')}
        {childrenWithEntries.map((child) =>
          renderSubgroup(child.category, child.directEntries, child.category.name, 'subgroup')
        )}
      </section>
    )
  }

  const shouldRenderDirectSection = viewModel.canInlineAdd || viewModel.directEntries.length > 0
  const shouldShowEmptyState = !hasAnyEntries && !viewModel.canInlineAdd

  return (
    <div
      data-entries-tree-view="true"
      data-entries-final-level={viewModel.canInlineAdd ? 'true' : 'false'}
    >
      {shouldRenderDirectSection &&
        renderSubgroup(
          viewModel.clickedCategory,
          viewModel.directEntries,
          viewModel.hasChildren ? null : viewModel.clickedCategory.name,
          viewModel.hasChildren ? 'direct' : 'subgroup'
        )}

      {viewModel.groupedChildren.map(renderGroup)}

      {shouldShowEmptyState && (
        <div data-entries-empty="true" style={styles.emptyText}>
          Brak wpisów w tym miesiącu
        </div>
      )}
    </div>
  )
}
