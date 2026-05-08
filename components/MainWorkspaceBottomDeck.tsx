'use client'

type CalendarDay = number | null

type RecentTransactionPreview = {
  id: string
  amount: string
  kind: 'income' | 'expense'
  date: string
  description: string
  categoryLabel: string
}

type Props = {
  selectedMonth: string
  calendarDays: CalendarDay[]
  recentTransactions: RecentTransactionPreview[]
  trashedCount: number
  onOpenMonthCalendar: () => void
  onOpenDay: (dayText: string) => void
  onOpenTrash: () => void
}

export default function MainWorkspaceBottomDeck({
  selectedMonth,
  calendarDays,
  recentTransactions,
  trashedCount,
  onOpenMonthCalendar,
  onOpenDay,
  onOpenTrash,
}: Props) {
  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const currentDay = today.getDate()

  return (
    <section data-main-workspace-deck="true" aria-label="Kalendarz i ostatnie wpisy">
      <div data-calendar-recent-panel="true">
        <section data-workspace-calendar-pane="true" aria-label="Kalendarz miesiąca">
          <div data-workspace-panel-header="true">
            <div>
              <span>Kalendarz</span>
              <strong>{selectedMonth}</strong>
            </div>
            <div data-workspace-calendar-nav="true">
              <button
                type="button"
                onClick={onOpenMonthCalendar}
                aria-label="Otwórz pełny kalendarz miesiąca"
                title="Otwórz kalendarz"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    d="M8 5h11v11"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M19 5 5 19"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div data-mini-calendar="main">
            {['P', 'W', 'Ś', 'C', 'P', 'S', 'N'].map((dayLabel, index) => (
              <small key={`${dayLabel}-${index}`}>{dayLabel}</small>
            ))}
            {calendarDays.map((dayNumber, index) =>
              dayNumber ? (
                <button
                  key={`${selectedMonth}-${dayNumber}`}
                  type="button"
                  data-current-day={selectedMonth === currentMonth && dayNumber === currentDay}
                  onClick={() => onOpenDay(String(dayNumber))}
                >
                  {dayNumber}
                </button>
              ) : (
                <i key={`empty-${index}`} />
              )
            )}
          </div>
        </section>

        <section data-workspace-recent-pane="true" aria-label="Ostatnie wpisy">
          <div data-workspace-panel-header="true">
            <div>
              <span>Ostatnie wpisy</span>
              <strong>{recentTransactions.length} w podglądzie</strong>
            </div>
          </div>
          <div data-workspace-recent-rows="true">
            {recentTransactions.length === 0 ? (
              <small data-workspace-empty-placeholder="true">Brak wpisów w tym zakresie.</small>
            ) : (
              recentTransactions.slice(0, 7).map((transaction) => (
                <div
                  key={transaction.id}
                  data-workspace-recent-row="true"
                  data-transaction-kind={transaction.kind}
                >
                  <b>{transaction.amount} zł</b>
                  <span>{transaction.description || 'Bez opisu'}</span>
                  <small>{transaction.categoryLabel}</small>
                  <time>{transaction.date}</time>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <footer data-workspace-bottom-bar="true">
        <span>{selectedMonth}</span>
        <button
          type="button"
          data-workspace-trash-chip="true"
          onClick={onOpenTrash}
          aria-label={`Kosz, liczba elementów: ${trashedCount}`}
        >
          <span aria-hidden="true">⌫</span>
          <b>{trashedCount}</b>
        </button>
      </footer>
    </section>
  )
}
