'use client'

import { ComponentPropsWithRef, useEffect, useState } from 'react'
import BudgetTreeSection from './BudgetTreeSection'
import BudgetLimitsV1Panel from './BudgetLimitsV1Panel'
import BulkActionsBar from './BulkActionsBar'
import CategoryMigrationPrompt from './CategoryMigrationPrompt'
import CategoryIcon from './CategoryIcon'
import { HeroHeader, IconAction, PrimaryAction, SecondaryAction } from './ui/FoundationPrimitives'
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
import { getPaymentSourceColorTone, getPaymentSourceIconKey } from '../lib/paymentSources'

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

  const selectedPaymentSource =
    activeUtilityPanel === 'paymentSources' && paymentSourceDetailsId
      ? paymentSourcesPanelProps.paymentSources.find((source) => source.id === paymentSourceDetailsId) || null
      : null

  const selectedPaymentSourceIcon = selectedPaymentSource
    ? getPaymentSourceIconKey(selectedPaymentSource)
    : null

  const selectedPaymentSourceTone = selectedPaymentSource
    ? getPaymentSourceColorTone(selectedPaymentSource)
    : 'brand-primary'

  const handleCloseUtilityPanel = () => {
    setPaymentSourceDetailsId(null)
    onCloseUtilityPanel()
  }

  const renderPaymentSourceAvailability = (label: string, isActive: boolean) => (
    <span
      data-ui-status-pill="true"
      data-ui-pill-shape="soft-rect"
      data-ui-tone={isActive ? 'success' : 'danger'}
      data-active={isActive ? 'true' : 'false'}
    >
      <span aria-hidden="true">{isActive ? '✓' : '×'}</span>
      {label}
    </span>
  )

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

  const utilityPanelIcon =
    activeUtilityPanel === 'drafts'
      ? 'note'
      : activeUtilityPanel === 'importExport'
        ? 'exchange'
        : activeUtilityPanel === 'paymentSources'
          ? 'card'
          : activeUtilityPanel === 'financialGoals'
            ? 'system-goals'
            : activeUtilityPanel === 'recurringTransactions'
              ? 'calendar'
              : activeUtilityPanel === 'budgetLimits'
                ? 'alert'
              : activeUtilityPanel === 'search'
                ? 'info'
                : activeUtilityPanel === 'monthCalendar'
                  ? 'calendar'
                  : activeUtilityPanel === 'hiddenCategories'
                    ? 'other'
                    : activeUtilityPanel === 'trash'
                      ? 'trash'
                      : 'info'

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
            onClick={handleCloseUtilityPanel}
          />
          <aside
            data-budget-utility-panel="true"
            data-utility-panel-kind={activeUtilityPanel}
            aria-label={utilityPanelTitle}
          >
            <HeroHeader
              variant={selectedPaymentSource ? 'context' : 'module'}
              density={selectedPaymentSource ? 'comfort' : 'regular'}
              tone={selectedPaymentSource ? selectedPaymentSourceTone : 'brand-primary'}
              icon={
                <CategoryIcon
                  iconKey={selectedPaymentSourceIcon || utilityPanelIcon}
                />
              }
              title={selectedPaymentSource ? selectedPaymentSource.name : utilityPanelTitle}
              description={selectedPaymentSource ? null : utilityPanelDescription}
              metadata={
                selectedPaymentSource ? (
                  <span data-ui-status-pill-group="true">
                    {renderPaymentSourceAvailability(
                      'Przychody',
                      selectedPaymentSource.is_income_source !== false,
                    )}
                    {renderPaymentSourceAvailability(
                      'Wydatki',
                      selectedPaymentSource.is_expense_source !== false,
                    )}
                  </span>
                ) : null
              }
              primaryAction={
                selectedPaymentSource ? (
                  <SecondaryAction onClick={() => setPaymentSourceDetailsId(null)}>
                    Wróć do listy
                  </SecondaryAction>
                ) : activeUtilityPanel === 'paymentSources' ? (
                  <PrimaryAction onClick={() => setPaymentSourceCreateRequest((value) => value + 1)}>
                    <CategoryIcon iconKey="system-add" size="small" />
                    Dodaj źródło
                  </PrimaryAction>
                ) : activeUtilityPanel === 'financialGoals' ? (
                  <PrimaryAction onClick={() => window.dispatchEvent(new CustomEvent('budget-open-financial-goal-create'))}>
                    <CategoryIcon iconKey="system-add" size="small" />
                    Dodaj cel
                  </PrimaryAction>
                ) : activeUtilityPanel === 'recurringTransactions' ? (
                  <PrimaryAction onClick={() => window.dispatchEvent(new CustomEvent('budget-open-recurring-payment-create'))}>
                    <CategoryIcon iconKey="system-add" size="small" />
                    Dodaj płatność
                  </PrimaryAction>
                ) : activeUtilityPanel === 'budgetLimits' ? (
                  <PrimaryAction onClick={() => window.dispatchEvent(new CustomEvent('budget-open-budget-limit-create'))}>
                    <CategoryIcon iconKey="system-add" size="small" />
                    Dodaj limit
                  </PrimaryAction>
                ) : null
              }
              closeAction={
                <IconAction ariaLabel="Zamknij panel" onClick={handleCloseUtilityPanel}>
                  <CategoryIcon iconKey="close" />
                </IconAction>
              }
            />

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
