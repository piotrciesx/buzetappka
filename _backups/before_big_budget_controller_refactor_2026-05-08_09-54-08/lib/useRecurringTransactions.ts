'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import {
  RecurringReminderMonthStatus,
  RecurringTransaction,
  RecurringTransactionExecution,
} from './budgetPageTypes'
import {
  mapRecurringExecutionRow,
  mapRecurringReminderMonthStatusRow,
  mapRecurringTransactionRow,
} from './recurringTransactions'
import { getNextMonthText } from './dateUtils'

type SaveRecurringInput = Omit<RecurringTransaction, 'id' | 'profile_id' | 'created_at'> & {
  id?: string
}

type UseRecurringTransactionsParams = {
  profileId: string
  selectedMonth: string
}

export function useRecurringTransactions({ profileId, selectedMonth }: UseRecurringTransactionsParams) {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [recurringExecutions, setRecurringExecutions] = useState<RecurringTransactionExecution[]>([])
  const [recurringReminderMonthStatuses, setRecurringReminderMonthStatuses] = useState<
    RecurringReminderMonthStatus[]
  >([])

  useEffect(() => {
    setRecurringTransactions([])
    setRecurringExecutions([])
    setRecurringReminderMonthStatuses([])
  }, [profileId])

  const loadRecurringTransactions = useCallback(async () => {
    if (!profileId || !selectedMonth) {
      setRecurringTransactions([])
      setRecurringExecutions([])
      setRecurringReminderMonthStatuses([])
      return
    }

    const monthStartDate = `${selectedMonth}-01`
    const nextMonthStartDate = `${getNextMonthText(selectedMonth)}-01`

    const { data: recurringData, error: recurringError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('profile_id', profileId)
      .eq('status', 'active')
      .or(`start_date.is.null,start_date.lt.${nextMonthStartDate}`)
      .or(`end_date.is.null,end_date.gte.${monthStartDate}`)
      .order('created_at', { ascending: false })

    if (recurringError) {
      throw recurringError
    }

    const mappedRecurring = (recurringData || []).map((row) =>
      mapRecurringTransactionRow(row as Record<string, unknown>)
    )

    const recurringIds = mappedRecurring.map((row) => row.id)

    if (recurringIds.length === 0) {
      setRecurringTransactions([])
      setRecurringExecutions([])
      setRecurringReminderMonthStatuses([])
      return
    }

    const { data: executionsData, error: executionsError } = await supabase
      .from('recurring_transaction_executions')
      .select('*')
      .in('recurring_transaction_id', recurringIds)
      .gte('generated_for_date', monthStartDate)
      .lt('generated_for_date', nextMonthStartDate)
      .order('generated_for_date', { ascending: false })

    if (executionsError) {
      throw executionsError
    }

    const mappedExecutions = (executionsData || []).map((row) =>
      mapRecurringExecutionRow(row as Record<string, unknown>)
    )

    const { data: statusesData, error: statusesError } = await supabase
      .from('recurring_reminder_month_statuses')
      .select('*')
      .eq('profile_id', profileId)
      .eq('month', monthStartDate)
      .in('reminder_id', recurringIds)
      .order('month', { ascending: false })

    if (statusesError) {
      setRecurringTransactions(mappedRecurring)
      setRecurringExecutions(mappedExecutions)
      setRecurringReminderMonthStatuses([])
      return
    }

    const mappedStatuses = (statusesData || []).map((row) =>
      mapRecurringReminderMonthStatusRow(row as Record<string, unknown>)
    )

    setRecurringTransactions(mappedRecurring)
    setRecurringExecutions(mappedExecutions)
    setRecurringReminderMonthStatuses(mappedStatuses)
  }, [profileId, selectedMonth])

  const saveRecurringTransaction = useCallback(
    async (input: SaveRecurringInput) => {
      const normalizedAmount =
        input.amount === null || input.amount === undefined || Number.isNaN(Number(input.amount))
          ? null
          : Number(input.amount)

      const payload = {
        profile_id: profileId,
        name: input.name.trim(),
        category_id: input.category_id,
        payment_source_id: input.payment_source_id || null,
        amount: normalizedAmount,
        use_amount_when_creating: Boolean(input.use_amount_when_creating),
        initial_payment_amount: input.initial_payment_amount ?? null,
        description: input.description?.trim() || null,
        frequency: input.frequency,
        custom_interval_months: input.frequency === 'custom' ? input.custom_interval_months || 1 : null,
        start_date: input.start_date || null,
        end_date: input.end_date || null,
        installment_total_count:
          input.kind === 'installment' ? input.installment_total_count || null : null,
        kind: input.kind,
        status: input.status,
      }

      const query = input.id
        ? supabase
            .from('recurring_transactions')
            .update(payload)
            .eq('id', input.id)
            .eq('profile_id', profileId)
            .select('*')
            .single()
        : supabase.from('recurring_transactions').insert(payload).select('*').single()

      const { error } = await query

      if (error) {
        throw new Error(error.message)
      }

      await loadRecurringTransactions()
    },
    [loadRecurringTransactions, profileId]
  )

  const deleteRecurringTransaction = useCallback(
    async (recurringId: string) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', recurringId)
        .eq('profile_id', profileId)

      if (error) {
        throw new Error(error.message)
      }

      await loadRecurringTransactions()
    },
    [loadRecurringTransactions, profileId]
  )

  const saveRecurringReminderMonthStatus = useCallback(
    async ({
      reminderId,
      month,
      status,
      transactionId,
    }: {
      reminderId: string
      month: string
      status: RecurringReminderMonthStatus['status']
      transactionId?: string | null
    }) => {
      const { error } = await supabase.from('recurring_reminder_month_statuses').upsert(
        {
          profile_id: profileId,
          reminder_id: reminderId,
          month: `${month}-01`,
          status,
          transaction_id: transactionId || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'profile_id,reminder_id,month',
        }
      )

      if (error) {
        throw new Error(error.message)
      }

      setRecurringReminderMonthStatuses((prev) => {
        const normalizedMonth = month.slice(0, 7)
        const nextStatus: RecurringReminderMonthStatus = {
          id: `${reminderId}-${normalizedMonth}`,
          profile_id: profileId,
          reminder_id: reminderId,
          month: normalizedMonth,
          status,
          transaction_id: transactionId || null,
          updated_at: new Date().toISOString(),
        }

        return [
          nextStatus,
          ...prev.filter(
            (item) => !(item.reminder_id === reminderId && item.month === normalizedMonth)
          ),
        ]
      })
      await loadRecurringTransactions()
    },
    [loadRecurringTransactions, profileId]
  )

  const saveRecurringExecution = useCallback(
    async ({
      recurringTransactionId,
      generatedForDate,
      status,
      transactionId,
    }: {
      recurringTransactionId: string
      generatedForDate: string
      status: RecurringTransactionExecution['status']
      transactionId?: string | null
    }) => {
      const { error } = await supabase.from('recurring_transaction_executions').upsert(
        {
          recurring_transaction_id: recurringTransactionId,
          generated_for_date: generatedForDate,
          transaction_id: transactionId || null,
          status,
          marked_at: new Date().toISOString(),
        },
        {
          onConflict: 'recurring_transaction_id,generated_for_date',
        }
      )

      if (error) {
        throw new Error(error.message)
      }

      await loadRecurringTransactions()
    },
    [loadRecurringTransactions]
  )

  return {
    recurringTransactions,
    recurringExecutions,
    recurringReminderMonthStatuses,
    loadRecurringTransactions,
    saveRecurringTransaction,
    deleteRecurringTransaction,
    saveRecurringExecution,
    saveRecurringReminderMonthStatus,
  }
}
