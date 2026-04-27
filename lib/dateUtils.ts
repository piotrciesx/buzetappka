export const getMonthNumber = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)
  return year * 100 + month
}

export const getCurrentMonthText = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
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
  return new Date(year, month, 0).getDate()
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
