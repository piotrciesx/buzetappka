export const getMonthNumber = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return 0
  }

  return year * 100 + month
}

export const getCurrentMonthText = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export const getMonthKeyFromDate = (dateText: string | null | undefined) => {
  if (!dateText || typeof dateText !== 'string') {
    return ''
  }

  return dateText.slice(0, 7)
}

export const isDateBeforeBudgetStart = (
  dateText: string | null | undefined,
  budgetStartDate: string | null | undefined
) => {
  if (!dateText || !budgetStartDate) {
    return false
  }

  return dateText.slice(0, 10) < budgetStartDate.slice(0, 10)
}

export const isMonthPartialByBudgetStart = (
  monthText: string,
  budgetStartDate: string | null | undefined
) => {
  if (!budgetStartDate) {
    return false
  }

  return getMonthKeyFromDate(budgetStartDate) === monthText && budgetStartDate.slice(8, 10) !== '01'
}

export const isMonthExcludedFromStats = (
  monthText: string,
  excludedMonthsSet: Set<string> | null | undefined
) => {
  return Boolean(excludedMonthsSet?.has(monthText))
}

export const getNextMonthText = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)
  const date = new Date(year, month, 1)
  const newYear = date.getFullYear()
  const newMonth = String(date.getMonth() + 1).padStart(2, '0')
  return `${newYear}-${newMonth}`
}

export const getPrevMonthText = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)
  const date = new Date(year, month - 2, 1)
  const newYear = date.getFullYear()
  const newMonth = String(date.getMonth() + 1).padStart(2, '0')
  return `${newYear}-${newMonth}`
}

export const getMonthStartIso = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
  return date.toISOString()
}

export const getActiveToForMonth = (monthText: string) => {
  return getMonthStartIso(monthText)
}

export const getDaysInMonth = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return 31
  }

  return new Date(year, month, 0).getDate()
}

const getCurrentDateText = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const getExistingDaysInMonth = (monthText: string) => {
  const currentMonth = getCurrentMonthText()
  const daysInMonth = getDaysInMonth(monthText)

  if (monthText < currentMonth) {
    return daysInMonth
  }

  if (monthText > currentMonth) {
    return 0
  }

  return Math.min(new Date().getDate(), daysInMonth)
}

export const isFutureDate = (dateText: string) => {
  return dateText.slice(0, 10) > getCurrentDateText()
}

export const isExistingDate = (dateText: string) => {
  return !isFutureDate(dateText)
}

export const getMonthDateFromDay = (monthText: string, day: number) => {
  const clampedDay = Math.min(Math.max(day, 1), getDaysInMonth(monthText))
  return `${monthText}-${String(clampedDay).padStart(2, '0')}`
}

export const normalizeDayInput = (value: string, monthText: string) => {
  const digitsOnly = value.replace(/\D/g, '')

  if (!digitsOnly) {
    return ''
  }

  const numericDay = Number(digitsOnly)

  if (!numericDay) {
    return '1'
  }

  return String(Math.min(Math.max(numericDay, 1), getDaysInMonth(monthText)))
}

export const getDayInputFromDate = (dateText: string | null | undefined, monthText: string) => {
  if (!dateText || typeof dateText !== 'string') {
    return ''
  }

  const [rawYear, rawMonth, rawDay] = dateText.split('-')

  if (!rawYear || !rawMonth || !rawDay) {
    return ''
  }

  if (`${rawYear}-${rawMonth}` !== monthText) {
    return normalizeDayInput(rawDay, monthText)
  }

  return normalizeDayInput(rawDay, monthText)
}

export const buildDateFromDayInput = (monthText: string, dayText: string) => {
  const normalizedDay = normalizeDayInput(dayText, monthText)

  if (!normalizedDay) {
    return ''
  }

  return getMonthDateFromDay(monthText, Number(normalizedDay))
}

export const normalizeDateToMonth = (dateText: string | null | undefined, monthText: string) => {
  if (!dateText || typeof dateText !== 'string') {
    return getMonthDateFromDay(monthText, 1)
  }

  const [rawYear, rawMonth, rawDay] = dateText.split('-')

  if (`${rawYear}-${rawMonth}` !== monthText) {
    return getMonthDateFromDay(monthText, Number(rawDay) || 1)
  }

  return getMonthDateFromDay(monthText, Number(rawDay) || 1)
}
