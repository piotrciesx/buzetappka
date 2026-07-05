'use client'

import { useMemo, useState } from 'react'
import type { Category, PaymentSource, Transaction } from '../../lib/budgetPageTypes'
import type { AmountMismatchDecision, OverpaymentDecision, SkippedInstallmentPolicy } from '../../lib/recurring-payments/actionPolicies'
import type { RecurringOccurrenceRow, RecurringPlanDraft, RecurringPlanRow } from '../../lib/recurring-payments/data'
import type { RecurringPlanNameConflict } from '../../lib/recurring-payments/useRecurringPaymentsData'
import { useRecurringPaymentsData } from '../../lib/recurring-payments/useRecurringPaymentsData'
import { buildRecurringPaymentCardViewModel, buildRecurringPaymentCreatorViewModel, buildRecurringPaymentDetailsViewModel } from '../../lib/recurring-payments/viewModels'
import { PrimaryAction, SecondaryAction } from '../ui/FoundationPrimitives'
import RecurringPaymentPlanForm from './RecurringPaymentPlanForm'

type Props = { profileId: string; categoriesById: Record<string, Category>; categoryOptions: Category[]; paymentSources: PaymentSource[]; transactions: Transaction[]; onAddEntry: (plan: RecurringPlanRow, occurrence: RecurringOccurrenceRow) => void }
type DecisionState = { kind: 'skip'; occurrence: RecurringOccurrenceRow } | { kind: 'amount'; occurrence: RecurringOccurrenceRow; actualAmount: number; overpayment: boolean }

