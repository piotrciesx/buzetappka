'use client'

import { CSSProperties } from 'react'

type HeatmapMode = 'normal' | 'balance'

type Props = {
  selectedMonth: string
  currentMonth: string
  status: string
  categoriesCount: number
  visibleCategoriesCount: number
  transactionsCount: number
  hiddenCategoriesCount: number
  showHiddenCategories: boolean
  errorText: string
  minAllowedMonth: string | null
  maxAllowedMonth: string | null
  monthNavigationStartMonth: string
  monthNavigationFutureLocked: boolean
  isSavingMonthNavigationSettings: boolean
  monthNavigationErrorText: string
  isPrevMonthNavigationBlocked: boolean
  isNextMonthNavigationBlocked: boolean
  isSelectedMonthLocked: boolean
  isUpdatingSelectedMonthLock: boolean
  heatmapMode: HeatmapMode
  heatmapInverted: boolean
  onHeatmapModeChange: (value: HeatmapMode) => void
  onHeatmapInvertedChange: (value: boolean) => void
  onResetHeatmapSettings: () => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onLockSelectedMonth: () => Promise<void>
  onUnlockSelectedMonth: () => Promise<void>
  onToggleHidden: () => void
  onMonthNavigationStartMonthChange: (value: string) => void
  onMonthNavigationFutureLockedChange: (value: boolean) => void
  onSaveMonthNavigationSettings: () => void
  styles: Record<string, CSSProperties>
}

const heatmapSettingsCardStyle: CSSProperties = {
  marginTop: 14,
  border: '1px solid #dbeafe',
  borderRadius: 12,
  background: '#f8fbff',
  padding: 14,
}

const heatmapSettingsTitleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  marginBottom: 10,
  color: '#111827',
}

const heatmapSettingsHintStyle: CSSProperties = {
  fontSize: 12,
  color: '#6b7280',
  lineHeight: 1.5,
  marginBottom: 10,
}

const heatmapRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  alignItems: 'center',
  marginBottom: 8,
}

const heatmapFieldStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  minWidth: 220,
  flex: 1,
}

const heatmapLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#374151',
}

const subtleCheckboxStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 12,
  color: '#4b5563',
  marginTop: 6,
}

