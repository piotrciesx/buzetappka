'use client'

import { CSSProperties, useMemo, useState } from 'react'
import {
  Category,
  PaymentSource,
  RecurringReminderMonthStatus,
  RecurringTransaction,
  RecurringTransactionExecution,
  Transaction,
} from '../lib/budgetPageTypes'
import {
  getInstallmentNumberForMonth,
  getInstallmentSummary,
  getMonthCycleDate,
  getPendingRecurringTransactions,
  getRecurringDisplayLabel,
  getRecurringEffectiveStatus,
  getRecurringFrequencyLabel,
  getRecurringKindLabel,
  getRecurringPaymentSourceLabel,
  getRecurringReminderDay,
} from '../lib/recurringTransactions'

type FormState = {
  id?: string
  name: string
  amount: string
  categoryId: string
  paymentSourceId: string
  usePaymentSource: boolean
  description: string
  frequency: RecurringTransaction['frequency']
  customIntervalMonths: string
  reminderDay: string
  startDate: string
  endDate: string
  installmentTotalCount: string
  initialPaymentAmount: string
  kind: RecurringTransaction['kind']
}

type Props = {
  selectedMonth: string
  isSelectedMonthLocked: boolean
  recurringTransactions: RecurringTransaction[]
  recurringExecutions: RecurringTransactionExecution[]
  recurringReminderMonthStatuses: RecurringReminderMonthStatus[]
  transactions: Transaction[]
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
  onMarkRecurringRead: (recurring: RecurringTransaction) => Promise<void>
  onOpenCreateFromRecurring: (recurring: RecurringTransaction) => void
  onOpenCreateFromExecution?: (
    recurring: RecurringTransaction,
    execution: RecurringTransactionExecution
  ) => void
  styles: Record<string, CSSProperties>
}

const panelStyle: CSSProperties = {
  display: 'grid',
  gap: 14,
  marginBottom: 20,
  border: 0,
  borderRadius: 0,
  padding: 0,
  background: 'transparent',
}

const introRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
}

const mutedTextStyle: CSSProperties = {
  margin: 0,
  color: '#64748b',
  fontSize: 12,
  lineHeight: 1.45,
}

const lightButtonStyle: CSSProperties = {
  minHeight: 32,
  borderRadius: 999,
  padding: '0 12px',
  fontSize: 12,
  fontWeight: 640,
  boxShadow: 'none',
}

const formStyle: CSSProperties = {
  display: 'grid',
  gap: 12,
  padding: 12,
  border: '1px solid rgba(226, 232, 240, 0.92)',
  borderRadius: 14,
  background: 'rgba(255, 255, 255, 0.68)',
}

const formGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 10,
  alignItems: 'end',
}

const fieldStyle: CSSProperties = {
  minWidth: 0,
  display: 'grid',
  gap: 5,
  color: '#475569',
  fontSize: 12,
  fontWeight: 620,
}

const inlineCheckStyle: CSSProperties = {
  minHeight: 34,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: '#475569',
  fontSize: 12,
  fontWeight: 560,
}

const sectionTitleStyle: CSSProperties = {
  color: '#172033',
  fontSize: 13,
  fontWeight: 720,
}

const listStyle: CSSProperties = {
  display: 'grid',
  gap: 10,
}

const cardStyle: CSSProperties = {
  display: 'grid',
  gap: 10,
  padding: 12,
  border: '1px solid rgba(226, 232, 240, 0.92)',
  borderRadius: 14,
  background: 'rgba(255, 255, 255, 0.72)',
}

const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  flexWrap: 'wrap',
}

const cardNameStyle: CSSProperties = {
  color: '#172033',
  fontSize: 14,
  fontWeight: 720,
}

const metaGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 8,
}

const infoPillStyle: CSSProperties = {
  padding: '8px 9px',
  border: '1px solid rgba(226, 232, 240, 0.88)',
  borderRadius: 10,
  background: 'rgba(248, 250, 252, 0.72)',
  color: '#475569',
  fontSize: 12,
  lineHeight: 1.35,
}

const progressOuterStyle: CSSProperties = {
  height: 8,
  overflow: 'hidden',
  borderRadius: 999,
  background: 'rgba(226, 232, 240, 0.86)',
}

