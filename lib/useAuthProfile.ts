'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AuthUser } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

type ProfileUserRow = {
  profile_id: string
  role: string
  created_at: string | null
}

type SignUpWithPasswordParams = {
  username: string
  email: string
  password: string
}

const ACTIVE_PROFILE_STORAGE_PREFIX = 'budget-active-profile-id'
const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/
const EMAIL_ALREADY_USED_MESSAGE = 'Ten adres email jest już zajęty.'
const USERNAME_ALREADY_USED_MESSAGE = 'Ten login jest już zajęty.'
const INVALID_LOGIN_MESSAGE = 'Nieprawidłowy login/email lub hasło.'
const EMAIL_NOT_CONFIRMED_MESSAGE =
  'Konto nie zostało jeszcze aktywowane. Sprawdź maila i kliknij link potwierdzający.'
const CONFIRM_ACCOUNT_MESSAGE =
  'Na Twój adres email został wysłany link potwierdzający konto. Kliknij link w mailu, aby aktywować konto i móc się zalogować.'

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

const normalizeUsername = (username: string) => username.trim().toLowerCase()

const isEmailIdentifier = (identifier: string) => identifier.includes('@')

const getUsernameValidationError = (usernameValue: string) => {
  const username = usernameValue.trim()

  if (!username) {
    return 'Podaj login.'
  }

  if (username.length < 3) {
    return 'Login musi mieć minimum 3 znaki.'
  }

  if (!USERNAME_PATTERN.test(username)) {
    return 'Login może zawierać tylko litery, cyfry, myślnik, podkreślnik i kropkę.'
  }

  return ''
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : ''

const mapAuthErrorMessage = (error: unknown) => {
  const message = getErrorMessage(error)
  const normalizedMessage = message.toLowerCase()

  if (
    message === INVALID_LOGIN_MESSAGE ||
    normalizedMessage.includes('invalid login credentials') ||
    normalizedMessage.includes('invalid email or password')
  ) {
    return INVALID_LOGIN_MESSAGE
  }

  if (
    message === EMAIL_NOT_CONFIRMED_MESSAGE ||
    normalizedMessage.includes('email not confirmed') ||
    normalizedMessage.includes('email link is invalid or has expired')
  ) {
    return EMAIL_NOT_CONFIRMED_MESSAGE
  }

  if (
    message === EMAIL_ALREADY_USED_MESSAGE ||
    normalizedMessage.includes('user already registered') ||
    normalizedMessage.includes('already registered') ||
    normalizedMessage.includes('already exists') ||
    (normalizedMessage.includes('email') && normalizedMessage.includes('duplicate')) ||
    normalizedMessage.includes('user_accounts_email')
  ) {
    return EMAIL_ALREADY_USED_MESSAGE
  }

  if (
    message === USERNAME_ALREADY_USED_MESSAGE ||
    normalizedMessage.includes('user_accounts_username') ||
    (normalizedMessage.includes('duplicate key') && normalizedMessage.includes('username')) ||
    (normalizedMessage.includes('username') && normalizedMessage.includes('unique'))
  ) {
    return USERNAME_ALREADY_USED_MESSAGE
  }

  if (normalizedMessage.includes('rate limit')) {
    return 'Za dużo prób. Odczekaj chwilę i spróbuj ponownie.'
  }

  if (normalizedMessage.includes('network')) {
    return 'Problem z połączeniem. Sprawdź internet i spróbuj ponownie.'
  }

  return message || 'Coś poszło nie tak. Spróbuj ponownie.'
}

const mapSignUpErrorMessage = (error: unknown) =>
  mapAuthErrorMessage(error) || 'Nie udało się utworzyć konta. Sprawdź dane i spróbuj ponownie.'

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

  const signInWithPassword = useCallback(
    async (identifierValue: string, password: string) => {
      const identifier = identifierValue.trim()

      if (!identifier) {
        setAuthErrorText('Podaj login lub email.')
        return
      }

      if (!password) {
        setAuthErrorText('Podaj hasło.')
        return
      }

      setIsAuthLoading(true)
      setAuthErrorText('')

      try {
        let email = identifier

        if (!isEmailIdentifier(identifier)) {
          const username = normalizeUsername(identifier)
          const usernameValidationError = getUsernameValidationError(username)

          if (usernameValidationError) {
            throw new Error(usernameValidationError)
          }

          const { data, error } = await supabase.rpc('get_email_for_username', {
            username_input: username,
          })

          if (error) {
            throw new Error(error.message)
          }

          email = typeof data === 'string' ? data : ''

          if (!email) {
            throw new Error('Nie znaleziono konta o podanym loginie.')
          }
        }

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw new Error(error.message)
        }

        await refreshAuthState()
      } catch (error) {
        setAuthErrorText(mapAuthErrorMessage(error))
      } finally {
        setIsAuthLoading(false)
      }
    },
    [refreshAuthState]
  )

  const signUpWithPassword = useCallback(
    async ({ username: usernameValue, email: emailValue, password }: SignUpWithPasswordParams) => {
      const usernameValidationError = getUsernameValidationError(usernameValue)

      if (usernameValidationError) {
        setAuthErrorText(usernameValidationError)
        return
      }

      const username = normalizeUsername(usernameValue)
      const email = emailValue.trim().toLowerCase()

      if (!email) {
        setAuthErrorText('Podaj adres email.')
        return
      }

      if (!password) {
        setAuthErrorText('Podaj hasło.')
        return
      }

      setIsAuthLoading(true)
      setAuthErrorText('')

      try {
        const { data: isEmailRegistered, error: emailCheckError } = await supabase.rpc(
          'is_email_registered',
          {
            email_input: email,
          }
        )

        if (emailCheckError) {
          throw new Error(emailCheckError.message)
        }

        if (isEmailRegistered) {
          throw new Error(EMAIL_ALREADY_USED_MESSAGE)
        }

        const { data: existingEmail, error: existingUsernameError } = await supabase.rpc(
          'get_email_for_username',
          {
            username_input: username,
          }
        )

        if (existingUsernameError) {
          throw new Error(existingUsernameError.message)
        }

        if (existingEmail) {
          throw new Error(USERNAME_ALREADY_USED_MESSAGE)
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getAuthRedirectUrl(),
            data: {
              username,
            },
          },
        })

        if (error) {
          throw new Error(error.message)
        }

        if (Array.isArray(data.user?.identities) && data.user.identities.length === 0) {
          throw new Error(EMAIL_ALREADY_USED_MESSAGE)
        }

        const userId = data.user?.id

        if (!userId) {
          throw new Error('Nie udało się utworzyć konta użytkownika.')
        }

        const { error: accountError } = await supabase.rpc('register_user_account', {
          user_id_input: userId,
          email_input: email,
          username_input: username,
        })

        if (accountError) {
          throw new Error(accountError.message)
        }

        if (data.session) {
          await supabase.auth.signOut()
          setUser(null)
          setProfileId(null)
        }

        setAuthErrorText(CONFIRM_ACCOUNT_MESSAGE)
      } catch (error) {
        setAuthErrorText(mapSignUpErrorMessage(error))
      } finally {
        setIsAuthLoading(false)
      }
    },
    [refreshAuthState]
  )

  const resetPassword = useCallback(async (identifierValue: string) => {
    const identifier = identifierValue.trim()

    if (!identifier) {
      setAuthErrorText('Podaj login lub email.')
      return
    }

    setIsAuthLoading(true)
    setAuthErrorText('')

    try {
      let email = identifier

      if (!isEmailIdentifier(identifier)) {
        const username = normalizeUsername(identifier)
        const usernameValidationError = getUsernameValidationError(username)

        if (usernameValidationError) {
          throw new Error(usernameValidationError)
        }

        const { data, error } = await supabase.rpc('get_email_for_username', {
          username_input: username,
        })

        if (error) {
          throw new Error(error.message)
        }

        email = typeof data === 'string' ? data : ''

        if (!email) {
          throw new Error('Nie znaleziono konta o podanym loginie.')
        }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthRedirectUrl(),
      })

      if (error) {
        throw new Error(error.message)
      }

      setAuthErrorText('Wysłaliśmy link do ustawienia nowego hasła. Sprawdź skrzynkę mailową.')
    } catch (error) {
      setAuthErrorText(mapAuthErrorMessage(error))
    } finally {
      setIsAuthLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setIsAuthLoading(true)
    setAuthErrorText('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getAuthRedirectUrl(),
          queryParams: {
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      setAuthErrorText(mapAuthErrorMessage(error))
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
    signInWithPassword,
    signUpWithPassword,
    resetPassword,
    signInWithGoogle,
    signOut,
    createFirstProfile,
    refreshAuthState,
  }
}
