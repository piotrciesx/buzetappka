import type { Category, PaymentSource, Transaction } from '../budgetPageTypes'
import type {
  InstallmentPurchaseTerms,
  LoanTerms,
  RecurringOccurrenceRow,
  RecurringOccurrenceTransactionLink,
  RecurringPlanDraft,
  RecurringPlanHistoryRow,
  RecurringPlanRow,
} from './data'
import { getRecurringOccurrenceReminderState } from './occurrences'

const money = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })
const typeLabels = {
  fixed_payment: 'Stała płatność',
  installment_purchase: 'Zakup na raty',
  loan: 'Kredyt / pożyczka',
} as const
const statusLabels = { active: 'Aktywna', paused: 'Wstrzymana', archived: 'Zakończona' } as const
const cadenceLabels = { day: 'dzień', week: 'tydzień', month: 'miesiąc', year: 'rok' } as const

export type RecurringPaymentCardViewModel = {
  id: string
  title: string
  typeLabel: string
  planStatus: RecurringPlanRow['status']
  statusLabel: string
  amountLabel: string
  nextDueLabel: string
  cadenceLabel: string
  reminderDayLabel: string
  categoryLabel: string
  paymentSourceLabel: string
  currentOccurrenceStatus: string | null
  pendingCount: number
  overdueCount: number
  progress: { completed: number; total: number; remaining: number; paidAmount: number; remainingAmount: number; percent: number } | null
}

export type RecurringOccurrenceViewModel = RecurringOccurrenceRow & {
  stateLabel: string
  amountLabel: string
  actualAmount: number
  actualAmountLabel: string
  linkedTransactions: Transaction[]
  hasMultipleTransactions: boolean
  scheduleDecisionRequired: boolean
  multipleTransactionsNote: string | null
}

export type RecurringPaymentDetailsViewModel = RecurringPaymentCardViewModel & {
  description: string
  categoryLabel: string
  paymentSourceLabel: string
  occurrences: RecurringOccurrenceViewModel[]
  nextOccurrence: RecurringOccurrenceViewModel | null
  overdueOccurrences: RecurringOccurrenceViewModel[]
  statistics: { total: number; completed: number; skipped: number; pending: number; plannedTotal: number; actualTotal: number }
  history: RecurringPlanHistoryRow[]
}

export type RecurringPaymentCreatorViewModel = { title: string; submitLabel: string; draft: RecurringPlanDraft }

export const buildRecurringPaymentCardViewModel = (
  plan: RecurringPlanRow,
  occurrences: RecurringOccurrenceRow[],
  today: string,
  categories: Record<string, Category> = {},
  sources: PaymentSource[] = []
): RecurringPaymentCardViewModel => {
  const relevantPending = plan.status === 'active'
    ? occurrences.filter((item) => item.status === 'pending').sort((a, b) => a.due_date.localeCompare(b.due_date))
    : []
  const next = relevantPending[0]
  const completed = occurrences.filter((item) => item.status.startsWith('completed')).length
  const total = occurrences.length
  const paidAmount = occurrences
    .filter((item) => item.status.startsWith('completed'))
    .reduce((sum, item) => sum + Number(item.planned_amount || 0), 0)
  const remainingAmount = occurrences
    .filter((item) => item.status === 'pending')
    .reduce((sum, item) => sum + Number(item.planned_amount || 0), 0)
  const progress = plan.plan_type === 'fixed_payment' ? null : {
    completed,
    total,
    remaining: Math.max(total - completed, 0),
    paidAmount,
    remainingAmount,
    percent: total ? Math.round(completed / total * 100) : 0,
  }

  return {
    id: plan.id,
    title: plan.name,
    typeLabel: typeLabels[plan.plan_type],
    planStatus: plan.status,
    statusLabel: statusLabels[plan.status],
    amountLabel: plan.amount == null ? 'Kwota nieustalona' : money.format(plan.amount),
    nextDueLabel: next ? `Najbliżej: ${next.due_date}` : plan.status === 'paused' ? 'Przypomnienia wstrzymane' : plan.status === 'archived' ? 'Plan zakończony' : 'Brak oczekujących terminów',
    cadenceLabel: `Co ${plan.cadence_interval} ${cadenceLabels[plan.cadence_unit]}`,
    reminderDayLabel: plan.start_date ? `Termin wg ${plan.start_date}` : 'Termin nieustalony',
    categoryLabel: categories[plan.category_id]?.name || 'Nieznana kategoria',
    paymentSourceLabel: sources.find((item) => item.id === plan.payment_source_id)?.name || 'Bez źródła',
    currentOccurrenceStatus: next?.status || null,
    pendingCount: relevantPending.length,
    overdueCount: relevantPending.filter((item) => item.due_date < today).length,
    progress,
  }
}

