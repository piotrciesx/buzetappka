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
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Szybki podgląd finansów i trendów.',
  },
  {
    key: 'monthCalendar',
    label: 'Kalendarz',
    description: 'Widok miesięczny wpisów i dni budżetowych.',
  },
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
    label: 'Limity',
    description: 'Alerty i kontrola wydatków w kategoriach.',
  },
]

const staticFeatureItems = [
  {
    label: 'Import / export',
    description: 'Narzędzia przenoszenia i kopii danych.',
  },
  {
    label: 'Wyszukiwarka',
    description: 'Szybkie filtrowanie wpisów i tagów.',
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

export default function AppSettingsPanel({
  simpleMode,
  onSimpleModeChange,
  autoExcludePartialMonths,
  onAutoExcludePartialMonthsChange,
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
  onExportBackupJson,
  onExportBackupCsv,
  profileMembersPanel,
}: AppSettingsPanelProps) {
  void ignoredDefaultOpen

  const isDraftDefault = moduleItems.every(
    (item) => draftVisibleModules[item.key] === DEFAULT_APP_MODULE_VISIBILITY[item.key]
  )

  return (
    <section data-settings-panel-content="true">
      <section data-settings-section="profile">
        <div data-settings-section-heading="true">
          <span>Sekcja A</span>
          <h3>Profil i zaproszenia</h3>
          <p>Dostęp do profilu i udostępnianie budżetu innym osobom.</p>
        </div>
        <div data-settings-profile-card="true">
          <span>Aktualny użytkownik</span>
          <strong>{userEmail || 'brak danych'}</strong>
        </div>
        {profileMembersPanel}
      </section>

      <section data-settings-section="basic">
        <div data-settings-section-heading="true">
          <span>Sekcja B</span>
          <h3>Ustawienia podstawowe</h3>
          <p>Krótka konfiguracja zachowania budżetu.</p>
        </div>
        <div data-settings-row="true">
          <div>
            <strong>Auto wyłączanie niepełnych miesięcy</strong>
            <p>Niepełne miesiące nie zaburzają statystyk i trendów.</p>
          </div>
          <SettingsSwitch
            checked={autoExcludePartialMonths}
            onChange={onAutoExcludePartialMonthsChange}
          />
        </div>
        <div data-settings-row="true">
          <div>
            <strong>Tryb prosty</strong>
            <p>Ogranicza widoczność funkcji dodatkowych do spokojniejszego widoku.</p>
          </div>
          <SettingsSwitch checked={simpleMode} onChange={onSimpleModeChange} />
        </div>
      </section>

      <section data-settings-section="features" data-simple-mode={simpleMode ? 'true' : 'false'}>
        <div data-settings-section-heading="true">
          <span>Sekcja C</span>
          <h3>Funkcje dodatkowe</h3>
          <p>Włączaj moduły widoczne w panelach aplikacji.</p>
        </div>
        {simpleMode && (
          <div data-settings-simple-note="true">
            Tryb prosty jest włączony. Funkcje dodatkowe mogą być wizualnie ograniczane w aplikacji.
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
                checked={draftVisibleModules[item.key]}
                onChange={(value) => onChangeModuleVisibility(item.key, value)}
              />
            </article>
          ))}
          {staticFeatureItems.map((item) => (
            <article key={item.label} data-settings-feature-card="true" data-static-feature="true">
              <div>
                <strong>{item.label}</strong>
                <p>{item.description}</p>
              </div>
              <SettingsSwitch checked disabled />
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
          <span>Sekcja D</span>
          <h3>Narzędzia administracyjne</h3>
          <p>Operacje techniczne dla miesięcy i kopii danych.</p>
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
          {onExportBackupJson && (
            <button type="button" onClick={() => void onExportBackupJson()}>
              Backup JSON
            </button>
          )}
          {onExportBackupCsv && (
            <button type="button" onClick={() => void onExportBackupCsv()}>
              Backup CSV
            </button>
          )}
        </div>
      </section>
    </section>
  )
}
