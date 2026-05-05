'use client'

import { useCallback, useMemo, useState } from 'react'
import type {
  BudgetLimit,
  BudgetLimitAlertState,
  BudgetLimitMode,
  Category,
  Transaction,
} from './budgetPageTypes'
import { getDaysInMonth, getPrevMonthText } from './dateUtils'
import { supabase } from './supabaseClient'

export type SaveBudgetLimitInput = {
  categoryId: string | null
  amount: number
  startMonth: string
  endMonth?: string | null
  mode: BudgetLimitMode
}

export type UpdateBudgetLimitInput = SaveBudgetLimitInput & {
  id: string
}

export type BudgetLimitUsageState = {
  limit: BudgetLimit
  usageAmount: number
  usagePercent: number
  alertState: BudgetLimitAlertState
}

type UseBudgetLimitsParams = {
  profileId: string
  selectedMonth: string
  categoriesById: Record<string, Category>
  expenseLevel1Id: string | null
  transactions: Transaction[]
  excludedMonthsSet: Set<string>
  getSignedAmountForTransaction: (transaction: Transaction) => number
}

const emptyAlertState: BudgetLimitAlertState = {
  level: 'none',
  text: '',
}

const assertValidBudgetLimitProfileId = (profileId: string) => {
  if (!profileId) {
    throw new Error('Nie udało się zapisać limitu: brak profile_id.')
  }
}

const getBudgetLimitPayload = (profileId: string, input: SaveBudgetLimitInput) => ({
  profile_id: profileId,
  category_id: input.categoryId,
  amount: input.amount,
  start_month: input.startMonth,
  end_month: input.endMonth || null,
  mode: input.mode,
})

export const mapBudgetLimitRow = (row: Record<string, unknown>): BudgetLimit => ({
  id: String(row.id),
  profile_id: String(row.profile_id),
  category_id: row.category_id ? String(row.category_id) : null,
  amount: Number(row.amount) || 0,
  start_month: String(row.start_month || ''),
  end_month: row.end_month ? String(row.end_month) : null,
  mode: row.mode === 'strict' ? 'strict' : 'normal',
  created_at: row.created_at ? String(row.created_at) : undefined,
})

export const isBudgetLimitActiveInMonth = (limit: BudgetLimit, selectedMonth: string) => {
  return limit.start_month <= selectedMonth && (!limit.end_month || limit.end_month >= selectedMonth)
}

export const getBudgetLimitMonthProgressPercent = (selectedMonth: string) => {
  const daysInMonth = getDaysInMonth(selectedMonth)
  const currentDate = new Date()
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  const dayOfMonth =
    selectedMonth === currentMonth
      ? currentDate.getDate()
      : selectedMonth < currentMonth
        ? daysInMonth
        : 0

  if (daysInMonth <= 0) {
    return 0
  }

  return Math.max(0, Math.min(100, (dayOfMonth / daysInMonth) * 100))
}

export const getBudgetLimitAlertState = (
  limit: BudgetLimit,
  usageAmount: number,
  monthProgressPercent: number
): BudgetLimitAlertState => {
  if (limit.amount <= 0) {
    return emptyAlertState
  }

  const usagePercent = (usageAmount / limit.amount) * 100

  if (usagePercent >= 100) {
    return {
      level: 'exceeded',
      text: 'Przekroczono limit',
    }
  }

  if (limit.mode === 'strict') {
    return emptyAlertState
  }

  if (usagePercent >= 90 && monthProgressPercent < 85) {
    return {
      level: 'strong',
      text: `Wydano ${Math.round(usagePercent)}% limitu przed końcówką miesiąca`,
    }
  }

  if (usagePercent >= 80 && monthProgressPercent < 75) {
    return {
      level: 'warning',
      text: `Wydano ${Math.round(usagePercent)}% limitu przed końcówką miesiąca`,
    }
  }

  return emptyAlertState
}

const getCategoryRootId = (
  categoryId: string | null | undefined,
  categoriesById: Record<string, Category>
) => {
  let current = categoryId ? categoriesById[categoryId] : null

  while (current?.parent_id) {
    current = categoriesById[current.parent_id]
  }

  return current?.id ?? null
}

