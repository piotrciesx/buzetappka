'use client'

import { CSSProperties, ReactNode } from 'react'
import {
  AppModuleKey,
  AppModuleVisibility,
  DEFAULT_APP_MODULE_VISIBILITY,
} from '../lib/useAppModuleVisibility'

type AppSettingsPanelProps = {
  simpleMode: boolean
  onSimpleModeChange: (value: boolean) => void
  autoExcludePartialMonths: boolean
  onAutoExcludePartialMonthsChange: (value: boolean) => void
  budgetStartDate: string
  currentMonth: string
  minAllowedMonth: string | null
  maxAllowedMonth: string | null
  monthNavigationFutureLocked: boolean
  isSavingMonthNavigationSettings: boolean
  monthNavigationErrorText: string
  onBudgetStartDateChange: (value: string) => void
  onMonthNavigationFutureLockedChange: (value: boolean) => void
  onSaveMonthNavigationSettings: () => void
  draftVisibleModules: AppModuleVisibility
  saveStatusText: string
  onChangeModuleVisibility: (moduleKey: AppModuleKey, isVisible: boolean) => void
  onSave: () => void | Promise<void>
  onResetDraft: () => void
  onLockAllPastMonths: () => Promise<void>
  onUnlockAllPastMonths: () => Promise<void>
  onResetSelectedMonthData: () => Promise<void>
  onResetAllHistory: () => Promise<void>
  styles: Record<string, CSSProperties>
  defaultOpen?: boolean
  userEmail?: string
  onExportBackupJson?: () => void | Promise<void>
  onExportBackupCsv?: () => void | Promise<void>
  profileMembersPanel?: ReactNode
}

const moduleItems: Array<{ key: AppModuleKey; label: string; description: string }> = [
  {
    key: 'paymentSources',
    label: 'Źródła płatności',
    description: 'Karty, konta, gotówka i domyślne źródła.',
  },
  {
    key: 'recurringTransactions',
    label: 'Przypomnienia / raty',
    description: 'Cykliczne wpisy, raty i przypomnienia.',
  },
  {
    key: 'financialGoals',
    label: 'Cele finansowe',
    description: 'Cele, priorytety i miesięczne alokacje.',
  },
  {
    key: 'budgetLimits',
    label: 'Limity / alerty',
    description: 'Alerty i kontrola wydatków w kategoriach.',
  },
]

type SwitchProps = {
  checked: boolean
  disabled?: boolean
  onChange?: (value: boolean) => void
}

const SettingsSwitch = ({ checked, disabled = false, onChange }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    data-settings-switch="true"
    data-state={checked ? 'on' : 'off'}
    onClick={() => onChange?.(!checked)}
  >
    <span data-settings-switch-label="true">{checked ? 'Wł.' : 'Wył.'}</span>
    <span data-settings-switch-knob="true" />
  </button>
)

const getLastDateOfMonth = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)

  if (!year || !month) {
    return undefined
  }

  const lastDay = new Date(year, month, 0).getDate()
  return `${monthText}-${String(lastDay).padStart(2, '0')}`
}

