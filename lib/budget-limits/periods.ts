import type {
  BudgetLimitPeriodDefinition,
  BudgetLimitPeriodInstance,
  BudgetLimitTransactionDateKind,
} from './types'

const DAY_MS = 24 * 60 * 60 * 1000
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MONTH_PATTERN = /^\d{4}-\d{2}$/

const parseIsoDate = (dateText: string) => {
  if (!DATE_PATTERN.test(dateText)) {
    throw new Error(`Invalid ISO date: ${dateText}`)
  }

  const [year, month, day] = dateText.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid ISO date: ${dateText}`)
  }
  return date
}

const formatIsoDate = (date: Date) => date.toISOString().slice(0, 10)

const getMonthEnd = (month: string) => {
  if (!MONTH_PATTERN.test(month)) throw new Error(`Invalid month: ${month}`)
  const [year, monthNumber] = month.split('-').map(Number)
  if (monthNumber < 1 || monthNumber > 12) throw new Error(`Invalid month: ${month}`)
  return formatIsoDate(new Date(Date.UTC(year, monthNumber, 0)))
}

export const createMonthlyBudgetLimitPeriod = (month: string) => {
  if (!MONTH_PATTERN.test(month)) throw new Error(`Invalid month: ${month}`)
  const periodStart = `${month}-01`
  parseIsoDate(periodStart)
  return { periodStart, periodEnd: getMonthEnd(month) }
}

export const createDateRangeBudgetLimitPeriod = (startDate: string, endDate: string) => {
  parseIsoDate(startDate)
  parseIsoDate(endDate)
  if (endDate < startDate) throw new Error('Period end cannot be before period start.')
  return { periodStart: startDate, periodEnd: endDate }
}

export const createBudgetLimitPeriodInstance = ({
  id,
  planId,
  versionId,
  profileId,
  definition,
  customStartDate,
  customEndDate,
}: {
  id: string
  planId: string
  versionId: string
  profileId: string
  definition: BudgetLimitPeriodDefinition
  customStartDate?: string
  customEndDate?: string
}): BudgetLimitPeriodInstance => {
  if (definition.type === 'monthly') {
    const range = createMonthlyBudgetLimitPeriod(definition.month)
    return {
      id,
      planId,
      versionId,
      profileId,
      periodType: 'monthly',
      ...range,
      status: 'open',
    }
  }

  if (definition.type === 'date_range') {
    return {
      id,
      planId,
      versionId,
      profileId,
      periodType: 'date_range',
      ...createDateRangeBudgetLimitPeriod(definition.startDate, definition.endDate),
      status: 'open',
    }
  }

  if (!customStartDate || !customEndDate) {
    throw new Error('Recurring custom period requires resolved start and end dates.')
  }

  return {
    id,
    planId,
    versionId,
    profileId,
    periodType: 'recurring_custom',
    ...createDateRangeBudgetLimitPeriod(customStartDate, customEndDate),
    status: 'open',
  }
}

export const isDateInBudgetLimitPeriod = (
  dateText: string,
  period: Pick<BudgetLimitPeriodInstance, 'periodStart' | 'periodEnd'>
) => {
  parseIsoDate(dateText)
  return dateText >= period.periodStart && dateText <= period.periodEnd
}

export type BudgetLimitPeriodMembership = 'inside' | 'outside' | 'unknown_day'

export const getTransactionBudgetLimitPeriodMembership = ({
  date,
  dateKind,
  period,
}: {
  date: string
  dateKind: BudgetLimitTransactionDateKind
  period: Pick<BudgetLimitPeriodInstance, 'periodStart' | 'periodEnd'>
}): BudgetLimitPeriodMembership => {
  if (dateKind === 'exact_day') {
    return isDateInBudgetLimitPeriod(date, period) ? 'inside' : 'outside'
  }

  const month = date.slice(0, 7)
  if (!MONTH_PATTERN.test(month)) return 'unknown_day'
  const monthRange = createMonthlyBudgetLimitPeriod(month)

  if (monthRange.periodEnd < period.periodStart || monthRange.periodStart > period.periodEnd) {
    return 'outside'
  }

  if (
    period.periodStart <= monthRange.periodStart &&
    period.periodEnd >= monthRange.periodEnd
  ) {
    return 'inside'
  }

  return 'unknown_day'
}

export const getBudgetLimitPeriodDayCount = (
  period: Pick<BudgetLimitPeriodInstance, 'periodStart' | 'periodEnd'>
) => {
  const start = parseIsoDate(period.periodStart)
  const end = parseIsoDate(period.periodEnd)
  if (end < start) throw new Error('Period end cannot be before period start.')
  return Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1
}

export const getBudgetLimitPeriodProgress = ({
  period,
  asOfDate,
}: {
  period: Pick<BudgetLimitPeriodInstance, 'periodStart' | 'periodEnd'>
  asOfDate: string
}) => {
  const totalDays = getBudgetLimitPeriodDayCount(period)
  const asOf = parseIsoDate(asOfDate)
  const start = parseIsoDate(period.periodStart)
  const end = parseIsoDate(period.periodEnd)

  if (asOf < start) return { totalDays, daysElapsed: 0, daysLeft: totalDays }
  if (asOf > end) return { totalDays, daysElapsed: totalDays, daysLeft: 0 }

  return {
    totalDays,
    daysElapsed: Math.floor((asOf.getTime() - start.getTime()) / DAY_MS) + 1,
    daysLeft: Math.floor((end.getTime() - asOf.getTime()) / DAY_MS) + 1,
  }
}

