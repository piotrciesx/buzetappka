export type DashboardContainerType =
  | 'month-finance'
  | 'month-rhythm'
  | 'day-activity'
  | 'daily-averages'
  | 'weekly-trend'
  | 'day-extremes'
  | 'income-expense-trend'
  | 'expense-category-trend'
  | 'income-category-trend'
  | 'recent-events'
  | 'recent-income-expense'
  | 'category-rankings'
  | 'top-items'
  | 'trends-comparison'
  | 'budget-control'
  | 'expense-structure'
  | 'stability-leaks'
  | 'lists-rankings'

export type DashboardWidgetType = DashboardContainerType

export type DashboardTileMode = 'auto' | 'custom'

export type DashboardModuleId =
  | 'balance'
  | 'income'
  | 'expense'
  | 'transaction-count'
  | 'largest-expense'
  | 'largest-income'
  | 'expense-share'
  | 'financial-efficiency'
  | 'calendar-heatmap'
  | 'daily-cashflow'
  | 'days-with-entries'
  | 'days-without-entries'
  | 'average-daily-income'
  | 'average-daily-expense'
  | 'most-expensive-day'
  | 'weekday-patterns'
  | 'trend-income'
  | 'trend-expense'
  | 'trend-balance'
  | 'trend-level1'
  | 'trend-level2'
  | 'trend-level3'
  | 'trend-payment'
  | 'trend-tags'
  | 'month-forecast'
  | 'spending-pace'
  | 'budget-risk'
  | 'fixed-vs-variable'
  | 'expense-stability'
  | 'money-leaks'
  | 'recent-transactions'
  | 'recent-incomes'
  | 'recent-expenses'
  | 'top-categories'
  | 'top-income-categories'
  | 'top-expenses'
  | 'top-incomes'
  | 'problem-categories'

export type DashboardWidgetSize = {
  width: number
  height: number
}

export type DashboardWidgetLayoutItem = DashboardWidgetSize & {
  id: string
  containerType: DashboardContainerType
  type?: string
  mode: DashboardTileMode
  enabledModules: DashboardModuleId[]
  moduleOrder: DashboardModuleId[]
  x: number
  y: number
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
}

export type DashboardWidgetDefinition = {
  type: DashboardContainerType
  title: string
  description: string
  defaultSize: DashboardWidgetSize
  allowedSizes?: DashboardWidgetSize[]
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
  defaultModules: DashboardModuleId[]
  moduleOrder: DashboardModuleId[]
}