'use client'

import { CSSProperties, useState } from 'react'

type Styles = Record<string, CSSProperties>

type AuthScreenProps = {
  authErrorText: string
  isAuthLoading: boolean
  loginEmail: string
  setLoginEmail: (value: string) => void
  signInWithPassword: (identifier: string, password: string) => Promise<void>
  signUpWithPassword: (params: {
    username: string
    email: string
    password: string
  }) => Promise<void>
  resetPassword: (identifier: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
}

type AuthMode = 'login' | 'register'

const NAVY = '#071a3d'
const BLUE = '#0f5fe8'
const SOFT_TEXT = '#64748b'
const BORDER = 'rgba(126, 153, 190, 0.28)'

const authStyles: Styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    background:
      'radial-gradient(circle at 18% 20%, rgba(37,99,235,.18), transparent 35%), radial-gradient(circle at 72% 78%, rgba(96,165,250,.24), transparent 38%), linear-gradient(135deg, #f7fbff 0%, #eaf3ff 52%, #f8fbff 100%)',
    color: NAVY,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shell: {
    width: 'min(1180px, 100%)',
    minHeight: 670,
    display: 'grid',
    gridTemplateColumns: '1.06fr .94fr',
    overflow: 'hidden',
    borderRadius: 34,
    border: `1px solid ${BORDER}`,
    background: 'rgba(255, 255, 255, 0.72)',
    boxShadow: '0 30px 90px rgba(7, 26, 61, 0.13)',
    backdropFilter: 'blur(18px)',
  },
  brandPane: {
    position: 'relative',
    padding: '48px 56px 42px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background:
      'radial-gradient(circle at top left, rgba(96,165,250,.16), transparent 34%), radial-gradient(circle at bottom right, rgba(37,99,235,.12), transparent 38%), linear-gradient(135deg, rgba(255,255,255,.82), rgba(232,242,255,.74))',
  },
  authPane: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 44,
    background: 'rgba(255,255,255,.72)',
  },
  tagline: {
    marginTop: 12,
    color: '#60708f',
    fontSize: 27,
    fontWeight: 300,
    letterSpacing: '-0.045em',
  },
  taglineAccent: {
    color: BLUE,
    fontWeight: 420,
  },
  blueStroke: {
    width: 72,
    height: 3,
    marginTop: 18,
    borderRadius: 999,
    background: BLUE,
  },
  featureRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
    marginTop: 24,
    marginBottom: 26,
  },
  featureItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 7,
  },
  featureIcon: {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
  },
  featureTitle: {
    margin: 0,
    color: NAVY,
    fontSize: 13,
    lineHeight: 1.15,
    fontWeight: 560,
    letterSpacing: '-0.03em',
  },
  featureText: {
    margin: 0,
    color: '#60708f',
    fontSize: 11.5,
    lineHeight: 1.2,
    fontWeight: 400,
    maxWidth: 110,
  },
  previewPlaceholder: {
    position: 'relative',
    flex: 1,
    minHeight: 340,
    marginTop: 6,
    borderRadius: 28,
    border: '1px dashed rgba(15, 95, 232, 0.28)',
    background:
      'linear-gradient(145deg, rgba(255,255,255,.45), rgba(208,228,255,.28))',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.8), 0 22px 70px rgba(7,26,61,.08)',
    overflow: 'hidden',
  },
  previewLabel: {
    position: 'absolute',
    left: 28,
    top: 26,
    maxWidth: 310,
    padding: '12px 16px',
    borderRadius: 16,
    background: 'rgba(255,255,255,.68)',
    border: '1px solid rgba(126,153,190,.22)',
    color: '#52627f',
    fontSize: 13,
    lineHeight: 1.35,
    fontWeight: 520,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    padding: '52px 44px',
    borderRadius: 32,
    border: '1px solid rgba(126,153,190,.2)',
    background: 'rgba(255,255,255,.9)',
    boxShadow: '0 24px 72px rgba(7,26,61,.11)',
  },
  cardTitle: {
    margin: 0,
    color: NAVY,
    fontSize: 34,
    lineHeight: 1.1,
    fontWeight: 620,
    letterSpacing: '-0.045em',
    textAlign: 'center',
  },
  cardSubtitle: {
    margin: '12px 0 34px',
    color: SOFT_TEXT,
    fontSize: 16,
    lineHeight: 1.5,
    fontWeight: 350,
    textAlign: 'center',
  },
  appNameAccent: {
    color: BLUE,
    fontWeight: 560,
  },
  modeSwitch: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
    marginBottom: 24,
    padding: 5,
    borderRadius: 18,
    border: `1px solid ${BORDER}`,
    background: 'rgba(226, 238, 255, 0.62)',
  },
  modeButton: {
    minHeight: 42,
    border: 0,
    borderRadius: 14,
    background: 'transparent',
    color: SOFT_TEXT,
    fontSize: 14,
    fontWeight: 560,
    cursor: 'pointer',
  },
  modeButtonActive: {
    background: '#ffffff',
    color: NAVY,
    boxShadow: '0 10px 26px rgba(7,26,61,.09)',
  },
  form: {
    display: 'grid',
    gap: 14,
  },
  inputShell: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 58,
    padding: '0 18px',
    borderRadius: 18,
    border: `1px solid ${BORDER}`,
    background: 'rgba(255,255,255,.74)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.82)',
  },
  input: {
    width: '100%',
    border: 0,
    outline: 0,
    background: 'transparent',
    color: NAVY,
    fontSize: 15,
    fontWeight: 360,
  },
  primaryButton: {
    minHeight: 58,
    marginTop: 8,
    border: 0,
    borderRadius: 18,
    background: 'linear-gradient(135deg, #2563eb, #0f5fe8)',
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 560,
    cursor: 'pointer',
    boxShadow: '0 18px 38px rgba(37,99,235,.28)',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    margin: '28px 0',
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 350,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: 'rgba(148,163,184,.26)',
  },
  secondaryButton: {
    width: '100%',
    minHeight: 54,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 17,
    border: `1px solid ${BORDER}`,
    background: 'rgba(255,255,255,.74)',
    color: NAVY,
    fontSize: 15,
    fontWeight: 520,
    cursor: 'pointer',
  },
  textButton: {
    width: 'fit-content',
    margin: '2px auto 0',
    border: 0,
    background: 'transparent',
    color: BLUE,
    fontSize: 14,
    fontWeight: 560,
    cursor: 'pointer',
  },
  secureText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 28,
    color: '#64748b',
    fontSize: 13,
    fontWeight: 420,
  },
  infoBox: {
    marginBottom: 18,
    padding: '14px 16px',
    borderRadius: 18,
    border: '1px solid rgba(37,99,235,.24)',
    background: 'rgba(37,99,235,.10)',
    color: '#1e3a8a',
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 500,
  },
  compactPage: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background:
      'radial-gradient(circle at 20% 20%, rgba(37,99,235,.14), transparent 34%), linear-gradient(135deg, #f8fbff 0%, #eef4fb 48%, #f8fafc 100%)',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  compactCard: {
    width: 'min(520px, 100%)',
    padding: 34,
    borderRadius: 28,
    border: `1px solid ${BORDER}`,
    background: 'rgba(255,255,255,.9)',
    boxShadow: '0 24px 72px rgba(7,26,61,.12)',
  },
  compactTitle: {
    margin: 0,
    color: NAVY,
    fontSize: 26,
    lineHeight: 1.15,
    fontWeight: 620,
    letterSpacing: '-0.04em',
  },
  compactSubtitle: {
    marginTop: 10,
    marginBottom: 22,
    color: SOFT_TEXT,
    fontSize: 15,
    lineHeight: 1.5,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
  },
  dangerBox: {
    padding: '14px 16px',
    borderRadius: 18,
    border: '1px solid #f59e0b',
    background: '#fffbeb',
    color: '#92400e',
    fontSize: 14,
    lineHeight: 1.45,
  },
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="#64748b" strokeWidth="1.8" />
      <path d="M5 7.5l7 5 7-5" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5.5" y="10" width="13" height="10" rx="2.5" stroke="#64748b" strokeWidth="1.8" />
      <path d="M8.5 10V8a3.5 3.5 0 017 0v2" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}

