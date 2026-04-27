import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCurrentMonthText, getMonthNumber, getNextMonthText, getPrevMonthText } from './dateUtils'
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
  lock_future_months: boolean
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
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthText)
  const [monthNavigationStartMonth, setMonthNavigationStartMonth] = useState(
    DEFAULT_MONTH_NAVIGATION_START_MONTH
  )
  const [isFutureMonthNavigationLocked, setIsFutureMonthNavigationLocked] = useState(true)
  const [isSavingMonthNavigationSettings, setIsSavingMonthNavigationSettings] = useState(false)
  const [monthNavigationErrorText, setMonthNavigationErrorText] = useState('')
  const [lockedMonths, setLockedMonths] = useState<string[]>([])
  const [isUpdatingSelectedMonthLock, setIsUpdatingSelectedMonthLock] = useState(false)

  const currentMonth = useMemo(() => getCurrentMonthText(), [])
  const lockedMonthsSet = useMemo(() => new Set(lockedMonths), [lockedMonths])

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
      if (!monthText) {
        return ''
      }

      if (getMonthNumber(monthText) > getMonthNumber(currentMonth)) {
        return `Start historii nie może być późniejszy niż bieżący miesiąc ${currentMonth}.`
      }

      return ''
    },
    [currentMonth]
  )

  const loadMonthNavigationSettings = useCallback(async () => {
    setMonthNavigationErrorText('')

    const { data, error } = await supabase
      .from('profile_month_navigation_settings')
      .select('profile_id, min_history_month, lock_future_months')
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
      setIsFutureMonthNavigationLocked(true)
      setSelectedMonth((prev) =>
        clampMonthToNavigationRange(prev, DEFAULT_MONTH_NAVIGATION_START_MONTH, currentMonth)
      )
      return
    }

    const settings = data as MonthNavigationSettingsRow | null
    const nextMinAllowedMonth =
      settings?.min_history_month?.slice(0, 7) || DEFAULT_MONTH_NAVIGATION_START_MONTH
    const nextFutureLocked = settings?.lock_future_months ?? true
    const nextMaxAllowedMonth = nextFutureLocked ? currentMonth : null

    setMonthNavigationStartMonth(nextMinAllowedMonth)
    setIsFutureMonthNavigationLocked(nextFutureLocked)
    setSelectedMonth((prev) =>
      clampMonthToNavigationRange(prev, nextMinAllowedMonth, nextMaxAllowedMonth)
    )
  }, [clampMonthToNavigationRange, currentMonth, profileId])

  const loadLockedMonths = useCallback(async () => {
    try {
      const months = await loadLockedMonthsHelper(supabase, profileId)
      setLockedMonths(months)
    } catch (error) {
      setLockedMonths([])
    }
  }, [profileId])

  const minAllowedMonth = monthNavigationStartMonth || null
  const maxAllowedMonth = isFutureMonthNavigationLocked ? currentMonth : null

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
    const clampedMonth = clampMonthToNavigationRange(selectedMonth, minAllowedMonth, maxAllowedMonth)

    if (clampedMonth !== selectedMonth) {
      setSelectedMonth(clampedMonth)
    }
  }, [clampMonthToNavigationRange, maxAllowedMonth, minAllowedMonth, selectedMonth])

  const handleSaveMonthNavigationSettings = useCallback(async () => {
    const validationError = validateMonthNavigationStartMonth(monthNavigationStartMonth)

    if (validationError) {
      setMonthNavigationErrorText(validationError)
      return
    }

    setIsSavingMonthNavigationSettings(true)
    setMonthNavigationErrorText('')

    const payload = {
      min_history_month: monthNavigationStartMonth ? `${monthNavigationStartMonth}-01` : null,
      lock_future_months: isFutureMonthNavigationLocked,
      updated_at: new Date().toISOString(),
    }

    const { data: updatedSettings, error: updateError } = await supabase
      .from('profile_month_navigation_settings')
      .update(payload)
      .eq('profile_id', profileId)
      .select('profile_id')
      .maybeSingle()

    if (updateError) {
      setMonthNavigationErrorText(
        getErrorMessage(updateError, 'Nie udało się zapisać ustawień nawigacji miesięcy.')
      )
      setIsSavingMonthNavigationSettings(false)
      return
    }

    if (!updatedSettings) {
      const { error: insertError } = await supabase.from('profile_month_navigation_settings').insert(
        {
          profile_id: profileId,
          ...payload,
        }
      )

      if (insertError) {
        setMonthNavigationErrorText(
          getErrorMessage(insertError, 'Nie udało się zapisać ustawień nawigacji miesięcy.')
        )
        setIsSavingMonthNavigationSettings(false)
        return
      }
    }

    const nextMaxAllowedMonth = isFutureMonthNavigationLocked ? currentMonth : null

    setSelectedMonth((prev) =>
      clampMonthToNavigationRange(prev, monthNavigationStartMonth, nextMaxAllowedMonth)
    )
    setIsSavingMonthNavigationSettings(false)
  }, [
    clampMonthToNavigationRange,
    currentMonth,
    isFutureMonthNavigationLocked,
    monthNavigationStartMonth,
    profileId,
    validateMonthNavigationStartMonth,
  ])

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
    isFutureMonthNavigationLocked,
    setIsFutureMonthNavigationLocked,
    isSavingMonthNavigationSettings,
    monthNavigationErrorText,
    setMonthNavigationErrorText,
    lockedMonths,
    lockedMonthsSet,
    isUpdatingSelectedMonthLock,
    isSelectedMonthLocked,
    minAllowedMonth,
    maxAllowedMonth,
    isPrevMonthNavigationBlocked,
    isNextMonthNavigationBlocked,
    loadMonthNavigationSettings,
    loadLockedMonths,
    handleSaveMonthNavigationSettings,
    handleLockSelectedMonth,
    handleUnlockSelectedMonth,
    goToPrevMonth,
    goToNextMonth,
  }
}