import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from 'react'
import { sortCategoriesForDisplay } from './budgetPageHelpers'
import { Category, Tag, Transaction, TransactionPaymentSplit } from './budgetPageTypes'
import { getCurrentMonthText, getNextMonthText } from './dateUtils'
import { supabase } from './supabaseClient'
import { fetchTransactionTagsMap } from './tagUtils'
import { permanentlyDeleteTransactions } from './transactionActions'
import { TRANSACTION_SELECT_COLUMNS } from './transactionScope'

type UseBudgetPageDataParams = {
  profileId: string
  selectedMonth: string
  budgetStartDate: string
  setStatus: Dispatch<SetStateAction<string>>
  setErrorText: Dispatch<SetStateAction<string>>
  setCategories: Dispatch<SetStateAction<Category[]>>
  setTransactions: Dispatch<SetStateAction<Transaction[]>>
  setActiveScopeTransactions: Dispatch<SetStateAction<Transaction[]>>
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
  isPaymentSourcesEnabled?: boolean
}

const ACTIVE_SCOPE_PAGE_SIZE = 1000
const ACTIVE_SCOPE_MAX_ROWS = 10000
const RELATION_LOOKUP_CHUNK_SIZE = 500

const getActiveScopeEndDate = (selectedMonth: string) => {
  const currentMonth = getCurrentMonthText()
  const latestVisibleMonth = selectedMonth > currentMonth ? selectedMonth : currentMonth

  return `${getNextMonthText(latestVisibleMonth)}-01`
}

const fetchActiveScopeTransactions = async ({
  profileId,
  budgetStartDate,
  selectedMonth,
}: {
  profileId: string
  budgetStartDate: string
  selectedMonth: string
}) => {
  const scopeStartDate = budgetStartDate ? budgetStartDate.slice(0, 10) : '0001-01-01'
  const scopeEndDate = getActiveScopeEndDate(selectedMonth)
  const rows: Transaction[] = []

  for (let from = 0; from < ACTIVE_SCOPE_MAX_ROWS; from += ACTIVE_SCOPE_PAGE_SIZE) {
    const to = Math.min(from + ACTIVE_SCOPE_PAGE_SIZE - 1, ACTIVE_SCOPE_MAX_ROWS - 1)
    const { data, error } = await supabase
      .from('transactions')
      .select(TRANSACTION_SELECT_COLUMNS)
      .eq('profile_id', profileId)
      .eq('is_deleted', false)
      .gte('date', scopeStartDate)
      .lt('date', scopeEndDate)
      .order('date', { ascending: false })
      .range(from, to)

    if (error) {
      throw error
    }

    rows.push(...((data || []) as Transaction[]))

    if (!data || data.length < ACTIVE_SCOPE_PAGE_SIZE) {
      break
    }
  }

  return rows
}

const fetchTransactionPaymentSplits = async (transactionIds: string[]) => {
  const rows: TransactionPaymentSplit[] = []

  for (let index = 0; index < transactionIds.length; index += RELATION_LOOKUP_CHUNK_SIZE) {
    const chunk = transactionIds.slice(index, index + RELATION_LOOKUP_CHUNK_SIZE)

    if (chunk.length === 0) {
      continue
    }

    const { data, error } = await supabase
      .from('transaction_payment_splits')
      .select('id, transaction_id, payment_source_id, amount, created_at')
      .in('transaction_id', chunk)

    if (error) {
      throw error
    }

    rows.push(...((data || []) as TransactionPaymentSplit[]))
  }

  return rows
}

