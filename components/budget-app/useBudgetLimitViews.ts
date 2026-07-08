'use client'

import { useCallback, useMemo } from 'react'
import type { ReturnTypeOfUseBudgetLimitsData } from '../../lib/budget-limits/useBudgetLimitsData'
import type { BudgetLimitView } from '../BudgetLimitIndicator'

const GLOBAL_BUDGET_LIMIT_KEY = '__global__'
const getBudgetLimitKey = (categoryId: string | null) => categoryId || GLOBAL_BUDGET_LIMIT_KEY

export function useBudgetLimitViews(data: ReturnTypeOfUseBudgetLimitsData, selectedMonth: string) {
  const budgetLimitViewsByCategoryId = useMemo(() => {
    return Object.fromEntries(buildBudgetLimitViews(data, selectedMonth).map((view) => [
      getBudgetLimitKey(view.categoryId),
      view,
    ]))
  }, [data, selectedMonth])

  return useCallback(
    (categoryId: string | null) => budgetLimitViewsByCategoryId[getBudgetLimitKey(categoryId)] || null,
    [budgetLimitViewsByCategoryId]
  )
}

export function buildBudgetLimitViews(data: ReturnTypeOfUseBudgetLimitsData, selectedMonth: string) {
  const viewsByCategory = new Map<string, { view: BudgetLimitView; effectiveFrom: string }>()

  data.calculated.forEach((item) => {
      if (item.period.period_start.slice(0, 7) !== selectedMonth) return

      const plan = data.plans.find((candidate) => candidate.id === item.period.plan_id)
      if (!plan || plan.status !== 'active' || !item.period.is_active_snapshot) return

      const categoryId = item.version.scope_type === 'global_expenses'
        ? null
        : item.version.category_id
      if (item.version.scope_type !== 'global_expenses' && !categoryId) return

      const view: BudgetLimitView = {
        planId: plan.id,
        categoryId,
        amount: item.period.limit_amount_snapshot,
        usageAmount: item.summary.spentAmountGrosze / 100,
        usagePercent: item.summary.usagePercent,
        alertState: {
          level: item.summary.usageStatus === 'exceeded'
            ? 'exceeded'
            : item.summary.usageStatus === 'warning'
              ? 'warning'
              : 'none',
          text: '',
        },
      }
      const key = getBudgetLimitKey(categoryId)
      const existing = viewsByCategory.get(key)
      if (!existing || existing.effectiveFrom < item.version.effective_from) {
        viewsByCategory.set(key, { view, effectiveFrom: item.version.effective_from })
      }
    })

  return [...viewsByCategory.values()].map(({ view }) => view)
}
