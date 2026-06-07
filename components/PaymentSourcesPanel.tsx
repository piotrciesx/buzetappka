'use client'

import { CSSProperties, useMemo, useState } from 'react'
import { PaymentSource, PaymentSourceType } from '../lib/budgetPageTypes'
import {
  APP_ICONS,
  UI_COLOR_OPTIONS,
  getUiColor,
  getUiIcon,
  type UiColorKey,
  type UiIconKey,
} from '../lib/userAppearance'
import {
  getPaymentSourceColorTone,
  getPaymentSourceIconKey,
  PaymentSourceListKind,
} from '../lib/paymentSources'
import CategoryIcon from './CategoryIcon'
import { EmptyState, StatusBox, UtilityPanel } from './utility-panels/utilityPanelPrimitives'

type PaymentSourceStats = {
  sourceId: string
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
    name: string
    type: PaymentSourceType
    emoji: string
    color: string
    isIncomeSource: boolean
    isExpenseSource: boolean
  }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onSetDefault: (kind: PaymentSourceListKind, id: string | null) => Promise<void>
  onSetFieldVisibility: (kind: PaymentSourceListKind, isVisible: boolean) => Promise<void>
  onCopyList: (sourceKind: PaymentSourceListKind, targetKind: PaymentSourceListKind) => Promise<void>
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

const PAYMENT_SOURCE_ICON_PRESETS: Array<{
  icon: UiIconKey
  color: UiColorKey
  label: string
  type: PaymentSourceType
}> = [
  { icon: 'card', color: 'blue', label: 'Karta', type: 'card' },
  { icon: 'cash', color: 'green', label: 'Gotówka', type: 'cash' },
  { icon: 'bank', color: 'violet', label: 'Konto', type: 'account' },
  { icon: 'savings', color: 'mint', label: 'Oszczędności', type: 'account' },
  { icon: 'gift', color: 'amber', label: 'Kupon / prezent', type: 'other' },
  { icon: 'more', color: 'neutral', label: 'Inne', type: 'other' },
]