function FeatureSvg({ type }: { type: 'eye' | 'shield' | 'leaf' }) {
  if (type === 'eye') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12s3.4-6 9-6 9 6 9 6-3.4 6-9 6-9-6-9-6z" stroke={BLUE} strokeWidth="1.8" />
        <circle cx="12" cy="12" r="2.8" stroke={BLUE} strokeWidth="1.8" />
      </svg>
    )
  }

  if (type === 'shield') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3.5l7 3v5.3c0 4.3-2.8 7.4-7 8.7-4.2-1.3-7-4.4-7-8.7V6.5l7-3z" stroke={BLUE} strokeWidth="1.8" />
        <path d="M8.8 12.1l2.1 2.1 4.5-4.7" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20c-3.5-2.4-5.5-5.4-5.5-8.3C6.5 7.8 9.2 5 12 4c2.8 1 5.5 3.8 5.5 7.7 0 2.9-2 5.9-5.5 8.3z" stroke={BLUE} strokeWidth="1.8" />
      <path d="M12 20v-8" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function BudgetAppLogo({
  compact = false,
  dark = false,
}: {
  compact?: boolean
  dark?: boolean
}) {
  return (
    <img
      src={
        dark
          ? '/brand/budzappka-logo-dark.png'
          : '/brand/budzappka-logo-light.png'
      }
      alt="BudżAppka"
      style={{
        display: 'block',
        width: compact ? 180 : 470,
        maxWidth: '100%',
        height: 'auto',
        objectFit: 'contain',
        background: 'transparent',
      }}
    />
  )
}

