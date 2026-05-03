import { SupabaseClient } from '@supabase/supabase-js'
import { useCallback } from 'react'
import { Category, HideMode, RestoreMode, Transaction, UndoAction } from './budgetPageTypes'
import {
  getCategoryIdsCoveredByHide,
  isCategoryClosingAfterSelectedMonth,
} from './categoryUtils'
import {
  getActiveToForMonth,
  getMonthNumber,
  getMonthStartIso,
  getNextMonthText,
} from './dateUtils'
import { getTransactionsForCategoriesFromMonth } from './transactionUtils'

type MigrationPromptState = {
  categoryId: string
  mode: HideMode
  hideMonth: string
  transactionIds: string[]
  targetCategoryId: string
  errorText: string
}

type UseCategoryVisibilityActionsParams = {
  supabase: SupabaseClient
  categories: Category[]
  transactions: Transaction[]
  selectedMonth: string
  activeTransactionsById: Record<string, Transaction>
  loadData: () => Promise<void>
  clearTransactionOperationUi: () => void
  clearTransactionSelection: () => void
  resetTransactionCreator: () => void
  moveTransactionsToCategory: (transactionIds: string[], targetCategoryId: string) => Promise<void>
  getCommonMoveTargetsForTransactions: (items: Transaction[]) => { id: string }[]
  setMigrationPromptState: React.Dispatch<React.SetStateAction<MigrationPromptState | null>>
  setLastUndoAction: React.Dispatch<React.SetStateAction<UndoAction | null>>
  setOpenAddSubcategoryFor: React.Dispatch<React.SetStateAction<string | null>>
  setNewSubcategoryName: React.Dispatch<React.SetStateAction<string>>
}