export const buildRecurringPaymentDetailsViewModel = ({
  plan, occurrences, categories, sources, transactions, links, history, today,
}: {
  plan: RecurringPlanRow
  occurrences: RecurringOccurrenceRow[]
  categories: Record<string, Category>
  sources: PaymentSource[]
  transactions: Transaction[]
  links: RecurringOccurrenceTransactionLink[]
  history: RecurringPlanHistoryRow[]
  today: string
}): RecurringPaymentDetailsViewModel => {
  const rows = occurrences.slice().sort((a, b) => a.due_date.localeCompare(b.due_date)).map((item) => {
    const linkedIds = links.filter((link) => link.occurrence_id === item.id).map((link) => link.transaction_id)
    const linkedTransactions = transactions.filter((transaction) => linkedIds.includes(transaction.id) && !transaction.is_deleted)
    const actualAmount = linkedTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
    const hasMultipleTransactions = linkedTransactions.length > 1
    const amountDiffers = item.planned_amount !== null && Math.abs(actualAmount - item.planned_amount) >= 0.01
    const scheduleDecisionRequired = plan.plan_type !== 'fixed_payment' && linkedTransactions.length > 0 && (hasMultipleTransactions || amountDiffers)
    return {
      ...item,
      stateLabel: plan.status === 'active'
        ? getRecurringOccurrenceReminderState({ status: item.status, dueDate: item.due_date, today, snoozedUntil: item.snoozed_until })
        : item.status,
      amountLabel: item.planned_amount == null ? '—' : money.format(item.planned_amount),
      actualAmount,
      actualAmountLabel: money.format(actualAmount),
      linkedTransactions,
      hasMultipleTransactions,
      scheduleDecisionRequired,
      multipleTransactionsNote: hasMultipleTransactions
        ? plan.plan_type === 'fixed_payment'
          ? 'Wiele wpisów ma charakter informacyjny.'
          : 'Wiele wpisów wymaga decyzji dotyczącej nadpłaty lub harmonogramu.'
        : null,
    }
  })
  const completed = rows.filter((item) => item.status.startsWith('completed')).length
  const total = rows.length
  const card = buildRecurringPaymentCardViewModel(plan, occurrences, today, categories, sources)
  return {
    ...card,
    description: plan.description || '',
    occurrences: rows,
    nextOccurrence: plan.status === 'active' ? rows.find((item) => item.status === 'pending' && item.due_date >= today) || null : null,
    overdueOccurrences: plan.status === 'active' ? rows.filter((item) => item.status === 'pending' && item.due_date < today) : [],
    statistics: {
      total,
      completed,
      skipped: rows.filter((item) => item.status === 'skipped').length,
      pending: plan.status === 'active' ? rows.filter((item) => item.status === 'pending').length : 0,
      plannedTotal: rows.reduce((sum, item) => sum + (item.planned_amount || 0), 0),
      actualTotal: rows.reduce((sum, item) => sum + item.actualAmount, 0),
    },
    history: history.filter((item) => item.plan_id === plan.id),
  }
}

export const buildRecurringPaymentCreatorViewModel = (
  plan?: RecurringPlanRow,
  installment?: InstallmentPurchaseTerms,
  loan?: LoanTerms
): RecurringPaymentCreatorViewModel => ({
  title: plan ? 'Edytuj plan' : 'Dodaj plan',
  submitLabel: plan ? 'Zapisz zmiany' : 'Dodaj plan',
  draft: plan
    ? { ...plan, installment_terms: installment, loan_terms: loan }
    : { name: '', description: null, category_id: '', payment_source_id: null, amount: null, plan_type: 'fixed_payment', amount_mode: 'fixed', cadence_unit: 'month', cadence_interval: 1, start_date: new Date().toISOString().slice(0, 10), end_date: null, status: 'active' },
})
