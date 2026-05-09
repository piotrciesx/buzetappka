'use client'

import { CSSProperties, useMemo, useState } from 'react'
import {
  Category,
  PaymentSource,
  RecurringTransaction,
  RecurringTransactionExecution,
  Transaction,
} from '../lib/budgetPageTypes'
import {
  findExecutionForMonth,
  getInstallmentSummary,
  getLastCompletedExecution,
  getMonthCycleDate,
  getPendingRecurringTransactions,
  getRecurringDisplayLabel,
  getRecurringEffectiveStatus,
  getRecurringExecutionHistory,
  getRecurringExecutionStatusLabel,
  getRecurringFrequencyLabel,
  getRecurringKindLabel,
  getRecurringPaymentSourceLabel,
  getRecurringStatusLabel,
} from '../lib/recurringTransactions'

const panelStyle = {
  marginBottom: 20,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: 16,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
} as const

const cardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 14,
  background: '#ffffff',
} as const

const pendingCardStyle = {
  ...cardStyle,
  background: '#f8fafc',
  borderColor: '#bfdbfe',
} as const

type FormState = {
  id?: string
  name: string
  amount: string
  categoryId: string
  paymentSourceId: string
  description: string
  frequency: RecurringTransaction['frequency']
  customIntervalMonths: string
  startDate: string
  endDate: string
  installmentTotalCount: string
  kind: RecurringTransaction['kind']
  status: RecurringTransaction['status']
}

type Props = {
  selectedMonth: string
  isSelectedMonthLocked: boolean
  recurringTransactions: RecurringTransaction[]
  recurringExecutions: RecurringTransactionExecution[]
  categoriesById: Record<string, Category>
  paymentSources: PaymentSource[]
  transactionsById: Record<string, Transaction>
  categoryOptions: Category[]
  onSaveRecurringTransaction: (
    input: Omit<RecurringTransaction, 'id' | 'profile_id' | 'created_at'> & {
      id?: string
      createPastExecutions?: boolean
      referenceMonth?: string
    }
  ) => Promise<void>
  onSkipRecurringInMonth: (recurring: RecurringTransaction, generatedForDate: string) => Promise<void>
  onOpenCreateFromRecurring: (recurring: RecurringTransaction) => void
  onOpenCreateFromExecution: (
    recurring: RecurringTransaction,
    execution: RecurringTransactionExecution
  ) => void
  styles: Record<string, CSSProperties>
}

const getInitialFormState = (): FormState => ({
  name: '',
  amount: '',
  categoryId: '',
  paymentSourceId: '',
  description: '',
  frequency: 'monthly',
  customIntervalMonths: '2',
  startDate: '',
  endDate: '',
  installmentTotalCount: '',
  kind: 'open',
  status: 'active',
})

const formatAmountLabel = (amount: number | null) => {
  return amount === null ? 'Brak stałej kwoty' : `${amount.toFixed(2)} zł`
}

const formatExecutionDate = (value?: string | null) => {
  if (!value) {
    return 'brak danych'
  }

  return value.slice(0, 10)
}

