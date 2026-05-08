import type {
  CSSProperties,
  Dispatch,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  RefObject,
  SetStateAction,
} from 'react'
import type { Tag, TransactionPaymentSplit } from '../../lib/budgetPageTypes'
import type { PaymentSplitInput } from '../../lib/paymentSplitUtils'
import type { DescriptionSuggestion } from '../../lib/suggestionUtils'
import Level3TransactionRow from './Level3TransactionRow'
import {
  getTransactionDayGroupLabel,
  type MoveTarget,
  type Transaction,
} from './Level3SectionUtils'

type PaymentSourceOption = {
  id: string
  name: string
  type: string
  optionLabel?: string
}

type Level3TransactionsListProps = {
  transactions: Transaction[]
  selectedMonth: string
  isSelectedMonthLocked: boolean
  editingTransactionId: string | null
  movingTransactionId: string | null
  isUpdating: boolean
  isMoving: boolean
  moveTargetCategoryId: string
  editDay: string
  setEditDay: Dispatch<SetStateAction<string>>
  editAmount: string
  setEditAmount: Dispatch<SetStateAction<string>>
  editDescription: string
  setEditDescription: Dispatch<SetStateAction<string>>
  editTagNames: string[]
  setEditTagNames: Dispatch<SetStateAction<string[]>>
  editTagInput: string
  setEditTagInput: Dispatch<SetStateAction<string>>
  editPaymentSourceId: string
  setEditPaymentSourceId: Dispatch<SetStateAction<string>>
  editPaymentSplitItems: PaymentSplitInput[]
  setEditPaymentSplitItems: Dispatch<SetStateAction<PaymentSplitInput[]>>
  editDayInputRef: RefObject<HTMLInputElement | null>
  editAmountInputRef: RefObject<HTMLInputElement | null>
  editDescriptionInputRef: RefObject<HTMLInputElement | null>
  filteredEditSuggestions: DescriptionSuggestion[]
  activeEditSuggestionIndex: number
  handleEditSuggestionKeyDown: (event: KeyboardEvent<HTMLInputElement>) => boolean
  applyEditSuggestion: (text: string) => void
  handleEditSuggestionContextMenu: (
    event: MouseEvent<HTMLButtonElement>,
    suggestion: DescriptionSuggestion
  ) => void
  handleEditSuggestionPointerDown: (
    suggestion: DescriptionSuggestion,
    event: PointerEvent<HTMLButtonElement>
  ) => void
  handleEditSuggestionPointerUp: () => void
  handleEditSuggestionPointerLeave: () => void
  handleEditFieldKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    transactionId: string,
    field: 'amount' | 'description' | 'tags'
  ) => Promise<void>
  setIsEditDescriptionFocused: Dispatch<SetStateAction<boolean>>
  setMoveTargetCategoryId: Dispatch<SetStateAction<string>>
  selectedTransactionIds: string[]
  onToggleTransactionSelection: (transactionId: string) => void
  getMoveTargetsForTransaction: (transaction: Transaction) => MoveTarget[]
  getAmountNumber: (value: unknown) => number
  getPaymentSourceOptions: (categoryId: string) => PaymentSourceOption[]
  transactionTagsMap: Record<string, Tag[]>
  transactionPaymentSplitsMap: Record<string, TransactionPaymentSplit[]>
  canUsePaymentSources: boolean
  onTagClick?: (tagId: string) => void
  startEditingTransaction: (transaction: Transaction) => void
  cancelEditingTransaction: () => void
  saveEditingTransaction: (transactionId: string) => Promise<void>
  startMovingTransaction: (transaction: Transaction) => void
  cancelMovingTransaction: () => void
  saveMovingTransaction: (transactionId: string) => Promise<void>
  handleDeleteTransaction: (id: string) => Promise<void>
  handleDuplicateTransaction?: (transaction: Transaction) => void
  styles: Record<string, CSSProperties>
}

