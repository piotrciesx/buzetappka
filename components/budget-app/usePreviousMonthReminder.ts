'use client'

import { useMemo, useState } from 'react'
import { getPrevMonthText } from '../../lib/dateUtils'

type UsePreviousMonthReminderInput = {
  currentMonth: string
  lockedMonthsSet: Set<string>
}

export function usePreviousMonthReminder({
  currentMonth,
  lockedMonthsSet,
}: UsePreviousMonthReminderInput) {
  const [isPreviousMonthCloseReminderHidden, setIsPreviousMonthCloseReminderHidden] =
    useState(false)
  const [currentDayOfMonth, setCurrentDayOfMonth] = useState<number | null>(null)

  const previousMonthCloseReminder = useMemo(() => {
    if (
      currentDayOfMonth === null ||
      currentDayOfMonth < 5 ||
      !currentMonth ||
      isPreviousMonthCloseReminderHidden
    ) {
      return null
    }

    const previousMonth = getPrevMonthText(currentMonth)

    if (lockedMonthsSet.has(previousMonth)) {
      return null
    }

    return previousMonth
  }, [currentDayOfMonth, currentMonth, isPreviousMonthCloseReminderHidden, lockedMonthsSet])

  return {
    previousMonthCloseReminder,
    setCurrentDayOfMonth,
    setIsPreviousMonthCloseReminderHidden,
  }
}
