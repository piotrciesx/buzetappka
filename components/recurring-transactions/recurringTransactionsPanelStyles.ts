import { CSSProperties } from 'react'
import { uiSurfacePrimitives, uiTypographyTokens } from '../../lib/uiFoundation'

export const panelStyle: CSSProperties = {
  display: 'grid',
  gap: 14,
  marginBottom: 20,
  border: 0,
  borderRadius: 0,
  padding: 0,
  background: 'transparent',
}

export const introRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
}

export const mutedTextStyle: CSSProperties = {
  margin: 0,
  color: 'var(--ui-text-secondary)',
  fontSize: uiTypographyTokens.role.helper,
  lineHeight: uiTypographyTokens.lineHeight.body,
}

export const lightButtonStyle: CSSProperties = {
  minHeight: 28,
  borderRadius: 'var(--ui-radius-pill)',
  padding: '0 10px',
  fontSize: uiTypographyTokens.role.widgetMeta,
  fontWeight: uiTypographyTokens.weight.semibold,
  boxShadow: 'none',
}

export const formStyle: CSSProperties = {
  display: 'grid',
  gap: 12,
  padding: 12,
  border: uiSurfacePrimitives.surfaceCard.border,
  borderRadius: uiSurfacePrimitives.surfaceCard.radius,
  background: uiSurfacePrimitives.surfaceCard.background,
}

export const formGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 10,
  alignItems: 'end',
}

export const fieldStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 5,
  color: 'var(--ui-text-secondary)',
  fontSize: uiTypographyTokens.role.metadata,
  fontWeight: uiTypographyTokens.weight.semibold,
}

export const inlineCheckStyle: CSSProperties = {
  minHeight: 34,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: 'var(--ui-text-secondary)',
  fontSize: uiTypographyTokens.role.metadata,
  fontWeight: uiTypographyTokens.weight.medium,
}

export const sectionTitleStyle: CSSProperties = {
  color: 'var(--ui-text-primary)',
  fontSize: uiTypographyTokens.role.label,
  fontWeight: uiTypographyTokens.weight.bold,
}

export const listStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
}

export const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
  padding: 10,
  border: uiSurfacePrimitives.surfaceCard.border,
  borderRadius: uiSurfacePrimitives.surfaceCard.radius,
  background: uiSurfacePrimitives.surfaceCard.background,
}

export const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  flexWrap: 'wrap',
}

export const cardNameStyle: CSSProperties = {
  color: 'var(--ui-text-primary)',
  fontSize: uiTypographyTokens.role.label,
  fontWeight: uiTypographyTokens.weight.bold,
}

export const metaGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
  gap: 6,
}

export const infoPillStyle: CSSProperties = {
  padding: '6px 8px',
  border: '1px solid var(--ui-border-divider)',
  borderRadius: 'var(--ui-radius-sm)',
  background: 'var(--ui-surface-soft)',
  color: 'var(--ui-text-secondary)',
  fontSize: uiTypographyTokens.role.widgetMeta,
  lineHeight: uiTypographyTokens.lineHeight.body,
}

export const progressOuterStyle: CSSProperties = {
  height: 8,
  overflow: 'hidden',
  borderRadius: 'var(--ui-radius-pill)',
  background: 'var(--ui-border-divider)',
}

export const progressInnerStyle: CSSProperties = {
  height: '100%',
  borderRadius: 'var(--ui-radius-pill)',
  background: 'var(--ui-chart-positive)',
}

export const warningStyle: CSSProperties = {
  padding: '8px 10px',
  border: '1px solid var(--ui-status-warning)',
  borderRadius: 'var(--ui-radius-md)',
  background: 'var(--ui-status-warning-soft)',
  color: 'var(--ui-status-warning)',
  fontSize: uiTypographyTokens.role.metadata,
}

export const responsiveStyle = `
  @media (max-width: 720px) {
    [data-recurring-form-grid="true"] {
      grid-template-columns: 1fr !important;
    }
  }
`
