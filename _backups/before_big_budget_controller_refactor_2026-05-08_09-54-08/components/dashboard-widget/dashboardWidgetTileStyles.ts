import type { CSSProperties } from 'react'

export const GREEN = '#15803d'
export const RED = '#be123c'
export const NEUTRAL = '#111827'
export const MUTED = '#64748b'
export const SOFT_TEXT = '#6b7280'
export const SOFT_BORDER = 'rgba(148, 163, 184, 0.24)'
export const BLUE = '#2563eb'
export const SERIES_COLORS = [GREEN, RED, BLUE, '#6d28d9', '#0f766e', '#c2410c', '#7e22ce']

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
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.88), rgba(248,250,252,0.70))',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(203, 213, 225, 0.58)',
  borderRadius: 16,
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.92), 0 10px 24px rgba(15,23,42,0.065)',
  padding: 12,
  transition: 'box-shadow 180ms ease, border-color 180ms ease, transform 180ms ease, background 180ms ease',
  backdropFilter: 'blur(30px) saturate(1.28)',
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
  borderColor: '#d1d5db',
  borderRadius: 11,
  padding: '6px 8px',
  fontSize: 12,
  fontWeight: 720,
  background: '#ffffff',
  color: NEUTRAL,
}

export const tileTitleStyle: CSSProperties = {
  color: NEUTRAL,
  fontSize: 13,
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
  color: '#64748b',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

export const contentStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  borderRadius: 14,
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.20), rgba(255,255,255,0.04))',
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
  borderRadius: 14,
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.70), rgba(255,255,255,0.34))',
  padding: 7,
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.82), 0 6px 14px rgba(15,23,42,0.05)',
  backdropFilter: 'blur(18px) saturate(1.18)',
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
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.72)',
  padding: 7,
  minWidth: 0,
}

export const progressTrackStyle: CSSProperties = {
  width: '100%',
  height: 6,
  borderRadius: 999,
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
  borderRadius: 11,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(148,163,184,0.32)',
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(241,245,249,0.66))',
  color: '#374151',
  cursor: 'grab',
  touchAction: 'none',
  fontWeight: 600,
  lineHeight: 1.2,
  boxShadow:
    'inset 1px 1px 0 rgba(255,255,255,0.92), 0 6px 14px rgba(15,23,42,0.08)',
}

export const iconButtonStyle: CSSProperties = {
  ...dragHandleStyle,
  cursor: 'pointer',
  fontSize: 13,
}
