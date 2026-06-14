'use client'

import { useEffect, useRef, useState } from 'react'
import { CATEGORY_ICONS } from '../lib/userAppearance'
import CategoryIcon from './CategoryIcon'
import { useScrollSelectedIconIntoView } from './ui/useScrollSelectedIconIntoView'

type CategoryIconPickerProps = {
  value?: string | null
  onChange: (value: string | null) => void
}

export default function CategoryIconPicker({ value, onChange }: CategoryIconPickerProps) {
  const selectedIcon = CATEGORY_ICONS.find((icon) => icon.key === value)
  const pickerRootRef = useRef<HTMLDivElement | null>(null)
  const [isPickerVisible, setIsPickerVisible] = useState(false)
  const selectedIconOptionRef = useScrollSelectedIconIntoView({
    isOpen: isPickerVisible,
    selectedKey: value,
  })

  useEffect(() => {
    const pickerRoot = pickerRootRef.current

    if (!pickerRoot) {
      return
    }

    const details = pickerRoot.closest('details')
    const syncVisibility = () => setIsPickerVisible(!details || details.open)

    syncVisibility()

    if (!details) {
      return
    }

    details.addEventListener('toggle', syncVisibility)

    return () => details.removeEventListener('toggle', syncVisibility)
  }, [])

  return (
    <div ref={pickerRootRef} data-category-icon-picker="true" onClick={(event) => event.stopPropagation()}>
      <div data-category-icon-picker-header="true">
        <span>Wybierz ikonę</span>
        <strong>{selectedIcon?.label || 'Bez ikony'}</strong>
      </div>
      <button
        type="button"
        data-category-icon-option="clear"
        data-active={!value ? 'true' : 'false'}
        title="Bez ikony"
        onClick={() => onChange(null)}
      >
        <span data-category-icon-empty="true" aria-hidden="true">-</span>
        <span>Bez ikony</span>
      </button>
      {CATEGORY_ICONS.map((icon) => (
        <button
          key={icon.key}
          ref={value === icon.key ? selectedIconOptionRef : undefined}
          type="button"
          data-category-icon-option="true"
          data-active={value === icon.key ? 'true' : 'false'}
          title={icon.label}
          onClick={() => onChange(icon.key)}
        >
          <CategoryIcon iconKey={icon.key} level={2} />
          <span>{icon.label}</span>
        </button>
      ))}
    </div>
  )
}
