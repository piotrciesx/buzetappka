'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AuthUser } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

type ProfileUserRow = {
  profile_id: string
}

const getAuthRedirectUrl = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.location.origin
}

const clearAuthRedirectParams = () => {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)

  if (!url.searchParams.has('code') && !url.hash) {
    return
  }

  window.history.replaceState({}, document.title, url.origin + url.pathname)
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

export function useAuthProfile() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [authErrorText, setAuthErrorText] = useState('')
  const [loginEmail, setLoginEmail] = useState('')

  const loadProfileIdForUser = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profile_users')
      .select('profile_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return (data as ProfileUserRow | null)?.profile_id || null
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
              error instanceof Error
                ? error.message
                : 'Nie udało się wczytać profilu budżetu.'
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
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw new Error(error.message)
      }

      setUser(null)
      setProfileId(null)
    } catch (error) {
      setAuthErrorText(error instanceof Error ? error.message : 'Nie udało się wylogować.')
    } finally {
      setIsAuthLoading(false)
    }
  }, [])

  const createFirstProfile = useCallback(async () => {
    if (!user) {
      setAuthErrorText('Zaloguj się, aby utworzyć profil budżetu.')
      return
    }

    setIsAuthLoading(true)
    setAuthErrorText('')

    try {
      const { data, error } = await supabase.rpc('create_first_profile')

      if (error) {
        throw new Error(error.message)
      }

      const nextProfileId = data ? String(data) : ''

      if (!nextProfileId) {
        throw new Error('Nie udało się utworzyć profilu budżetu.')
      }

      setProfileId(nextProfileId)
      await refreshAuthState()
      setProfileId(nextProfileId)
    } catch (error) {
      setAuthErrorText(
        error instanceof Error ? error.message : 'Nie udało się utworzyć profilu budżetu.'
      )
    } finally {
      setIsAuthLoading(false)
    }
  }, [refreshAuthState, user])

  return {
    user,
    profileId,
    setActiveProfileId: setProfileId,
    isAuthLoading,
    authErrorText,
    loginEmail,
    setLoginEmail,
    sendMagicLink,
    signInWithGoogle,
    signOut,
    createFirstProfile,
  }
}
