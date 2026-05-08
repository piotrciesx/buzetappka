'use client'

import BudgetPageStatusPanels from '../BudgetPageStatusPanels'
import ProfileMembersPanel from '../ProfileMembersPanel'
import { downloadProfileBackupCsv, downloadProfileBackupJson } from '../../lib/exportBackup'

type BudgetPageStatusPanelsContainerProps = {
  ctx: Record<string, any>
}

export default function BudgetPageStatusPanelsContainer({
  ctx,
}: BudgetPageStatusPanelsContainerProps) {
  const {
    activeUtilityPanel,
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
    userEmail,
    userId,
    visibleCategories,
    visibleModules,
  } = ctx

  return (
<BudgetPageStatusPanels
        styles={styles}
        userProfileMenuProps={{
          userEmail,
          onToggleSettings: () => setIsSettingsPanelVisible((previousValue: boolean) => !previousValue),
          onToggleImportExport: () =>
            setActiveUtilityPanel((previousValue: string | null) =>
              previousValue === 'importExport' ? null : 'importExport'
            ),
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
          draftVisibleModules,
          saveStatusText: moduleVisibilitySaveStatusText,
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
        isSettingsPanelVisible={isSettingsPanelVisible}
        isDashboardOpen={isDashboardPanelOpen}
        onToggleDashboard={() => setIsDashboardPanelOpen((previousValue: boolean) => !previousValue)}
        activeUtilityPanel={activeUtilityPanel}
        onOpenUtilityPanel={setActiveUtilityPanel}
        onQuickAdd={() => openBlankFloatingTransactionCreator(null)}
      />
  )
}
