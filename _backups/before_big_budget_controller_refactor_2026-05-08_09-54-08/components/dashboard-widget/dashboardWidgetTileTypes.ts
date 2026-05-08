import type { CSSProperties } from 'react'
import type {
  DashboardModuleId,
  DashboardTileMode,
  DashboardWidgetLayoutItem,
} from '../../lib/dashboardTypes'
import type { Category, Transaction } from '../../lib/budgetPageTypes'
import type { Tag } from '../../lib/budgetPageTypes'
import type { DashboardStats, TopCategory } from '../../lib/dashboardStats'

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
  budgetStartDate: string
  excludedMonthsSet: Set<string>
  transactionTagsMap: Record<string, Tag[]>
  dashboardStats: DashboardStats
  topExpenseCategories: TopCategory[]
  latestTransactions: Transaction[]
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
  onWidgetConfigChange: (
    id: string,
    update: {
      mode: DashboardTileMode
      enabledModules: DashboardModuleId[]
      moduleOrder: DashboardModuleId[]
    }
  ) => void
  isDragging: boolean
  isDropBlocked: boolean
  isInteractionLocked: boolean
  isConfigOpen: boolean
  isMobileDashboard: boolean
  onToggleConfig: (id: string) => void
  onToggleSize: (id: string) => void
  onRemove: (id: string) => void
  styles: Record<string, CSSProperties>
}
