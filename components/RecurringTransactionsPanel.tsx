'use client'

import { useMemo, useState } from 'react'
import { RecurringTransaction, Transaction } from '../lib/budgetPageTypes'
import { getRecurringLifecycleEffectiveStatus } from '../lib/recurringTransactions'
import { isTransactionInMonth } from '../lib/transactionDomain'
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
import {
  CalendarSurface,
  ReminderActionRow,
  ReminderStatusBadge,
} from './reminder-calendar/reminderCalendarPrimitives'
import RecurringPaymentsStage2Panel from './recurring-transactions/RecurringPaymentsStage2Panel'

export default function RecurringTransactionsPanel(props: RecurringTransactionsPanelProps) {
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
      if (transaction.is_deleted === true) return acc
      if (!reminderId) return acc
      acc[reminderId] = [...(acc[reminderId] || []), transaction]
      return acc
    }, {})
  }, [transactions])

  const hasLinkedTransactionInMonth = (recurringId: string) =>
    Boolean(
      linkedTransactionsByReminderId[recurringId]?.some((transaction) =>
        isTransactionInMonth(transaction, selectedMonth)
      )
    )

  const activeRecurring = useMemo(() => {
    return recurringTransactions.filter(
      (item) =>
        getRecurringLifecycleEffectiveStatus({
          recurring: item,
          executions: recurringExecutions,
          monthStatuses: recurringReminderMonthStatuses,
          transactions,
          referenceMonth: selectedMonth,
        }) === 'active'
    )
  }, [recurringExecutions, recurringReminderMonthStatuses, recurringTransactions, selectedMonth, transactions])

  const archivedRecurring = useMemo(() => {
    return recurringTransactions.filter(
      (item) =>
        getRecurringLifecycleEffectiveStatus({
          recurring: item,
          executions: recurringExecutions,
          monthStatuses: recurringReminderMonthStatuses,
          transactions,
          referenceMonth: selectedMonth,
        }) !== 'active'
    )
  }, [recurringExecutions, recurringReminderMonthStatuses, recurringTransactions, selectedMonth, transactions])

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
    const installmentTotalAmount = normalizeAmount(formState.installmentTotalAmount)
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
        initial_payment_amount: formState.kind === 'installment' ? installmentTotalAmount : null,
        description: formState.description.trim() || null,
        frequency: formState.frequency,
        custom_interval_months:
          formState.frequency === 'custom'
            ? Math.max(Number(formState.customIntervalMonths || 1), 1)
            : null,
        start_date: startDate,
        end_date: formState.endDate || computedEndDate,
        installment_total_count: formState.kind === 'installment' ? installmentCount : null,
        installment_schedule:
          formState.kind === 'installment' ? formState.installmentSchedule : [],
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
      recurringReminderMonthStatuses={recurringReminderMonthStatuses}
      linkedTransactions={linkedTransactionsByReminderId[recurring.id] || []}
      transactions={transactions}
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
    <CalendarSurface data-recurring-panel="true" style={panelStyle}>
      <style>{responsiveStyle}</style>

      <RecurringPaymentsStage2Panel
        profileId={props.profileId}
        categoriesById={categoriesById}
        categoryOptions={categoryOptions}
        paymentSources={paymentSources}
        transactions={transactions}
      />

      <ReminderActionRow style={introRowStyle}>
        <p style={mutedTextStyle}>
          Stałe przypomnienia i plany ratalne są konfiguracją. Dzwonek pokazuje tylko aktywne terminy
          wymagające obsługi.
        </p>
        <button
          type="button"
          style={{ ...styles.secondaryButton, ...lightButtonStyle }}
          onClick={() => setIsFormOpen((value) => !value)}
        >
          {isFormOpen ? 'Schowaj formularz' : 'Dodaj przypomnienie'}
        </button>
      </ReminderActionRow>

      {isSelectedMonthLocked && (
        <ReminderStatusBadge tone="warning" style={warningStyle}>
          Miesiąc jest zamknięty, więc dodawanie wpisów z przypomnień jest niedostępne. Podgląd
          aktywnych i archiwalnych przypomnień nadal działa.
        </ReminderStatusBadge>
      )}

      {isFormOpen && (
        <RecurringTransactionForm
          formState={formState}
          setFormState={setFormState}
          categoryOptions={categoryOptions}
          paymentSources={paymentSources}
          selectedMonth={selectedMonth}
          isSaving={isSaving}
          onSave={() => void saveForm()}
          onCancel={resetForm}
          styles={styles}
        />
      )}

      <section style={listStyle}>
        <div style={sectionTitleStyle}>Aktywne przypomnienia</div>
        {activeRecurring.length === 0 ? (
          <div style={styles.emptyStateCard}>Brak aktywnych przypomnień i planów.</div>
        ) : (
          activeRecurring.map((recurring) => renderReminderCard(recurring, 'active'))
        )}
      </section>

      {archivedRecurring.length > 0 && (
        <section style={listStyle}>
          <div style={sectionTitleStyle}>Archiwum</div>
          {archivedRecurring.map((recurring) => renderReminderCard(recurring, 'archived'))}
        </section>
      )}
    </CalendarSurface>
  )
}
