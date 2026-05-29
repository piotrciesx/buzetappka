import { CSSProperties } from 'react'

export const panelStyle = {
  border: 0,
  borderRadius: 0,
  padding: 0,
  marginBottom: 0,
  background: 'transparent',
  fontFamily:
    'var(--font-app-sans), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const

export const filtersGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: 10,
  marginBottom: 14,
} as const

export const filterFieldStyle = {
  minWidth: 0,
  display: 'grid',
  gap: 5,
} as const

export const wideFilterFieldStyle = {
  ...filterFieldStyle,
  gridColumn: 'span 3',
} as const

export const regularFilterFieldStyle = {
  ...filterFieldStyle,
  gridColumn: 'span 2',
} as const

export const compactFilterFieldStyle = {
  ...filterFieldStyle,
  gridColumn: 'span 1',
} as const

export const actionFilterFieldStyle = {
  ...filterFieldStyle,
  gridColumn: 'span 3',
  alignSelf: 'end',
  justifyItems: 'end',
} as const

export const searchInputStyle: CSSProperties = {
  width: '100%',
  minWidth: 0,
}

export const resetButtonStyle = {
  minHeight: 34,
  padding: '0 12px',
  borderRadius: 999,
  border: '1px solid rgba(203, 213, 225, 0.82)',
  background: 'rgba(255, 255, 255, 0.68)',
  color: 'var(--ui-color-secondary-text)',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 560,
} as const

export const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 10,
  marginBottom: 14,
} as const

export const statCardStyle = {
  border: '1px solid rgba(226, 232, 240, 0.92)',
  borderRadius: 12,
  padding: '10px 11px',
  background: 'rgba(255, 255, 255, 0.72)',
} as const

export const incomeStatCardStyle = {
  ...statCardStyle,
  background: 'var(--ui-color-income-soft)',
  border: '1px solid var(--ui-color-income-soft)',
} as const

export const expenseStatCardStyle = {
  ...statCardStyle,
  background: 'var(--ui-color-expense-soft)',
  border: '1px solid var(--ui-color-expense-soft)',
} as const

export const balanceStatCardStyle = {
  ...statCardStyle,
  background: 'var(--ui-color-soft-blue)',
  border: '1px solid var(--ui-color-light-blue-border)',
} as const

export const statLabelStyle = {
  fontSize: 12,
  opacity: 0.7,
  marginBottom: 4,
} as const

export const statValueStyle = {
  fontSize: 18,
  fontWeight: 680,
} as const

export const tagsWrapStyle = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
  marginBottom: 14,
} as const

export const tagButtonBaseStyle = {
  padding: '8px 12px',
  borderRadius: 999,
  border: '1px solid var(--ui-color-soft-border)',
  background: 'var(--ui-color-card-background)',
  cursor: 'pointer',
  fontSize: 13,
} as const

export const historyWrapStyle = {
  border: '1px solid rgba(226, 232, 240, 0.92)',
  borderRadius: 12,
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.72)',
} as const

export const historyHeaderStyle = {
  display: 'grid',
  gridTemplateColumns: '120px minmax(180px, 1.2fr) minmax(220px, 2fr) 130px',
  gap: 12,
  padding: '10px 12px',
  background: 'rgba(248, 250, 252, 0.88)',
  color: 'var(--ui-color-secondary-text)',
  fontWeight: 680,
  fontSize: 12,
  borderBottom: '1px solid rgba(226, 232, 240, 0.92)',
} as const

export const historyRowStyle = {
  display: 'grid',
  gridTemplateColumns: '120px minmax(180px, 1.2fr) minmax(220px, 2fr) 130px',
  gap: 12,
  padding: '11px 12px',
  borderBottom: '1px solid rgba(238, 242, 247, 0.92)',
  alignItems: 'start',
  fontSize: 13,
} as const

export const responsiveSearchStyle = `
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

export const categoryNameStyle = {
  fontWeight: 600,
  marginBottom: 4,
} as const

export const descriptionStyle = {
  opacity: 0.8,
} as const

export const transactionTagsStyle = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap' as const,
  marginTop: 8,
} as const

export const transactionTagBadgeStyle = {
  fontSize: 12,
  padding: '4px 8px',
  borderRadius: 999,
  background: 'var(--ui-color-soft-blue)',
  border: '1px solid var(--ui-color-light-blue-border)',
  color: 'var(--ui-color-primary-blue)',
  cursor: 'pointer',
} as const

export const emptyStateStyle = {
  padding: 16,
  fontSize: 14,
  opacity: 0.75,
} as const
