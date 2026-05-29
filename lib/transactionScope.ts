import type { Transaction } from './budgetPageTypes'
import { isMonthExcludedFromStats } from './dateUtils'
import { getTransactionMonth, isDaylessTransaction } from './transactionDomain'

const normalizeDate = (value: string | null | undefined) => value?.slice(0, 10) ?? ''

export type EffectiveTransactionScopeMode =
  | 'stats'
  | 'calendar'
  | 'search'
  | 'goals'
  | 'limits'
  | 'reminders'
  | 'export-active'
  | 'backup-full'
  | 'trash'

export const TRANSACTION_SELECT_COLUMNS =
  'id, category_id, amount, description, date, day_is_null, payment_source_id, recurring_transaction_id, created_at, is_deleted, deleted_at'

type EffectiveTransactionScopeOptions = {
  mode: EffectiveTransactionScopeMode
  budgetStartDate?: string | null
  excludedMonthsSet?: Set<string> | null
}

export function isTransactionBeforeBudgetStart(
  transaction: Pick<Transaction, 'date' | 'day_is_null'>,
  budgetStartDate: string | null | undefined
) {
  const startDate = normalizeDate(budgetStartDate)

  if (!startDate) {
    return false
  }

  if (isDaylessTransaction(transaction)) {
    const transactionMonth = getTransactionMonth(transaction)
    const startMonth = startDate.slice(0, 7)
    return Boolean(transactionMonth) && transactionMonth < startMonth
  }

  return normalizeDate(transaction.date) < startDate
}

export function isMonthBeforeBudgetStart(
  month: string,
  budgetStartDate: string | null | undefined
) {
  const startDate = normalizeDate(budgetStartDate)

  if (!month || !startDate) {
    return false
  }

  return month < startDate.slice(0, 7)
}

export function isTransactionInScope(
  transaction: Pick<Transaction, 'date' | 'day_is_null'>,
  budgetStartDate: string | null | undefined
) {
  return !isTransactionBeforeBudgetStart(transaction, budgetStartDate)
}

const shouldExcludeMonthForMode = (
  mode: EffectiveTransactionScopeMode,
  month: string,
  excludedMonthsSet: Set<string> | null | undefined
) => {
  if (!month) {
    return false
  }

  if (mode !== 'stats' && mode !== 'goals') {
    return false
  }

  return isMonthExcludedFromStats(month, excludedMonthsSet)
}

export function isTransactionInEffectiveScope<T extends Pick<Transaction, 'date' | 'day_is_null'> & {
  is_deleted?: boolean
}>(
  transaction: T,
  { mode, budgetStartDate, excludedMonthsSet }: EffectiveTransactionScopeOptions
) {
  if (mode === 'backup-full') {
    return true
  }

  const isDeleted = transaction.is_deleted === true

  if (mode === 'trash') {
    return isDeleted
  }

  if (isDeleted) {
    return false
  }

  if (isTransactionBeforeBudgetStart(transaction, budgetStartDate)) {
    return false
  }

  return !shouldExcludeMonthForMode(mode, getTransactionMonth(transaction), excludedMonthsSet)
}

export function getEffectiveTransactionScope<T extends Pick<Transaction, 'date' | 'day_is_null'> & {
  is_deleted?: boolean
}>(transactions: T[], options: EffectiveTransactionScopeOptions) {
  return transactions.filter((transaction) => isTransactionInEffectiveScope(transaction, options))
}

export function getTransactionIdsInEffectiveScope<
  T extends Pick<Transaction, 'id' | 'date' | 'day_is_null'> & { is_deleted?: boolean },
>(transactions: T[], options: EffectiveTransactionScopeOptions) {
  return getEffectiveTransactionScope(transactions, options).map((transaction) => transaction.id)
}

export function filterTransactionsInScope<T extends Pick<Transaction, 'date' | 'day_is_null'>>(
  transactions: T[],
  budgetStartDate: string | null | undefined
) {
  return transactions.filter((transaction) => isTransactionInScope(transaction, budgetStartDate))
}

export const isTransactionInBudgetRange = isTransactionInScope
export const filterTransactionsByBudgetStartDate = filterTransactionsInScope
