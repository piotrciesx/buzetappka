import type { RecurringTransaction } from '../budgetPageTypes'
import { parseGrosze } from './money'
import type {
  RecurringCadence,
  RecurringPaymentPlan,
  RecurringPaymentPlanType,
} from './types'

export const mapLegacyRecurringKind = (
  kind: RecurringTransaction['kind']
): RecurringPaymentPlanType => {
  return kind === 'installment' ? 'installment_purchase' : 'fixed_payment'
}

export const mapLegacyRecurringCadence = (
  recurring: Pick<RecurringTransaction, 'frequency' | 'custom_interval_months'>
): RecurringCadence => {
  if (recurring.frequency === 'yearly') {
    return { unit: 'year', interval: 1 }
  }

  return {
    unit: 'month',
    interval:
      recurring.frequency === 'custom'
        ? Math.max(recurring.custom_interval_months || 1, 1)
        : 1,
  }
}

export const adaptLegacyRecurringTransaction = (
  recurring: RecurringTransaction
): RecurringPaymentPlan => {
  return {
    id: recurring.id,
    type: mapLegacyRecurringKind(recurring.kind),
    name: recurring.name,
    cadence: mapLegacyRecurringCadence(recurring),
    startDate: recurring.start_date,
    endDate: recurring.end_date || null,
    defaultPlannedAmountGrosze:
      recurring.amount === null ? null : parseGrosze(recurring.amount),
    status: recurring.status,
  }
}

