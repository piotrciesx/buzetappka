'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Category, Transaction } from '../budgetPageTypes'
import { getEffectiveTransactionScope } from '../transactionScope'
import { supabase } from '../supabaseClient'
import { buildBudgetLimitAlertStates } from './alerts'
import { calculateBudgetLimitUsage } from './calculations'
import { getBudgetLimitScopeDecision } from './scopes'
import { parseGrosze } from '../recurring-payments/money'
import type {
  BudgetLimitAlertRule,
  BudgetLimitCategoryNode,
  BudgetLimitPeriodInstance,
  BudgetLimitScope,
  BudgetLimitTransactionCandidate,
} from './types'
import type {
  BudgetLimitAlertRow,
  BudgetLimitPeriodRow,
  BudgetLimitPlanDraft,
  BudgetLimitPlanRow,
  BudgetLimitVersionRow,
} from './data'

type Params = {
  profileId: string
  selectedMonth: string
  categoriesById: Record<string, Category>
  expenseLevel1Id: string | null
  transactions: Transaction[]
  budgetStartDate?: string | null
  getSignedAmountForTransaction: (transaction: Transaction) => number
  enabled?: boolean
}

type BudgetLimitDataErrorDetails = {
  operation: string
  profileId: string | null
  month: string | null
  planId?: string | null
  code?: string
  message?: string
  details?: string
  hint?: string
  status?: string | number
  cause?: string
}

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

const getRoot = (categoryId: string, categories: Record<string, Category>) => {
  let current = categories[categoryId]
  while (current?.parent_id) current = categories[current.parent_id]
  return current?.id || null
}

const getErrorField = (error: unknown, field: string) => {
  if (!error || typeof error !== 'object' || !(field in error)) return undefined
  const value = (error as Record<string, unknown>)[field]
  return typeof value === 'string' || typeof value === 'number' ? value : undefined
}

const buildErrorDetails = ({
  operation,
  profileId,
  month,
  planId,
  error,
}: {
  operation: string
  profileId: string | null
  month: string | null
  planId?: string | null
  error: unknown
}): BudgetLimitDataErrorDetails => ({
  operation,
  profileId,
  month,
  planId,
  code: getErrorField(error, 'code')?.toString(),
  message: getErrorField(error, 'message')?.toString(),
  details: getErrorField(error, 'details')?.toString(),
  hint: getErrorField(error, 'hint')?.toString(),
  status: getErrorField(error, 'status'),
  cause: getErrorField(error, 'cause')?.toString(),
})

const getErrorMessage = (details: BudgetLimitDataErrorDetails, fallback: string) =>
  details.message || details.details || details.hint || fallback

const warnHandledBudgetLimitError = (
  message: string,
  details: BudgetLimitDataErrorDetails,
) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(message, details)
  }
}

const rulesFor = (version: BudgetLimitVersionRow): BudgetLimitAlertRule[] => {
  const thresholds = Array.isArray(version.alert_thresholds)
    ? version.alert_thresholds
    : []

  return [
    ...thresholds.map((value) => ({
      id: `threshold-${value}`,
      kind: 'threshold_reached' as const,
      thresholdPercent: value,
      enabled: true,
    })),
    { id: 'exceeded', kind: 'limit_exceeded', thresholdPercent: 100, enabled: true },
    { id: 'forecast', kind: 'projected_exceeded', enabled: version.forecast_alert_enabled },
  ]
}

