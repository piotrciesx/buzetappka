export type DashboardWidgetType =
  | 'monthly-balance'
  | 'calendar-heatmap'
  | 'monthly-overview'
  | 'expense-trend'
  | 'income-trend'
  | 'balance-trend'
  | 'cashflow-daily'
  | 'month-over-month'
  | 'category-trends'
  | 'month-forecast'
  | 'spending-pace'
  | 'budget-risk'
  | 'savings-rate'
  | 'fixed-vs-variable'
  | 'fastest-growing-category'
  | 'fastest-falling-category'
  | 'expense-stability'
  | 'weekday-patterns'
  | 'money-leaks'
  | 'income-total'
  | 'expense-total'
  | 'transaction-count'
  | 'largest-expense'
  | 'largest-income'
  | 'recent-transactions'
  | 'top-categories'
  | 'average-expense'
  | 'average-income'
  | 'expense-share'
  | 'income-expense'
  | 'dayless-count'
  | 'generic-placeholder'

export type DashboardWidgetSize = {
  width: number
  height: number
}

export type DashboardWidgetLayoutItem = DashboardWidgetSize & {
  id: string
  type: DashboardWidgetType
  x: number
  y: number
}

export type DashboardWidgetDefinition = {
  type: DashboardWidgetType
  title: string
  description: string
  defaultSize: DashboardWidgetSize
}
