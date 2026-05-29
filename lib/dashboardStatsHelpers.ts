import { Category, Transaction } from './budgetPageTypes'
import { isExistingDate, isMonthExcludedFromStats } from './dateUtils'
import {
  getTransactionDay as getTransactionDayFromDomain,
  getTransactionMonth,
  isDaylessTransaction as isDaylessTransactionFromDomain,
  isTransactionInMonth as isTransactionInMonthFromDomain,
} from './transactionDomain'

export const isTransactionInMonth = (transaction: Transaction, selectedMonth: string) => {
  return isTransactionInMonthFromDomain(transaction, selectedMonth)
}

export const isTransactionInExistingStatsDate = (transaction: Transaction) => {
  return isExistingDate(transaction.date)
}

export const isDaylessTransaction = (transaction: Transaction) => {
  return isDaylessTransactionFromDomain(transaction)
}

export const getMonthLabel = (month: string) => {
  const [, monthNumber] = month.split('-')
  return monthNumber || month
}

export const shiftMonth = (month: string, offset: number) => {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(year, monthNumber - 1 + offset, 1)

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export const getIncludedMonthRange = (
  selectedMonth: string,
  count: number,
  excludedMonthsSet?: Set<string>
) => {
  const months: string[] = []
  let cursor = selectedMonth
  let guard = 0

  while (months.length < count && guard < count + 48) {
    if (!isMonthExcludedFromStats(cursor, excludedMonthsSet)) {
      months.unshift(cursor)
    }

    cursor = shiftMonth(cursor, -1)
    guard += 1
  }

  return months
}

export const getTransactionDay = (transaction: Transaction) => {
  return getTransactionDayFromDomain(transaction)
}

export const getWeekdayIndex = (date: string) => {
  const parsedDate = new Date(`${date}T00:00:00`)
  const day = parsedDate.getDay()

  return day === 0 ? 6 : day - 1
}

export const getCategoryDescendantIds = (
  categoryId: string,
  categoriesById: Record<string, Category>
) => {
  const result = new Set<string>([categoryId])
  let changed = true

  while (changed) {
    changed = false

    for (const category of Object.values(categoriesById)) {
      if (category.parent_id && result.has(category.parent_id) && !result.has(category.id)) {
        result.add(category.id)
        changed = true
      }
    }
  }

  return result
}

export const getChange = (current: number, previous: number) => ({
  amount: current - previous,
  percent: previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : null,
})
