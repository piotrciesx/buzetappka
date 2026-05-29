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

export type ReminderMonthLifecycleStatus =
  | 'pending'
  | 'snoozed'
  | 'handled_without_transaction'
  | 'handled_with_transaction'

export type ReminderMonthState = {
  reminderId: string
  month: string
  status: ReminderMonthLifecycleStatus
  transactionId: string | null
  snoozedUntil: string | null
  source: 'month-status' | 'execution' | 'linked-transaction' | 'snooze-ui-delay' | 'pending'
}

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

type LegacyReminderStateInput = {
  recurringId: string
  month: string
  monthStatus?: RecurringReminderMonthStatus | null
  execution?: RecurringTransactionExecution | null
  linkedTransaction?: Transaction | null
  snoozedUntil?: string | null
}

const toUtcDate = (dateText: string) => {
  return new Date(`${dateText}T00:00:00Z`)
}

const diffInMonths = (fromDateText: string, toMonthText: string) => {
  const [fromYear, fromMonth] = fromDateText.slice(0, 7).split('-').map(Number)
  const [toYear, toMonth] = toMonthText.split('-').map(Number)
  return (toYear - fromYear) * 12 + (toMonth - fromMonth)
}

const shiftMonthText = (monthText: string, delta: number) => {
  const [year, month] = monthText.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
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
  const storedStatus =
    rawStatus === 'linked' || rawStatus === 'handled_with_transaction' ? 'linked' : 'read'

  return {
    id: String(row.id || ''),
    profile_id: String(row.profile_id || ''),
    reminder_id: String(row.reminder_id || row.recurring_transaction_id || ''),
    month: String(row.month || '').slice(0, 7),
    status: storedStatus,
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

export const getReminderScheduleForMonth = (
  recurring: RecurringTransaction,
  monthText: string
) => {
  if (!isRecurringExpectedInMonth(recurring, monthText)) {
    return null
  }

  const installment = getInstallmentNumberForMonth(recurring, monthText)

  return {
    reminderId: recurring.id,
    month: monthText,
    dueDate: getMonthCycleDate(recurring, monthText),
    kind: recurring.kind,
    expectedAmount: recurring.amount,
    installment,
  }
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

export const mapLegacyReminderStateToLifecycle = ({
  recurringId,
  month,
  monthStatus,
  execution,
  linkedTransaction,
  snoozedUntil,
}: LegacyReminderStateInput): ReminderMonthState => {
  if (monthStatus) {
    const transactionId = monthStatus.transaction_id || linkedTransaction?.id || null
    return {
      reminderId: recurringId,
      month,
      status:
        monthStatus.status === 'linked' || transactionId
          ? 'handled_with_transaction'
          : 'handled_without_transaction',
      transactionId,
      snoozedUntil: null,
      source: 'month-status',
    }
  }

  if (linkedTransaction) {
    return {
      reminderId: recurringId,
      month,
      status: 'handled_with_transaction',
      transactionId: linkedTransaction.id,
      snoozedUntil: null,
      source: 'linked-transaction',
    }
  }

  if (execution) {
    return {
      reminderId: recurringId,
      month,
      status:
        execution.status === 'completed' && execution.transaction_id
          ? 'handled_with_transaction'
          : 'handled_without_transaction',
      transactionId: execution.transaction_id || null,
      snoozedUntil: null,
      source: 'execution',
    }
  }

  if (snoozedUntil) {
    return {
      reminderId: recurringId,
      month,
      status: 'snoozed',
      transactionId: null,
      snoozedUntil,
      source: 'snooze-ui-delay',
    }
  }

  return {
    reminderId: recurringId,
    month,
    status: 'pending',
    transactionId: null,
    snoozedUntil: null,
    source: 'pending',
  }
}

export const getReminderMonthStatus = ({
  recurring,
  monthText,
  monthStatuses = [],
  executions = [],
  transactions = [],
  snoozedUntil = null,
}: {
  recurring: RecurringTransaction
  monthText: string
  monthStatuses?: RecurringReminderMonthStatus[]
  executions?: RecurringTransactionExecution[]
  transactions?: Transaction[]
  snoozedUntil?: string | null
}): ReminderMonthState => {
  const normalizedMonth = monthText.slice(0, 7)
  const explicitStatus = monthStatuses.find(
    (status) => status.reminder_id === recurring.id && status.month === normalizedMonth
  )
  const linkedTransaction = transactions.find(
    (transaction) =>
      transaction.is_deleted !== true &&
      transaction.recurring_transaction_id === recurring.id &&
      transaction.date.slice(0, 7) === normalizedMonth
  )
  const execution = findExecutionForMonth(recurring.id, executions, normalizedMonth)

  return mapLegacyReminderStateToLifecycle({
    recurringId: recurring.id,
    month: normalizedMonth,
    monthStatus: explicitStatus,
    execution,
    linkedTransaction,
    snoozedUntil,
  })
}

export const getRecurringReminderState = getReminderMonthStatus
export const getReminderMonthLifecycle = getReminderMonthStatus

export const isReminderMonthHandled = (state: ReminderMonthState) => {
  return (
    state.status === 'handled_with_transaction' ||
    state.status === 'handled_without_transaction'
  )
}

export const mapReminderLifecycleStatusToStoredStatus = (
  status: ReminderMonthLifecycleStatus
): RecurringReminderMonthStatus['status'] => {
  if (status === 'handled_with_transaction') {
    return 'linked'
  }

  if (status === 'handled_without_transaction') {
    return 'read'
  }

  throw new Error(`Status ${status} is UI-only and cannot be stored as handled reminder state.`)
}

export const getRecurringExecutionHistory = (
  recurringTransactionId: string,
  executions: RecurringTransactionExecution[]
) => {
  return executions
    .filter((execution) => execution.recurring_transaction_id === recurringTransactionId)
    .sort((left, right) => right.generated_for_date.localeCompare(left.generated_for_date))
}

const buildRecurringStatusSummary = (
  recurring: RecurringTransaction,
  referenceMonth: string | undefined,
  handledWithTransactionCount: number,
  handledWithoutTransactionCount: number
): RecurringStatusSummary => {
  const effectiveCompletedCount = handledWithTransactionCount + handledWithoutTransactionCount

  if (recurring.kind !== 'installment') {
    return {
      completedCount: handledWithTransactionCount,
      skippedCount: handledWithoutTransactionCount,
      remainingCount: null,
      totalInstallments: null,
      totalPlannedAmount: null,
      elapsedCyclesCount: null,
      effectiveCompletedCount,
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
  const effectiveStatus =
    recurring.status === 'paused' || recurring.status === 'completed'
      ? recurring.status
      : totalInstallments !== null && effectiveCompletedCount >= totalInstallments
        ? 'completed'
        : 'active'

  return {
    completedCount: handledWithTransactionCount,
    skippedCount: handledWithoutTransactionCount,
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

export const getInstallmentSummary = (
  recurring: RecurringTransaction,
  executions: RecurringTransactionExecution[],
  referenceMonth?: string
): RecurringStatusSummary => {
  const handledStates = getRecurringExecutionHistory(recurring.id, executions)
    .map((execution) =>
      getReminderMonthStatus({
        recurring,
        monthText: execution.generated_for_date.slice(0, 7),
        executions,
      })
    )
    .filter(isReminderMonthHandled)
  const handledWithTransactionCount = handledStates.filter(
    (state) => state.status === 'handled_with_transaction'
  ).length

  return buildRecurringStatusSummary(
    recurring,
    referenceMonth,
    handledWithTransactionCount,
    handledStates.length - handledWithTransactionCount
  )
}

export const getInstallmentLifecycleSummary = ({
  recurring,
  executions,
  monthStatuses = [],
  transactions = [],
  referenceMonth,
}: {
  recurring: RecurringTransaction
  executions: RecurringTransactionExecution[]
  monthStatuses?: RecurringReminderMonthStatus[]
  transactions?: Transaction[]
  referenceMonth?: string
}): RecurringStatusSummary => {
  const baseSummary = buildRecurringStatusSummary(recurring, referenceMonth, 0, 0)
  const handledStates = new Map<string, ReminderMonthState>()
  const months = new Set<string>()

  executions
    .filter((execution) => execution.recurring_transaction_id === recurring.id)
    .forEach((execution) => months.add(execution.generated_for_date.slice(0, 7)))

  monthStatuses
    .filter((status) => status.reminder_id === recurring.id)
    .forEach((status) => months.add(status.month))

  transactions
    .filter(
      (transaction) =>
        transaction.is_deleted !== true && transaction.recurring_transaction_id === recurring.id
    )
    .forEach((transaction) => months.add(transaction.date.slice(0, 7)))

  ;[...months].forEach((month) => {
    const state = getReminderMonthStatus({
      recurring,
      monthText: month,
      monthStatuses,
      executions,
      transactions,
    })

    if (isReminderMonthHandled(state)) {
      handledStates.set(month, state)
    }
  })

  const handledWithTransactionCount = [...handledStates.values()].filter(
    (state) => state.status === 'handled_with_transaction'
  ).length
  const handledWithoutTransactionCount = handledStates.size - handledWithTransactionCount
  return {
    ...buildRecurringStatusSummary(
      recurring,
      referenceMonth,
      handledWithTransactionCount,
      handledWithoutTransactionCount
    ),
    totalPlannedAmount: baseSummary.totalPlannedAmount,
  }
}

export const getRecurringEffectiveStatus = (
  recurring: RecurringTransaction,
  executions: RecurringTransactionExecution[],
  referenceMonth: string
) => {
  return getInstallmentLifecycleSummary({
    recurring,
    executions,
    referenceMonth,
  }).effectiveStatus
}

export const getRecurringLifecycleEffectiveStatus = ({
  recurring,
  executions,
  monthStatuses = [],
  transactions = [],
  referenceMonth,
}: {
  recurring: RecurringTransaction
  executions: RecurringTransactionExecution[]
  monthStatuses?: RecurringReminderMonthStatus[]
  transactions?: Transaction[]
  referenceMonth: string
}) => {
  return getInstallmentLifecycleSummary({
    recurring,
    executions,
    monthStatuses,
    transactions,
    referenceMonth,
  }).effectiveStatus
}

export const getPendingRecurringTransactions = (
  recurringTransactions: RecurringTransaction[],
  executions: RecurringTransactionExecution[],
  monthText: string,
  monthStatuses: RecurringReminderMonthStatus[] = [],
  options: {
    transactions?: Transaction[]
    snoozedUntilByReminderId?: Record<string, string>
    todayText?: string
  } = {}
) => {
  const today = new Date()
  const todayText = options.todayText || today.toISOString().slice(0, 10)
  const currentMonthText = todayText.slice(0, 7)
  const todayDay = Number(todayText.slice(8, 10))

  return recurringTransactions.filter((recurring) => {
    if (!isRecurringExpectedInMonth(recurring, monthText)) {
      return false
    }

    if (monthText === currentMonthText && todayDay < getRecurringReminderDay(recurring)) {
      return false
    }

    const state = getReminderMonthStatus({
      recurring,
      monthText,
      monthStatuses,
      executions,
      transactions: options.transactions || [],
      snoozedUntil: options.snoozedUntilByReminderId?.[recurring.id] || null,
    })

    if (isReminderMonthHandled(state)) {
      return false
    }

    if (state.status === 'snoozed' && state.snoozedUntil && state.snoozedUntil > todayText) {
      return false
    }

    return true
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
  transactions = [],
  selectedMonth,
  categoryId,
  amountText,
  description,
}: {
  recurringTransactions: RecurringTransaction[]
  executions: RecurringTransactionExecution[]
  monthStatuses?: RecurringReminderMonthStatus[]
  transactions?: Transaction[]
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

  return getPendingRecurringTransactions(recurringTransactions, executions, selectedMonth, monthStatuses, {
    transactions,
  })
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

const normalizeMatchingText = (value: string | null | undefined) => {
  return (value || '').trim().toLocaleLowerCase('pl')
}

const doesReminderDescriptionMatchTransaction = (
  recurring: RecurringTransaction,
  transaction: Transaction
) => {
  const transactionDescription = normalizeMatchingText(transaction.description)
  const reminderName = normalizeMatchingText(recurring.name)
  const reminderDescription = normalizeMatchingText(recurring.description)

  if (transactionDescription.length < 3) {
    return false
  }

  return (
    reminderName.includes(transactionDescription) ||
    transactionDescription.includes(reminderName) ||
    (reminderDescription.length >= 3 &&
      (reminderDescription.includes(transactionDescription) ||
        transactionDescription.includes(reminderDescription)))
  )
}

export const findMatchingTransactionsForReminderMonth = ({
  recurring,
  transactions,
  monthText,
}: {
  recurring: RecurringTransaction
  transactions: Transaction[]
  monthText: string
}) => {
  return transactions.filter((transaction) => {
    if (transaction.is_deleted) {
      return false
    }

    if (transaction.date.slice(0, 7) !== monthText) {
      return false
    }

    if (transaction.category_id !== recurring.category_id) {
      return false
    }

    if (transaction.recurring_transaction_id === recurring.id) {
      return true
    }

    const amountMatches =
      recurring.amount !== null &&
      Math.abs(Number(transaction.amount || 0) - Number(recurring.amount || 0)) < 0.01

    return amountMatches || doesReminderDescriptionMatchTransaction(recurring, transaction)
  })
}

export const findMatchingReminderForTransaction = ({
  recurringTransactions,
  executions,
  monthStatuses = [],
  transaction,
  selectedRecurringTransactionId,
  monthText = transaction.date.slice(0, 7),
}: {
  recurringTransactions: RecurringTransaction[]
  executions: RecurringTransactionExecution[]
  monthStatuses?: RecurringReminderMonthStatus[]
  transaction: Transaction
  selectedRecurringTransactionId?: string | null
  monthText?: string
}) => {
  const candidates = selectedRecurringTransactionId
    ? recurringTransactions.filter((recurring) => recurring.id === selectedRecurringTransactionId)
    : recurringTransactions.filter(
        (recurring) =>
          recurring.category_id === transaction.category_id &&
          isRecurringExpectedInMonth(recurring, monthText)
      )

  return candidates.find((recurring) => {
    const state = getReminderMonthStatus({
      recurring,
      monthText,
      monthStatuses,
      executions,
      transactions: [],
    })

    if (isReminderMonthHandled(state) && state.transactionId !== transaction.id) {
      return false
    }

    if (selectedRecurringTransactionId || transaction.recurring_transaction_id === recurring.id) {
      return true
    }

    const amountMatches =
      recurring.amount !== null &&
      Math.abs(Number(transaction.amount || 0) - Number(recurring.amount || 0)) < 0.01

    return amountMatches || doesReminderDescriptionMatchTransaction(recurring, transaction)
  }) || null
}

export const getReminderMonthForTransactionLink = ({
  transaction,
  selectedMonth,
  hasExplicitReminderSelection,
}: {
  transaction: Transaction
  selectedMonth: string
  hasExplicitReminderSelection: boolean
}) => {
  return hasExplicitReminderSelection ? selectedMonth : transaction.date.slice(0, 7)
}

export const getNextExpectedRecurringMonth = (
  recurring: RecurringTransaction,
  fromMonth: string
) => {
  for (let offset = 1; offset <= 36; offset += 1) {
    const candidateMonth = shiftMonthText(fromMonth, offset)

    if (isRecurringExpectedInMonth(recurring, candidateMonth)) {
      return candidateMonth
    }
  }

  return null
}

export const getDaysDifference = (fromDateText: string, toDateText: string) => {
  return Math.round(
    (toUtcDate(toDateText).getTime() - toUtcDate(fromDateText).getTime()) / MS_PER_DAY
  )
}
