'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Dispatch, SetStateAction } from 'react'
import FloatingActionButtons from './FloatingActionButtons'
import TransactionCreatorModal from './TransactionCreatorModal'
import DraftPromptModal from './DraftPromptModal'

type PaymentSplitInput = {
  paymentSourceId: string
  amount: string
}

type Props = {
  // FAB
  canCreateTransactions: boolean
  expenseLevel1Id: string | null
  incomeLevel1Id: string | null
  openFloatingTransactionCreator: (level1Id: string) => void

  // Transaction modal
  isTransactionCreatorOpen: boolean
  selectedMonth: string
  level1: any[]
  sortedLevel2ByParentIdForModal: any
  sortedLevel3ByParentIdForModal: any
  categoriesById: Record<string, any>
  transactionCreatorSuggestionId: string | null
  transactionCreatorLockedLevel1Id: string | null
  topShortcutCategories: any[]
  recentShortcutCategories: any[]
  descriptionSuggestions: any
  applyTransactionCategorySelection: (id: string) => void
  selectedTransactionTypeId: string | null
  setSelectedTransactionTypeIdWithPaymentSource: (id: string | null) => void
  selectedLevel2Id: string | null
  setSelectedLevel2Id: (id: string | null) => void
  selectedTransactionCategoryId: string | null
  setSelectedTransactionCategoryId: (id: string | null) => void
  isSerialTransactionCreatorEnabled: boolean
  setIsSerialTransactionCreatorEnabled: (v: boolean) => void
  newAmount: string
  setNewAmount: (v: string) => void
  newDescription: string
  setNewDescription: (v: string) => void
  newTransactionDate: string
  setNewTransactionDate: (v: string) => void
  selectedTagNames: string[]
  setSelectedTagNames: Dispatch<SetStateAction<string[]>>
  selectedPaymentSourceId: string
  setSelectedPaymentSourceId: (v: string) => void
  currentTransactionCreatorPaymentSourceOptions: any[]
  isTransactionCreatorPaymentSourceVisible: boolean
  selectedPaymentSplitItems: PaymentSplitInput[]
  setSelectedPaymentSplitItems: Dispatch<SetStateAction<PaymentSplitInput[]>>
  selectedRecurringTransactionId: string
  setSelectedRecurringTransactionId: (v: string) => void
  recurringOptionItems: any[]
  recurringSuggestionItems: any[]
  isSaving: boolean
  resetTransactionCreator: () => void
  handleSaveTransaction: (close?: boolean) => Promise<void>
  amountInputRef: any
  descriptionInputRef: any
  styles: any
  handleDeleteDescriptionSuggestion: any

  // Draft modal
  draftPromptState: any
  setDraftPromptState: any
  applyDraftToTransactionCreator: any
  deleteDraft: any
  openBlankFloatingTransactionCreator: any
}

