'use client'

import { useMemo, useState } from 'react'
import { RecurringTransaction, Transaction } from '../lib/budgetPageTypes'
import { getRecurringEffectiveStatus } from '../lib/recurringTransactions'
import RecurringTransactionCard from './recurring-transactions/RecurringTransactionCard'
import RecurringTransactionForm from './recurring-transactions/RecurringTransactionForm'
import {
  introRowStyle,
  lightButtonStyle,
  listStyle,
  mutedTextStyle,
  panelStyle,
  responsiveStyle,
  sectionTitleStyle,
  warningStyle,
} from './recurring-transactions/recurringTransactionsPanelStyles'
import {
  addMonthsToDate,
  getDateForDay,
  getFormStateFromRecurring,
  getInitialFormState,
  getIntervalInMonths,
  normalizeAmount,
} from './recurring-transactions/recurringTransactionsPanelUtils'
import {
  RecurringTransactionFormState,
  RecurringTransactionsPanelProps,
} from './recurring-transactions/recurringTransactionsPanelTypes'

export default function RecurringTransactionsPanel(props: RecurringTransactionsPanelProps) {
  const {
    selectedMonth,
    isSelectedMonthLocked,
    recurringTransactions,
    recurringExecutions,
    transactions,
    categoriesById,
    paymentSources,
    categoryOptions,
    onSaveRecurringTransaction,
    onDeleteRecurringTransaction,
    onSnoozeRecurring,
    onOpenCreateFromRecurring,
    styles,
  } = props

  const [formState, setFormState] = useState<RecurringTransactionFormState>(getInitialFormState)
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

  const remainingActiveRecurring: RecurringTransaction[] = []

  const resetForm = () => {
    setFormState(getInitialFormState())
    setIsFormOpen(false)
  }

  const openEdit = (recurring: RecurringTransaction) => {
    setFormState(getFormStateFromRecurring(recurring))
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

  const handleDeleteRecurring = async (recurring: RecurringTransaction) => {
    const confirmed = confirm(
      `Czy na pewno usunąć stałą płatność "${recurring.name}"? Istniejące wpisy w historii zostaną zachowane.`
    )

    if (!confirmed) {
      return
    }

    await onDeleteRecurringTransaction(recurring)
  }

  const renderReminderCard = (recurring: RecurringTransaction, mode: 'active' | 'archived') => (
    <RecurringTransactionCard
      key={`${mode}-${recurring.id}`}
      recurring={recurring}
      mode={mode}
      selectedMonth={selectedMonth}
      isSelectedMonthLocked={isSelectedMonthLocked}
      recurringExecutions={recurringExecutions}
      linkedTransactions={linkedTransactionsByReminderId[recurring.id] || []}
      hasLinkedTransactionInMonth={hasLinkedTransactionInMonth(recurring.id)}
      categoriesById={categoriesById}
      paymentSources={paymentSources}
      onEdit={openEdit}
      onDelete={(item) => void handleDeleteRecurring(item)}
      onSnoozeRecurring={onSnoozeRecurring}
      onOpenCreateFromRecurring={onOpenCreateFromRecurring}
      styles={styles}
    />
  )

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
        <RecurringTransactionForm
          formState={formState}
          setFormState={setFormState}
          categoryOptions={categoryOptions}
          paymentSources={paymentSources}
          isSaving={isSaving}
          onSave={() => void saveForm()}
          onCancel={resetForm}
          styles={styles}
        />
      )}

      <section style={listStyle}>
        <div style={sectionTitleStyle}>Aktywne przypomnienia</div>
        {activeRecurring.length === 0 ? (
          <div style={styles.emptyStateCard}>Brak przypomnień wymagających decyzji w tym miesiącu.</div>
        ) : (
          activeRecurring.map((recurring) => renderReminderCard(recurring, 'active'))
        )}
      </section>

      {false && remainingActiveRecurring.length > 0 && (
        <section style={listStyle}>
          <div style={sectionTitleStyle}>Pozostałe przypomnienia</div>
          {remainingActiveRecurring.map((recurring) => renderReminderCard(recurring, 'active'))}
        </section>
      )}

      {archivedRecurring.length > 0 && (
        <section style={listStyle}>
          <div style={sectionTitleStyle}>Archiwum</div>
          {archivedRecurring.map((recurring) => renderReminderCard(recurring, 'archived'))}
        </section>
      )}
    </section>
  )
}
