'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import {
  Category,
  PaymentSource,
  PaymentSourceType,
  Transaction,
  TransactionPaymentSplit,
} from './budgetPageTypes'
import {
  buildPaymentSourceStats,
  getPaymentSourceOptionLabel,
  isPaymentSourceVisibleForKind,
  normalizePaymentSourceColor,
  normalizePaymentSourceEmoji,
  PaymentSourceListKind,
} from './paymentSources'
import { TRANSACTION_SELECT_COLUMNS } from './transactionScope'

type ProfileFinanceSettingsRow = {
  profile_id: string
  default_payment_source_id: string | null
  default_income_payment_source_id?: string | null
  default_expense_payment_source_id?: string | null
  show_income_payment_source?: boolean | null
  show_expense_payment_source?: boolean | null
}

type SavePaymentSourceInput = {
  id?: string
  allowArchivedDuplicateName?: boolean
  name: string
  type: PaymentSourceType
  emoji: string
  color: string
  isIncomeSource: boolean
  isExpenseSource: boolean
}

type PaymentSourceSettings = {
  defaultIncomePaymentSourceId: string | null
  defaultExpensePaymentSourceId: string | null
  showIncomePaymentSource: boolean
  showExpensePaymentSource: boolean
}

type UsePaymentSourcesParams = {
  profileId: string
  categoriesById: Record<string, Category>
  incomeLevel1Id: string | null
  expenseLevel1Id: string | null
  getRootLevel1IdForCategory: (categoryId: string) => string | null
  getAmountNumber: (value: unknown) => number
  getSignedAmountForTransaction: (transaction: Transaction) => number
  isPaymentSourcesEnabled?: boolean
  onDeletedSelectedPaymentSource?: (paymentSourceId: string) => void
}

const DEFAULT_SETTINGS: PaymentSourceSettings = {
  defaultIncomePaymentSourceId: null,
  defaultExpensePaymentSourceId: null,
  showIncomePaymentSource: true,
  showExpensePaymentSource: true,
}

const PAYMENT_SOURCE_HISTORY_PAGE_SIZE = 1000
const PAYMENT_SOURCE_SPLIT_CHUNK_SIZE = 500

const fetchPaymentSourceHistory = async (profileId: string) => {
  const transactions: Transaction[] = []

  for (let from = 0; ; from += PAYMENT_SOURCE_HISTORY_PAGE_SIZE) {
    const { data, error } = await supabase
      .from('transactions')
      .select(TRANSACTION_SELECT_COLUMNS)
      .eq('profile_id', profileId)
      .eq('is_deleted', false)
      .order('date', { ascending: false })
      .range(from, from + PAYMENT_SOURCE_HISTORY_PAGE_SIZE - 1)

    if (error) {
      throw new Error(error.message)
    }

    const page = (data || []) as Transaction[]
    transactions.push(...page)

    if (page.length < PAYMENT_SOURCE_HISTORY_PAGE_SIZE) {
      break
    }
  }

  const transactionPaymentSplitsMap: Record<string, TransactionPaymentSplit[]> = {}
  const transactionIds = transactions.map((transaction) => transaction.id)

  for (let index = 0; index < transactionIds.length; index += PAYMENT_SOURCE_SPLIT_CHUNK_SIZE) {
    const transactionIdChunk = transactionIds.slice(index, index + PAYMENT_SOURCE_SPLIT_CHUNK_SIZE)
    const { data, error } = await supabase
      .from('transaction_payment_splits')
      .select('id, transaction_id, payment_source_id, amount, created_at')
      .in('transaction_id', transactionIdChunk)

    if (error) {
      throw new Error(error.message)
    }

    ;((data || []) as TransactionPaymentSplit[]).forEach((split) => {
      if (!transactionPaymentSplitsMap[split.transaction_id]) {
        transactionPaymentSplitsMap[split.transaction_id] = []
      }

      transactionPaymentSplitsMap[split.transaction_id].push({
        ...split,
        amount: Number(split.amount),
      })
    })
  }

  return { transactions, transactionPaymentSplitsMap }
}

