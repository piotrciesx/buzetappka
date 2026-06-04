import { uiTypographyTokens } from '../../lib/uiFoundation'

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

export const resetButtonStyle = {
  minHeight: 34,
  padding: '0 12px',
  borderRadius: 999,
  border: '1px solid var(--ui-border-soft)',
  background: 'var(--ui-glass-surface-soft)',
  color: 'var(--ui-text-secondary)',
  cursor: 'pointer',
  fontSize: uiTypographyTokens.role.metadata,
  fontWeight: uiTypographyTokens.weight.medium,
} as const

export const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 10,
  marginBottom: 14,
} as const

export const statCardStyle = {
  border: '1px solid var(--ui-border-divider)',
  borderRadius: 12,
  padding: '10px 11px',
  background: 'var(--ui-glass-surface-soft)',
} as const

export const incomeStatCardStyle = {
  ...statCardStyle,
  background: 'var(--ui-financial-income-soft)',
  border: '1px solid var(--ui-financial-income-soft)',
} as const

export const expenseStatCardStyle = {
  ...statCardStyle,
  background: 'var(--ui-financial-expense-soft)',
  border: '1px solid var(--ui-financial-expense-soft)',
} as const

export const balanceStatCardStyle = {
  ...statCardStyle,
  background: 'var(--ui-surface-active)',
  border: '1px solid var(--ui-border-active)',
} as const

export const statLabelStyle = {
  fontSize: uiTypographyTokens.role.metadata,
  opacity: 0.7,
  marginBottom: 4,
} as const

export const statValueStyle = {
  fontSize: uiTypographyTokens.hierarchy.t2,
  fontWeight: uiTypographyTokens.weight.bold,
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
  border: '1px solid var(--ui-border-soft)',
  background: 'var(--ui-surface-card)',
  cursor: 'pointer',
  fontSize: uiTypographyTokens.role.label,
} as const

export const historyWrapStyle = {
  border: '1px solid var(--ui-border-divider)',
  borderRadius: 12,
  overflow: 'hidden',
  background: 'var(--ui-glass-surface-soft)',
} as const

export const historyHeaderStyle = {
  display: 'grid',
  gridTemplateColumns: '120px minmax(180px, 1.2fr) minmax(220px, 2fr) 130px',
  gap: 12,
  padding: '10px 12px',
  background: 'var(--ui-surface-soft)',
  color: 'var(--ui-text-secondary)',
  fontWeight: uiTypographyTokens.weight.bold,
  fontSize: uiTypographyTokens.role.metadata,
  borderBottom: '1px solid var(--ui-border-divider)',
} as const

export const historyRowStyle = {
  display: 'grid',
  gridTemplateColumns: '120px minmax(180px, 1.2fr) minmax(220px, 2fr) 130px',
  gap: 12,
  padding: '11px 12px',
  borderBottom: '1px solid var(--ui-border-divider)',
  alignItems: 'start',
  fontSize: uiTypographyTokens.role.label,
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
  fontWeight: uiTypographyTokens.weight.semibold,
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
  fontSize: uiTypographyTokens.role.metadata,
  padding: '4px 8px',
  borderRadius: 999,
  background: 'var(--ui-surface-active)',
  border: '1px solid var(--ui-border-active)',
  color: 'var(--ui-text-link)',
  cursor: 'pointer',
} as const

export const emptyStateStyle = {
  padding: 16,
  fontSize: uiTypographyTokens.hierarchy.t3,
  opacity: 0.75,
} as const
