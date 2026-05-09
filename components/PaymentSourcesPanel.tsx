'use client'

import { CSSProperties, useMemo, useState } from 'react'
import { PaymentSource, PaymentSourceType } from '../lib/budgetPageTypes'
import {
  DEFAULT_PAYMENT_SOURCE_COLOR,
  DEFAULT_PAYMENT_SOURCE_EMOJI,
  getPaymentSourceOptionLabel,
  getPaymentSourceTypeLabel,
  PaymentSourceListKind,
} from '../lib/paymentSources'

const panelStyle = {
  marginBottom: 20,
  display: 'grid',
  gap: 14,
  maxWidth: '100%',
  overflowX: 'hidden' as const,
  background: 'transparent',
  border: 0,
  borderRadius: 0,
  padding: 0,
  boxShadow: 'none',
} as const

const cardStyle = {
  border: '1px solid rgba(226, 232, 240, 0.92)',
  borderRadius: 12,
  padding: 12,
  background: 'rgba(255, 255, 255, 0.72)',
} as const

const settingsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
  gap: 10,
  minWidth: 0,
} as const

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '3px 8px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 620,
} as const

const subtitleStyle = {
  maxWidth: 620,
  color: '#64748b',
  fontSize: 12,
  lineHeight: 1.45,
} as const

const settingsCardStyle = {
  display: 'grid',
  gap: 10,
  alignContent: 'start',
  minWidth: 0,
  minHeight: 174,
  padding: 12,
  border: '1px solid rgba(226, 232, 240, 0.92)',
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.64)',
} as const

const settingsTitleStyle = {
  color: '#172033',
  fontSize: 13,
  fontWeight: 680,
} as const

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: '#475569',
  fontSize: 12,
  fontWeight: 560,
  lineHeight: 1.35,
} as const

const checkboxStyle = {
  width: 15,
  height: 15,
  accentColor: '#2563eb',
} as const

const fieldStyle = {
  minWidth: 0,
  display: 'grid',
  gap: 5,
} as const

const fullInputStyle: CSSProperties = {
  width: '100%',
  minWidth: 0,
}

const lightButtonStyle = {
  minHeight: 30,
  borderRadius: 999,
  padding: '0 10px',
  border: '1px solid rgba(203, 213, 225, 0.82)',
  background: 'rgba(255, 255, 255, 0.68)',
  color: '#475569',
  fontSize: 12,
  fontWeight: 580,
  boxShadow: 'none',
  whiteSpace: 'normal' as const,
} as const

const lightDangerButtonStyle = {
  ...lightButtonStyle,
  borderColor: 'rgba(248, 113, 113, 0.34)',
  background: 'rgba(254, 242, 242, 0.66)',
  color: '#b91c1c',
} as const

const primaryActionStyle = {
  minHeight: 32,
  borderRadius: 999,
  padding: '0 12px',
  fontSize: 12,
  fontWeight: 640,
} as const

const sourceFormStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr) minmax(72px, 0.6fr) minmax(64px, 0.5fr)',
  alignItems: 'end',
  gap: 9,
  maxWidth: '100%',
  minWidth: 0,
  padding: 12,
  border: '1px solid rgba(226, 232, 240, 0.92)',
  borderRadius: 12,
  background: 'rgba(248, 250, 252, 0.62)',
} as const

const listStyle = {
  display: 'grid',
  gap: 10,
} as const

const sourceHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  flexWrap: 'wrap' as const,
} as const

const sourceNameStyle = {
  color: '#172033',
  fontSize: 14,
  fontWeight: 680,
} as const

const sourceMetaStyle = {
  marginTop: 3,
  color: '#64748b',
  fontSize: 12,
} as const

const sourceStatsGridStyle = {
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  marginTop: 10,
} as const

const sourceStatStyle = {
  padding: '8px 9px',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  borderRadius: 10,
  background: 'rgba(248, 250, 252, 0.7)',
  color: '#475569',
  fontSize: 12,
} as const

const responsivePaymentSourcesStyle = `
  @media (max-width: 980px) {
    [data-payment-source-form="true"] {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }

  [data-payment-source-form="true"] > label,
  [data-payment-source-form="true"] > button {
    align-self: end;
  }

  [data-payment-source-form="true"] > button {
    justify-self: start;
  }

  [data-payment-source-form="true"] input,
  [data-payment-source-form="true"] select {
    min-width: 0 !important;
  }

  @media (max-width: 560px) {
    [data-payment-source-form="true"] {
      grid-template-columns: 1fr !important;
    }
  }
`

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

