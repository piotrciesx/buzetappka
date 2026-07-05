import type { Category, PaymentSource, Transaction } from '../budgetPageTypes'
import type { InstallmentPurchaseTerms, LoanTerms, RecurringOccurrenceRow, RecurringOccurrenceTransactionLink, RecurringPlanDraft, RecurringPlanHistoryRow, RecurringPlanRow } from './data'
import { getRecurringOccurrenceReminderState } from './occurrences'

const money = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })
const typeLabels = { fixed_payment: 'Stała płatność', installment_purchase: 'Zakup na raty', loan: 'Kredyt / pożyczka' } as const

export type RecurringPaymentCardViewModel = { id:string;title:string;typeLabel:string;amountLabel:string;nextDueLabel:string;statusLabel:string;pendingCount:number;overdueCount:number }
export type RecurringOccurrenceViewModel = RecurringOccurrenceRow & { stateLabel:string;amountLabel:string;actualAmount:number;actualAmountLabel:string;linkedTransactions:Transaction[] }
export type RecurringPaymentDetailsViewModel = RecurringPaymentCardViewModel & { description:string;categoryLabel:string;paymentSourceLabel:string;occurrences:RecurringOccurrenceViewModel[];nextOccurrence:RecurringOccurrenceViewModel|null;overdueOccurrences:RecurringOccurrenceViewModel[];statistics:{total:number;completed:number;skipped:number;pending:number;plannedTotal:number;actualTotal:number};history:RecurringPlanHistoryRow[];progress:{completed:number;total:number;percent:number}|null }
export type RecurringPaymentCreatorViewModel = { title:string;submitLabel:string;draft:RecurringPlanDraft }

export const buildRecurringPaymentCardViewModel = (plan:RecurringPlanRow, occurrences:RecurringOccurrenceRow[], today:string):RecurringPaymentCardViewModel => {
  const pending=occurrences.filter(item=>item.status==='pending').sort((a,b)=>a.due_date.localeCompare(b.due_date));const next=pending[0]
  return {id:plan.id,title:plan.name,typeLabel:typeLabels[plan.plan_type],amountLabel:plan.amount==null?'Kwota nieustalona':money.format(plan.amount),nextDueLabel:next?`Najbliżej: ${next.due_date}`:'Brak oczekujących terminów',statusLabel:plan.status,pendingCount:pending.length,overdueCount:pending.filter(item=>item.due_date<today).length}
}

export const buildRecurringPaymentDetailsViewModel = ({plan,occurrences,categories,sources,transactions,links,history,today}:{plan:RecurringPlanRow;occurrences:RecurringOccurrenceRow[];categories:Record<string,Category>;sources:PaymentSource[];transactions:Transaction[];links:RecurringOccurrenceTransactionLink[];history:RecurringPlanHistoryRow[];today:string}):RecurringPaymentDetailsViewModel => {
  const rows=occurrences.slice().sort((a,b)=>a.due_date.localeCompare(b.due_date)).map(item=>{const linkedIds=links.filter(link=>link.occurrence_id===item.id).map(link=>link.transaction_id);const linkedTransactions=transactions.filter(transaction=>linkedIds.includes(transaction.id)&&!transaction.is_deleted);const actualAmount=linkedTransactions.reduce((sum,transaction)=>sum+Number(transaction.amount||0),0);return {...item,stateLabel:getRecurringOccurrenceReminderState({status:item.status,dueDate:item.due_date,today,snoozedUntil:item.snoozed_until}),amountLabel:item.planned_amount==null?'—':money.format(item.planned_amount),actualAmount,actualAmountLabel:money.format(actualAmount),linkedTransactions}})
  const completed=rows.filter(item=>item.status.startsWith('completed')).length;const total=rows.length
  return {...buildRecurringPaymentCardViewModel(plan,occurrences,today),description:plan.description||'',categoryLabel:categories[plan.category_id]?.name||'Nieznana kategoria',paymentSourceLabel:sources.find(item=>item.id===plan.payment_source_id)?.name||'Bez źródła',occurrences:rows,nextOccurrence:rows.find(item=>item.status==='pending'&&item.due_date>=today)||null,overdueOccurrences:rows.filter(item=>item.status==='pending'&&item.due_date<today),statistics:{total,completed,skipped:rows.filter(item=>item.status==='skipped').length,pending:rows.filter(item=>item.status==='pending').length,plannedTotal:rows.reduce((sum,item)=>sum+(item.planned_amount||0),0),actualTotal:rows.reduce((sum,item)=>sum+item.actualAmount,0)},history:history.filter(item=>item.plan_id===plan.id),progress:plan.plan_type==='fixed_payment'?null:{completed,total,percent:total?Math.round(completed/total*100):0}}
}

export const buildRecurringPaymentCreatorViewModel = (plan?:RecurringPlanRow, installment?:InstallmentPurchaseTerms, loan?:LoanTerms):RecurringPaymentCreatorViewModel => ({
  title:plan?'Edytuj plan':'Dodaj plan',submitLabel:plan?'Zapisz zmiany':'Dodaj plan',draft:plan?{...plan,installment_terms:installment,loan_terms:loan}:{name:'',description:null,category_id:'',payment_source_id:null,amount:null,plan_type:'fixed_payment',amount_mode:'fixed',cadence_unit:'month',cadence_interval:1,start_date:new Date().toISOString().slice(0,10),end_date:null,status:'active'}
})
