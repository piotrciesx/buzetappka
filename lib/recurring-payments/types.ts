import type { Grosze } from './money'

export type RecurringPaymentPlanType =
  | 'fixed_payment'
  | 'installment_purchase'
  | 'loan'

export type RecurringCadenceUnit = 'day' | 'week' | 'month' | 'year'

export type RecurringOccurrenceStatus =
  | 'pending'
  | 'completed_with_transaction'
  | 'completed_without_transaction'
  | 'skipped'

export type RecurringDerivedReminderState = 'overdue' | 'snoozed'

export type RecurringReminderState =
  | RecurringOccurrenceStatus
  | RecurringDerivedReminderState

export type RecurringCadence = {
  unit: RecurringCadenceUnit
  interval: number
}

export type RecurringPaymentOccurrence = {
  id?: string
  planId: string
  dueDate: string
  plannedAmountGrosze: Grosze | null
  status: RecurringOccurrenceStatus
  snoozedUntil?: string | null
}

export type RecurringPaymentPlan = {
  id: string
  type: RecurringPaymentPlanType
  name: string
  cadence: RecurringCadence
  startDate: string | null
  endDate: string | null
  defaultPlannedAmountGrosze: Grosze | null
  status: 'active' | 'paused' | 'archived'
}
