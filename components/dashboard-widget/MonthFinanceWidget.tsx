'use client'

import { DashboardWidgetLayoutItem } from '../../lib/dashboardTypes'
import { DashboardStats } from '../../lib/dashboardStats'
import { BLUE, GREEN, RED, dashboardMetricCard } from './dashboardWidgetTileStyles'
import { formatMoney, formatPercent, getColorForMoney } from './dashboardWidgetTileUtils'

function IncomeExpenseDonut({
  income,
  expense,
  size,
}: {
  income: number
  expense: number
  size: number
}) {
  const total = income + expense
  const percent = total > 0 ? (income / total) * 100 : 50
  const holeSize = Math.round(size * 0.54)

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        background:
          total > 0
            ? `conic-gradient(${GREEN} 0 ${percent}%, ${RED} ${percent}% 100%)`
            : 'conic-gradient(#e5e7eb, #f1f5f9)',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        style={{
          width: holeSize,
          height: holeSize,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: 'inset 0 1px 7px rgba(15, 23, 42, 0.08)',
        }}
      />
    </div>
  )
}

function BalanceBlock({
  balance,
  compact = false,
}: {
  balance: number
  compact?: boolean
}) {
  return (
    <div style={{ minWidth: 0, textAlign: compact ? 'center' : 'left' }}>
      <div
        style={{
          fontSize: compact ? 9.5 : 11.5,
          color: '#64748b',
          fontWeight: 600,
          marginBottom: 2,
        }}
      >
        Bilans miesiąca
      </div>
      <div
        style={{
          fontSize: compact ? 16 : 26,
          lineHeight: 1.05,
          fontWeight: 760,
          letterSpacing: '-0.04em',
          color: getColorForMoney(balance),
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {formatMoney(balance)}
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  color,
  compact = false,
}: {
  icon: string
  label: string
  value: string
  color: string
  compact?: boolean
}) {
  if (compact) {
    return (
      <div
        style={{
          ...dashboardMetricCard,
          display: 'grid',
          gridTemplateColumns: '24px minmax(0, 1fr)',
          alignItems: 'center',
          gap: 8,
          padding: '8px 9px',
          borderRadius: 13,
          background: `${color}10`,
          border: `1px solid ${color}2b`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.70)',
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 9,
            display: 'grid',
            placeItems: 'center',
            background: `${color}1f`,
            color,
            fontWeight: 720,
            fontSize: 12,
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: '#64748b',
              fontSize: 9.5,
              lineHeight: 1.05,
              fontWeight: 650,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: 3,
            }}
          >
            {label}
          </div>
          <div
            style={{
              color,
              fontSize: 12.5,
              lineHeight: 1.1,
              fontWeight: 780,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {value}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        ...dashboardMetricCard,
        display: 'grid',
        gridTemplateColumns: '26px minmax(0, 1fr)',
        alignItems: 'center',
        gap: 9,
        padding: '8px 11px',
        borderRadius: 15,
        background: `${color}10`,
        border: `1px solid ${color}2b`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.70)',
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 10,
          display: 'grid',
          placeItems: 'center',
          background: `${color}1f`,
          color,
          fontWeight: 720,
          fontSize: 13,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          minWidth: 0,
          color,
          fontSize: 14,
          lineHeight: 1.1,
          fontWeight: 760,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}: {value}
      </div>
    </div>
  )
}

export default function MonthFinanceWidget({
  widget,
  dashboardStats,
}: {
  widget: DashboardWidgetLayoutItem
  dashboardStats: DashboardStats
}) {
  const isSmall = widget.width === 2
  const expenseShare =
    dashboardStats.income > 0 ? formatPercent(dashboardStats.expenseShareOfIncome) : 'Brak'

  const metrics = [
    { icon: '+', label: 'Przychody', value: formatMoney(dashboardStats.income), color: GREEN },
    { icon: '-', label: 'Wydatki', value: formatMoney(dashboardStats.expense), color: RED },
    { icon: '%', label: 'Udział', value: expenseShare, color: BLUE },
  ]

  if (isSmall) {
    return (
      <div
        style={{
          height: '100%',
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'minmax(150px, 1.05fr) minmax(0, 0.95fr)',
          alignItems: 'center',
          gap: 10,
          padding: '6px 8px 8px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            minWidth: 0,
            minHeight: 0,
            display: 'grid',
            gridTemplateRows: 'auto auto',
            justifyItems: 'center',
            alignContent: 'center',
            gap: 9,
            overflow: 'hidden',
          }}
        >
          <BalanceBlock balance={dashboardStats.balance} compact />
          <IncomeExpenseDonut income={dashboardStats.income} expense={dashboardStats.expense} size={200} />
        </div>

        <div
          style={{
            minWidth: 0,
            minHeight: 0,
            display: 'grid',
            gap: 9,
            alignContent: 'center',
            overflow: 'hidden',
          }}
        >
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} compact />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 0.95fr) minmax(300px, 1.05fr)',
        gap: 30,
        alignItems: 'center',
        padding: '10px 26px 14px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          minWidth: 0,
          minHeight: 0,
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}
      >
        <IncomeExpenseDonut income={dashboardStats.income} expense={dashboardStats.expense} size={230} />
      </div>

      <div
        style={{
          minWidth: 0,
          minHeight: 0,
          display: 'grid',
          gridTemplateRows: 'auto auto',
          alignContent: 'center',
          gap: 16,
          overflow: 'hidden',
        }}
      >
        <BalanceBlock balance={dashboardStats.balance} />

        <div
          style={{
            minWidth: 0,
            minHeight: 0,
            display: 'grid',
            gap: 10,
            overflow: 'hidden',
          }}
        >
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </div>
    </div>
  )
}