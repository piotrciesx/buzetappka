'use client'

/**
 * LEGACY LIMITS UI.
 *
 * This editor targets the old `budget_limits` model and is not part of the
 * active UI flow. New and edited limits must use the Stage 2 creator exposed
 * by `BudgetLimitsV1Panel`.
 *
 * Do not import this component into active UI flows.
 */

import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import type { BudgetLimit, BudgetLimitMode } from '../lib/budgetPageTypes'
import {
  uiControlPrimitives,
  uiInputApi,
  uiOverlayPrimitives,
  uiSurfacePrimitives,
  uiTypographyTokens,
} from '../lib/uiFoundation'
import type { SaveBudgetLimitInput } from '../lib/useBudgetLimits'

type Props = {
  isOpen: boolean
  categoryId: string | null
  categoryLabel: string
  selectedMonth: string
  existingLimit: BudgetLimit | null
  onClose: () => void
  onSave: (input: SaveBudgetLimitInput) => Promise<void>
  onDelete: (limitId: string) => Promise<void>
  onDisable: (limitId: string) => Promise<void>
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: uiOverlayPrimitives.modal.layer,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--ui-overlay-modal-padding-compact)',
  background: 'var(--ui-overlay-backdrop-soft)',
}

const modalStyle: CSSProperties = {
  width: '100%',
  maxWidth: 'var(--ui-modal-max-width-m)',
  borderRadius: uiSurfacePrimitives.modalSurfaceStrong.radius,
  border: uiSurfacePrimitives.modalSurfaceStrong.border,
  background: uiSurfacePrimitives.modalSurfaceStrong.background,
  boxShadow: uiSurfacePrimitives.modalSurfaceStrong.shadow,
  padding: uiSurfacePrimitives.modalSurfaceStrong.padding,
}

const titleStyle: CSSProperties = {
  margin: 0,
  color: 'var(--ui-color-primary-text)',
  fontSize: uiTypographyTokens.hierarchy.t2,
  fontWeight: uiTypographyTokens.weight.semibold,
  lineHeight: uiTypographyTokens.lineHeight.heading,
}

const subtitleStyle: CSSProperties = {
  marginTop: 6,
  color: 'var(--ui-color-secondary-text)',
  fontSize: uiTypographyTokens.role.helper,
  lineHeight: uiTypographyTokens.lineHeight.body,
}

const formStyle: CSSProperties = {
  display: 'grid',
  gap: 12,
  marginTop: 16,
}

const labelStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
  color: 'var(--ui-color-secondary-text)',
  fontSize: uiTypographyTokens.role.label,
  fontWeight: uiTypographyTokens.weight.medium,
}

const helpTextStyle: CSSProperties = {
  color: 'var(--ui-color-secondary-text)',
  fontSize: uiTypographyTokens.role.helper,
  fontWeight: uiTypographyTokens.weight.regular,
  lineHeight: uiTypographyTokens.lineHeight.body,
}

const errorTextStyle: CSSProperties = {
  padding: uiSurfacePrimitives.statusBox.danger.padding,
  borderRadius: uiSurfacePrimitives.statusBox.danger.radius,
  border: uiSurfacePrimitives.statusBox.danger.border,
  background: uiSurfacePrimitives.statusBox.danger.background,
  color: 'var(--ui-color-expense)',
  fontSize: uiTypographyTokens.role.helper,
  lineHeight: uiTypographyTokens.lineHeight.body,
}

const actionsStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  flexWrap: 'wrap',
  marginTop: 18,
}

const groupStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
}

const secondaryButtonStyle: CSSProperties = {
  minHeight: uiControlPrimitives.button.secondary.minHeight,
  padding: uiControlPrimitives.button.secondary.padding,
  borderRadius: uiControlPrimitives.button.secondary.radius,
  border: uiControlPrimitives.button.secondary.border,
  background: uiControlPrimitives.button.secondary.background,
  color: uiControlPrimitives.button.secondary.color,
  fontWeight: uiControlPrimitives.button.secondary.fontWeight,
  cursor: uiControlPrimitives.button.secondary.cursor,
}

