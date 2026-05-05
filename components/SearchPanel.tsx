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
  border: '1px solid #d0d7de',
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
  background: '#ffffff',
} as const

const panelHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap' as const,
} as const

const subtitleStyle = {
  fontSize: 13,
  opacity: 0.75,
  marginTop: 4,
} as const

const toggleButtonStyle = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #c9c9c9',
  background: '#f7f7f7',
  cursor: 'pointer',
} as const

const filtersGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
  marginTop: 16,
  marginBottom: 16,
} as const

const actionsRowStyle = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap' as const,
  marginBottom: 16,
} as const

const resetButtonStyle = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #c9c9c9',
  background: '#fafafa',
  cursor: 'pointer',
} as const

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
  marginBottom: 16,
} as const

const statCardStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  padding: 12,
  background: '#fcfcfc',
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
  fontSize: 22,
  fontWeight: 600,
} as const

const tagsWrapStyle = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
  marginBottom: 16,
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
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  overflow: 'hidden',
} as const

const historyHeaderStyle = {
  display: 'grid',
  gridTemplateColumns: '120px minmax(180px, 1.2fr) minmax(220px, 2fr) 130px',
  gap: 12,
  padding: '12px 14px',
  background: '#f8fafc',
  fontWeight: 600,
  fontSize: 13,
  borderBottom: '1px solid #e2e8f0',
} as const

const historyRowStyle = {
  display: 'grid',
  gridTemplateColumns: '120px minmax(180px, 1.2fr) minmax(220px, 2fr) 130px',
  gap: 12,
  padding: '12px 14px',
  borderBottom: '1px solid #eef2f7',
  alignItems: 'start',
  fontSize: 14,
} as const

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
    isOpen,
    setIsOpen,
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

  return (
    <div ref={ref} style={panelStyle}>
      <div style={panelHeaderStyle}>
        <div>
          <div style={styles.sectionTitle}>Wyszukiwarka / tryb bankowy</div>
          <div style={subtitleStyle}>
            Szuka po całej historii wpisów, a nie tylko po aktualnym miesiącu.
          </div>
        </div>

        <button type="button" onClick={() => setIsOpen((prev) => !prev)} style={toggleButtonStyle}>
          {isOpen ? 'Zwiń panel' : 'Pokaż panel'}
        </button>
      </div>

      {isOpen && (
        <>
          <div style={filtersGridStyle}>
            <div>
              <label htmlFor="bank-search-description" style={styles.sortLabel}>
                Szukaj po opisie
              </label>
              <input
                id="bank-search-description"
                value={searchState.description}
                onChange={(event) => onFieldChange('description', event.target.value)}
                placeholder="np. biedronka, czynsz, premia"
                style={styles.input}
              />
            </div>

            <div>
              <label htmlFor="bank-search-category" style={styles.sortLabel}>
                Kategoria
              </label>
              <select
                id="bank-search-category"
                value={searchState.categoryId}
                onChange={(event) => onFieldChange('categoryId', event.target.value)}
                style={styles.input}
              >
                <option value="">Wszystkie kategorie</option>
                {categoryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bank-search-payment-source" style={styles.sortLabel}>
                Źródło płatności
              </label>
              <select
                id="bank-search-payment-source"
                value={searchState.paymentSourceId}
                onChange={(event) => onFieldChange('paymentSourceId', event.target.value)}
                style={styles.input}
              >
                <option value="">Wszystkie źródła</option>
                {paymentSourceOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="bank-search-date-from" style={styles.sortLabel}>
                Data od
              </label>
              <input
                id="bank-search-date-from"
                type="date"
                value={searchState.dateFrom}
                onChange={(event) => onFieldChange('dateFrom', event.target.value)}
                style={styles.input}
              />
            </div>

            <div>
              <label htmlFor="bank-search-date-to" style={styles.sortLabel}>
                Data do
              </label>
              <input
                id="bank-search-date-to"
                type="date"
                value={searchState.dateTo}
                onChange={(event) => onFieldChange('dateTo', event.target.value)}
                style={styles.input}
              />
            </div>

            <div>
              <label htmlFor="bank-search-amount-min" style={styles.sortLabel}>
                Kwota min
              </label>
              <input
                id="bank-search-amount-min"
                inputMode="decimal"
                value={searchState.amountMin}
                onChange={(event) => onFieldChange('amountMin', event.target.value)}
                placeholder="np. 100"
                style={styles.input}
              />
            </div>

            <div>
              <label htmlFor="bank-search-amount-max" style={styles.sortLabel}>
                Kwota max
              </label>
              <input
                id="bank-search-amount-max"
                inputMode="decimal"
                value={searchState.amountMax}
                onChange={(event) => onFieldChange('amountMax', event.target.value)}
                placeholder="np. 1500"
                style={styles.input}
              />
            </div>

            <div>
              <label htmlFor="bank-search-sort-mode" style={styles.sortLabel}>
                Sortowanie wyników
              </label>
              <select
                id="bank-search-sort-mode"
                value={searchState.sortMode}
                onChange={(event) =>
                  onFieldChange('sortMode', event.target.value as BankSearchSortMode)
                }
                style={styles.input}
              >
                <option value="newest">najnowsze najpierw</option>
                <option value="oldest">najstarsze najpierw</option>
                <option value="amount-desc">największa kwota</option>
                <option value="amount-asc">najmniejsza kwota</option>
              </select>
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

          <div style={actionsRowStyle}>
            <button type="button" onClick={onReset} style={resetButtonStyle}>
              Wyczyść filtry
            </button>
          </div>

          <div style={statsGridStyle}>
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

          <div style={historyWrapStyle}>
            <div style={historyHeaderStyle}>
              <div>Data</div>
              <div>Kwota</div>
              <div>Kategoria / opis</div>
              <div>Miesiąc</div>
            </div>

            {results.length === 0 ? (
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
                  <div key={transaction.id} style={historyRowStyle}>
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
      )}
    </div>
  )
})

export default SearchPanel
