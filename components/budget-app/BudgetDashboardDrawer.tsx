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
  return (
    <div data-dashboard-overlay="true" data-dashboard-open={isOpen ? 'true' : 'false'}>
      <button
        type="button"
        data-dashboard-backdrop="true"
        aria-label="Zamknij dashboard"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />
      <aside
        data-dashboard-drawer="true"
        data-dashboard-open={isOpen ? 'true' : 'false'}
        aria-label="Dashboard analityczny"
        aria-hidden={!isOpen}
      >
        <div data-dashboard-drawer-header="true">
          <div>
            <strong>Dashboard</strong>
            <span>compact analytics</span>
          </div>
          <div data-dashboard-mode-tabs="true" aria-label="Tryb dashboardu">
            <button type="button">compact</button>
            <button type="button">standard</button>
            <button type="button">full</button>
          </div>
          <button type="button" aria-label="Zamknij dashboard" onClick={onClose}>
            ×
          </button>
        </div>
        <DashboardPanel {...dashboardPanelProps} />
      </aside>
    </div>
  )
}
