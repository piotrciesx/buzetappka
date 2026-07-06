'use client'

import { ComponentPropsWithRef, useEffect, useState } from 'react'
import BudgetTreeSection from './BudgetTreeSection'
import BudgetLimitsV1Panel from './BudgetLimitsV1Panel'
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
  | 'budgetLimits'
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
  budgetLimitsPanelProps: ComponentPropsWithRef<typeof BudgetLimitsV1Panel>
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
  budgetLimitsPanelProps,
  searchPanelProps,
  monthCalendarPanelProps,
  budgetTreeSectionProps,
  hiddenCategoriesPanelProps,
  trashPanelProps,
}: Props) {
  const [paymentSourceCreateRequest, setPaymentSourceCreateRequest] = useState(0)
  const [paymentSourceDetailsId, setPaymentSourceDetailsId] = useState<string | null>(null)

  useEffect(() => {
    if (activeUtilityPanel !== 'paymentSources') {
      const task = window.setTimeout(() => setPaymentSourceDetailsId(null), 0)
      return () => window.clearTimeout(task)
    }
  }, [activeUtilityPanel])

  const handleUtilityPanelAdd = () => {
    if (activeUtilityPanel === 'paymentSources') {
      setPaymentSourceCreateRequest((value) => value + 1)
      return
    }

    if (activeUtilityPanel === 'financialGoals') {
      window.dispatchEvent(new CustomEvent('budget-open-financial-goal-create'))
      return
    }

    if (activeUtilityPanel === 'recurringTransactions') {
      window.dispatchEvent(new CustomEvent('budget-open-recurring-payment-create'))
      return
    }

    if (activeUtilityPanel === 'budgetLimits') {
      window.dispatchEvent(new CustomEvent('budget-open-budget-limit-create'))
    }
  }

  const getUtilityPanelAddLabel = () => {
    if (activeUtilityPanel === 'paymentSources') return 'Dodaj źródło'
    if (activeUtilityPanel === 'financialGoals') return 'Dodaj cel'
    if (activeUtilityPanel === 'recurringTransactions') return 'Dodaj płatność'
    if (activeUtilityPanel === 'budgetLimits') return 'Dodaj limit'
    return null
  }

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
              ? 'Stałe płatności'
              : activeUtilityPanel === 'budgetLimits'
                ? 'Limity budżetowe'
              : activeUtilityPanel === 'search'
                ? 'Wyszukiwarka'
                : activeUtilityPanel === 'monthCalendar'
                  ? 'Kalendarz miesiąca'
                  : activeUtilityPanel === 'hiddenCategories'
                    ? 'Ukryte kategorie'
                    : activeUtilityPanel === 'trash'
                      ? 'Kosz'
                      : ''

  const utilityPanelDescription =
    activeUtilityPanel === 'drafts'
      ? 'Zapisane wersje robocze wpisów gotowe do dokończenia.'
      : activeUtilityPanel === 'importExport'
        ? 'Eksport, import i kopie bezpieczeństwa Twoich danych.'
        : activeUtilityPanel === 'paymentSources'
          ? 'Zarządzaj źródłami przychodów i wydatków używanymi w kreatorze wpisów.'
          : activeUtilityPanel === 'financialGoals'
            ? 'Śledź cele, postęp i planowane oszczędności.'
            : activeUtilityPanel === 'recurringTransactions'
              ? 'Kontroluj stałe płatności, raty i cykliczne operacje.'
              : activeUtilityPanel === 'budgetLimits'
                ? 'Twórz limity wydatków, kontroluj wykorzystanie, alerty i historię.'
              : activeUtilityPanel === 'search'
                ? 'Szukaj wpisów, kategorii i informacji w budżecie.'
                : activeUtilityPanel === 'monthCalendar'
                  ? 'Przeglądaj wpisy i aktywność w układzie miesiąca.'
                  : activeUtilityPanel === 'hiddenCategories'
                    ? 'Zarządzaj ukrytymi kategoriami i ich przywracaniem.'
                    : activeUtilityPanel === 'trash'
                      ? 'Przeglądaj usunięte elementy i przywracaj je w razie potrzeby.'
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
            <header data-management-module-header="true">
              <div data-management-module-header-copy="true">
                <h2>{utilityPanelTitle}</h2>
                {utilityPanelDescription && <p>{utilityPanelDescription}</p>}
              </div>

              <div data-management-module-header-actions="true">
                {getUtilityPanelAddLabel() && (
                  <button
                    type="button"
                    data-management-module-add="true"
                    onClick={handleUtilityPanelAdd}
                  >
                    <span aria-hidden="true" data-management-module-add-icon="true">+</span>
                    <span>{getUtilityPanelAddLabel()}</span>
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Zamknij panel"
                  data-management-module-close="true"
                  onClick={onCloseUtilityPanel}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            </header>

            <div data-budget-utility-body="true">
              {activeUtilityPanel === 'drafts' && <DraftsPanel {...draftsPanelProps} />}
              {activeUtilityPanel === 'importExport' && (
                <ImportExportPanel {...importExportPanelProps} />
              )}
              {activeUtilityPanel === 'paymentSources' && visibleModules.paymentSources && (
                <PaymentSourcesPanel
                  {...paymentSourcesPanelProps}
                  openCreateRequest={paymentSourceCreateRequest}
                  selectedSourceDetailsId={paymentSourceDetailsId}
                  onSelectedSourceDetailsIdChange={setPaymentSourceDetailsId}
                />
              )}
              {activeUtilityPanel === 'financialGoals' && visibleModules.financialGoals && (
                <FinancialGoalsContainer {...financialGoalsContainerProps} />
              )}
              {activeUtilityPanel === 'recurringTransactions' &&
                visibleModules.recurringTransactions && (
                  <RecurringTransactionsPanel {...recurringTransactionsPanelProps} />
                )}
              {activeUtilityPanel === 'budgetLimits' && visibleModules.budgetLimits && (
                <BudgetLimitsV1Panel {...budgetLimitsPanelProps} />
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
