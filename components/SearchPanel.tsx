'use client'

import { CSSProperties, forwardRef, useMemo, useState } from 'react'
import { Category, Tag, TransactionPaymentSplit } from '../lib/budgetPageTypes'
import { getCategoryPathLabel } from '../lib/budgetPageHelpers'
import { uiInputApi, uiListRowApi, uiTypographyTokens } from '../lib/uiFoundation'
import { getTransactionPaymentSourceDisplayLines } from '../lib/paymentSplitUtils'
import { getTransactionMonth, isDaylessTransaction } from '../lib/transactionDomain'
import {
  BankSearchCategoryOption,
  BankSearchPaymentSourceOption,
  BankSearchResult,
  BankSearchSortMode,
  BankSearchState,
  BankSearchSummary,
  BankSearchTagOption,
  hasActiveSearchFilters,
} from '../lib/useBankSearch'
import {
  actionFilterFieldStyle,
  balanceStatCardStyle,
  categoryNameStyle,
  compactFilterFieldStyle,
  descriptionStyle,
  emptyStateStyle,
  expenseStatCardStyle,
  filtersGridStyle,
  historyHeaderClassName,
  historyHeaderStyle,
  historyRowClassName,
  historyRowStyle,
  historyWrapStyle,
  incomeStatCardStyle,
  panelStyle,
  regularFilterFieldStyle,
  resetButtonStyle,
  responsiveSearchStyle,
  statCardStyle,
  statLabelStyle,
  statValueStyle,
  statsGridStyle,
  tagButtonBaseStyle,
  tagsWrapStyle,
  transactionTagBadgeStyle,
  transactionTagsStyle,
  typeFilterFieldStyle,
  wideFilterFieldStyle,
} from './search-panel/searchPanelStyles'
import { FoundationSegmentedControl } from './ui/FoundationPrimitives'

type Props = {
  isOpen: boolean
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void
  searchState: BankSearchState
  onFieldChange: <K extends keyof BankSearchState>(
    key: K,
    value: BankSearchState[K]
  ) => void
  onToggleTagId: (tagId: string) => void
  onReset: () => void
  results: BankSearchResult[]
  summary: BankSearchSummary
  categoryOptions: BankSearchCategoryOption[]
  paymentSourceOptions: BankSearchPaymentSourceOption[]
  tagOptions: BankSearchTagOption[]
  transactionTagsMap?: Record<string, Tag[]>
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
  categoriesById: Record<string, Category>
  onOpenSearchForTag: (tagId: string) => void
  styles: Record<string, CSSProperties>
}

type SearchTypeFilter = 'all' | 'income' | 'expense' | 'no-day'

const formatMoney = (value: number) => `${value.toFixed(2)} zł`

