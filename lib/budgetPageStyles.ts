import { CSSProperties } from 'react'
import { uiControlPrimitives, uiSurfacePrimitives, uiTypographyTokens, uiZIndex } from './uiFoundation'

export const budgetPageStyles: Record<string, CSSProperties> = {
  page: {
    width: '100%',
    maxWidth: 'none',
    boxSizing: 'border-box',
    padding: '0 var(--ui-space-7) calc(var(--ui-space-10) + var(--ui-space-1)) 184px',
    margin: 0,
    fontFamily:
      'var(--font-app-sans), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: 'var(--ui-surface-app)',
    minHeight: '100vh',
    color: 'var(--ui-text-primary)',
    overflowX: 'hidden',
  } as const,

  pageTitle: {
    fontSize: uiTypographyTokens.hierarchy.t1,
    fontWeight: uiTypographyTokens.weight.bold,
    marginBottom: 0,
    letterSpacing: 0,
  } as const,

  pageSubtitle: {
    fontSize: uiTypographyTokens.role.metadata,
    color: 'var(--ui-text-secondary)',
    marginBottom: 'var(--ui-spacing-card-section-gap)',
  } as const,

  topPanel: {
    background: uiSurfacePrimitives.surfacePanel.background,
    border: uiSurfacePrimitives.surfacePanel.border,
    borderRadius: uiSurfacePrimitives.surfacePanel.radius,
    padding: 'var(--ui-spacing-sm)',
    marginBottom: 0,
    boxShadow: uiSurfacePrimitives.surfacePanel.shadow,
    maxWidth: '100%',
    boxSizing: 'border-box',
  } as const,

  card: {
    background: uiSurfacePrimitives.surfaceCard.background,
    border: uiSurfacePrimitives.surfaceCard.border,
    borderRadius: uiSurfacePrimitives.surfaceCard.radius,
    padding: 'var(--ui-spacing-card-padding)',
    marginBottom: 'var(--ui-space-5)',
    boxShadow: uiSurfacePrimitives.surfaceCard.shadow,
    maxWidth: '100%',
    boxSizing: 'border-box',
  } as const,

  monthBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ui-spacing-form-group-gap)',
    flexWrap: 'wrap' as const,
    marginBottom: 'var(--ui-space-7)',
  } as const,

  monthLabel: {
    minWidth: 116,
    textAlign: 'center' as const,
    fontWeight: uiTypographyTokens.weight.semibold,
    fontSize: uiTypographyTokens.hierarchy.t3,
    padding: 'var(--ui-spacing-sm) var(--ui-spacing-lg)',
    background: 'var(--ui-surface-card)',
    border: '1px solid var(--ui-border-active)',
    borderRadius: 'var(--ui-radius-pill)',
    color: 'var(--ui-text-link)',
    boxShadow: 'var(--ui-shadow-none)',
    boxSizing: 'border-box',
  } as const,

  monthNavigationSettingsCard: {
    marginBottom: 'var(--ui-space-7)',
    padding: 'var(--ui-space-7)',
    background: 'var(--ui-surface-card)',
    border: '1px solid var(--ui-border-divider)',
    borderRadius: 'var(--ui-radius-lg)',
  } as const,

  monthNavigationSettingsTitle: {
    fontSize: uiTypographyTokens.hierarchy.t3,
    fontWeight: uiTypographyTokens.weight.semibold,
    marginBottom: 'var(--ui-space-5)',
  } as const,

  monthNavigationSettingsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ui-spacing-form-group-gap)',
    flexWrap: 'wrap' as const,
  } as const,

  monthNavigationField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--ui-spacing-form-field-gap)',
  } as const,

  monthNavigationFieldLabel: {
    fontSize: uiTypographyTokens.role.label,
    fontWeight: uiTypographyTokens.weight.semibold,
    color: 'var(--ui-text-primary)',
  } as const,

  monthNavigationCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ui-spacing-form-field-gap)',
    fontSize: uiTypographyTokens.hierarchy.t3,
    fontWeight: uiTypographyTokens.weight.semibold,
    color: 'var(--ui-text-primary)',
  } as const,

  monthNavigationHint: {
    marginTop: 'var(--ui-space-5)',
    fontSize: uiTypographyTokens.role.helper,
    color: 'var(--ui-text-secondary)',
  } as const,

  infoRow: {
    display: 'flex',
    gap: 'var(--ui-spacing-card-section-gap)',
    flexWrap: 'wrap' as const,
  } as const,

  infoBox: {
    background: 'var(--ui-surface-card)',
    border: '1px solid var(--ui-border-divider)',
    borderRadius: 'var(--ui-radius-lg)',
    padding: 'var(--ui-spacing-md) var(--ui-space-5)',
    fontSize: uiTypographyTokens.role.metadata,
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflowWrap: 'anywhere' as const,
  } as const,

  smallMutedText: {
    fontSize: uiTypographyTokens.role.helper,
    color: 'var(--ui-text-secondary)',
    lineHeight: uiTypographyTokens.lineHeight.body,
    overflowWrap: 'anywhere' as const,
  } as const,

  sectionTitle: {
    fontSize: uiTypographyTokens.hierarchy.t2,
    fontWeight: uiTypographyTokens.weight.bold,
    marginBottom: 'var(--ui-spacing-sm)',
    color: 'var(--ui-text-primary)',
  } as const,

  emptyStateCard: {
    background: uiSurfacePrimitives.surfaceEmpty.background,
    border: uiSurfacePrimitives.surfaceEmpty.border,
    borderRadius: uiSurfacePrimitives.surfaceEmpty.radius,
    padding: 'var(--ui-spacing-xl)',
    color: 'var(--ui-text-secondary)',
    fontStyle: 'italic',
  } as const,

  l1Card: {
    marginBottom: 'var(--ui-spacing-xs)',
    background: 'var(--ui-surface-card)',
    border: '1px solid var(--ui-border-soft)',
    borderRadius: 11,
    padding: 'var(--ui-spacing-xs)',
    boxShadow: '0 8px 22px var(--ui-shadow-light-color)',
    maxWidth: '100%',
    boxSizing: 'border-box',
  } as const,

  l1Header: {
    background: 'var(--ui-surface-card)',
    border: '1px solid var(--ui-border-soft)',
    borderRadius: 9,
    padding: 'var(--ui-spacing-xs) var(--ui-spacing-sm)',
    fontWeight: uiTypographyTokens.weight.medium,
    fontSize: uiTypographyTokens.role.label,
    marginBottom: 'var(--ui-spacing-xs)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ui-space-5)',
    cursor: 'pointer',
  } as const,

  l2Wrap: {
    marginTop: 'var(--ui-spacing-xs)',
    marginLeft: 'clamp(var(--ui-space-1), 1vw, var(--ui-spacing-md))',
    minWidth: 0,
  } as const,

  l2Header: {
    background: 'var(--ui-surface-card)',
    border: '1px solid var(--ui-border-soft)',
    borderRadius: 9,
    padding: 'var(--ui-space-1) var(--ui-spacing-sm)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--ui-spacing-list-row-x)',
    flexWrap: 'wrap' as const,
    cursor: 'pointer',
  } as const,

  l2Left: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ui-spacing-sm)',
    flexWrap: 'wrap' as const,
    minWidth: 0,
  } as const,

  arrow: {
    fontSize: uiTypographyTokens.hierarchy.t3,
    width: 18,
    textAlign: 'center' as const,
  } as const,

  l2Name: {
    fontWeight: uiTypographyTokens.weight.medium,
    fontSize: uiTypographyTokens.role.label,
    color: 'var(--ui-text-primary)',
    overflowWrap: 'anywhere' as const,
  } as const,

  l2Meta: {
    fontSize: uiTypographyTokens.role.widgetMeta,
    color: 'var(--ui-text-secondary)',
    overflowWrap: 'anywhere' as const,
  } as const,

  closingBadge: {
    display: 'inline-block',
    marginTop: 'var(--ui-spacing-sm)',
    padding: 'var(--ui-spacing-xs) var(--ui-spacing-md)',
    borderRadius: 999,
    background: 'var(--ui-status-warning-soft)',
    border: '1px solid var(--ui-status-warning-soft)',
    color: 'var(--ui-status-warning)',
    fontSize: uiTypographyTokens.role.metadata,
    fontWeight: uiTypographyTokens.weight.semibold,
  } as const,

  l3Wrap: {
    marginTop: 'var(--ui-spacing-xs)',
    marginLeft: 'clamp(var(--ui-space-1), 1vw, var(--ui-spacing-md))',
    minWidth: 0,
  } as const,

  l3Header: {
    background: 'var(--ui-surface-card)',
    border: '1px solid var(--ui-border-divider)',
    borderRadius: 9,
    padding: 'var(--ui-space-1) var(--ui-spacing-sm)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--ui-spacing-list-row-x)',
    flexWrap: 'wrap' as const,
    cursor: 'pointer',
  } as const,

  l3Name: {
    fontWeight: uiTypographyTokens.weight.medium,
    fontSize: uiTypographyTokens.role.metadata,
    color: 'var(--ui-text-primary)',
    overflowWrap: 'anywhere' as const,
  } as const,

  dragHandle: {
    width: 26,
    minWidth: 26,
    height: 26,
    borderRadius: 9,
    border: '1px solid var(--ui-border-soft)',
    background: 'var(--ui-surface-card)',
    color: 'var(--ui-text-secondary)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    touchAction: 'none',
    fontSize: uiTypographyTokens.hierarchy.t3,
    fontWeight: uiTypographyTokens.weight.semibold,
    padding: 0,
  } as const,

  dragHandleDisabled: {
    cursor: 'not-allowed',
    opacity: 0.6,
  } as const,

  actions: {
    display: 'flex',
    gap: 'var(--ui-spacing-action-gap)',
    flexWrap: 'wrap' as const,
    minWidth: 0,
  } as const,

  primaryButton: {
    minHeight: uiControlPrimitives.button.standard.minHeight,
    padding: uiControlPrimitives.button.standard.padding,
    borderRadius: uiControlPrimitives.button.standard.radius,
    border: uiControlPrimitives.button.standard.border,
    background: uiControlPrimitives.button.standard.background,
    color: uiControlPrimitives.button.standard.color,
    fontWeight: uiControlPrimitives.button.standard.fontWeight,
    cursor: uiControlPrimitives.button.standard.cursor,
    maxWidth: '100%',
    whiteSpace: 'normal' as const,
    overflowWrap: 'anywhere' as const,
  } as const,

  secondaryButton: {
    minHeight: uiControlPrimitives.button.utility.minHeight,
    padding: uiControlPrimitives.button.utility.padding,
    borderRadius: uiControlPrimitives.button.utility.radius,
    border: uiControlPrimitives.button.utility.border,
    background: uiControlPrimitives.button.utility.background,
    color: uiControlPrimitives.button.utility.color,
    fontWeight: uiControlPrimitives.button.utility.fontWeight,
    cursor: uiControlPrimitives.button.utility.cursor,
    maxWidth: '100%',
    whiteSpace: 'normal' as const,
    overflowWrap: 'anywhere' as const,
  } as const,

  dangerButton: {
    minHeight: uiControlPrimitives.button.utility.minHeight,
    padding: uiControlPrimitives.button.utility.padding,
    borderRadius: uiControlPrimitives.button.utility.radius,
    border: uiControlPrimitives.button.utility.border,
    background: uiControlPrimitives.button.utility.background,
    color: 'var(--ui-button-tone-danger-text)',
    fontWeight: uiControlPrimitives.button.utility.fontWeight,
    cursor: uiControlPrimitives.button.utility.cursor,
    maxWidth: '100%',
    whiteSpace: 'normal' as const,
    overflowWrap: 'anywhere' as const,
  } as const,

  formRow: {
    marginTop: 'var(--ui-space-5)',
    display: 'flex',
    gap: 'var(--ui-spacing-form-field-gap)',
    flexWrap: 'wrap' as const,
    padding: 'var(--ui-spacing-lg)',
    background: 'var(--ui-surface-card)',
    border: '1px solid var(--ui-border-divider)',
    borderRadius: 'var(--ui-radius-lg)',
    maxWidth: '100%',
    boxSizing: 'border-box',
  } as const,

  input: {
    height: 34,
    padding: '0 var(--ui-spacing-lg)',
    borderRadius: 'var(--ui-input-radius)',
    border: '1px solid var(--ui-border-soft)',
    background: 'var(--ui-surface-card)',
    fontSize: uiTypographyTokens.role.label,
    minWidth: 180,
    maxWidth: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  } as const,

  smallInput: {
    height: 32,
    padding: '0 var(--ui-space-5)',
    borderRadius: 'var(--ui-input-radius)',
    border: '1px solid var(--ui-border-soft)',
    background: 'var(--ui-surface-card)',
    fontSize: uiTypographyTokens.role.label,
    width: 120,
    maxWidth: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  } as const,

  transactionsBox: {
    marginTop: 'var(--ui-spacing-md)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--ui-space-1)',
  } as const,

  transactionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--ui-spacing-list-row-x)',
    padding: 'var(--ui-space-1) var(--ui-spacing-sm)',
    background: 'var(--ui-surface-card)',
    border: '1px solid var(--ui-border-soft)',
    borderRadius: 8,
    fontSize: uiTypographyTokens.role.metadata,
    maxWidth: '100%',
    boxSizing: 'border-box',
    minWidth: 0,
  } as const,

  transactionLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--ui-space-1)',
    minWidth: 0,
    overflowWrap: 'anywhere' as const,
  } as const,

  amountText: {
    fontWeight: uiTypographyTokens.weight.semibold,
    fontSize: uiTypographyTokens.role.metadata,
  } as const,

  dateText: {
    fontSize: uiTypographyTokens.role.widgetMeta,
    color: 'var(--ui-text-secondary)',
  } as const,

  emptyText: {
    marginTop: 'var(--ui-spacing-md)',
    fontSize: uiTypographyTokens.role.metadata,
    color: 'var(--ui-text-secondary)',
    fontStyle: 'italic',
  } as const,

  errorBox: {
    marginTop: 'var(--ui-spacing-lg)',
    color: 'var(--ui-financial-expense)',
    background: 'var(--ui-financial-expense-soft)',
    border: '1px solid var(--ui-financial-expense-soft)',
    padding: 'var(--ui-spacing-lg)',
    borderRadius: 'var(--ui-radius-md)',
  } as const,

  sortBar: {
    display: 'flex',
    gap: 'var(--ui-spacing-form-group-gap)',
    flexWrap: 'wrap' as const,
    marginBottom: 'var(--ui-space-7)',
    alignItems: 'center',
  } as const,

  sortGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ui-spacing-form-field-gap)',
    flexWrap: 'wrap' as const,
    minWidth: 0,
  } as const,

  sortLabel: {
    fontSize: uiTypographyTokens.hierarchy.t3,
    fontWeight: uiTypographyTokens.weight.semibold,
    color: 'var(--ui-text-primary)',
  } as const,

  floatingActionPanel: {
    position: 'fixed',
    right: 'max(12px, env(safe-area-inset-right))',
    bottom: 'max(14px, env(safe-area-inset-bottom))',
    display: 'flex',
    flexDirection: 'row' as const,
    gap: 'var(--ui-spacing-action-gap)',
    zIndex: uiZIndex.floatingAction,
    maxWidth: 'calc(100vw - 24px)',
  } as const,

  floatingActionButton: {
    width: uiControlPrimitives.button.icon.width,
    minWidth: uiControlPrimitives.button.icon.minWidth,
    height: uiControlPrimitives.button.icon.height,
    minHeight: uiControlPrimitives.button.icon.minHeight,
    borderRadius: uiControlPrimitives.button.icon.radius,
    border: uiControlPrimitives.button.icon.border,
    background: uiControlPrimitives.button.icon.background,
    color: uiControlPrimitives.button.icon.color,
    fontSize: uiTypographyTokens.role.financialValue,
    lineHeight: uiTypographyTokens.lineHeight.compact,
    fontWeight: uiTypographyTokens.weight.semibold,
    cursor: uiControlPrimitives.button.icon.cursor,
    boxShadow: 'none',
    padding: uiControlPrimitives.button.icon.padding,
    textAlign: 'center' as const,
  } as const,

  floatingIncomeButton: {
    borderColor: 'var(--ui-button-border-strong)',
    color: 'var(--ui-financial-income)',
  } as const,

  floatingExpenseButton: {
    borderColor: 'var(--ui-button-border-strong)',
    color: 'var(--ui-financial-expense)',
  } as const,
}
