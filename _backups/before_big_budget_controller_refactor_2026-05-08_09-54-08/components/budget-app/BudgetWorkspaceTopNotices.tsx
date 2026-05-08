'use client'

import type { CSSProperties } from 'react'
import BudgetLimitAlertsPanel from '../BudgetLimitAlertsPanel'
import ProfileMonthNotePanel from '../ProfileMonthNotePanel'
import type { Category } from '../../lib/budgetPageTypes'
import type { BudgetLimitUsageState } from '../../lib/useBudgetLimits'

type BudgetWorkspaceTopNoticesProps = {
  previousMonthCloseReminder: string | null
  profileId: string
  userId: string
  selectedMonth: string
  isBudgetLimitsVisible: boolean
  activeBudgetLimitsCount: number
  activeBudgetLimitAlerts: BudgetLimitUsageState[]
  categoriesById: Record<string, Category>
  styles: Record<string, CSSProperties>
  onLockMonth: (month: string) => Promise<void>
  onHidePreviousMonthCloseReminder: () => void
  onOpenBudgetLimit: (categoryId: string | null) => void
}

export default function BudgetWorkspaceTopNotices({
  previousMonthCloseReminder,
  profileId,
  userId,
  selectedMonth,
  isBudgetLimitsVisible,
  activeBudgetLimitsCount,
  activeBudgetLimitAlerts,
  categoriesById,
  styles,
  onLockMonth,
  onHidePreviousMonthCloseReminder,
  onOpenBudgetLimit,
}: BudgetWorkspaceTopNoticesProps) {
  return (
    <div data-budget-status-grid="true">
      {previousMonthCloseReminder && (
        <details data-budget-compact-notice="alert">
          <summary>Alert miesiąca</summary>
          <div>Poprzedni miesiąc {previousMonthCloseReminder} nie jest jeszcze zamknięty.</div>
          <div data-budget-actions-row="true" style={{ ...styles.actions, marginTop: 8 }}>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={async () => {
                const confirmed = confirm(
                  `Czy na pewno zamknąć poprzedni miesiąc ${previousMonthCloseReminder}?`
                )

                if (!confirmed) {
                  return
                }

                await onLockMonth(previousMonthCloseReminder)
              }}
            >
              Zamknij
            </button>
            <button type="button" style={styles.secondaryButton} onClick={onHidePreviousMonthCloseReminder}>
              Później
            </button>
          </div>
        </details>
      )}

      <details data-budget-compact-notice="note">
        <summary>Notatka miesiąca</summary>
        <ProfileMonthNotePanel
          profileId={profileId}
          userId={userId}
          selectedMonth={selectedMonth}
          styles={styles}
        />
      </details>

      {isBudgetLimitsVisible && activeBudgetLimitsCount > 0 && (
        <section data-budget-compact-notice="limits">
          <div data-workspace-card-title="true">Limity</div>
          <BudgetLimitAlertsPanel
            alerts={activeBudgetLimitAlerts}
            categoriesById={categoriesById}
            styles={styles}
            onOpenLimit={onOpenBudgetLimit}
          />
        </section>
      )}
    </div>
  )
}