export function useBudgetPageData({
  profileId,
  selectedMonth,
  budgetStartDate,
  setStatus,
  setErrorText,
  setCategories,
  setTransactions,
  setActiveScopeTransactions,
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
  isPaymentSourcesEnabled = true,
}: UseBudgetPageDataParams) {
  const activeProfileIdRef = useRef(profileId)

  useEffect(() => {
    activeProfileIdRef.current = profileId
    setCategories([])
    setTransactions([])
    setActiveScopeTransactions([])
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
    setActiveScopeTransactions,
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
    const { data: expiredTrashRowsForCleanup, error: trashLookupError } = await supabase
      .from('transactions')
      .select('id')
      .eq('profile_id', profileId)
      .eq('is_deleted', true)
      .lt('deleted_at', trashAutoDeleteCutoff)

    const expiredTrashRows = (expiredTrashRowsForCleanup || []) as Array<{ id: string }>

    if (trashLookupError) {
      setErrorText(trashLookupError.message)
      setStatus('Błąd przy czyszczeniu kosza')
      return
    }

    if (isStaleLoad()) {
      return
    }

    try {
      await permanentlyDeleteTransactions(
        supabase,
        profileId,
        expiredTrashRows.map((transaction) => transaction.id)
      )
    } catch (trashCleanupError) {
      const message =
        trashCleanupError instanceof Error
          ? trashCleanupError.message
          : 'Nie udało się wyczyścić kosza'
      setErrorText(message)
      setStatus('Błąd przy czyszczeniu kosza')
      return
    }

    const monthStartDate =
      budgetStartDate && budgetStartDate.slice(0, 7) === selectedMonth
        ? budgetStartDate.slice(0, 10)
        : `${selectedMonth}-01`
    const nextMonthStartDate = `${getNextMonthText(selectedMonth)}-01`

    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select(TRANSACTION_SELECT_COLUMNS)
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

    let nextActiveScopeTransactions: Transaction[] = []

    try {
      nextActiveScopeTransactions = await fetchActiveScopeTransactions({
        profileId,
        budgetStartDate,
        selectedMonth,
      })
    } catch (activeScopeError) {
      const message =
        activeScopeError instanceof Error
          ? activeScopeError.message
          : 'Nie udało się pobrać aktywnego zakresu wpisów'
      setErrorText(message)
      setStatus('Błąd przy pobieraniu aktywnego zakresu wpisów')
      return
    }

    if (isStaleLoad()) {
      return
    }

    const activeScopeTransactionIds = nextActiveScopeTransactions.map((transaction) => transaction.id)
    setActiveScopeTransactions(nextActiveScopeTransactions)

    const { data: trashedTransactionsData, error: trashedTransactionsError } = await supabase
      .from('transactions')
      .select(TRANSACTION_SELECT_COLUMNS)
      .eq('profile_id', profileId)
      .eq('is_deleted', true)
      .order('deleted_at', { ascending: false })

    if (trashedTransactionsError) {
      setErrorText(trashedTransactionsError.message)
      setStatus('Błąd przy pobieraniu kosza')
      return
    }

    if (isStaleLoad()) {
      return
    }

    const nextTrashedTransactions = (trashedTransactionsData || []) as Transaction[]
    const allLoadedTransactionIds = [
      ...new Set([...transactionIds, ...activeScopeTransactionIds]),
      ...nextTrashedTransactions.map((transaction) => transaction.id),
    ]

    let splitRows: TransactionPaymentSplit[] = []

    try {
      splitRows =
        isPaymentSourcesEnabled && allLoadedTransactionIds.length > 0
          ? await fetchTransactionPaymentSplits(allLoadedTransactionIds)
          : []
    } catch (splitRowsError) {
      const message =
        splitRowsError instanceof Error
          ? splitRowsError.message
          : 'Nie udało się pobrać splitów płatności'
      setErrorText(message)
      setStatus('Błąd przy pobieraniu splitów płatności')
      return
    }

    if (isStaleLoad()) {
      return
    }

    const nextSplitsMap = splitRows.reduce<
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

    setTrashedTransactions(nextTrashedTransactions)

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
        [...new Set([...transactionIds, ...activeScopeTransactionIds])]
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
    isPaymentSourcesEnabled,
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
    setActiveScopeTransactions,
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
