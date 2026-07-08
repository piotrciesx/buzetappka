'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import type { Category, Transaction } from '../lib/budgetPageTypes'
import type { BudgetLimitPlanDraft } from '../lib/budget-limits/data'
import type { ReturnTypeOfUseBudgetLimitsData } from '../lib/budget-limits/useBudgetLimitsData'
import type { BudgetLimitCreatorRequest } from '../lib/budget-limits/treeBridge'
import {
  buildBudgetLimitCreatorViewModel,
  buildBudgetLimitDetailsViewModel,
  buildBudgetLimitListViewModel,
  buildBudgetLimitsAttentionViewModel,
  filterAndSortBudgetLimitCards,
  type BudgetLimitCardViewModel,
  type BudgetLimitLevelFilter,
  type BudgetLimitSort,
  type BudgetLimitStatusFilter,
} from '../lib/budget-limits/viewModels'
import CategoryIcon from './CategoryIcon'
import { AuxiliarySummaryItem, AuxiliarySummaryStrip, DangerAction, ManagementSelect, PrimaryAction, SecondaryAction } from './ui/FoundationPrimitives'

type Props = {
  profileId: string
  selectedMonth: string
  categoriesById: Record<string, Category>
  expenseLevel1Id: string | null
  transactions: Transaction[]
  budgetStartDate?: string | null
  getSignedAmountForTransaction: (transaction: Transaction) => number
  data: ReturnTypeOfUseBudgetLimitsData
  creatorRequest: BudgetLimitCreatorRequest | null
  onCreatorRequestHandled: () => void
}

const normalizeThresholds = (text: string) =>
  [...new Set(text
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0 && value < 100))]
    .sort((a, b) => a - b)

const getRoot = (id: string, categories: Record<string, Category>) => {
  let current = categories[id]
  while (current?.parent_id) current = categories[current.parent_id]
  return current?.id || null
}

const usageTone = (status: BudgetLimitCardViewModel['status']) => {
  if (status === 'exceeded') return 'danger'
  if (status === 'warning') return 'warning'
  return 'success'
}

const usageColor = (status: BudgetLimitCardViewModel['status']) => {
  if (status === 'exceeded') return 'var(--ui-financial-expense)'
  if (status === 'warning') return '#d97706'
  return 'var(--ui-financial-income)'
}

