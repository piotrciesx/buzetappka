'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

type UseInvitationsParams = {
  profileId: string | null
  userId: string | null
  setActiveProfileId: (profileId: string | null) => void
}

type InvitationStatusRow = {
  profile_id: string | null
  is_current_member: boolean | null
}

const PENDING_INVITATION_STORAGE_KEY = 'budget-pending-invitation-token'
const ALREADY_MEMBER_INVITATION_MESSAGE = 'To konto już należy do tego profilu.'
const EXISTING_BUDGET_INVITATION_WARNING =
  'To konto ma już własny budżet. Po dołączeniu do wspólnego profilu będziesz pracować na budżecie osoby zapraszającej. Twój dotychczasowy budżet nie zostanie usunięty, ale będzie ukryty, dopóki nie opuścisz wspólnego profilu albo nie przełączysz aktywnego profilu. Przed dołączeniem zalecamy wykonanie backupu.'

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

const getInvitationStatusRow = (data: unknown): InvitationStatusRow | null => {
  if (Array.isArray(data)) {
    return (data[0] as InvitationStatusRow | undefined) || null
  }

  return (data as InvitationStatusRow | null) || null
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
  const [invitationInfoText, setInvitationInfoText] = useState('')
  const [invitationErrorText, setInvitationErrorText] = useState('')
  const [invitationWarningText, setInvitationWarningText] = useState('')
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

  useEffect(() => {
    let isActive = true

    const loadInvitationContext = async () => {
      if (!pendingInvitationToken || !userId) {
        setInvitationInfoText('')
        setInvitationWarningText('')
        return
      }

      const { data: invitationStatus, error: invitationStatusError } = await supabase.rpc(
        'get_profile_invitation_status',
        {
          invitation_token: pendingInvitationToken,
        }
      )

      if (!isActive) {
        return
      }

      if (invitationStatusError) {
        setInvitationInfoText('')
        setInvitationWarningText('')
        return
      }

      const statusRow = getInvitationStatusRow(invitationStatus)

      if (statusRow?.is_current_member && statusRow.profile_id) {
        setActiveProfileId(statusRow.profile_id)
        setInvitationInfoText(ALREADY_MEMBER_INVITATION_MESSAGE)
        setInvitationWarningText('')
        return
      }

      setInvitationInfoText('')

      const { data: memberships, error: membershipsError } = await supabase
        .from('profile_users')
        .select('profile_id')
        .eq('user_id', userId)

      if (!isActive) {
        return
      }

      if (membershipsError) {
        setInvitationWarningText('')
        return
      }

      setInvitationWarningText(
        (memberships || []).length > 0 ? EXISTING_BUDGET_INVITATION_WARNING : ''
      )
    }

    void loadInvitationContext()

    return () => {
      isActive = false
    }
  }, [pendingInvitationToken, setActiveProfileId, userId])

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
      const { data, error } = await supabase.rpc('create_profile_invitation', {
        target_profile_id: profileId,
        target_invited_email: trimmedEmail || null,
      })

      if (error) {
        throw new Error(error.message)
      }

      const token = data ? String(data) : ''

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
      setInvitationInfoText('')
      setInvitationWarningText('')
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
    setInvitationInfoText('')
    setInvitationWarningText('')
    window.sessionStorage.removeItem(PENDING_INVITATION_STORAGE_KEY)
    clearInviteFromUrl()
  }, [])

  return {
    pendingInvitationToken,
    inviteEmail,
    setInviteEmail,
    inviteLink,
    invitationStatusText,
    invitationInfoText,
    invitationErrorText,
    invitationWarningText,
    isInvitationWorking,
    createInvitation,
    copyInviteLink,
    acceptInvitation,
    cancelInvitation,
  }
}
