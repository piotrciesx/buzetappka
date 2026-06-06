'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import {
  RecurringInstallment,
  RecurringReminderMonthStatus,
  RecurringTransaction,
  RecurringTransactionExecution,
} from './budgetPageTypes'
import {
  ReminderMonthLifecycleStatus,
  mapReminderLifecycleStatusToStoredStatus,
  mapRecurringExecutionRow,
  mapRecurringReminderMonthStatusRow,
  mapRecurringTransactionRow,
} from './recurringTransactions'

type SaveRecurringInput = Omit<RecurringTransaction, 'id' | 'profile_id' | 'created_at'> & {
  id?: string
}

type UseRecurringTransactionsParams = {
  profileId: string
  selectedMonth: string
  isEnabled?: boolean
}

export function useRecurringTransactions({
  profileId,
  selectedMonth,
  isEnabled = true,
}: UseRecurringTransactionsParams) {
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
    if (!isEnabled || !profileId || !selectedMonth) {
      setRecurringTransactions([])
      setRecurringExecutions([])
      setRecurringReminderMonthStatuses([])
      return
    }

    const monthStartDate = `${selectedMonth}-01`

    const { data: recurringData, error: recurringError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    if (recurringError) {
      throw recurringError
    }

    let mappedRecurring = (recurringData || []).map((row) =>
      mapRecurringTransactionRow(row as Record<string, unknown>)
    )

    const recurringIds = mappedRecurring.map((row) => row.id)

    if (recurringIds.length === 0) {
      setRecurringTransactions([])
      setRecurringExecutions([])
      setRecurringReminderMonthStatuses([])
      return
    }

    const { data: scheduleData, error: scheduleError } = await supabase
      .from('recurring_installment_schedule')
      .select('*')
      .in('recurring_transaction_id', recurringIds)
      .order('installment_number', { ascending: true })

    if (!scheduleError) {
      const scheduleByRecurringId = (scheduleData || []).reduce<Record<string, RecurringInstallment[]>>(
        (acc, row) => {
          const item = row as Record<string, unknown>
          const recurringId = String(item.recurring_transaction_id || '')
          if (!recurringId) return acc
          acc[recurringId] = [
            ...(acc[recurringId] || []),
            {
              id: typeof item.id === 'string' ? item.id : undefined,
              profile_id: typeof item.profile_id === 'string' ? item.profile_id : undefined,
              recurring_transaction_id: recurringId,
              installment_number: Number(item.installment_number || 0),
              due_date: String(item.due_date || ''),
              amount: Number(item.amount || 0),
              created_at: typeof item.created_at === 'string' ? item.created_at : undefined,
              updated_at: typeof item.updated_at === 'string' ? item.updated_at : undefined,
            },
          ]
          return acc
        },
        {}
      )

      mappedRecurring = mappedRecurring.map((recurring) => ({
        ...recurring,
        installment_schedule: scheduleByRecurringId[recurring.id] || [],
      }))
    }

    const { data: executionsData, error: executionsError } = await supabase
      .from('recurring_transaction_executions')
      .select('*')
      .in('recurring_transaction_id', recurringIds)
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
  }, [isEnabled, profileId, selectedMonth])

  const saveRecurringTransaction = useCallback(
    async (input: SaveRecurringInput) => {
      if (!isEnabled) {
        return
      }

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

      const { data, error } = await query

      if (error) {
        throw new Error(error.message)
      }

      const recurringId = String((data as Record<string, unknown> | null)?.id || input.id || '')

      if (recurringId) {
        const scheduleRows =
          input.kind === 'installment'
            ? (input.installment_schedule || []).map((installment, index) => ({
                profile_id: profileId,
                recurring_transaction_id: recurringId,
                installment_number: installment.installment_number || index + 1,
                due_date: installment.due_date,
                amount: installment.amount,
                updated_at: new Date().toISOString(),
              }))
            : []

        try {
          await supabase
            .from('recurring_installment_schedule')
            .delete()
            .eq('recurring_transaction_id', recurringId)
            .eq('profile_id', profileId)

          if (scheduleRows.length > 0) {
            const { error: scheduleError } = await supabase
              .from('recurring_installment_schedule')
              .insert(scheduleRows)

            if (scheduleError) {
              throw scheduleError
            }
          }
        } catch (scheduleError) {
          console.warn('Nie udało się zapisać harmonogramu rat.', scheduleError)
        }
      }

      await loadRecurringTransactions()
    },
    [isEnabled, loadRecurringTransactions, profileId]
  )

  const deleteRecurringTransaction = useCallback(
    async (recurringId: string) => {
      if (!isEnabled) {
        return
      }

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
    [isEnabled, loadRecurringTransactions, profileId]
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
      status: RecurringReminderMonthStatus['status'] | ReminderMonthLifecycleStatus
      transactionId?: string | null
    }) => {
      if (!isEnabled) {
        return
      }

      const storedStatus =
        status === 'handled_with_transaction' ||
        status === 'handled_without_transaction' ||
        status === 'pending' ||
        status === 'snoozed'
          ? mapReminderLifecycleStatusToStoredStatus(status)
          : status
      const { error } = await supabase.from('recurring_reminder_month_statuses').upsert(
        {
          profile_id: profileId,
          reminder_id: reminderId,
          month: `${month}-01`,
          status: storedStatus,
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
          status: storedStatus,
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
    [isEnabled, loadRecurringTransactions, profileId]
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
      if (!isEnabled) {
        return
      }

      await saveRecurringReminderMonthStatus({
        reminderId: recurringTransactionId,
        month: generatedForDate.slice(0, 7),
        status:
          status === 'completed' && transactionId
            ? 'handled_with_transaction'
            : 'handled_without_transaction',
        transactionId,
      })
    },
    [isEnabled, saveRecurringReminderMonthStatus]
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
