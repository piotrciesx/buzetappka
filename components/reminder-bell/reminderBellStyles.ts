import { CSSProperties } from 'react'

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
  background: '#dc2626',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 600,
}

export const popoverStyle: CSSProperties = {
  position: 'fixed',
  right: 18,
  top: 82,
  width: 400,
  maxWidth: 'calc(100vw - 32px)',
  padding: 12,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  background: '#ffffff',
  boxShadow: '0 16px 36px rgba(15, 23, 42, 0.16)',
  zIndex: 3200,
}

export const panelStyle: CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  background: '#ffffff',
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
  borderTop: '1px solid #f1f5f9',
}

export const cardStyle: CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 12,
  background: '#f9fafb',
}

export const fieldLabelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
}

export const invalidInputStyle: CSSProperties = {
  border: '1px solid #ef4444',
  boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.12)',
}

export const progressOuterStyle: CSSProperties = {
  height: 8,
  borderRadius: 999,
  background: '#e5e7eb',
  overflow: 'hidden',
}

export const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  background: 'rgba(17, 24, 39, 0.45)',
}

export const modalStyle: CSSProperties = {
  width: 'min(760px, 100%)',
  maxHeight: '86vh',
  overflowY: 'auto',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  background: '#ffffff',
  padding: 16,
  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
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
  borderTop: '1px solid #f1f5f9',
  fontSize: 13,
}

export const detailSectionStyle: CSSProperties = {
  marginTop: 16,
  paddingTop: 14,
  borderTop: '1px solid #e5e7eb',
}

export const detailSectionTitleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: '#111827',
}