function FeatureItem({
  icon,
  title,
  text,
}: {
  icon: 'eye' | 'shield' | 'leaf'
  title: string
  text: string
}) {
  return (
    <div style={authStyles.featureItem}>
      <div style={authStyles.featureIcon}>
        <FeatureSvg type={icon} />
      </div>
      <div>
        <p style={authStyles.featureTitle}>{title}</p>
        <p
          style={authStyles.featureText}
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
    </div>
  )
}

function AuthBrandPane() {
  return (
    <section style={authStyles.brandPane}>
      <BudgetAppLogo />

      <div style={authStyles.tagline}>
        Finanse <span style={authStyles.taglineAccent}>pod kontrolą.</span>
      </div>

      <div style={authStyles.blueStroke} />

      <div style={authStyles.featureRow}>
        <FeatureItem
          icon="eye"
          title="Przejrzystość"
          text="Wszystkie&nbsp;finanse<br />w&nbsp;jednym&nbsp;miejscu"
        />

        <FeatureItem
          icon="shield"
          title="Kontrola"
          text="Planuj,&nbsp;analizuj<br />i&nbsp;oszczędzaj"
        />

        <FeatureItem
          icon="leaf"
          title="Spokój"
          text="Świadome&nbsp;decyzje,<br />mniej&nbsp;chaosu"
        />
      </div>

      <div style={authStyles.previewPlaceholder}>
        <div style={authStyles.previewLabel}>
          Miejsce na prawdziwy, podrasowany screenshot aplikacji
        </div>
      </div>
    </section>
  )
}

