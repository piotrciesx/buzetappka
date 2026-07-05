import { compareGrosze } from '../recurring-payments/money'
import type {
  BudgetLimitAlertRule,
  BudgetLimitAlertState,
  BudgetLimitAlertStatus,
  BudgetLimitUsageSummary,
} from './types'

const hasReachedThreshold = (summary: BudgetLimitUsageSummary, threshold: number) => {
  return summary.spentAmountGrosze * 100 >= summary.limitAmountGrosze * threshold
}

export const buildBudgetLimitAlertStates = ({
  summary,
  rules,
  triggeredAt,
}: {
  summary: BudgetLimitUsageSummary
  rules: readonly BudgetLimitAlertRule[]
  triggeredAt: string
}): BudgetLimitAlertState[] => {
  return rules.flatMap((rule) => {
    if (!rule.enabled) return []

    const triggered =
      rule.kind === 'threshold_reached'
        ? rule.thresholdPercent !== undefined && hasReachedThreshold(summary, rule.thresholdPercent)
        : rule.kind === 'limit_exceeded'
          ? compareGrosze(summary.spentAmountGrosze, summary.limitAmountGrosze) >= 0
          : summary.projectedSpendGrosze !== null &&
            compareGrosze(summary.projectedSpendGrosze, summary.limitAmountGrosze) > 0

    if (!triggered) return []

    return [
      {
        id: `${summary.periodId}:${rule.id}`,
        planId: summary.planId,
        periodId: summary.periodId,
        ruleId: rule.id,
        kind: rule.kind,
        thresholdPercent: rule.thresholdPercent,
        status: 'unread' as const,
        triggeredAt,
        spentGroszeAtTrigger: summary.spentAmountGrosze,
        limitGroszeAtTrigger: summary.limitAmountGrosze,
        readAt: null,
        mutedForPeriod: false,
      },
    ]
  })
}

export const markBudgetLimitAlertRead = (
  alert: BudgetLimitAlertState,
  readAt: string
): BudgetLimitAlertState => ({
  ...alert,
  status: alert.status === 'muted' ? 'muted' : 'read',
  readAt,
})

export const muteBudgetLimitAlertForPeriod = (
  alert: BudgetLimitAlertState
): BudgetLimitAlertState => ({
  ...alert,
  status: 'muted',
  mutedForPeriod: true,
})

export const getCombinedBudgetLimitAlertStatus = (
  alerts: readonly BudgetLimitAlertState[]
): BudgetLimitAlertStatus => {
  if (alerts.length === 0) return 'none'
  if (alerts.some((alert) => alert.status === 'unread')) return 'unread'
  if (alerts.every((alert) => alert.status === 'muted')) return 'muted'
  return 'read'
}

