'use client'

import { type CSSProperties, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CategoryIcon from '../CategoryIcon'
import {
  APP_ICONS,
  getUiIcon,
  getUiIconSearchText,
  type UiColorKey,
  type UiIconKey,
} from '../../lib/userAppearance'
import { useScrollSelectedIconIntoView } from './useScrollSelectedIconIntoView'

type FoundationIconPickerProps = {
  value: string
  tone: UiColorKey
  isOpen: boolean
  suggestedIconKeys: readonly string[]
  fallbackLabel: string
  moreLabel?: string
  onOpenChange: (isOpen: boolean) => void
  onChange: (iconKey: UiIconKey) => void
}

export default function FoundationIconPicker({
  value,
  tone,
  isOpen,
  suggestedIconKeys,
  fallbackLabel,
  moreLabel = 'Pokaż więcej ikon',
  onOpenChange,
  onChange,
}: FoundationIconPickerProps) {
  void moreLabel
  const [search, setSearch] = useState('')
  const [menuPosition, setMenuPosition] = useState({ left: 12, top: 12 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const selectedIcon = getUiIcon(value)
  const selectedIconOptionRef = useScrollSelectedIconIntoView({
    isOpen,
    selectedKey: value,
    scrollSignal: isOpen,
  })

  const orderedIcons = useMemo(() => {
    const suggestedIcons = suggestedIconKeys
      .map((iconKey) => APP_ICONS.find((option) => option.key === iconKey))
      .filter((option): option is (typeof APP_ICONS)[number] => Boolean(option))

    return [
      ...suggestedIcons,
      ...APP_ICONS.filter((option) => !suggestedIconKeys.includes(option.key)),
    ]
  }, [suggestedIconKeys])

  const normalizedSearch = search.trim().toLocaleLowerCase('pl-PL')
  const visibleIcons = normalizedSearch
    ? orderedIcons.filter((option) => getUiIconSearchText(option).includes(normalizedSearch))
    : orderedIcons

  useLayoutEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const triggerRect = triggerRef.current?.getBoundingClientRect()
      if (!triggerRect) return

      const viewportPadding = 12
      const gap = 12
      const menuWidth = portalRef.current?.offsetWidth || 360
      const menuHeight = portalRef.current?.offsetHeight || 360
      const availableBelow = window.innerHeight - triggerRect.bottom - viewportPadding
      const availableAbove = triggerRect.top - viewportPadding
      const openBelow = availableBelow >= menuHeight || availableBelow >= availableAbove
      const top = openBelow
        ? Math.min(triggerRect.bottom + gap, window.innerHeight - menuHeight - viewportPadding)
        : Math.max(viewportPadding, triggerRect.top - menuHeight - gap)
      const left = Math.min(
        Math.max(viewportPadding, triggerRect.left),
        window.innerWidth - menuWidth - viewportPadding,
      )

      setMenuPosition({
        left: Math.max(viewportPadding, left),
        top: Math.max(viewportPadding, top),
      })
    }

    const frameId = window.requestAnimationFrame(updatePosition)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, normalizedSearch])

  const pickerMenu = (
    <div data-ui-picker-menu="true" data-layout="icons">
      <label data-ui-picker-search="true">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Szukaj ikony..."
          autoFocus
        />
      </label>
      <div data-ui-picker-menu-grid="true">
        {visibleIcons.map((option) => (
          <button
            key={option.key}
            ref={value === option.key ? selectedIconOptionRef : undefined}
            type="button"
            data-ui-icon-select-option="true"
            data-ui-tone={tone}
            data-active={value === option.key}
            aria-label={`Wybierz ikonę: ${option.label}`}
            title={option.label}
            onClick={() => {
              onChange(option.key)
              onOpenChange(false)
              setSearch('')
            }}
          >
            <span data-ui-icon-tile="true" data-ui-tone={tone}>
              <CategoryIcon iconKey={option.key} />
            </span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
      {visibleIcons.length === 0 && (
        <div data-ui-picker-empty="true">Brak ikon dla tej nazwy.</div>
      )}
    </div>
  )

  return (
    <div
      data-ui-picker-control="true"
      data-ui-picker-variant="gallery"
      data-open={isOpen ? 'true' : 'false'}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        data-ui-picker-trigger="true"
        aria-expanded={isOpen}
        onClick={() => {
          const nextIsOpen = !isOpen
          onOpenChange(nextIsOpen)
          if (nextIsOpen) setSearch('')
        }}
      >
        <span data-ui-picker-value="true">
          <span data-ui-icon-tile="true" data-ui-tone={tone}>
            <CategoryIcon iconKey={value} />
          </span>
          {selectedIcon?.label || fallbackLabel}
        </span>
        <span data-ui-picker-chevron="true" aria-hidden="true" />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={portalRef}
          data-ui-picker-control="true"
          data-ui-picker-variant="gallery"
          data-ui-picker-portal="true"
          data-open="true"
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
            zIndex: 'var(--ui-z-popover)',
          } as CSSProperties}
          onClick={(event) => event.stopPropagation()}
        >
          {pickerMenu}
        </div>,
        document.body,
      )}
    </div>
  )
}
