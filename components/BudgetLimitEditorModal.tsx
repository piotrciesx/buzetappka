'use client'

import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import type { BudgetLimit, BudgetLimitMode } from '../lib/budgetPageTypes'
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
  zIndex: 3000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  background: 'rgba(15, 23, 42, 0.32)',
}

const modalStyle: CSSProperties = {
  width: 'min(520px, 100%)',
  borderRadius: 16,
  border: '1px solid #e5e7eb',
  background: '#ffffff',
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
  padding: 18,
}

const titleStyle: CSSProperties = {
  margin: 0,
  color: '#111827',
  fontSize: 18,
  fontWeight: 600,
  lineHeight: 1.25,
}

const subtitleStyle: CSSProperties = {
  marginTop: 6,
  color: '#64748b',
  fontSize: 13,
  lineHeight: 1.35,
}

const formStyle: CSSProperties = {
  display: 'grid',
  gap: 12,
  marginTop: 16,
}

const labelStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
  color: '#334155',
  fontSize: 13,
  fontWeight: 500,
}

const inputStyle: CSSProperties = {
  height: 40,
  borderRadius: 10,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  color: '#111827',
  fontSize: 14,
  padding: '0 12px',
  outline: 'none',
}

const helpTextStyle: CSSProperties = {
  color: '#64748b',
  fontSize: 12,
  fontWeight: 400,
  lineHeight: 1.35,
}

const errorTextStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #fecaca',
  background: '#fff1f2',
  color: '#991b1b',
  fontSize: 13,
  lineHeight: 1.35,
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

const primaryButtonStyle: CSSProperties = {
  padding: '9px 12px',
  borderRadius: 10,
  border: '1px solid #2563eb',
  background: '#2563eb',
  color: '#ffffff',
  fontWeight: 600,
  cursor: 'pointer',
}

const secondaryButtonStyle: CSSProperties = {
  padding: '9px 12px',
  borderRadius: 10,
  border: '1px solid #d1d5db',
  background: '#ffffff',
  color: '#111827',
  fontWeight: 600,
  cursor: 'pointer',
}

const dangerButtonStyle: CSSProperties = {
  padding: '9px 12px',
  borderRadius: 10,
  border: '1px solid #fca5a5',
  background: '#fef2f2',
  color: '#991b1b',
  fontWeight: 600,
  cursor: 'pointer',
}

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
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="Limit wydatków">
      <div style={modalStyle}>
        <h2 style={titleStyle}>{existingLimit ? 'Edytuj limit' : 'Ustaw limit'}</h2>
        <div style={subtitleStyle}>{categoryLabel}</div>

        <div style={formStyle}>
          <label style={labelStyle}>
            Kwota limitu
            <input
              style={inputStyle}
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(',', '.'))}
              placeholder="1000"
            />
          </label>

          <label style={labelStyle}>
            Tryb alertu
            <select
              style={inputStyle}
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

          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
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

          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
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
                style={inputStyle}
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

        <div style={actionsStyle}>
          <div style={groupStyle}>
            {existingLimit && (
              <>
                <button type="button" style={dangerButtonStyle} onClick={handleDelete}>
                  Usuń
                </button>
                <button type="button" style={secondaryButtonStyle} onClick={handleDisable}>
                  Wyłącz od tego miesiąca
                </button>
              </>
            )}
          </div>

          <div style={groupStyle}>
            <button type="button" style={secondaryButtonStyle} onClick={onClose}>
              Anuluj
            </button>
            <button type="button" style={primaryButtonStyle} disabled={!canSave || isSaving} onClick={handleSave}>
              {isSaving ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
