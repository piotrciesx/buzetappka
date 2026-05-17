import { CSSProperties } from 'react'
import {
  Category,
  PaymentSource,
  RecurringTransaction,
  RecurringTransactionExecution,
  Transaction,
} from '../../lib/budgetPageTypes'
import {
  getInstallmentNumberForMonth,
  getInstallmentSummary,
  getMonthCycleDate,
  getRecurringDisplayLabel,
  getRecurringFrequencyLabel,
  getRecurringKindLabel,
  getRecurringPaymentSourceLabel,
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
  warningStyle,
} from './recurringTransactionsPanelStyles'
import { formatMoney } from './recurringTransactionsPanelUtils'

type Props = {
  recurring: RecurringTransaction
  mode: 'active' | 'archived'
  selectedMonth: string
  isSelectedMonthLocked: boolean
  recurringExecutions: RecurringTransactionExecution[]
  linkedTransactions: Transaction[]
  hasLinkedTransactionInMonth: boolean
  categoriesById: Record<string, Category>
  paymentSources: PaymentSource[]
  onEdit: (recurring: RecurringTransaction) => void
  onDelete: (recurring: RecurringTransaction) => void
  onSnoozeRecurring?: (recurring: RecurringTransaction) => void
  onOpenCreateFromRecurring: (recurring: RecurringTransaction) => void
  styles: Record<string, CSSProperties>
}

export default function RecurringTransactionCard({
  recurring,
  mode,
  selectedMonth,
  isSelectedMonthLocked,
  recurringExecutions,
  linkedTransactions,
  hasLinkedTransactionInMonth,
  categoriesById,
  paymentSources,
  onEdit,
  onDelete,
  onSnoozeRecurring,
  onOpenCreateFromRecurring,
  styles,
}: Props) {
  const linkedSum = linkedTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  )
  const lastLinkedTransaction = [...linkedTransactions].sort((left, right) =>
    right.date.localeCompare(left.date)
  )[0]
  const summary = getInstallmentSummary(recurring, recurringExecutions, selectedMonth)
  const installment = getInstallmentNumberForMonth(recurring, selectedMonth)
  const progress =
    recurring.kind === 'installment' && summary.totalInstallments
      ? Math.min((summary.effectiveCompletedCount / summary.totalInstallments) * 100, 100)
      : 0

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <div>
          <div style={cardNameStyle}>{recurring.name}</div>
          <div style={mutedTextStyle}>{getRecurringDisplayLabel(recurring, categoriesById)}</div>
        </div>
        <div style={{ ...styles.actions, gap: 6 }}>
          {mode !== 'archived' && (
            <button
              type="button"
              style={{ ...styles.secondaryButton, ...lightButtonStyle }}
              onClick={() => onEdit(recurring)}
            >
              Edytuj
            </button>
          )}
          {mode === 'active' && !isSelectedMonthLocked && (
            <button
              type="button"
              style={{ ...styles.primaryButton, ...lightButtonStyle }}
              onClick={() => onOpenCreateFromRecurring(recurring)}
            >
              Dodaj wpis
            </button>
          )}
          {mode === 'active' && onSnoozeRecurring && (
            <button
              type="button"
              style={{ ...styles.secondaryButton, ...lightButtonStyle }}
              onClick={() => onSnoozeRecurring(recurring)}
            >
              Przypomnij za tydzień
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
        </div>
      </div>

      {hasLinkedTransactionInMonth && mode === 'active' && (
        <div style={warningStyle}>
          W tym miesiącu istnieje już wpis powiązany z tym przypomnieniem. Możesz dodać kolejny,
          jeśli to celowe.
        </div>
      )}

      <div style={metaGridStyle}>
        <div style={infoPillStyle}>
          <b>Typ:</b> {getRecurringKindLabel(recurring.kind)}
        </div>
        <div style={infoPillStyle}>
          <b>Termin:</b> {getMonthCycleDate(recurring, selectedMonth)}
        </div>
        <div style={infoPillStyle}>
          <b>Częstotliwość:</b> {getRecurringFrequencyLabel(recurring)}
        </div>
        <div style={infoPillStyle}>
          <b>Kwota:</b> {formatMoney(recurring.amount)}
        </div>
        <div style={infoPillStyle}>
          <b>Źródło:</b> {getRecurringPaymentSourceLabel(recurring, paymentSources)}
        </div>
        <div style={infoPillStyle}>
          <b>Powiązane wpisy:</b> {linkedTransactions.length}
        </div>
        <div style={infoPillStyle}>
          <b>Suma wpisów:</b> {linkedSum.toFixed(2)} zł
        </div>
        <div style={infoPillStyle}>
          <b>Ostatni wpis:</b>{' '}
          {lastLinkedTransaction
            ? `${lastLinkedTransaction.date} · ${lastLinkedTransaction.description || 'bez opisu'}`
            : 'brak'}
        </div>
      </div>

      {recurring.kind === 'installment' && (
        <div style={{ display: 'grid', gap: 7 }}>
          <div style={mutedTextStyle}>
            Raty w harmonogramie:{' '}
            {installment ? `${installment.current}/${installment.total || '?'}` : 'brak danych'}.
            Zostało: {summary.remainingCount ?? 'brak danych'}.
          </div>
          <div style={progressOuterStyle}>
            <div style={{ ...progressInnerStyle, width: `${progress}%` }} />
          </div>
          {mode === 'archived' && <div style={mutedTextStyle}>Plan ratalny zakończony.</div>}
        </div>
      )}
    </div>
  )
}