export function AuthScreen({
  authErrorText,
  isAuthLoading,
  loginEmail,
  setLoginEmail,
  signInWithPassword,
  signUpWithPassword,
  resetPassword,
  signInWithGoogle,
}: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [authValidationText, setAuthValidationText] = useState('')
  const isRegisterMode = authMode === 'register'
  const visibleAuthText = authValidationText || authErrorText
  const usernamePattern = /^[A-Za-z0-9._-]+$/

  const passwordError = () => {
    if (isRegisterMode) {
      const nextUsername = username.trim()

      if (!nextUsername) {
        return 'Podaj login.'
      }

      if (nextUsername.length < 3) {
        return 'Login musi mieć minimum 3 znaki.'
      }

      if (!usernamePattern.test(nextUsername)) {
        return 'Login może zawierać tylko litery, cyfry, myślnik, podkreślnik i kropkę.'
      }
    }

    if (!loginEmail.trim()) {
      return isRegisterMode ? 'Podaj adres email.' : 'Podaj login lub email.'
    }

    if (!password) {
      return 'Podaj hasło.'
    }

    if (password.length < 6) {
      return 'Hasło musi mieć minimum 6 znaków.'
    }

    if (isRegisterMode && password !== repeatPassword) {
      return 'Hasła muszą być takie same.'
    }

    return ''
  }

  const handlePasswordSubmit = async () => {
    const validationError = passwordError()

    if (validationError) {
      setAuthValidationText(validationError)
      return
    }

    setAuthValidationText('')

    if (isRegisterMode) {
      await signUpWithPassword({
        username,
        email: loginEmail,
        password,
      })
      return
    }

    await signInWithPassword(loginEmail, password)
  }

  return (
    <main style={authStyles.page}>
      <div style={authStyles.shell}>
        <AuthBrandPane />

        <section style={authStyles.authPane}>
          <div style={authStyles.card}>
            <h1 style={authStyles.cardTitle}>
              {isRegisterMode ? 'Utwórz konto' : 'Witaj z powrotem!'}
            </h1>
            <p style={authStyles.cardSubtitle}>
              {isRegisterMode ? 'Dołącz do swojej ' : 'Zaloguj się do swojej '}
              <span style={authStyles.appNameAccent}>BudżAppki</span>
            </p>

            <div style={authStyles.modeSwitch} role="tablist" aria-label="Tryb logowania">
              <button
                type="button"
                role="tab"
                aria-selected={!isRegisterMode}
                style={{
                  ...authStyles.modeButton,
                  ...(!isRegisterMode ? authStyles.modeButtonActive : {}),
                }}
                disabled={isAuthLoading}
                onClick={() => {
                  setAuthValidationText('')
                  setAuthMode('login')
                }}
              >
                Logowanie
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isRegisterMode}
                style={{
                  ...authStyles.modeButton,
                  ...(isRegisterMode ? authStyles.modeButtonActive : {}),
                }}
                disabled={isAuthLoading}
                onClick={() => {
                  setAuthValidationText('')
                  setAuthMode('register')
                }}
              >
                Rejestracja
              </button>
            </div>

            <>
              {visibleAuthText && (
                <div style={authStyles.infoBox}>
                  {visibleAuthText}
                </div>
              )}

              <form
                style={authStyles.form}
                onSubmit={(event) => {
                  event.preventDefault()
                  void handlePasswordSubmit()
                }}
              >
                {!isRegisterMode && (
                  <label style={authStyles.inputShell}>
                    <MailIcon />
                    <input
                      type="text"
                      style={authStyles.input}
                      value={loginEmail}
                      onChange={(event) => {
                        setAuthValidationText('')
                        setLoginEmail(event.target.value)
                      }}
                      placeholder="Login lub email"
                      disabled={isAuthLoading}
                      required
                    />
                  </label>
                )}

                {isRegisterMode && (
                  <>
                    <label style={authStyles.inputShell}>
                      <MailIcon />
                      <input
                        type="text"
                        style={authStyles.input}
                        value={username}
                        onChange={(event) => {
                          setAuthValidationText('')
                          setUsername(event.target.value)
                        }}
                        placeholder="Login"
                        disabled={isAuthLoading}
                        minLength={3}
                        pattern="[A-Za-z0-9._-]+"
                        required
                      />
                    </label>

                    <label style={authStyles.inputShell}>
                      <MailIcon />
                      <input
                        type="email"
                        style={authStyles.input}
                        value={loginEmail}
                        onChange={(event) => {
                          setAuthValidationText('')
                          setLoginEmail(event.target.value)
                        }}
                        placeholder="Email"
                        disabled={isAuthLoading}
                        required
                      />
                    </label>
                  </>
                )}

                <label style={authStyles.inputShell}>
                  <LockIcon />
                  <input
                    type="password"
                    style={authStyles.input}
                    value={password}
                    onChange={(event) => {
                      setAuthValidationText('')
                      setPassword(event.target.value)
                    }}
                    placeholder="Hasło"
                    disabled={isAuthLoading}
                    minLength={6}
                    required
                  />
                </label>

                {isRegisterMode && (
                  <label style={authStyles.inputShell}>
                    <LockIcon />
                    <input
                      type="password"
                      style={authStyles.input}
                      value={repeatPassword}
                      onChange={(event) => {
                        setAuthValidationText('')
                        setRepeatPassword(event.target.value)
                      }}
                      placeholder="Powtórz hasło"
                      disabled={isAuthLoading}
                      minLength={6}
                      required
                    />
                  </label>
                )}

                <button type="submit" style={authStyles.primaryButton} disabled={isAuthLoading}>
                  {isAuthLoading
                    ? isRegisterMode
                      ? 'Tworzenie...'
                      : 'Logowanie...'
                    : isRegisterMode
                      ? 'Utwórz konto'
                      : 'Zaloguj się'}
                </button>

                {!isRegisterMode && (
                  <button
                    type="button"
                    style={authStyles.textButton}
                    disabled={isAuthLoading}
                    onClick={() => void resetPassword(loginEmail)}
                  >
                    Nie pamiętasz hasła?
                  </button>
                )}
              </form>
            </>

            <div style={authStyles.divider}>
              <span style={authStyles.dividerLine} />
              <span>lub</span>
              <span style={authStyles.dividerLine} />
            </div>

            <button
              type="button"
              style={authStyles.secondaryButton}
              disabled={isAuthLoading}
              onClick={() => void signInWithGoogle()}
            >
              <GoogleIcon />
              <span>Kontynuuj przez Google</span>
            </button>

            <div style={authStyles.secureText}>
              <LockIcon />
              <span>Twoje dane są bezpieczne</span>
            </div>

          </div>
        </section>
      </div>
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
  return (
    <main style={authStyles.compactPage}>
      <section style={authStyles.compactCard}>
        <BudgetAppLogo compact />
        <h1 style={{ ...authStyles.compactTitle, marginTop: 22 }}>
          Nie masz jeszcze profilu budżetu
        </h1>
        <div style={authStyles.compactSubtitle}>Zalogowano jako {userEmail || 'użytkownik'}.</div>

        <div style={authStyles.actions}>
          <button
            type="button"
            style={{ ...authStyles.primaryButton, minWidth: 180, marginTop: 0 }}
            disabled={isAuthLoading}
            onClick={() => void createFirstProfile()}
          >
            {isAuthLoading ? 'Tworzenie...' : 'Utwórz profil'}
          </button>
          <button
            type="button"
            style={{ ...authStyles.secondaryButton, width: 'auto', minWidth: 130 }}
            disabled={isAuthLoading}
            onClick={() => void signOut()}
          >
            Wyloguj
          </button>
        </div>

        {authErrorText && <div style={authStyles.infoBox}>{authErrorText}</div>}
      </section>
    </main>
  )
}

