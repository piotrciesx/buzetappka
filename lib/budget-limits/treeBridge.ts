export type BudgetLimitTreeOpenRequest = {
  categoryId: string | null
  planId?: string
}

export const buildBudgetLimitTreeOpenRequest = (
  categoryId: string | null,
  planId?: string
): BudgetLimitTreeOpenRequest => ({ categoryId, planId })

// TODO(budget-limits-v1): replace the legacy category editor entry with planId navigation
// after production has the stage-2 migration and legacy/new writes are dual-written.
