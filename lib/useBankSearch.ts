'use client'

import { useCallback, useMemo, useState } from 'react'
import { Category, PaymentSource, Tag, Transaction, TransactionPaymentSplit } from './budgetPageTypes'
import { getAmountNumber } from './transactionUtils'
import { getCategoryPathLabel } from './budgetPageHelpers'
import { getEffectiveTransactionScope } from './transactionScope'
import { getTransactionMonth, isDaylessTransaction } from './transactionDomain'
import { getPaymentSourceAttribution, isPaymentSourcesEnabledForLogic } from './paymentSources'

export type BankSearchSortMode = 'newest' | 'oldest' | 'amount-desc' | 'amount-asc'

export type BankSearchState = {
  description: string
  categoryId: string
  paymentSourceId: string
  tagIds: string[]
  dateFrom: string
  dateTo: string
  amountMin: string
  amountMax: string
  sortMode: BankSearchSortMode
}

export type BankSearchCategoryOption = {
  id: string
  label: string
}

export type BankSearchTagOption = {
  id: string
  label: string
}

export type BankSearchPaymentSourceOption = {
  id: string
  label: string
}

export type BankSearchResult = {
  transaction: Transaction
  effectiveSignedAmount: number
  matchedPaymentSourceId: string | null
}

export type BankSearchSummary = {
  count: number
  incomeTotal: number
  expenseTotal: number
  balance: number
  averageIncome: number
  averageExpense: number
  maxIncomeTransaction: Transaction | null
  maxExpenseTransaction: Transaction | null
}

export const DEFAULT_BANK_SEARCH_STATE: BankSearchState = {
  description: '',
  categoryId: '',
  paymentSourceId: '',
  tagIds: [],
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
  sortMode: 'newest',
}

export const hasActiveSearchFilters = (state: BankSearchState) => {
  return Boolean(
    state.description.trim() ||
      state.categoryId ||
      state.paymentSourceId ||
      state.tagIds.length > 0 ||
      state.dateFrom ||
      state.dateTo ||
      state.amountMin.trim() ||
      state.amountMax.trim()
  )
}

type UseBankSearchParams = {
  profileId: string
  transactions: Transaction[]
  categories: Category[]
  categoriesById: Record<string, Category>
  budgetStartDate?: string | null
  getSignedAmountForTransaction: (transaction: Transaction) => number
  paymentSources?: PaymentSource[]
  isPaymentSourcesEnabled?: boolean
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
  tags?: Tag[]
  transactionTagsMap?: Record<string, Tag[]>
}

const parseAmountFilter = (value: string) => {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const parsed = Number(trimmed.replace(',', '.'))

  if (Number.isNaN(parsed)) {
    return null
  }

  return parsed
}

const normalizeSearchText = (value: string) => {
  return value.trim().toLocaleLowerCase('pl-PL')
}

