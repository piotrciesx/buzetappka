'use client'

type Props = {
  selectedMonth: string
  isSelectedMonthLocked: boolean
  transactionCount: number
  categoryCount: number
  balance: number
  incomeTotal: number
  expenseTotal: number
  draftCount: number
  recurringCount: number
  showRecurring: boolean
  onOpenSearch: () => void
  onOpenNotifications: () => void
  onQuickAdd: () => void
  onToggleProfile: () => void
}

export default function BudgetRightRail({
  selectedMonth,
  isSelectedMonthLocked,
  transactionCount,
  categoryCount,
  balance,
  incomeTotal,
  expenseTotal,
  draftCount,
  recurringCount,
  showRecurring,
  onOpenSearch,
  onOpenNotifications,
  onQuickAdd,
  onToggleProfile,
}: Props) {
  const balanceState = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral'
  const hasOverviewData = incomeTotal > 0 || expenseTotal > 0
  const totalFlow = incomeTotal + expenseTotal
  const incomeShare = totalFlow > 0 ? Math.round((incomeTotal / totalFlow) * 100) : 0
  const expenseShare = totalFlow > 0 ? 100 - incomeShare : 0

  return (
    <aside data-budget-context-rail="true" aria-label="Kontekst workspace">
      <section data-context-card="rail-actions" aria-label="Akcje">
        <button type="button" aria-label="Szukaj" title="Szukaj" onClick={onOpenSearch}>
          Szukaj
        </button>
        <button
          type="button"
          aria-label="Powiadomienia"
          title="Powiadomienia"
          disabled={!showRecurring}
          onClick={onOpenNotifications}
        >
          Powiadomienia
        </button>
        <button type="button" aria-label="Dodaj wpis" title="Dodaj wpis" onClick={onQuickAdd}>
          Dodaj
        </button>
        <button type="button" aria-label="Profil" title="Profil" onClick={onToggleProfile}>
          P
        </button>
      </section>

      <section data-context-card="summary">
        <div>
          <span>Miesiąc</span>
          <strong>{selectedMonth}</strong>
        </div>
        <em>{isSelectedMonthLocked ? 'zamknięty' : 'otwarty'}</em>
      </section>

      <section data-context-card="metrics">
        <div data-context-metric="true">
          <span>Wpisy</span>
          <strong>{transactionCount}</strong>
        </div>
        <div data-context-metric="true">
          <span>Kategorie</span>
          <strong>{categoryCount}</strong>
        </div>
        <div data-context-metric="true" data-balance-state={balanceState}>
          <span>Bilans</span>
          <strong>{balance.toLocaleString('pl-PL')}</strong>
        </div>
        <div data-context-metric="true">
          <span>Szkice</span>
          <strong>{draftCount}</strong>
        </div>
      </section>

      <section data-context-card="live">
        <div data-context-card-header="true">
          <span>Przegląd miesiąca</span>
          <small>{selectedMonth}</small>
        </div>
        <div data-live-widget-card="true">
          {hasOverviewData ? (
            <>
              <div data-live-widget-totals="true">
                <div>
                  <span>Wpływy</span>
                  <strong>{incomeTotal.toLocaleString('pl-PL')} zł</strong>
                </div>
                <div>
                  <span>Wydatki</span>
                  <strong>{expenseTotal.toLocaleString('pl-PL')} zł</strong>
                </div>
                <div data-balance-state={balanceState}>
                  <span>Bilans</span>
                  <strong>{balance.toLocaleString('pl-PL')} zł</strong>
                </div>
              </div>
              <div data-live-widget-flow="true" aria-label="Wpływy kontra wydatki">
                <i style={{ width: `${incomeShare}%` }} data-flow-kind="income" />
                <i style={{ width: `${expenseShare}%` }} data-flow-kind="expense" />
              </div>
              <div data-live-widget-meta="true">
                <span>{transactionCount} wpisy</span>
                <span>{isSelectedMonthLocked ? 'zamknięty' : 'otwarty'}</span>
              </div>
            </>
          ) : (
            <div data-live-widget-empty="true">
              <strong>Brak danych do podglądu</strong>
              <p>Dodaj wpisy, aby zobaczyć przegląd miesiąca.</p>
            </div>
          )}
        </div>
      </section>

      <section data-context-card="upcoming">
        <div data-context-card-header="true">
          <span>Nadchodzące płatności</span>
          <small>{showRecurring ? `${recurringCount}` : '0'}</small>
        </div>
        <p>
          {showRecurring && recurringCount > 0
            ? 'Moduł przypomnień ma aktywne pozycje do sprawdzenia.'
            : 'Brak aktywnych płatności w podglądzie.'}
        </p>
      </section>
    </aside>
  )
}
