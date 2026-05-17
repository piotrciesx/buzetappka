import { CSSProperties, Dispatch, SetStateAction } from 'react'
import { Category, PaymentSource, RecurringTransaction } from '../../lib/budgetPageTypes'
import {
  fieldStyle,
  formGridStyle,
  formStyle,
  inlineCheckStyle,
  lightButtonStyle,
  sectionTitleStyle,
} from './recurringTransactionsPanelStyles'
import { normalizeDay } from './recurringTransactionsPanelUtils'
import { RecurringTransactionFormState } from './recurringTransactionsPanelTypes'

type Props = {
  formState: RecurringTransactionFormState
  setFormState: Dispatch<SetStateAction<RecurringTransactionFormState>>
  categoryOptions: Category[]
  paymentSources: PaymentSource[]
  isSaving: boolean
  onSave: () => void
  onCancel: () => void
  styles: Record<string, CSSProperties>
}

export default function RecurringTransactionForm({
  formState,
  setFormState,
  categoryOptions,
  paymentSources,
  isSaving,
  onSave,
  onCancel,
  styles,
}: Props) {
  return (
    <div style={formStyle}>
      <div style={sectionTitleStyle}>
        {formState.id ? 'Edycja przypomnienia' : 'Nowe przypomnienie'}
      </div>

      <div data-recurring-form-grid="true" style={formGridStyle}>
        <label style={fieldStyle}>
          Typ
          <select
            style={{ ...styles.input, width: '100%', minWidth: 0 }}
            value={formState.kind}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                kind: event.target.value as RecurringTransaction['kind'],
                frequency:
                  event.target.value === 'installment' && prev.frequency === 'yearly'
                    ? 'monthly'
                    : prev.frequency,
              }))
            }
          >
            <option value="open">Przypomnienie stałe</option>
            <option value="installment">Plan ratalny</option>
          </select>
        </label>

        <label style={fieldStyle}>
          {formState.kind === 'installment' ? 'Nazwa planu' : 'Nazwa przypomnienia'}
          <input
            style={{ ...styles.input, width: '100%', minWidth: 0 }}
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            placeholder={formState.kind === 'installment' ? 'np. laptop 12 rat' : 'np. czynsz'}
          />
        </label>

        <label style={fieldStyle}>
          Kategoria
          <select
            style={{ ...styles.input, width: '100%', minWidth: 0 }}
            value={formState.categoryId}
            onChange={(event) => setFormState((prev) => ({ ...prev, categoryId: event.target.value }))}
          >
            <option value="">Wybierz kategorię</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label style={fieldStyle}>
          Opis wpisu
          <input
            style={{ ...styles.input, width: '100%', minWidth: 0 }}
            value={formState.description}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="opcjonalnie"
          />
        </label>

        <label style={fieldStyle}>
          {formState.kind === 'installment' ? 'Kwota raty' : 'Kwota'}
          <input
            style={{ ...styles.input, width: '100%', minWidth: 0 }}
            value={formState.amount}
            inputMode="decimal"
            onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
            placeholder={formState.kind === 'installment' ? 'wymagana dla rat' : 'opcjonalnie'}
          />
        </label>

        <label style={fieldStyle}>
          Dzień płatności
          <input
            style={{ ...styles.input, width: '100%', minWidth: 0 }}
            value={formState.reminderDay}
            inputMode="numeric"
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, reminderDay: normalizeDay(event.target.value) }))
            }
            onBlur={() => setFormState((prev) => ({ ...prev, reminderDay: prev.reminderDay || '1' }))}
          />
        </label>

        <label style={fieldStyle}>
          Częstotliwość
          <select
            style={{ ...styles.input, width: '100%', minWidth: 0 }}
            value={formState.frequency}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                frequency: event.target.value as RecurringTransaction['frequency'],
              }))
            }
          >
            <option value="monthly">co miesiąc</option>
            <option value="custom">co X miesięcy</option>
            {formState.kind !== 'installment' && <option value="yearly">co rok</option>}
          </select>
        </label>

        {formState.frequency === 'custom' && (
          <label style={fieldStyle}>
            Co ile miesięcy
            <input
              style={{ ...styles.input, width: '100%', minWidth: 0 }}
              value={formState.customIntervalMonths}
              inputMode="numeric"
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  customIntervalMonths: event.target.value.replace(/\D/g, ''),
                }))
              }
            />
          </label>
        )}

        {formState.kind === 'installment' && (
          <>
            <label style={fieldStyle}>
              Liczba rat
              <input
                style={{ ...styles.input, width: '100%', minWidth: 0 }}
                value={formState.installmentTotalCount}
                inputMode="numeric"
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    installmentTotalCount: event.target.value.replace(/\D/g, ''),
                  }))
                }
              />
            </label>

            <label style={fieldStyle}>
              Data pierwszej raty
              <input
                type="date"
                style={{ ...styles.input, width: '100%', minWidth: 0 }}
                value={formState.startDate}
                onChange={(event) => setFormState((prev) => ({ ...prev, startDate: event.target.value }))}
              />
            </label>

            <label style={fieldStyle}>
              Data ostatniej raty
              <input
                type="date"
                style={{ ...styles.input, width: '100%', minWidth: 0 }}
                value={formState.endDate}
                onChange={(event) => setFormState((prev) => ({ ...prev, endDate: event.target.value }))}
              />
            </label>

            <label style={fieldStyle}>
              Wpłata na start
              <input
                style={{ ...styles.input, width: '100%', minWidth: 0 }}
                value={formState.initialPaymentAmount}
                inputMode="decimal"
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    initialPaymentAmount: event.target.value,
                  }))
                }
                placeholder="opcjonalnie"
              />
            </label>
          </>
        )}

        <label style={inlineCheckStyle}>
          <input
            type="checkbox"
            checked={formState.usePaymentSource}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, usePaymentSource: event.target.checked }))
            }
          />
          Dodaj źródło płatności
        </label>

        {formState.usePaymentSource && (
          <label style={fieldStyle}>
            Źródło płatności
            <select
              style={{ ...styles.input, width: '100%', minWidth: 0 }}
              value={formState.paymentSourceId}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, paymentSourceId: event.target.value }))
              }
            >
              <option value="">Brak źródła</option>
              {paymentSources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div style={{ ...styles.actions, gap: 8 }}>
        <button
          type="button"
          style={{ ...styles.primaryButton, ...lightButtonStyle }}
          disabled={
            isSaving ||
            !formState.name.trim() ||
            !formState.categoryId ||
            (formState.kind === 'installment' && !Number(formState.installmentTotalCount || 0))
          }
          onClick={onSave}
        >
          {isSaving ? 'Zapisywanie...' : formState.id ? 'Zapisz zmiany' : 'Zapisz przypomnienie'}
        </button>
        <button type="button" style={{ ...styles.secondaryButton, ...lightButtonStyle }} onClick={onCancel}>
          Anuluj
        </button>
      </div>
    </div>
  )
}
