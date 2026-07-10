import { uiListRowApi, uiTypographyTokens } from '../../lib/uiFoundation'

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
  gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
  gap: 8,
  marginBottom: 0,
} as const

export const filterFieldStyle = {
  minWidth: 0,
  display: 'grid',
  gap: 5,
} as const

export const wideFilterFieldStyle = {
  ...filterFieldStyle,
  gridColumn: 'span 2',
} as const

export const regularFilterFieldStyle = {
  ...filterFieldStyle,
  gridColumn: 'span 2',
} as const

export const typeFilterFieldStyle = {
  ...filterFieldStyle,
  gridColumn: 'span 4',
  overflow: 'visible',
} as const

export const compactFilterFieldStyle = {
  ...filterFieldStyle,
  gridColumn: 'span 1',
} as const

export const actionFilterFieldStyle = {
  ...filterFieldStyle,
  gridColumn: 'span 2',
  alignSelf: 'end',
  justifyItems: 'end',
} as const

export const resetButtonStyle = {
  minHeight: 30,
  padding: '0 10px',
  borderRadius: 999,
  border: '1px solid transparent',
  background: 'transparent',
  color: 'var(--ui-text-secondary)',
  cursor: 'pointer',
  fontSize: uiTypographyTokens.role.metadata,
  fontWeight: uiTypographyTokens.weight.medium,
} as const

export const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 0,
  marginBottom: 0,
} as const

export const statCardStyle = {
  border: 0,
  borderBottom: '1px solid var(--ui-border-divider)',
  borderRadius: 0,
  padding: '9px 0',
  background: 'transparent',
} as const

export const incomeStatCardStyle = {
  ...statCardStyle,
  background: 'transparent',
  borderBottom: '1px solid var(--ui-border-divider)',
} as const

export const expenseStatCardStyle = {
  ...statCardStyle,
  background: 'transparent',
  borderBottom: '1px solid var(--ui-border-divider)',
} as const

export const balanceStatCardStyle = {
  ...statCardStyle,
  background: 'transparent',
  borderBottom: '1px solid var(--ui-border-divider)',
} as const

export const statLabelStyle = {
  fontSize: uiTypographyTokens.role.metadata,
  opacity: 0.7,
  marginBottom: 4,
} as const

export const statValueStyle = {
  fontSize: uiTypographyTokens.hierarchy.t3,
  fontWeight: uiTypographyTokens.weight.bold,
} as const

export const tagsWrapStyle = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
  marginBottom: 14,
} as const

export const tagButtonBaseStyle = {
  padding: '5px 9px',
  borderRadius: 999,
  border: '1px solid var(--ui-border-soft)',
  background: 'var(--ui-surface-card)',
  cursor: 'pointer',
  fontSize: uiTypographyTokens.role.label,
} as const

export const historyWrapStyle = {
  border: 0,
  borderRadius: 0,
  overflow: 'hidden',
  background: 'transparent',
} as const

export const historyHeaderStyle = {
  display: 'grid',
  gridTemplateColumns: '104px 112px minmax(260px, 1fr) 104px',
  gap: 'var(--ui-row-gap)',
  minHeight: 'var(--ui-row-height-sm)',
  padding: '6px 0',
  background: 'transparent',
  color: 'var(--ui-text-secondary)',
  fontWeight: uiTypographyTokens.weight.bold,
  fontSize: uiTypographyTokens.role.metadata,
  borderBottom: '1px solid var(--ui-border-divider)',
} as const

export const historyRowStyle = {
  display: 'grid',
  gridTemplateColumns: '104px 112px minmax(260px, 1fr) 104px',
  gap: 'var(--ui-row-gap)',
  minHeight: 48,
  padding: '8px 0',
  borderBottom: '1px solid var(--ui-row-divider)',
  alignItems: 'start',
  fontSize: uiTypographyTokens.role.label,
} as const

export const historyHeaderClassName = `${uiListRowApi.classNames.row} ${uiListRowApi.classNames.rowSm}`
export const historyRowClassName = `${uiListRowApi.classNames.row} ${uiListRowApi.classNames.rowMd}`

export const responsiveSearchStyle = `
  [data-search-filter-field="wide"],
  [data-search-filter-field="type"],
  [data-search-filter-field="regular"],
  [data-search-filter-field="compact"] {
    min-width: 0;
  }

  [data-bank-search-filter-panel="true"],
  [data-bank-search-filters="true"],
  [data-search-filter-field="type"] {
    overflow: visible;
  }

  [data-search-filter-field="type"] [data-ui-segmented-control="true"] {
    max-width: 100%;
    flex-wrap: wrap;
    overflow: visible;
  }

  [data-search-filter-field="type"] [data-ui-segmented-control="true"] button {
    flex: 1 1 max-content;
    min-width: max-content;
  }

  @media (max-width: 920px) {
    [data-bank-search-filters="true"] {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }

    [data-search-filter-field="wide"],
    [data-search-filter-field="type"],
    [data-search-filter-field="regular"],
    [data-search-filter-field="compact"] {
      grid-column: span 1 !important;
    }

    [data-search-filter-field="type"] {
      grid-column: span 2 !important;
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
  padding: '3px 7px',
  borderRadius: 999,
  background: 'transparent',
  border: '1px solid var(--ui-border-soft)',
  color: 'var(--ui-text-link)',
  cursor: 'pointer',
} as const

export const emptyStateStyle = {
  padding: '16px 0',
  fontSize: uiTypographyTokens.role.label,
  opacity: 0.75,
} as const
