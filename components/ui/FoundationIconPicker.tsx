'use client'

import { useMemo, useState } from 'react'
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
  const [isExpanded, setIsExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const selectedIcon = getUiIcon(value)
  const selectedIconOptionRef = useScrollSelectedIconIntoView({
    isOpen,
    selectedKey: value,
    scrollSignal: isExpanded,
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
  const baseIcons = isExpanded
    ? orderedIcons
    : orderedIcons.filter((option) => suggestedIconKeys.includes(option.key))
  const visibleIcons = normalizedSearch
    ? orderedIcons.filter((option) => getUiIconSearchText(option).includes(normalizedSearch))
    : baseIcons

  return (
    <div
      data-ui-picker-control="true"
      data-ui-picker-variant="gallery"
      data-open={isOpen ? 'true' : 'false'}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        data-ui-picker-trigger="true"
        aria-expanded={isOpen}
        onClick={() => {
          const nextIsOpen = !isOpen
          onOpenChange(nextIsOpen)

          if (nextIsOpen) {
            setSearch('')
          }
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

      {isOpen && (
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
          {!isExpanded && !normalizedSearch && (
            <button
              type="button"
              data-ui-picker-more="true"
              onClick={() => setIsExpanded(true)}
            >
              {moreLabel}
            </button>
          )}
          {visibleIcons.length === 0 && (
            <div data-ui-picker-empty="true">Brak ikon dla tej nazwy.</div>
          )}
        </div>
      )}
    </div>
  )
}
