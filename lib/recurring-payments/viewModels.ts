import type { Category, PaymentSource } from '../budgetPageTypes'
import type { RecurringOccurrenceRow, RecurringPlanDraft, RecurringPlanRow } from './data'
import { getRecurringOccurrenceReminderState } from './occurrences'

const money = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })
const typeLabel = { fixed_payment: 'Stała płatność', installment_purchase: 'Zakup na raty', loan: 'Kredyt / pożyczka' } as const

export type RecurringPaymentCardViewModel = { id:string; title:string; typeLabel:string; amountLabel:string; nextDueLabel:string; statusLabel:string; pendingCount:number }
export type RecurringPaymentDetailsViewModel = RecurringPaymentCardViewModel & { description:string; categoryLabel:string; paymentSourceLabel:string; occurrences: Array<RecurringOccurrenceRow & { stateLabel:string; amountLabel:string }> }
export type RecurringPaymentCreatorViewModel = { title:string; submitLabel:string; draft:RecurringPlanDraft }

export const buildRecurringPaymentCardViewModel = (plan: RecurringPlanRow, occurrences: RecurringOccurrenceRow[], today: string): RecurringPaymentCardViewModel => {
  const pending = occurrences.filter(item => item.status === 'pending').sort((a,b) => a.due_date.localeCompare(b.due_date))
  const next = pending[0]
  return { id:plan.id, title:plan.name, typeLabel:typeLabel[plan.plan_type], amountLabel:plan.amount == null ? 'Kwota nieustalona' : money.format(plan.amount), nextDueLabel:next ? `Najbliżej: ${next.due_date}` : 'Brak oczekujących terminów', statusLabel:plan.status, pendingCount:pending.length }
}

export const buildRecurringPaymentDetailsViewModel = (plan:RecurringPlanRow, occurrences:RecurringOccurrenceRow[], categories:Record<string,Category>, sources:PaymentSource[], today:string):RecurringPaymentDetailsViewModel => ({
  ...buildRecurringPaymentCardViewModel(plan,occurrences,today), description:plan.description || '', categoryLabel:categories[plan.category_id]?.name || 'Nieznana kategoria',
  paymentSourceLabel:sources.find(item=>item.id===plan.payment_source_id)?.name || 'Bez źródła',
  occurrences:occurrences.sort((a,b)=>a.due_date.localeCompare(b.due_date)).map(item=>{ const state=getRecurringOccurrenceReminderState({status:item.status,dueDate:item.due_date,today,snoozedUntil:item.snoozed_until}); return {...item,stateLabel:state,amountLabel:item.planned_amount==null?'—':money.format(item.planned_amount)} }),
})

export const buildRecurringPaymentCreatorViewModel = (plan?:RecurringPlanRow):RecurringPaymentCreatorViewModel => ({
  title:plan?'Edytuj plan':'Dodaj plan', submitLabel:plan?'Zapisz zmiany':'Dodaj plan', draft: plan ? {...plan} : {name:'',description:null,category_id:'',payment_source_id:null,amount:null,plan_type:'fixed_payment',amount_mode:'fixed',cadence_unit:'month',cadence_interval:1,start_date:new Date().toISOString().slice(0,10),end_date:null,status:'active'}
})
