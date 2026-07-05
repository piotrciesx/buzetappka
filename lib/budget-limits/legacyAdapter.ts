import type { BudgetLimit, Category } from '../budgetPageTypes'
import { parseGrosze } from '../recurring-payments/money'
import { createMonthlyBudgetLimitPeriod } from './periods'
import type {
  BudgetLimitAlertRule,
  BudgetLimitPlan,
  BudgetLimitScope,
  BudgetLimitVersion,
} from './types'

export type LegacyBudgetLimitAdaptation = {
  plan: BudgetLimitPlan
  version: BudgetLimitVersion
  warnings: string[]
}

export const getLegacyBudgetLimitAlertRules = (
  mode: BudgetLimit['mode']
): BudgetLimitAlertRule[] => {
  const exceededRule: BudgetLimitAlertRule = {
    id: 'legacy-exceeded',
    kind: 'limit_exceeded',
    thresholdPercent: 100,
    enabled: true,
  }
  if (mode === 'strict') return [exceededRule]
  return [
    { id: 'legacy-warning-80', kind: 'threshold_reached', thresholdPercent: 80, enabled: true },
    { id: 'legacy-warning-90', kind: 'threshold_reached', thresholdPercent: 90, enabled: true },
    exceededRule,
  ]
}

const getLegacyScope = (
  limit: BudgetLimit,
  categoriesById: Readonly<Record<string, Category>>
): BudgetLimitScope | null => {
  if (!limit.category_id) return { type: 'global_expenses' }
  const category = categoriesById[limit.category_id]
  if (category?.level === 2) return { type: 'category_l2', categoryId: category.id }
  if (category?.level === 3) return { type: 'category_l3', categoryId: category.id }
  return null
}

export const adaptLegacyBudgetLimit = ({
  limit,
  categoriesById,
}: {
  limit: BudgetLimit
  categoriesById: Readonly<Record<string, Category>>
}): LegacyBudgetLimitAdaptation | null => {
  const scope = getLegacyScope(limit, categoriesById)
  if (!scope) return null

  const planId = `legacy-budget-limit:${limit.id}`
  const effectiveFrom = `${limit.start_month}-01`
  const effectiveTo = limit.end_month
    ? createMonthlyBudgetLimitPeriod(limit.end_month).periodEnd
    : null
  const warnings = [
    'Legacy rows do not expose a stable plan identity across historical versions.',
  ]

  return {
    plan: {
      id: planId,
      profileId: limit.profile_id,
      name: scope.type === 'global_expenses' ? 'Wszystkie wydatki' : 'Limit kategorii',
      currency: 'PLN',
      status: 'active',
      createdAt: limit.created_at,
      archivedAt: null,
    },
    version: {
      id: `legacy-budget-limit-version:${limit.id}`,
      planId,
      profileId: limit.profile_id,
      effectiveFrom,
      effectiveTo,
      limitAmountGrosze: parseGrosze(limit.amount),
      scope,
      period: { type: 'monthly', month: limit.start_month },
      alertRules: getLegacyBudgetLimitAlertRules(limit.mode),
      createdAt: limit.created_at,
      replacedByVersionId: null,
    },
    warnings,
  }
}

