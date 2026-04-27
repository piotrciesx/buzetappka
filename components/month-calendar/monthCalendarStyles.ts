export const calendarPanelStyle = {
  marginBottom: 20,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: 16,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
} as const

export const calendarWeekdaysStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: 8,
  marginTop: 12,
} as const

export const calendarWeekdayStyle = {
  padding: '8px 10px',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  color: '#6b7280',
} as const

export const calendarGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: 8,
  marginTop: 8,
} as const

export const calendarDayCellStyle = {
  minHeight: 108,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 10,
  background: '#f8fafc',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
  cursor: 'pointer',
  position: 'relative' as const,
  textAlign: 'left' as const,
} as const

export const calendarExpandBadgeStyle = {
  position: 'absolute' as const,
  top: 8,
  right: 8,
  width: 18,
  height: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 11,
  fontWeight: 700,
  color: '#475569',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  background: '#ffffff',
  lineHeight: 1,
  pointerEvents: 'none' as const,
} as const

export const calendarEmptyCellStyle = {
  minHeight: 108,
  border: '1px dashed #e5e7eb',
  borderRadius: 12,
  padding: 10,
  background: '#f9fafb',
} as const

export const calendarDayNumberStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: '#111827',
} as const

export const calendarDayMetaStyle = {
  fontSize: 12,
  color: '#4b5563',
  lineHeight: 1.4,
} as const

export const calendarDayCountStyle = {
  fontSize: 12,
  color: '#6b7280',
} as const

export const overlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(15, 23, 42, 0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: 1000,
} as const

export const modalStyle = {
  width: 'min(860px, 100%)',
  maxHeight: '85vh',
  overflowY: 'auto' as const,
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid #dbeafe',
  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)',
  padding: 18,
} as const

export const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 14,
} as const

export const modalTitleStyle = {
  fontSize: 18,
  fontWeight: 700,
  color: '#111827',
  marginBottom: 4,
} as const

export const modalSubtitleStyle = {
  fontSize: 13,
  color: '#6b7280',
} as const

export const closeButtonStyle = {
  border: '1px solid #d1d5db',
  background: '#ffffff',
  borderRadius: 10,
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
} as const

export const daySummaryCardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 12,
  background: '#f8fafc',
  marginBottom: 14,
} as const

export const transactionsListStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 10,
} as const

export const transactionCardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 12,
  background: '#ffffff',
} as const

export const transactionTopRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 8,
} as const

export const transactionAmountStyle = {
  fontSize: 15,
  fontWeight: 700,
  color: '#111827',
} as const

export const transactionDescriptionStyle = {
  fontSize: 14,
  color: '#374151',
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
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  color: '#1d4ed8',
  cursor: 'pointer',
} as const

export const emptyDayStyle = {
  border: '1px dashed #d1d5db',
  borderRadius: 12,
  padding: 14,
  background: '#f9fafb',
  color: '#6b7280',
  fontSize: 14,
} as const

export const transactionActionsStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 8,
  marginTop: 10,
} as const

export const formRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap' as const,
  marginTop: 8,
} as const

export const inputStyle = {
  border: '1px solid #d1d5db',
  borderRadius: 10,
  padding: '8px 10px',
  fontSize: 14,
  minHeight: 38,
} as const

export const smallInputStyle = {
  ...inputStyle,
  width: 90,
} as const

export const wideInputStyle = {
  ...inputStyle,
  flex: 1,
  minWidth: 180,
} as const

export const descriptionFieldWrapStyle = {
  flex: 1,
  minWidth: 220,
  position: 'relative' as const,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 0,
} as const

export const suggestionsDropdownStyle = {
  position: 'absolute' as const,
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  zIndex: 20,
  background: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: 10,
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
  overflow: 'hidden' as const,
} as const

export const suggestionButtonBaseStyle = {
  width: '100%',
  textAlign: 'left' as const,
  border: 'none',
  background: '#ffffff',
  padding: '10px 12px',
  cursor: 'pointer',
  fontSize: 13,
  color: '#111827',
} as const

export const tagFieldWrapStyle = {
  marginTop: 8,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
} as const

export const tagBadgesWrapStyle = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap' as const,
} as const

export const tagBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 8px',
  borderRadius: 999,
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  color: '#1d4ed8',
  fontSize: 12,
  fontWeight: 600,
} as const

export const tagRemoveButtonStyle = {
  border: 'none',
  background: 'transparent',
  color: '#1d4ed8',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1,
  padding: 0,
} as const

export const primaryButtonStyle = {
  border: '1px solid #2563eb',
  background: '#2563eb',
  color: '#ffffff',
  borderRadius: 10,
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
} as const

export const secondaryButtonStyle = {
  border: '1px solid #d1d5db',
  background: '#ffffff',
  color: '#111827',
  borderRadius: 10,
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
} as const

export const dangerButtonStyle = {
  border: '1px solid #fecaca',
  background: '#fff1f2',
  color: '#b91c1c',
  borderRadius: 10,
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
} as const

export const heatmapBarStyle = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
  marginTop: 14,
  marginBottom: 8,
} as const

export const heatmapLegendStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
  marginBottom: 8,
  fontSize: 12,
  color: '#4b5563',
} as const

export const heatmapLegendLabelsStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  fontSize: 12,
  fontWeight: 600,
  color: '#4b5563',
} as const

export const heatmapLegendBarStyle = {
  width: '100%',
  height: 14,
  borderRadius: 999,
  border: '1px solid #d8dee8',
  background:
    'linear-gradient(90deg, rgb(204, 62, 47) 0%, rgb(239, 208, 124) 50%, rgb(44, 163, 92) 100%)',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5)',
} as const

export const heatmapSwitchRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap' as const,
  marginBottom: 8,
  fontSize: 12,
  color: '#4b5563',
} as const

export const noDaySectionStyle = {
  marginTop: 18,
  borderTop: '1px solid #e5e7eb',
  paddingTop: 16,
} as const

export const noDaySummaryStyle = {
  marginTop: 8,
  marginBottom: 12,
  padding: 12,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  background: '#f8fafc',
} as const

export const noDayHintStyle = {
  fontSize: 12,
  color: '#6b7280',
  marginTop: 6,
  lineHeight: 1.4,
} as const

export const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
  color: '#475569',
  borderRadius: 999,
  padding: '4px 8px',
  fontSize: 12,
  fontWeight: 600,
} as const

export const weekdayLabels = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'ndz']
