'use client'

import { CSSProperties, useMemo, useState } from 'react'
import {
  Category,
  RecurringReminderMonthStatus,
  RecurringTransaction,
  Transaction,
} from '../lib/budgetPageTypes'
import { getUniqueCategoryLabel } from '../lib/categoryUtils'
import {
  getInstallmentNumberForMonth,
  getInstallmentSummary,
  getMonthCycleDate,
  getPendingRecurringTransactions,
  getRecurringFrequencyLabel,
  getRecurringKindLabel,
  getRecurringReminderDay,
} from '../lib/recurringTransactions'

type ReminderInput = Omit<RecurringTransaction, 'id' | 'profile_id' | 'created_at'> & {
  id?: string
}

type Props = {
  selectedMonth: string
  recurringTransactions: RecurringTransaction[]
  recurringReminderMonthStatuses: RecurringReminderMonthStatus[]
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  styles: Record<string, CSSProperties>
  onAddFromReminder: (reminder: RecurringTransaction) => void
  onMarkRead: (reminder: RecurringTransaction) => Promise<void>
  categoryOptions: Category[]
  onSaveReminder: (input: ReminderInput) => Promise<void>
  onDeleteReminder: (reminderId: string) => Promise<void>
}

const containerStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const bellRowStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  justifyContent: 'flex-end',
}

const countStyle: CSSProperties = {
  marginLeft: 6,
  minWidth: 20,
  height: 20,
  borderRadius: 999,
  background: '#dc2626',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 600,
}

const popoverStyle: CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 'calc(100% + 8px)',
  width: 400,
  maxWidth: 'calc(100vw - 32px)',
  padding: 12,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  background: '#ffffff',
  boxShadow: '0 16px 36px rgba(15, 23, 42, 0.16)',
  zIndex: 40,
}

const panelStyle: CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  background: '#ffffff',
  padding: 12,
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 10,
  alignItems: 'end',
}

const itemStyle: CSSProperties = {
  padding: '10px 0',
  borderTop: '1px solid #f1f5f9',
}

const cardStyle: CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: 12,
  background: '#f9fafb',
}

const fieldLabelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
}

const invalidInputStyle: CSSProperties = {
  border: '1px solid #ef4444',
  boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.12)',
}

const progressOuterStyle: CSSProperties = {
  height: 8,
  borderRadius: 999,
  background: '#e5e7eb',
  overflow: 'hidden',
}

const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  background: 'rgba(17, 24, 39, 0.45)',
}

const modalStyle: CSSProperties = {
  width: 'min(760px, 100%)',
  maxHeight: '86vh',
  overflowY: 'auto',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  background: '#ffffff',
  padding: 16,
  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
}

const detailGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 8,
  marginTop: 12,
}

const linkedTransactionRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '110px 1fr 100px 160px',
  gap: 8,
  alignItems: 'center',
  padding: '8px 0',
  borderTop: '1px solid #f1f5f9',
  fontSize: 13,
}

const detailSectionStyle: CSSProperties = {
  marginTop: 16,
  paddingTop: 14,
  borderTop: '1px solid #e5e7eb',
}

const detailSectionTitleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: '#111827',
}

const initialForm = {
  id: '',
  name: '',
  categoryId: '',
  kind: 'open' as RecurringTransaction['kind'],
  entryDescription: '',
  amount: '',
  frequency: 'monthly' as RecurringTransaction['frequency'],
  customIntervalMonths: '2',
  reminderDay: '1',
  hasStartDate: false,
  startDate: '',
  hasEndDate: false,
  endDate: '',
  installmentTotalCount: '',
}

const toAmount = (value: string) => {
  const normalized = Number(value.replace(',', '.'))
  return value.trim() && !Number.isNaN(normalized) ? normalized : null
}

const normalizeDay = (value: string) => {
  const day = Number(value.replace(/\D/g, ''))

  if (!day) {
    return ''
  }

  return String(Math.min(Math.max(day, 1), 31))
}

const setDateDay = (dateText: string, dayText: string) => {
  const month = dateText ? dateText.slice(0, 7) : ''
  const day = String(Number(dayText) || 1).padStart(2, '0')
  return month ? `${month}-${day}` : ''
}

const getIntervalInMonths = (reminder: RecurringTransaction) => {
  if (reminder.frequency === 'yearly') {
    return 12
  }

  if (reminder.frequency === 'custom') {
    return Math.max(reminder.custom_interval_months || 1, 1)
  }

  return 1
}

