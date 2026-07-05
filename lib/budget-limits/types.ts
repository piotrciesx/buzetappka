import type { Grosze } from '../recurring-payments/money'

export type BudgetLimitScopeType =
  | 'category_l2'
  | 'category_l3'
  | 'category_group'
  | 'global_expenses'

export type BudgetLimitPeriodType = 'monthly' | 'date_range' | 'recurring_custom'

export type BudgetLimitUsageStatus = 'safe' | 'warning' | 'exceeded'

export type BudgetLimitAlertStatus = 'none' | 'unread' | 'read' | 'muted'

export type BudgetLimitPlanStatus = 'active' | 'inactive'

export type BudgetLimitChangeMode = 'only_this_period' | 'from_next_period' | 'from_now'

export type BudgetLimitTransactionDateKind = 'exact_day' | 'month_only' | 'unknown_day'

export type BudgetLimitTransactionSemanticType =
  | 'standard'
  | 'transfer'
  | 'refund'
  | 'unknown'

export type BudgetLimitRootType = 'income' | 'expense' | 'unknown'

export type BudgetLimitScope =
  | { type: 'category_l2'; categoryId: string }
  | { type: 'category_l3'; categoryId: string }
  | { type: 'category_group'; categoryIds: readonly string[] }
  | { type: 'global_expenses' }

export type MonthlyBudgetLimitPeriod = {
  type: 'monthly'
  month: string
}

export type DateRangeBudgetLimitPeriod = {
  type: 'date_range'
  startDate: string
  endDate: string
}

export type RecurringCustomBudgetLimitPeriod = {
  type: 'recurring_custom'
  anchorDate: string
  cadenceUnit: 'day' | 'week' | 'month'
  cadenceInterval: number
}

export type BudgetLimitPeriodDefinition =
  | MonthlyBudgetLimitPeriod
  | DateRangeBudgetLimitPeriod
  | RecurringCustomBudgetLimitPeriod

export type BudgetLimitAlertRule = {
  id: string
  kind: 'threshold_reached' | 'limit_exceeded' | 'projected_exceeded'
  thresholdPercent?: number
  enabled: boolean
}

export type BudgetLimitPlan = {
  id: string
  profileId: string
  name: string
  currency: 'PLN'
  status: BudgetLimitPlanStatus
  createdAt?: string
  archivedAt?: string | null
}

export type BudgetLimitVersion = {
  id: string
  planId: string
  profileId: string
  effectiveFrom: string
  effectiveTo: string | null
  limitAmountGrosze: Grosze
  scope: BudgetLimitScope
  period: BudgetLimitPeriodDefinition
  alertRules: readonly BudgetLimitAlertRule[]
  createdAt?: string
  replacedByVersionId?: string | null
}

export type BudgetLimitPeriodInstance = {
  id: string
  planId: string
  versionId: string
  profileId: string
  periodType: BudgetLimitPeriodType
  periodStart: string
  periodEnd: string
  status: 'open' | 'closed'
  spentSnapshotGrosze?: Grosze | null
  transactionCountSnapshot?: number | null
  calculatedAt?: string | null
  closedAt?: string | null
}

export type BudgetLimitAlertState = {
  id: string
  planId: string
  periodId: string
  ruleId: string
  kind: BudgetLimitAlertRule['kind']
  thresholdPercent?: number
  status: BudgetLimitAlertStatus
  triggeredAt: string
  spentGroszeAtTrigger: Grosze
  limitGroszeAtTrigger: Grosze
  readAt: string | null
  mutedForPeriod: boolean
  resolvedAt?: string | null
}

export type BudgetLimitUsageSummary = {
  planId: string
  periodId: string
  limitAmountGrosze: Grosze
  spentAmountGrosze: Grosze
  remainingAmountGrosze: Grosze
  exceededAmountGrosze: Grosze
  usagePercent: number
  dailyAllowedAverageGrosze: Grosze
  currentDailyAverageGrosze: Grosze | null
  projectedSpendGrosze: Grosze | null
  projectedDifferenceGrosze: Grosze | null
  usageStatus: BudgetLimitUsageStatus
  totalDays: number
  daysElapsed: number
  daysLeft: number
  includedTransactionCount: number
  unknownTransactionCount: number
}

export type BudgetLimitCategoryNode = {
  id: string
  level: 1 | 2 | 3
  parentId: string | null
}

export type BudgetLimitTransactionCandidate = {
  id: string
  categoryId: string
  amountGrosze: Grosze
  rootType: BudgetLimitRootType
  date: string
  dateKind: BudgetLimitTransactionDateKind
  isDeleted?: boolean
  semanticType?: BudgetLimitTransactionSemanticType
}
