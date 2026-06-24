'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  FinancialGoal,
  FinancialGoalAllocationMode,
  FinancialGoalMonthConfig,
  FinancialGoalMonthPriority,
} from './budgetPageTypes'
import {
  mapFinancialGoalMonthConfigRow,
  mapFinancialGoalMonthPriorityRow,
  mapFinancialGoalRow,
} from './financialGoals'
import { supabase } from './supabaseClient'

type SaveFinancialGoalInput = Omit<FinancialGoal, 'id' | 'profile_id' | 'created_at'>

type UseFinancialGoalsParams = {
  profileId: string
  isEnabled?: boolean
}

const getGoalHistoryMonths = (rows: Array<Record<string, unknown>> = []) =>
  rows
    .map((row) => (typeof row.month === 'string' ? row.month.slice(0, 7) : ''))
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right))

const hasStoredGoalAmountOrFinalStatus = (row: Record<string, unknown> | null | undefined) => {
  if (!row) {
    return false
  }

  const currentAmount = Number(row.current_amount || 0)
  const status = typeof row.status === 'string' ? row.status : 'active'

  return (
    (Number.isFinite(currentAmount) && currentAmount > 0) ||
    status === 'completed' ||
    status === 'cancelled' ||
    Boolean(row.completed_at)
  )
}