export default function BudgetPageOverlays(props: Props) {
  const {
    canCreateTransactions,
    expenseLevel1Id,
    incomeLevel1Id,
    openFloatingTransactionCreator,

    isTransactionCreatorOpen,
    selectedMonth,
    level1,
    sortedLevel2ByParentIdForModal,
    sortedLevel3ByParentIdForModal,
    categoriesById,
    transactionCreatorSuggestionId,
    transactionCreatorLockedLevel1Id,
    topShortcutCategories,
    recentShortcutCategories,
    descriptionSuggestions,
    applyTransactionCategorySelection,
    selectedTransactionTypeId,
    setSelectedTransactionTypeIdWithPaymentSource,
    selectedLevel2Id,
    setSelectedLevel2Id,
    selectedTransactionCategoryId,
    setSelectedTransactionCategoryId,
    isSerialTransactionCreatorEnabled,
    setIsSerialTransactionCreatorEnabled,
    newAmount,
    setNewAmount,
    newDescription,
    setNewDescription,
    newTransactionDate,
    setNewTransactionDate,
    selectedTagNames,
    setSelectedTagNames,
    selectedPaymentSourceId,
    setSelectedPaymentSourceId,
    currentTransactionCreatorPaymentSourceOptions,
    isTransactionCreatorPaymentSourceVisible,
    selectedPaymentSplitItems,
    setSelectedPaymentSplitItems,
    selectedRecurringTransactionId,
    setSelectedRecurringTransactionId,
    recurringOptionItems,
    recurringSuggestionItems,
    isSaving,
    resetTransactionCreator,
    handleSaveTransaction,
    amountInputRef,
    descriptionInputRef,
    styles,
    handleDeleteDescriptionSuggestion,

    draftPromptState,
    setDraftPromptState,
    applyDraftToTransactionCreator,
    deleteDraft,
    openBlankFloatingTransactionCreator,
  } = props

  return (
    <>
      {canCreateTransactions && expenseLevel1Id && incomeLevel1Id && (
        <FloatingActionButtons
          expenseLevel1Id={expenseLevel1Id}
          incomeLevel1Id={incomeLevel1Id}
          onOpenExpense={() => openFloatingTransactionCreator(expenseLevel1Id)}
          onOpenIncome={() => openFloatingTransactionCreator(incomeLevel1Id)}
          styles={styles}
        />
      )}

      <TransactionCreatorModal
        isOpen={isTransactionCreatorOpen}
        selectedMonth={selectedMonth}
        level1Categories={level1}
        level2ByParentId={sortedLevel2ByParentIdForModal}
        level3ByParentId={sortedLevel3ByParentIdForModal}
        categoriesById={categoriesById}
        suggestedCategoryId={transactionCreatorSuggestionId}
        lockedLevel1Id={transactionCreatorLockedLevel1Id}
        topShortcutCategories={topShortcutCategories}
        recentShortcutCategories={recentShortcutCategories}
        descriptionSuggestions={descriptionSuggestions}
        onSelectShortcutCategory={applyTransactionCategorySelection}
        selectedLevel1Id={selectedTransactionTypeId}
        setSelectedLevel1Id={setSelectedTransactionTypeIdWithPaymentSource}
        selectedLevel2Id={selectedLevel2Id}
        setSelectedLevel2Id={setSelectedLevel2Id}
        selectedCategoryId={selectedTransactionCategoryId}
        setSelectedCategoryId={setSelectedTransactionCategoryId}
        isSerialModeEnabled={isSerialTransactionCreatorEnabled}
        setIsSerialModeEnabled={setIsSerialTransactionCreatorEnabled}
        amount={newAmount}
        setAmount={setNewAmount}
        description={newDescription}
        setDescription={setNewDescription}
        transactionDate={newTransactionDate}
        setTransactionDate={setNewTransactionDate}
        selectedTagNames={selectedTagNames}
        setSelectedTagNames={setSelectedTagNames}
        selectedPaymentSourceId={selectedPaymentSourceId}
        setSelectedPaymentSourceId={setSelectedPaymentSourceId}
        paymentSourceOptions={currentTransactionCreatorPaymentSourceOptions}
        isPaymentSourceVisible={isTransactionCreatorPaymentSourceVisible}
        paymentSplitItems={selectedPaymentSplitItems}
        setPaymentSplitItems={setSelectedPaymentSplitItems}
        selectedRecurringTransactionId={selectedRecurringTransactionId}
        setSelectedRecurringTransactionId={setSelectedRecurringTransactionId}
        recurringOptions={recurringOptionItems}
        recurringSuggestions={recurringSuggestionItems}
        isSaving={isSaving}
        onClose={resetTransactionCreator}
        onSave={handleSaveTransaction}
        onSaveAndClose={async () => {
          await handleSaveTransaction(true)
        }}
        amountInputRef={amountInputRef}
        descriptionInputRef={descriptionInputRef}
        styles={styles}
        onDeleteDescriptionSuggestion={handleDeleteDescriptionSuggestion}
      />

      <DraftPromptModal
        draftPromptState={draftPromptState}
        setDraftPromptState={setDraftPromptState}
        applyDraftToTransactionCreator={applyDraftToTransactionCreator}
        deleteDraft={deleteDraft}
        openBlankFloatingTransactionCreator={openBlankFloatingTransactionCreator}
        styles={styles}
      />
    </>
  )
}
