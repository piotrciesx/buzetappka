import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getCurrentMonthText,
  getMonthKeyFromDate,
  getMonthNumber,
  getNextMonthText,
  getPrevMonthText,
} from './dateUtils'
import { supabase } from './supabaseClient'
import {
  isMonthLocked as isMonthLockedHelper,
  loadLockedMonths as loadLockedMonthsHelper,
  lockMonth as lockMonthHelper,
  unlockMonth as unlockMonthHelper,
} from './monthLockActions'

type MonthNavigationSettingsRow = {
  profile_id: string
  min_history_month: string | null
  budget_start_date: string | null
  lock_future_months: boolean
  simple_mode: boolean | null
  heatmap_variant: string | null
  heatmap_display_mode: string | null
  heatmap_inverted: boolean | null
  auto_exclude_partial_months: boolean | null
}

const DEFAULT_MONTH_NAVIGATION_START_MONTH = ''

type UseBudgetMonthNavigationParams = {
  profileId: string
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }

  return fallback
}

const isMissingBackendObjectError = (error: unknown) => {
  const message = getErrorMessage(error, '').toLowerCase()

  return (
    message.includes('does not exist') ||
    message.includes('not found') ||
    message.includes('relation') ||
    message.includes('table') ||
    message.includes('schema cache')
  )
}

