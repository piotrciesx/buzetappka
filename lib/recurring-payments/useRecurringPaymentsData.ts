'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { calculateInstallmentPurchase } from './installments'
import { parseGrosze } from './money'
import type { RecurringScheduleDecision } from './actionPolicies'
import type {
  InstallmentPurchaseTerms,
  LoanTerms,
  RecurringOccurrenceRow,
  RecurringOccurrenceTransactionLink,
  RecurringPlanDraft,
  RecurringPlanHistoryRow,
  RecurringPlanRow,
} from './data'

export type RecurringPlanNameConflict = {
  kind: 'blocking' | 'archived'
  plan: RecurringPlanRow
}

export function useRecurringPaymentsData(profileId: string, enabled = true) {
  const [plans, setPlans] = useState<RecurringPlanRow[]>([])
  const [occurrences, setOccurrences] = useState<RecurringOccurrenceRow[]>([])
  const [installmentTerms, setInstallmentTerms] = useState<InstallmentPurchaseTerms[]>([])
  const [loanTerms, setLoanTerms] = useState<LoanTerms[]>([])
  const [links, setLinks] = useState<RecurringOccurrenceTransactionLink[]>([])
  const [history, setHistory] = useState<RecurringPlanHistoryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled || !profileId) return
    setLoading(true)
    setError(null)
    const [p, o, i, l, x, h] = await Promise.all([
      supabase.from('recurring_transactions').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }),
      supabase.from('recurring_payment_occurrences').select('*').eq('profile_id', profileId).order('due_date'),
      supabase.from('recurring_installment_purchase_terms').select('*').eq('profile_id', profileId),
      supabase.from('recurring_loan_terms').select('*').eq('profile_id', profileId),
      supabase.from('recurring_occurrence_transactions').select('*').eq('profile_id', profileId),
      supabase.from('recurring_payment_history').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }),
    ])
    setLoading(false)
    const failure = [p, o, i, l, x, h].find((result) => result.error)?.error
    if (failure) return setError(failure.message)
    setPlans(((p.data || []) as Array<Omit<RecurringPlanRow, 'status'> & { status: string }>).map((plan) => ({
      ...plan,
      status: plan.status === 'completed' ? 'archived' : plan.status,
    })) as RecurringPlanRow[])
    setOccurrences((o.data || []) as RecurringOccurrenceRow[])
    setInstallmentTerms((i.data || []) as InstallmentPurchaseTerms[])
    setLoanTerms((l.data || []) as LoanTerms[])
    setLinks((x.data || []) as RecurringOccurrenceTransactionLink[])
    setHistory((h.data || []) as RecurringPlanHistoryRow[])
  }, [enabled, profileId])

  useEffect(() => {
    const task = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(task)
  }, [load])

  const savePlan = useCallback(async (draft: RecurringPlanDraft) => {
    const { id, installment_terms, loan_terms, ...plan } = draft
    const planId = id || crypto.randomUUID()
    const normalizedAmount = plan.amount && plan.amount > 0 ? plan.amount : null
    const payload = {
      ...plan,
      profile_id: profileId,
      amount: normalizedAmount,
      kind: plan.plan_type === 'installment_purchase' ? 'installment' : 'open',
      frequency: plan.cadence_unit === 'year' ? 'yearly' : plan.cadence_unit === 'month' && plan.cadence_interval > 1 ? 'custom' : 'monthly',
      custom_interval_months: plan.cadence_unit === 'month' ? plan.cadence_interval : null,
      installment_total_count: installment_terms?.declared_installment_count || loan_terms?.installment_count || null,
      use_amount_when_creating: normalizedAmount !== null,
      updated_at: new Date().toISOString(),
    }
    const result = id
      ? await supabase.from('recurring_transactions').update(payload).eq('id', id).eq('profile_id', profileId)
      : await supabase.from('recurring_transactions').insert({ ...payload, id: planId })
    if (result.error) {
      console.error('[recurring-payments] Nie udało się zapisać planu.', { operation: id ? 'update' : 'insert', planId, error: result.error })
      throw new Error(result.error.message)
    }
    if (installment_terms) {
      const { error } = await supabase.from('recurring_installment_purchase_terms').upsert({ ...installment_terms, plan_id: planId, profile_id: profileId, updated_at: new Date().toISOString() })
      if (error) throw new Error(error.message)
      const calculation = calculateInstallmentPurchase({
        purchaseAmountGrosze: parseGrosze(installment_terms.purchase_amount),
        downPaymentAmountGrosze: parseGrosze(installment_terms.down_payment_amount),
        installmentCount: installment_terms.declared_installment_count,
        installmentAmountGrosze: installment_terms.default_installment_amount
          ? parseGrosze(installment_terms.default_installment_amount)
          : null,
        pricingMode: installment_terms.pricing_mode,
      })
      const { error: scheduleError } = await supabase.rpc('sync_installment_occurrence_amounts', {
        p_plan_id: planId,
        p_amounts: calculation.installmentsGrosze.map((amount) => amount / 100),
      })
      if (scheduleError) throw new Error(scheduleError.message)
    }
    if (loan_terms) {
      const { error } = await supabase.from('recurring_loan_terms').upsert({ ...loan_terms, plan_id: planId, profile_id: profileId, updated_at: new Date().toISOString() })
      if (error) throw new Error(error.message)
    }
    await load()
  }, [load, profileId])

  const findNameConflict = useCallback((name: string, excludeId?: string): RecurringPlanNameConflict | null => {
    const normalizedName = name.trim().toLocaleLowerCase('pl-PL')
    const matches = plans.filter((plan) => plan.id !== excludeId && plan.name.trim().toLocaleLowerCase('pl-PL') === normalizedName)
    const blocking = matches.find((plan) => plan.status === 'active' || plan.status === 'paused')
    if (blocking) return { kind: 'blocking', plan: blocking }
    const archived = matches.find((plan) => plan.status === 'archived')
    return archived ? { kind: 'archived', plan: archived } : null
  }, [plans])

  const setPlanStatus = useCallback(async (
    planId: string,
    status: 'active' | 'paused' | 'archived',
    restartDate?: string
  ) => {
    const { error: statusError } = await supabase.rpc('set_recurring_payment_plan_status', {
      p_plan_id: planId,
      p_status: status,
      p_restart_date: status === 'active' ? (restartDate || new Date().toISOString().slice(0, 10)) : null,
    })
    if (statusError) throw statusError
    await load()
  }, [load])

  const setStatus = useCallback(async (id: string, status: 'pending' | 'completed_without_transaction' | 'skipped', snoozedUntil?: string | null) => {
    const { error: actionError } = await supabase.rpc('set_recurring_occurrence_status', { p_occurrence_id: id, p_status: status, p_snoozed_until: snoozedUntil || null })
    if (actionError) throw actionError
    await load()
  }, [load])

  const applyDecision = useCallback(async (occurrenceId: string, decision: RecurringScheduleDecision) => {
    const { error: decisionError } = await supabase.rpc('apply_recurring_schedule_decision', {
      p_occurrence_id: occurrenceId,
      p_kind: decision.kind,
      p_decision: decision.decision,
      p_actual_amount: 'actualAmount' in decision ? decision.actualAmount : null,
    })
    if (decisionError) throw decisionError
    await load()
  }, [load])

  const linkTransaction = useCallback(async (occurrenceId: string, transactionId: string) => {
    const { error: linkError } = await supabase.rpc('link_transaction_to_recurring_occurrence', { p_occurrence_id: occurrenceId, p_transaction_id: transactionId })
    if (linkError) throw linkError
    await load()
  }, [load])

  return {
    plans, occurrences, installmentTerms, loanTerms, links, history, loading, error, load,
    createPlan: savePlan, updatePlan: savePlan,
    completeWithoutTransaction: (id: string) => setStatus(id, 'completed_without_transaction'),
    skip: (id: string) => setStatus(id, 'skipped'),
    snooze: (id: string, until: string) => setStatus(id, 'pending', until),
    linkTransaction, applyDecision, findNameConflict, setPlanStatus,
  }
}
