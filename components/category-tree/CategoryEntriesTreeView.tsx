import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { HeatmapMode } from '../month-calendar/monthCalendarTypes'
import type { Tag, TransactionPaymentSplit } from '../../lib/budgetPageTypes'
import type { PaymentSplitInput } from '../../lib/paymentSplitUtils'
import type { DescriptionSuggestion } from '../../lib/suggestionUtils'
import type { TransactionDraft } from '../../lib/draftUtils'
import { uiInputApi } from '../../lib/uiFoundation'
import { FoundationButton, FoundationSegmentedControl } from '../ui/FoundationPrimitives'
import { isDaylessTransaction } from '../../lib/transactionDomain'
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
import DropdownShell from '../dropdown/DropdownShell'

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

type EntryScopeFilter = 'all' | 'income' | 'expense' | 'no-day'

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
  getSignedAmountForTransaction,
  openTransactionCreator,
  handleHideCategory,
  handleRenameCategory,
  handleDeleteCategory,
  handleUndoScheduledHide,
  handleDeleteTransaction,
  handleDuplicateTransaction,
  getPaymentSourceOptionsForCategoryId,
  selectedTransactionIds,
  onToggleTransactionSelection,
  styles,
}: CategoryEntriesTreeViewProps) {
  const [openEntriesMenu, setOpenEntriesMenu] = useState<string | null>(null)
  const [entryScopeFilter, setEntryScopeFilter] = useState<EntryScopeFilter>('all')
  const [paymentSourceFilter, setPaymentSourceFilter] = useState('')

  const paymentSourceFilterOptions = useMemo(() => {
    if (!getPaymentSourceOptionsForCategoryId) {
      return []
    }

    const optionMap = new Map<string, string>()

    viewModel.allEntries.forEach((transaction) => {
      const paymentSourceId = transaction.payment_source_id

      if (!paymentSourceId || optionMap.has(paymentSourceId)) {
        return
      }

      const option = getPaymentSourceOptionsForCategoryId(transaction.category_id).find(
        (item) => item.id === paymentSourceId
      )

      optionMap.set(paymentSourceId, option?.optionLabel || option?.name || paymentSourceId)
    })

    return Array.from(optionMap.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pl'))
  }, [getPaymentSourceOptionsForCategoryId, viewModel.allEntries])

  const filteredAllEntries = useMemo(() => {
    return viewModel.allEntries.filter((transaction) => {
      const signedAmount = getSignedAmountForTransaction(transaction)

      if (entryScopeFilter === 'income' && signedAmount <= 0) {
        return false
      }

      if (entryScopeFilter === 'expense' && signedAmount >= 0) {
        return false
      }

      if (entryScopeFilter === 'no-day' && !isDaylessTransaction(transaction)) {
        return false
      }

      if (paymentSourceFilter && transaction.payment_source_id !== paymentSourceFilter) {
        return false
      }

      return true
    })
  }, [entryScopeFilter, getSignedAmountForTransaction, paymentSourceFilter, viewModel.allEntries])

  const filteredEntryIds = useMemo(
    () => new Set(filteredAllEntries.map((transaction) => transaction.id)),
    [filteredAllEntries]
  )

  const daylessEntries = useMemo(
    () => filteredAllEntries.filter((transaction) => isDaylessTransaction(transaction)),
    [filteredAllEntries]
  )

  const filteredEntriesTotal = filteredAllEntries.reduce(
    (total, transaction) => total + getSignedAmountForTransaction(transaction),
    0
  )
  const [selectedYear, selectedMonthNumber] = selectedMonth.split('-').map(Number)
  const daysInSelectedMonth =
    selectedYear && selectedMonthNumber ? new Date(selectedYear, selectedMonthNumber, 0).getDate() : 30
  const dailyAverage = daysInSelectedMonth > 0 ? filteredEntriesTotal / daysInSelectedMonth : 0

  const addTargetCategoryId = viewModel.inlineAddTargetCategoryId || viewModel.clickedCategory.id

  const closeEntriesMenuAndRun = (action: () => void) => {
    setOpenEntriesMenu(null)
    action()
  }

  const renderCategoryActions = (category: Category) => {
    const menuKey = `category-${category.id}`

    return (
      <div data-entries-category-menu="true">
        <DropdownShell
          open={openEntriesMenu === menuKey}
          onOpenChange={(open) => setOpenEntriesMenu(open ? menuKey : null)}
          size="action"
          trigger={(triggerProps) => (
            <button
              type="button"
              data-entries-menu-trigger="true"
              aria-label={`Menu kategorii ${category.name}`}
              title="Menu"
              {...triggerProps}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <circle cx="5" cy="12" r="1.7" fill="currentColor" />
                <circle cx="12" cy="12" r="1.7" fill="currentColor" />
                <circle cx="19" cy="12" r="1.7" fill="currentColor" />
              </svg>
            </button>
          )}
        >
          {category.active_to ? (
            <button
              type="button"
              className="ui-dropdown__item"
              onClick={() => closeEntriesMenuAndRun(() => void handleUndoScheduledHide(category.id))}
            >
              Cofnij zamknięcie
            </button>
          ) : (
            <>
              <button
                type="button"
                className="ui-dropdown__item"
                onClick={() => closeEntriesMenuAndRun(() => void handleRenameCategory(category.id))}
              >
                Zmień nazwę
              </button>
              <button
                type="button"
                className="ui-dropdown__item"
                onClick={() => closeEntriesMenuAndRun(() => void handleHideCategory(category.id, 'now'))}
              >
                Ukryj teraz
              </button>
              <button
                type="button"
                className="ui-dropdown__item"
                onClick={() => closeEntriesMenuAndRun(() => void handleHideCategory(category.id, 'next'))}
              >
                Ukryj od następnego
              </button>
              <button
                type="button"
                className="ui-dropdown__item"
                data-button-tone="danger"
                onClick={() => closeEntriesMenuAndRun(() => void handleDeleteCategory(category.id))}
              >
                Usuń
              </button>
            </>
          )}
        </DropdownShell>
      </div>
    )
  }

  const renderGroupHeader = (category: Category) => (
    <div data-entries-group-header="true">
      <div>
        <span>{category.name}</span>
      </div>
      {renderCategoryActions(category)}
    </div>
  )

  const renderTransactionActions = (transaction: Transaction) => {
    const menuKey = `transaction-${transaction.id}`

    return (
      <div data-entries-transaction-menu="true">
        <DropdownShell
          open={openEntriesMenu === menuKey}
          onOpenChange={(open) => setOpenEntriesMenu(open ? menuKey : null)}
          size="action"
          trigger={(triggerProps) => (
            <button
              type="button"
              data-entries-menu-trigger="true"
              aria-label="Menu wpisu"
              title="Menu wpisu"
              {...triggerProps}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <circle cx="5" cy="12" r="1.7" fill="currentColor" />
                <circle cx="12" cy="12" r="1.7" fill="currentColor" />
                <circle cx="19" cy="12" r="1.7" fill="currentColor" />
              </svg>
            </button>
          )}
        >
          {handleDuplicateTransaction && (
            <button
              type="button"
              className="ui-dropdown__item"
              onClick={() => closeEntriesMenuAndRun(() => handleDuplicateTransaction(transaction))}
            >
              Powiel
            </button>
          )}
          <button
            type="button"
            className="ui-dropdown__item"
            data-button-tone="danger"
            disabled={isSelectedMonthLocked}
            onClick={() => closeEntriesMenuAndRun(() => void handleDeleteTransaction(transaction.id))}
          >
            Usuń
          </button>
        </DropdownShell>
      </div>
    )
  }

  const renderTransactionRow = (transaction: Transaction) => {
    const signedAmount = getSignedAmountForTransaction(transaction)
    const transactionKind = signedAmount >= 0 ? 'income' : 'expense'
    const isSelected = selectedTransactionIds.includes(transaction.id)

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

  const renderTransactionFeed = (transactions: Transaction[]) => {
    const visibleTransactions = transactions.filter(
      (transaction) => filteredEntryIds.has(transaction.id) && !isDaylessTransaction(transaction)
    )
    const groupedTransactions = groupTransactionsByDate(visibleTransactions)

    if (visibleTransactions.length === 0) {
      return null
    }

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
    if (transactions.length === 0) {
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

  const shouldRenderDirectSection = viewModel.directEntries.length > 0
  const shouldShowEmptyState = filteredAllEntries.length === 0

  return (
    <div
      data-entries-tree-view="true"
      data-entries-final-level={viewModel.canInlineAdd ? 'true' : 'false'}
    >
      <section data-entries-workspace-summary="true">
        <div data-entries-workspace-metric="sum">
          <span>Suma</span>
          <strong data-financial-state={filteredEntriesTotal < 0 ? 'negative' : filteredEntriesTotal > 0 ? 'positive' : 'zero'}>
            {formatMoney(filteredEntriesTotal)}
          </strong>
        </div>
        <div data-entries-workspace-metric="count">
          <span>Liczba wpisów</span>
          <strong>{filteredAllEntries.length}</strong>
        </div>
        <div data-entries-workspace-metric="average">
          <span>Średnio dziennie</span>
          <strong>{formatMoney(dailyAverage)}</strong>
        </div>
      </section>

      <section data-entries-workspace-filters="true">
        <span data-entries-filter-static="true">Miesiąc: {selectedMonth}</span>
        <FoundationSegmentedControl<EntryScopeFilter>
          value={entryScopeFilter}
          ariaLabel="Zakres wpisów kategorii"
          density="compact"
          options={[
            { value: 'all', label: 'Wszystkie' },
            { value: 'income', label: 'Przychody' },
            { value: 'expense', label: 'Wydatki' },
            { value: 'no-day', label: 'Bez dnia' },
          ]}
          onChange={setEntryScopeFilter}
        />
        {paymentSourceFilterOptions.length > 0 && (
          <label data-entries-payment-source-filter="true">
            <span>Źródło</span>
            <select
              className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputS}`}
              data-input-density={uiInputApi.density.compact}
              value={paymentSourceFilter}
              onChange={(event) => setPaymentSourceFilter(event.target.value)}
            >
              <option value="">Wszystkie źródła</option>
              {paymentSourceFilterOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {!isSelectedMonthLocked && addTargetCategoryId && (
          <FoundationButton
            variant="secondary"
            density="compact"
            onClick={() => openTransactionCreator(addTargetCategoryId)}
          >
            Dodaj wpis
          </FoundationButton>
        )}
      </section>

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
          Brak wpisów dla obecnych filtrów
        </div>
      )}

      {daylessEntries.length > 0 && (
        <section data-entries-no-day-section="true">
          <div data-entries-subgroup-header="true" data-entries-subgroup-tone="direct">
            <span>Wpisy bez dnia</span>
          </div>
          <div data-entries-day-feed="true">
            {daylessEntries.map(renderTransactionRow)}
          </div>
        </section>
      )}

      <footer data-entries-total-footer="true">
        <span>Łącznie</span>
        <strong data-financial-state={filteredEntriesTotal < 0 ? 'negative' : filteredEntriesTotal > 0 ? 'positive' : 'zero'}>
          {formatMoney(filteredEntriesTotal)}
        </strong>
      </footer>
    </div>
  )
}