export default function BudgetHeaderPanel(props: Props) {
  const {
    selectedMonth,
    currentMonth,
    status,
    categoriesCount,
    visibleCategoriesCount,
    transactionsCount,
    hiddenCategoriesCount,
    showHiddenCategories,
    errorText,
    minAllowedMonth,
    maxAllowedMonth,
    monthNavigationStartMonth,
    monthNavigationFutureLocked,
    isSavingMonthNavigationSettings,
    monthNavigationErrorText,
    isPrevMonthNavigationBlocked,
    isNextMonthNavigationBlocked,
    isSelectedMonthLocked,
    isUpdatingSelectedMonthLock,
    heatmapMode,
    heatmapInverted,
    onHeatmapModeChange,
    onHeatmapInvertedChange,
    onResetHeatmapSettings,
    onPrevMonth,
    onNextMonth,
    onLockSelectedMonth,
    onUnlockSelectedMonth,
    onToggleHidden,
    onMonthNavigationStartMonthChange,
    onMonthNavigationFutureLockedChange,
    onSaveMonthNavigationSettings,
    styles,
  } = props

  return (
    <div style={styles.topPanel}>
      <div style={styles.monthBar}>
        <button
          onClick={onPrevMonth}
          style={styles.secondaryButton}
          disabled={isPrevMonthNavigationBlocked}
        >
          ← Poprzedni miesiąc
        </button>

        <div style={styles.monthLabel}>{selectedMonth}</div>

        <button
          onClick={onNextMonth}
          style={styles.secondaryButton}
          disabled={isNextMonthNavigationBlocked}
        >
          Następny miesiąc →
        </button>

        <button onClick={onToggleHidden} style={styles.secondaryButton}>
          {showHiddenCategories ? 'Ukryj ukryte' : 'Pokaż ukryte'}
        </button>

        <button
          onClick={async () => {
            if (isSelectedMonthLocked) {
              await onUnlockSelectedMonth()
              return
            }

            await onLockSelectedMonth()
          }}
          style={isSelectedMonthLocked ? styles.dangerButton : styles.secondaryButton}
          disabled={isUpdatingSelectedMonthLock}
        >
          {isUpdatingSelectedMonthLock
            ? 'Zapisywanie...'
            : isSelectedMonthLocked
              ? 'Odblokuj miesiąc'
              : 'Zamknij miesiąc'}
        </button>
      </div>

      <div style={styles.infoBox}>
        <b>Rozliczenie miesiąca:</b> {isSelectedMonthLocked ? 'zamknięty' : 'otwarty'}
      </div>

      <div style={styles.monthNavigationSettingsCard}>
        <div style={styles.monthNavigationSettingsTitle}>Blokady nawigacji miesięcy</div>

        <div style={styles.monthNavigationSettingsRow}>
          <label style={styles.monthNavigationField}>
            <span style={styles.monthNavigationFieldLabel}>Start historii</span>
            <input
              type="month"
              value={monthNavigationStartMonth}
              max={currentMonth}
              onChange={(event) => onMonthNavigationStartMonthChange(event.target.value)}
              style={styles.input}
            />
          </label>

          <label style={styles.monthNavigationCheckboxLabel}>
            <input
              type="checkbox"
              checked={monthNavigationFutureLocked}
              onChange={(event) => onMonthNavigationFutureLockedChange(event.target.checked)}
            />
            <span>Blokuj miesiące przyszłe</span>
          </label>

          <button
            onClick={onSaveMonthNavigationSettings}
            style={styles.secondaryButton}
            disabled={isSavingMonthNavigationSettings}
          >
            {isSavingMonthNavigationSettings ? 'Zapisywanie...' : 'Zapisz blokady miesięcy'}
          </button>
        </div>

        <div style={styles.monthNavigationHint}>
          Po wejściu aplikacja otwiera bieżący miesiąc: <b>{currentMonth}</b>. Dozwolony zakres
          nawigacji: <b>{minAllowedMonth || 'bez dolnego limitu'}</b>
          {maxAllowedMonth ? (
            <>
              {' '}
              - <b>{maxAllowedMonth}</b>
            </>
          ) : (
            <> - bez górnego limitu</>
          )}
          .
        </div>

        {monthNavigationErrorText && (
          <div style={styles.errorBox}>
            <b>Błąd blokad miesięcy:</b> {monthNavigationErrorText}
          </div>
        )}
      </div>

      <div style={heatmapSettingsCardStyle}>
        <div style={heatmapSettingsTitleStyle}>Ustawienia heatmapy</div>

        <div style={heatmapSettingsHintStyle}>
          Na kalendarzu ogólnym zarówno widok zwykły, jak i heatmapa pokazują <b>bilans dnia</b>,
          czyli przychody minus wydatki. Ustawienia tutaj dotyczą tylko głównego kalendarza
          miesiąca i zapisują się lokalnie w tej przeglądarce.
        </div>

        <div style={heatmapRowStyle}>
          <label style={heatmapFieldStyle}>
            <span style={heatmapLabelStyle}>Widok kalendarza ogólnego</span>
            <select
              value={heatmapMode}
              onChange={(event) => onHeatmapModeChange(event.target.value as HeatmapMode)}
              style={styles.input}
            >
              <option value="normal">zwykły</option>
              <option value="balance">heatmapa</option>
            </select>
          </label>
        </div>

        <label style={subtleCheckboxStyle}>
          <input
            type="checkbox"
            checked={heatmapInverted}
            onChange={(event) => onHeatmapInvertedChange(event.target.checked)}
          />
          <span>Odwróć kolory heatmapy</span>
        </label>

        <div style={{ marginTop: 10 }}>
          <button onClick={onResetHeatmapSettings} style={styles.secondaryButton}>
            Reset ustawień heatmapy
          </button>
        </div>
      </div>

      <div style={styles.infoRow}>
        <div style={styles.infoBox}>
          <b>Status:</b> {status}
        </div>

        <div style={styles.infoBox}>
          <b>Liczba kategorii w bazie:</b> {categoriesCount}
        </div>

        <div style={styles.infoBox}>
          <b>Liczba widocznych kategorii:</b> {visibleCategoriesCount}
        </div>

        <div style={styles.infoBox}>
          <b>Liczba wpisów:</b> {transactionsCount}
        </div>

        <div style={styles.infoBox}>
          <b>Ukryte w tym miesiącu:</b> {hiddenCategoriesCount}
        </div>
      </div>

      {errorText && (
        <div style={styles.errorBox}>
          <b>Błąd:</b> {errorText}
        </div>
      )}
    </div>
  )
}
