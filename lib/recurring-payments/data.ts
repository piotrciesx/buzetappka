import type { RecurringOccurrenceStatus, RecurringPaymentPlanType, RecurringCadenceUnit } from './types'

export type RecurringPlanRow = {
  id: string; profile_id: string; name: string; description: string | null
  category_id: string; payment_source_id: string | null; amount: number | null
  plan_type: RecurringPaymentPlanType; amount_mode: 'fixed' | 'variable' | 'reminder_only'
  cadence_unit: RecurringCadenceUnit; cadence_interval: number
  start_date: string | null; end_date: string | null
  status: 'active' | 'paused' | 'completed' | 'archived'; created_at: string; updated_at: string
}

export type RecurringOccurrenceRow = {
  id: string; profile_id: string; plan_id: string; sequence_number: number
  due_date: string; planned_amount: number | null; status: RecurringOccurrenceStatus
  completed_at: string | null; skipped_at: string | null; snoozed_until: string | null
  is_amount_locked: boolean; is_date_locked: boolean; schedule_revision: number
}

export type RecurringPlanDraft = Pick<RecurringPlanRow,
  'name'|'description'|'category_id'|'payment_source_id'|'amount'|'plan_type'|'amount_mode'|
  'cadence_unit'|'cadence_interval'|'start_date'|'end_date'|'status'> & { id?: string }

