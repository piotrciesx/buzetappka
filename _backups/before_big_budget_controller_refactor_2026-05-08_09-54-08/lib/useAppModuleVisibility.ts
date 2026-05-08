'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

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

type UseAppModuleVisibilityInput = {
  profileId: string
  userId: string
}

type UserProfileSettingsRow = {
  visible_modules: unknown
}

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

export function useAppModuleVisibility({ profileId, userId }: UseAppModuleVisibilityInput) {
  const [visibleModules, setVisibleModules] = useState<AppModuleVisibility>(
    DEFAULT_APP_MODULE_VISIBILITY
  )
  const [draftVisibleModules, setDraftVisibleModules] = useState<AppModuleVisibility>(
    DEFAULT_APP_MODULE_VISIBILITY
  )
  const [saveStatusText, setSaveStatusText] = useState('')

  const applyVisibility = useCallback((nextVisibility: AppModuleVisibility) => {
    setVisibleModules(nextVisibility)
    setDraftVisibleModules(nextVisibility)
  }, [])

  const loadVisibleModules = useCallback(async () => {
    if (!profileId || !userId) {
      const defaultVisibility = { ...DEFAULT_APP_MODULE_VISIBILITY }

      applyVisibility(defaultVisibility)
      return
    }

    setSaveStatusText('')

    const { data, error } = await supabase
      .from('user_profile_settings')
      .select('visible_modules')
      .eq('profile_id', profileId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      const fallbackVisibility = { ...DEFAULT_APP_MODULE_VISIBILITY }

      applyVisibility(fallbackVisibility)
      setSaveStatusText(
        `Nie udało się wczytać ustawień z Supabase. Użyto ustawień domyślnych. ${error.message}`
      )
      return
    }

    if (data) {
      const nextVisibility = normalizeModuleVisibility(
        (data as UserProfileSettingsRow).visible_modules
      )

      applyVisibility(nextVisibility)
      return
    }

    const defaultVisibility = { ...DEFAULT_APP_MODULE_VISIBILITY }
    const { error: insertError } = await supabase.from('user_profile_settings').insert({
      profile_id: profileId,
      user_id: userId,
      visible_modules: defaultVisibility,
    })

    if (insertError) {
      const fallbackVisibility = { ...DEFAULT_APP_MODULE_VISIBILITY }

      applyVisibility(fallbackVisibility)
      setSaveStatusText(
        `Nie udało się utworzyć ustawień w Supabase. Użyto ustawień domyślnych. ${insertError.message}`
      )
      return
    }

    applyVisibility(defaultVisibility)
  }, [applyVisibility, profileId, userId])

  useEffect(() => {
    let isActive = true

    const load = async () => {
      await loadVisibleModules()
    }

    void load().catch((error) => {
      if (!isActive) {
        return
      }

      const fallbackVisibility = { ...DEFAULT_APP_MODULE_VISIBILITY }

      applyVisibility(fallbackVisibility)
      setSaveStatusText(
        error instanceof Error
          ? `Nie udało się wczytać ustawień modułów. Użyto ustawień domyślnych. ${error.message}`
          : 'Nie udało się wczytać ustawień modułów. Użyto ustawień domyślnych.'
      )
    })

    return () => {
      isActive = false
    }
  }, [applyVisibility, loadVisibleModules])

  const setDraftModuleVisibility = (moduleKey: AppModuleKey, isVisible: boolean) => {
    setDraftVisibleModules((previousVisibility) => ({
      ...previousVisibility,
      [moduleKey]: isVisible,
    }))
    setSaveStatusText('')
  }

  const saveVisibleModules = async () => {
    const nextVisibility = normalizeModuleVisibility(draftVisibleModules)

    if (!profileId || !userId) {
      setSaveStatusText('Nie udało się zapisać ustawień: brak profilu lub użytkownika.')
      return
    }

    const { error } = await supabase.from('user_profile_settings').upsert(
      {
        profile_id: profileId,
        user_id: userId,
        visible_modules: nextVisibility,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'profile_id,user_id',
      }
    )

    if (error) {
      setSaveStatusText(
        `Nie udało się zapisać ustawień w Supabase. ${error.message}`
      )
      return
    }

    setVisibleModules(nextVisibility)
    setDraftVisibleModules(nextVisibility)
    setSaveStatusText('Zapisano ustawienia.')
  }

  const resetDraftVisibleModules = () => {
    setDraftVisibleModules({ ...DEFAULT_APP_MODULE_VISIBILITY })
    setSaveStatusText('Przywrócono domyślne ustawienia w wersji roboczej.')
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
