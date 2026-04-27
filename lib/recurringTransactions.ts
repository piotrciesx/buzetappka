import {
  Category,
  PaymentSource,
  RecurringTransaction,
  RecurringTransactionExecution,
  Transaction,
} from './budgetPageTypes'
import { getDaysInMonth } from './dateUtils'
import { getPaymentSourceOptionLabel } from './paymentSources'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export type RecurringExecutionStatus = 'completed' | 'skipped'

export type RecurringStatusSummary = {
  completedCount: number
  skippedCount: number
  remainingCount: number | null
  totalInstallments: number | null
  totalPlannedAmount: number | null
  elapsedCyclesCount: number | null
  effectiveCompletedCount: number
  effectiveStatus: RecurringTransaction['status']
}

const toUtcDate = (dateText: string) => {
  return new Date(`${dateText}T00:00:00Z`)
}

const diffInMonths = (fromDateText: string, toMonthText: string) => {
  const [fromYear, fromMonth] = fromDateText.slice(0, 7).split('-').map(Number)
  const [toYear, toMonth] = toMonthText.split('-').map(Number)
  return (toYear - fromYear) * 12 + (toMonth - fromMonth)
}

const getIntervalInMonths = (recurring: RecurringTransaction) => {
  if (recurring.frequency === 'yearly') {
    return 12
  }

  if (recurring.frequency === 'custom') {
    return Math.max(recurring.custom_interval_months || 1, 1)
  }

  return 1
}

const getElapsedRecurringCycles = (recurring: RecurringTransaction, referenceMonth: string) => {
  if (!recurring.start_date) {
    return null
  }

  const monthsDelta = diffInMonths(recurring.start_date, referenceMonth)

  if (monthsDelta < 0) {
    return 0
  }

  const intervalInMonths = getIntervalInMonths(recurring)
  return Math.floor(monthsDelta / intervalInMonths) + 1
}

export const mapRecurringTransactionRow = (row: Record<string, unknown>): RecurringTransaction => {
  const rawFrequency = typeof row.frequency === 'string' ? row.frequency : 'monthly'
  const rawStatus = typeof row.status === 'string' ? row.status : 'active'
  const rawKind =
    typeof row.kind === 'string' ? row.kind : row.installment_total_count ? 'installment' : 'open'

  return {
    id: String(row.id || ''),
    profile_id: String(row.profile_id || ''),
    name: String(row.name || row.description || 'Przypomnienie'),
    category_id: String(row.category_id || ''),
    payment_source_id: typeof row.payment_source_id === 'string' ? row.payment_source_id : null,
    amount:
      row.amount === null || row.amount === undefined || row.amount === ''
        ? null
        : Number(row.amount),
    description: typeof row.description === 'string' ? row.description : null,
    frequency: rawFrequency === 'yearly' || rawFrequency === 'custom' ? rawFrequency : 'monthly',
    custom_interval_months:
      typeof row.custom_interval_months === 'number'
        ? row.custom_interval_months
        : Number(row.custom_interval_months || 1),
    start_date: typeof row.start_date === 'string' ? row.start_date : null,
    end_date: typeof row.end_date === 'string' ? row.end_date : null,
    installment_total_count:
      typeof row.installment_total_count === 'number'
        ? row.installment_total_count
        : row.installment_total_count
          ? Number(row.installment_total_count)
          : null,
    kind: rawKind === 'installment' ? 'installment' : 'open',
    status: rawStatus === 'paused' || rawStatus === 'completed' ? rawStatus : 'active',
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
  }
}

export const mapRecurringExecutionRow = (
  row: Record<string, unknown>
): RecurringTransactionExecution => {
  const rawStatus = typeof row.status === 'string' ? row.status : 'completed'

  return {
    id: String(row.id || ''),
    recurring_transaction_id: String(row.recurring_transaction_id || ''),
    transaction_id: typeof row.transaction_id === 'string' ? row.transaction_id : null,
    generated_for_date: String(row.generated_for_date || ''),
    status: rawStatus === 'skipped' ? 'skipped' : 'completed',
    marked_at:
      typeof row.marked_at === 'string'
        ? row.marked_at
        : typeof row.created_at === 'string'
          ? row.created_at
          : undefined,
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
  }
}

export const getRecurringFrequencyLabel = (recurring: RecurringTransaction) => {
  if (recurring.frequency === 'yearly') {
    return 'Roczna'
  }

  if (recurring.frequency === 'custom') {
    const interval = Math.max(recurring.custom_interval_months || 1, 1)
    return `Interwał w miesiącach: ${interval}`
  }

  return 'Miesięczna'
}

