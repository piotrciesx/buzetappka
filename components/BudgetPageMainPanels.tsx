'use client'

import { ComponentPropsWithRef } from 'react'
import BudgetTreeSection from './BudgetTreeSection'
import BulkActionsBar from './BulkActionsBar'
import CategoryMigrationPrompt from './CategoryMigrationPrompt'
import DashboardPanel from './DashboardPanel'
import DraftsPanel from './DraftsPanel'
import FinancialGoalsContainer from './FinancialGoalsContainer'
import HiddenCategoriesPanel from './HiddenCategoriesPanel'
import ImportExportPanel from './ImportExportPanel'
import MonthCalendarPanel from './MonthCalendarPanel'
import PaymentSourcesPanel from './PaymentSourcesPanel'
import SearchPanel from './SearchPanel'
import TrashPanel from './TrashPanel'
import UndoBanner from './UndoBanner'
import type { AppModuleVisibility } from '../lib/useAppModuleVisibility'

type Props = {
  visibleModules: AppModuleVisibility
  canCreateTransactions: boolean
  isImportExportPanelVisible: boolean
  dashboardPanelProps: ComponentPropsWithRef<typeof DashboardPanel>
  undoBannerProps: ComponentPropsWithRef<typeof UndoBanner> | null
  categoryMigrationPromptProps: ComponentPropsWithRef<typeof CategoryMigrationPrompt> | null
  bulkActionsBarProps: ComponentPropsWithRef<typeof BulkActionsBar> | null
  draftsPanelProps: ComponentPropsWithRef<typeof DraftsPanel>
  importExportPanelProps: ComponentPropsWithRef<typeof ImportExportPanel>
  paymentSourcesPanelProps: ComponentPropsWithRef<typeof PaymentSourcesPanel>
  financialGoalsContainerProps: ComponentPropsWithRef<typeof FinancialGoalsContainer>
  searchPanelProps: ComponentPropsWithRef<typeof SearchPanel>
  monthCalendarPanelProps: ComponentPropsWithRef<typeof MonthCalendarPanel>
  budgetTreeSectionProps: ComponentPropsWithRef<typeof BudgetTreeSection>
  hiddenCategoriesPanelProps: ComponentPropsWithRef<typeof HiddenCategoriesPanel>
  trashPanelProps: ComponentPropsWithRef<typeof TrashPanel>
}

export default function BudgetPageMainPanels({
  visibleModules,
  canCreateTransactions,
  isImportExportPanelVisible,
  dashboardPanelProps,
  undoBannerProps,
  categoryMigrationPromptProps,
  bulkActionsBarProps,
  draftsPanelProps,
  importExportPanelProps,
  paymentSourcesPanelProps,
  financialGoalsContainerProps,
  searchPanelProps,
  monthCalendarPanelProps,
  budgetTreeSectionProps,
  hiddenCategoriesPanelProps,
  trashPanelProps,
}: Props) {
  return (
    <>
      {visibleModules.dashboard && <DashboardPanel {...dashboardPanelProps} />}

      {undoBannerProps && <UndoBanner {...undoBannerProps} />}

      {categoryMigrationPromptProps && <CategoryMigrationPrompt {...categoryMigrationPromptProps} />}

      {canCreateTransactions && bulkActionsBarProps && <BulkActionsBar {...bulkActionsBarProps} />}

      <DraftsPanel {...draftsPanelProps} />

      {isImportExportPanelVisible && <ImportExportPanel {...importExportPanelProps} />}

      {visibleModules.paymentSources && <PaymentSourcesPanel {...paymentSourcesPanelProps} />}

      {visibleModules.financialGoals && <FinancialGoalsContainer {...financialGoalsContainerProps} />}

      <SearchPanel {...searchPanelProps} />

      {visibleModules.monthCalendar && <MonthCalendarPanel {...monthCalendarPanelProps} />}

      <BudgetTreeSection {...budgetTreeSectionProps} />

      <HiddenCategoriesPanel {...hiddenCategoriesPanelProps} />

      <TrashPanel {...trashPanelProps} />
    </>
  )
}