const getMonthDifference = (fromDateText: string, toMonthText: string) => {
  const [fromYear, fromMonth] = fromDateText.slice(0, 7).split('-').map(Number)
  const [toYear, toMonth] = toMonthText.split('-').map(Number)
  return (toYear - fromYear) * 12 + (toMonth - fromMonth)
}

const addMonthsToDate = (dateText: string, monthsToAdd: number) => {
  const [year, month, day] = dateText.split('-').map(Number)
  const date = new Date(year, month - 1 + monthsToAdd, 1)
  const nextMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  const nextDay = Math.min(day || 1, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())

  return `${nextMonth}-${String(nextDay).padStart(2, '0')}`
}

const getInstallmentScheduleInfo = (
  reminder: RecurringTransaction | null,
  selectedMonth: string
) => {
  if (!reminder || reminder.kind !== 'installment' || !reminder.start_date) {
    return {
      scheduledDone: 0,
      scheduledRemaining: reminder?.installment_total_count ?? null,
      currentLabel: null,
      nextInstallmentDate: null,
    }
  }

  const total = reminder.installment_total_count || null
  const interval = getIntervalInMonths(reminder)
  const monthsDelta = getMonthDifference(reminder.start_date, selectedMonth)
  const rawDone = monthsDelta < 0 ? 0 : Math.floor(monthsDelta / interval) + 1
  const scheduledDone = total ? Math.min(rawDone, total) : rawDone
  const scheduledRemaining = total === null ? null : Math.max(total - scheduledDone, 0)
  const nextInstallmentDate =
    total !== null && scheduledDone >= total
      ? null
      : addMonthsToDate(reminder.start_date, scheduledDone * interval)

  return {
    scheduledDone,
    scheduledRemaining,
    currentLabel: total ? `${scheduledDone}/${total}` : `${scheduledDone}/?`,
    nextInstallmentDate,
  }
}

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
}: Props) {
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
        recurringReminderMonthStatuses
      ).filter((reminder) => !hiddenReminderIds.includes(reminder.id)),
    [hiddenReminderIds, recurringReminderMonthStatuses, recurringTransactions, selectedMonth]
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
      .filter((transaction) => transaction.recurring_transaction_id === reminderId)
      .sort((left, right) => right.date.localeCompare(left.date))
  }

  const hasLinkedTransactionInSelectedMonth = (reminderId: string) => {
    return transactions.some(
      (transaction) =>
        transaction.recurring_transaction_id === reminderId &&
        transaction.date.slice(0, 7) === selectedMonth
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
    ? getInstallmentSummary(selectedDetailsReminder, [], selectedMonth)
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
    selectedDetailsReminder.amount !== null &&
    selectedDetailsReminder.installment_total_count
      ? selectedDetailsReminder.amount * selectedDetailsReminder.installment_total_count +
        (selectedDetailsReminder.initial_payment_amount || 0)
      : null
  const selectedDetailsPlannedToDate =
    selectedDetailsReminder?.kind === 'installment' && selectedDetailsReminder.amount !== null
      ? selectedDetailsCompletedInstallments * selectedDetailsReminder.amount +
        (selectedDetailsReminder.initial_payment_amount || 0)
      : null
  const selectedDetailsRemainingAmount =
    selectedDetailsReminder?.kind === 'installment' && selectedDetailsReminder.amount !== null
      ? (selectedDetailsRemainingInstallments ?? 0) * selectedDetailsReminder.amount
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
        <button type="button" style={styles.secondaryButton} onClick={() => setIsOpen((prev) => !prev)}>
          Dzwonek
          {pendingReminders.length > 0 && <span style={countStyle}>{pendingReminders.length}</span>}
        </button>

        {isOpen && (
          <div style={popoverStyle}>
            <div style={styles.l2Name}>Przypomnienia wymagające decyzji</div>

            {pendingReminders.length === 0 ? (
              <div style={styles.emptyText}>Brak przypomnień do decyzji w tym miesiącu.</div>
            ) : (
              pendingReminders.map((reminder) => {
                const installment = getInstallmentNumberForMonth(reminder, selectedMonth)
                const category = categoriesById[reminder.category_id]
                const hasDuplicate = hasLinkedTransactionInSelectedMonth(reminder.id)

                return (
                  <div key={reminder.id} style={itemStyle}>
                    <div style={{ fontWeight: 600 }}>{reminder.name}</div>
                    <div style={styles.emptyText}>
                      {category?.name || 'Kategoria usunięta'} · dzień {getRecurringReminderDay(reminder)}
                      {installment ? ` · ${installment.current} / ${installment.total || '?'}` : ''}
                    </div>
                    {hasDuplicate && (
                      <div style={{ ...styles.infoBox, marginTop: 8, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                        W tym miesiącu istnieje już wpis powiązany z tym przypomnieniem.
                      </div>
                    )}
                    <div style={{ ...styles.actions, marginTop: 8 }}>
                      <button
                        type="button"
                        style={styles.primaryButton}
                        onClick={() => {
                          onAddFromReminder(reminder)
                          setIsOpen(false)
                        }}
                      >
                        Dodaj wpis
                      </button>
                      <button
                        type="button"
                        style={styles.secondaryButton}
                        onClick={async () => {
                          hideLocally(reminder.id)
                          await onMarkRead(reminder)
                        }}
                      >
                        Oznacz jako przeczytane
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      <div style={panelStyle}>
        <div style={styles.l2Name}>Przypomnienia</div>
        <div style={{ ...styles.emptyText, marginTop: 4 }}>
          Przypomnienie jest sugestią. Wpis powstaje dopiero po wybraniu akcji „Dodaj wpis”.
        </div>

        <div style={{ ...gridStyle, marginTop: 12 }}>
          <label style={fieldLabelStyle}>
            Nazwa przypomnienia
            <input
              style={styles.input}
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              placeholder="np. czynsz"
            />
          </label>

          <label style={fieldLabelStyle}>
            Opis wpisu
            <input
              style={styles.input}
              value={form.entryDescription}
              onChange={(event) => updateForm('entryDescription', event.target.value)}
              placeholder="tekst wpisu po dodaniu"
            />
          </label>

          <label style={fieldLabelStyle}>
            Kategoria
            <select
              style={{ ...styles.input, ...(shouldHighlightCategory ? invalidInputStyle : {}) }}
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
              <span style={{ color: '#dc2626', fontSize: 12, fontWeight: 600 }}>
                Wybierz kategorię końcową.
              </span>
            )}
          </label>

          <label style={fieldLabelStyle}>
            Typ
            <select
              style={styles.input}
              value={form.kind}
              onChange={(event) => updateForm('kind', event.target.value as RecurringTransaction['kind'])}
            >
              <option value="open">ciągłe</option>
              <option value="installment">ratalne</option>
            </select>
          </label>

          <label style={fieldLabelStyle}>
            Interwał
            <select
              style={styles.input}
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
                style={styles.input}
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
              style={styles.input}
              value={form.reminderDay}
              inputMode="numeric"
              onChange={(event) => updateForm('reminderDay', normalizeDay(event.target.value))}
              onBlur={() => updateForm('reminderDay', form.reminderDay || '1')}
            />
          </label>

          <label style={fieldLabelStyle}>
            Kwota
            <input
              style={styles.input}
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
                style={styles.input}
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
                style={styles.input}
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
                style={styles.input}
                value={form.endDate}
                onChange={(event) => updateForm('endDate', event.target.value)}
              />
            </label>
          )}
        </div>

        <div style={{ ...styles.actions, marginTop: 12 }}>
          <button
            type="button"
            style={{
              ...styles.primaryButton,
              opacity: isSaving ? 0.55 : 1,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
            disabled={isSaving}
            onClick={() => void handleSave()}
          >
            {isSaving ? 'Zapisywanie...' : form.id ? 'Zapisz zmiany' : 'Zapisz przypomnienie'}
          </button>
          {form.id && (
            <button type="button" style={styles.secondaryButton} onClick={resetForm}>
              Anuluj
            </button>
          )}
        </div>

        <div style={{ ...gridStyle, marginTop: 14 }}>
          {recurringTransactions.length === 0 ? (
            <div style={styles.emptyText}>Brak zapisanych przypomnień.</div>
          ) : (
            recurringTransactions.map((reminder) => {
              const installment = getInstallmentNumberForMonth(reminder, selectedMonth)
              const category = categoriesById[reminder.category_id]

              return (
                <div key={reminder.id} style={cardStyle}>
                  <div style={{ fontWeight: 600 }}>{reminder.name}</div>
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
                    Interwał: {getRecurringFrequencyLabel(reminder)}
                  </div>
                  {installment && (
                    <div style={styles.emptyText}>
                      Rata według harmonogramu: {installment.current}/{installment.total || '?'}
                    </div>
                  )}

                  <div style={{ ...styles.actions, marginTop: 10 }}>
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
                      style={styles.secondaryButton}
                      onClick={async () => {
                        await onDeleteReminder(reminder.id)
                      }}
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {selectedDetailsReminder && (
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
                      <b>Raty wykonane według harmonogramu:</b>{' '}
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
                      <b>Interwał:</b> {getRecurringFrequencyLabel(selectedDetailsReminder)}
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
      )}
    </div>
  )
}
