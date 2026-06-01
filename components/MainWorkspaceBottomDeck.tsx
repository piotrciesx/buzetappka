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
  trashedCount,
  onOpenMonthCalendar,
  onOpenTrash,
}: Props) {
  return (
    <section data-main-workspace-deck="true" aria-label="Dolne widgety workspace">
      <section data-static-widget-area="bottom" data-static-widget="calendar">
        <header data-workspace-panel-header="true">
          <h2>Kalendarz</h2>
          <button type="button" onClick={onOpenMonthCalendar}>
            Otworz
          </button>
        </header>
        <div data-static-widget-body="true">
          <strong>{selectedMonth}</strong>
          <p data-widget-placeholder="true">Placeholder widgetu dolnego.</p>
        </div>
      </section>

      <section data-static-widget-area="bottom" data-static-widget="activity">
        <header data-workspace-panel-header="true">
          <h2>Aktywnosc</h2>
        </header>
        <div data-static-widget-body="true">
          <p data-widget-placeholder="true">Placeholder widgetu dolnego.</p>
        </div>
      </section>

      <section data-static-widget-area="bottom" data-static-widget="trash">
        <header data-workspace-panel-header="true">
          <h2>Kosz</h2>
          <button type="button" onClick={onOpenTrash}>
            Otworz
          </button>
        </header>
        <div data-static-widget-body="true">
          <strong>{trashedCount}</strong>
          <p data-widget-placeholder="true">Placeholder widgetu dolnego.</p>
        </div>
      </section>
    </section>
  )
}
