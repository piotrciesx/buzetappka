'use client'

import { useMemo, useState } from 'react'
import {
  RecurringTransaction,
  Transaction,
} from '../lib/budgetPageTypes'
import { getUniqueCategoryLabel } from '../lib/categoryUtils'
import { uiInputApi, uiTypographyTokens } from '../lib/uiFoundation'
import {
  getInstallmentNumberForMonth,
  getInstallmentLifecycleSummary,
  getPendingRecurringTransactions,
  getRecurringFrequencyLabel,
  getRecurringKindLabel,
  getRecurringReminderDay,
} from '../lib/recurringTransactions'
import { isTransactionInMonth } from '../lib/transactionDomain'

import ReminderBellDetailsModal from './reminder-bell/ReminderBellDetailsModal'
import ReminderBellPopup from './reminder-bell/ReminderBellPopup'
import DropdownShell from './dropdown/DropdownShell'
import { ReminderBellPanelProps } from './reminder-bell/reminderBellTypes'
import {
  bellRowStyle,
  cardStyle,
  containerStyle,
  countStyle,
  fieldLabelStyle,
  gridStyle,
  panelStyle,
} from './reminder-bell/reminderBellStyles'
import { getInstallmentScheduleInfo, initialForm, normalizeDay, setDateDay, toAmount } from './reminder-bell/reminderBellUtils'
import {
  CalendarSurface,
  ReminderActionRow,
  ReminderCard,
} from './reminder-calendar/reminderCalendarPrimitives'