export function useCategoryVisibilityActions({
  supabase,
  categories,
  transactions,
  selectedMonth,
  activeTransactionsById,
  loadData,
  clearTransactionOperationUi,
  clearTransactionSelection,
  resetTransactionCreator,
  moveTransactionsToCategory,
  getCommonMoveTargetsForTransactions,
  setMigrationPromptState,
  setLastUndoAction,
  setOpenAddSubcategoryFor,
  setNewSubcategoryName,
}: UseCategoryVisibilityActionsParams) {
  const performHideCategoryUpdate = useCallback(
    async (categoryId: string, mode: HideMode) => {
      const hideMonth = mode === 'now' ? selectedMonth : getNextMonthText(selectedMonth)
      const activeToValue = getActiveToForMonth(hideMonth)

      const { data: updatedCategory, error } = await supabase
        .from('categories')
        .update({
          active_to: activeToValue,
          reactivate_from: null,
        })
        .eq('id', categoryId)
        .select('id, active_to, reactivate_from')
        .maybeSingle()

      if (error) {
        throw error
      }

      if (!updatedCategory) {
        throw new Error('hide-category-update-missing')
      }

      setOpenAddSubcategoryFor(null)
      setNewSubcategoryName('')
      resetTransactionCreator()
      clearTransactionOperationUi()

      await loadData()

      if (mode === 'now') {
        alert(`Kategoria została ukryta od ${selectedMonth}`)
        return
      }

      alert(`Kategoria została ustawiona do zamknięcia od ${activeToValue.slice(0, 7)}`)
    },
    [
      clearTransactionOperationUi,
      loadData,
      resetTransactionCreator,
      selectedMonth,
      setNewSubcategoryName,
      setOpenAddSubcategoryFor,
      supabase,
    ]
  )

  const handleConfirmCategoryMigration = useCallback(
    async (migrationPromptState: MigrationPromptState | null) => {
      if (!migrationPromptState) {
        return
      }

      const impactedTransactions = transactions.filter((transaction) =>
        migrationPromptState.transactionIds.includes(transaction.id)
      )
      const commonMoveTargets = getCommonMoveTargetsForTransactions(impactedTransactions)

      if (!migrationPromptState.targetCategoryId) {
        setMigrationPromptState((prev) =>
          prev
            ? {
                ...prev,
                errorText: 'Wybierz kategorię docelową.',
              }
            : null
        )
        return
      }

      if (!commonMoveTargets.some((target) => target.id === migrationPromptState.targetCategoryId)) {
        setMigrationPromptState((prev) =>
          prev
            ? {
                ...prev,
                errorText: 'Wybrana kategoria nie pasuje do wszystkich wpisów.',
              }
            : null
        )
        return
      }

      try {
        await moveTransactionsToCategory(
          migrationPromptState.transactionIds,
          migrationPromptState.targetCategoryId
        )

        setLastUndoAction({
          type: 'move',
          label: `Przeniesiono ${migrationPromptState.transactionIds.length} wpisów przed zmianą kategorii.`,
          moves: migrationPromptState.transactionIds
            .map((transactionId) => activeTransactionsById[transactionId])
            .filter((transaction): transaction is Transaction => !!transaction)
            .map((transaction) => ({
              id: transaction.id,
              fromCategoryId: transaction.category_id,
              toCategoryId: migrationPromptState.targetCategoryId,
            })),
        })

        await performHideCategoryUpdate(migrationPromptState.categoryId, migrationPromptState.mode)
      } catch (error) {
        if (error instanceof Error) {
          setMigrationPromptState((prev) =>
            prev
              ? {
                  ...prev,
                  errorText: `Nie udało się przenieść wpisów: ${error.message}`,
                }
              : null
          )
        }
      }
    },
    [
      activeTransactionsById,
      getCommonMoveTargetsForTransactions,
      moveTransactionsToCategory,
      performHideCategoryUpdate,
      setLastUndoAction,
      setMigrationPromptState,
      transactions,
    ]
  )

  const handleHideCategory = useCallback(
    async (categoryId: string, mode: HideMode = 'next') => {
      const category = categories.find((item) => item.id === categoryId)

      if (!category) {
        alert('Nie znaleziono kategorii')
        return
      }

      if (category.level === 1) {
        alert('Nie można ukryć kategorii głównej')
        return
      }

      const hideMonth = mode === 'now' ? selectedMonth : getNextMonthText(selectedMonth)
      const categoryIdsToCheck = getCategoryIdsCoveredByHide(categories, categoryId)
      const blockedTransactions = getTransactionsForCategoriesFromMonth(
        transactions,
        categoryIdsToCheck,
        hideMonth
      )

      if (blockedTransactions.length > 0) {
        clearTransactionSelection()
        setMigrationPromptState({
          categoryId,
          mode,
          hideMonth,
          transactionIds: blockedTransactions.map((transaction) => transaction.id),
          targetCategoryId: '',
          errorText: '',
        })
        return
      }

      const confirmText =
        mode === 'now'
          ? `Czy na pewno chcesz ukryć tę kategorię już w ${selectedMonth}?`
          : 'Czy na pewno chcesz ukryć tę kategorię?\n\nKategoria zamknie się z końcem bieżącego miesiąca.'

      const confirm1 = confirm(confirmText)

      if (!confirm1) {
        return
      }

      try {
        await performHideCategoryUpdate(categoryId, mode)
      } catch (error) {
        if (error instanceof Error && error.message === 'hide-category-update-missing') {
          alert('Nie udało się ukryć kategorii w bazie. Najpewniej update nie przeszedł.')
          return
        }

        if (error instanceof Error) {
          alert(`Błąd ukrywania: ${error.message}`)
        }
      }
    },
    [
      categories,
      clearTransactionSelection,
      performHideCategoryUpdate,
      selectedMonth,
      setMigrationPromptState,
      transactions,
    ]
  )

  const handleUndoScheduledHide = useCallback(
    async (categoryId: string) => {
      const category = categories.find((item) => item.id === categoryId)

      if (!category) {
        alert('Nie znaleziono kategorii')
        return
      }

      if (!isCategoryClosingAfterSelectedMonth(category, selectedMonth)) {
        alert('Ta kategoria nie ma zaplanowanego zamknięcia od następnego miesiąca')
        return
      }

      const confirm1 = confirm('Czy na pewno chcesz cofnąć zaplanowane zamknięcie tej kategorii?')

      if (!confirm1) {
        return
      }

      const { data: updatedCategory, error } = await supabase
        .from('categories')
        .update({
          active_to: null,
          reactivate_from: null,
        })
        .eq('id', categoryId)
        .select('id, active_to, reactivate_from')
        .maybeSingle()

      if (error) {
        alert(`Błąd cofania zamknięcia: ${error.message}`)
        return
      }

      if (!updatedCategory) {
        alert('Nie udało się cofnąć zamknięcia kategorii w bazie.')
        return
      }

      await loadData()
      alert('Zaplanowane zamknięcie kategorii zostało cofnięte')
    },
    [categories, loadData, selectedMonth, supabase]
  )

  const handleRestoreCategory = useCallback(
    async (categoryId: string, mode: RestoreMode = 'now') => {
      const category = categories.find((item) => item.id === categoryId)

      if (!category) {
        alert('Nie znaleziono kategorii')
        return
      }

      if (!category.active_to) {
        alert('Ta kategoria nie jest ustawiona do zamknięcia')
        return
      }

      const targetMonth = mode === 'now' ? selectedMonth : getNextMonthText(selectedMonth)
      const hiddenFromMonth = category.active_to.slice(0, 7)

      if (getMonthNumber(targetMonth) < getMonthNumber(hiddenFromMonth)) {
        alert(`Kategoria może wrócić najwcześniej od ${hiddenFromMonth}`)
        return
      }

      const confirmText =
        mode === 'now'
          ? `Czy na pewno chcesz przywrócić tę kategorię od ${selectedMonth}?`
          : `Czy na pewno chcesz przywrócić tę kategorię od ${targetMonth}?`

      const confirm1 = confirm(confirmText)

      if (!confirm1) {
        return
      }

      const reactivateFromValue = getMonthStartIso(targetMonth)

      const { data: updatedCategory, error } = await supabase
        .from('categories')
        .update({
          reactivate_from: reactivateFromValue,
        })
        .eq('id', categoryId)
        .select('id, active_to, reactivate_from')
        .maybeSingle()

      if (error) {
        alert(`Błąd ustawiania powrotu: ${error.message}`)
        return
      }

      if (!updatedCategory) {
        alert('Nie udało się ustawić miesiąca powrotu w bazie.')
        return
      }

      setOpenAddSubcategoryFor(null)
      setNewSubcategoryName('')
      resetTransactionCreator()

      await loadData()
      alert(`Kategoria wróci od ${targetMonth}`)
    },
    [
      categories,
      loadData,
      resetTransactionCreator,
      selectedMonth,
      setNewSubcategoryName,
      setOpenAddSubcategoryFor,
      supabase,
    ]
  )

  return {
    handleConfirmCategoryMigration,
    handleHideCategory,
    handleUndoScheduledHide,
    handleRestoreCategory,
  }
}
