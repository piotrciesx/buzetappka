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

export default function BudgetLimitIndicator({ view }: Props) {
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

  return (
    <div style={wrapStyle} data-budget-limit-indicator="true">
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
