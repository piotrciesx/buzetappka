import { CSSProperties } from 'react'
import { Category, RecurringTransaction, Transaction } from '../../lib/budgetPageTypes'
import {
  getMonthCycleDate,
  getRecurringFrequencyLabel,
  getRecurringKindLabel,
  getRecurringReminderDay,
} from '../../lib/recurringTransactions'
import {
  detailGridStyle,
  detailSectionStyle,
  detailSectionTitleStyle,
  linkedTransactionRowStyle,
  modalOverlayStyle,
  modalStyle,
  progressOuterStyle,
} from './reminderBellStyles'

type ScheduleInfo = {
  scheduledDone: number
  scheduledRemaining: number | null
  currentLabel: string | null
  nextInstallmentDate: string | null
}

type Props = {
  selectedDetailsReminder: RecurringTransaction
  selectedDetailsCategory: Category | null
  selectedMonth: string
  styles: Record<string, CSSProperties>
  setDetailsReminderId: (value: string | null) => void
  selectedDetailsSchedule: ScheduleInfo
  selectedDetailsCompletedInstallments: number
  selectedDetailsRemainingInstallments: number | null
  selectedDetailsProgress: number
  selectedDetailsPlanTotal: number | null
  selectedDetailsPlannedToDate: number | null
  selectedDetailsRemainingAmount: number | null
  selectedDetailsLinkedSum: number
  selectedDetailsLastTransaction: Transaction | undefined
  selectedDetailsLinkedTransactions: Transaction[]
  formatAmount: (value: number | string | null | undefined) => string
  getTransactionCategoryName: (transaction: Transaction) => string
}

