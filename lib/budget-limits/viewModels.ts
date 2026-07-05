import type { Category, Transaction } from '../budgetPageTypes'
import { formatGrosze } from '../recurring-payments/money'
import type { BudgetLimitUsageSummary } from './types'
import type { BudgetLimitAlertRow, BudgetLimitPeriodRow, BudgetLimitPlanDraft, BudgetLimitPlanRow, BudgetLimitVersionRow } from './data'

export type BudgetLimitLevelFilter = 'all' | 'l1' | 'l2' | 'l3' | 'global'
export type BudgetLimitStatusFilter = 'all' | 'safe' | 'warning' | 'exceeded'
export type BudgetLimitSort = 'manual' | 'usage_desc' | 'usage_asc' | 'limit_desc' | 'limit_asc' | 'spent_desc' | 'exceeded_desc' | 'level_asc' | 'level_desc' | 'name_asc'
export type BudgetLimitAlertViewModel = { id:string;kind:BudgetLimitAlertRow['kind'];label:string;status:'unread'|'read'|'muted';thresholdPercent:number|null;periodId:string;raw:BudgetLimitAlertRow }
export type BudgetLimitCardViewModel = {
  id:string;scopeId:string|null;name:string;iconKey:string|null;colorKey:string|null;scopeLabel:string
  level:'L1'|'L2'|'L3'|'global';active:boolean;limitAmount:number;spentAmount:number;remainingAmount:number
  exceededAmount:number;limitLabel:string;spentLabel:string;remainingLabel:string;usagePercent:number
  usageBarPercent:number;status:BudgetLimitUsageSummary['usageStatus'];forecastLabel:string
  forecastRisk:boolean;criticalAlert:boolean;periodLabel:string
}
export type BudgetLimitHistoryViewModel = { periodId:string;month:string;active:boolean;limitLabel:string;spentLabel:string;remainingLabel:string;usagePercent:number;status:BudgetLimitUsageSummary['usageStatus'];alerts:BudgetLimitAlertViewModel[] }
export type BudgetLimitChildBreakdown = { categoryId:string;name:string;iconKey:string|null;spentAmount:number;spentLabel:string;transactionCount:number;usageSharePercent:number }
export type BudgetLimitDetailsViewModel = { card:BudgetLimitCardViewModel;transactions:Transaction[];history:BudgetLimitHistoryViewModel[];alerts:BudgetLimitAlertViewModel[];thresholds:number[];summary:BudgetLimitUsageSummary;childBreakdown:BudgetLimitChildBreakdown[];trend:Array<{month:string;usagePercent:number;active:boolean}>;amountChangeHistory:Array<{effectiveFrom:string;effectiveTo:string|null;amount:number;amountLabel:string;active:boolean}>;inactiveMonths:string[] }
export type BudgetLimitsAttentionViewModel = { exceededCount:number;warningCount:number;projectedExceededCount:number;totalExceededAmount:number;totalExceededLabel:string;averageUsagePercent:number }
export type BudgetLimitCreatorViewModel = { title:string;submitLabel:string;draft:BudgetLimitPlanDraft }

const scopeLevel = (version:BudgetLimitVersionRow):BudgetLimitCardViewModel['level'] => version.scope_type === 'global_expenses' ? 'global' : version.scope_type === 'category_l2' ? 'L2' : version.scope_type === 'category_l3' ? 'L3' : 'L1'
const scopeLabel = (version:BudgetLimitVersionRow,categories:Record<string,Category>) => version.scope_type === 'global_expenses' ? 'Wszystkie wydatki' : `${scopeLevel(version)} · ${version.category_id ? categories[version.category_id]?.name || 'Kategoria niedostępna' : 'Zakres kategorii'}`
const categoryForVersion = (version:BudgetLimitVersionRow,categories:Record<string,Category>) => version.category_id ? categories[version.category_id] : undefined

export const buildBudgetLimitAlertViewModel = (alert:BudgetLimitAlertRow):BudgetLimitAlertViewModel => ({ id:alert.id,kind:alert.kind,label:alert.kind==='limit_exceeded'?'Przekroczono 100%':alert.kind==='projected_exceeded'?'Prognozowane przekroczenie':`Przekroczono ${alert.threshold_percent}%`,status:alert.muted_for_period?'muted':alert.read_at?'read':'unread',thresholdPercent:alert.threshold_percent,periodId:alert.period_id,raw:alert })

