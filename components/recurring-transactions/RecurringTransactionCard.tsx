import { CSSProperties, MouseEvent, useMemo, useState } from 'react'
import {
  Category,
  PaymentSource,
  RecurringInstallment,
  RecurringReminderMonthStatus,
  RecurringTransaction,
  RecurringTransactionExecution,
  Transaction,
} from '../../lib/budgetPageTypes'
import {
  getInstallmentLifecycleSummary,
  getMonthCycleDate,
  getRecurringKindLabel,
  getRecurringPaymentSourceLabel,
  getRecurringStatusLabel,
} from '../../lib/recurringTransactions'
import {
  cardHeaderStyle,
  cardNameStyle,
  cardStyle,
  infoPillStyle,
  lightButtonStyle,
  metaGridStyle,
  mutedTextStyle,
  progressInnerStyle,
  progressOuterStyle,
  scheduleGridStyle,
  warningStyle,
} from './recurringTransactionsPanelStyles'
import {
  buildInstallmentSchedule,
  formatMoney,
  getScheduleSum,
} from './recurringTransactionsPanelUtils'
import {
  ReminderActionRow,
  ReminderCard,
  ReminderStatusBadge,
} from '../reminder-calendar/reminderCalendarPrimitives'

type Props = {
  recurring: RecurringTransaction
  mode: 'active' | 'archived'
  selectedMonth: string
  isSelectedMonthLocked: boolean
  recurringExecutions: RecurringTransactionExecution[]
  recurringReminderMonthStatuses: RecurringReminderMonthStatus[]
  linkedTransactions: Transaction[]
  transactions: Transaction[]
  hasLinkedTransactionInMonth: boolean
  categoriesById: Record<string, Category>
  paymentSources: PaymentSource[]
  onEdit: (recurring: RecurringTransaction) => void
  onDelete: (recurring: RecurringTransaction) => void
  onSnoozeRecurring?: (recurring: RecurringTransaction) => void
  onOpenCreateFromRecurring: (recurring: RecurringTransaction) => void
  styles: Record<string, CSSProperties>
}

const getPlanTotal = (recurring: RecurringTransaction, schedule: RecurringInstallment[]) => {
  if (recurring.kind !== 'installment') return null
  if (recurring.initial_payment_amount !== null && recurring.initial_payment_amount !== undefined) {
    return recurring.initial_payment_amount
  }
  if (schedule.length > 0) return getScheduleSum(schedule)
  if (recurring.amount !== null && recurring.installment_total_count) {
    return recurring.amount * recurring.installment_total_count
  }
  return null
}