export default function BudgetLimitsV1Panel(props: Props) {
  const { creatorRequest, data, onCreatorRequestHandled } = props
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<BudgetLimitPlanDraft | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [listMode, setListMode] = useState<'active' | 'inactive'>('active')
  const [levelFilter, setLevelFilter] = useState<BudgetLimitLevelFilter>('all')
  const [statusFilter, setStatusFilter] = useState<BudgetLimitStatusFilter>('all')
  const [sort, setSort] = useState<BudgetLimitSort>('manual')

  useEffect(() => {
    const openCreate = () => setDraft(buildBudgetLimitCreatorViewModel(props.selectedMonth).draft)
    window.addEventListener('budget-open-budget-limit-create', openCreate)
    return () => window.removeEventListener('budget-open-budget-limit-create', openCreate)
  }, [props.selectedMonth])

  useEffect(() => {
    const request = creatorRequest
    if (!request) return

    const plan = request.existingPlanId
      ? data.plans.find((item) => item.id === request.existingPlanId)
      : undefined
    const version = plan
      ? data.versions
        .filter((item) => item.plan_id === plan.id && item.effective_from <= `${request.effectiveMonth}-01`)
        .at(-1)
      : undefined
    const creator = buildBudgetLimitCreatorViewModel(request.effectiveMonth, plan, version)
    const categoryName = request.categoryId ? props.categoriesById[request.categoryId]?.name : null

    setDraft({
      ...creator.draft,
      name: categoryName || 'Wszystkie wydatki',
      scope_type: request.scopeType,
      category_id: request.categoryId,
      effective_month: request.effectiveMonth,
    })
    setSelectedId(plan?.id ?? null)
    onCreatorRequestHandled()
  }, [creatorRequest, data.plans, data.versions, onCreatorRequestHandled, props.categoriesById])

  const getTechnicalName = (draftValue: BudgetLimitPlanDraft) =>
    draftValue.scope_type === 'global_expenses'
      ? 'Wszystkie wydatki'
      : draftValue.category_id
        ? props.categoriesById[draftValue.category_id]?.name || 'Limit kategorii'
        : 'Limit kategorii'

  const selected = data.plans.find((plan) => plan.id === selectedId) || null
  const selectedVersion = selected
    ? data.versions
      .filter((version) => version.plan_id === selected.id && version.effective_from <= `${props.selectedMonth}-01` && (!version.effective_to || version.effective_to >= `${props.selectedMonth}-01`))
      .at(-1) || data.versions.filter((version) => version.plan_id === selected.id).at(-1) || null
    : null

  const currentItems = useMemo(() => data.plans.flatMap((plan) => {
    const item = data.calculated.find((value) => value.period.plan_id === plan.id && value.period.period_start.slice(0, 7) === props.selectedMonth)
    return item ? [{ ...item, plan }] : []
  }), [data.calculated, data.plans, props.selectedMonth])

  const allCards = useMemo(
    () => buildBudgetLimitListViewModel(currentItems, props.categoriesById),
    [currentItems, props.categoriesById],
  )

  const cards = useMemo(
    () => filterAndSortBudgetLimitCards(
      allCards.filter((card) => card.active === (listMode === 'active')),
      { level: levelFilter, status: statusFilter, categoryId: null },
      sort,
    ),
    [allCards, levelFilter, listMode, sort, statusFilter],
  )

  const attention = useMemo(() => buildBudgetLimitsAttentionViewModel(allCards), [allCards])

  const categoryOptions = Object.values(props.categoriesById).filter(
    (category) => (category.level === 2 || category.level === 3) && getRoot(category.id, props.categoriesById) === props.expenseLevel1Id,
  )

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setNotice('')
    try {
      await action()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Operacja nie powiodła się')
    } finally {
      setBusy(false)
    }
  }

  const renderCard = (card: BudgetLimitCardViewModel, compact = false) => (
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
        <span data-ui-icon-tile="true" data-ui-icon-role="large-record-hero" data-ui-tone={card.colorKey || 'blue'} aria-hidden="true">
          <CategoryIcon iconKey={card.iconKey || 'budget'} size="large" />
        </span>
        <div data-ui-large-record-identity-copy="true">
          <strong data-ui-large-record-title="true">{card.name}</strong>
          <span data-ui-record-meta="true">{card.scopeLabel} · {card.periodLabel}</span>
          <span data-ui-status-pill-group="true">
            <span data-ui-status-pill="true" data-ui-tone="neutral-blue">{card.level}</span>
            <span data-ui-status-pill="true" data-ui-tone={card.active ? 'success' : 'neutral'}>{card.active ? 'Aktywny' : 'Nieaktywny'}</span>
            <span data-ui-status-pill="true" data-ui-tone={usageTone(card.status)}>{card.status === 'exceeded' ? 'Przekroczony' : card.status === 'warning' ? 'Uwaga' : 'W normie'}</span>
          </span>
        </div>
      </div>

      <div data-ui-metric-group="true" data-ui-metric-columns="4">
        <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Limit</span><strong data-ui-metric-card-value="true">{card.limitLabel}</strong></div>
        <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Wydano</span><strong data-ui-metric-card-value="true">{card.spentLabel}</strong></div>
        <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Prognoza</span><strong data-ui-metric-card-value="true">{card.forecastLabel}</strong></div>
        <div data-ui-metric-card="true" data-ui-tone={usageTone(card.status)}><span data-ui-metric-card-label="true">Zostaje / przekroczono</span><strong data-ui-metric-card-value="true">{card.remainingLabel}</strong></div>
      </div>

      <div data-ui-large-record-progress="true" style={{ '--ui-goal-progress': `${card.usageBarPercent}%`, '--ui-goal-progress-color': usageColor(card.status) } as CSSProperties}>
        <div data-ui-large-record-progress-header="true">
          <span>Wykorzystanie w miesiącu</span>
          <strong>{card.usagePercent.toFixed(0)}%</strong>
        </div>
        <span data-ui-large-record-progress-track="true" aria-hidden="true"><span data-ui-large-record-progress-fill="true" /></span>
      </div>

      <div data-ui-action-group="true" data-ui-action-stack="record" onClick={(event) => event.stopPropagation()}>
        <SecondaryAction onClick={() => {
          const plan = data.plans.find((item) => item.id === card.id)
          const version = plan ? data.versions.filter((item) => item.plan_id === plan.id).at(-1) : null
          if (plan && version) setDraft(buildBudgetLimitCreatorViewModel(props.selectedMonth, plan, version).draft)
        }}>Edytuj</SecondaryAction>
        <DangerAction disabled={busy} onClick={() => void run(() => data.setPlanActive(card.id, !card.active, props.selectedMonth))}>{card.active ? 'Wyłącz' : 'Włącz'}</DangerAction>
      </div>
    </article>
  )

  if (data.error) {
    return <div data-ui-empty-state="true">Moduł v1 wymaga migracji <code>budget_limits_stage_2.sql</code>. {data.error}</div>
  }

  if (draft) {
    return (
      <section data-budget-limits-view="creator" data-ui-management-shell="true">
        <div data-ui-management-header="true">
          <div data-ui-management-header-copy="true">
            <h3>{draft.id ? 'Edytuj limit' : 'Dodaj limit'}</h3>
            <p>Ustaw zakres, kwotę i miesiąc obowiązywania limitu.</p>
          </div>
        </div>
        <div data-ui-management-form="true">
          <label>Typ<select value={draft.scope_type} onChange={(event) => setDraft({ ...draft, scope_type: event.target.value as BudgetLimitPlanDraft['scope_type'], category_id: event.target.value === 'global_expenses' ? null : draft.category_id })}><option value="category_l2">Miesięczny L2</option><option value="category_l3">Miesięczny L3</option><option value="global_expenses">Globalny Wydatki</option></select></label>
          {draft.scope_type !== 'global_expenses' && <label>Kategoria<select value={draft.category_id || ''} onChange={(event) => setDraft({ ...draft, category_id: event.target.value || null })}><option value="">Wybierz</option>{categoryOptions.filter((category) => category.level === (draft.scope_type === 'category_l2' ? 2 : 3)).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>}
          <label>Kwota limitu<input type="number" min="0.01" step="0.01" value={draft.limit_amount || ''} onChange={(event) => setDraft({ ...draft, limit_amount: Number(event.target.value) })} /></label>
          <label>Obowiązuje od miesiąca<input type="month" value={draft.effective_month} onChange={(event) => setDraft({ ...draft, effective_month: event.target.value })} /></label>
          <label>Progi alertów (%)<input value={draft.alert_thresholds.join(',')} onChange={(event) => setDraft({ ...draft, alert_thresholds: normalizeThresholds(event.target.value) })} /></label>
          <label><input type="checkbox" checked={draft.forecast_alert_enabled} onChange={(event) => setDraft({ ...draft, forecast_alert_enabled: event.target.checked })} /> Alert ryzyka prognozy</label>
          <label>Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as BudgetLimitPlanDraft['status'] })}><option value="active">Aktywny</option><option value="inactive">Nieaktywny</option></select></label>
          {notice && <p role="status" data-ui-management-inline-notice="true">{notice}</p>}
          <div data-ui-action-group="true">
            <PrimaryAction disabled={busy || draft.limit_amount <= 0 || (draft.scope_type !== 'global_expenses' && !draft.category_id)} onClick={() => void run(async () => { const normalizedDraft = { ...draft, name: getTechnicalName(draft) }; await (draft.id ? data.updatePlan(normalizedDraft) : data.createPlan(normalizedDraft)); setDraft(null) })}>{draft.id ? 'Zapisz wersję' : 'Dodaj limit'}</PrimaryAction>
            <SecondaryAction onClick={() => setDraft(null)}>Anuluj</SecondaryAction>
          </div>
        </div>
      </section>
    )
  }

  const selectedCurrent = selected
    ? data.calculated.find((item) => item.period.plan_id === selected.id && item.period.period_start.slice(0, 7) === props.selectedMonth)
    : null
  const details = selected && selectedVersion && selectedCurrent
    ? buildBudgetLimitDetailsViewModel({
      plan: selected,
      version: selectedVersion,
      current: selectedCurrent,
      history: data.calculated.filter((item) => item.period.plan_id === selected.id),
      versions: data.versions,
      alerts: data.alerts,
      categories: props.categoriesById,
    })
    : null

  const topContent = (
    <>
      <AuxiliarySummaryStrip columns={4}>
        <AuxiliarySummaryItem
          tone="information-blue"
          icon={<CategoryIcon iconKey="budget" size="summary" />}
          label="Aktywne limity"
          value={allCards.filter((card) => card.active).length}
          description="Limity działające"
        />
        <AuxiliarySummaryItem
          tone="information-teal"
          icon={<CategoryIcon iconKey="warning" size="summary" />}
          label="Wymaga uwagi"
          value={attention.exceededCount + attention.warningCount}
          description="Przekroczone lub bliskie limitu"
        />
        <AuxiliarySummaryItem
          tone="information-indigo"
          icon={<CategoryIcon iconKey="investments" size="summary" />}
          label="Prognozowane"
          value={attention.projectedExceededCount}
          description="Przewidywane przekroczenia"
        />
        <AuxiliarySummaryItem
          tone="information-mint"
          icon={<CategoryIcon iconKey="card" size="summary" />}
          label="Średnie wykorzystanie"
          value={`${attention.averageUsagePercent.toFixed(0)}%`}
          description="Wszystkie aktywne limity"
        />
      </AuxiliarySummaryStrip>

      <div data-ui-management-toolbar="true">
        <div data-ui-management-toolbar-group="true">
          <span data-ui-management-toolbar-label="empty">Tryb</span>
          <div data-ui-list-switch="true" data-ui-management-switch="true" role="group" aria-label="Aktywność limitów">
            <button type="button" data-active={listMode === 'active' ? 'true' : undefined} onClick={() => setListMode('active')}>Aktywne</button>
            <button type="button" data-active={listMode === 'inactive' ? 'true' : undefined} onClick={() => setListMode('inactive')}>Nieaktywne</button>
          </div>
        </div>
        <div data-ui-management-toolbar-group="true">
          <span data-ui-management-toolbar-label="true">Poziom</span>
          <ManagementSelect<BudgetLimitLevelFilter>
            value={levelFilter}
            onChange={(value) => setLevelFilter(value)}
            options={[
              { value: 'all', label: 'Wszystkie' },
              { value: 'l1', label: 'L1' },
              { value: 'l2', label: 'L2' },
              { value: 'l3', label: 'L3' },
              { value: 'global', label: 'Globalne' },
            ]}
          />
        </div>
        <div data-ui-management-toolbar-group="true">
          <span data-ui-management-toolbar-label="true">Status</span>
          <ManagementSelect<BudgetLimitStatusFilter>
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: 'all', label: 'Wszystkie' },
              { value: 'safe', label: 'Bezpieczne' },
              { value: 'warning', label: 'Uwaga' },
              { value: 'exceeded', label: 'Przekroczone' },
            ]}
          />
        </div>
        <div data-ui-management-toolbar-group="true">
          <span data-ui-management-toolbar-label="true">Sortowanie</span>
          <ManagementSelect<BudgetLimitSort>
            value={sort}
            onChange={(value) => setSort(value)}
            options={[
              { value: 'manual', label: 'Moja kolejność' },
              { value: 'usage_desc', label: 'Wykorzystanie malejąco' },
              { value: 'usage_asc', label: 'Wykorzystanie rosnąco' },
              { value: 'limit_desc', label: 'Największy limit' },
              { value: 'limit_asc', label: 'Najmniejszy limit' },
              { value: 'spent_desc', label: 'Największe wydatki' },
              { value: 'exceeded_desc', label: 'Najbardziej przekroczone' },
              { value: 'level_asc', label: 'Poziom L1 → L3' },
              { value: 'level_desc', label: 'Poziom L3 → L1' },
              { value: 'name_asc', label: 'Nazwa A-Z' },
            ]}
          />
        </div>
      </div>
      {notice && <p role="status" data-ui-management-inline-notice="true">{notice}</p>}
    </>
  )

  if (details) {
    return (
      <section data-budget-limits-view="details" data-ui-management-shell="true" data-ui-foundation-only="true" data-ui-utility-modal-size="xl">
        {topContent}
        <div data-ui-management-split="true">
          <div data-ui-management-split-list="true">
            {cards.map((card) => renderCard(card, true))}
          </div>
          <section data-ui-management-details-panel="true">
            <header data-ui-management-details-header="true">
              <div data-ui-large-record-identity="true">
                <span data-ui-icon-tile="true" data-ui-icon-role="large-record-hero" data-ui-tone={details.card.colorKey || 'blue'} aria-hidden="true"><CategoryIcon iconKey={details.card.iconKey || 'budget'} size="large" /></span>
                <div data-ui-large-record-identity-copy="true">
                  <strong data-ui-large-record-title="true">{details.card.name}</strong>
                  <span data-ui-record-meta="true">{details.card.scopeLabel} · {details.card.periodLabel}</span>
                  <span data-ui-status-pill="true" data-ui-tone={usageTone(details.card.status)}>{details.card.status === 'exceeded' ? 'Przekroczony' : details.card.status === 'warning' ? 'Uwaga' : 'W normie'}</span>
                </div>
              </div>
              <button type="button" data-ui-management-details-close="true" aria-label="Zamknij szczegóły" onClick={() => setSelectedId(null)}><CategoryIcon iconKey="close" size="small" /></button>
            </header>

            <div data-ui-management-details-metrics="true">
              <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Limit</span><strong data-ui-metric-card-value="true">{details.card.limitLabel}</strong></div>
              <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Wydano</span><strong data-ui-metric-card-value="true">{details.card.spentLabel}</strong></div>
              <div data-ui-metric-card="true"><span data-ui-metric-card-label="true">Zostaje</span><strong data-ui-metric-card-value="true">{details.card.remainingLabel}</strong></div>
            </div>

            <section data-ui-management-details-section="true">
              <h4>Historia miesiąc po miesiącu</h4>
              {details.history.slice(0, 8).map((entry) => (
                <div key={entry.periodId} data-ui-detail-row="true">
                  <strong>{entry.month}</strong>
                  <span>limit {entry.limitLabel}</span>
                  <span>wydano {entry.spentLabel}</span>
                  <span>{entry.usagePercent.toFixed(0)}%</span>
                </div>
              ))}
            </section>

            {details.childBreakdown.length > 0 && (
              <section data-ui-management-details-section="true">
                <h4>Rozbicie na podkategorie</h4>
                {details.childBreakdown.map((child) => (
                  <div key={child.categoryId} data-ui-detail-row="true">
                    <span>{child.name}</span>
                    <strong>{child.spentLabel}</strong>
                    <span>{child.usageSharePercent.toFixed(0)}%</span>
                  </div>
                ))}
              </section>
            )}

            <section data-ui-management-details-section="true">
              <h4>Transakcje limitu</h4>
              {details.transactions.length === 0 ? <p>Brak transakcji.</p> : details.transactions.slice(0, 8).map((transaction) => (
                <div key={transaction.id} data-ui-transaction-row="true" data-ui-tone={Number(transaction.amount) >= 0 ? 'success' : 'danger'}>
                  <span>{transaction.date} · {transaction.description || 'Bez opisu'}</span>
                  <strong>{Number(transaction.amount).toFixed(2)} zł</strong>
                </div>
              ))}
            </section>

            <footer data-ui-action-group="true" data-ui-details-action-bar="true">
              <SecondaryAction onClick={() => setDraft(buildBudgetLimitCreatorViewModel(props.selectedMonth, selected || undefined, selectedVersion || undefined).draft)}>Edytuj</SecondaryAction>
              {selected?.status === 'active'
                ? <DangerAction disabled={busy} onClick={() => void run(() => data.setPlanActive(selected.id, false, props.selectedMonth))}>Wyłącz limit</DangerAction>
                : selected && <PrimaryAction disabled={busy} onClick={() => void run(() => data.setPlanActive(selected.id, true, props.selectedMonth, selectedVersion?.limit_amount || 0))}>Włącz limit</PrimaryAction>}
            </footer>
          </section>
        </div>
      </section>
    )
  }

  return (
    <section data-budget-limits-view="list" data-ui-management-shell="true" data-ui-foundation-only="true" data-ui-utility-modal-size="xl">
      {topContent}
      <div data-ui-management-list="true" data-ui-large-record-list="true">
        {data.loading ? <p>Ładowanie…</p> : cards.length === 0 ? <p data-ui-empty-block="true">Brak limitów w tym miesiącu.</p> : cards.map((card) => renderCard(card))}
      </div>
      <footer data-ui-management-footer="true">Łącznie: {cards.length} limitów</footer>
    </section>
  )
}