export default function RecurringTransactionsPanel(props: Props) {
  const {
    selectedMonth,
    isSelectedMonthLocked,
    recurringTransactions,
    recurringExecutions,
    categoriesById,
    paymentSources,
    transactionsById,
    categoryOptions,
    onSaveRecurringTransaction,
    onSkipRecurringInMonth,
    onOpenCreateFromRecurring,
    onOpenCreateFromExecution,
    styles,
  } = props

  const [formState, setFormState] = useState<FormState>(getInitialFormState)
  const [isSaving, setIsSaving] = useState(false)

  const pendingRecurring = useMemo(() => {
    return getPendingRecurringTransactions(recurringTransactions, recurringExecutions, selectedMonth)
      .filter((item) => getRecurringEffectiveStatus(item, recurringExecutions, selectedMonth) === 'active')
  }, [recurringExecutions, recurringTransactions, selectedMonth])

  const activeRecurring = useMemo(() => {
    return recurringTransactions.filter(
      (item) => getRecurringEffectiveStatus(item, recurringExecutions, selectedMonth) === 'active'
    )
  }, [recurringExecutions, recurringTransactions, selectedMonth])

  const archivedRecurring = useMemo(() => {
    return recurringTransactions.filter(
      (item) => getRecurringEffectiveStatus(item, recurringExecutions, selectedMonth) !== 'active'
    )
  }, [recurringExecutions, recurringTransactions, selectedMonth])

  const monthHistory = useMemo(() => {
    const completed = recurringTransactions
      .map((recurring) => ({
        recurring,
        execution: findExecutionForMonth(recurring.id, recurringExecutions, selectedMonth),
      }))
      .filter(
        (
          item
        ): item is {
          recurring: RecurringTransaction
          execution: RecurringTransactionExecution
        } => Boolean(item.execution)
      )

    return {
      completed,
      pending: pendingRecurring,
    }
  }, [pendingRecurring, recurringExecutions, recurringTransactions, selectedMonth])

  const resetForm = () => {
    setFormState(getInitialFormState())
  }

  const openEdit = (recurring: RecurringTransaction) => {
    setFormState({
      id: recurring.id,
      name: recurring.name,
      amount: recurring.amount === null ? '' : String(recurring.amount),
      categoryId: recurring.category_id,
      paymentSourceId: recurring.payment_source_id || '',
      description: recurring.description || '',
      frequency: recurring.frequency,
      customIntervalMonths: String(recurring.custom_interval_months || 2),
      startDate: recurring.start_date || '',
      endDate: recurring.end_date || '',
      installmentTotalCount: String(recurring.installment_total_count || ''),
      kind: recurring.kind,
      status: recurring.status,
    })
  }

  return (
    <section style={panelStyle}>
      <div style={styles.pageSubtitle}>
        Aktywne przypomnienia, raty oraz historia cykli dla całego miesiąca.
      </div>

      {isSelectedMonthLocked && (
        <div style={{ ...styles.infoBox, marginTop: 12, background: '#fef2f2', borderColor: '#fecaca' }}>
          Miesiąc jest zamknięty, więc tworzenie wpisów z przypomnień zostało ukryte. Historia i
          archiwum pozostają dostępne.
        </div>
      )}

      <div style={styles.infoRow}>
        <div style={styles.infoBox}>
          <b>Oczekujące w tym miesiącu:</b> {pendingRecurring.length}
        </div>
        <div style={styles.infoBox}>
          <b>Aktywne rekordy:</b> {activeRecurring.length}
        </div>
        <div style={styles.infoBox}>
          <b>Łącznie przypomnień:</b> {recurringTransactions.length}
        </div>
      </div>

      <div style={{ ...styles.formRow, marginTop: 14, alignItems: 'flex-start' }}>
        <input
          style={styles.input}
          placeholder="Nazwa przypomnienia"
          value={formState.name}
          onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
        />

        <input
          style={styles.smallInput}
          placeholder="Kwota opcjonalna"
          inputMode="decimal"
          value={formState.amount}
          onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
        />

        <select
          style={styles.input}
          value={formState.categoryId}
          onChange={(event) => setFormState((prev) => ({ ...prev, categoryId: event.target.value }))}
        >
          <option value="">Wybierz kategorię</option>
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          style={styles.input}
          value={formState.paymentSourceId}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, paymentSourceId: event.target.value }))
          }
        >
          <option value="">Brak źródła płatności</option>
          {paymentSources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>

        <select
          style={styles.input}
          value={formState.kind}
          onChange={(event) =>
            setFormState((prev) => ({
              ...prev,
              kind: event.target.value as RecurringTransaction['kind'],
            }))
          }
        >
          <option value="open">Otwarte</option>
          <option value="installment">Ratalne / zamknięte</option>
        </select>

        <select
          style={styles.input}
          value={formState.frequency}
          onChange={(event) =>
            setFormState((prev) => ({
              ...prev,
              frequency: event.target.value as RecurringTransaction['frequency'],
            }))
          }
        >
          <option value="monthly">Miesięczna</option>
          <option value="yearly">Roczna</option>
          <option value="custom">Custom</option>
        </select>

        {formState.frequency === 'custom' && (
          <div style={{ display: 'grid', gap: 6 }}>
            <input
              style={styles.smallInput}
              placeholder="Interwał w miesiącach"
              inputMode="numeric"
              value={formState.customIntervalMonths}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  customIntervalMonths: event.target.value.replace(/\D/g, ''),
                }))
              }
            />
            <div style={styles.smallMutedText}>Np. 2 = co 2 miesiące</div>
          </div>
        )}

        <input
          style={styles.input}
          type="date"
          value={formState.startDate}
          onChange={(event) => setFormState((prev) => ({ ...prev, startDate: event.target.value }))}
        />

        {formState.kind === 'installment' && (
          <>
            <input
              style={styles.smallInput}
              placeholder="Liczba rat"
              inputMode="numeric"
              value={formState.installmentTotalCount}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  installmentTotalCount: event.target.value.replace(/\D/g, ''),
                }))
              }
            />

            <input
              style={styles.input}
              type="date"
              value={formState.endDate}
              onChange={(event) => setFormState((prev) => ({ ...prev, endDate: event.target.value }))}
            />
          </>
        )}

        <select
          style={styles.input}
          value={formState.status}
          onChange={(event) =>
            setFormState((prev) => ({
              ...prev,
              status: event.target.value as RecurringTransaction['status'],
            }))
          }
        >
          <option value="active">Aktywne</option>
          <option value="paused">Wstrzymane</option>
          <option value="completed">Zakończone</option>
        </select>

        <input
          style={{ ...styles.input, minWidth: 260 }}
          placeholder="Opis / notatka"
          value={formState.description}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, description: event.target.value }))
          }
        />

        <div style={styles.actions}>
          <button
            type="button"
            style={styles.primaryButton}
            disabled={isSaving || !formState.name.trim() || !formState.categoryId}
            onClick={async () => {
              setIsSaving(true)

              try {
                const normalizedAmount = formState.amount.trim()
                  ? Number(formState.amount.replace(',', '.'))
                  : null

                const shouldSeedPastExecutions =
                  !formState.id &&
                  Boolean(formState.startDate) &&
                  formState.startDate.slice(0, 7) < selectedMonth &&
                  window.confirm(
                    'Czy dodać cykle w poprzednich miesiącach?\n\nJeśli wybierzesz "Tak", brakujące wcześniejsze cykle zostaną dopisane do historii bez tworzenia historycznych wpisów.'
                  )

                await onSaveRecurringTransaction({
                  id: formState.id,
                  name: formState.name,
                  category_id: formState.categoryId,
                  payment_source_id: formState.paymentSourceId || null,
                  amount:
                    normalizedAmount === null || Number.isNaN(normalizedAmount)
                      ? null
                      : normalizedAmount,
                  description: formState.description.trim() || null,
                  frequency: formState.frequency,
                  custom_interval_months:
                    formState.frequency === 'custom'
                      ? Math.max(Number(formState.customIntervalMonths || 1), 1)
                      : null,
                  start_date: formState.startDate || null,
                  end_date: formState.endDate || null,
                  installment_total_count:
                    formState.kind === 'installment'
                      ? Number(formState.installmentTotalCount || 0) || null
                      : null,
                  kind: formState.kind,
                  status: formState.status,
                  createPastExecutions: shouldSeedPastExecutions,
                  referenceMonth: selectedMonth,
                })
                resetForm()
              } finally {
                setIsSaving(false)
              }
            }}
          >
            {isSaving ? 'Zapisywanie...' : formState.id ? 'Zapisz zmiany' : 'Dodaj przypomnienie'}
          </button>

          {formState.id && (
            <button type="button" style={styles.secondaryButton} onClick={resetForm}>
              Anuluj edycję
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={styles.l2Name}>Oczekujące w tym miesiącu</div>
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {pendingRecurring.length === 0 ? (
            <div style={styles.emptyStateCard}>Brak oczekujących przypomnień w tym miesiącu.</div>
          ) : (
            pendingRecurring.map((recurring) => (
              <div key={`pending-${recurring.id}`} style={pendingCardStyle}>
                <div style={{ fontWeight: 600 }}>{recurring.name}</div>
                <div style={{ ...styles.pageSubtitle, margin: '6px 0 0' }}>
                  Termin cyklu: {getMonthCycleDate(recurring, selectedMonth)}
                </div>
                {!isSelectedMonthLocked && (
                  <div style={{ ...styles.actions, marginTop: 10 }}>
                    <button
                      type="button"
                      style={styles.primaryButton}
                      onClick={() => onOpenCreateFromRecurring(recurring)}
                    >
                      Utwórz wpis
                    </button>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() =>
                        void onSkipRecurringInMonth(recurring, getMonthCycleDate(recurring, selectedMonth))
                      }
                    >
                      Oznacz jako pominięte
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={styles.l2Name}>Historia cykli w miesiącu {selectedMonth}</div>
        <div
          style={{
            display: 'grid',
            gap: 8,
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            marginTop: 12,
          }}
        >
          <div style={styles.infoBox}>
            <b>Wykonane lub pominięte:</b> {monthHistory.completed.length}
          </div>
          <div style={styles.infoBox}>
            <b>Oczekujące:</b> {monthHistory.pending.length}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {monthHistory.completed.map(({ recurring, execution }) => {
            const linkedTransaction = execution.transaction_id
              ? transactionsById[execution.transaction_id]
              : null

            return (
              <div key={execution.id} style={cardStyle}>
                <div style={{ fontWeight: 600 }}>
                  {getRecurringExecutionStatusLabel(execution.status)} • {recurring.name}
                </div>
                <div style={{ ...styles.pageSubtitle, marginTop: 4 }}>
                  Cykl: {execution.generated_for_date.slice(0, 10)}
                </div>
                <div style={{ ...styles.pageSubtitle, marginTop: 4 }}>
                  Oznaczone: {formatExecutionDate(execution.marked_at || execution.created_at)}
                </div>
                <div style={{ ...styles.pageSubtitle, marginTop: 4 }}>
                  Powiązany wpis:{' '}
                  {linkedTransaction
                    ? `${linkedTransaction.date} • ${linkedTransaction.description || 'bez opisu'}`
                    : 'brak'}
                </div>
              </div>
            )
          })}

          {monthHistory.pending.map((recurring) => (
            <div key={`month-pending-${recurring.id}`} style={pendingCardStyle}>
              <div style={{ fontWeight: 600 }}>{recurring.name}</div>
              <div style={{ ...styles.pageSubtitle, marginTop: 4 }}>
                Oczekuje na cykl z dnia {getMonthCycleDate(recurring, selectedMonth)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={styles.l2Name}>Aktywne przypomnienia</div>
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {activeRecurring.length === 0 ? (
            <div style={styles.emptyStateCard}>Brak aktywnych przypomnień.</div>
          ) : (
            activeRecurring.map((recurring) => {
              const history = getRecurringExecutionHistory(recurring.id, recurringExecutions)
              const summary = getInstallmentSummary(recurring, recurringExecutions, selectedMonth)
              const lastCompletedExecution = getLastCompletedExecution(recurring.id, recurringExecutions)

              return (
                <div key={recurring.id} style={cardStyle}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{recurring.name}</div>
                      <div style={{ ...styles.pageSubtitle, margin: '4px 0 0' }}>
                        {getRecurringDisplayLabel(recurring, categoriesById)}
                      </div>
                    </div>

                    <div style={styles.actions}>
                      <button type="button" style={styles.secondaryButton} onClick={() => openEdit(recurring)}>
                        Edytuj
                      </button>

                      {!isSelectedMonthLocked && (
                        <button
                          type="button"
                          style={styles.primaryButton}
                          onClick={() => onOpenCreateFromRecurring(recurring)}
                        >
                          Utwórz wpis
                        </button>
                      )}

                      {!isSelectedMonthLocked && lastCompletedExecution && (
                        <button
                          type="button"
                          style={styles.secondaryButton}
                          onClick={() => onOpenCreateFromExecution(recurring, lastCompletedExecution)}
                        >
                          Powiel poprzedni cykl
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gap: 8,
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      marginTop: 12,
                    }}
                  >
                    <div style={styles.infoBox}>
                      <b>Kwota:</b> {formatAmountLabel(recurring.amount)}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Typ:</b> {getRecurringKindLabel(recurring.kind)}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Częstotliwość:</b> {getRecurringFrequencyLabel(recurring)}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Status:</b> {getRecurringStatusLabel(summary.effectiveStatus)}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Najbliższy cykl:</b> {getMonthCycleDate(recurring, selectedMonth)}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Źródło:</b> {getRecurringPaymentSourceLabel(recurring, paymentSources)}
                    </div>
                  </div>

                  {recurring.kind === 'installment' && (
                    <div
                      style={{
                        display: 'grid',
                        gap: 8,
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        marginTop: 12,
                      }}
                    >
                      <div style={styles.infoBox}>
                        <b>Raty wykonane:</b> {summary.effectiveCompletedCount}
                      </div>
                      <div style={styles.infoBox}>
                        <b>Raty pozostałe:</b> {summary.remainingCount ?? '—'}
                      </div>
                      <div style={styles.infoBox}>
                        <b>Łączna wartość planu:</b>{' '}
                        {summary.totalPlannedAmount === null
                          ? '—'
                          : `${summary.totalPlannedAmount.toFixed(2)} zł`}
                      </div>
                      <div style={styles.infoBox}>
                        <b>Cykle, które już minęły:</b> {summary.elapsedCyclesCount ?? '—'}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 14 }}>
                    <div style={styles.l2Name}>Historia</div>
                    {history.length === 0 ? (
                      <div style={{ ...styles.emptyText, marginTop: 8 }}>
                        Brak wykonanych ani pominiętych cykli.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                        {history.slice(0, 6).map((execution) => {
                          const linkedTransaction = execution.transaction_id
                            ? transactionsById[execution.transaction_id]
                            : null

                          return (
                            <div
                              key={execution.id}
                              style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: 10,
                                padding: 10,
                                background: '#f8fafc',
                              }}
                            >
                              <div style={{ fontWeight: 600 }}>
                                {getRecurringExecutionStatusLabel(execution.status)} •{' '}
                                {execution.generated_for_date.slice(0, 10)}
                              </div>
                              <div style={{ ...styles.pageSubtitle, margin: '4px 0 0' }}>
                                Oznaczone: {formatExecutionDate(execution.marked_at || execution.created_at)}
                              </div>
                              <div style={{ ...styles.pageSubtitle, margin: '4px 0 0' }}>
                                Powiązany wpis:{' '}
                                {linkedTransaction
                                  ? `${linkedTransaction.date} • ${linkedTransaction.description || 'bez opisu'}`
                                  : 'brak'}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={styles.l2Name}>Archiwum przypomnień</div>
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {archivedRecurring.length === 0 ? (
            <div style={styles.emptyStateCard}>Brak przypomnień w archiwum.</div>
          ) : (
            archivedRecurring.map((recurring) => {
              const summary = getInstallmentSummary(recurring, recurringExecutions, selectedMonth)

              return (
                <div key={`archived-${recurring.id}`} style={cardStyle}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{recurring.name}</div>
                  <div style={{ ...styles.pageSubtitle, marginTop: 4 }}>
                    {getRecurringDisplayLabel(recurring, categoriesById)}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gap: 8,
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      marginTop: 12,
                    }}
                  >
                    <div style={styles.infoBox}>
                      <b>Status:</b> {getRecurringStatusLabel(summary.effectiveStatus)}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Kwota:</b> {formatAmountLabel(recurring.amount)}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Typ:</b> {getRecurringKindLabel(recurring.kind)}
                    </div>
                    <div style={styles.infoBox}>
                      <b>Częstotliwość:</b> {getRecurringFrequencyLabel(recurring)}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
