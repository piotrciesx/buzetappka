import { CSSProperties } from 'react'

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
  color: '#64748b',
  fontSize: 12,
  lineHeight: 1.45,
}

export const lightButtonStyle: CSSProperties = {
  minHeight: 28,
  borderRadius: 999,
  padding: '0 10px',
  fontSize: 11,
  fontWeight: 620,
  boxShadow: 'none',
}

export const formStyle: CSSProperties = {
  display: 'grid',
  gap: 12,
  padding: 12,
  border: '1px solid rgba(226, 232, 240, 0.92)',
  borderRadius: 14,
  background: 'rgba(255, 255, 255, 0.68)',
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
  color: '#475569',
  fontSize: 12,
  fontWeight: 620,
}

export const inlineCheckStyle: CSSProperties = {
  minHeight: 34,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: '#475569',
  fontSize: 12,
  fontWeight: 560,
}

export const sectionTitleStyle: CSSProperties = {
  color: '#172033',
  fontSize: 13,
  fontWeight: 720,
}

export const listStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
}

export const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
  padding: 10,
  border: '1px solid rgba(226, 232, 240, 0.78)',
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.62)',
}

export const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  flexWrap: 'wrap',
}

export const cardNameStyle: CSSProperties = {
  color: '#172033',
  fontSize: 13,
  fontWeight: 700,
}

export const metaGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
  gap: 6,
}

export const infoPillStyle: CSSProperties = {
  padding: '6px 8px',
  border: '1px solid rgba(226, 232, 240, 0.74)',
  borderRadius: 9,
  background: 'rgba(248, 250, 252, 0.54)',
  color: '#475569',
  fontSize: 11,
  lineHeight: 1.35,
}

export const progressOuterStyle: CSSProperties = {
  height: 8,
  overflow: 'hidden',
  borderRadius: 999,
  background: 'rgba(226, 232, 240, 0.86)',
}

export const progressInnerStyle: CSSProperties = {
  height: '100%',
  borderRadius: 999,
  background: 'linear-gradient(90deg, #2563eb, #16a34a)',
}

export const warningStyle: CSSProperties = {
  padding: '8px 10px',
  border: '1px solid rgba(251, 191, 36, 0.5)',
  borderRadius: 12,
  background: 'rgba(255, 251, 235, 0.78)',
  color: '#92400e',
  fontSize: 12,
}

export const responsiveStyle = `
  @media (max-width: 720px) {
    [data-recurring-form-grid="true"] {
      grid-template-columns: 1fr !important;
    }
  }
`
