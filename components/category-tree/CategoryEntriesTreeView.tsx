import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { createPortal } from 'react-dom'
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

const groupTransactionsByDate = (transactions: Transaction[]) => {
  const grouped = new Map<string, Transaction[]>()

  getOrderedLevel3Transactions(transactions).forEach((transaction) => {
    const dateLabel = getTransactionDateLabel(transaction)

    if (!grouped.has(dateLabel)) {
      grouped.set(dateLabel, [])
    }

    grouped.get(dateLabel)?.push(transaction)
  })

  return Array.from(grouped.entries()).map(([dateLabel, items]) => ({
    dateLabel,
    items,
  }))
}

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
  getPaymentSourceOptionsForCategoryId,
  getRecurringOptionsForCategoryId,
  selectedTransactionIds,
  onToggleTransactionSelection,
  transactionTagsMap,
  styles,
}: CategoryEntriesTreeViewProps) {
  const [inlineDay, setInlineDay] = useState('')
  const [inlineDescription, setInlineDescription] = useState('')
  const [inlineAmount, setInlineAmount] = useState('')
  const [inlineTags, setInlineTags] = useState('')
  const [inlinePaymentSourceId, setInlinePaymentSourceId] = useState('')
  const [inlineRecurringTransactionId, setInlineRecurringTransactionId] = useState('')
  const [isInlineSaving, setIsInlineSaving] = useState(false)
  const inlineDayInputRef = useRef<HTMLInputElement | null>(null)
  const inlineDescriptionInputRef = useRef<HTMLInputElement | null>(null)
  const inlineAmountInputRef = useRef<HTMLInputElement | null>(null)

  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null)
  const [editDay, setEditDay] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const [movingTransactionId, setMovingTransactionId] = useState<string | null>(null)
  const [moveTargetCategoryId, setMoveTargetCategoryId] = useState('')
  const [isMoving, setIsMoving] = useState(false)
  const [openEntriesMenu, setOpenEntriesMenu] = useState<{
    key: string
    top: number
    right: number
    maxHeight: number
    placement: 'top' | 'bottom'
  } | null>(null)

  useEffect(() => {
    if (!openEntriesMenu) {
      return
    }

    const closeMenu = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        (event.target.closest('[data-entries-menu-panel="true"]') ||
          event.target.closest('[data-entries-menu-trigger="true"]'))
      ) {
        return
      }

      setOpenEntriesMenu(null)
    }
    const closeOnViewportChange = () => setOpenEntriesMenu(null)

    document.addEventListener('pointerdown', closeMenu, true)
    window.addEventListener('budget-close-floating-ui', closeOnViewportChange)
    window.addEventListener('resize', closeOnViewportChange)
    window.addEventListener('scroll', closeOnViewportChange, true)

    return () => {
      document.removeEventListener('pointerdown', closeMenu, true)
      window.removeEventListener('budget-close-floating-ui', closeOnViewportChange)
      window.removeEventListener('resize', closeOnViewportChange)
      window.removeEventListener('scroll', closeOnViewportChange, true)
    }
  }, [openEntriesMenu])

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
      const tagNames = inlineTags
        .split(',')
        .map((tagName) => tagName.trim())
        .filter(Boolean)

      await handleInlineSaveTransaction(
        categoryId,
        inlineAmount,
        inlineDescription,
        inlineDay,
        tagNames,
        inlinePaymentSourceId || null,
        undefined,
        inlineRecurringTransactionId || null
      )
      setInlineDay('')
      setInlineDescription('')
      setInlineAmount('')
      setInlineTags('')
      setInlinePaymentSourceId('')
      setInlineRecurringTransactionId('')
    } finally {
      setIsInlineSaving(false)
    }
  }

  const handleInlineDayKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    inlineDescriptionInputRef.current?.focus()
  }

  const handleInlineDescriptionKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    inlineAmountInputRef.current?.focus()
  }

  const preventInlineMetaSubmit = (event: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  const toggleEntriesMenu = (
    event: ReactMouseEvent<HTMLButtonElement>,
    key: string,
    itemCount = 4
  ) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const viewportPadding = 12
    const estimatedHeight = Math.min(itemCount * 34 + 12, window.innerHeight - viewportPadding * 2)
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding
    const spaceAbove = rect.top - viewportPadding
    const shouldOpenUp = estimatedHeight > spaceBelow && spaceAbove > spaceBelow
    const nextMenu = {
      key,
      top: shouldOpenUp
        ? Math.max(viewportPadding, rect.top - estimatedHeight - 6)
        : Math.min(rect.bottom + 6, window.innerHeight - estimatedHeight - viewportPadding),
      right: Math.max(viewportPadding, window.innerWidth - rect.right),
      maxHeight: window.innerHeight - viewportPadding * 2,
      placement: (shouldOpenUp ? 'top' : 'bottom') as 'top' | 'bottom',
    }

    setOpenEntriesMenu((currentMenu) => (currentMenu?.key === key ? null : nextMenu))
  }

  const closeEntriesMenuAndRun = (action: () => void) => {
    setOpenEntriesMenu(null)
    action()
  }

  const renderCategoryActions = (category: Category) => (
    <div data-entries-category-menu="true">
      <button
        type="button"
        data-entries-menu-trigger="true"
        aria-label={`Menu kategorii ${category.name}`}
        aria-expanded={openEntriesMenu?.key === `category-${category.id}`}
        title="Menu"
        onClick={(event) =>
          toggleEntriesMenu(event, `category-${category.id}`, category.active_to ? 1 : 4)
        }
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="5" cy="12" r="1.7" fill="currentColor" />
          <circle cx="12" cy="12" r="1.7" fill="currentColor" />
          <circle cx="19" cy="12" r="1.7" fill="currentColor" />
        </svg>
      </button>
      {openEntriesMenu?.key === `category-${category.id}` &&
        createPortal(
          <div
            data-entries-menu-panel="true"
            data-dropdown-placement={openEntriesMenu.placement}
            style={{
              top: openEntriesMenu.top,
              right: openEntriesMenu.right,
              maxHeight: openEntriesMenu.maxHeight,
            }}
          >
        {category.active_to ? (
          <button
            type="button"
            onClick={() => closeEntriesMenuAndRun(() => void handleUndoScheduledHide(category.id))}
          >
            Cofnij zamknięcie
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => closeEntriesMenuAndRun(() => void handleRenameCategory(category.id))}
            >
              Zmień nazwę
            </button>
            <button
              type="button"
              onClick={() =>
                closeEntriesMenuAndRun(() => void handleHideCategory(category.id, 'now'))
              }
            >
              Ukryj teraz
            </button>
            <button
              type="button"
              onClick={() =>
                closeEntriesMenuAndRun(() => void handleHideCategory(category.id, 'next'))
              }
            >
              Ukryj od następnego
            </button>
            <button
              type="button"
              data-danger="true"
              onClick={() => closeEntriesMenuAndRun(() => void handleDeleteCategory(category.id))}
            >
              Usuń
            </button>
          </>
        )}
          </div>,
          document.body
        )}
    </div>
  )

  const renderGroupHeader = (category: Category) => (
    <div data-entries-group-header="true">
      <div>
        <span>{category.name}</span>
      </div>
      {renderCategoryActions(category)}
    </div>
  )

  const renderInlineComposer = (category: Category) => {
    const paymentSourceOptions = getPaymentSourceOptionsForCategoryId?.(category.id) || []
    const recurringOptions = getRecurringOptionsForCategoryId?.(category.id) || []
    const isDisabled = isSelectedMonthLocked || isInlineSaving

    return (
      <form
        data-entries-inline-composer="true"
        onSubmit={(event) => void saveInlineEntry(event, category.id)}
      >
        <div data-entries-inline-main-row="true">
          <input
            ref={inlineDayInputRef}
            value={inlineDay}
            placeholder="dzień"
            inputMode="numeric"
            disabled={isDisabled}
            onChange={(event) => setInlineDay(normalizeDayInput(event.target.value, selectedMonth))}
            onKeyDown={handleInlineDayKeyDown}
          />
          <input
            ref={inlineDescriptionInputRef}
            value={inlineDescription}
            placeholder="Opis"
            disabled={isDisabled}
            onChange={(event) => setInlineDescription(event.target.value)}
            onKeyDown={handleInlineDescriptionKeyDown}
          />
          <input
            ref={inlineAmountInputRef}
            value={inlineAmount}
            placeholder="Kwota"
            inputMode="decimal"
            disabled={isDisabled}
            onChange={(event) => setInlineAmount(event.target.value)}
          />
          <button type="submit" disabled={isDisabled}>
            Zapisz
          </button>
        </div>

        <div data-entries-inline-meta-row="true">
          <input
            value={inlineTags}
            placeholder="Tagi"
            disabled={isDisabled}
            onChange={(event) => setInlineTags(event.target.value)}
            onKeyDown={preventInlineMetaSubmit}
          />
          {paymentSourceOptions.length > 0 && (
            <select
              value={inlinePaymentSourceId}
              disabled={isDisabled}
              onChange={(event) => setInlinePaymentSourceId(event.target.value)}
              onKeyDown={preventInlineMetaSubmit}
            >
              <option value="">Źródło</option>
              {paymentSourceOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.optionLabel || option.name}
                </option>
              ))}
            </select>
          )}
          {recurringOptions.length > 0 && (
            <select
              value={inlineRecurringTransactionId}
              disabled={isDisabled}
              onChange={(event) => setInlineRecurringTransactionId(event.target.value)}
              onKeyDown={preventInlineMetaSubmit}
            >
              <option value="">Cykliczna</option>
              {recurringOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </form>
    )
  }

  const renderTransactionActions = (transaction: Transaction) => (
    <div data-entries-transaction-menu="true">
      <button
        type="button"
        data-entries-menu-trigger="true"
        aria-label="Menu wpisu"
        aria-expanded={openEntriesMenu?.key === `transaction-${transaction.id}`}
        title="Menu wpisu"
        onClick={(event) =>
          toggleEntriesMenu(event, `transaction-${transaction.id}`, handleDuplicateTransaction ? 4 : 3)
        }
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="5" cy="12" r="1.7" fill="currentColor" />
          <circle cx="12" cy="12" r="1.7" fill="currentColor" />
          <circle cx="19" cy="12" r="1.7" fill="currentColor" />
        </svg>
      </button>
      {openEntriesMenu?.key === `transaction-${transaction.id}` &&
        createPortal(
          <div
            data-entries-menu-panel="true"
            data-dropdown-placement={openEntriesMenu.placement}
            style={{
              top: openEntriesMenu.top,
              right: openEntriesMenu.right,
              maxHeight: openEntriesMenu.maxHeight,
            }}
          >
        <button
          type="button"
          disabled={isSelectedMonthLocked}
          onClick={() => closeEntriesMenuAndRun(() => startEditingTransaction(transaction))}
        >
          Edytuj
        </button>
        <button
          type="button"
          disabled={isSelectedMonthLocked}
          onClick={() => closeEntriesMenuAndRun(() => startMovingTransaction(transaction))}
        >
          Przenieś
        </button>
        {handleDuplicateTransaction && (
          <button
            type="button"
            onClick={() => closeEntriesMenuAndRun(() => handleDuplicateTransaction(transaction))}
          >
            Powiel
          </button>
        )}
        <button
          type="button"
          data-danger="true"
          disabled={isSelectedMonthLocked}
          onClick={() => closeEntriesMenuAndRun(() => void handleDeleteTransaction(transaction.id))}
        >
          Usuń
        </button>
          </div>,
          document.body
        )}
    </div>
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
        </div>
        <strong>{formatMoney(signedAmount)}</strong>
        {renderTransactionActions(transaction)}
      </div>
    )
  }

  const renderTransactionFeed = (transactions: Transaction[]) => {
    const groupedTransactions = groupTransactionsByDate(transactions)

    return (
      <div data-entries-feed="true">
        {groupedTransactions.map((group) => (
          <section key={`entries-day-${group.dateLabel}`} data-entries-day-group="true">
            <div data-entries-day-label="true">{group.dateLabel}</div>

            <div data-entries-day-feed="true">
              {group.items.map(renderTransactionRow)}
            </div>
          </section>
        ))}
      </div>
    )
  }

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
