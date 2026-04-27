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
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: 16,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
} as const

const cardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 14,
  background: '#ffffff',
} as const

const settingsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 12,
  marginTop: 12,
} as const

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 8px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
} as const

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
      <div style={styles.sectionTitle}>Źródła płatności i konta</div>
      <div style={{ ...styles.pageSubtitle, marginBottom: 0 }}>
        Osobno konfigurujesz listy dla przychodów i wydatków oraz decydujesz, czy pole ma być
        widoczne w kreatorze.
      </div>

      <div style={settingsGridStyle}>
        <div style={styles.infoBox}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Przychody</div>

          <label style={styles.sortLabel}>
            <input
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

          <div style={{ marginTop: 10 }}>
            <label htmlFor="income-default-payment-source" style={styles.sortLabel}>
              Domyślne źródło dla przychodów
            </label>
            <select
              id="income-default-payment-source"
              style={styles.input}
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
            style={{ ...styles.secondaryButton, marginTop: 10 }}
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

        <div style={styles.infoBox}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Wydatki</div>

          <label style={styles.sortLabel}>
            <input
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

          <div style={{ marginTop: 10 }}>
            <label htmlFor="expense-default-payment-source" style={styles.sortLabel}>
              Domyślne źródło dla wydatków
            </label>
            <select
              id="expense-default-payment-source"
              style={styles.input}
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
            style={{ ...styles.secondaryButton, marginTop: 10 }}
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

      <div style={{ ...styles.formRow, marginTop: 12 }}>
        <input
          style={styles.input}
          placeholder="np. Karta Visa, Gotówka, Konto firmowe"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <select
          style={styles.input}
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

        <input
          style={{ ...styles.smallInput, width: 90 }}
          placeholder="Emoji"
          value={emoji}
          onChange={(event) => setEmoji(event.target.value)}
        />

        <input
          style={{ ...styles.smallInput, width: 120 }}
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
        />

        <label style={styles.sortLabel}>
          <input
            type="checkbox"
            checked={isIncomeSource}
            onChange={(event) => setIsIncomeSource(event.target.checked)}
          />{' '}
          Przychody
        </label>

        <label style={styles.sortLabel}>
          <input
            type="checkbox"
            checked={isExpenseSource}
            onChange={(event) => setIsExpenseSource(event.target.checked)}
          />{' '}
          Wydatki
        </label>

        <button
          type="button"
          style={styles.primaryButton}
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
          <button type="button" style={styles.secondaryButton} onClick={resetForm}>
            Anuluj edycję
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      {getPaymentSourceOptionLabel(source)}
                    </div>
                    <div style={{ ...styles.pageSubtitle, margin: '4px 0 0' }}>
                      Typ: {getPaymentSourceTypeLabel(source.type)}
                    </div>
                  </div>

                  <div style={styles.actions}>
                    <button
                      type="button"
                      style={styles.secondaryButton}
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
                      style={styles.dangerButton}
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

                <div
                  style={{
                    display: 'grid',
                    gap: 8,
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    marginTop: 12,
                  }}
                >
                  <div style={styles.infoBox}>
                    <b>Liczba wpisów:</b> {stats.transactionCount}
                  </div>
                  <div style={styles.infoBox}>
                    <b>Suma przychodów:</b> {stats.incomeTotal.toFixed(2)} zł
                  </div>
                  <div style={styles.infoBox}>
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
