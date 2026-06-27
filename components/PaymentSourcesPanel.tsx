'use client'

import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PaymentSource, PaymentSourceType } from '../lib/budgetPageTypes'
import {
  UI_COLOR_OPTIONS,
  getUiColor,
  type UiColorKey,
  type UiIconKey,
} from '../lib/userAppearance'
import {
  getPaymentSourceColorTone,
  getPaymentSourceIconKey,
  PaymentSourceListKind,
} from '../lib/paymentSources'
import CategoryIcon from './CategoryIcon'
import FoundationIconPicker from './ui/FoundationIconPicker'
import { EmptyState, StatusBox } from './utility-panels/utilityPanelPrimitives'

type PaymentSourceStats = {
  sourceId: string
  incomeTotal: number
  expenseTotal: number
  transactionCount: number
}

type PaymentSourceTotals = {
  incomeTotal: number
  expenseTotal: number
  transactionCount: number
}

type PaymentSourceSettings = {
  defaultIncomePaymentSourceId: string | null
  defaultExpensePaymentSourceId: string | null
  showIncomePaymentSource: boolean
  showExpensePaymentSource: boolean
}

type Props = {
  paymentSources: PaymentSource[]
  paymentSourceStats: PaymentSourceStats[]
  paymentSourceSettings: PaymentSourceSettings
  onSave: (input: {
    id?: string
    allowArchivedDuplicateName?: boolean
    name: string
    type: PaymentSourceType
    emoji: string
    color: string
    isIncomeSource: boolean
    isExpenseSource: boolean
  }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onRestore: (id: string) => Promise<void>
  onSetDefault: (kind: PaymentSourceListKind, id: string | null) => Promise<void>
  onSetFieldVisibility: (kind: PaymentSourceListKind, isVisible: boolean) => Promise<void>
  onCopyList: (sourceKind: PaymentSourceListKind, targetKind: PaymentSourceListKind) => Promise<void>
  openCreateRequest?: number
  styles: Record<string, CSSProperties>
}

type PaymentSourceDraft = {
  id?: string
  name: string
  type: PaymentSourceType
  icon: UiIconKey
  color: UiColorKey
  isIncomeSource: boolean
  isExpenseSource: boolean
}

const DEFAULT_DRAFT: PaymentSourceDraft = {
  name: '',
  type: 'card',
  icon: 'card',
  color: 'blue',
  isIncomeSource: true,
  isExpenseSource: true,
}

const SUGGESTED_PAYMENT_SOURCE_ICONS: UiIconKey[] = [
  'card',
  'cash',
  'bank',
  'savings',
  'gift',
  'more',
]

const inferPaymentSourceTypeFromIcon = (icon: UiIconKey): PaymentSourceType => {
  if (icon === 'cash') {
    return 'cash'
  }

  if (icon === 'card') {
    return 'card'
  }

  if (['bank', 'savings', 'investments'].includes(icon)) {
    return 'account'
  }

  return 'other'
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 2,
  }).format(value)

const formatCompactCurrency = (value: number) => {
  const absoluteValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  const formatDecimal = (input: number) =>
    new Intl.NumberFormat('pl-PL', {
      maximumFractionDigits: input >= 10 ? 0 : 1,
      minimumFractionDigits: 0,
    }).format(input)

  if (absoluteValue >= 1_000_000_000) {
    return `${sign}${formatDecimal(absoluteValue / 1_000_000_000)} mld zł`
  }

  if (absoluteValue >= 1_000_000) {
    return `${sign}${formatDecimal(absoluteValue / 1_000_000)} mln zł`
  }

  if (absoluteValue >= 100_000) {
    return `${sign}${formatDecimal(absoluteValue / 1_000)} tys. zł`
  }

  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 2,
  }).format(value)
}


const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat('pl-PL', {
    notation: Math.abs(value) >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: Math.abs(value) >= 10_000 ? 1 : 0,
  }).format(value)

