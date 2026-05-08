'use client'

import type { ComponentProps, ReactNode } from 'react'
import BudgetRightRail from '../BudgetRightRail'

type BudgetWorkspaceShellProps = {
  children: ReactNode
  rightRailProps: ComponentProps<typeof BudgetRightRail>
}

export default function BudgetWorkspaceShell({
  children,
  rightRailProps,
}: BudgetWorkspaceShellProps) {
  return (
    <section data-budget-workspace="true">
      <div data-budget-workspace-main="true">{children}</div>

      <BudgetRightRail {...rightRailProps} />
    </section>
  )
}
