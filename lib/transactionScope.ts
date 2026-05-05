import type { Transaction } from './budgetPageTypes'

const normalizeDate = (value: string | null | undefined) => value?.slice(0, 10) ?? ''

export function isTransactionInScope(
  transaction: Pick<Transaction, 'date'>,
  budgetStartDate: string | null | undefined
) {
  const startDate = normalizeDate(budgetStartDate)

  if (!startDate) {
    return true
  }

  return normalizeDate(transaction.date) >= startDate
}

export function filterTransactionsInScope<T extends Pick<Transaction, 'date'>>(
  transactions: T[],
  budgetStartDate: string | null | undefined
) {
  return transactions.filter((transaction) => isTransactionInScope(transaction, budgetStartDate))
}

export const isTransactionInBudgetRange = isTransactionInScope
export const filterTransactionsByBudgetStartDate = filterTransactionsInScope
