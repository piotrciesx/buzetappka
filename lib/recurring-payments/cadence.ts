import type { RecurringCadence } from './types'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const parseDateParts = (dateText: string) => {
  if (!DATE_PATTERN.test(dateText)) {
    throw new Error(`Invalid ISO date: ${dateText}`)
  }

  const [year, month, day] = dateText.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid ISO date: ${dateText}`)
  }

  return { year, month, day }
}

const formatUtcDate = (date: Date) => date.toISOString().slice(0, 10)

const getDaysInUtcMonth = (year: number, monthIndex: number) => {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
}

const assertCadence = (cadence: RecurringCadence) => {
  if (!Number.isSafeInteger(cadence.interval) || cadence.interval <= 0) {
    throw new Error('Cadence interval must be a positive integer.')
  }
}

export const addRecurringCadence = (
  anchorDate: string,
  cadence: RecurringCadence,
  occurrenceOffset = 1
) => {
  assertCadence(cadence)

  if (!Number.isSafeInteger(occurrenceOffset) || occurrenceOffset < 0) {
    throw new Error('Occurrence offset must be a non-negative integer.')
  }

  const { year, month, day } = parseDateParts(anchorDate)
  const interval = cadence.interval * occurrenceOffset

  if (cadence.unit === 'day' || cadence.unit === 'week') {
    const date = new Date(Date.UTC(year, month - 1, day))
    date.setUTCDate(date.getUTCDate() + interval * (cadence.unit === 'week' ? 7 : 1))
    return formatUtcDate(date)
  }

  const monthsToAdd = interval * (cadence.unit === 'year' ? 12 : 1)
  const absoluteMonth = year * 12 + (month - 1) + monthsToAdd
  const targetYear = Math.floor(absoluteMonth / 12)
  const targetMonthIndex = absoluteMonth % 12
  const targetDay = Math.min(day, getDaysInUtcMonth(targetYear, targetMonthIndex))

  return formatUtcDate(new Date(Date.UTC(targetYear, targetMonthIndex, targetDay)))
}

export const buildRecurringDueDates = ({
  startDate,
  cadence,
  count,
}: {
  startDate: string
  cadence: RecurringCadence
  count: number
}) => {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error('Due date count must be a non-negative integer.')
  }

  return Array.from({ length: count }, (_, index) =>
    addRecurringCadence(startDate, cadence, index)
  )
}

