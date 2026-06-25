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
  onSetDefault,
  openCreateRequest,
}: Props) {
  const [draft, setDraft] = useState<PaymentSourceDraft>(DEFAULT_DRAFT)
  const [settingsDraft, setSettingsDraft] = useState(paymentSourceSettings)
  const [isFormOpen, setIsFormOpen] = useState(false)
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
    value: string | number
    tone?: 'neutral' | 'success' | 'danger'
  }) => (
    <span data-ui-section-record-metric="true" data-ui-tone={input.tone || 'neutral'}>
      <span data-ui-section-record-metric-icon="true" aria-hidden="true">
        <CategoryIcon iconKey={input.iconKey} size="small" />
      </span>
      <strong>{input.value}</strong>
      <span>{input.label}</span>
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

  const renderSourceCard = (source: PaymentSource) => {
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
      <article
        key={source.id}
        data-ui-utility-record="true"
        data-ui-section-record="true"
        data-ui-section-record-variant="payment-source"
        data-ui-record-layout="payment-source"
        data-ui-record-section="strong"
        data-ui-record-state={isArchived ? 'archived' : 'active'}
      >
        <div data-ui-section-record-main="true">
          <span data-ui-icon-tile="true" data-ui-tone={color.tone}>
            <CategoryIcon iconKey={iconKey} />
          </span>

          <div data-ui-section-record-copy="true">
            <strong data-ui-section-record-title="true">{source.name}</strong>

            <div data-ui-section-record-status="true">
              {renderAvailability('Przychody', source.is_income_source !== false && !isArchived)}
              {renderAvailability('Wydatki', source.is_expense_source !== false && !isArchived)}
            </div>

            <div data-ui-section-record-metrics="true">
              {renderMetric({
                iconKey: 'system-records',
                label: 'wpisów',
                value: stats.transactionCount,
              })}

              {source.is_income_source !== false &&
                renderMetric({
                  iconKey: 'system-income',
                  label: 'przychody',
                  value: formatCurrency(stats.incomeTotal),
                  tone: 'success',
                })}

              {source.is_expense_source !== false &&
                renderMetric({
                  iconKey: 'system-expense',
                  label: 'wydatki',
                  value: formatCurrency(stats.expenseTotal),
                  tone: 'danger',
                })}
            </div>
          </div>

          <div data-ui-section-record-actions="true">
            {!isArchived && (
              <button type="button" className="ui-button--utility" onClick={() => openEditForm(source)}>
                Edytuj
              </button>
            )}
            <button
              type="button"
              data-ui-button-danger="true"
              disabled={isSaving}
              onClick={() => void deleteSource(source)}
            >
              {hasHistory ? 'Archiwizuj' : 'Usuń'}
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <UtilityPanel data-ui-payment-sources-shell="true">
      <section data-ui-section="true" data-ui-section-layout="comfortable" data-ui-payment-section="defaults">
        <header data-ui-section-header="true" data-ui-section-header-variant="subsection">
          <span data-ui-section-header-icon="true" data-ui-tone="blue" aria-hidden="true">
            <CategoryIcon iconKey="system-payment-sources" size="small" />
          </span>
          <div data-ui-section-header-copy="true">
            <strong>Domyślne źródła płatności</strong>
            <span>Ustaw źródła, które będą podpowiadane przy nowych wpisach.</span>
          </div>
        </header>

        <div data-ui-settings-strip="true" data-ui-form-grid="two">
          <label data-ui-field="true">
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
          <label data-ui-field="true">
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
          <div data-ui-form-actions="true" data-ui-actions-align="start">
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

      <div
        data-ui-section-separator="true"
        data-ui-separator-role="section"
        data-ui-separator-strength="comfortable"
      />

      {statusText && <StatusBox tone="success">{statusText}</StatusBox>}
      {errorText && <StatusBox tone="danger">{errorText}</StatusBox>}

      <section data-ui-section="true" data-ui-section-layout="comfortable" data-ui-payment-section="sources">
        <header data-ui-section-header="true" data-ui-section-header-variant="major">
          <span data-ui-section-header-icon="true" data-ui-tone="navy" aria-hidden="true">
            <CategoryIcon iconKey="system-records" size="small" />
          </span>
          <div data-ui-section-header-copy="true">
            <strong>Twoje źródła</strong>
            <span>Aktywne źródła dostępne w kreatorze wpisów.</span>
          </div>
          <span data-ui-section-count="true">{activeSources.length} aktywnych</span>
        </header>
        <div data-ui-record-list="true" data-ui-separator-role="record" data-ui-separator-strength="comfortable">
          {activeSources.length === 0 ? (
            <EmptyState>Brak aktywnych źródeł płatności.</EmptyState>
          ) : (
            activeSources.map(renderSourceCard)
          )}
        </div>
      </section>

      {archivedSources.length > 0 && (
        <>
          <div
            data-ui-section-separator="true"
            data-ui-separator-role="section"
            data-ui-separator-strength="comfortable"
          />
          <section data-ui-section="true" data-ui-section-layout="comfortable">
            <header data-ui-section-header="true" data-ui-section-header-variant="major">
              <span data-ui-section-header-icon="true" data-ui-tone="graphite" aria-hidden="true">
                <CategoryIcon iconKey="system-trash" size="small" />
              </span>
              <div data-ui-section-header-copy="true">
                <strong>Archiwalne</strong>
                <span>Źródła zachowane ze względu na historię wpisów.</span>
              </div>
              <span data-ui-section-count="true">{archivedSources.length}</span>
            </header>
            <div data-ui-record-list="true" data-ui-separator-role="record" data-ui-separator-strength="comfortable">
              {archivedSources.map(renderSourceCard)}
            </div>
          </section>
        </>
      )}

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
    </UtilityPanel>
  )
}
