import { uiZIndex } from '../../lib/uiFoundation'

export const calendarPanelStyle = {
  marginBottom: 'var(--ui-spacing-xl)',
  background: 'var(--ui-color-card-background)',
  border: '1px solid var(--ui-color-divider-border)',
  borderRadius: 14,
  padding: 'var(--ui-spacing-card-padding)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
} as const

export const calendarWeekdaysStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: 'var(--ui-spacing-xs)',
  marginTop: 'var(--ui-spacing-md)',
} as const

export const calendarWeekdayStyle = {
  padding: 'var(--ui-spacing-xs) var(--ui-spacing-sm)',
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  color: 'var(--ui-color-secondary-text)',
} as const

export const calendarGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: 'var(--ui-spacing-xs)',
  marginTop: 'var(--ui-spacing-xs)',
} as const

export const calendarDayCellStyle = {
  minHeight: 70,
  border: '1px solid var(--ui-color-divider-border)',
  borderRadius: 10,
  padding: 'var(--ui-spacing-sm) var(--ui-spacing-md)',
  background: 'var(--ui-color-soft-section-background)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--ui-spacing-xs)',
  cursor: 'pointer',
  position: 'relative' as const,
  textAlign: 'left' as const,
  overflow: 'hidden' as const,
} as const

export const calendarExpandBadgeStyle = {
  position: 'absolute' as const,
  top: 6,
  right: 6,
  width: 16,
  height: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--ui-color-secondary-text)',
  border: '1px solid rgba(203, 213, 225, 0.72)',
  borderRadius: 999,
  background: 'rgba(255, 255, 255, 0.76)',
  lineHeight: 1.2,
  pointerEvents: 'none' as const,
} as const

export const calendarEmptyCellStyle = {
  minHeight: 70,
  border: '1px dashed var(--ui-color-divider-border)',
  borderRadius: 10,
  padding: 'var(--ui-spacing-md)',
  background: 'var(--ui-color-soft-section-background)',
} as const

export const calendarDayNumberStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--ui-color-primary-text)',
} as const

export const calendarDayMetaStyle = {
  fontSize: 11,
  color: 'var(--ui-color-secondary-text)',
  lineHeight: 1.2,
  minWidth: 0,
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
} as const

export const calendarDayCountStyle = {
  fontSize: 10,
  color: 'var(--ui-color-secondary-text)',
  lineHeight: 1.2,
  whiteSpace: 'nowrap' as const,
} as const

export const overlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  background: 'rgba(15, 23, 42, 0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: uiZIndex.modalBase,
} as const

export const modalStyle = {
  width: 'min(860px, 100%)',
  maxHeight: '85vh',
  overflowY: 'auto' as const,
  background: 'var(--ui-color-card-background)',
  borderRadius: 16,
  border: '1px solid var(--ui-color-light-blue-border)',
  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)',
  padding: 18,
} as const

export const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 'var(--ui-space-7)',
} as const

export const modalTitleStyle = {
  fontSize: 18,
  fontWeight: 600,
  color: 'var(--ui-color-primary-text)',
  marginBottom: 4,
} as const

export const modalSubtitleStyle = {
  fontSize: 13,
  color: 'var(--ui-color-secondary-text)',
} as const

export const closeButtonStyle = {
  border: '1px solid var(--ui-color-soft-border)',
  background: 'var(--ui-color-card-background)',
  borderRadius: 10,
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
} as const

export const daySummaryCardStyle = {
  border: '1px solid var(--ui-color-divider-border)',
  borderRadius: 12,
  padding: 'var(--ui-spacing-card-padding)',
  background: 'var(--ui-color-soft-section-background)',
  marginBottom: 14,
} as const

export const transactionsListStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--ui-space-5)',
} as const

export const transactionCardStyle = {
  border: '1px solid var(--ui-color-divider-border)',
  borderRadius: 12,
  padding: 'var(--ui-spacing-card-padding)',
  background: 'var(--ui-color-card-background)',
} as const

export const transactionTopRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--ui-spacing-card-section-gap)',
  marginBottom: 'var(--ui-spacing-md)',
} as const

export const transactionAmountStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: 'var(--ui-color-primary-text)',
} as const

export const transactionDescriptionStyle = {
  fontSize: 14,
  color: 'var(--ui-color-primary-text)',
} as const

export const transactionTagsStyle = {
  display: 'flex',
  gap: 'var(--ui-spacing-list-gap)',
  flexWrap: 'wrap' as const,
  marginTop: 'var(--ui-spacing-md)',
} as const

export const transactionTagBadgeStyle = {
  fontSize: 12,
  padding: 'var(--ui-spacing-xs) var(--ui-spacing-md)',
  borderRadius: 999,
  background: 'var(--ui-color-soft-blue)',
  border: '1px solid var(--ui-color-light-blue-border)',
  color: 'var(--ui-color-primary-blue)',
  cursor: 'pointer',
} as const

export const emptyDayStyle = {
  border: '1px dashed var(--ui-color-soft-border)',
  borderRadius: 12,
  padding: 'var(--ui-space-7)',
  background: 'var(--ui-color-soft-section-background)',
  color: 'var(--ui-color-secondary-text)',
  fontSize: 14,
} as const

export const transactionActionsStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 'var(--ui-spacing-action-gap)',
  marginTop: 'var(--ui-space-5)',
} as const

