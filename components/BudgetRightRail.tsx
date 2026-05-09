'use client'

import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import type { RecurringTransaction } from '../lib/budgetPageTypes'
import { getMonthCycleDate } from '../lib/recurringTransactions'

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
  recurringAlerts: RecurringTransaction[]
  showRecurring: boolean
  onOpenSearch: (query?: string) => void
  onOpenNotifications: () => void
  onAddFromReminder: (reminder: RecurringTransaction) => void
  onMarkRecurringRead: (reminder: RecurringTransaction) => Promise<void>
  onQuickAdd: () => void
  onToggleProfile: () => void
}

const emitCloseFloatingUi = () => {
  window.dispatchEvent(new CustomEvent('budget-close-floating-ui'))
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
  recurringAlerts,
  showRecurring,
  onOpenSearch,
  onOpenNotifications,
  onAddFromReminder,
  onMarkRecurringRead,
  onQuickAdd,
  onToggleProfile,
}: Props) {
  const [isNotificationsPreviewOpen, setIsNotificationsPreviewOpen] = useState(false)
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false)
  const [quickSearchText, setQuickSearchText] = useState('')
  const [liveView, setLiveView] = useState<LiveView>('overview')
  const quickSearchRef = useRef<HTMLDivElement | null>(null)
  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const quickSearchInputRef = useRef<HTMLInputElement | null>(null)

  const balanceState = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral'
  const hasOverviewData = incomeTotal > 0 || expenseTotal > 0
  const totalFlow = incomeTotal + expenseTotal
  const incomeShare = totalFlow > 0 ? Math.round((incomeTotal / totalFlow) * 100) : 0
  const expenseShare = totalFlow > 0 ? 100 - incomeShare : 0
  const hasRecurringAlerts = showRecurring && recurringCount > 0

  useEffect(() => {
    const handleCloseFloatingUi = () => {
      setIsQuickSearchOpen(false)
      setIsNotificationsPreviewOpen(false)
    }

    window.addEventListener('budget-close-floating-ui', handleCloseFloatingUi)

    return () => {
      window.removeEventListener('budget-close-floating-ui', handleCloseFloatingUi)
    }
  }, [])

  useEffect(() => {
    if (!isQuickSearchOpen && !isNotificationsPreviewOpen) {
      return
    }

    if (isQuickSearchOpen) {
      quickSearchInputRef.current?.focus()
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null

      if (target && quickSearchRef.current?.contains(target)) {
        return
      }

      if (target && notificationsRef.current?.contains(target)) {
        return
      }

      setIsQuickSearchOpen(false)
      setIsNotificationsPreviewOpen(false)
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsQuickSearchOpen(false)
        setIsNotificationsPreviewOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isNotificationsPreviewOpen, isQuickSearchOpen])

  const handleQuickSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }

    const query = quickSearchText.trim()

    if (!query) {
      return
    }

    onOpenSearch(query)
    setQuickSearchText('')
    setIsQuickSearchOpen(false)
  }

  const formatReminderAmount = (amount: number | null) =>
    amount === null
      ? ''
      : new Intl.NumberFormat('pl-PL', {
          style: 'currency',
          currency: 'PLN',
          maximumFractionDigits: 2,
        }).format(amount)

  return (
    <aside data-budget-context-rail="true" aria-label="Kontekst workspace">
      <section data-context-card="rail-actions" aria-label="Akcje">
        <div data-rail-search-wrap="true" ref={quickSearchRef}>
          <button
            type="button"
            aria-label="Szukaj"
            title="Szukaj"
            onClick={() => {
              const nextIsOpen = !isQuickSearchOpen
              if (nextIsOpen) {
                emitCloseFloatingUi()
              }
              setIsQuickSearchOpen(nextIsOpen)
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6" />
              <path d="m16 16 4 4" />
            </svg>
          </button>

          {isQuickSearchOpen && (
            <div data-rail-quick-search="true">
              <input
                ref={quickSearchInputRef}
                value={quickSearchText}
                onChange={(event) => setQuickSearchText(event.target.value)}
                onKeyDown={handleQuickSearchKeyDown}
                placeholder="Szukaj wpisu..."
              />
            </div>
          )}
        </div>

        <div data-rail-notification-wrap="true" ref={notificationsRef}>
          <button
            type="button"
            aria-label="Powiadomienia"
            title="Powiadomienia"
            data-has-alerts={hasRecurringAlerts ? 'true' : 'false'}
            onClick={() => {
              const nextIsOpen = !isNotificationsPreviewOpen
              if (nextIsOpen) {
                emitCloseFloatingUi()
              }
              setIsNotificationsPreviewOpen(nextIsOpen)
            }}
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
                <div data-rail-reminder-list="true">
                  {recurringAlerts.slice(0, 5).map((reminder) => (
                    <div key={reminder.id} data-rail-reminder-item="true">
                      <div data-rail-reminder-main="true">
                        <span>{reminder.name}</span>
                        <small>
                          Termin {getMonthCycleDate(reminder, selectedMonth).slice(8, 10)}
                          {reminder.amount !== null
                            ? ` · ${formatReminderAmount(reminder.amount)}`
                            : ''}
                        </small>
                      </div>
                      <div data-rail-reminder-actions="true">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNotificationsPreviewOpen(false)
                            onAddFromReminder(reminder)
                          }}
                        >
                          Dodaj wpis
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void onMarkRecurringRead(reminder).then(() => {
                              setIsNotificationsPreviewOpen(false)
                            })
                          }}
                        >
                          Oznacz jako przeczytane
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Brak aktywnych przypomnień.</p>
              )}
              <button
                type="button"
                data-rail-reminders-open-all="true"
                onClick={() => {
                  setIsNotificationsPreviewOpen(false)
                  onOpenNotifications()
                }}
              >
                Pokaż wszystkie
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Dodaj wpis"
          title="Dodaj wpis"
          onClick={() => {
            emitCloseFloatingUi()
            onQuickAdd()
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Profil"
          title="Profil"
          data-rail-profile-action="true"
          onClick={() => {
            emitCloseFloatingUi()
            onToggleProfile()
          }}
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
            ? 'Masz przypomnienia do decyzji.'
            : 'Brak aktywnych płatności w podglądzie.'}
        </p>
      </section>
    </aside>
  )
}
