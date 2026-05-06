'use client'

import { CSSProperties, useState } from 'react'
import { budgetPageStyles } from '../lib/budgetPageStyles'

type Styles = Record<string, CSSProperties>

type AuthScreenProps = {
  authErrorText: string
  isAuthLoading: boolean
  loginEmail: string
  setLoginEmail: (value: string) => void
  sendMagicLink: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

export function AuthScreen({
  authErrorText,
  isAuthLoading,
  loginEmail,
  setLoginEmail,
  sendMagicLink,
  signInWithGoogle,
}: AuthScreenProps) {
  const styles: Styles = budgetPageStyles

  return (
    <main style={styles.page}>
      <section style={{ ...styles.card, maxWidth: 460, margin: '80px auto' }}>
        <div style={styles.sectionTitle}>Logowanie</div>
        <div style={{ ...styles.pageSubtitle, marginBottom: 16 }}>
          Wpisz email, a wyślemy magic link do logowania.
        </div>

        <form
          style={{ display: 'grid', gap: 12 }}
          onSubmit={(event) => {
            event.preventDefault()
            void sendMagicLink()
          }}
        >
          <label style={styles.sortLabel}>
            Email
            <input
              type="email"
              style={{ ...styles.input, marginTop: 6 }}
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="adres@email.pl"
              disabled={isAuthLoading}
            />
          </label>

          <button type="submit" style={styles.primaryButton} disabled={isAuthLoading}>
            {isAuthLoading ? 'Wysyłanie...' : 'Wyślij magic link'}
          </button>
        </form>

        <div style={{ ...styles.actions, marginTop: 12 }}>
          <button
            type="button"
            style={styles.secondaryButton}
            disabled={isAuthLoading}
            onClick={() => void signInWithGoogle()}
          >
            Zaloguj przez Google
          </button>
        </div>

        {authErrorText && <div style={{ ...styles.infoBox, marginTop: 14 }}>{authErrorText}</div>}
      </section>
    </main>
  )
}

type MissingProfileScreenProps = {
  authErrorText: string
  isAuthLoading: boolean
  userEmail: string
  createFirstProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export function MissingProfileScreen({
  authErrorText,
  isAuthLoading,
  userEmail,
  createFirstProfile,
  signOut,
}: MissingProfileScreenProps) {
  const styles: Styles = budgetPageStyles

  return (
    <main style={styles.page}>
      <section style={{ ...styles.card, maxWidth: 520, margin: '80px auto' }}>
        <div style={styles.sectionTitle}>Nie masz jeszcze profilu budżetu</div>
        <div style={{ ...styles.pageSubtitle, marginBottom: 16 }}>
          Zalogowano jako {userEmail || 'użytkownik'}.
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            style={styles.primaryButton}
            disabled={isAuthLoading}
            onClick={() => void createFirstProfile()}
          >
            {isAuthLoading ? 'Tworzenie...' : 'Utwórz profil'}
          </button>
          <button
            type="button"
            style={styles.secondaryButton}
            disabled={isAuthLoading}
            onClick={() => void signOut()}
          >
            Wyloguj
          </button>
        </div>

        {authErrorText && <div style={{ ...styles.infoBox, marginTop: 14 }}>{authErrorText}</div>}
      </section>
    </main>
  )
}

export function AuthLoadingScreen() {
  const styles: Styles = budgetPageStyles

  return (
    <main style={styles.page}>
      <section style={{ ...styles.card, maxWidth: 460, margin: '80px auto' }}>
        <div style={styles.sectionTitle}>Ładowanie...</div>
      </section>
    </main>
  )
}

type InvitationAcceptScreenProps = {
  invitationInfoText: string
  invitationErrorText: string
  invitationWarningText: string
  isInvitationWorking: boolean
  acceptInvitation: () => Promise<void>
  cancelInvitation: () => void
}

export function InvitationAcceptScreen({
  invitationInfoText,
  invitationErrorText,
  invitationWarningText,
  isInvitationWorking,
  acceptInvitation,
  cancelInvitation,
}: InvitationAcceptScreenProps) {
  const styles: Styles = budgetPageStyles
  const [hasConfirmedWarning, setHasConfirmedWarning] = useState(false)
  const requiresWarningConfirmation = Boolean(invitationWarningText)

  return (
    <main style={styles.page}>
      <section style={{ ...styles.card, maxWidth: 520, margin: '80px auto' }}>
        <div style={styles.sectionTitle}>Zostałeś zaproszony do wspólnego budżetu</div>
        <div style={{ ...styles.pageSubtitle, marginBottom: 16 }}>
          Możesz dołączyć do profilu i zobaczyć wspólne dane budżetu.
        </div>

        {invitationInfoText && (
          <div style={{ ...styles.infoBox, marginTop: 14, marginBottom: 14 }}>
            {invitationInfoText}
          </div>
        )}

        {invitationWarningText && (
          <div
            style={{
              ...styles.infoBox,
              marginTop: 14,
              marginBottom: 14,
              border: '1px solid #f59e0b',
              background: '#fffbeb',
              color: '#92400e',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Uwaga przed dołączeniem</div>
            <div>{invitationWarningText}</div>
            <label
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                marginTop: 12,
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={hasConfirmedWarning}
                disabled={isInvitationWorking}
                onChange={(event) => setHasConfirmedWarning(event.target.checked)}
              />
              <span>Rozumiem i chcę dołączyć do wspólnego profilu.</span>
            </label>
          </div>
        )}

        <div style={styles.actions}>
          {invitationInfoText ? (
            <button
              type="button"
              style={styles.primaryButton}
              disabled={isInvitationWorking}
              onClick={cancelInvitation}
            >
              Przejdź do profilu
            </button>
          ) : (
            <button
              type="button"
              style={styles.primaryButton}
              disabled={
                isInvitationWorking || (requiresWarningConfirmation && !hasConfirmedWarning)
              }
              onClick={() => void acceptInvitation()}
            >
              {isInvitationWorking ? 'Dołączanie...' : 'Dołącz'}
            </button>
          )}
          <button
            type="button"
            style={styles.secondaryButton}
            disabled={isInvitationWorking}
            onClick={cancelInvitation}
          >
            Anuluj
          </button>
        </div>

        {invitationErrorText && (
          <div style={{ ...styles.infoBox, marginTop: 14 }}>{invitationErrorText}</div>
        )}
      </section>
    </main>
  )
}
