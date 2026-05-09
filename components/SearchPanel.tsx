'use client'

import { CSSProperties, forwardRef } from 'react'
import { Category, Tag, TransactionPaymentSplit } from '../lib/budgetPageTypes'
import { getCategoryPathLabel } from '../lib/budgetPageHelpers'
import { getTransactionPaymentSourceDisplayLines } from '../lib/paymentSplitUtils'
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

const panelStyle = {
  border: 0,
  borderRadius: 0,
  padding: 0,
  marginBottom: 0,
  background: 'transparent',
  fontFamily:
    'var(--font-app-sans), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const

const filtersGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: 10,
  marginBottom: 14,
} as const

const filterFieldStyle = {
  minWidth: 0,
  display: 'grid',
  gap: 5,
} as const

const wideFilterFieldStyle = {
  ...filterFieldStyle,
  gridColumn: 'span 3',
} as const

const regularFilterFieldStyle = {
  ...filterFieldStyle,
  gridColumn: 'span 2',
} as const

const compactFilterFieldStyle = {
  ...filterFieldStyle,
  gridColumn: 'span 1',
} as const

const actionFilterFieldStyle = {
  ...filterFieldStyle,
  gridColumn: 'span 3',
  alignSelf: 'end',
  justifyItems: 'end',
} as const

const searchInputStyle: CSSProperties = {
  width: '100%',
  minWidth: 0,
}

const resetButtonStyle = {
  minHeight: 34,
  padding: '0 12px',
  borderRadius: 999,
  border: '1px solid rgba(203, 213, 225, 0.82)',
  background: 'rgba(255, 255, 255, 0.68)',
  color: '#475569',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 560,
} as const

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 10,
  marginBottom: 14,
} as const

const statCardStyle = {
  border: '1px solid rgba(226, 232, 240, 0.92)',
  borderRadius: 12,
  padding: '10px 11px',
  background: 'rgba(255, 255, 255, 0.72)',
} as const

const incomeStatCardStyle = {
  ...statCardStyle,
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
} as const

const expenseStatCardStyle = {
  ...statCardStyle,
  background: '#fef2f2',
  border: '1px solid #fecaca',
} as const

const balanceStatCardStyle = {
  ...statCardStyle,
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
} as const

const statLabelStyle = {
  fontSize: 12,
  opacity: 0.7,
  marginBottom: 4,
} as const

const statValueStyle = {
  fontSize: 18,
  fontWeight: 680,
} as const

const tagsWrapStyle = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
  marginBottom: 14,
} as const

const tagButtonBaseStyle = {
  padding: '8px 12px',
  borderRadius: 999,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  cursor: 'pointer',
  fontSize: 13,
} as const

const historyWrapStyle = {
  border: '1px solid rgba(226, 232, 240, 0.92)',
  borderRadius: 12,
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.72)',
} as const

const historyHeaderStyle = {
  display: 'grid',
  gridTemplateColumns: '120px minmax(180px, 1.2fr) minmax(220px, 2fr) 130px',
  gap: 12,
  padding: '10px 12px',
  background: 'rgba(248, 250, 252, 0.88)',
  color: '#475569',
  fontWeight: 680,
  fontSize: 12,
  borderBottom: '1px solid rgba(226, 232, 240, 0.92)',
} as const

const historyRowStyle = {
  display: 'grid',
  gridTemplateColumns: '120px minmax(180px, 1.2fr) minmax(220px, 2fr) 130px',
  gap: 12,
  padding: '11px 12px',
  borderBottom: '1px solid rgba(238, 242, 247, 0.92)',
  alignItems: 'start',
  fontSize: 13,
} as const

const responsiveSearchStyle = `
  [data-search-filter-field="wide"],
  [data-search-filter-field="regular"],
  [data-search-filter-field="compact"] {
    min-width: 0;
  }

  @media (max-width: 920px) {
    [data-bank-search-filters="true"] {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    [data-search-filter-field="wide"],
    [data-search-filter-field="regular"],
    [data-search-filter-field="compact"] {
      grid-column: span 1 !important;
    }

    [data-search-filter-field="actions"] {
      grid-column: span 2 !important;
    }

    [data-bank-search-stats="true"] {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 560px) {
    [data-bank-search-filters="true"],
    [data-bank-search-stats="true"],
    [data-bank-search-history-header="true"],
    [data-bank-search-history-row="true"] {
      grid-template-columns: 1fr !important;
    }

    [data-search-filter-field="actions"] {
      grid-column: span 1 !important;
      justify-items: stretch !important;
    }
  }
`

