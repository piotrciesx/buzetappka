import { CSSProperties } from 'react'
import { uiZIndex } from './uiFoundation'

export const budgetPageStyles: Record<string, CSSProperties> = {
  page: {
    width: '100%',
    maxWidth: 'none',
    boxSizing: 'border-box',
    padding: '0 var(--ui-space-7) calc(var(--ui-space-10) + var(--ui-space-1)) 184px',
    margin: 0,
    fontFamily:
      'var(--font-app-sans), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: 'var(--ui-color-main-background)',
    minHeight: '100vh',
    color: 'var(--ui-color-primary-text)',
    overflowX: 'hidden',
  } as const,

  pageTitle: {
    fontSize: 21,
    fontWeight: 640,
    marginBottom: 0,
    letterSpacing: 0,
  } as const,

  pageSubtitle: {
    fontSize: 12,
    color: 'var(--ui-color-secondary-text)',
    marginBottom: 'var(--ui-spacing-card-section-gap)',
  } as const,

  topPanel: {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.90), rgba(248,250,252,0.74))',
    border: '1px solid rgba(203, 213, 225, 0.58)',
    borderRadius: 12,
    padding: 'var(--ui-spacing-sm)',
    marginBottom: 0,
    boxShadow: '0 14px 36px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255,255,255,0.86)',
    maxWidth: '100%',
    boxSizing: 'border-box',
  } as const,

  card: {
    background: 'rgba(255,255,255,0.84)',
    border: '1px solid rgba(226, 232, 240, 0.82)',
    borderRadius: 14,
    padding: 'var(--ui-spacing-card-padding)',
    marginBottom: 'var(--ui-space-5)',
    boxShadow: '0 10px 28px rgba(15,23,42,0.045)',
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
    fontWeight: 620,
    fontSize: 15,
    padding: 'var(--ui-spacing-sm) var(--ui-spacing-lg)',
    background: 'linear-gradient(145deg, var(--ui-color-card-background), var(--ui-color-soft-blue))',
    border: '1px solid rgba(147, 197, 253, 0.52)',
    borderRadius: 999,
    color: 'var(--ui-color-primary-navy)',
    boxShadow: '0 8px 18px rgba(37, 99, 235, 0.08), inset 0 1px 0 rgba(255,255,255,0.95)',
    boxSizing: 'border-box',
  } as const,

  monthNavigationSettingsCard: {
    marginBottom: 'var(--ui-space-7)',
    padding: 'var(--ui-space-7)',
    background: 'var(--ui-color-soft-section-background)',
    border: '1px solid var(--ui-color-divider-border)',
    borderRadius: 12,
  } as const,

  monthNavigationSettingsTitle: {
    fontSize: 15,
    fontWeight: 600,
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
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--ui-color-primary-text)',
  } as const,

  monthNavigationCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ui-spacing-form-field-gap)',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--ui-color-primary-text)',
  } as const,

  monthNavigationHint: {
    marginTop: 'var(--ui-space-5)',
    fontSize: 13,
    color: 'var(--ui-color-secondary-text)',
  } as const,

  infoRow: {
    display: 'flex',
    gap: 'var(--ui-spacing-card-section-gap)',
    flexWrap: 'wrap' as const,
  } as const,

  infoBox: {
    background: 'rgba(248,250,252,0.84)',
    border: '1px solid rgba(226, 232, 240, 0.88)',
    borderRadius: 12,
    padding: 'var(--ui-spacing-md) var(--ui-space-5)',
    fontSize: 12,
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflowWrap: 'anywhere' as const,
  } as const,

  smallMutedText: {
    fontSize: 12,
    color: 'var(--ui-color-secondary-text)',
    lineHeight: 1.4,
    overflowWrap: 'anywhere' as const,
  } as const,

  sectionTitle: {
    fontSize: 17,
    fontWeight: 760,
    marginBottom: 'var(--ui-spacing-sm)',
    color: 'var(--ui-color-primary-text)',
  } as const,

  emptyStateCard: {
    background: 'var(--ui-color-card-background)',
    border: '1px solid var(--ui-color-divider-border)',
    borderRadius: 14,
    padding: 'var(--ui-spacing-xl)',
    color: 'var(--ui-color-secondary-text)',
    fontStyle: 'italic',
  } as const,

  l1Card: {
    marginBottom: 'var(--ui-spacing-xs)',
    background: 'rgba(255, 255, 255, 0.72)',
    border: '1px solid rgba(219, 234, 254, 0.92)',
    borderRadius: 11,
    padding: 'var(--ui-spacing-xs)',
    boxShadow: '0 8px 22px var(--ui-shadow-light-color)',
    maxWidth: '100%',
    boxSizing: 'border-box',
  } as const,

  l1Header: {
    background: 'linear-gradient(145deg, rgba(239,246,255,0.98), rgba(226,239,255,0.84))',
    border: '1px solid rgba(147,197,253,0.46)',
    borderRadius: 9,
    padding: 'var(--ui-spacing-xs) var(--ui-spacing-sm)',
    fontWeight: 560,
    fontSize: 13,
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
    background: 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(248,250,252,0.82))',
    border: '1px solid rgba(203, 213, 225, 0.72)',
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
    fontSize: 14,
    width: 18,
    textAlign: 'center' as const,
  } as const,

  l2Name: {
    fontWeight: 560,
    fontSize: 13,
    color: 'var(--ui-color-primary-text)',
    overflowWrap: 'anywhere' as const,
  } as const,

  l2Meta: {
    fontSize: 10.5,
    color: 'var(--ui-color-secondary-text)',
    overflowWrap: 'anywhere' as const,
  } as const,

  closingBadge: {
    display: 'inline-block',
    marginTop: 'var(--ui-spacing-sm)',
    padding: 'var(--ui-spacing-xs) var(--ui-spacing-md)',
    borderRadius: 999,
    background: 'var(--ui-color-warning-soft)',
    border: '1px solid var(--ui-color-warning-soft)',
    color: 'var(--ui-color-warning)',
    fontSize: 12,
    fontWeight: 600,
  } as const,

  l3Wrap: {
    marginTop: 'var(--ui-spacing-xs)',
    marginLeft: 'clamp(var(--ui-space-1), 1vw, var(--ui-spacing-md))',
    minWidth: 0,
  } as const,

  l3Header: {
    background: 'rgba(255, 255, 255, 0.86)',
    border: '1px solid rgba(226, 232, 240, 0.9)',
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
    fontWeight: 540,
    fontSize: 12.5,
    color: 'var(--ui-color-primary-text)',
    overflowWrap: 'anywhere' as const,
  } as const,

  dragHandle: {
    width: 26,
    minWidth: 26,
    height: 26,
    borderRadius: 9,
    border: '1px solid rgba(203,213,225,0.82)',
    background: 'linear-gradient(145deg, var(--ui-color-card-background), var(--ui-color-soft-section-background))',
    color: 'var(--ui-color-secondary-text)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    touchAction: 'none',
    fontSize: 15,
    fontWeight: 600,
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
    minHeight: 'var(--ui-button-height-standard)',
    padding: 'var(--ui-button-padding-standard)',
    borderRadius: 'var(--ui-button-radius)',
    border: '1px solid var(--ui-button-border-strong)',
    background: 'var(--ui-button-bg)',
    color: 'var(--ui-button-text-strong)',
    fontWeight: 600,
    cursor: 'pointer',
    maxWidth: '100%',
    whiteSpace: 'normal' as const,
    overflowWrap: 'anywhere' as const,
  } as const,

  secondaryButton: {
    minHeight: 'var(--ui-button-height-utility)',
    padding: 'var(--ui-button-padding-utility)',
    borderRadius: 'var(--ui-button-radius)',
    border: '1px solid var(--ui-button-border)',
    background: 'var(--ui-button-bg)',
    color: 'var(--ui-button-text)',
    fontWeight: 560,
    cursor: 'pointer',
    maxWidth: '100%',
    whiteSpace: 'normal' as const,
    overflowWrap: 'anywhere' as const,
  } as const,

  dangerButton: {
    minHeight: 'var(--ui-button-height-utility)',
    padding: 'var(--ui-button-padding-utility)',
    borderRadius: 'var(--ui-button-radius)',
    border: '1px solid var(--ui-button-border)',
    background: 'var(--ui-button-bg)',
    color: 'var(--ui-color-expense)',
    fontWeight: 560,
    cursor: 'pointer',
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
    background: 'var(--ui-color-soft-section-background)',
    border: '1px solid var(--ui-color-divider-border)',
    borderRadius: 12,
    maxWidth: '100%',
    boxSizing: 'border-box',
  } as const,

  input: {
    height: 34,
    padding: '0 var(--ui-spacing-lg)',
    borderRadius: 11,
    border: '1px solid rgba(203,213,225,0.92)',
    background: 'var(--ui-color-card-background)',
    fontSize: 13,
    minWidth: 180,
    maxWidth: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  } as const,

  smallInput: {
    height: 32,
    padding: '0 var(--ui-space-5)',
    borderRadius: 10,
    border: '1px solid rgba(203,213,225,0.92)',
    background: 'var(--ui-color-card-background)',
    fontSize: 13,
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
    background: 'rgba(255,255,255,0.76)',
    border: '1px solid rgba(226,232,240,0.82)',
    borderRadius: 8,
    fontSize: 12,
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
    fontWeight: 620,
    fontSize: 12.5,
  } as const,

  dateText: {
    fontSize: 11,
    color: 'var(--ui-color-secondary-text)',
  } as const,

  emptyText: {
    marginTop: 'var(--ui-spacing-md)',
    fontSize: 12,
    color: 'var(--ui-color-secondary-text)',
    fontStyle: 'italic',
  } as const,

  errorBox: {
    marginTop: 'var(--ui-spacing-lg)',
    color: 'var(--ui-color-expense)',
    background: 'var(--ui-color-expense-soft)',
    border: '1px solid var(--ui-color-expense-soft)',
    padding: 'var(--ui-spacing-lg)',
    borderRadius: 10,
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
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--ui-color-primary-text)',
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
    width: 'var(--ui-button-height-icon)',
    minWidth: 'var(--ui-button-height-icon)',
    height: 'var(--ui-button-height-icon)',
    minHeight: 'var(--ui-button-height-icon)',
    borderRadius: 'var(--ui-button-radius)',
    border: '1px solid var(--ui-button-border-strong)',
    background: 'var(--ui-button-bg)',
    color: 'var(--ui-button-text-strong)',
    fontSize: 20,
    lineHeight: 1,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: 'none',
    padding: 0,
    textAlign: 'center' as const,
  } as const,

  floatingIncomeButton: {
    borderColor: 'var(--ui-button-border-strong)',
    color: 'var(--ui-color-income)',
  } as const,

  floatingExpenseButton: {
    borderColor: 'var(--ui-button-border-strong)',
    color: 'var(--ui-color-expense)',
  } as const,
}
