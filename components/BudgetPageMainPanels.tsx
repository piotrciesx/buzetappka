'use client'

import { ComponentPropsWithRef } from 'react'
import BudgetTreeSection from './BudgetTreeSection'
import BulkActionsBar from './BulkActionsBar'
import CategoryMigrationPrompt from './CategoryMigrationPrompt'
import DraftsPanel from './DraftsPanel'
import FinancialGoalsContainer from './FinancialGoalsContainer'
import HiddenCategoriesPanel from './HiddenCategoriesPanel'
import ImportExportPanel from './ImportExportPanel'
import MonthCalendarPanel from './MonthCalendarPanel'
import PaymentSourcesPanel from './PaymentSourcesPanel'
import RecurringTransactionsPanel from './RecurringTransactionsPanel'
import SearchPanel from './SearchPanel'
import TrashPanel from './TrashPanel'
import UndoBanner from './UndoBanner'
import type { AppModuleVisibility } from '../lib/useAppModuleVisibility'

export type BudgetUtilityPanel =
  | 'drafts'
  | 'importExport'
  | 'paymentSources'
  | 'financialGoals'
  | 'recurringTransactions'
  | 'search'
  | 'monthCalendar'
  | 'hiddenCategories'
  | 'trash'
  | null

type Props = {
  visibleModules: AppModuleVisibility
  canCreateTransactions: boolean
  activeUtilityPanel: BudgetUtilityPanel
  onCloseUtilityPanel: () => void
  undoBannerProps: ComponentPropsWithRef<typeof UndoBanner> | null
  categoryMigrationPromptProps: ComponentPropsWithRef<typeof CategoryMigrationPrompt> | null
  bulkActionsBarProps: ComponentPropsWithRef<typeof BulkActionsBar> | null
  draftsPanelProps: ComponentPropsWithRef<typeof DraftsPanel>
  importExportPanelProps: ComponentPropsWithRef<typeof ImportExportPanel>
  paymentSourcesPanelProps: ComponentPropsWithRef<typeof PaymentSourcesPanel>
  financialGoalsContainerProps: ComponentPropsWithRef<typeof FinancialGoalsContainer>
  recurringTransactionsPanelProps: ComponentPropsWithRef<typeof RecurringTransactionsPanel>
  searchPanelProps: ComponentPropsWithRef<typeof SearchPanel>
  monthCalendarPanelProps: ComponentPropsWithRef<typeof MonthCalendarPanel>
  budgetTreeSectionProps: ComponentPropsWithRef<typeof BudgetTreeSection>
  hiddenCategoriesPanelProps: ComponentPropsWithRef<typeof HiddenCategoriesPanel>
  trashPanelProps: ComponentPropsWithRef<typeof TrashPanel>
}

export default function BudgetPageMainPanels({
  visibleModules,
  canCreateTransactions,
  activeUtilityPanel,
  onCloseUtilityPanel,
  undoBannerProps,
  categoryMigrationPromptProps,
  bulkActionsBarProps,
  draftsPanelProps,
  importExportPanelProps,
  paymentSourcesPanelProps,
  financialGoalsContainerProps,
  recurringTransactionsPanelProps,
  searchPanelProps,
  monthCalendarPanelProps,
  budgetTreeSectionProps,
  hiddenCategoriesPanelProps,
  trashPanelProps,
}: Props) {
  const utilityPanelTitle =
    activeUtilityPanel === 'drafts'
      ? 'Szkice'
      : activeUtilityPanel === 'importExport'
        ? 'Dane / backup'
        : activeUtilityPanel === 'paymentSources'
          ? 'Źródła płatności'
          : activeUtilityPanel === 'financialGoals'
            ? 'Cele finansowe'
            : activeUtilityPanel === 'recurringTransactions'
              ? 'Przypomnienia / raty'
              : activeUtilityPanel === 'search'
                ? 'Wyszukiwarka'
                : activeUtilityPanel === 'monthCalendar'
                  ? 'Kalendarz miesiąca'
                  : activeUtilityPanel === 'hiddenCategories'
                    ? 'Ukryte kategorie'
                    : activeUtilityPanel === 'trash'
                      ? 'Kosz'
                      : ''

  return (
    <>
      {undoBannerProps && <UndoBanner {...undoBannerProps} />}

      {categoryMigrationPromptProps && <CategoryMigrationPrompt {...categoryMigrationPromptProps} />}

      {canCreateTransactions && bulkActionsBarProps && <BulkActionsBar {...bulkActionsBarProps} />}

      {activeUtilityPanel && (
        <div data-budget-utility-overlay="true">
          <button
            type="button"
            aria-label="Zamknij panel"
            data-budget-utility-backdrop="true"
            onClick={onCloseUtilityPanel}
          />
          <aside
            data-budget-utility-panel="true"
            data-utility-panel-kind={activeUtilityPanel}
            aria-label={utilityPanelTitle}
          >
            <div data-budget-utility-header="true">
              <div>{utilityPanelTitle}</div>
              <button type="button" onClick={onCloseUtilityPanel} aria-label="Zamknij panel">
                ×
              </button>
            </div>

            <div data-budget-utility-body="true">
              {activeUtilityPanel === 'drafts' && <DraftsPanel {...draftsPanelProps} />}
              {activeUtilityPanel === 'importExport' && (
                <ImportExportPanel {...importExportPanelProps} />
              )}
              {activeUtilityPanel === 'paymentSources' && visibleModules.paymentSources && (
                <PaymentSourcesPanel {...paymentSourcesPanelProps} />
              )}
              {activeUtilityPanel === 'financialGoals' && visibleModules.financialGoals && (
                <FinancialGoalsContainer {...financialGoalsContainerProps} />
              )}
              {activeUtilityPanel === 'recurringTransactions' &&
                visibleModules.recurringTransactions && (
                  <RecurringTransactionsPanel {...recurringTransactionsPanelProps} />
                )}
              {activeUtilityPanel === 'search' && <SearchPanel {...searchPanelProps} />}
              {activeUtilityPanel === 'monthCalendar' && (
                <MonthCalendarPanel {...monthCalendarPanelProps} />
              )}
              {activeUtilityPanel === 'hiddenCategories' && (
                <HiddenCategoriesPanel {...hiddenCategoriesPanelProps} />
              )}
              {activeUtilityPanel === 'trash' && <TrashPanel {...trashPanelProps} />}
            </div>
          </aside>
        </div>
      )}

      <BudgetTreeSection {...budgetTreeSectionProps} />
    </>
  )
}
