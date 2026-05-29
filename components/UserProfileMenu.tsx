'use client'

import { CSSProperties, useEffect, useRef, useState } from 'react'
import { uiControlPrimitives, uiOverlayPrimitives, uiSurfacePrimitives } from '../lib/uiFoundation'
import UserAvatar from './UserAvatar'

type UserProfileMenuProps = {
  userEmail: string
  displayName?: string
  avatarKey?: string | null
  onToggleSettings: () => void
  onToggleImportExport: () => void
  onExportBackupJson: () => Promise<void>
  onExportBackupCsv: () => Promise<void>
  onSignOut: () => Promise<void>
  styles: Record<string, CSSProperties>
}

const dropdownStyle: CSSProperties = {
  position: 'fixed',
  right: 0,
  top: 62,
  zIndex: uiOverlayPrimitives.profileDropdown.layer,
  width: 240,
  border: uiSurfacePrimitives.profileDropdownSurface.border,
  borderRadius: uiSurfacePrimitives.profileDropdownSurface.radius,
  background: uiSurfacePrimitives.profileDropdownSurface.background,
  boxShadow: uiSurfacePrimitives.profileDropdownSurface.shadow,
  padding: uiSurfacePrimitives.profileDropdownSurface.padding,
}

const avatarButtonStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: uiControlPrimitives.iconButton.avatar.radius,
  border: '1px solid var(--ui-color-soft-border)',
  background: 'var(--ui-color-primary-text)',
  color: 'var(--ui-color-card-background)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  cursor: uiControlPrimitives.iconButton.avatar.cursor,
}

const menuButtonStyle: CSSProperties = {
  width: '100%',
  border: 0,
  background: 'transparent',
  textAlign: 'left',
  padding: uiControlPrimitives.button.profileMenuItem.padding,
  borderRadius: uiControlPrimitives.button.profileMenuItem.radius,
  cursor: uiControlPrimitives.button.profileMenuItem.cursor,
}

export default function UserProfileMenu({
  userEmail,
  displayName,
  avatarKey,
  onToggleSettings,
  onToggleImportExport,
  onExportBackupJson,
  onExportBackupCsv,
  onSignOut,
  styles,
}: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isBackupMenuOpen, setIsBackupMenuOpen] = useState(false)
  const [isExportingBackup, setIsExportingBackup] = useState(false)
  const [statusText, setStatusText] = useState('')
  const rootRef = useRef<HTMLDivElement | null>(null)

  const profileLabel = displayName || userEmail || 'Użytkownik'

  useEffect(() => {
    const handleCloseFloatingUi = () => {
      setIsOpen(false)
      setIsBackupMenuOpen(false)
    }

    window.addEventListener('budget-close-floating-ui', handleCloseFloatingUi)

    return () => {
      window.removeEventListener('budget-close-floating-ui', handleCloseFloatingUi)
    }
  }, [])

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const showPlaceholder = () => {
    setStatusText('Funkcja w budowie.')
  }

  const runBackupExport = async (exportAction: () => Promise<void>) => {
    setIsExportingBackup(true)
    setStatusText('')

    try {
      await exportAction()
      setStatusText('Pobrano backup danych.')
      setIsBackupMenuOpen(false)
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : 'Nie udało się pobrać backupu.')
    } finally {
      setIsExportingBackup(false)
    }
  }

  return (
    <div ref={rootRef} data-budget-profile-menu="true" style={{ position: 'relative' }}>
      <button
        type="button"
        style={avatarButtonStyle}
        aria-label="Menu profilu"
        onClick={() => {
          if (!isOpen) {
            window.dispatchEvent(new CustomEvent('budget-close-floating-ui'))
          }
          setStatusText('')
          setIsOpen(!isOpen)
        }}
      >
        <UserAvatar avatarKey={avatarKey} label={profileLabel} size="md" />
      </button>

      {isOpen && (
        <div data-profile-menu-dropdown="true" style={dropdownStyle}>
          <div style={{ padding: '6px 10px 9px' }}>
            <strong>{profileLabel}</strong>
            {userEmail && <div style={styles.smallMutedText}>{userEmail}</div>}
          </div>

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
          <button type="button" style={{ ...menuButtonStyle, color: 'var(--ui-color-muted-text)' }} onClick={showPlaceholder}>
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
          <button
            type="button"
            style={menuButtonStyle}
            onClick={() => {
              setStatusText('')
              setIsBackupMenuOpen((previousValue) => !previousValue)
            }}
          >
            Backup danych
          </button>
          {isBackupMenuOpen && (
            <div style={{ padding: '0 0 6px 12px' }}>
              <button
                type="button"
                style={menuButtonStyle}
                disabled={isExportingBackup}
                onClick={() => void runBackupExport(onExportBackupJson)}
              >
                Eksport JSON (pełny backup)
              </button>
              <button
                type="button"
                style={menuButtonStyle}
                disabled={isExportingBackup}
                onClick={() => void runBackupExport(onExportBackupCsv)}
              >
                Eksport CSV (uproszczony)
              </button>
            </div>
          )}
          <button type="button" style={menuButtonStyle} onClick={() => void onSignOut()}>
            Wyloguj
          </button>

          {statusText && <div style={{ ...styles.smallMutedText, padding: '8px 10px 4px' }}>{statusText}</div>}
        </div>
      )}
    </div>
  )
}
