import type { CSSProperties } from 'react'

export const RESIZE_HIT_AREA = 12
export const GREEN = '#15803d'
export const RED = '#b91c1c'
export const NEUTRAL = '#111827'
export const MUTED = '#64748b'
export const SOFT_TEXT = '#6b7280'
export const SOFT_BORDER = '#e5e7eb'
export const BLUE = '#2563eb'
export const SERIES_COLORS = [RED, GREEN, BLUE, '#7c3aed', '#ea580c']
export const tileStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: 132,
  background: '#ffffff',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: SOFT_BORDER,
  borderRadius: 16,
  boxShadow: '0 8px 22px rgba(15, 23, 42, 0.06)',
  padding: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  transition: 'box-shadow 180ms ease, border-color 180ms ease',
}

export const tileHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 8,
}

export const selectStyle: CSSProperties = {
  width: '100%',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '#d1d5db',
  borderRadius: 10,
  padding: '7px 9px',
  fontSize: 13,
  fontWeight: 600,
  background: '#ffffff',
  color: NEUTRAL,
}

export const metaStyle: CSSProperties = {
  marginTop: 4,
  fontSize: 11,
  lineHeight: 1.35,
  color: '#9ca3af',
}

export const contentStyle: CSSProperties = {
  flex: 1,
  borderRadius: 12,
  background: '#f9fafb',
  padding: 12,
  color: NEUTRAL,
  overflow: 'hidden',
  minHeight: 0,
}

export const valueStyle: CSSProperties = {
  fontSize: 26,
  fontWeight: 700,
  lineHeight: 1.08,
  letterSpacing: 0,
}

export const compactValueStyle: CSSProperties = {
  ...valueStyle,
  fontSize: 22,
}

export const smallTextStyle: CSSProperties = {
  color: SOFT_TEXT,
  fontSize: 12,
  lineHeight: 1.35,
}

export const labelStyle: CSSProperties = {
  color: MUTED,
  fontSize: 11,
  lineHeight: 1.25,
}

export const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 7,
}

export const listRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: 10,
  fontSize: 13,
  lineHeight: 1.25,
}

export const metricGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
}

export const metricBoxStyle: CSSProperties = {
  border: `1px solid ${SOFT_BORDER}`,
  borderRadius: 10,
  background: '#ffffff',
  padding: 9,
  minWidth: 0,
}

export const progressTrackStyle: CSSProperties = {
  width: '100%',
  height: 7,
  borderRadius: 999,
  background: '#e5e7eb',
  overflow: 'hidden',
  marginTop: 5,
}

export const heatmapStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: 4,
}

export const controlsStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  justifyContent: 'space-between',
}

export const dragHandleStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 10,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '#d1d5db',
  background: '#f9fafb',
  color: '#374151',
  cursor: 'grab',
  touchAction: 'none',
  fontWeight: 700,
  lineHeight: 1,
}

export const resizeHintStyle: CSSProperties = {
  fontSize: 11,
  color: '#94a3b8',
}