export function useBudgetLimitsData({
  profileId,
  selectedMonth,
  categoriesById,
  expenseLevel1Id,
  transactions,
  budgetStartDate,
  getSignedAmountForTransaction,
  enabled = true,
}: Params) {
  const [plans, setPlans] = useState<BudgetLimitPlanRow[]>([])
  const [versions, setVersions] = useState<BudgetLimitVersionRow[]>([])
  const [periods, setPeriods] = useState<BudgetLimitPeriodRow[]>([])
  const [storedAlerts, setStoredAlerts] = useState<BudgetLimitAlertRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<BudgetLimitDataErrorDetails | null>(null)

  const resetData = useCallback(() => {
    setPlans([])
    setVersions([])
    setPeriods([])
    setStoredAlerts([])
  }, [])

  const setHandledError = useCallback((
    fallbackMessage: string,
    details: BudgetLimitDataErrorDetails,
  ) => {
    setError(getErrorMessage(details, fallbackMessage))
    setErrorDetails(details)
    resetData()
    warnHandledBudgetLimitError('[budget-limits] Obsłużony błąd ładowania limitów.', details)
  }, [resetData])

  const ensurePeriodsForMonth = useCallback(async (
    planRows: BudgetLimitPlanRow[],
    month: string,
  ) => {
    if (planRows.length === 0) return true

    const ensured = await Promise.all(planRows.map(async (plan) => {
      const result = await supabase.rpc('ensure_budget_limit_period_v1', {
        p_plan_id: plan.id,
        p_month: month,
      })
      return { planId: plan.id, error: result.error }
    }))
    const failed = ensured.find((result) => result.error)

    if (!failed?.error) return true

    const details = buildErrorDetails({
      operation: 'ensure_budget_limit_period_v1',
      profileId,
      month,
      planId: failed.planId,
      error: failed.error,
    })
    setHandledError(
      'Nie udało się przygotować okresu limitów dla tego miesiąca.',
      details,
    )
    return false
  }, [profileId, setHandledError])

  const load = useCallback(async () => {
    if (!enabled) return

    if (!profileId) {
      resetData()
      setError(null)
      setErrorDetails(null)
      return
    }

    if (!MONTH_PATTERN.test(selectedMonth || '')) {
      setHandledError('Nie udało się przygotować okresu limitów dla tego miesiąca.', {
        operation: 'validate_budget_limit_month',
        profileId,
        month: selectedMonth || null,
        message: 'Nieprawidłowy format miesiąca limitów.',
      })
      return
    }

    setLoading(true)
    setError(null)
    setErrorDetails(null)

    try {
      const planResult = await supabase
        .from('budget_limit_plans')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at')

      if (planResult.error) {
        setHandledError('Błąd pobierania limitów.', buildErrorDetails({
          operation: 'select_budget_limit_plans',
          profileId,
          month: selectedMonth,
          error: planResult.error,
        }))
        return
      }

      const planRows = ((planResult.data || []) as Array<Omit<BudgetLimitPlanRow, 'status'> & { status: string }>).map((plan) => ({
        ...plan,
        status: plan.status === 'active' ? 'active' : 'inactive',
      })) as BudgetLimitPlanRow[]

      const ensured = await ensurePeriodsForMonth(planRows, selectedMonth)
      if (!ensured) return

      const [versionResult, periodResult, alertResult] = await Promise.all([
        supabase.from('budget_limit_versions').select('*').eq('profile_id', profileId).order('effective_from'),
        supabase.from('budget_limit_periods').select('*').eq('profile_id', profileId).order('period_start', { ascending: false }),
        supabase.from('budget_limit_alerts').select('*').eq('profile_id', profileId).order('triggered_at', { ascending: false }),
      ])

      if (versionResult.error || periodResult.error) {
        setHandledError('Błąd pobierania okresów limitów.', buildErrorDetails({
          operation: versionResult.error ? 'select_budget_limit_versions' : 'select_budget_limit_periods',
          profileId,
          month: selectedMonth,
          error: versionResult.error || periodResult.error,
        }))
        return
      }

      setPlans(planRows)
      setVersions((versionResult.data || []) as BudgetLimitVersionRow[])
      setPeriods((periodResult.data || []) as BudgetLimitPeriodRow[])
      setStoredAlerts(alertResult.error ? [] : (alertResult.data || []) as BudgetLimitAlertRow[])

      if (alertResult.error) {
        warnHandledBudgetLimitError('[budget-limits] Nie udało się pobrać alertów limitów.', buildErrorDetails({
          operation: 'select_budget_limit_alerts',
          profileId,
          month: selectedMonth,
          error: alertResult.error,
        }))
      }
    } catch (caughtError) {
      setHandledError('Nie udało się wczytać limitów budżetowych.', buildErrorDetails({
        operation: 'load_budget_limits',
        profileId,
        month: selectedMonth,
        error: caughtError,
      }))
    } finally {
      setLoading(false)
    }
  }, [enabled, ensurePeriodsForMonth, profileId, resetData, selectedMonth, setHandledError])

  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(task)
  }, [load])

  const categories = useMemo(() => Object.fromEntries(
    Object.values(categoriesById)
      .filter((category) => category.level >= 1 && category.level <= 3)
      .map((category) => [
        category.id,
        {
          id: category.id,
          level: category.level as 1 | 2 | 3,
          parentId: category.parent_id,
        },
      ]),
  ) as Record<string, BudgetLimitCategoryNode>, [categoriesById])

  const candidates = useMemo(() => getEffectiveTransactionScope(transactions, {
    mode: 'limits',
    budgetStartDate,
  }).map((transaction) => {
    const signed = getSignedAmountForTransaction(transaction)

    return {
      id: transaction.id,
      categoryId: transaction.category_id,
      amountGrosze: parseGrosze(Math.abs(signed).toFixed(2)),
      rootType: getRoot(transaction.category_id, categoriesById) === expenseLevel1Id
        ? 'expense'
        : 'income',
      date: transaction.date,
      dateKind: transaction.day_is_null ? 'month_only' : 'exact_day',
      isDeleted: transaction.is_deleted,
      semanticType: 'standard',
    } satisfies BudgetLimitTransactionCandidate
  }), [
    budgetStartDate,
    categoriesById,
    expenseLevel1Id,
    getSignedAmountForTransaction,
    transactions,
  ])

  const calculated = useMemo(() => periods.flatMap((period) => {
    const version = versions.find((item) => item.id === period.version_id)
    if (!version) return []

    const scope: BudgetLimitScope = version.scope_type === 'global_expenses'
      ? { type: 'global_expenses' }
      : version.scope_type === 'category_group'
        ? { type: 'category_group', categoryIds: version.category_ids || [] }
        : { type: version.scope_type, categoryId: version.category_id || '' }
    const instance: BudgetLimitPeriodInstance = {
      id: period.id,
      planId: period.plan_id,
      versionId: period.version_id,
      profileId: period.profile_id,
      periodType: 'monthly',
      periodStart: period.period_start,
      periodEnd: period.period_end,
      status: period.status,
    }
    const summary = calculateBudgetLimitUsage({
      planId: period.plan_id,
      period: instance,
      limitAmountGrosze: parseGrosze(period.limit_amount_snapshot),
      scope,
      alertRules: rulesFor(version),
      transactions: candidates,
      categoriesById: categories,
      asOfDate: new Date().toISOString().slice(0, 10),
    })
    const includedTransactions = transactions.filter((transaction) => {
      const candidate = candidates.find((item) => item.id === transaction.id)
      return candidate &&
        getBudgetLimitScopeDecision({ transaction: candidate, scope, categoriesById: categories }).result === 'included' &&
        transaction.date.slice(0, 7) === period.period_start.slice(0, 7)
    })

    return [{ period, version, summary, includedTransactions }]
  }), [candidates, categories, periods, transactions, versions])

  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      !loading &&
      !error &&
      plans.length > 0 &&
      !calculated.some((item) => item.period.period_start.slice(0, 7) === selectedMonth)
    ) {
      console.warn('[budget-limits] Plany istnieją, ale brak widocznego snapshotu dla wybranego miesiąca.', {
        profileId,
        selectedMonth,
        planCount: plans.length,
        versionCount: versions.length,
        periodCount: periods.length,
      })
    }
  }, [
    calculated,
    error,
    loading,
    periods.length,
    plans.length,
    profileId,
    selectedMonth,
    versions.length,
  ])

  const alerts = useMemo(() => calculated.flatMap((item) => {
    const plan = plans.find((value) => value.id === item.period.plan_id)
    if (plan?.status !== 'active' || !item.period.is_active_snapshot) return []

    const generated = buildBudgetLimitAlertStates({
      summary: item.summary,
      rules: rulesFor(item.version),
      triggeredAt: new Date().toISOString(),
    })

    return generated.map((alert) => {
      const threshold = alert.thresholdPercent ?? 0
      const stored = storedAlerts.find((row) =>
        row.period_id === alert.periodId &&
        row.kind === alert.kind &&
        row.threshold_percent === threshold)

      return stored || {
        id: alert.id,
        profile_id: profileId,
        plan_id: alert.planId,
        period_id: alert.periodId,
        kind: alert.kind,
        threshold_percent: threshold,
        spent_at_trigger: alert.spentGroszeAtTrigger / 100,
        limit_at_trigger: alert.limitGroszeAtTrigger / 100,
        triggered_at: alert.triggeredAt,
        read_at: null,
        muted_for_period: false,
        resolved_at: null,
      }
    })
  }), [calculated, plans, profileId, storedAlerts])

  const savePlan = useCallback(async (draft: BudgetLimitPlanDraft) => {
    const { data: planId, error: saveError } = await supabase.rpc('save_budget_limit_plan_v2', {
      p_profile_id: profileId,
      p_plan_id: draft.id || null,
      p_name: draft.name,
      p_scope_type: draft.scope_type,
      p_category_id: draft.scope_type === 'global_expenses' ? null : draft.category_id,
      p_limit_amount: draft.limit_amount,
      p_effective_month: draft.effective_month,
      p_alert_thresholds: draft.alert_thresholds,
      p_forecast_enabled: draft.forecast_alert_enabled,
      p_status: draft.status,
    })

    if (saveError) throw new Error(saveError.message)

    if (!planId || !MONTH_PATTERN.test(selectedMonth || '')) {
      await load()
      return
    }

    const { error: periodError } = await supabase.rpc('ensure_budget_limit_period_v1', {
      p_plan_id: planId,
      p_month: selectedMonth,
    })

    if (periodError) {
      setHandledError('Nie udało się przygotować okresu limitów dla tego miesiąca.', buildErrorDetails({
        operation: 'ensure_budget_limit_period_v1_after_save',
        profileId,
        month: selectedMonth,
        planId: String(planId),
        error: periodError,
      }))
      return
    }

    await load()
  }, [load, profileId, selectedMonth, setHandledError])

  const setPlanActive = useCallback(async (
    id: string,
    isActive: boolean,
    effectiveMonth: string,
    limitAmount?: number,
  ) => {
    const { error: statusError } = await supabase.rpc('set_budget_limit_plan_active_v1', {
      p_plan_id: id,
      p_active: isActive,
      p_effective_month: effectiveMonth,
      p_limit_amount: limitAmount ?? null,
    })
    if (statusError) throw statusError
    await load()
  }, [load])

  const persistAlert = useCallback(async (
    alert: BudgetLimitAlertRow,
    mode: 'read' | 'muted',
  ) => {
    const payload = {
      ...alert,
      id: alert.id.includes(':') ? undefined : alert.id,
      profile_id: profileId,
      read_at: mode === 'read' ? new Date().toISOString() : alert.read_at,
      muted_for_period: mode === 'muted' ? true : alert.muted_for_period,
    }
    const { error: alertError } = await supabase
      .from('budget_limit_alerts')
      .upsert(payload, { onConflict: 'period_id,kind,threshold_percent' })
    if (alertError) throw alertError
    await load()
  }, [load, profileId])

  return {
    plans,
    versions,
    periods,
    alerts,
    calculated,
    loading,
    error,
    errorDetails,
    hasError: Boolean(error),
    isReady: !loading && !error,
    load,
    createPlan: savePlan,
    updatePlan: savePlan,
    setPlanActive,
    markAlertRead: (alert: BudgetLimitAlertRow) => persistAlert(alert, 'read'),
    muteAlert: (alert: BudgetLimitAlertRow) => persistAlert(alert, 'muted'),
  }
}

export type ReturnTypeOfUseBudgetLimitsData = ReturnType<typeof useBudgetLimitsData>
