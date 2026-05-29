import type { Category, Transaction } from '../../lib/budgetPageTypes'
import { getUniqueCategoryLabel } from '../../lib/categoryUtils'
import { isActiveTransaction, isTransactionInMonth } from '../../lib/transactionDomain'

export type TopEntry = {
  id: string
  date: string
  description: string
  categoryName: string
  amount: number
}
 
function getDayFromDate(date: string) {
  const day = Number(date.slice(8, 10))

  return Number.isFinite(day) ? day : 0
}

export function formatShortDate(date: string) {
  return `${date.slice(8, 10)}.${date.slice(5, 7)}`
}

function getDescription(transaction: Transaction) {
  const value = String(
    (transaction as Transaction & { description?: string | null }).description ?? ''
  ).trim()

  return value.length > 0 ? value : 'Bez opisu'
}

function getCategoryName(transaction: Transaction, categoriesById: Record<string, Category>) {
  return getUniqueCategoryLabel(transaction.category_id, categoriesById) || 'Bez kategorii'
}

export function sortByAbsoluteAmount(left: TopEntry, right: TopEntry) {
  const amountCompare = Math.abs(right.amount) - Math.abs(left.amount)

  if (amountCompare !== 0) {
    return amountCompare
  }

  const dateCompare = right.date.localeCompare(left.date)

  if (dateCompare !== 0) {
    return dateCompare
  }

  return String(right.id).localeCompare(String(left.id))
}

export function buildTopEntries({
  transactions,
  selectedMonth,
  existingDays,
  categoriesById,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  selectedMonth: string
  existingDays: number
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}) {
  return transactions
    .filter((transaction) => {
      if (!isActiveTransaction(transaction) || !isTransactionInMonth(transaction, selectedMonth)) {
        return false
      }

      const day = getDayFromDate(transaction.date)

      return day >= 1 && day <= existingDays
    })
    .map<TopEntry>((transaction) => ({
      id: transaction.id,
      date: transaction.date,
      description: getDescription(transaction),
      categoryName: getCategoryName(transaction, categoriesById),
      amount: getSignedAmountForTransaction(transaction),
    }))
    .filter((entry) => entry.amount !== 0)
}
