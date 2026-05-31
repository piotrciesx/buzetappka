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
  const visibleBudgetAlerts = budgetAlerts.slice(0, 2)

  return (
    <aside data-budget-context-rail="true" aria-label="Kontekst workspace">
      <section data-right-rail-panel="summary">
        <header data-right-rail-panel-header="true">
          <h2>Podsumowanie miesiąca</h2>
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
          <div data-right-rail-progress="true" aria-hidden="true">
            <i />
          </div>
        </div>
      </section>

      <section data-right-rail-panel="upcoming">
        <header data-right-rail-panel-header="true">
          <h2>Nadchodzące płatności</h2>
          <span>{recurringCount}</span>
        </header>
        <div data-right-rail-panel-body="true">
          <p data-right-rail-placeholder="true">Kontener przyszłych płatności</p>
        </div>
      </section>

      <section data-right-rail-panel="alerts">
        <header data-right-rail-panel-header="true">
          <h2>Alerty i limity</h2>
          <span>{budgetAlerts.length}</span>
        </header>
        <div data-right-rail-panel-body="true">
          {visibleBudgetAlerts.length > 0 ? (
            visibleBudgetAlerts.map((alert) => (
              <div key={alert.id} data-right-rail-row="true">
                <span>{alert.categoryLabel}</span>
                <strong>{Math.round(alert.usagePercent)}%</strong>
              </div>
            ))
          ) : (
            <p data-right-rail-placeholder="true">Kontener alertów i limitów</p>
          )}
        </div>
      </section>

      <section data-right-rail-panel="quick-actions">
        <header data-right-rail-panel-header="true">
          <h2>Szybkie akcje</h2>
        </header>
        <div data-right-rail-actions="true" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>
    </aside>
  )
}