export default function AppSettingsPanel({
  simpleMode,
  onSimpleModeChange,
  autoExcludePartialMonths,
  onAutoExcludePartialMonthsChange,
  budgetStartDate,
  currentMonth,
  minAllowedMonth,
  maxAllowedMonth,
  monthNavigationFutureLocked,
  isSavingMonthNavigationSettings,
  monthNavigationErrorText,
  onBudgetStartDateChange,
  onMonthNavigationFutureLockedChange,
  onSaveMonthNavigationSettings,
  draftVisibleModules,
  saveStatusText,
  onChangeModuleVisibility,
  onSave,
  onResetDraft,
  onLockAllPastMonths,
  onUnlockAllPastMonths,
  onResetSelectedMonthData,
  onResetAllHistory,
  defaultOpen: ignoredDefaultOpen = false,
  userEmail,
  profileMembersPanel,
}: AppSettingsPanelProps) {
  void ignoredDefaultOpen

  const effectiveAutoExcludePartialMonths = autoExcludePartialMonths !== false
  const budgetStartMaxDate = currentMonth ? getLastDateOfMonth(currentMonth) : undefined
  const isDraftDefault = moduleItems.every(
    (item) => draftVisibleModules[item.key] === DEFAULT_APP_MODULE_VISIBILITY[item.key]
  )

  const handleSimpleModeChange = (value: boolean) => {
    onSimpleModeChange(value)

    if (value) {
      moduleItems.forEach((item) => onChangeModuleVisibility(item.key, false))
    }
  }

  return (
    <section data-settings-panel-content="true">
      <section data-settings-section="profile-summary">
        <div data-settings-section-heading="true">
          <h3>Profil</h3>
          <p>Podstawowe informacje o aktywnym użytkowniku.</p>
        </div>
        <div data-settings-profile-card="true">
          <span>Aktualny użytkownik</span>
          <strong>{userEmail || 'brak danych'}</strong>
        </div>
      </section>

      <section data-settings-section="date-range">
        <div data-settings-section-heading="true">
          <h3>Ustawienia daty i zakresu</h3>
          <p>Zakres historii budżetu i dostępność przyszłych miesięcy.</p>
        </div>
        <div data-settings-row="true" data-settings-date-row="true">
          <label data-settings-field="true">
            <span>Data startowa budżetu</span>
            <input
              type="date"
              value={budgetStartDate}
              max={budgetStartMaxDate}
              onChange={(event) => onBudgetStartDateChange(event.target.value)}
            />
          </label>
          <div>
            <strong>Blokuj miesiące przyszłe</strong>
            <p>Po włączeniu nawigacja nie przejdzie poza bieżący miesiąc.</p>
          </div>
          <SettingsSwitch
            checked={monthNavigationFutureLocked}
            onChange={onMonthNavigationFutureLockedChange}
          />
        </div>
        <div data-settings-actions="true">
          <button
            type="button"
            data-settings-primary-action="true"
            onClick={onSaveMonthNavigationSettings}
            disabled={isSavingMonthNavigationSettings}
          >
            {isSavingMonthNavigationSettings ? 'Zapisywanie...' : 'Zapisz zakres'}
          </button>
        </div>
        <div data-settings-status="true">
          Zakres: <b>{minAllowedMonth || 'bez dolnego limitu'}</b> -{' '}
          <b>{maxAllowedMonth || 'bez górnego limitu'}</b>
        </div>
        {monthNavigationErrorText && (
          <div data-settings-status="true">
            <b>Błąd blokad miesięcy:</b> {monthNavigationErrorText}
          </div>
        )}
      </section>

      <section data-settings-section="basic">
        <div data-settings-section-heading="true">
          <h3>Ustawienia podstawowe</h3>
          <p>Krótka konfiguracja zachowania budżetu.</p>
        </div>
        <div data-settings-row="true">
          <div>
            <strong>Auto wyłączanie niepełnych miesięcy</strong>
            <p>Niepełne miesiące nie zaburzają statystyk i trendów.</p>
          </div>
          <SettingsSwitch
            checked={effectiveAutoExcludePartialMonths}
            onChange={onAutoExcludePartialMonthsChange}
          />
        </div>
        <div data-settings-row="true">
          <div>
            <strong>Tryb prosty</strong>
            <p>Po włączeniu wyłącza funkcje dodatkowe i blokuje ich przełączniki.</p>
          </div>
          <SettingsSwitch checked={simpleMode} onChange={handleSimpleModeChange} />
        </div>
      </section>

      <section data-settings-section="features" data-simple-mode={simpleMode ? 'true' : 'false'}>
        <div data-settings-section-heading="true">
          <h3>Funkcje dodatkowe</h3>
          <p>Moduły, które można ukryć w spokojniejszym trybie pracy.</p>
        </div>
        {simpleMode && (
          <div data-settings-simple-note="true">
            Tryb prosty jest włączony. Funkcje dodatkowe są wyłączone do czasu wyłączenia trybu prostego.
          </div>
        )}
        <div data-settings-feature-grid="true">
          {moduleItems.map((item) => (
            <article key={item.key} data-settings-feature-card="true">
              <div>
                <strong>{item.label}</strong>
                <p>{item.description}</p>
              </div>
              <SettingsSwitch
                checked={!simpleMode && draftVisibleModules[item.key]}
                disabled={simpleMode}
                onChange={(value) => onChangeModuleVisibility(item.key, value)}
              />
            </article>
          ))}
        </div>
        <div data-settings-actions="true">
          <button type="button" data-settings-primary-action="true" onClick={onSave}>
            Zapisz ustawienia
          </button>
          <button type="button" onClick={onResetDraft} disabled={isDraftDefault}>
            Przywróć domyślne
          </button>
        </div>
        {saveStatusText && <div data-settings-status="true">{saveStatusText}</div>}
      </section>

      <section data-settings-section="admin">
        <div data-settings-section-heading="true">
          <h3>Narzędzia administracyjne</h3>
          <p>Operacje techniczne dla profilu i miesięcy.</p>
        </div>
        <div data-settings-admin-grid="true">
          <button type="button" onClick={() => void onLockAllPastMonths()}>
            Zamknij wszystkie poprzednie miesiące
          </button>
          <button type="button" onClick={() => void onUnlockAllPastMonths()}>
            Odblokuj wszystkie miesiące
          </button>
          <button type="button" onClick={() => void onResetSelectedMonthData()}>
            Resetuj bieżący miesiąc
          </button>
          <button type="button" onClick={() => void onResetAllHistory()}>
            Resetuj całą historię
          </button>
        </div>
      </section>

      {profileMembersPanel && (
        <details data-settings-advanced-profile="true">
          <summary>Zaawansowane ustawienia profilu</summary>
          <div data-settings-advanced-profile-body="true">{profileMembersPanel}</div>
        </details>
      )}
    </section>
  )
}
