import { CSSProperties, Dispatch, SetStateAction, useMemo, useState } from 'react'
import { Category, PaymentSource, RecurringTransaction } from '../../lib/budgetPageTypes'
import { uiInputApi } from '../../lib/uiFoundation'
import {
  fieldStyle,
  formGridStyle,
  formStyle,
  inlineCheckStyle,
  lightButtonStyle,
  mutedTextStyle,
  scheduleGridStyle,
  sectionTitleStyle,
  warningStyle,
} from './recurringTransactionsPanelStyles'
import {
  buildInstallmentSchedule,
  formatMoney,
  getDateForDay,
  getScheduleBalance,
  inferInstallmentCount,
  normalizeAmount,
  normalizeDay,
  rebalanceScheduleLast,
  rebalanceScheduleProportionally,
  roundMoney,
} from './recurringTransactionsPanelUtils'
import { RecurringTransactionFormState } from './recurringTransactionsPanelTypes'
import {
  ReminderActionRow,
  ReminderCard,
  ReminderStatusBadge,
} from '../reminder-calendar/reminderCalendarPrimitives'

type Props = {
  formState: RecurringTransactionFormState
  setFormState: Dispatch<SetStateAction<RecurringTransactionFormState>>
  categoryOptions: Category[]
  paymentSources: PaymentSource[]
  selectedMonth: string
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
  selectedMonth,
  isSaving,
  onSave,
  onCancel,
  styles,
}: Props) {
  const [rebalanceMode, setRebalanceMode] = useState<'last' | 'proportional'>('last')
  const totalAmount = normalizeAmount(formState.installmentTotalAmount)
  const installmentAmount = normalizeAmount(formState.amount)
  const installmentCount = Number(formState.installmentTotalCount || 0) || null
  const scheduleBalance = useMemo(
    () => getScheduleBalance(totalAmount, formState.installmentSchedule),
    [formState.installmentSchedule, totalAmount]
  )
  const canSave =
    !isSaving &&
    Boolean(formState.name.trim()) &&
    Boolean(formState.categoryId) &&
    (formState.kind === 'open' ||
      (formState.installmentSchedule.length > 0 && totalAmount !== null && scheduleBalance.isBalanced))

  const updateKind = (kind: RecurringTransaction['kind']) => {
    setFormState((prev) => ({
      ...prev,
      kind,
      frequency: kind === 'installment' && prev.frequency === 'yearly' ? 'monthly' : prev.frequency,
      installmentSchedule: kind === 'open' ? [] : prev.installmentSchedule,
    }))
  }

  const generateSchedule = () => {
    const count = inferInstallmentCount({
      totalAmount,
      installmentAmount,
      explicitCount: installmentCount,
    })
    const reminderDay = formState.reminderDay || '1'
    const startDate = formState.startDate || getDateForDay(selectedMonth, reminderDay)

    if (!count || count <= 0 || !startDate) {
      return
    }

    const schedule = buildInstallmentSchedule({
      totalAmount,
      installmentAmount,
      installmentCount: count,
      startDate,
      frequency: formState.frequency,
      customIntervalMonths: formState.customIntervalMonths,
    })

    setFormState((prev) => ({
      ...prev,
      startDate,
      endDate: schedule[schedule.length - 1]?.due_date || prev.endDate,
      installmentTotalCount: String(count),
      amount:
        installmentAmount === null && schedule[0]
          ? String(schedule[0].amount)
          : prev.amount,
      installmentSchedule: schedule,
    }))
  }

  const updateScheduleAmount = (index: number, value: string) => {
    const amount = normalizeAmount(value) ?? 0
    setFormState((prev) => ({
      ...prev,
      installmentSchedule: prev.installmentSchedule.map((installment, itemIndex) =>
        itemIndex === index ? { ...installment, amount: roundMoney(amount) } : installment
      ),
    }))
  }

  const rebalanceSchedule = () => {
    setFormState((prev) => ({
      ...prev,
      installmentSchedule:
        rebalanceMode === 'last'
          ? rebalanceScheduleLast(prev.installmentSchedule, totalAmount)
          : rebalanceScheduleProportionally(prev.installmentSchedule, totalAmount),
    }))
  }

  return (
    <ReminderCard style={formStyle}>
      <div style={sectionTitleStyle}>
        {formState.id ? 'Edycja' : 'Nowa pozycja'}
      </div>

      {!formState.id && (
        <ReminderActionRow style={{ ...styles.actions, gap: 8 }}>
          <button
            type="button"
            style={{
              ...styles.secondaryButton,
              ...lightButtonStyle,
              ...(formState.kind === 'open' ? styles.primaryButton : null),
            }}
            onClick={() => updateKind('open')}
          >
            Przypomnienie stałe
          </button>
          <button
            type="button"
            style={{
              ...styles.secondaryButton,
              ...lightButtonStyle,
              ...(formState.kind === 'installment' ? styles.primaryButton : null),
            }}
            onClick={() => updateKind('installment')}
          >
            Plan ratalny
          </button>
        </ReminderActionRow>
      )}

      <div data-recurring-form-grid="true" style={formGridStyle}>
        <label style={fieldStyle}>
          {formState.kind === 'installment' ? 'Nazwa planu' : 'Nazwa'}
          <input
            className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
            data-input-width={uiInputApi.width.full}
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            placeholder={formState.kind === 'installment' ? 'np. laptop 24 raty' : 'np. czynsz'}
          />
        </label>

        <label style={fieldStyle}>
          Kategoria
          <select
            className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputM}`}
            data-input-width={uiInputApi.width.full}
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
          Opis
          <input
            className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
            data-input-width={uiInputApi.width.full}
            value={formState.description}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="opcjonalnie"
          />
        </label>

        <label style={fieldStyle}>
          Źródło płatności
          <select
            className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputM}`}
            data-input-width={uiInputApi.width.full}
            value={formState.usePaymentSource ? formState.paymentSourceId : ''}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                paymentSourceId: event.target.value,
                usePaymentSource: Boolean(event.target.value),
              }))
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

        {formState.kind === 'open' && (
          <>
            <label style={fieldStyle}>
              Dzień płatności
              <input
                className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
                data-input-width={uiInputApi.width.full}
                value={formState.reminderDay}
                inputMode="numeric"
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, reminderDay: normalizeDay(event.target.value) }))
                }
                onBlur={() =>
                  setFormState((prev) => ({ ...prev, reminderDay: prev.reminderDay || '1' }))
                }
              />
            </label>

            <label style={fieldStyle}>
              Częstotliwość
              <select
                className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputM}`}
                data-input-width={uiInputApi.width.full}
                value={formState.frequency}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    frequency: event.target.value as RecurringTransaction['frequency'],
                  }))
                }
              >
                <option value="monthly">co miesiąc</option>
                <option value="yearly">co rok</option>
                <option value="custom">co X miesięcy</option>
              </select>
            </label>
          </>
        )}

        {formState.kind === 'installment' && (
          <>
            <label style={fieldStyle}>
              Kwota całkowita
              <input
                className={uiInputApi.classNames.amountField}
                data-input-width={uiInputApi.width.full}
                value={formState.installmentTotalAmount}
                inputMode="decimal"
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    installmentTotalAmount: event.target.value,
                    initialPaymentAmount: event.target.value,
                  }))
                }
              />
            </label>

            <label style={fieldStyle}>
              Liczba rat
              <input
                className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
                data-input-width={uiInputApi.width.full}
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
              Kwota raty
              <input
                className={uiInputApi.classNames.amountField}
                data-input-width={uiInputApi.width.full}
                value={formState.amount}
                inputMode="decimal"
                onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </label>

            <label style={fieldStyle}>
              Data pierwszej raty
              <input
                type="date"
                className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
                data-input-width={uiInputApi.width.full}
                value={formState.startDate}
                onChange={(event) => setFormState((prev) => ({ ...prev, startDate: event.target.value }))}
              />
            </label>

            <label style={fieldStyle}>
              Data ostatniej raty
              <input
                type="date"
                className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
                data-input-width={uiInputApi.width.full}
                value={formState.endDate}
                onChange={(event) => setFormState((prev) => ({ ...prev, endDate: event.target.value }))}
              />
            </label>
          </>
        )}

        {formState.frequency === 'custom' && (
          <label style={fieldStyle}>
            Co ile miesięcy
            <input
              className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputM}`}
              data-input-width={uiInputApi.width.full}
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
      </div>

      {formState.kind === 'installment' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <ReminderActionRow style={{ ...styles.actions, gap: 8 }}>
            <button
              type="button"
              style={{ ...styles.secondaryButton, ...lightButtonStyle }}
              onClick={generateSchedule}
            >
              Przelicz harmonogram
            </button>
            <select
              className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputS}`}
              value={rebalanceMode}
              onChange={(event) => setRebalanceMode(event.target.value as typeof rebalanceMode)}
            >
              <option value="last">ostatnia rata</option>
              <option value="proportional">proporcjonalnie</option>
            </select>
            <button
              type="button"
              style={{ ...styles.secondaryButton, ...lightButtonStyle }}
              disabled={formState.installmentSchedule.length === 0 || totalAmount === null}
              onClick={rebalanceSchedule}
            >
              Wyrównaj harmonogram
            </button>
          </ReminderActionRow>

          {formState.installmentSchedule.length > 0 && (
            <>
              <div style={mutedTextStyle}>
                Suma rat: {formatMoney(scheduleBalance.sum)}
              </div>
              {scheduleBalance.message && (
                <ReminderStatusBadge
                  tone={scheduleBalance.isBalanced ? 'success' : 'warning'}
                  style={scheduleBalance.isBalanced ? undefined : warningStyle}
                >
                  {scheduleBalance.message}
                </ReminderStatusBadge>
              )}
              <div data-installment-schedule="true" style={scheduleGridStyle}>
                {formState.installmentSchedule.map((installment, index) => (
                  <div key={`${installment.installment_number}-${installment.due_date}`} style={inlineCheckStyle}>
                    <span>Rata {installment.installment_number}</span>
                    <input
                      type="date"
                      className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputS}`}
                      value={installment.due_date}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          installmentSchedule: prev.installmentSchedule.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, due_date: event.target.value } : item
                          ),
                        }))
                      }
                    />
                    <input
                      className={uiInputApi.classNames.amountField}
                      value={String(installment.amount)}
                      inputMode="decimal"
                      onChange={(event) => updateScheduleAmount(index, event.target.value)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <ReminderActionRow style={{ ...styles.actions, gap: 8 }}>
        <button
          type="button"
          style={{ ...styles.primaryButton, ...lightButtonStyle }}
          disabled={!canSave}
          onClick={onSave}
        >
          {isSaving ? 'Zapisywanie...' : formState.id ? 'Zapisz zmiany' : 'Zapisz'}
        </button>
        <button type="button" style={{ ...styles.secondaryButton, ...lightButtonStyle }} onClick={onCancel}>
          Anuluj
        </button>
      </ReminderActionRow>
    </ReminderCard>
  )
}
