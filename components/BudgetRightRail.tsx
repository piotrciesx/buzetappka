'use client'

import { useState } from 'react'

type LiveView = 'overview' | 'payments' | 'alerts'

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
  onQuickAdd,
  onToggleProfile,
}: Props) {
  const [isNotificationsPreviewOpen, setIsNotificationsPreviewOpen] = useState(false)
  const [liveView, setLiveView] = useState<LiveView>('overview')

  const balanceState = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral'
  const hasOverviewData = incomeTotal > 0 || expenseTotal > 0
  const totalFlow = incomeTotal + expenseTotal
  const incomeShare = totalFlow > 0 ? Math.round((incomeTotal / totalFlow) * 100) : 0
  const expenseShare = totalFlow > 0 ? 100 - incomeShare : 0
  const hasRecurringAlerts = showRecurring && recurringCount > 0

  return (
    <aside data-budget-context-rail="true" aria-label="Kontekst workspace">
      <section data-context-card="rail-actions" aria-label="Akcje">
        <button type="button" aria-label="Szukaj" title="Szukaj" onClick={onOpenSearch}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path d="m16 16 4 4" />
          </svg>
        </button>

        <div data-rail-notification-wrap="true">
          <button
            type="button"
            aria-label="Powiadomienia"
            title="Powiadomienia"
            data-has-alerts={hasRecurringAlerts ? 'true' : 'false'}
            onClick={() => setIsNotificationsPreviewOpen((value) => !value)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 5 1.7 5.8 2.2 7H4.3c.5-1.2 2.2-2 2.2-7Z" />
              <path d="M10 20h4" />
            </svg>
          </button>

          {isNotificationsPreviewOpen && (
            <div data-rail-notification-popover="true">
              <strong>Powiadomienia</strong>
              {hasRecurringAlerts ? (
                <p>Masz aktywne przypomnienia lub raty do sprawdzenia w tym miesiącu.</p>
              ) : (
                <p>Brak aktywnych przypomnień do obsłużenia.</p>
              )}
              <small>Konfiguracja przypomnień jest dostępna w menu po lewej.</small>
            </div>
          )}
        </div>

        <button type="button" aria-label="Dodaj wpis" title="Dodaj wpis" onClick={onQuickAdd}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Profil"
          title="Profil"
          data-rail-profile-action="true"
          onClick={onToggleProfile}
        >
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
          <span>Live widget</span>
          <small>{selectedMonth}</small>
        </div>

        <div data-live-widget-tabs="true">
          <button
            type="button"
            data-active={liveView === 'overview' ? 'true' : 'false'}
            onClick={() => setLiveView('overview')}
          >
            Dashboard
          </button>
          <button
            type="button"
            data-active={liveView === 'payments' ? 'true' : 'false'}
            onClick={() => setLiveView('payments')}
          >
            Płatności
          </button>
          <button
            type="button"
            data-active={liveView === 'alerts' ? 'true' : 'false'}
            onClick={() => setLiveView('alerts')}
          >
            Alerty
          </button>
        </div>

        <div data-live-widget-card="true">
          {liveView === 'overview' && (
            <>
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
            </>
          )}

          {liveView === 'payments' && (
            <div data-live-widget-empty="true">
              <strong>Nadchodzące płatności</strong>
              <p>
                {showRecurring && recurringCount > 0
                  ? `Masz ${recurringCount} aktywnych pozycji do sprawdzenia.`
                  : 'Brak aktywnych płatności w podglądzie.'}
              </p>
            </div>
          )}

          {liveView === 'alerts' && (
            <div data-live-widget-empty="true">
              <strong>Alerty miesiąca</strong>
              <p>
                {hasRecurringAlerts
                  ? 'Masz aktywne przypomnienia lub raty do obsłużenia.'
                  : 'Brak alertów wymagających reakcji.'}
              </p>
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
            ? 'Masz aktywne przypomnienia lub raty do sprawdzenia.'
            : 'Brak aktywnych płatności w podglądzie.'}
        </p>
      </section>
    </aside>
  )
}