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
  marginTop: 8,
  display: 'flex',
  gap: 6,
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
  marginTop: 8,
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap' as const,
} as const

export const shortcutListStyle = {
  marginTop: 8,
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap' as const,
} as const

export const shortcutButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  minWidth: 0,
  maxWidth: '100%',
  minHeight: 32,
  padding: '6px 10px',
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
  gap: 8,
  marginTop: 'var(--ui-space-6)',
  fontSize: 'var(--ui-font-size-body)',
  fontWeight: 600,
  color: 'var(--ui-color-control-text)',
} as const

export const dateFieldStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
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
  gap: 4,
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
  borderBottom: '1px solid #f1f5f9',
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
  color: '#1d4ed8',
  letterSpacing: 0.3,
  textTransform: 'uppercase' as const,
  marginBottom: 4,
} as const

export const finalCategoryInfoValueStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#111827',
} as const

export const tagInputWrapStyle = {
  marginTop: 'var(--ui-space-5)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--ui-space-4)',
} as const

export const tagBadgesWrapStyle = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
} as const

export const tagBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: uiControlPrimitives.tag.default.padding,
  borderRadius: uiControlPrimitives.tag.default.radius,
  border: '1px solid #bfdbfe',
  background: 'rgba(239, 246, 255, 0.92)',
  color: '#1d4ed8',
  fontSize: 'var(--ui-font-size-body-sm)',
  fontWeight: 600,
} as const

export const tagRemoveButtonStyle = {
  border: 'none',
  background: 'transparent',
  color: '#1d4ed8',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1.2,
  padding: 0,
} as const
