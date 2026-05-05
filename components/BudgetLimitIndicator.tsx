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
    return '#dc2626'
  }

  if (view.alertState.level === 'strong') {
    return '#ea580c'
  }

  if (view.alertState.level === 'warning') {
    return '#f59e0b'
  }

  if (view.usagePercent >= 80) {
    return '#f59e0b'
  }

  return '#64748b'
}

const wrapStyle: CSSProperties = {
  marginTop: 6,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  color: '#64748b',
  fontSize: 12,
  lineHeight: 1.25,
}

const barStyle: CSSProperties = {
  width: 76,
  height: 5,
  borderRadius: 999,
  background: '#e5e7eb',
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
    <div style={wrapStyle}>
      {alertIcon && <span style={iconStyle}>{alertIcon}</span>}
      <span>
        {formatMoney(view.usageAmount)} / {formatMoney(view.limit.amount)}
      </span>
      <strong style={{ color, fontWeight: 600 }}>{view.usagePercent.toFixed(1)}%</strong>
      <span style={barStyle}>
        <span
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