export default function PaymentSourcesPanel(props: Props) {
  const {
    paymentSources,
    paymentSourceStats,
    paymentSourceSettings,
    onSave,
    onDelete,
    onSetDefault,
    onSetFieldVisibility,
    onCopyList,
    styles,
  } = props

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<PaymentSourceType>('card')
  const [emoji, setEmoji] = useState(DEFAULT_PAYMENT_SOURCE_EMOJI.card)
  const [color, setColor] = useState(DEFAULT_PAYMENT_SOURCE_COLOR.card)
  const [isIncomeSource, setIsIncomeSource] = useState(true)
  const [isExpenseSource, setIsExpenseSource] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isConfigSaving, setIsConfigSaving] = useState(false)

  const statsById = useMemo(() => {
    return paymentSourceStats.reduce<Record<string, PaymentSourceStats>>((acc, item) => {
      acc[item.sourceId] = item
      return acc
    }, {})
  }, [paymentSourceStats])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setType('card')
    setEmoji(DEFAULT_PAYMENT_SOURCE_EMOJI.card)
    setColor(DEFAULT_PAYMENT_SOURCE_COLOR.card)
    setIsIncomeSource(true)
    setIsExpenseSource(true)
  }

  const renderMembershipBadge = (label: string, isActive: boolean, colorValue: string) => (
    <span
      style={{
        ...badgeStyle,
        background: isActive ? `${colorValue}18` : '#f3f4f6',
        color: isActive ? colorValue : '#6b7280',
        border: `1px solid ${isActive ? colorValue : '#d1d5db'}`,
      }}
    >
      {label}
    </span>
  )

  return (
    <section style={panelStyle}>
      <style>{responsivePaymentSourcesStyle}</style>
      <div style={subtitleStyle}>
        Osobno konfigurujesz listy dla przychodów i wydatków oraz decydujesz, czy pole ma być
        widoczne w kreatorze.
      </div>

      <div style={settingsGridStyle}>
        <div style={settingsCardStyle}>
          <div style={settingsTitleStyle}>Przychody</div>

          <label style={checkboxLabelStyle}>
            <input
              style={checkboxStyle}
              type="checkbox"
              checked={paymentSourceSettings.showIncomePaymentSource}
              onChange={async (event) => {
                setIsConfigSaving(true)

                try {
                  await onSetFieldVisibility('income', event.target.checked)
                } finally {
                  setIsConfigSaving(false)
                }
              }}
            />{' '}
            Pokaż pole źródła w kreatorze przychodów
          </label>

          <div style={fieldStyle}>
            <label htmlFor="income-default-payment-source" style={styles.sortLabel}>
              Domyślne źródło dla przychodów
            </label>
            <select
              id="income-default-payment-source"
              style={{ ...styles.input, ...fullInputStyle }}
              value={paymentSourceSettings.defaultIncomePaymentSourceId || ''}
              onChange={async (event) => {
                setIsConfigSaving(true)

                try {
                  await onSetDefault('income', event.target.value || null)
                } finally {
                  setIsConfigSaving(false)
                }
              }}
              disabled={isConfigSaving}
            >
              <option value="">Brak domyślnego źródła</option>
              {paymentSources
                .filter((source) => source.is_income_source !== false)
                .map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
            </select>
          </div>

          <button
            type="button"
            style={lightButtonStyle}
            disabled={isConfigSaving}
            onClick={async () => {
              setIsConfigSaving(true)

              try {
                await onCopyList('expense', 'income')
              } finally {
                setIsConfigSaving(false)
              }
            }}
          >
            Kopiuj listę wydatków do przychodów
          </button>
        </div>

        <div style={settingsCardStyle}>
          <div style={settingsTitleStyle}>Wydatki</div>

          <label style={checkboxLabelStyle}>
            <input
              style={checkboxStyle}
              type="checkbox"
              checked={paymentSourceSettings.showExpensePaymentSource}
              onChange={async (event) => {
                setIsConfigSaving(true)

                try {
                  await onSetFieldVisibility('expense', event.target.checked)
                } finally {
                  setIsConfigSaving(false)
                }
              }}
            />{' '}
            Pokaż pole źródła w kreatorze wydatków
          </label>

          <div style={fieldStyle}>
            <label htmlFor="expense-default-payment-source" style={styles.sortLabel}>
              Domyślne źródło dla wydatków
            </label>
            <select
              id="expense-default-payment-source"
              style={{ ...styles.input, ...fullInputStyle }}
              value={paymentSourceSettings.defaultExpensePaymentSourceId || ''}
              onChange={async (event) => {
                setIsConfigSaving(true)

                try {
                  await onSetDefault('expense', event.target.value || null)
                } finally {
                  setIsConfigSaving(false)
                }
              }}
              disabled={isConfigSaving}
            >
              <option value="">Brak domyślnego źródła</option>
              {paymentSources
                .filter((source) => source.is_expense_source !== false)
                .map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
            </select>
          </div>

          <button
            type="button"
            style={lightButtonStyle}
            disabled={isConfigSaving}
            onClick={async () => {
              setIsConfigSaving(true)

              try {
                await onCopyList('income', 'expense')
              } finally {
                setIsConfigSaving(false)
              }
            }}
          >
            Kopiuj listę przychodów do wydatków
          </button>
        </div>
      </div>

      <div data-payment-source-form="true" style={sourceFormStyle}>
        <div style={fieldStyle}>
          <label style={styles.sortLabel}>Nazwa</label>
          <input
            style={{ ...styles.input, ...fullInputStyle }}
            placeholder="np. Karta Visa, Gotówka, Konto firmowe"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div style={fieldStyle}>
          <label style={styles.sortLabel}>Typ</label>
          <select
            style={{ ...styles.input, ...fullInputStyle }}
            value={type}
            onChange={(event) => {
              const nextType = event.target.value as PaymentSourceType
              setType(nextType)

              if (!emoji.trim() || emoji === DEFAULT_PAYMENT_SOURCE_EMOJI[type]) {
                setEmoji(DEFAULT_PAYMENT_SOURCE_EMOJI[nextType])
              }

              if (!color.trim() || color === DEFAULT_PAYMENT_SOURCE_COLOR[type]) {
                setColor(DEFAULT_PAYMENT_SOURCE_COLOR[nextType])
              }
            }}
          >
            <option value="cash">Gotówka</option>
            <option value="card">Karta</option>
            <option value="account">Konto</option>
            <option value="other">Inne</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={styles.sortLabel}>Ikonka</label>
          <input
            style={{ ...styles.smallInput, width: '100%' }}
            placeholder="Emoji"
            value={emoji}
            onChange={(event) => setEmoji(event.target.value)}
          />
        </div>

        <div style={fieldStyle}>
          <label style={styles.sortLabel}>Kolor</label>
          <input
            style={{ ...styles.smallInput, width: '100%', padding: 4 }}
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </div>

        <label style={checkboxLabelStyle}>
          <input
            style={checkboxStyle}
            type="checkbox"
            checked={isIncomeSource}
            onChange={(event) => setIsIncomeSource(event.target.checked)}
          />{' '}
          Przychody
        </label>

        <label style={checkboxLabelStyle}>
          <input
            style={checkboxStyle}
            type="checkbox"
            checked={isExpenseSource}
            onChange={(event) => setIsExpenseSource(event.target.checked)}
          />{' '}
          Wydatki
        </label>

        <button
          type="button"
          style={{ ...styles.primaryButton, ...primaryActionStyle }}
          disabled={isSaving || !name.trim() || (!isIncomeSource && !isExpenseSource)}
          onClick={async () => {
            setIsSaving(true)

            try {
              await onSave({
                id: editingId || undefined,
                name,
                type,
                emoji,
                color,
                isIncomeSource,
                isExpenseSource,
              })
              resetForm()
            } finally {
              setIsSaving(false)
            }
          }}
        >
          {isSaving ? 'Zapisywanie...' : editingId ? 'Zapisz źródło' : 'Dodaj źródło'}
        </button>

        {editingId && (
          <button type="button" style={lightButtonStyle} onClick={resetForm}>
            Anuluj edycję
          </button>
        )}
      </div>

      <div style={listStyle}>
        {paymentSources.length === 0 ? (
          <div style={styles.emptyStateCard}>Brak zapisanych źródeł płatności.</div>
        ) : (
          paymentSources.map((source) => {
            const stats = statsById[source.id] || {
              sourceId: source.id,
              incomeTotal: 0,
              expenseTotal: 0,
              transactionCount: 0,
            }

            return (
              <div key={source.id} style={cardStyle}>
                <div style={sourceHeaderStyle}>
                  <div>
                    <div style={sourceNameStyle}>
                      {getPaymentSourceOptionLabel(source)}
                    </div>
                    <div style={sourceMetaStyle}>
                      Typ: {getPaymentSourceTypeLabel(source.type)}
                    </div>
                  </div>

                  <div style={styles.actions}>
                    <button
                      type="button"
                      style={lightButtonStyle}
                      onClick={() => {
                        setEditingId(source.id)
                        setName(source.name)
                        setType(source.type)
                        setEmoji(source.emoji || DEFAULT_PAYMENT_SOURCE_EMOJI[source.type])
                        setColor(source.color || DEFAULT_PAYMENT_SOURCE_COLOR[source.type])
                        setIsIncomeSource(source.is_income_source !== false)
                        setIsExpenseSource(source.is_expense_source !== false)
                      }}
                    >
                      Edytuj
                    </button>

                    <button
                      type="button"
                      style={lightDangerButtonStyle}
                      onClick={() => {
                        void onDelete(source.id)
                      }}
                    >
                      Usuń
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {renderMembershipBadge('Przychody', source.is_income_source !== false, '#15803d')}
                  {renderMembershipBadge('Wydatki', source.is_expense_source !== false, '#b91c1c')}
                </div>

                <div style={sourceStatsGridStyle}>
                  <div style={sourceStatStyle}>
                    <b>Liczba wpisów:</b> {stats.transactionCount}
                  </div>
                  <div style={sourceStatStyle}>
                    <b>Suma przychodów:</b> {stats.incomeTotal.toFixed(2)} zł
                  </div>
                  <div style={sourceStatStyle}>
                    <b>Suma wydatków:</b> {stats.expenseTotal.toFixed(2)} zł
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