export default function ReminderBellDetailsModal({
  selectedDetailsReminder,
  selectedDetailsCategory,
  selectedMonth,
  styles,
  setDetailsReminderId,
  selectedDetailsSchedule,
  selectedDetailsCompletedInstallments,
  selectedDetailsRemainingInstallments,
  selectedDetailsProgress,
  selectedDetailsPlanTotal,
  selectedDetailsPlannedToDate,
  selectedDetailsRemainingAmount,
  selectedDetailsLinkedSum,
  selectedDetailsLastTransaction,
  selectedDetailsLinkedTransactions,
  formatAmount,
  getTransactionCategoryName,
}: Props) {
  return (
        <div style={modalOverlayStyle} onClick={() => setDetailsReminderId(null)}>
          <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={styles.sectionTitle}>{selectedDetailsReminder.name}</div>
                <div style={styles.emptyText}>
                  {selectedDetailsCategory?.name || 'Kategoria usunięta'} ·{' '}
                  {getRecurringKindLabel(selectedDetailsReminder.kind)}
                </div>
              </div>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => setDetailsReminderId(null)}
              >
                Zamknij
              </button>
            </div>

            <section style={detailSectionStyle}>
              <div style={detailSectionTitleStyle}>Podstawowe informacje</div>
              <div style={detailGridStyle}>
                <div style={styles.infoBox}>
                  <b>Nazwa przypomnienia:</b> {selectedDetailsReminder.name}
                </div>
                <div style={styles.infoBox}>
                  <b>Kategoria:</b> {selectedDetailsCategory?.name || 'Kategoria usunięta'}
                </div>
                <div style={styles.infoBox}>
                  <b>Typ:</b> {getRecurringKindLabel(selectedDetailsReminder.kind)}
                </div>
                {selectedDetailsReminder.description && (
                  <div style={styles.infoBox}>
                    <b>Opis wpisu:</b> {selectedDetailsReminder.description}
                  </div>
                )}
              </div>
            </section>

            <section style={detailSectionStyle}>
              <div style={detailSectionTitleStyle}>Harmonogram</div>
              <div style={detailGridStyle}>
                {selectedDetailsReminder.kind === 'installment' ? (
                  <>
                    <div style={styles.infoBox}>
                      <b>Data pierwszej raty:</b> {selectedDetailsReminder.start_date || 'brak'}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Liczba rat:</b> {selectedDetailsReminder.installment_total_count || 'brak danych'}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Aktualna rata:</b> {selectedDetailsSchedule.currentLabel || 'brak danych'}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Następna rata:</b> {selectedDetailsSchedule.nextInstallmentDate || 'brak'}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Raty w harmonogramie:</b>{' '}
                      {selectedDetailsCompletedInstallments}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Raty pozostałe według harmonogramu:</b>{' '}
                      {selectedDetailsRemainingInstallments ?? 'brak danych'}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.infoBox}>
                      <b>Dzień przypomnienia / płatności:</b>{' '}
                      {getRecurringReminderDay(selectedDetailsReminder)}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Częstotliwość:</b> {getRecurringFrequencyLabel(selectedDetailsReminder)}
                    </div>
                    {selectedDetailsReminder.start_date && (
                      <div style={styles.infoBox}>
                        <b>Data początku:</b> {selectedDetailsReminder.start_date}
                      </div>
                    )}
                    {selectedDetailsReminder.end_date && (
                      <div style={styles.infoBox}>
                        <b>Data końca:</b> {selectedDetailsReminder.end_date}
                      </div>
                    )}
                    <div style={styles.infoBox}>
                      <b>Następne przypomnienie / opłata:</b>{' '}
                      {getMonthCycleDate(selectedDetailsReminder, selectedMonth)}
                    </div>
                  </>
                )}
              </div>
            </section>

            <section style={detailSectionStyle}>
              <div style={detailSectionTitleStyle}>Kwoty</div>
              <div style={detailGridStyle}>
                {selectedDetailsReminder.kind === 'installment' ? (
                  <>
                    <div style={styles.infoBox}>
                      <b>Kwota raty:</b>{' '}
                      {selectedDetailsReminder.amount !== null
                        ? formatAmount(selectedDetailsReminder.amount)
                        : 'brak danych'}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Kwota całego planu:</b>{' '}
                      {selectedDetailsPlanTotal === null
                        ? 'brak danych'
                        : formatAmount(selectedDetailsPlanTotal)}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Suma logicznie zaplanowana do dziś:</b>{' '}
                      {selectedDetailsPlannedToDate === null
                        ? 'brak danych'
                        : formatAmount(selectedDetailsPlannedToDate)}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Suma powiązanych wpisów w aplikacji:</b>{' '}
                      {selectedDetailsLinkedSum.toFixed(2)} zł
                    </div>
                    <div style={styles.infoBox}>
                      <b>Kwota pozostała według planu:</b>{' '}
                      {selectedDetailsRemainingAmount === null
                        ? 'brak danych'
                        : formatAmount(selectedDetailsRemainingAmount)}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.infoBox}>
                      <b>Kwota przypomnienia:</b>{' '}
                      {selectedDetailsReminder.amount !== null
                        ? formatAmount(selectedDetailsReminder.amount)
                        : 'brak danych'}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Suma powiązanych wpisów w aplikacji:</b>{' '}
                      {selectedDetailsLinkedSum.toFixed(2)} zł
                    </div>
                  </>
                )}
                <div style={styles.infoBox}>
                  <b>Ostatni powiązany wpis:</b>{' '}
                  {selectedDetailsLastTransaction
                    ? `${selectedDetailsLastTransaction.date} · ${
                        selectedDetailsLastTransaction.description || 'bez opisu'
                      } · ${formatAmount(selectedDetailsLastTransaction.amount)}`
                    : 'brak'}
                </div>
              </div>
            </section>

            {selectedDetailsReminder.kind === 'installment' && (
              <section style={detailSectionStyle}>
                <div style={detailSectionTitleStyle}>Postęp rat</div>
                <div style={{ ...styles.emptyText, marginTop: 8 }}>
                  Postęp spłaty według harmonogramu: {selectedDetailsProgress.toFixed(0)}%
                </div>
                <div style={{ ...progressOuterStyle, marginTop: 8 }}>
                  <div
                    style={{
                      width: `${selectedDetailsProgress}%`,
                      height: '100%',
                      background: '#2563eb',
                    }}
                  />
                </div>
              </section>
            )}

            <section style={detailSectionStyle}>
              <div style={detailSectionTitleStyle}>Powiązane wpisy</div>
              {selectedDetailsLinkedTransactions.length === 0 ? (
                <div style={{ ...styles.emptyText, marginTop: 8 }}>
                  Brak powiązanych wpisów.
                </div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  {selectedDetailsLinkedTransactions.map((transaction) => (
                    <div key={transaction.id} style={linkedTransactionRowStyle}>
                      <div>{transaction.date}</div>
                      <div>{transaction.description || 'bez opisu'}</div>
                      <div>{formatAmount(transaction.amount)}</div>
                      <div>{getTransactionCategoryName(transaction)}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
  )
}
