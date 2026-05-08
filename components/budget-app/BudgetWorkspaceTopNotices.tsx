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

const hiddenLabelStyle: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
}

const NoticeIcon = ({ type }: { type: 'alert' | 'note' }) => {
  if (type === 'alert') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M12 3 2.8 19h18.4L12 3Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M12 9v4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M12 17h.01"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M7 4h8l3 3v13H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M15 4v4h4M8.5 12h7M8.5 16h5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
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
          <summary aria-label="Alert miesiąca" title="Alert miesiąca">
            <NoticeIcon type="alert" />
            <span style={hiddenLabelStyle}>Alert miesiąca</span>
          </summary>
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
        <summary aria-label="Notatka miesiąca" title="Notatka miesiąca">
          <NoticeIcon type="note" />
          <span style={hiddenLabelStyle}>Notatka miesiąca</span>
        </summary>
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