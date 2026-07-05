import {
  addGrosze,
  compareGrosze,
  grosze,
  subtractGrosze,
  zeroGrosze,
  type Grosze,
} from '../recurring-payments/money'
import { getBudgetLimitPeriodProgress, getTransactionBudgetLimitPeriodMembership } from './periods'
import { getBudgetLimitScopeDecision } from './scopes'
import type {
  BudgetLimitAlertRule,
  BudgetLimitCategoryNode,
  BudgetLimitPeriodInstance,
  BudgetLimitScope,
  BudgetLimitTransactionCandidate,
  BudgetLimitUsageStatus,
  BudgetLimitUsageSummary,
} from './types'

const divideGrosze = (value: Grosze, divisor: number) => {
  if (!Number.isSafeInteger(divisor) || divisor <= 0) return zeroGrosze
  return grosze(Math.floor(value / divisor))
}

export const getBudgetLimitUsagePercent = (spent: Grosze, limit: Grosze) => {
  if (compareGrosze(limit, zeroGrosze) <= 0) return 0
  return (spent * 100) / limit
}

export const getBudgetLimitUsageStatus = ({
  spentAmountGrosze,
  limitAmountGrosze,
  alertRules,
}: {
  spentAmountGrosze: Grosze
  limitAmountGrosze: Grosze
  alertRules: readonly BudgetLimitAlertRule[]
}): BudgetLimitUsageStatus => {
  if (compareGrosze(spentAmountGrosze, limitAmountGrosze) >= 0) return 'exceeded'

  const warningThresholds = alertRules
    .filter(
      (rule) =>
        rule.enabled &&
        rule.kind === 'threshold_reached' &&
        rule.thresholdPercent !== undefined
    )
    .map((rule) => rule.thresholdPercent as number)

  return warningThresholds.some(
    (threshold) => spentAmountGrosze * 100 >= limitAmountGrosze * threshold
  )
    ? 'warning'
    : 'safe'
}

export const calculateBudgetLimitUsage = ({
  planId,
  period,
  limitAmountGrosze,
  scope,
  alertRules,
  transactions,
  categoriesById,
  asOfDate,
}: {
  planId: string
  period: BudgetLimitPeriodInstance
  limitAmountGrosze: Grosze
  scope: BudgetLimitScope
  alertRules: readonly BudgetLimitAlertRule[]
  transactions: readonly BudgetLimitTransactionCandidate[]
  categoriesById: Readonly<Record<string, BudgetLimitCategoryNode>>
  asOfDate: string
}): BudgetLimitUsageSummary => {
  if (compareGrosze(limitAmountGrosze, zeroGrosze) <= 0) {
    throw new Error('Budget limit amount must be greater than zero.')
  }

  let spentAmountGrosze = zeroGrosze
  let includedTransactionCount = 0
  let unknownTransactionCount = 0

  transactions.forEach((transaction) => {
    const scopeDecision = getBudgetLimitScopeDecision({ transaction, scope, categoriesById })
    const periodDecision = getTransactionBudgetLimitPeriodMembership({
      date: transaction.date,
      dateKind: transaction.dateKind,
      period,
    })

    if (periodDecision === 'outside' || scopeDecision.result === 'excluded') return

    if (scopeDecision.result === 'unknown' || periodDecision === 'unknown_day') {
      unknownTransactionCount += 1
      return
    }

    spentAmountGrosze = addGrosze(spentAmountGrosze, transaction.amountGrosze)
    includedTransactionCount += 1
  })

  const remainingAmountGrosze = subtractGrosze(limitAmountGrosze, spentAmountGrosze)
  const exceededAmountGrosze =
    compareGrosze(spentAmountGrosze, limitAmountGrosze) > 0
      ? subtractGrosze(spentAmountGrosze, limitAmountGrosze)
      : zeroGrosze
  const progress = getBudgetLimitPeriodProgress({ period, asOfDate })
  const positiveRemaining = compareGrosze(remainingAmountGrosze, zeroGrosze) > 0
    ? remainingAmountGrosze
    : zeroGrosze
  const dailyAllowedAverageGrosze = divideGrosze(
    positiveRemaining,
    Math.max(progress.daysLeft, 1)
  )
  const currentDailyAverageGrosze =
    progress.daysElapsed > 0 ? divideGrosze(spentAmountGrosze, progress.daysElapsed) : null
  const projectedSpendGrosze =
    currentDailyAverageGrosze === null
      ? null
      : grosze(currentDailyAverageGrosze * progress.totalDays)
  const projectedDifferenceGrosze =
    projectedSpendGrosze === null
      ? null
      : subtractGrosze(projectedSpendGrosze, limitAmountGrosze)

  return {
    planId,
    periodId: period.id,
    limitAmountGrosze,
    spentAmountGrosze,
    remainingAmountGrosze,
    exceededAmountGrosze,
    usagePercent: getBudgetLimitUsagePercent(spentAmountGrosze, limitAmountGrosze),
    dailyAllowedAverageGrosze,
    currentDailyAverageGrosze,
    projectedSpendGrosze,
    projectedDifferenceGrosze,
    usageStatus: getBudgetLimitUsageStatus({
      spentAmountGrosze,
      limitAmountGrosze,
      alertRules,
    }),
    ...progress,
    includedTransactionCount,
    unknownTransactionCount,
  }
}
