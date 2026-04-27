import type { CSSProperties } from 'react'
import type { DashboardWidgetLayoutItem, DashboardWidgetType } from '../../lib/dashboardTypes'
import type { Category, Transaction } from '../../lib/budgetPageTypes'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'

export type DashboardResizeEdges = {
  left: boolean
  right: boolean
  top: boolean
  bottom: boolean
}

export type DashboardWidgetPixelRect = {
  left: number
  top: number
  width: number
  height: number
}

export type DayMetric = {
  day: number
  date: string
  income: number
  expense: number
  balance: number
  count: number
}

export type CategoryBreakdown = {
  id: string
  name: string
  total: number
}

export type MonthMetrics = {
  days: DayMetric[]
  topIncomeCategories: CategoryBreakdown[]
  topExpenseCategories: CategoryBreakdown[]
  mostExpensiveDay: DayMetric | null
  topExpenseCategory: CategoryBreakdown | null
  daysWithEntries: number
  daysWithoutEntries: number
  averageDailyIncome: number
  averageDailyExpense: number
}

export type LineSeries = {
  id: string
  label: string
  color: string
  values: number[]
}

export type DashboardWidgetTileProps = {
  widget: DashboardWidgetLayoutItem
  rect: DashboardWidgetPixelRect
  transactions: Transaction[]
  selectedMonth: string
  dashboardStats: DashboardStats
  topExpenseCategories: TopCategory[]
  latestTransactions: Transaction[]
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
  onWidgetTypeChange: (id: string, type: DashboardWidgetType) => void
  isDragging: boolean
  isDropBlocked: boolean
  isInteractionLocked: boolean
  isResizeActive: boolean
  onRemove: (id: string) => void
  onResizeStart: (
    id: string,
    edges: DashboardResizeEdges,
    event: { clientX: number; clientY: number }
  ) => void
  styles: Record<string, CSSProperties>
}
