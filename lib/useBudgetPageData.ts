import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from 'react'
import { sortCategoriesForDisplay } from './budgetPageHelpers'
import { Category, Tag, Transaction, TransactionPaymentSplit } from './budgetPageTypes'
import { getNextMonthText } from './dateUtils'
import { supabase } from './supabaseClient'
import { fetchTransactionTagsMap } from './tagUtils'

type UseBudgetPageDataParams = {
  profileId: string
  selectedMonth: string
  budgetStartDate: string
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
  loadExcludedMonths: () => Promise<void>
  loadPaymentSources: () => Promise<void>
  loadRecurringTransactions: () => Promise<void>
  loadFinancialGoals: () => Promise<void>
  loadDrafts: () => Promise<void>
}

export function useBudgetPageData({
  profileId,
  selectedMonth,
  budgetStartDate,
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
  loadExcludedMonths,
  loadPaymentSources,
  loadRecurringTransactions,
  loadFinancialGoals,
  loadDrafts,
}: UseBudgetPageDataParams) {
  const activeProfileIdRef = useRef(profileId)

  useEffect(() => {
    activeProfileIdRef.current = profileId
    setCategories([])
    setTransactions([])
    setTrashedTransactions([])
    setTransactionPaymentSplitsMap({})
    setTransactionTagsMap({})
    setTags([])
    resetTreeOpenState(null)
    setErrorText('')
    setStatus(profileId ? 'Ładowanie...' : 'Brak profilu')
  }, [
    profileId,
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

  const loadData = useCallback(async () => {
    if (!profileId || !selectedMonth) {
      return
    }

    const loadProfileId = profileId
    const isStaleLoad = () => activeProfileIdRef.current !== loadProfileId

    setStatus('Ładowanie...')
    setErrorText('')

    await loadMonthNavigationSettings()
    if (isStaleLoad()) {
      return
    }

    await loadLockedMonths()
    if (isStaleLoad()) {
      return
    }

    await loadExcludedMonths()
    if (isStaleLoad()) {
      return
    }

    let { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, parent_id, level, default_order, sort_order, active_to, reactivate_from, icon_key')
      .eq('profile_id', profileId)
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (categoriesError && /icon_key|column/i.test(categoriesError.message)) {
      const fallbackResult = await supabase
        .from('categories')
        .select('id, name, parent_id, level, default_order, sort_order, active_to, reactivate_from')
        .eq('profile_id', profileId)
        .order('level', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      categoriesData = ((fallbackResult.data || []).map((category) => ({
        ...category,
        icon_key: null,
      })) as typeof categoriesData)
      categoriesError = fallbackResult.error
    }

    if (categoriesError) {
      setErrorText(categoriesError.message)
      setStatus('Błąd przy pobieraniu kategorii')
      return
    }

    if (isStaleLoad()) {
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
      .eq('profile_id', profileId)
      .eq('is_deleted', true)
      .lt('deleted_at', trashAutoDeleteCutoff)

    if (trashCleanupError) {
      setErrorText(trashCleanupError.message)
      setStatus('Błąd przy czyszczeniu kosza')
      return
    }

    if (isStaleLoad()) {
      return
    }

    const monthStartDate =
      budgetStartDate && budgetStartDate.slice(0, 7) === selectedMonth
        ? budgetStartDate.slice(0, 10)
        : `${selectedMonth}-01`
    const nextMonthStartDate = `${getNextMonthText(selectedMonth)}-01`

    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select(
        'id, category_id, amount, description, date, day_is_null, payment_source_id, recurring_transaction_id, created_at, is_deleted, deleted_at'
      )
      .eq('profile_id', profileId)
      .eq('is_deleted', false)
      .gte('date', monthStartDate)
      .lt('date', nextMonthStartDate)
      .order('date', { ascending: false })

    if (transactionsError) {
      setErrorText(transactionsError.message)
      setStatus('Błąd przy pobieraniu wpisów')
      return
    }

    if (isStaleLoad()) {
      return
    }

    const nextTransactions = (transactionsData || []) as Transaction[]
    const transactionIds = nextTransactions.map((transaction) => transaction.id)
    setTransactions(nextTransactions)

    const { data: splitRows, error: splitRowsError } =
      transactionIds.length > 0
        ? await supabase
            .from('transaction_payment_splits')
            .select('id, transaction_id, payment_source_id, amount, created_at')
            .in('transaction_id', transactionIds)
        : { data: [], error: null }

    if (splitRowsError) {
      setErrorText(splitRowsError.message)
      setStatus('Błąd przy pobieraniu splitów płatności')
      return
    }

    if (isStaleLoad()) {
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
      .eq('profile_id', profileId)
      .eq('is_deleted', true)
      .gte('date', monthStartDate)
      .lt('date', nextMonthStartDate)
      .order('deleted_at', { ascending: false })

    if (trashedTransactionsError) {
      setErrorText(trashedTransactionsError.message)
      setStatus('Błąd przy pobieraniu kosza')
      return
    }

    setTrashedTransactions((trashedTransactionsData || []) as Transaction[])

    try {
      await loadPaymentSources()
      if (isStaleLoad()) {
        return
      }

      await loadRecurringTransactions()
      if (isStaleLoad()) {
        return
      }

      await loadFinancialGoals()
      if (isStaleLoad()) {
        return
      }

      const nextTransactionTagsMap = await fetchTransactionTagsMap(
        supabase,
        profileId,
        transactionIds
      )

      if (isStaleLoad()) {
        return
      }

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
    if (isStaleLoad()) {
      return
    }

    if (!categoriesData || categoriesData.length === 0) {
      setStatus('Brak kategorii z bazy')
      return
    }

    setStatus('OK')
  }, [
    budgetStartDate,
    loadDrafts,
    loadFinancialGoals,
    loadLockedMonths,
    loadExcludedMonths,
    loadMonthNavigationSettings,
    loadPaymentSources,
    loadRecurringTransactions,
    profileId,
    resetTreeOpenState,
    selectedMonth,
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
