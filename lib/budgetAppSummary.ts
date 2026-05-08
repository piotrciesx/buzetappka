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

export type PinnedWorkspaceCategory = {
  id: string
  label: string
  kind: 'income' | 'expense'
  amount: number
  transactionCount: number
}

const getSafeSignedAmount = (
  transaction: Transaction,
  getSignedAmountForTransaction?: (transaction: Transaction) => number
) => {
  if (typeof getSignedAmountForTransaction === 'function') {
    return getSignedAmountForTransaction(transaction)
  }

  return getAmountNumber(transaction.amount)
}

export const buildPinnedWorkspaceCategories = ({
  pinnedCategoryIds,
  addableTransactionCategoryIds,
  categories,
  categoriesById,
  expenseLevel1Id,
  transactionCategoryPathLabels,
  getRootLevel1IdForCategory,
  getSumForCategoryForSelectedMonth,
  getCategoryCountForSelectedMonth,
}: {
  pinnedCategoryIds: string[]
  addableTransactionCategoryIds: Set<string>
  categories: Category[]
  categoriesById: Record<string, Category>
  expenseLevel1Id: string | null
  transactionCategoryPathLabels: Record<string, string>
  getRootLevel1IdForCategory?: (categoryId: string) => string | null
  getSumForCategoryForSelectedMonth?: (categoryId: string) => number
  getCategoryCountForSelectedMonth?: (categoryId: string) => number
}): PinnedWorkspaceCategory[] => {
  const safePinnedCategoryIds = Array.isArray(pinnedCategoryIds) ? pinnedCategoryIds : []
  const safeCategories = Array.isArray(categories) ? categories : []
  const safeCategoriesById = categoriesById || {}
  const safeTransactionCategoryPathLabels = transactionCategoryPathLabels || {}
  const hasAddableCategory =
    addableTransactionCategoryIds instanceof Set
      ? (categoryId: string) => addableTransactionCategoryIds.has(categoryId)
      : () => false

  const categoryNameCounts = safeCategories.reduce<Record<string, number>>((acc, category) => {
    acc[category.name] = (acc[category.name] || 0) + 1
    return acc
  }, {})

  return safePinnedCategoryIds
    .filter((categoryId) => hasAddableCategory(categoryId) && safeCategoriesById[categoryId])
    .slice(0, 5)
    .map((categoryId) => {
      const category = safeCategoriesById[categoryId]
      const rootId =
        typeof getRootLevel1IdForCategory === 'function'
          ? getRootLevel1IdForCategory(categoryId)
          : null
      const isDuplicateName = categoryNameCounts[category.name] > 1
      const label = isDuplicateName
        ? safeTransactionCategoryPathLabels[categoryId] ||
          getCategoryPathLabel(categoryId, safeCategoriesById)
        : category.name
      const amount =
        typeof getSumForCategoryForSelectedMonth === 'function'
          ? getSumForCategoryForSelectedMonth(categoryId)
          : 0
      const transactionCount =
        typeof getCategoryCountForSelectedMonth === 'function'
          ? getCategoryCountForSelectedMonth(categoryId)
          : 0

      return {
        id: categoryId,
        label,
        kind: rootId === expenseLevel1Id ? 'expense' : 'income',
        amount,
        transactionCount,
      }
    })
}

export const buildContextCalendarDays = ({ selectedMonth }: { selectedMonth: string }) => {
  const [year, month] = selectedMonth.split('-').map(Number)

  if (!year || !month) {
    return []
  }

  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7

  return [
    ...Array.from({ length: leadingEmptyDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]
}

export const buildRecentTransactionPreviews = ({
  transactions,
  categoriesById,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction?: (transaction: Transaction) => number
}): RecentTransactionPreview[] => {
  const safeTransactions = Array.isArray(transactions) ? transactions : []
  const safeCategoriesById = categoriesById || {}

  return safeTransactions
    .filter((transaction) => !transaction.is_deleted)
    .sort((left, right) => (right.created_at || '').localeCompare(left.created_at || ''))
    .slice(0, 8)
    .map((transaction) => ({
      id: transaction.id,
      amount: String(getAmountNumber(transaction.amount)),
      kind: getSafeSignedAmount(transaction, getSignedAmountForTransaction) >= 0 ? 'income' : 'expense',
      date: transaction.day_is_null ? `${transaction.date.slice(0, 7)} · bez dnia` : transaction.date,
      description: transaction.description || '',
      categoryLabel: safeCategoriesById[transaction.category_id]
        ? getCategoryPathLabel(transaction.category_id, safeCategoriesById)
        : 'Kategoria niedostępna',
    }))
}

export const getTotalBudgetBalance = ({
  transactions,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  getSignedAmountForTransaction?: (transaction: Transaction) => number
}) => {
  const safeTransactions = Array.isArray(transactions) ? transactions : []

  return safeTransactions
    .filter((transaction) => !transaction.is_deleted)
    .reduce((sum, transaction) => sum + getSafeSignedAmount(transaction, getSignedAmountForTransaction), 0)
}

export const getSelectedMonthIncomeTotal = ({
  transactions,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  getSignedAmountForTransaction?: (transaction: Transaction) => number
}) => {
  const safeTransactions = Array.isArray(transactions) ? transactions : []

  return safeTransactions.reduce((sum, transaction) => {
    const signedAmount = getSafeSignedAmount(transaction, getSignedAmountForTransaction)
    return signedAmount > 0 ? sum + signedAmount : sum
  }, 0)
}

export const getSelectedMonthExpenseTotal = ({
  transactions,
  getSignedAmountForTransaction,
}: {
  transactions: Transaction[]
  getSignedAmountForTransaction?: (transaction: Transaction) => number
}) => {
  const safeTransactions = Array.isArray(transactions) ? transactions : []

  return safeTransactions.reduce((sum, transaction) => {
    const signedAmount = getSafeSignedAmount(transaction, getSignedAmountForTransaction)
    return signedAmount < 0 ? sum + Math.abs(signedAmount) : sum
  }, 0)
}
