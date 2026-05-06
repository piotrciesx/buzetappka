'use client'

import { CSSProperties } from 'react'

type HeatmapMode = 'normal' | 'balance'
type CalendarHeatmapVariant = 'balance' | 'income' | 'expense'

type RecentTransactionPreview = {
  id: string
  amount: string
  date: string
  description: string
  categoryLabel: string
}

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
  budgetStartDate: string
  monthNavigationFutureLocked: boolean
  isSavingMonthNavigationSettings: boolean
  monthNavigationErrorText: string
  isPrevMonthNavigationBlocked: boolean
  isNextMonthNavigationBlocked: boolean
  isSelectedMonthLocked: boolean
  isUpdatingSelectedMonthLock: boolean
  isSelectedMonthExcluded: boolean
  isUpdatingSelectedMonthExclusion: boolean
  heatmapMode: HeatmapMode
  calendarHeatmapVariant: CalendarHeatmapVariant
  heatmapInverted: boolean
  recentTransactions: RecentTransactionPreview[]
  onHeatmapModeChange: (value: HeatmapMode) => void
  onCalendarHeatmapVariantChange: (value: CalendarHeatmapVariant) => void
  onHeatmapInvertedChange: (value: boolean) => void
  onResetHeatmapSettings: () => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onGoToCurrentMonth: () => void
  onLockSelectedMonth: () => Promise<void>
  onUnlockSelectedMonth: () => Promise<void>
  onToggleHidden: () => void
  onBudgetStartDateChange: (value: string) => void
  onMonthNavigationFutureLockedChange: (value: boolean) => void
  onSaveMonthNavigationSettings: () => void
  onToggleSelectedMonthExcluded: () => Promise<void>
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
  fontWeight: 600,
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
  fontWeight: 600,
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

const recentEntriesStyle: CSSProperties = {
  marginTop: 10,
  maxWidth: 520,
}

const recentEntriesSummaryStyle: CSSProperties = {
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  color: '#1d4ed8',
}

const recentEntriesListStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
  marginTop: 10,
}

const recentEntryStyle: CSSProperties = {
  padding: 10,
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  background: '#ffffff',
}

const getLastDateOfMonth = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)

  if (!year || !month) {
    return undefined
  }

  const lastDay = new Date(year, month, 0).getDate()
  return `${monthText}-${String(lastDay).padStart(2, '0')}`
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
    budgetStartDate,
    monthNavigationFutureLocked,
    isSavingMonthNavigationSettings,
    monthNavigationErrorText,
    isPrevMonthNavigationBlocked,
    isNextMonthNavigationBlocked,
    isSelectedMonthLocked,
    isUpdatingSelectedMonthLock,
    isSelectedMonthExcluded,
    isUpdatingSelectedMonthExclusion,
    heatmapMode,
    calendarHeatmapVariant,
    heatmapInverted,
    recentTransactions,
    onHeatmapModeChange,
    onCalendarHeatmapVariantChange,
    onHeatmapInvertedChange,
    onResetHeatmapSettings,
    onPrevMonth,
    onNextMonth,
    onGoToCurrentMonth,
    onLockSelectedMonth,
    onUnlockSelectedMonth,
    onToggleHidden,
    onBudgetStartDateChange,
    onMonthNavigationFutureLockedChange,
    onSaveMonthNavigationSettings,
    onToggleSelectedMonthExcluded,
    styles,
  } = props
  const displayedSelectedMonth = selectedMonth || '---- --'
  const displayedCurrentMonth = currentMonth || '---- --'
  const budgetStartMaxDate = currentMonth ? getLastDateOfMonth(currentMonth) : undefined
  const isCurrentMonthSelected = selectedMonth === currentMonth

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

        <div style={styles.monthLabel}>{displayedSelectedMonth}</div>

        {!isCurrentMonthSelected && (
          <button onClick={onGoToCurrentMonth} style={styles.primaryButton}>
            Dziś
          </button>
        )}

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

        <button
          onClick={onToggleSelectedMonthExcluded}
          style={isSelectedMonthExcluded ? styles.primaryButton : styles.secondaryButton}
          disabled={isUpdatingSelectedMonthExclusion}
        >
          {isUpdatingSelectedMonthExclusion
            ? 'Zapisywanie...'
            : isSelectedMonthExcluded
              ? 'Przywróć miesiąc do statystyk'
              : 'Wyłącz miesiąc ze statystyk'}
        </button>
      </div>

      <div style={styles.infoBox}>
        <b>Rozliczenie miesiąca:</b> {isSelectedMonthLocked ? 'zamknięty' : 'otwarty'}
      </div>

      {recentTransactions.length > 0 && (
        <details style={recentEntriesStyle}>
          <summary style={recentEntriesSummaryStyle}>Ostatnio dodane wpisy</summary>
          <div style={recentEntriesListStyle}>
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} style={recentEntryStyle}>
                <div style={{ fontWeight: 700 }}>{transaction.amount} zł</div>
                <div style={{ fontSize: 13, color: '#374151' }}>
                  {transaction.description || 'Bez opisu'}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {transaction.date} · {transaction.categoryLabel}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      <div style={styles.monthNavigationSettingsCard}>
        <div style={styles.monthNavigationSettingsTitle}>Data startowa budżetu</div>

        <div style={styles.monthNavigationSettingsRow}>
          <label style={styles.monthNavigationField}>
            <span style={styles.monthNavigationFieldLabel}>Data startowa budżetu</span>
            <input
              type="date"
              value={budgetStartDate}
              max={budgetStartMaxDate}
              onChange={(event) => onBudgetStartDateChange(event.target.value)}
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
            {isSavingMonthNavigationSettings ? 'Zapisywanie...' : 'Zapisz datę startową'}
          </button>
        </div>

        <div style={styles.monthNavigationHint}>
          Po wejściu aplikacja otwiera bieżący miesiąc: <b>{displayedCurrentMonth}</b>. Dane
          sprzed daty startowej budżetu są ignorowane w aktywnych widokach. Dozwolony zakres
          historii: <b>{minAllowedMonth || 'bez dolnego limitu'}</b>
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
          Ustawienia tutaj dotyczą głównego kalendarza miesiąca i zapisują się w profilu.
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

          <label style={heatmapFieldStyle}>
            <span style={heatmapLabelStyle}>Tryb heatmapy</span>
            <select
              value={calendarHeatmapVariant}
              onChange={(event) =>
                onCalendarHeatmapVariantChange(event.target.value as CalendarHeatmapVariant)
              }
              style={styles.input}
            >
              <option value="balance">bilans</option>
              <option value="income">przychody</option>
              <option value="expense">wydatki</option>
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
