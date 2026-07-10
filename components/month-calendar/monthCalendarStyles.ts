import { uiControlPrimitives, uiTypographyTokens, uiZIndex } from '../../lib/uiFoundation'

export const calendarPanelStyle = {
  marginBottom: 'var(--ui-space-6)',
  background: 'transparent',
  border: 0,
  borderRadius: 8,
  padding: 0,
  boxShadow: 'none',
} as const

export const calendarWeekdaysStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: 'var(--ui-spacing-xs)',
  marginTop: 'var(--ui-spacing-md)',
} as const

export const calendarWeekdayStyle = {
  padding: 'var(--ui-spacing-xs) var(--ui-spacing-sm)',
  fontSize: uiTypographyTokens.role.widgetMeta,
  fontWeight: uiTypographyTokens.weight.semibold,
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
  minHeight: 68,
  border: '1px solid rgba(20, 84, 212, 0.06)',
  borderRadius: 6,
  padding: '7px 8px',
  background: 'rgba(255, 255, 255, 0.68)',
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
  width: 14,
  height: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: uiTypographyTokens.role.widgetMeta,
  fontWeight: uiTypographyTokens.weight.semibold,
  color: 'var(--ui-color-secondary-text)',
  border: '1px solid rgba(203, 213, 225, 0.44)',
  borderRadius: 999,
  background: 'rgba(255, 255, 255, 0.54)',
  lineHeight: uiTypographyTokens.lineHeight.compact,
  pointerEvents: 'none' as const,
} as const

export const calendarEmptyCellStyle = {
  minHeight: 68,
  border: '1px dashed rgba(20, 84, 212, 0.06)',
  borderRadius: 6,
  padding: 'var(--ui-spacing-md)',
  background: 'rgba(248, 250, 252, 0.56)',
} as const

export const calendarDayNumberStyle = {
  fontSize: uiTypographyTokens.role.label,
  fontWeight: uiTypographyTokens.weight.bold,
  color: 'var(--ui-color-primary-text)',
} as const

export const calendarDayMetaStyle = {
  fontSize: uiTypographyTokens.role.widgetMeta,
  color: 'var(--ui-color-secondary-text)',
  lineHeight: uiTypographyTokens.lineHeight.compact,
  minWidth: 0,
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
} as const

export const calendarDayCountStyle = {
  fontSize: uiTypographyTokens.role.widgetMeta,
  color: 'var(--ui-color-secondary-text)',
  lineHeight: uiTypographyTokens.lineHeight.compact,
  whiteSpace: 'nowrap' as const,
} as const

export const overlayStyle = {
  position: 'fixed' as const,
  inset: 0,
  background: 'var(--ui-overlay-backdrop)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--ui-overlay-modal-padding)',
  zIndex: uiZIndex.modalBase,
} as const

export const modalStyle = {
  width: '100%',
  maxWidth: 'var(--ui-modal-max-width-xl)',
  maxHeight: 'var(--ui-modal-max-height-xl)',
  overflowY: 'auto' as const,
  background: 'var(--ui-surface-modal)',
  borderRadius: 'var(--ui-modal-radius)',
  border: 'var(--ui-frame-border)',
  boxShadow: 'var(--ui-shadow-modal), var(--ui-frame-ring)',
  padding: 'var(--ui-surface-modal-padding)',
} as const

export const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 'var(--ui-space-7)',
} as const

export const modalTitleStyle = {
  fontSize: uiTypographyTokens.hierarchy.t2,
  fontWeight: uiTypographyTokens.weight.semibold,
  color: 'var(--ui-color-primary-text)',
  marginBottom: 4,
} as const

export const modalSubtitleStyle = {
  fontSize: uiTypographyTokens.role.helper,
  color: 'var(--ui-color-secondary-text)',
} as const

export const closeButtonStyle = {
  minHeight: uiControlPrimitives.button.utility.minHeight,
  border: uiControlPrimitives.button.utility.border,
  background: uiControlPrimitives.button.utility.background,
  borderRadius: uiControlPrimitives.button.utility.radius,
  padding: uiControlPrimitives.button.utility.padding,
  cursor: uiControlPrimitives.button.utility.cursor,
  fontSize: uiTypographyTokens.role.label,
  fontWeight: uiControlPrimitives.button.utility.fontWeight,
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
  gap: 0,
} as const

export const transactionCardStyle = {
  border: 0,
  borderBottom: '1px solid var(--ui-border-divider)',
  borderRadius: 0,
  padding: '9px 0',
  background: 'transparent',
} as const

export const transactionTopRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--ui-spacing-card-section-gap)',
  marginBottom: 4,
} as const

export const transactionAmountStyle = {
  fontSize: uiTypographyTokens.role.label,
  fontWeight: uiTypographyTokens.weight.semibold,
  color: 'var(--ui-color-primary-text)',
} as const

