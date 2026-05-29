import { uiZIndex } from '../../lib/uiFoundation'

export const inlineDescriptionFieldWrapStyle = {
  flex: 1,
  minWidth: 220,
  position: 'relative' as const,
} as const

export const suggestionsDropdownStyle = {
  position: 'absolute' as const,
  top: 'calc(100% + 6px)',
  left: 0,
  right: 0,
  zIndex: uiZIndex.categoryAutocomplete,
  background: 'var(--ui-color-card-background)',
  border: '1px solid var(--ui-color-soft-border)',
  borderRadius: 12,
  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
  overflow: 'hidden',
} as const

export const suggestionButtonStyle = {
  width: '100%',
  textAlign: 'left' as const,
  background: 'var(--ui-color-card-background)',
  border: 'none',
  borderBottom: '1px solid var(--ui-color-soft-section-background)',
  padding: '10px 12px',
  cursor: 'pointer',
  fontSize: 14,
  color: 'var(--ui-color-primary-text)',
} as const

export const activeSuggestionButtonStyle = {
  ...suggestionButtonStyle,
  background: 'var(--ui-color-soft-blue)',
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
  background: 'var(--ui-color-soft-blue)',
  border: '1px solid var(--ui-color-light-blue-border)',
  color: 'var(--ui-color-primary-blue)',
  fontSize: 12,
  fontWeight: 600,
} as const

export const clickableTagBadgeStyle = {
  ...tagBadgeStyle,
  cursor: 'pointer',
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

export const compactPrimaryButtonStyle = {
  padding: '6px 10px',
  fontSize: 13,
  minHeight: 32,
} as const

export const compactSecondaryButtonStyle = {
  padding: '6px 10px',
  fontSize: 13,
  minHeight: 32,
} as const