const categoryNameStyle = {
  fontWeight: 600,
  marginBottom: 4,
} as const

const descriptionStyle = {
  opacity: 0.8,
} as const

const transactionTagsStyle = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap' as const,
  marginTop: 8,
} as const

const transactionTagBadgeStyle = {
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 999,
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  color: '#1d4ed8',
  cursor: 'pointer',
} as const

const emptyStateStyle = {
  padding: 16,
  fontSize: 14,
  opacity: 0.75,
} as const

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
    summary,
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

  return (
    <div ref={ref} style={panelStyle}>
      <style>{responsiveSearchStyle}</style>
      <>
          <div data-bank-search-filters="true" style={filtersGridStyle}>
            <div data-search-filter-field="wide" style={wideFilterFieldStyle}>
              <label htmlFor="bank-search-description" style={styles.sortLabel}>
                Szukaj po opisie
              </label>
              <input
                id="bank-search-description"
                value={searchState.description}
                onChange={(event) => onFieldChange('description', event.target.value)}
                placeholder="np. biedronka, czynsz, premia"
                style={{ ...styles.input, ...searchInputStyle }}
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
                style={{ ...styles.input, ...searchInputStyle }}
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
                style={{ ...styles.input, ...searchInputStyle }}
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
                style={{ ...styles.input, ...searchInputStyle }}
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
                style={{ ...styles.input, ...searchInputStyle }}
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
                style={{ ...styles.input, ...searchInputStyle }}
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
                style={{ ...styles.input, ...searchInputStyle }}
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
                Sortowanie wyników
              </label>
              <select
                id="bank-search-sort-mode"
                value={searchState.sortMode}
                onChange={(event) =>
                  onFieldChange('sortMode', event.target.value as BankSearchSortMode)
                }
                style={{ ...styles.input, ...searchInputStyle }}
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
            <div>
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
                        background: isActive ? '#eff6ff' : '#ffffff',
                        borderColor: isActive ? '#93c5fd' : '#d1d5db',
                        color: isActive ? '#1d4ed8' : '#111827',
                        fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      #{tag.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div data-bank-search-stats="true" style={statsGridStyle}>
            <div style={incomeStatCardStyle}>
              <div style={statLabelStyle}>Przychody</div>
              <div style={{ ...statValueStyle, color: '#15803d' }}>{formatMoney(summary.incomeTotal)}</div>
            </div>
            <div style={expenseStatCardStyle}>
              <div style={statLabelStyle}>Wydatki</div>
              <div style={{ ...statValueStyle, color: '#b91c1c' }}>{formatMoney(summary.expenseTotal)}</div>
            </div>
            <div style={balanceStatCardStyle}>
              <div style={statLabelStyle}>Bilans</div>
              <div
                style={{
                  ...statValueStyle,
                  color: summary.balance >= 0 ? '#1d4ed8' : '#b91c1c',
                }}
              >
                {formatSignedMoney(summary.balance)}
              </div>
            </div>
            <div style={statCardStyle}>
              <div style={statLabelStyle}>Liczba wyników</div>
              <div style={statValueStyle}>{summary.count}</div>
            </div>
          </div>

          <div data-bank-search-history="true" style={historyWrapStyle}>
            <div data-bank-search-history-header="true" style={historyHeaderStyle}>
              <div>Data</div>
              <div>Kwota</div>
              <div>Kategoria / opis</div>
              <div>Miesiąc</div>
            </div>

            {!hasActiveFilters ? (
              <div style={emptyStateStyle}>Wpisz opis albo ustaw filtr, aby zobaczyć wyniki.</div>
            ) : results.length === 0 ? (
              <div style={emptyStateStyle}>Brak wyników dla obecnych filtrów.</div>
            ) : (
              results.map(({ transaction, effectiveSignedAmount, matchedPaymentSourceId }) => {
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
                  <div key={transaction.id} data-bank-search-history-row="true" style={historyRowStyle}>
                    <div>{getTransactionDateLabel(transaction.day_is_null, transaction.date)}</div>
                    <div
                      style={{
                        fontWeight: 600,
                        color:
                          effectiveSignedAmount > 0
                            ? '#15803d'
                            : effectiveSignedAmount < 0
                              ? '#b91c1c'
                              : '#111827',
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
                    <div>{transaction.date ? transaction.date.slice(0, 7) : '—'}</div>
                  </div>
                )
              })
            )}
          </div>
        </>
    </div>
  )
})

export default SearchPanel