export default function RecurringTransactionCard({
  recurring,
  mode,
  selectedMonth,
  isSelectedMonthLocked,
  recurringExecutions,
  recurringReminderMonthStatuses,
  linkedTransactions,
  transactions,
  hasLinkedTransactionInMonth,
  categoriesById,
  paymentSources,
  onEdit,
  onDelete,
  onSnoozeRecurring,
  onOpenCreateFromRecurring,
  styles,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const category = categoriesById[recurring.category_id]
  const linkedSum = linkedTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  )
  const summary = getInstallmentLifecycleSummary({
    recurring,
    executions: recurringExecutions,
    monthStatuses: recurringReminderMonthStatuses,
    transactions,
    referenceMonth: selectedMonth,
  })
  const fallbackSchedule = useMemo(() => {
    if (recurring.kind !== 'installment' || recurring.installment_schedule?.length) {
      return recurring.installment_schedule || []
    }

    const count = recurring.installment_total_count || 0
    const startDate = recurring.start_date || getMonthCycleDate(recurring, selectedMonth)
    const totalAmount = getPlanTotal(recurring, [])

    if (!count || !startDate) return []

    return buildInstallmentSchedule({
      totalAmount,
      installmentAmount: recurring.amount,
      installmentCount: count,
      startDate,
      frequency: recurring.frequency,
      customIntervalMonths: String(recurring.custom_interval_months || 1),
    })
  }, [recurring, selectedMonth])
  const planTotal = getPlanTotal(recurring, fallbackSchedule)
  const paidAmount = recurring.kind === 'installment' ? linkedSum : null
  const remainingAmount =
    planTotal === null || paidAmount === null ? null : Math.max(planTotal - paidAmount, 0)
  const progress =
    recurring.kind === 'installment' && planTotal && planTotal > 0
      ? Math.min((linkedSum / planTotal) * 100, 100)
      : recurring.kind === 'open'
        ? 0
        : 0
  const nextDueDate =
    recurring.kind === 'installment'
      ? fallbackSchedule.find((installment) => installment.due_date.slice(0, 7) >= selectedMonth)
          ?.due_date || recurring.end_date || getMonthCycleDate(recurring, selectedMonth)
      : getMonthCycleDate(recurring, selectedMonth)

  const stopActionClick = (event: MouseEvent) => event.stopPropagation()

  const getInstallmentStatus = (installment: RecurringInstallment) => {
    const hasTransaction = linkedTransactions.some(
      (transaction) => transaction.date.slice(0, 7) === installment.due_date.slice(0, 7)
    )
    if (hasTransaction) return 'opłacona'
    if (installment.due_date < `${selectedMonth}-01`) return 'przeterminowana'
    return 'oczekująca'
  }

  return (
    <ReminderCard
      style={{ ...cardStyle, cursor: 'pointer' }}
      onClick={() => setIsExpanded((value) => !value)}
    >
      <div style={cardHeaderStyle}>
        <div>
          <div style={cardNameStyle}>{recurring.name}</div>
          <div style={mutedTextStyle}>
            {category?.name || 'Kategoria usunięta'} · {getRecurringKindLabel(recurring.kind)}
          </div>
        </div>
        <ReminderActionRow style={{ ...styles.actions, gap: 6 }} onClick={stopActionClick}>
          {mode === 'active' && !isSelectedMonthLocked && (
            <button
              type="button"
              style={{ ...styles.primaryButton, ...lightButtonStyle }}
              onClick={() => onOpenCreateFromRecurring(recurring)}
            >
              Dodaj wpis
            </button>
          )}
          {mode !== 'archived' && (
            <button
              type="button"
              style={{ ...styles.secondaryButton, ...lightButtonStyle }}
              onClick={() => onEdit(recurring)}
            >
              Edytuj
            </button>
          )}
          {mode === 'active' && (
            <button
              type="button"
              style={{ ...styles.dangerButton, ...lightButtonStyle }}
              onClick={() => onDelete(recurring)}
            >
              Usuń
            </button>
          )}
        </ReminderActionRow>
      </div>

      <div style={metaGridStyle}>
        <div style={infoPillStyle}>
          <b>Termin:</b> {nextDueDate}
        </div>
        <div style={infoPillStyle}>
          <b>Status:</b> {getRecurringStatusLabel(summary.effectiveStatus)}
        </div>
        <div style={infoPillStyle}>
          <b>Postęp:</b>{' '}
          {recurring.kind === 'installment'
            ? `${summary.effectiveCompletedCount}/${summary.totalInstallments || '?'}`
            : 'aktywne'}
        </div>
      </div>

      {recurring.kind === 'installment' && (
        <div style={progressOuterStyle}>
          <div style={{ ...progressInnerStyle, width: `${progress}%` }} />
        </div>
      )}

      {hasLinkedTransactionInMonth && mode === 'active' && (
        <ReminderStatusBadge tone="warning" style={warningStyle}>
          W tym miesiącu istnieje już wpis powiązany z tą pozycją.
        </ReminderStatusBadge>
      )}

      {isExpanded && (
        <div style={{ display: 'grid', gap: 10 }} onClick={stopActionClick}>
          <div style={metaGridStyle}>
            <div style={infoPillStyle}>
              <b>Źródło:</b> {getRecurringPaymentSourceLabel(recurring, paymentSources)}
            </div>
            <div style={infoPillStyle}>
              <b>Opis:</b> {recurring.description || 'brak'}
            </div>
            {recurring.kind === 'installment' && (
              <>
                <div style={infoPillStyle}>
                  <b>Kwota całkowita:</b> {formatMoney(planTotal)}
                </div>
                <div style={infoPillStyle}>
                  <b>Spłacono:</b> {formatMoney(paidAmount)}
                </div>
                <div style={infoPillStyle}>
                  <b>Pozostało:</b> {formatMoney(remainingAmount)}
                </div>
                <div style={infoPillStyle}>
                  <b>Liczba rat:</b> {summary.totalInstallments || fallbackSchedule.length || 'brak'}
                </div>
                <div style={infoPillStyle}>
                  <b>Rat pozostało:</b> {summary.remainingCount ?? 'brak'}
                </div>
              </>
            )}
          </div>

          {recurring.kind === 'installment' && fallbackSchedule.length > 0 && (
            <div style={scheduleGridStyle}>
              {fallbackSchedule.map((installment) => (
                <div key={`${installment.installment_number}-${installment.due_date}`} style={infoPillStyle}>
                  <b>Rata {installment.installment_number}</b> · {installment.due_date} ·{' '}
                  {formatMoney(installment.amount)} · {getInstallmentStatus(installment)}
                </div>
              ))}
            </div>
          )}

          {mode === 'active' && onSnoozeRecurring && recurring.kind === 'open' && (
            <button
              type="button"
              style={{ ...styles.secondaryButton, ...lightButtonStyle, justifySelf: 'start' }}
              onClick={() => onSnoozeRecurring(recurring)}
            >
              Przypomnij za tydzień
            </button>
          )}
        </div>
      )}
    </ReminderCard>
  )
}
