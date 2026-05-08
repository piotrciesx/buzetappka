export type Category = {
  id: string
  name: string
  parent_id: string | null
  level: number
  sort_order?: number | null
  active_to?: string | null
  reactivate_from?: string | null
}

export type Transaction = {
  id: string
  category_id: string
  amount: number | string
  description: string | null
  date: string
  day_is_null?: boolean
  payment_source_id?: string | null
  recurring_transaction_id?: string | null
  created_at?: string
  is_deleted?: boolean
  deleted_at?: string | null
}

export type MoveTarget = {
  id: string
  label: string
}

export type RecurringLinkOption = {
  id: string
  label: string
  description?: string
  amount?: number | null
  useAmountWhenCreating?: boolean
  hasTransactionInMonth?: boolean
}

export type HideMode = 'now' | 'next'

export const normalizeAmountInput = (value: string) => {
  return value.replace(',', '.')
}

export const getOrderedLevel3Transactions = (transactions: Transaction[]) => {
  return [...transactions].sort((left, right) => {
    const leftNoDay = Boolean(left.day_is_null)
    const rightNoDay = Boolean(right.day_is_null)

    if (leftNoDay !== rightNoDay) {
      return leftNoDay ? 1 : -1
    }

    return right.date.localeCompare(left.date)
  })
}

export const getTransactionDateLabel = (transaction: Transaction) => {
  return transaction.day_is_null ? 'brak dnia' : transaction.date
}

export const getTransactionDayGroupLabel = (transaction: Transaction) => {
  if (transaction.day_is_null) {
    return 'bez dnia'
  }

  const dayText = transaction.date.slice(8, 10).replace(/^0/, '')
  return dayText ? `dzień ${dayText}` : 'bez dnia'
}
