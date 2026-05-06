'use client'

import { ComponentProps, CSSProperties } from 'react'
import AppSettingsPanel from './AppSettingsPanel'
import BudgetHeaderPanel from './BudgetHeaderPanel'
import BudgetLimitAlertsPanel from './BudgetLimitAlertsPanel'
import ReminderBellPanel from './ReminderBellPanel'
import UserProfileMenu from './UserProfileMenu'
import type { AppModuleVisibility } from '../lib/useAppModuleVisibility'

type Props = {
  styles: Record<string, CSSProperties>
  visibleModules: AppModuleVisibility
  userProfileMenuProps: ComponentProps<typeof UserProfileMenu>
  budgetHeaderPanelProps: ComponentProps<typeof BudgetHeaderPanel>
  previousMonthCloseReminder: string | null
  onLockPreviousMonth: (month: string) => Promise<void>
  onHidePreviousMonthReminder: () => void
  budgetLimitAlertsPanelProps: ComponentProps<typeof BudgetLimitAlertsPanel>
  reminderBellPanelProps: ComponentProps<typeof ReminderBellPanel>
  appSettingsPanelProps: ComponentProps<typeof AppSettingsPanel>
  isSettingsPanelVisible: boolean
  hasActiveBudgetLimits: boolean
}

export default function BudgetPageStatusPanels({
  styles,
  visibleModules,
  userProfileMenuProps,
  budgetHeaderPanelProps,
  previousMonthCloseReminder,
  onLockPreviousMonth,
  onHidePreviousMonthReminder,
  budgetLimitAlertsPanelProps,
  reminderBellPanelProps,
  appSettingsPanelProps,
  isSettingsPanelVisible,
  hasActiveBudgetLimits,
}: Props) {
  return (
    <>
      <div
        data-budget-header-row="true"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          alignItems: 'start',
          flexWrap: 'wrap',
          minWidth: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={styles.pageTitle}>Budżet testowy</div>
          <div style={styles.pageSubtitle}>Wersja robocza do wygodniejszego klikania i testowania</div>
        </div>
        <UserProfileMenu {...userProfileMenuProps} />
      </div>

      <BudgetHeaderPanel {...budgetHeaderPanelProps} />

      {previousMonthCloseReminder && (
        <div style={styles.infoBox}>
          Poprzedni miesiąc {previousMonthCloseReminder} nie jest jeszcze zamknięty.
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

                await onLockPreviousMonth(previousMonthCloseReminder)
              }}
            >
              Zamknij poprzedni miesiąc
            </button>
            <button type="button" style={styles.secondaryButton} onClick={onHidePreviousMonthReminder}>
              Przypomnij później
            </button>
          </div>
        </div>
      )}

      {(visibleModules.recurringTransactions ||
        (visibleModules.budgetLimits && hasActiveBudgetLimits)) && (
        <div
          data-budget-status-actions="true"
          style={{ ...styles.topPanel, display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}
        >
          {visibleModules.budgetLimits && hasActiveBudgetLimits && (
            <BudgetLimitAlertsPanel {...budgetLimitAlertsPanelProps} />
          )}

          {visibleModules.recurringTransactions && <ReminderBellPanel {...reminderBellPanelProps} />}
        </div>
      )}

      {isSettingsPanelVisible && <AppSettingsPanel {...appSettingsPanelProps} />}
    </>
  )
}
