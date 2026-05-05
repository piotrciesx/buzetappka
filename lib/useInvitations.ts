'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

type ProfileInvitationRow = {
  token: string
}

type UseInvitationsParams = {
  profileId: string | null
  userId: string | null
  setActiveProfileId: (profileId: string | null) => void
}

const PENDING_INVITATION_STORAGE_KEY = 'budget-pending-invitation-token'

const getInviteTokenFromUrl = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return new URLSearchParams(window.location.search).get('invite')
}

const getOrigin = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.location.origin
}

const clearInviteFromUrl = () => {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)
  url.searchParams.delete('invite')

  const nextUrl = `${url.origin}${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, document.title, nextUrl)
}

export function useInvitations({
  profileId,
  userId,
  setActiveProfileId,
}: UseInvitationsParams) {
  const [pendingInvitationToken, setPendingInvitationToken] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [invitationStatusText, setInvitationStatusText] = useState('')
  const [invitationErrorText, setInvitationErrorText] = useState('')
  const [isInvitationWorking, setIsInvitationWorking] = useState(false)

  useEffect(() => {
    const tokenFromUrl = getInviteTokenFromUrl()

    if (tokenFromUrl) {
      setPendingInvitationToken(tokenFromUrl)
      window.sessionStorage.setItem(PENDING_INVITATION_STORAGE_KEY, tokenFromUrl)
      return
    }

    const tokenFromStorage = window.sessionStorage.getItem(PENDING_INVITATION_STORAGE_KEY)

    if (tokenFromStorage) {
      setPendingInvitationToken(tokenFromStorage)
    }
  }, [])

  const createInvitation = useCallback(async () => {
    if (!profileId || !userId) {
      setInvitationErrorText('Nie udało się utworzyć zaproszenia: brak aktywnego profilu.')
      return
    }

    setIsInvitationWorking(true)
    setInvitationErrorText('')
    setInvitationStatusText('')

    try {
      const trimmedEmail = inviteEmail.trim()
      const { data, error } = await supabase
        .from('profile_invitations')
        .insert({
          profile_id: profileId,
          invited_email: trimmedEmail || null,
          created_by: userId,
          role: 'member',
        })
        .select('token')
        .single()

      if (error) {
        throw new Error(error.message)
      }

      const token = (data as ProfileInvitationRow | null)?.token

      if (!token) {
        throw new Error('Nie udało się pobrać tokenu zaproszenia.')
      }

      setInviteLink(`${getOrigin()}?invite=${token}`)
      setInvitationStatusText('Zaproszenie zostało utworzone.')
    } catch (error) {
      setInvitationErrorText(
        error instanceof Error ? error.message : 'Nie udało się utworzyć zaproszenia.'
      )
    } finally {
      setIsInvitationWorking(false)
    }
  }, [inviteEmail, profileId, userId])

  const copyInviteLink = useCallback(async () => {
    if (!inviteLink) {
      return
    }

    try {
      await window.navigator.clipboard.writeText(inviteLink)
      setInvitationStatusText('Skopiowano link zaproszenia.')
    } catch {
      setInvitationErrorText('Nie udało się skopiować linku. Zaznacz i skopiuj go ręcznie.')
    }
  }, [inviteLink])

  const acceptInvitation = useCallback(async () => {
    if (!pendingInvitationToken) {
      setInvitationErrorText('Brak tokenu zaproszenia.')
      return
    }

    setIsInvitationWorking(true)
    setInvitationErrorText('')
    setInvitationStatusText('')

    try {
      const { data, error } = await supabase.rpc('accept_profile_invitation', {
        invitation_token: pendingInvitationToken,
      })

      if (error) {
        throw new Error(error.message)
      }

      const nextProfileId = data ? String(data) : ''

      if (!nextProfileId) {
        throw new Error('Nie udało się dołączyć do profilu.')
      }

      setActiveProfileId(nextProfileId)
      setPendingInvitationToken(null)
      window.sessionStorage.removeItem(PENDING_INVITATION_STORAGE_KEY)
      clearInviteFromUrl()
      setInvitationStatusText('Dołączono do wspólnego budżetu.')
    } catch (error) {
      setInvitationErrorText(
        error instanceof Error ? error.message : 'Nie udało się zaakceptować zaproszenia.'
      )
    } finally {
      setIsInvitationWorking(false)
    }
  }, [pendingInvitationToken, setActiveProfileId])

  const cancelInvitation = useCallback(() => {
    setPendingInvitationToken(null)
    setInvitationErrorText('')
    setInvitationStatusText('')
    window.sessionStorage.removeItem(PENDING_INVITATION_STORAGE_KEY)
    clearInviteFromUrl()
  }, [])

  return {
    pendingInvitationToken,
    inviteEmail,
    setInviteEmail,
    inviteLink,
    invitationStatusText,
    invitationErrorText,
    isInvitationWorking,
    createInvitation,
    copyInviteLink,
    acceptInvitation,
    cancelInvitation,
  }
}
