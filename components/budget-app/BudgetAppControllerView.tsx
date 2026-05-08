'use client'

import type { ComponentProps } from 'react'
import BudgetPageMainPanels from '../BudgetPageMainPanels'
import BudgetAppOverlaySection from './BudgetAppOverlaySection'
import BudgetDashboardDrawer from './BudgetDashboardDrawer'
import BudgetPageStatusPanelsContainer from './BudgetPageStatusPanelsContainer'
import BudgetWorkspaceShell from './BudgetWorkspaceShell'

type BudgetAppControllerViewProps = {
  styles: Record<string, React.CSSProperties>
  budgetLimitDataSnapshot: {
    activeLimitCount: number
    calculatedLimitCount: number
    activeAlertCount: number
  }
  statusPanelsCtx: Record<string, any>
  rightRailProps: ComponentProps<typeof BudgetWorkspaceShell>['rightRailProps']
  mainPanelsProps: ComponentProps<typeof BudgetPageMainPanels>
  dashboardDrawerProps: ComponentProps<typeof BudgetDashboardDrawer>
  overlaySectionProps: ComponentProps<typeof BudgetAppOverlaySection>
}

export default function BudgetAppControllerView({
  styles,
  budgetLimitDataSnapshot,
  statusPanelsCtx,
  rightRailProps,
  mainPanelsProps,
  dashboardDrawerProps,
  overlaySectionProps,
}: BudgetAppControllerViewProps) {
  return (
    <main
      style={styles.page}
      data-budget-app="true"
      data-budget-limit-count={budgetLimitDataSnapshot.activeLimitCount}
      data-budget-limit-calculated-count={budgetLimitDataSnapshot.calculatedLimitCount}
      data-budget-limit-alert-count={budgetLimitDataSnapshot.activeAlertCount}
    >
      <BudgetPageStatusPanelsContainer ctx={statusPanelsCtx} />

      <BudgetWorkspaceShell rightRailProps={rightRailProps}>
        <BudgetPageMainPanels {...mainPanelsProps} />
      </BudgetWorkspaceShell>

      <BudgetDashboardDrawer {...dashboardDrawerProps} />
      <BudgetAppOverlaySection {...overlaySectionProps} />
    </main>
  )
}
