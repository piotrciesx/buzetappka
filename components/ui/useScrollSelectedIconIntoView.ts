'use client'

import { useLayoutEffect, useRef } from 'react'

type UseScrollSelectedIconIntoViewInput = {
  isOpen: boolean
  selectedKey?: string | null
  scrollSignal?: unknown
}

export function useScrollSelectedIconIntoView({
  isOpen,
  selectedKey,
  scrollSignal,
}: UseScrollSelectedIconIntoViewInput) {
  const selectedOptionRef = useRef<HTMLButtonElement | null>(null)

  useLayoutEffect(() => {
    if (!isOpen || !selectedKey) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      const selectedOption = selectedOptionRef.current

      if (!selectedOption || selectedOption.getClientRects().length === 0) {
        return
      }

      selectedOption.scrollIntoView({
        block: 'center',
        inline: 'nearest',
      })
      selectedOption.focus({ preventScroll: true })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [isOpen, selectedKey, scrollSignal])

  return selectedOptionRef
}