const calculateShare = (value: number, total: number) => {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round((Math.abs(value) / Math.abs(total)) * 100)))
}

const buildPaymentSourceTotals = (
  sources: PaymentSource[],
  statsById: Record<string, PaymentSourceStats>
): PaymentSourceTotals => {
  return sources.reduce<PaymentSourceTotals>(
    (totals, source) => {
      const stats = statsById[source.id]

      if (!stats) {
        return totals
      }

      return {
        incomeTotal: totals.incomeTotal + Math.max(0, stats.incomeTotal),
        expenseTotal: totals.expenseTotal + Math.max(0, stats.expenseTotal),
        transactionCount: totals.transactionCount + Math.max(0, stats.transactionCount),
      }
    },
    {
      incomeTotal: 0,
      expenseTotal: 0,
      transactionCount: 0,
    }
  )
}

const normalizeName = (value: string) => value.trim().toLocaleLowerCase('pl-PL')

const HelpHint = ({ label }: { label: string }) => (
  <span data-ui-help="true" tabIndex={0} aria-label={label} data-tooltip={label} />
)


export default function PaymentSourcesPanel({
  paymentSources,
  paymentSourceStats,
  paymentSourceSettings,
  onSave,
  onDelete,
  onRestore,
  onSetDefault,
  openCreateRequest,
}: Props) {
  const [draft, setDraft] = useState<PaymentSourceDraft>(DEFAULT_DRAFT)
  const [settingsDraft, setSettingsDraft] = useState(paymentSourceSettings)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [activeList, setActiveList] = useState<'active' | 'archived'>('active')
  const [activePicker, setActivePicker] = useState<'color' | 'icon' | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isConfigSaving, setIsConfigSaving] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [errorText, setErrorText] = useState('')
  const [duplicateSourceId, setDuplicateSourceId] = useState<string | null>(null)
  const previousOpenCreateRequestRef = useRef(openCreateRequest)


  useEffect(() => {
    setSettingsDraft(paymentSourceSettings)
  }, [paymentSourceSettings])

  const statsById = useMemo(() => {
    return paymentSourceStats.reduce<Record<string, PaymentSourceStats>>((acc, item) => {
      acc[item.sourceId] = item
      return acc
    }, {})
  }, [paymentSourceStats])

  const activeSources = useMemo(
    () => paymentSources.filter((source) => !source.archived_at),
    [paymentSources]
  )
  const archivedSources = useMemo(
    () => paymentSources.filter((source) => Boolean(source.archived_at)),
    [paymentSources]
  )

  const incomeSources = activeSources.filter((source) => source.is_income_source !== false)
  const expenseSources = activeSources.filter((source) => source.is_expense_source !== false)
  const duplicateSource = duplicateSourceId
    ? paymentSources.find((source) => source.id === duplicateSourceId) || null
    : null

  const activeSourceTotals = useMemo(
    () => buildPaymentSourceTotals(activeSources, statsById),
    [activeSources, statsById]
  )
  const archivedSourceTotals = useMemo(
    () => buildPaymentSourceTotals(archivedSources, statsById),
    [archivedSources, statsById]
  )

  const closeForm = () => {
    setDraft(DEFAULT_DRAFT)
    setActivePicker(null)
    setIsFormOpen(false)
    setErrorText('')
    setDuplicateSourceId(null)
  }

  const openNewForm = useCallback(() => {
    setDraft(DEFAULT_DRAFT)
    setStatusText('')
    setErrorText('')
    setDuplicateSourceId(null)
    setActivePicker(null)
    setIsFormOpen(true)
  }, [])

  useEffect(() => {
    if (
      openCreateRequest === undefined ||
      previousOpenCreateRequestRef.current === openCreateRequest
    ) {
      return
    }

    previousOpenCreateRequestRef.current = openCreateRequest
    openNewForm()
  }, [openCreateRequest, openNewForm])

  const openEditForm = (source: PaymentSource) => {
    setDraft({
      id: source.id,
      name: source.name,
      type: source.type,
      icon: getPaymentSourceIconKey(source),
      color: getPaymentSourceColorTone(source),
      isIncomeSource: source.is_income_source !== false,
      isExpenseSource: source.is_expense_source !== false,
    })
    setStatusText('')
    setErrorText('')
    setDuplicateSourceId(null)
    setActivePicker(null)
    setIsFormOpen(true)
  }

  const isSettingsDirty =
    settingsDraft.defaultIncomePaymentSourceId !== paymentSourceSettings.defaultIncomePaymentSourceId ||
    settingsDraft.defaultExpensePaymentSourceId !== paymentSourceSettings.defaultExpensePaymentSourceId

  const saveSettingsDraft = async () => {
    setIsConfigSaving(true)
    setStatusText('')
    setErrorText('')

    try {
      await onSetDefault('income', settingsDraft.defaultIncomePaymentSourceId)
      await onSetDefault('expense', settingsDraft.defaultExpensePaymentSourceId)
      setStatusText('Zapisano ustawienia źródeł płatności.')
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Nie udało się zapisać ustawień źródeł płatności.')
    } finally {
      setIsConfigSaving(false)
    }
  }

  const saveDraft = async (allowArchivedDuplicateName = false) => {
    const trimmedName = draft.name.trim()

    if (!trimmedName) {
      setErrorText('Wpisz nazwę źródła.')
      return
    }

    if (!draft.isIncomeSource && !draft.isExpenseSource) {
      setErrorText('Źródło musi być dostępne przynajmniej dla przychodów albo wydatków.')
      return
    }

    const duplicateCandidates = paymentSources.filter((source) => {
      if (draft.id && source.id === draft.id) {
        return false
      }

      return normalizeName(source.name) === normalizeName(trimmedName)
    })
    const duplicate =
      duplicateCandidates.find((source) => !source.archived_at) || duplicateCandidates[0]

    if (duplicate && (!allowArchivedDuplicateName || !duplicate.archived_at)) {
      setDuplicateSourceId(duplicate.id)
      setErrorText('')
      return
    }

    setDuplicateSourceId(null)
    setIsSaving(true)
    setErrorText('')

    try {
      await onSave({
        id: draft.id,
        allowArchivedDuplicateName,
        name: trimmedName,
        type: draft.type,
        emoji: draft.icon,
        color: draft.color,
        isIncomeSource: draft.isIncomeSource,
        isExpenseSource: draft.isExpenseSource,
      })
      closeForm()
      setStatusText(draft.id ? 'Zapisano źródło płatności.' : 'Dodano źródło płatności.')
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Nie udało się zapisać źródła płatności.')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteSource = async (source: PaymentSource) => {
    const stats = statsById[source.id]
    const hasHistory = Boolean(stats?.transactionCount)

    setIsSaving(true)
    setStatusText('')
    setErrorText('')

    try {
      await onDelete(source.id)
      setStatusText(
        hasHistory
          ? 'Źródło ma historię, więc zostało zarchiwizowane i nie pojawi się przy nowych wpisach.'
          : 'Usunięto źródło płatności.'
      )
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Nie udało się usunąć źródła płatności.')
    } finally {
      setIsSaving(false)
    }
  }

  const restoreSource = async (source: PaymentSource, closeAfterRestore = false) => {
    setIsSaving(true)
    setStatusText('')
    setErrorText('')

    try {
      await onRestore(source.id)
      if (closeAfterRestore) {
        closeForm()
      }
      setActiveList('active')
      setStatusText('Przywrócono źródło płatności.')
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Nie udało się przywrócić źródła płatności.')
    } finally {
      setIsSaving(false)
    }
  }

  const renderAvailability = (label: string, isActive: boolean) => (
    <span
      data-ui-status-pill="true"
      data-ui-tone={isActive ? 'success' : 'danger'}
      data-active={isActive ? 'true' : 'false'}
    >
      <span aria-hidden="true">{isActive ? '✓' : '×'}</span>
      {label}
    </span>
  )

  const renderMetric = (input: {
    iconKey: string
    label: string
    percent: number
    detail: string
    tone?: 'neutral' | 'neutral-accent-1' | 'neutral-accent-2' | 'neutral-accent-3' | 'neutral-accent-4' | 'neutral-accent-5' | 'neutral-accent-6' | 'success' | 'danger'
    title?: string
  }) => (
    <span
      data-ui-metric-card="true"
      data-ui-tone={input.tone || 'neutral-accent-1'}
      title={input.title}
      style={{ '--ui-metric-progress': `${input.percent}%` } as CSSProperties}
    >
      <span data-ui-metric-card-label="true">
        <CategoryIcon iconKey={input.iconKey} size="small" />
        <span>{input.label}</span>
      </span>
      <strong data-ui-metric-card-value="true">{input.percent}%</strong>
      <span data-ui-metric-card-detail="true">{input.detail}</span>
      <span data-ui-metric-card-progress="true" aria-hidden="true">
        <span data-ui-metric-card-progress-fill="true" />
      </span>
    </span>
  )

  const renderColorPicker = () => {
    const selectedColor = getUiColor(draft.color)
    const isOpen = activePicker === 'color'

    return (
      <div
        data-ui-picker-control="true"
        data-ui-picker-variant="gallery"
        data-open={isOpen ? 'true' : 'false'}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          data-ui-picker-trigger="true"
          aria-expanded={isOpen}
          onClick={() => setActivePicker(isOpen ? null : 'color')}
        >
          <span data-ui-picker-value="true">
            <span data-ui-color-swatch="true" data-ui-tone={selectedColor.tone} />
            {selectedColor.label}
          </span>
          <span data-ui-picker-chevron="true" aria-hidden="true" />
        </button>
        {isOpen && (
          <div data-ui-picker-menu="true" data-layout="colors">
            {UI_COLOR_OPTIONS.map((option) => (
              <button
                key={option.tone}
                type="button"
                data-ui-color-option="true"
                data-ui-tone={option.tone}
                data-active={draft.color === option.tone}
                aria-label={`Wybierz kolor: ${option.label}`}
                title={option.label}
                onClick={() => {
                  setDraft((currentDraft) => ({ ...currentDraft, color: option.tone }))
                  setActivePicker(null)
                }}
              >
                <span data-ui-color-swatch="true" data-ui-tone={option.tone} />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderIconPicker = () => {
    return (
      <FoundationIconPicker
        value={draft.icon}
        tone={draft.color}
        isOpen={activePicker === 'icon'}
        suggestedIconKeys={SUGGESTED_PAYMENT_SOURCE_ICONS}
        fallbackLabel="Ikona"
        moreLabel="Wybierz więcej ikon"
        onOpenChange={(isOpen) => setActivePicker(isOpen ? 'icon' : null)}
        onChange={(iconKey) => {
          setDraft((currentDraft) => ({
            ...currentDraft,
            icon: iconKey,
            type: inferPaymentSourceTypeFromIcon(iconKey),
          }))
        }}
      />
    )
  }

  const renderSourceCard = (source: PaymentSource, totals: PaymentSourceTotals) => {
    const iconKey = getPaymentSourceIconKey(source)
    const colorTone = getPaymentSourceColorTone(source)
    const color = getUiColor(colorTone)
    const stats = statsById[source.id] || {
      sourceId: source.id,
      incomeTotal: 0,
      expenseTotal: 0,
      transactionCount: 0,
    }
    const isArchived = Boolean(source.archived_at)
    const hasHistory = stats.transactionCount > 0

    return (
      <article key={source.id} data-ui-large-record="true" data-ui-record-state={isArchived ? 'archived' : 'active'}>
        <div data-ui-large-record-identity="true">
          <span data-ui-icon-tile="true" data-ui-icon-role="large-record-hero" data-ui-tone={color.tone} aria-hidden="true">
            <CategoryIcon iconKey={iconKey} size="large" />
          </span>

          <div data-ui-large-record-identity-copy="true">
            <strong data-ui-large-record-title="true">{source.name}</strong>
            <div data-ui-status-pill-group="true">
              {renderAvailability('Przychody', source.is_income_source !== false && !isArchived)}
              {renderAvailability('Wydatki', source.is_expense_source !== false && !isArchived)}
            </div>
          </div>
        </div>

        <div data-ui-metric-group="true" data-ui-metric-columns="3">
          {renderMetric({
            iconKey: 'system-records',
            label: 'wpisy',
            tone: 'neutral-accent-1',
            percent: calculateShare(stats.transactionCount, totals.transactionCount),
            detail: `${formatCompactNumber(stats.transactionCount)} z ${formatCompactNumber(totals.transactionCount)} wpisów`,
            title: `${stats.transactionCount} z ${totals.transactionCount} wpisów`,
          })}

          {renderMetric({
            iconKey: 'system-income',
            label: 'przychody',
            percent: calculateShare(stats.incomeTotal, totals.incomeTotal),
            detail: `${formatCompactCurrency(stats.incomeTotal)} z ${formatCompactCurrency(totals.incomeTotal)}`,
            tone: 'success',
            title: `${formatCurrency(stats.incomeTotal)} z ${formatCurrency(totals.incomeTotal)}`,
          })}

          {renderMetric({
            iconKey: 'system-expense',
            label: 'wydatki',
            percent: calculateShare(stats.expenseTotal, totals.expenseTotal),
            detail: `${formatCompactCurrency(stats.expenseTotal)} z ${formatCompactCurrency(totals.expenseTotal)}`,
            tone: 'danger',
            title: `${formatCurrency(stats.expenseTotal)} z ${formatCurrency(totals.expenseTotal)}`,
          })}
        </div>

        <div data-ui-action-group="true" data-ui-action-stack="record">
          {isArchived ? (
            <button
              type="button"
              className="ui-button--utility"
              disabled={isSaving}
              onClick={() => void restoreSource(source)}
            >
              Przywróć
            </button>
          ) : (
            <>
              <button type="button" className="ui-button--utility" onClick={() => openEditForm(source)}>
                Edytuj
              </button>
              <button
                type="button"
                data-ui-button-danger="true"
                disabled={isSaving}
                onClick={() => void deleteSource(source)}
              >
                {hasHistory ? 'Archiwizuj' : 'Usuń'}
              </button>
            </>
          )}
        </div>
      </article>
    )
  }



  return (
    <section data-ui-payment-sources-shell="true" data-ui-large-module="true" data-ui-utility-modal-size="xl">
      <section data-ui-payment-section="defaults" data-ui-large-section="true">
        <header data-ui-large-section-header="true">
          <span data-ui-large-section-header-icon="true" data-ui-tone="neutral-accent-1" aria-hidden="true">
            <CategoryIcon iconKey="system-payment-sources" size="small" />
          </span>
          <div data-ui-large-section-header-copy="true">
            <span data-ui-title-with-help="true">
              <strong>Domyślne źródła płatności</strong>
              <HelpHint label="Ustaw źródła, które będą podpowiadane przy nowych wpisach." />
            </span>
          </div>
        </header>

        <div data-ui-settings-strip="true">
          <label data-ui-settings-strip-field="true" data-ui-settings-position="primary">
            Domyślne źródło przychodów
            <span data-ui-select-shell="true">
              <select
                className="ui-select"
                data-input-width="full"
                value={settingsDraft.defaultIncomePaymentSourceId || ''}
                disabled={isConfigSaving}
                onChange={(event) =>
                  setSettingsDraft((currentDraft) => ({
                    ...currentDraft,
                    defaultIncomePaymentSourceId: event.target.value || null,
                  }))
                }
              >
                <option value="">Brak domyślnego źródła</option>
                {incomeSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
              <span data-ui-picker-chevron="true" aria-hidden="true" />
            </span>
          </label>
          <label data-ui-settings-strip-field="true" data-ui-settings-position="secondary">
            Domyślne źródło wydatków
            <span data-ui-select-shell="true">
              <select
                className="ui-select"
                data-input-width="full"
                value={settingsDraft.defaultExpensePaymentSourceId || ''}
                disabled={isConfigSaving}
                onChange={(event) =>
                  setSettingsDraft((currentDraft) => ({
                    ...currentDraft,
                    defaultExpensePaymentSourceId: event.target.value || null,
                  }))
                }
              >
                <option value="">Brak domyślnego źródła</option>
                {expenseSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
              <span data-ui-picker-chevron="true" aria-hidden="true" />
            </span>
          </label>
          <div data-ui-settings-strip-actions="true">
            <button
              type="button"
              data-ui-button-confirm="true"
              disabled={isConfigSaving || !isSettingsDirty}
              onClick={() => void saveSettingsDraft()}
            >
              {isConfigSaving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
            </button>
          </div>
        </div>
      </section>

      <hr data-ui-heavy-divider="true" />

      {statusText && <StatusBox tone="success">{statusText}</StatusBox>}
      {errorText && <StatusBox tone="danger">{errorText}</StatusBox>}

      <section data-ui-payment-section="sources" data-ui-large-section="true">
        <header data-ui-large-section-header="true">
          <span data-ui-large-section-header-icon="true" data-ui-tone="neutral-accent-2" aria-hidden="true">
            <CategoryIcon iconKey="system-records" size="small" />
          </span>
          <div data-ui-large-section-header-copy="true">
            <span data-ui-title-with-help="true">
              <strong>Twoje źródła</strong>
              <HelpHint
                label={
                  activeList === 'active'
                    ? 'Aktywne źródła dostępne w kreatorze wpisów.'
                    : 'Źródła zachowane ze względu na historię wpisów.'
                }
              />
            </span>
          </div>
          <div data-ui-large-section-header-trailing="true">
            <div data-ui-list-switch="true" role="group" aria-label="Zakres źródeł płatności">
              <button
                type="button"
                data-active={activeList === 'active' ? 'true' : undefined}
                onClick={() => setActiveList('active')}
              >
                Źródła aktywne
              </button>
              <button
                type="button"
                data-active={activeList === 'archived' ? 'true' : undefined}
                onClick={() => setActiveList('archived')}
              >
                Źródła archiwalne
              </button>
            </div>
          </div>
        </header>
        <div data-ui-large-record-list="true">
          {(activeList === 'active' ? activeSources : archivedSources).length === 0 ? (
            <EmptyState>
              {activeList === 'active'
                ? 'Brak aktywnych źródeł płatności.'
                : 'Brak archiwalnych źródeł płatności.'}
            </EmptyState>
          ) : (
            (activeList === 'active' ? activeSources : archivedSources).map((source) =>
              renderSourceCard(
                source,
                activeList === 'active' ? activeSourceTotals : archivedSourceTotals
              )
            )
          )}
        </div>
      </section>

      {isFormOpen && (
        <div data-ui-overlay="true" onClick={closeForm}>
          <section
            data-ui-modal-shell="true"
            data-ui-size="form"
            onClick={(event) => {
              event.stopPropagation()
              if (activePicker) {
                setActivePicker(null)
              }
            }}
          >
            <header data-ui-modal-header="true">
              <div data-ui-title-row="true">
                <span data-ui-icon-tile="true" data-ui-tone={draft.color}>
                  <CategoryIcon iconKey={draft.icon} />
                </span>
                <div data-ui-title-copy="true">
                  <span data-ui-title-with-help="true">
                    <strong>{draft.id ? 'Edytuj źródło' : 'Nowe źródło'}</strong>
                    <HelpHint label="Zdecyduj, czy źródło ma być dostępne przy przychodach, wydatkach albo obu." />
                  </span>
                </div>
              </div>
              <button type="button" data-ui-close-action="true" aria-label="Zamknij" onClick={closeForm}>
                <CategoryIcon iconKey="close" />
              </button>
            </header>

            <div data-ui-form-shell="true" data-ui-form-density="comfortable">
              <section data-ui-creator-section="true">
              <label data-ui-field="true">
                Nazwa
                <input
                  className="ui-input"
                  data-input-width="full"
                  data-input-variant="rich"
                  value={draft.name}
                  onChange={(event) => {
                    setDraft((currentDraft) => ({ ...currentDraft, name: event.target.value }))
                    setDuplicateSourceId(null)
                    setErrorText('')
                  }}
                  placeholder="np. Gotówka, Karta kredytowa, Konto główne"
                />
              </label>

              {duplicateSource && (
                <div
                  data-ui-section="true"
                  data-ui-empty-block="true"
                  data-ui-empty-block-variant="notice"
                >
                  {!draft.id && duplicateSource.archived_at ? (
                    <>
                      <strong>Istnieje archiwalne źródło o tej nazwie.</strong>
                      <div data-ui-action-group="true">
                        <button
                          type="button"
                          className="ui-button--standard"
                          disabled={isSaving}
                          onClick={() => void restoreSource(duplicateSource, true)}
                        >
                          Przywróć istniejące
                        </button>
                        <button
                          type="button"
                          className="ui-button--utility"
                          disabled={isSaving}
                          onClick={() => void saveDraft(true)}
                        >
                          Utwórz nowe mimo wszystko
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>Źródło „{duplicateSource.name}” już istnieje.</strong>
                      <span>
                        Edytuj istniejące źródło, żeby zmienić dostępność dla przychodów lub wydatków.
                      </span>
                      <button
                        type="button"
                        className="ui-button--standard"
                        onClick={() => openEditForm(duplicateSource)}
                      >
                        Edytuj istniejące źródło
                      </button>
                    </>
                  )}
                </div>
              )}
              </section>

              <div data-ui-section-separator="true" data-ui-separator-weight="light" />

              <section data-ui-creator-section="true">
              <div data-ui-picker-row="true">
                <div data-ui-field="true">
                  Kolor
                  {renderColorPicker()}
                </div>
                <div data-ui-field="true">
                  Ikona
                  {renderIconPicker()}
                </div>
              </div>
              </section>

              <div data-ui-section-separator="true" data-ui-separator-weight="light" />

              <section data-ui-creator-section="true">
              <div data-ui-checkbox-field-group="true">
                <label
                  data-ui-checkbox="true"
                  data-checkbox-variant="field"
                  data-checkbox-density="comfortable"
                  data-checkbox-align="field"
                  data-checked={draft.isIncomeSource ? 'true' : 'false'}
                >
                  <input
                    className="ui-checkbox__input"
                    type="checkbox"
                    checked={draft.isIncomeSource}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({ ...currentDraft, isIncomeSource: event.target.checked }))
                    }
                  />
                  <span className="ui-checkbox__label">Przychody</span>
                </label>
                <label
                  data-ui-checkbox="true"
                  data-checkbox-variant="field"
                  data-checkbox-density="comfortable"
                  data-checkbox-align="field"
                  data-checked={draft.isExpenseSource ? 'true' : 'false'}
                >
                  <input
                    className="ui-checkbox__input"
                    type="checkbox"
                    checked={draft.isExpenseSource}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({ ...currentDraft, isExpenseSource: event.target.checked }))
                    }
                  />
                  <span className="ui-checkbox__label">Wydatki</span>
                </label>
              </div>
              </section>

              <div data-ui-section-separator="true" data-ui-separator-weight="light" />

              <footer data-ui-form-actions="true">
                <button type="button" data-ui-button-cancel="true" onClick={closeForm} disabled={isSaving}>
                  Anuluj
                </button>
                <button
                  type="button"
                  data-ui-button-confirm="true"
                  onClick={() => void saveDraft()}
                  disabled={isSaving || !draft.name.trim() || (!draft.isIncomeSource && !draft.isExpenseSource)}
                >
                  {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                </button>
              </footer>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
