'use client'

import { CSSProperties, useMemo, useState } from 'react'
import type { Category } from '../lib/budgetPageTypes'
import {
  uiControlPrimitives,
  uiTypographyTokens,
} from '../lib/uiFoundation'
import type { BudgetLimitView } from './BudgetLimitIndicator'
import {
  ReminderCard,
  ReminderStatusBadge,
} from './reminder-calendar/reminderCalendarPrimitives'
import DropdownShell from './dropdown/DropdownShell'

type Props = {
  alerts: BudgetLimitView[]
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
  fontSize: uiTypographyTokens.role.metadata,
  fontWeight: uiTypographyTokens.weight.semibold,
}

const itemButtonStyle: CSSProperties = {
  width: '100%',
  display: 'block',
  padding: '10px 0',
  border: 'none',
  borderTop: '1px solid var(--ui-color-soft-section-background)',
  background: 'transparent',
  color: 'var(--ui-color-primary-text)',
  textAlign: 'left',
  cursor: 'pointer',
}

const metaStyle: CSSProperties = {
  marginTop: 3,
  color: 'var(--ui-color-secondary-text)',
  fontSize: uiTypographyTokens.role.helper,
  lineHeight: uiTypographyTokens.lineHeight.body,
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

const getAlertMessage = (alert: BudgetLimitView) => {
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
      <DropdownShell
        open={isOpen}
        onOpenChange={setIsOpen}
        size="utility"
        trigger={(triggerProps) => (
          <button type="button" style={styles.secondaryButton} {...triggerProps}>
            Alerty limitów
            {alerts.length > 0 && <span style={countStyle}>{alerts.length}</span>}
          </button>
        )}
      >
        <div style={styles.l2Name}>Alerty limitów</div>

          {sortedAlerts.length === 0 ? (
            <div style={styles.emptyText}>Brak aktywnych alertów limitów w tym miesiącu.</div>
          ) : (
            sortedAlerts.map((alert) => {
              const categoryLabel = getCategoryLabel(alert.categoryId, categoriesById)

              return (
                <button
                  key={alert.planId}
                  type="button"
                  style={itemButtonStyle}
                  onClick={() => {
                    onOpenLimit(alert.categoryId)
                    setIsOpen(false)
                  }}
                >
                  <ReminderCard style={{ padding: 0, border: 0, background: 'transparent' }}>
                    <div style={{ fontWeight: uiTypographyTokens.weight.semibold }}>
                      {categoryLabel}
                    </div>
                    <div style={metaStyle}>
                    {formatMoney(alert.usageAmount)} / {formatMoney(alert.amount)} ·{' '}
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
      </DropdownShell>
    </div>
  )
}
