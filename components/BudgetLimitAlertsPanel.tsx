'use client'

import { CSSProperties, useMemo, useState } from 'react'
import type { Category } from '../lib/budgetPageTypes'
import { uiControlPrimitives, uiOverlayPrimitives, uiSurfacePrimitives } from '../lib/uiFoundation'
import type { BudgetLimitUsageState } from '../lib/useBudgetLimits'
import {
  ReminderCard,
  ReminderStatusBadge,
} from './reminder-calendar/reminderCalendarPrimitives'

type Props = {
  alerts: BudgetLimitUsageState[]
  categoriesById: Record<string, Category>
  styles: Record<string, CSSProperties>
  onOpenLimit: (categoryId: string | null) => void
}

const containerStyle: CSSProperties = {
  position: 'relative',
}

const countStyle: CSSProperties = {
  marginLeft: 6,
  minWidth: uiControlPrimitives.badge.danger.minWidth,
  height: uiControlPrimitives.badge.danger.height,
  borderRadius: uiControlPrimitives.badge.danger.radius,
  background: uiControlPrimitives.badge.danger.background,
  color: uiControlPrimitives.badge.danger.color,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 600,
}

const popoverStyle: CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 'calc(100% + 8px)',
  width: 400,
  maxWidth: 'calc(100vw - 32px)',
  padding: uiSurfacePrimitives.popoverSurface.padding,
  border: uiSurfacePrimitives.popoverSurface.border,
  borderRadius: uiSurfacePrimitives.popoverSurface.radius,
  background: uiSurfacePrimitives.popoverSurface.background,
  boxShadow: uiSurfacePrimitives.popoverSurface.shadow,
  zIndex: uiOverlayPrimitives.inlinePopover.layer,
}

const itemButtonStyle: CSSProperties = {
  width: '100%',
  display: 'block',
  padding: '10px 0',
  border: 'none',
  borderTop: '1px solid #f1f5f9',
  background: 'transparent',
  color: '#111827',
  textAlign: 'left',
  cursor: 'pointer',
}

const metaStyle: CSSProperties = {
  marginTop: 3,
  color: '#64748b',
  fontSize: 13,
  lineHeight: 1.35,
}

const formatMoney = (value: number) => `${value.toFixed(2)} zł`

const getCategoryLabel = (
  categoryId: string | null,
  categoriesById: Record<string, Category>
) => {
  if (!categoryId) {
    return 'Wszystkie wydatki'
  }

  return categoriesById[categoryId]?.name || 'Kategoria usunięta'
}

const getAlertMessage = (alert: BudgetLimitUsageState) => {
  if (alert.alertState.level === 'exceeded') {
    return 'Przekroczono limit'
  }

  return `Wydano ${Math.round(alert.usagePercent)}% limitu przed końcówką miesiąca`
}

const severityOrder = {
  exceeded: 0,
  strong: 1,
  warning: 2,
  none: 3,
}

export default function BudgetLimitAlertsPanel({
  alerts,
  categoriesById,
  styles,
  onOpenLimit,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const sortedAlerts = useMemo(
    () =>
      [...alerts].sort((left, right) => {
        const severityDiff =
          severityOrder[left.alertState.level] - severityOrder[right.alertState.level]

        if (severityDiff !== 0) {
          return severityDiff
        }

        return right.usagePercent - left.usagePercent
      }),
    [alerts]
  )

  return (
    <div style={containerStyle}>
      <button type="button" style={styles.secondaryButton} onClick={() => setIsOpen((prev) => !prev)}>
        Alerty limitów
        {alerts.length > 0 && <span style={countStyle}>{alerts.length}</span>}
      </button>

      {isOpen && (
        <div data-reminder-popover="true" style={popoverStyle}>
          <div style={styles.l2Name}>Alerty limitów</div>

          {sortedAlerts.length === 0 ? (
            <div style={styles.emptyText}>Brak aktywnych alertów limitów w tym miesiącu.</div>
          ) : (
            sortedAlerts.map((alert) => {
              const categoryLabel = getCategoryLabel(alert.limit.category_id, categoriesById)

              return (
                <button
                  key={alert.limit.id}
                  type="button"
                  style={itemButtonStyle}
                  onClick={() => {
                    onOpenLimit(alert.limit.category_id)
                    setIsOpen(false)
                  }}
                >
                  <ReminderCard style={{ padding: 0, border: 0, background: 'transparent' }}>
                    <div style={{ fontWeight: 600 }}>{categoryLabel}</div>
                    <div style={metaStyle}>
                    {formatMoney(alert.usageAmount)} / {formatMoney(alert.limit.amount)} ·{' '}
                    {alert.usagePercent.toFixed(1)}%
                    </div>
                    <ReminderStatusBadge
                      tone={alert.alertState.level === 'exceeded' ? 'danger' : 'warning'}
                      style={metaStyle}
                    >
                      {getAlertMessage(alert)}
                    </ReminderStatusBadge>
                  </ReminderCard>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
