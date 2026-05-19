import type { Category, Transaction } from '../budgetPageTypes'
import { getDaysInMonth, getExistingDaysInMonth, isMonthExcludedFromStats } from '../dateUtils'
import { isDaylessTransaction, isTransactionInExistingStatsDate, isTransactionInMonth } from '../dashboardStatsHelpers'
import type { DashboardBudgetRiskLevel, DashboardForecastStats, DashboardSpendingPaceStatus, DashboardStatsOptions } from './dashboardStatsTypes'

export function getDashboardForecastStats(
  transactions: Transaction[],
  categoriesById: Record<string, Category>,
  selectedMonth: string,
  getSignedAmountForTransaction: (t: Transaction) => number,
  options: DashboardStatsOptions = {}
): DashboardForecastStats {
  const daysInMonth = getDaysInMonth(selectedMonth)
  const elapsedDays = getExistingDaysInMonth(selectedMonth)
  let incomeToDate = 0
  let expenseToDate = 0
  let daylessCount = 0

  if (isMonthExcludedFromStats(selectedMonth, options.excludedMonthsSet)) {
    return {
      incomeToDate: 0,
      expenseToDate: 0,
      currentBalance: 0,
      forecastExpense: 0,
      forecastBalance: 0,
      elapsedDays,
      daysInMonth,
      monthProgressPercent: 0,
      spendingProgressPercent: 0,
      spendingPaceStatus: 'calm',
      spendingPaceDifference: 0,
      budgetRiskLevel: 'none',
      budgetRiskLabel: 'Brak danych',
      budgetRiskDifference: 0,
      budgetRiskDescription: 'Ten miesiąc jest wyłączony ze statystyk.',
      savingsRate: 0,
      savingsRateDescription: 'Miesiąc wyłączony ze statystyk',
      daylessCount: 0,
    }
  }

  for (const transaction of transactions) {
    if (!isTransactionInMonth(transaction, selectedMonth)) continue
    if (!isTransactionInExistingStatsDate(transaction)) continue
    if (!categoriesById[transaction.category_id]) continue

    const amount = getSignedAmountForTransaction(transaction)

    if (isDaylessTransaction(transaction)) {
      daylessCount += 1
    }

    if (amount > 0) {
      incomeToDate += amount
    } else if (amount < 0) {
      expenseToDate += Math.abs(amount)
    }
  }

  const safeElapsedDays = Math.min(elapsedDays, daysInMonth)
  const forecastExpense = safeElapsedDays > 0 ? (expenseToDate / safeElapsedDays) * daysInMonth : 0
  const currentBalance = incomeToDate - expenseToDate
  const forecastBalance = incomeToDate - forecastExpense
  const monthProgressPercent = daysInMonth > 0 ? (safeElapsedDays / daysInMonth) * 100 : 0
  const spendingProgressPercent =
    incomeToDate > 0
      ? (expenseToDate / incomeToDate) * 100
      : forecastExpense > 0
        ? (expenseToDate / forecastExpense) * 100
        : 0
  const spendingPaceDifference = spendingProgressPercent - monthProgressPercent
  const spendingPaceStatus: DashboardSpendingPaceStatus =
    spendingPaceDifference > 20 ? 'fast' : spendingPaceDifference > 6 ? 'watch' : 'calm'
  const budgetRiskLevel: DashboardBudgetRiskLevel =
    incomeToDate <= 0
      ? 'none'
      : forecastExpense > incomeToDate
        ? 'high'
        : forecastExpense > incomeToDate * 0.9
          ? 'medium'
          : 'low'
  const budgetRiskLabel =
    budgetRiskLevel === 'none'
      ? 'Brak danych o przychodach'
      : budgetRiskLevel === 'high'
        ? 'Wysokie'
        : budgetRiskLevel === 'medium'
          ? 'Średnie'
          : 'Niskie'
  const budgetRiskDifference = incomeToDate - forecastExpense
  const budgetRiskDescription =
    budgetRiskLevel === 'none'
      ? 'Dodaj przychody, żeby ocenić ryzyko przekroczenia.'
      : budgetRiskLevel === 'high'
        ? 'Prognozowane wydatki przekraczają przychody.'
        : budgetRiskLevel === 'medium'
          ? 'Prognozowane wydatki są blisko poziomu przychodów.'
          : 'Prognoza mieści się wyraźnie poniżej przychodów.'
  const savingsRate = incomeToDate > 0 ? (currentBalance / incomeToDate) * 100 : 0

  return {
    incomeToDate,
    expenseToDate,
    currentBalance,
    forecastExpense,
    forecastBalance,
    elapsedDays: safeElapsedDays,
    daysInMonth,
    monthProgressPercent,
    spendingProgressPercent,
    spendingPaceStatus,
    spendingPaceDifference,
    budgetRiskLevel,
    budgetRiskLabel,
    budgetRiskDifference,
    budgetRiskDescription,
    savingsRate,
    savingsRateDescription: incomeToDate > 0 ? 'Bilans względem przychodów' : 'Brak przychodów',
    daylessCount,
  }
}