const resolvePaymentSourceTypeFromIcon = (icon: UiIconKey): PaymentSourceType => {
  if (icon === 'cash') {
    return 'cash'
  }

  if (icon === 'card') {
    return 'card'
  }

  if (icon === 'bank' || icon === 'savings' || icon === 'investments') {
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

const normalizeName = (value: string) => value.trim().toLocaleLowerCase('pl-PL')

export default function PaymentSourcesPanel({
  paymentSources,
  paymentSourceStats,
  paymentSourceSettings,
  onSave,
  onDelete,
  onSetDefault,
  onSetFieldVisibility,
}: Props) {
  const [draft, setDraft] = useState<PaymentSourceDraft>(DEFAULT_DRAFT)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isConfigSaving, setIsConfigSaving] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [errorText, setErrorText] = useState('')

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

  const closeForm = () => {
    setDraft(DEFAULT_DRAFT)
    setIsFormOpen(false)
    setErrorText('')
  }

  const openNewForm = () => {
    setDraft(DEFAULT_DRAFT)
    setStatusText('')
    setErrorText('')
    setIsFormOpen(true)
  }

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
    setIsFormOpen(true)
  }

  const updateDraftIcon = (nextIcon: UiIconKey, nextColor?: UiColorKey) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      icon: nextIcon,
      color: nextColor || currentDraft.color,
      type: resolvePaymentSourceTypeFromIcon(nextIcon),
    }))
  }

  const saveDraft = async () => {
    const trimmedName = draft.name.trim()

    if (!trimmedName) {
      setErrorText('Wpisz nazwę źródła.')
      return
    }

    if (!draft.isIncomeSource && !draft.isExpenseSource) {
      setErrorText('Źródło musi być dostępne przynajmniej dla przychodów albo wydatków.')
      return
    }

    const duplicate = paymentSources.find((source) => {
      if (draft.id && source.id === draft.id) {
        return false
      }

      return normalizeName(source.name) === normalizeName(trimmedName)
    })

    if (duplicate) {
      setErrorText(
        `Źródło „${trimmedName}” już istnieje. Edytuj istniejące źródło i zaznacz, czy ma być dostępne dla przychodów, wydatków albo obu.`
      )
      return
    }

    setIsSaving(true)
    setErrorText('')

    try {
      await onSave({
        id: draft.id,
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

  const renderAvailability = (label: string, isActive: boolean) => (
    <span data-payment-source-availability="true" data-active={isActive ? 'true' : 'false'}>
      <span aria-hidden="true">{isActive ? '✓' : '×'}</span>
      {label}
    </span>
  )

  const renderSourceCard = (source: PaymentSource) => {
    const iconKey = getPaymentSourceIconKey(source)
    const colorTone = getPaymentSourceColorTone(source)
    const icon = getUiIcon(iconKey)
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
      <article
        key={source.id}
        data-payment-source-item="true"
        data-archived={isArchived ? 'true' : 'false'}
      >
        <div data-payment-source-main="true">
          <span data-ui-icon-tile="true" data-ui-tone={color.tone}>
            <CategoryIcon iconKey={iconKey} />
          </span>
          <div data-payment-source-copy="true">
            <strong>{source.name}</strong>
            <span>
              {icon?.label || 'Ikona'} · {color.label}
            </span>
          </div>
        </div>

        <div data-payment-source-statuses="true">
          {renderAvailability('Przychody', source.is_income_source !== false && !isArchived)}
          {renderAvailability('Wydatki', source.is_expense_source !== false && !isArchived)}
        </div>

        <div data-payment-source-stats-row="true">
          <span>{stats.transactionCount} wpisów</span>
          <span>Przychody: {formatCurrency(stats.incomeTotal)}</span>
          <span>Wydatki: {formatCurrency(stats.expenseTotal)}</span>
        </div>

        <div data-payment-source-actions="true">
          {!isArchived && (
            <button type="button" className="ui-button--utility" onClick={() => openEditForm(source)}>
              Edytuj
            </button>
          )}
          <button
            type="button"
            className="ui-button--utility"
            data-button-tone="danger"
            disabled={isSaving}
            onClick={() => void deleteSource(source)}
          >
            {hasHistory ? 'Archiwizuj' : 'Usuń'}
          </button>
        </div>
      </article>
    )
  }

  return (
    <UtilityPanel data-payment-sources-panel="true">
      <section data-payment-source-hero="true">
        <div>
          <strong>Źródła płatności</strong>
          <span>Jedno źródło może działać dla przychodów, wydatków albo obu naraz.</span>
        </div>
        <button type="button" className="ui-button--utility" onClick={openNewForm}>
          + Dodaj źródło
        </button>
      </section>

      <section data-payment-source-defaults="true">
        <label data-ui-field="true">
          Pokaż pole źródła przy przychodach
          <input
            type="checkbox"
            checked={paymentSourceSettings.showIncomePaymentSource}
            disabled={isConfigSaving}
            onChange={async (event) => {
              setIsConfigSaving(true)
              try {
                await onSetFieldVisibility('income', event.target.checked)
              } finally {
                setIsConfigSaving(false)
              }
            }}
          />
        </label>
        <label data-ui-field="true">
          Domyślne źródło przychodów
          <select
            className="ui-select"
            data-input-width="full"
            value={paymentSourceSettings.defaultIncomePaymentSourceId || ''}
            disabled={isConfigSaving}
            onChange={async (event) => {
              setIsConfigSaving(true)
              try {
                await onSetDefault('income', event.target.value || null)
              } finally {
                setIsConfigSaving(false)
              }
            }}
          >
            <option value="">Brak domyślnego źródła</option>
            {incomeSources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </label>
        <label data-ui-field="true">
          Pokaż pole źródła przy wydatkach
          <input
            type="checkbox"
            checked={paymentSourceSettings.showExpensePaymentSource}
            disabled={isConfigSaving}
            onChange={async (event) => {
              setIsConfigSaving(true)
              try {
                await onSetFieldVisibility('expense', event.target.checked)
              } finally {
                setIsConfigSaving(false)
              }
            }}
          />
        </label>
        <label data-ui-field="true">
          Domyślne źródło wydatków
          <select
            className="ui-select"
            data-input-width="full"
            value={paymentSourceSettings.defaultExpensePaymentSourceId || ''}
            disabled={isConfigSaving}
            onChange={async (event) => {
              setIsConfigSaving(true)
              try {
                await onSetDefault('expense', event.target.value || null)
              } finally {
                setIsConfigSaving(false)
              }
            }}
          >
            <option value="">Brak domyślnego źródła</option>
            {expenseSources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {statusText && <StatusBox tone="success">{statusText}</StatusBox>}
      {errorText && <StatusBox tone="danger">{errorText}</StatusBox>}

      <section data-payment-source-list-section="true">
        <header data-payment-source-section-header="true">
          <strong>Twoje źródła</strong>
          <span>{activeSources.length} aktywnych</span>
        </header>
        <div data-payment-source-list="true">
          {activeSources.length === 0 ? (
            <EmptyState>Brak aktywnych źródeł płatności.</EmptyState>
          ) : (
            activeSources.map(renderSourceCard)
          )}
        </div>
      </section>

      {archivedSources.length > 0 && (
        <section data-payment-source-list-section="true">
          <header data-payment-source-section-header="true">
            <strong>Archiwalne</strong>
            <span>{archivedSources.length}</span>
          </header>
          <div data-payment-source-list="true">{archivedSources.map(renderSourceCard)}</div>
        </section>
      )}

      {isFormOpen && (
        <div data-ui-overlay="true" onClick={closeForm}>
          <section
            data-ui-modal-shell="true"
            data-ui-size="form"
            onClick={(event) => event.stopPropagation()}
          >
            <header data-ui-modal-header="true">
              <div data-ui-title-row="true">
                <span data-ui-icon-tile="true" data-ui-tone={draft.color}>
                  <CategoryIcon iconKey={draft.icon} />
                </span>
                <div data-ui-title-copy="true">
                  <strong>{draft.id ? 'Edytuj źródło' : 'Nowe źródło'}</strong>
                  <span>Zdecyduj, czy źródło ma być dostępne przy przychodach, wydatkach albo obu.</span>
                </div>
              </div>
              <button type="button" className="ui-button--icon" aria-label="Zamknij" onClick={closeForm}>
                <CategoryIcon iconKey="close" />
              </button>
            </header>

            <div data-ui-form-shell="true">
              <label data-ui-field="true">
                Nazwa
                <input
                  className="ui-input"
                  data-input-width="full"
                  value={draft.name}
                  onChange={(event) => setDraft((currentDraft) => ({ ...currentDraft, name: event.target.value }))}
                  placeholder="np. Gotówka, Karta kredytowa, Konto główne"
                />
              </label>

              <div data-ui-field="true">
                Szybki wybór źródła
                <div data-payment-source-preset-grid="true">
                  {PAYMENT_SOURCE_ICON_PRESETS.map((option) => (
                    <button
                      key={option.icon}
                      type="button"
                      data-payment-source-preset="true"
                      data-active={draft.icon === option.icon}
                      onClick={() => updateDraftIcon(option.icon, option.color)}
                    >
                      <span data-ui-icon-tile="true" data-ui-tone={option.color}>
                        <CategoryIcon iconKey={option.icon} />
                      </span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div data-ui-field="true">
                Kolor ikonki
                <div data-ui-color-picker="true">
                  {UI_COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.tone}
                      type="button"
                      data-ui-color-dot="true"
                      data-ui-tone={option.tone}
                      data-active={draft.color === option.tone}
                      aria-label={`Wybierz kolor: ${option.label}`}
                      title={option.label}
                      onClick={() => setDraft((currentDraft) => ({ ...currentDraft, color: option.tone }))}
                    >
                      <span />
                    </button>
                  ))}
                </div>
              </div>

              <details data-ui-compact-picker="true">
                <summary>
                  <span>Ikona</span>
                  <span data-ui-picker-preview="true">
                    <span data-ui-icon-tile="true" data-ui-tone={draft.color}>
                      <CategoryIcon iconKey={draft.icon} />
                    </span>
                    {getUiIcon(draft.icon)?.label || 'Ikona'}
                  </span>
                </summary>
                <div data-ui-icon-picker="true">
                  {APP_ICONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      data-ui-icon-option="true"
                      data-active={draft.icon === option.key}
                      aria-label={`Wybierz ikonę: ${option.label}`}
                      title={option.label}
                      onClick={() => updateDraftIcon(option.key)}
                    >
                      <span data-ui-icon-tile="true" data-ui-tone={draft.color}>
                        <CategoryIcon iconKey={option.key} />
                      </span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </details>

              <div data-payment-source-scope-picker="true">
                <label data-payment-source-scope="true" data-active={draft.isIncomeSource ? 'true' : 'false'}>
                  <input
                    type="checkbox"
                    checked={draft.isIncomeSource}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({ ...currentDraft, isIncomeSource: event.target.checked }))
                    }
                  />
                  <span>Przychody</span>
                </label>
                <label data-payment-source-scope="true" data-active={draft.isExpenseSource ? 'true' : 'false'}>
                  <input
                    type="checkbox"
                    checked={draft.isExpenseSource}
                    onChange={(event) =>
                      setDraft((currentDraft) => ({ ...currentDraft, isExpenseSource: event.target.checked }))
                    }
                  />
                  <span>Wydatki</span>
                </label>
              </div>

              <footer data-ui-form-actions="true">
                <button type="button" className="ui-button--utility" onClick={closeForm} disabled={isSaving}>
                  Anuluj
                </button>
                <button
                  type="button"
                  className="ui-button--standard"
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
    </UtilityPanel>
  )
}
