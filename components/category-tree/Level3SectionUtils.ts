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
  if (transaction.day_is_null) {
    return 'Bez dnia'
  }

  const [year, month, day] = (transaction.date || '').split('-')
  return year && month && day ? `${day.slice(0, 2)}.${month}.${year}` : transaction.date
}

export const getTransactionDayGroupLabel = (transaction: Transaction, selectedMonth?: string) => {
  if (transaction.day_is_null) {
    return 'Bez dnia'
  }

  const dateText = transaction.date || ''
  const [year, month, day] = dateText.split('-')

  if (year && month && day) {
    return `${day.slice(0, 2)}.${month}.${year}`
  }

  const fallbackDay = dateText.slice(8, 10)
  const [fallbackYear, fallbackMonth] = selectedMonth?.split('-') ?? []

  if (fallbackDay && fallbackYear && fallbackMonth) {
    return `${fallbackDay}.${fallbackMonth}.${fallbackYear}`
  }

  return 'Bez dnia'
}
