'use client'

import { uiControlPrimitives, uiOverlayPrimitives, uiSurfacePrimitives } from '../lib/uiFoundation'

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
  zIndex: uiOverlayPrimitives.dropdown.layer,
}

const menuStyle = {
  position: 'fixed' as const,
  width: 180,
  background: uiSurfacePrimitives.dropdownSurface.background,
  border: uiSurfacePrimitives.dropdownSurface.border,
  borderRadius: uiSurfacePrimitives.dropdownSurface.radius,
  boxShadow: uiSurfacePrimitives.dropdownSurface.shadow,
  overflow: 'hidden' as const,
  zIndex: uiOverlayPrimitives.dropdownRaised.layer,
}

const buttonBaseStyle = {
  width: '100%',
  border: 'none',
  background: 'var(--ui-color-card-background)',
  padding: uiControlPrimitives.button.menuItem.padding,
  textAlign: 'left' as const,
  cursor: uiControlPrimitives.button.menuItem.cursor,
  fontSize: uiControlPrimitives.button.menuItem.fontSize,
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
            color: 'var(--ui-color-expense)',
            borderBottom: '1px solid var(--ui-color-divider-border)',
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