export const buildBudgetLimitCardViewModel = (plan:BudgetLimitPlanRow,version:BudgetLimitVersionRow,period:BudgetLimitPeriodRow,summary:BudgetLimitUsageSummary,categories:Record<string,Category>):BudgetLimitCardViewModel => {
  const category=categoryForVersion(version,categories)
  const projectedExceeded=summary.projectedSpendGrosze!==null&&summary.projectedSpendGrosze>summary.limitAmountGrosze
  return { id:plan.id,scopeId:version.category_id,name:category?.name||plan.name,iconKey:category?.icon_key||null,colorKey:null,scopeLabel:scopeLabel(version,categories),level:scopeLevel(version),active:plan.status==='active'&&period.is_active_snapshot,limitAmount:summary.limitAmountGrosze/100,spentAmount:summary.spentAmountGrosze/100,remainingAmount:summary.remainingAmountGrosze/100,exceededAmount:summary.exceededAmountGrosze/100,limitLabel:formatGrosze(summary.limitAmountGrosze),spentLabel:formatGrosze(summary.spentAmountGrosze),remainingLabel:formatGrosze(summary.remainingAmountGrosze),usagePercent:summary.usagePercent,usageBarPercent:Math.min(Math.max(summary.usagePercent,0),100),status:summary.usageStatus,forecastLabel:summary.projectedSpendGrosze===null?'Brak prognozy':`Prognoza: ${formatGrosze(summary.projectedSpendGrosze)}`,forecastRisk:projectedExceeded,criticalAlert:summary.usageStatus==='exceeded',periodLabel:period.period_start.slice(0,7) }
}

export const buildBudgetLimitCreatorViewModel = (month:string,plan?:BudgetLimitPlanRow,version?:BudgetLimitVersionRow):BudgetLimitCreatorViewModel => ({ title:plan?'Edytuj limit':'Dodaj limit',submitLabel:plan?'Zapisz wersję':'Dodaj limit',draft:plan&&version?{id:plan.id,name:plan.name,scope_type:version.scope_type==='category_group'?'category_l2':version.scope_type,category_id:version.category_id,limit_amount:version.limit_amount,effective_month:month,alert_thresholds:version.alert_thresholds,forecast_alert_enabled:version.forecast_alert_enabled,status:plan.status}:{name:'',scope_type:'category_l2',category_id:null,limit_amount:0,effective_month:month,alert_thresholds:[50,80,90],forecast_alert_enabled:true,status:'active'} })
export const buildBudgetLimitListViewModel = (items:Array<{plan:BudgetLimitPlanRow;version:BudgetLimitVersionRow;period:BudgetLimitPeriodRow;summary:BudgetLimitUsageSummary}>,categories:Record<string,Category>) => items.map(item=>buildBudgetLimitCardViewModel(item.plan,item.version,item.period,item.summary,categories))
export const buildBudgetLimitHistoryViewModel = (items:Array<{period:BudgetLimitPeriodRow;summary:BudgetLimitUsageSummary}>,alerts:BudgetLimitAlertRow[]):BudgetLimitHistoryViewModel[] => items.slice().sort((a,b)=>b.period.period_start.localeCompare(a.period.period_start)).map(item=>({ periodId:item.period.id,month:item.period.period_start.slice(0,7),active:item.period.is_active_snapshot,limitLabel:formatGrosze(item.summary.limitAmountGrosze),spentLabel:formatGrosze(item.summary.spentAmountGrosze),remainingLabel:formatGrosze(item.summary.remainingAmountGrosze),usagePercent:item.summary.usagePercent,status:item.summary.usageStatus,alerts:alerts.filter(alert=>alert.period_id===item.period.id).map(buildBudgetLimitAlertViewModel) }))

const getDirectChild = (transactionCategoryId:string,scopeCategoryId:string,categories:Record<string,Category>) => { let current=categories[transactionCategoryId];let child=current;while(current?.parent_id&&current.parent_id!==scopeCategoryId){current=categories[current.parent_id];child=current}return current?.parent_id===scopeCategoryId?child:null }
const buildChildBreakdown = (version:BudgetLimitVersionRow,transactions:Transaction[],categories:Record<string,Category>):BudgetLimitChildBreakdown[] => {
  if (!['global_expenses','category_l2','category_group'].includes(version.scope_type)) return []
  const grouped=new Map<string,{amount:number;count:number}>()
  transactions.forEach(transaction=>{let child:Category|null|undefined;if(version.scope_type==='global_expenses'){child=categories[transaction.category_id];while(child&&child.level>2&&child.parent_id)child=categories[child.parent_id]}else if(version.category_id){child=getDirectChild(transaction.category_id,version.category_id,categories)}if(!child)return;const previous=grouped.get(child.id)||{amount:0,count:0};grouped.set(child.id,{amount:previous.amount+Math.abs(Number(transaction.amount)||0),count:previous.count+1})})
  const total=[...grouped.values()].reduce((sum,item)=>sum+item.amount,0)
  return [...grouped.entries()].map(([categoryId,value])=>({categoryId,name:categories[categoryId]?.name||'Kategoria niedostępna',iconKey:categories[categoryId]?.icon_key||null,spentAmount:value.amount,spentLabel:new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(value.amount),transactionCount:value.count,usageSharePercent:total?value.amount/total*100:0})).sort((a,b)=>b.spentAmount-a.spentAmount)
}

