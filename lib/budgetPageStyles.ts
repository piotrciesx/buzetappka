import { CSSProperties } from 'react'

export const budgetPageStyles: Record<string, CSSProperties> = {
  page: {
    width: '100%',
    maxWidth: 1100,
    boxSizing: 'border-box',
    padding: 20,
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    background: '#f8fafc',
    minHeight: '100vh',
    color: '#111827',
    overflowX: 'hidden',
  } as const,

  pageTitle: {
    fontSize: 32,
    fontWeight: 600,
    marginBottom: 8,
  } as const,

  pageSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  } as const,

  topPanel: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    maxWidth: '100%',
    boxSizing: 'border-box',
  } as const,

  card: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    maxWidth: '100%',
    boxSizing: 'border-box',
  } as const,

  monthBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap' as const,
    marginBottom: 14,
  } as const,

  monthLabel: {
    minWidth: 110,
    textAlign: 'center' as const,
    fontWeight: 600,
    fontSize: 18,
    padding: '10px 14px',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 10,
    boxSizing: 'border-box',
  } as const,

  monthNavigationSettingsCard: {
    marginBottom: 14,
    padding: 14,
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
  } as const,

  monthNavigationSettingsTitle: {
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 10,
  } as const,

  monthNavigationSettingsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap' as const,
  } as const,

  monthNavigationField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  } as const,

  monthNavigationFieldLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
  } as const,

  monthNavigationCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
  } as const,

  monthNavigationHint: {
    marginTop: 10,
    fontSize: 13,
    color: '#4b5563',
  } as const,

  infoRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap' as const,
  } as const,

  infoBox: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 14,
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflowWrap: 'anywhere' as const,
  } as const,

  smallMutedText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 1.45,
    overflowWrap: 'anywhere' as const,
  } as const,

  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 14,
  } as const,

  emptyStateCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  } as const,

  l1Card: {
    marginBottom: 18,
    background: '#ffffff',
    border: '1px solid #dbeafe',
    borderRadius: 16,
    padding: 14,
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    maxWidth: '100%',
    boxSizing: 'border-box',
  } as const,

  l1Header: {
    background: '#dbeafe',
    border: '1px solid #93c5fd',
    borderRadius: 12,
    padding: '14px 16px',
    fontWeight: 600,
    fontSize: 18,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
  } as const,

  l2Wrap: {
    marginTop: 12,
    marginLeft: 'clamp(6px, 2vw, 14px)',
    minWidth: 0,
  } as const,

  l2Header: {
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: 12,
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap' as const,
    cursor: 'pointer',
  } as const,

  l2Left: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap' as const,
    minWidth: 0,
  } as const,

  arrow: {
    fontSize: 14,
    width: 18,
    textAlign: 'center' as const,
  } as const,

  l2Name: {
    fontWeight: 600,
    fontSize: 16,
    overflowWrap: 'anywhere' as const,
  } as const,

  l2Meta: {
    fontSize: 13,
    color: '#6b7280',
    overflowWrap: 'anywhere' as const,
  } as const,

  closingBadge: {
    display: 'inline-block',
    marginTop: 6,
    padding: '4px 8px',
    borderRadius: 999,
    background: '#fff7ed',
    border: '1px solid #fdba74',
    color: '#9a3412',
    fontSize: 12,
    fontWeight: 600,
  } as const,

  l3Wrap: {
    marginTop: 10,
    marginLeft: 'clamp(6px, 2vw, 14px)',
    minWidth: 0,
  } as const,

  l3Header: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '10px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap' as const,
    cursor: 'pointer',
  } as const,

  l3Name: {
    fontWeight: 600,
    fontSize: 15,
    overflowWrap: 'anywhere' as const,
  } as const,

  dragHandle: {
    width: 38,
    minWidth: 38,
    height: 38,
    borderRadius: 10,
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    color: '#374151',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    touchAction: 'none',
    fontSize: 18,
    fontWeight: 600,
    padding: 0,
  } as const,

  dragHandleDisabled: {
    cursor: 'not-allowed',
    opacity: 0.6,
  } as const,

  actions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap' as const,
    minWidth: 0,
  } as const,

  primaryButton: {
    padding: '9px 12px',
    borderRadius: 10,
    border: '1px solid #2563eb',
    background: '#2563eb',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer',
    maxWidth: '100%',
    whiteSpace: 'normal' as const,
    overflowWrap: 'anywhere' as const,
  } as const,

  secondaryButton: {
    padding: '9px 12px',
    borderRadius: 10,
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#111827',
    fontWeight: 600,
    cursor: 'pointer',
    maxWidth: '100%',
    whiteSpace: 'normal' as const,
    overflowWrap: 'anywhere' as const,
  } as const,

  dangerButton: {
    padding: '9px 12px',
    borderRadius: 10,
    border: '1px solid #fca5a5',
    background: '#fef2f2',
    color: '#991b1b',
    fontWeight: 600,
    cursor: 'pointer',
    maxWidth: '100%',
    whiteSpace: 'normal' as const,
    overflowWrap: 'anywhere' as const,
  } as const,

  formRow: {
    marginTop: 10,
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap' as const,
    padding: 12,
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    maxWidth: '100%',
    boxSizing: 'border-box',
  } as const,

  input: {
    height: 40,
    padding: '0 12px',
    borderRadius: 10,
    border: '1px solid #d1d5db',
    background: '#ffffff',
    fontSize: 14,
    minWidth: 180,
    maxWidth: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  } as const,

  smallInput: {
    height: 40,
    padding: '0 12px',
    borderRadius: 10,
    border: '1px solid #d1d5db',
    background: '#ffffff',
    fontSize: 14,
    width: 120,
    maxWidth: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  } as const,

  transactionsBox: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  } as const,

  transactionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    fontSize: 14,
    maxWidth: '100%',
    boxSizing: 'border-box',
    minWidth: 0,
  } as const,

  transactionLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    minWidth: 0,
    overflowWrap: 'anywhere' as const,
  } as const,

  amountText: {
    fontWeight: 600,
    fontSize: 15,
  } as const,

  dateText: {
    fontSize: 12,
    color: '#6b7280',
  } as const,

  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  } as const,

  errorBox: {
    marginTop: 12,
    color: '#991b1b',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    padding: 12,
    borderRadius: 10,
  } as const,

  sortBar: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap' as const,
    marginBottom: 14,
    alignItems: 'center',
  } as const,

  sortGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap' as const,
    minWidth: 0,
  } as const,

  sortLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
  } as const,

  floatingActionPanel: {
    position: 'fixed',
    right: 'max(12px, env(safe-area-inset-right))',
    bottom: 'max(14px, env(safe-area-inset-bottom))',
    display: 'flex',
    flexDirection: 'row' as const,
    gap: 8,
    zIndex: 950,
    maxWidth: 'calc(100vw - 24px)',
  } as const,

  floatingActionButton: {
    width: 52,
    minWidth: 52,
    height: 52,
    minHeight: 52,
    borderRadius: 999,
    border: 'none',
    background: '#dc2626',
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.18)',
    padding: 0,
    textAlign: 'center' as const,
  } as const,

  floatingIncomeButton: {
    background: '#16a34a',
  } as const,

  floatingExpenseButton: {
    background: '#dc2626',
  } as const,
}
