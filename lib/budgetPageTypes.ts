import { CSSProperties, ReactNode } from 'react'

export type Category = {
  id: string
  name: string
  parent_id: string | null
  level: number
  default_order?: number | null
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
  created_at?: string
  is_deleted?: boolean
  deleted_at?: string | null
}

export type MoveTarget = {
  id: string
  label: string
}

export type TransactionShortcut = {
  id: string
  label: string
}

export type HideMode = 'now' | 'next'
export type RestoreMode = 'now' | 'next'
export type SortMode = 'default' | 'manual' | 'sum' | 'frequency'
export type SortDirection = 'asc' | 'desc'

export type Level1CardBaseProps = {
  level1Category: Category
  isOpen: boolean
  onToggle: () => void
  children?: ReactNode
  styles: Record<string, CSSProperties>
  dragHandle?: ReactNode
}

export type SortableLevel1CardProps = Level1CardBaseProps & {
  isSortable: boolean
}
