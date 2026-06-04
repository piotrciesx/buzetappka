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

export const popoverStyle: CSSProperties = {
  position: 'fixed',
  right: 18,
  top: 82,
  width: 400,
  maxWidth: 'calc(100vw - 32px)',
  padding: 12,
  border: uiSurfacePrimitives.surfaceDropdown.border,
  borderRadius: uiSurfacePrimitives.surfaceDropdown.radius,
  background: uiSurfacePrimitives.surfaceDropdown.background,
  boxShadow: uiSurfacePrimitives.surfaceDropdown.shadow,
  zIndex: uiZIndex.mobileCritical,
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
  borderTop: '1px solid var(--ui-surface-soft)',
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
  padding: 20,
  background: 'var(--ui-overlay-backdrop-strong)',
}

export const modalStyle: CSSProperties = {
  width: 'min(760px, 100%)',
  maxHeight: '86vh',
  overflowY: 'auto',
  border: '1px solid var(--ui-border-divider)',
  borderRadius: 8,
  background: 'var(--ui-surface-card)',
  padding: 16,
  boxShadow: 'var(--ui-shadow-modal)',
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
  gap: 8,
  alignItems: 'center',
  padding: '8px 0',
  borderTop: '1px solid var(--ui-surface-soft)',
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
