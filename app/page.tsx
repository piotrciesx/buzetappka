'use client'

import {
  AuthScreen,
  InvitationAcceptScreen,
  MissingProfileScreen,
} from '../components/BudgetAuthScreens'
import BudgetApp from '../components/BudgetApp'
import { useAuthProfile } from '../lib/useAuthProfile'
import { useInvitations } from '../lib/useInvitations'

export default function Home() {
  const {
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
  } = useAuthProfile()
  const {
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
  } = useInvitations({
    profileId,
    userId: user?.id || null,
    setActiveProfileId,
  })


  if (!user) {
    return (
      <AuthScreen
        authErrorText={authErrorText}
        isAuthLoading={isAuthLoading}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        signInWithPassword={signInWithPassword}
        signUpWithPassword={signUpWithPassword}
        resetPassword={resetPassword}
        signInWithGoogle={signInWithGoogle}
      />
    )
  }

  if (pendingInvitationToken) {
    return (
      <InvitationAcceptScreen
        invitationInfoText={invitationInfoText}
        invitationErrorText={invitationErrorText}
        invitationWarningText={invitationWarningText}
        isInvitationWorking={isInvitationWorking}
        acceptInvitation={acceptInvitation}
        cancelInvitation={cancelInvitation}
      />
    )
  }

  if (!profileId) {
    return (
      <MissingProfileScreen
        authErrorText={authErrorText}
        isAuthLoading={isAuthLoading}
        userEmail={user.email || ''}
        createFirstProfile={createFirstProfile}
        signOut={signOut}
      />
    )
  }

  return (
    <BudgetApp
      profileId={profileId}
      userId={user.id}
      userEmail={user.email || ''}
      signOut={signOut}
      inviteEmail={inviteEmail}
      setInviteEmail={setInviteEmail}
      inviteLink={inviteLink}
      invitationStatusText={invitationStatusText}
      invitationErrorText={invitationErrorText}
      isInvitationWorking={isInvitationWorking}
      createInvitation={createInvitation}
      copyInviteLink={copyInviteLink}
      onCurrentUserLeftProfile={async () => {
        setActiveProfileId(null)
        await refreshAuthState()
      }}
    />
  )
}