const progressInnerStyle: CSSProperties = {
  height: '100%',
  borderRadius: 999,
  background: 'linear-gradient(90deg, #2563eb, #16a34a)',
}

const warningStyle: CSSProperties = {
  padding: '8px 10px',
  border: '1px solid rgba(251, 191, 36, 0.5)',
  borderRadius: 12,
  background: 'rgba(255, 251, 235, 0.78)',
  color: '#92400e',
  fontSize: 12,
}

const responsiveStyle = `
  @media (max-width: 720px) {
    [data-recurring-form-grid="true"] {
      grid-template-columns: 1fr !important;
    }
  }
`

const getInitialFormState = (): FormState => ({
  name: '',
  amount: '',
  categoryId: '',
  paymentSourceId: '',
  usePaymentSource: false,
  description: '',
  frequency: 'monthly',
  customIntervalMonths: '2',
  reminderDay: '1',
  startDate: '',
  endDate: '',
  installmentTotalCount: '',
  initialPaymentAmount: '',
  kind: 'open',
})

const normalizeAmount = (value: string) => {
  const normalized = Number(value.replace(',', '.'))
  return value.trim() && !Number.isNaN(normalized) ? normalized : null
}

const normalizeDay = (value: string) => {
  const day = Number(value.replace(/\D/g, ''))
  return day ? String(Math.min(Math.max(day, 1), 31)) : ''
}

const getIntervalInMonths = (frequency: RecurringTransaction['frequency'], customText: string) => {
  if (frequency === 'yearly') return 12
  if (frequency === 'custom') return Math.max(Number(customText || 1), 1)
  return 1
}

const addMonthsToDate = (dateText: string, monthsToAdd: number) => {
  const [year, month, day] = dateText.split('-').map(Number)
  const date = new Date(year, month - 1 + monthsToAdd, 1)
  const nextMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  const nextDay = Math.min(day || 1, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())
  return `${nextMonth}-${String(nextDay).padStart(2, '0')}`
}

const getDateForDay = (monthText: string, dayText: string) =>
  `${monthText}-${String(Number(dayText) || 1).padStart(2, '0')}`

const formatMoney = (value: number | null | undefined) =>
  value === null || value === undefined ? 'brak' : `${value.toFixed(2)} zł`

