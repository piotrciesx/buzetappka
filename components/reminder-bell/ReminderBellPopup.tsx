import { CSSProperties } from 'react'
import { Category, RecurringTransaction } from '../../lib/budgetPageTypes'
import {
  getInstallmentNumberForMonth,
  getMonthCycleDate,
} from '../../lib/recurringTransactions'
import { uiListRowApi, uiTypographyTokens } from '../../lib/uiFoundation'
import { itemStyle } from './reminderBellStyles'
import {
  ReminderActionRow,
  ReminderCard,
  ReminderStatusBadge,
} from '../reminder-calendar/reminderCalendarPrimitives'

type Props = {
  selectedMonth: string
  pendingReminders: RecurringTransaction[]
  categoriesById: Record<string, Category>
  styles: Record<string, CSSProperties>
  onAddFromReminder: (reminder: RecurringTransaction) => void
  onMarkRead: (reminder: RecurringTransaction) => Promise<void>
  hasLinkedTransactionInSelectedMonth: (reminderId: string) => boolean
  hideLocally: (reminderId: string) => void
  setIsOpen: (value: boolean) => void
}

export default function ReminderBellPopup({
  selectedMonth,
  pendingReminders,
  categoriesById,
  styles,
  onAddFromReminder,
  onMarkRead,
  hasLinkedTransactionInSelectedMonth,
  hideLocally,
  setIsOpen,
}: Props) {
  return (
    <>
      <div style={styles.l2Name}>Przypomnienia wymagające decyzji</div>

      {pendingReminders.length === 0 ? (
        <div style={styles.emptyText}>Brak przypomnień do decyzji w tym miesiącu.</div>
      ) : (
        <div className={`${uiListRowApi.classNames.list} ${uiListRowApi.classNames.listCompact}`}>
          {pendingReminders.map((reminder) => {
          const installment = getInstallmentNumberForMonth(reminder, selectedMonth)
          const category = categoriesById[reminder.category_id]
          const hasDuplicate = hasLinkedTransactionInSelectedMonth(reminder.id)
          const dueDate = getMonthCycleDate(reminder, selectedMonth)

          return (
            <ReminderCard key={reminder.id} style={itemStyle}>
              <div style={{ fontWeight: uiTypographyTokens.weight.semibold }}>
                {reminder.name}
                {installment ? ` - rata nr ${installment.current}` : ''}
              </div>
              <div style={styles.emptyText}>
                {category?.name || 'Kategoria usunięta'} · termin {dueDate}
                {installment ? ` · ${installment.current}/${installment.total || '?'}` : ''}
              </div>
              {hasDuplicate && (
                <ReminderStatusBadge
                  tone="warning"
                  style={{
                    ...styles.infoBox,
                    marginTop: 8,
                    background: 'var(--ui-color-warning-soft)',
                    border: '1px solid var(--ui-color-warning-soft)',
                  }}
                >
                  W tym miesiącu istnieje już wpis powiązany z tym przypomnieniem.
                </ReminderStatusBadge>
              )}
              <ReminderActionRow style={{ ...styles.actions, marginTop: 8 }}>
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
              </ReminderActionRow>
            </ReminderCard>
          )
          })}
        </div>
      )}
    </>
  )
}
