'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import type { Category, PaymentSource, Transaction } from '../../lib/budgetPageTypes'
import type { AmountMismatchDecision, OverpaymentDecision, SkippedInstallmentPolicy } from '../../lib/recurring-payments/actionPolicies'
import type { RecurringOccurrenceRow, RecurringPlanDraft, RecurringPlanRow } from '../../lib/recurring-payments/data'
import type { RecurringPlanNameConflict } from '../../lib/recurring-payments/useRecurringPaymentsData'
import { useRecurringPaymentsData } from '../../lib/recurring-payments/useRecurringPaymentsData'
import { buildRecurringPaymentCardViewModel, buildRecurringPaymentCreatorViewModel, buildRecurringPaymentDetailsViewModel } from '../../lib/recurring-payments/viewModels'
import CategoryIcon from '../CategoryIcon'
import { AuxiliarySummaryItem, AuxiliarySummaryStrip, DangerAction, ManagementSelect, PrimaryAction, SecondaryAction } from '../ui/FoundationPrimitives'
import RecurringPaymentPlanForm from './RecurringPaymentPlanForm'

type Props = {
  profileId: string
  categoriesById: Record<string, Category>
  categoryOptions: Category[]
  paymentSources: PaymentSource[]
  transactions: Transaction[]
  onAddEntry: (plan: RecurringPlanRow, occurrence: RecurringOccurrenceRow) => void
}

type DecisionState =
  | { kind: 'skip'; occurrence: RecurringOccurrenceRow }
  | { kind: 'amount'; occurrence: RecurringOccurrenceRow; actualAmount: number; overpayment: boolean }

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value)

const statusTone = (status: string) => {
  if (status === 'active') return 'success'
  if (status === 'paused') return 'warning'
  if (status === 'archived') return 'neutral'
  return 'neutral-blue'
}

