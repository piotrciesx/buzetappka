import { RecurringTransaction } from '../../lib/budgetPageTypes'
import { getRecurringReminderDay } from '../../lib/recurringTransactions'
import { RecurringTransactionFormState } from './recurringTransactionsPanelTypes'

export const getInitialFormState = (): RecurringTransactionFormState => ({
  name: '',
  amount: '',
  categoryId: '',
  paymentSourceId: '',
  usePaymentSource: false,
  description: '',
  frequency: 'monthly',
  customIntervalMonths: '2',
  reminderDay: '1',
  startDate: '',
  endDate: '',
  installmentTotalCount: '',
  initialPaymentAmount: '',
  kind: 'open',
})

export const getFormStateFromRecurring = (
  recurring: RecurringTransaction
): RecurringTransactionFormState => ({
  id: recurring.id,
  name: recurring.name,
  amount: recurring.amount === null ? '' : String(recurring.amount),
  categoryId: recurring.category_id,
  paymentSourceId: recurring.payment_source_id || '',
  usePaymentSource: Boolean(recurring.payment_source_id),
  description: recurring.description || '',
  frequency: recurring.frequency,
  customIntervalMonths: String(recurring.custom_interval_months || 2),
  reminderDay: String(getRecurringReminderDay(recurring)),
  startDate: recurring.start_date || '',
  endDate: recurring.end_date || '',
  installmentTotalCount: String(recurring.installment_total_count || ''),
  initialPaymentAmount:
    recurring.initial_payment_amount === null || recurring.initial_payment_amount === undefined
      ? ''
      : String(recurring.initial_payment_amount),
  kind: recurring.kind,
})

export const normalizeAmount = (value: string) => {
  const normalized = Number(value.replace(',', '.'))
  return value.trim() && !Number.isNaN(normalized) ? normalized : null
}

export const normalizeDay = (value: string) => {
  const day = Number(value.replace(/\D/g, ''))
  return day ? String(Math.min(Math.max(day, 1), 31)) : ''
}

export const getIntervalInMonths = (
  frequency: RecurringTransaction['frequency'],
  customText: string
) => {
  if (frequency === 'yearly') return 12
  if (frequency === 'custom') return Math.max(Number(customText || 1), 1)
  return 1
}

export const addMonthsToDate = (dateText: string, monthsToAdd: number) => {
  const [year, month, day] = dateText.split('-').map(Number)
  const date = new Date(year, month - 1 + monthsToAdd, 1)
  const nextMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  const nextDay = Math.min(day || 1, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())
  return `${nextMonth}-${String(nextDay).padStart(2, '0')}`
}

export const getDateForDay = (monthText: string, dayText: string) =>
  `${monthText}-${String(Number(dayText) || 1).padStart(2, '0')}`

export const formatMoney = (value: number | null | undefined) =>
  value === null || value === undefined ? 'brak' : `${value.toFixed(2)} zł`
