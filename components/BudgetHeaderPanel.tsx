'use client'

import { CSSProperties, useEffect, useRef, useState } from 'react'

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
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false)
  const monthPanelRef = useRef<HTMLDivElement | null>(null)
  const displayedSelectedMonth = selectedMonth || '---- --'
  const displayedCurrentMonth = currentMonth || '---- --'
  const budgetStartMaxDate = currentMonth ? getLastDateOfMonth(currentMonth) : undefined
  const isCurrentMonthSelected = selectedMonth === currentMonth

  useEffect(() => {
    if (!isMonthMenuOpen) {
      return
    }

    const closeMonthMenu = () => setIsMonthMenuOpen(false)

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null

      if (target && monthPanelRef.current?.contains(target)) {
        return
      }

      closeMonthMenu()
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMonthMenu()
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('budget-close-floating-ui', closeMonthMenu)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('budget-close-floating-ui', closeMonthMenu)
    }
  }, [isMonthMenuOpen])

  return (
    <div style={styles.topPanel} data-budget-topbar-month="true" ref={monthPanelRef}>
      <button
        onClick={onPrevMonth}
        style={styles.secondaryButton}
        disabled={isPrevMonthNavigationBlocked}
        aria-label="Poprzedni miesiąc"
        title="Poprzedni miesiąc"
      >
        ‹
      </button>

      <button
        type="button"
        style={styles.monthLabel}
        onClick={() => {
          if (!isMonthMenuOpen) {
            window.dispatchEvent(new CustomEvent('budget-close-floating-ui'))
          }

          setIsMonthMenuOpen((value) => !value)
        }}
        aria-expanded={isMonthMenuOpen}
      >
        {displayedSelectedMonth}
      </button>

      <button
        onClick={onNextMonth}
        style={styles.secondaryButton}
        disabled={isNextMonthNavigationBlocked}
        aria-label="Następny miesiąc"
        title="Następny miesiąc"
      >
        ›
      </button>

      {!isCurrentMonthSelected && (
        <button onClick={onGoToCurrentMonth} style={styles.primaryButton}>
          Dziś
        </button>
      )}

      <span data-month-state="true">{isSelectedMonthLocked ? 'zamknięty' : 'otwarty'}</span>

      {isMonthMenuOpen && (
        <div data-budget-month-menu="true">
          <div data-budget-menu-grid="true">
            <button type="button" onClick={onToggleHidden} style={styles.secondaryButton}>
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
                  ? 'Przywróć do statystyk'
                  : 'Wyłącz ze statystyk'}
            </button>
          </div>

          <details>
            <summary>Ustawienia miesiąca</summary>
            <div data-budget-menu-grid="true">
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
                {isSavingMonthNavigationSettings ? 'Zapisywanie...' : 'Zapisz'}
              </button>
            </div>
            <div style={styles.smallMutedText}>
              Bieżący miesiąc: <b>{displayedCurrentMonth}</b>. Zakres historii:{' '}
              <b>{minAllowedMonth || 'bez dolnego limitu'}</b> -{' '}
              <b>{maxAllowedMonth || 'bez górnego limitu'}</b>.
            </div>
          </details>

          <details>
            <summary>Heatmapa</summary>
            <div data-budget-menu-grid="true">
              <label style={styles.monthNavigationField}>
                <span style={styles.monthNavigationFieldLabel}>Widok</span>
                <select
                  value={heatmapMode}
                  onChange={(event) => onHeatmapModeChange(event.target.value as HeatmapMode)}
                  style={styles.input}
                >
                  <option value="normal">zwykły</option>
                  <option value="balance">heatmapa</option>
                </select>
              </label>

              <label style={styles.monthNavigationField}>
                <span style={styles.monthNavigationFieldLabel}>Tryb</span>
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

              <label style={styles.monthNavigationCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={heatmapInverted}
                  onChange={(event) => onHeatmapInvertedChange(event.target.checked)}
                />
                <span>Odwróć kolory</span>
              </label>

              <button onClick={onResetHeatmapSettings} style={styles.secondaryButton}>
                Reset
              </button>
            </div>
          </details>

          {recentTransactions.length > 0 && (
            <details>
              <summary>Ostatnio dodane</summary>
              <div data-budget-recent-feed="true">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id}>
                    <strong>{transaction.amount} zł</strong>
                    <span>{transaction.description || 'Bez opisu'}</span>
                    <small>
                      {transaction.date} · {transaction.categoryLabel}
                    </small>
                  </div>
                ))}
              </div>
            </details>
          )}

          <details>
            <summary>Status</summary>
            <div data-budget-menu-grid="true">
              <span>Status: {status}</span>
              <span>Kategorie: {visibleCategoriesCount}/{categoriesCount}</span>
              <span>Wpisy: {transactionsCount}</span>
              <span>Ukryte: {hiddenCategoriesCount}</span>
            </div>
          </details>

          {monthNavigationErrorText && (
            <div style={styles.errorBox}>
              <b>Błąd blokad miesięcy:</b> {monthNavigationErrorText}
            </div>
          )}

          {errorText && (
            <div style={styles.errorBox}>
              <b>Błąd:</b> {errorText}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
