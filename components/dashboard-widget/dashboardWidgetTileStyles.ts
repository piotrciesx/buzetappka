import type { CSSProperties } from 'react'
import { uiTypographyTokens } from '../../lib/uiFoundation'

export const GREEN = 'var(--ui-financial-income)'
export const RED = 'var(--ui-financial-expense)'
export const NEUTRAL = 'var(--ui-text-primary)'
export const MUTED = 'var(--ui-text-secondary)'
export const SOFT_TEXT = 'var(--ui-text-secondary)'
export const SOFT_BORDER = 'var(--ui-border-soft)'
export const BLUE = 'var(--ui-chart-blue)'
export const SERIES_COLORS = [GREEN, RED, BLUE, 'var(--ui-chart-neutral)', 'var(--ui-financial-income)', 'var(--ui-status-warning)', 'var(--ui-chart-neutral)']

export const tileStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  maxWidth: '100%',
  maxHeight: '100%',
  boxSizing: 'border-box',
  overflow: 'hidden',
  isolation: 'isolate',
  background: 'var(--ui-surface-widget)',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'var(--ui-border-soft)',
  borderRadius: 'var(--ui-card-radius)',
  boxShadow: 'var(--ui-shadow-card)',
  padding: 'var(--ui-surface-card-padding)',
  transition: 'box-shadow 180ms ease, border-color 180ms ease, transform 180ms ease, background 180ms ease',
  backdropFilter: 'none',
}

export const tileHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 7,
  padding: '0 0 6px',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
}

export const selectStyle: CSSProperties = {
  width: '100%',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'var(--ui-border-active)',
  borderRadius: 'var(--ui-input-radius)',
  padding: '6px 8px',
  fontSize: uiTypographyTokens.role.metadata,
  fontWeight: uiTypographyTokens.weight.bold,
  background: 'var(--ui-surface-card)',
  color: 'var(--ui-text-primary)',
}

export const tileTitleStyle: CSSProperties = {
  color: 'var(--ui-text-primary)',
  fontSize: uiTypographyTokens.role.widgetTitle,
  fontWeight: uiTypographyTokens.weight.bold,
  lineHeight: uiTypographyTokens.lineHeight.compact,
  letterSpacing: 0,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  overflowWrap: 'anywhere',
}

export const metaStyle: CSSProperties = {
  marginTop: 4,
  fontSize: uiTypographyTokens.role.widgetMeta,
  lineHeight: uiTypographyTokens.lineHeight.compact,
  color: 'var(--ui-text-muted)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

export const contentStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: 'var(--ui-radius-lg)',
  background: 'transparent',
  padding: 0,
  color: NEUTRAL,
  overflow: 'hidden',
  minWidth: 0,
  minHeight: 0,
  maxWidth: '100%',
  maxHeight: '100%',
  boxSizing: 'border-box',
}

export const dashboardWidgetViewport: CSSProperties = {
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  maxWidth: '100%',
  maxHeight: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
}

export const dashboardWidgetContent: CSSProperties = {
  ...dashboardWidgetViewport,
  display: 'grid',
  alignContent: 'stretch',
}

export const dashboardChartBox: CSSProperties = {
  ...dashboardWidgetViewport,
  display: 'grid',
  placeItems: 'stretch',
}

export const dashboardCalendarBox: CSSProperties = {
  ...dashboardWidgetViewport,
  display: 'grid',
  placeItems: 'center',
}

export const dashboardMetricCard: CSSProperties = {
  width: '100%',
  minWidth: 0,
  minHeight: 0,
  maxWidth: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  border: `1px solid var(--ui-border-soft)`,
  borderRadius: 'var(--ui-radius-lg)',
  background: 'var(--ui-surface-card)',
  padding: 'var(--ui-space-4)',
  boxShadow: 'var(--ui-shadow-none)',
  backdropFilter: 'none',
}

export const valueStyle: CSSProperties = {
  fontSize: uiTypographyTokens.role.dashboardValue,
  fontWeight: uiTypographyTokens.weight.bold,
  lineHeight: uiTypographyTokens.lineHeight.compact,
  letterSpacing: 0,
}

export const compactValueStyle: CSSProperties = {
  ...valueStyle,
  fontSize: uiTypographyTokens.hierarchy.t2,
}

export const smallTextStyle: CSSProperties = {
  color: SOFT_TEXT,
  fontSize: uiTypographyTokens.role.widgetMeta,
  lineHeight: uiTypographyTokens.lineHeight.body,
}

export const labelStyle: CSSProperties = {
  color: MUTED,
  fontSize: uiTypographyTokens.role.widgetMeta,
  lineHeight: uiTypographyTokens.lineHeight.compact,
}

export const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
}

export const listRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: 10,
  fontSize: uiTypographyTokens.role.metadata,
  lineHeight: uiTypographyTokens.lineHeight.compact,
}

export const metricGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 6,
}

export const metricBoxStyle: CSSProperties = {
  border: `1px solid var(--ui-border-soft)`,
  borderRadius: 'var(--ui-radius-md)',
  background: 'var(--ui-surface-card)',
  padding: 'var(--ui-space-4)',
  minWidth: 0,
}

export const progressTrackStyle: CSSProperties = {
  width: '100%',
  height: 6,
  borderRadius: 'var(--ui-radius-pill)',
  background: 'var(--ui-chart-grid)',
  marginTop: 5,
}

export const heatmapStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: 3,
}

export const controlsStyle: CSSProperties = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
  justifyContent: 'space-between',
}

export const dragHandleStyle: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 'var(--ui-button-radius)',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'var(--ui-border-soft)',
  background: 'var(--ui-surface-card)',
  color: 'var(--ui-text-primary)',
  cursor: 'grab',
  touchAction: 'none',
  fontWeight: uiTypographyTokens.weight.semibold,
  lineHeight: uiTypographyTokens.lineHeight.compact,
  boxShadow: 'var(--ui-shadow-medium)',
}

export const iconButtonStyle: CSSProperties = {
  ...dragHandleStyle,
  cursor: 'pointer',
  fontSize: uiTypographyTokens.role.label,
}
