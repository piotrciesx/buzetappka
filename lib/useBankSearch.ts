'use client'

import { useCallback, useMemo, useState } from 'react'
import { Category, PaymentSource, Tag, Transaction, TransactionPaymentSplit } from './budgetPageTypes'
import { getAmountNumber } from './transactionUtils'
import { getCategoryPathLabel } from './budgetPageHelpers'

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

type UseBankSearchParams = {
  profileId: string
  transactions: Transaction[]
  categories: Category[]
  categoriesById: Record<string, Category>
  getSignedAmountForTransaction: (transaction: Transaction) => number
  paymentSources?: PaymentSource[]
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
    getSignedAmountForTransaction,
    paymentSources = [],
    transactionPaymentSplitsMap = {},
    tags = [],
    transactionTagsMap = {},
  } = params

  const [searchState, setSearchState] = useState<BankSearchState>(DEFAULT_BANK_SEARCH_STATE)
  const [isPanelOpen, setIsPanelOpenState] = useState(true)

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
      if (!paymentSourceId) {
        return {
          effectiveSignedAmount: getSignedAmountForTransaction(transaction),
          matchedPaymentSourceId: transaction.payment_source_id || null,
        }
      }

      const splits = transactionPaymentSplitsMap[transaction.id] || []
      const signedAmount = getSignedAmountForTransaction(transaction)
      const sign = signedAmount >= 0 ? 1 : -1

      if (splits.length > 0) {
        const matchingAmount = splits
          .filter((split) => split.payment_source_id === paymentSourceId)
          .reduce((sum, split) => sum + split.amount, 0)

        return {
          effectiveSignedAmount: matchingAmount > 0 ? matchingAmount * sign : 0,
          matchedPaymentSourceId: matchingAmount > 0 ? paymentSourceId : null,
        }
      }

      if (transaction.payment_source_id === paymentSourceId) {
        return {
          effectiveSignedAmount: signedAmount,
          matchedPaymentSourceId: paymentSourceId,
        }
      }

      return {
        effectiveSignedAmount: 0,
        matchedPaymentSourceId: null,
      }
    },
    [getSignedAmountForTransaction, transactionPaymentSplitsMap]
  )

  const results = useMemo<BankSearchResult[]>(() => {
    const normalizedDescription = normalizeSearchText(searchState.description)
    const parsedMin = parseAmountFilter(searchState.amountMin)
    const parsedMax = parseAmountFilter(searchState.amountMax)

    const filtered = transactions
      .map((transaction) => ({
        transaction,
        ...getEffectiveSignedAmountForSourceFilter(transaction, searchState.paymentSourceId),
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

        if (searchState.paymentSourceId && effectiveSignedAmount === 0) {
          return false
        }

        if (searchState.dateFrom && transaction.date < searchState.dateFrom) {
          return false
        }

        if (searchState.dateTo && transaction.date > searchState.dateTo) {
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
    searchState,
    transactions,
  ])

  const summary = useMemo<BankSearchSummary>(() => {
    const incomeTransactions = results.filter((item) => item.effectiveSignedAmount > 0)
    const expenseTransactions = results.filter((item) => item.effectiveSignedAmount < 0)

    const incomeTotal = incomeTransactions.reduce((sum, item) => sum + item.effectiveSignedAmount, 0)
    const expenseTotal = expenseTransactions.reduce(
      (sum, item) => sum + Math.abs(item.effectiveSignedAmount),
      0
    )
    const balance = results.reduce((sum, item) => sum + item.effectiveSignedAmount, 0)

    const averageIncome = incomeTransactions.length > 0 ? incomeTotal / incomeTransactions.length : 0
    const averageExpense = expenseTransactions.length > 0 ? expenseTotal / expenseTransactions.length : 0

    const maxIncomeTransaction =
      incomeTransactions.length > 0
        ? incomeTransactions.reduce((currentMax, item) =>
            item.effectiveSignedAmount > currentMax.effectiveSignedAmount ? item : currentMax
          ).transaction
        : null

    const maxExpenseTransaction =
      expenseTransactions.length > 0
        ? expenseTransactions.reduce((currentMax, item) =>
            Math.abs(item.effectiveSignedAmount) > Math.abs(currentMax.effectiveSignedAmount)
              ? item
              : currentMax
          ).transaction
        : null

    return {
      count: results.length,
      incomeTotal,
      expenseTotal,
      balance,
      averageIncome,
      averageExpense,
      maxIncomeTransaction,
      maxExpenseTransaction,
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
      .map((source) => ({
        id: source.id,
        label: source.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pl'))
  }, [paymentSources])

  const tagOptions = useMemo<BankSearchTagOption[]>(() => {
    const transactionIdsInScope = new Set(transactions.map((transaction) => transaction.id))

    return [...tags]
      .filter((tag) =>
        Object.entries(transactionTagsMap).some(
          ([transactionId, transactionTags]) =>
            transactionIdsInScope.has(transactionId) &&
            transactionTags.some((transactionTag) => transactionTag.id === tag.id)
        )
      )
      .map((tag) => ({
        id: tag.id,
        label: tag.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pl', { sensitivity: 'base' }))
  }, [tags, transactionTagsMap, transactions])

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
