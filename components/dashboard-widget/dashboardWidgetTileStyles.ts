import type { CSSProperties } from 'react'

export const GREEN = 'var(--ui-color-income)'
export const RED = 'var(--ui-color-expense)'
export const NEUTRAL = 'var(--ui-color-primary-text)'
export const MUTED = 'var(--ui-color-secondary-text)'
export const SOFT_TEXT = 'var(--ui-color-secondary-text)'
export const SOFT_BORDER = 'rgba(148, 163, 184, 0.24)'
export const BLUE = 'var(--ui-color-primary-blue)'
export const SERIES_COLORS = [GREEN, RED, BLUE, 'var(--ui-color-primary-navy)', 'var(--ui-color-income)', 'var(--ui-color-warning)', 'var(--ui-color-primary-navy)']

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
  borderColor: 'var(--ui-color-border)',
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
  borderColor: 'var(--ui-color-control-border)',
  borderRadius: 'var(--ui-input-radius)',
  padding: '6px 8px',
  fontSize: 12,
  fontWeight: 720,
  background: 'var(--ui-color-card-background)',
  color: 'var(--ui-color-control-text)',
}

export const tileTitleStyle: CSSProperties = {
  color: 'var(--ui-color-text)',
  fontSize: 'var(--ui-font-size-body-sm)',
  fontWeight: 760,
  lineHeight: 1.2,
  letterSpacing: 0,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  overflowWrap: 'anywhere',
}

export const metaStyle: CSSProperties = {
  marginTop: 4,
  fontSize: 10,
  lineHeight: 1.25,
  color: 'var(--ui-color-text-muted)',
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
  border: `1px solid rgba(255,255,255,0.62)`,
  borderRadius: 'var(--ui-radius-lg)',
  background: 'rgba(255, 255, 255, 0.72)',
  padding: 'var(--ui-space-4)',
  boxShadow: 'none',
  backdropFilter: 'none',
}

export const valueStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 780,
  lineHeight: 1.2,
  letterSpacing: 0,
}

export const compactValueStyle: CSSProperties = {
  ...valueStyle,
  fontSize: 18,
}

export const smallTextStyle: CSSProperties = {
  color: SOFT_TEXT,
  fontSize: 11.5,
  lineHeight: 1.35,
}

export const labelStyle: CSSProperties = {
  color: MUTED,
  fontSize: 10.5,
  lineHeight: 1.25,
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
  fontSize: 12,
  lineHeight: 1.25,
}

export const metricGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 6,
}

export const metricBoxStyle: CSSProperties = {
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 'var(--ui-radius-md)',
  background: 'rgba(255, 255, 255, 0.72)',
  padding: 'var(--ui-space-4)',
  minWidth: 0,
}

export const progressTrackStyle: CSSProperties = {
  width: '100%',
  height: 6,
  borderRadius: 'var(--ui-radius-pill)',
  background: 'rgba(203, 213, 225, 0.72)',
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
  borderColor: 'rgba(148,163,184,0.32)',
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(241,245,249,0.66))',
  color: 'var(--ui-color-primary-text)',
  cursor: 'grab',
  touchAction: 'none',
  fontWeight: 600,
  lineHeight: 1.2,
  boxShadow:
    'inset 1px 1px 0 rgba(255,255,255,0.92), 0 6px 14px var(--ui-shadow-medium-color)',
}

export const iconButtonStyle: CSSProperties = {
  ...dragHandleStyle,
  cursor: 'pointer',
  fontSize: 13,
}