const getLimitCategoryIds = (
  limit: BudgetLimit,
  categoriesById: Record<string, Category>,
  expenseLevel1Id: string | null
) => {
  if (!limit.category_id) {
    return new Set(
      Object.values(categoriesById)
        .filter((category) => getCategoryRootId(category.id, categoriesById) === expenseLevel1Id)
        .map((category) => category.id)
    )
  }

  const category = categoriesById[limit.category_id]

  if (!category) {
    return new Set<string>()
  }

  if (getCategoryRootId(category.id, categoriesById) !== expenseLevel1Id) {
    return new Set<string>()
  }

  if (category.level === 2) {
    return new Set(
      Object.values(categoriesById)
        .filter((item) => item.id === category.id || item.parent_id === category.id)
        .map((item) => item.id)
    )
  }

  return new Set([category.id])
}

export const getBudgetLimitUsageAmount = ({
  limit,
  selectedMonth,
  categoriesById,
  expenseLevel1Id,
  transactions,
  getSignedAmountForTransaction,
}: {
  limit: BudgetLimit
  selectedMonth: string
  categoriesById: Record<string, Category>
  expenseLevel1Id: string | null
  transactions: Transaction[]
  getSignedAmountForTransaction: (transaction: Transaction) => number
}) => {
  const categoryIds = getLimitCategoryIds(limit, categoriesById, expenseLevel1Id)

  if (categoryIds.size === 0) {
    return 0
  }

  return transactions.reduce((sum, transaction) => {
    if (transaction.is_deleted) {
      return sum
    }

    if (!transaction.date.startsWith(selectedMonth)) {
      return sum
    }

    if (!categoryIds.has(transaction.category_id)) {
      return sum
    }

    const signedAmount = getSignedAmountForTransaction(transaction)

    return signedAmount < 0 ? sum + Math.abs(signedAmount) : sum
  }, 0)
}

