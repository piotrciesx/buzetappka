'use client'

import { useBudgetPageOverlayProps } from '../../lib/useBudgetPageOverlayProps'

export type BudgetOverlayPropsContext = Parameters<typeof useBudgetPageOverlayProps>[0]

export function useBudgetOverlayProps(ctx: BudgetOverlayPropsContext) {
  return useBudgetPageOverlayProps(ctx)
}