export const getRecurringStatusLabel = (status: RecurringTransaction['status']) => {
  if (status === 'paused') {
    return 'Wstrzymane'
  }

  if (status === 'completed') {
    return 'Zakończone'
  }

  return 'Aktywne'
}

export const getRecurringKindLabel = (kind: RecurringTransaction['kind']) => {
  return kind === 'installment' ? 'Ratalne / zamknięte' : 'Otwarte'
}

export const isRecurringOpenEnded = (recurring: RecurringTransaction) => {
  return recurring.kind === 'open' && !recurring.end_date && !recurring.installment_total_count
}

export const getMonthCycleDate = (recurring: RecurringTransaction, monthText: string) => {
  const startDay = recurring.start_date ? Number(recurring.start_date.slice(8, 10)) || 1 : 1
  const cycleDay = Math.min(startDay, getDaysInMonth(monthText))
  return `${monthText}-${String(cycleDay).padStart(2, '0')}`
}

export const isRecurringExpectedInMonth = (
  recurring: RecurringTransaction,
  monthText: string
) => {
  if (recurring.status === 'completed' || recurring.status === 'paused') {
    return false
  }

  const startMonth = recurring.start_date?.slice(0, 7) || null

  if (startMonth && monthText < startMonth) {
    return false
  }

  if (recurring.end_date && monthText > recurring.end_date.slice(0, 7)) {
    return false
  }

  const monthsDelta = startMonth
    ? diffInMonths(recurring.start_date || `${monthText}-01`, monthText)
    : 0

  if (monthsDelta < 0) {
    return false
  }

  const intervalInMonths = getIntervalInMonths(recurring)

  return monthsDelta % intervalInMonths === 0
}

export const findExecutionForMonth = (
  recurringTransactionId: string,
  executions: RecurringTransactionExecution[],
  monthText: string
) => {
  return executions.find(
    (execution) =>
      execution.recurring_transaction_id === recurringTransactionId &&
      execution.generated_for_date.slice(0, 7) === monthText
  )
}

export const getRecurringExecutionHistory = (
  recurringTransactionId: string,
  executions: RecurringTransactionExecution[]
) => {
  return executions
    .filter((execution) => execution.recurring_transaction_id === recurringTransactionId)
    .sort((left, right) => right.generated_for_date.localeCompare(left.generated_for_date))
}

export const getLastCompletedExecution = (
  recurringTransactionId: string,
  executions: RecurringTransactionExecution[]
) => {
  return getRecurringExecutionHistory(recurringTransactionId, executions).find(
    (execution) => execution.status === 'completed'
  )
}

export const getInstallmentSummary = (
  recurring: RecurringTransaction,
  executions: RecurringTransactionExecution[],
  referenceMonth?: string
): RecurringStatusSummary => {
  const history = getRecurringExecutionHistory(recurring.id, executions)
  const completedCount = history.filter((execution) => execution.status === 'completed').length
  const skippedCount = history.filter((execution) => execution.status === 'skipped').length

  if (recurring.kind !== 'installment') {
    return {
      completedCount,
      skippedCount,
      remainingCount: null,
      totalInstallments: null,
      totalPlannedAmount: null,
      elapsedCyclesCount: null,
      effectiveCompletedCount: completedCount,
      effectiveStatus: recurring.status,
    }
  }

  const totalInstallments =
    recurring.installment_total_count ||
    (recurring.start_date && recurring.end_date
      ? diffInMonths(recurring.start_date, recurring.end_date.slice(0, 7)) + 1
      : null)
  const elapsedCycles =
    totalInstallments !== null && referenceMonth
      ? Math.min(getElapsedRecurringCycles(recurring, referenceMonth) || 0, totalInstallments)
      : null
  const effectiveCompletedCount = elapsedCycles ?? completedCount
  const effectiveStatus =
    recurring.status === 'paused' || recurring.status === 'completed'
      ? recurring.status
      : totalInstallments !== null && effectiveCompletedCount >= totalInstallments
        ? 'completed'
        : 'active'

  return {
    completedCount,
    skippedCount,
    remainingCount:
      totalInstallments === null
        ? null
        : Math.max(totalInstallments - effectiveCompletedCount, 0),
    totalInstallments,
    totalPlannedAmount:
      totalInstallments === null || recurring.amount === null
        ? null
        : totalInstallments * recurring.amount,
    elapsedCyclesCount: elapsedCycles,
    effectiveCompletedCount,
    effectiveStatus,
  }
}

export const getRecurringEffectiveStatus = (
  recurring: RecurringTransaction,
  executions: RecurringTransactionExecution[],
  referenceMonth: string
) => {
  return getInstallmentSummary(recurring, executions, referenceMonth).effectiveStatus
}

