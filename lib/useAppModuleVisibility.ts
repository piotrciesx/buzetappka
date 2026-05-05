'use client'

import { useEffect, useState } from 'react'

export type AppModuleKey =
  | 'dashboard'
  | 'paymentSources'
  | 'recurringTransactions'
  | 'financialGoals'
  | 'budgetLimits'
  | 'monthCalendar'

export type AppModuleVisibility = Record<AppModuleKey, boolean>

export const DEFAULT_APP_MODULE_VISIBILITY: AppModuleVisibility = {
  dashboard: true,
  paymentSources: true,
  recurringTransactions: false,
  financialGoals: true,
  budgetLimits: true,
  monthCalendar: true,
}

const APP_MODULE_VISIBILITY_STORAGE_KEY = 'budget-app-visible-modules-v1'

const moduleKeys = Object.keys(DEFAULT_APP_MODULE_VISIBILITY) as AppModuleKey[]

const normalizeModuleVisibility = (value: unknown): AppModuleVisibility => {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_APP_MODULE_VISIBILITY }
  }

  const storedVisibility = value as Partial<Record<AppModuleKey, unknown>>

  return moduleKeys.reduce<AppModuleVisibility>(
    (nextVisibility, moduleKey) => ({
      ...nextVisibility,
      [moduleKey]:
        typeof storedVisibility[moduleKey] === 'boolean'
          ? storedVisibility[moduleKey]
          : DEFAULT_APP_MODULE_VISIBILITY[moduleKey],
    }),
    { ...DEFAULT_APP_MODULE_VISIBILITY }
  )
}

export function useAppModuleVisibility() {
  const [visibleModules, setVisibleModules] = useState<AppModuleVisibility>(
    DEFAULT_APP_MODULE_VISIBILITY
  )
  const [draftVisibleModules, setDraftVisibleModules] = useState<AppModuleVisibility>(
    DEFAULT_APP_MODULE_VISIBILITY
  )
  const [saveStatusText, setSaveStatusText] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      try {
        const storedValue = window.localStorage.getItem(APP_MODULE_VISIBILITY_STORAGE_KEY)
        const nextVisibility = storedValue
          ? normalizeModuleVisibility(JSON.parse(storedValue))
          : { ...DEFAULT_APP_MODULE_VISIBILITY }

        setVisibleModules(nextVisibility)
        setDraftVisibleModules(nextVisibility)
      } catch {
        const defaultVisibility = { ...DEFAULT_APP_MODULE_VISIBILITY }

        setVisibleModules(defaultVisibility)
        setDraftVisibleModules(defaultVisibility)
      }
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [])

  const setDraftModuleVisibility = (moduleKey: AppModuleKey, isVisible: boolean) => {
    setDraftVisibleModules((previousVisibility) => ({
      ...previousVisibility,
      [moduleKey]: isVisible,
    }))
    setSaveStatusText('')
  }

  const saveVisibleModules = () => {
    setVisibleModules(draftVisibleModules)

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          APP_MODULE_VISIBILITY_STORAGE_KEY,
          JSON.stringify(draftVisibleModules)
        )
      }

      setSaveStatusText('Zapisano ustawienia.')
    } catch {
      setSaveStatusText('Nie udało się zapisać ustawień lokalnie.')
    }
  }

  const resetDraftVisibleModules = () => {
    setDraftVisibleModules(visibleModules)
    setSaveStatusText('Cofnięto niezapisane zmiany.')
  }

  return {
    visibleModules,
    draftVisibleModules,
    saveStatusText,
    setDraftModuleVisibility,
    saveVisibleModules,
    resetDraftVisibleModules,
  }
}
