import { addGrosze, sumGrosze, zeroGrosze, type Grosze } from './money'
import type {
  RecurringOccurrenceStatus,
  RecurringPaymentOccurrence,
  RecurringReminderState,
} from './types'

export type EffectiveOccurrenceAmount = {
  amountGrosze: Grosze
  source: 'transactions' | 'planned' | 'none'
}

export const getRecurringOccurrenceReminderState = ({
  status,
  dueDate,
  today,
  snoozedUntil,
}: {
  status: RecurringOccurrenceStatus
  dueDate: string
  today: string
  snoozedUntil?: string | null
}): RecurringReminderState => {
  if (status !== 'pending') {
    return status
  }

  if (snoozedUntil && snoozedUntil >= today) {
    return 'snoozed'
  }

  return dueDate < today ? 'overdue' : 'pending'
}

export const getEffectiveOccurrenceAmount = ({
  status,
  plannedAmountGrosze,
  transactionAmountsGrosze,
}: {
  status: RecurringOccurrenceStatus
  plannedAmountGrosze: Grosze | null
  transactionAmountsGrosze?: readonly Grosze[]
}): EffectiveOccurrenceAmount => {
  if (status === 'skipped') {
    return { amountGrosze: zeroGrosze, source: 'none' }
  }

  if (transactionAmountsGrosze && transactionAmountsGrosze.length > 0) {
    return {
      amountGrosze: sumGrosze(transactionAmountsGrosze),
      source: 'transactions',
    }
  }

  if (status === 'completed_without_transaction' && plannedAmountGrosze !== null) {
    return { amountGrosze: plannedAmountGrosze, source: 'planned' }
  }

  return { amountGrosze: zeroGrosze, source: 'none' }
}

export type RecurringPlanStatistics = {
  occurrenceCount: number
  pendingCount: number
  overdueCount: number
  snoozedCount: number
  completedWithTransactionCount: number
  completedWithoutTransactionCount: number
  skippedCount: number
  paidActualGrosze: Grosze
  plannedRemainingGrosze: Grosze
}

export const calculateRecurringPlanStatistics = ({
  occurrences,
  transactionAmountsByOccurrenceId = {},
  today,
}: {
  occurrences: readonly RecurringPaymentOccurrence[]
  transactionAmountsByOccurrenceId?: Readonly<Record<string, readonly Grosze[]>>
  today: string
}): RecurringPlanStatistics => {
  let paidActualGrosze = zeroGrosze
  let plannedRemainingGrosze = zeroGrosze
  let pendingCount = 0
  let overdueCount = 0
  let snoozedCount = 0
  let completedWithTransactionCount = 0
  let completedWithoutTransactionCount = 0
  let skippedCount = 0

  occurrences.forEach((occurrence) => {
    const reminderState = getRecurringOccurrenceReminderState({
      status: occurrence.status,
      dueDate: occurrence.dueDate,
      today,
      snoozedUntil: occurrence.snoozedUntil,
    })

    if (reminderState === 'pending') pendingCount += 1
    if (reminderState === 'overdue') overdueCount += 1
    if (reminderState === 'snoozed') snoozedCount += 1
    if (occurrence.status === 'completed_with_transaction') completedWithTransactionCount += 1
    if (occurrence.status === 'completed_without_transaction') completedWithoutTransactionCount += 1
    if (occurrence.status === 'skipped') skippedCount += 1

    const transactionAmounts = occurrence.id
      ? transactionAmountsByOccurrenceId[occurrence.id]
      : undefined
    const effective = getEffectiveOccurrenceAmount({
      status: occurrence.status,
      plannedAmountGrosze: occurrence.plannedAmountGrosze,
      transactionAmountsGrosze: transactionAmounts,
    })
    paidActualGrosze = addGrosze(paidActualGrosze, effective.amountGrosze)

    if (
      occurrence.status === 'pending' &&
      occurrence.plannedAmountGrosze !== null
    ) {
      plannedRemainingGrosze = addGrosze(
        plannedRemainingGrosze,
        occurrence.plannedAmountGrosze
      )
    }
  })

  return {
    occurrenceCount: occurrences.length,
    pendingCount,
    overdueCount,
    snoozedCount,
    completedWithTransactionCount,
    completedWithoutTransactionCount,
    skippedCount,
    paidActualGrosze,
    plannedRemainingGrosze,
  }
}
