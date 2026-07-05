export type AmountMismatchDecision =
  | 'this_occurrence_only'
  | 'change_from_next_occurrence'
  | 'edit_schedule_manually'

export type SkippedInstallmentPolicy =
  | 'append_at_end'
  | 'keep_schedule'
  | 'manual_schedule'

export type OverpaymentDecision =
  | 'this_occurrence_only'
  | 'shorten_schedule'
  | 'reduce_future_installments'
  | 'manual_schedule'

export type RecurringScheduleDecision =
  | { kind: 'amount_mismatch'; decision: AmountMismatchDecision; actualAmount: number }
  | { kind: 'skip'; decision: SkippedInstallmentPolicy }
  | { kind: 'overpayment'; decision: OverpaymentDecision; actualAmount: number }

export const needsAmountDecision = (planned: number | null, actual: number) =>
  planned !== null && Math.abs(planned - actual) >= 0.01

export const isManualScheduleDecision = (decision: RecurringScheduleDecision) =>
  decision.decision === 'edit_schedule_manually' ||
  decision.decision === 'manual_schedule'

