'use client'

import { useEffect } from 'react'

export function useFloatingDropdownDismissal() {
  useEffect(() => {
    const selector = 'details[data-floating-dropdown="true"]'
    const viewportPadding = 12

    const getDropdownPanel = (dropdown: HTMLDetailsElement) =>
      Array.from(dropdown.children).find(
        (child) => child instanceof HTMLElement && child.tagName.toLowerCase() !== 'summary'
      ) as HTMLElement | undefined

    const positionDropdown = (dropdown: HTMLDetailsElement) => {
      if (!dropdown.open) {
        return
      }

      const trigger = dropdown.querySelector('summary')
      const panel = getDropdownPanel(dropdown)

      if (!trigger || !panel) {
        return
      }

      panel.style.setProperty('position', 'fixed', 'important')
      panel.style.setProperty('right', 'auto', 'important')
      panel.style.setProperty('bottom', 'auto', 'important')
      panel.style.setProperty('z-index', '130000', 'important')
      panel.style.setProperty('visibility', 'hidden', 'important')
      panel.style.setProperty('max-height', `calc(100dvh - ${viewportPadding * 2}px)`, 'important')
      panel.style.setProperty('overflow-y', 'auto', 'important')

      const triggerRect = trigger.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
      const panelWidth = Math.min(panelRect.width, window.innerWidth - viewportPadding * 2)
      const panelHeight = Math.min(panelRect.height, window.innerHeight - viewportPadding * 2)
      const spaceBelow = window.innerHeight - triggerRect.bottom - viewportPadding
      const spaceAbove = triggerRect.top - viewportPadding
      const shouldOpenUp = panelHeight > spaceBelow && spaceAbove > spaceBelow
      const top = shouldOpenUp
        ? Math.max(viewportPadding, triggerRect.top - panelHeight - 6)
        : Math.min(triggerRect.bottom + 6, window.innerHeight - panelHeight - viewportPadding)
      const left = Math.min(
        Math.max(viewportPadding, triggerRect.right - panelWidth),
        window.innerWidth - panelWidth - viewportPadding
      )

      panel.style.setProperty('top', `${top}px`, 'important')
      panel.style.setProperty('left', `${left}px`, 'important')
      panel.style.setProperty('max-width', `calc(100vw - ${viewportPadding * 2}px)`, 'important')
      panel.style.setProperty('visibility', 'visible', 'important')
      panel.dataset.dropdownPlacement = shouldOpenUp ? 'top' : 'bottom'
    }

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
      requestAnimationFrame(() => positionDropdown(dropdown))
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

    const closeAllDropdowns = () => {
      document.querySelectorAll<HTMLDetailsElement>(selector).forEach((dropdown) => {
        dropdown.open = false
      })
    }

    const positionOpenDropdowns = () => {
      document.querySelectorAll<HTMLDetailsElement>(`${selector}[open]`).forEach(positionDropdown)
    }

    document.addEventListener('toggle', handleToggle, true)
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('budget-close-floating-ui', closeAllDropdowns)
    window.addEventListener('resize', positionOpenDropdowns)
    window.addEventListener('scroll', positionOpenDropdowns, true)

    return () => {
      document.removeEventListener('toggle', handleToggle, true)
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('budget-close-floating-ui', closeAllDropdowns)
      window.removeEventListener('resize', positionOpenDropdowns)
      window.removeEventListener('scroll', positionOpenDropdowns, true)
    }
  }, [])
}
