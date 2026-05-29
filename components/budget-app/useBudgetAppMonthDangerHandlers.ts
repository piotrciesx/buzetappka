'use client'

import { useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Transaction } from '../../lib/budgetPageTypes'
import { getNextMonthText } from '../../lib/dateUtils'
import { isTransactionInMonth } from '../../lib/transactionDomain'

type Params = {
  supabase: SupabaseClient
  profileId: string
  selectedMonth: string
  budgetStartDate: string
  savedBudgetStartDate: string
  transactions: Transaction[]
  scopedTransactions: Transaction[]
  selectedMonthTransactions: Transaction[]
  isSelectedMonthExcluded: boolean
  handleSaveMonthNavigationSettings: () => Promise<void>
  handleToggleSelectedMonthExcluded: () => Promise<void>
  clearTransactionOperationUi: () => void
  clearTransactionSelection: () => void
  resetTransactionCreator: () => void
  loadData: () => Promise<void>
}

export function useBudgetAppMonthDangerHandlers({
  supabase,
  profileId,
  selectedMonth,
  budgetStartDate,
  savedBudgetStartDate,
  transactions,
  scopedTransactions,
  selectedMonthTransactions,
  isSelectedMonthExcluded,
  handleSaveMonthNavigationSettings,
  handleToggleSelectedMonthExcluded,
  clearTransactionOperationUi,
  clearTransactionSelection,
  resetTransactionCreator,
  loadData,
}: Params) {
  const handleSaveMonthNavigationSettingsWithStartDateWarning = useCallback(async () => {
    const nextBudgetStartDate = budgetStartDate.slice(0, 10)
    const previousBudgetStartDate = savedBudgetStartDate.slice(0, 10)

    if (
      nextBudgetStartDate &&
      nextBudgetStartDate !== previousBudgetStartDate &&
      transactions.some(
        (transaction) =>
          !transaction.is_deleted && transaction.date.slice(0, 10) < nextBudgetStartDate
      )
    ) {
      const confirmed = confirm(
        'Masz wpisy sprzed daty startowej. Te wpisy zostaną zachowane, ale nie będą liczone w statystykach. Czy na pewno chcesz zmienić datę startową?'
      )

      if (!confirmed) {
        return
      }
    }

    await handleSaveMonthNavigationSettings()
  }, [budgetStartDate, handleSaveMonthNavigationSettings, savedBudgetStartDate, transactions])

  const handleResetSelectedMonthData = useCallback(async () => {
    const monthTransactions = scopedTransactions.filter(
      (transaction) => isTransactionInMonth(transaction, selectedMonth)
    )

    if (monthTransactions.length === 0) {
      alert('Ten miesiąc nie ma wpisów do resetu.')
      return
    }

    const firstConfirmed = confirm(
      `Czy na pewno zresetować dane miesiąca ${selectedMonth}? Wpisy zostaną przeniesione do kosza, a kategorie i ustawienia zostaną bez zmian.`
    )

    if (!firstConfirmed) {
      return
    }

    const secondConfirmed = confirm(
      'To działanie jest trudne do cofnięcia przy większej liczbie wpisów. Czy na pewno kontynuować?'
    )

    if (!secondConfirmed) {
      return
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('profile_id', profileId)
      .eq('is_deleted', false)
      .gte(
        'date',
        budgetStartDate && budgetStartDate.slice(0, 7) === selectedMonth
          ? budgetStartDate.slice(0, 10)
          : `${selectedMonth}-01`
      )
      .lt('date', `${getNextMonthText(selectedMonth)}-01`)

    if (error) {
      alert(`Błąd resetu miesiąca: ${error.message}`)
      return
    }

    clearTransactionOperationUi()
    clearTransactionSelection()
    resetTransactionCreator()
    await loadData()
    alert(`Zresetowano wpisy z miesiąca ${selectedMonth}.`)
  }, [
    budgetStartDate,
    clearTransactionOperationUi,
    clearTransactionSelection,
    loadData,
    profileId,
    resetTransactionCreator,
    scopedTransactions,
    selectedMonth,
    supabase,
  ])

  const handleResetAllHistory = useCallback(async () => {
    const firstConfirmed = confirm(
      'Czy na pewno zresetować całą historię wpisów? Kategorie, ustawienia, źródła płatności, cele i przypomnienia zostaną bez zmian.'
    )

    if (!firstConfirmed) {
      return
    }

    const confirmationText = prompt(
      'To działanie jest nieodwracalne albo trudne do cofnięcia. Aby kontynuować, wpisz: USUŃ HISTORIĘ'
    )

    if (confirmationText !== 'USUŃ HISTORIĘ') {
      alert('Reset całej historii anulowany.')
      return
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('profile_id', profileId)
      .eq('is_deleted', false)

    if (error) {
      alert(`Błąd resetu historii: ${error.message}`)
      return
    }

    clearTransactionOperationUi()
    clearTransactionSelection()
    resetTransactionCreator()
    await loadData()
    alert('Zresetowano całą historię wpisów.')
  }, [
    clearTransactionOperationUi,
    clearTransactionSelection,
    loadData,
    profileId,
    resetTransactionCreator,
    supabase,
  ])

  const handleToggleSelectedMonthExcludedWithConfirm = useCallback(async () => {
    if (isSelectedMonthExcluded) {
      const confirmed = confirm('Czy na pewno chcesz przywrócić ten miesiąc do statystyk?')

      if (!confirmed) {
        return
      }

      await handleToggleSelectedMonthExcluded()
      return
    }

    const confirmed = confirm(
      'Czy na pewno chcesz wyłączyć ten miesiąc ze statystyk? Dane nie zostaną usunięte.'
    )

    if (!confirmed) {
      return
    }

    if (selectedMonthTransactions.length > 0) {
      const confirmedWithEntries = confirm(
        'Ten miesiąc zawiera wpisy. Wyłączenie miesiąca spowoduje, że nie będzie liczony w statystykach, trendach i dashboardzie. Dane nadal zostaną w historii. Czy na pewno?'
      )

      if (!confirmedWithEntries) {
        return
      }
    }

    await handleToggleSelectedMonthExcluded()
  }, [
    handleToggleSelectedMonthExcluded,
    isSelectedMonthExcluded,
    selectedMonthTransactions.length,
  ])

  return {
    handleResetAllHistory,
    handleResetSelectedMonthData,
    handleSaveMonthNavigationSettingsWithStartDateWarning,
    handleToggleSelectedMonthExcludedWithConfirm,
  }
}