export const buildBudgetLimitDetailsViewModel = ({plan,version,current,history,versions,alerts,categories}:{plan:BudgetLimitPlanRow;version:BudgetLimitVersionRow;current:{period:BudgetLimitPeriodRow;summary:BudgetLimitUsageSummary;includedTransactions:Transaction[]};history:Array<{period:BudgetLimitPeriodRow;summary:BudgetLimitUsageSummary}>;versions:BudgetLimitVersionRow[];alerts:BudgetLimitAlertRow[];categories:Record<string,Category>}):BudgetLimitDetailsViewModel => {
  const historyRows=buildBudgetLimitHistoryViewModel(history,alerts)
  return { card:buildBudgetLimitCardViewModel(plan,version,current.period,current.summary,categories),transactions:current.includedTransactions,history:historyRows,alerts:alerts.filter(alert=>alert.plan_id===plan.id).map(buildBudgetLimitAlertViewModel),thresholds:version.alert_thresholds,summary:current.summary,childBreakdown:buildChildBreakdown(version,current.includedTransactions,categories),trend:historyRows.slice().reverse().map(item=>({month:item.month,usagePercent:item.usagePercent,active:item.active})),amountChangeHistory:versions.filter(item=>item.plan_id===plan.id).sort((a,b)=>a.effective_from.localeCompare(b.effective_from)).map(item=>({effectiveFrom:item.effective_from,effectiveTo:item.effective_to,amount:item.limit_amount,amountLabel:new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(item.limit_amount),active:item.is_active})),inactiveMonths:historyRows.filter(item=>!item.active).map(item=>item.month) }
}

export const buildBudgetLimitsAttentionViewModel = (cards:BudgetLimitCardViewModel[]):BudgetLimitsAttentionViewModel => {
  const active=cards.filter(card=>card.active)
  const totalExceededAmount=active.reduce((sum,card)=>sum+card.exceededAmount,0)
  return { exceededCount:active.filter(card=>card.status==='exceeded').length,warningCount:active.filter(card=>card.status==='warning').length,projectedExceededCount:active.filter(card=>card.forecastRisk).length,totalExceededAmount,totalExceededLabel:new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(totalExceededAmount),averageUsagePercent:active.length?active.reduce((sum,card)=>sum+card.usagePercent,0)/active.length:0 }
}

export const filterAndSortBudgetLimitCards = (cards:BudgetLimitCardViewModel[],filters:{level:BudgetLimitLevelFilter;status:BudgetLimitStatusFilter;categoryId:string|null},sort:BudgetLimitSort) => {
  const filtered=cards.filter(card=>(filters.level==='all'||card.level.toLowerCase()===filters.level)&&(filters.status==='all'||card.status===filters.status)&&(!filters.categoryId||card.scopeId===filters.categoryId))
  const levelRank=(level:BudgetLimitCardViewModel['level'])=>({global:0,L1:1,L2:2,L3:3})[level]
  return filtered.map((card,index)=>({card,index})).sort((left,right)=>{const a=left.card,b=right.card;switch(sort){case'usage_desc':return b.usagePercent-a.usagePercent;case'usage_asc':return a.usagePercent-b.usagePercent;case'limit_desc':return b.limitAmount-a.limitAmount;case'limit_asc':return a.limitAmount-b.limitAmount;case'spent_desc':return b.spentAmount-a.spentAmount;case'exceeded_desc':return b.exceededAmount-a.exceededAmount;case'level_asc':return levelRank(a.level)-levelRank(b.level);case'level_desc':return levelRank(b.level)-levelRank(a.level);case'name_asc':return a.name.localeCompare(b.name,'pl');default:return left.index-right.index}}).map(item=>item.card)
}
