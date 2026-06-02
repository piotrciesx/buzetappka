'use client'

import type { CSSProperties } from 'react'
import type { BudgetLimit, BudgetLimitAlertState } from '../lib/budgetPageTypes'

export type BudgetLimitView = {
  limit: BudgetLimit
  usageAmount: number
  usagePercent: number
  alertState: BudgetLimitAlertState
}

type Props = {
  view: BudgetLimitView | null
  variant?: 'default' | 'level1'
}

const formatMoney = (value: number) => `${value.toFixed(2)} zł`

const getLimitColor = (view: BudgetLimitView) => {
  if (view.alertState.level === 'exceeded') {
    return 'var(--ui-color-expense)'
  }

  if (view.alertState.level === 'strong') {
    return 'var(--ui-color-warning)'
  }

  if (view.alertState.level === 'warning') {
    return 'var(--ui-color-warning)'
  }

  if (view.usagePercent >= 80) {
    return 'var(--ui-color-warning)'
  }

  return 'var(--ui-color-secondary-text)'
}

const wrapStyle: CSSProperties = {
  marginTop: 6,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  color: 'var(--ui-color-secondary-text)',
  fontSize: 12,
  lineHeight: 1.25,
}

const barStyle: CSSProperties = {
  width: 76,
  height: 5,
  borderRadius: 999,
  background: 'var(--ui-color-divider-border)',
  overflow: 'hidden',
}

const iconStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: 1,
}

export default function BudgetLimitIndicator({ view, variant = 'default' }: Props) {
  if (!view) {
    return null
  }

  const color = getLimitColor(view)
  const clampedPercent = Math.max(0, Math.min(100, view.usagePercent))
  const alertIcon = view.alertState.level === 'exceeded'
    ? '❗'
    : view.alertState.level === 'warning' || view.alertState.level === 'strong'
      ? '🔔'
      : ''

  if (variant === 'level1') {
    return (
      <div style={wrapStyle} data-budget-limit-indicator="level1">
        <span data-budget-limit-text="true">Limit miesięczny: {formatMoney(view.limit.amount)}</span>
        <div data-budget-limit-level1-progress="true">
          <span style={barStyle} data-budget-limit-bar="true">
            <span
              data-budget-limit-bar-fill="true"
              style={{
                display: 'block',
                width: `${clampedPercent}%`,
                height: '100%',
                borderRadius: 999,
                background: color,
              }}
            />
          </span>
          <strong style={{ color, fontWeight: 700 }} data-budget-limit-percent="true">
            {formatMoney(view.usageAmount)} ({view.usagePercent.toFixed(0)}%)
          </strong>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle} data-budget-limit-indicator="default">
      {alertIcon && (
        <span style={iconStyle} data-budget-limit-alert-icon="true">
          {alertIcon}
        </span>
      )}
      <span data-budget-limit-text="true">
        {formatMoney(view.usageAmount)} / {formatMoney(view.limit.amount)}
      </span>
      <strong style={{ color, fontWeight: 600 }} data-budget-limit-percent="true">
        {view.usagePercent.toFixed(1)}%
      </strong>
      <span style={barStyle} data-budget-limit-bar="true">
        <span
          data-budget-limit-bar-fill="true"
          style={{
            display: 'block',
            width: `${clampedPercent}%`,
            height: '100%',
            borderRadius: 999,
            background: color,
          }}
        />
      </span>
    </div>
  )
}
