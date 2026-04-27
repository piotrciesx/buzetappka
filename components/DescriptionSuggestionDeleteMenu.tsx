'use client'

type Props = {
  isOpen: boolean
  x: number
  y: number
  onConfirm: () => void
  onCancel: () => void
}

const backdropStyle = {
  position: 'fixed' as const,
  inset: 0,
  zIndex: 1200,
}

const menuStyle = {
  position: 'fixed' as const,
  width: 180,
  background: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: 12,
  boxShadow: '0 16px 32px rgba(15, 23, 42, 0.18)',
  overflow: 'hidden' as const,
  zIndex: 1201,
}

const buttonBaseStyle = {
  width: '100%',
  border: 'none',
  background: '#ffffff',
  padding: '10px 12px',
  textAlign: 'left' as const,
  cursor: 'pointer',
  fontSize: 14,
}

export default function DescriptionSuggestionDeleteMenu(props: Props) {
  const { isOpen, x, y, onConfirm, onCancel } = props

  if (!isOpen) {
    return null
  }

  const left = Math.max(12, Math.min(x, window.innerWidth - 192))
  const top = Math.max(12, Math.min(y, window.innerHeight - 110))

  return (
    <>
      <div
        style={backdropStyle}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onCancel()
        }}
      />
      <div
        style={{ ...menuStyle, left, top }}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          style={{
            ...buttonBaseStyle,
            color: '#b91c1c',
            borderBottom: '1px solid #e5e7eb',
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            onConfirm()
          }}
        >
          Usuń z historii
        </button>
        <button
          type="button"
          style={buttonBaseStyle}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            onCancel()
          }}
        >
          Anuluj
        </button>
      </div>
    </>
  )
}