export function useFinancialGoals({ profileId, isEnabled = true }: UseFinancialGoalsParams) {
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([])
  const [financialGoalPriorities, setFinancialGoalPriorities] = useState<FinancialGoalMonthPriority[]>([])
  const [financialGoalMonthConfigs, setFinancialGoalMonthConfigs] = useState<FinancialGoalMonthConfig[]>([])

  useEffect(() => {
    setFinancialGoals([])
    setFinancialGoalPriorities([])
    setFinancialGoalMonthConfigs([])
  }, [profileId])

  const loadFinancialGoals = useCallback(async () => {
    if (!isEnabled) {
      setFinancialGoals([])
      setFinancialGoalPriorities([])
      setFinancialGoalMonthConfigs([])
      return
    }

    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    setFinancialGoals(
      (data || [])
        .map((row) => mapFinancialGoalRow(row as Record<string, unknown>))
        .filter((goal): goal is FinancialGoal => goal !== null)
    )

    const { data: prioritiesData, error: prioritiesError } = await supabase
      .from('financial_goal_month_priorities')
      .select('*')
      .eq('profile_id', profileId)
      .order('month', { ascending: true })
      .order('sort_order', { ascending: true })

    if (prioritiesError) {
      throw new Error(prioritiesError.message)
    }

    setFinancialGoalPriorities(
      (prioritiesData || []).map((row) =>
        mapFinancialGoalMonthPriorityRow(row as Record<string, unknown>)
      )
    )

    const { data: configsData, error: configsError } = await supabase
      .from('financial_goal_month_configs')
      .select('*')
      .eq('profile_id', profileId)
      .order('month', { ascending: true })

    if (configsError) {
      throw new Error(configsError.message)
    }

    setFinancialGoalMonthConfigs(
      (configsData || []).map((row) => mapFinancialGoalMonthConfigRow(row as Record<string, unknown>))
    )
  }, [isEnabled, profileId])

  const saveFinancialGoal = useCallback(
    async (input: SaveFinancialGoalInput & { id?: string }) => {
      if (!isEnabled) {
        return
      }

      if (!Number.isFinite(input.target_amount) || input.target_amount <= 0) {
        throw new Error('Kwota docelowa celu musi być skończoną liczbą większą od 0.')
      }

      if (input.id) {
        const { data: existingGoal, error: existingGoalError } = await supabase
          .from('financial_goals')
          .select('id, start_month, start_date, current_amount, status, completed_at')
          .eq('id', input.id)
          .eq('profile_id', profileId)
          .maybeSingle()

        if (existingGoalError) {
          throw new Error(existingGoalError.message)
        }

        const { data: historyRows, error: historyError } = await supabase
          .from('financial_goal_month_priorities')
          .select('month')
          .eq('profile_id', profileId)
          .eq('goal_id', input.id)
          .order('month', { ascending: true })

        if (historyError) {
          throw new Error(historyError.message)
        }

        const historyMonths = getGoalHistoryMonths((historyRows || []) as Array<Record<string, unknown>>)
        const existingStartMonth =
          typeof existingGoal?.start_month === 'string' && existingGoal.start_month
            ? existingGoal.start_month.slice(0, 7)
            : typeof existingGoal?.start_date === 'string' && existingGoal.start_date
              ? existingGoal.start_date.slice(0, 7)
              : ''
        const firstProtectedMonth =
          historyMonths[0] ||
          (hasStoredGoalAmountOrFinalStatus(existingGoal as Record<string, unknown> | null)
            ? existingStartMonth
            : '')

        if (
          firstProtectedMonth &&
          input.start_month &&
          input.start_month.localeCompare(firstProtectedMonth) > 0
        ) {
          throw new Error(
            `Nie można przesunąć startu celu po miesiącu ${firstProtectedMonth}, bo cel ma już historię lub środki.`
          )
        }
      }

      const payload = {
        profile_id: profileId,
        name: input.name.trim(),
        target_amount: input.target_amount,
        start_month: input.start_month,
        deadline_month: input.deadline_month || null,
        allocation_percent:
          input.allocation_percent === null || input.allocation_percent === undefined
            ? null
            : Math.round(input.allocation_percent),
        start_date: input.start_month ? `${input.start_month}-01` : null,
        end_date: input.deadline_month ? `${input.deadline_month}-01` : null,
        icon_key: input.icon_key || null,
        color_tone: input.color_tone || null,
      }

      const query = input.id
        ? supabase.from('financial_goals').update(payload).eq('id', input.id).eq('profile_id', profileId)
        : supabase.from('financial_goals').insert(payload)

      const { error } = await query

      if (error) {
        throw new Error(error.message)
      }

      await loadFinancialGoals()
    },
    [isEnabled, loadFinancialGoals, profileId]
  )

  const saveGoalPrioritiesForMonth = useCallback(
    async (month: string, orderedGoalIds: string[]) => {
      if (!isEnabled) {
        return
      }

      const { error: deleteError } = await supabase
        .from('financial_goal_month_priorities')
        .delete()
        .eq('profile_id', profileId)
        .eq('month', month)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      if (orderedGoalIds.length > 0) {
        const priorityRows = orderedGoalIds.map((goalId, index) => ({
          profile_id: profileId,
          goal_id: goalId,
          month,
          sort_order: index,
          allocation_percent: null,
          allocation_locked: false,
        }))

        const { data: insertedRows, error: insertError } = await supabase
          .from('financial_goal_month_priorities')
          .insert(priorityRows)
          .select('*')

        if (insertError) {
          throw new Error(insertError.message)
        }

        setFinancialGoalPriorities((prev) => [
          ...prev.filter((priority) => priority.month !== month),
          ...(insertedRows || []).map((row) =>
            mapFinancialGoalMonthPriorityRow(row as Record<string, unknown>)
          ),
        ])
      } else {
        setFinancialGoalPriorities((prev) => prev.filter((priority) => priority.month !== month))
      }
    },
    [isEnabled, profileId]
  )

  const saveGoalAllocationsForMonth = useCallback(
    async (
      month: string,
      allocationsByGoalId: Record<string, number>,
      lockedGoalIds: string[] = []
    ) => {
      if (!isEnabled) {
        return
      }

      const lockedGoalIdsSet = new Set(lockedGoalIds)
      const orderedGoalIds = Object.entries(allocationsByGoalId)
        .sort((left, right) => {
          if (right[1] !== left[1]) {
            return right[1] - left[1]
          }

          return left[0].localeCompare(right[0])
        })
        .map(([goalId]) => goalId)

      const { error: deleteError } = await supabase
        .from('financial_goal_month_priorities')
        .delete()
        .eq('profile_id', profileId)
        .eq('month', month)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      let insertedPriorityRows: FinancialGoalMonthPriority[] = []

      if (orderedGoalIds.length > 0) {
        const allocationRows = orderedGoalIds.map((goalId, index) => ({
          profile_id: profileId,
          goal_id: goalId,
          month,
          sort_order: index,
          allocation_percent: Math.round(allocationsByGoalId[goalId] ?? 0),
          allocation_locked: lockedGoalIdsSet.has(goalId),
        }))

        const { data: insertedRows, error: insertError } = await supabase
          .from('financial_goal_month_priorities')
          .insert(allocationRows)
          .select('*')

        if (insertError) {
          throw new Error(insertError.message)
        }

        insertedPriorityRows = (insertedRows || []).map((row) =>
          mapFinancialGoalMonthPriorityRow(row as Record<string, unknown>)
        )
      }

      if (orderedGoalIds.length > 0) {
        await Promise.all(
          orderedGoalIds.map(async (goalId) => {
            const { error: updateFutureLockError } = await supabase
              .from('financial_goal_month_priorities')
              .update({
                allocation_locked: lockedGoalIdsSet.has(goalId),
              })
              .eq('profile_id', profileId)
              .eq('goal_id', goalId)
              .gt('month', month)

            if (updateFutureLockError) {
              throw new Error(updateFutureLockError.message)
            }
          })
        )
      }

      const savedGoalIdsSet = new Set(orderedGoalIds)

      setFinancialGoalPriorities((prev) => [
        ...prev
          .filter((priority) => priority.month !== month)
          .map((priority) => {
            if (priority.month <= month || !savedGoalIdsSet.has(priority.goal_id)) {
              return priority
            }

            return {
              ...priority,
              allocation_locked: lockedGoalIdsSet.has(priority.goal_id),
            }
          }),
        ...insertedPriorityRows,
      ])
    },
    [isEnabled, profileId]
  )

  const setGoalModeForMonth = useCallback(
    async (month: string, mode: FinancialGoalAllocationMode) => {
      if (!isEnabled) {
        return
      }

      const { error } = await supabase.from('financial_goal_month_configs').upsert(
        {
          profile_id: profileId,
          month,
          mode,
        },
        {
          onConflict: 'profile_id,month',
        }
      )

      if (error) {
        throw new Error(error.message)
      }
    },
    [isEnabled, profileId]
  )

  const deleteFinancialGoal = useCallback(
    async (goalId: string) => {
      if (!isEnabled) {
        return
      }

      const { data: existingGoal, error: existingGoalError } = await supabase
        .from('financial_goals')
        .select('id, current_amount, status, completed_at')
        .eq('id', goalId)
        .eq('profile_id', profileId)
        .maybeSingle()

      if (existingGoalError) {
        throw new Error(existingGoalError.message)
      }

      const { data: priorityRows, error: priorityRowsError } = await supabase
        .from('financial_goal_month_priorities')
        .select('id, month, allocation_percent, allocation_locked')
        .eq('profile_id', profileId)
        .eq('goal_id', goalId)

      if (priorityRowsError) {
        throw new Error(priorityRowsError.message)
      }

      if (
        hasStoredGoalAmountOrFinalStatus(existingGoal as Record<string, unknown> | null) ||
        (priorityRows || []).length > 0
      ) {
        throw new Error(
          'Nie można trwale usunąć celu z historią, środkami albo alokacją bez migracji soft delete. Cel pozostaje bez zmian.'
        )
      }

      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', goalId)
        .eq('profile_id', profileId)

      if (error) {
        throw new Error(error.message)
      }

      await loadFinancialGoals()
    },
    [isEnabled, loadFinancialGoals, profileId]
  )

  return {
    financialGoals,
    financialGoalPriorities,
    financialGoalMonthConfigs,
    loadFinancialGoals,
    saveFinancialGoal,
    deleteFinancialGoal,
    setGoalModeForMonth,
    saveGoalPrioritiesForMonth,
    saveGoalAllocationsForMonth,
  }
}
