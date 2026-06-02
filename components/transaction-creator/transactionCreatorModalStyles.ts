import { uiControlPrimitives, uiOverlayContracts, uiSurfacePrimitives, uiZIndex } from '../../lib/uiFoundation'

export const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: uiOverlayContracts.modal.backdrop,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--ui-overlay-modal-padding)',
  zIndex: uiZIndex.modal,
  overflowY: 'auto',
} as const

export const modalStyle = {
  width: '100%',
  maxWidth: 820,
  maxHeight: 'min(760px, calc(100dvh - 40px))',
  overflowY: 'auto' as const,
  background: uiSurfacePrimitives.modalSurface.background,
  border: uiSurfacePrimitives.modalSurface.border,
  borderRadius: uiSurfacePrimitives.modalSurface.radius,
  padding: 'var(--ui-space-8)',
  boxShadow: uiSurfacePrimitives.modalSurface.shadow,
  boxSizing: 'border-box',
} as const

export const sectionStyle = {
  marginTop: 'var(--ui-space-6)',
  paddingTop: 'var(--ui-space-6)',
  borderTop: '1px solid var(--ui-surface-border-default)',
} as const

export const treeLevel2WrapStyle = {
  marginTop: 'var(--ui-spacing-md)',
  display: 'flex',
  gap: 'var(--ui-spacing-list-gap)',
  flexWrap: 'wrap' as const,
} as const

export const treeLevel3WrapStyle = {
  marginTop: 'var(--ui-space-4)',
  padding: 'var(--ui-space-5)',
  border: uiSurfacePrimitives.infoBox.border,
  borderRadius: uiSurfacePrimitives.infoBox.radius,
  background: uiSurfacePrimitives.infoBox.background,
} as const

export const treeLevel3ButtonsStyle = {
  marginTop: 'var(--ui-spacing-md)',
  display: 'flex',
  gap: 'var(--ui-spacing-list-gap)',
  flexWrap: 'wrap' as const,
} as const

export const shortcutListStyle = {
  marginTop: 'var(--ui-spacing-md)',
  display: 'flex',
  gap: 'var(--ui-spacing-list-gap)',
  flexWrap: 'wrap' as const,
} as const

export const shortcutButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--ui-spacing-action-gap)',
  minWidth: 0,
  maxWidth: '100%',
  minHeight: uiControlPrimitives.button.utility.minHeight,
  padding: uiControlPrimitives.button.utility.padding,
  borderRadius: uiControlPrimitives.button.utility.radius,
  border: uiControlPrimitives.button.utility.border,
  background: uiControlPrimitives.button.utility.background,
  color: uiControlPrimitives.button.utility.color,
  fontWeight: uiControlPrimitives.button.utility.fontWeight,
  cursor: uiControlPrimitives.button.utility.cursor,
} as const

export const disabledLevel3WrapStyle = {
  ...treeLevel3WrapStyle,
  opacity: 0.55,
  background: 'var(--ui-surface-info)',
  borderStyle: 'dashed' as const,
} as const

export const serialToggleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--ui-spacing-form-field-gap)',
  marginTop: 'var(--ui-space-6)',
  fontSize: 'var(--ui-font-size-body)',
  fontWeight: 600,
  color: 'var(--ui-color-control-text)',
} as const

export const dateFieldStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--ui-spacing-form-field-gap)',
} as const

export const dateLabelStyle = {
  fontSize: 'var(--ui-font-size-body-sm)',
  fontWeight: 600,
  color: 'var(--ui-color-control-text)',
} as const

export const descriptionFieldWrapStyle = {
  flex: 1,
  minWidth: 220,
  maxWidth: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--ui-spacing-xs)',
} as const

export const descriptionInputWrapStyle = {
  position: 'relative' as const,
  width: '100%',
} as const

export const suggestionsDropdownStyle = {
  position: 'absolute' as const,
  top: 'calc(100% + 6px)',
  left: 0,
  right: 0,
  zIndex: uiZIndex.popover,
  background: uiSurfacePrimitives.dropdownSurface.background,
  border: uiSurfacePrimitives.dropdownSurface.border,
  borderRadius: uiSurfacePrimitives.dropdownSurface.radius,
  boxShadow: uiSurfacePrimitives.dropdownSurface.shadow,
  overflow: 'hidden',
} as const

export const suggestionButtonStyle = {
  width: '100%',
  textAlign: 'left' as const,
  background: 'var(--ui-surface-dropdown)',
  border: 'none',
  borderBottom: '1px solid var(--ui-color-soft-section-background)',
  padding: 'var(--ui-space-5) var(--ui-space-6)',
  cursor: 'pointer',
  fontSize: 'var(--ui-font-size-body)',
  color: 'var(--ui-color-control-text)',
} as const

export const activeSuggestionButtonStyle = {
  ...suggestionButtonStyle,
  background: 'rgba(239, 246, 255, 0.92)',
} as const

export const helperTextStyle = {
  fontSize: 'var(--ui-font-size-body-sm)',
  color: 'var(--ui-color-text-muted)',
  lineHeight: 1.45,
} as const

export const finalCategoryInfoStyle = {
  marginTop: 'var(--ui-space-4)',
  padding: 'var(--ui-space-5)',
  borderRadius: 'var(--ui-radius-lg)',
  border: '1px solid var(--ui-surface-border-info)',
  background: 'var(--ui-surface-info)',
} as const

export const finalCategoryInfoTitleStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--ui-color-primary-blue)',
  letterSpacing: 0.3,
  textTransform: 'uppercase' as const,
  marginBottom: 'var(--ui-spacing-xs)',
} as const

export const finalCategoryInfoValueStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--ui-color-primary-text)',
} as const

export const tagInputWrapStyle = {
  marginTop: 'var(--ui-space-5)',
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
  padding: uiControlPrimitives.tag.default.padding,
  borderRadius: uiControlPrimitives.tag.default.radius,
  border: '1px solid var(--ui-color-light-blue-border)',
  background: 'rgba(239, 246, 255, 0.92)',
  color: 'var(--ui-color-primary-blue)',
  fontSize: 'var(--ui-font-size-body-sm)',
  fontWeight: 600,
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
  fontSize: 14,
  lineHeight: 1.2,
  padding: uiControlPrimitives.button.icon.padding,
} as const
