import type { Transaction } from '../budgetPageTypes'

export type DashboardStatsOptions = {
  excludedMonthsSet?: Set<string>
  latestLimit?: number
}

export type DashboardStats = {
  income: number
  expense: number
  balance: number
  transactionCount: number
  incomeCount: number
  expenseCount: number
  biggestExpense: number
  biggestIncome: number
  averageExpense: number
  averageIncome: number
  daylessCount: number
  expenseShareOfIncome: number
}

export type TopCategory = {
  categoryId: string
  name: string
  total: number
}

export type DashboardOverview = {
  dashboardStats: DashboardStats
  topExpenseCategories: TopCategory[]
  latestTransactions: Transaction[]
}

export type DashboardMonthlyTrendPoint = {
  month: string
  label: string
  income: number
  expense: number
  balance: number
}

export type DashboardTrendStats = {
  months: DashboardMonthlyTrendPoint[]
  current: DashboardMonthlyTrendPoint
  previous: DashboardMonthlyTrendPoint | null
  expenseChange: DashboardChange
  incomeChange: DashboardChange
  balanceChange: DashboardChange
}

export type DashboardChange = {
  amount: number
  percent: number | null
}

export type DashboardDailyCashflowPoint = {
  day: number
  label: string
  income: number
  expense: number
  net: number
  cumulative: number
}

export type DashboardDailyCashflowStats = {
  points: DashboardDailyCashflowPoint[]
  finalBalance: number
  minPoint: DashboardDailyCashflowPoint | null
  maxPoint: DashboardDailyCashflowPoint | null
  daylessCount: number
}

export type DashboardMonthOverMonthMetric = {
  key: 'income' | 'expense' | 'balance'
  label: string
  current: number
  previous: number
  change: DashboardChange
}

export type DashboardMonthOverMonthStats = {
  currentMonth: string
  previousMonth: string
  metrics: DashboardMonthOverMonthMetric[]
}

export type DashboardCategoryTrend = {
  categoryId: string
  name: string
  total: number
  months: Array<{
    month: string
    label: string
    total: number
  }>
  change: DashboardChange
}

export type DashboardBudgetRiskLevel = 'none' | 'low' | 'medium' | 'high'

export type DashboardSpendingPaceStatus = 'calm' | 'watch' | 'fast'

export type DashboardForecastStats = {
  incomeToDate: number
  expenseToDate: number
  currentBalance: number
  forecastExpense: number
  forecastBalance: number
  elapsedDays: number
  daysInMonth: number
  monthProgressPercent: number
  spendingProgressPercent: number
  spendingPaceStatus: DashboardSpendingPaceStatus
  spendingPaceDifference: number
  budgetRiskLevel: DashboardBudgetRiskLevel
  budgetRiskLabel: string
  budgetRiskDifference: number
  budgetRiskDescription: string
  savingsRate: number
  savingsRateDescription: string
  daylessCount: number
}

export type DashboardFixedVariableStats = {
  fixed: number
  variable: number
  other: number
  total: number
  hasConfiguredGroups: boolean
}

export type DashboardCategoryMovement = {
  categoryId: string
  name: string
  previous: number
  current: number
  difference: number
  percent: number | null
  isNew: boolean
}

export type DashboardExpenseStabilityStats = {
  status: 'stable' | 'medium' | 'spiky'
  label: string
  averageDailyExpense: number
  biggestDay: { day: number; total: number } | null
  dailyExpenses: number[]
}

export type DashboardWeekdayPattern = {
  dayIndex: number
  label: string
  total: number
}

export type DashboardMoneyLeak = {
  categoryId: string
  name: string
  total: number
  count: number
  average: number
  baseline: number
  difference: number
  percent: number | null
}

export type DashboardCategoryPatternStats = {
  fixedVariable: DashboardFixedVariableStats
  fastestGrowing: DashboardCategoryMovement | null
  fastestFalling: DashboardCategoryMovement | null
  expenseStability: DashboardExpenseStabilityStats
  weekdayPatterns: DashboardWeekdayPattern[]
  moneyLeaks: DashboardMoneyLeak[]
}
