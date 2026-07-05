import type { Grosze } from '../recurring-payments/money'
import type {
  BudgetLimitChangeMode,
  BudgetLimitPeriodInstance,
  BudgetLimitUsageSummary,
  BudgetLimitVersion,
} from './types'

export type BudgetLimitPeriodOverride = {
  periodId: string
  limitAmountGrosze: Grosze
}

export type BudgetLimitHistoryChangePlan =
  | { mode: 'only_this_period'; override: BudgetLimitPeriodOverride }
  | { mode: 'from_next_period'; effectiveFrom: string; limitAmountGrosze: Grosze }
  | { mode: 'from_now'; effectiveFrom: string; limitAmountGrosze: Grosze }

export const getBudgetLimitVersionForPeriod = (
  versions: readonly BudgetLimitVersion[],
  periodStart: string
) => {
  return (
    [...versions]
      .filter(
        (version) =>
          version.effectiveFrom <= periodStart &&
          (!version.effectiveTo || version.effectiveTo >= periodStart)
      )
      .sort((left, right) => right.effectiveFrom.localeCompare(left.effectiveFrom))[0] ?? null
  )
}

export const planBudgetLimitAmountChange = ({
  mode,
  period,
  nextPeriodStart,
  newLimitAmountGrosze,
}: {
  mode: BudgetLimitChangeMode
  period: Pick<BudgetLimitPeriodInstance, 'id' | 'periodStart'>
  nextPeriodStart: string
  newLimitAmountGrosze: Grosze
}): BudgetLimitHistoryChangePlan => {
  if (mode === 'only_this_period') {
    return {
      mode,
      override: { periodId: period.id, limitAmountGrosze: newLimitAmountGrosze },
    }
  }
  if (mode === 'from_next_period') {
    return { mode, effectiveFrom: nextPeriodStart, limitAmountGrosze: newLimitAmountGrosze }
  }
  return { mode, effectiveFrom: period.periodStart, limitAmountGrosze: newLimitAmountGrosze }
}

export type MonthlyBudgetLimitHistoryEntry = {
  period: BudgetLimitPeriodInstance
  version: BudgetLimitVersion | null
  summary: BudgetLimitUsageSummary | null
}

export const buildMonthlyBudgetLimitHistory = ({
  periods,
  versions,
  summaries,
}: {
  periods: readonly BudgetLimitPeriodInstance[]
  versions: readonly BudgetLimitVersion[]
  summaries: readonly BudgetLimitUsageSummary[]
}): MonthlyBudgetLimitHistoryEntry[] => {
  const summariesByPeriodId = new Map(summaries.map((summary) => [summary.periodId, summary]))
  return [...periods]
    .filter((period) => period.periodType === 'monthly')
    .sort((left, right) => left.periodStart.localeCompare(right.periodStart))
    .map((period) => ({
      period,
      version: getBudgetLimitVersionForPeriod(versions, period.periodStart),
      summary: summariesByPeriodId.get(period.id) ?? null,
    }))
}

