'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import type { UserPublicProfile } from './userAppearance'

export function useUserPublicProfile(userId: string, fallbackEmail = '') {
  const [profile, setProfile] = useState<UserPublicProfile | null>(null)
  const [isAvailable, setIsAvailable] = useState(true)

  const loadProfile = useCallback(async () => {
    if (!userId || !isAvailable) {
      return
    }

    const { data, error } = await supabase
      .from('user_public_profiles')
      .select('user_id, display_name, avatar_key')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      setIsAvailable(false)
      setProfile(null)
      return
    }

    setProfile((data as UserPublicProfile | null) ?? null)
  }, [isAvailable, userId])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  useEffect(() => {
    const reload = () => void loadProfile()
    window.addEventListener('budget-user-profile-updated', reload)
    return () => window.removeEventListener('budget-user-profile-updated', reload)
  }, [loadProfile])

  const saveProfile = useCallback(
    async (input: { displayName: string; avatarKey: string }) => {
      if (!userId || !isAvailable) {
        return
      }

      const { error } = await supabase.from('user_public_profiles').upsert(
        {
          user_id: userId,
          display_name: input.displayName.trim() || null,
          avatar_key: input.avatarKey || null,
        },
        { onConflict: 'user_id' }
      )

      if (error) {
        setIsAvailable(false)
        throw new Error(error.message)
      }

      await loadProfile()
      window.dispatchEvent(new CustomEvent('budget-user-profile-updated'))
    },
    [isAvailable, loadProfile, userId]
  )

  const displayName = useMemo(
    () => profile?.display_name?.trim() || fallbackEmail || 'Użytkownik',
    [fallbackEmail, profile?.display_name]
  )

  return {
    profile,
    displayName,
    avatarKey: profile?.avatar_key || null,
    isAvailable,
    saveProfile,
    reloadProfile: loadProfile,
  }
}