export default function RecurringPaymentsStage2Panel({ profileId, categoriesById, categoryOptions, paymentSources, transactions, onAddEntry }: Props) {
  const data = useRecurringPaymentsData(profileId)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<RecurringPlanDraft | null>(null)
  const [busy, setBusy] = useState(false)
  const [decision, setDecision] = useState<DecisionState | null>(null)
  const [nameConflict, setNameConflict] = useState<RecurringPlanNameConflict | null>(null)
  const [listMode, setListMode] = useState<'current' | 'archived'>('current')
  const [notice, setNotice] = useState('')
  const today = new Date().toISOString().slice(0, 10)
  const selected = data.plans.find((plan) => plan.id === selectedId) || null
  const selectedOccurrences = data.occurrences.filter((occurrence) => occurrence.plan_id === selectedId)
  const visiblePlans = useMemo(() => {
    if (listMode === 'archived') return data.plans.filter((plan) => plan.status === 'archived')
    const current = data.plans.filter((plan) => plan.status !== 'archived')
    return [...current.filter((plan) => plan.status === 'active'), ...current.filter((plan) => plan.status === 'paused')]
  }, [data.plans, listMode])
  const cards = useMemo(() => visiblePlans.map((plan) => buildRecurringPaymentCardViewModel(plan, data.occurrences.filter((occurrence) => occurrence.plan_id === plan.id), today, categoriesById, paymentSources)), [visiblePlans, data.occurrences, today, categoriesById, paymentSources])

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
      setNotice(error instanceof Error ? error.message : 'Nie udało się zapisać planu.')
    } finally {
      setBusy(false)
    }
  }
  const act = async (fn: () => Promise<void>) => { setBusy(true); setNotice(''); try { await fn() } catch (error) { setNotice(error instanceof Error ? error.message : 'Operacja nie powiodła się') } finally { setBusy(false) } }
  const changePlanStatus = (plan: RecurringPlanRow, status: 'active' | 'paused' | 'archived') => act(async () => { await data.setPlanStatus(plan.id, status, today); if (status === 'archived') setSelectedId(null) })
  const restoreConflict = async () => { if (!nameConflict) return; await act(() => data.setPlanStatus(nameConflict.plan.id, 'active', today)); setDraft(null); setNameConflict(null); setSelectedId(nameConflict.plan.id); setListMode('current') }
  const chooseSkip = async (policy: SkippedInstallmentPolicy) => { if (!decision || decision.kind !== 'skip') return; if (policy === 'manual_schedule') { setNotice('Ręczny edytor harmonogramu jest backlogiem; intencja została zachowana w kontrakcie UI.'); setDecision(null); return } await act(async () => { await data.skip(decision.occurrence.id); await data.applyDecision(decision.occurrence.id, { kind: 'skip', decision: policy }) }); setDecision(null) }
  const chooseAmount = async (choice: AmountMismatchDecision | OverpaymentDecision) => { if (!decision || decision.kind !== 'amount') return; if (choice === 'edit_schedule_manually' || choice === 'manual_schedule' || choice === 'shorten_schedule') { setNotice('Ta decyzja prowadzi do ręcznego/zaawansowanego edytora harmonogramu — backlog.'); setDecision(null); return } await act(() => data.applyDecision(decision.occurrence.id, decision.overpayment ? { kind: 'overpayment', decision: choice as OverpaymentDecision, actualAmount: decision.actualAmount } : { kind: 'amount_mismatch', decision: choice as AmountMismatchDecision, actualAmount: decision.actualAmount })); setDecision(null) }
  const link = async (occurrence: RecurringOccurrenceRow, transaction: Transaction) => { await act(() => data.linkTransaction(occurrence.id, transaction.id)); const actual = Number(transaction.amount); if (occurrence.planned_amount !== null && Math.abs(actual - occurrence.planned_amount) >= 0.01) setDecision({ kind: 'amount', occurrence, actualAmount: actual, overpayment: actual > occurrence.planned_amount }) }

  if (data.error) return <div data-ui-empty-state="true">Etap funkcjonalny wymaga zastosowania migracji SQL. {data.error}</div>
  if (draft) return <section data-recurring-stage2="creator"><RecurringPaymentPlanForm draft={draft} setDraft={(next) => { setDraft(next); setNameConflict(null); setNotice('') }} categories={categoryOptions} sources={paymentSources} busy={busy} onSave={() => void save()} onCancel={() => setDraft(null)} />{notice && <p role="status">{notice}</p>}{nameConflict?.kind === 'archived' && <div role="dialog" aria-label="Płatność o tej nazwie jest zakończona"><p>Możesz przywrócić istniejącą płatność albo utworzyć nową mimo to.</p><PrimaryAction disabled={busy} onClick={() => void restoreConflict()}>Przywróć istniejącą</PrimaryAction><SecondaryAction disabled={busy} onClick={() => void save(true)}>Utwórz nową mimo to</SecondaryAction><SecondaryAction onClick={() => { setNameConflict(null); setNotice('') }}>Anuluj</SecondaryAction></div>}</section>
  if (selected) {
    const vm = buildRecurringPaymentDetailsViewModel({ plan: selected, occurrences: selectedOccurrences, categories: categoriesById, sources: paymentSources, transactions, links: data.links, history: data.history, today })
    return <section data-recurring-stage2="details"><SecondaryAction onClick={() => setSelectedId(null)}>Wróć do listy</SecondaryAction><h3>{vm.title}</h3><p>{vm.typeLabel} · {vm.statusLabel} · {vm.categoryLabel} · {vm.paymentSourceLabel}</p><p>{vm.cadenceLabel} · {vm.nextDueLabel} · zaległe: {vm.overdueOccurrences.length}</p><p>Postęp: {vm.progress ? `${vm.progress.completed}/${vm.progress.total} (${vm.progress.percent}%), pozostało rat: ${vm.progress.remaining}, zapłacono: ${vm.progress.paidAmount.toFixed(2)}, pozostało: ${vm.progress.remainingAmount.toFixed(2)}` : 'plan bez końcowej liczby rat'} · wykonane: {vm.statistics.completed} · pominięte: {vm.statistics.skipped} · plan: {vm.statistics.plannedTotal.toFixed(2)} · realnie: {vm.statistics.actualTotal.toFixed(2)}</p><PrimaryAction onClick={() => setDraft(buildRecurringPaymentCreatorViewModel(selected, data.installmentTerms.find((term) => term.plan_id === selected.id), data.loanTerms.find((term) => term.plan_id === selected.id)).draft)}>Edytuj</PrimaryAction>{selected.status === 'active' && <SecondaryAction disabled={busy} onClick={() => void changePlanStatus(selected, 'paused')}>Wstrzymaj</SecondaryAction>}{selected.status === 'paused' && <SecondaryAction disabled={busy} onClick={() => void changePlanStatus(selected, 'active')}>Wznów od dziś</SecondaryAction>}{selected.status !== 'archived' && <SecondaryAction disabled={busy} onClick={() => void changePlanStatus(selected, 'archived')}>Zakończ</SecondaryAction>}{selected.status === 'archived' && <PrimaryAction disabled={busy} onClick={() => void changePlanStatus(selected, 'active')}>Przywróć od dziś</PrimaryAction>}{notice && <p role="status">{notice}</p>}
      {decision?.kind === 'skip' && <div role="dialog"><strong>Co zrobić z pominiętą ratą?</strong><button onClick={() => void chooseSkip('append_at_end')}>Dodaj ratę na koniec</button><button onClick={() => void chooseSkip('keep_schedule')}>Zostaw harmonogram</button><button onClick={() => void chooseSkip('manual_schedule')}>Edytuj ręcznie</button></div>}
      {decision?.kind === 'amount' && <div role="dialog"><strong>{decision.overpayment ? 'Jak rozliczyć nadpłatę?' : 'Kwota różni się od planowanej'}</strong><button onClick={() => void chooseAmount('this_occurrence_only')}>Tylko to wystąpienie</button>{decision.overpayment ? <><button onClick={() => void chooseAmount('shorten_schedule')}>Skróć harmonogram</button><button onClick={() => void chooseAmount('reduce_future_installments')}>Zmniejsz przyszłe raty</button><button onClick={() => void chooseAmount('manual_schedule')}>Edytuj ręcznie</button></> : <><button onClick={() => void chooseAmount('change_from_next_occurrence')}>Zmień od następnego</button><button onClick={() => void chooseAmount('edit_schedule_manually')}>Edytuj harmonogram ręcznie</button></>}</div>}
      <h4>Wystąpienia</h4>{vm.occurrences.length === 0 ? <p>Brak wygenerowanych wystąpień.</p> : vm.occurrences.map((occurrence) => <article key={occurrence.id} data-ui-card="true"><strong>{occurrence.due_date}</strong> · plan: {occurrence.amountLabel} · realnie: {occurrence.actualAmountLabel} · {occurrence.stateLabel}{occurrence.multipleTransactionsNote && <p>{occurrence.multipleTransactionsNote}</p>}{occurrence.linkedTransactions.map((transaction) => <div key={transaction.id}>Wpis: {transaction.description || transaction.date} ({Number(transaction.amount).toFixed(2)})</div>)}{occurrence.scheduleDecisionRequired && <button type="button" onClick={() => setDecision({ kind: 'amount', occurrence, actualAmount: occurrence.actualAmount, overpayment: occurrence.planned_amount !== null && occurrence.actualAmount > occurrence.planned_amount })}>Rozstrzygnij nadpłatę / harmonogram</button>}<div>{selected.status === 'active' && occurrence.status === 'pending' && <><PrimaryAction disabled={busy} onClick={() => onAddEntry(selected, occurrence)}>Dodaj wpis</PrimaryAction><SecondaryAction disabled={busy} onClick={() => void act(() => data.completeWithoutTransaction(occurrence.id))}>Wykonane bez wpisu</SecondaryAction><SecondaryAction disabled={busy} onClick={() => selected.plan_type === 'fixed_payment' ? void act(() => data.skip(occurrence.id)) : setDecision({ kind: 'skip', occurrence })}>Pomiń</SecondaryAction><SecondaryAction disabled={busy} onClick={() => void act(() => data.snooze(occurrence.id, new Date(Date.now() + 86400000).toISOString()))}>Odłóż o dzień</SecondaryAction>{transactions.filter((transaction) => !transaction.is_deleted).slice(0, 10).map((transaction) => <button key={transaction.id} type="button" disabled={busy} onClick={() => void link(occurrence, transaction)}>Powiąż: {transaction.description || transaction.date}</button>)}</>}</div></article>)}<h4>Historia</h4>{vm.history.length === 0 ? <p>Brak zdarzeń.</p> : vm.history.map((item) => <div key={item.id}>{item.created_at}: {item.event_type}</div>)}</section>
  }
  return <section data-recurring-stage2="list"><div><h3>Płatności cykliczne</h3><PrimaryAction onClick={() => setDraft(buildRecurringPaymentCreatorViewModel().draft)}>Dodaj plan</PrimaryAction></div><div role="group" aria-label="Tryb listy"><button type="button" onClick={() => setListMode('current')} aria-pressed={listMode === 'current'}>Aktywne i wstrzymane</button><button type="button" onClick={() => setListMode('archived')} aria-pressed={listMode === 'archived'}>Zakończone</button></div>{data.loading ? <p>Ładowanie…</p> : cards.length === 0 ? <p>Brak planów.</p> : cards.map((card) => <button key={card.id} type="button" data-ui-card="true" onClick={() => setSelectedId(card.id)}><strong>{card.title}</strong><span>{card.typeLabel} · {card.statusLabel} · {card.amountLabel}</span><span>{card.cadenceLabel} · {card.nextDueLabel} · oczekujące: {card.pendingCount} · zaległe: {card.overdueCount}</span>{card.progress && <span>Raty: {card.progress.completed}/{card.progress.total} · pozostało: {card.progress.remaining} · {card.progress.percent}%</span>}</button>)}</section>
}
