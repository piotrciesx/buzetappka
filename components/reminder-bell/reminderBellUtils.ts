import type { RecurringTransaction } from '../../lib/budgetPageTypes'

export const initialForm = {
  id: '',
  name: '',
  categoryId: '',
  kind: 'open' as RecurringTransaction['kind'],
  entryDescription: '',
  amount: '',
  frequency: 'monthly' as RecurringTransaction['frequency'],
  customIntervalMonths: '2',
  reminderDay: '1',
  hasStartDate: false,
  startDate: '',
  hasEndDate: false,
  endDate: '',
  installmentTotalCount: '',
}

export const toAmount = (value: string) => {
  const normalized = Number(value.replace(',', '.'))
  return value.trim() && !Number.isNaN(normalized) ? normalized : null
}

export const normalizeDay = (value: string) => {
  const day = Number(value.replace(/\D/g, ''))

  if (!day) {
    return ''
  }

  return String(Math.min(Math.max(day, 1), 31))
}

export const setDateDay = (dateText: string, dayText: string) => {
  const month = dateText ? dateText.slice(0, 7) : ''
  const day = String(Number(dayText) || 1).padStart(2, '0')
  return month ? `${month}-${day}` : ''
}

const getIntervalInMonths = (reminder: RecurringTransaction) => {
  if (reminder.frequency === 'yearly') {
    return 12
  }

  if (reminder.frequency === 'custom') {
    return Math.max(reminder.custom_interval_months || 1, 1)
  }

  return 1
}

const getMonthDifference = (fromDateText: string, toMonthText: string) => {
  const [fromYear, fromMonth] = fromDateText.slice(0, 7).split('-').map(Number)
  const [toYear, toMonth] = toMonthText.split('-').map(Number)
  return (toYear - fromYear) * 12 + (toMonth - fromMonth)
}

const addMonthsToDate = (dateText: string, monthsToAdd: number) => {
  const [year, month, day] = dateText.split('-').map(Number)
  const date = new Date(year, month - 1 + monthsToAdd, 1)
  const nextMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  const nextDay = Math.min(day || 1, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())

  return `${nextMonth}-${String(nextDay).padStart(2, '0')}`
}

export const getInstallmentScheduleInfo = (
  reminder: RecurringTransaction | null,
  selectedMonth: string
) => {
  if (!reminder || reminder.kind !== 'installment' || !reminder.start_date) {
    return {
      scheduledDone: 0,
      scheduledRemaining: reminder?.installment_total_count ?? null,
      currentLabel: null,
      nextInstallmentDate: null,
    }
  }

  const total = reminder.installment_total_count || null
  const interval = getIntervalInMonths(reminder)
  const monthsDelta = getMonthDifference(reminder.start_date, selectedMonth)
  const rawDone = monthsDelta < 0 ? 0 : Math.floor(monthsDelta / interval) + 1
  const scheduledDone = total ? Math.min(rawDone, total) : rawDone
  const scheduledRemaining = total === null ? null : Math.max(total - scheduledDone, 0)
  const nextInstallmentDate =
    total !== null && scheduledDone >= total
      ? null
      : addMonthsToDate(reminder.start_date, scheduledDone * interval)

  return {
    scheduledDone,
    scheduledRemaining,
    currentLabel: total ? `${scheduledDone}/${total}` : `${scheduledDone}/?`,
    nextInstallmentDate,
  }
}
