'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AuthUser } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

type ProfileUserRow = {
  profile_id: string
  role: string
  created_at: string | null
}

const ACTIVE_PROFILE_STORAGE_PREFIX = 'budget-active-profile-id'

const getAuthRedirectUrl = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  const url = new URL(window.location.href)
  url.hash = ''
  url.searchParams.delete('code')

  return `${url.origin}${url.pathname}${url.search}`
}

const getActiveProfileStorageKey = (userId: string) => `${ACTIVE_PROFILE_STORAGE_PREFIX}:${userId}`

const getStoredActiveProfileId = (userId: string) => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(getActiveProfileStorageKey(userId))
}

const storeActiveProfileId = (userId: string, nextProfileId: string | null) => {
  if (typeof window === 'undefined') {
    return
  }

  const storageKey = getActiveProfileStorageKey(userId)

  if (nextProfileId) {
    window.localStorage.setItem(storageKey, nextProfileId)
    return
  }

  window.localStorage.removeItem(storageKey)
}

const clearAuthRedirectParams = () => {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)

  if (!url.searchParams.has('code') && !url.hash) {
    return
  }

  url.searchParams.delete('code')
  url.hash = ''

  window.history.replaceState({}, document.title, `${url.origin}${url.pathname}${url.search}`)
}

const exchangeCodeFromUrl = async () => {
  if (typeof window === 'undefined') {
    return
  }

  const code = new URL(window.location.href).searchParams.get('code')

  if (!code) {
    return
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    throw new Error(error.message)
  }

  clearAuthRedirectParams()
}

const getMembershipDateValue = (membership: ProfileUserRow) => {
  const timestamp = membership.created_at ? Date.parse(membership.created_at) : 0
  return Number.isFinite(timestamp) ? timestamp : 0
}

const pickProfileId = (memberships: ProfileUserRow[], userId: string) => {
  if (memberships.length === 0) {
    return null
  }

  const storedProfileId = getStoredActiveProfileId(userId)

  if (storedProfileId && memberships.some((membership) => membership.profile_id === storedProfileId)) {
    return storedProfileId
  }

  const ownerMemberships = memberships
    .filter((membership) => membership.role === 'owner')
    .sort((left, right) => getMembershipDateValue(right) - getMembershipDateValue(left))

  if (ownerMemberships[0]) {
    return ownerMemberships[0].profile_id
  }

  const latestMembership = [...memberships].sort(
    (left, right) => getMembershipDateValue(right) - getMembershipDateValue(left)
  )[0]

  return latestMembership?.profile_id || null
}

export function useAuthProfile() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [authErrorText, setAuthErrorText] = useState('')
  const [loginEmail, setLoginEmail] = useState('')

  const loadProfileIdForUser = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profile_users')
      .select('profile_id, role, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    const memberships = (data || []) as ProfileUserRow[]
    const nextProfileId = pickProfileId(memberships, userId)

    storeActiveProfileId(userId, nextProfileId)

    return nextProfileId
  }, [])

  const refreshAuthState = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw new Error(error.message)
    }

    const nextUser = data.session?.user ?? null
    const nextProfileId = nextUser ? await loadProfileIdForUser(nextUser.id) : null

    setUser(nextUser)
    setProfileId(nextProfileId)
  }, [loadProfileIdForUser])

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      setIsAuthLoading(true)
      setAuthErrorText('')

      try {
        await refreshAuthState()

        if (!isMounted) {
          return
        }

        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw new Error(error.message)
        }

        if (!data.session) {
          await exchangeCodeFromUrl()
          await refreshAuthState()
        }

        clearAuthRedirectParams()
      } catch (error) {
        if (!isMounted) {
          return
        }

        setAuthErrorText(
          error instanceof Error ? error.message : 'Nie udało się wczytać sesji użytkownika.'
        )
        setUser(null)
        setProfileId(null)
      } finally {
        if (isMounted) {
          setIsAuthLoading(false)
        }
      }
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthErrorText('')

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null)
        setProfileId(null)
        setIsAuthLoading(false)
        return
      }

      setIsAuthLoading(true)
      window.setTimeout(() => {
        void refreshAuthState()
          .catch((error) => {
            setAuthErrorText(
              error instanceof Error ? error.message : 'Nie udało się wczytać profilu budżetu.'
            )
            setUser(session.user)
            setProfileId(null)
          })
          .finally(() => setIsAuthLoading(false))
      }, 0)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [refreshAuthState])

  const setActiveProfileId = useCallback(
    (nextProfileId: string | null) => {
      if (user) {
        storeActiveProfileId(user.id, nextProfileId)
      }

      setProfileId(nextProfileId)
    },
    [user]
  )

  const sendMagicLink = useCallback(async () => {
    const email = loginEmail.trim()

    if (!email) {
      setAuthErrorText('Podaj adres email.')
      return
    }

    setIsAuthLoading(true)
    setAuthErrorText('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getAuthRedirectUrl(),
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      setAuthErrorText('Wysłaliśmy link logowania. Sprawdź skrzynkę mailową.')
    } catch (error) {
      setAuthErrorText(
        error instanceof Error ? error.message : 'Nie udało się wysłać magic linku.'
      )
    } finally {
      setIsAuthLoading(false)
    }
  }, [loginEmail])

  const signInWithGoogle = useCallback(async () => {
    setIsAuthLoading(true)
    setAuthErrorText('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getAuthRedirectUrl(),
        },
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      setAuthErrorText(
        error instanceof Error ? error.message : 'Nie udało się rozpocząć logowania Google.'
      )
      setIsAuthLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setIsAuthLoading(true)
    setAuthErrorText('')

    try {
      const currentUserId = user?.id
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw new Error(error.message)
      }

      if (currentUserId) {
        storeActiveProfileId(currentUserId, null)
      }

      setUser(null)
      setProfileId(null)
    } catch (error) {
      setAuthErrorText(error instanceof Error ? error.message : 'Nie udało się wylogować.')
    } finally {
      setIsAuthLoading(false)
    }
  }, [user])

  const createFirstProfile = useCallback(async () => {
    if (!user) {
      setAuthErrorText('Zaloguj się, aby utworzyć profil budżetu.')
      return
    }

    setIsAuthLoading(true)
    setAuthErrorText('')

    try {
      const existingProfileId = await loadProfileIdForUser(user.id)

      if (existingProfileId) {
        setProfileId(existingProfileId)
        return
      }

      const { data, error } = await supabase.rpc('create_first_profile')

      if (error) {
        throw new Error(error.message)
      }

      const nextProfileId = data ? String(data) : ''

      if (!nextProfileId) {
        throw new Error('Nie udało się utworzyć profilu budżetu.')
      }

      storeActiveProfileId(user.id, nextProfileId)
      setProfileId(nextProfileId)
      await refreshAuthState()
    } catch (error) {
      setAuthErrorText(
        error instanceof Error ? error.message : 'Nie udało się utworzyć profilu budżetu.'
      )
    } finally {
      setIsAuthLoading(false)
    }
  }, [loadProfileIdForUser, refreshAuthState, user])

  return {
    user,
    profileId,
    setActiveProfileId,
    isAuthLoading,
    authErrorText,
    loginEmail,
    setLoginEmail,
    sendMagicLink,
    signInWithGoogle,
    signOut,
    createFirstProfile,
    refreshAuthState,
  }
}