export const transactionDescriptionStyle = {
  fontSize: uiTypographyTokens.role.label,
  color: 'var(--ui-color-primary-text)',
} as const

export const transactionTagsStyle = {
  display: 'flex',
  gap: 'var(--ui-spacing-list-gap)',
  flexWrap: 'wrap' as const,
  marginTop: 'var(--ui-spacing-md)',
} as const

export const transactionTagBadgeStyle = {
  fontSize: uiTypographyTokens.role.metadata,
  padding: '3px 7px',
  borderRadius: 999,
  background: 'transparent',
  border: '1px solid var(--ui-border-soft)',
  color: 'var(--ui-color-primary-navy)',
  cursor: 'pointer',
} as const

export const emptyDayStyle = {
  border: 0,
  borderTop: '1px solid var(--ui-border-divider)',
  borderRadius: 0,
  padding: '12px 0',
  background: 'transparent',
  color: 'var(--ui-color-secondary-text)',
  fontSize: uiTypographyTokens.hierarchy.t3,
} as const

export const transactionActionsStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 'var(--ui-spacing-action-gap)',
  marginTop: 'var(--ui-space-3)',
} as const

export const formRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--ui-spacing-form-field-gap)',
  flexWrap: 'wrap' as const,
  marginTop: 'var(--ui-spacing-md)',
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
  fontSize: uiTypographyTokens.role.label,
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
  background: 'var(--ui-surface-hover)',
  border: '1px solid var(--ui-border-divider)',
  color: 'var(--ui-color-primary-navy)',
  fontSize: uiTypographyTokens.role.metadata,
  fontWeight: uiTypographyTokens.weight.semibold,
} as const

export const tagRemoveButtonStyle = {
  width: uiControlPrimitives.button.icon.width,
  minWidth: uiControlPrimitives.button.icon.minWidth,
  height: uiControlPrimitives.button.icon.height,
  minHeight: uiControlPrimitives.button.icon.minHeight,
  border: uiControlPrimitives.button.icon.border,
  borderRadius: uiControlPrimitives.button.icon.radius,
  background: uiControlPrimitives.button.icon.background,
  color: uiControlPrimitives.button.icon.color,
  cursor: uiControlPrimitives.button.icon.cursor,
  fontSize: uiTypographyTokens.hierarchy.t3,
  lineHeight: uiTypographyTokens.lineHeight.compact,
  padding: uiControlPrimitives.button.icon.padding,
} as const

export const primaryButtonStyle = {
  minHeight: uiControlPrimitives.button.standard.minHeight,
  border: uiControlPrimitives.button.standard.border,
  background: uiControlPrimitives.button.standard.background,
  color: uiControlPrimitives.button.standard.color,
  borderRadius: uiControlPrimitives.button.standard.radius,
  padding: uiControlPrimitives.button.standard.padding,
  cursor: uiControlPrimitives.button.standard.cursor,
  fontSize: uiTypographyTokens.role.label,
  fontWeight: uiControlPrimitives.button.standard.fontWeight,
} as const

export const secondaryButtonStyle = {
  minHeight: uiControlPrimitives.button.utility.minHeight,
  border: uiControlPrimitives.button.utility.border,
  background: uiControlPrimitives.button.utility.background,
  color: uiControlPrimitives.button.utility.color,
  borderRadius: uiControlPrimitives.button.utility.radius,
  padding: uiControlPrimitives.button.utility.padding,
  cursor: uiControlPrimitives.button.utility.cursor,
  fontSize: uiTypographyTokens.role.label,
  fontWeight: uiControlPrimitives.button.utility.fontWeight,
} as const

export const dangerButtonStyle = {
  minHeight: uiControlPrimitives.button.utility.minHeight,
  border: uiControlPrimitives.button.utility.border,
  background: uiControlPrimitives.button.utility.background,
  color: 'var(--ui-button-tone-danger-text)',
  borderRadius: uiControlPrimitives.button.utility.radius,
  padding: uiControlPrimitives.button.utility.padding,
  cursor: uiControlPrimitives.button.utility.cursor,
  fontSize: uiTypographyTokens.role.label,
  fontWeight: uiControlPrimitives.button.utility.fontWeight,
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
  fontSize: uiTypographyTokens.role.metadata,
  color: 'var(--ui-color-secondary-text)',
} as const

export const heatmapLegendLabelsStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--ui-spacing-card-section-gap)',
  fontSize: uiTypographyTokens.role.metadata,
  fontWeight: uiTypographyTokens.weight.semibold,
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
  fontSize: uiTypographyTokens.role.metadata,
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
  fontSize: uiTypographyTokens.role.helper,
  color: 'var(--ui-color-secondary-text)',
  marginTop: 'var(--ui-spacing-sm)',
  lineHeight: uiTypographyTokens.lineHeight.body,
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
  fontSize: uiTypographyTokens.role.metadata,
  fontWeight: uiTypographyTokens.weight.semibold,
} as const

export const weekdayLabels = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'ndz']
