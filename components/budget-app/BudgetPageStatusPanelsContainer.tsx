'use client'

import BudgetPageStatusPanels from '../BudgetPageStatusPanels'
import ProfileMembersPanel from '../ProfileMembersPanel'
import { downloadProfileBackupCsv, downloadProfileBackupJson } from '../../lib/exportBackup'
import { useUserPublicProfile } from '../../lib/useUserPublicProfile'

type BudgetPageStatusPanelsContainerProps = {
  ctx: Record<string, any>
}

export default function BudgetPageStatusPanelsContainer({
  ctx,
}: BudgetPageStatusPanelsContainerProps) {
  const {
    activeUtilityPanel,
    activeSidebarPrimaryPanel,
    autoExcludePartialMonths,
    budgetStartDate,
    calendarHeatmapVariant,
    categories,
    copyInviteLink,
    createInvitation,
    currentMonth,
    draftVisibleModules,
    effectiveVisibleModules,
    errorText,
    goToNextMonth,
    goToPrevMonth,
    handleLockAllPastMonths,
    handleLockSelectedMonth,
    handleResetAllHistory,
    handleResetHeatmapSettings,
    handleResetSelectedMonthData,
    handleSaveMonthNavigationSettingsWithStartDateWarning,
    handleToggleSelectedMonthExcludedWithConfirm,
    handleUnlockAllPastMonths,
    handleUnlockSelectedMonth,
    heatmapInverted,
    heatmapMode,
    hiddenCategoriesInSelectedMonth,
    invitationErrorText,
    invitationStatusText,
    inviteEmail,
    inviteLink,
    isDashboardPanelOpen,
    isFutureMonthNavigationLocked,
    isInvitationWorking,
    isNextMonthNavigationBlocked,
    isPrevMonthNavigationBlocked,
    isSavingMonthNavigationSettings,
    isSelectedMonthExcluded,
    isSelectedMonthLocked,
    isSettingsPanelVisible,
    isUpdatingSelectedMonthExclusion,
    isUpdatingSelectedMonthLock,
    maxAllowedMonth,
    minAllowedMonth,
    moduleVisibilitySaveStatusText,
    monthNavigationErrorText,
    onCurrentUserLeftProfile,
    openBlankFloatingTransactionCreator,
    profileId,
    recentTransactionPreviews,
    resetDraftVisibleModules,
    saveVisibleModules,
    scopedTransactions,
    selectedMonth,
    setActiveUtilityPanel,
    setActiveSidebarPrimaryPanel,
    setAutoExcludePartialMonths,
    setBudgetStartDate,
    setCalendarHeatmapVariant,
    setDraftModuleVisibility,
    setHeatmapInverted,
    setHeatmapMode,
    setInviteEmail,
    setIsDashboardPanelOpen,
    setIsFutureMonthNavigationLocked,
    setIsSettingsPanelVisible,
    setMonthNavigationErrorText,
    setMonthNavigationStartMonth,
    setSelectedMonth,
    setShowHiddenCategories,
    setSimpleMode,
    showHiddenCategories,
    signOut,
    simpleMode,
    status,
    styles,
    supabase,
    transactions,
    userEmail,
    userId,
    visibleCategories,
    visibleModules,
  } = ctx
  const {
    displayName: userDisplayName,
    avatarKey: userAvatarKey,
  } = useUserPublicProfile(userId, userEmail)

  const profileTransactions = (
    Array.isArray(transactions) ? transactions : scopedTransactions
  ) as Array<{ amount?: number | string; category_id?: string }>
  const categoryNamesById = new Map<string, string>(
    categories.map((category: { id: string; name: string }) => [category.id, category.name])
  )
  const signedAmountGetter =
    typeof ctx.getSignedAmountForTransaction === 'function'
      ? ctx.getSignedAmountForTransaction
      : (transaction: { amount?: number | string }) => Number(transaction.amount || 0)
  const profileTotalBalance = profileTransactions.reduce(
    (total: number, transaction) => total + signedAmountGetter(transaction),
    0
  )
  const profileCategoryCounts = new Map<string, number>()

  profileTransactions.forEach((transaction) => {
    const categoryId = transaction.category_id || ''

    if (!categoryId) {
      return
    }

    profileCategoryCounts.set(categoryId, (profileCategoryCounts.get(categoryId) || 0) + 1)
  })

  const topProfileCategories = Array.from(profileCategoryCounts)
    .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
    .slice(0, 5)
    .map(([categoryId, count]) => ({
      id: categoryId,
      name: categoryNamesById.get(categoryId) || 'Kategoria',
      count,
    }))

  const handleOpenProfilePanel = () => {
    setIsDashboardPanelOpen(false)
    setActiveUtilityPanel(null)
    setActiveSidebarPrimaryPanel((previousValue: string | null) =>
      previousValue === 'profile' ? null : 'profile'
    )
  }

  const handleOpenSettingsPanel = () => {
    setIsDashboardPanelOpen(false)
    setActiveUtilityPanel(null)
    setActiveSidebarPrimaryPanel((previousValue: string | null) =>
      previousValue === 'settings' ? null : 'settings'
    )
  }

  const handleClosePrimaryPanel = () => {
    setActiveSidebarPrimaryPanel(null)
  }

  const handleToggleImportExport = () => {
    setIsDashboardPanelOpen(false)
    setActiveSidebarPrimaryPanel(null)
    setActiveUtilityPanel((previousValue: string | null) =>
      previousValue === 'importExport' ? null : 'importExport'
    )
  }

  const handleToggleDashboard = () => {
    setActiveUtilityPanel(null)
    setActiveSidebarPrimaryPanel(null)
    setIsDashboardPanelOpen((previousValue: boolean) => !previousValue)
  }

  const handleOpenUtilityPanel = (panel: string | null) => {
    setIsDashboardPanelOpen(false)
    setActiveSidebarPrimaryPanel(null)
    setActiveUtilityPanel(panel)
  }

  return (
<BudgetPageStatusPanels
        styles={styles}
        userProfileMenuProps={{
          userEmail,
          displayName: userDisplayName,
          avatarKey: userAvatarKey,
          onToggleSettings: handleOpenSettingsPanel,
          onToggleImportExport: handleToggleImportExport,
          onExportBackupJson: () => downloadProfileBackupJson(supabase, profileId),
          onExportBackupCsv: () => downloadProfileBackupCsv(supabase, profileId, budgetStartDate),
          onSignOut: signOut,
          styles,
        }}
        budgetHeaderPanelProps={{
          selectedMonth,
          currentMonth,
          status,
          categoriesCount: categories.length,
          visibleCategoriesCount: visibleCategories.length,
          transactionsCount: scopedTransactions.length,
          hiddenCategoriesCount: hiddenCategoriesInSelectedMonth.length,
          showHiddenCategories,
          errorText,
          minAllowedMonth,
          maxAllowedMonth,
          budgetStartDate,
          monthNavigationFutureLocked: isFutureMonthNavigationLocked,
          isSavingMonthNavigationSettings,
          monthNavigationErrorText,
          isPrevMonthNavigationBlocked,
          isNextMonthNavigationBlocked,
          isSelectedMonthLocked,
          isUpdatingSelectedMonthLock,
          isSelectedMonthExcluded,
          isUpdatingSelectedMonthExclusion,
          heatmapMode,
          calendarHeatmapVariant,
          heatmapInverted,
          recentTransactions: recentTransactionPreviews,
          onHeatmapModeChange: setHeatmapMode,
          onCalendarHeatmapVariantChange: setCalendarHeatmapVariant,
          onHeatmapInvertedChange: setHeatmapInverted,
          onResetHeatmapSettings: handleResetHeatmapSettings,
          onPrevMonth: goToPrevMonth,
          onNextMonth: goToNextMonth,
          onGoToCurrentMonth: () => setSelectedMonth(currentMonth),
          onLockSelectedMonth: handleLockSelectedMonth,
          onUnlockSelectedMonth: handleUnlockSelectedMonth,
          onToggleHidden: () => setShowHiddenCategories((prev: boolean) => !prev),
          onBudgetStartDateChange: (value: string) => {
            setBudgetStartDate(value)
            setMonthNavigationStartMonth(value ? value.slice(0, 7) : '')
            setMonthNavigationErrorText('')
          },
          onMonthNavigationFutureLockedChange: (value: boolean) => {
            setIsFutureMonthNavigationLocked(value)
            setMonthNavigationErrorText('')
          },
          onSaveMonthNavigationSettings: handleSaveMonthNavigationSettingsWithStartDateWarning,
          onToggleSelectedMonthExcluded: handleToggleSelectedMonthExcludedWithConfirm,
          styles,
        }}
        appSettingsPanelProps={{
          simpleMode,
          onSimpleModeChange: setSimpleMode,
          autoExcludePartialMonths,
          onAutoExcludePartialMonthsChange: setAutoExcludePartialMonths,
          budgetStartDate,
          currentMonth,
          minAllowedMonth,
          maxAllowedMonth,
          monthNavigationFutureLocked: isFutureMonthNavigationLocked,
          isSavingMonthNavigationSettings,
          monthNavigationErrorText,
          onBudgetStartDateChange: (value: string) => {
            setBudgetStartDate(value)
            setMonthNavigationStartMonth(value ? value.slice(0, 7) : '')
            setMonthNavigationErrorText('')
          },
          onMonthNavigationFutureLockedChange: (value: boolean) => {
            setIsFutureMonthNavigationLocked(value)
            setMonthNavigationErrorText('')
          },
          onSaveMonthNavigationSettings: handleSaveMonthNavigationSettingsWithStartDateWarning,
          draftVisibleModules,
          saveStatusText: moduleVisibilitySaveStatusText,
          userEmail,
          displayName: userDisplayName,
          avatarKey: userAvatarKey,
          onChangeModuleVisibility: setDraftModuleVisibility,
          onSave: async () => {
            await handleSaveMonthNavigationSettingsWithStartDateWarning()
            await saveVisibleModules()
          },
          onResetDraft: resetDraftVisibleModules,
          onLockAllPastMonths: handleLockAllPastMonths,
          onUnlockAllPastMonths: handleUnlockAllPastMonths,
          onResetSelectedMonthData: handleResetSelectedMonthData,
          onResetAllHistory: handleResetAllHistory,
          onExportBackupJson: () => downloadProfileBackupJson(supabase, profileId),
          onExportBackupCsv: () => downloadProfileBackupCsv(supabase, profileId, budgetStartDate),
          styles,
          defaultOpen: true,
          profileMembersPanel: (
            <ProfileMembersPanel
              profileId={profileId}
              userId={userId}
              userEmail={userEmail}
              inviteEmail={inviteEmail}
              setInviteEmail={setInviteEmail}
              inviteLink={inviteLink}
              invitationStatusText={invitationStatusText}
              invitationErrorText={invitationErrorText}
              isInvitationWorking={isInvitationWorking}
              createInvitation={createInvitation}
              copyInviteLink={copyInviteLink}
              onCurrentUserLeftProfile={onCurrentUserLeftProfile}
              styles={styles}
            />
          ),
        }}
        visibleModules={effectiveVisibleModules}
        activeSidebarPrimaryPanel={activeSidebarPrimaryPanel}
        isSettingsPanelVisible={isSettingsPanelVisible}
        isDashboardOpen={isDashboardPanelOpen}
        onOpenProfilePanel={handleOpenProfilePanel}
        onOpenSettingsPanel={handleOpenSettingsPanel}
        onClosePrimaryPanel={handleClosePrimaryPanel}
        profilePanelProps={{
          userEmail,
          displayName: userDisplayName,
          avatarKey: userAvatarKey,
          accountCreatedAt: null,
          transactionsCount: profileTransactions.length,
          categoriesCount: categories.length,
          totalBalance: profileTotalBalance,
          topCategories: topProfileCategories,
        }}
        onToggleDashboard={handleToggleDashboard}
        activeUtilityPanel={activeUtilityPanel}
        onOpenUtilityPanel={handleOpenUtilityPanel}
        onQuickAdd={() => openBlankFloatingTransactionCreator(null)}
      />
  )
}