export default function RecurringPaymentsStage2Panel({
  profileId,
  categoriesById,
  categoryOptions,
  paymentSources,
  transactions,
  onAddEntry,
}: Props) {
  const data = useRecurringPaymentsData(profileId)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<RecurringPlanDraft | null>(null)
  const [busy, setBusy] = useState(false)
  const [decision, setDecision] = useState<DecisionState | null>(null)
  const [nameConflict, setNameConflict] = useState<RecurringPlanNameConflict | null>(null)
  const [listMode, setListMode] = useState<'current' | 'archived'>('current')
  const [typeFilter, setTypeFilter] = useState<'all' | 'fixed_payment' | 'installment_purchase' | 'loan'>('all')
  const [sortMode, setSortMode] = useState<'operational' | 'name' | 'amount_desc' | 'date'>('operational')
  const [notice, setNotice] = useState('')
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    const openCreate = () => setDraft(buildRecurringPaymentCreatorViewModel().draft)
    window.addEventListener('budget-open-recurring-payment-create', openCreate)
    return () => window.removeEventListener('budget-open-recurring-payment-create', openCreate)
  }, [])

  const selected = data.plans.find((plan) => plan.id === selectedId) || null
  const selectedOccurrences = data.occurrences.filter((occurrence) => occurrence.plan_id === selectedId)

  const visiblePlans = useMemo(() => {
    const byMode = listMode === 'archived'
      ? data.plans.filter((plan) => plan.status === 'archived')
      : [...data.plans.filter((plan) => plan.status === 'active'), ...data.plans.filter((plan) => plan.status === 'paused')]

    const byType = typeFilter === 'all'
      ? byMode
      : byMode.filter((plan) => plan.plan_type === typeFilter)

    return byType.slice().sort((left, right) => {
      if (listMode === 'current' && left.status !== right.status) {
        if (left.status === 'paused') return 1
        if (right.status === 'paused') return -1
      }
      if (sortMode === 'name') return left.name.localeCompare(right.name, 'pl')
      if (sortMode === 'amount_desc') return Number(right.amount || 0) - Number(left.amount || 0)
      if (sortMode === 'date') return String(left.start_date || '').localeCompare(String(right.start_date || ''))
      return 0
    })
  }, [data.plans, listMode, sortMode, typeFilter])

  const cards = useMemo(
    () => visiblePlans.map((plan) => buildRecurringPaymentCardViewModel(
      plan,
      data.occurrences.filter((occurrence) => occurrence.plan_id === plan.id),
      today,
      categoriesById,
      paymentSources,
    )),
    [categoriesById, data.occurrences, paymentSources, today, visiblePlans],
  )

  const attention = useMemo(() => {
    const current = data.plans.filter((plan) => plan.status === 'active')
    const pending = data.occurrences.filter((occurrence) => current.some((plan) => plan.id === occurrence.plan_id) && occurrence.status === 'pending')
    return {
      overdue: pending.filter((occurrence) => occurrence.due_date < today).length,
      today: pending.filter((occurrence) => occurrence.due_date === today).length,
      upcoming: pending.filter((occurrence) => occurrence.due_date > today).length,
      paused: data.plans.filter((plan) => plan.status === 'paused').length,
    }
  }, [data.occurrences, data.plans, today])

  const save = async (allowArchivedDuplicate = false) => {
    if (!draft || !draft.name.trim() || !draft.category_id) return
    const conflict = data.findNameConflict(draft.name, draft.id)
    if (conflict?.kind === 'blocking') {
      setNameConflict(conflict)
      setNotice('Taka płatność już istnieje. Edytuj ją, wznów albo zakończ, zamiast tworzyć drugą.')
      return
    }
    if (conflict?.kind === 'archived' && !allowArchivedDuplicate) {
      setNameConflict(conflict)
      setNotice('Istnieje zakończona płatność o tej nazwie.')
      return
    }
    setBusy(true)
    setNotice('')
    setNameConflict(null)
    try {
      await (draft.id ? data.updatePlan(draft) : data.createPlan(draft))
      setDraft(null)
    } catch (error) {
      console.error('[recurring-payments] Zapis planu zakończył się błędem.', error)
      setNotice(error instanceof Error ? error.message : 'Nie udało się zapisać planu.')
    } finally {
      setBusy(false)
    }
  }

  const act = async (fn: () => Promise<void>) => {
    setBusy(true)
    setNotice('')
    try {
      await fn()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Operacja nie powiodła się')
    } finally {
      setBusy(false)
    }
  }

  const changePlanStatus = (plan: RecurringPlanRow, status: 'active' | 'paused' | 'archived') => act(async () => {
    await data.setPlanStatus(plan.id, status, today)
    if (status === 'archived') setSelectedId(null)
  })

  const restoreConflict = async () => {
    if (!nameConflict) return
    await act(() => data.setPlanStatus(nameConflict.plan.id, 'active', today))
    setDraft(null)
    setNameConflict(null)
    setSelectedId(nameConflict.plan.id)
    setListMode('current')
  }

  const chooseSkip = async (policy: SkippedInstallmentPolicy) => {
    if (!decision || decision.kind !== 'skip') return
    if (policy === 'manual_schedule') {
      setNotice('Ręczny edytor harmonogramu jest backlogiem; intencja została zachowana w kontrakcie UI.')
      setDecision(null)
      return
    }
    await act(async () => {
      await data.skip(decision.occurrence.id)
      await data.applyDecision(decision.occurrence.id, { kind: 'skip', decision: policy })
    })
    setDecision(null)
  }

  const chooseAmount = async (choice: AmountMismatchDecision | OverpaymentDecision) => {
    if (!decision || decision.kind !== 'amount') return
    if (choice === 'edit_schedule_manually' || choice === 'manual_schedule' || choice === 'shorten_schedule') {
      setNotice('Ta decyzja prowadzi do ręcznego/zaawansowanego edytora harmonogramu — backlog.')
      setDecision(null)
      return
    }
    await act(() => data.applyDecision(
      decision.occurrence.id,
      decision.overpayment
        ? { kind: 'overpayment', decision: choice as OverpaymentDecision, actualAmount: decision.actualAmount }
        : { kind: 'amount_mismatch', decision: choice as AmountMismatchDecision, actualAmount: decision.actualAmount },
    ))
    setDecision(null)
  }

  const link = async (occurrence: RecurringOccurrenceRow, transaction: Transaction) => {
    await act(() => data.linkTransaction(occurrence.id, transaction.id))
    const actual = Number(transaction.amount)
    if (occurrence.planned_amount !== null && Math.abs(actual - occurrence.planned_amount) >= 0.01) {
      setDecision({ kind: 'amount', occurrence, actualAmount: actual, overpayment: actual > occurrence.planned_amount })
    }
  }

  const renderCard = (card: ReturnType<typeof buildRecurringPaymentCardViewModel>, compact = false) => (
    <article
      key={card.id}
      data-ui-large-record="true"
      data-ui-record-card="true"
      data-ui-record-interactive="true"
      data-ui-record-compact={compact ? 'true' : undefined}
      data-ui-selected={selectedId === card.id ? 'true' : undefined}
      role="button"
      tabIndex={0}
      onClick={() => setSelectedId(card.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setSelectedId(card.id)
        }
      }}
    >
      <div data-ui-large-record-identity="true">
        <span data-ui-icon-tile="true" data-ui-icon-role="large-record-hero" data-ui-tone="blue" aria-hidden="true">
          <CategoryIcon iconKey={card.progress ? 'bank' : 'calendar'} size="large" />
        </span>
        <div data-ui-large-record-identity-copy="true">
          <strong data-ui-large-record-title="true">{card.title}</strong>
          <span data-ui-record-meta="true">{card.typeLabel} · {card.categoryLabel}</span>
          <span data-ui-status-pill="true" data-ui-pill-shape="soft-rect" data-ui-tone={statusTone(card.planStatus)}>{card.statusLabel}</span>
        </div>
      </div>

      <div data-ui-metric-group="true" data-ui-metric-columns="4">
        <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Kwota</span><strong data-ui-metric-card-value="true">{card.amountLabel}</strong></div>
        <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Termin</span><strong data-ui-metric-card-value="true">{card.nextDueLabel}</strong></div>
        <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Cykl</span><strong data-ui-metric-card-value="true">{card.cadenceLabel}</strong></div>
        <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Status</span><strong data-ui-metric-card-value="true">{card.currentOccurrenceStatus || '—'}</strong></div>
      </div>

      {card.progress && (
        <div data-ui-large-record-progress="true" style={{ '--ui-goal-progress': `${card.progress.percent}%`, '--ui-goal-progress-color': 'var(--ui-color-primary-blue)' } as CSSProperties}>
          <div data-ui-large-record-progress-header="true">
            <span>Pozostało {card.progress.remaining} rat · {formatCurrency(card.progress.remainingAmount)}</span>
            <strong>{card.progress.percent}%</strong>
          </div>
          <span data-ui-large-record-progress-track="true" aria-hidden="true"><span data-ui-large-record-progress-fill="true" /></span>
        </div>
      )}

      <div data-ui-action-group="true" data-ui-action-stack="record" onClick={(event) => event.stopPropagation()}>
        <SecondaryAction onClick={() => {
          const plan = data.plans.find((item) => item.id === card.id)
          if (!plan) return
          setDraft(buildRecurringPaymentCreatorViewModel(
            plan,
            data.installmentTerms.find((term) => term.plan_id === plan.id),
            data.loanTerms.find((term) => term.plan_id === plan.id),
          ).draft)
        }}>Edytuj</SecondaryAction>
        <SecondaryAction intent={listMode === 'archived' ? 'restore' : 'warning'} disabled={busy} onClick={() => {
          const plan = data.plans.find((item) => item.id === card.id)
          if (plan) void changePlanStatus(plan, listMode === 'archived' ? 'active' : 'archived')
        }}>{listMode === 'archived' ? 'Przywróć' : 'Zakończ'}</SecondaryAction>
      </div>
    </article>
  )

  if (data.error) return <div data-ui-empty-state="true">Etap funkcjonalny wymaga zastosowania migracji SQL. {data.error}</div>

  if (draft) {
    return (
      <section data-recurring-stage2="creator" data-ui-management-shell="true">
        <RecurringPaymentPlanForm
          draft={draft}
          setDraft={(next) => { setDraft(next); setNameConflict(null); setNotice('') }}
          categories={categoryOptions}
          sources={paymentSources}
          busy={busy}
          onSave={() => void save()}
          onCancel={() => setDraft(null)}
        />
        {notice && <p role="status" data-ui-management-inline-notice="true">{notice}</p>}
        {nameConflict?.kind === 'archived' && (
          <div role="dialog" aria-label="Płatność o tej nazwie jest zakończona" data-ui-management-soft-warning="true">
            <p>Możesz przywrócić istniejącą płatność albo utworzyć nową mimo to.</p>
            <PrimaryAction disabled={busy} onClick={() => void restoreConflict()}>Przywróć istniejącą</PrimaryAction>
            <SecondaryAction disabled={busy} onClick={() => void save(true)}>Utwórz nową mimo to</SecondaryAction>
            <DangerAction intent="danger" onClick={() => { setNameConflict(null); setNotice('') }}>Anuluj</DangerAction>
          </div>
        )}
      </section>
    )
  }

  const selectedVm = selected
    ? buildRecurringPaymentDetailsViewModel({
      plan: selected,
      occurrences: selectedOccurrences,
      categories: categoriesById,
      sources: paymentSources,
      transactions,
      links: data.links,
      history: data.history,
      today,
    })
    : null

  const listContent = (
    <>
      <AuxiliarySummaryStrip columns={4}>
        <AuxiliarySummaryItem
          tone="information-teal"
          icon={<CategoryIcon iconKey="warning" size="summary" />}
          label="Wymaga reakcji"
          value={attention.overdue}
          description="zaległe płatności"
        />
        <AuxiliarySummaryItem
          tone="information-blue"
          icon={<CategoryIcon iconKey="calendar" size="summary" />}
          label="Dzisiaj"
          value={attention.today}
          description="płatności na dziś"
        />
        <AuxiliarySummaryItem
          tone="information-indigo"
          icon={<CategoryIcon iconKey="calendar" size="summary" />}
          label="Nadchodzące"
          value={attention.upcoming}
          description="w najbliższym czasie"
        />
        <AuxiliarySummaryItem
          tone="information-steel"
          icon={<CategoryIcon iconKey="info" size="summary" />}
          label="Wstrzymane"
          value={attention.paused}
          description="płatności w pauzie"
        />
      </AuxiliarySummaryStrip>

      <div data-ui-management-toolbar="true">
        <div data-ui-management-toolbar-group="true">
          <span data-ui-management-toolbar-label="empty">Tryb</span>
          <div data-ui-list-switch="true" data-ui-management-switch="true" role="group" aria-label="Tryb listy">
            <button type="button" data-active={listMode === 'current' ? 'true' : undefined} onClick={() => setListMode('current')}>Bieżące</button>
            <button type="button" data-active={listMode === 'archived' ? 'true' : undefined} onClick={() => setListMode('archived')}>Zakończone</button>
          </div>
        </div>
        <div data-ui-management-toolbar-group="true">
          <span data-ui-management-toolbar-label="true">Typ płatności</span>
          <ManagementSelect<'all' | 'fixed_payment' | 'installment_purchase' | 'loan'>
            value={typeFilter}
            onChange={(value) => setTypeFilter(value)}
            options={[
              { value: 'all', label: 'Wszystkie typy' },
              { value: 'fixed_payment', label: 'Stałe' },
              { value: 'installment_purchase', label: 'Raty' },
              { value: 'loan', label: 'Kredyty / pożyczki' },
            ]}
          />
        </div>
        <div data-ui-management-toolbar-group="true">
          <span data-ui-management-toolbar-label="true">Sortowanie</span>
          <ManagementSelect<'operational' | 'name' | 'amount_desc' | 'date'>
            value={sortMode}
            onChange={(value) => setSortMode(value)}
            options={[
              { value: 'operational', label: 'Domyślne' },
              { value: 'date', label: 'Najbliższy termin' },
              { value: 'amount_desc', label: 'Największa kwota' },
              { value: 'name', label: 'Nazwa A-Z' },
            ]}
          />
        </div>
      </div>
    </>
  )

  if (selected && selectedVm) {
    return (
      <section data-recurring-stage2="details" data-ui-management-shell="true" data-ui-foundation-only="true" data-ui-utility-modal-size="xl">
        {listContent}
        <div data-ui-management-split="true">
          <div data-ui-management-split-list="true">
            {cards.length === 0 ? <p data-ui-empty-block="true">Brak planów.</p> : cards.map((card) => renderCard(card, true))}
          </div>
          <section data-ui-management-details-panel="true">
            <header data-ui-management-details-header="true">
              <div data-ui-large-record-identity="true">
                <span data-ui-icon-tile="true" data-ui-icon-role="large-record-hero" data-ui-tone="blue" aria-hidden="true"><CategoryIcon iconKey={selectedVm.progress ? 'bank' : 'calendar'} size="large" /></span>
                <div data-ui-large-record-identity-copy="true">
                  <strong data-ui-large-record-title="true">{selectedVm.title}</strong>
                  <span data-ui-record-meta="true">{selectedVm.typeLabel} · {selectedVm.categoryLabel} · {selectedVm.paymentSourceLabel}</span>
                  <span data-ui-status-pill="true" data-ui-tone={statusTone(selectedVm.planStatus)}>{selectedVm.statusLabel}</span>
                </div>
              </div>
              <button type="button" data-ui-management-details-close="true" aria-label="Zamknij szczegóły" onClick={() => setSelectedId(null)}><CategoryIcon iconKey="close" size="small" /></button>
            </header>

            <div data-ui-management-details-metrics="true">
              <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Kwota</span><strong data-ui-metric-card-value="true">{selectedVm.amountLabel}</strong></div>
              <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Termin</span><strong data-ui-metric-card-value="true">{selectedVm.nextDueLabel}</strong></div>
              <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Zaległe</span><strong data-ui-metric-card-value="true">{selectedVm.overdueOccurrences.length}</strong></div>
            </div>

            <section data-ui-management-details-section="true">
              <h4>Harmonogram</h4>
              {selectedVm.occurrences.length === 0 ? <p>Brak wygenerowanych wystąpień.</p> : selectedVm.occurrences.slice(0, 8).map((occurrence) => (
                <article key={occurrence.id} data-ui-detail-row="true">
                  <strong>{occurrence.due_date}</strong>
                  <span>{occurrence.stateLabel}</span>
                  <span>{occurrence.amountLabel}</span>
                  {occurrence.multipleTransactionsNote && <small>{occurrence.multipleTransactionsNote}</small>}
                  {selected.status === 'active' && occurrence.status === 'pending' && (
                    <div data-ui-action-group="true">
                      <PrimaryAction disabled={busy} onClick={() => onAddEntry(selected, occurrence)}>Dodaj wpis</PrimaryAction>
                      <SecondaryAction disabled={busy} onClick={() => void act(() => data.completeWithoutTransaction(occurrence.id))}>Wykonane bez wpisu</SecondaryAction>
                      <SecondaryAction intent="warning" disabled={busy} onClick={() => selected.plan_type === 'fixed_payment' ? void act(() => data.skip(occurrence.id)) : setDecision({ kind: 'skip', occurrence })}>Pomiń</SecondaryAction>
                      <SecondaryAction intent="warning" disabled={busy} onClick={() => void act(() => data.snooze(occurrence.id, new Date(Date.now() + 86400000).toISOString()))}>Odłóż</SecondaryAction>
                    </div>
                  )}
                  {occurrence.scheduleDecisionRequired && <button type="button" data-ui-action="secondary" data-ui-action-intent="warning" onClick={() => setDecision({ kind: 'amount', occurrence, actualAmount: occurrence.actualAmount, overpayment: occurrence.planned_amount !== null && occurrence.actualAmount > occurrence.planned_amount })}>Rozstrzygnij nadpłatę / harmonogram</button>}
                  {occurrence.linkedTransactions.map((transaction) => <small key={transaction.id}>Wpis: {transaction.description || transaction.date} ({Number(transaction.amount).toFixed(2)})</small>)}
                </article>
              ))}
            </section>

            <section data-ui-management-details-section="true">
              <h4>Powiązane wpisy</h4>
              {selectedVm.occurrences.flatMap((occurrence) => occurrence.linkedTransactions).slice(0, 6).map((transaction) => (
                <div key={transaction.id} data-ui-transaction-row="true" data-ui-tone={Number(transaction.amount) >= 0 ? 'success' : 'danger'}>
                  <span>{transaction.description || transaction.date}</span>
                  <strong>{formatCurrency(Number(transaction.amount))}</strong>
                </div>
              ))}
            </section>

            <footer data-ui-action-group="true" data-ui-details-action-bar="true">
              <SecondaryAction onClick={() => setDraft(buildRecurringPaymentCreatorViewModel(selected, data.installmentTerms.find((term) => term.plan_id === selected.id), data.loanTerms.find((term) => term.plan_id === selected.id)).draft)}>Edytuj</SecondaryAction>
              {selected.status === 'active' && <SecondaryAction intent="warning" disabled={busy} onClick={() => void changePlanStatus(selected, 'paused')}>Wstrzymaj</SecondaryAction>}
              {selected.status === 'paused' && <SecondaryAction intent="restore" disabled={busy} onClick={() => void changePlanStatus(selected, 'active')}>Wznów od dziś</SecondaryAction>}
              {selected.status !== 'archived' && <SecondaryAction intent="warning" disabled={busy} onClick={() => void changePlanStatus(selected, 'archived')}>Zakończ</SecondaryAction>}
              {selected.status === 'archived' && <SecondaryAction intent="restore" disabled={busy} onClick={() => void changePlanStatus(selected, 'active')}>Przywróć od dziś</SecondaryAction>}
            </footer>
            {notice && <p role="status" data-ui-management-inline-notice="true">{notice}</p>}
          </section>
        </div>
        {decision?.kind === 'skip' && (
          <div role="dialog" data-ui-management-soft-warning="true">
            <strong>Co zrobić z pominiętą ratą?</strong>
            <button type="button" data-ui-action="secondary" data-ui-action-intent="neutral" onClick={() => void chooseSkip('append_at_end')}>Dodaj ratę na koniec</button>
            <button type="button" data-ui-action="secondary" data-ui-action-intent="neutral" onClick={() => void chooseSkip('keep_schedule')}>Zostaw harmonogram</button>
            <button type="button" data-ui-action="secondary" data-ui-action-intent="warning" onClick={() => void chooseSkip('manual_schedule')}>Edytuj ręcznie</button>
          </div>
        )}
        {decision?.kind === 'amount' && (
          <div role="dialog" data-ui-management-soft-warning="true">
            <strong>{decision.overpayment ? 'Jak rozliczyć nadpłatę?' : 'Kwota różni się od planowanej'}</strong>
            <button type="button" data-ui-action="secondary" data-ui-action-intent="neutral" onClick={() => void chooseAmount('this_occurrence_only')}>Tylko to wystąpienie</button>
            {decision.overpayment ? (
              <>
                <button type="button" data-ui-action="secondary" data-ui-action-intent="warning" onClick={() => void chooseAmount('shorten_schedule')}>Skróć harmonogram</button>
                <button type="button" data-ui-action="secondary" data-ui-action-intent="neutral" onClick={() => void chooseAmount('reduce_future_installments')}>Zmniejsz przyszłe raty</button>
                <button type="button" data-ui-action="secondary" data-ui-action-intent="warning" onClick={() => void chooseAmount('manual_schedule')}>Edytuj ręcznie</button>
              </>
            ) : (
              <>
                <button onClick={() => void chooseAmount('change_from_next_occurrence')}>Zmień od następnego</button>
                <button onClick={() => void chooseAmount('edit_schedule_manually')}>Edytuj harmonogram ręcznie</button>
              </>
            )}
          </div>
        )}
      </section>
    )
  }

  return (
    <section data-recurring-stage2="list" data-ui-management-shell="true" data-ui-foundation-only="true" data-ui-utility-modal-size="xl">
      {listContent}
      {notice && <p role="status" data-ui-management-inline-notice="true">{notice}</p>}
      <div data-ui-management-list="true" data-ui-large-record-list="true">
        {data.loading ? <p>Ładowanie…</p> : cards.length === 0 ? <p data-ui-empty-block="true">Brak planów.</p> : cards.map((card) => renderCard(card))}
      </div>
      <footer data-ui-management-footer="true">Łącznie: {cards.length} płatności</footer>
    </section>
  )
}
