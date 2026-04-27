import type { ReactNode } from 'react'
import type { Transaction } from './monthCalendarTypes'
import { transactionsListStyle } from './monthCalendarStyles'

type MonthCalendarTransactionListProps = {
  transactions: Transaction[]
  context: 'day' | 'no-day'
  renderTransactionCard: (transaction: Transaction, context: 'day' | 'no-day') => ReactNode
}

export default function MonthCalendarTransactionList({
  transactions,
  context,
  renderTransactionCard,
}: MonthCalendarTransactionListProps) {
  return (
    <div style={transactionsListStyle}>
      {transactions.map((transaction) => renderTransactionCard(transaction, context))}
    </div>
  )
}
