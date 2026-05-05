'use client'

import { CSSProperties, useEffect, useRef, useState } from 'react'

type UserProfileMenuProps = {
  userEmail: string
  onToggleSettings: () => void
  onToggleImportExport: () => void
  onSignOut: () => Promise<void>
  styles: Record<string, CSSProperties>
}

const dropdownStyle: CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 'calc(100% + 8px)',
  zIndex: 30,
  width: 240,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  background: '#ffffff',
  boxShadow: '0 16px 36px rgba(15, 23, 42, 0.16)',
  padding: 8,
}

const avatarButtonStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: '1px solid #d1d5db',
  background: '#111827',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  cursor: 'pointer',
}

const menuButtonStyle: CSSProperties = {
  width: '100%',
  border: 0,
  background: 'transparent',
  textAlign: 'left',
  padding: '9px 10px',
  borderRadius: 6,
  cursor: 'pointer',
}

export default function UserProfileMenu({
  userEmail,
  onToggleSettings,
  onToggleImportExport,
  onSignOut,
  styles,
}: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [statusText, setStatusText] = useState('')
  const rootRef = useRef<HTMLDivElement | null>(null)

  const avatarLetter = (userEmail.trim()[0] || 'P').toUpperCase()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null

      if (target && rootRef.current?.contains(target)) {
        return
      }

      setIsOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isOpen])

  const showPlaceholder = () => {
    setStatusText('Funkcja w budowie.')
  }

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        style={avatarButtonStyle}
        aria-label="Menu profilu"
        onClick={() => {
          setStatusText('')
          setIsOpen((previousValue) => !previousValue)
        }}
      >
        {avatarLetter}
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          {userEmail && (
            <div style={{ ...styles.smallMutedText, padding: '6px 10px 9px' }}>{userEmail}</div>
          )}

          <button type="button" style={menuButtonStyle} onClick={showPlaceholder}>
            Profil
          </button>
          <button
            type="button"
            style={menuButtonStyle}
            onClick={() => {
              setStatusText('')
              onToggleSettings()
            }}
          >
            Ustawienia
          </button>
          <button type="button" style={{ ...menuButtonStyle, color: '#9ca3af' }} onClick={showPlaceholder}>
            Tryb nocny / Tryb dzienny
          </button>
          <button
            type="button"
            style={menuButtonStyle}
            onClick={() => {
              setStatusText('')
              onToggleImportExport()
            }}
          >
            Import / eksport
          </button>
          <button type="button" style={menuButtonStyle} onClick={() => void onSignOut()}>
            Wyloguj
          </button>

          {statusText && <div style={{ ...styles.smallMutedText, padding: '8px 10px 4px' }}>{statusText}</div>}
        </div>
      )}
    </div>
  )
}
