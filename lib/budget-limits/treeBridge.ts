export type BudgetLimitCreatorRequest = {
  requestId: number
  scopeType: 'global_expenses' | 'category_l2' | 'category_l3'
  categoryId: string | null
  effectiveMonth: string
  existingPlanId?: string
}

export const buildBudgetLimitCreatorRequest = (
  categoryId: string | null,
  categoryLevel: number | null,
  effectiveMonth: string,
  existingPlanId?: string
): BudgetLimitCreatorRequest => ({
  requestId: Date.now(),
  scopeType: categoryId === null
    ? 'global_expenses'
    : categoryLevel === 2
      ? 'category_l2'
      : 'category_l3',
  categoryId,
  effectiveMonth,
  existingPlanId,
})
