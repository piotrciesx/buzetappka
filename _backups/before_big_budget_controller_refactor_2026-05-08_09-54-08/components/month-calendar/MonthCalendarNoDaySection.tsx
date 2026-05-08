import type { CSSProperties, ReactNode } from 'react'
import type { Transaction } from './monthCalendarTypes'
import {
  calendarDayMetaStyle,
  noDayHintStyle,
  noDaySectionStyle,
  noDaySummaryStyle,
} from './monthCalendarStyles'
import MonthCalendarEmptyState from './MonthCalendarEmptyState'
import MonthCalendarTransactionList from './MonthCalendarTransactionList'

type MonthCalendarNoDaySectionProps = {
  transactionsWithoutDay: Transaction[]
  noDayTransactionsSum: number
  styles: Record<string, CSSProperties>
  formatAmount: (value: number) => string
  renderTransactionCard: (transaction: Transaction, context: 'day' | 'no-day') => ReactNode
}

export default function MonthCalendarNoDaySection({
  transactionsWithoutDay,
  noDayTransactionsSum,
  styles,
  formatAmount,
  renderTransactionCard,
}: MonthCalendarNoDaySectionProps) {
  return (
    <div style={noDaySectionStyle}>
      <div style={styles.sectionTitle}>Wpisy bez dnia</div>

      <div style={noDaySummaryStyle}>
        <div style={styles.l2Name}>Podsumowanie wpisów bez dnia</div>
        <div style={{ ...calendarDayMetaStyle, marginTop: 6 }}>
          Suma: <strong>{formatAmount(noDayTransactionsSum)} zł</strong>
        </div>
        <div style={{ ...calendarDayMetaStyle, marginTop: 4 }}>
          Liczba wpisów: <strong>{transactionsWithoutDay.length}</strong>
        </div>
        <div style={noDayHintStyle}>
          Te wpisy należą do wybranego miesiąca, ale nie są przypisane do konkretnego dnia i
          nie wpływają na heatmapę.
        </div>
      </div>

      {transactionsWithoutDay.length === 0 ? (
        <MonthCalendarEmptyState styles={styles}>
          Brak wpisów bez dnia w tym miesiącu.
        </MonthCalendarEmptyState>
      ) : (
        <MonthCalendarTransactionList
          transactions={transactionsWithoutDay}
          context="no-day"
          renderTransactionCard={renderTransactionCard}
        />
      )}
    </div>
  )
}
