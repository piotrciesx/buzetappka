'use client'

import { useCallback, useMemo } from 'react'
import type { BudgetLimitView } from '../BudgetLimitIndicator'

const GLOBAL_BUDGET_LIMIT_KEY = '__global__'

const getBudgetLimitKey = (categoryId: string | null) => categoryId || GLOBAL_BUDGET_LIMIT_KEY

export function useBudgetLimitViews(activeLimitStates: BudgetLimitView[]) {
  const budgetLimitViewsByCategoryId = useMemo(() => {
    return activeLimitStates.reduce<Record<string, BudgetLimitView>>((acc, state) => {
      acc[getBudgetLimitKey(state.limit.category_id)] = state
      return acc
    }, {})
  }, [activeLimitStates])

  return useCallback(
    (categoryId: string | null) => budgetLimitViewsByCategoryId[getBudgetLimitKey(categoryId)] || null,
    [budgetLimitViewsByCategoryId]
  )
}
