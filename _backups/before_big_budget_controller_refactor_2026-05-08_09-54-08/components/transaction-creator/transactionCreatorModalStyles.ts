export const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(17, 24, 39, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 1000,
  overflowY: 'auto',
} as const

export const modalStyle = {
  width: '100%',
  maxWidth: 860,
  maxHeight: '85vh',
  overflowY: 'auto' as const,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
  boxSizing: 'border-box',
} as const

export const sectionStyle = {
  marginTop: 16,
  paddingTop: 16,
  borderTop: '1px solid #e5e7eb',
} as const

export const treeLevel2WrapStyle = {
  marginTop: 12,
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
} as const

export const treeLevel3WrapStyle = {
  marginTop: 12,
  padding: 12,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  background: '#f9fafb',
} as const

export const treeLevel3ButtonsStyle = {
  marginTop: 10,
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
} as const

export const shortcutListStyle = {
  marginTop: 10,
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
} as const

export const shortcutButtonStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
  gap: 4,
  minWidth: 220,
  maxWidth: '100%',
} as const

export const disabledLevel3WrapStyle = {
  ...treeLevel3WrapStyle,
  opacity: 0.55,
  background: '#f3f4f6',
  borderStyle: 'dashed' as const,
} as const

export const serialToggleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 12,
  fontSize: 14,
  fontWeight: 600,
  color: '#374151',
} as const

export const dateFieldStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
} as const

export const dateLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
} as const

export const descriptionFieldWrapStyle = {
  flex: 1,
  minWidth: 260,
  maxWidth: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
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
  zIndex: 30,
  background: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: 12,
  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
  overflow: 'hidden',
} as const

export const suggestionButtonStyle = {
  width: '100%',
  textAlign: 'left' as const,
  background: '#ffffff',
  border: 'none',
  borderBottom: '1px solid #f1f5f9',
  padding: '10px 12px',
  cursor: 'pointer',
  fontSize: 14,
  color: '#111827',
} as const

export const activeSuggestionButtonStyle = {
  ...suggestionButtonStyle,
  background: '#eff6ff',
} as const

export const helperTextStyle = {
  fontSize: 13,
  color: '#6b7280',
  lineHeight: 1.45,
} as const

export const finalCategoryInfoStyle = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  border: '1px solid #dbeafe',
  background: '#eff6ff',
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
  marginTop: 12,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
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
  padding: '6px 10px',
  borderRadius: 999,
  border: '1px solid #bfdbfe',
  background: '#eff6ff',
  color: '#1d4ed8',
  fontSize: 13,
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