export default function ReminderBellPanel({
  selectedMonth,
  recurringTransactions,
  recurringReminderMonthStatuses,
  transactions,
  categoriesById,
  styles,
  onAddFromReminder,
  onMarkRead,
  categoryOptions,
  onSaveReminder,
  onDeleteReminder,
}: ReminderBellPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [detailsReminderId, setDetailsReminderId] = useState<string | null>(null)
  const [hiddenReminderIds, setHiddenReminderIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasTriedSave, setHasTriedSave] = useState(false)

  const pendingReminders = useMemo(
    () =>
      getPendingRecurringTransactions(
        recurringTransactions,
        [],
        selectedMonth,
        recurringReminderMonthStatuses,
        {
          transactions,
        }
      ).filter((reminder) => !hiddenReminderIds.includes(reminder.id)),
    [hiddenReminderIds, recurringReminderMonthStatuses, recurringTransactions, selectedMonth, transactions]
  )

  const updateForm = <K extends keyof typeof initialForm>(key: K, value: (typeof initialForm)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const startEdit = (reminder: RecurringTransaction) => {
    const reminderDay = String(getRecurringReminderDay(reminder))

    setForm({
      id: reminder.id,
      name: reminder.name,
      categoryId: reminder.category_id,
      kind: reminder.kind,
      entryDescription: reminder.description || '',
      amount: reminder.amount === null ? '' : String(reminder.amount),
      frequency: reminder.frequency,
      customIntervalMonths: String(reminder.custom_interval_months || 2),
      reminderDay,
      hasStartDate: Boolean(reminder.start_date && reminder.start_date.slice(0, 7) !== selectedMonth),
      startDate: reminder.start_date || '',
      hasEndDate: Boolean(reminder.end_date),
      endDate: reminder.end_date || '',
      installmentTotalCount: reminder.installment_total_count
        ? String(reminder.installment_total_count)
        : '',
    })
  }

  const resetForm = () => {
    setForm(initialForm)
    setHasTriedSave(false)
  }

  const hasValidCategory = Boolean(form.categoryId)
  const hasValidName = Boolean(form.name.trim())
  const hasValidInstallments =
    form.kind !== 'installment' || Number(form.installmentTotalCount) > 0
  const canSave = hasValidCategory && hasValidName && hasValidInstallments && !isSaving
  const shouldHighlightCategory = hasTriedSave && !hasValidCategory

  const handleSave = async () => {
    setHasTriedSave(true)

    if (!canSave) {
      return
    }

    setIsSaving(true)

    try {
      const reminderDay = String(Number(form.reminderDay) || 1)
      const startDate = form.hasStartDate
        ? setDateDay(form.startDate || `${selectedMonth}-${reminderDay.padStart(2, '0')}`, reminderDay)
        : `${selectedMonth}-${reminderDay.padStart(2, '0')}`

      await onSaveReminder({
        id: form.id || undefined,
        name: form.name.trim(),
        category_id: form.categoryId,
        payment_source_id: null,
        amount: toAmount(form.amount),
        use_amount_when_creating: Boolean(toAmount(form.amount)),
        initial_payment_amount: null,
        description: form.entryDescription.trim() || null,
        frequency: form.frequency,
        custom_interval_months:
          form.frequency === 'custom' ? Math.max(Number(form.customIntervalMonths || 1), 1) : null,
        start_date: startDate,
        end_date: form.hasEndDate ? form.endDate || null : null,
        installment_total_count:
          form.kind === 'installment' ? Number(form.installmentTotalCount) || null : null,
        kind: form.kind,
        status: 'active',
      })

      resetForm()
    } finally {
      setIsSaving(false)
    }
  }

  const getLinkedTransactions = (reminderId: string) => {
    return transactions
      .filter(
        (transaction) =>
          transaction.is_deleted !== true && transaction.recurring_transaction_id === reminderId
      )
      .sort((left, right) => right.date.localeCompare(left.date))
  }

  const hasLinkedTransactionInSelectedMonth = (reminderId: string) => {
    return transactions.some(
      (transaction) =>
        transaction.recurring_transaction_id === reminderId &&
        transaction.is_deleted !== true &&
        isTransactionInMonth(transaction, selectedMonth)
    )
  }

  const hideLocally = (reminderId: string) => {
    setHiddenReminderIds((prev) => (prev.includes(reminderId) ? prev : [...prev, reminderId]))
  }

  const selectedDetailsReminder =
    recurringTransactions.find((reminder) => reminder.id === detailsReminderId) || null
  const selectedDetailsLinkedTransactions = selectedDetailsReminder
    ? getLinkedTransactions(selectedDetailsReminder.id)
    : []
  const selectedDetailsCategory = selectedDetailsReminder
    ? categoriesById[selectedDetailsReminder.category_id]
    : null
  const selectedDetailsLinkedSum = selectedDetailsLinkedTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  )
  const selectedDetailsLastTransaction = selectedDetailsLinkedTransactions[0]
  const selectedDetailsSummary = selectedDetailsReminder
    ? getInstallmentLifecycleSummary({
        recurring: selectedDetailsReminder,
        executions: [],
        monthStatuses: recurringReminderMonthStatuses,
        transactions,
        referenceMonth: selectedMonth,
      })
    : null
  const selectedDetailsSchedule = getInstallmentScheduleInfo(selectedDetailsReminder, selectedMonth)
  const selectedDetailsCompletedInstallments = selectedDetailsSchedule.scheduledDone
  const selectedDetailsRemainingInstallments = selectedDetailsSchedule.scheduledRemaining
  const selectedDetailsProgress =
    selectedDetailsReminder?.kind === 'installment' && selectedDetailsSummary?.totalInstallments
      ? Math.min(
          (selectedDetailsCompletedInstallments / selectedDetailsSummary.totalInstallments) * 100,
          100
        )
      : 0
  const selectedDetailsPlanTotal =
    selectedDetailsReminder?.kind === 'installment' &&
    selectedDetailsReminder.initial_payment_amount !== null &&
    selectedDetailsReminder.initial_payment_amount !== undefined
      ? selectedDetailsReminder.initial_payment_amount
      : selectedDetailsReminder?.kind === 'installment' &&
          selectedDetailsReminder.amount !== null &&
          selectedDetailsReminder.installment_total_count
        ? selectedDetailsReminder.amount * selectedDetailsReminder.installment_total_count
        : null
  const selectedDetailsPlannedToDate =
    selectedDetailsReminder?.kind === 'installment'
      ? selectedDetailsLinkedSum
      : null
  const selectedDetailsRemainingAmount =
    selectedDetailsReminder?.kind === 'installment' && selectedDetailsPlanTotal !== null
      ? Math.max(selectedDetailsPlanTotal - selectedDetailsLinkedSum, 0)
      : null

  const formatAmount = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') {
      return ''
    }

    return `${Number(value).toFixed(2)} zł`
  }

  const getTransactionCategoryName = (transaction: Transaction) => {
    return getUniqueCategoryLabel(transaction.category_id, categoriesById) || 'Kategoria usunięta'
  }

  return (
    <div style={containerStyle}>
      <div style={bellRowStyle}>
        <DropdownShell
          open={isOpen}
          onOpenChange={setIsOpen}
          size="utility"
          trigger={(triggerProps) => (
            <button type="button" style={styles.secondaryButton} {...triggerProps}>
              Dzwonek
              {pendingReminders.length > 0 && <span style={countStyle}>{pendingReminders.length}</span>}
            </button>
          )}
        >
          <ReminderBellPopup
            selectedMonth={selectedMonth}
            pendingReminders={pendingReminders}
            categoriesById={categoriesById}
            styles={styles}
            onAddFromReminder={onAddFromReminder}
            onMarkRead={onMarkRead}
            hasLinkedTransactionInSelectedMonth={hasLinkedTransactionInSelectedMonth}
            hideLocally={hideLocally}
            setIsOpen={setIsOpen}
          />
        </DropdownShell>
      </div>

      <CalendarSurface data-reminder-panel="true" style={panelStyle}>
        <div style={styles.l2Name}>Przypomnienia</div>
        <div style={{ ...styles.emptyText, marginTop: 4 }}>
          Przypomnienie jest sugestią. Wpis powstaje dopiero po wybraniu akcji „Dodaj wpis”.
        </div>

        <div style={{ ...gridStyle, marginTop: 12 }}>
          <label style={fieldLabelStyle}>
            Nazwa przypomnienia
            <input
              className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              placeholder="np. czynsz"
            />
          </label>

          <label style={fieldLabelStyle}>
            Opis wpisu
            <input
              className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
              value={form.entryDescription}
              onChange={(event) => updateForm('entryDescription', event.target.value)}
              placeholder="tekst wpisu po dodaniu"
            />
          </label>

          <label style={fieldLabelStyle}>
            Kategoria
            <select
              className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputM}`}
              data-input-state={shouldHighlightCategory ? uiInputApi.state.error : uiInputApi.state.default}
              data-input-width={uiInputApi.width.full}
              value={form.categoryId}
              onChange={(event) => {
                updateForm('categoryId', event.target.value)
                if (event.target.value) {
                  setHasTriedSave(false)
                }
              }}
            >
              <option value="">Wybierz kategorię</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {shouldHighlightCategory && (
              <span
                style={{
                  color: 'var(--ui-color-expense)',
                  fontSize: uiTypographyTokens.role.metadata,
                  fontWeight: uiTypographyTokens.weight.semibold,
                }}
              >
                Wybierz kategorię końcową.
              </span>
            )}
          </label>

          <label style={fieldLabelStyle}>
            Typ
            <select
              className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
              value={form.kind}
              onChange={(event) => updateForm('kind', event.target.value as RecurringTransaction['kind'])}
            >
              <option value="open">Przypomnienie stałe</option>
              <option value="installment">Plan ratalny</option>
            </select>
          </label>

          <label style={fieldLabelStyle}>
            Częstotliwość
            <select
              className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
              value={form.frequency}
              onChange={(event) =>
                updateForm('frequency', event.target.value as RecurringTransaction['frequency'])
              }
            >
              <option value="monthly">co miesiąc</option>
              <option value="custom">co X miesięcy</option>
              <option value="yearly">co rok</option>
            </select>
          </label>

          {form.frequency === 'custom' && (
            <label style={fieldLabelStyle}>
              Co ile miesięcy
              <input
                className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
                data-input-width={uiInputApi.width.full}
                value={form.customIntervalMonths}
                inputMode="numeric"
                onChange={(event) =>
                  updateForm('customIntervalMonths', event.target.value.replace(/\D/g, ''))
                }
              />
            </label>
          )}

          <label style={fieldLabelStyle}>
            Dzień przypomnienia
            <input
              className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
              value={form.reminderDay}
              inputMode="numeric"
              onChange={(event) => updateForm('reminderDay', normalizeDay(event.target.value))}
              onBlur={() => updateForm('reminderDay', form.reminderDay || '1')}
            />
          </label>

          <label style={fieldLabelStyle}>
            Kwota
            <input
              className={uiInputApi.classNames.amountField}
              data-input-width={uiInputApi.width.full}
              value={form.amount}
              inputMode="decimal"
              onChange={(event) => updateForm('amount', event.target.value)}
              placeholder="opcjonalnie"
            />
          </label>

          {form.kind === 'installment' && (
            <label style={fieldLabelStyle}>
              Liczba rat
              <input
                className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
                data-input-width={uiInputApi.width.full}
                value={form.installmentTotalCount}
                inputMode="numeric"
                onChange={(event) =>
                  updateForm('installmentTotalCount', event.target.value.replace(/\D/g, ''))
                }
              />
            </label>
          )}

          <label style={{ ...styles.emptyText, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.hasStartDate}
              onChange={(event) => updateForm('hasStartDate', event.target.checked)}
            />
            Dodaj datę początku
          </label>

          {form.hasStartDate && (
            <label style={fieldLabelStyle}>
              Data początku
              <input
                type="date"
                className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
                data-input-width={uiInputApi.width.full}
                value={form.startDate}
                onChange={(event) => updateForm('startDate', event.target.value)}
              />
            </label>
          )}

          <label style={{ ...styles.emptyText, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.hasEndDate}
              onChange={(event) => updateForm('hasEndDate', event.target.checked)}
            />
            Dodaj datę końca
          </label>

          {form.hasEndDate && (
            <label style={fieldLabelStyle}>
              Data końca
              <input
                type="date"
                className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
                data-input-width={uiInputApi.width.full}
                value={form.endDate}
                onChange={(event) => updateForm('endDate', event.target.value)}
              />
            </label>
          )}
        </div>

        <ReminderActionRow style={{ ...styles.actions, marginTop: 12 }}>
          <button
            type="button"
            data-ui-button-confirm="true"
            disabled={isSaving}
            onClick={() => void handleSave()}
          >
            {isSaving ? 'Zapisywanie...' : form.id ? 'Zapisz zmiany' : 'Zapisz przypomnienie'}
          </button>
          {form.id && (
            <button type="button" data-ui-button-cancel="true" onClick={resetForm}>
              Anuluj
            </button>
          )}
        </ReminderActionRow>

        <div style={{ ...gridStyle, marginTop: 14 }}>
          {recurringTransactions.length === 0 ? (
            <div style={styles.emptyText}>Brak zapisanych przypomnień.</div>
          ) : (
            recurringTransactions.map((reminder) => {
              const installment = getInstallmentNumberForMonth(reminder, selectedMonth)
              const category = categoriesById[reminder.category_id]

              return (
                <ReminderCard key={reminder.id} style={cardStyle}>
                  <div style={{ fontWeight: uiTypographyTokens.weight.semibold }}>
                    {reminder.name}
                  </div>
                  <div style={styles.emptyText}>
                    Kategoria: {category?.name || 'Kategoria usunięta'}
                  </div>
                  <div style={styles.emptyText}>
                    Typ: {getRecurringKindLabel(reminder.kind)}
                  </div>
                  {reminder.amount !== null && (
                    <div style={styles.emptyText}>Kwota: {reminder.amount.toFixed(2)} zł</div>
                  )}
                  <div style={styles.emptyText}>Dzień przypomnienia: {getRecurringReminderDay(reminder)}</div>
                  <div style={styles.emptyText}>
                    Częstotliwość: {getRecurringFrequencyLabel(reminder)}
                  </div>
                  {installment && (
                    <div style={styles.emptyText}>
                      Rata według harmonogramu: {installment.current}/{installment.total || '?'}
                    </div>
                  )}

                  <ReminderActionRow style={{ ...styles.actions, marginTop: 10 }}>
                    <button type="button" style={styles.secondaryButton} onClick={() => startEdit(reminder)}>
                      Edytuj
                    </button>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() => setDetailsReminderId(reminder.id)}
                    >
                      Szczegóły
                    </button>
                    <button
                      type="button"
                      data-ui-button-danger="true"
                      onClick={async () => {
                        await onDeleteReminder(reminder.id)
                      }}
                    >
                      Usuń
                    </button>
                  </ReminderActionRow>
                </ReminderCard>
              )
            })
          )}
        </div>
      </CalendarSurface>

      {selectedDetailsReminder && (
        <ReminderBellDetailsModal
          selectedDetailsReminder={selectedDetailsReminder}
          selectedDetailsCategory={selectedDetailsCategory}
          selectedMonth={selectedMonth}
          styles={styles}
          setDetailsReminderId={setDetailsReminderId}
          selectedDetailsSchedule={selectedDetailsSchedule}
          selectedDetailsCompletedInstallments={selectedDetailsCompletedInstallments}
          selectedDetailsRemainingInstallments={selectedDetailsRemainingInstallments}
          selectedDetailsProgress={selectedDetailsProgress}
          selectedDetailsPlanTotal={selectedDetailsPlanTotal}
          selectedDetailsPlannedToDate={selectedDetailsPlannedToDate}
          selectedDetailsRemainingAmount={selectedDetailsRemainingAmount}
          selectedDetailsLinkedSum={selectedDetailsLinkedSum}
          selectedDetailsLastTransaction={selectedDetailsLastTransaction}
          selectedDetailsLinkedTransactions={selectedDetailsLinkedTransactions}
          formatAmount={formatAmount}
          getTransactionCategoryName={getTransactionCategoryName}
        />
      )}
    </div>
  )
}
