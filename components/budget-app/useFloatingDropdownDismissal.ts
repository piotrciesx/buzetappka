'use client'

import { useEffect } from 'react'

export function useFloatingDropdownDismissal() {
  useEffect(() => {
    const selector = 'details[data-floating-dropdown="true"]'

    const closeOtherDropdowns = (currentDropdown: HTMLDetailsElement) => {
      document.querySelectorAll<HTMLDetailsElement>(selector).forEach((dropdown) => {
        if (dropdown !== currentDropdown) {
          dropdown.open = false
        }
      })
    }

    const handleToggle = (event: Event) => {
      const dropdown = event.target instanceof HTMLDetailsElement ? event.target : null

      if (!dropdown?.matches(selector) || !dropdown.open) {
        return
      }

      closeOtherDropdowns(dropdown)
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Node ? event.target : null

      if (!target) {
        return
      }

      document.querySelectorAll<HTMLDetailsElement>(selector).forEach((dropdown) => {
        if (!dropdown.contains(target)) {
          dropdown.open = false
        }
      })
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      document.querySelectorAll<HTMLDetailsElement>(selector).forEach((dropdown) => {
        dropdown.open = false
      })
    }

    document.addEventListener('toggle', handleToggle, true)
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('toggle', handleToggle, true)
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}