export function useBudgetMonthNavigation({ profileId }: UseBudgetMonthNavigationParams) {
  const [selectedMonth, setSelectedMonth] = useState('')
  const [monthNavigationStartMonth, setMonthNavigationStartMonth] = useState(
    DEFAULT_MONTH_NAVIGATION_START_MONTH
  )
  const [budgetStartDate, setBudgetStartDate] = useState('')
  const [savedBudgetStartDate, setSavedBudgetStartDate] = useState('')
  const [isFutureMonthNavigationLocked, setIsFutureMonthNavigationLocked] = useState(true)
  const [simpleMode, setSimpleMode] = useState(false)
  const [calendarHeatmapVariant, setCalendarHeatmapVariant] = useState<
    'balance' | 'income' | 'expense'
  >('balance')
  const [heatmapMode, setHeatmapMode] = useState<'normal' | 'balance'>('balance')
  const [heatmapInverted, setHeatmapInverted] = useState(false)
  const [autoExcludePartialMonths, setAutoExcludePartialMonths] = useState(false)
  const [isSavingMonthNavigationSettings, setIsSavingMonthNavigationSettings] = useState(false)
  const [monthNavigationErrorText, setMonthNavigationErrorText] = useState('')
  const [lockedMonths, setLockedMonths] = useState<string[]>([])
  const [excludedMonths, setExcludedMonths] = useState<string[]>([])
  const [isUpdatingSelectedMonthExclusion, setIsUpdatingSelectedMonthExclusion] = useState(false)
  const [isUpdatingSelectedMonthLock, setIsUpdatingSelectedMonthLock] = useState(false)

  const [currentMonth, setCurrentMonth] = useState('')
  const lockedMonthsSet = useMemo(() => new Set(lockedMonths), [lockedMonths])
  const excludedMonthsSet = useMemo(() => new Set(excludedMonths), [excludedMonths])

  useEffect(() => {
    const refreshCurrentMonth = () => {
      const nextCurrentMonth = getCurrentMonthText()
      setCurrentMonth((previousCurrentMonth) =>
        previousCurrentMonth === nextCurrentMonth ? previousCurrentMonth : nextCurrentMonth
      )
      setSelectedMonth((previousSelectedMonth) => previousSelectedMonth || nextCurrentMonth)
    }

    refreshCurrentMonth()

    const intervalId = window.setInterval(refreshCurrentMonth, 60 * 1000)
    window.addEventListener('focus', refreshCurrentMonth)
    document.addEventListener('visibilitychange', refreshCurrentMonth)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshCurrentMonth)
      document.removeEventListener('visibilitychange', refreshCurrentMonth)
    }
  }, [])

  const clampMonthToNavigationRange = useCallback(
    (monthText: string, minAllowedMonth: string | null, maxAllowedMonth: string | null) => {
      const monthNumber = getMonthNumber(monthText)

      if (minAllowedMonth) {
        const minMonthNumber = getMonthNumber(minAllowedMonth)

        if (monthNumber < minMonthNumber) {
          return minAllowedMonth
        }
      }

      if (maxAllowedMonth) {
        const maxMonthNumber = getMonthNumber(maxAllowedMonth)

        if (monthNumber > maxMonthNumber) {
          return maxAllowedMonth
        }
      }

      return monthText
    },
    []
  )

  const validateMonthNavigationStartMonth = useCallback(
    (monthText: string) => {
      const effectiveCurrentMonth = currentMonth || getCurrentMonthText()

      if (!monthText) {
        return ''
      }

      if (getMonthNumber(monthText) > getMonthNumber(effectiveCurrentMonth)) {
        return `Start historii nie może być późniejszy niż bieżący miesiąc ${effectiveCurrentMonth}.`
      }

      return ''
    },
    [currentMonth]
  )

  const validateBudgetStartDate = useCallback(
    (dateText: string) => {
      const effectiveCurrentMonth = currentMonth || getCurrentMonthText()

      if (!dateText) {
        return ''
      }

      if (getMonthNumber(getMonthKeyFromDate(dateText)) > getMonthNumber(effectiveCurrentMonth)) {
        return `Data startowa budżetu nie może być późniejsza niż bieżący miesiąc ${effectiveCurrentMonth}.`
      }

      return ''
    },
    [currentMonth]
  )

  const loadMonthNavigationSettings = useCallback(async () => {
    const effectiveCurrentMonth = currentMonth || getCurrentMonthText()

    setMonthNavigationErrorText('')

    const { data, error } = await supabase
      .from('profile_month_navigation_settings')
      .select(
        'profile_id, min_history_month, budget_start_date, lock_future_months, simple_mode, heatmap_variant, heatmap_display_mode, heatmap_inverted, auto_exclude_partial_months'
      )
      .eq('profile_id', profileId)
      .maybeSingle()

    if (error) {
      const shouldHideTechnicalError = isMissingBackendObjectError(error)

      setMonthNavigationErrorText(
        shouldHideTechnicalError
          ? ''
          : getErrorMessage(error, 'Nie udało się pobrać ustawień nawigacji miesięcy.')
      )
      setMonthNavigationStartMonth(DEFAULT_MONTH_NAVIGATION_START_MONTH)
      setBudgetStartDate('')
      setSavedBudgetStartDate('')
      setIsFutureMonthNavigationLocked(true)
      setSimpleMode(false)
      setCalendarHeatmapVariant('balance')
      setHeatmapMode('balance')
      setHeatmapInverted(false)
      setAutoExcludePartialMonths(false)
      setSelectedMonth((prev) =>
        clampMonthToNavigationRange(
          prev || effectiveCurrentMonth,
          DEFAULT_MONTH_NAVIGATION_START_MONTH,
          effectiveCurrentMonth
        )
      )
      return
    }

    const settings = data as MonthNavigationSettingsRow | null
    const nextBudgetStartDate = settings?.budget_start_date || settings?.min_history_month || ''
    const nextMinAllowedMonth = getMonthKeyFromDate(nextBudgetStartDate) || DEFAULT_MONTH_NAVIGATION_START_MONTH
    const nextFutureLocked = settings?.lock_future_months ?? true
    const nextMaxAllowedMonth = nextFutureLocked ? effectiveCurrentMonth : null
    const nextHeatmapVariant =
      settings?.heatmap_variant === 'income' || settings?.heatmap_variant === 'expense'
        ? settings.heatmap_variant
        : 'balance'
    const nextHeatmapMode = settings?.heatmap_display_mode === 'normal' ? 'normal' : 'balance'

    setMonthNavigationStartMonth(nextMinAllowedMonth)
    setBudgetStartDate(nextBudgetStartDate)
    setSavedBudgetStartDate(nextBudgetStartDate)
    setIsFutureMonthNavigationLocked(nextFutureLocked)
    setSimpleMode(Boolean(settings?.simple_mode))
    setCalendarHeatmapVariant(nextHeatmapVariant)
    setHeatmapMode(nextHeatmapMode)
    setHeatmapInverted(Boolean(settings?.heatmap_inverted))
    setAutoExcludePartialMonths(Boolean(settings?.auto_exclude_partial_months))
    setSelectedMonth((prev) =>
      clampMonthToNavigationRange(prev || effectiveCurrentMonth, nextMinAllowedMonth, nextMaxAllowedMonth)
    )
  }, [clampMonthToNavigationRange, currentMonth, profileId])

  const loadLockedMonths = useCallback(async () => {
    try {
      const months = await loadLockedMonthsHelper(supabase, profileId)
      setLockedMonths(months)
    } catch {
      setLockedMonths([])
    }
  }, [profileId])

  const loadExcludedMonths = useCallback(async () => {
    const { data, error } = await supabase
      .from('profile_excluded_months')
      .select('month')
      .eq('profile_id', profileId)
      .order('month', { ascending: true })

    if (error) {
      if (!isMissingBackendObjectError(error)) {
        setMonthNavigationErrorText(
          getErrorMessage(error, 'Nie udało się pobrać miesięcy wyłączonych ze statystyk.')
        )
      }
      setExcludedMonths([])
      return
    }

    setExcludedMonths((data || []).map((row) => String(row.month || '').slice(0, 7)).filter(Boolean))
  }, [profileId])

  const minAllowedMonth = getMonthKeyFromDate(budgetStartDate) || monthNavigationStartMonth || null
  const maxAllowedMonth = isFutureMonthNavigationLocked && currentMonth ? currentMonth : null

  const isPrevMonthNavigationBlocked = minAllowedMonth
    ? getMonthNumber(selectedMonth) <= getMonthNumber(minAllowedMonth)
    : false

  const isNextMonthNavigationBlocked = maxAllowedMonth
    ? getMonthNumber(selectedMonth) >= getMonthNumber(maxAllowedMonth)
    : false

  const isSelectedMonthLocked = useMemo(() => {
    return isMonthLockedHelper(selectedMonth, lockedMonthsSet)
  }, [lockedMonthsSet, selectedMonth])

  useEffect(() => {
    if (!selectedMonth) {
      return
    }

    const clampedMonth = clampMonthToNavigationRange(selectedMonth, minAllowedMonth, maxAllowedMonth)

    if (clampedMonth !== selectedMonth) {
      setSelectedMonth(clampedMonth)
    }
  }, [clampMonthToNavigationRange, maxAllowedMonth, minAllowedMonth, selectedMonth])

  const handleSaveMonthNavigationSettings = useCallback(async () => {
    if (!profileId) {
      setMonthNavigationErrorText('Nie udało się zapisać ustawień: brak aktywnego profilu.')
      return
    }

    const validationError = validateMonthNavigationStartMonth(monthNavigationStartMonth)
    const startDateValidationError = validateBudgetStartDate(budgetStartDate)

    if (validationError || startDateValidationError) {
      setMonthNavigationErrorText(startDateValidationError || validationError)
      return
    }

    setIsSavingMonthNavigationSettings(true)
    setMonthNavigationErrorText('')

    const effectiveBudgetStartMonth = getMonthKeyFromDate(budgetStartDate)

    const payload = {
      profile_id: profileId,
      min_history_month: effectiveBudgetStartMonth ? `${effectiveBudgetStartMonth}-01` : null,
      budget_start_date: budgetStartDate || null,
      lock_future_months: isFutureMonthNavigationLocked,
      simple_mode: simpleMode,
      heatmap_variant: calendarHeatmapVariant,
      heatmap_display_mode: heatmapMode,
      heatmap_inverted: heatmapInverted,
      auto_exclude_partial_months: autoExcludePartialMonths,
      updated_at: new Date().toISOString(),
    }

    const { error: saveError } = await supabase
      .from('profile_month_navigation_settings')
      .upsert(payload, { onConflict: 'profile_id' })

    if (saveError) {
      setMonthNavigationErrorText(
        getErrorMessage(saveError, 'Nie udało się zapisać ustawień nawigacji miesięcy.')
      )
      setIsSavingMonthNavigationSettings(false)
      return
    }

    if (autoExcludePartialMonths) {
      const budgetStartDay = budgetStartDate.slice(8, 10)
      const budgetStartMonth = getMonthKeyFromDate(budgetStartDate)

      if (budgetStartMonth && budgetStartDay && budgetStartDay !== '01') {
        const { error: autoExcludeError } = await supabase.from('profile_excluded_months').upsert(
          {
            profile_id: profileId,
            month: `${budgetStartMonth}-01`,
            reason: 'auto_partial',
          },
          {
            onConflict: 'profile_id,month',
          }
        )

        if (autoExcludeError) {
          setMonthNavigationErrorText(
            getErrorMessage(
              autoExcludeError,
              'Nie udało się automatycznie wyłączyć niepełnego miesiąca.'
            )
          )
          setIsSavingMonthNavigationSettings(false)
          return
        }
      }
    } else {
      const { error: clearAutoExcludeError } = await supabase
        .from('profile_excluded_months')
        .delete()
        .eq('profile_id', profileId)
        .eq('reason', 'auto_partial')

      if (clearAutoExcludeError && !isMissingBackendObjectError(clearAutoExcludeError)) {
        setMonthNavigationErrorText(
          getErrorMessage(
            clearAutoExcludeError,
            'Nie udało się wyczyścić automatycznych wyłączeń miesięcy.'
          )
        )
        setIsSavingMonthNavigationSettings(false)
        return
      }
    }

    const effectiveCurrentMonth = currentMonth || getCurrentMonthText()
    const nextMaxAllowedMonth = isFutureMonthNavigationLocked ? effectiveCurrentMonth : null

    setSelectedMonth((prev) =>
      clampMonthToNavigationRange(
        prev || effectiveCurrentMonth,
        effectiveBudgetStartMonth,
        nextMaxAllowedMonth
      )
    )
    setSavedBudgetStartDate(budgetStartDate)
    await loadExcludedMonths()
    setIsSavingMonthNavigationSettings(false)
  }, [
    clampMonthToNavigationRange,
    currentMonth,
    budgetStartDate,
    calendarHeatmapVariant,
    autoExcludePartialMonths,
    heatmapInverted,
    heatmapMode,
    isFutureMonthNavigationLocked,
    monthNavigationStartMonth,
    profileId,
    loadExcludedMonths,
    simpleMode,
    validateBudgetStartDate,
    validateMonthNavigationStartMonth,
  ])

  const handleToggleSelectedMonthExcluded = useCallback(async () => {
    setIsUpdatingSelectedMonthExclusion(true)
    setMonthNavigationErrorText('')

    try {
      if (excludedMonthsSet.has(selectedMonth)) {
        const { error } = await supabase
          .from('profile_excluded_months')
          .delete()
          .eq('profile_id', profileId)
          .eq('month', `${selectedMonth}-01`)

        if (error) {
          throw error
        }
      } else {
        const { error } = await supabase.from('profile_excluded_months').upsert(
          {
            profile_id: profileId,
            month: `${selectedMonth}-01`,
          },
          {
            onConflict: 'profile_id,month',
          }
        )

        if (error) {
          throw error
        }
      }

      await loadExcludedMonths()
    } catch (error) {
      setMonthNavigationErrorText(
        getErrorMessage(error, 'Nie udało się zmienić wyłączenia miesiąca ze statystyk.')
      )
    } finally {
      setIsUpdatingSelectedMonthExclusion(false)
    }
  }, [excludedMonthsSet, loadExcludedMonths, profileId, selectedMonth])

  const getPastMonthsForBulkLock = useCallback(() => {
    const startMonth = minAllowedMonth || getMonthKeyFromDate(budgetStartDate) || currentMonth
    const months: string[] = []
    let cursor = startMonth
    let guard = 0

    while (getMonthNumber(cursor) < getMonthNumber(currentMonth) && guard < 600) {
      months.push(cursor)
      cursor = getNextMonthText(cursor)
      guard += 1
    }

    return months
  }, [budgetStartDate, currentMonth, minAllowedMonth])

  const handleLockAllPastMonths = useCallback(async () => {
    const months = getPastMonthsForBulkLock()

    if (months.length === 0) {
      alert('Brak minionych miesięcy do zablokowania.')
      return
    }

    const confirmed = confirm(
      `Czy na pewno zablokować wszystkie minione miesiące (${months.length})? Aktualny miesiąc nie zostanie zablokowany.`
    )

    if (!confirmed) {
      return
    }

    try {
      for (const month of months) {
        await lockMonthHelper(supabase, profileId, month)
      }

      await loadLockedMonths()
      alert('Minione miesiące zostały zablokowane.')
    } catch (error) {
      alert(`Nie udało się zablokować miesięcy: ${getErrorMessage(error, 'Nieznany błąd.')}`)
    }
  }, [getPastMonthsForBulkLock, loadLockedMonths, profileId])

  const handleUnlockAllPastMonths = useCallback(async () => {
    const months = getPastMonthsForBulkLock()

    if (months.length === 0) {
      alert('Brak minionych miesięcy do odblokowania.')
      return
    }

    const confirmed = confirm(`Czy na pewno odblokować wszystkie minione miesiące (${months.length})?`)

    if (!confirmed) {
      return
    }

    try {
      for (const month of months) {
        await unlockMonthHelper(supabase, profileId, month)
      }

      await loadLockedMonths()
      alert('Minione miesiące zostały odblokowane.')
    } catch (error) {
      alert(`Nie udało się odblokować miesięcy: ${getErrorMessage(error, 'Nieznany błąd.')}`)
    }
  }, [getPastMonthsForBulkLock, loadLockedMonths, profileId])

  const handleLockMonth = useCallback(
    async (month: string) => {
      await lockMonthHelper(supabase, profileId, month)
      await loadLockedMonths()
    },
    [loadLockedMonths, profileId]
  )

  const handleLockSelectedMonth = useCallback(async () => {
    if (isSelectedMonthLocked) {
      return
    }

    const confirmed = confirm(`Czy na pewno chcesz zamknąć miesiąc ${selectedMonth}?`)

    if (!confirmed) {
      return
    }

    setIsUpdatingSelectedMonthLock(true)

    try {
      await lockMonthHelper(supabase, profileId, selectedMonth)
      await loadLockedMonths()
      alert(`Miesiąc ${selectedMonth} został zamknięty.`)
    } catch (error) {
      alert(`Nie udało się zamknąć miesiąca: ${getErrorMessage(error, 'Nieznany błąd.')}`)
    } finally {
      setIsUpdatingSelectedMonthLock(false)
    }
  }, [isSelectedMonthLocked, loadLockedMonths, profileId, selectedMonth])

  const handleUnlockSelectedMonth = useCallback(async () => {
    if (!isSelectedMonthLocked) {
      return
    }

    const confirmed = confirm(`Czy na pewno chcesz odblokować miesiąc ${selectedMonth}?`)

    if (!confirmed) {
      return
    }

    setIsUpdatingSelectedMonthLock(true)

    try {
      await unlockMonthHelper(supabase, profileId, selectedMonth)
      await loadLockedMonths()
      alert(`Miesiąc ${selectedMonth} został odblokowany.`)
    } catch (error) {
      alert(`Nie udało się odblokować miesiąca: ${getErrorMessage(error, 'Nieznany błąd.')}`)
    } finally {
      setIsUpdatingSelectedMonthLock(false)
    }
  }, [isSelectedMonthLocked, loadLockedMonths, profileId, selectedMonth])

  const goToPrevMonth = useCallback(() => {
    if (isPrevMonthNavigationBlocked) {
      return
    }

    setSelectedMonth(getPrevMonthText(selectedMonth))
  }, [isPrevMonthNavigationBlocked, selectedMonth])

  const goToNextMonth = useCallback(() => {
    if (isNextMonthNavigationBlocked) {
      return
    }

    setSelectedMonth(getNextMonthText(selectedMonth))
  }, [isNextMonthNavigationBlocked, selectedMonth])

  return {
    selectedMonth,
    setSelectedMonth,
    currentMonth,
    monthNavigationStartMonth,
    setMonthNavigationStartMonth,
    budgetStartDate,
    savedBudgetStartDate,
    setBudgetStartDate,
    isFutureMonthNavigationLocked,
    setIsFutureMonthNavigationLocked,
    simpleMode,
    setSimpleMode,
    calendarHeatmapVariant,
    setCalendarHeatmapVariant,
    heatmapMode,
    setHeatmapMode,
    heatmapInverted,
    setHeatmapInverted,
    autoExcludePartialMonths,
    setAutoExcludePartialMonths,
    isSavingMonthNavigationSettings,
    monthNavigationErrorText,
    setMonthNavigationErrorText,
    lockedMonths,
    lockedMonthsSet,
    excludedMonths,
    excludedMonthsSet,
    isUpdatingSelectedMonthExclusion,
    isSelectedMonthExcluded: excludedMonthsSet.has(selectedMonth),
    isUpdatingSelectedMonthLock,
    isSelectedMonthLocked,
    minAllowedMonth,
    maxAllowedMonth,
    isPrevMonthNavigationBlocked,
    isNextMonthNavigationBlocked,
    loadMonthNavigationSettings,
    loadLockedMonths,
    loadExcludedMonths,
    handleSaveMonthNavigationSettings,
    handleLockSelectedMonth,
    handleUnlockSelectedMonth,
    handleToggleSelectedMonthExcluded,
    handleLockAllPastMonths,
    handleUnlockAllPastMonths,
    handleLockMonth,
    goToPrevMonth,
    goToNextMonth,
  }
}
