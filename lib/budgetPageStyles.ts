import { CSSProperties } from 'react'

export const budgetPageStyles: Record<string, CSSProperties> = {
  page: {
    padding: 20,
    maxWidth: 1100,
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    background: '#f8fafc',
    minHeight: '100vh',
    color: '#111827',
  } as const,

  pageTitle: {
    fontSize: 32,
    fontWeight: 700,
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
    fontWeight: 700,
    fontSize: 18,
    padding: '10px 14px',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 10,
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
    fontWeight: 700,
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
  } as const,

  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
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
  } as const,

  l1Header: {
    background: '#dbeafe',
    border: '1px solid #93c5fd',
    borderRadius: 12,
    padding: '14px 16px',
    fontWeight: 700,
    fontSize: 18,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
  } as const,

  l2Wrap: {
    marginTop: 12,
    marginLeft: 14,
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
  } as const,

  arrow: {
    fontSize: 14,
    width: 18,
    textAlign: 'center' as const,
  } as const,

  l2Name: {
    fontWeight: 700,
    fontSize: 16,
  } as const,

  l2Meta: {
    fontSize: 13,
    color: '#6b7280',
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
    fontWeight: 700,
  } as const,

  l3Wrap: {
    marginTop: 10,
    marginLeft: 14,
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
    fontWeight: 700,
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
  } as const,

  primaryButton: {
    padding: '9px 12px',
    borderRadius: 10,
    border: '1px solid #2563eb',
    background: '#2563eb',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer',
  } as const,

  secondaryButton: {
    padding: '9px 12px',
    borderRadius: 10,
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#111827',
    fontWeight: 600,
    cursor: 'pointer',
  } as const,

  dangerButton: {
    padding: '9px 12px',
    borderRadius: 10,
    border: '1px solid #fca5a5',
    background: '#fef2f2',
    color: '#991b1b',
    fontWeight: 600,
    cursor: 'pointer',
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
  } as const,

  input: {
    height: 40,
    padding: '0 12px',
    borderRadius: 10,
    border: '1px solid #d1d5db',
    background: '#ffffff',
    fontSize: 14,
    minWidth: 180,
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
  } as const,

  transactionLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  } as const,

  amountText: {
    fontWeight: 700,
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
  } as const,

  sortLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#374151',
  } as const,

  floatingActionPanel: {
    position: 'fixed',
    right: 24,
    bottom: 24,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
    zIndex: 950,
  } as const,

  floatingActionButton: {
    minWidth: 150,
    minHeight: 52,
    borderRadius: 14,
    border: 'none',
    background: '#2563eb',
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 16px 32px rgba(37, 99, 235, 0.28)',
    padding: '0 18px',
    textAlign: 'left' as const,
  } as const,

  floatingIncomeButton: {
    background: '#047857',
  } as const,
}