export function usePaymentSources({
  profileId,
  categoriesById,
  incomeLevel1Id,
  expenseLevel1Id,
  getRootLevel1IdForCategory,
  getAmountNumber,
  getSignedAmountForTransaction,
  isPaymentSourcesEnabled = true,
  onDeletedSelectedPaymentSource,
}: UsePaymentSourcesParams) {
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([])
  const [historyTransactions, setHistoryTransactions] = useState<Transaction[]>([])
  const [historyPaymentSplitsMap, setHistoryPaymentSplitsMap] = useState<
    Record<string, TransactionPaymentSplit[]>
  >({})
  const [paymentSourceSettings, setPaymentSourceSettings] =
    useState<PaymentSourceSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    setPaymentSources([])
    setHistoryTransactions([])
    setHistoryPaymentSplitsMap({})
    setPaymentSourceSettings(DEFAULT_SETTINGS)
  }, [profileId])

  const loadPaymentSources = useCallback(async () => {
    if (!isPaymentSourcesEnabled) {
      setPaymentSources([])
      setHistoryTransactions([])
      setHistoryPaymentSplitsMap({})
      setPaymentSourceSettings(DEFAULT_SETTINGS)
      return
    }

    const { data: sourcesData, error: sourcesError } = await supabase
      .from('payment_sources')
      .select('*')
      .eq('profile_id', profileId)
      .order('name', { ascending: true })

    if (sourcesError) {
      throw new Error(sourcesError.message)
    }

    const mappedSources = (sourcesData || []).map((row) => {
      const source = row as PaymentSource

      return {
        ...source,
        is_income_source: source.is_income_source !== false,
        is_expense_source: source.is_expense_source !== false,
        emoji: source.emoji || null,
        color: source.color || null,
        archived_at: source.archived_at || null,
      }
    })

    setPaymentSources(mappedSources)

    const history = await fetchPaymentSourceHistory(profileId)
    setHistoryTransactions(history.transactions)
    setHistoryPaymentSplitsMap(history.transactionPaymentSplitsMap)

    const { data: settingsData, error: settingsError } = await supabase
      .from('profile_finance_settings')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle()

    if (settingsError) {
      const normalizedMessage = settingsError.message.toLowerCase()

      if (
        normalizedMessage.includes('does not exist') ||
        normalizedMessage.includes('could not find') ||
        normalizedMessage.includes('schema cache')
      ) {
        setPaymentSourceSettings(DEFAULT_SETTINGS)
        return
      }

      throw new Error(settingsError.message)
    }

    const settings = settingsData as ProfileFinanceSettingsRow | null
    const legacyDefault = settings?.default_payment_source_id || null

    setPaymentSourceSettings({
      defaultIncomePaymentSourceId: settings?.default_income_payment_source_id || legacyDefault,
      defaultExpensePaymentSourceId: settings?.default_expense_payment_source_id || legacyDefault,
      showIncomePaymentSource: settings?.show_income_payment_source !== false,
      showExpensePaymentSource: settings?.show_expense_payment_source !== false,
    })
  }, [isPaymentSourcesEnabled, profileId])

  const savePaymentSource = useCallback(
    async (input: SavePaymentSourceInput) => {
      if (!isPaymentSourcesEnabled) {
        return
      }

      const trimmedName = input.name.trim()

      if (!trimmedName) {
        return
      }

      const normalizedName = trimmedName.toLocaleLowerCase('pl-PL')
      const duplicateSource = paymentSources.find((source) => {
        if (input.id && source.id === input.id) {
          return false
        }

        if (input.allowArchivedDuplicateName && source.archived_at) {
          return false
        }

        return source.name.trim().toLocaleLowerCase('pl-PL') === normalizedName
      })

      if (duplicateSource) {
        throw new Error(
          `Źródło „${trimmedName}” już istnieje. Edytuj istniejące źródło i zaznacz, czy ma być dostępne dla przychodów, wydatków albo obu.`
        )
      }

      const payload = {
        profile_id: profileId,
        name: trimmedName,
        type: input.type,
        emoji: normalizePaymentSourceEmoji(input.emoji, input.type),
        color: normalizePaymentSourceColor(input.color, input.type),
        is_income_source: input.isIncomeSource,
        is_expense_source: input.isExpenseSource,
      }

      const query = input.id
        ? supabase.from('payment_sources').update(payload).eq('id', input.id).eq('profile_id', profileId)
        : supabase.from('payment_sources').insert(payload)

      const { error } = await query

      if (error) {
        throw new Error(error.message)
      }

      await loadPaymentSources()
    },
    [isPaymentSourcesEnabled, loadPaymentSources, paymentSources, profileId]
  )

  const deletePaymentSource = useCallback(
    async (paymentSourceId: string) => {
      if (!isPaymentSourcesEnabled) {
        return
      }

      const hasTransactionHistory = historyTransactions.some(
        (transaction) => transaction.payment_source_id === paymentSourceId
      )
      const hasSplitHistory = Object.values(historyPaymentSplitsMap).some((splits) =>
        splits.some((split) => split.payment_source_id === paymentSourceId)
      )
      const hasHistory = hasTransactionHistory || hasSplitHistory

      if (hasHistory) {
        const { error } = await supabase
          .from('payment_sources')
          .update({
            is_income_source: false,
            is_expense_source: false,
            archived_at: new Date().toISOString(),
          })
          .eq('id', paymentSourceId)
          .eq('profile_id', profileId)

        if (error) {
          throw new Error(error.message)
        }
      } else {
        const { error } = await supabase
          .from('payment_sources')
          .delete()
          .eq('id', paymentSourceId)
          .eq('profile_id', profileId)

        if (error) {
          throw new Error(error.message)
        }
      }

      if (
        paymentSourceSettings.defaultIncomePaymentSourceId === paymentSourceId ||
        paymentSourceSettings.defaultExpensePaymentSourceId === paymentSourceId
      ) {
        await supabase.from('profile_finance_settings').upsert({
          profile_id: profileId,
          default_payment_source_id: null,
          default_income_payment_source_id:
            paymentSourceSettings.defaultIncomePaymentSourceId === paymentSourceId
              ? null
              : paymentSourceSettings.defaultIncomePaymentSourceId,
          default_expense_payment_source_id:
            paymentSourceSettings.defaultExpensePaymentSourceId === paymentSourceId
              ? null
              : paymentSourceSettings.defaultExpensePaymentSourceId,
          show_income_payment_source: paymentSourceSettings.showIncomePaymentSource,
          show_expense_payment_source: paymentSourceSettings.showExpensePaymentSource,
        })
      }

      onDeletedSelectedPaymentSource?.(paymentSourceId)
      await loadPaymentSources()
    },
    [
      isPaymentSourcesEnabled,
      loadPaymentSources,
      onDeletedSelectedPaymentSource,
      paymentSourceSettings,
      profileId,
      historyPaymentSplitsMap,
      historyTransactions,
    ]
  )

  const restorePaymentSource = useCallback(
    async (paymentSourceId: string) => {
      if (!isPaymentSourcesEnabled) {
        return
      }

      const { error } = await supabase
        .from('payment_sources')
        .update({
          is_income_source: true,
          is_expense_source: true,
          archived_at: null,
        })
        .eq('id', paymentSourceId)
        .eq('profile_id', profileId)

      if (error) {
        throw new Error(error.message)
      }

      await loadPaymentSources()
    },
    [isPaymentSourcesEnabled, loadPaymentSources, profileId]
  )

  const savePaymentSourceSettings = useCallback(
    async (nextSettings: Partial<PaymentSourceSettings>) => {
      if (!isPaymentSourcesEnabled) {
        return
      }

      const mergedSettings = {
        ...paymentSourceSettings,
        ...nextSettings,
      }

      const { error } = await supabase.from('profile_finance_settings').upsert({
        profile_id: profileId,
        default_payment_source_id: null,
        default_income_payment_source_id: mergedSettings.defaultIncomePaymentSourceId,
        default_expense_payment_source_id: mergedSettings.defaultExpensePaymentSourceId,
        show_income_payment_source: mergedSettings.showIncomePaymentSource,
        show_expense_payment_source: mergedSettings.showExpensePaymentSource,
      })

      if (error) {
        throw new Error(error.message)
      }

      setPaymentSourceSettings(mergedSettings)
    },
    [isPaymentSourcesEnabled, paymentSourceSettings, profileId]
  )

  const setDefaultPaymentSource = useCallback(
    async (kind: PaymentSourceListKind, paymentSourceId: string | null) => {
      await savePaymentSourceSettings(
        kind === 'income'
          ? { defaultIncomePaymentSourceId: paymentSourceId }
          : { defaultExpensePaymentSourceId: paymentSourceId }
      )
    },
    [savePaymentSourceSettings]
  )

  const setPaymentSourceFieldVisibility = useCallback(
    async (kind: PaymentSourceListKind, isVisible: boolean) => {
      await savePaymentSourceSettings(
        kind === 'income'
          ? { showIncomePaymentSource: isVisible }
          : { showExpensePaymentSource: isVisible }
      )
    },
    [savePaymentSourceSettings]
  )

  const copyPaymentSourcesBetweenKinds = useCallback(
    async (sourceKind: PaymentSourceListKind, targetKind: PaymentSourceListKind) => {
      if (!isPaymentSourcesEnabled) {
        return
      }

      const sourceKey = sourceKind === 'income' ? 'is_income_source' : 'is_expense_source'
      const targetKey = targetKind === 'income' ? 'is_income_source' : 'is_expense_source'

      const updates = paymentSources.map((source) =>
        supabase
          .from('payment_sources')
          .update({
            [targetKey]: Boolean(source[sourceKey]),
          })
          .eq('id', source.id)
          .eq('profile_id', profileId)
      )

      const results = await Promise.all(updates)
      const firstError = results.find((result) => result.error)?.error

      if (firstError) {
        throw new Error(firstError.message)
      }

      await loadPaymentSources()
    },
    [isPaymentSourcesEnabled, loadPaymentSources, paymentSources, profileId]
  )

  const buildOptionsForKind = useCallback(
    (kind: PaymentSourceListKind | null) => {
      return [...paymentSources]
        .filter((source) => isPaymentSourceVisibleForKind(source, kind))
        .sort((left, right) => left.name.localeCompare(right.name, 'pl'))
        .map((source) => ({
          ...source,
          optionLabel: getPaymentSourceOptionLabel(source),
        }))
    },
    [paymentSources]
  )

  const incomePaymentSourceOptions = useMemo(() => buildOptionsForKind('income'), [buildOptionsForKind])
  const expensePaymentSourceOptions = useMemo(
    () => buildOptionsForKind('expense'),
    [buildOptionsForKind]
  )
  const paymentSourceOptions = useMemo(() => buildOptionsForKind(null), [buildOptionsForKind])

  const paymentSourceStats = useMemo(() => {
    return buildPaymentSourceStats({
      paymentSources,
      transactions: historyTransactions,
      categoriesById,
      incomeLevel1Id,
      expenseLevel1Id,
      getRootLevel1IdForCategory,
      getAmountNumber,
      getSignedAmountForTransaction,
      transactionPaymentSplitsMap: historyPaymentSplitsMap,
      isPaymentSourcesEnabled,
    })
  }, [
    categoriesById,
    expenseLevel1Id,
    getAmountNumber,
    getSignedAmountForTransaction,
    getRootLevel1IdForCategory,
    incomeLevel1Id,
    isPaymentSourcesEnabled,
    paymentSources,
    historyPaymentSplitsMap,
    historyTransactions,
  ])

  return {
    paymentSources,
    paymentSourceOptions,
    incomePaymentSourceOptions,
    expensePaymentSourceOptions,
    paymentSourceStats,
    paymentSourceSettings,
    loadPaymentSources,
    savePaymentSource,
    deletePaymentSource,
    restorePaymentSource,
    setDefaultPaymentSource,
    setPaymentSourceFieldVisibility,
    copyPaymentSourcesBetweenKinds,
  }
}
