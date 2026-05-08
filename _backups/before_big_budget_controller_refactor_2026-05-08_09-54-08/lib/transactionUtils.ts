import { getMonthNumber } from './dateUtils'

type Transaction = {
  id: string
  category_id: string
  amount: number | string
  description: string | null
  date: string
  created_at?: string
  is_deleted?: boolean
  deleted_at?: string | null
}

export const getTransactionsForCategoryAndMonth = (
  transactions: Transaction[],
  categoryId: string,
  selectedMonth: string
) => {
  return transactions
    .filter((transaction) => {
      if (transaction.category_id !== categoryId) {
        return false
      }

      if (!transaction.date || typeof transaction.date !== 'string') {
        return false
      }

      return transaction.date.slice(0, 7) === selectedMonth
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export const getAmountNumber = (value: unknown) => {
  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    return 0
  }

  return parsed
}

export const getSumForCategory = (
  transactions: Transaction[],
  categoryId: string,
  selectedMonth: string
) => {
  return getTransactionsForCategoryAndMonth(transactions, categoryId, selectedMonth).reduce(
    (sum, transaction) => {
      return sum + getAmountNumber(transaction.amount)
    },
    0
  )
}

export const getCountForLevel2 = (
  transactions: Transaction[],
  childCategoryIds: string[],
  selectedMonth: string
) => {
  return childCategoryIds.reduce((sum, childId) => {
    return sum + getTransactionsForCategoryAndMonth(transactions, childId, selectedMonth).length
  }, 0)
}

export const getSumForLevel2 = (
  transactions: Transaction[],
  childCategoryIds: string[],
  selectedMonth: string
) => {
  return childCategoryIds.reduce((sum, childId) => {
    return sum + getSumForCategory(transactions, childId, selectedMonth)
  }, 0)
}

export const getEntryCountForCategoryFromMonth = (
  transactions: Transaction[],
  categoryIdsToCheck: string[],
  startMonth: string
) => {
  if (categoryIdsToCheck.length === 0) {
    return 0
  }

  const startMonthNumber = getMonthNumber(startMonth)

  return transactions.filter((transaction) => {
    if (!categoryIdsToCheck.includes(transaction.category_id)) {
      return false
    }

    if (!transaction.date || typeof transaction.date !== 'string') {
      return false
    }

    const transactionMonth = transaction.date.slice(0, 7)
    return getMonthNumber(transactionMonth) >= startMonthNumber
  }).length
}

export const getFirstEntryMonthForCategoryFromMonth = (
  transactions: Transaction[],
  categoryIdsToCheck: string[],
  startMonth: string
) => {
  if (categoryIdsToCheck.length === 0) {
    return null
  }

  const startMonthNumber = getMonthNumber(startMonth)

  const matchingMonths = transactions
    .filter((transaction) => {
      if (!categoryIdsToCheck.includes(transaction.category_id)) {
        return false
      }

      if (!transaction.date || typeof transaction.date !== 'string') {
        return false
      }

      const transactionMonth = transaction.date.slice(0, 7)
      return getMonthNumber(transactionMonth) >= startMonthNumber
    })
    .map((transaction) => transaction.date.slice(0, 7))
    .sort((a, b) => getMonthNumber(a) - getMonthNumber(b))

  return matchingMonths[0] || null
}

export const getTransactionsForCategoriesFromMonth = (
  transactions: Transaction[],
  categoryIdsToCheck: string[],
  startMonth: string
) => {
  if (categoryIdsToCheck.length === 0) {
    return [] as Transaction[]
  }

  const startMonthNumber = getMonthNumber(startMonth)

  return transactions.filter((transaction) => {
    if (!categoryIdsToCheck.includes(transaction.category_id)) {
      return false
    }

    if (!transaction.date || typeof transaction.date !== 'string') {
      return false
    }

    const transactionMonth = transaction.date.slice(0, 7)
    return getMonthNumber(transactionMonth) >= startMonthNumber
  })
}
