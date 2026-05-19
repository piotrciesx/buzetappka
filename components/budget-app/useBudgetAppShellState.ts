'use client'

import { useCallback, useMemo } from 'react'
import type { BudgetUtilityPanel } from '../BudgetPageMainPanels'
import type { Transaction } from '../../lib/budgetPageTypes'
import { useAppModuleVisibility } from '../../lib/useAppModuleVisibility'
import { useBudgetMonthNavigation } from '../../lib/useBudgetMonthNavigation'
import { filterTransactionsByBudgetStartDate } from '../../lib/transactionScope'
import { useFloatingDropdownDismissal } from './useFloatingDropdownDismissal'
import type { SidebarPrimaryPanel } from './useBudgetAppCoreState'

type Params = {
  profileId: string
  userId: string
  transactions: Transaction[]
  activeSidebarPrimaryPanel: SidebarPrimaryPanel
  setActiveSidebarPrimaryPanel: (value: SidebarPrimaryPanel | ((previous: SidebarPrimaryPanel) => SidebarPrimaryPanel)) => void
  activeUtilityPanel: BudgetUtilityPanel
  setActiveUtilityPanel: (value: BudgetUtilityPanel) => void
}

export function useBudgetAppShellState({
  profileId,
  userId,
  transactions,
  activeSidebarPrimaryPanel,
  setActiveSidebarPrimaryPanel,
  activeUtilityPanel,
  setActiveUtilityPanel,
}: Params) {
  const isSettingsPanelVisible = activeSidebarPrimaryPanel === 'settings'
  const setIsSettingsPanelVisible = useCallback(
    (value: boolean | ((previousValue: boolean) => boolean)) => {
      setActiveSidebarPrimaryPanel((previousPanel) => {
        const previousValue = previousPanel === 'settings'
        const nextValue = typeof value === 'function' ? value(previousValue) : value

        if (nextValue) {
          return 'settings'
        }

        return previousPanel === 'settings' ? null : previousPanel
      })
    },
    [setActiveSidebarPrimaryPanel]
  )

  const moduleVisibility = useAppModuleVisibility({ profileId, userId })
  const monthNavigation = useBudgetMonthNavigation({ profileId })

  useFloatingDropdownDismissal()

  const effectiveVisibleModules = useMemo(
    () =>
      monthNavigation.simpleMode
        ? {
            ...moduleVisibility.visibleModules,
            dashboard: true,
            monthCalendar: true,
            paymentSources: false,
            recurringTransactions: false,
            financialGoals: false,
            budgetLimits: false,
          }
        : {
            ...moduleVisibility.visibleModules,
            dashboard: true,
            monthCalendar: true,
          },
    [monthNavigation.simpleMode, moduleVisibility.visibleModules]
  )

  const scopedTransactions = useMemo(
    () => filterTransactionsByBudgetStartDate(transactions, monthNavigation.budgetStartDate),
    [monthNavigation.budgetStartDate, transactions]
  )

  return {
    activeUtilityPanel,
    effectiveVisibleModules,
    isBudgetLimitsModuleEnabled: effectiveVisibleModules.budgetLimits,
    isMonthCalendarModuleEnabled: effectiveVisibleModules.monthCalendar,
    isPaymentSourcesModuleEnabled: effectiveVisibleModules.paymentSources,
    isRecurringTransactionsModuleEnabled: effectiveVisibleModules.recurringTransactions,
    isSettingsPanelVisible,
    moduleVisibility,
    monthNavigation,
    scopedTransactions,
    setActiveUtilityPanel,
    setIsSettingsPanelVisible,
  }
}