export default function RecurringTransactionsPanel(props: Props) {
  const {
    selectedMonth,
    isSelectedMonthLocked,
    recurringTransactions,
    recurringExecutions,
    recurringReminderMonthStatuses,
    transactions,
    categoriesById,
    paymentSources,
    categoryOptions,
    onSaveRecurringTransaction,
    onMarkRecurringRead,
    onOpenCreateFromRecurring,
    styles,
  } = props

  const [formState, setFormState] = useState<FormState>(getInitialFormState)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const linkedTransactionsByReminderId = useMemo(() => {
    return transactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
      const reminderId = transaction.recurring_transaction_id
      if (!reminderId) return acc
      acc[reminderId] = [...(acc[reminderId] || []), transaction]
      return acc
    }, {})
  }, [transactions])

  const hasLinkedTransactionInMonth = (recurringId: string) =>
    Boolean(
      linkedTransactionsByReminderId[recurringId]?.some(
        (transaction) => transaction.date.slice(0, 7) === selectedMonth
      )
    )

  const pendingRecurring = useMemo(() => {
    return getPendingRecurringTransactions(
      recurringTransactions,
      recurringExecutions,
      selectedMonth,
      recurringReminderMonthStatuses
    ).filter(
      (item) =>
        getRecurringEffectiveStatus(item, recurringExecutions, selectedMonth) === 'active' &&
        !hasLinkedTransactionInMonth(item.id)
    )
  }, [
    recurringExecutions,
    recurringReminderMonthStatuses,
    recurringTransactions,
    selectedMonth,
    linkedTransactionsByReminderId,
  ])

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

  const resetForm = () => {
    setFormState(getInitialFormState())
    setIsFormOpen(false)
  }

  const openEdit = (recurring: RecurringTransaction) => {
    setFormState({
      id: recurring.id,
      name: recurring.name,
      amount: recurring.amount === null ? '' : String(recurring.amount),
      categoryId: recurring.category_id,
      paymentSourceId: recurring.payment_source_id || '',
      usePaymentSource: Boolean(recurring.payment_source_id),
      description: recurring.description || '',
      frequency: recurring.frequency,
      customIntervalMonths: String(recurring.custom_interval_months || 2),
      reminderDay: String(getRecurringReminderDay(recurring)),
      startDate: recurring.start_date || '',
      endDate: recurring.end_date || '',
      installmentTotalCount: String(recurring.installment_total_count || ''),
      initialPaymentAmount:
        recurring.initial_payment_amount === null || recurring.initial_payment_amount === undefined
          ? ''
          : String(recurring.initial_payment_amount),
      kind: recurring.kind,
    })
    setIsFormOpen(true)
  }

  const saveForm = async () => {
    const amount = normalizeAmount(formState.amount)
    const initialPaymentAmount = normalizeAmount(formState.initialPaymentAmount)
    const reminderDay = formState.reminderDay || '1'
    const startDate =
      formState.kind === 'installment'
        ? formState.startDate || getDateForDay(selectedMonth, reminderDay)
        : formState.startDate || getDateForDay(selectedMonth, reminderDay)
    const installmentCount = Number(formState.installmentTotalCount || 0) || null
    const computedEndDate =
      formState.kind === 'installment' && startDate && installmentCount
        ? addMonthsToDate(
            startDate,
            (installmentCount - 1) *
              getIntervalInMonths(formState.frequency, formState.customIntervalMonths)
          )
        : null

    setIsSaving(true)
    try {
      await onSaveRecurringTransaction({
        id: formState.id,
        name: formState.name.trim(),
        category_id: formState.categoryId,
        payment_source_id: formState.usePaymentSource ? formState.paymentSourceId || null : null,
        amount,
        use_amount_when_creating: amount !== null,
        initial_payment_amount: formState.kind === 'installment' ? initialPaymentAmount : null,
        description: formState.description.trim() || null,
        frequency: formState.frequency,
        custom_interval_months:
          formState.frequency === 'custom'
            ? Math.max(Number(formState.customIntervalMonths || 1), 1)
            : null,
        start_date: startDate,
        end_date: formState.endDate || computedEndDate,
        installment_total_count: formState.kind === 'installment' ? installmentCount : null,
        kind: formState.kind,
        status: 'active',
        createPastExecutions: false,
        referenceMonth: selectedMonth,
      })
      resetForm()
    } finally {
      setIsSaving(false)
    }
  }

  const renderReminderCard = (recurring: RecurringTransaction, mode: 'pending' | 'active' | 'archived') => {
    const linkedTransactions = linkedTransactionsByReminderId[recurring.id] || []
    const linkedSum = linkedTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
    const lastLinkedTransaction = [...linkedTransactions].sort((left, right) =>
      right.date.localeCompare(left.date)
    )[0]
    const summary = getInstallmentSummary(recurring, recurringExecutions, selectedMonth)
    const installment = getInstallmentNumberForMonth(recurring, selectedMonth)
    const progress =
      recurring.kind === 'installment' && summary.totalInstallments
        ? Math.min((summary.effectiveCompletedCount / summary.totalInstallments) * 100, 100)
        : 0
    const hasDuplicate = hasLinkedTransactionInMonth(recurring.id)

    return (
      <div key={`${mode}-${recurring.id}`} style={mode === 'pending' ? { ...cardStyle, borderColor: 'rgba(96, 165, 250, 0.55)' } : cardStyle}>
        <div style={cardHeaderStyle}>
          <div>
            <div style={cardNameStyle}>{recurring.name}</div>
            <div style={mutedTextStyle}>{getRecurringDisplayLabel(recurring, categoriesById)}</div>
          </div>
          <div style={{ ...styles.actions, gap: 6 }}>
            {mode !== 'archived' && (
              <button type="button" style={{ ...styles.secondaryButton, ...lightButtonStyle }} onClick={() => openEdit(recurring)}>
                Edytuj
              </button>
            )}
            {mode === 'pending' && !isSelectedMonthLocked && (
              <>
                <button
                  type="button"
                  style={{ ...styles.primaryButton, ...lightButtonStyle }}
                  onClick={() => onOpenCreateFromRecurring(recurring)}
                >
                  Dodaj wpis
                </button>
                <button
                  type="button"
                  style={{ ...styles.secondaryButton, ...lightButtonStyle }}
                  onClick={() => void onMarkRecurringRead(recurring)}
                >
                  Oznacz jako przeczytane
                </button>
              </>
            )}
          </div>
        </div>

        {hasDuplicate && mode === 'pending' && (
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
              Raty w harmonogramie: {installment ? `${installment.current}/${installment.total || '?'}` : 'brak danych'}.
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

  return (
    <section style={panelStyle}>
      <style>{responsiveStyle}</style>

      <div style={introRowStyle}>
        <p style={mutedTextStyle}>
          Przypomnienie nie jest wpisem. Pomaga podjąć decyzję w danym miesiącu: dodać wpis albo
          zamknąć przypomnienie jako przeczytane.
        </p>
        <button
          type="button"
          style={{ ...styles.secondaryButton, ...lightButtonStyle }}
          onClick={() => setIsFormOpen((value) => !value)}
        >
          {isFormOpen ? 'Schowaj formularz' : 'Dodaj przypomnienie'}
        </button>
      </div>

      {isSelectedMonthLocked && (
        <div style={warningStyle}>
          Miesiąc jest zamknięty, więc dodawanie wpisów z przypomnień jest niedostępne. Podgląd
          aktywnych i archiwalnych przypomnień nadal działa.
        </div>
      )}

      {isFormOpen && (
        <div style={formStyle}>
          <div style={sectionTitleStyle}>
            {formState.id ? 'Edycja przypomnienia' : 'Nowe przypomnienie'}
          </div>

          <div data-recurring-form-grid="true" style={formGridStyle}>
            <label style={fieldStyle}>
              Typ
              <select
                style={{ ...styles.input, width: '100%', minWidth: 0 }}
                value={formState.kind}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    kind: event.target.value as RecurringTransaction['kind'],
                    frequency:
                      event.target.value === 'installment' && prev.frequency === 'yearly'
                        ? 'monthly'
                        : prev.frequency,
                  }))
                }
              >
                <option value="open">Przypomnienie stałe</option>
                <option value="installment">Plan ratalny</option>
              </select>
            </label>

            <label style={fieldStyle}>
              {formState.kind === 'installment' ? 'Nazwa planu' : 'Nazwa przypomnienia'}
              <input
                style={{ ...styles.input, width: '100%', minWidth: 0 }}
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                placeholder={formState.kind === 'installment' ? 'np. laptop 12 rat' : 'np. czynsz'}
              />
            </label>

            <label style={fieldStyle}>
              Kategoria
              <select
                style={{ ...styles.input, width: '100%', minWidth: 0 }}
                value={formState.categoryId}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, categoryId: event.target.value }))
                }
              >
                <option value="">Wybierz kategorię</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={fieldStyle}>
              Opis wpisu
              <input
                style={{ ...styles.input, width: '100%', minWidth: 0 }}
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="opcjonalnie"
              />
            </label>

            <label style={fieldStyle}>
              {formState.kind === 'installment' ? 'Kwota raty' : 'Kwota'}
              <input
                style={{ ...styles.input, width: '100%', minWidth: 0 }}
                value={formState.amount}
                inputMode="decimal"
                onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
                placeholder={formState.kind === 'installment' ? 'wymagana dla rat' : 'opcjonalnie'}
              />
            </label>

            <label style={fieldStyle}>
              Dzień płatności
              <input
                style={{ ...styles.input, width: '100%', minWidth: 0 }}
                value={formState.reminderDay}
                inputMode="numeric"
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, reminderDay: normalizeDay(event.target.value) }))
                }
                onBlur={() =>
                  setFormState((prev) => ({ ...prev, reminderDay: prev.reminderDay || '1' }))
                }
              />
            </label>

            <label style={fieldStyle}>
              Częstotliwość
              <select
                style={{ ...styles.input, width: '100%', minWidth: 0 }}
                value={formState.frequency}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    frequency: event.target.value as RecurringTransaction['frequency'],
                  }))
                }
              >
                <option value="monthly">co miesiąc</option>
                <option value="custom">co X miesięcy</option>
                {formState.kind !== 'installment' && <option value="yearly">co rok</option>}
              </select>
            </label>

            {formState.frequency === 'custom' && (
              <label style={fieldStyle}>
                Co ile miesięcy
                <input
                  style={{ ...styles.input, width: '100%', minWidth: 0 }}
                  value={formState.customIntervalMonths}
                  inputMode="numeric"
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      customIntervalMonths: event.target.value.replace(/\D/g, ''),
                    }))
                  }
                />
              </label>
            )}

            {formState.kind === 'installment' && (
              <>
                <label style={fieldStyle}>
                  Liczba rat
                  <input
                    style={{ ...styles.input, width: '100%', minWidth: 0 }}
                    value={formState.installmentTotalCount}
                    inputMode="numeric"
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        installmentTotalCount: event.target.value.replace(/\D/g, ''),
                      }))
                    }
                  />
                </label>

                <label style={fieldStyle}>
                  Data pierwszej raty
                  <input
                    type="date"
                    style={{ ...styles.input, width: '100%', minWidth: 0 }}
                    value={formState.startDate}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, startDate: event.target.value }))
                    }
                  />
                </label>

                <label style={fieldStyle}>
                  Data ostatniej raty
                  <input
                    type="date"
                    style={{ ...styles.input, width: '100%', minWidth: 0 }}
                    value={formState.endDate}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, endDate: event.target.value }))
                    }
                  />
                </label>

                <label style={fieldStyle}>
                  Wpłata na start
                  <input
                    style={{ ...styles.input, width: '100%', minWidth: 0 }}
                    value={formState.initialPaymentAmount}
                    inputMode="decimal"
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        initialPaymentAmount: event.target.value,
                      }))
                    }
                    placeholder="opcjonalnie"
                  />
                </label>
              </>
            )}

            <label style={inlineCheckStyle}>
              <input
                type="checkbox"
                checked={formState.usePaymentSource}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, usePaymentSource: event.target.checked }))
                }
              />
              Dodaj źródło płatności
            </label>

            {formState.usePaymentSource && (
              <label style={fieldStyle}>
                Źródło płatności
                <select
                  style={{ ...styles.input, width: '100%', minWidth: 0 }}
                  value={formState.paymentSourceId}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, paymentSourceId: event.target.value }))
                  }
                >
                  <option value="">Brak źródła</option>
                  {paymentSources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div style={{ ...styles.actions, gap: 8 }}>
            <button
              type="button"
              style={{ ...styles.primaryButton, ...lightButtonStyle }}
              disabled={
                isSaving ||
                !formState.name.trim() ||
                !formState.categoryId ||
                (formState.kind === 'installment' && !Number(formState.installmentTotalCount || 0))
              }
              onClick={() => void saveForm()}
            >
              {isSaving ? 'Zapisywanie...' : formState.id ? 'Zapisz zmiany' : 'Zapisz przypomnienie'}
            </button>
            <button type="button" style={{ ...styles.secondaryButton, ...lightButtonStyle }} onClick={resetForm}>
              Anuluj
            </button>
          </div>
        </div>
      )}

      <section style={listStyle}>
        <div style={sectionTitleStyle}>Aktywne przypomnienia</div>
        {pendingRecurring.length === 0 ? (
          <div style={styles.emptyStateCard}>Brak przypomnień wymagających decyzji w tym miesiącu.</div>
        ) : (
          pendingRecurring.map((recurring) => renderReminderCard(recurring, 'pending'))
        )}
      </section>

      <section style={listStyle}>
        <div style={sectionTitleStyle}>Wszystkie aktywne</div>
        {activeRecurring.length === 0 ? (
          <div style={styles.emptyStateCard}>Brak aktywnych przypomnień.</div>
        ) : (
          activeRecurring.map((recurring) => renderReminderCard(recurring, 'active'))
        )}
      </section>

      <section style={listStyle}>
        <div style={sectionTitleStyle}>Archiwalne przypomnienia / zakończone plany</div>
        {archivedRecurring.length === 0 ? (
          <div style={styles.emptyStateCard}>Brak przypomnień w archiwum.</div>
        ) : (
          archivedRecurring.map((recurring) => renderReminderCard(recurring, 'archived'))
        )}
      </section>
    </section>
  )
}