export function useBankSearch(params: UseBankSearchParams) {
  const {
    transactions,
    categories,
    categoriesById,
    budgetStartDate,
    getSignedAmountForTransaction,
    paymentSources = [],
    isPaymentSourcesEnabled = true,
    transactionPaymentSplitsMap = {},
    tags = [],
    transactionTagsMap = {},
  } = params

  const [searchState, setSearchState] = useState<BankSearchState>(DEFAULT_BANK_SEARCH_STATE)
  const [isPanelOpen, setIsPanelOpenState] = useState(true)

  const scopedTransactions = useMemo(
    () =>
      getEffectiveTransactionScope(transactions, {
        mode: 'search',
        budgetStartDate,
      }),
    [budgetStartDate, transactions]
  )

  const handleFieldChange = <K extends keyof BankSearchState>(
    key: K,
    value: BankSearchState[K]
  ) => {
    setSearchState((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const toggleTagId = (tagId: string) => {
    setSearchState((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }))
  }

  const setTagIds = (tagIds: string[]) => {
    setSearchState((prev) => ({
      ...prev,
      tagIds,
    }))
  }

  const resetSearch = useCallback(() => {
    setSearchState(DEFAULT_BANK_SEARCH_STATE)
  }, [])

  const setIsPanelOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setIsPanelOpenState((prev) => {
        const nextValue = typeof value === 'function' ? value(prev) : value

        if (nextValue && !prev) {
          resetSearch()
        }

        return nextValue
      })
    },
    [resetSearch]
  )

  const doesTransactionMatchCategoryFilter = useCallback(
    (transactionCategoryId: string, filterCategoryId: string) => {
      if (!filterCategoryId) {
        return true
      }

      if (transactionCategoryId === filterCategoryId) {
        return true
      }

      let currentCategory = categoriesById[transactionCategoryId]

      while (currentCategory?.parent_id) {
        if (currentCategory.parent_id === filterCategoryId) {
          return true
        }

        currentCategory = categoriesById[currentCategory.parent_id]
      }

      return false
    },
    [categoriesById]
  )

  const doesTransactionMatchTagFilter = useCallback(
    (transactionId: string, filterTagIds: string[]) => {
      if (filterTagIds.length === 0) {
        return true
      }

      const transactionTagIds = (transactionTagsMap[transactionId] || []).map((tag) => tag.id)
      return filterTagIds.every((tagId) => transactionTagIds.includes(tagId))
    },
    [transactionTagsMap]
  )

  const doesTransactionMatchTextFilter = useCallback(
    (transaction: Transaction, normalizedDescription: string) => {
      if (!normalizedDescription) {
        return true
      }

      const description = normalizeSearchText(transaction.description || '')
      const transactionTags = transactionTagsMap[transaction.id] || []

      if (description.includes(normalizedDescription)) {
        return true
      }

      return transactionTags.some((tag) =>
        normalizeSearchText(tag.name).includes(normalizedDescription)
      )
    },
    [transactionTagsMap]
  )

  const getEffectiveSignedAmountForSourceFilter = useCallback(
    (transaction: Transaction, paymentSourceId: string) => {
      if (!isPaymentSourcesEnabledForLogic(isPaymentSourcesEnabled) || !paymentSourceId) {
        return {
          effectiveSignedAmount: getSignedAmountForTransaction(transaction),
          matchedPaymentSourceId: null,
        }
      }

      const attribution = getPaymentSourceAttribution({
        transaction,
        splitItems: transactionPaymentSplitsMap[transaction.id] || [],
        getSignedAmountForTransaction,
        getAmountNumber,
        isPaymentSourcesEnabled,
      })
      const matchingSignedAmount = attribution
        .filter((item) => item.paymentSourceId === paymentSourceId)
        .reduce((sum, item) => sum + item.signedAmount, 0)

      return {
        effectiveSignedAmount: matchingSignedAmount,
        matchedPaymentSourceId: matchingSignedAmount !== 0 ? paymentSourceId : null,
      }
    },
    [getSignedAmountForTransaction, isPaymentSourcesEnabled, transactionPaymentSplitsMap]
  )

  const results = useMemo<BankSearchResult[]>(() => {
    if (!hasActiveSearchFilters(searchState)) {
      return []
    }

    const normalizedDescription = normalizeSearchText(searchState.description)
    const parsedMin = parseAmountFilter(searchState.amountMin)
    const parsedMax = parseAmountFilter(searchState.amountMax)
    const effectivePaymentSourceId = isPaymentSourcesEnabledForLogic(isPaymentSourcesEnabled)
      ? searchState.paymentSourceId
      : ''

    const filtered = scopedTransactions
      .map((transaction) => ({
        transaction,
        ...getEffectiveSignedAmountForSourceFilter(transaction, effectivePaymentSourceId),
      }))
      .filter(({ transaction, effectiveSignedAmount }) => {
        const amount = Math.abs(effectiveSignedAmount || getAmountNumber(transaction.amount))

        if (!doesTransactionMatchTextFilter(transaction, normalizedDescription)) {
          return false
        }

        if (
          searchState.categoryId &&
          !doesTransactionMatchCategoryFilter(transaction.category_id, searchState.categoryId)
        ) {
          return false
        }

        if (!doesTransactionMatchTagFilter(transaction.id, searchState.tagIds)) {
          return false
        }

        if (effectivePaymentSourceId && effectiveSignedAmount === 0) {
          return false
        }

        if (
          searchState.dateFrom &&
          (isDaylessTransaction(transaction)
            ? getTransactionMonth(transaction) < searchState.dateFrom.slice(0, 7)
            : transaction.date < searchState.dateFrom)
        ) {
          return false
        }

        if (
          searchState.dateTo &&
          (isDaylessTransaction(transaction)
            ? getTransactionMonth(transaction) > searchState.dateTo.slice(0, 7)
            : transaction.date > searchState.dateTo)
        ) {
          return false
        }

        if (parsedMin !== null && amount < parsedMin) {
          return false
        }

        if (parsedMax !== null && amount > parsedMax) {
          return false
        }

        return true
      })

    const sorted = [...filtered]

    if (searchState.sortMode === 'oldest') {
      sorted.sort((a, b) => a.transaction.date.localeCompare(b.transaction.date))
    } else if (searchState.sortMode === 'amount-desc') {
      sorted.sort((a, b) => Math.abs(b.effectiveSignedAmount) - Math.abs(a.effectiveSignedAmount))
    } else if (searchState.sortMode === 'amount-asc') {
      sorted.sort((a, b) => Math.abs(a.effectiveSignedAmount) - Math.abs(b.effectiveSignedAmount))
    } else {
      sorted.sort((a, b) => b.transaction.date.localeCompare(a.transaction.date))
    }

    return sorted
  }, [
    doesTransactionMatchCategoryFilter,
    doesTransactionMatchTagFilter,
    doesTransactionMatchTextFilter,
    getEffectiveSignedAmountForSourceFilter,
    isPaymentSourcesEnabled,
    searchState,
    scopedTransactions,
  ])

  const summary = useMemo<BankSearchSummary>(() => {
    let incomeTotal = 0
    let expenseTotal = 0
    let balance = 0
    let incomeCount = 0
    let expenseCount = 0
    let maxIncomeResult: BankSearchResult | null = null
    let maxExpenseResult: BankSearchResult | null = null

    for (const item of results) {
      const signedAmount = item.effectiveSignedAmount
      balance += signedAmount

      if (signedAmount > 0) {
        incomeTotal += signedAmount
        incomeCount += 1

        if (!maxIncomeResult || signedAmount > maxIncomeResult.effectiveSignedAmount) {
          maxIncomeResult = item
        }
      }

      if (signedAmount < 0) {
        const expenseAmount = Math.abs(signedAmount)
        expenseTotal += expenseAmount
        expenseCount += 1

        if (!maxExpenseResult || expenseAmount > Math.abs(maxExpenseResult.effectiveSignedAmount)) {
          maxExpenseResult = item
        }
      }
    }

    const averageIncome = incomeCount > 0 ? incomeTotal / incomeCount : 0
    const averageExpense = expenseCount > 0 ? expenseTotal / expenseCount : 0

    return {
      count: results.length,
      incomeTotal,
      expenseTotal,
      balance,
      averageIncome,
      averageExpense,
      maxIncomeTransaction: maxIncomeResult?.transaction ?? null,
      maxExpenseTransaction: maxExpenseResult?.transaction ?? null,
    }
  }, [results])

  const categoryOptions = useMemo<BankSearchCategoryOption[]>(() => {
    return categories
      .filter((category) => category.level >= 1 && category.level <= 3)
      .map((category) => ({
        id: category.id,
        label: getCategoryPathLabel(category.id, categoriesById),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pl'))
  }, [categories, categoriesById])

  const paymentSourceOptions = useMemo<BankSearchPaymentSourceOption[]>(() => {
    return paymentSources
      .filter(() => isPaymentSourcesEnabledForLogic(isPaymentSourcesEnabled))
      .map((source) => ({
        id: source.id,
        label: source.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pl'))
  }, [isPaymentSourcesEnabled, paymentSources])

  const tagOptions = useMemo<BankSearchTagOption[]>(() => {
    const transactionIdsInScope = new Set(scopedTransactions.map((transaction) => transaction.id))
    const usedTagIds = new Set<string>()

    Object.entries(transactionTagsMap).forEach(([transactionId, transactionTags]) => {
      if (!transactionIdsInScope.has(transactionId)) {
        return
      }

      transactionTags.forEach((transactionTag) => usedTagIds.add(transactionTag.id))
    })

    return [...tags]
      .filter((tag) => usedTagIds.has(tag.id))
      .map((tag) => ({
        id: tag.id,
        label: tag.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pl', { sensitivity: 'base' }))
  }, [scopedTransactions, tags, transactionTagsMap])

  return {
    searchState,
    setSearchState,
    handleFieldChange,
    toggleTagId,
    setTagIds,
    resetSearch,
    results,
    summary,
    categoryOptions,
    paymentSourceOptions,
    tagOptions,
    isPanelOpen,
    setIsPanelOpen,
  }
}
