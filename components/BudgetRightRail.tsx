'use client'

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { RecurringTransaction } from '../lib/budgetPageTypes'
import { getMonthCycleDate } from '../lib/recurringTransactions'

type LiveWidgetCard = {
  id: string
  kind: 'payment' | 'alert' | 'goal' | 'dashboard'
  eyebrow: string
  title: string
  value?: string
  description: string
  meta?: string
  tone?: 'income' | 'expense' | 'warning' | 'neutral'
  progressPercent?: number
}

type BudgetAlertPreview = {
  id: string
  categoryLabel: string
  usageAmount: number
  limitAmount: number
  usagePercent: number
  text: string
}

type FinancialGoalPreview = {
  id: string
  name: string
  collectedAmount: number
  remainingAmount: number
  percentage: number
}

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
  budgetAlerts: BudgetAlertPreview[]
  financialGoals: FinancialGoalPreview[]
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

const formatMoney = (value: number) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 2,
  }).format(value)

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
  budgetAlerts,
  financialGoals,
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
  const [liveCardIndex, setLiveCardIndex] = useState(0)
  const quickSearchRef = useRef<HTMLDivElement | null>(null)
  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const quickSearchInputRef = useRef<HTMLInputElement | null>(null)

  const balanceState = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral'
  const hasOverviewData = incomeTotal > 0 || expenseTotal > 0
  const hasRecurringAlerts = showRecurring && recurringCount > 0

  const liveCards = useMemo<LiveWidgetCard[]>(() => {
    const cards: LiveWidgetCard[] = []

    if (showRecurring && recurringAlerts.length > 0) {
      recurringAlerts.slice(0, 3).forEach((reminder) => {
        const reminderDate = getMonthCycleDate(reminder, selectedMonth)
        cards.push({
          id: `payment-${reminder.id}`,
          kind: 'payment',
          eyebrow: 'Płatność',
          title: reminder.name,
          value: reminder.amount !== null ? formatMoney(reminder.amount) : undefined,
          description: `Termin: ${reminderDate.slice(8, 10)}.${reminderDate.slice(5, 7)}`,
          meta: reminderDate,
          tone: 'neutral',
        })
      })
    } else {
      cards.push({
        id: 'payment-empty',
        kind: 'payment',
        eyebrow: 'Płatności',
        title: 'Brak zaplanowanych płatności',
        description: 'W tym miesiącu nie ma aktywnych przypomnień do obsługi.',
        tone: 'neutral',
      })
    }

    if (budgetAlerts.length > 0) {
      budgetAlerts.slice(0, 3).forEach((alert) => {
        cards.push({
          id: `alert-${alert.id}`,
          kind: 'alert',
          eyebrow: 'Alert budżetowy',
          title: alert.categoryLabel,
          value: `${Math.round(alert.usagePercent)}%`,
          description:
            alert.text ||
            `${formatMoney(alert.usageAmount)} z limitu ${formatMoney(alert.limitAmount)}`,
          meta: `${formatMoney(alert.usageAmount)} / ${formatMoney(alert.limitAmount)}`,
          tone: 'warning',
          progressPercent: Math.min(Math.max(alert.usagePercent, 0), 100),
        })
      })
    } else {
      cards.push({
        id: 'alert-empty',
        kind: 'alert',
        eyebrow: 'Alerty',
        title: 'Brak alertów budżetowych',
        description: 'Limity nie wymagają teraz reakcji.',
        tone: 'neutral',
      })
    }

    if (financialGoals.length > 0) {
      financialGoals.slice(0, 3).forEach((goal) => {
        cards.push({
          id: `goal-${goal.id}`,
          kind: 'goal',
          eyebrow: 'Cel finansowy',
          title: goal.name,
          value: `${Math.round(goal.percentage)}%`,
          description: `Zebrano ${formatMoney(goal.collectedAmount)}, brakuje ${formatMoney(
            goal.remainingAmount
          )}.`,
          tone: 'income',
          progressPercent: Math.min(Math.max(goal.percentage, 0), 100),
        })
      })
    } else {
      cards.push({
        id: 'goal-empty',
        kind: 'goal',
        eyebrow: 'Cele',
        title: 'Brak aktywnych celów',
        description: 'Nie ma teraz celu finansowego w toku.',
        tone: 'neutral',
      })
    }

    cards.push(
      {
        id: 'dashboard-balance',
        kind: 'dashboard',
        eyebrow: 'Bilans miesiąca',
        title: selectedMonth,
        value: formatMoney(balance),
        description: hasOverviewData
          ? `Wpływy ${formatMoney(incomeTotal)}, wydatki ${formatMoney(expenseTotal)}.`
          : 'Dodaj wpisy, aby zobaczyć rytm miesiąca.',
        meta: `${transactionCount} wpisów`,
        tone:
          balanceState === 'positive'
            ? 'income'
            : balanceState === 'negative'
              ? 'expense'
              : 'neutral',
      },
      {
        id: 'dashboard-entries',
        kind: 'dashboard',
        eyebrow: 'Rytm miesiąca',
        title: `${transactionCount} wpisów`,
        value: `${categoryCount} kat.`,
        description: isSelectedMonthLocked ? 'Miesiąc jest zamknięty.' : 'Miesiąc jest otwarty.',
        meta: `${draftCount} szkice`,
        tone: 'neutral',
      }
    )

    return cards
  }, [
    balance,
    balanceState,
    budgetAlerts,
    categoryCount,
    draftCount,
    expenseTotal,
    financialGoals,
    hasOverviewData,
    incomeTotal,
    isSelectedMonthLocked,
    recurringAlerts,
    selectedMonth,
    showRecurring,
    transactionCount,
  ])

  useEffect(() => {
    if (liveCardIndex < liveCards.length) {
      return
    }

    setLiveCardIndex(0)
  }, [liveCardIndex, liveCards.length])

  useEffect(() => {
    if (liveCards.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setLiveCardIndex((currentIndex) => (currentIndex + 1) % liveCards.length)
    }, 30000)

    return () => window.clearInterval(timer)
  }, [liveCards.length])

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

  const formatReminderAmount = (amount: number | null) => (amount === null ? '' : formatMoney(amount))
  const activeLiveCard = liveCards[liveCardIndex] || liveCards[0]

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
        <div
          key={activeLiveCard.id}
          data-live-widget-card="true"
          data-live-card-kind={activeLiveCard.kind}
          data-live-card-tone={activeLiveCard.tone || 'neutral'}
        >
          <span data-live-widget-eyebrow="true">{activeLiveCard.eyebrow}</span>
          <div data-live-widget-main="true">
            <strong>{activeLiveCard.title}</strong>
            {activeLiveCard.value && <b>{activeLiveCard.value}</b>}
          </div>
          <p>{activeLiveCard.description}</p>
          {typeof activeLiveCard.progressPercent === 'number' && (
            <div data-live-widget-progress="true">
              <i style={{ width: `${activeLiveCard.progressPercent}%` }} />
            </div>
          )}
          {activeLiveCard.meta && <small>{activeLiveCard.meta}</small>}
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