/** @deprecated Use the Stage 2 creator in `BudgetLimitsV1Panel`. */
export default function BudgetLimitEditorModal({
  isOpen,
  categoryId,
  categoryLabel,
  selectedMonth,
  existingLimit,
  onClose,
  onSave,
  onDelete,
  onDisable,
}: Props) {
  const [amount, setAmount] = useState('')
  const [endMonth, setEndMonth] = useState('')
  const [mode, setMode] = useState<BudgetLimitMode>('normal')
  const [isOnlySelectedMonth, setIsOnlySelectedMonth] = useState(false)
  const [hasCustomEndMonth, setHasCustomEndMonth] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setAmount(existingLimit ? String(existingLimit.amount) : '')
    setMode(existingLimit?.mode || 'normal')
    setIsOnlySelectedMonth(Boolean(existingLimit?.end_month === selectedMonth))
    setHasCustomEndMonth(Boolean(existingLimit?.end_month && existingLimit.end_month !== selectedMonth))
    setEndMonth(
      existingLimit?.end_month && existingLimit.end_month >= selectedMonth
        ? existingLimit.end_month
        : selectedMonth
    )
    setErrorText('')
  }, [existingLimit, isOpen, selectedMonth])

  if (!isOpen) {
    return null
  }

  const normalizedAmount = Number(amount.replace(',', '.'))
  const normalizedEndMonth = isOnlySelectedMonth
    ? selectedMonth
    : hasCustomEndMonth
      ? endMonth
      : null
  const hasValidEndMonth = !hasCustomEndMonth || endMonth >= selectedMonth
  const canSave = Number.isFinite(normalizedAmount) && normalizedAmount > 0 && hasValidEndMonth

  const handleSave = async () => {
    if (!canSave || isSaving) {
      return
    }

    setIsSaving(true)
    setErrorText('')

    try {
      await onSave({
        categoryId,
        amount: normalizedAmount,
        startMonth: selectedMonth,
        endMonth: normalizedEndMonth,
        mode,
      })
      onClose()
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Nie udało się zapisać limitu.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!existingLimit || isSaving) {
      return
    }

    const confirmed = window.confirm(
      'Limit zostanie wyłączony od tego miesiąca. Wcześniejsze miesiące pozostaną bez zmian.'
    )

    if (!confirmed) {
      return
    }

    setIsSaving(true)
    setErrorText('')

    try {
      await onDelete(existingLimit.id)
      onClose()
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Nie udało się usunąć limitu.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDisable = async () => {
    if (!existingLimit || isSaving) {
      return
    }

    setIsSaving(true)
    setErrorText('')

    try {
      await onDisable(existingLimit.id)
      onClose()
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Nie udało się wyłączyć limitu.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-label="Limit wydatków"
      data-budget-limit-modal-overlay="true"
    >
      <div style={modalStyle} data-budget-limit-modal="true">
        <h2 style={titleStyle}>{existingLimit ? 'Edytuj limit' : 'Ustaw limit'}</h2>
        <div style={subtitleStyle}>{categoryLabel}</div>

        <div style={formStyle} data-budget-limit-form="true">
          <label style={labelStyle}>
            Kwota limitu
            <input
              className={uiInputApi.classNames.amountField}
              data-input-width={uiInputApi.width.full}
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(',', '.'))}
              placeholder="Wpisz kwotę"
            />
          </label>

          <label style={labelStyle}>
            Tryb alertu
            <select
              className={`${uiInputApi.classNames.select} ${uiInputApi.classNames.inputL}`}
              data-input-width={uiInputApi.width.full}
              value={mode}
              onChange={(event) => setMode(event.target.value as BudgetLimitMode)}
            >
              <option value="normal">normalny</option>
              <option value="strict">tylko przekroczenie</option>
            </select>
            <span style={helpTextStyle}>
              {mode === 'normal'
                ? 'Ostrzegaj przy 80%, 90% i przekroczeniu limitu'
                : 'Ostrzegaj dopiero po przekroczeniu limitu'}
            </span>
          </label>

          <label
            style={{
              ...labelStyle,
              display: 'flex',
              alignItems: 'center',
              gap: uiControlPrimitives.checkbox.default.gap,
            }}
          >
            <input
              type="checkbox"
              checked={isOnlySelectedMonth}
              onChange={(event) => {
                setIsOnlySelectedMonth(event.target.checked)
                if (event.target.checked) {
                  setHasCustomEndMonth(false)
                  setEndMonth(selectedMonth)
                }
              }}
            />
            Tylko dla tego miesiąca
          </label>

          {isOnlySelectedMonth && (
            <div style={helpTextStyle}>Po zakończeniu tego miesiąca limit nie będzie kontynuowany.</div>
          )}

          <label
            style={{
              ...labelStyle,
              display: 'flex',
              alignItems: 'center',
              gap: uiControlPrimitives.checkbox.default.gap,
            }}
          >
            <input
              type="checkbox"
              checked={hasCustomEndMonth}
              disabled={isOnlySelectedMonth}
              onChange={(event) => {
                setHasCustomEndMonth(event.target.checked)
                if (event.target.checked) {
                  setIsOnlySelectedMonth(false)
                  setEndMonth((prev) => (prev >= selectedMonth ? prev : selectedMonth))
                }
              }}
            />
            Ustaw datę końca
          </label>

          {hasCustomEndMonth && (
            <label style={labelStyle}>
              Miesiąc końca
              <input
                className={`${uiInputApi.classNames.input} ${uiInputApi.classNames.inputL}`}
                data-input-width={uiInputApi.width.full}
                type="month"
                min={selectedMonth}
                value={endMonth}
                onChange={(event) => setEndMonth(event.target.value)}
              />
              <span style={helpTextStyle}>Data końca nie może być wcześniejsza niż {selectedMonth}.</span>
            </label>
          )}

          {errorText && <div style={errorTextStyle}>{errorText}</div>}
        </div>

        <div style={actionsStyle} data-budget-limit-actions="true">
          <div style={groupStyle} data-budget-limit-action-group="true">
            {existingLimit && (
              <>
                <button type="button" data-ui-button-danger="true" onClick={handleDelete}>
                  Usuń
                </button>
                <button type="button" style={secondaryButtonStyle} onClick={handleDisable}>
                  Wyłącz od tego miesiąca
                </button>
              </>
            )}
          </div>

          <div style={groupStyle} data-budget-limit-action-group="true">
            <button type="button" data-ui-button-cancel="true" onClick={onClose}>
              Anuluj
            </button>
            <button type="button" data-ui-button-confirm="true" disabled={!canSave || isSaving} onClick={handleSave}>
              {isSaving ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
