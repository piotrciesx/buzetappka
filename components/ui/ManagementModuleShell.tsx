'use client'

import { type ReactNode, useLayoutEffect, useRef } from 'react'
import type { ManagementScreen } from './useManagementScreenStack'

type Props = {
  screen: ManagementScreen
  title: string
  canGoBack: boolean
  onBack: () => void
  onClose: () => void
  onAdd?: () => void
  addLabel?: string
  children: ReactNode
}

export default function ManagementModuleShell({
  screen,
  title,
  canGoBack,
  onBack,
  onClose,
  onAdd,
  addLabel = 'Dodaj',
  children,
}: Props) {
  const screenRef = useRef<HTMLDivElement | null>(null)
  const scrollByScreenRef = useRef(new Map<string, number>())
  const screenKey = screen.name === 'details' || screen.name === 'edit'
    ? `${screen.name}:${screen.recordId}`
    : screen.name

  useLayoutEffect(() => {
    const element = screenRef.current
    const scrollByScreen = scrollByScreenRef.current
    if (!element) return

    element.scrollTop = scrollByScreen.get(screenKey) ?? 0

    return () => {
      scrollByScreen.set(screenKey, element.scrollTop)
    }
  }, [screenKey])

  return (
    <div
      data-management-module-shell="true"
      data-management-screen={screen.name}
    >
      <header data-management-mobile-header="true">
        <div data-management-mobile-header-leading="true">
          {canGoBack && (
            <button type="button" data-management-mobile-back="true" aria-label="Wróć" onClick={onBack}>
              <span aria-hidden="true">←</span>
            </button>
          )}
          <strong>{title}</strong>
        </div>
        <div data-management-mobile-header-actions="true">
          {screen.name === 'list' && onAdd && (
            <button type="button" data-management-mobile-add="true" onClick={onAdd}>
              {addLabel}
            </button>
          )}
          <button type="button" data-management-mobile-close="true" aria-label="Zamknij moduł" onClick={onClose}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </header>
      <div ref={screenRef} data-management-mobile-screen="true">{children}</div>
    </div>
  )
}
