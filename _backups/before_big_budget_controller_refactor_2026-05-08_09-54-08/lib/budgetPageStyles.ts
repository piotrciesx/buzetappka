import { CSSProperties } from 'react'

export const budgetPageStyles: Record<string, CSSProperties> = {
  page: {
    width: '100%',
    maxWidth: 'none',
    boxSizing: 'border-box',
    padding: '0 14px 22px 184px',
    margin: 0,
    fontFamily:
      'var(--font-app-sans), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: '#f3f6fb',
    minHeight: '100vh',
    color: '#0f172a',
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
    color: '#64748b',
    marginBottom: 12,
  } as const,

  topPanel: {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.90), rgba(248,250,252,0.74))',
    border: '1px solid rgba(203, 213, 225, 0.58)',
    borderRadius: 12,
    padding: 6,
    marginBottom: 0,
    boxShadow: '0 14px 36px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255,255,255,0.86)',
    maxWidth: '100%',
    boxSizing: 'border-box',
  } as const,

  card: {
    background: 'rgba(255,255,255,0.84)',
    border: '1px solid rgba(226, 232, 240, 0.82)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    boxShadow: '0 10px 28px rgba(15,23,42,0.045)',
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
    minWidth: 116,
    textAlign: 'center' as const,
    fontWeight: 620,
    fontSize: 15,
    padding: '6px 12px',
    background: 'linear-gradient(145deg, #ffffff, #eef5ff)',
    border: '1px solid rgba(147, 197, 253, 0.52)',
    borderRadius: 999,
    color: '#1e3a8a',
    boxShadow: '0 8px 18px rgba(37, 99, 235, 0.08), inset 0 1px 0 rgba(255,255,255,0.95)',
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
    background: 'rgba(248,250,252,0.84)',
    border: '1px solid rgba(226, 232, 240, 0.88)',
    borderRadius: 12,
    padding: '8px 10px',
    fontSize: 12,
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflowWrap: 'anywhere' as const,
  } as const,

  smallMutedText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 1.4,
    overflowWrap: 'anywhere' as const,
  } as const,

  sectionTitle: {
    fontSize: 17,
    fontWeight: 760,
    marginBottom: 6,
    color: '#0f172a',
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
    marginBottom: 5,
    background: 'rgba(255, 255, 255, 0.72)',
    border: '1px solid rgba(219, 234, 254, 0.92)',
    borderRadius: 11,
    padding: 5,
    boxShadow: '0 8px 22px rgba(15,23,42,0.04)',
    maxWidth: '100%',
    boxSizing: 'border-box',
  } as const,

  l1Header: {
    background: 'linear-gradient(145deg, rgba(239,246,255,0.98), rgba(226,239,255,0.84))',
    border: '1px solid rgba(147,197,253,0.46)',
    borderRadius: 9,
    padding: '4px 7px',
    fontWeight: 560,
    fontSize: 13,
    marginBottom: 5,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
  } as const,

  l2Wrap: {
    marginTop: 4,
    marginLeft: 'clamp(3px, 1vw, 8px)',
    minWidth: 0,
  } as const,

  l2Header: {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(248,250,252,0.82))',
    border: '1px solid rgba(203, 213, 225, 0.72)',
    borderRadius: 9,
    padding: '3px 6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap' as const,
    cursor: 'pointer',
  } as const,

  l2Left: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
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
    color: '#0f172a',
    overflowWrap: 'anywhere' as const,
  } as const,

  l2Meta: {
    fontSize: 10.5,
    color: '#64748b',
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
    marginTop: 4,
    marginLeft: 'clamp(3px, 1vw, 8px)',
    minWidth: 0,
  } as const,

  l3Header: {
    background: 'rgba(255, 255, 255, 0.86)',
    border: '1px solid rgba(226, 232, 240, 0.9)',
    borderRadius: 9,
    padding: '3px 6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap' as const,
    cursor: 'pointer',
  } as const,

  l3Name: {
    fontWeight: 540,
    fontSize: 12.5,
    color: '#0f172a',
    overflowWrap: 'anywhere' as const,
  } as const,

  dragHandle: {
    width: 26,
    minWidth: 26,
    height: 26,
    borderRadius: 9,
    border: '1px solid rgba(203,213,225,0.82)',
    background: 'linear-gradient(145deg, #ffffff, #f1f5f9)',
    color: '#64748b',
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
    gap: 6,
    flexWrap: 'wrap' as const,
    minWidth: 0,
  } as const,

  primaryButton: {
    padding: '4px 8px',
    borderRadius: 8,
    border: '1px solid rgba(37, 99, 235, 0.82)',
    background: 'linear-gradient(145deg, #3b82f6, #2563eb)',
    color: '#ffffff',
    fontWeight: 620,
    cursor: 'pointer',
    maxWidth: '100%',
    whiteSpace: 'normal' as const,
    overflowWrap: 'anywhere' as const,
  } as const,

  secondaryButton: {
    padding: '4px 8px',
    borderRadius: 8,
    border: '1px solid rgba(203, 213, 225, 0.82)',
    background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
    color: '#334155',
    fontWeight: 560,
    cursor: 'pointer',
    maxWidth: '100%',
    whiteSpace: 'normal' as const,
    overflowWrap: 'anywhere' as const,
  } as const,

  dangerButton: {
    padding: '4px 8px',
    borderRadius: 8,
    border: '1px solid #fca5a5',
    background: '#fef2f2',
    color: '#991b1b',
    fontWeight: 560,
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
    height: 34,
    padding: '0 11px',
    borderRadius: 11,
    border: '1px solid rgba(203,213,225,0.92)',
    background: '#ffffff',
    fontSize: 13,
    minWidth: 180,
    maxWidth: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  } as const,

  smallInput: {
    height: 32,
    padding: '0 10px',
    borderRadius: 10,
    border: '1px solid rgba(203,213,225,0.92)',
    background: '#ffffff',
    fontSize: 13,
    width: 120,
    maxWidth: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  } as const,

  transactionsBox: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  } as const,

  transactionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    padding: '3px 7px',
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
    gap: 2,
    minWidth: 0,
    overflowWrap: 'anywhere' as const,
  } as const,

  amountText: {
    fontWeight: 620,
    fontSize: 12.5,
  } as const,

  dateText: {
    fontSize: 11,
    color: '#64748b',
  } as const,

  emptyText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
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
    width: 48,
    minWidth: 48,
    height: 48,
    minHeight: 48,
    borderRadius: 999,
    border: 'none',
    background: 'linear-gradient(145deg, #be123c, #9f1239)',
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 18px 34px rgba(15, 23, 42, 0.20), inset 0 1px 0 rgba(255,255,255,0.24)',
    padding: 0,
    textAlign: 'center' as const,
  } as const,

  floatingIncomeButton: {
    background: 'linear-gradient(145deg, #15803d, #166534)',
  } as const,

  floatingExpenseButton: {
    background: 'linear-gradient(145deg, #be123c, #9f1239)',
  } as const,
}
