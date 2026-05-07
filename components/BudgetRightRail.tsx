'use client'

type LiveRailItem = {
  title: string
  text: string
  meta: string[]
}

type Props = {
  selectedMonth: string
  isSelectedMonthLocked: boolean
  transactionCount: number
  categoryCount: number
  balance: number
  draftCount: number
  activeLiveRailItem: LiveRailItem
  recurringCount: number
  goalsCount: number
  showRecurring: boolean
  showGoals: boolean
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
  draftCount,
  activeLiveRailItem,
  recurringCount,
  goalsCount,
  showRecurring,
  showGoals,
  onOpenSearch,
  onOpenNotifications,
  onQuickAdd,
  onToggleProfile,
}: Props) {
  const balanceState = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral'

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
          <small>Live</small>
        </div>
        <div data-live-widget-card="true">
          <div data-live-widget-rotating="true">
            <strong>{activeLiveRailItem.title}</strong>
            <p>{activeLiveRailItem.text}</p>
            <div data-live-widget-meta="true">
              {activeLiveRailItem.meta.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div data-live-widget-meta="true">
            <span>{draftCount} szkice</span>
            <span>{transactionCount} wpisy</span>
            {showRecurring && <span>{recurringCount} przypomnienia</span>}
            {showGoals && <span>{goalsCount} cele</span>}
            <span>{isSelectedMonthLocked ? 'zamknięty' : 'otwarty'}</span>
          </div>
          <div data-live-widget-dots="true" aria-label="Rotacja podglądu">
            <i data-active="true" />
            <i />
            <i />
          </div>
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
