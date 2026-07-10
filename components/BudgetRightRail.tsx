'use client'

import type { Props } from './right-rail/budgetRightRailTypes'

const formatMoney = (value: number) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 2,
  }).format(value)

export default function BudgetRightRail({
  isSelectedMonthLocked,
  balance,
  recurringCount,
  budgetAlerts,
}: Props) {
  return (
    <aside data-budget-context-rail="true" aria-label="Kontekst workspace">
      <section data-static-widget-area="right" data-static-widget="summary">
        <header data-right-rail-panel-header="true">
          <h2>Podsumowanie</h2>
        </header>
        <div data-right-rail-panel-body="true">
          <div data-right-rail-row="true">
            <span>Bilans</span>
            <strong>{formatMoney(balance)}</strong>
          </div>
          <div data-right-rail-row="true">
            <span>Status</span>
            <strong>{isSelectedMonthLocked ? 'Zamknięty' : 'Otwarty'}</strong>
          </div>
        </div>
      </section>

      <section data-static-widget-area="right" data-static-widget="upcoming">
        <header data-right-rail-panel-header="true">
          <h2>Nadchodzące</h2>
          <span>{recurringCount}</span>
        </header>
        <div data-right-rail-panel-body="true">
          <p data-widget-placeholder="true">Brak nadchodzących płatności do pokazania.</p>
        </div>
      </section>

      <section data-static-widget-area="right" data-static-widget="alerts">
        <header data-right-rail-panel-header="true">
          <h2>Alerty i limity</h2>
          <span>{budgetAlerts.length}</span>
        </header>
        <div data-right-rail-panel-body="true">
          <p data-widget-placeholder="true">Brak aktywnych alertów.</p>
        </div>
      </section>
    </aside>
  )
}