const formatSignedMoney = (value: number) => {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${Math.abs(value).toFixed(2)} zł`
}

const getTransactionDateLabel = (dayIsNull: boolean | undefined, date: string) => {
  if (dayIsNull) {
    return 'brak dnia'
  }

  return date || '—'
}

const SearchPanel = forwardRef<HTMLDivElement, Props>(function SearchPanel(props, ref) {
  const {
    searchState,
    onFieldChange,
    onToggleTagId,
    onReset,
    results,
    categoryOptions,
    paymentSourceOptions,
    tagOptions,
    transactionTagsMap = {},
    transactionPaymentSplitsMap = {},
    categoriesById,
    onOpenSearchForTag,
    styles,
  } = props
  const hasActiveFilters = hasActiveSearchFilters(searchState)
  const [typeFilter, setTypeFilter] = useState<SearchTypeFilter>('all')

  const displayResults = useMemo(() => {
    if (typeFilter === 'all') {
      return results
    }

    return results.filter(({ transaction, effectiveSignedAmount }) => {
      if (typeFilter === 'income') {
        return effectiveSignedAmount > 0
      }

      if (typeFilter === 'expense') {
        return effectiveSignedAmount < 0
      }

      return isDaylessTransaction(transaction)
    })
  }, [results, typeFilter])

  const displaySummary = useMemo(
    () =>
      displayResults.reduce(
        (acc, item) => {
          acc.count += 1

          if (item.effectiveSignedAmount > 0) {
            acc.incomeTotal += item.effectiveSignedAmount
          }

          if (item.effectiveSignedAmount < 0) {
            acc.expenseTotal += Math.abs(item.effectiveSignedAmount)
          }

          acc.balance += item.effectiveSignedAmount
          return acc
        },
        {
          count: 0,
          incomeTotal: 0,
          expenseTotal: 0,
          balance: 0,
        }
      ),
    [displayResults]
  )

  const displayInsights = useMemo(() => {
    const categories = new Map<string, number>()
    const sources = new Map<string, number>()

    displayResults.forEach(({ transaction, matchedPaymentSourceId }) => {
      const categoryLabel = categoriesById[transaction.category_id]
        ? getCategoryPathLabel(transaction.category_id, categoriesById)
        : 'Kategoria niedostępna'

      categories.set(categoryLabel, (categories.get(categoryLabel) || 0) + 1)

      const paymentSourceLabels = getTransactionPaymentSourceDisplayLines({
        transaction: {
          payment_source_id: matchedPaymentSourceId || transaction.payment_source_id,
        },
        splitItems: transactionPaymentSplitsMap[transaction.id] || [],
        paymentSourceOptions: paymentSourceOptions.map((option) => ({
          id: option.id,
          name: option.label,
          optionLabel: option.label,
        })),
      })

      paymentSourceLabels.forEach((label) => {
        sources.set(label, (sources.get(label) || 0) + 1)
      })
    })

    return {
      categories: Array.from(categories.entries())
        .sort(([, first], [, second]) => second - first)
        .slice(0, 5),
      sources: Array.from(sources.entries())
        .sort(([, first], [, second]) => second - first)
        .slice(0, 5),
    }
  }, [categoriesById, displayResults, paymentSourceOptions, transactionPaymentSplitsMap])

  return (
    <div ref={ref} style={panelStyle}>
      <style>{responsiveSearchStyle}</style>
      <div data-bank-search-workspace="true">
        <section data-bank-search-results-column="true">
          <div data-bank-search-filter-panel="true">
            <div data-bank-search-filters="true" style={filtersGridStyle}>
              <div data-search-filter-field="wide" style={wideFilterFieldStyle}>
                <label htmlFor="bank-search-description" style={styles.sortLabel}>
                  Fraza
                </label>
                <input
                  id="bank-search-description"
                  value={searchState.description}
                  onChange={(event) => onFieldChange('description', event.target.value)}
                  placeholder="np. biedronka, czynsz, premia"
                  className={uiInputApi.classNames.searchField}
                  data-input-width={uiInputApi.width.full}
                />
              </div>

              <div data-search-filter-field="type" style={typeFilterFieldStyle}>
                <label style={styles.sortLabel}>Typ wpisu</label>
                <FoundationSegmentedControl<SearchTypeFilter>
                  value={typeFilter}
                  ariaLabel="Typ wpisu"
                  density="compact"
                  width="full"
                  options={[
                    { value: 'all', label: 'Wszystkie' },
                    { value: 'income', label: 'Przychody' },
                    { value: 'expense', label: 'Wydatki' },
                    { value: 'no-day', label: 'Bez dnia' },
                  ]}
                  onChange={setTypeFilter}
                />
              </div>

              <div data-search-filter-field="regular" style={regularFilterFieldStyle}>
                <label htmlFor="bank-search-category" style={styles.sortLabel}>
                  Kategoria
                </label>
                <select
                  id="bank-search-category"
                  value={searchState.categoryId}
                  onChange={(event) => onFieldChange('categoryId', event.target.value)}
                  className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputM}`}
                  data-input-width={uiInputApi.width.full}
                >
                  <option value="">Wszystkie kategorie</option>
                  {categoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div data-search-filter-field="compact" style={compactFilterFieldStyle}>
                <label htmlFor="bank-search-date-from" style={styles.sortLabel}>
                  Data od
                </label>
                <input
                  id="bank-search-date-from"
                  type="date"
                  value={searchState.dateFrom}
                  onChange={(event) => onFieldChange('dateFrom', event.target.value)}
                  className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
                  data-input-width={uiInputApi.width.full}
                />
              </div>

              <div data-search-filter-field="compact" style={compactFilterFieldStyle}>
                <label htmlFor="bank-search-date-to" style={styles.sortLabel}>
                  Data do
                </label>
                <input
                  id="bank-search-date-to"
                  type="date"
                  value={searchState.dateTo}
                  onChange={(event) => onFieldChange('dateTo', event.target.value)}
                  className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
                  data-input-width={uiInputApi.width.full}
                />
              </div>

              <div data-search-filter-field="compact" style={compactFilterFieldStyle}>
                <label htmlFor="bank-search-amount-min" style={styles.sortLabel}>
                  Kwota min
                </label>
                <input
                  id="bank-search-amount-min"
                  inputMode="decimal"
                  value={searchState.amountMin}
                  onChange={(event) => onFieldChange('amountMin', event.target.value)}
                  placeholder="np. 100"
                  className={uiInputApi.classNames.amountField}
                  data-input-width={uiInputApi.width.full}
                />
              </div>

              <div data-search-filter-field="compact" style={compactFilterFieldStyle}>
                <label htmlFor="bank-search-amount-max" style={styles.sortLabel}>
                  Kwota max
                </label>
                <input
                  id="bank-search-amount-max"
                  inputMode="decimal"
                  value={searchState.amountMax}
                  onChange={(event) => onFieldChange('amountMax', event.target.value)}
                  placeholder="np. 1500"
                  className={uiInputApi.classNames.amountField}
                  data-input-width={uiInputApi.width.full}
                />
              </div>

              <div data-search-filter-field="regular" style={regularFilterFieldStyle}>
                <label htmlFor="bank-search-payment-source" style={styles.sortLabel}>
                  Źródło płatności
                </label>
                <select
                  id="bank-search-payment-source"
                  value={searchState.paymentSourceId}
                  onChange={(event) => onFieldChange('paymentSourceId', event.target.value)}
                  className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputM}`}
                  data-input-width={uiInputApi.width.full}
                >
                  <option value="">Wszystkie źródła</option>
                  {paymentSourceOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div data-search-filter-field="regular" style={regularFilterFieldStyle}>
                <label htmlFor="bank-search-sort-mode" style={styles.sortLabel}>
                  Sortowanie
                </label>
                <select
                  id="bank-search-sort-mode"
                  value={searchState.sortMode}
                  onChange={(event) =>
                    onFieldChange('sortMode', event.target.value as BankSearchSortMode)
                  }
                  className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputM}`}
                  data-input-width={uiInputApi.width.full}
                >
                  <option value="newest">najnowsze najpierw</option>
                  <option value="oldest">najstarsze najpierw</option>
                  <option value="amount-desc">największa kwota</option>
                  <option value="amount-asc">najmniejsza kwota</option>
                </select>
              </div>

              <div data-search-filter-field="actions" style={actionFilterFieldStyle}>
                <button type="button" onClick={onReset} style={resetButtonStyle}>
                  Wyczyść filtry
                </button>
              </div>
            </div>

            {tagOptions.length > 0 && (
              <div data-bank-search-tags="true">
                <div style={{ ...styles.sortLabel, marginBottom: 8 }}>Tagi</div>

                <div style={tagsWrapStyle}>
                  {tagOptions.map((tag) => {
                    const isActive = searchState.tagIds.includes(tag.id)

                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => onToggleTagId(tag.id)}
                        style={{
                          ...tagButtonBaseStyle,
                          background: isActive ? 'var(--ui-color-soft-blue)' : 'var(--ui-color-card-background)',
                          borderColor: isActive ? 'var(--ui-color-light-blue-border)' : 'var(--ui-color-soft-border)',
                          color: isActive ? 'var(--ui-color-primary-blue)' : 'var(--ui-color-primary-text)',
                          fontWeight: isActive
                            ? uiTypographyTokens.weight.bold
                            : uiTypographyTokens.weight.medium,
                        }}
                      >
                        #{tag.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div data-bank-search-history="true" style={historyWrapStyle}>
            <div
              className={historyHeaderClassName}
              data-bank-search-history-header="true"
              data-row-density={uiListRowApi.density.compact}
              data-row-kind={uiListRowApi.kind.table}
              style={historyHeaderStyle}
            >
              <div>Data</div>
              <div>Kwota</div>
              <div>Kategoria / opis</div>
              <div>Miesiąc</div>
            </div>

            {!hasActiveFilters ? (
              <div style={emptyStateStyle}>Wpisz opis albo ustaw filtr, aby zobaczyć wyniki.</div>
            ) : displayResults.length === 0 ? (
              <div style={emptyStateStyle}>Brak wyników dla obecnych filtrów.</div>
            ) : (
              displayResults.map(({ transaction, effectiveSignedAmount, matchedPaymentSourceId }) => {
                const categoryLabel = categoriesById[transaction.category_id]
                  ? getCategoryPathLabel(transaction.category_id, categoriesById)
                  : 'Kategoria niedostępna'
                const transactionTags = transactionTagsMap[transaction.id] || []
                const paymentSourceLabels = getTransactionPaymentSourceDisplayLines({
                  transaction: {
                    payment_source_id: matchedPaymentSourceId || transaction.payment_source_id,
                  },
                  splitItems: transactionPaymentSplitsMap[transaction.id] || [],
                  paymentSourceOptions: paymentSourceOptions.map((option) => ({
                    id: option.id,
                    name: option.label,
                    optionLabel: option.label,
                  })),
                })

                return (
                  <div
                    key={transaction.id}
                    className={historyRowClassName}
                    data-bank-search-history-row="true"
                    data-row-density={uiListRowApi.density.normal}
                    data-row-kind={uiListRowApi.kind.table}
                    style={historyRowStyle}
                  >
                    <div>{getTransactionDateLabel(isDaylessTransaction(transaction), transaction.date)}</div>
                    <div
                      style={{
                        fontWeight: uiTypographyTokens.weight.semibold,
                        color:
                          effectiveSignedAmount > 0
                            ? 'var(--ui-color-income)'
                            : effectiveSignedAmount < 0
                              ? 'var(--ui-color-expense)'
                              : 'var(--ui-color-primary-text)',
                      }}
                    >
                      {formatSignedMoney(effectiveSignedAmount)}
                    </div>
                    <div>
                      <div style={categoryNameStyle}>{categoryLabel}</div>
                      {paymentSourceLabels.map((label) => (
                        <div key={`${transaction.id}-${label}`} style={{ ...descriptionStyle, marginTop: 6 }}>
                          {label}
                        </div>
                      ))}
                      <div style={descriptionStyle}>{transaction.description || '—'}</div>
                      {transactionTags.length > 0 && (
                        <div style={transactionTagsStyle}>
                          {transactionTags.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              style={transactionTagBadgeStyle}
                              onClick={() => onOpenSearchForTag(tag.id)}
                            >
                              #{tag.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>{getTransactionMonth(transaction) || '—'}</div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        <aside data-bank-search-summary-panel="true">
          <div data-bank-search-stats="true" style={statsGridStyle}>
            <div style={incomeStatCardStyle}>
              <div style={statLabelStyle}>Przychody</div>
              <div style={{ ...statValueStyle, color: 'var(--ui-color-income)' }}>{formatMoney(displaySummary.incomeTotal)}</div>
            </div>
            <div style={expenseStatCardStyle}>
              <div style={statLabelStyle}>Wydatki</div>
              <div style={{ ...statValueStyle, color: 'var(--ui-color-expense)' }}>{formatMoney(displaySummary.expenseTotal)}</div>
            </div>
            <div style={balanceStatCardStyle}>
              <div style={statLabelStyle}>Bilans</div>
              <div
                style={{
                  ...statValueStyle,
                  color: displaySummary.balance >= 0 ? 'var(--ui-color-primary-blue)' : 'var(--ui-color-expense)',
                }}
              >
                {formatSignedMoney(displaySummary.balance)}
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Liczba wyników</div>
              <div style={statValueStyle}>{displaySummary.count}</div>
            </div>
          </div>

          <section data-bank-search-insights="true">
            <h3>Najczęstsze kategorie</h3>
            {displayInsights.categories.length === 0 ? (
              <p>Brak danych.</p>
            ) : (
              displayInsights.categories.map(([label, count]) => (
                <div key={label} data-bank-search-insight-row="true">
                  <span>{label}</span>
                  <strong>{count}</strong>
                </div>
              ))
            )}
          </section>

          <section data-bank-search-insights="true">
            <h3>Najczęstsze źródła</h3>
            {displayInsights.sources.length === 0 ? (
              <p>Brak danych.</p>
            ) : (
              displayInsights.sources.map(([label, count]) => (
                <div key={label} data-bank-search-insight-row="true">
                  <span>{label}</span>
                  <strong>{count}</strong>
                </div>
              ))
            )}
          </section>
        </aside>
      </div>
    </div>
  )
})

export default SearchPanel
