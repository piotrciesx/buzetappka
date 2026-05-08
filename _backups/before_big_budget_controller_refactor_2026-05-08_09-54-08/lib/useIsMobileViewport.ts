'use client'

import { useEffect, useState } from 'react'

export function useIsMobileViewport(maxWidth = 640) {
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const update = () => setIsMobileViewport(mediaQuery.matches)

    update()
    mediaQuery.addEventListener('change', update)

    return () => {
      mediaQuery.removeEventListener('change', update)
    }
  }, [maxWidth])

  return isMobileViewport
}
