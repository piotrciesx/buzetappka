import {
  Category,
  PaymentSource,
  RecurringReminderMonthStatus,
  RecurringTransaction,
  RecurringTransactionExecution,
  Transaction,
} from './budgetPageTypes'
import { getUniqueCategoryLabel } from './categoryUtils'
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

const getAnchorDate = (recurring: RecurringTransaction, fallbackMonth: string) => {
  return recurring.start_date || recurring.created_at?.slice(0, 10) || `${fallbackMonth}-01`
}

const getElapsedRecurringCycles = (recurring: RecurringTransaction, referenceMonth: string) => {
  const anchorDate = getAnchorDate(recurring, referenceMonth)
  const monthsDelta = diffInMonths(anchorDate, referenceMonth)

  if (monthsDelta < 0) {
    return 0
  }

  return Math.floor(monthsDelta / getIntervalInMonths(recurring)) + 1
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
    use_amount_when_creating: Boolean(row.use_amount_when_creating),
    initial_payment_amount:
      row.initial_payment_amount === null ||
      row.initial_payment_amount === undefined ||
      row.initial_payment_amount === ''
        ? null
        : Number(row.initial_payment_amount),
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

export const mapRecurringReminderMonthStatusRow = (
  row: Record<string, unknown>
): RecurringReminderMonthStatus => {
  const rawStatus = typeof row.status === 'string' ? row.status : 'read'

  return {
    id: String(row.id || ''),
    profile_id: String(row.profile_id || ''),
    reminder_id: String(row.reminder_id || row.recurring_transaction_id || ''),
    month: String(row.month || '').slice(0, 7),
    status: rawStatus === 'linked' ? 'linked' : 'read',
    transaction_id: typeof row.transaction_id === 'string' ? row.transaction_id : null,
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
    updated_at: typeof row.updated_at === 'string' ? row.updated_at : undefined,
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
    return 'co rok'
  }

  if (recurring.frequency === 'custom') {
    return `co ${Math.max(recurring.custom_interval_months || 1, 1)} mies.`
  }

  return 'co miesiąc'
}

export const getRecurringStatusLabel = (status: RecurringTransaction['status']) => {
  if (status === 'paused') {
    return 'Wyłączone'
  }

  if (status === 'completed') {
    return 'Zakończone'
  }

  return 'Aktywne'
}

export const getRecurringKindLabel = (kind: RecurringTransaction['kind']) => {
  return kind === 'installment' ? 'Plan ratalny' : 'Przypomnienie stałe'
}

export const isRecurringOpenEnded = (recurring: RecurringTransaction) => {
  return recurring.kind === 'open' && !recurring.end_date && !recurring.installment_total_count
}

export const getRecurringReminderDay = (recurring: RecurringTransaction) => {
  const storedDay = recurring.start_date ? Number(recurring.start_date.slice(8, 10)) : null
  const fallbackDay = recurring.created_at ? Number(recurring.created_at.slice(8, 10)) : null
  const day = storedDay || fallbackDay || 1

  return Math.min(Math.max(day, 1), 31)
}

export const getMonthCycleDate = (recurring: RecurringTransaction, monthText: string) => {
  const cycleDay = Math.min(getRecurringReminderDay(recurring), getDaysInMonth(monthText))
  return `${monthText}-${String(cycleDay).padStart(2, '0')}`
}

export const isRecurringExpectedInMonth = (
  recurring: RecurringTransaction,
  monthText: string
) => {
  if (recurring.status === 'completed' || recurring.status === 'paused') {
    return false
  }

  const startMonth = recurring.start_date?.slice(0, 7) || recurring.created_at?.slice(0, 7) || null

  if (startMonth && monthText < startMonth) {
    return false
  }

  if (recurring.end_date && monthText > recurring.end_date.slice(0, 7)) {
    return false
  }

  const monthsDelta = diffInMonths(getAnchorDate(recurring, monthText), monthText)

  if (monthsDelta < 0 || monthsDelta % getIntervalInMonths(recurring) !== 0) {
    return false
  }

  if (recurring.kind === 'installment') {
    const totalInstallments = recurring.installment_total_count || 0
    const installmentIndex = Math.floor(monthsDelta / getIntervalInMonths(recurring)) + 1
    return totalInstallments > 0 && installmentIndex <= totalInstallments
  }

  return true
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
      ? Math.min(getElapsedRecurringCycles(recurring, referenceMonth), totalInstallments)
      : null
  const effectiveCompletedCount =
    elapsedCycles === null ? completedCount : Math.max(completedCount, elapsedCycles)
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
      totalInstallments === null ? null : Math.max(totalInstallments - effectiveCompletedCount, 0),
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

export const getPastDueCycleDates = () => {
  return []
}

export const getPendingRecurringTransactions = (
  recurringTransactions: RecurringTransaction[],
  _executions: RecurringTransactionExecution[],
  monthText: string,
  monthStatuses: RecurringReminderMonthStatus[] = []
) => {
  const today = new Date()
  const currentMonthText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  return recurringTransactions.filter((recurring) => {
    if (!isRecurringExpectedInMonth(recurring, monthText)) {
      return false
    }

    if (monthText === currentMonthText && today.getDate() < getRecurringReminderDay(recurring)) {
      return false
    }

    return !monthStatuses.some(
      (status) => status.reminder_id === recurring.id && status.month === monthText
    )
  })
}

export const getInstallmentNumberForMonth = (
  recurring: RecurringTransaction,
  monthText: string
) => {
  if (recurring.kind !== 'installment') {
    return null
  }

  const elapsed = getElapsedRecurringCycles(recurring, monthText)
  const total = recurring.installment_total_count || null

  if (!elapsed || elapsed < 1) {
    return null
  }

  return {
    current: total ? Math.min(elapsed, total) : elapsed,
    total,
  }
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
  const categoryLabel = getUniqueCategoryLabel(recurring.category_id, categoriesById)
  return categoryLabel ? `${recurring.name} • ${categoryLabel}` : recurring.name
}

export const buildRecurringSuggestions = ({
  recurringTransactions,
  executions,
  monthStatuses = [],
  selectedMonth,
  categoryId,
  amountText,
  description,
}: {
  recurringTransactions: RecurringTransaction[]
  executions: RecurringTransactionExecution[]
  monthStatuses?: RecurringReminderMonthStatus[]
  selectedMonth: string
  categoryId: string | null
  amountText: string
  description: string
}) => {
  const normalizedAmount = Number(String(amountText).replace(',', '.'))
  const normalizedDescription = description.trim().toLocaleLowerCase('pl')

  if (!categoryId) {
    return []
  }

  return getPendingRecurringTransactions(recurringTransactions, executions, selectedMonth, monthStatuses)
    .filter((recurring) => {
      if (recurring.category_id !== categoryId) {
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
  return status === 'skipped' ? 'Przypomnienie zamknięte' : 'Powiązane z wpisem'
}

export const getDaysDifference = (fromDateText: string, toDateText: string) => {
  return Math.round(
    (toUtcDate(toDateText).getTime() - toUtcDate(fromDateText).getTime()) / MS_PER_DAY
  )
}
