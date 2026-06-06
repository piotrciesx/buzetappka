import { RecurringInstallment, RecurringTransaction } from '../../lib/budgetPageTypes'
import { getRecurringReminderDay } from '../../lib/recurringTransactions'
import { RecurringTransactionFormState } from './recurringTransactionsPanelTypes'

export type ScheduleBalance = {
  sum: number
  difference: number
  isBalanced: boolean
  message: string
}

export const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

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
  installmentTotalAmount: '',
  installmentSchedule: [],
  initialPaymentAmount: '',
  kind: 'open',
})

export const getFormStateFromRecurring = (
  recurring: RecurringTransaction
): RecurringTransactionFormState => {
  const fallbackTotal =
    recurring.kind === 'installment' && recurring.amount !== null && recurring.installment_total_count
      ? roundMoney(recurring.amount * recurring.installment_total_count)
      : null
  const totalAmount =
    recurring.initial_payment_amount === null || recurring.initial_payment_amount === undefined
      ? fallbackTotal
      : recurring.initial_payment_amount

  return {
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
    installmentTotalAmount: totalAmount === null ? '' : String(totalAmount),
    installmentSchedule: recurring.installment_schedule || [],
    initialPaymentAmount: totalAmount === null ? '' : String(totalAmount),
    kind: recurring.kind,
  }
}

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

export const getScheduleSum = (schedule: RecurringInstallment[]) =>
  roundMoney(schedule.reduce((sum, installment) => sum + Number(installment.amount || 0), 0))

export const getScheduleBalance = (
  totalAmount: number | null,
  schedule: RecurringInstallment[]
): ScheduleBalance => {
  const sum = getScheduleSum(schedule)

  if (totalAmount === null) {
    return {
      sum,
      difference: 0,
      isBalanced: schedule.length > 0,
      message: '',
    }
  }

  const difference = roundMoney(totalAmount - sum)
  const isBalanced = Math.abs(difference) < 0.01

  return {
    sum,
    difference,
    isBalanced,
    message: isBalanced
      ? 'Harmonogram jest zgodny z kwotą całkowitą.'
      : difference > 0
        ? `Suma rat jest niższa od kwoty całkowitej o ${formatMoney(difference)}.`
        : `Suma rat przekracza kwotę całkowitą o ${formatMoney(Math.abs(difference))}.`,
  }
}

export const inferInstallmentCount = ({
  totalAmount,
  installmentAmount,
  explicitCount,
}: {
  totalAmount: number | null
  installmentAmount: number | null
  explicitCount: number | null
}) => {
  if (explicitCount && explicitCount > 0) return explicitCount
  if (totalAmount !== null && installmentAmount !== null && installmentAmount > 0) {
    return Math.ceil(totalAmount / installmentAmount)
  }
  return null
}

export const buildInstallmentSchedule = ({
  totalAmount,
  installmentAmount,
  installmentCount,
  startDate,
  frequency,
  customIntervalMonths,
}: {
  totalAmount: number | null
  installmentAmount: number | null
  installmentCount: number
  startDate: string
  frequency: RecurringTransaction['frequency']
  customIntervalMonths: string
}) => {
  const interval = getIntervalInMonths(frequency, customIntervalMonths)
  const baseAmount =
    installmentAmount !== null && installmentAmount > 0
      ? installmentAmount
      : totalAmount !== null
        ? roundMoney(totalAmount / installmentCount)
        : 0

  return Array.from({ length: installmentCount }, (_, index) => {
    const isLast = index === installmentCount - 1
    const previousSum = roundMoney(baseAmount * index)
    const amount =
      totalAmount !== null && isLast
        ? Math.max(roundMoney(totalAmount - previousSum), 0)
        : roundMoney(baseAmount)

    return {
      installment_number: index + 1,
      due_date: addMonthsToDate(startDate, index * interval),
      amount,
    }
  })
}

export const rebalanceScheduleLast = (
  schedule: RecurringInstallment[],
  totalAmount: number | null
) => {
  if (totalAmount === null || schedule.length === 0) return schedule

  const next = schedule.map((installment) => ({ ...installment }))
  const sumExceptLast = getScheduleSum(next.slice(0, -1))
  next[next.length - 1] = {
    ...next[next.length - 1],
    amount: Math.max(roundMoney(totalAmount - sumExceptLast), 0),
  }
  return next
}

export const rebalanceScheduleProportionally = (
  schedule: RecurringInstallment[],
  totalAmount: number | null
) => {
  if (totalAmount === null || schedule.length === 0) return schedule

  const currentSum = getScheduleSum(schedule)
  if (currentSum <= 0) return rebalanceScheduleLast(schedule, totalAmount)

  const next = schedule.map((installment) => ({
    ...installment,
    amount: roundMoney((installment.amount / currentSum) * totalAmount),
  }))

  return rebalanceScheduleLast(next, totalAmount)
}
