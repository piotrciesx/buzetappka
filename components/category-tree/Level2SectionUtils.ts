export type Category = {
  id: string
  name: string
  parent_id: string | null
  level: number
  default_order?: number | null
  sort_order?: number | null
  active_to?: string | null
  reactivate_from?: string | null
  icon_key?: string | null
}

export type Transaction = {
  id: string
  category_id: string
  amount: number | string
  description: string | null
  date: string
  payment_source_id?: string | null
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
export type RestoreMode = 'now' | 'next'

export const getMonthNumber = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)
  return year * 100 + month
}

export const getNextMonthText = (monthText: string) => {
  const [year, month] = monthText.split('-').map(Number)
  const date = new Date(year, month, 1)
  const newYear = date.getFullYear()
  const newMonth = String(date.getMonth() + 1).padStart(2, '0')
  return `${newYear}-${newMonth}`
}
