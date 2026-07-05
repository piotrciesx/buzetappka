'use client'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import type { RecurringOccurrenceRow, RecurringPlanDraft, RecurringPlanRow } from './data'

export function useRecurringPaymentsData(profileId:string, enabled=true) {
  const [plans,setPlans]=useState<RecurringPlanRow[]>([]); const [occurrences,setOccurrences]=useState<RecurringOccurrenceRow[]>([])
  const [loading,setLoading]=useState(false); const [error,setError]=useState<string|null>(null)
  const load=useCallback(async()=>{ if(!enabled||!profileId){setPlans([]);setOccurrences([]);return} setLoading(true);setError(null)
    const [p,o]=await Promise.all([supabase.from('recurring_transactions').select('*').eq('profile_id',profileId).order('created_at',{ascending:false}),supabase.from('recurring_payment_occurrences').select('*').eq('profile_id',profileId).order('due_date')])
    setLoading(false); if(p.error||o.error){setError((p.error||o.error)?.message||'Nie udało się pobrać danych');return}
    setPlans((p.data||[]) as RecurringPlanRow[]);setOccurrences((o.data||[]) as RecurringOccurrenceRow[])
  },[enabled,profileId])
  useEffect(()=>{void load()},[load])
  const savePlan=useCallback(async(draft:RecurringPlanDraft)=>{ const payload={...draft,profile_id:profileId,kind:draft.plan_type==='installment_purchase'?'installment':'open',frequency:draft.cadence_unit==='year'?'yearly':draft.cadence_unit==='month'&&draft.cadence_interval>1?'custom':'monthly',custom_interval_months:draft.cadence_unit==='month'?draft.cadence_interval:null,use_amount_when_creating:draft.amount!==null,updated_at:new Date().toISOString()}; const q=draft.id?supabase.from('recurring_transactions').update(payload).eq('id',draft.id).eq('profile_id',profileId):supabase.from('recurring_transactions').insert(payload); const {error}=await q;if(error)throw error;await load()},[load,profileId])
  const mutate=useCallback(async(id:string,status:'pending'|'completed_without_transaction'|'skipped',snooze?:string|null)=>{const {error}=await supabase.rpc('set_recurring_occurrence_status',{p_occurrence_id:id,p_status:status,p_snoozed_until:snooze||null});if(error)throw error;await load()},[load])
  const linkTransaction=useCallback(async(occurrenceId:string,transactionId:string)=>{const {error}=await supabase.rpc('link_transaction_to_recurring_occurrence',{p_occurrence_id:occurrenceId,p_transaction_id:transactionId});if(error)throw error;await load()},[load])
  return {plans,occurrences,loading,error,load,createPlan:savePlan,updatePlan:savePlan,completeWithoutTransaction:(id:string)=>mutate(id,'completed_without_transaction'),skip:(id:string)=>mutate(id,'skipped'),snooze:(id:string,until:string)=>mutate(id,'pending',until),linkTransaction}
}