export function AuthLoadingScreen() {
  return (
    <main style={authStyles.compactPage}>
      <section style={authStyles.compactCard}>
        <BudgetAppLogo compact />
        <h1 style={{ ...authStyles.compactTitle, marginTop: 22 }}>Ładowanie...</h1>
        <div style={authStyles.compactSubtitle}>Przygotowujemy Twoją BudżAppkę.</div>
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
  const [hasConfirmedWarning, setHasConfirmedWarning] = useState(false)
  const requiresWarningConfirmation = Boolean(invitationWarningText)

  return (
    <main style={authStyles.compactPage}>
      <section style={authStyles.compactCard}>
        <BudgetAppLogo compact />
        <h1 style={{ ...authStyles.compactTitle, marginTop: 22 }}>
          Zostałeś zaproszony do wspólnego budżetu
        </h1>
        <div style={authStyles.compactSubtitle}>
          Możesz dołączyć do profilu i zobaczyć wspólne dane budżetu.
        </div>

        {invitationInfoText && <div style={authStyles.infoBox}>{invitationInfoText}</div>}

        {invitationWarningText && (
          <div style={{ ...authStyles.dangerBox, marginTop: 14, marginBottom: 14 }}>
            <div style={{ fontWeight: 620, marginBottom: 8 }}>Uwaga przed dołączeniem</div>
            <div>{invitationWarningText}</div>
            <label
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                marginTop: 12,
                fontWeight: 560,
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

        <div style={authStyles.actions}>
          {invitationInfoText ? (
            <button
              type="button"
              style={{ ...authStyles.primaryButton, minWidth: 180, marginTop: 0 }}
              disabled={isInvitationWorking}
              onClick={cancelInvitation}
            >
              Przejdź do profilu
            </button>
          ) : (
            <button
              type="button"
              style={{ ...authStyles.primaryButton, minWidth: 150, marginTop: 0 }}
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
            style={{ ...authStyles.secondaryButton, width: 'auto', minWidth: 120 }}
            disabled={isInvitationWorking}
            onClick={cancelInvitation}
          >
            Anuluj
          </button>
        </div>

        {invitationErrorText && <div style={authStyles.infoBox}>{invitationErrorText}</div>}
      </section>
    </main>
  )
}
