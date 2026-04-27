import { Dispatch, SetStateAction, useCallback } from 'react'
import { sortCategoriesForDisplay } from './budgetPageHelpers'
import { Category, Tag, Transaction, TransactionPaymentSplit } from './budgetPageTypes'
import { supabase } from './supabaseClient'
import { fetchTransactionTagsMap } from './tagUtils'

type UseBudgetPageDataParams = {
  setStatus: Dispatch<SetStateAction<string>>
  setErrorText: Dispatch<SetStateAction<string>>
  setCategories: Dispatch<SetStateAction<Category[]>>
  setTransactions: Dispatch<SetStateAction<Transaction[]>>
  setTrashedTransactions: Dispatch<SetStateAction<Transaction[]>>
  setTransactionPaymentSplitsMap: Dispatch<SetStateAction<Record<string, TransactionPaymentSplit[]>>>
  setTransactionTagsMap: Dispatch<SetStateAction<Record<string, Tag[]>>>
  setTags: Dispatch<SetStateAction<Tag[]>>
  resetTreeOpenState: (firstLevel1Id: string | null) => void
  loadMonthNavigationSettings: () => Promise<void>
  loadLockedMonths: () => Promise<void>
  loadPaymentSources: () => Promise<void>
  loadRecurringTransactions: () => Promise<void>
  loadFinancialGoals: () => Promise<void>
  loadDrafts: () => Promise<void>
}

export function useBudgetPageData({
  setStatus,
  setErrorText,
  setCategories,
  setTransactions,
  setTrashedTransactions,
  setTransactionPaymentSplitsMap,
  setTransactionTagsMap,
  setTags,
  resetTreeOpenState,
  loadMonthNavigationSettings,
  loadLockedMonths,
  loadPaymentSources,
  loadRecurringTransactions,
  loadFinancialGoals,
  loadDrafts,
}: UseBudgetPageDataParams) {
  const loadData = useCallback(async () => {
    setStatus('Ładowanie...')
    setErrorText('')

    await loadMonthNavigationSettings()
    await loadLockedMonths()

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, parent_id, level, default_order, sort_order, active_to, reactivate_from')
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (categoriesError) {
      setErrorText(categoriesError.message)
      setStatus('Błąd przy pobieraniu kategorii')
      return
    }

    const nextCategories = sortCategoriesForDisplay((categoriesData || []) as Category[])
    const firstLevel1Id = nextCategories.find((category) => category.level === 1)?.id || null

    setCategories(nextCategories)
    resetTreeOpenState(firstLevel1Id)

    const trashAutoDeleteCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { error: trashCleanupError } = await supabase
      .from('transactions')
      .delete()
      .eq('is_deleted', true)
      .lt('deleted_at', trashAutoDeleteCutoff)

    if (trashCleanupError) {
      setErrorText(trashCleanupError.message)
      setStatus('Błąd przy czyszczeniu kosza')
      return
    }

    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select(
        'id, category_id, amount, description, date, day_is_null, payment_source_id, recurring_transaction_id, created_at, is_deleted, deleted_at'
      )
      .eq('is_deleted', false)
      .order('date', { ascending: false })

    if (transactionsError) {
      setErrorText(transactionsError.message)
      setStatus('Błąd przy pobieraniu wpisów')
      return
    }

    const nextTransactions = (transactionsData || []) as Transaction[]
    setTransactions(nextTransactions)

    const { data: splitRows, error: splitRowsError } = await supabase
      .from('transaction_payment_splits')
      .select('id, transaction_id, payment_source_id, amount, created_at')
      .in(
        'transaction_id',
        nextTransactions.length > 0
          ? nextTransactions.map((transaction) => transaction.id)
          : ['00000000-0000-0000-0000-000000000000']
      )

    if (splitRowsError) {
      setErrorText(splitRowsError.message)
      setStatus('Błąd przy pobieraniu splitów płatności')
      return
    }

    const nextSplitsMap = ((splitRows || []) as TransactionPaymentSplit[]).reduce<
      Record<string, TransactionPaymentSplit[]>
    >((acc, row) => {
      if (!acc[row.transaction_id]) {
        acc[row.transaction_id] = []
      }

      acc[row.transaction_id].push({
        ...row,
        amount: Number(row.amount),
      })

      return acc
    }, {})

    setTransactionPaymentSplitsMap(nextSplitsMap)

    const { data: trashedTransactionsData, error: trashedTransactionsError } = await supabase
      .from('transactions')
      .select(
        'id, category_id, amount, description, date, day_is_null, payment_source_id, recurring_transaction_id, created_at, is_deleted, deleted_at'
      )
      .eq('is_deleted', true)
      .order('deleted_at', { ascending: false })

    if (trashedTransactionsError) {
      setErrorText(trashedTransactionsError.message)
      setStatus('Błąd przy pobieraniu kosza')
      return
    }

    setTrashedTransactions((trashedTransactionsData || []) as Transaction[])

    try {
      await loadPaymentSources()
      await loadRecurringTransactions()
      await loadFinancialGoals()

      const nextTransactionTagsMap = await fetchTransactionTagsMap(
        supabase,
        nextTransactions.map((transaction) => transaction.id)
      )

      setTransactionTagsMap(nextTransactionTagsMap)
      setTags(
        Array.from(
          new Map(
            Object.values(nextTransactionTagsMap)
              .flat()
              .map((tag) => [tag.id, tag])
          ).values()
        ).sort((left, right) => left.name.localeCompare(right.name, 'pl', { sensitivity: 'base' }))
      )
    } catch (tagError) {
      const tagErrorMessage =
        tagError instanceof Error ? tagError.message : 'Nie udało się pobrać tagów'
      setErrorText(tagErrorMessage)
      setStatus('Błąd przy pobieraniu tagów')
      return
    }

    await loadDrafts()

    if (!categoriesData || categoriesData.length === 0) {
      setStatus('Brak kategorii z bazy')
      return
    }

    setStatus('OK')
  }, [
    loadDrafts,
    loadFinancialGoals,
    loadLockedMonths,
    loadMonthNavigationSettings,
    loadPaymentSources,
    loadRecurringTransactions,
    resetTreeOpenState,
    setCategories,
    setErrorText,
    setStatus,
    setTags,
    setTransactionPaymentSplitsMap,
    setTransactionTagsMap,
    setTransactions,
    setTrashedTransactions,
  ])

  return { loadData }
}