'use client'

import { CSSProperties, useState } from 'react'
import { AppModuleKey, AppModuleVisibility } from '../lib/useAppModuleVisibility'

type AppSettingsPanelProps = {
  visibleModules: AppModuleVisibility
  draftVisibleModules: AppModuleVisibility
  saveStatusText: string
  onChangeModuleVisibility: (moduleKey: AppModuleKey, isVisible: boolean) => void
  onSave: () => void
  onResetDraft: () => void
  onLockAllPastMonths: () => Promise<void>
  onUnlockAllPastMonths: () => Promise<void>
  onResetSelectedMonthData: () => Promise<void>
  onResetAllHistory: () => Promise<void>
  styles: Record<string, CSSProperties>
  defaultOpen?: boolean
}

const moduleItems: Array<{ key: AppModuleKey; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'paymentSources', label: 'Źródła płatności' },
  { key: 'recurringTransactions', label: 'Przypomnienia / raty' },
  { key: 'financialGoals', label: 'Cele finansowe' },
  { key: 'monthCalendar', label: 'Kalendarz miesiąca' },
  { key: 'budgetLimits', label: 'Limity i alerty budżetowe' },
]

export default function AppSettingsPanel({
  visibleModules,
  draftVisibleModules,
  saveStatusText,
  onChangeModuleVisibility,
  onSave,
  onResetDraft,
  onLockAllPastMonths,
  onUnlockAllPastMonths,
  onResetSelectedMonthData,
  onResetAllHistory,
  styles,
  defaultOpen = false,
}: AppSettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const hasUnsavedChanges = moduleItems.some(
    (item) => visibleModules[item.key] !== draftVisibleModules[item.key]
  )

  return (
    <section style={styles.card}>
      <button type="button" onClick={() => setIsOpen((previousValue) => !previousValue)}>
        Ustawienia aplikacji
      </button>

      {isOpen && (
        <div style={{ marginTop: 12 }}>
          <p style={{ marginTop: 0, marginBottom: 12, color: '#4b5563', fontSize: 13 }}>
            Te ustawienia na razie zapisują się lokalnie w tej przeglądarce. Służą do testów i
            porządkowania widoku.
          </p>

          <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
            {moduleItems.map((item) => (
              <label key={item.key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={draftVisibleModules[item.key]}
                  onChange={(event) => onChangeModuleVisibility(item.key, event.target.checked)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <button type="button" onClick={onSave}>
              Zapisz ustawienia
            </button>
            <button type="button" onClick={onResetDraft} disabled={!hasUnsavedChanges}>
              Cofnij niezapisane zmiany
            </button>
          </div>

          {saveStatusText && <div style={{ marginTop: 8, fontSize: 13 }}>{saveStatusText}</div>}

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #e5e7eb' }}>
            <div style={styles.l2Name}>Narzędzia administracyjne</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              <button type="button" onClick={() => void onLockAllPastMonths()}>
                Zablokuj wszystkie minione miesiące
              </button>
              <button type="button" onClick={() => void onUnlockAllPastMonths()}>
                Odblokuj wszystkie minione miesiące
              </button>
              <button type="button" onClick={() => void onResetSelectedMonthData()}>
                Reset danych wybranego miesiąca
              </button>
              <button type="button" onClick={() => void onResetAllHistory()}>
                Reset całej historii wpisów
              </button>
            </div>
            <p style={{ marginBottom: 0, color: '#6b7280', fontSize: 13 }}>
              TODO: widoczność modułów nadal zapisuje się lokalnie w przeglądarce.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
