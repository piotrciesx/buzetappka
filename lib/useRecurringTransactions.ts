'use client'

import { useCallback, useState } from 'react'
import { supabase } from './supabaseClient'
import { RecurringTransaction, RecurringTransactionExecution } from './budgetPageTypes'
import {
  getPastDueCycleDates,
  mapRecurringExecutionRow,
  mapRecurringTransactionRow,
} from './recurringTransactions'

type SaveRecurringInput = Omit<RecurringTransaction, 'id' | 'profile_id' | 'created_at'> & {
  createPastExecutions?: boolean
  referenceMonth?: string
}

type UseRecurringTransactionsParams = {
  profileId: string
}

export function useRecurringTransactions({ profileId }: UseRecurringTransactionsParams) {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [recurringExecutions, setRecurringExecutions] = useState<RecurringTransactionExecution[]>([])

  const loadRecurringTransactions = useCallback(async () => {
    const { data: recurringData, error: recurringError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    if (recurringError) {
      throw recurringError
    }

    const mappedRecurring = (recurringData || []).map((row) =>
      mapRecurringTransactionRow(row as Record<string, unknown>)
    )

    setRecurringTransactions(mappedRecurring)

    const recurringIds = mappedRecurring.map((row) => row.id)

    if (recurringIds.length === 0) {
      setRecurringExecutions([])
      return
    }

    const { data: executionsData, error: executionsError } = await supabase
      .from('recurring_transaction_executions')
      .select('*')
      .in('recurring_transaction_id', recurringIds)
      .order('generated_for_date', { ascending: false })

    if (executionsError) {
      throw executionsError
    }

    setRecurringExecutions(
      (executionsData || []).map((row) => mapRecurringExecutionRow(row as Record<string, unknown>))
    )
  }, [profileId])

  const saveRecurringTransaction = useCallback(
    async (input: SaveRecurringInput & { id?: string }) => {
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
        ? supabase.from('recurring_transactions').update(payload).eq('id', input.id).select('*').single()
        : supabase.from('recurring_transactions').insert(payload).select('*').single()

      const { data, error } = await query

      if (error) {
        throw new Error(error.message)
      }

      const savedRecurring = data
        ? mapRecurringTransactionRow(data as Record<string, unknown>)
        : null

      if (savedRecurring && input.createPastExecutions && input.referenceMonth) {
        const dueDates = getPastDueCycleDates(savedRecurring, input.referenceMonth)

        if (dueDates.length > 0) {
          const { error: seedError } = await supabase.from('recurring_transaction_executions').upsert(
            dueDates.map((generatedForDate) => ({
              recurring_transaction_id: savedRecurring.id,
              generated_for_date: generatedForDate,
              status: 'skipped',
              marked_at: new Date().toISOString(),
            })),
            {
              onConflict: 'recurring_transaction_id,generated_for_date',
            }
          )

          if (seedError) {
            throw new Error(seedError.message)
          }
        }
      }

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
    loadRecurringTransactions,
    saveRecurringTransaction,
    saveRecurringExecution,
  }
}
