'use client'

import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import UserAvatar from './UserAvatar'
import { USER_AVATARS, getUserDisplayName, type UserPublicProfile } from '../lib/userAppearance'

type ProfileMemberRole = 'owner' | 'member'

type ProfileMemberRow = {
  user_id: string
  role: ProfileMemberRole | string | null
}

type ProfileMembersPanelProps = {
  profileId: string
  userId: string
  userEmail: string
  inviteEmail: string
  setInviteEmail: (value: string) => void
  inviteLink: string
  invitationStatusText: string
  invitationErrorText: string
  isInvitationWorking: boolean
  createInvitation: () => Promise<void>
  copyInviteLink: () => Promise<void>
  onCurrentUserLeftProfile: () => Promise<void>
  styles: Record<string, CSSProperties>
}

const getDedupedMembers = (members: ProfileMemberRow[]) => {
  const membersByUserId = new Map<string, ProfileMemberRow>()

  members.forEach((member) => {
    const userId = member.user_id || ''

    if (!userId) {
      return
    }

    const existingMember = membersByUserId.get(userId)

    if (!existingMember || (existingMember.role !== 'owner' && member.role === 'owner')) {
      membersByUserId.set(userId, member)
    }
  })

  return Array.from(membersByUserId.values())
}

export default function ProfileMembersPanel({
  profileId,
  userId,
  userEmail,
  inviteEmail,
  setInviteEmail,
  inviteLink,
  invitationStatusText,
  invitationErrorText,
  isInvitationWorking,
  createInvitation,
  copyInviteLink,
  onCurrentUserLeftProfile,
  styles,
}: ProfileMembersPanelProps) {
  const [members, setMembers] = useState<ProfileMemberRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMembershipActionWorking, setIsMembershipActionWorking] = useState(false)
  const [isDeleteAccountPanelOpen, setIsDeleteAccountPanelOpen] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteAccountConfirmationText, setDeleteAccountConfirmationText] = useState('')
  const [publicProfilesByUserId, setPublicProfilesByUserId] = useState<Record<string, UserPublicProfile>>({})
  const [displayNameDraft, setDisplayNameDraft] = useState('')
  const [avatarKeyDraft, setAvatarKeyDraft] = useState(USER_AVATARS[0]?.key || '')
  const [isSavingPublicProfile, setIsSavingPublicProfile] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [statusText, setStatusText] = useState('')
  const [deleteAccountStatusText, setDeleteAccountStatusText] = useState('')

  const loadMembers = useCallback(async () => {
    if (!profileId) {
      setMembers([])
      return
    }

    setIsLoading(true)
    setErrorText('')
    setStatusText('')

    try {
      const { data, error } = await supabase
        .from('profile_users')
        .select('user_id, role')
        .eq('profile_id', profileId)
        .order('role', { ascending: false })
        .order('user_id', { ascending: true })

      if (error) {
        throw new Error(error.message)
      }

      setMembers(getDedupedMembers((data as ProfileMemberRow[] | null) ?? []))
    } catch (error) {
      setMembers([])
      setErrorText(
        error instanceof Error ? error.message : 'Nie udało się wczytać członków profilu.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [profileId])

  const loadPublicProfiles = useCallback(async (nextMembers: ProfileMemberRow[] = members) => {
    const userIds = Array.from(new Set(nextMembers.map((member) => member.user_id).filter(Boolean)))

    if (userIds.length === 0) {
      setPublicProfilesByUserId({})
      return
    }

    const { data, error } = await supabase
      .from('user_public_profiles')
      .select('user_id, display_name, avatar_key')
      .in('user_id', userIds)

    if (error) {
      setPublicProfilesByUserId({})
      return
    }

    setPublicProfilesByUserId(
      Object.fromEntries(((data as UserPublicProfile[] | null) || []).map((profile) => [profile.user_id, profile]))
    )
  }, [members])

  useEffect(() => {
    void loadMembers()
  }, [loadMembers])

  useEffect(() => {
    void loadPublicProfiles()
  }, [loadPublicProfiles])

  useEffect(() => {
    const currentProfile = publicProfilesByUserId[userId]
    setDisplayNameDraft(currentProfile?.display_name || '')
    setAvatarKeyDraft(currentProfile?.avatar_key || USER_AVATARS[0]?.key || '')
  }, [publicProfilesByUserId, userEmail, userId])

  const currentMember = useMemo(
    () => members.find((member) => member.user_id === userId) || null,
    [members, userId]
  )
  const currentUserRole = currentMember?.role || null
  const canInvite = currentUserRole === 'owner'
  const isCurrentUserOwner = currentUserRole === 'owner'
  const isCurrentUserMember = currentUserRole === 'member'
  const hasTransferTarget = members.some(
    (member) => member.user_id !== userId && member.role === 'member'
  )
  const hasOtherProfileMembers = members.some((member) => member.user_id !== userId)
  const isSoleOwner = isCurrentUserOwner && !hasOtherProfileMembers
  const isOwnerWithOtherMembers = isCurrentUserOwner && hasOtherProfileMembers

  const getMemberProfile = (member: ProfileMemberRow) => publicProfilesByUserId[member.user_id] || null

  const getMemberLabel = (member: ProfileMemberRow) =>
    getUserDisplayName(
      getMemberProfile(member),
      member.user_id === userId ? userEmail : '',
      member.user_id === userId ? 'Ty' : 'Członek profilu'
    )

  const handleSavePublicProfile = async () => {
    if (!userId) {
      return
    }

    setIsSavingPublicProfile(true)
    setErrorText('')
    setStatusText('')

    try {
      const { error } = await supabase.from('user_public_profiles').upsert(
        {
          user_id: userId,
          display_name: displayNameDraft.trim() || null,
          avatar_key: avatarKeyDraft || null,
        },
        { onConflict: 'user_id' }
      )

      if (error) {
        throw new Error(error.message)
      }

      await loadPublicProfiles()
      window.dispatchEvent(new CustomEvent('budget-user-profile-updated'))
      setStatusText('Zapisano profil użytkownika.')
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Nie udało się zapisać profilu użytkownika.')
    } finally {
      setIsSavingPublicProfile(false)
    }
  }

  const handleRemoveMember = async (member: ProfileMemberRow) => {
    if (member.user_id === userId || member.role !== 'member') {
      return
    }

    const confirmed = confirm(
      'Czy na pewno usunąć tego użytkownika z profilu? Straci dostęp do budżetu, ale jego dotychczasowe wpisy zostaną w historii profilu.'
    )

    if (!confirmed) {
      return
    }

    setIsMembershipActionWorking(true)
    setErrorText('')
    setStatusText('')

    try {
      const { error } = await supabase.rpc('remove_profile_member', {
        target_profile_id: profileId,
        target_user_id: member.user_id,
      })

      if (error) {
        throw new Error(error.message)
      }

      await loadMembers()
      setStatusText('Usunięto użytkownika z profilu. Jego wpisy zostały w historii.')
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : 'Nie udało się usunąć użytkownika z profilu.'
      )
    } finally {
      setIsMembershipActionWorking(false)
    }
  }

  const handleTransferOwnership = async (member: ProfileMemberRow) => {
    if (!isCurrentUserOwner || member.user_id === userId || member.role !== 'member') {
      return
    }

    const confirmed = confirm(
      'Czy na pewno przekazać rolę właściciela temu użytkownikowi? Stracisz uprawnienia ownera i zostaniesz memberem.'
    )

    if (!confirmed) {
      return
    }

    setIsMembershipActionWorking(true)
    setErrorText('')
    setStatusText('')

    try {
      const { error } = await supabase.rpc('transfer_profile_ownership', {
        target_profile_id: profileId,
        next_owner_user_id: member.user_id,
      })

      if (error) {
        throw new Error(error.message)
      }

      await loadMembers()
      setStatusText('Przekazano rolę ownera. Twoja rola została zmieniona na member.')
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : 'Nie udało się przekazać roli ownera.'
      )
    } finally {
      setIsMembershipActionWorking(false)
    }
  }

  const handleLeaveProfile = async () => {
    if (isCurrentUserOwner) {
      setStatusText('Przed opuszczeniem profilu przekaż rolę ownera innemu członkowi.')
      setErrorText('')
      return
    }

    if (!isCurrentUserMember) {
      return
    }

    const confirmed = confirm(
      'Czy na pewno opuścić ten profil? Stracisz dostęp do budżetu, ale Twoje dotychczasowe wpisy zostaną w historii profilu.'
    )

    if (!confirmed) {
      return
    }

    setIsMembershipActionWorking(true)
    setErrorText('')
    setStatusText('')

    try {
      const { error } = await supabase.rpc('leave_profile', {
        target_profile_id: profileId,
      })

      if (error) {
        throw new Error(error.message)
      }

      await onCurrentUserLeftProfile()
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Nie udało się opuścić profilu.')
      setIsMembershipActionWorking(false)
    }
  }

  const handleDeleteOwnAccount = async () => {
    setDeleteAccountStatusText('')
    setErrorText('')

    if (isOwnerWithOtherMembers) {
      setDeleteAccountStatusText(
        'Przed usunięciem konta przekaż rolę ownera innemu członkowi profilu.'
      )
      return
    }

    if (isSoleOwner && deleteAccountConfirmationText.trim() !== 'USUŃ KONTO') {
      setDeleteAccountStatusText('Aby usunąć konto i profil, wpisz: USUŃ KONTO')
      return
    }

    if (isCurrentUserMember) {
      const confirmed = confirm(
        'Czy na pewno usunąć konto? Stracisz dostęp do profili, ale Twoje dotychczasowe wpisy zostaną w historii budżetów.'
      )

      if (!confirmed) {
        return
      }
    }

    if (isSoleOwner) {
      const firstConfirmed = confirm(
        'Czy na pewno usunąć konto razem z tym profilem budżetu? Tej operacji nie da się łatwo cofnąć.'
      )

      if (!firstConfirmed) {
        return
      }

      const secondConfirmed = confirm(
        'Ostatnie potwierdzenie: profil i dane powiązane z profilem zostaną usunięte, a konto zostanie wylogowane.'
      )

      if (!secondConfirmed) {
        return
      }
    }

    setIsDeletingAccount(true)

    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw new Error(error.message)
      }

      const accessToken = data.session?.access_token

      if (!accessToken) {
        throw new Error('Brak aktywnej sesji użytkownika.')
      }

      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activeProfileId: profileId,
          confirmationText: deleteAccountConfirmationText.trim(),
        }),
      })
      const responseBody = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        throw new Error(responseBody?.error || 'Nie udało się usunąć konta.')
      }

      await supabase.auth.signOut()
      await onCurrentUserLeftProfile()
    } catch (error) {
      setDeleteAccountStatusText(
        error instanceof Error ? error.message : 'Nie udało się usunąć konta.'
      )
      setIsDeletingAccount(false)
    }
  }

  return (
    <section style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #e5e7eb' }}>
      <div data-user-public-profile-editor="true">
        <div data-user-public-profile-preview="true">
          <UserAvatar avatarKey={avatarKeyDraft} label={displayNameDraft || 'Użytkownik'} size="lg" />
          <div>
            <strong>{displayNameDraft || userEmail || 'Użytkownik'}</strong>
            <span>{userEmail}</span>
          </div>
        </div>
        <label>
          Nazwa użytkownika
          <input
            value={displayNameDraft}
            onChange={(event) => setDisplayNameDraft(event.target.value)}
            maxLength={48}
            placeholder="np. Jacek"
            disabled={isSavingPublicProfile}
          />
        </label>
        <div data-user-avatar-picker="true">
          {USER_AVATARS.map((avatar) => (
            <button
              key={avatar.key}
              type="button"
              data-active={avatarKeyDraft === avatar.key ? 'true' : 'false'}
              title={avatar.label}
              onClick={() => setAvatarKeyDraft(avatar.key)}
              disabled={isSavingPublicProfile}
            >
              <UserAvatar avatarKey={avatar.key} label={displayNameDraft || avatar.label} size="sm" />
            </button>
          ))}
        </div>
        <button
          type="button"
          style={styles.secondaryButton}
          disabled={isSavingPublicProfile}
          onClick={() => void handleSavePublicProfile()}
        >
          {isSavingPublicProfile ? 'Zapisywanie...' : 'Zapisz profil'}
        </button>
      </div>

      <div style={styles.l2Name}>Członkowie profilu</div>

      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
        {isLoading && <div style={styles.smallMutedText}>Ładowanie członków...</div>}

        {!isLoading &&
          members.map((member) => (
            <div
              key={member.user_id || `${profileId}-${member.role || 'member'}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '8px 10px',
                flexWrap: 'wrap',
              }}
            >
              <div data-profile-member-identity="true">
                <UserAvatar
                  avatarKey={getMemberProfile(member)?.avatar_key}
                  label={getMemberLabel(member)}
                  size="md"
                />
                <div>
                  <div style={{ fontWeight: 600 }}>{getMemberLabel(member)}</div>
                  <div style={styles.smallMutedText}>
                    {member.user_id === userId ? userEmail : 'członek profilu'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>{member.role || 'member'}</span>
                {member.user_id === userId && <span style={styles.smallMutedText}>to Ty</span>}
                {isCurrentUserOwner && member.user_id !== userId && member.role === 'member' && (
                  <>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      disabled={isMembershipActionWorking}
                      onClick={() => void handleTransferOwnership(member)}
                    >
                      Przekaż ownera
                    </button>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      disabled={isMembershipActionWorking}
                      onClick={() => void handleRemoveMember(member)}
                    >
                      Usuń z profilu
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

        {!isLoading && members.length === 0 && !errorText && (
          <div style={styles.smallMutedText}>Brak członków do wyświetlenia.</div>
        )}

        {errorText && <div style={styles.infoBox}>{errorText}</div>}
        {statusText && <div style={styles.smallMutedText}>{statusText}</div>}
      </div>

      <div style={{ marginTop: 16 }}>
        {isCurrentUserMember && (
          <button
            type="button"
            style={styles.secondaryButton}
            disabled={isMembershipActionWorking}
            onClick={() => void handleLeaveProfile()}
          >
            Opuść profil
          </button>
        )}

        {isCurrentUserOwner && (
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={styles.smallMutedText}>
              Przed opuszczeniem profilu przekaż rolę ownera innemu członkowi.
            </div>
            {!hasTransferTarget && (
              <div style={styles.smallMutedText}>
                Aby przekazać rolę ownera, najpierw zaproś drugą osobę.
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={styles.l2Name}>Zaproś osobę</div>

        {canInvite ? (
          <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
              <label style={{ ...styles.sortLabel, minWidth: 260 }}>
                Email osoby zapraszanej
                <input
                  type="email"
                  style={{ ...styles.input, marginTop: 6 }}
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="opcjonalnie"
                  disabled={isInvitationWorking}
                />
              </label>
              <button
                type="button"
                style={styles.secondaryButton}
                disabled={isInvitationWorking}
                onClick={() => void createInvitation()}
              >
                {isInvitationWorking ? 'Tworzenie...' : 'Zaproś osobę'}
              </button>
            </div>

            {inviteLink && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <input style={{ ...styles.input, flex: '1 1 320px' }} value={inviteLink} readOnly />
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => void copyInviteLink()}
                >
                  Kopiuj
                </button>
              </div>
            )}

            {invitationStatusText && <div style={styles.smallMutedText}>{invitationStatusText}</div>}
            {invitationErrorText && <div style={styles.infoBox}>{invitationErrorText}</div>}
          </div>
        ) : (
          <div style={{ ...styles.smallMutedText, marginTop: 8 }}>
            Zaproszenia może tworzyć właściciel profilu.
          </div>
        )}
      </div>

      <section
        style={{
          marginTop: 22,
          paddingTop: 16,
          borderTop: '1px solid #fecaca',
          display: 'grid',
          gap: 10,
        }}
      >
        <div style={{ ...styles.l2Name, color: '#b91c1c' }}>Usuń konto</div>
        <div style={styles.smallMutedText}>
          To jest trwała akcja dotycząca Twojego konta użytkownika. Wpisy we wspólnych
          budżetach pozostają jako historia profilu.
        </div>
        <button
          type="button"
          style={{ ...styles.secondaryButton, borderColor: '#fecaca', color: '#b91c1c' }}
          onClick={() => {
            setIsDeleteAccountPanelOpen((previousValue) => !previousValue)
            setDeleteAccountStatusText('')
          }}
        >
          Usuń moje konto
        </button>

        {isDeleteAccountPanelOpen && (
          <div
            style={{
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: 12,
              background: '#fff7f7',
              display: 'grid',
              gap: 10,
            }}
          >
            {isOwnerWithOtherMembers && (
              <div style={styles.infoBox}>
                Przed usunięciem konta przekaż rolę ownera innemu członkowi profilu.
              </div>
            )}

            {isCurrentUserMember && (
              <div style={styles.smallMutedText}>
                Usunięcie konta usunie Twoje członkostwa w profilach i wyloguje Cię. Twoje
                dotychczasowe wpisy zostaną w budżetach jako historia profilu.
              </div>
            )}

            {isSoleOwner && (
              <>
                <div style={styles.infoBox}>
                  Jesteś jedynym członkiem tego profilu. Usunięcie konta usunie również profil
                  budżetu oraz dane powiązane z tym profilem.
                </div>
                <label style={styles.sortLabel}>
                  Wpisz USUŃ KONTO
                  <input
                    type="text"
                    style={{ ...styles.input, marginTop: 6 }}
                    value={deleteAccountConfirmationText}
                    onChange={(event) => setDeleteAccountConfirmationText(event.target.value)}
                    disabled={isDeletingAccount}
                  />
                </label>
              </>
            )}

            {!isOwnerWithOtherMembers && (
              <button
                type="button"
                style={{ ...styles.secondaryButton, borderColor: '#ef4444', color: '#b91c1c' }}
                disabled={
                  isDeletingAccount ||
                  isMembershipActionWorking ||
                  (isSoleOwner && deleteAccountConfirmationText.trim() !== 'USUŃ KONTO')
                }
                onClick={() => void handleDeleteOwnAccount()}
              >
                {isDeletingAccount ? 'Usuwanie...' : 'Potwierdź usunięcie konta'}
              </button>
            )}

            {deleteAccountStatusText && <div style={styles.infoBox}>{deleteAccountStatusText}</div>}
          </div>
        )}
      </section>
    </section>
  )
}