export const getPastDueCycleDates = (
  recurring: RecurringTransaction,
  referenceMonth: string
) => {
  if (!recurring.start_date) {
    return []
  }

  const startMonth = recurring.start_date.slice(0, 7)

  if (referenceMonth <= startMonth) {
    return []
  }

  const dates: string[] = []
  let currentMonth = startMonth

  while (currentMonth < referenceMonth) {
    if (isRecurringExpectedInMonth(recurring, currentMonth)) {
      dates.push(getMonthCycleDate(recurring, currentMonth))
    }

    const [year, month] = currentMonth.split('-').map(Number)
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    currentMonth = `${nextYear}-${String(nextMonth).padStart(2, '0')}`
  }

  return dates
}

export const getPendingRecurringTransactions = (
  recurringTransactions: RecurringTransaction[],
  executions: RecurringTransactionExecution[],
  monthText: string
) => {
  return recurringTransactions.filter((recurring) => {
    if (!isRecurringExpectedInMonth(recurring, monthText)) {
      return false
    }

    return !findExecutionForMonth(recurring.id, executions, monthText)
  })
}

export const getRecurringPaymentSourceLabel = (
  recurring: RecurringTransaction,
  paymentSources: PaymentSource[]
) => {
  if (!recurring.payment_source_id) {
    return 'Brak źródła'
  }

  const source = paymentSources.find((item) => item.id === recurring.payment_source_id)
  return source ? getPaymentSourceOptionLabel(source) : 'Źródło usunięte'
}

export const getRecurringDisplayLabel = (
  recurring: RecurringTransaction,
  categoriesById: Record<string, Category>
) => {
  const category = categoriesById[recurring.category_id]
  return category ? `${recurring.name} • ${category.name}` : recurring.name
}

export const buildRecurringSuggestions = ({
  recurringTransactions,
  executions,
  selectedMonth,
  categoryId,
  amountText,
  description,
}: {
  recurringTransactions: RecurringTransaction[]
  executions: RecurringTransactionExecution[]
  selectedMonth: string
  categoryId: string | null
  amountText: string
  description: string
}) => {
  const normalizedAmount = Number(String(amountText).replace(',', '.'))
  const normalizedDescription = description.trim().toLocaleLowerCase('pl')

  return getPendingRecurringTransactions(recurringTransactions, executions, selectedMonth)
    .filter((recurring) => {
      if (categoryId && recurring.category_id !== categoryId) {
        return false
      }

      const amountMatches =
        normalizedAmount > 0 &&
        recurring.amount !== null &&
        Math.abs(recurring.amount - normalizedAmount) < 0.01
      const descriptionMatches =
        normalizedDescription.length >= 3 &&
        recurring.name.toLocaleLowerCase('pl').includes(normalizedDescription)

      return amountMatches || descriptionMatches || recurring.category_id === categoryId
    })
    .slice(0, 5)
}

export const buildRecurringCompletionCandidates = ({
  recurringTransactions,
  executions,
  transaction,
  selectedRecurringTransactionId,
  description,
}: {
  recurringTransactions: RecurringTransaction[]
  executions: RecurringTransactionExecution[]
  transaction: Transaction
  selectedRecurringTransactionId: string | null
  description: string
}) => {
  const monthText = transaction.date.slice(0, 7)
  const normalizedDescription = description.trim().toLocaleLowerCase('pl')
  const linkedRecurringId = selectedRecurringTransactionId || transaction.recurring_transaction_id || null

  const baseCandidates = linkedRecurringId
    ? recurringTransactions.filter((recurring) => recurring.id === linkedRecurringId)
    : getPendingRecurringTransactions(recurringTransactions, executions, monthText).filter(
        (recurring) => recurring.category_id === transaction.category_id
      )

  return baseCandidates.filter((recurring) => {
    if (linkedRecurringId) {
      return true
    }

    const amountMatches =
      recurring.amount !== null &&
      Math.abs(Number(transaction.amount || 0) - Number(recurring.amount || 0)) < 0.01
    const descriptionMatches =
      normalizedDescription.length >= 3 &&
      recurring.name.toLocaleLowerCase('pl').includes(normalizedDescription)

    return amountMatches || descriptionMatches
  })
}

export const getRecurringExecutionStatusLabel = (status: RecurringExecutionStatus) => {
  return status === 'skipped' ? 'Pominięto' : 'Wykonano'
}

export const getDaysDifference = (fromDateText: string, toDateText: string) => {
  return Math.round(
    (toUtcDate(toDateText).getTime() - toUtcDate(fromDateText).getTime()) / MS_PER_DAY
  )
}