export function useBudgetLimits({
  profileId,
  selectedMonth,
  categoriesById,
  expenseLevel1Id,
  transactions,
  excludedMonthsSet,
  getSignedAmountForTransaction,
}: UseBudgetLimitsParams) {
  const [limits, setLimits] = useState<BudgetLimit[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadBudgetLimits = useCallback(async () => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('budget_limits')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: true })

      if (error) {
        throw new Error(error.message)
      }

      setLimits((data || []).map((row) => mapBudgetLimitRow(row as Record<string, unknown>)))
    } finally {
      setIsLoading(false)
    }
  }, [profileId])

  const activeLimits = useMemo(() => {
    if (excludedMonthsSet.has(selectedMonth)) {
      return []
    }

    return limits.filter((limit) => isBudgetLimitActiveInMonth(limit, selectedMonth))
  }, [excludedMonthsSet, limits, selectedMonth])

  const monthProgressPercent = useMemo(
    () => getBudgetLimitMonthProgressPercent(selectedMonth),
    [selectedMonth]
  )

  const getLimitForCategory = useCallback(
    (categoryId: string | null) =>
      activeLimits.find((limit) => limit.category_id === categoryId) ?? null,
    [activeLimits]
  )

  const getUsage = useCallback(
    (limit: BudgetLimit) =>
      getBudgetLimitUsageAmount({
        limit,
        selectedMonth,
        categoriesById,
        expenseLevel1Id,
        transactions,
        getSignedAmountForTransaction,
      }),
    [
      categoriesById,
      expenseLevel1Id,
      getSignedAmountForTransaction,
      selectedMonth,
      transactions,
    ]
  )

  const getUsagePercent = useCallback(
    (limit: BudgetLimit) => {
      const usageAmount = getUsage(limit)
      return limit.amount > 0 ? (usageAmount / limit.amount) * 100 : 0
    },
    [getUsage]
  )

  const getAlertState = useCallback(
    (limit: BudgetLimit, usageAmount: number) =>
      getBudgetLimitAlertState(limit, usageAmount, monthProgressPercent),
    [monthProgressPercent]
  )

  const activeLimitStates = useMemo<BudgetLimitUsageState[]>(() => {
    return activeLimits.map((limit) => {
      const usageAmount = getUsage(limit)
      const usagePercent = limit.amount > 0 ? (usageAmount / limit.amount) * 100 : 0

      return {
        limit,
        usageAmount,
        usagePercent,
        alertState: getAlertState(limit, usageAmount),
      }
    })
  }, [activeLimits, getAlertState, getUsage])

  const activeAlerts = useMemo(
    () => activeLimitStates.filter((state) => state.alertState.level !== 'none'),
    [activeLimitStates]
  )

  const addBudgetLimit = useCallback(
    async (input: SaveBudgetLimitInput) => {
      assertValidBudgetLimitProfileId(profileId)

      const { error } = await supabase.from('budget_limits').insert(getBudgetLimitPayload(profileId, input))

      if (error) {
        throw new Error(error.message)
      }

      await loadBudgetLimits()
    },
    [loadBudgetLimits, profileId]
  )

  const updateBudgetLimit = useCallback(
    async (input: UpdateBudgetLimitInput) => {
      assertValidBudgetLimitProfileId(profileId)

      const existingLimit = limits.find((limit) => limit.id === input.id)

      if (existingLimit && existingLimit.start_month < input.startMonth) {
        const previousEndMonth = getPrevMonthText(input.startMonth)
        const { error: closeError } = await supabase
          .from('budget_limits')
          .update({ end_month: previousEndMonth })
          .eq('id', input.id)
          .eq('profile_id', profileId)

        if (closeError) {
          throw new Error(closeError.message)
        }

        const { error: insertError } = await supabase
          .from('budget_limits')
          .insert(getBudgetLimitPayload(profileId, input))

        if (insertError) {
          throw new Error(insertError.message)
        }

        await loadBudgetLimits()
        return
      }

      const { error } = await supabase
        .from('budget_limits')
        .update({
          category_id: input.categoryId,
          amount: input.amount,
          start_month: input.startMonth,
          end_month: input.endMonth || null,
          mode: input.mode,
        })
        .eq('id', input.id)
        .eq('profile_id', profileId)

      if (error) {
        throw new Error(error.message)
      }

      await loadBudgetLimits()
    },
    [limits, loadBudgetLimits, profileId]
  )

  const deleteBudgetLimit = useCallback(
    async (limitId: string, effectiveMonth = selectedMonth) => {
      assertValidBudgetLimitProfileId(profileId)

      const existingLimit = limits.find((limit) => limit.id === limitId)
      const shouldCloseHistory =
        existingLimit &&
        existingLimit.start_month < effectiveMonth &&
        (!existingLimit.end_month || existingLimit.end_month >= effectiveMonth)

      const query = shouldCloseHistory
        ? supabase
            .from('budget_limits')
            .update({ end_month: getPrevMonthText(effectiveMonth) })
            .eq('id', limitId)
            .eq('profile_id', profileId)
        : supabase.from('budget_limits').delete().eq('id', limitId).eq('profile_id', profileId)

      const { error } = await query

      if (error) {
        throw new Error(error.message)
      }

      await loadBudgetLimits()
    },
    [limits, loadBudgetLimits, profileId, selectedMonth]
  )

  const disableBudgetLimit = useCallback(
    async (limitId: string, endMonth: string) => {
      assertValidBudgetLimitProfileId(profileId)

      const { error } = await supabase
        .from('budget_limits')
        .update({ end_month: endMonth })
        .eq('id', limitId)
        .eq('profile_id', profileId)

      if (error) {
        throw new Error(error.message)
      }

      await loadBudgetLimits()
    },
    [loadBudgetLimits, profileId]
  )

  return {
    limits,
    activeLimits,
    activeLimitStates,
    activeAlerts,
    isLoading,
    monthProgressPercent,
    loadBudgetLimits,
    addBudgetLimit,
    updateBudgetLimit,
    deleteBudgetLimit,
    disableBudgetLimit,
    getLimitForCategory,
    getUsage,
    getUsagePercent,
    getAlertState,
  }
}
