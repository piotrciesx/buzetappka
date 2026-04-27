'use client'

import { useCallback, useMemo, useState } from 'react'
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
  transactions: Transaction[]
  transactionPaymentSplitsMap?: Record<string, TransactionPaymentSplit[]>
  categoriesById: Record<string, Category>
  incomeLevel1Id: string | null
  expenseLevel1Id: string | null
  getRootLevel1IdForCategory: (categoryId: string) => string | null
  getAmountNumber: (value: unknown) => number
  onDeletedSelectedPaymentSource?: (paymentSourceId: string) => void
}

const DEFAULT_SETTINGS: PaymentSourceSettings = {
  defaultIncomePaymentSourceId: null,
  defaultExpensePaymentSourceId: null,
  showIncomePaymentSource: true,
  showExpensePaymentSource: true,
}

export function usePaymentSources({
  profileId,
  transactions,
  transactionPaymentSplitsMap = {},
  categoriesById,
  incomeLevel1Id,
  expenseLevel1Id,
  getRootLevel1IdForCategory,
  getAmountNumber,
  onDeletedSelectedPaymentSource,
}: UsePaymentSourcesParams) {
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([])
  const [paymentSourceSettings, setPaymentSourceSettings] =
    useState<PaymentSourceSettings>(DEFAULT_SETTINGS)

  const loadPaymentSources = useCallback(async () => {
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
      }
    })

    setPaymentSources(mappedSources)

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
  }, [profileId])

  const savePaymentSource = useCallback(
    async (input: SavePaymentSourceInput) => {
      const trimmedName = input.name.trim()

      if (!trimmedName) {
        return
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
        ? supabase.from('payment_sources').update(payload).eq('id', input.id)
        : supabase.from('payment_sources').insert(payload)

      const { error } = await query

      if (error) {
        throw new Error(error.message)
      }

      await loadPaymentSources()
    },
    [loadPaymentSources, profileId]
  )

  const deletePaymentSource = useCallback(
    async (paymentSourceId: string) => {
      const { error } = await supabase.from('payment_sources').delete().eq('id', paymentSourceId)

      if (error) {
        throw new Error(error.message)
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
    [loadPaymentSources, onDeletedSelectedPaymentSource, paymentSourceSettings, profileId]
  )

  const savePaymentSourceSettings = useCallback(
    async (nextSettings: Partial<PaymentSourceSettings>) => {
      const mergedSettings = {
        ...paymentSourceSettings,
        ...nextSettings,
      }

      const { error } = await supabase.from('profile_finance_settings').upsert({
        profile_id: profileId,
        default_payment_source_id:
          mergedSettings.defaultExpensePaymentSourceId || mergedSettings.defaultIncomePaymentSourceId,
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
    [paymentSourceSettings, profileId]
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
      const sourceKey = sourceKind === 'income' ? 'is_income_source' : 'is_expense_source'
      const targetKey = targetKind === 'income' ? 'is_income_source' : 'is_expense_source'

      const updates = paymentSources.map((source) =>
        supabase
          .from('payment_sources')
          .update({
            [targetKey]: Boolean(source[sourceKey]),
          })
          .eq('id', source.id)
      )

      const results = await Promise.all(updates)
      const firstError = results.find((result) => result.error)?.error

      if (firstError) {
        throw new Error(firstError.message)
      }

      await loadPaymentSources()
    },
    [loadPaymentSources, paymentSources]
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
      transactions,
      categoriesById,
      incomeLevel1Id,
      expenseLevel1Id,
      getRootLevel1IdForCategory,
      getAmountNumber,
      transactionPaymentSplitsMap,
    })
  }, [
    categoriesById,
    expenseLevel1Id,
    getAmountNumber,
    getRootLevel1IdForCategory,
    incomeLevel1Id,
    paymentSources,
    transactionPaymentSplitsMap,
    transactions,
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
    setDefaultPaymentSource,
    setPaymentSourceFieldVisibility,
    copyPaymentSourcesBetweenKinds,
  }
}