export default function Level3TransactionsList({
  transactions,
  selectedMonth,
  isSelectedMonthLocked,
  editingTransactionId,
  movingTransactionId,
  isUpdating,
  isMoving,
  moveTargetCategoryId,
  editDay,
  setEditDay,
  editAmount,
  setEditAmount,
  editDescription,
  setEditDescription,
  editTagNames,
  setEditTagNames,
  editTagInput,
  setEditTagInput,
  editPaymentSourceId,
  setEditPaymentSourceId,
  editPaymentSplitItems,
  setEditPaymentSplitItems,
  editDayInputRef,
  editAmountInputRef,
  editDescriptionInputRef,
  filteredEditSuggestions,
  activeEditSuggestionIndex,
  handleEditSuggestionKeyDown,
  applyEditSuggestion,
  handleEditSuggestionContextMenu,
  handleEditSuggestionPointerDown,
  handleEditSuggestionPointerUp,
  handleEditSuggestionPointerLeave,
  handleEditFieldKeyDown,
  setIsEditDescriptionFocused,
  setMoveTargetCategoryId,
  selectedTransactionIds,
  onToggleTransactionSelection,
  getMoveTargetsForTransaction,
  getAmountNumber,
  getPaymentSourceOptions,
  transactionTagsMap,
  transactionPaymentSplitsMap,
  canUsePaymentSources,
  onTagClick,
  startEditingTransaction,
  cancelEditingTransaction,
  saveEditingTransaction,
  startMovingTransaction,
  cancelMovingTransaction,
  saveMovingTransaction,
  handleDeleteTransaction,
  handleDuplicateTransaction,
  styles,
}: Level3TransactionsListProps) {
  return (
    <>
      {transactions.length === 0 && <div style={styles.emptyText}>Brak wpisów w tym miesiącu</div>}

      {transactions.map((transaction, index) => {
        const dayGroupLabel = getTransactionDayGroupLabel(transaction, selectedMonth)
        const previousTransaction = transactions[index - 1]
        const shouldShowDayGroup =
          !previousTransaction ||
          getTransactionDayGroupLabel(previousTransaction, selectedMonth) !== dayGroupLabel

        return (
          <div key={transaction.id} data-transaction-day-entry="true">
            {shouldShowDayGroup && <div data-transaction-day-header="true">{dayGroupLabel}</div>}

            <Level3TransactionRow
              transaction={transaction}
              selectedMonth={selectedMonth}
              isSelectedMonthLocked={isSelectedMonthLocked}
              isSelected={selectedTransactionIds.includes(transaction.id)}
              isEditing={editingTransactionId === transaction.id}
              isMovingCurrent={movingTransactionId === transaction.id}
              isUpdating={isUpdating}
              isMoving={isMoving}
              moveTargetCategoryId={moveTargetCategoryId}
              moveTargets={getMoveTargetsForTransaction(transaction)}
              transactionTags={transactionTagsMap[transaction.id] || []}
              editDay={editDay}
              setEditDay={setEditDay}
              editAmount={editAmount}
              setEditAmount={setEditAmount}
              editDescription={editDescription}
              setEditDescription={setEditDescription}
              editTagNames={editTagNames}
              setEditTagNames={setEditTagNames}
              editTagInput={editTagInput}
              setEditTagInput={setEditTagInput}
              editPaymentSourceId={editPaymentSourceId}
              setEditPaymentSourceId={setEditPaymentSourceId}
              editPaymentSplitItems={editPaymentSplitItems}
              setEditPaymentSplitItems={setEditPaymentSplitItems}
              editDayInputRef={editDayInputRef}
              editAmountInputRef={editAmountInputRef}
              editDescriptionInputRef={editDescriptionInputRef}
              filteredEditSuggestions={filteredEditSuggestions}
              activeEditSuggestionIndex={activeEditSuggestionIndex}
              handleEditSuggestionKeyDown={handleEditSuggestionKeyDown}
              applyEditSuggestion={applyEditSuggestion}
              handleEditSuggestionContextMenu={handleEditSuggestionContextMenu}
              handleEditSuggestionPointerDown={handleEditSuggestionPointerDown}
              handleEditSuggestionPointerUp={handleEditSuggestionPointerUp}
              handleEditSuggestionPointerLeave={handleEditSuggestionPointerLeave}
              handleEditFieldKeyDown={handleEditFieldKeyDown}
              setIsEditDescriptionFocused={setIsEditDescriptionFocused}
              setMoveTargetCategoryId={setMoveTargetCategoryId}
              onToggleTransactionSelection={onToggleTransactionSelection}
              onTagClick={onTagClick}
              getAmountNumber={getAmountNumber}
              getPaymentSourceOptions={getPaymentSourceOptions}
              transactionPaymentSplitsMap={transactionPaymentSplitsMap}
              canUsePaymentSources={canUsePaymentSources}
              startEditingTransaction={startEditingTransaction}
              cancelEditingTransaction={cancelEditingTransaction}
              saveEditingTransaction={saveEditingTransaction}
              startMovingTransaction={startMovingTransaction}
              cancelMovingTransaction={cancelMovingTransaction}
              saveMovingTransaction={saveMovingTransaction}
              handleDeleteTransaction={handleDeleteTransaction}
              handleDuplicateTransaction={handleDuplicateTransaction}
              styles={styles}
            />
          </div>
        )
      })}
    </>
  )
}
