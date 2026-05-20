'use client'

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { getMonthCycleDate } from '../lib/recurringTransactions'
import UserAvatar from './UserAvatar'

import type {
  LiveWidgetCard,
  Props,
} from './right-rail/budgetRightRailTypes'

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
  userDisplayName,
  userAvatarKey,
  showRecurring,
  onOpenSearch,
  onOpenNotifications,
  onAddFromReminder,
  onSnoozeRecurring,
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
        progressPercent:
          incomeTotal + expenseTotal > 0
            ? Math.round((incomeTotal / (incomeTotal + expenseTotal)) * 100)
            : undefined,
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
          <div data-live-widget-viz="true" aria-hidden="true">
            {activeLiveCard.kind === 'dashboard' ? (
              <svg viewBox="0 0 120 34" focusable="false">
                <path d="M4 25c14-2 18-17 31-15 12 2 15 14 29 12 16-2 19-18 34-17 8 1 13 6 18 12" />
                <path d="M4 30h112" />
              </svg>
            ) : activeLiveCard.kind === 'alert' ? (
              <div data-live-widget-mini-bars="true">
                {[42, 68, 54, activeLiveCard.progressPercent || 78].map((value, index) => (
                  <i key={index} style={{ height: `${Math.min(Math.max(value, 18), 100)}%` }} />
                ))}
              </div>
            ) : activeLiveCard.kind === 'goal' ? (
              <div data-live-widget-mini-heatmap="true">
                {Array.from({ length: 14 }).map((_, index) => (
                  <i
                    key={index}
                    data-active={index < Math.round(((activeLiveCard.progressPercent || 0) / 100) * 14) ? 'true' : 'false'}
                  />
                ))}
              </div>
            ) : (
              <div data-live-widget-mini-bars="true">
                {[30, 46, 62, 84].map((value, index) => (
                  <i key={index} style={{ height: `${value}%` }} />
                ))}
              </div>
            )}
          </div>
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
