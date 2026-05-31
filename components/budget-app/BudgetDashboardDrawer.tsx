'use client'

import type { ComponentProps } from 'react'
import DashboardPanel from '../DashboardPanel'

type BudgetDashboardDrawerProps = {
  isOpen: boolean
  dashboardPanelProps: ComponentProps<typeof DashboardPanel>
  onClose: () => void
}

export default function BudgetDashboardDrawer({
  isOpen,
  dashboardPanelProps,
  onClose,
}: BudgetDashboardDrawerProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div data-dashboard-overlay="true" data-dashboard-open={isOpen ? 'true' : 'false'}>
      <button
        type="button"
        data-dashboard-backdrop="true"
        aria-label="Zamknij statystyki"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />
      <aside
        data-dashboard-drawer="true"
        data-dashboard-open={isOpen ? 'true' : 'false'}
        aria-label="Statystyki analityczne"
        aria-hidden={!isOpen}
      >
        <div data-dashboard-drawer-header="true">
          <button type="button" aria-label="Zamknij statystyki" onClick={onClose}>
            ×
          </button>
        </div>
        <DashboardPanel {...dashboardPanelProps} />
      </aside>
    </div>
  )
}
