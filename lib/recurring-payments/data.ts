import type { RecurringOccurrenceStatus, RecurringPaymentPlanType, RecurringCadenceUnit } from './types'

export type RecurringPlanRow = {
  id: string; profile_id: string; name: string; description: string | null
  category_id: string; payment_source_id: string | null; amount: number | null
  plan_type: RecurringPaymentPlanType; amount_mode: 'fixed' | 'variable' | 'reminder_only'
  cadence_unit: RecurringCadenceUnit; cadence_interval: number
  start_date: string | null; end_date: string | null
  status: 'active' | 'paused' | 'archived'; paused_at: string | null; archived_at: string | null
  resume_from_date: string | null; created_at: string; updated_at: string
}

export type RecurringOccurrenceRow = {
  id: string; profile_id: string; plan_id: string; sequence_number: number
  due_date: string; planned_amount: number | null; status: RecurringOccurrenceStatus
  completed_at: string | null; skipped_at: string | null; snoozed_until: string | null
  is_amount_locked: boolean; is_date_locked: boolean; schedule_revision: number
}

export type InstallmentPurchaseTerms = {
  plan_id?: string; purchase_amount: number; down_payment_amount: number
  financed_amount: number; pricing_mode: 'zero_percent' | 'with_cost'
  declared_installment_count: number; default_installment_amount: number
  schedule_mode: 'calculated' | 'manual'
}

export type LoanTerms = {
  plan_id?: string; principal_amount: number; paid_before_tracking_amount: number
  installments_paid_before_tracking_count: number; remaining_principal_at_start: number | null
  installment_count: number; initial_installment_amount: number
  interest_mode: 'fixed' | 'variable' | 'unknown'; interest_rate: number | null
}

export type RecurringOccurrenceTransactionLink = {
  id: string; occurrence_id: string; transaction_id: string; allocated_amount: number | null; created_at: string
}

export type RecurringPlanHistoryRow = {
  id:string; plan_id:string; occurrence_id:string|null; event_type:string
  payload:Record<string,unknown>; created_at:string
}

export type RecurringPlanDraft = Pick<RecurringPlanRow,
  'name'|'description'|'category_id'|'payment_source_id'|'amount'|'plan_type'|'amount_mode'|
  'cadence_unit'|'cadence_interval'|'start_date'|'end_date'|'status'> & {
    id?: string; installment_terms?: InstallmentPurchaseTerms; loan_terms?: LoanTerms
  }