export const formRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--ui-spacing-form-field-gap)',
  flexWrap: 'wrap' as const,
  marginTop: 'var(--ui-spacing-md)',
} as const

export const inputStyle = {
  border: '1px solid var(--ui-color-soft-border)',
  borderRadius: 10,
  padding: 'var(--ui-spacing-md) var(--ui-space-5)',
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
  zIndex: uiZIndex.widgetDropdown,
  background: 'var(--ui-color-card-background)',
  border: '1px solid var(--ui-color-soft-border)',
  borderRadius: 10,
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
  overflow: 'hidden' as const,
} as const

export const suggestionButtonBaseStyle = {
  width: '100%',
  textAlign: 'left' as const,
  border: 'none',
  background: 'var(--ui-color-card-background)',
  padding: '10px 12px',
  cursor: 'pointer',
  fontSize: 13,
  color: 'var(--ui-color-primary-text)',
} as const

export const tagFieldWrapStyle = {
  marginTop: 'var(--ui-spacing-md)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--ui-spacing-form-field-gap)',
} as const

export const tagBadgesWrapStyle = {
  display: 'flex',
  gap: 'var(--ui-spacing-list-gap)',
  flexWrap: 'wrap' as const,
} as const

export const tagBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--ui-spacing-action-gap)',
  padding: 'var(--ui-spacing-xs) var(--ui-spacing-md)',
  borderRadius: 999,
  background: 'var(--ui-color-soft-blue)',
  border: '1px solid var(--ui-color-light-blue-border)',
  color: 'var(--ui-color-primary-blue)',
  fontSize: 12,
  fontWeight: 600,
} as const

export const tagRemoveButtonStyle = {
  border: 'none',
  background: 'transparent',
  color: 'var(--ui-color-primary-blue)',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1.2,
  padding: 0,
} as const

export const primaryButtonStyle = {
  minHeight: 'var(--ui-button-height-standard)',
  border: '1px solid var(--ui-button-border-strong)',
  background: 'var(--ui-button-bg)',
  color: 'var(--ui-button-text-strong)',
  borderRadius: 'var(--ui-button-radius)',
  padding: 'var(--ui-button-padding-standard)',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
} as const

export const secondaryButtonStyle = {
  minHeight: 'var(--ui-button-height-utility)',
  border: '1px solid var(--ui-button-border)',
  background: 'var(--ui-button-bg)',
  color: 'var(--ui-button-text)',
  borderRadius: 'var(--ui-button-radius)',
  padding: 'var(--ui-button-padding-utility)',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 560,
} as const

export const dangerButtonStyle = {
  minHeight: 'var(--ui-button-height-utility)',
  border: '1px solid var(--ui-button-border)',
  background: 'var(--ui-button-bg)',
  color: 'var(--ui-color-expense)',
  borderRadius: 'var(--ui-button-radius)',
  padding: 'var(--ui-button-padding-utility)',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 560,
} as const

export const heatmapBarStyle = {
  display: 'flex',
  gap: 'var(--ui-spacing-action-gap)',
  flexWrap: 'wrap' as const,
  marginTop: 'var(--ui-space-7)',
  marginBottom: 'var(--ui-spacing-md)',
} as const

export const heatmapLegendStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--ui-spacing-card-section-gap)',
  marginBottom: 'var(--ui-spacing-md)',
  fontSize: 12,
  color: 'var(--ui-color-secondary-text)',
} as const

export const heatmapLegendLabelsStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--ui-spacing-card-section-gap)',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--ui-color-secondary-text)',
} as const

export const heatmapLegendBarStyle = {
  width: '100%',
  height: 10,
  borderRadius: 999,
  border: '1px solid var(--ui-color-soft-border)',
  background:
    'linear-gradient(90deg, rgb(248, 187, 176) 0%, rgb(252, 235, 174) 50%, rgb(170, 221, 188) 100%)',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.65)',
} as const

export const heatmapSwitchRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--ui-spacing-form-field-gap)',
  flexWrap: 'wrap' as const,
  marginBottom: 'var(--ui-spacing-md)',
  fontSize: 12,
  color: 'var(--ui-color-secondary-text)',
} as const

export const noDaySectionStyle = {
  marginTop: 'var(--ui-space-9)',
  borderTop: '1px solid var(--ui-color-divider-border)',
  paddingTop: 'var(--ui-spacing-xl)',
} as const

export const noDaySummaryStyle = {
  marginTop: 'var(--ui-spacing-md)',
  marginBottom: 'var(--ui-spacing-lg)',
  padding: 'var(--ui-spacing-card-padding)',
  border: '1px solid var(--ui-color-divider-border)',
  borderRadius: 12,
  background: 'var(--ui-color-soft-section-background)',
} as const

export const noDayHintStyle = {
  fontSize: 12,
  color: 'var(--ui-color-secondary-text)',
  marginTop: 'var(--ui-spacing-sm)',
  lineHeight: 1.4,
} as const

export const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--ui-spacing-list-gap)',
  border: '1px solid var(--ui-color-soft-border)',
  background: 'var(--ui-color-soft-section-background)',
  color: 'var(--ui-color-secondary-text)',
  borderRadius: 999,
  padding: 'var(--ui-spacing-xs) var(--ui-spacing-md)',
  fontSize: 12,
  fontWeight: 600,
} as const

export const weekdayLabels = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'ndz']
