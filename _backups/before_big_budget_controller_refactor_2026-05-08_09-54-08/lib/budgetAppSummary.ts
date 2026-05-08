import { getCategoryPathLabel } from './budgetPageHelpers'
import type { Category, Transaction } from './budgetPageTypes'
import { getAmountNumber } from './transactionUtils'

export type RecentTransactionPreview = {
  id: string
  amount: string
  kind: 'income' | 'expense'
  date: string
  description: string
  categoryLabel: string
}

export const buildRecentTransactionPreviews = ({
  transactions,
  categoriesById,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}): RecentTransactionPreview[] => {
  return transactions
    .filter((transaction) => !transaction.is_deleted)
    .sort((left, right) => (right.created_at || '').localeCompare(left.created_at || ''))
    .slice(0, 8)
    .map((transaction) => ({
      id: transaction.id,
      amount: String(getAmountNumber(transaction.amount)),
      kind: getSignedAmountForTransaction(transaction) >= 0 ? 'income' : 'expense',
      date: transaction.day_is_null ? `${transaction.date.slice(0, 7)} · bez dnia` : transaction.date,
      description: transaction.description || '',
      categoryLabel: categoriesById[transaction.category_id]
        ? getCategoryPathLabel(transaction.category_id, categoriesById)
        : 'Kategoria niedostępna',
    }))
}

export const getTotalBudgetBalance = ({
  transactions,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  getSignedAmountForTransaction: (transaction: Transaction) => number
}) => {
  return transactions
    .filter((transaction) => !transaction.is_deleted)
    .reduce((sum, transaction) => sum + getSignedAmountForTransaction(transaction), 0)
}

export const getSelectedMonthIncomeTotal = ({
  transactions,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  getSignedAmountForTransaction: (transaction: Transaction) => number
}) => {
  return transactions.reduce((sum, transaction) => {
    const signedAmount = getSignedAmountForTransaction(transaction)
    return signedAmount > 0 ? sum + signedAmount : sum
  }, 0)
}

export const getSelectedMonthExpenseTotal = ({
  transactions,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  getSignedAmountForTransaction: (transaction: Transaction) => number
}) => {
  return transactions.reduce((sum, transaction) => {
    const signedAmount = getSignedAmountForTransaction(transaction)
    return signedAmount < 0 ? sum + Math.abs(signedAmount) : sum
  }, 0)
}
