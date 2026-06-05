import { CSSProperties } from 'react'
import { uiSurfacePrimitives, uiTypographyTokens, uiZIndex } from '../../lib/uiFoundation'

export const containerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

export const bellRowStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  justifyContent: 'flex-end',
}

export const countStyle: CSSProperties = {
  marginLeft: 6,
  minWidth: 20,
  height: 20,
  borderRadius: 999,
  background: 'var(--ui-financial-expense)',
  color: 'var(--ui-text-inverse)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: uiTypographyTokens.role.metadata,
  fontWeight: uiTypographyTokens.weight.semibold,
}

export const panelStyle: CSSProperties = {
  border: uiSurfacePrimitives.surfaceCard.border,
  borderRadius: uiSurfacePrimitives.surfaceCard.radius,
  background: uiSurfacePrimitives.surfaceCard.background,
  padding: 12,
}

export const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 10,
  alignItems: 'end',
}

export const itemStyle: CSSProperties = {
  padding: '10px 0',
  borderTop: '1px solid var(--ui-row-divider)',
}

export const cardStyle: CSSProperties = {
  border: uiSurfacePrimitives.surfaceCard.border,
  borderRadius: uiSurfacePrimitives.surfaceCard.radius,
  padding: 12,
  background: 'var(--ui-surface-soft)',
}

export const fieldLabelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  fontSize: uiTypographyTokens.role.label,
  fontWeight: uiTypographyTokens.weight.semibold,
  color: 'var(--ui-text-primary)',
}

export const invalidInputStyle: CSSProperties = {
  border: '1px solid var(--ui-status-error)',
  boxShadow: 'var(--ui-control-focus-ring)',
}

export const progressOuterStyle: CSSProperties = {
  height: 8,
  borderRadius: 999,
  background: 'var(--ui-border-divider)',
  overflow: 'hidden',
}

export const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: uiZIndex.modalBase,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--ui-overlay-modal-padding)',
  background: 'var(--ui-overlay-backdrop)',
}

export const modalStyle: CSSProperties = {
  width: '100%',
  maxWidth: 'var(--ui-modal-max-width-m)',
  maxHeight: 'var(--ui-modal-max-height-m)',
  overflowY: 'auto',
  border: 'var(--ui-frame-border)',
  borderRadius: 'var(--ui-modal-radius)',
  background: 'var(--ui-surface-modal)',
  padding: 'var(--ui-surface-modal-padding)',
  boxShadow: 'var(--ui-shadow-modal), var(--ui-frame-ring)',
}

export const detailGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 8,
  marginTop: 12,
}

export const linkedTransactionRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '110px 1fr 100px 160px',
  gap: 'var(--ui-row-gap)',
  alignItems: 'center',
  minHeight: 'var(--ui-row-height-sm)',
  padding: 'var(--ui-spacing-xs) 0',
  borderTop: '1px solid var(--ui-row-divider)',
  fontSize: uiTypographyTokens.role.label,
}

export const detailSectionStyle: CSSProperties = {
  marginTop: 16,
  paddingTop: 14,
  borderTop: '1px solid var(--ui-border-divider)',
}

export const detailSectionTitleStyle: CSSProperties = {
  fontSize: uiTypographyTokens.hierarchy.t3,
  fontWeight: uiTypographyTokens.weight.semibold,
  color: 'var(--ui-text-primary)',
}
