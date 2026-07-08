'use client'

import { useCallback, useState } from 'react'

export type ManagementScreen =
  | { name: 'list' }
  | { name: 'details'; recordId: string }
  | { name: 'create' }
  | { name: 'edit'; recordId: string }

const LIST_SCREEN: ManagementScreen = { name: 'list' }

export function useManagementScreenStack(initialScreen: ManagementScreen = LIST_SCREEN) {
  const [screens, setScreens] = useState<ManagementScreen[]>([initialScreen])
  const screen = screens[screens.length - 1] ?? LIST_SCREEN

  const push = useCallback((nextScreen: ManagementScreen) => {
    setScreens((current) => [...current, nextScreen])
  }, [])

  const replace = useCallback((nextScreen: ManagementScreen) => {
    setScreens((current) => [...current.slice(0, -1), nextScreen])
  }, [])

  const back = useCallback(() => {
    setScreens((current) => (current.length > 1 ? current.slice(0, -1) : current))
  }, [])

  const resetToList = useCallback(() => {
    setScreens([LIST_SCREEN])
  }, [])

  return {
    currentScreen: screen,
    canGoBack: screens.length > 1,
    pushScreen: push,
    replaceScreen: replace,
    goBack: back,
    resetToList,
  }
}
